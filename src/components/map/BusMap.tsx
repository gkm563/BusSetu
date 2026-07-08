import { MapContainer, TileLayer, Polyline, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { TripMarker } from "./TripMarker";
import { Layers, Satellite, Activity, MapPin, Route } from "lucide-react";
import { userDivIcon } from "./busIcon";
import { StopMarker } from "./StopMarker";
import { SelectedTripFollower } from "./SelectedTripFollower";
import { MapSkeleton } from "./MapSkeleton";
import { routeService } from "@/services";
import { splitRouteAtProgress } from "@/utils/routeSlice";
import { useSmartDiscovery } from "@/hooks/useSmartDiscovery";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRouteIntelligence } from "@/hooks/useRouteIntelligence";
import type { Trip } from "@/types/trip";
import L from "leaflet";

const DEFAULT_CENTER: [number, number] = [25.35, 82.1];
const DEFAULT_ZOOM = 9;

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export type BaseLayer = "standard" | "satellite";

// Custom event listener for map zoom changes
function MapEventsListener({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    },
  });
  return null;
}

// Cluster Marker Factory
function createClusterIcon(count: number) {
  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 9999px;
        background: var(--color-brand);
        color: white;
        font-weight: 800;
        font-size: 12px;
        border: 2.5px solid white;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      ">
        ${count}
      </div>
    `,
    className: "bus-cluster-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Custom Renderer for Zoom-based clustering
function ClusterRenderer({
  zoom,
  tripIdList,
  tripsById,
  nearbyTripIds,
  activeRouteIdSet,
  directTripIds,
  routeQueryActive,
}: {
  zoom: number;
  tripIdList: string[];
  tripsById: Record<string, Trip>;
  nearbyTripIds: Set<string>;
  activeRouteIdSet: Set<string>;
  directTripIds: Set<string>;
  routeQueryActive: boolean;
}) {
  const map = useMap();

  const clustered = useMemo(() => {
    // Collect active trips
    const activeTrips = tripIdList
      .map((id) => tripsById[id])
      .filter((t): t is Trip => !!t)
      .filter((t) => {
        // 1. If route search is active, show only buses that are in the direct recommendations list
        if (activeRouteIdSet.size > 0) {
          if (routeQueryActive) {
            return directTripIds.has(t.tripId);
          }
          return activeRouteIdSet.has(t.routeId);
        }
        // 2. If user location is active, show nearby buses only
        if (nearbyTripIds.size > 0) {
          return nearbyTripIds.has(t.tripId);
        }
        // 3. Otherwise, map is kept clean (no default radar spam)
        return false;
      });

    if (zoom >= 11) {
      // Zoomed In: individual markers
      return { isClustered: false, items: activeTrips.map((t) => t.tripId), clusters: [] as any[] };
    }

    // Zoomed Out: grid-based clustering
    const gridSz = zoom === 10 ? 0.08 : zoom === 9 ? 0.16 : zoom === 8 ? 0.32 : 0.45;
    const clusters: {
      id: string;
      latSum: number;
      lngSum: number;
      tripIds: string[];
    }[] = [];

    for (const t of activeTrips) {
      const lat = t.gps.latitude;
      const lng = t.gps.longitude;

      let found = false;
      for (const c of clusters) {
        const cLat = c.latSum / c.tripIds.length;
        const cLng = c.lngSum / c.tripIds.length;
        if (Math.abs(cLat - lat) < gridSz && Math.abs(cLng - lng) < gridSz) {
          c.tripIds.push(t.tripId);
          c.latSum += lat;
          c.lngSum += lng;
          found = true;
          break;
        }
      }

      if (!found) {
        clusters.push({
          id: `cluster-${t.tripId}`,
          latSum: lat,
          lngSum: lng,
          tripIds: [t.tripId],
        });
      }
    }

    return { isClustered: true, clusters, items: [] as string[] };
  }, [tripIdList, tripsById, zoom, activeRouteIdSet]);

  if (!clustered.isClustered) {
    return (
      <>
        {clustered.items.map((id) => (
          <TripMarker
            key={id}
            tripId={id}
            nearby={nearbyTripIds.has(id)}
            activeRouteIds={activeRouteIdSet}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {clustered.clusters.map((c) => {
        const cLat = c.latSum / c.tripIds.length;
        const cLng = c.lngSum / c.tripIds.length;

        if (c.tripIds.length === 1) {
          return (
            <TripMarker
              key={c.tripIds[0]}
              tripId={c.tripIds[0]}
              nearby={nearbyTripIds.has(c.tripIds[0])}
              activeRouteIds={activeRouteIdSet}
            />
          );
        }

        return (
          <Marker
            key={c.id}
            position={[cLat, cLng]}
            icon={createClusterIcon(c.tripIds.length)}
            eventHandlers={{
              click: () => {
                map.flyTo([cLat, cLng], Math.min(18, map.getZoom() + 2), { duration: 0.8 });
              },
            }}
          />
        );
      })}
    </>
  );
}

export function BusMap() {
  const tripIdList = useLiveStore((s) => s.tripIdList);
  const tripsById = useLiveStore((s) => s.tripsById);
  const stopsById = useLiveStore((s) => s.stopsById);
  const routesById = useLiveStore((s) => s.routesById);
  const catalogsLoaded = useLiveStore((s) => s.catalogsLoaded);
  const tripsLoaded = useLiveStore((s) => s.tripsLoaded);
  const hydrateError = useLiveStore((s) => s.hydrateError);
  const darkMode = useUiStore((s) => s.darkMode);
  const focusedRouteId = useUiStore((s) => s.focusedRouteId);
  const routeQuery = useUiStore((s) => s.routeQuery);
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const discoveryRadiusKm = useUiStore((s) => s.discoveryRadiusKm);
  const { location: userLocation } = useGeolocation();
  const discovery = useSmartDiscovery(userLocation, discoveryRadiusKm);
  const nearbyTripIds = useMemo(() => new Set(discovery.map((d) => d.trip.tripId)), [discovery]);
  const routeIntelligence = useRouteIntelligence(userLocation);
  
  const directTripIds = useMemo(() => {
    if (!routeIntelligence) return new Set<string>();
    return new Set(routeIntelligence.direct.map((d) => d.trip.tripId));
  }, [routeIntelligence]);

  const [showStops, setShowStops] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("standard");
  const [highlightedRouteIds, setHighlightedRouteIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Resolve route search into highlighted route ids
  useEffect(() => {
    if (!routeQuery.active || (!routeQuery.from && !routeQuery.to)) {
      setHighlightedRouteIds(new Set());
      return;
    }
    let alive = true;
    routeService
      .searchRoutes({
        from: routeQuery.from,
        to: routeQuery.to,
        via: routeQuery.via || undefined,
      })
      .then((rs) => {
        if (alive) setHighlightedRouteIds(new Set(rs.map((r) => r.id)));
      });
    return () => {
      alive = false;
    };
  }, [routeQuery]);

  const activeRouteIds = useMemo(() => {
    if (focusedRouteId) return new Set([focusedRouteId]);
    return highlightedRouteIds;
  }, [focusedRouteId, highlightedRouteIds]);

  const activeRoutes = Object.values(routesById).filter((r) => activeRouteIds.has(r.id));
  const activeStopIds = useMemo(() => {
    const ids = new Set<string>();
    for (const r of activeRoutes) {
      for (const s of r.stops) {
        ids.add(s.id);
      }
    }
    return ids;
  }, [activeRoutes]);

  // Selected trip's traveled / upcoming route slices for the highlighted trail.
  const selectedTrip = useLiveStore((s) =>
    selectedTripId ? s.tripsById[selectedTripId] : undefined,
  );
  const selectedRoute = selectedTrip ? routesById[selectedTrip.routeId] : undefined;
  const selectedSlices = useMemo(() => {
    if (!selectedTrip || !selectedRoute) return null;
    return splitRouteAtProgress(selectedRoute, selectedTrip.direction, selectedTrip.routeProgress);
  }, [selectedTrip, selectedRoute]);
  const activeRouteIdSet = activeRouteIds;

  const visibleStopIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedRoute) {
      for (const s of selectedRoute.stops) ids.add(s.id);
    }
    if (focusedRouteId && routesById[focusedRouteId]) {
      for (const s of routesById[focusedRouteId].stops) ids.add(s.id);
    }
    for (const r of activeRoutes) {
      for (const s of r.stops) ids.add(s.id);
    }
    return ids;
  }, [selectedRoute, focusedRouteId, routesById, activeRoutes]);

  const isSatellite = baseLayer === "satellite";

  return (
    <div data-map-shell className="relative h-full w-full overflow-hidden rounded-none">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom
      >
        <MapEventsListener onZoomChange={setZoom} />

        <TileLayer
          key={`${baseLayer}-${darkMode ? "d" : "l"}`}
          attribution={
            isSatellite ? "Tiles &copy; Esri" : "&copy; OpenStreetMap contributors &copy; CARTO"
          }
          url={isSatellite ? SATELLITE_TILES : darkMode ? DARK_TILES : LIGHT_TILES}
          subdomains={isSatellite ? [] : ["a", "b", "c", "d"]}
        />

        {/* All routes shown faintly — act as the "trail" behind moving buses. */}
        {showRoutes &&
          activeRoutes.length === 0 &&
          Object.values(routesById).map((r) => (
            <Polyline
              key={r.id}
              positions={r.polyline}
              pathOptions={{
                color: isSatellite ? "#e2e8f0" : darkMode ? "#94a3b8" : "#64748b",
                weight: 2,
                opacity: isSatellite ? 0.55 : 0.25,
                dashArray: "4 8",
              }}
            />
          ))}
        {showRoutes &&
          activeRoutes.map((r) => (
            <Polyline
              key={r.id}
              positions={r.polyline}
              pathOptions={{
                color: "#2563EB",
                weight: 5,
                opacity: 0.85,
              }}
            />
          ))}

        {/* Selected bus trail: past (grey) + upcoming (highlighted). */}
        {selectedSlices && (
          <>
            <Polyline
              positions={selectedSlices.past}
              pathOptions={{
                color: isSatellite ? "#cbd5e1" : "#94a3b8",
                weight: 4,
                opacity: 0.7,
                lineCap: "round",
              }}
            />
            <Polyline
              positions={selectedSlices.upcoming}
              pathOptions={{
                color: "#2563EB",
                weight: 6,
                opacity: 0.95,
                lineCap: "round",
                className: "bus-route-upcoming",
              }}
            />
          </>
        )}

        {/* Traffic overlay (visual only) */}
        {showTraffic && (
          <>
            {Object.values(routesById).map((r) => (
              <Polyline
                key={`traffic-${r.id}`}
                positions={r.polyline}
                pathOptions={{
                  color: "#F97316",
                  weight: 8,
                  opacity: 0.25,
                }}
              />
            ))}
          </>
        )}

        {/* Stops */}
        {showStops &&
          Object.values(stopsById)
            .filter((s) => {
              if (visibleStopIds.size > 0) {
                return visibleStopIds.has(s.id);
              }
              return true;
            })
            .map((s) => {
              const isActive = activeStopIds.has(s.id);
              return <StopMarker key={s.id} stop={s} isActive={isActive} />;
            })}

        {/* Trips (Clustered based on zoom) */}
        <ClusterRenderer
          zoom={zoom}
          tripIdList={tripIdList}
          tripsById={tripsById}
          nearbyTripIds={nearbyTripIds}
          activeRouteIdSet={activeRouteIdSet}
          directTripIds={directTripIds}
          routeQueryActive={routeQuery.active}
        />

        {/* User Pulsing Dot (Represented directly from the hook) */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userDivIcon()} />
        )}

        <SelectedTripFollower />

      </MapContainer>

      {/* Floating Bottom-Center Map Layer Controller */}
      <div className="absolute bottom-6 left-1/2 z-[500] -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2 py-1.5 shadow-xl backdrop-blur-md">
          {/* Label */}
          <span className="mx-2 hidden items-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground sm:inline-flex">
            <Layers className="h-3.5 w-3.5" />
            Layers
          </span>
          <span className="mx-0.5 hidden h-4 w-px bg-border/60 sm:block" />

          {/* Satellite Toggle */}
          <button
            onClick={() => setBaseLayer(baseLayer === "standard" ? "satellite" : "standard")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer ${
              baseLayer === "satellite"
                ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-md shadow-sky-500/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            title="Toggle Satellite Imagery"
          >
            <Satellite className="h-3.5 w-3.5" />
            <span>Satellite</span>
          </button>

          {/* Traffic Toggle */}
          <button
            onClick={() => setShowTraffic((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer ${
              showTraffic
                ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            title="Toggle Live Traffic Overlay"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Traffic</span>
          </button>

          {/* Bus Stands Toggle */}
          <button
            onClick={() => setShowStops((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer ${
              showStops
                ? "bg-gradient-to-r from-brand to-indigo-600 text-white shadow-md shadow-brand/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            title="Toggle Bus Stands"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Bus Stands</span>
          </button>

          {/* Route Trails Toggle */}
          <button
            onClick={() => setShowRoutes((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer ${
              showRoutes
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            title="Toggle Route Trails"
          >
            <Route className="h-3.5 w-3.5" />
            <span>Routes</span>
          </button>
        </div>
      </div>

      <MapSkeleton
        loading={!catalogsLoaded || !tripsLoaded}
        error={hydrateError}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}

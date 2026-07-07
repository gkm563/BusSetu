import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { TripMarker } from "./TripMarker";
import { MapControls } from "./MapControls";
import { userDivIcon } from "./busIcon";
import { StopMarker } from "./StopMarker";
import { SelectedTripFollower } from "./SelectedTripFollower";
import { MapSkeleton } from "./MapSkeleton";
import { routeService } from "@/services";
import type { UserLocation } from "@/hooks/useGeolocation";
import { splitRouteAtProgress } from "@/utils/routeSlice";
import { useSmartDiscovery } from "@/hooks/useSmartDiscovery";
import { useGeolocation } from "@/hooks/useGeolocation";

const DEFAULT_CENTER: [number, number] = [25.35, 82.1];
const DEFAULT_ZOOM = 9;

const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export type BaseLayer = "standard" | "satellite";

export function BusMap() {
  // Subscribe to the STABLE id list — reference only changes when trips are
  // added/removed, not on every position tick. This is the single biggest
  // win for 100+ buses: BusMap no longer re-renders 2x/second.
  const tripIdList = useLiveStore((s) => s.tripIdList);
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

  const [showStops, setShowStops] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("standard");
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [highlightedRouteIds, setHighlightedRouteIds] = useState<Set<string>>(new Set());

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
        {showStops && Object.values(stopsById).map((s) => <StopMarker key={s.id} stop={s} />)}

        {/* Trips */}
        {tripIdList.map((id) => (
          <TripMarker
            key={id}
            tripId={id}
            nearby={nearbyTripIds.has(id)}
            activeRouteIds={activeRouteIdSet}
          />
        ))}

        {/* User */}
        {userLoc && <Marker position={[userLoc.lat, userLoc.lng]} icon={userDivIcon()} />}

        <SelectedTripFollower />

        <MapControls
          onToggleStops={() => setShowStops((v) => !v)}
          showStops={showStops}
          onToggleRoutes={() => setShowRoutes((v) => !v)}
          showRoutes={showRoutes}
          onToggleTraffic={() => setShowTraffic((v) => !v)}
          showTraffic={showTraffic}
          baseLayer={baseLayer}
          onChangeBaseLayer={setBaseLayer}
          onReset={() => {
            // Handled inside MapControls via useMap()
          }}
          onLocated={setUserLoc}
        />
      </MapContainer>

      <MapSkeleton
        loading={!catalogsLoaded || !tripsLoaded}
        error={hydrateError}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}

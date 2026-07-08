import { Marker } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import { Marker as LeafletMarker } from "leaflet";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { busDivIcon } from "./busIcon";
import { occupancyLevel } from "@/utils/occupancy";
import { useGeolocation } from "@/hooks/useGeolocation";
import { haversineKm, bearingDeg } from "@/utils/geo";

function getCoordinateAtProgress(polyline: [number, number][], progress: number): [number, number] | null {
  if (polyline.length === 0) return null;
  const idx = Math.min(polyline.length - 1, Math.max(0, progress * (polyline.length - 1)));
  const baseIdx = Math.floor(idx);
  const nextIdx = Math.min(polyline.length - 1, baseIdx + 1);
  const frac = idx - baseIdx;
  if (baseIdx === nextIdx) return polyline[baseIdx];
  const p1 = polyline[baseIdx];
  const p2 = polyline[nextIdx];
  return [
    p1[0] + (p2[0] - p1[0]) * frac,
    p1[1] + (p2[1] - p1[1]) * frac,
  ];
}

interface Props {
  tripId: string;
  nearby?: boolean;
  /** When non-empty, trips whose route is not in this set are dimmed. */
  activeRouteIds?: Set<string>;
}

export function TripMarker({ tripId, nearby, activeRouteIds }: Props) {
  const trip = useLiveStore((s) => s.tripsById[tripId]);
  const bus = useLiveStore((s) => (trip ? s.busesById[trip.busId] : undefined));
  const operator = useLiveStore((s) => (trip ? s.operatorsById[trip.operatorId] : undefined));
  const route = useLiveStore((s) => (trip ? s.routesById[trip.routeId] : undefined));
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const hoveredTripId = useUiStore((s) => s.hoveredTripId);
  const filters = useUiStore((s) => s.filters);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const hoverTrip = useUiStore((s) => s.hoverTrip);
  const replayOffset = useUiStore((s) => s.replayOffset);
  const { location: userLocation } = useGeolocation();

  const isSelected = selectedTripId === tripId;
  const isHovered = hoveredTripId === tripId;

  // Local filter evaluation — keeps BusMap free of tripsById/busesById reads.
  const passesFilters = useMemo(() => {
    if (!trip || !bus || !operator) return false;
    if (filters.operatorKinds.size > 0 && !filters.operatorKinds.has(operator.kind)) return false;
    if (filters.amenities.size > 0) {
      for (const a of filters.amenities) if (!bus.amenities.includes(a)) return false;
    }
    if (filters.seatsAvailable && trip.passenger.vacantSeats <= 0) return false;
    if (filters.lowCrowd) {
      const level = occupancyLevel(trip, bus);
      if (level === "high" || level === "packed") return false;
    }
    return true;
  }, [trip, bus, operator, filters]);

  const inActiveRoute =
    !activeRouteIds || activeRouteIds.size === 0 || activeRouteIds.has(trip?.routeId ?? "");
  const isOtherSelected = selectedTripId != null && selectedTripId !== tripId;
  const dimmed = !passesFilters || !inActiveRoute || isOtherSelected;

  const markerRef = useRef<LeafletMarker | null>(null);

  // Icon does NOT depend on heading — heading is applied imperatively below.
  // This avoids recreating the Leaflet DivIcon (and its DOM) every tick.
  const icon = useMemo(() => {
    if (!trip || !bus || !operator) return null;
    const level = occupancyLevel(trip, bus);
    const kind: "occupancy" | "ac" | "government" =
      operator.kind === "government"
        ? "government"
        : bus.amenities.includes("ac")
          ? "ac"
          : "occupancy";
    return busDivIcon({
      level,
      kind,
      heading: trip.gps.heading, // initial only; updates via ref
      busNumber: bus.busNumber,
      selected: isSelected,
      hovered: isHovered,
      pulse: nearby,
      dimmed,
    });
    // Intentionally omit trip.gps.heading/lat/lng — those are applied imperatively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bus?.id,
    operator?.id,
    trip && bus ? occupancyLevel(trip, bus) : null,
    isSelected,
    isHovered,
    nearby,
    dimmed,
  ]);

  // Imperative rotation — cheaper than swapping the icon DOM every tick.
  useEffect(() => {
    if (!trip) return;
    const el = markerRef.current?.getElement();
    if (!el) return;
    const rotor = el.querySelector<HTMLElement>("[data-bus-rotor]");
    if (rotor) rotor.style.transform = `rotate(${trip.gps.heading}deg)`;
  }, [trip?.gps.heading]);

  // Imperative relation status updates (TOWARDS YOU / PASSED) and glowing ring colors
  useEffect(() => {
    if (!trip) return;
    const el = markerRef.current?.getElement();
    if (!el) return;
    
    const relEl = el.querySelector<HTMLElement>("[data-bus-relation]");
    const ringEl = el.querySelector<HTMLElement>("[data-bus-ring]");
    
    if (!userLocation) {
      if (relEl) relEl.style.display = "none";
      return;
    }
    
    const distanceKm = haversineKm(userLocation.lat, userLocation.lng, trip.gps.latitude, trip.gps.longitude);
    const bearingFromUser = bearingDeg(userLocation.lat, userLocation.lng, trip.gps.latitude, trip.gps.longitude);
    const angleDiff = Math.abs(((trip.gps.heading - bearingFromUser + 540) % 360) - 180);
    
    let relation: "coming" | "away" | "crossed" | "boarding" | "completed" = "away";
    if (trip.status === "completed") relation = "completed";
    else if (trip.status === "boarding") relation = "boarding";
    else if (angleDiff > 120) relation = "coming";
    else if (angleDiff < 60) {
      relation = distanceKm < 0.4 ? "crossed" : "away";
    }
    
    let label = "";
    let bg = "";
    let ringColor = "";
    let showRing = isSelected || nearby;
    
    switch (relation) {
      case "coming":
        bg = "rgba(16, 185, 129, 0.95)"; // emerald green
        label = `TOWARDS YOU (${distanceKm.toFixed(1)} km)`;
        ringColor = "#10B981";
        showRing = true; // Always show green glowing ring when coming towards you!
        break;
      case "away":
        bg = "rgba(245, 158, 11, 0.95)"; // amber orange
        label = `AWAY (${distanceKm.toFixed(1)} km)`;
        ringColor = "#F59E0B";
        break;
      case "crossed":
        bg = "rgba(100, 116, 139, 0.95)"; // slate
        label = "PASSED";
        ringColor = "#64748B";
        break;
      case "boarding":
        bg = "rgba(59, 130, 246, 0.95)"; // blue
        label = "BOARDING";
        ringColor = "#3B82F6";
        showRing = true;
        break;
      case "completed":
        bg = "rgba(148, 163, 184, 0.95)"; // light slate
        label = "COMPLETED";
        ringColor = "#94A3B8";
        break;
    }
    
    if (relEl) {
      relEl.textContent = label;
      relEl.style.backgroundColor = bg;
      relEl.style.display = "inline-block";
    }
    
    if (ringEl) {
      if (showRing) {
        ringEl.style.backgroundColor = ringColor || "var(--color-brand)";
        ringEl.style.display = "block";
      } else {
        ringEl.style.display = "none";
      }
    }
  }, [trip?.gps.latitude, trip?.gps.longitude, trip?.gps.heading, trip?.status, userLocation, isSelected, nearby]);

  const position = useMemo((): [number, number] => {
    if (!trip) return [0, 0];
    if (replayOffset > 0 && route && route.polyline.length > 0) {
      const progress = Math.max(0, trip.routeProgress - (replayOffset === 5 ? 0.08 : 0.16));
      const replayPos = getCoordinateAtProgress(route.polyline, progress);
      if (replayPos) return replayPos;
    }
    return [trip.gps.latitude, trip.gps.longitude];
  }, [trip, replayOffset, route]);

  if (!trip || !icon) return null;

  return (
    <Marker
      ref={(m) => {
        markerRef.current = m as unknown as LeafletMarker | null;
      }}
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => selectTrip(tripId),
        mouseover: () => hoverTrip(tripId),
        mouseout: () => hoverTrip(null),
      }}
    />
  );
}

import { Marker } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import { Marker as LeafletMarker } from "leaflet";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { busDivIcon } from "./busIcon";
import { occupancyLevel } from "@/utils/occupancy";

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

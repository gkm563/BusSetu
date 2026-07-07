import { Marker } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import type { Marker as LeafletMarker } from "leaflet";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { busDivIcon } from "./busIcon";
import { occupancyLevel } from "@/utils/occupancy";

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
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const hoveredTripId = useUiStore((s) => s.hoveredTripId);
  const filters = useUiStore((s) => s.filters);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const hoverTrip = useUiStore((s) => s.hoverTrip);

  const isSelected = selectedTripId === tripId;
  const isHovered = hoveredTripId === tripId;

  // Local filter evaluation — keeps BusMap free of tripsById/busesById reads.
  const passesFilters = useMemo(() => {
    if (!trip || !bus || !operator) return false;
    if (filters.operatorKinds.size > 0 && !filters.operatorKinds.has(operator.kind)) return false;
    if (filters.amenities.size > 0) {
      for (const a of filters.amenities) if (!bus.amenities.includes(a)) return false;
    }
    if (filters.seatsAvailable && trip.vacantSeats <= 0) return false;
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
      heading: trip.heading, // initial only; updates via ref
      selected: isSelected,
      hovered: isHovered,
      pulse: nearby,
      dimmed,
    });
    // Intentionally omit trip.heading/lat/lng — those are applied imperatively.
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
    if (rotor) rotor.style.transform = `rotate(${trip.heading - 90}deg)`;
  }, [trip?.heading]);

  if (!trip || !icon) return null;

  return (
    <Marker
      ref={(m) => {
        markerRef.current = m as unknown as LeafletMarker | null;
      }}
      position={[trip.latitude, trip.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => selectTrip(tripId),
        mouseover: () => hoverTrip(tripId),
        mouseout: () => hoverTrip(null),
      }}
    />
  );
}

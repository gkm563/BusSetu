import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useUiStore } from "@/store/useUiStore";
import { useLiveStore } from "@/store/useLiveStore";

/**
 * Smoothly keeps the map centered on the selected trip. The camera pans
 * (not jumps) whenever the selected trip's coordinates change, and the bus
 * is positioned slightly below the map center so the upcoming route stays
 * visible above it.
 *
 * Rendered inside <MapContainer /> so it can access the leaflet map.
 */
export function SelectedTripFollower() {
  const map = useMap();
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const trip = useLiveStore((s) => (selectedTripId ? s.tripsById[selectedTripId] : undefined));
  const lastSelectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedTripId || !trip) {
      lastSelectionRef.current = null;
      return;
    }
    const isNewSelection = lastSelectionRef.current !== selectedTripId;
    lastSelectionRef.current = selectedTripId;

    const size = map.getSize();
    // Offset the target so the bus renders ~25% below the map center,
    // leaving the upcoming route visible above the marker.
    const point = map.latLngToContainerPoint([trip.gps.latitude, trip.gps.longitude]);
    point.y -= size.y * 0.22;
    const target = map.containerPointToLatLng(point);

    if (isNewSelection) {
      map.flyTo(target, Math.max(map.getZoom(), 11), {
        animate: true,
        duration: 0.9,
      });
    } else {
      map.panTo(target, { animate: true, duration: 0.6, easeLinearity: 0.4 });
    }
  }, [map, selectedTripId, trip?.gps.latitude, trip?.gps.longitude]);

  return null;
}

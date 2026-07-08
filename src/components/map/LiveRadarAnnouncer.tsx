import { useEffect, useRef, useState } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";

/**
 * Screen-reader-only live region that announces meaningful radar changes.
 *
 * Announcements are debounced and only emitted when a tracked value crosses
 * a perceptible threshold (ETA ±30s, speed ±5 km/h, seats change). This
 * keeps SR output useful without spamming every tick.
 *
 * Announces:
 *  - Trip selection (bus number + route)
 *  - ETA to next stop
 *  - Speed (km/h)
 *  - Available seats
 *  - Live radar summary when nothing is selected (# active trips)
 */
export function LiveRadarAnnouncer() {
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const trip = useLiveStore((s) => (selectedTripId ? s.tripsById[selectedTripId] : null));
  const bus = useLiveStore((s) => (trip ? s.busesById[trip.busId] : null));
  const route = useLiveStore((s) => (trip ? s.routesById[trip.routeId] : null));
  const tripsCount = useLiveStore((s) => s.tripIdList.length);
  const tripsLoaded = useLiveStore((s) => s.tripsLoaded);

  const [message, setMessage] = useState("");
  const lastRef = useRef<{
    id: string | null;
    etaSec: number | null;
    speed: number | null;
    seats: number | null;
    summaryCount: number | null;
    at: number;
  }>({ id: null, etaSec: null, speed: null, seats: null, summaryCount: null, at: 0 });

  // Announce selection changes immediately.
  useEffect(() => {
    if (!trip || !bus || !route) {
      lastRef.current = { ...lastRef.current, id: null };
      return;
    }
    if (lastRef.current.id !== trip.tripId) {
      const etaSec = etaSecondsFromIso(nextStopEtaIso(trip));
      const speed = Math.round(trip.gps.speed);
      const seats = trip.passenger.vacantSeats;
      setMessage(
        `Now tracking bus ${bus.busNumber} on ${route.name}. ` +
          `${formatEta(etaSec)} to next stop, ${speed} kilometres per hour, ` +
          `${formatSeats(seats)} available.`,
      );
      lastRef.current = {
        id: trip.tripId,
        etaSec,
        speed,
        seats,
        summaryCount: null,
        at: Date.now(),
      };
    }
  }, [trip, bus, route]);

  // Debounced change announcements while a trip is selected.
  useEffect(() => {
    if (!trip || !bus) return;
    const id = window.setInterval(() => {
      const last = lastRef.current;
      if (last.id !== trip.tripId) return;
      const now = Date.now();
      // Rate-limit: at most one change announcement every 8s.
      if (now - last.at < 8000) return;

      const etaSec = etaSecondsFromIso(nextStopEtaIso(trip));
      const speed = Math.round(trip.gps.speed);
      const seats = trip.passenger.vacantSeats;

      const parts: string[] = [];
      if (etaSec != null && last.etaSec != null && Math.abs(etaSec - last.etaSec) >= 30) {
        parts.push(`ETA ${formatEta(etaSec)} to next stop`);
      }
      if (last.speed != null && Math.abs(speed - last.speed) >= 5) {
        parts.push(`speed ${speed} kilometres per hour`);
      }
      if (last.seats != null && seats !== last.seats) {
        parts.push(`${formatSeats(seats)} available`);
      }

      if (parts.length > 0) {
        setMessage(`Bus ${bus.busNumber}: ${parts.join(", ")}.`);
        lastRef.current = {
          id: trip.tripId,
          etaSec,
          speed,
          seats,
          summaryCount: null,
          at: now,
        };
      }
    }, 2000);
    return () => window.clearInterval(id);
  }, [trip, bus]);

  // When nothing is selected, announce radar summary changes occasionally.
  useEffect(() => {
    if (trip) return;
    if (!tripsLoaded) return;
    const last = lastRef.current;
    if (last.summaryCount == null || Math.abs(tripsCount - last.summaryCount) >= 5) {
      setMessage(`Live radar: ${tripsCount} buses currently active.`);
      lastRef.current = {
        ...last,
        id: null,
        summaryCount: tripsCount,
        at: Date.now(),
      };
    }
  }, [trip, tripsCount, tripsLoaded]);

  return (
    <div aria-live="polite" aria-atomic="true" role="status" className="sr-only">
      {message}
    </div>
  );
}

function etaSecondsFromIso(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.round((t - Date.now()) / 1000));
}

function nextStopEtaIso(trip: {
  nextStopId: string | null;
  eta: Record<string, string>;
}): string | null {
  if (!trip.nextStopId) return null;
  return trip.eta[trip.nextStopId] ?? null;
}

function formatEta(sec: number | null): string {
  if (sec == null) return "ETA unknown";
  if (sec < 60) return `${sec} seconds`;
  const m = Math.round(sec / 60);
  return `${m} minute${m === 1 ? "" : "s"}`;
}

function formatSeats(n: number): string {
  if (n <= 0) return "no seats";
  return `${n} seat${n === 1 ? "" : "s"}`;
}

import type { TripService } from "@/services/contracts/TripService";
import type { Trip } from "@/types/trip";
import type { SeatUpdate, TripEvent, TripPositionUpdate, Unsubscribe } from "@/types/events";
import { seedTrips } from "@/data/trips.mock";
import { MOCK_ROUTES } from "@/data/routes.mock";
import { MOCK_BUSES } from "@/data/buses.mock";
import { interpolateAlongPolyline } from "@/utils/geo";

/**
 * MockTripAdapter simulates a WebSocket-style push channel for trip updates.
 * It replaces cleanly with a real WebSocket adapter that emits the same
 * TripEvent shape.
 */
function createMockTripAdapter(): TripService {
  const trips: Trip[] = seedTrips();
  const listeners = new Set<(e: TripEvent) => void>();
  let interval: ReturnType<typeof setInterval> | null = null;
  let seatInterval: ReturnType<typeof setInterval> | null = null;

  const TICK_MS = 500;

  function directionalPolyline(routeId: string, dir: Trip["direction"]) {
    const r = MOCK_ROUTES.find((x) => x.id === routeId)!;
    return dir === "forward" ? r.polyline : [...r.polyline].reverse();
  }

  function tick() {
    const now = Date.now();
    const updates: { tripId: string; patch: TripPositionUpdate }[] = [];
    for (const trip of trips) {
      if (trip.status === "breakdown") continue;

      // Revive completed trips so they keep moving
      if (trip.status === "completed") {
        trip.status = "running";
        trip.routeProgress = 0;
        trip.gps.speed = 45 + Math.floor(Math.random() * 15);
      }

      // Advance progress based on speed. distanceKm covered per second.
      const route = MOCK_ROUTES.find((r) => r.id === trip.routeId)!;
      const kmPerSec = trip.gps.speed / 3600;
      const delta = (kmPerSec / route.distanceKm) * (TICK_MS / 1000);
      trip.routeProgress = Math.min(1, trip.routeProgress + delta);

      if (trip.routeProgress >= 1) {
        // Loop the trip so the radar stays lively and bus keeps moving
        trip.routeProgress = 0;
        trip.status = "running";
        trip.gps.speed = 45 + Math.floor(Math.random() * 15);
      }

      // Dynamically update current and next stop based on progress
      if (route.stops && route.stops.length > 0) {
        const stopCount = route.stops.length;
        const currentStopIndex = Math.min(
          stopCount - 1,
          Math.floor(trip.routeProgress * (stopCount - 1))
        );
        trip.currentStopId = route.stops[currentStopIndex].id;
        trip.nextStopId =
          currentStopIndex < stopCount - 1
            ? route.stops[currentStopIndex + 1].id
            : route.stops[stopCount - 1].id;
            
        // Simulate dynamic ETA for the next stop
        const nextStopProg = (currentStopIndex + 1) / (stopCount - 1);
        const remProg = Math.max(0, nextStopProg - trip.routeProgress);
        const remDist = remProg * route.distanceKm;
        const etaSec = trip.gps.speed > 0 ? (remDist / trip.gps.speed) * 3600 : 0;
        trip.eta[trip.nextStopId] = new Date(now + etaSec * 1000).toISOString();
      }

      const poly = directionalPolyline(trip.routeId, trip.direction);
      const { lat, lng, heading } = interpolateAlongPolyline(poly, trip.routeProgress);
      trip.gps.latitude = lat;
      trip.gps.longitude = lng;
      trip.gps.heading = heading;
      trip.gps.timestamp = new Date(now).toISOString();
      trip.lastUpdated = new Date(now).toISOString();

      // Occasional small speed fluctuation (scaled to tick)
      if (trip.status === "running") {
        trip.gps.speed = Math.max(15, Math.min(70, trip.gps.speed + (Math.random() - 0.5) * 2));
      } else if (trip.status === "boarding") {
        trip.gps.speed = 0;
      }

      const patch: TripPositionUpdate = {
        latitude: trip.gps.latitude,
        longitude: trip.gps.longitude,
        heading: trip.gps.heading,
        speed: trip.gps.speed,
        routeProgress: trip.routeProgress,
        gpsAccuracy: trip.gps.gpsAccuracy,
        lastUpdated: trip.gps.timestamp,
        currentStopId: trip.currentStopId,
        nextStopId: trip.nextStopId,
        eta: trip.eta,
      };
      updates.push({ tripId: trip.tripId, patch });
    }
    if (updates.length > 0) emit({ type: "positions", updates });
  }

  function seatTick() {
    const updates: { tripId: string; patch: SeatUpdate }[] = [];
    for (const trip of trips) {
      if (trip.status !== "running" && trip.status !== "boarding") continue;
      const bus = MOCK_BUSES.find((b) => b.id === trip.busId)!;
      const drift = Math.round((Math.random() - 0.5) * 3);
      trip.passenger.occupiedSeats = Math.max(0, Math.min(bus.totalSeats, trip.passenger.occupiedSeats + drift));
      trip.passenger.vacantSeats = bus.totalSeats - trip.passenger.occupiedSeats;
      trip.lastUpdated = new Date().toISOString();
      const patch: SeatUpdate = {
        occupiedSeats: trip.passenger.occupiedSeats,
        standingPassengers: trip.passenger.standingPassengers,
        vacantSeats: trip.passenger.vacantSeats,
        lastUpdated: trip.lastUpdated,
      };
      updates.push({ tripId: trip.tripId, patch });
    }
    if (updates.length > 0) emit({ type: "seats-bulk", updates });
  }

  function emit(event: TripEvent) {
    for (const l of listeners) l(event);
  }

  function ensureRunning() {
    if (typeof window === "undefined") return;
    if (interval == null) interval = setInterval(tick, TICK_MS);
    if (seatInterval == null) seatInterval = setInterval(seatTick, 6000);
  }

  function maybeStop() {
    if (listeners.size === 0) {
      if (interval != null) clearInterval(interval);
      if (seatInterval != null) clearInterval(seatInterval);
      interval = null;
      seatInterval = null;
    }
  }

  return {
    async listActiveTrips() {
      return trips;
    },
    async getTrip(tripId) {
      return trips.find((t) => t.tripId === tripId) ?? null;
    },
    subscribe(cb): Unsubscribe {
      listeners.add(cb);
      // Send initial snapshot
      cb({ type: "snapshot", trips });
      ensureRunning();
      return () => {
        listeners.delete(cb);
        maybeStop();
      };
    },
    subscribeToTripUpdates(tripId, cb): Unsubscribe {
      const wrapped = (event: TripEvent) => {
        if (event.type === "snapshot") {
          const t = event.trips.find((x) => x.tripId === tripId);
          if (t) cb({ type: "snapshot", trips: [t] });
          return;
        }
        if (event.type === "positions") {
          const u = event.updates.find((x) => x.tripId === tripId);
          if (u) cb({ type: "position", tripId, patch: u.patch });
          return;
        }
        if (event.type === "seats-bulk") {
          const u = event.updates.find((x) => x.tripId === tripId);
          if (u) cb({ type: "seats", tripId, patch: u.patch });
          return;
        }
        if (event.tripId === tripId) cb(event);
      };
      listeners.add(wrapped);
      const t = trips.find((x) => x.tripId === tripId);
      if (t) cb({ type: "snapshot", trips: [t] });
      ensureRunning();
      return () => {
        listeners.delete(wrapped);
        maybeStop();
      };
    },
  };
}

export const MockTripAdapter = createMockTripAdapter();

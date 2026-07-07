import type { TripService } from "@/services/contracts/TripService";
import type { Trip } from "@/types/trip";
import type { SeatUpdate, TripEvent, TripPositionUpdate, Unsubscribe } from "@/types/events";
import { seedTrips } from "@/data/mock/trips";
import { MOCK_ROUTES } from "@/data/mock/routes";
import { MOCK_BUSES } from "@/data/mock/buses";
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
      if (trip.status === "breakdown" || trip.status === "completed") continue;

      // Advance progress based on speed. distanceKm covered per second.
      const route = MOCK_ROUTES.find((r) => r.id === trip.routeId)!;
      const kmPerSec = trip.speed / 3600;
      const delta = (kmPerSec / route.distanceKm) * (TICK_MS / 1000);
      trip.routeProgress = Math.min(1, trip.routeProgress + delta);

      if (trip.routeProgress >= 1) {
        // Loop the trip so the radar stays lively without new seeding.
        trip.routeProgress = 0;
        trip.direction = trip.direction === "forward" ? "reverse" : "forward";
      }

      const poly = directionalPolyline(trip.routeId, trip.direction);
      const { lat, lng, heading } = interpolateAlongPolyline(poly, trip.routeProgress);
      trip.latitude = lat;
      trip.longitude = lng;
      trip.heading = heading;
      trip.lastUpdated = new Date(now).toISOString();

      // Occasional small speed fluctuation (scaled to tick)
      if (trip.status === "running") {
        trip.speed = Math.max(15, Math.min(70, trip.speed + (Math.random() - 0.5) * 2));
      } else if (trip.status === "boarding") {
        trip.speed = 0;
      }

      const patch: TripPositionUpdate = {
        latitude: trip.latitude,
        longitude: trip.longitude,
        heading: trip.heading,
        speed: trip.speed,
        routeProgress: trip.routeProgress,
        gpsAccuracy: trip.gpsAccuracy,
        lastUpdated: trip.lastUpdated,
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
      trip.occupiedSeats = Math.max(0, Math.min(bus.totalSeats, trip.occupiedSeats + drift));
      trip.vacantSeats = bus.totalSeats - trip.occupiedSeats;
      trip.lastUpdated = new Date().toISOString();
      const patch: SeatUpdate = {
        occupiedSeats: trip.occupiedSeats,
        standingPassengers: trip.standingPassengers,
        vacantSeats: trip.vacantSeats,
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

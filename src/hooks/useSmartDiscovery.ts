import { useEffect, useMemo, useState } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { bearingDeg, haversineKm } from "@/utils/geo";
import { occupancyLevel, occupancyRatio } from "@/utils/occupancy";
import type { UserLocation } from "./useGeolocation";
import type { LiveBusView } from "@/types/view";
import type { Stop } from "@/types/stop";

export type BusRelation =
  "coming_towards" | "moving_away" | "crossed" | "approaching_stop" | "at_stop" | "completed";

export type DiscoveryBadge = "best" | "fastest" | "most_seats" | "closest" | "recommended";

export interface DiscoveryResult extends LiveBusView {
  distanceKm: number;
  bearingFromUser: number;
  relation: BusRelation;
  /** Walking distance to the bus's next stop (approx: haversine). */
  walkingToNextStopKm: number | null;
  /** Walking distance to the closest stop of any kind. */
  walkingToNearestStopKm: number;
  nearestStop: Stop | null;
  nextStopEtaSec: number | null;
  seatAvailability: number;
  occupancyPct: number;
  badges: DiscoveryBadge[];
  score: number;
}

function computeRelation(
  view: LiveBusView,
  user: UserLocation,
  bearingFromUser: number,
  distanceKm: number,
): BusRelation {
  const { trip } = view;
  if (trip.status === "completed") return "completed";
  if (trip.status === "boarding") return "at_stop";
  if (trip.speed < 2) {
    // Very slow: likely near a stop.
    return "approaching_stop";
  }
  const angleDiff = Math.abs(((trip.heading - bearingFromUser + 540) % 360) - 180);
  // Heading opposite to bearing-from-user means bus is moving towards user.
  if (angleDiff > 120) return "coming_towards";
  if (angleDiff < 60) {
    // Same direction: either moving away (in front) or already passed.
    // Heuristic: if user is behind the bus and distance is decreasing, "moving_away";
    // for the mock we treat close+same-direction as crossed.
    return distanceKm < 0.4 ? "crossed" : "moving_away";
  }
  return "moving_away";
}

export function useSmartDiscovery(
  location: UserLocation | null,
  radiusKm: number,
  walkingSpeedKmh = 4.8,
): DiscoveryResult[] {
  // Sample the live store on a fixed cadence rather than subscribing to
  // tripsById directly. With 100+ buses updating every 500ms, subscribing
  // would re-run discovery (an O(N * stops) walk) on every tick and cascade
  // re-renders through every consumer. 1s is imperceptible for a radar.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!location) return [];
    const { tripsById, busesById, operatorsById, routesById, stopsById } = useLiveStore.getState();
    const stops = Object.values(stopsById);
    const results: DiscoveryResult[] = [];

    for (const trip of Object.values(tripsById)) {
      const distanceKm = haversineKm(location, {
        lat: trip.latitude,
        lng: trip.longitude,
      });
      if (distanceKm > radiusKm) continue;
      const bus = busesById[trip.busId];
      const operator = operatorsById[trip.operatorId];
      const route = routesById[trip.routeId];
      if (!bus || !operator || !route) continue;

      const bFromUser = bearingDeg(location, {
        lat: trip.latitude,
        lng: trip.longitude,
      });
      const relation = computeRelation(
        { trip, bus, operator, route },
        location,
        bFromUser,
        distanceKm,
      );

      // Nearest stop overall (walking target).
      let nearestStop: Stop | null = null;
      let nearestKm = Infinity;
      for (const s of stops) {
        const d = haversineKm(location, { lat: s.lat, lng: s.lng });
        if (d < nearestKm) {
          nearestKm = d;
          nearestStop = s;
        }
      }

      const nextStop = trip.nextStopId ? stopsById[trip.nextStopId] : null;
      const walkingToNextStopKm = nextStop
        ? haversineKm(location, { lat: nextStop.lat, lng: nextStop.lng })
        : null;

      const nextEtaIso = trip.nextStopId ? trip.eta[trip.nextStopId] : null;
      const nextStopEtaSec = nextEtaIso
        ? Math.max(0, Math.round((new Date(nextEtaIso).getTime() - Date.now()) / 1000))
        : null;

      results.push({
        trip,
        bus,
        operator,
        route,
        distanceKm,
        bearingFromUser: bFromUser,
        relation,
        walkingToNextStopKm,
        walkingToNearestStopKm: nearestKm,
        nearestStop,
        nextStopEtaSec,
        seatAvailability: trip.vacantSeats,
        occupancyPct: Math.round(occupancyRatio(trip, bus) * 100),
        badges: [],
        score: 0,
      });
    }

    // Compute smart score.
    for (const r of results) {
      let score = 0;
      // Direction: heavily favor coming towards.
      if (r.relation === "coming_towards") score += 100;
      else if (r.relation === "approaching_stop" || r.relation === "at_stop") score += 60;
      else if (r.relation === "moving_away") score += 10;
      // ETA: sooner is better (up to 30 minutes).
      if (r.nextStopEtaSec != null) score += Math.max(0, 60 - r.nextStopEtaSec / 30);
      // Seat availability (up to ~40 pts for empty bus).
      score += Math.min(40, r.seatAvailability);
      // Occupancy penalty.
      score -= Math.min(30, r.occupancyPct * 0.3);
      // Walking distance penalty.
      score -= r.walkingToNearestStopKm * 20;
      // Trip liveness: crossed / completed heavy penalty.
      if (r.relation === "crossed" || r.relation === "completed") score -= 80;
      // Standing / packed penalty.
      const level = occupancyLevel(r.trip, r.bus);
      if (level === "packed") score -= 25;
      r.score = score;
    }

    results.sort((a, b) => b.score - a.score);

    // Badges — compute across the whole nearby set.
    if (results.length > 0) {
      const fastest = [...results].sort(
        (a, b) => (a.nextStopEtaSec ?? 9999) - (b.nextStopEtaSec ?? 9999),
      )[0];
      const mostSeats = [...results].sort((a, b) => b.seatAvailability - a.seatAvailability)[0];
      const closest = [...results].sort((a, b) => a.distanceKm - b.distanceKm)[0];
      const best = results[0];
      // Recommended = top score AND at least "medium" occupancy AND catchable direction.
      const recommended = results.find(
        (r) =>
          (r.relation === "coming_towards" || r.relation === "approaching_stop") &&
          r.occupancyPct < 90 &&
          r.seatAvailability > 0,
      );

      best.badges.push("best");
      if (fastest && fastest !== best) fastest.badges.push("fastest");
      if (mostSeats && !mostSeats.badges.length) mostSeats.badges.push("most_seats");
      if (closest && !closest.badges.length) closest.badges.push("closest");
      if (recommended && !recommended.badges.includes("best"))
        recommended.badges.push("recommended");
    }

    return results;
  }, [location, radiusKm, walkingSpeedKmh, tick]);
}

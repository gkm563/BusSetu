/**
 * Smart Route Intelligence — pure functions that consume the live-store
 * catalog snapshot and produce a ranked, explainable answer to
 * "how do I get from A to B right now?".
 *
 * Nothing here touches React, Leaflet, or the network. The hook layer
 * (useRouteIntelligence) is responsible for sampling live data and
 * memoizing calls into this engine.
 *
 * Extension seam: when a real backend arrives, swap the transfer-graph
 * search below for a precomputed adjacency index. The scoring and
 * summary functions can stay identical.
 */

import type { Bus } from "@/types/bus";
import type { Operator } from "@/types/operator";
import type { BusRoute } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip } from "@/types/trip";
import type {
  BusRecommendation,
  RouteIntelligenceResult,
  RouteSummary,
  SmartStatus,
  TransferPlan,
} from "@/types/intelligence";
import { haversineKm } from "@/utils/geo";
import { occupancyRatio } from "@/utils/occupancy";
import type { UserLocation } from "@/hooks/useGeolocation";

const WALKING_SPEED_KMH = 4.8;
/** A stop is considered "reachable" if walking to it is under this many km. */
export const CATCHABLE_WALKING_KM = 1.5;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function stopMatches(stop: Stop, needle: string): boolean {
  const n = norm(needle);
  if (!n) return false;
  return stop.name.toLowerCase().includes(n) || stop.city.toLowerCase().includes(n);
}

/**
 * Given a From/To query, find the best-matching endpoint stops across the
 * whole network. We prefer stops that appear in the largest number of
 * routes so we bias towards well-connected hubs.
 */
export function resolveEndpointStops(
  fromQuery: string,
  toQuery: string,
  routes: BusRoute[],
): { fromStop: Stop | null; toStop: Stop | null } {
  const stopScores = new Map<string, { stop: Stop; count: number }>();
  for (const r of routes) {
    for (const s of r.stops) {
      const prev = stopScores.get(s.id);
      if (prev) prev.count += 1;
      else stopScores.set(s.id, { stop: s, count: 1 });
    }
  }
  const all = Array.from(stopScores.values());
  function best(needle: string): Stop | null {
    if (!norm(needle)) return null;
    const matches = all.filter((s) => stopMatches(s.stop, needle));
    if (matches.length === 0) return null;
    matches.sort((a, b) => b.count - a.count);
    return matches[0].stop;
  }
  return { fromStop: best(fromQuery), toStop: best(toQuery) };
}

/**
 * A route serves the query if it contains a from-stop then a to-stop
 * (in that order). Matching is name-based so "Prayagraj" resolves via
 * "Prayagraj Bus Stand" or "Prayagraj Junction".
 */
export interface DirectRouteMatch {
  route: BusRoute;
  boardingStop: Stop;
  alightingStop: Stop;
  boardingStopIndex: number;
  alightingStopIndex: number;
}

export function findDirectRoutes(
  fromQuery: string,
  toQuery: string,
  routes: BusRoute[],
): DirectRouteMatch[] {
  const out: DirectRouteMatch[] = [];
  const hasFrom = !!fromQuery.trim();
  const hasTo = !!toQuery.trim();
  for (const route of routes) {
    const fromIdx = hasFrom ? route.stops.findIndex((s) => stopMatches(s, fromQuery)) : 0;
    if (hasFrom && fromIdx < 0) continue;
    const toIdx = hasTo
      ? route.stops.findIndex((s, i) => i > fromIdx && stopMatches(s, toQuery))
      : route.stops.length - 1;
    if (hasTo && toIdx < 0) continue;
    out.push({
      route,
      boardingStop: route.stops[fromIdx],
      alightingStop: route.stops[toIdx],
      boardingStopIndex: fromIdx,
      alightingStopIndex: toIdx,
    });
  }
  return out;
}

/** One-transfer BFS: pair route A (from → transfer) with route B (transfer → to). */
export function findOneTransferPlans(
  fromQuery: string,
  toQuery: string,
  routes: BusRoute[],
  cap = 5,
): TransferPlan[] {
  const fromLegs: {
    route: BusRoute;
    boardingStop: Stop;
    exitStop: Stop;
    exitIdx: number;
  }[] = [];
  const toLegs: {
    route: BusRoute;
    entryStop: Stop;
    entryIdx: number;
    alightingStop: Stop;
  }[] = [];
  for (const route of routes) {
    const fromIdx = route.stops.findIndex((s) => stopMatches(s, fromQuery));
    if (fromIdx >= 0) {
      for (let j = fromIdx + 1; j < route.stops.length; j++) {
        fromLegs.push({
          route,
          boardingStop: route.stops[fromIdx],
          exitStop: route.stops[j],
          exitIdx: j,
        });
      }
    }
    const toIdx = route.stops.findIndex((s) => stopMatches(s, toQuery));
    if (toIdx >= 0) {
      for (let i = 0; i < toIdx; i++) {
        toLegs.push({
          route,
          entryStop: route.stops[i],
          entryIdx: i,
          alightingStop: route.stops[toIdx],
        });
      }
    }
  }

  const seen = new Set<string>();
  const plans: TransferPlan[] = [];
  for (const a of fromLegs) {
    for (const b of toLegs) {
      if (a.route.id === b.route.id) continue;
      if (a.exitStop.id !== b.entryStop.id) continue;
      const id = `${a.route.id}|${a.boardingStop.id}->${a.exitStop.id}|${b.route.id}|${b.entryStop.id}->${b.alightingStop.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const leg1Dist = legDistanceKm(a.route, indexOfStop(a.route, a.boardingStop.id), a.exitIdx);
      const leg2Dist = legDistanceKm(b.route, b.entryIdx, indexOfStop(b.route, b.alightingStop.id));
      const totalKm = leg1Dist + leg2Dist;
      plans.push({
        id,
        legs: [
          {
            route: a.route,
            boardingStop: a.boardingStop,
            alightingStop: a.exitStop,
          },
          {
            route: b.route,
            boardingStop: b.entryStop,
            alightingStop: b.alightingStop,
          },
        ],
        transferStops: [a.exitStop],
        totalLegDistanceKm: totalKm,
        totalEstimatedMin: estimateMinutesForKm(totalKm) + 10, // 10 min buffer
      });
      if (plans.length >= cap) return plans;
    }
  }
  plans.sort((a, b) => a.totalEstimatedMin - b.totalEstimatedMin);
  return plans;
}

/** Two-transfer plans — bounded best-effort. Runs only when 1-transfer is empty. */
export function findTwoTransferPlans(
  fromQuery: string,
  toQuery: string,
  routes: BusRoute[],
  cap = 3,
): TransferPlan[] {
  const fromRoutes = routes
    .map((r) => ({ r, fromIdx: r.stops.findIndex((s) => stopMatches(s, fromQuery)) }))
    .filter((x) => x.fromIdx >= 0);
  const toRoutes = routes
    .map((r) => ({ r, toIdx: r.stops.findIndex((s) => stopMatches(s, toQuery)) }))
    .filter((x) => x.toIdx >= 0);
  if (!fromRoutes.length || !toRoutes.length) return [];

  const seen = new Set<string>();
  const plans: TransferPlan[] = [];
  for (const a of fromRoutes) {
    // Middle route candidates: any route that shares a stop with A (after fromIdx)
    // and shares a stop with any To route (before that route's toIdx).
    for (let ai = a.fromIdx + 1; ai < a.r.stops.length; ai++) {
      const t1 = a.r.stops[ai];
      for (const mid of routes) {
        if (mid.id === a.r.id) continue;
        const midEntry = mid.stops.findIndex((s) => s.id === t1.id);
        if (midEntry < 0) continue;
        for (let mi = midEntry + 1; mi < mid.stops.length; mi++) {
          const t2 = mid.stops[mi];
          for (const b of toRoutes) {
            if (b.r.id === a.r.id || b.r.id === mid.id) continue;
            const bEntry = b.r.stops.findIndex((s, i) => i < b.toIdx && s.id === t2.id);
            if (bEntry < 0) continue;
            const boarding = a.r.stops[a.fromIdx];
            const alighting = b.r.stops[b.toIdx];
            const id = `${a.r.id}:${boarding.id}->${t1.id}|${mid.id}:${t1.id}->${t2.id}|${b.r.id}:${t2.id}->${alighting.id}`;
            if (seen.has(id)) continue;
            seen.add(id);
            const d =
              legDistanceKm(a.r, a.fromIdx, ai) +
              legDistanceKm(mid, midEntry, mi) +
              legDistanceKm(b.r, bEntry, b.toIdx);
            plans.push({
              id,
              legs: [
                { route: a.r, boardingStop: boarding, alightingStop: t1 },
                { route: mid, boardingStop: t1, alightingStop: t2 },
                { route: b.r, boardingStop: t2, alightingStop: alighting },
              ],
              transferStops: [t1, t2],
              totalLegDistanceKm: d,
              totalEstimatedMin: estimateMinutesForKm(d) + 20,
            });
            if (plans.length >= cap) return plans;
          }
        }
      }
    }
  }
  plans.sort((a, b) => a.totalEstimatedMin - b.totalEstimatedMin);
  return plans;
}

function indexOfStop(route: BusRoute, stopId: string): number {
  return route.stops.findIndex((s) => s.id === stopId);
}

function legDistanceKm(route: BusRoute, fromIdx: number, toIdx: number): number {
  if (fromIdx < 0 || toIdx < 0 || toIdx <= fromIdx) return 0;
  const total = route.stops.length;
  if (total <= 1) return 0;
  const fraction = (toIdx - fromIdx) / (total - 1);
  return route.distanceKm * fraction;
}

function estimateMinutesForKm(km: number, avgKmh = 38): number {
  return Math.round((km / avgKmh) * 60);
}

/**
 * Rank the active trips on a matched route into ordered recommendations.
 * Requires a user location for walking calculations. Without one, the
 * boarding-stop metrics degrade gracefully.
 */
export function rankTripsForRoute(
  match: DirectRouteMatch,
  tripsOnRoute: Trip[],
  bus: (id: string) => Bus | undefined,
  operator: (id: string) => Operator | undefined,
  userLocation: UserLocation | null,
): BusRecommendation[] {
  const { route, boardingStop, alightingStop, boardingStopIndex, alightingStopIndex } = match;
  const totalStops = route.stops.length;
  const boardingProgress = totalStops <= 1 ? 0 : boardingStopIndex / (totalStops - 1);

  const walkingKm = userLocation
    ? haversineKm(userLocation, {
        lat: boardingStop.lat,
        lng: boardingStop.lng,
      })
    : 0;
  const walkingMin = Math.round((walkingKm / WALKING_SPEED_KMH) * 60);

  // We determine the reference stop for "already crossed" calculations.
  // If the user's physical location is available, we find the stop on the route
  // closest to the user. This is the user's physical "boarding stop" context.
  // Otherwise, we fallback to the searched boarding stop.
  let referenceStop = boardingStop;
  let referenceStopIndex = boardingStopIndex;
  if (userLocation) {
    let minDistance = Infinity;
    route.stops.forEach((stop, idx) => {
      const d = haversineKm(userLocation, { lat: stop.lat, lng: stop.lng });
      if (d < minDistance) {
        minDistance = d;
        referenceStop = stop;
        referenceStopIndex = idx;
      }
    });
  }
  const referenceProgress = totalStops <= 1 ? 0 : referenceStopIndex / (totalStops - 1);

  const out: BusRecommendation[] = [];
  for (const trip of tripsOnRoute) {
    const b = bus(trip.busId);
    const op = operator(trip.operatorId);
    if (!b || !op) continue;

    const distanceFromUserKm = userLocation
      ? haversineKm(userLocation, {
          lat: trip.gps.latitude,
          lng: trip.gps.longitude,
        })
      : 0;

    const etaIso = trip.eta[boardingStop.id];
    const etaToBoardingSec = etaIso
      ? Math.max(0, Math.round((new Date(etaIso).getTime() - Date.now()) / 1000))
      : null;

    const status = computeSmartStatus(trip, referenceStop.id, referenceProgress);
    const seatsAvailable = trip.passenger.vacantSeats;
    const occupancyPct = Math.round(occupancyRatio(trip, b) * 100);
    const delayMin = trip.delay ?? 0;
    const catchable = etaToBoardingSec != null && walkingMin * 60 <= etaToBoardingSec + 60;

    out.push({
      trip,
      bus: b,
      operator: op,
      route,
      boardingStop,
      boardingStopIndex,
      alightingStop,
      alightingStopIndex,
      walkingKm,
      walkingMin,
      etaToBoardingSec,
      distanceFromUserKm,
      status,
      seatsAvailable,
      occupancyPct,
      delayMin,
      score: 0,
      badges: [],
      catchable,
    });
  }

  scoreAndBadge(out);
  return out;
}

function computeSmartStatus(
  trip: Trip,
  boardingStopId: string,
  boardingProgress: number,
): SmartStatus {
  if (trip.status === "completed") return "completed";
  if ((trip.delay ?? 0) > 5) return "delayed";
  if (trip.nextStopId === boardingStopId) return "approaching_pickup";
  if (trip.currentStopId === boardingStopId || trip.gps.speed < 2) return "stopped";
  if (trip.routeProgress > boardingProgress + 0.02) return "already_crossed";
  if (trip.routeProgress < boardingProgress) return "coming_towards";
  return "moving_away";
}

function scoreAndBadge(recs: BusRecommendation[]) {
  for (const r of recs) {
    let score = 0;
    // Direction / catchability
    if (r.status === "approaching_pickup") score += 120;
    else if (r.status === "coming_towards") score += 90;
    else if (r.status === "stopped") score += 40;
    else if (r.status === "moving_away") score += 15;
    else if (r.status === "delayed") score += 10;
    else if (r.status === "already_crossed") score -= 60;
    else if (r.status === "completed") score -= 120;

    // ETA — sooner is better, plateau after 30 min
    if (r.etaToBoardingSec != null) {
      score += Math.max(0, 60 - r.etaToBoardingSec / 30);
    }
    // Walking penalty — beyond CATCHABLE_WALKING_KM it hurts a lot
    score -= r.walkingKm * 20;
    if (r.walkingKm > CATCHABLE_WALKING_KM) score -= 30;

    // Seats
    score += Math.min(40, r.seatsAvailable);
    // Crowd
    score -= Math.min(35, r.occupancyPct * 0.35);
    // Delay
    score -= Math.min(25, r.delayMin * 2);

    r.score = score;
  }

  recs.sort((a, b) => b.score - a.score);

  if (recs.length === 0) return;

  const best = recs[0];
  best.badges.push("best");

  const fastest = [...recs].sort(
    (a, b) => (a.etaToBoardingSec ?? 1e9) - (b.etaToBoardingSec ?? 1e9),
  )[0];
  if (fastest && fastest !== best) fastest.badges.push("fastest");

  const mostSeats = [...recs].sort((a, b) => b.seatsAvailable - a.seatsAvailable)[0];
  if (mostSeats && !mostSeats.badges.length) mostSeats.badges.push("most_seats");

  const closest = [...recs].sort((a, b) => a.walkingKm - b.walkingKm)[0];
  if (closest && !closest.badges.length) closest.badges.push("closest");

  const lowCrowd = [...recs].sort((a, b) => a.occupancyPct - b.occupancyPct)[0];
  if (lowCrowd && !lowCrowd.badges.length && lowCrowd.occupancyPct < 50)
    lowCrowd.badges.push("low_crowd");
}

/**
 * Aggregate a route-level summary from the trips that currently serve
 * the boarding → alighting leg. Empty active-trip lists degrade to
 * schedule-derived estimates.
 */
export function summarizeRoute(
  match: DirectRouteMatch,
  recommendations: BusRecommendation[],
): RouteSummary {
  const { route, boardingStop, alightingStop, boardingStopIndex, alightingStopIndex } = match;
  const legDistanceKmVal = legDistanceKm(route, boardingStopIndex, alightingStopIndex);
  const stopsInLeg = alightingStopIndex - boardingStopIndex;

  const activeTrips = recommendations.length;
  const avgSpeedKmh = activeTrips
    ? Math.round(recommendations.reduce((a, r) => a + r.trip.gps.speed, 0) / activeTrips)
    : 38;
  const expectedDelayMin = activeTrips
    ? Math.round(recommendations.reduce((a, r) => a + Math.max(0, r.delayMin), 0) / activeTrips)
    : 0;
  const avgOccupancyPct = activeTrips
    ? Math.round(recommendations.reduce((a, r) => a + r.occupancyPct, 0) / activeTrips)
    : 0;
  const estimatedMin =
    estimateMinutesForKm(legDistanceKmVal, Math.max(20, avgSpeedKmh)) + expectedDelayMin;

  return {
    route,
    boardingStop,
    alightingStop,
    boardingStopIndex,
    alightingStopIndex,
    legDistanceKm: legDistanceKmVal,
    estimatedMin,
    expectedDelayMin,
    avgSpeedKmh,
    avgOccupancyPct,
    stopsInLeg,
    activeTrips,
  };
}

/**
 * The top-level pipeline. Given the query + a snapshot of the catalog
 * and active trips, produce the full RouteIntelligenceResult.
 */
export function computeRouteIntelligence(input: {
  fromQuery: string;
  toQuery: string;
  routes: BusRoute[];
  trips: Trip[];
  bus: (id: string) => Bus | undefined;
  operator: (id: string) => Operator | undefined;
  userLocation: UserLocation | null;
}): RouteIntelligenceResult {
  const { fromQuery, toQuery, routes, trips, bus, operator, userLocation } = input;

  const endpoints = resolveEndpointStops(fromQuery, toQuery, routes);
  const directMatches = findDirectRoutes(fromQuery, toQuery, routes);

  const tripsByRoute = new Map<string, Trip[]>();
  for (const t of trips) {
    const arr = tripsByRoute.get(t.routeId);
    if (arr) arr.push(t);
    else tripsByRoute.set(t.routeId, [t]);
  }

  const allDirect: BusRecommendation[] = [];
  let bestSummary: RouteSummary | null = null;
  for (const m of directMatches) {
    const routeTrips = (tripsByRoute.get(m.route.id) ?? []).filter((t) => {
      // Only forward trips (matches the boarding→alighting order).
      // Reverse trips would put boarding after alighting in the polyline.
      return t.direction === "forward";
    });
    const recs = rankTripsForRoute(m, routeTrips, bus, operator, userLocation);
    allDirect.push(...recs);
    const s = summarizeRoute(m, recs);
    if (!bestSummary || s.activeTrips > bestSummary.activeTrips) bestSummary = s;
  }
  allDirect.sort((a, b) => b.score - a.score);

  let transfers1: TransferPlan[] = [];
  let transfers2: TransferPlan[] = [];
  if (allDirect.length === 0 && directMatches.length === 0) {
    transfers1 = findOneTransferPlans(fromQuery, toQuery, routes);
    if (transfers1.length === 0) {
      transfers2 = findTwoTransferPlans(fromQuery, toQuery, routes);
    }
  }

  return {
    fromStop: endpoints.fromStop,
    toStop: endpoints.toStop,
    summary: bestSummary,
    direct: allDirect,
    transfers1,
    transfers2,
    isUnresolved: allDirect.length === 0 && transfers1.length === 0 && transfers2.length === 0,
  };
}

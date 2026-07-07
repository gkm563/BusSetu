import type { LiveBusView } from "./view";
import type { Stop } from "./stop";
import type { BusRoute } from "./route";

/**
 * Smart status a bus is in relative to the user's boarding stop.
 * Distinct from the map-level `BusRelation` — this is what the
 * intelligence engine decides is actionable.
 */
export type SmartStatus =
  | "approaching_pickup"
  | "coming_towards"
  | "already_crossed"
  | "stopped"
  | "delayed"
  | "completed"
  | "moving_away";

export type IntelligenceBadge = "best" | "fastest" | "most_seats" | "closest" | "low_crowd";

export interface BusRecommendation extends LiveBusView {
  /** Stop the user should walk to to board this bus. */
  boardingStop: Stop;
  boardingStopIndex: number;
  /** Stop the user is heading to (destination on this route). */
  alightingStop: Stop;
  alightingStopIndex: number;
  /** Straight-line walking distance from user to boarding stop, km. */
  walkingKm: number;
  /** Estimated walking time to reach boarding stop, minutes. */
  walkingMin: number;
  /** Seconds until the bus reaches the boarding stop (from live ETA). */
  etaToBoardingSec: number | null;
  /** Distance from user to the bus right now, km. */
  distanceFromUserKm: number;
  status: SmartStatus;
  seatsAvailable: number;
  occupancyPct: number;
  delayMin: number;
  /** Composite rank score — higher is better. */
  score: number;
  badges: IntelligenceBadge[];
  /** Can the user realistically catch this bus? (walking time < ETA). */
  catchable: boolean;
}

export interface RouteSummary {
  route: BusRoute;
  boardingStop: Stop;
  alightingStop: Stop;
  boardingStopIndex: number;
  alightingStopIndex: number;
  /** Distance from boarding to alighting, km. */
  legDistanceKm: number;
  /** Average estimated travel time for this leg, minutes. */
  estimatedMin: number;
  /** Average delay across active trips on this route, minutes. */
  expectedDelayMin: number;
  /** Average speed across active trips on this route, km/h. */
  avgSpeedKmh: number;
  /** Average occupancy across active trips, 0–100. */
  avgOccupancyPct: number;
  /** Stops between boarding and alighting (inclusive of alighting). */
  stopsInLeg: number;
  /** Number of active trips currently serving this leg. */
  activeTrips: number;
}

export interface TransferPlan {
  id: string;
  legs: {
    route: BusRoute;
    boardingStop: Stop;
    alightingStop: Stop;
  }[];
  /** Transfer stops in order (length = legs.length - 1). */
  transferStops: Stop[];
  /** Total estimated leg distance, km. */
  totalLegDistanceKm: number;
  /** Total estimated travel time, minutes. */
  totalEstimatedMin: number;
  /** Best available recommendation on the first leg, if any. */
  firstLegRecommendation?: BusRecommendation;
}

export interface RouteIntelligenceResult {
  /** Best-match resolved endpoints across the whole network. */
  fromStop: Stop | null;
  toStop: Stop | null;
  /** Route summary aggregated across all direct candidates. */
  summary: RouteSummary | null;
  /** All ranked direct recommendations, sorted best → worst. */
  direct: BusRecommendation[];
  /** One-transfer plans, capped for performance. */
  transfers1: TransferPlan[];
  /** Two-transfer plans, only computed when 1-transfer is empty. */
  transfers2: TransferPlan[];
  /** True when the user query matched no route at all. */
  isUnresolved: boolean;
}

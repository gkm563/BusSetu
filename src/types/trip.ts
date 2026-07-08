import type { LiveGps } from "./liveGps";

export type TripStatus =
  "scheduled" | "boarding" | "running" | "delayed" | "breakdown" | "completed";

export type TripDirection = "forward" | "reverse";

export interface TripPassenger {
  occupiedSeats: number;
  standingPassengers: number;
  vacantSeats: number;
}

export interface Trip {
  tripId: string;
  busId: string;
  operatorId: string;
  routeId: string;
  direction: TripDirection;
  scheduledStart: string;
  scheduledEnd: string;
  status: TripStatus;
  /** Alias of scheduledStart, matching the public data model name. */
  startTime?: string;
  /** Alias of scheduledEnd, matching the public data model name. */
  expectedArrival?: string;
  /** Delay in minutes vs. schedule. Positive = late, negative = early. */
  delay?: number;
  gps: Omit<LiveGps, "tripId">;
  passenger: TripPassenger;
  currentStopId: string | null;
  nextStopId: string | null;
  routeProgress: number;
  eta: Record<string, string>;
  lastUpdated: string;
  punctualityScore?: number;
  averageDelayMin?: number;
}


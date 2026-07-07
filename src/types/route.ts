import type { Stop } from "./stop";

export interface BusRoute {
  id: string;
  name: string;
  stops: Stop[];
  polyline: [number, number][];
  distanceKm: number;
  /** Optional convenience fields derived from stops. */
  origin?: string;
  destination?: string;
  /** Scheduled end-to-end duration in minutes. */
  estimatedDurationMin?: number;
}

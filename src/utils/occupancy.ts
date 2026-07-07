import type { Trip } from "@/types/trip";
import type { Bus } from "@/types/bus";

export type OccupancyLevel = "low" | "medium" | "high" | "packed";

export function occupancyRatio(trip: Trip, bus: Bus): number {
  if (!trip || !bus || !bus.totalSeats) return 0;
  return Math.min(1.4, (trip.occupiedSeats + trip.standingPassengers) / bus.totalSeats);
}

export function occupancyLevel(trip: Trip, bus: Bus): OccupancyLevel {
  const r = occupancyRatio(trip, bus);
  if (r < 0.4) return "low";
  if (r < 0.75) return "medium";
  if (r < 1) return "high";
  return "packed";
}

export function occupancyLabel(level: OccupancyLevel): string {
  switch (level) {
    case "low":
      return "Plenty of seats";
    case "medium":
      return "Filling up";
    case "high":
      return "Crowded";
    case "packed":
      return "Standing only";
  }
}

import type { Occupancy } from "@/types/occupancy";
import type { Unsubscribe } from "@/types/events";

export interface OccupancyService {
  getOccupancy(tripId: string): Promise<Occupancy | null>;
  subscribeToOccupancy(tripId: string, cb: (occ: Occupancy) => void): Unsubscribe;
}

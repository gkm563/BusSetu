import type { Trip } from "@/types/trip";
import type { TripEvent, Unsubscribe } from "@/types/events";

export interface TripService {
  listActiveTrips(): Promise<Trip[]>;
  getTrip(tripId: string): Promise<Trip | null>;
  subscribe(cb: (event: TripEvent) => void): Unsubscribe;
  /**
   * Subscribe to updates for a single trip only. Sugar over `subscribe`
   * that filters events to the given tripId.
   */
  subscribeToTripUpdates(tripId: string, cb: (event: TripEvent) => void): Unsubscribe;
}

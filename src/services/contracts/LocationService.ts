import type { LiveGps } from "@/types/liveGps";
import type { Unsubscribe } from "@/types/events";
import type { LiveBusView } from "@/types/view";

/**
 * Location & proximity queries. Backed by the trip stream today; a real
 * implementation would consume dedicated GPS pings.
 */
export interface LocationService {
  getLiveGps(tripId: string): Promise<LiveGps | null>;
  getNearbyBuses(lat: number, lng: number, radiusKm: number): Promise<LiveBusView[]>;
  subscribeToTripLocation(tripId: string, cb: (gps: LiveGps) => void): Unsubscribe;
}

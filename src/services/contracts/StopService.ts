import type { Stop } from "@/types/stop";

export interface StopService {
  listStops(): Promise<Stop[]>;
  getStop(id: string): Promise<Stop | null>;
  getNearbyStops(lat: number, lng: number, radiusKm: number): Promise<Stop[]>;
}

import type { Bus } from "@/types/bus";

export interface BusService {
  listBuses(): Promise<Bus[]>;
  getBus(id: string): Promise<Bus | null>;
}

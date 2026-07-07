import type { Bus } from "@/types/bus";
import type { BusRoute } from "@/types/route";
import type { Stop } from "@/types/stop";

export interface GlobalSearchResult {
  buses: Bus[];
  routes: BusRoute[];
  stops: Stop[];
  cities: string[];
}

export interface SearchService {
  globalSearch(query: string): Promise<GlobalSearchResult>;
}

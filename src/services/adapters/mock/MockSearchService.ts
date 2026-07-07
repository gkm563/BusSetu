import type { GlobalSearchResult, SearchService } from "@/services/contracts/SearchService";
import { MOCK_BUSES } from "@/data/mock/buses";
import { MOCK_ROUTES } from "@/data/mock/routes";
import { MOCK_STOPS } from "@/data/mock/stops";
import { withLatency } from "./latency";

export const MockSearchService: SearchService = {
  async globalSearch(query): Promise<GlobalSearchResult> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { buses: [], routes: [], stops: [], cities: [] };
    }
    const buses = MOCK_BUSES.filter((b) => b.busNumber.toLowerCase().includes(q)).slice(0, 6);
    const routes = MOCK_ROUTES.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.stops.some((s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)),
    ).slice(0, 6);
    const stops = MOCK_STOPS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6);
    const citySet = new Set<string>();
    for (const s of MOCK_STOPS) {
      if (s.city.toLowerCase().includes(q)) citySet.add(s.city);
    }
    return withLatency({ buses, routes, stops, cities: Array.from(citySet).slice(0, 6) }, 220, 460);
  },
};

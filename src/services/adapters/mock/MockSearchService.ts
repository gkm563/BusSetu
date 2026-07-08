import type { GlobalSearchResult, SearchService } from "@/services/contracts/SearchService";
import { MOCK_BUSES } from "@/data/buses.mock";
import { MOCK_ROUTES } from "@/data/routes.mock";
import { MOCK_STOPS } from "@/data/stops.mock";
import { withLatency } from "./latency";

export const MockSearchService: SearchService = {
  async globalSearch(query): Promise<GlobalSearchResult> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { buses: [], routes: [], stops: [], cities: [] };
    }
    const cleanQ = q.replace(/\s+/g, "");
    const buses = MOCK_BUSES.filter((b) => {
      const cleanNum = b.busNumber.toLowerCase().replace(/\s+/g, "");
      return cleanNum.includes(cleanQ);
    }).slice(0, 6);
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

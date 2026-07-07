import type { RouteSearchQuery, RouteService } from "@/services/contracts/RouteService";
import { MOCK_ROUTES } from "@/data/mock/routes";
import { withLatency } from "./latency";

function matches(stopName: string, needle: string) {
  const n = needle.trim().toLowerCase();
  return n.length === 0 || stopName.toLowerCase().includes(n);
}

export const MockRouteService: RouteService = {
  async listRoutes() {
    return withLatency(MOCK_ROUTES, 220, 460);
  },
  async getRoute(id) {
    return withLatency(MOCK_ROUTES.find((r) => r.id === id) ?? null, 120, 240);
  },
  async searchRoutes({ from, to, via }: RouteSearchQuery) {
    const results = MOCK_ROUTES.filter((r) => {
      const fromIdx = r.stops.findIndex((s) => matches(s.name, from) || matches(s.city, from));
      if (fromIdx < 0) return false;
      const toIdx = r.stops.findIndex(
        (s, i) => i > fromIdx && (matches(s.name, to) || matches(s.city, to)),
      );
      if (toIdx < 0) return false;
      if (via && via.trim()) {
        const viaIdx = r.stops.findIndex(
          (s, i) => i > fromIdx && i < toIdx && (matches(s.name, via) || matches(s.city, via)),
        );
        if (viaIdx < 0) return false;
      }
      return true;
    });
    return withLatency(results, 260, 520);
  },
};

import type { StopService } from "@/services/contracts/StopService";
import { MOCK_STOPS } from "@/data/stops.mock";
import { haversineKm } from "@/utils/geo";
import { withLatency } from "./latency";

export const MockStopService: StopService = {
  async listStops() {
    return withLatency(MOCK_STOPS, 200, 400);
  },
  async getStop(id) {
    return withLatency(MOCK_STOPS.find((s) => s.id === id) ?? null, 120, 220);
  },
  async getNearbyStops(lat, lng, radiusKm) {
    return withLatency(
      MOCK_STOPS.filter((s) => haversineKm({ lat, lng }, { lat: s.lat, lng: s.lng }) <= radiusKm),
      140,
      280,
    );
  },
};

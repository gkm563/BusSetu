import type { BusService } from "@/services/contracts/BusService";
import { MOCK_BUSES } from "@/data/mock/buses";
import { withLatency } from "./latency";

export const MockBusService: BusService = {
  async listBuses() {
    return withLatency(MOCK_BUSES, 200, 420);
  },
  async getBus(id) {
    return withLatency(MOCK_BUSES.find((b) => b.id === id) ?? null, 120, 240);
  },
};

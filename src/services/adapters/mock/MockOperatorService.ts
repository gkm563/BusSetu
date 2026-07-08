import type { OperatorService } from "@/services/contracts/OperatorService";
import { MOCK_OPERATORS } from "@/data/operators.mock";
import { withLatency } from "./latency";

export const MockOperatorService: OperatorService = {
  async listOperators() {
    return withLatency(MOCK_OPERATORS, 180, 360);
  },
  async getOperator(id) {
    return withLatency(MOCK_OPERATORS.find((o) => o.id === id) ?? null, 120, 220);
  },
};

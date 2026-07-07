import type { Operator } from "@/types/operator";

export interface OperatorService {
  listOperators(): Promise<Operator[]>;
  getOperator(id: string): Promise<Operator | null>;
}

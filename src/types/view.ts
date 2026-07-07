import type { Bus } from "./bus";
import type { Operator } from "./operator";
import type { BusRoute } from "./route";
import type { Trip } from "./trip";

export interface LiveBusView {
  trip: Trip;
  bus: Bus;
  operator: Operator;
  route: BusRoute;
}

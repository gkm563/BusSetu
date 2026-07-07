// Service factory: currently returns mock adapters. A real backend adapter
// (e.g. WebSocketTripAdapter, HttpRouteService) can be swapped in here
// without touching any component — the UI only imports these bindings.

import { MockBusService } from "./adapters/mock/MockBusService";
import { MockLocationService } from "./adapters/mock/MockLocationService";
import { MockOccupancyService } from "./adapters/mock/MockOccupancyService";
import { MockOperatorService } from "./adapters/mock/MockOperatorService";
import { MockRouteService } from "./adapters/mock/MockRouteService";
import { MockSearchService } from "./adapters/mock/MockSearchService";
import { MockStopService } from "./adapters/mock/MockStopService";
import { MockTripAdapter } from "./adapters/mock/MockTripAdapter";

import type { BusService } from "./contracts/BusService";
import type { LocationService } from "./contracts/LocationService";
import type { OccupancyService } from "./contracts/OccupancyService";
import type { OperatorService } from "./contracts/OperatorService";
import type { RouteService } from "./contracts/RouteService";
import type { SearchService } from "./contracts/SearchService";
import type { StopService } from "./contracts/StopService";
import type { TripService } from "./contracts/TripService";

export const tripService: TripService = MockTripAdapter;
export const busService: BusService = MockBusService;
export const operatorService: OperatorService = MockOperatorService;
export const routeService: RouteService = MockRouteService;
export const stopService: StopService = MockStopService;
export const searchService: SearchService = MockSearchService;
export const locationService: LocationService = MockLocationService;
export const occupancyService: OccupancyService = MockOccupancyService;

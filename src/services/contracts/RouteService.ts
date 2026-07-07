import type { BusRoute } from "@/types/route";

export interface RouteSearchQuery {
  from: string;
  to: string;
  via?: string;
}

export interface RouteService {
  listRoutes(): Promise<BusRoute[]>;
  getRoute(id: string): Promise<BusRoute | null>;
  searchRoutes(query: RouteSearchQuery): Promise<BusRoute[]>;
}

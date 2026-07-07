import { create } from "zustand";
import type { Bus } from "@/types/bus";
import type { Operator } from "@/types/operator";
import type { BusRoute } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip } from "@/types/trip";
import { busService, operatorService, routeService, stopService, tripService } from "@/services";

interface LiveStoreState {
  tripsById: Record<string, Trip>;
  /** Stable list of active trip ids — reference only changes on add/remove. */
  tripIdList: string[];
  busesById: Record<string, Bus>;
  operatorsById: Record<string, Operator>;
  routesById: Record<string, BusRoute>;
  stopsById: Record<string, Stop>;
  initialized: boolean;
  /** True once reference catalogs (buses/routes/stops/operators) are loaded. */
  catalogsLoaded: boolean;
  /** True once the first trips snapshot has arrived. */
  tripsLoaded: boolean;
  hydrateError: string | null;
  init: () => () => void;
}

function keyBy<T, K extends keyof T>(arr: T[], key: K): Record<string, T> {
  const out: Record<string, T> = {};
  for (const a of arr) out[String(a[key])] = a;
  return out;
}

export const useLiveStore = create<LiveStoreState>((set, get) => ({
  tripsById: {},
  tripIdList: [],
  busesById: {},
  operatorsById: {},
  routesById: {},
  stopsById: {},
  initialized: false,
  catalogsLoaded: false,
  tripsLoaded: false,
  hydrateError: null,
  init: () => {
    if (get().initialized) return () => {};
    set({ initialized: true });

    // Hydrate reference catalogs from the service layer. Purely async so
    // the UI never depends on the underlying storage (mock, REST, WS).
    void Promise.all([
      busService.listBuses(),
      operatorService.listOperators(),
      routeService.listRoutes(),
      stopService.listStops(),
    ])
      .then(([buses, operators, routes, stops]) => {
        set({
          busesById: keyBy(buses, "id"),
          operatorsById: keyBy(operators, "id"),
          routesById: keyBy(routes, "id"),
          stopsById: keyBy(stops, "id"),
          catalogsLoaded: true,
        });
      })
      .catch((err: unknown) => {
        set({
          hydrateError: err instanceof Error ? err.message : "Failed to load bus catalog.",
        });
      });

    const unsub = tripService.subscribe((event) => {
      if (event.type === "snapshot") {
        const tripsById = keyBy(event.trips, "tripId");
        set({
          tripsById,
          tripIdList: Object.keys(tripsById),
          tripsLoaded: true,
        });
        return;
      }
      if (event.type === "positions") {
        // Single bulk store update per tick — hot path.
        const current = get().tripsById;
        const next: Record<string, Trip> = { ...current };
        for (const u of event.updates) {
          const t = current[u.tripId];
          if (!t) continue;
          next[u.tripId] = { ...t, ...u.patch } as Trip;
        }
        set({ tripsById: next });
        return;
      }
      if (event.type === "seats-bulk") {
        const current = get().tripsById;
        const next: Record<string, Trip> = { ...current };
        for (const u of event.updates) {
          const t = current[u.tripId];
          if (!t) continue;
          next[u.tripId] = { ...t, ...u.patch } as Trip;
        }
        set({ tripsById: next });
        return;
      }
      if (event.type === "position" || event.type === "seats" || event.type === "status") {
        const current = get().tripsById[event.tripId];
        if (!current) return;
        const nextTrip: Trip = { ...current, ...event.patch } as Trip;
        set({ tripsById: { ...get().tripsById, [event.tripId]: nextTrip } });
      }
    });
    return unsub;
  },
}));

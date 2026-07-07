import { useEffect, useMemo, useState } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { computeRouteIntelligence } from "@/services/intelligence/RouteIntelligenceEngine";
import type { RouteIntelligenceResult } from "@/types/intelligence";
import type { UserLocation } from "./useGeolocation";

/**
 * React binding for the Route Intelligence engine. Samples the live
 * store on a 1 s cadence (same pattern as useSmartDiscovery) so that a
 * live radar with 100+ moving buses does not re-rank on every tick.
 *
 * Returns null when there is no active query — callers can bail out
 * cheaply before rendering the results panel.
 */
export function useRouteIntelligence(
  userLocation: UserLocation | null,
): RouteIntelligenceResult | null {
  const routeQuery = useUiStore((s) => s.routeQuery);
  const catalogsLoaded = useLiveStore((s) => s.catalogsLoaded);
  const tripsLoaded = useLiveStore((s) => s.tripsLoaded);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!routeQuery.active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [routeQuery.active]);

  return useMemo(() => {
    if (!routeQuery.active) return null;
    if (!catalogsLoaded || !tripsLoaded) {
      return {
        fromStop: null,
        toStop: null,
        summary: null,
        direct: [],
        transfers1: [],
        transfers2: [],
        isUnresolved: false,
      };
    }
    const { routesById, tripsById, busesById, operatorsById } = useLiveStore.getState();
    return computeRouteIntelligence({
      fromQuery: routeQuery.from,
      toQuery: routeQuery.to,
      routes: Object.values(routesById),
      trips: Object.values(tripsById),
      bus: (id) => busesById[id],
      operator: (id) => operatorsById[id],
      userLocation,
    });
  }, [
    routeQuery.active,
    routeQuery.from,
    routeQuery.to,
    routeQuery.via,
    userLocation,
    catalogsLoaded,
    tripsLoaded,
    tick,
  ]);
}

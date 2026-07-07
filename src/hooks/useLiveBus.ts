import { useMemo } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import type { LiveBusView } from "@/types/view";

/**
 * Compose a LiveBusView. We select each slice individually so that zustand's
 * default reference equality is stable, and only memoize the final object.
 */
export function useLiveBus(tripId: string | null): LiveBusView | null {
  const trip = useLiveStore((s) => (tripId ? s.tripsById[tripId] : undefined));
  const bus = useLiveStore((s) => (trip ? s.busesById[trip.busId] : undefined));
  const operator = useLiveStore((s) => (trip ? s.operatorsById[trip.operatorId] : undefined));
  const route = useLiveStore((s) => (trip ? s.routesById[trip.routeId] : undefined));
  return useMemo(() => {
    if (!trip || !bus || !operator || !route) return null;
    return { trip, bus, operator, route };
  }, [trip, bus, operator, route]);
}

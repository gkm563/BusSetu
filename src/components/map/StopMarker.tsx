import { Marker, Popup } from "react-leaflet";
import { useMemo } from "react";
import type { Stop } from "@/types/stop";
import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { stopDivIcon, activeStopDivIcon } from "./busIcon";
import { occupancyLabel, occupancyLevel } from "@/utils/occupancy";
import { formatEta } from "@/utils/format";

/**
 * A stop marker whose popup lists the next few buses expected there,
 * with ETA and live occupancy. Data is derived from active trips whose
 * route includes this stop and whose progress hasn't passed it.
 */
export function StopMarker({ stop, isActive }: { stop: Stop; isActive?: boolean }) {
  const tripsById = useLiveStore((s) => s.tripsById);
  const routesById = useLiveStore((s) => s.routesById);
  const busesById = useLiveStore((s) => s.busesById);
  const selectTrip = useUiStore((s) => s.selectTrip);

  const upcoming = useMemo(() => {
    const rows: {
      tripId: string;
      busNumber: string;
      eta?: string;
      level: ReturnType<typeof occupancyLevel>;
      vacant: number;
    }[] = [];
    for (const trip of Object.values(tripsById)) {
      const route = routesById[trip.routeId];
      const bus = busesById[trip.busId];
      if (!route || !bus) continue;
      const stops = trip.direction === "forward" ? route.stops : [...route.stops].reverse();
      const idx = stops.findIndex((s) => s.id === stop.id);
      if (idx < 0) continue;
      const currentIdx = Math.floor(trip.routeProgress * (stops.length - 1));
      if (currentIdx > idx) continue;
      rows.push({
        tripId: trip.tripId,
        busNumber: bus.busNumber,
        eta: trip.eta[stop.id],
        level: occupancyLevel(trip, bus),
        vacant: trip.passenger.vacantSeats,
      });
    }
    return rows
      .sort((a, b) => {
        if (!a.eta) return 1;
        if (!b.eta) return -1;
        return a.eta.localeCompare(b.eta);
      })
      .slice(0, 5);
  }, [tripsById, routesById, busesById, stop.id]);

  return (
    <Marker
      position={[stop.lat, stop.lng]}
      icon={isActive ? activeStopDivIcon(stop.name) : stopDivIcon()}
    >
      <Popup>
        <div className="w-56 text-sm">
          <div className="font-semibold">{stop.name}</div>
          <div className="text-muted-foreground text-xs">{stop.city}</div>
          <div className="mt-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming buses
          </div>
          {upcoming.length === 0 ? (
            <div className="text-xs text-muted-foreground">No buses inbound</div>
          ) : (
            <ul className="space-y-1">
              {upcoming.map((r) => (
                <li
                  key={r.tripId}
                  className="flex items-center justify-between gap-2 rounded-md p-1 hover:bg-accent cursor-pointer"
                  onClick={() => selectTrip(r.tripId)}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{r.busNumber}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {occupancyLabel(r.level)} · {r.vacant} vacant
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-brand">
                    {r.eta ? formatEta(r.eta) : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

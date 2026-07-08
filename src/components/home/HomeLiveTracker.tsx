import { useLiveStore } from "@/store/useLiveStore";
import { useUiStore } from "@/store/useUiStore";
import { Link, useNavigate } from "@tanstack/react-router";
import { Signal, ArrowRight, Gauge, Armchair } from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";

export function HomeLiveTracker() {
  const tripIdList = useLiveStore((s) => s.tripIdList);
  const tripsById = useLiveStore((s) => s.tripsById);
  const busesById = useLiveStore((s) => s.busesById);
  const routesById = useLiveStore((s) => s.routesById);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Pick top 3 active trips to show on dashboard
  const activeTrips = tripIdList
    .slice(0, 3)
    .map((id) => {
      const trip = tripsById[id];
      const bus = tripsById[id] ? busesById[tripsById[id].busId] : null;
      const route = tripsById[id] ? routesById[tripsById[id].routeId] : null;
      return { trip, bus, route };
    })
    .filter((t) => t.trip && t.bus && t.route);

  if (activeTrips.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
            🟢 {t("telemetryTitle")}
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
            {t("activeBuses")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("telemetryDesc")}
          </p>
        </div>
        <Link
          to="/search"
          search={{ trip: "t-alld-lko-03", from: "Prayagraj", to: "Lucknow", via: "Mirzapur" }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
        >
          {t("openRadar")} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTrips.map(({ trip, bus, route }) => {
          if (!trip || !bus || !route) return null;
          const vacant = trip.passenger.vacantSeats;
          const speed = trip.gps.speed;
          const progress = Math.round(trip.routeProgress * 100);

          return (
            <div
              key={trip.tripId}
              className="group relative rounded-3xl border border-border/60 bg-card p-4 hover:shadow-lg hover:border-brand/40 transition-all flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Signal className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                      {bus.busNumber}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">{route.name}</p>
                  </div>
                </div>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-brand uppercase tracking-wider">
                  Live
                </span>
              </div>

              {/* Grid data */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-muted/40 rounded-xl px-2.5 py-1.5 border border-border/30">
                  <Gauge className="h-3.5 w-3.5 text-brand" />
                  <span>{Math.round(speed)} km/h</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/40 rounded-xl px-2.5 py-1.5 border border-border/30">
                  <Armchair className="h-3.5 w-3.5 text-brand" />
                  <span>{vacant} seats left</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
              </div>

              <div className="mt-4 border-t border-border/40 pt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">GPS Status</span>
                  <span className="font-bold text-success flex items-center gap-1">
                    📡 Excellent
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => {
                  selectTrip(trip.tripId);
                  navigate({ to: "/search" });
                }}
                className="w-full mt-5 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-brand py-2.5 text-xs font-semibold text-brand-foreground shadow-sm shadow-brand/10 transition-colors group-hover:bg-brand/95 cursor-pointer"
              >
                <Signal className="h-3.5 w-3.5 animate-pulse" />
                Track Bus Live
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

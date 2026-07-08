import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bus, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { routeService } from "@/services";
import { useUiStore } from "@/store/useUiStore";
import type { BusRoute } from "@/types/route";

export const Route = createFileRoute("/routes")({
  head: () => ({
    meta: [
      { title: "Routes — BusSetu" },
      {
        name: "description",
        content:
          "Browse all bus routes served on BusSetu. Tap a route to see live buses tracking on it.",
      },
      { property: "og:title", content: "Routes — BusSetu" },
      {
        property: "og:description",
        content: "Every route, every stop — see the network at a glance.",
      },
    ],
  }),
  component: RoutesPage,
});

function RoutesPage() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const navigate = useNavigate();
  const setRouteQuery = useUiStore((s) => s.setRouteQuery);

  useEffect(() => {
    let alive = true;
    routeService.listRoutes().then((rs) => {
      if (alive) setRoutes(rs);
    });
    return () => {
      alive = false;
    };
  }, []);

  function handleRouteClick(r: BusRoute) {
    const from = r.origin ?? r.stops[0]?.city ?? "";
    const to = r.destination ?? r.stops[r.stops.length - 1]?.city ?? "";

    // Pre-fill the search store so /search picks it up instantly
    setRouteQuery({ from, to, via: "" });

    // Navigate with URL query params so it's bookmarkable & shareable
    navigate({
      to: "/search",
      search: { from, to } as never,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Network</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">Routes</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {routes.length} routes live. Tap any route to open the live map with buses highlighted
            and the search pre-filled.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {routes.map((r) => {
            const from = r.origin ?? r.stops[0]?.city ?? "";
            const to = r.destination ?? r.stops[r.stops.length - 1]?.city ?? "";
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRouteClick(r)}
                className="group flex flex-col rounded-3xl border border-border/60 bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-lg font-semibold leading-tight">{r.name}</h2>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{r.distanceKm.toFixed(0)} km</span>
                      <span>·</span>
                      <span>{r.stops.length} stops</span>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </div>

                {/* From → To badge */}
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand/8 px-3 py-2">
                  <Bus className="h-3.5 w-3.5 shrink-0 text-brand" />
                  <span className="text-xs font-semibold text-brand truncate">
                    {from}
                  </span>
                  <span className="text-[10px] text-brand/60 shrink-0">→</span>
                  <span className="text-xs font-semibold text-brand truncate">
                    {to}
                  </span>
                </div>

                {/* Stop list */}
                <ol className="mt-4 space-y-1.5">
                  {r.stops.map((s, i) => (
                    <li key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin
                        className={`h-3 w-3 shrink-0 ${
                          i === 0 || i === r.stops.length - 1
                            ? "text-brand"
                            : "text-muted-foreground/60"
                        }`}
                      />
                      <span className="truncate">
                        {s.name}{" "}
                        <span className="text-muted-foreground/70">· {s.city}</span>
                      </span>
                    </li>
                  ))}
                </ol>

                {/* Search hint */}
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-brand/70 group-hover:text-brand transition-colors">
                  <MapPin className="h-3 w-3" />
                  Click to search: <span className="font-bold">{from} → {to}</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}

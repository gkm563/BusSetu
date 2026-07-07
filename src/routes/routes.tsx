import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { routeService } from "@/services";
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
  useEffect(() => {
    let alive = true;
    routeService.listRoutes().then((rs) => {
      if (alive) setRoutes(rs);
    });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Network</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">Routes</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {routes.length} routes live. Tap any route to jump into the radar with only that route
            highlighted.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {routes.map((r) => (
            <Link
              key={r.id}
              to="/radar"
              className="group flex flex-col rounded-3xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">{r.name}</h2>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {r.distanceKm.toFixed(0)} km · {r.stops.length} stops
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              <ol className="mt-5 space-y-1.5">
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
                      {s.name} <span className="text-muted-foreground/70">· {s.city}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

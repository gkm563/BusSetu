import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Bus as BusIcon, MapPin, Route as RouteIcon, Building2, X } from "lucide-react";
import { searchService } from "@/services";
import type { GlobalSearchResult } from "@/services/contracts/SearchService";
import { useUiStore } from "@/store/useUiStore";
import { useLiveStore } from "@/store/useLiveStore";

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult>({
    buses: [],
    routes: [],
    stops: [],
    cities: [],
  });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const selectTrip = useUiStore((s) => s.selectTrip);
  const focusRoute = useUiStore((s) => s.focusRoute);
  const tripsById = useLiveStore((s) => s.tripsById);

  useEffect(() => {
    let alive = true;
    searchService.globalSearch(q).then((r) => {
      if (alive) setResults(r);
    });
    return () => {
      alive = false;
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const hasResults =
    results.buses.length + results.routes.length + results.stops.length + results.cities.length > 0;

  function goRadar() {
    setOpen(false);
    navigate({ to: "/radar" });
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 shadow-sm transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          placeholder="Search bus, route, stop, city…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && q.length > 0 && (
        <div className="glass-panel absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl p-2 text-sm">
          {!hasResults && <div className="p-4 text-center text-muted-foreground">No matches.</div>}

          {results.buses.length > 0 && (
            <Section title="Buses" icon={<BusIcon className="h-3.5 w-3.5" />}>
              {results.buses.map((b) => {
                // Find an active trip for this bus, if any
                const trip = Object.values(tripsById).find((t) => t.busId === b.id);
                return (
                  <button
                    key={b.id}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-accent"
                    onClick={() => {
                      if (trip) selectTrip(trip.tripId);
                      goRadar();
                    }}
                  >
                    <span className="font-medium">{b.busNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {trip ? "Live now" : "Not running"}
                    </span>
                  </button>
                );
              })}
            </Section>
          )}

          {results.routes.length > 0 && (
            <Section title="Routes" icon={<RouteIcon className="h-3.5 w-3.5" />}>
              {results.routes.map((r) => (
                <button
                  key={r.id}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-accent"
                  onClick={() => {
                    focusRoute(r.id);
                    goRadar();
                  }}
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.stops.length} stops</span>
                </button>
              ))}
            </Section>
          )}

          {results.stops.length > 0 && (
            <Section title="Bus stops" icon={<MapPin className="h-3.5 w-3.5" />}>
              {results.stops.map((s) => (
                <button
                  key={s.id}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-accent"
                  onClick={goRadar}
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.city}</span>
                </button>
              ))}
            </Section>
          )}

          {results.cities.length > 0 && (
            <Section title="Cities" icon={<Building2 className="h-3.5 w-3.5" />}>
              {results.cities.map((c) => (
                <button
                  key={c}
                  className="w-full rounded-lg px-3 py-2 text-left hover:bg-accent"
                  onClick={goRadar}
                >
                  {c}
                </button>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

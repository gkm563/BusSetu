import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Bus as BusIcon, MapPin, Route as RouteIcon, Building2, X } from "lucide-react";
import { searchService } from "@/services";
import type { GlobalSearchResult } from "@/services/contracts/SearchService";
import { useUiStore } from "@/store/useUiStore";
import { useLiveStore } from "@/store/useLiveStore";

const POPULAR_SUGGESTIONS = [
  { type: "stop", name: "Civil Lines Stop", subtitle: "Prayagraj" },
  { type: "stop", name: "Prayagraj Junction", subtitle: "Railway Station" },
  { type: "stop", name: "Naini Junction", subtitle: "Naini" },
  { type: "route", name: "Prayagraj - Mirzapur Live Route", id: "route-1" },
  { type: "bus", name: "UP 78 VW 6356 (AC Luxury)", id: "trip-3" },
];

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult>({
    buses: [],
    routes: [],
    stops: [],
    cities: [],
  });
  const wrapperRef = useRef<HTMLFormElement | null>(null);
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

  function goSearch() {
    setOpen(false);
    navigate({ to: "/search" });
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;

    const cleanQ = q.toLowerCase().replace(/\s+/g, "");
    const activeTripIds = useLiveStore.getState().tripIdList;
    const trips = useLiveStore.getState().tripsById;
    const buses = useLiveStore.getState().busesById;
    let matchTripId = null;

    for (const tid of activeTripIds) {
      const trip = trips[tid];
      const bus = trip ? buses[trip.busId] : null;
      if (bus && bus.busNumber.toLowerCase().replace(/\s+/g, "").includes(cleanQ)) {
        matchTripId = trip.tripId;
        break;
      }
    }

    if (matchTripId) {
      selectTrip(matchTripId);
      setOpen(false);
      navigate({ to: "/search" });
    } else {
      goSearch();
    }
  }

  return (
    <form ref={wrapperRef} onSubmit={handleFormSubmit} className="relative w-full max-w-md">
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
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear"
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && q.length === 0 && (
        <div className="glass-panel absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl p-3 text-sm border border-border/60 shadow-lg">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Popular Searches
          </div>
          <div className="space-y-1">
            {POPULAR_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-accent transition-colors cursor-pointer"
                onClick={() => {
                  if (item.type === "stop") {
                    setQ(item.name);
                  } else if (item.type === "route") {
                    focusRoute(item.id!);
                    goSearch();
                  } else if (item.type === "bus") {
                    selectTrip(item.id!);
                    goSearch();
                  }
                }}
              >
                {item.type === "stop" && <MapPin className="h-3.5 w-3.5 text-brand" />}
                {item.type === "route" && <RouteIcon className="h-3.5 w-3.5 text-brand" />}
                {item.type === "bus" && <BusIcon className="h-3.5 w-3.5 text-brand" />}
                <div>
                  <div className="font-semibold text-xs text-foreground leading-none">{item.name}</div>
                  {item.subtitle && <div className="text-[9px] text-muted-foreground mt-0.5">{item.subtitle}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-accent"
                    onClick={() => {
                      if (trip) selectTrip(trip.tripId);
                      goSearch();
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
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-accent"
                  onClick={() => {
                    focusRoute(r.id);
                    goSearch();
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
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-accent"
                  onClick={goSearch}
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
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left hover:bg-accent"
                  onClick={goSearch}
                >
                  {c}
                </button>
              ))}
            </Section>
          )}
        </div>
      )}
    </form>
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

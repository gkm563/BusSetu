import {
  ArrowLeftRight,
  CalendarClock,
  Clock,
  LocateFixed,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useRecentBuses } from "@/hooks/useRecentBuses";
import { useUiStore } from "@/store/useUiStore";
import { useLiveStore } from "@/store/useLiveStore";
import { MOCK_STOPS } from "@/data/stops.mock";

const POPULAR: { from: string; to: string }[] = [
  { from: "Prayagraj", to: "Lucknow" },
  { from: "Lucknow", to: "Delhi" },
  { from: "Delhi", to: "Prayagraj" },
  { from: "Prayagraj", to: "Varanasi" },
];

export function RouteSearchPanel({ variant = "vertical" }: { variant?: "vertical" | "horizontal" }) {
  const setRouteQuery = useUiStore((s) => s.setRouteQuery);
  const clearRouteQuery = useUiStore((s) => s.clearRouteQuery);
  const active = useUiStore((s) => s.routeQuery.active);
  const storeFrom = useUiStore((s) => s.routeQuery.from);
  const storeTo = useUiStore((s) => s.routeQuery.to);
  const storeVia = useUiStore((s) => s.routeQuery.via);
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const tripsById = useLiveStore((s) => s.tripsById);
  const busesById = useLiveStore((s) => s.busesById);

  const { request, status, location } = useGeolocation();
  const recents = useRecentSearches();
  const recentBuses = useRecentBuses();

  const [from, setFrom] = useState("Prayagraj");
  const [to, setTo] = useState("Lucknow");
  const [via, setVia] = useState("");
  const [departAt, setDepartAt] = useState(new Date().toISOString().split("T")[0]);
  const [showExtras, setShowExtras] = useState(false);

  // Sync external store changes (e.g. navigation from /routes page) into
  // local input state so the search box shows what was pre-filled.
  useEffect(() => {
    if (storeFrom) setFrom(storeFrom);
    if (storeTo) setTo(storeTo);
    if (storeVia) setVia(storeVia);
  }, [storeFrom, storeTo, storeVia]);

  // Pre-fill location: default to user's location if granted (only when box is empty)
  useEffect(() => {
    if (location && !from && !active) {
      setFrom(status === "granted" ? "Current location" : "Prayagraj");
    }
  }, [location, status, active]);

  // Record recently selected buses and sync selected trip in URL query
  useEffect(() => {
    if (!selectedTripId) {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("trip");
        window.history.replaceState(null, "", url.pathname + url.search);
      }
      return;
    }
    const trip = tripsById[selectedTripId];
    const bus = trip ? busesById[trip.busId] : null;
    if (trip && bus) {
      recentBuses.push(trip.tripId, bus.busNumber);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("trip", selectedTripId);
        window.history.replaceState(null, "", url.pathname + url.search);
      }
    }
  }, [selectedTripId, tripsById, busesById]);

  function submit(next: { from: string; to: string; via?: string }) {
    if (!next.from && !next.to) return;
    setFrom(next.from);
    setTo(next.to);
    setVia(next.via ?? "");
    setRouteQuery({
      from: next.from,
      to: next.to,
      via: next.via ?? "",
      departAt: departAt || undefined,
    });
    recents.push({ from: next.from, to: next.to, via: next.via });

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.pathname === "/") {
        window.location.href = `/search?from=${encodeURIComponent(next.from)}&to=${encodeURIComponent(next.to)}${next.via ? `&via=${encodeURIComponent(next.via)}` : ""}`;
        return;
      }

      if (next.from) url.searchParams.set("from", next.from);
      else url.searchParams.delete("from");
      if (next.to) url.searchParams.set("to", next.to);
      else url.searchParams.delete("to");
      if (next.via) url.searchParams.set("via", next.via);
      else url.searchParams.delete("via");
      window.history.replaceState(null, "", url.pathname + url.search);
    }

    toast.success("Route found", {
      description: `${next.from || "Any"} → ${next.to || "Any"}`,
      duration: 2200,
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit({ from, to, via });
  }

  function onSwap() {
    setFrom(to);
    setTo(from);
  }

  function onClear() {
    setFrom("");
    setTo("");
    setVia("");
    setDepartAt("");
    clearRouteQuery();

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("from");
      url.searchParams.delete("to");
      url.searchParams.delete("via");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }

  function useCurrent() {
    request();
    setFrom("Current location");
    if (status !== "granted") {
      toast.message("Locating you…", { duration: 1600 });
    }
  }

  return variant === "horizontal" ? (
    <form
      onSubmit={onSubmit}
      className="relative flex flex-col md:flex-row items-center w-full max-w-5xl mx-auto rounded-[32px] bg-card border border-border/50 shadow-2xl overflow-visible"
      aria-label="Search a bus route"
    >
      <div className="flex-1 flex flex-col md:flex-row items-center w-full p-2 gap-2">
        <div className="relative flex-1 w-full min-w-[240px] px-4 py-3 flex items-center gap-3 bg-accent/20 rounded-2xl md:rounded-l-3xl md:rounded-r-none hover:bg-accent/40 transition-colors">
          <LocateFixed className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col flex-1">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">From</span>
            <AutocompleteInput
              value={from}
              onChange={setFrom}
              placeholder="Prayagraj"
              aria-label="From location"
              className="bg-transparent border-none text-base font-bold text-foreground p-0 focus:ring-0 w-full placeholder:font-normal placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            type="button"
            onClick={onSwap}
            disabled={!from && !to}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-all hover:scale-110 hover:border-brand/50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Swap From and To"
            title="Swap"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="relative flex-1 w-full min-w-[240px] px-8 py-3 flex items-center gap-3 bg-accent/20 rounded-2xl md:rounded-none hover:bg-accent/40 transition-colors">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col flex-1">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">To</span>
            <AutocompleteInput
              value={to}
              onChange={setTo}
              placeholder="Delhi"
              aria-label="To location"
              className="bg-transparent border-none text-base font-bold text-foreground p-0 focus:ring-0 w-full placeholder:font-normal placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="w-px h-12 bg-border hidden md:block" />

        <div className="flex-1 w-full min-w-[200px] px-4 py-3 flex items-center gap-3 bg-accent/20 rounded-2xl md:rounded-none hover:bg-accent/40 transition-colors">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col flex-1">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Date of Journey</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-bold text-foreground whitespace-nowrap">Today</span>
              <div className="flex gap-1 ml-auto">
                <button type="button" className="px-2 py-0.5 text-[10px] font-semibold rounded bg-muted text-muted-foreground hover:bg-brand/10 hover:text-brand transition-colors">Today</button>
                <button type="button" className="px-2 py-0.5 text-[10px] font-semibold rounded bg-muted text-muted-foreground hover:bg-brand/10 hover:text-brand transition-colors">Tomorrow</button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-px h-12 bg-border hidden md:block" />

        <div className="flex items-center justify-center gap-2 px-4 py-3 min-w-[180px] bg-accent/20 rounded-2xl md:rounded-r-3xl md:rounded-l-none">
          <div className="h-8 w-8 bg-pink-500/10 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-pink-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold">Booking for women</span>
            <Link to="/about" className="text-[10px] text-brand hover:underline">Know more</Link>
          </div>
          <div className="ml-auto w-8 h-4 bg-muted rounded-full relative cursor-pointer">
            <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-background rounded-full" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 rounded-full bg-[#d84e55] px-12 py-3.5 text-base font-bold text-white shadow-xl transition-transform hover:scale-105 hover:bg-[#c64147]"
      >
        <Search className="h-5 w-5" aria-hidden /> Search buses
      </button>
    </form>
  ) : (
    <form
      onSubmit={onSubmit}
      className="glass-panel pointer-events-auto flex w-[min(600px,calc(100vw-2rem))] flex-col gap-2 rounded-3xl p-3"
      aria-label="Search a bus route"
    >
      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
        <div className="relative">
          <AutocompleteInput
            value={from}
            onChange={setFrom}
            placeholder="From (e.g. Prayagraj)"
            aria-label="From location"
            className="pr-20"
          />
          <button
            type="button"
            onClick={useCurrent}
            className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-brand/10 px-2 py-1 text-[10px] font-semibold text-brand transition-colors hover:bg-brand/20 z-10"
            aria-label="Use current location"
          >
            <LocateFixed className="h-3 w-3" aria-hidden /> Current
          </button>
        </div>
        <button
          type="button"
          onClick={onSwap}
          disabled={!from && !to}
          className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground transition-all hover:rotate-180 hover:border-brand/50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 sm:mx-0"
          aria-label="Swap From and To"
          title="Swap"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden />
        </button>
        <AutocompleteInput
          value={to}
          onChange={setTo}
          placeholder="To (e.g. Mirzapur)"
          aria-label="To location"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-transform hover:scale-[1.02]"
        >
          <Search className="h-4 w-4" aria-hidden /> Search
        </button>
      </div>

      <div className="flex items-center justify-between px-1 text-xs">
        <button
          type="button"
          onClick={() => setShowExtras((v) => !v)}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={showExtras}
        >
          {showExtras ? "Hide suggestions" : "Popular & recent"}
        </button>
        {active && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" aria-hidden /> Clear
          </button>
        )}
      </div>

      {showExtras && (
        <div className="space-y-2 border-t border-border/60 pt-2">
          <AutocompleteInput
            value={via}
            onChange={setVia}
            placeholder="Via (optional)"
            aria-label="Via stop"
          />
          <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-[12px] text-muted-foreground focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/15">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider">
              Leave at
            </span>
            <input
              type="datetime-local"
              value={departAt}
              onChange={(e) => setDepartAt(e.target.value)}
              aria-label="Departure time (optional)"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none"
            />
            {departAt && (
              <button
                type="button"
                onClick={() => setDepartAt("")}
                className="shrink-0 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </label>
          <Section icon={<Sparkles className="h-3 w-3" aria-hidden />} title="Popular routes">
            {POPULAR.map((r) => (
              <RouteChip
                key={`${r.from}-${r.to}`}
                label={`${r.from} → ${r.to}`}
                onClick={() => submit({ from: r.from, to: r.to })}
              />
            ))}
          </Section>
          {recents.items.length > 0 && (
            <Section
              icon={<Clock className="h-3 w-3" aria-hidden />}
              title="Recent searches"
              action={
                <button
                  type="button"
                  onClick={recents.clear}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              }
            >
              {recents.items.map((r) => (
                <RouteChip
                  key={`${r.from}-${r.to}-${r.ts}`}
                  label={`${r.from || "Any"} → ${r.to || "Any"}`}
                  onClick={() => submit({ from: r.from, to: r.to, via: r.via })}
                />
              ))}
            </Section>
          )}
          {recentBuses.items.length > 0 && (
            <Section
              icon={<Clock className="h-3 w-3" aria-hidden />}
              title="Recent buses"
              action={
                <button
                  type="button"
                  onClick={recentBuses.clear}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              }
            >
              {recentBuses.items.map((b) => (
                <RouteChip
                  key={b.tripId}
                  label={`🚌 ${b.busNumber}`}
                  onClick={() => {
                    clearRouteQuery();
                    selectTrip(b.tripId);
                  }}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </form>
  );
}

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {icon}
          {title}
        </div>
        {action}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function RouteChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
    >
      {label}
    </button>
  );
}

const ALL_LOCATIONS = Array.from(
  new Set([...MOCK_STOPS.map((s) => s.city), ...MOCK_STOPS.map((s) => s.name)]),
).sort();

function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className = "",
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const q = value.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!q) return [];
    const filtered = ALL_LOCATIONS.filter((loc) => loc.toLowerCase().includes(q));
    return filtered
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(q);
        const bStarts = b.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 5);
  }, [q]);

  const inlinePrediction = useMemo(() => {
    if (!q) return "";
    const match = ALL_LOCATIONS.find((loc) => loc.toLowerCase().startsWith(q));
    if (match) {
      return value + match.substring(value.length);
    }
    return "";
  }, [value, q]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" || e.key === "ArrowRight") {
      if (inlinePrediction && inlinePrediction !== value) {
        e.preventDefault();
        onChange(inlinePrediction);
        setSelectedIndex(-1);
      } else if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        onChange(suggestions[selectedIndex]);
        setFocused(false);
        setSelectedIndex(-1);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        onChange(suggestions[selectedIndex]);
        setFocused(false);
        setSelectedIndex(-1);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div
        className={`relative flex w-full min-w-0 items-center rounded-xl border border-border/70 bg-card transition-colors focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/15 ${className}`}
      >
        {focused &&
          inlinePrediction &&
          inlinePrediction.toLowerCase().startsWith(value.toLowerCase()) && (
            <div className="pointer-events-none absolute left-0 top-1/2 flex -translate-y-1/2 items-center pl-3 text-sm">
              <span className="text-transparent select-none whitespace-pre">{value}</span>
              <span className="text-muted-foreground/35 select-none whitespace-pre">
                {inlinePrediction.substring(value.length)}
              </span>
            </div>
          )}

        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          {...rest}
        />
      </div>

      {focused && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-[1000] mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-card p-1 shadow-lg backdrop-blur-md">
          {suggestions.map((s, index) => {
            const isSelected = index === selectedIndex;
            const matchIndex = s.toLowerCase().indexOf(q);
            const before = s.substring(0, matchIndex);
            const match = s.substring(matchIndex, matchIndex + q.length);
            const after = s.substring(matchIndex + q.length);

            return (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(s);
                    setFocused(false);
                    setSelectedIndex(-1);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                    isSelected
                      ? "bg-brand/10 text-brand font-medium"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <span className="truncate">
                    {before}
                    <strong className="font-semibold text-foreground">{match}</strong>
                    {after}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

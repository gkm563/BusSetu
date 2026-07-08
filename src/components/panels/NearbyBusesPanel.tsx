import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Footprints,
  Gauge,
  Loader2,
  LocateFixed,
  MapPinOff,
  MapPin,
  Navigation,
  Radar,
  ShieldAlert,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSmartDiscovery } from "@/hooks/useSmartDiscovery";
import type { BusRelation, DiscoveryResult } from "@/hooks/useSmartDiscovery";
import { useUiStore } from "@/store/useUiStore";
import { formatKm } from "@/utils/format";

const RADIUS_OPTIONS = [1, 3, 5, 10] as const;

function formatSec(sec: number | null | undefined): string {
  if (sec == null) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

const RELATION_LABEL: Record<BusRelation, { text: string; cls: string }> = {
  coming_towards: { text: "Coming towards you", cls: "bg-success/15 text-success" },
  moving_away: { text: "Moving away", cls: "bg-muted text-muted-foreground" },
  crossed: { text: "Just crossed", cls: "bg-muted text-muted-foreground" },
  approaching_stop: { text: "Approaching stop", cls: "bg-brand/10 text-brand" },
  at_stop: { text: "Stopped at stop", cls: "bg-warning/15 text-warning" },
  completed: { text: "Trip completed", cls: "bg-muted text-muted-foreground" },
};

const BADGES: Record<
  DiscoveryResult["badges"][number],
  { Icon: LucideIcon; label: string; cls: string }
> = {
  best: { Icon: CircleCheck, label: "Best option", cls: "bg-success/15 text-success" },
  fastest: { Icon: Zap, label: "Fastest", cls: "bg-warning/15 text-warning" },
  most_seats: { Icon: Armchair, label: "Most seats", cls: "bg-brand/10 text-brand" },
  closest: { Icon: Footprints, label: "Closest", cls: "bg-accent text-foreground" },
  recommended: { Icon: Trophy, label: "Recommended", cls: "bg-brand text-brand-foreground" },
};

export function NearbyBusesPanel() {
  const { location, status, request, usingDemo } = useGeolocation();
  const radiusKm = useUiStore((s) => s.discoveryRadiusKm);
  const setRadius = useUiStore((s) => s.setDiscoveryRadius);
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const hoverTrip = useUiStore((s) => s.hoverTrip);
  const nearby = useSmartDiscovery(location, radiusKm);
  const [collapsed, setCollapsed] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync list scroll when a trip is selected from the map.
  useEffect(() => {
    if (!selectedTripId || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-trip-id="${selectedTripId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedTripId]);

  const nextRadius = RADIUS_OPTIONS.find((r) => r > radiusKm);
  const isLocating = status === "prompt";
  const isDenied = status === "denied" || status === "error";

  return (
    <div className="glass-panel pointer-events-auto flex max-h-[calc(100vh-8rem)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl shadow-xl">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center justify-between gap-2 border-b border-border/60 p-3.5 text-left"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <div className="relative grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
            {isLocating && (
              <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-brand/25" />
            )}
            <Zap className="relative h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Smart Discovery</div>
            <div className="text-[11px] text-muted-foreground">
              {isLocating
                ? "Finding your location…"
                : location
                  ? `${nearby.length} bus${nearby.length === 1 ? "" : "es"} within ${radiusKm} km${usingDemo ? " · demo location" : ""}`
                  : "Waiting for location"}
            </div>
          </div>
        </div>
        {collapsed ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/* Radius selector */}
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3.5 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Radius
              </div>
              <div className="flex items-center gap-1 rounded-full bg-muted/60 p-0.5">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      radiusKm === r
                        ? "bg-brand text-brand-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={radiusKm === r}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            {/* Denied banner (rendered above list / empty so the reason for
             * the fallback is always visible). */}
            {isDenied && <DeniedBanner onRetry={request} locating={isLocating} />}

            {!location && <SkeletonList />}

            {location && nearby.length === 0 && (
              <EmptyState
                radiusKm={radiusKm}
                nextRadius={nextRadius}
                onExpand={nextRadius ? () => setRadius(nextRadius) : undefined}
                usingDemo={usingDemo}
                onUseReal={request}
                locating={isLocating}
              />
            )}

            {location && nearby.length > 0 && (
              <BucketedList
                listRef={listRef}
                items={nearby}
                selectedTripId={selectedTripId}
                onSelect={(id) => selectTrip(id)}
                onHover={(id, v) => hoverTrip(v ? id : null)}
              />
            )}

            {location && usingDemo && !isDenied && (
              <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3.5 py-2 text-[10px] text-muted-foreground">
                <span>Using a demo location</span>
                <button
                  onClick={request}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-brand hover:bg-brand/10 disabled:opacity-50"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Locating…
                    </>
                  ) : (
                    <>
                      <LocateFixed className="h-3 w-3" /> Use real location
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeniedBanner({ onRetry, locating }: { onRetry: () => void; locating: boolean }) {
  return (
    <div className="border-b border-border/60 bg-warning/5 px-3.5 py-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warning/15 text-warning">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold">Location permission blocked</div>
          <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            We're showing buses near a demo location. Enable location in your browser to see buses
            around you.
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              onClick={onRetry}
              disabled={locating}
              className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {locating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Trying…
                </>
              ) : (
                <>
                  <LocateFixed className="h-3 w-3" /> Try again
                </>
              )}
            </button>
            <span className="text-[10px] text-muted-foreground">
              or continue with demo location
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  radiusKm,
  nextRadius,
  onExpand,
  usingDemo,
  onUseReal,
  locating,
}: {
  radiusKm: number;
  nextRadius?: number;
  onExpand?: () => void;
  usingDemo: boolean;
  onUseReal: () => void;
  locating: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
      <div className="relative grid h-14 w-14 place-items-center">
        <span className="absolute inset-0 animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-brand/20" />
        <div className="relative grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <MapPinOff className="h-5 w-5" />
        </div>
      </div>
      <div>
        <div className="font-display text-sm font-semibold">No buses within {radiusKm} km</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          The radar is live — try a wider search radius or move the map.
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {onExpand && nextRadius && (
          <button
            onClick={onExpand}
            className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold text-brand-foreground transition-transform hover:scale-[1.02]"
          >
            <Radar className="h-3 w-3" /> Search within {nextRadius} km
          </button>
        )}
        {usingDemo && (
          <button
            onClick={onUseReal}
            disabled={locating}
            className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent/70 disabled:opacity-60"
          >
            {locating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Locating…
              </>
            ) : (
              <>
                <Navigation className="h-3 w-3" /> Use real location
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function NearbyCard({
  result: n,
  selected,
  onSelect,
  onHover,
}: {
  result: DiscoveryResult;
  selected: boolean;
  onSelect: () => void;
  onHover: (v: boolean) => void;
}) {
  const rel = RELATION_LABEL[n.relation];
  return (
    <li>
      <button
        data-trip-id={n.trip.tripId}
        onClick={onSelect}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        className={`group w-full rounded-2xl border p-3.5 text-left transition-all flex flex-col gap-3 ${
          selected
            ? "border-brand bg-brand/10 shadow-md ring-2 ring-brand/10"
            : "border-border/60 bg-card/85 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
        }`}
      >
        {/* Header segment */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-lg border border-brand/20 text-xs font-mono font-extrabold uppercase tracking-wider">
                🚌 {n.bus.busNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${rel.cls}`}
              >
                {rel.text}
              </span>
            </div>
            <div className="truncate text-xs font-semibold text-muted-foreground/80">
              {n.route.name} · <span className="text-foreground">{n.operator.name}</span>
            </div>
          </div>
          
          <div className="shrink-0 rounded-xl bg-brand/5 border border-brand/10 p-2 text-center min-w-[75px]">
            <div className="font-mono text-sm font-black text-brand leading-none">
              {formatKm(n.distanceKm)}
            </div>
            <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
              ETA {formatSec(n.nextStopEtaSec)}
            </div>
          </div>
        </div>

        {/* Badges segment */}
        {n.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 border-t border-border/40 pt-2.5">
            {n.badges.map((b) => {
              const bd = BADGES[b];
              const Icon = bd.Icon;
              return (
                <span
                  key={b}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${bd.cls}`}
                >
                  <Icon className="h-3 w-3" aria-hidden="true" strokeWidth={2} />
                  {bd.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Metrics segment */}
        <div className="grid grid-cols-4 gap-2 text-[10px] bg-muted/40 rounded-xl p-2.5 border border-border/40">
          <Metric icon={<Gauge className="h-3.5 w-3.5" />} label={`${Math.round(n.trip.gps.speed)} km/h`} />
          <Metric icon={<Armchair className="h-3.5 w-3.5" />} label={`${n.seatAvailability} seats`} />
          <Metric icon={<Users className="h-3.5 w-3.5" />} label={`${n.occupancyPct}% crowd`} />
          <Metric
            icon={<MapPin className="h-3.5 w-3.5" />}
            label={`${formatKm(n.walkingToNearestStopKm)} walk`}
          />
        </div>

        {/* Stops segment */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/90 border-t border-border/40 pt-2.5 w-full">
          <MapPin className="h-3.5 w-3.5 text-brand shrink-0" aria-hidden />
          <div className="min-w-0 flex-1 truncate">
            <span className="text-foreground/75 font-semibold">Now:</span>{" "}
            <span className="font-bold text-foreground">
              {n.trip.currentStopId
                ? truncate(n.route.stops.find((s) => s.id === n.trip.currentStopId)?.name)
                : "—"}
            </span>
            <span className="mx-1.5 text-muted-foreground/45">→</span>
            <span className="text-foreground/75 font-semibold">Next:</span>{" "}
            <span className="font-bold text-foreground">
              {n.trip.nextStopId
                ? truncate(n.route.stops.find((s) => s.id === n.trip.nextStopId)?.name)
                : "—"}
            </span>
          </div>
        </div>
      </button>
    </li>
  );
}

function truncate(v?: string) {
  if (!v) return "—";
  return v.length > 18 ? v.slice(0, 17) + "…" : v;
}

/**
 * Group nearby results into three visual buckets so users can instantly
 * tell what to run for, what to plan for, and what already passed.
 */
function BucketedList({
  listRef,
  items,
  selectedTripId,
  onSelect,
  onHover,
}: {
  listRef: React.RefObject<HTMLUListElement | null>;
  items: DiscoveryResult[];
  selectedTripId: string | null;
  onSelect: (tripId: string) => void;
  onHover: (tripId: string, v: boolean) => void;
}) {
  const buckets: {
    key: string;
    label: string;
    hint: string;
    results: DiscoveryResult[];
    tone: string;
  }[] = [
    { key: "soon", label: "Arriving soon", hint: "≤ 10 min", results: [], tone: "text-success" },
    { key: "way", label: "On the way", hint: "10 – 30 min", results: [], tone: "text-brand" },
    {
      key: "passed",
      label: "Just passed",
      hint: "recently",
      results: [],
      tone: "text-muted-foreground",
    },
  ];

  for (const r of items) {
    const passed =
      r.relation === "crossed" || r.relation === "moving_away" || r.relation === "completed";
    const eta = r.nextStopEtaSec;
    if (passed) buckets[2].results.push(r);
    else if (eta != null && eta <= 600) buckets[0].results.push(r);
    else buckets[1].results.push(r);
  }

  return (
    <ul
      ref={listRef}
      className="max-h-[70vh] space-y-3 overflow-y-auto p-2.5"
      aria-label="Nearby buses grouped by arrival"
    >
      {buckets
        .filter((b) => b.results.length > 0)
        .map((b) => (
          <li key={b.key} className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wider">
              <span className={b.tone}>{b.label}</span>
              <span className="text-muted-foreground">
                {b.hint} · {b.results.length}
              </span>
            </div>
            <ul className="space-y-2">
              {b.results.map((n) => (
                <NearbyCard
                  key={n.trip.tripId}
                  result={n}
                  selected={selectedTripId === n.trip.tripId}
                  onSelect={() => onSelect(n.trip.tripId)}
                  onHover={(v) => onHover(n.trip.tripId, v)}
                />
              ))}
            </ul>
          </li>
        ))}
    </ul>
  );
}

function Metric({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-lg bg-muted/50 px-1.5 py-1 text-muted-foreground">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2 p-2.5" aria-label="Loading nearby buses" role="status">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/60 bg-card/50 p-3"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="skeleton-block h-3 w-24" />
            <div className="skeleton-block h-3 w-10" />
          </div>
          <div className="skeleton-block h-2 w-40" />
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="skeleton-block h-4 rounded-lg" />
            ))}
          </div>
          <div className="mt-3 skeleton-block h-2 w-3/4" />
        </div>
      ))}
    </div>
  );
}

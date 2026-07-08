import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  ArrowRight,
  CircleCheck,
  Clock,
  Compass,
  Footprints,
  Gauge,
  MapPin,
  Radar,
  Route as RouteIcon,
  Sparkles,
  Timer,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRouteIntelligence } from "@/hooks/useRouteIntelligence";
import { useUiStore } from "@/store/useUiStore";
import type {
  BusRecommendation,
  IntelligenceBadge,
  RouteSummary,
  SmartStatus,
  TransferPlan,
} from "@/types/intelligence";
import { formatKm } from "@/utils/format";

type Tab = "direct" | "transfer1" | "transfer2";

const BADGE_META: Record<IntelligenceBadge, { Icon: LucideIcon; label: string; cls: string }> = {
  best: { Icon: Trophy, label: "Best choice", cls: "bg-brand text-brand-foreground" },
  fastest: { Icon: Zap, label: "Fastest", cls: "bg-warning/15 text-warning" },
  most_seats: { Icon: Armchair, label: "Most seats", cls: "bg-brand/10 text-brand" },
  closest: { Icon: Footprints, label: "Closest walk", cls: "bg-accent text-foreground" },
  low_crowd: { Icon: Sparkles, label: "Low crowd", cls: "bg-success/15 text-success" },
};

const STATUS_META: Record<SmartStatus, { label: string; cls: string; Icon: LucideIcon }> = {
  approaching_pickup: {
    label: "Approaching pickup",
    cls: "bg-brand/10 text-brand",
    Icon: MapPin,
  },
  coming_towards: {
    label: "Coming towards you",
    cls: "bg-success/15 text-success",
    Icon: Compass,
  },
  moving_away: {
    label: "Moving away",
    cls: "bg-muted text-muted-foreground",
    Icon: ArrowRight,
  },
  already_crossed: {
    label: "Already crossed",
    cls: "bg-muted text-muted-foreground",
    Icon: X,
  },
  stopped: {
    label: "Stopped",
    cls: "bg-warning/15 text-warning",
    Icon: Clock,
  },
  delayed: {
    label: "Delayed",
    cls: "bg-warning/15 text-warning",
    Icon: Timer,
  },
  completed: {
    label: "Trip completed",
    cls: "bg-muted text-muted-foreground",
    Icon: CircleCheck,
  },
};

function formatSec(sec: number | null | undefined): string {
  if (sec == null) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function RouteResultsPanel() {
  const routeQuery = useUiStore((s) => s.routeQuery);
  const clearRouteQuery = useUiStore((s) => s.clearRouteQuery);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const focusRoute = useUiStore((s) => s.focusRoute);
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const { location } = useGeolocation();
  const result = useRouteIntelligence(location);
  const [tab, setTab] = useState<Tab>("direct");

  const availableTabs = useMemo(() => {
    if (!result) return { direct: 0, transfer1: 0, transfer2: 0 };
    return {
      direct: result.direct.length,
      transfer1: result.transfers1.length,
      transfer2: result.transfers2.length,
    };
  }, [result]);

  if (!routeQuery.active) return null;

  return (
    <AnimatePresence>
      <motion.aside
        key="route-results"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        role="region"
        aria-label="Route intelligence results"
        className="glass-panel pointer-events-auto flex w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border/60 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 p-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
              <RouteIcon className="h-3 w-3" aria-hidden />
              Smart route intelligence
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 font-display text-sm font-black tracking-tight text-foreground uppercase">
              <span className="rounded-lg bg-brand/10 text-brand px-2 py-0.5 border border-brand/20">{routeQuery.from || "Any"}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="rounded-lg bg-brand/10 text-brand px-2 py-0.5 border border-brand/20">{routeQuery.to || "Any"}</span>
            </div>
            {routeQuery.departAt && (
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden />
                Leaves{" "}
                {new Date(routeQuery.departAt).toLocaleString([], {
                  weekday: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              clearRouteQuery();
              focusRoute(null);
            }}
            aria-label="Close route results"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {!result ? null : (
          <>
            {result.summary && <SummaryStrip summary={result.summary} />}
            <Tabs tab={tab} counts={availableTabs} onChange={setTab} />

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
              {tab === "direct" && (
                <DirectList
                  items={result.direct}
                  selectedTripId={selectedTripId}
                  onSelect={(r) => {
                    selectTrip(r.trip.tripId);
                    focusRoute(r.route.id);
                    toast.success(`Tracking ${r.bus.busNumber}`, {
                      description: `${r.boardingStop.name} → ${r.alightingStop.name}`,
                      duration: 2200,
                    });
                  }}
                />
              )}
              {tab === "transfer1" && <TransferList plans={result.transfers1} />}
              {tab === "transfer2" && <TransferList plans={result.transfers2} />}

              {tab === "direct" && result.direct.length === 0 && result.isUnresolved && (
                <EmptyResult />
              )}
            </div>
          </>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

function SummaryStrip({ summary }: { summary: RouteSummary }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 border-b border-border/60 bg-muted/30 p-2.5 text-center">
      <SummaryCell Icon={RouteIcon} label="Distance" value={formatKm(summary.legDistanceKm)} />
      <SummaryCell Icon={Clock} label="Est. time" value={`${summary.estimatedMin} min`} />
      <SummaryCell
        Icon={Timer}
        label="Delay"
        value={summary.expectedDelayMin > 0 ? `+${summary.expectedDelayMin}m` : "on time"}
        tone={summary.expectedDelayMin > 5 ? "warn" : "muted"}
      />
      <SummaryCell Icon={Users} label="Occupancy" value={`${summary.avgOccupancyPct}%`} />
      <SummaryCell Icon={Gauge} label="Avg speed" value={`${summary.avgSpeedKmh} km/h`} />
      <SummaryCell Icon={MapPin} label="Stops" value={`${summary.stopsInLeg}`} />
    </div>
  );
}

function SummaryCell({
  Icon,
  label,
  value,
  tone = "muted",
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  tone?: "muted" | "warn";
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/70 px-2 py-1.5">
      <div className="flex items-center justify-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" aria-hidden />
        {label}
      </div>
      <div
        className={`mt-0.5 font-display text-[13px] font-semibold ${
          tone === "warn" ? "text-warning" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Tabs({
  tab,
  counts,
  onChange,
}: {
  tab: Tab;
  counts: { direct: number; transfer1: number; transfer2: number };
  onChange: (t: Tab) => void;
}) {
  const items: { key: Tab; label: string; count: number }[] = [
    { key: "direct", label: "Direct", count: counts.direct },
    { key: "transfer1", label: "1 Transfer", count: counts.transfer1 },
    { key: "transfer2", label: "2 Transfers", count: counts.transfer2 },
  ];
  return (
    <div className="flex items-center gap-1 border-b border-border/60 p-1.5" role="tablist">
      {items.map((it) => {
        const active = tab === it.key;
        const disabled = it.count === 0 && !active;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(it.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${
              active
                ? "bg-brand text-brand-foreground shadow-sm"
                : disabled
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {it.label}
            <span
              className={`rounded-full px-1.5 py-px text-[9px] font-bold ${
                active
                  ? "bg-brand-foreground/20 text-brand-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {it.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DirectList({
  items,
  selectedTripId,
  onSelect,
}: {
  items: BusRecommendation[];
  selectedTripId: string | null;
  onSelect: (r: BusRecommendation) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="grid place-items-center py-8 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <Radar className="h-5 w-5" aria-hidden />
        </div>
        <div className="mt-2 font-display text-sm font-semibold">Searching direct buses…</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          Live positions update every second.
        </div>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((r) => (
        <RecommendationCard
          key={r.trip.tripId}
          rec={r}
          selected={selectedTripId === r.trip.tripId}
          onSelect={() => onSelect(r)}
        />
      ))}
    </ul>
  );
}

function RecommendationCard({
  rec,
  selected,
  onSelect,
}: {
  rec: BusRecommendation;
  selected: boolean;
  onSelect: () => void;
}) {
  const status = STATUS_META[rec.status];
  const StatusIcon = status.Icon;
  const muted = rec.status === "already_crossed" || rec.status === "completed";
  const progress = Math.round(rec.trip.routeProgress * 100);
  return (
    <li>
      <button
        onClick={onSelect}
        aria-pressed={selected}
        className={`group w-full rounded-2xl border p-3.5 text-left transition-all flex flex-col gap-3 ${
          selected
            ? "border-brand bg-brand/10 shadow-md ring-2 ring-brand/10"
            : muted
              ? "border-border/40 bg-card/40 opacity-60 hover:opacity-100"
              : "border-border/60 bg-card/80 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
        }`}
      >
        {/* Header segment */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-lg border border-brand/20 text-xs font-mono font-extrabold uppercase tracking-wider">
                📋 {rec.bus.busNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${status.cls}`}
              >
                <StatusIcon className="h-3 w-3" aria-hidden />
                {status.label}
              </span>
            </div>
            <div className="truncate text-xs font-semibold text-muted-foreground/80">
              {rec.operator.name} · <span className="text-foreground">{rec.route.name}</span>
            </div>
          </div>
          
          <div className="shrink-0 rounded-xl bg-brand/5 border border-brand/10 p-2 text-center min-w-[75px]">
            <div className="font-mono text-sm font-black text-brand leading-none">
              {formatSec(rec.etaToBoardingSec)}
            </div>
            <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider mt-1">pickup</div>
          </div>
        </div>

        {/* Badges segment */}
        {rec.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 border-t border-border/40 pt-2.5">
            {rec.badges.map((b) => {
              const meta = BADGE_META[b];
              const Icon = meta.Icon;
              return (
                <span
                  key={b}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${meta.cls}`}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Metrics segment */}
        <div className="grid grid-cols-4 gap-2 text-[10px] bg-muted/40 rounded-xl p-2.5 border border-border/40">
          <Metric
            Icon={Footprints}
            label={`${formatKm(rec.walkingKm)} (${rec.walkingMin}m)`}
            tone={rec.walkingKm > 1.5 ? "warn" : "default"}
          />
          <Metric
            Icon={Armchair}
            label={`${rec.seatsAvailable} seats`}
            tone={rec.seatsAvailable === 0 ? "warn" : "default"}
          />
          <Metric Icon={Users} label={`${rec.occupancyPct}% crowd`} />
          <Metric Icon={Gauge} label={`${Math.round(rec.trip.gps.speed)} km/h`} />
        </div>

        {/* Progress & stops segment */}
        <div className="space-y-2 w-full pt-1">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/90">
            <MapPin className="h-3.5 w-3.5 text-brand shrink-0" aria-hidden />
            <div className="min-w-0 flex-1 truncate">
              <span className="font-bold text-foreground">{rec.boardingStop.name}</span>
              <span className="mx-1 text-muted-foreground/45">→</span>
              <span className="font-bold text-foreground">{rec.alightingStop.name}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="relative h-2 overflow-hidden rounded-full bg-muted border border-border/30">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
                aria-label={`Trip progress ${progress}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              <span>{formatKm(rec.distanceFromUserKm)} away</span>
              <span className="text-brand">{progress}% traveled</span>
            </div>
          </div>
        </div>

        {rec.catchable && !muted && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-success/15 border border-success/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-success">
            <CircleCheck className="h-3 w-3" aria-hidden /> You can catch this bus
          </div>
        )}
      </button>
    </li>
  );
}

function Metric({
  Icon,
  label,
  tone = "default",
}: {
  Icon: LucideIcon;
  label: string;
  tone?: "default" | "warn";
}) {
  return (
    <div
      className={`flex items-center justify-center gap-1 rounded-lg px-1.5 py-1 ${
        tone === "warn" ? "bg-warning/10 text-warning" : "bg-muted/50 text-muted-foreground"
      }`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      <span className="truncate">{label}</span>
    </div>
  );
}

function TransferList({ plans }: { plans: TransferPlan[] }) {
  if (plans.length === 0) {
    return (
      <div className="grid place-items-center py-8 text-center text-[11px] text-muted-foreground">
        No transfer options found for this query.
      </div>
    );
  }
  return (
    <ul className="space-y-2.5">
      {plans.map((p) => (
        <li key={p.id} className="rounded-2xl border border-border/60 bg-card/70 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {p.legs.length === 2 ? "1 Transfer" : "2 Transfers"}
            </div>
            <div className="text-[11px] font-semibold">
              ~{p.totalEstimatedMin} min · {formatKm(p.totalLegDistanceKm)}
            </div>
          </div>
          <ol className="space-y-2">
            {p.legs.map((leg, i) => (
              <li key={i}>
                <div className="rounded-xl border border-border/50 bg-background/50 p-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                    Leg {i + 1}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12px]">
                    <span className="truncate font-semibold">{leg.boardingStop.name}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate font-semibold">{leg.alightingStop.name}</span>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    on {leg.route.name}
                  </div>
                </div>
                {i < p.legs.length - 1 && (
                  <div className="my-1 flex items-center gap-2 pl-2 text-[10px] text-muted-foreground">
                    <div className="h-4 w-px bg-border" />
                    <span>
                      Transfer at <b className="text-foreground">{p.transferStops[i].name}</b>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
  );
}

function EmptyResult() {
  return (
    <div className="grid place-items-center py-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Radar className="h-5 w-5" aria-hidden />
      </div>
      <div className="mt-2 font-display text-sm font-semibold">No matching route</div>
      <div className="mt-1 max-w-[240px] text-[11px] text-muted-foreground">
        Try nearby city names, swap From/To, or clear the search to browse the live radar.
      </div>
    </div>
  );
}

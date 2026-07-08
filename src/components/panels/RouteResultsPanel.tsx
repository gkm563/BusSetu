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
  Bus,
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
  best: { Icon: Trophy, label: "Best choice", cls: "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent" },
  fastest: { Icon: Zap, label: "Fastest", cls: "bg-gradient-to-r from-rose-400 to-pink-500 text-white border-transparent" },
  most_seats: { Icon: Armchair, label: "Most seats", cls: "bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-transparent" },
  closest: { Icon: Footprints, label: "Closest walk", cls: "bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white border-transparent" },
  low_crowd: { Icon: Sparkles, label: "Low crowd", cls: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-transparent" },
};

const STATUS_META: Record<SmartStatus, { label: string; cls: string; Icon: LucideIcon }> = {
  approaching_pickup: {
    label: "Approaching pickup",
    cls: "bg-blue-100 text-blue-700 border-blue-200",
    Icon: MapPin,
  },
  coming_towards: {
    label: "Coming towards you",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Icon: Compass,
  },
  moving_away: {
    label: "Moving away",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
    Icon: ArrowRight,
  },
  already_crossed: {
    label: "Already crossed",
    cls: "bg-slate-100 text-slate-500 border-slate-200",
    Icon: X,
  },
  stopped: {
    label: "Stopped",
    cls: "bg-amber-100 text-amber-700 border-amber-200",
    Icon: Clock,
  },
  delayed: {
    label: "Delayed",
    cls: "bg-rose-100 text-rose-700 border-rose-200",
    Icon: Timer,
  },
  completed: {
    label: "Trip completed",
    cls: "bg-slate-100 text-slate-500 border-slate-200",
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
        className="bg-background pointer-events-auto flex max-h-[calc(100vh-8rem)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border shadow-2xl"
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
            {/* Removed Leaves info */}
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

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
              <DirectList
                items={[...result.direct].sort((a, b) => {
                  const getGroup = (rec: BusRecommendation) => {
                    if (rec.status === "completed" || rec.trip.routeProgress >= 1.0) return 3;
                    
                    // Calculate user reference progress based on closest stop
                    let userStopIndex = rec.boardingStopIndex;
                    if (location) {
                      let minDistance = Infinity;
                      rec.route.stops.forEach((stop, idx) => {
                        const d = Math.sqrt(Math.pow(stop.lat - location.lat, 2) + Math.pow(stop.lng - location.lng, 2));
                        if (d < minDistance) {
                          minDistance = d;
                          userStopIndex = idx;
                        }
                      });
                    }
                    const userProgress = rec.route.stops.length <= 1 ? 0 : userStopIndex / (rec.route.stops.length - 1);
                    
                    const isPast = rec.status === "already_crossed" || rec.status === "moving_away" || rec.trip.routeProgress > userProgress + 0.02;
                    if (isPast) return 2;
                    
                    return 1;
                  };
                  
                  const groupA = getGroup(a);
                  const groupB = getGroup(b);
                  
                  if (groupA !== groupB) return groupA - groupB;
                  
                  return a.trip.routeProgress - b.trip.routeProgress;
                })}
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

              {result.direct.length === 0 && result.isUnresolved && (
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
    <div className="grid grid-cols-2 gap-2 border-b border-border/60 bg-muted/30 p-2.5 text-center">
      <SummaryCell Icon={RouteIcon} label="Distance" value={formatKm(summary.legDistanceKm)} />
      <SummaryCell Icon={Clock} label="Est. time" value={`${summary.estimatedMin} min`} />
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
  const muted = rec.status === "already_crossed" || rec.status === "completed";
  const progress = Math.round(rec.trip.routeProgress * 100);
  const totalStops = rec.route.stops.length;
  const originName = rec.route.stops[0]?.name || "Origin";
  const destName = rec.route.stops[totalStops - 1]?.name || "Destination";

  const getStatusDetails = (status: typeof rec.status) => {
    if (rec.trip.status === "scheduled" || (rec.trip.routeProgress === 0 && rec.trip.status === "boarding")) {
      return {
        label: "Not Started Yet",
        cls: "bg-slate-500 text-white border-transparent",
      };
    }

    switch (status) {
      case "approaching_pickup":
        return {
          label: "Arriving Soon",
          cls: "bg-blue-600 text-white border-transparent",
        };
      case "coming_towards":
        return {
          label: "Coming Towards You",
          cls: "bg-emerald-600 text-white border-transparent",
        };
      case "already_crossed":
      case "moving_away":
        return {
          label: "Crossed You",
          cls: "bg-rose-600 text-white border-transparent", // high contrast red
        };
      case "stopped":
        return {
          label: "Stopped",
          cls: "bg-amber-600 text-white border-transparent",
        };
      case "delayed":
        return {
          label: "Delayed",
          cls: "bg-rose-700 text-white border-transparent",
        };
      case "completed":
        return {
          label: "Reached Destination",
          cls: "bg-slate-600 text-white border-transparent",
        };
      default:
        return {
          label: "En Route",
          cls: "bg-indigo-600 text-white border-transparent",
        };
    }
  };

  const statusInfo = getStatusDetails(rec.status);
  
  const departureTime = new Date(rec.trip.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const arrivalTime = new Date(rec.trip.scheduledEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fare = rec.bus.busType === "ac" || rec.bus.busType === "sleeper" ? 350 : 180;

  return (
    <li>
      <button
        onClick={onSelect}
        aria-pressed={selected}
        className={`group relative w-full overflow-hidden rounded-3xl border-2 p-5 text-left transition-all duration-300 flex flex-col gap-4 ${
          selected
            ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-2xl ring-2 ring-emerald-200 scale-[1.02]"
            : muted
              ? "border-slate-200 bg-slate-50/70 opacity-80 hover:opacity-100"
              : "border-slate-200 bg-white shadow-lg hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl"
        }`}
      >
        {selected && (
           <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-emerald-500 to-teal-400" />
        )}

        {/* Header Section */}
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-3 rounded-2xl shadow-md transform group-hover:scale-110 transition-transform">
              <Bus className="w-6 h-6" />
            </span>
            <div className="space-y-0.5">
               <div className="text-xl font-black text-slate-800 tracking-tight">
                 {rec.bus.busNumber}
               </div>
               <div className="text-[13px] font-bold text-slate-500 flex items-center gap-1">
                 🏢 {rec.operator.name}
               </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${statusInfo.cls}`}>
                {statusInfo.label}
             </span>
             <span className="text-[14px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-sm">
               {progress}% Live
             </span>
          </div>
        </div>

        {/* Progress Bar & Stations */}
        <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-inner flex flex-col gap-3">
          <div className="flex items-start justify-between text-xs font-bold text-slate-700 gap-4">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Origin</span>
              <span className="truncate text-[13px] font-black text-slate-800">🏁 {originName}</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{departureTime}</span>
            </div>
            
            <div className="flex items-center justify-center pt-3 text-slate-300 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="flex flex-col min-w-0 flex-1 text-right">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Destination</span>
              <span className="truncate text-[13px] font-black text-slate-800">{destName} 📍</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{arrivalTime}</span>
            </div>
          </div>

          <div className="relative pt-1">
            <div className="relative h-3 overflow-hidden rounded-full bg-slate-200 shadow-inner border border-slate-300/60">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 animate-ping rounded-full" />
                <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Details - Seats and Fare */}
        <div className="flex items-center justify-between w-full border-t border-slate-100 pt-3">
          <span className="text-[13px] text-slate-600 font-extrabold flex items-center gap-1.5">
            <span className="text-lg">💺</span> {rec.seatsAvailable} Seats Left <span className="text-slate-300">|</span> <span className="text-slate-400 text-[12px] font-medium">Total {rec.bus.totalSeats}</span>
          </span>
          <span className="text-violet-700 bg-violet-50 border-2 border-violet-200 px-3 py-1 rounded-xl text-xs font-black shadow-sm tracking-wide">
            Ticket: ₹{fare}
          </span>
        </div>
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
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl p-1.5 transition-colors ${
        tone === "warn" ? "bg-warning/10 text-warning border border-warning/20" : "bg-card/40 text-muted-foreground border border-border/40 hover:bg-muted/80"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">{label}</span>
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

import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Activity,
  ArrowRight,
  BatteryCharging,
  Bus as BusIcon,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleCheck,
  Clock,
  Compass,
  Crown,
  Footprints,
  Gauge,
  Heart,
  Landmark,
  MapPin,
  Radio,
  Rocket,
  Route as RouteIcon,
  Share2,
  Signal,
  Snowflake,
  Sparkles,
  Ticket,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { useLiveBus } from "@/hooks/useLiveBus";
import { useLiveStore } from "@/store/useLiveStore";
import type { LiveBusView } from "@/types/view";
import type { BusAmenity } from "@/types/bus";
import { occupancyLabel, occupancyLevel, occupancyRatio } from "@/utils/occupancy";
import { formatEta, formatKm, formatRelative } from "@/utils/format";
import { CatchThisBusCard } from "./CatchThisBusCard";

const FAV_KEY = "bussetu.favoriteTrips";

function useFavorite(tripId: string | null) {
  const [set, setSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAV_KEY);
      if (raw) setSet(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);
  const isFav = tripId ? set.has(tripId) : false;
  const toggle = () => {
    if (!tripId) return;
    const next = new Set(set);
    if (next.has(tripId)) next.delete(tripId);
    else next.add(tripId);
    setSet(next);
    try {
      window.localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };
  return { isFav, toggle };
}

export function BusDetailsPanel() {
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const openTimeline = useUiStore((s) => s.openTimeline);
  const focusRoute = useUiStore((s) => s.focusRoute);
  const focusedRouteId = useUiStore((s) => s.focusedRouteId);
  const view = useLiveBus(selectedTripId);
  const stopsById = useLiveStore((s) => s.stopsById);
  const fav = useFavorite(selectedTripId);

  return (
    <AnimatePresence>
      {view && (
        <motion.aside
          key={selectedTripId ?? "none"}
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 32, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          role="dialog"
          aria-label={`Bus ${view.bus.busNumber} details`}
          className="glass-panel pointer-events-auto absolute bottom-4 right-4 z-[600] flex max-h-[calc(100vh-6rem)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border/60 shadow-2xl md:bottom-auto md:top-4 md:right-20"
        >
          <PanelBody
            view={view}
            currentStopName={
              view.trip.currentStopId ? stopsById[view.trip.currentStopId]?.name : undefined
            }
            nextStopName={view.trip.nextStopId ? stopsById[view.trip.nextStopId]?.name : undefined}
            nextStopEta={view.trip.nextStopId ? view.trip.eta[view.trip.nextStopId] : undefined}
            onClose={() => selectTrip(null)}
            onTrackRoute={() => focusRoute(focusedRouteId === view.route.id ? null : view.route.id)}
            onOpenTimeline={openTimeline}
            routeFocused={focusedRouteId === view.route.id}
            fav={fav}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
 *  PANEL BODY
 * ============================================================ */

function PanelBody({
  view,
  currentStopName,
  nextStopName,
  nextStopEta,
  onClose,
  onTrackRoute,
  onOpenTimeline,
  routeFocused,
  fav,
}: {
  view: LiveBusView;
  currentStopName?: string;
  nextStopName?: string;
  nextStopEta?: string;
  onClose: () => void;
  onTrackRoute: () => void;
  onOpenTimeline: () => void;
  routeFocused: boolean;
  fav: { isFav: boolean; toggle: () => void };
}) {
  const { trip, bus, route } = view;
  const speedHistory = useSampleHistory(trip.speed, trip.lastUpdated, 30);
  const occHistory = useSampleHistory(
    Math.round(occupancyRatio(trip, bus) * 100),
    trip.lastUpdated,
    30,
  );
  const distanceCoveredKm = route.distanceKm * trip.routeProgress;
  const distanceRemainingKm = Math.max(0, route.distanceKm - distanceCoveredKm);
  const avgSpeed = useMemo(
    () =>
      speedHistory.length
        ? Math.round(speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length)
        : Math.round(trip.speed),
    [speedHistory, trip.speed],
  );

  return (
    <>
      <StickyHeader view={view} onClose={onClose} fav={fav} />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <LiveStatusStrip
          trip={trip}
          currentStopName={currentStopName}
          nextStopName={nextStopName}
          nextStopEta={nextStopEta}
        />

        <SmartInsights view={view} nextStopEta={nextStopEta} avgSpeed={avgSpeed} />

        {/* Primary actions & seat availability sit above the fold —
         *  users decide "can I catch it?" before reading analytics. */}
        <SeatInformationCard view={view} />

        <CatchThisBusCard />

        <LiveLocationMap view={view} />

        <TripInformationCard
          view={view}
          distanceCoveredKm={distanceCoveredKm}
          distanceRemainingKm={distanceRemainingKm}
        />

        <CompactTimeline view={view} onExpand={onOpenTimeline} />

        <FeatureBadges view={view} />

        {/* Analytics sink to the bottom — nice to see, rarely decisive. */}
        <LiveAnalyticsCard
          view={view}
          speedHistory={speedHistory}
          occHistory={occHistory}
          avgSpeed={avgSpeed}
          distanceCoveredKm={distanceCoveredKm}
        />

        <div className="pt-1 text-center text-[11px] text-muted-foreground">
          <Signal className="mr-1 inline h-3 w-3 text-success" />
          Live · updated {formatRelative(trip.lastUpdated)}
        </div>
      </div>

      <ActionsBar
        routeFocused={routeFocused}
        onTrackRoute={onTrackRoute}
        onCatchNearby={onOpenTimeline}
        onShare={() => shareTrip(view)}
      />
    </>
  );
}

/* ============================================================
 *  HEADER
 * ============================================================ */

const STATUS_STYLES: Record<string, { cls: string; icon: LucideIcon; label: string }> = {
  scheduled: { cls: "bg-muted text-muted-foreground", icon: Clock, label: "Scheduled" },
  boarding: { cls: "bg-warning/15 text-warning", icon: Users, label: "Boarding" },
  running: { cls: "bg-success/15 text-success", icon: Activity, label: "Running" },
  delayed: { cls: "bg-warning/15 text-warning", icon: Timer, label: "Delayed" },
  breakdown: { cls: "bg-danger/15 text-danger", icon: X, label: "Breakdown" },
  completed: { cls: "bg-muted text-muted-foreground", icon: CircleCheck, label: "Completed" },
};

function StickyHeader({
  view,
  onClose,
  fav,
}: {
  view: LiveBusView;
  onClose: () => void;
  fav: { isFav: boolean; toggle: () => void };
}) {
  const { trip, bus, operator } = view;
  const status = STATUS_STYLES[trip.status] ?? STATUS_STYLES.running;
  const StatusIcon = status.icon;
  const KindIcon = operator.kind === "government" ? Landmark : BusIcon;

  return (
    <div className="sticky top-0 z-10 border-b border-border/60 bg-card/85 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand/70 text-brand-foreground shadow-lg">
            <BusIcon className="h-5 w-5" strokeWidth={2.2} />
            <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border-2 border-card bg-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="truncate font-display text-lg font-bold leading-tight">
                {bus.busNumber}
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${status.cls}`}
              >
                <StatusIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
                {status.label}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <span className="truncate font-medium text-foreground/80">{operator.name}</span>
              <span>·</span>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                  operator.kind === "government"
                    ? "bg-brand/10 text-brand"
                    : "bg-accent text-foreground/70"
                }`}
              >
                <KindIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
                {operator.kind}
              </span>
              {bus.busType && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {bus.busType}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            label={fav.isFav ? "Remove favorite" : "Add favorite"}
            onClick={fav.toggle}
            active={fav.isFav}
          >
            <Heart className={`h-4 w-4 ${fav.isFav ? "fill-danger text-danger" : ""}`} />
          </IconButton>
          <IconButton label="Share bus" onClick={() => shareTrip(view)}>
            <Share2 className="h-4 w-4" />
          </IconButton>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
        active
          ? "border-danger/40 bg-danger/10 text-danger"
          : "border-border/60 bg-card/70 text-muted-foreground hover:border-brand/40 hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================
 *  LIVE STATUS STRIP
 * ============================================================ */

function LiveStatusStrip({
  trip,
  currentStopName,
  nextStopName,
  nextStopEta,
}: {
  trip: LiveBusView["trip"];
  currentStopName?: string;
  nextStopName?: string;
  nextStopEta?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-3">
      <div className="grid grid-cols-3 gap-3">
        <SpeedTile speed={trip.speed} />
        <CompassTile heading={trip.heading} />
        <GpsTile accuracy={trip.gpsAccuracy} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <StopChip
          icon={<MapPin className="h-3 w-3" strokeWidth={2.5} />}
          label="Current"
          name={currentStopName ?? "In transit"}
        />
        <StopChip
          icon={<ArrowRight className="h-3 w-3" strokeWidth={2.5} />}
          label="Next"
          name={nextStopName ?? "—"}
          hint={nextStopEta ? `ETA ${formatEta(nextStopEta)}` : undefined}
          accent
        />
      </div>
    </div>
  );
}

function SpeedTile({ speed }: { speed: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Gauge className="h-3 w-3" strokeWidth={2.5} />
        Speed
      </div>
      <div className="font-display text-xl font-bold leading-none">{Math.round(speed)}</div>
      <div className="text-[10px] font-medium text-muted-foreground">km/h</div>
    </div>
  );
}

function CompassTile({ heading }: { heading: number }) {
  const label = compassLabel(heading);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Compass className="h-3 w-3" strokeWidth={2.5} />
        Heading
      </div>
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border border-border/70" />
        <div className="absolute inset-0" style={{ transform: `rotate(${heading}deg)` }}>
          <div className="absolute left-1/2 top-0.5 -translate-x-1/2 border-x-[4px] border-b-[7px] border-x-transparent border-b-brand" />
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-muted-foreground/60" />
        </div>
      </div>
      <div className="text-[10px] font-semibold text-foreground">{label}</div>
    </div>
  );
}

function GpsTile({ accuracy }: { accuracy: number }) {
  const quality =
    accuracy < 5
      ? { text: "Excellent", cls: "text-success" }
      : accuracy < 15
        ? { text: "Good", cls: "text-success" }
        : accuracy < 40
          ? { text: "Fair", cls: "text-warning" }
          : { text: "Weak", cls: "text-danger" };
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Radio className="h-3 w-3" strokeWidth={2.5} />
        GPS
      </div>
      <div className="font-display text-xl font-bold leading-none">
        ±{accuracy.toFixed(0)}
        <span className="text-[10px] font-medium text-muted-foreground"> m</span>
      </div>
      <div className={`text-[10px] font-semibold ${quality.cls}`}>{quality.text}</div>
    </div>
  );
}

function StopChip({
  icon,
  label,
  name,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border px-2.5 py-2 ${
        accent ? "border-brand/30 bg-brand/5" : "border-border/60 bg-card/60"
      }`}
    >
      <div
        className={`flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider ${
          accent ? "text-brand" : "text-muted-foreground"
        }`}
      >
        {icon}
        {label}
      </div>
      <div className="mt-0.5 truncate text-xs font-semibold">{name}</div>
      {hint && <div className="text-[10px] font-medium text-brand">{hint}</div>}
    </div>
  );
}

/* ============================================================
 *  SMART INSIGHTS
 * ============================================================ */

type Insight = {
  id: string;
  tone: "success" | "warning" | "brand" | "muted" | "danger";
  icon: LucideIcon;
  title: string;
  detail?: string;
};

function computeInsights(
  view: LiveBusView,
  nextStopEta: string | undefined,
  avgSpeed: number,
): Insight[] {
  const { trip, bus } = view;
  const ratio = occupancyRatio(trip, bus);
  const insights: Insight[] = [];

  if (nextStopEta) {
    const sec = Math.round((new Date(nextStopEta).getTime() - Date.now()) / 1000);
    if (sec > 0 && sec < 120) {
      insights.push({
        id: "approach",
        tone: "brand",
        icon: MapPin,
        title: "Approaching next stop",
        detail: `Arriving in about ${sec < 60 ? `${sec}s` : "1 min"}`,
      });
    }
  }

  if (ratio >= 0.85 && trip.vacantSeats > 0) {
    insights.push({
      id: "filling",
      tone: "warning",
      icon: TrendingUp,
      title: "Seats are filling fast",
      detail: `Only ${trip.vacantSeats} seat${trip.vacantSeats === 1 ? "" : "s"} left`,
    });
  } else if (ratio < 0.4) {
    insights.push({
      id: "low-occ",
      tone: "success",
      icon: TrendingDown,
      title: "Low occupancy — likely a seat",
      detail: `${trip.vacantSeats} of ${bus.totalSeats} seats free`,
    });
  }

  if (typeof trip.delay === "number" && trip.delay >= 3) {
    insights.push({
      id: "delay",
      tone: "warning",
      icon: Timer,
      title: `Running about ${trip.delay} min late`,
      detail: "ETAs are adjusted for the current delay.",
    });
  } else if (typeof trip.delay === "number" && trip.delay <= -2) {
    insights.push({
      id: "early",
      tone: "success",
      icon: Timer,
      title: `Running ${Math.abs(trip.delay)} min early`,
    });
  }

  if (trip.status === "running" && trip.speed < 5) {
    insights.push({
      id: "slow",
      tone: "muted",
      icon: Activity,
      title: "Currently very slow",
      detail: "Likely a stop, signal, or heavy traffic.",
    });
  }

  if (ratio < 0.9 && trip.vacantSeats > 0 && trip.status === "running" && avgSpeed > 12) {
    insights.push({
      id: "recommend",
      tone: "brand",
      icon: Sparkles,
      title: "Recommended to board",
      detail: "Seats available and moving on schedule.",
    });
  }

  return insights.slice(0, 3);
}

const TONE_CLS: Record<Insight["tone"], string> = {
  success: "border-success/30 bg-success/5 text-success",
  warning: "border-warning/30 bg-warning/5 text-warning",
  brand: "border-brand/30 bg-brand/5 text-brand",
  muted: "border-border/60 bg-muted/40 text-muted-foreground",
  danger: "border-danger/30 bg-danger/5 text-danger",
};

function SmartInsights({
  view,
  nextStopEta,
  avgSpeed,
}: {
  view: LiveBusView;
  nextStopEta?: string;
  avgSpeed: number;
}) {
  const insights = useMemo(
    () => computeInsights(view, nextStopEta, avgSpeed),
    [view, nextStopEta, avgSpeed],
  );
  if (insights.length === 0) return null;
  return (
    <section aria-label="Smart insights" className="space-y-1.5">
      <SectionLabel icon={Sparkles}>Smart insights</SectionLabel>
      <div className="space-y-1.5">
        {insights.map((i) => {
          const Icon = i.icon;
          return (
            <motion.div
              key={i.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2 rounded-xl border px-2.5 py-2 ${TONE_CLS[i.tone]}`}
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold leading-tight text-foreground">{i.title}</div>
                {i.detail && (
                  <div className="text-[11px] leading-snug text-muted-foreground">{i.detail}</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
 *  LIVE LOCATION MINI-MAP (SVG based)
 * ============================================================ */

function LiveLocationMap({ view }: { view: LiveBusView }) {
  const { route, trip } = view;
  const pts = route.polyline.length
    ? route.polyline
    : route.stops.map((s) => [s.lat, s.lng] as [number, number]);
  const bounds = useMemo(() => {
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    for (const [lat, lng] of pts) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    return { minLat, maxLat, minLng, maxLng };
  }, [pts]);

  const W = 380;
  const H = 130;
  const pad = 12;
  const dLat = Math.max(0.0001, bounds.maxLat - bounds.minLat);
  const dLng = Math.max(0.0001, bounds.maxLng - bounds.minLng);
  const project = (lat: number, lng: number) => {
    const x = pad + ((lng - bounds.minLng) / dLng) * (W - pad * 2);
    const y = pad + (1 - (lat - bounds.minLat) / dLat) * (H - pad * 2);
    return [x, y] as const;
  };

  const progress = Math.max(0, Math.min(1, trip.routeProgress));
  const splitIdx = Math.floor(progress * (pts.length - 1));
  const done = pts.slice(0, splitIdx + 1);
  const upcoming = pts.slice(splitIdx);

  const path = (arr: [number, number][]) =>
    arr
      .map(([lat, lng], i) => {
        const [x, y] = project(lat, lng);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const [bx, by] = project(trip.latitude, trip.longitude);
  const [ox, oy] = project(pts[0][0], pts[0][1]);
  const [dx, dy] = project(pts[pts.length - 1][0], pts[pts.length - 1][1]);

  return (
    <section aria-label="Live location" className="space-y-1.5">
      <SectionLabel icon={MapPin}>Live location</SectionLabel>
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-muted/10">
        {/* faint grid */}
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="block h-[130px] w-full"
          aria-hidden="true"
        >
          <defs>
            <pattern id="mm-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeOpacity="0.08" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#mm-grid)" className="text-foreground" />

          {/* previous route (faded) */}
          <path
            d={path(done)}
            fill="none"
            className="stroke-brand/70"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* upcoming route (dashed) */}
          <path
            d={path(upcoming)}
            fill="none"
            className="stroke-brand/40"
            strokeWidth={2}
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* origin */}
          <circle cx={ox} cy={oy} r={4} className="fill-success" />
          <circle cx={ox} cy={oy} r={7} className="fill-success/20" />
          {/* destination */}
          <circle cx={dx} cy={dy} r={4} className="fill-danger" />
          <circle cx={dx} cy={dy} r={7} className="fill-danger/20" />

          {/* current bus with pulse */}
          <circle cx={bx} cy={by} r={9} className="fill-brand/25">
            <animate attributeName="r" values="7;14;7" dur="1.8s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={bx} cy={by} r={5} className="fill-brand stroke-card" strokeWidth={2} />
        </svg>

        {/* legend */}
        <div className="pointer-events-none absolute bottom-1.5 left-1.5 flex gap-2 rounded-full bg-card/85 px-2 py-0.5 text-[9px] font-medium text-muted-foreground backdrop-blur">
          <LegendDot cls="bg-success" label="Origin" />
          <LegendDot cls="bg-brand" label="Bus" />
          <LegendDot cls="bg-danger" label="Destination" />
        </div>
      </div>
    </section>
  );
}

function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${cls}`} />
      {label}
    </span>
  );
}

/* ============================================================
 *  TRIP INFORMATION
 * ============================================================ */

function TripInformationCard({
  view,
  distanceCoveredKm,
  distanceRemainingKm,
}: {
  view: LiveBusView;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
}) {
  const { trip, route } = view;
  const origin = route.origin ?? route.stops[0]?.name ?? "—";
  const destination = route.destination ?? route.stops[route.stops.length - 1]?.name ?? "—";
  const pct = Math.round(trip.routeProgress * 100);
  const depIso = trip.startTime ?? trip.scheduledStart;
  const arrIso = trip.expectedArrival ?? trip.scheduledEnd;

  return (
    <section aria-label="Trip information" className="space-y-1.5">
      <SectionLabel icon={RouteIcon}>Trip</SectionLabel>
      <div className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="truncate text-sm font-semibold">{origin}</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 items-center justify-end gap-2 truncate">
            <span className="truncate text-right text-sm font-semibold">{destination}</span>
            <span className="h-2 w-2 rounded-full bg-danger" />
          </div>
        </div>

        <div>
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand/70"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
            <span>{formatKm(distanceCoveredKm)} covered</span>
            <span className="font-semibold text-brand">{pct}%</span>
            <span>{formatKm(distanceRemainingKm)} left</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <TimeStat icon={Clock} label="Departure" value={formatTimeOnly(depIso)} />
          <TimeStat icon={Clock} label="Arrival" value={formatTimeOnly(arrIso)} accent />
          <TimeStat
            icon={Timer}
            label="Delay"
            value={
              typeof trip.delay === "number"
                ? `${trip.delay > 0 ? "+" : ""}${trip.delay}m`
                : "On time"
            }
            tone={
              typeof trip.delay === "number"
                ? trip.delay > 2
                  ? "warning"
                  : trip.delay < -1
                    ? "success"
                    : "muted"
                : "success"
            }
          />
        </div>
      </div>
    </section>
  );
}

function TimeStat({
  icon: Icon,
  label,
  value,
  accent,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
  tone?: "success" | "warning" | "muted";
}) {
  const toneCls =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : tone === "muted"
          ? "text-muted-foreground"
          : accent
            ? "text-brand"
            : "text-foreground";
  return (
    <div className="rounded-xl bg-muted/40 px-2 py-1.5">
      <div className="flex items-center justify-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
        {label}
      </div>
      <div className={`mt-0.5 font-display text-sm font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}

function formatTimeOnly(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ============================================================
 *  SEAT INFORMATION with circular progress
 * ============================================================ */

function SeatInformationCard({ view }: { view: LiveBusView }) {
  const { trip, bus } = view;
  const level = occupancyLevel(trip, bus);
  const ratio = Math.min(1, occupancyRatio(trip, bus));
  const pct = Math.round(ratio * 100);
  const totalOnboard = trip.occupiedSeats + trip.standingPassengers;
  const women = bus.womenSeats ?? 0;
  const colorVar = `var(--color-occ-${level === "packed" ? "packed" : level})`;

  return (
    <section aria-label="Seat information" className="space-y-1.5">
      <SectionLabel icon={Users}>Seats & occupancy</SectionLabel>
      <div className="rounded-2xl border border-border/60 bg-card/70 p-3">
        <div className="flex items-center gap-3">
          <CircularProgress
            value={pct}
            color={colorVar}
            centerLabel={`${pct}%`}
            sublabel={occupancyLabel(level)}
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SeatRow icon={Circle} label="Total seats" value={bus.totalSeats} />
            <SeatRow icon={CircleCheck} label="Available" value={trip.vacantSeats} tone="success" />
            <SeatRow icon={Users} label="Occupied" value={trip.occupiedSeats} />
            {trip.standingPassengers > 0 && (
              <SeatRow
                icon={Footprints}
                label="Standing"
                value={trip.standingPassengers}
                tone="warning"
              />
            )}
            {women > 0 && (
              <SeatRow icon={Sparkles} label="Women reserved" value={women} tone="brand" />
            )}
          </div>
        </div>
        <div className="mt-3 text-center text-[10px] text-muted-foreground">
          {totalOnboard} onboard · capacity {bus.totalSeats + (bus.standingCapacity ?? 0)}
        </div>
      </div>
    </section>
  );
}

function SeatRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: "success" | "warning" | "brand";
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "brand"
          ? "text-brand"
          : "text-foreground";
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={2.4} />
        {label}
      </span>
      <span className={`font-display font-bold ${toneCls}`}>{value}</span>
    </div>
  );
}

function CircularProgress({
  value,
  color,
  centerLabel,
  sublabel,
  size = 88,
  stroke = 8,
}: {
  value: number;
  color: string;
  centerLabel: string;
  sublabel?: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", damping: 24, stiffness: 140 }}
          style={{ stroke: color }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-lg font-bold leading-none">{centerLabel}</div>
        {sublabel && (
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 *  FEATURE BADGES
 * ============================================================ */

const AMENITY_ICONS: Record<BusAmenity, { icon: LucideIcon; label: string; cls: string }> = {
  ac: { icon: Snowflake, label: "AC", cls: "border-brand/30 bg-brand/5 text-brand" },
  electric: { icon: Zap, label: "Electric", cls: "border-success/30 bg-success/5 text-success" },
  luxury: { icon: Crown, label: "Luxury", cls: "border-warning/30 bg-warning/5 text-warning" },
  mini: { icon: BusIcon, label: "Mini", cls: "border-border/60 bg-muted/50 text-muted-foreground" },
  women_friendly: {
    icon: Sparkles,
    label: "Women friendly",
    cls: "border-brand/30 bg-brand/5 text-brand",
  },
};

const FEATURE_ICON_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  usb: BatteryCharging,
  charging: BatteryCharging,
  wheelchair: Accessibility,
  express: Rocket,
  cctv: Camera,
  gps: Radio,
};

function FeatureBadges({ view }: { view: LiveBusView }) {
  const { bus } = view;
  const amenities = bus.amenities ?? [];
  const features = bus.features ?? [];
  if (amenities.length === 0 && features.length === 0) return null;
  return (
    <section aria-label="Features" className="space-y-1.5">
      <SectionLabel icon={Sparkles}>Features</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {amenities.map((a) => {
          const meta = AMENITY_ICONS[a];
          const Icon = meta.icon;
          return (
            <span
              key={a}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}
            >
              <Icon className="h-3 w-3" strokeWidth={2.4} />
              {meta.label}
            </span>
          );
        })}
        {features.map((f) => {
          const key = f.toLowerCase();
          const Icon = FEATURE_ICON_MAP[key] ?? Check;
          return (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground"
            >
              <Icon className="h-3 w-3" strokeWidth={2.4} />
              {f}
            </span>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
 *  LIVE ANALYTICS
 * ============================================================ */

function LiveAnalyticsCard({
  view,
  speedHistory,
  occHistory,
  avgSpeed,
  distanceCoveredKm,
}: {
  view: LiveBusView;
  speedHistory: number[];
  occHistory: number[];
  avgSpeed: number;
  distanceCoveredKm: number;
}) {
  const { trip, route } = view;
  const [expanded, setExpanded] = useState(true);
  const remainingKm = Math.max(0, route.distanceKm - distanceCoveredKm);
  return (
    <section aria-label="Live analytics" className="space-y-1.5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        aria-expanded={expanded}
      >
        <SectionLabel icon={Activity}>Live analytics</SectionLabel>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="grid grid-cols-2 gap-2">
          <SparklineCard
            title="Speed"
            unit="km/h"
            data={speedHistory}
            current={Math.round(trip.speed)}
            avg={avgSpeed}
            color="var(--color-brand)"
          />
          <SparklineCard
            title="Occupancy"
            unit="%"
            data={occHistory}
            current={Math.round(occupancyRatio(trip, view.bus) * 100)}
            avg={
              occHistory.length
                ? Math.round(occHistory.reduce((a, b) => a + b, 0) / occHistory.length)
                : 0
            }
            color="var(--color-warning)"
          />
          <AnalyticsStat
            label="Avg delay"
            value={typeof trip.averageDelayMin === "number" ? `${trip.averageDelayMin}m` : "—"}
            icon={Timer}
          />
          <AnalyticsStat label="Remaining" value={formatKm(remainingKm)} icon={RouteIcon} />
        </div>
      )}
    </section>
  );
}

function SparklineCard({
  title,
  unit,
  data,
  current,
  avg,
  color,
}: {
  title: string;
  unit: string;
  data: number[];
  current: number;
  avg: number;
  color: string;
}) {
  const W = 140;
  const H = 40;
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = Math.max(1, max - min);
  const pts = data.length
    ? data
        .map((v, i) => {
          const x = data.length === 1 ? W : (i / (data.length - 1)) * W;
          const y = H - ((v - min) / range) * H;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ")
    : "";
  const areaPath = pts
    ? `M 0 ${H} L ${pts.replace(/,/g, " L ").split(" L ").join(" L ")} L ${W} ${H} Z`
    : "";
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-2.5">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{title}</span>
        <span>
          avg {avg}
          {unit}
        </span>
      </div>
      <div className="mt-1 font-display text-lg font-bold leading-none">
        {current}
        <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{unit}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="mt-1 block h-8 w-full">
        {areaPath && <path d={areaPath} fill={color} opacity="0.15" />}
        {pts && (
          <polyline
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}

function AnalyticsStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={2.4} />
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-bold leading-none">{value}</div>
    </div>
  );
}

/* ============================================================
 *  COMPACT TIMELINE
 * ============================================================ */

function CompactTimeline({ view, onExpand }: { view: LiveBusView; onExpand: () => void }) {
  const { route, trip } = view;
  const stops = route.stops;
  const currentIdx = trip.currentStopId
    ? stops.findIndex((s) => s.id === trip.currentStopId)
    : trip.nextStopId
      ? Math.max(0, stops.findIndex((s) => s.id === trip.nextStopId) - 1)
      : 0;
  // Show 4 stops around current
  const start = Math.max(0, currentIdx - 1);
  const end = Math.min(stops.length, start + 4);
  const visible = stops.slice(start, end);
  return (
    <section aria-label="Timeline" className="space-y-1.5">
      <div className="flex items-center justify-between">
        <SectionLabel icon={RouteIcon}>Timeline</SectionLabel>
        <button
          type="button"
          onClick={onExpand}
          className="text-[10px] font-semibold text-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          View all stops
        </button>
      </div>
      <ol className="relative ml-1.5 space-y-3 border-l border-dashed border-border/70 pl-4">
        {visible.map((s, i) => {
          const absIdx = start + i;
          const state =
            absIdx < currentIdx ? "done" : absIdx === currentIdx ? "current" : "upcoming";
          const etaIso = trip.eta[s.id];
          return (
            <li key={s.id} className="relative">
              <span
                className={`absolute -left-[21px] top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full border-2 ${
                  state === "done"
                    ? "border-success bg-success"
                    : state === "current"
                      ? "border-brand bg-card"
                      : "border-border bg-card"
                }`}
              >
                {state === "done" && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                {state === "current" && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                )}
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div
                    className={`truncate text-xs font-semibold ${
                      state === "current" ? "text-brand" : "text-foreground"
                    }`}
                  >
                    {s.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{s.city}</div>
                </div>
                {etaIso && (
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] font-semibold text-foreground">
                      {formatTimeOnly(etaIso)}
                    </div>
                    {state === "upcoming" && (
                      <div className="text-[9px] text-muted-foreground">in {formatEta(etaIso)}</div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ============================================================
 *  ACTIONS BAR
 * ============================================================ */

function ActionsBar({
  routeFocused,
  onTrackRoute,
  onCatchNearby,
  onShare,
}: {
  routeFocused: boolean;
  onTrackRoute: () => void;
  onCatchNearby: () => void;
  onShare: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border/60 bg-card/85 p-3 backdrop-blur-xl">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onTrackRoute}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
            routeFocused
              ? "bg-brand text-brand-foreground shadow-sm"
              : "bg-accent text-foreground hover:bg-accent/70"
          }`}
        >
          <RouteIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
          {routeFocused ? "Tracking route" : "Track route"}
        </button>
        <button
          type="button"
          onClick={onCatchNearby}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} />
          Nearby stops
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={2.4} />
          Share live bus
        </button>
        <button
          type="button"
          disabled
          title="Booking coming soon"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 px-3 py-2 text-xs font-semibold text-muted-foreground"
        >
          <Ticket className="h-3.5 w-3.5" strokeWidth={2.4} />
          Book (soon)
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 *  SHARED HELPERS
 * ============================================================ */

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {children}
    </div>
  );
}

function compassLabel(deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(d / 45) % 8];
}

/**
 * Rolling sample buffer keyed by `stamp`. Only pushes a new sample when the
 * stamp changes, so re-renders that don't reflect a new server tick are ignored.
 */
function useSampleHistory(value: number, stamp: string, cap = 30): number[] {
  const buffer = useRef<{ stamp: string | null; values: number[] }>({
    stamp: null,
    values: [],
  });
  const [snapshot, setSnapshot] = useState<number[]>([]);
  useEffect(() => {
    if (buffer.current.stamp === stamp) return;
    buffer.current.stamp = stamp;
    const next = [...buffer.current.values, value].slice(-cap);
    buffer.current.values = next;
    setSnapshot(next);
  }, [value, stamp, cap]);
  return snapshot;
}

async function shareTrip(view: LiveBusView) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/radar?trip=${encodeURIComponent(view.trip.tripId)}`
      : "";
  const text = `Track ${view.bus.busNumber} on ${view.route.name} live on BusSetu`;
  try {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      await (navigator as Navigator).share({
        title: "BusSetu · Live bus",
        text,
        url,
      });
      return;
    }
  } catch {
    /* user cancelled */
  }
  try {
    await navigator.clipboard.writeText(url || text);
  } catch {
    /* ignore */
  }
}

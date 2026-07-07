import { motion } from "framer-motion";
import { Check, Footprints, Sparkles, Timer, X } from "lucide-react";
import { useMemo } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSmartDiscovery } from "@/hooks/useSmartDiscovery";
import { useUiStore } from "@/store/useUiStore";
import { useLiveBus } from "@/hooks/useLiveBus";
import { CatchService } from "@/services/discovery/CatchService";
import { formatKm } from "@/utils/format";

function formatMin(sec: number) {
  if (sec < 60) return `${sec}s`;
  return `${Math.round(sec / 60)} min`;
}

/**
 * Catch-This-Bus intelligence, rendered inside the Bus Details panel.
 * Shows whether the current selection is reachable in time and, if not,
 * suggests the next best catchable alternative from nearby buses.
 */
export function CatchThisBusCard() {
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const radiusKm = useUiStore((s) => s.discoveryRadiusKm);
  const view = useLiveBus(selectedTripId);
  const { location, usingDemo } = useGeolocation();
  const nearby = useSmartDiscovery(location, Math.max(radiusKm, 10));

  const assessment = useMemo(
    () => (view && location ? CatchService.assess({ view, user: location }) : null),
    [view, location],
  );

  const alternative = useMemo(() => {
    if (!location || !view || !assessment || assessment.catchable) return null;
    return CatchService.recommendAlternative(
      nearby.map((n) => ({
        trip: n.trip,
        bus: n.bus,
        operator: n.operator,
        route: n.route,
      })),
      location,
      view.trip.tripId,
    );
  }, [assessment, location, nearby, view]);

  if (!view || !location || !assessment) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/60 p-3.5"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Catch This Bus
        </div>
        {usingDemo && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Demo location
          </span>
        )}
      </div>

      <VerdictRow
        catchable={assessment.catchable}
        stopName={assessment.targetStopName}
        busEtaSec={assessment.busEtaSec}
        walkingSec={assessment.walkingSec}
        walkingKm={assessment.walkingKm}
        slackSec={assessment.slackSec}
      />

      {!assessment.catchable && alternative && (
        <div className="mt-3 rounded-xl border border-dashed border-border/70 bg-background/60 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
            <Sparkles className="h-3 w-3" />
            Try instead
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-semibold">
                {alternative.view.bus.busNumber}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {alternative.view.route.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold text-success">
                {alternative.view.trip.vacantSeats} seats
              </div>
              <div className="text-[10px] text-muted-foreground">
                ETA {formatMin(alternative.assessment.busEtaSec)}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Footprints className="h-3 w-3" />
              {formatMin(alternative.assessment.walkingSec)} walk ·{" "}
              {formatKm(alternative.assessment.walkingKm)}
            </span>
            <span className="inline-flex items-center gap-1 text-success">
              <Check className="h-3 w-3" />
              Catchable
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function VerdictRow({
  catchable,
  stopName,
  busEtaSec,
  walkingSec,
  walkingKm,
  slackSec,
}: {
  catchable: boolean;
  stopName: string;
  busEtaSec: number;
  walkingSec: number;
  walkingKm: number;
  slackSec: number;
}) {
  return (
    <>
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
          catchable ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
        }`}
      >
        {catchable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        <span>{catchable ? "You can catch this bus" : "You cannot catch this bus"}</span>
        <span className="ml-auto text-[10px] font-normal opacity-80">
          {Math.abs(slackSec) < 60
            ? `${Math.abs(slackSec)}s ${catchable ? "spare" : "short"}`
            : `${Math.round(Math.abs(slackSec) / 60)}m ${catchable ? "spare" : "short"}`}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <MiniStat
          icon={<Timer className="h-3 w-3" />}
          label="Bus arrives"
          value={formatMin(busEtaSec)}
          sub={stopName}
        />
        <MiniStat
          icon={<Footprints className="h-3 w-3" />}
          label="Walking time"
          value={formatMin(walkingSec)}
          sub={formatKm(walkingKm)}
        />
      </div>
    </>
  );
}

function MiniStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-0.5 font-display text-sm font-semibold">{value}</div>
      {sub && <div className="truncate text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

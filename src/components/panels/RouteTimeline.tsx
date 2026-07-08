import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { useLiveBus } from "@/hooks/useLiveBus";
import { formatEta } from "@/utils/format";

export function RouteTimeline() {
  const open = useUiStore((s) => s.timelineOpen);
  const close = useUiStore((s) => s.closeTimeline);
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const view = useLiveBus(selectedTripId);

  return (
    <AnimatePresence>
      {open && view && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[900] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="glass-panel relative flex max-h-[80vh] w-[min(440px,100%)] flex-col overflow-hidden rounded-3xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/60 p-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Route timeline
                </div>
                <div className="font-display text-lg font-semibold">{view.route.name}</div>
                <div className="text-xs text-muted-foreground">
                  {view.bus.busNumber} · {view.operator.name}
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <Timeline view={view} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function Timeline({ view }: { view: ReturnType<typeof useLiveBus> }) {
  if (!view) return null;
  const { trip, route } = view;
  const stops = trip.direction === "forward" ? route.stops : [...route.stops].reverse();
  const currentIdx = stops.findIndex((s) => s.id === trip.currentStopId);

  return (
    <motion.ol
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative space-y-4 pl-6"
    >
      <span className="absolute left-[9px] top-1 h-full w-0.5 bg-border" />
      {stops.map((s, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        const eta = trip.eta[s.id];
        return (
          <motion.li key={s.id} variants={itemVariants} className="relative">
            <span
              className={`absolute -left-[18px] top-1 h-3.5 w-3.5 rounded-full border-2 ${
                isPast
                  ? "border-success bg-success"
                  : isCurrent
                    ? "border-brand bg-brand shadow-[0_0_0_4px_var(--color-brand)/25]"
                    : "border-border bg-background"
              }`}
            >
              {isCurrent && (
                <span className="absolute -inset-1 animate-ping rounded-full border-2 border-brand opacity-75" />
              )}
            </span>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isCurrent
                      ? "text-brand"
                      : isPast
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                  }`}
                >
                  {s.name}
                </div>
                <div className="text-[11px] text-muted-foreground">{s.city}</div>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {isPast
                  ? "Completed"
                  : isCurrent
                    ? "Current"
                    : eta
                      ? `ETA ${formatEta(eta)}`
                      : "Upcoming"}
              </div>
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

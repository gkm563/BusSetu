import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Maximize2, Pause, Play, Radar, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HeroRadar } from "./HeroRadar";

interface RadarState {
  paused: boolean;
  density: number;
}

function ControlsBar({
  state,
  onChange,
  onExpand,
  expandRef,
}: {
  state: RadarState;
  onChange: (patch: Partial<RadarState>) => void;
  onExpand?: () => void;
  expandRef?: React.Ref<HTMLButtonElement>;
}) {
  const densityId = "hero-radar-density";
  return (
    <div
      role="toolbar"
      aria-label="Radar controls"
      className="pointer-events-auto absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-border/60 bg-background/85 px-2 py-1.5 text-[11px] font-medium shadow-lg backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => onChange({ paused: !state.paused })}
        aria-pressed={state.paused}
        aria-label={state.paused ? "Resume motion" : "Pause motion"}
        className="grid h-7 w-7 place-items-center rounded-full bg-brand text-brand-foreground transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {state.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      </button>
      <div className="flex items-center gap-1.5 pl-1 pr-2 text-muted-foreground">
        <label htmlFor={densityId} className="hidden sm:inline cursor-pointer">
          Buses
        </label>
        <input
          id={densityId}
          type="range"
          min={1}
          max={4}
          step={1}
          value={state.density}
          onChange={(e) => onChange({ density: Number(e.target.value) })}
          aria-label="Bus density"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={state.density}
          aria-valuetext={`${state.density * 3} buses`}
          className="h-1 w-20 accent-brand rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <span className="tabular-nums text-foreground">{state.density * 3}</span>
      </div>
      {onExpand && (
        <button
          ref={expandRef}
          type="button"
          onClick={onExpand}
          aria-label="Expand radar"
          className="grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function HeroRadarInteractive() {
  const [state, setState] = useState<RadarState>({ paused: false, density: 2 });
  const [open, setOpen] = useState(false);
  const patch = (p: Partial<RadarState>) => setState((s) => ({ ...s, ...p }));
  const expandBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setOpen(false);
    // Restore focus to the expand button that opened the modal.
    requestAnimationFrame(() => expandBtnRef.current?.focus());
  };

  return (
    <>
      <div className="relative">
        <HeroRadar paused={state.paused} density={state.density} />
        <ControlsBar
          state={state}
          onChange={patch}
          onExpand={() => setOpen(true)}
          expandRef={expandBtnRef}
        />
      </div>
      <RadarDemoModal open={open} onClose={handleClose} />
    </>
  );
}

export function RadarDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, setState] = useState<RadarState>({ paused: false, density: 3 });
  const patch = (p: Partial<RadarState>) => setState((s) => ({ ...s, ...p }));
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] => {
      if (!panelRef.current) return [];
      return Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const items = getFocusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the close button after the panel mounts.
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      // Restore focus to whatever was focused before the modal opened,
      // unless the caller already moved focus (e.g. expand button).
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        requestAnimationFrame(() => {
          if (document.activeElement === document.body) previouslyFocused.focus();
        });
      }
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-background/70 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Live radar preview"
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-md sm:px-5">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-brand-foreground shadow">
                  <Radar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Live Tracking · Demo</div>
                  <div className="text-[11px] text-muted-foreground">
                    Interactive preview · synthetic data
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/search"
                  search={{ trip: "t-alld-lko-03", from: "Prayagraj", to: "Lucknow", via: "Mirzapur" }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground shadow-sm transition-transform hover:scale-[1.03]"
                >
                  Open Live Map
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close radar preview"
                  className="grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-card text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="relative p-3 sm:p-4">
              <HeroRadar compact paused={state.paused} density={state.density} />
              <ControlsBar state={state} onChange={patch} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion } from "framer-motion";
import { Bus, Navigation, Users, Zap } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";

export interface HeroRadarHandle {
  pause: () => void;
  resume: () => void;
}

interface HeroRadarProps {
  compact?: boolean;
  /** When true, all SMIL animations inside the SVG are paused. */
  paused?: boolean;
  /** Buses per primary route (1–4). Defaults to 2. */
  density?: number;
}

/**
 * A stylized, always-animating SVG radar preview used inside the hero.
 * It is intentionally NOT the real Leaflet map — a synthetic composition
 * renders faster, animates predictably, and looks great on mobile.
 */
export const HeroRadar = forwardRef<HeroRadarHandle, HeroRadarProps>(function HeroRadar(
  { compact = false, paused = false, density = 2 },
  ref,
) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useImperativeHandle(ref, () => ({
    pause: () => svgRef.current?.pauseAnimations(),
    resume: () => svgRef.current?.unpauseAnimations(),
  }));

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (paused) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }, [paused]);

  const perPath = Math.max(1, Math.min(4, Math.round(density)));
  const routes = useMemo(
    () =>
      [
        { id: "hero-path-1", color: "var(--color-brand)", duration: 14 },
        { id: "hero-path-2", color: "var(--color-success)", duration: 18 },
        { id: "hero-path-3", color: "var(--color-warning)", duration: 20 },
      ] as const,
    [],
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[28px] border border-border/60 bg-card/70 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.35)] backdrop-blur-xl ${
        compact ? "aspect-[16/10]" : "aspect-[4/3] md:aspect-[16/10]"
      }`}
    >
      {/* Base gradient sky */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_20%,color-mix(in_oklab,var(--color-brand)_15%,transparent),transparent_70%),radial-gradient(60%_40%_at_90%_80%,color-mix(in_oklab,var(--color-success)_18%,transparent),transparent_70%),linear-gradient(160deg,color-mix(in_oklab,var(--color-brand)_6%,var(--color-background)),var(--color-background))]" />

      {/* Grid */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-[0.15] text-foreground [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      >
        <defs>
          <pattern id="hero-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M36 0H0V36" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Animated routes + buses */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="route1" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--color-brand)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="route2" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--color-success)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="route3" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--color-warning)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--color-warning)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-warning)" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint dashed background routes */}
        {[
          "M 40 380 Q 220 300 380 320 T 760 220",
          "M 60 120 Q 220 220 360 200 T 700 340",
          "M 20 260 Q 200 260 400 340 T 780 380",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="currentColor"
            className="text-foreground/10"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 8"
          />
        ))}

        {/* Primary animated routes */}
        <path
          id="hero-path-1"
          d="M 60 400 C 200 300, 340 340, 460 300 S 700 180, 780 140"
          stroke="url(#route1)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        <path
          id="hero-path-2"
          d="M 40 120 C 200 220, 320 180, 480 240 S 720 340, 780 400"
          stroke="url(#route2)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        <path
          id="hero-path-3"
          d="M 780 280 C 620 220, 500 320, 360 260 S 140 180, 30 240"
          stroke="url(#route3)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Buses moving along paths */}
        {routes.map((r) =>
          Array.from({ length: perPath }).map((_, i) => (
            <BusDot
              key={`${r.id}-${i}-${perPath}`}
              pathId={`#${r.id}`}
              color={r.color}
              duration={`${r.duration}s`}
              begin={`-${(r.duration / perPath) * i}s`}
            />
          )),
        )}

        {/* Stop markers */}
        {[
          [60, 400],
          [460, 300],
          [780, 140],
          [480, 240],
          [40, 120],
          [360, 260],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="6"
              fill="var(--color-background)"
              stroke="var(--color-brand)"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* User pin */}
        <g transform="translate(280 300)">
          <circle r="26" fill="var(--color-brand)" opacity="0.15">
            <animate attributeName="r" values="18;36;18" dur="2.4s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.35;0;0.35"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            r="9"
            fill="var(--color-brand)"
            stroke="var(--color-background)"
            strokeWidth="3"
          />
        </g>
      </svg>

      {/* Floating glass badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-[11px] font-semibold shadow-lg backdrop-blur-md"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Live · streaming
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-lg backdrop-blur-md"
      >
        <Navigation className="h-3 w-3 text-brand" /> 12 nearby
      </motion.div>

      {/* Bottom mini-card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/85 p-3 shadow-xl backdrop-blur-md sm:right-auto sm:min-w-[280px]"
      >
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground shadow-md">
            <Bus className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-semibold">UP-70 3204</span>
              <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success">
                Coming
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Prayagraj → Mirzapur · ETA 4 min
            </div>
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-3 text-[10px] text-muted-foreground sm:flex">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> 18 seats
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3 w-3 text-brand" /> AC
          </span>
        </div>
      </motion.div>
    </div>
  );
});

function BusDot({
  pathId,
  color,
  duration,
  begin,
}: {
  pathId: string;
  color: string;
  duration: string;
  begin: string;
}) {
  return (
    <g>
      <circle r="8" fill={color} opacity="0.22">
        <animateMotion dur={duration} begin={begin} repeatCount="indefinite" rotate="auto">
          <mpath href={pathId} />
        </animateMotion>
      </circle>
      <circle r="4.5" fill={color} stroke="var(--color-background)" strokeWidth="1.5">
        <animateMotion dur={duration} begin={begin} repeatCount="indefinite" rotate="auto">
          <mpath href={pathId} />
        </animateMotion>
      </circle>
    </g>
  );
}

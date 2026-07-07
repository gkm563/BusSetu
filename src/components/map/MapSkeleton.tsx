import { Loader2, Radio, WifiOff } from "lucide-react";

interface Props {
  /** True while any hydration is still pending. */
  loading: boolean;
  /** Non-null when hydration failed. */
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Full-bleed skeleton shown over the map while catalogs / first trips
 * snapshot are loading. Sits inside the map shell so it fades in over
 * the tiles without shifting layout.
 */
export function MapSkeleton({ loading, error, onRetry }: Props) {
  if (!loading && !error) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
      <div className="absolute inset-0 animate-[skeleton-shimmer_2.4s_ease-in-out_infinite] bg-gradient-to-br from-background/80 via-background/60 to-background/85 backdrop-blur-sm" />

      {/* Faux route lines */}
      <svg
        className="absolute inset-0 h-full w-full text-brand/25"
        viewBox="0 0 800 500"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M 40 380 Q 220 320 340 340 T 620 260 T 780 160"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray="6 8"
          className="animate-pulse"
        />
        <path
          d="M 80 120 Q 260 200 400 180 T 700 320"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray="6 8"
          className="animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </svg>

      <div className="pointer-events-auto relative flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-card/90 px-6 py-5 shadow-2xl backdrop-blur-xl">
        {error ? (
          <>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-danger/10 text-danger">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="text-center">
              <div className="font-display text-sm font-semibold">Live feed unavailable</div>
              <div className="mt-0.5 max-w-[240px] text-xs text-muted-foreground">{error}</div>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-brand-foreground transition-transform hover:scale-[1.02]"
              >
                Try again
              </button>
            )}
          </>
        ) : (
          <>
            <div className="relative grid h-11 w-11 place-items-center">
              <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-brand/25" />
              <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-md">
                <Radio className="h-5 w-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-sm font-semibold">Tuning into live signals…</div>
              <div className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading routes, stops & fleet
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

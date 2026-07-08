import { useUiStore } from "@/store/useUiStore";

export function LiveReplayControl() {
  const replayOffset = useUiStore((s) => s.replayOffset);
  const setReplayOffset = useUiStore((s) => s.setReplayOffset);

  return (
    <div className="glass-panel pointer-events-auto flex items-center gap-2 rounded-full px-3 py-1.5 border border-border/60 shadow-lg text-[11px] font-semibold bg-card/85 backdrop-blur-md">
      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground pr-2 border-r border-border/50">
        <span>🕒</span>
        <span>Replay</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setReplayOffset(0)}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            replayOffset === 0
              ? "bg-brand text-brand-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Live
        </button>
        <button
          type="button"
          onClick={() => setReplayOffset(5)}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            replayOffset === 5
              ? "bg-brand text-brand-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          -5m ago
        </button>
        <button
          type="button"
          onClick={() => setReplayOffset(10)}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            replayOffset === 10
              ? "bg-brand text-brand-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          -10m ago
        </button>
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2">
      <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white shadow-[0_6px_20px_-6px_var(--color-brand)] transition-transform group-hover:scale-105 border border-border/50">
        <img src="/favicon.jpg" alt="BusSetu Logo" className="h-full w-full object-cover rounded-xl" />
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background z-10" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Bus<span className="text-brand">Setu</span>
        </span>
      )}
    </Link>
  );
}

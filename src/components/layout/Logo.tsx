import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2">
      <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground shadow-[0_6px_20px_-6px_var(--color-brand)] transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
          <path d="M4 16h16" />
          <path d="M6 20h.01M18 20h.01" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="16" cy="17" r="2" />
        </svg>
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-background" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Bus<span className="text-brand">Setu</span>
        </span>
      )}
    </Link>
  );
}

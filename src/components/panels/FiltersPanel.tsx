import { SlidersHorizontal } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";

const OPERATOR_KINDS = [
  { key: "government", label: "Government" },
  { key: "private", label: "Private" },
] as const;

const AMENITIES = [
  { key: "ac", label: "AC" },
  { key: "electric", label: "Electric" },
  { key: "luxury", label: "Luxury" },
  { key: "mini", label: "Mini" },
  { key: "women_friendly", label: "Women friendly" },
] as const;

export function FiltersPanel() {
  const filters = useUiStore((s) => s.filters);
  const toggleOperatorKind = useUiStore((s) => s.toggleOperatorKind);
  const toggleAmenity = useUiStore((s) => s.toggleAmenity);
  const toggleSeats = useUiStore((s) => s.toggleSeats);
  const toggleLowCrowd = useUiStore((s) => s.toggleLowCrowd);
  const toggleNearby = useUiStore((s) => s.toggleNearby);
  const clearFilters = useUiStore((s) => s.clearFilters);

  const anyActive =
    filters.operatorKinds.size +
      filters.amenities.size +
      (filters.seatsAvailable ? 1 : 0) +
      (filters.lowCrowd ? 1 : 0) +
      (filters.nearbyOnly ? 1 : 0) >
    0;

  const activeCount =
    filters.operatorKinds.size +
    filters.amenities.size +
    (filters.seatsAvailable ? 1 : 0) +
    (filters.lowCrowd ? 1 : 0) +
    (filters.nearbyOnly ? 1 : 0);

  return (
    <div className="glass-panel pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full p-1.5">
      <span className="ml-1.5 hidden shrink-0 items-center gap-1.5 pr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline-flex">
        <SlidersHorizontal className="h-3 w-3" aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-brand px-1.5 py-px text-[10px] font-bold text-brand-foreground">
            {activeCount}
          </span>
        )}
      </span>
      <span className="mx-1 hidden h-5 w-px shrink-0 bg-border sm:block" />
      {OPERATOR_KINDS.map((o) => (
        <Chip
          key={o.key}
          active={filters.operatorKinds.has(o.key)}
          onClick={() => toggleOperatorKind(o.key)}
          label={o.label}
        />
      ))}
      <span className="mx-1 h-5 w-px shrink-0 bg-border" />
      {AMENITIES.map((a) => (
        <Chip
          key={a.key}
          active={filters.amenities.has(a.key)}
          onClick={() => toggleAmenity(a.key)}
          label={a.label}
        />
      ))}
      <span className="mx-1 h-5 w-px shrink-0 bg-border" />
      <Chip active={filters.seatsAvailable} onClick={toggleSeats} label="Seats available" />
      <Chip active={filters.lowCrowd} onClick={toggleLowCrowd} label="Low crowd" />
      <Chip active={filters.nearbyOnly} onClick={toggleNearby} label="Nearby" />
      {anyActive && (
        <button
          onClick={clearFilters}
          className="ml-1 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-brand text-brand-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

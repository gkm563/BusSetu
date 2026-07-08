import {
  SlidersHorizontal,
  Landmark,
  Building2,
  Snowflake,
  Zap,
  Crown,
  Users,
  Heart,
  MapPin,
} from "lucide-react";
import { useUiStore } from "@/store/useUiStore";

const OPERATOR_KINDS = [
  { key: "government", label: "Government", icon: Landmark },
  { key: "private", label: "Private", icon: Building2 },
] as const;

const AMENITIES = [
  { key: "ac", label: "AC", icon: Snowflake },
  { key: "electric", label: "Electric", icon: Zap },
  { key: "luxury", label: "Luxury", icon: Crown },
  { key: "mini", label: "Mini", icon: Users },
  { key: "women_friendly", label: "Women friendly", icon: Heart },
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
          icon={o.icon}
        />
      ))}
      <span className="mx-1 h-5 w-px shrink-0 bg-border" />
      {AMENITIES.map((a) => (
        <Chip
          key={a.key}
          active={filters.amenities.has(a.key)}
          onClick={() => toggleAmenity(a.key)}
          label={a.label}
          icon={a.icon}
        />
      ))}
      <span className="mx-1 h-5 w-px shrink-0 bg-border" />
      <Chip active={filters.seatsAvailable} onClick={toggleSeats} label="Seats available" icon={Users} />
      <Chip active={filters.lowCrowd} onClick={toggleLowCrowd} label="Low crowd" icon={Users} />
      <Chip active={filters.nearbyOnly} onClick={toggleNearby} label="Nearby" icon={MapPin} />
      {anyActive && (
        <button
          onClick={clearFilters}
          className="ml-1 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
        active
          ? "bg-brand text-brand-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </button>
  );
}

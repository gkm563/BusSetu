export interface OccupancyRange {
  label: string;
  fillRatio: number;
  crowdPct: number;
}

export const OCCUPANCY_LEVELS: OccupancyRange[] = [
  { label: "Empty", fillRatio: 0.15, crowdPct: 15 },
  { label: "Moderate", fillRatio: 0.42, crowdPct: 42 },
  { label: "Crowded", fillRatio: 0.68, crowdPct: 68 },
  { label: "Almost Full", fillRatio: 0.91, crowdPct: 91 },
  { label: "Overloaded", fillRatio: 1.15, crowdPct: 115 },
];

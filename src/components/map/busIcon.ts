import L from "leaflet";
import type { OccupancyLevel } from "@/utils/occupancy";

type MarkerKind = "occupancy" | "ac" | "government";

function color(level: OccupancyLevel, kind: MarkerKind): string {
  if (kind === "government") return "var(--color-bus-gov)";
  if (kind === "ac") return "var(--color-bus-ac)";
  switch (level) {
    case "low":
      return "var(--color-occ-low)";
    case "medium":
      return "var(--color-occ-med)";
    case "high":
      return "var(--color-occ-high)";
    case "packed":
      return "var(--color-occ-packed)";
  }
}

export function busDivIcon(opts: {
  level: OccupancyLevel;
  kind: MarkerKind;
  heading: number;
  selected?: boolean;
  hovered?: boolean;
  pulse?: boolean;
  dimmed?: boolean;
}) {
  const c = color(opts.level, opts.kind);
  const size = opts.selected ? 44 : opts.hovered ? 40 : 34;
  const opacity = opts.dimmed ? 0.35 : 1;

  const ringHtml = opts.selected
    ? `<span style="position:absolute;inset:-8px;border-radius:9999px;background:${c};opacity:.28;animation:pulse-ring 1.6s ease-out infinite;"></span>`
    : opts.pulse
      ? `<span style="position:absolute;inset:-4px;border-radius:9999px;background:${c};opacity:.18;animation:pulse-ring 2.4s ease-out infinite;"></span>`
      : "";

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;opacity:${opacity};">
      ${ringHtml}
      <div data-bus-rotor style="
        position:absolute;inset:0;
        border-radius:12px;
        background:${c};
        color:white;
        display:grid;place-items:center;
        transform: rotate(${opts.heading - 90}deg);
        box-shadow: 0 8px 18px -6px rgb(0 0 0 / .45);
        border: ${opts.selected ? 3 : opts.hovered ? 2.5 : 2}px solid rgb(255 255 255 / .9);
        transition: box-shadow 200ms ease-out, transform 500ms linear;
      ">
        <svg viewBox="0 0 24 24" width="${size * 0.55}" height="${size * 0.55}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(90deg);">
          <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
          <path d="M4 12h16" />
          <circle cx="8" cy="17" r="1.6" />
          <circle cx="16" cy="17" r="1.6" />
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "bus-marker-shadow",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function stopDivIcon() {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:white;border:3px solid var(--color-brand);box-shadow:0 2px 6px rgb(0 0 0 / .2);"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function userDivIcon() {
  return L.divIcon({
    html: `<div style="position:relative;width:20px;height:20px;">
      <span style="position:absolute;inset:-8px;border-radius:9999px;background:var(--color-brand);opacity:.25;animation:pulse-ring 2s ease-out infinite;"></span>
      <div style="position:absolute;inset:0;border-radius:9999px;background:var(--color-brand);border:3px solid white;box-shadow:0 2px 6px rgb(0 0 0 / .3);"></div>
    </div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

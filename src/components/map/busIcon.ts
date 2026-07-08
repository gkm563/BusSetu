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
  busNumber: string;
  selected?: boolean;
  hovered?: boolean;
  pulse?: boolean;
  dimmed?: boolean;
}) {
  const c = color(opts.level, opts.kind);
  const size = opts.selected ? 36 : opts.hovered ? 34 : 30;
  const opacity = opts.dimmed ? 0.35 : 1;

  const ringHtml = opts.selected
    ? `<span style="position:absolute;inset:-8px;border-radius:9999px;background:${c};opacity:.28;animation:pulse-ring 1.6s ease-out infinite;"></span>`
    : opts.pulse
      ? `<span style="position:absolute;inset:-4px;border-radius:9999px;background:${c};opacity:.18;animation:pulse-ring 2.4s ease-out infinite;"></span>`
      : "";

  // Get a readable short format, e.g. "CP 2304" from "UP 65 CP 2304"
  const parts = opts.busNumber.split(" ");
  const shortNum = parts.length >= 2 ? parts.slice(-2).join(" ") : opts.busNumber;

  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 70px;
      height: 70px;
      margin-left: -20px;
      margin-top: -20px;
      opacity: ${opacity};
    ">
      <!-- Rotatable Bus Icon Container -->
      <div data-bus-rotor style="
        position: relative;
        width: ${size}px;
        height: ${size + 4}px;
        transform: rotate(${opts.heading}deg);
        transition: transform 500ms linear;
      ">
        ${ringHtml}
        <img src="/bus-marker.png" style="width: 100%; height: 100%; object-fit: contain;" />
      </div>
      
      <!-- Static Horizontal label -->
      <div style="
        margin-top: 3px;
        background: rgba(15, 23, 42, 0.9);
        color: white;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 8px;
        font-weight: 700;
        letter-spacing: -0.2px;
        padding: 1.5px 4px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        white-space: nowrap;
        pointer-events: auto;
      ">
        ${shortNum}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "bus-marker-shadow",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
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

export function activeStopDivIcon(name: string) {
  return L.divIcon({
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;width:80px;height:50px;margin-left:-33px;margin-top:-25px;">
      <div style="width:12px;height:12px;border-radius:9999px;background:#2563EB;border:2.5px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);position:relative;z-index:10;"></div>
      <div style="
        margin-top: 3px;
        background: white;
        color: #1E293B;
        font-family: system-ui, sans-serif;
        font-size: 8px;
        font-weight: 700;
        padding: 1px 3.5px;
        border-radius: 4px;
        border: 1px solid #CBD5E1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        white-space: nowrap;
        pointer-events: none;
      ">
        ${name}
      </div>
    </div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function userDivIcon() {
  return L.divIcon({
    html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin-left:-4px;margin-top:-4px;">
      <span style="position:absolute;inset:-6px;border-radius:9999px;background:#10B981;opacity:.28;animation:pulse-ring 2s ease-out infinite;"></span>
      <div style="
        position:absolute;
        inset:0;
        border-radius:9999px;
        background:white;
        border:2.5px solid #10B981;
        box-shadow:0 3px 8px rgba(0, 0, 0, 0.4);
        overflow:hidden;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <img src="/user-marker.jpg" style="width:140%; height:140%; object-fit:cover; object-position:center 30%;" />
      </div>
      <div style="
        position: absolute;
        bottom: -16px;
        background: rgba(16, 185, 129, 0.95);
        color: white;
        font-family: system-ui, sans-serif;
        font-size: 8px;
        font-weight: 800;
        padding: 1px 4.5px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      ">
        YOU
      </div>
    </div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

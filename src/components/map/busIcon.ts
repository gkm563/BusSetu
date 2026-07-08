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
    ? `<span data-bus-ring style="position:absolute;inset:-8px;border-radius:9999px;background:${c};opacity:.28;animation:pulse-ring 1.6s ease-out infinite;"></span>`
    : `<span data-bus-ring style="position:absolute;inset:-4px;border-radius:9999px;background:${c};opacity:.18;animation:pulse-ring 2.4s ease-out infinite;${opts.pulse ? "" : "display:none;"}"></span>`;

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
        <svg viewBox="0 0 32 36" fill="none" style="width: 100%; height: 100%;">
          <!-- Side mirrors -->
          <rect x="1" y="8" width="2" height="5" rx="1.2" fill="${c}" stroke="white" stroke-width="0.8" />
          <rect x="29" y="8" width="2" height="5" rx="1.2" fill="${c}" stroke="white" stroke-width="0.8" />
          
          <!-- Bus body -->
          <rect x="4" y="2" width="24" height="32" rx="5" fill="${c}" stroke="white" stroke-width="2" />
          
          <!-- Windshield (Blue screen) -->
          <rect x="7" y="5" width="18" height="6" rx="1.5" fill="#38BDF8" stroke="white" stroke-width="0.8" />
          
          <!-- Roof details (AC unit vent) -->
          <rect x="9" y="15" width="14" height="8" rx="2" fill="white" fill-opacity="0.35" stroke="white" stroke-width="0.8" />
          
          <!-- Direction indicator arrow -->
          <path d="M16 14l3.5 4h-7z" fill="white" />
          
          <!-- Headlights -->
          <circle cx="8" cy="2.5" r="1.2" fill="white" />
          <circle cx="24" cy="2.5" r="1.2" fill="white" />
          
          <!-- Rear brake lights -->
          <rect x="7" y="32.5" width="3" height="1" fill="#EF4444" />
          <rect x="22" y="32.5" width="3" height="1" fill="#EF4444" />
        </svg>
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
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
      ">
        <span>${shortNum}</span>
        <span data-bus-relation style="font-size: 6.5px; padding: 0.5px 3.5px; border-radius: 2px; font-weight: 900; text-transform: uppercase; color: white; display: none;"></span>
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
    html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;margin-left:-12px;margin-top:-24px;">
      <img src="/bus-marker.png" style="width:100%; height:100%; object-fit:contain;" />
    </div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

export function activeStopDivIcon(name: string) {
  return L.divIcon({
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100px;height:60px;margin-left:-50px;margin-top:-40px;">
      <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;position:relative;z-index:10;">
        <span style="position:absolute;inset:-4px;border-radius:9999px;background:var(--color-brand);opacity:.25;animation:pulse-ring 2s ease-out infinite;"></span>
        <img src="/bus-marker.png" style="width:100%; height:100%; object-fit:contain; position:relative; z-index:11;" />
      </div>
      <div style="
        margin-top: 3px;
        background: white;
        color: #1E293B;
        font-family: system-ui, sans-serif;
        font-size: 8px;
        font-weight: 700;
        padding: 1px 4.5px;
        border-radius: 4px;
        border: 1px solid #CBD5E1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        white-space: nowrap;
        pointer-events: none;
        position: relative;
        z-index: 12;
      ">
        ${name}
      </div>
    </div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
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

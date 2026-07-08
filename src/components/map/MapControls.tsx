import {
  Compass,
  Layers,
  Map as MapIcon,
  Maximize,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Satellite,
} from "lucide-react";
import { useMap } from "react-leaflet";
import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { BaseLayer } from "./BusMap";

interface Props {
  onToggleStops: () => void;
  showStops: boolean;
  onToggleRoutes: () => void;
  showRoutes: boolean;
  onToggleTraffic: () => void;
  showTraffic: boolean;
  baseLayer: BaseLayer;
  onChangeBaseLayer: (l: BaseLayer) => void;
  onReset: () => void;
  onLocated: (loc: { lat: number; lng: number }) => void;
}

export function MapControls({
  onToggleStops,
  showStops,
  onToggleRoutes,
  showRoutes,
  onToggleTraffic,
  showTraffic,
  baseLayer,
  onChangeBaseLayer,
  onReset,
  onLocated,
}: Props) {
  const map = useMap();
  const { location, request } = useGeolocation();
  const [fullscreen, setFullscreen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);

  function locateMe() {
    request();
    const flyTo = (loc: { lat: number; lng: number }) => {
      map.flyTo([loc.lat, loc.lng], 12, { duration: 0.8 });
      onLocated(loc);
    };
    if (location) flyTo(location);
    else setTimeout(() => location && flyTo(location), 1200);
  }

  function toggleFullscreen() {
    const el = map.getContainer().closest<HTMLElement>("[data-map-shell]");
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }

  function resetView() {
    map.flyTo([25.35, 82.1], 9, { duration: 0.8 });
    onReset();
  }

  return (
    <div className="absolute right-4 top-4 z-[500] flex flex-col items-end gap-2.5">
      <div className="flex flex-col gap-2">
        <CtrlBtn label="Locate me" onClick={locateMe}>
          <Navigation className="h-4 w-4" />
        </CtrlBtn>
        <CtrlBtn label="Zoom in" onClick={() => map.zoomIn()}>
          <Plus className="h-4 w-4" />
        </CtrlBtn>
        <CtrlBtn label="Zoom out" onClick={() => map.zoomOut()}>
          <Minus className="h-4 w-4" />
        </CtrlBtn>
        <CtrlBtn label="Reset north" onClick={() => map.setView(map.getCenter(), map.getZoom())}>
          <Compass className="h-4 w-4" />
        </CtrlBtn>
        <CtrlBtn label="Map layers" onClick={() => setLayersOpen((v) => !v)} active={layersOpen}>
          <Layers className="h-4 w-4" />
        </CtrlBtn>
        <CtrlBtn label="Reset view" onClick={resetView}>
          <RefreshCw className="h-4 w-4" />
        </CtrlBtn>
        <CtrlBtn label="Fullscreen" onClick={toggleFullscreen} active={fullscreen}>
          <Maximize className="h-4 w-4" />
        </CtrlBtn>
      </div>

      {layersOpen && (
        <div className="glass-panel w-56 animate-scale-in rounded-2xl p-3 text-sm border border-border/60 shadow-lg">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Base map
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <LayerChoice
              active={baseLayer === "standard"}
              onClick={() => onChangeBaseLayer("standard")}
              icon={<MapIcon className="h-3.5 w-3.5" />}
              label="Standard"
            />
            <LayerChoice
              active={baseLayer === "satellite"}
              onClick={() => onChangeBaseLayer("satellite")}
              icon={<Satellite className="h-3.5 w-3.5" />}
              label="Satellite"
            />
          </div>
          <div className="mb-2 mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Overlays
          </div>
          <div className="space-y-1">
            <LayerToggle
              active={showRoutes}
              onClick={onToggleRoutes}
              icon={<RouteIcon className="h-3.5 w-3.5" />}
              label="Routes"
            />
            <LayerToggle
              active={showStops}
              onClick={onToggleStops}
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Bus stops"
            />
            <LayerToggle
              active={showTraffic}
              onClick={onToggleTraffic}
              icon={<Layers className="h-3.5 w-3.5" />}
              label="Traffic (preview)"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CtrlBtn({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`glass-panel grid h-10 w-10 place-items-center rounded-full transition-all border border-border/50 shadow-md cursor-pointer hover:scale-105 active:scale-95 ${
        active ? "bg-brand text-brand-foreground" : "text-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function LayerChoice({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border/60 text-foreground hover:bg-accent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LayerToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={`grid h-4 w-7 place-items-center rounded-full transition-colors ${
          active ? "bg-brand" : "bg-muted"
        }`}
      >
        <span
          className={`h-3 w-3 rounded-full bg-white transition-transform ${
            active ? "translate-x-1.5" : "-translate-x-1.5"
          }`}
        />
      </span>
    </button>
  );
}

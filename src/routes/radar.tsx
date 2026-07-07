import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { BusMapClient } from "@/components/map/BusMapClient";
import { RouteSearchPanel } from "@/components/panels/RouteSearchPanel";
import { FiltersPanel } from "@/components/panels/FiltersPanel";
import { NearbyBusesPanel } from "@/components/panels/NearbyBusesPanel";
import { BusDetailsPanel } from "@/components/panels/BusDetailsPanel";
import { RouteResultsPanel } from "@/components/panels/RouteResultsPanel";
import { RouteTimeline } from "@/components/panels/RouteTimeline";
import { LiveRadarAnnouncer } from "@/components/map/LiveRadarAnnouncer";
import { OfflineBanner } from "@/components/state/OfflineBanner";
import { useUiStore } from "@/store/useUiStore";
import { useLiveStore } from "@/store/useLiveStore";

export const Route = createFileRoute("/radar")({
  head: () => ({
    meta: [
      { title: "Live Radar — BusSetu" },
      {
        name: "description",
        content:
          "See every bus moving live on the map. Filter by operator, seats, or route — track any trip in real time.",
      },
      { property: "og:title", content: "Live Bus Radar — BusSetu" },
      {
        property: "og:description",
        content: "Real-time bus tracking across cities and highways. Powered by BusSetu.",
      },
    ],
  }),
  component: RadarPage,
});

function RadarPage() {
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const routeQueryActive = useUiStore((s) => s.routeQuery.active);
  const busNumber = useLiveStore((s) => {
    if (!selectedTripId) return null;
    const trip = s.tripsById[selectedTripId];
    if (!trip) return null;
    return s.busesById[trip.busId]?.busNumber ?? null;
  });
  const lastToastedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedTripId || !busNumber) return;
    if (lastToastedRef.current === selectedTripId) return;
    lastToastedRef.current = selectedTripId;
    toast.success(`Tracking Bus ${busNumber}`, {
      description: "Live position, ETA and seats will update in real time.",
      duration: 2400,
    });
  }, [selectedTripId, busNumber]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />
      <div className="relative flex-1 overflow-hidden">
        <BusMapClient />

        {/* Top overlay: route search + filters */}
        <div className="pointer-events-none absolute inset-x-0 top-4 z-[550] flex flex-col items-center gap-3 px-4">
          <RouteSearchPanel />
          <FiltersPanel />
        </div>

        {/* Bottom-left panel: either route intelligence results, or the
         *  radius-based Smart Discovery. One at a time so the UI stays
         *  focused on a single question. */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[550] flex justify-center md:inset-x-auto md:left-4 md:justify-start">
          {routeQueryActive ? <RouteResultsPanel /> : <NearbyBusesPanel />}
        </div>

        {/* Right: bus details */}
        <BusDetailsPanel />

        {/* Modal: route timeline */}
        <RouteTimeline />

        {/* Screen-reader live announcements for radar changes */}
        <LiveRadarAnnouncer />

        {/* Offline / stale-data top banner */}
        <OfflineBanner />
      </div>
    </div>
  );
}

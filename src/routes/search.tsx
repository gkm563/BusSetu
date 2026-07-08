import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
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
import { AiAssistantPanel } from "@/components/panels/AiAssistantPanel";
import { useUiStore } from "@/store/useUiStore";
import { useLiveStore } from "@/store/useLiveStore";

type SearchParams = {
  from?: string;
  to?: string;
  via?: string;
  trip?: string;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
    via: typeof search.via === "string" ? search.via : undefined,
    trip: typeof search.trip === "string" ? search.trip : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Live Map — BusSetu" },
      {
        name: "description",
        content:
          "See every bus moving live on the map. Filter by operator, seats, or route — track any trip in real time.",
      },
      { property: "og:title", content: "Live Bus Map — BusSetu" },
      {
        property: "og:description",
        content: "Real-time bus tracking across cities and highways. Powered by BusSetu.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const routeQueryActive = useUiStore((s) => s.routeQuery.active);
  const setRouteQuery = useUiStore((s) => s.setRouteQuery);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const busNumber = useLiveStore((s) => {
    if (!selectedTripId) return null;
    const trip = s.tripsById[selectedTripId];
    if (!trip) return null;
    return s.busesById[trip.busId]?.busNumber ?? null;
  });
  const lastToastedRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  // Read TanStack Router search params (from /routes navigation or bookmarked URL)
  const searchParams = useSearch({ from: "/search" });

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const { from, to, via, trip } = searchParams;

    // Pre-fill route search if from/to params present
    if (from || to) {
      setRouteQuery({ from: from ?? "", to: to ?? "", via: via ?? "" });
    }

    // Auto-select bus if trip param present
    if (trip) {
      selectTrip(trip);
    }
  }, [searchParams, setRouteQuery, selectTrip]);

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
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <BusMapClient />

        {/* Top-left Back button to home */}
        <div className="absolute left-4 top-4 z-[550]">
          <Link
            to="/"
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/60 bg-background/90 px-3.5 py-2 text-xs font-bold text-foreground shadow-md backdrop-blur-md transition-all hover:bg-accent hover:text-foreground hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>

        {/* Top overlay: route search */}
        <div className="pointer-events-none absolute inset-x-0 top-4 z-[550] flex flex-col items-center gap-3 px-4">
          <RouteSearchPanel />
        </div>

        {/* Left panel: either route intelligence results, or the
         *  radius-based Smart Discovery. One at a time so the UI stays
         *  focused on a single question. */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 md:bottom-auto md:top-28 md:left-4 md:right-auto md:inset-x-auto z-[550] flex justify-center md:justify-start">
          {routeQueryActive ? <RouteResultsPanel /> : <NearbyBusesPanel />}
        </div>

        {/* Right: bus details */}
        <BusDetailsPanel />

        {/* Modal: route timeline */}
        <RouteTimeline />

        {/* Screen-reader live announcements for radar changes */}
        <LiveRadarAnnouncer />

        {/* AI Assistant Chat Panel */}
        <AiAssistantPanel />

        {/* Offline / stale-data top banner */}
        <OfflineBanner />
    </div>
  );
}

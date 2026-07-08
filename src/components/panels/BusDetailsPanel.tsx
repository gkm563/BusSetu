import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Activity,
  BatteryCharging,
  Bus as BusIcon,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleCheck,
  Clock,
  Crown,
  Footprints,
  Gauge,
  Heart,
  Landmark,
  MapPin,
  Radio,
  Rocket,
  Route as RouteIcon,
  Share2,
  Signal,
  Snowflake,
  Sparkles,
  Ticket,
  Timer,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { useLiveBus } from "@/hooks/useLiveBus";
import { useLiveStore } from "@/store/useLiveStore";
import type { LiveBusView } from "@/types/view";
import type { BusAmenity } from "@/types/bus";
import { occupancyRatio } from "@/utils/occupancy";
import { formatEta, formatKm, formatRelative, formatFullDateTime } from "@/utils/format";
import { CatchThisBusCard, CatchThisBusModal } from "./CatchThisBusCard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { haversineKm } from "@/utils/geo";
const FAV_KEY = "bussetu.favoriteTrips";

const PANEL_T = {
  en: {
    liveTracking: "LIVE TRACKING",
    onTime: "On Time",
    delayed: "Delayed",
    nextStopEta: "Next Stop ETA",
    toReach: "to reach",
    awayFromYou: "away from your location",
    currentStop: "Current Stop",
    passed: "Passed",
    nextStop: "Next Stop",
    seatsOccupancy: "Seats & occupancy",
    plentySeats: "Plenty of seats",
    moderateCrowd: "Moderate crowd",
    veryCrowded: "Very crowded",
    standingOnly: "Standing room only",
    plentySeatsBadge: "Plenty Seats",
    moderateCrowdBadge: "Moderate",
    crowdedBadge: "Crowded",
    totalSeats: "Total seats",
    availableSeats: "Available seats",
    occupiedSeats: "Occupied seats",
    womenReserved: "Women reserved",
    standingPassengers: "Standing passengers",
    passengersOnboard: "Passengers Onboard",
    capacity: "capacity",
    farePricing: "Fare & Pricing",
    startingFrom: "Starting from",
    seatInclGst: "seat incl. GST",
    acBus: "AC Bus",
    nonAcBus: "Non-AC Bus",
    acBaseFare: "AC base fare",
    baseFare: "Base fare",
    seat: "seat",
    luggageOptional: "Luggage protection (optional)",
    luggageFlat: "Luggage protection (flat)",
    flat: "flat",
    gst: "GST",
    onSeatFare: "on seat fare",
    bookSecure: "Book & secure your seat",
    speed: "Speed",
    avg: "Avg",
    liveAnalytics: "Live analytics",
    occupancy: "Occupancy",
    avgDelay: "Avg delay",
    remaining: "Remaining",
    liveUpdated: "Live · updated just now",
    viewAllStops: "View all stops",
    timeline: "Timeline",
    origin: "Origin",
    bus: "Bus",
    destination: "Destination",
    inTransit: "In transit",
    nextStopPlaceholder: "—",
    acUpgradeOptional: "AC upgrade (optional)",
    acUpgradeSeat: "AC upgrade (optional)"
  },
  hi: {
    liveTracking: "लाइव ट्रैकिंग",
    onTime: "समय पर",
    delayed: "विलंबित",
    nextStopEta: "अगला स्टॉप ईटीए",
    toReach: "पहुंचने में",
    awayFromYou: "आपके स्थान से दूर",
    currentStop: "वर्तमान स्टॉप",
    passed: "गुज़र गया",
    nextStop: "अगला स्टॉप",
    seatsOccupancy: "सीटें और भीड़",
    plentySeats: "पर्याप्त सीटें उपलब्ध",
    moderateCrowd: "मध्यम भीड़",
    veryCrowded: "अत्यधिक भीड़",
    standingOnly: "केवल खड़े होने की जगह",
    plentySeatsBadge: "पर्याप्त सीटें",
    moderateCrowdBadge: "मध्यम भीड़",
    crowdedBadge: "भीड़भाड़",
    totalSeats: "कुल सीटें",
    availableSeats: "उपलब्ध सीटें",
    occupiedSeats: "भरी हुई सीटें",
    womenReserved: "महिला आरक्षित",
    standingPassengers: "खड़े यात्री",
    passengersOnboard: "यात्री सवार",
    capacity: "क्षमता",
    farePricing: "किराया और मूल्य निर्धारण",
    startingFrom: "शुरुआती किराया",
    seatInclGst: "प्रति सीट (जीएसटी सहित)",
    acBus: "एसी बस",
    nonAcBus: "नॉन-एसी बस",
    acBaseFare: "एसी मूल किराया",
    baseFare: "मूल किराया",
    seat: "सीट",
    luggageOptional: "सामान सुरक्षा (वैकल्पिक)",
    luggageFlat: "सामान सुरक्षा (निश्चित)",
    flat: "निश्चित",
    gst: "जीएसटी",
    onSeatFare: "सीट के किराये पर",
    bookSecure: "बुक करें और सीट सुरक्षित करें",
    speed: "गति",
    avg: "औसत",
    liveAnalytics: "लाइव विश्लेषण",
    occupancy: "भीड़ का स्तर",
    avgDelay: "औसत देरी",
    remaining: "शेष दूरी",
    liveUpdated: "लाइव · अभी अपडेट किया गया",
    viewAllStops: "सभी स्टॉप देखें",
    timeline: "समयरेखा (Timeline)",
    origin: "प्रारंभिक स्टॉप",
    bus: "बस",
    destination: "गंतव्य स्टॉप",
    inTransit: "मार्ग में",
    nextStopPlaceholder: "—",
    acUpgradeOptional: "एसी अपग्रेड (वैकल्पिक)",
    acUpgradeSeat: "एसी अपग्रेड (वैकल्पिक)"
  },
  th: {
    liveTracking: "ติดตามสด",
    onTime: "ตรงเวลา",
    delayed: "ล่าช้า",
    nextStopEta: "เวลาถึงป้ายถัดไป",
    toReach: "เพื่อไปถึง",
    awayFromYou: "ห่างจากตำแหน่งของคุณ",
    currentStop: "ป้ายปัจจุบัน",
    passed: "ผ่านแล้ว",
    nextStop: "ป้ายถัดไป",
    seatsOccupancy: "ที่นั่งและความหนาแน่น",
    plentySeats: "มีที่นั่งว่างจำนวนมาก",
    moderateCrowd: "ผู้โดยสารปานกลาง",
    veryCrowded: "ผู้โดยสารหนาแน่นมาก",
    standingOnly: "มีเฉพาะที่ยืนเท่านั้น",
    plentySeatsBadge: "ที่นั่งว่างเยอะ",
    moderateCrowdBadge: "ปานกลาง",
    crowdedBadge: "หนาแน่น",
    totalSeats: "ที่นั่งทั้งหมด",
    availableSeats: "ที่นั่งว่าง",
    occupiedSeats: "ที่นั่งมีคนจอง",
    womenReserved: "เฉพาะสตรี",
    standingPassengers: "ผู้โดยสารยืน",
    passengersOnboard: "ผู้โดยสารบนรถ",
    capacity: "ความจุ",
    farePricing: "ค่าโดยสารและราคา",
    startingFrom: "เริ่มต้นที่",
    seatInclGst: "ที่นั่ง รวม GST",
    acBus: "รถบัส AC",
    nonAcBus: "รถบัสธรรมดา",
    acBaseFare: "ค่าโดยสารปกติ AC",
    baseFare: "ค่าโดยสารปกติ",
    seat: "ที่นั่ง",
    luggageOptional: "ประกันกระเป๋า (เลือกได้)",
    luggageFlat: "ประกันกระเป๋า (ราคาเดียว)",
    flat: "คงที่",
    gst: "GST",
    onSeatFare: "ของราคาตั๋ว",
    bookSecure: "จองเพื่อล็อกที่นั่งของคุณ",
    speed: "ความเร็ว",
    avg: "เฉลี่ย",
    liveAnalytics: "การวิเคราะห์สด",
    occupancy: "ความหนาแน่น",
    avgDelay: "ดีเลย์เฉลี่ย",
    remaining: "ระยะทางที่เหลือ",
    liveUpdated: "สด · อัปเดตเมื่อสักครู่",
    viewAllStops: "ดูป้ายทั้งหมด",
    timeline: "ไทม์ไลน์",
    origin: "ต้นทาง",
    bus: "รถบัส",
    destination: "ปลายทาง",
    inTransit: "ระหว่างทาง",
    nextStopPlaceholder: "—",
    acUpgradeOptional: "อัพเกรด AC (ทางเลือก)",
    acUpgradeSeat: "อัพเกรด AC (ทางเลือก)"
  }
};

function useFavorite(tripId: string | null) {
  const [set, setSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAV_KEY);
      if (raw) setSet(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);
  const isFav = tripId ? set.has(tripId) : false;
  const toggle = () => {
    if (!tripId) return;
    const next = new Set(set);
    if (next.has(tripId)) next.delete(tripId);
    else next.add(tripId);
    setSet(next);
    try {
      window.localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };
  return { isFav, toggle };
}

export function BusDetailsPanel() {
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const openTimeline = useUiStore((s) => s.openTimeline);
  const focusRoute = useUiStore((s) => s.focusRoute);
  const focusedRouteId = useUiStore((s) => s.focusedRouteId);
  const view = useLiveBus(selectedTripId);
  const stopsById = useLiveStore((s) => s.stopsById);
  const fav = useFavorite(selectedTripId);

  return (
    <AnimatePresence>
      {view && (
        <motion.aside
          key={selectedTripId ?? "none"}
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 32, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          role="dialog"
          aria-label={`Bus ${view.bus.busNumber} details`}
          className="glass-panel pointer-events-auto absolute bottom-4 right-4 z-[600] flex max-h-[calc(100vh-8rem)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border/60 shadow-2xl md:bottom-auto md:top-28 md:right-4"
        >
          <PanelBody
            view={view}
            currentStopName={
              view.trip.currentStopId ? stopsById[view.trip.currentStopId]?.name : undefined
            }
            nextStopName={view.trip.nextStopId ? stopsById[view.trip.nextStopId]?.name : undefined}
            nextStopEta={view.trip.nextStopId ? view.trip.eta[view.trip.nextStopId] : undefined}
            onClose={() => selectTrip(null)}
            onTrackRoute={() => focusRoute(focusedRouteId === view.route.id ? null : view.route.id)}
            onOpenTimeline={openTimeline}
            routeFocused={focusedRouteId === view.route.id}
            fav={fav}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
 *  PANEL BODY
 * ============================================================ */

function PanelBody({
  view,
  currentStopName,
  nextStopName,
  nextStopEta,
  onClose,
  onTrackRoute,
  onOpenTimeline,
  routeFocused,
  fav,
}: {
  view: LiveBusView;
  currentStopName?: string;
  nextStopName?: string;
  nextStopEta?: string;
  onClose: () => void;
  onTrackRoute: () => void;
  onOpenTimeline: () => void;
  routeFocused: boolean;
  fav: { isFav: boolean; toggle: () => void };
}) {
  const { trip, bus, route } = view;
  const [bookingOpen, setBookingOpen] = useState(false);
  const speedHistory = useSampleHistory(trip.gps.speed, trip.lastUpdated, 30);
  const occHistory = useSampleHistory(
    Math.round(occupancyRatio(trip, bus) * 100),
    trip.lastUpdated,
    30,
  );
  const distanceCoveredKm = route.distanceKm * trip.routeProgress;
  const avgSpeed = useMemo(
    () =>
      speedHistory.length
        ? Math.round(speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length)
        : Math.round(trip.gps.speed),
    [speedHistory, trip.gps.speed],
  );

  const { location } = useGeolocation();
  const distanceToUserKm = useMemo(() => {
    if (!view || !location) return null;
    return haversineKm(
      { lat: location.lat, lng: location.lng },
      { lat: trip.gps.latitude, lng: trip.gps.longitude }
    );
  }, [view, location, trip.gps.latitude, trip.gps.longitude]);

  const isBookable = useMemo(() => {
    if (!view) return false;
    if (view.trip.status === "completed") return false;
    
    let userStopIndex = 0;
    if (location) {
      let minDistance = Infinity;
      view.route.stops.forEach((stop, idx) => {
        const d = Math.sqrt(Math.pow(stop.lat - location.lat, 2) + Math.pow(stop.lng - location.lng, 2));
        if (d < minDistance) {
          minDistance = d;
          userStopIndex = idx;
        }
      });
    }
    
    const userProgress = view.route.stops.length <= 1 ? 0 : userStopIndex / (view.route.stops.length - 1);
    return view.trip.routeProgress <= userProgress + 0.02;
  }, [view, location]);

  return (
    <>
      <StickyHeader view={view} onClose={onClose} fav={fav} />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {/* 1. ETA and Delay Status (More visible Delay Badge, 🟢 LIVE badge) */}
        <EtaDelayBanner
          trip={trip}
          nextStopName={nextStopName}
          nextStopEta={nextStopEta}
          distanceToUserKm={distanceToUserKm}
        />

        {/* 2. Current Stop & Next Stop */}
        <StopsDetailsCard
          currentStopName={currentStopName}
          nextStopName={nextStopName}
          nextStopEta={nextStopEta}
        />

        {/* 3. Seats (Plenty Seats - 24 Available) */}
        <SeatInformationCard view={view} />

        {/* 4. Catch This Bus (USP Action panel) */}
        <CatchThisBusCard onOpen={() => setBookingOpen(true)} />

        {/* 5. Speed, Heading, GPS Accuracy */}
        <TelemetryCard trip={trip} />



        {/* 7. Timeline (checked ticks visual Allahabad -> Naini -> Mirzapur) */}
        <CompactTimeline view={view} onExpand={onOpenTimeline} />

        {/* 8. Feature Badges (AC, Electric, etc) */}
        <FeatureBadges view={view} />

        {/* 9. Live Analytics (graphs) */}
        <LiveAnalyticsCard
          view={view}
          speedHistory={speedHistory}
          occHistory={occHistory}
          avgSpeed={avgSpeed}
          distanceCoveredKm={distanceCoveredKm}
        />

        <div className="pt-1 text-center space-y-0.5 text-muted-foreground">
          <div className="text-[11px] font-bold">
            <Signal className="mr-1 inline h-3 w-3 text-success" />
            Live · updated {formatRelative(trip.lastUpdated)}
          </div>
          <div className="text-[9px] text-slate-450 font-mono">
            {formatFullDateTime(trip.lastUpdated)}
          </div>
        </div>
      </div>

      <ActionsBar
        routeFocused={routeFocused}
        onTrackRoute={onTrackRoute}
        onCatchNearby={onOpenTimeline}
        onShare={() => shareTrip(view)}
        onBook={() => setBookingOpen(true)}
        bookable={isBookable}
      />

      <CatchThisBusModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}

/* ============================================================
 *  HEADER
 * ============================================================ */

const STATUS_STYLES: Record<string, { cls: string; icon: LucideIcon; label: string }> = {
  scheduled: { cls: "bg-muted text-muted-foreground", icon: Clock, label: "Scheduled" },
  boarding: { cls: "bg-warning/15 text-warning", icon: Users, label: "Boarding" },
  running: { cls: "bg-success/15 text-success", icon: Activity, label: "Running" },
  delayed: { cls: "bg-warning/15 text-warning", icon: Timer, label: "Delayed" },
  breakdown: { cls: "bg-danger/15 text-danger", icon: X, label: "Breakdown" },
  completed: { cls: "bg-muted text-muted-foreground", icon: CircleCheck, label: "Completed" },
};

function StickyHeader({
  view,
  onClose,
  fav,
}: {
  view: LiveBusView;
  onClose: () => void;
  fav: { isFav: boolean; toggle: () => void };
}) {
  const { trip, bus, operator } = view;
  const status = STATUS_STYLES[trip.status] ?? STATUS_STYLES.running;
  const StatusIcon = status.icon;
  const KindIcon = operator.kind === "government" ? Landmark : BusIcon;

  return (
    <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 p-4.5 backdrop-blur-xl shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand via-brand to-indigo-600 text-white shadow-md shadow-brand/25">
            <BusIcon className="h-6 w-6 animate-pulse" strokeWidth={2.2} />
            <span className="absolute -bottom-0.5 -right-0.5 grid h-4.5 w-4.5 place-items-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate font-display text-xl font-black text-slate-800 tracking-tight">
                {bus.busNumber}
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${status.cls}`}
              >
                <StatusIcon className="h-3 w-3" strokeWidth={2.5} />
                {status.label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-slate-500 font-bold">
              <span className="truncate text-slate-700">{operator.name}</span>
              <span className="text-slate-300">·</span>
              <span
                className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  operator.kind === "government"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                }`}
              >
                <KindIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
                {operator.kind}
              </span>
              {bus.busType && (
                <span className="rounded-md bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                  {bus.busType}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <IconButton
            label={fav.isFav ? "Remove favorite" : "Add favorite"}
            onClick={fav.toggle}
            active={fav.isFav}
          >
            <Heart className={`h-4.5 w-4.5 ${fav.isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500"}`} />
          </IconButton>
          <IconButton label="Share bus" onClick={() => shareTrip(view)}>
            <Share2 className="h-4.5 w-4.5 text-slate-400 hover:text-indigo-600" />
          </IconButton>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4.5 w-4.5 text-slate-400 hover:text-slate-600" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-8.5 w-8.5 place-items-center rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card cursor-pointer shadow-sm ${
        active
          ? "border-rose-200 bg-rose-50 text-rose-500 shadow-sm"
          : "border-slate-200/80 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 shadow-sm"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================
 *  LIVE STATUS STRIP
 * ============================================================ */

function getHumanOccupancy(trip: LiveBusView["trip"], bus: LiveBusView["bus"]) {
  const language = useUiStore.getState().language;
  const count = trip.passenger.occupiedSeats;
  const standing = trip.passenger.standingPassengers;
  const vacant = trip.passenger.vacantSeats;
  const ratio = Math.min(1.4, (count + standing) / bus.totalSeats);
  let level = "low";
  if (ratio >= 1) level = "packed";
  else if (ratio >= 0.75) level = "high";
  else if (ratio >= 0.4) level = "medium";

  if (language === "hi") {
    switch (level) {
      case "low":
        return { text: `पर्याप्त सीटें उपलब्ध (${vacant} खाली)`, color: "text-success", bg: "bg-success/10", val: "low" };
      case "medium":
        return { text: `सीटें उपलब्ध (${vacant} शेष)`, color: "text-warning", bg: "bg-warning/10", val: "medium" };
      case "high":
        return { text: `भीड़भाड़ (${vacant} शेष)`, color: "text-warning", bg: "bg-warning/10", val: "high" };
      default:
        return { text: `केवल खड़े होने की जगह (${standing} खड़े)`, color: "text-danger", bg: "bg-danger/10", val: "packed" };
    }
  } else if (language === "th") {
    switch (level) {
      case "low":
        return { text: `ที่นั่งว่างเยอะ (${vacant} ที่ว่าง)`, color: "text-success", bg: "bg-success/10", val: "low" };
      case "medium":
        return { text: `มีที่นั่งว่าง (${vacant} เหลือ)`, color: "text-warning", bg: "bg-warning/10", val: "medium" };
      case "high":
        return { text: `หนาแน่น (${vacant} เหลือ)`, color: "text-warning", bg: "bg-warning/10", val: "high" };
      default:
        return { text: `มีเฉพาะที่ยืน (${standing} คนยืน)`, color: "text-danger", bg: "bg-danger/10", val: "packed" };
    }
  } else {
    switch (level) {
      case "low":
        return { text: `Plenty Seats (${vacant} Available)`, color: "text-success", bg: "bg-success/10", val: "low" };
      case "medium":
        return { text: `Seats Available (${vacant} Left)`, color: "text-warning", bg: "bg-warning/10", val: "medium" };
      case "high":
        return { text: `Crowded (${vacant} Left)`, color: "text-warning", bg: "bg-warning/10", val: "high" };
      default:
        return { text: `Standing Only (${standing} Standing)`, color: "text-danger", bg: "bg-danger/10", val: "packed" };
    }
  }
}

function EtaDelayBanner({
  trip,
  nextStopName,
  nextStopEta,
  distanceToUserKm,
}: {
  trip: LiveBusView["trip"];
  nextStopName?: string;
  nextStopEta?: string;
  distanceToUserKm: number | null;
}) {
  const language = useUiStore((s) => s.language);
  const t = PANEL_T[language] || PANEL_T.en;
  const isDelayed = typeof trip.delay === "number" && trip.delay > 0;
  
  return (
    <div className="flex flex-col gap-3.5 rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/20 p-5 shadow-md shadow-indigo-100/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            {t.liveTracking}
          </span>
        </div>
        {isDelayed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-black text-amber-700 font-mono shadow-sm">
            {language === "hi" ? `विलंबित ${trip.delay} मिनट` : language === "th" ? `ล่าช้า ${trip.delay} นาที` : `Delayed ${trip.delay} min`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-700 font-mono shadow-sm">
            {t.onTime}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          {t.nextStopEta}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-brand to-indigo-600 tracking-tight">
            {nextStopEta ? formatEta(nextStopEta) : "—"}
          </span>
          <span className="text-sm text-slate-600 font-extrabold truncate">
            {t.toReach} <span className="text-slate-800 font-black">{nextStopName ?? (language === "hi" ? "अगला स्टॉप" : language === "th" ? "ป้ายถัดไป" : "next stop")}</span>
          </span>
        </div>
      </div>
      {distanceToUserKm !== null && (
        <div className="mt-1 text-xs font-extrabold text-violet-700 bg-violet-50 border border-violet-100/80 rounded-xl px-3.5 py-2 inline-flex items-center gap-2 w-fit shadow-sm">
          <span className="text-base leading-none">🚌</span>
          <span>{distanceToUserKm.toFixed(2)} km {t.awayFromYou}</span>
        </div>
      )}
    </div>
  );
}

function StopsDetailsCard({
  currentStopName,
  nextStopName,
  nextStopEta,
}: {
  currentStopName?: string;
  nextStopName?: string;
  nextStopEta?: string;
}) {
  const language = useUiStore((s) => s.language);
  const t = PANEL_T[language] || PANEL_T.en;

  return (
    <div className="grid grid-cols-2 gap-3.5">
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 flex flex-col justify-between min-w-0 shadow-sm">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
            {t.currentStop}
          </span>
          <span className="font-display font-extrabold text-[13px] text-slate-700 block mt-1.5 truncate">
            {currentStopName ?? t.inTransit}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 mt-3.5 block font-bold flex items-center gap-1">
          🏁 {t.passed}
        </span>
      </div>

      <div className="rounded-2xl border border-brand/35 bg-brand/5 p-4 flex flex-col justify-between min-w-0 shadow-sm shadow-brand/5">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-brand block">
            {t.nextStop}
          </span>
          <span className="font-display font-black text-[13px] text-brand block mt-1.5 truncate">
            {nextStopName ?? t.nextStopPlaceholder}
          </span>
        </div>
        <span className="text-[10px] text-brand mt-3.5 block font-extrabold font-mono flex items-center gap-1">
          📍 {nextStopEta ? `${formatTimeOnly(nextStopEta)}` : "—"}
        </span>
      </div>
    </div>
  );
}

function TelemetryCard({ trip }: { trip: LiveBusView["trip"] }) {
  return (
    <div className="grid grid-cols-1">
      <SpeedTile speed={trip.gps.speed} />
    </div>
  );
}

function SpeedTile({ speed }: { speed: number }) {
  const language = useUiStore((s) => s.language);
  const t = PANEL_T[language] || PANEL_T.en;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 shadow-sm hover:scale-[1.01] transition-transform">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
        <Gauge className="h-4 w-4" strokeWidth={2.5} />
        {t.speed}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-black text-rose-600 leading-none">{Math.round(speed)}</span>
        <span className="text-[9px] font-extrabold text-rose-400 uppercase tracking-wider">km/h</span>
      </div>
    </div>
  );
}



/* ============================================================
 *  LIVE LOCATION MINI-MAP (SVG based)
 * ============================================================ */

export function LiveLocationMap({ view }: { view: LiveBusView }) {
  const { route, trip } = view;
  const pts = route.polyline.length
    ? route.polyline
    : route.stops.map((s) => [s.lat, s.lng] as [number, number]);
  const bounds = useMemo(() => {
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    for (const [lat, lng] of pts) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    return { minLat, maxLat, minLng, maxLng };
  }, [pts]);

  const W = 380;
  const H = 130;
  const pad = 12;
  const dLat = Math.max(0.0001, bounds.maxLat - bounds.minLat);
  const dLng = Math.max(0.0001, bounds.maxLng - bounds.minLng);
  const project = (lat: number, lng: number) => {
    const x = pad + ((lng - bounds.minLng) / dLng) * (W - pad * 2);
    const y = pad + (1 - (lat - bounds.minLat) / dLat) * (H - pad * 2);
    return [x, y] as const;
  };

  const progress = Math.max(0, Math.min(1, trip.routeProgress));
  const splitIdx = Math.floor(progress * (pts.length - 1));
  const done = pts.slice(0, splitIdx + 1);
  const upcoming = pts.slice(splitIdx);

  const path = (arr: [number, number][]) =>
    arr
      .map(([lat, lng], i) => {
        const [x, y] = project(lat, lng);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const [bx, by] = project(trip.gps.latitude, trip.gps.longitude);
  const [ox, oy] = project(pts[0][0], pts[0][1]);
  const [dx, dy] = project(pts[pts.length - 1][0], pts[pts.length - 1][1]);

  return (
    <section aria-label="Live location" className="space-y-1.5">
      <SectionLabel icon={MapPin}>Live location</SectionLabel>
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-muted/10">
        {/* faint grid */}
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="block h-[130px] w-full"
          aria-hidden="true"
        >
          <defs>
            <pattern id="mm-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeOpacity="0.08" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#mm-grid)" className="text-foreground" />

          {/* previous route (faded) */}
          <path
            d={path(done)}
            fill="none"
            className="stroke-brand/70"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* upcoming route (dashed) */}
          <path
            d={path(upcoming)}
            fill="none"
            className="stroke-brand/40"
            strokeWidth={2}
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* origin */}
          <circle cx={ox} cy={oy} r={4} className="fill-success" />
          <circle cx={ox} cy={oy} r={7} className="fill-success/20" />
          {/* destination */}
          <circle cx={dx} cy={dy} r={4} className="fill-danger" />
          <circle cx={dx} cy={dy} r={7} className="fill-danger/20" />

          {/* current bus with pulse */}
          <circle cx={bx} cy={by} r={9} className="fill-brand/25">
            <animate attributeName="r" values="7;14;7" dur="1.8s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={bx} cy={by} r={5} className="fill-brand stroke-card" strokeWidth={2} />
        </svg>

        {/* legend */}
        <div className="pointer-events-none absolute bottom-1.5 left-1.5 flex gap-2 rounded-full bg-card/85 px-2 py-0.5 text-[9px] font-medium text-muted-foreground backdrop-blur">
          <LegendDot cls="bg-success" label="Origin" />
          <LegendDot cls="bg-brand" label="Bus" />
          <LegendDot cls="bg-danger" label="Destination" />
        </div>
      </div>
    </section>
  );
}

function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${cls}`} />
      {label}
    </span>
  );
}





function formatTimeOnly(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ============================================================
 *  SEAT INFORMATION with circular progress
 * ============================================================ */

function SeatInformationCard({ view }: { view: LiveBusView }) {
  const { trip, bus } = view;
  const language = useUiStore((s) => s.language);
  const t = PANEL_T[language] || PANEL_T.en;

  const occInfo = getHumanOccupancy(trip, bus);
  const ratio = Math.min(1, (trip.passenger.occupiedSeats + trip.passenger.standingPassengers) / bus.totalSeats);
  const pct = Math.round(ratio * 100);
  const totalOnboard = trip.passenger.occupiedSeats + trip.passenger.standingPassengers;
  const women = bus.womenSeats ?? 0;
  
  const colorVar = occInfo.val === "low" 
    ? "#10b981" 
    : occInfo.val === "medium"
      ? "#f59e0b" 
      : occInfo.val === "high"
        ? "#f97316" 
        : "#ef4444";

  return (
    <section aria-label="Seat information" className="space-y-2">
      <SectionLabel icon={Users}>{t.seatsOccupancy}</SectionLabel>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-sm">
        <div className="flex items-center gap-5">
          <CircularProgress
            value={pct}
            color={colorVar}
            centerLabel={`${pct}%`}
            sublabel={
              occInfo.val === "low" 
                ? t.plentySeatsBadge 
                : occInfo.val === "medium" 
                  ? t.moderateCrowdBadge 
                  : t.crowdedBadge
            }
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={`text-[10px] font-black uppercase tracking-wider rounded-lg px-2.5 py-0.5 inline-block border ${occInfo.bg} ${occInfo.color} ${
              occInfo.val === "low" ? "border-emerald-200" : occInfo.val === "medium" ? "border-amber-200" : occInfo.val === "high" ? "border-orange-200" : "border-red-200"
            }`}>
              {occInfo.text}
            </div>
            <div className="space-y-1">
              <SeatRow icon={Circle} label={t.totalSeats} value={bus.totalSeats} />
              <SeatRow icon={CircleCheck} label={t.availableSeats} value={trip.passenger.vacantSeats} tone="success" />
              <SeatRow icon={Users} label={t.occupiedSeats} value={trip.passenger.occupiedSeats} />
              {trip.passenger.standingPassengers > 0 && (
                <SeatRow
                  icon={Footprints}
                  label={t.standingPassengers}
                  value={trip.passenger.standingPassengers}
                  tone="warning"
                />
              )}
              {women > 0 && (
                <SeatRow icon={Sparkles} label={t.womenReserved} value={women} tone="brand" />
              )}
            </div>
          </div>
        </div>
        <div className="mt-3.5 border-t border-slate-100 pt-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {totalOnboard} {t.passengersOnboard} · {t.capacity} {bus.totalSeats + (bus.standingCapacity ?? 0)}
        </div>
      </div>
    </section>
  );
}

function SeatRow({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "brand";
}) {
  const toneClasses = {
    default: "text-slate-600 font-semibold",
    success: "text-emerald-700 font-extrabold",
    warning: "text-amber-700 font-extrabold",
    brand: "text-indigo-700 font-extrabold",
  };
  const iconClasses = {
    default: "text-slate-400",
    success: "text-emerald-500",
    warning: "text-amber-500",
    brand: "text-indigo-500",
  };
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClasses[tone]}`} />
        {label}
      </span>
      <span className={`font-mono text-sm leading-none ${toneClasses[tone]}`}>{value}</span>
    </div>
  );
}

function CircularProgress({
  value,
  color,
  centerLabel,
  sublabel,
  size = 88,
  stroke = 8,
}: {
  value: number;
  color: string;
  centerLabel: string;
  sublabel?: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", damping: 24, stiffness: 140 }}
          style={{ stroke: color }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-lg font-black text-slate-800 leading-none">{centerLabel}</div>
        {sublabel && (
          <div className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 *  FEATURE BADGES
 * ============================================================ */

const AMENITY_ICONS: Record<BusAmenity, { icon: LucideIcon; label: string; cls: string }> = {
  ac: { icon: Snowflake, label: "AC", cls: "border-sky-200 bg-sky-50 text-sky-700 font-extrabold shadow-sm" },
  electric: { icon: Zap, label: "Electric", cls: "border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold shadow-sm" },
  luxury: { icon: Crown, label: "Luxury", cls: "border-amber-200 bg-amber-50 text-amber-700 font-extrabold shadow-sm" },
  mini: { icon: BusIcon, label: "Mini", cls: "border-slate-200 bg-slate-100 text-slate-700 font-extrabold shadow-sm" },
  women_friendly: {
    icon: Sparkles,
    label: "Women friendly",
    cls: "border-rose-200 bg-rose-50 text-rose-700 font-extrabold shadow-sm",
  },
};

const FEATURE_ICON_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  usb: BatteryCharging,
  charging: BatteryCharging,
  wheelchair: Accessibility,
  express: Rocket,
  cctv: Camera,
  gps: Radio,
};

function FeatureBadges({ view }: { view: LiveBusView }) {
  const { bus } = view;
  const amenities = bus.amenities ?? [];
  const features = bus.features ?? [];
  if (amenities.length === 0 && features.length === 0) return null;
  return (
    <section aria-label="Features" className="space-y-1.5">
      <SectionLabel icon={Sparkles}>Features</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {amenities.map((a) => {
          const meta = AMENITY_ICONS[a];
          const Icon = meta.icon;
          return (
            <span
              key={a}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}
            >
              <Icon className="h-3 w-3" strokeWidth={2.4} />
              {meta.label}
            </span>
          );
        })}
        {features.map((f) => {
          const key = f.toLowerCase();
          const Icon = FEATURE_ICON_MAP[key] ?? Check;
          return (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/50 px-2 py-0.5 text-[10px] font-bold capitalize text-slate-600 shadow-sm"
            >
              <Icon className="h-3 w-3" strokeWidth={2.4} />
              {f}
            </span>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
 *  LIVE ANALYTICS
 * ============================================================ */

function LiveAnalyticsCard({
  view,
  speedHistory,
  occHistory,
  avgSpeed,
  distanceCoveredKm,
}: {
  view: LiveBusView;
  speedHistory: number[];
  occHistory: number[];
  avgSpeed: number;
  distanceCoveredKm: number;
}) {
  const { trip, route } = view;
  const [expanded, setExpanded] = useState(true);
  const remainingKm = Math.max(0, route.distanceKm - distanceCoveredKm);
  return (
    <section aria-label="Live analytics" className="space-y-1.5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        aria-expanded={expanded}
      >
        <SectionLabel icon={Activity}>Live analytics</SectionLabel>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="grid grid-cols-2 gap-2">
          <SparklineCard
            title="Speed"
            unit="km/h"
            data={speedHistory}
            current={Math.round(trip.gps.speed)}
            avg={avgSpeed}
            color="var(--color-brand)"
          />
          <SparklineCard
            title="Occupancy"
            unit="%"
            data={occHistory}
            current={Math.round(occupancyRatio(trip, view.bus) * 100)}
            avg={
              occHistory.length
                ? Math.round(occHistory.reduce((a, b) => a + b, 0) / occHistory.length)
                : 0
            }
            color="var(--color-warning)"
          />
          <AnalyticsStat
            label="Avg delay"
            value={typeof trip.averageDelayMin === "number" ? `${trip.averageDelayMin}m` : "—"}
            icon={Timer}
          />
          <AnalyticsStat label="Remaining" value={formatKm(remainingKm)} icon={RouteIcon} />
        </div>
      )}
    </section>
  );
}

function SparklineCard({
  title,
  unit,
  data,
  current,
  avg,
  color,
}: {
  title: string;
  unit: string;
  data: number[];
  current: number;
  avg: number;
  color: string;
}) {
  const W = 140;
  const H = 40;
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = Math.max(1, max - min);
  const pts = data.length
    ? data
        .map((v, i) => {
          const x = data.length === 1 ? W : (i / (data.length - 1)) * W;
          const y = H - ((v - min) / range) * H;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ")
    : "";
  const areaPath = pts
    ? `M 0 ${H} L ${pts.replace(/ /g, " L ")} L ${W} ${H} Z`
    : "";
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
          <span>{title}</span>
          <span>
            Avg {avg}
            {unit}
          </span>
        </div>
        <div className="mt-1.5 font-display text-xl font-black text-slate-800 leading-none">
          {current}
          <span className="ml-0.5 text-[10px] font-extrabold text-slate-400">{unit}</span>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="mt-3 block h-8 w-full">
        {areaPath && <path d={areaPath} fill={color} opacity="0.12" />}
        {pts && (
          <polyline
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}

function AnalyticsStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={2.4} />
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-bold leading-none">{value}</div>
    </div>
  );
}

/* ============================================================
 *  COMPACT TIMELINE
 * ============================================================ */

const compactContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const compactItemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function CompactTimeline({ view, onExpand }: { view: LiveBusView; onExpand: () => void }) {
  const { route, trip } = view;
  const stops = route.stops;
  const currentIdx = trip.currentStopId
    ? stops.findIndex((s) => s.id === trip.currentStopId)
    : trip.nextStopId
      ? Math.max(0, stops.findIndex((s) => s.id === trip.nextStopId) - 1)
      : 0;
  // Show 4 stops around current
  const start = Math.max(0, currentIdx - 1);
  const end = Math.min(stops.length, start + 4);
  const visible = stops.slice(start, end);
  return (
    <section aria-label="Timeline" className="space-y-1.5">
      <div className="flex items-center justify-between">
        <SectionLabel icon={RouteIcon}>Timeline</SectionLabel>
        <button
          type="button"
          onClick={onExpand}
          className="text-[10px] font-semibold text-brand hover:underline hover:scale-[1.03] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          View all stops
        </button>
      </div>
      <motion.ol
        variants={compactContainerVariants}
        initial="hidden"
        animate="show"
        className="relative ml-1.5 space-y-3 border-l border-dashed border-border/70 pl-4"
      >
        {visible.map((s, i) => {
          const absIdx = start + i;
          const state =
            absIdx < currentIdx ? "done" : absIdx === currentIdx ? "current" : "upcoming";
          const etaIso = trip.eta[s.id];
          return (
            <motion.li key={s.id} variants={compactItemVariants} className="relative">
              <span
                className={`absolute -left-[21px] top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full border-2 ${
                  state === "done"
                    ? "border-success bg-success"
                    : state === "current"
                      ? "border-brand bg-card"
                      : "border-border bg-card"
                }`}
              >
                {state === "done" && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                {state === "current" && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                )}
              </span>
              {state === "current" && (
                <span className="absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full border border-brand animate-ping opacity-75" />
              )}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div
                    className={`truncate text-xs font-semibold ${
                      state === "current" ? "text-brand" : "text-foreground"
                    }`}
                  >
                    {s.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{s.city}</div>
                </div>
                {etaIso && (
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] font-semibold text-foreground">
                      {formatTimeOnly(etaIso)}
                    </div>
                    {state === "upcoming" && (
                      <div className="text-[9px] text-muted-foreground">in {formatEta(etaIso)}</div>
                    )}
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </section>
  );
}

/* ============================================================
 *  ACTIONS BAR
 * ============================================================ */

function ActionsBar({
  routeFocused,
  onTrackRoute,
  onCatchNearby,
  onShare,
  onBook,
  bookable = true,
}: {
  routeFocused: boolean;
  onTrackRoute: () => void;
  onCatchNearby: () => void;
  onShare: () => void;
  onBook: () => void;
  bookable?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-slate-100 bg-white/95 p-4.5 backdrop-blur-xl shadow-lg">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onTrackRoute}
          className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card cursor-pointer shadow-sm ${
            routeFocused
              ? "bg-brand text-brand-foreground hover:bg-brand/90"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50"
          }`}
        >
          <RouteIcon className="h-4 w-4" strokeWidth={2.4} />
          {routeFocused ? "Tracking" : "Track Route"}
        </button>
        <button
          type="button"
          onClick={onCatchNearby}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-600/10 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card cursor-pointer"
        >
          <MapPin className="h-4 w-4" strokeWidth={2.4} />
          Nearby Stops
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card cursor-pointer shadow-sm"
        >
          <Share2 className="h-4 w-4" strokeWidth={2.4} />
          Share Bus
        </button>
        <button
          type="button"
          onClick={onBook}
          disabled={!bookable}
          className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
            bookable
              ? "bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.02] cursor-pointer shadow-md shadow-emerald-600/10"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50"
          }`}
        >
          <Ticket className="h-4 w-4" strokeWidth={2.4} />
          {bookable ? "Book Ticket" : "Crossed"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 *  SHARED HELPERS
 * ============================================================ */

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
      <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
      {children}
    </div>
  );
}

export function compassLabel(deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(d / 45) % 8];
}

/**
 * Rolling sample buffer keyed by `stamp`. Only pushes a new sample when the
 * stamp changes, so re-renders that don't reflect a new server tick are ignored.
 */
function useSampleHistory(value: number, stamp: string, cap = 30): number[] {
  const buffer = useRef<{ stamp: string | null; values: number[] }>({
    stamp: null,
    values: [],
  });
  const [snapshot, setSnapshot] = useState<number[]>([]);
  useEffect(() => {
    if (buffer.current.stamp === stamp) return;
    buffer.current.stamp = stamp;
    const next = [...buffer.current.values, value].slice(-cap);
    buffer.current.values = next;
    setSnapshot(next);
  }, [value, stamp, cap]);
  return snapshot;
}

async function shareTrip(view: LiveBusView) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/search?trip=${encodeURIComponent(view.trip.tripId)}`
      : "";
  const text = `Track ${view.bus.busNumber} on ${view.route.name} live on BusSetu`;
  try {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      await (navigator as Navigator).share({
        title: "BusSetu · Live bus",
        text,
        url,
      });
      return;
    }
  } catch {
    /* user cancelled */
  }
  try {
    await navigator.clipboard.writeText(url || text);
  } catch {
    /* ignore */
  }
}

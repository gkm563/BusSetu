import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  X,
  Ticket,
  Armchair,
  CheckCircle,
  AlertTriangle,
  QrCode,
} from "lucide-react";
import { useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSmartDiscovery } from "@/hooks/useSmartDiscovery";
import { useUiStore } from "@/store/useUiStore";
import { useLiveBus } from "@/hooks/useLiveBus";
import { CatchService } from "@/services/discovery/CatchService";
import { formatKm } from "@/utils/format";

function formatMin(sec: number) {
  if (sec < 60) return `${sec}s`;
  return `${Math.round(sec / 60)} min`;
}

export function CatchThisBusCard({ onOpen }: { onOpen: () => void }) {
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const radiusKm = useUiStore((s) => s.discoveryRadiusKm);
  const view = useLiveBus(selectedTripId);
  const { location, usingDemo } = useGeolocation();
  const nearby = useSmartDiscovery(location, Math.max(radiusKm, 10));

  const assessment = useMemo(
    () => (view && location ? CatchService.assess({ view, user: location }) : null),
    [view, location],
  );

  const alternative = useMemo(() => {
    if (!location || !view || !assessment || assessment.catchable) return null;
    return CatchService.recommendAlternative(
      nearby.map((n) => ({
        trip: n.trip,
        bus: n.bus,
        operator: n.operator,
        route: n.route,
      })),
      location,
      view.trip.tripId,
    );
  }, [assessment, location, nearby, view]);

  if (!view || !location || !assessment) return null;

  const catchStatus: "safe" | "tight" | "missed" =
    assessment.slackSec < -90
      ? "missed"
      : assessment.slackSec < 60
        ? "tight"
        : "safe";

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/50 p-3.5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Catch This Bus
        </div>
        {usingDemo && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Demo Location
          </span>
        )}
      </div>

      {/* Catch status banner */}
      <div className="space-y-3">
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
            catchStatus === "safe"
              ? "bg-success/15 text-success"
              : catchStatus === "tight"
                ? "bg-warning/15 text-warning"
                : "bg-danger/15 text-danger"
          }`}
        >
          {catchStatus === "safe" ? (
            <Check className="h-4 w-4" />
          ) : catchStatus === "tight" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span className="font-semibold">
            {catchStatus === "safe" && "You can catch this bus!"}
            {catchStatus === "tight" && "Close call! Walk quickly."}
            {catchStatus === "missed" && "AI Advisor: You missed this bus!"}
          </span>
          <span className="ml-auto text-[10px] font-normal opacity-85 font-mono">
            {catchStatus !== "missed" ? (
              <>+{formatMin(Math.abs(assessment.slackSec))} spare</>
            ) : (
              <>Passed</>
            )}
          </span>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-border/50 bg-background/50 p-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
              Bus Arrival
            </span>
            <span className="font-bold text-foreground text-sm font-mono">
              {formatMin(assessment.busEtaSec)}
            </span>
            <span className="text-[9px] text-muted-foreground block truncate">
              at {assessment.targetStopName}
            </span>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/50 p-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
              Walking Time
            </span>
            <span className="font-bold text-foreground text-sm font-mono">
              {formatMin(assessment.walkingSec)}
            </span>
            <span className="text-[9px] text-muted-foreground block truncate">
              {formatKm(assessment.walkingKm)} walk
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpen}
          disabled={catchStatus === "missed"}
          className={`w-full mt-1.5 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-transform ${
            catchStatus === "missed" 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-brand text-brand-foreground shadow-md shadow-brand/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          }`}
        >
          <Ticket className="h-4 w-4" />
          {catchStatus === "missed" ? "Booking Unavailable (Crossed)" : "Catch This Bus & Book Ticket"}
        </button>
      </div>

      {/* Alternative suggestion if missed */}
      {catchStatus === "missed" && alternative && (
        <div className="mt-3 rounded-xl border border-dashed border-border/70 bg-background/60 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
            <Sparkles className="h-3 w-3" />
            AI Recommended Alternative
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-semibold">
                {alternative.view.bus.busNumber}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {alternative.view.route.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold text-success">
                 {alternative.view.trip.passenger.vacantSeats}{" "}
                seats
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                ETA {formatMin(alternative.assessment.busEtaSec)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CatchThisBusModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const selectedTripId = useUiStore((s) => s.selectedTripId);
  const view = useLiveBus(selectedTripId);
  const { location } = useGeolocation();

  const [bookingStep, setBookingStep] = useState<"details" | "booking" | "ticket">("details");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerAge, setPassengerAge] = useState("");
  const [ticketCode] = useState(() => "BST" + Math.floor(100000 + Math.random() * 900000));
  const bookTicket = useUiStore((s) => s.bookTicket);

  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL("image/png");
      
      const link = document.createElement("a");
      link.href = imgData;
      const safePassengerName = passengerName.replace(/[^a-zA-Z0-9]/g, "_") || "Passenger";
      const safeBusNumber = view.bus.busNumber.replace(/[^a-zA-Z0-9]/g, "_") || "Bus";
      link.download = `BusSetu_Ticket_${safePassengerName}_${safeBusNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const assessment = useMemo(
    () => (view && location ? CatchService.assess({ view, user: location }) : null),
    [view, location],
  );

  // Seeding occupied seats deterministically based on trip occupancy
  const occupiedSeats = useMemo(() => {
    if (!view) return new Set<string>();
    const count = view.trip.passenger.occupiedSeats;
    const occupied = new Set<string>();
    const cols = ["A", "B", "C", "D"];
    let seeded = 0;
    for (let r = 1; r <= 8; r++) {
      for (const c of cols) {
        if (seeded < count && (r + c.charCodeAt(0)) % 2 === 0) {
          occupied.add(`${r}${c}`);
          seeded++;
        }
      }
    }
    return occupied;
  }, [view]);

  if (!view || !location || !assessment) return null;

  const catchStatus: "safe" | "tight" | "missed" =
    assessment.slackSec < -90
      ? "missed"
      : assessment.slackSec < 60
        ? "tight"
        : "safe";

  const handleClose = () => {
    setBookingStep("details");
    setSelectedSeats([]);
    setPassengerName("");
    setPassengerAge("");
    onClose();
  };

  const handleConfirmPay = () => {
    bookTicket({
      ticketCode,
      tripId: view.trip.tripId,
      busNumber: view.bus.busNumber,
      passengerName,
      passengerAge: Number(passengerAge) || 25,
      seatNumbers: selectedSeats,
      boardingStop: assessment.targetStopName,
      alightingStop: view.route.destination ?? "Destination",
      fare: 120 * selectedSeats.length,
      timestamp: new Date().toISOString(),
    });
    setBookingStep("ticket");
  };

  const toggleSeat = (id: string) => {
    setSelectedSeats((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex h-[90vh] md:h-[85vh] max-h-[800px] w-full max-w-lg md:max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <div>
                <h3 className="font-display text-base font-bold">Catch & Booking Intelligence</h3>
                <p className="text-[11px] text-muted-foreground">
                  Bus {view.bus.busNumber} · {view.route.name}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Steps Progress */}
            <div className="grid grid-cols-3 border-b border-border/40 text-center text-[10px] font-semibold text-muted-foreground bg-muted/20">
              <div
                className={`py-2 border-b-2 ${
                  bookingStep === "details" ? "border-brand text-brand font-bold" : "border-transparent"
                }`}
              >
                1. Timing Check
              </div>
              <div
                className={`py-2 border-b-2 ${
                  bookingStep === "booking" ? "border-brand text-brand font-bold" : "border-transparent"
                }`}
              >
                2. Seat & Info
              </div>
              <div
                className={`py-2 border-b-2 ${
                  bookingStep === "ticket" ? "border-brand text-brand font-bold" : "border-transparent"
                }`}
              >
                3. Digital Pass
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* STEP 1: Details & Timing */}
              {bookingStep === "details" && (
                <div className="space-y-4">
                  {/* Timing analysis card */}
                  <div className="rounded-2xl border border-border/70 p-4 space-y-3 bg-gradient-to-br from-card/40 to-card/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted-foreground">Route Progress</span>
                      <span className="text-xs font-bold text-foreground">
                        {Math.round(view.trip.routeProgress * 100)}% Completed
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand h-full rounded-full"
                        style={{ width: `${view.trip.routeProgress * 100}%` }}
                      />
                    </div>

                    <div className="border-t border-border/50 pt-3 flex gap-2">
                      <div className="flex-1 text-center">
                        <span className="text-[10px] text-muted-foreground block">Current Speed</span>
                        <span className="text-sm font-bold text-foreground">
                          {Math.round(view.trip.gps.speed)} km/h
                        </span>
                      </div>
                      <div className="w-px bg-border/50" />
                      <div className="flex-1 text-center">
                        <span className="text-[10px] text-muted-foreground block">GPS Status</span>
                        <span className="text-sm font-bold text-success font-mono">Active Live</span>
                      </div>
                    </div>
                  </div>

                  {/* AI advisory section */}
                  <div className="rounded-2xl border border-border bg-accent/30 p-3.5 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-brand">
                      <Sparkles className="h-4 w-4" />
                      AI Catch Advisory
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {catchStatus === "safe" &&
                        `This bus is traveling towards your nearest stop (${assessment.targetStopName}) at ${Math.round(view.trip.gps.speed)} km/h. You have plenty of time (${formatMin(assessment.slackSec)} spare) to reach the stop. Secure your seat now!`}
                      {catchStatus === "tight" &&
                        `Hurry! The bus will arrive in ${formatMin(assessment.busEtaSec)} and it will take you ${formatMin(assessment.walkingSec)} to walk there. You only have a narrow window of ${formatMin(assessment.slackSec)} spare. Walk briskly.`}
                      {catchStatus === "missed" &&
                        `Oops, you missed this bus! It has already passed the stop nearest to you. We strongly recommend booking one of the alternative buses showing under the Smart Discovery section.`}
                    </p>
                  </div>

                  <button
                    onClick={() => setBookingStep("booking")}
                    disabled={catchStatus === "missed"}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-semibold text-brand-foreground shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Choose Seat & Passenger Info →
                  </button>
                </div>
              )}

              {/* STEP 2: Seat Map Selection & Passenger Info */}
              {bookingStep === "booking" && (
                <div className="space-y-4">
                  {/* Passenger form */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Passenger Details
                    </label>
                    <div className="grid grid-cols-[1fr_80px] gap-2">
                      <input
                        type="text"
                        placeholder="Passenger Name"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-brand"
                      />
                      <input
                        type="number"
                        placeholder="Age"
                        value={passengerAge}
                        onChange={(e) => setPassengerAge(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  {/* Seat Selector Grid */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Select Seats
                      </label>
                      {selectedSeats.length > 0 && (
                        <span className="text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full font-mono">
                          Seats: {selectedSeats.join(", ")}
                        </span>
                      )}
                    </div>

                    {/* Interactive Seat Map Grid */}
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <div className="mb-3 text-[10px] font-semibold text-center text-muted-foreground border-b border-border/50 pb-2">
                        🚌 FRONT / DRIVER SIDE
                      </div>

                      {/* Columns mapping A B - C D */}
                      <div className="grid grid-cols-[30px_1.2fr_1.2fr_12px_1.2fr_1.2fr] gap-y-2 text-center items-center justify-items-center">
                        {/* Header row labels */}
                        <div />
                        <div className="text-[10px] font-bold text-muted-foreground">A</div>
                        <div className="text-[10px] font-bold text-muted-foreground">B</div>
                        <div />
                        <div className="text-[10px] font-bold text-muted-foreground">C</div>
                        <div className="text-[10px] font-bold text-muted-foreground">D</div>

                        {Array.from({ length: 8 }).map((_, rIdx) => {
                          const row = rIdx + 1;
                          const seatA = `${row}A`;
                          const seatB = `${row}B`;
                          const seatC = `${row}C`;
                          const seatD = `${row}D`;

                          return (
                            <div key={row} className="contents">
                              <div className="text-[9px] font-bold text-muted-foreground">{row}</div>
                              <SeatButton
                                id={seatA}
                                occupied={occupiedSeats.has(seatA)}
                                selected={selectedSeats.includes(seatA)}
                                onClick={() => toggleSeat(seatA)}
                              />
                              <SeatButton
                                id={seatB}
                                occupied={occupiedSeats.has(seatB)}
                                selected={selectedSeats.includes(seatB)}
                                onClick={() => toggleSeat(seatB)}
                              />
                              <div className="w-2" /> {/* Aisle space */}
                              <SeatButton
                                id={seatC}
                                occupied={occupiedSeats.has(seatC)}
                                selected={selectedSeats.includes(seatC)}
                                onClick={() => toggleSeat(seatC)}
                              />
                              <SeatButton
                                id={seatD}
                                occupied={occupiedSeats.has(seatD)}
                                selected={selectedSeats.includes(seatD)}
                                onClick={() => toggleSeat(seatD)}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex justify-center gap-4 text-[10px] text-muted-foreground border-t border-border/50 pt-3">
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-card border border-border" /> Available
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-muted-foreground/30 border border-transparent" /> Occupied
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-brand border border-brand" /> Selected
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmPay}
                    disabled={!passengerName || selectedSeats.length === 0}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-semibold text-brand-foreground shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Confirm Booking & Pay (₹{120 * (selectedSeats.length || 1)})
                  </button>
                </div>
              )}

              {/* STEP 3: Boarding Pass Ticket */}
              {bookingStep === "ticket" && (
                <div className="space-y-4 py-2">
                  <div className="text-center space-y-1">
                    <div className="inline-grid h-12 w-12 place-items-center rounded-full bg-success/20 text-success">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h4 className="font-display text-base font-bold text-foreground">Ticket Confirmed!</h4>
                    <p className="text-xs text-muted-foreground">Show this QR code to the driver upon boarding.</p>
                  </div>

                  {/* Digital Boarding Pass */}
                  <div ref={ticketRef} className="print-ticket relative rounded-[2rem] bg-card shadow-2xl shadow-brand/10 overflow-hidden mx-auto w-full max-w-[400px]">
                    {/* Fake perforations */}
                    <div className="absolute left-0 top-[4.5rem] -translate-x-1/2 h-6 w-6 rounded-full bg-background z-10" />
                    <div className="absolute right-0 top-[4.5rem] translate-x-1/2 h-6 w-6 rounded-full bg-background z-10" />
                    
                    {/* Ticket header */}
                    <div className="bg-gradient-to-r from-brand to-indigo-600 p-5 text-brand-foreground flex justify-between items-center relative">
                      <div className="flex items-center gap-2.5">
                        <img src="/favicon.jpg" alt="Logo" className="h-7 w-7 rounded-md object-cover border-2 border-white/30 bg-white shadow-sm" />
                        <span className="font-display font-bold text-sm tracking-widest uppercase text-white drop-shadow-sm">BusSetu Pass</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-md text-white/90 tracking-wider shadow-inner">{ticketCode}</span>
                    </div>

                    {/* Ticket body */}
                    <div className="p-6 space-y-5 text-xs bg-[linear-gradient(to_bottom,var(--color-card)_0%,color-mix(in_oklab,var(--color-muted)_30%,transparent)_100%)] relative">
                      <div className="absolute inset-x-4 top-0 border-t-2 border-dashed border-border/40" />
                      
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-widest mb-1.5">Passenger</span>
                          <span className="font-display font-semibold text-base text-foreground truncate block drop-shadow-sm">
                            {passengerName || "User"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-widest mb-1.5">Seat Number(s)</span>
                          <span className="font-mono font-bold text-lg text-brand block drop-shadow-sm">
                            {selectedSeats.join(", ")}
                          </span>
                        </div>
                      </div>

                      <div className="border-t-2 border-dashed border-border/60 pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-widest mb-1.5">Nearest Stop</span>
                          <span className="font-medium text-foreground truncate block text-[13px]">
                            {assessment.targetStopName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-widest mb-1.5">Boarding ETA</span>
                          <span className="font-mono font-semibold text-foreground block text-[13px]">
                            {formatMin(assessment.busEtaSec)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t-2 border-dashed border-border/60 pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-widest mb-1.5">Fare Price</span>
                          <span className="font-bold text-success text-base block">₹{120 * (selectedSeats.length || 1)}.00</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-widest mb-1.5">Status</span>
                          <span className="font-bold text-success flex items-center justify-end gap-1.5 text-sm">
                            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            CONFIRMED
                          </span>
                        </div>
                      </div>

                      {/* Barcode/QR Section */}
                      <div className="border-t-2 border-dashed border-border/60 pt-5 flex flex-col items-center justify-center gap-2">
                        <div className="rounded-2xl bg-white p-3 shadow-md border border-black/5 ring-1 ring-black/5">
                          <QrCode className="h-20 w-20 text-black" />
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase mt-1">
                          scan on bus entry
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-xs font-semibold text-foreground shadow-sm hover:bg-accent cursor-pointer"
                    >
                      Print Ticket
                    </button>
                    <button
                      onClick={downloadTicket}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-xs font-semibold text-foreground shadow-sm hover:bg-accent disabled:opacity-50 cursor-pointer"
                    >
                      {isDownloading ? "Generating..." : "Download Ticket"}
                    </button>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-semibold text-brand-foreground shadow-md hover:bg-brand/90 cursor-pointer"
                  >
                    Done & Back to Map
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SeatButton({
  id,
  occupied,
  selected,
  onClick,
}: {
  id: string;
  occupied: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={`Seat ${id}`}
      aria-label={`Seat ${id}`}
      disabled={occupied}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-lg border text-[10px] font-bold transition-all ${
        occupied
          ? "bg-muted-foreground/15 border-transparent text-muted-foreground/40 cursor-not-allowed"
          : selected
            ? "bg-brand border-brand text-brand-foreground shadow-sm shadow-brand/20 scale-105"
            : "bg-card border-border hover:border-brand/50 hover:bg-brand/5 text-foreground cursor-pointer"
      }`}
    >
      <Armchair className="h-4 w-4" />
    </button>
  );
}

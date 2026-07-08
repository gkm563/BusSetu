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
  Trash2,
  Shield,
  Snowflake,
  UserPlus,
} from "lucide-react";
import { useMemo, useState, useRef } from "react";
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

  const { userStopIndex, userProgress } = useMemo(() => {
    if (!view || !location) return { userStopIndex: 0, userProgress: 0 };
    let minDistance = Infinity;
    let idx = 0;
    view.route.stops.forEach((stop, i) => {
      const d = Math.sqrt(Math.pow(stop.lat - location.lat, 2) + Math.pow(stop.lng - location.lng, 2));
      if (d < minDistance) {
        minDistance = d;
        idx = i;
      }
    });
    const progress = view.route.stops.length <= 1 ? 0 : idx / (view.route.stops.length - 1);
    return { userStopIndex: idx, userProgress: progress };
  }, [view, location]);

  const hasCrossed = view ? view.trip.routeProgress > userProgress + 0.02 : false;

  const catchStatus: "safe" | "tight" | "missed" =
    !view
      ? "missed"
      : view.trip.status === "completed" || hasCrossed
        ? "missed"
        : view.trip.currentStopId === view.route.stops[userStopIndex]?.id
          ? "tight"
          : "safe";

  const alternative = useMemo(() => {
    if (!location || !view || !assessment || catchStatus !== "missed") return null;
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
  }, [assessment, location, nearby, view, catchStatus]);

  if (!view || !location || !assessment) return null;

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
  const [passengers, setPassengers] = useState<{ name: string; age: string; seatNumber: string }[]>([
    { name: "", age: "", seatNumber: "1A" }
  ]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(["1A"]);
  const [acUpgrade, setAcUpgrade] = useState(false);
  const [luggageUpgrade, setLuggageUpgrade] = useState(false);
  const [ticketCode] = useState(() => "BST" + Math.floor(100000 + Math.random() * 900000));
  const bookTicket = useUiStore((s) => s.bookTicket);
  const selectTrip = useUiStore((s) => s.selectTrip);

  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const assessment = useMemo(
    () => (view && location ? CatchService.assess({ view, user: location }) : null),
    [view, location],
  );

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

  const { userStopIndex, userProgress } = useMemo(() => {
    if (!view || !location) return { userStopIndex: 0, userProgress: 0 };
    let minDistance = Infinity;
    let idx = 0;
    view.route.stops.forEach((stop, i) => {
      const d = Math.sqrt(Math.pow(stop.lat - location.lat, 2) + Math.pow(stop.lng - location.lng, 2));
      if (d < minDistance) {
        minDistance = d;
        idx = i;
      }
    });
    const progress = view.route.stops.length <= 1 ? 0 : idx / (view.route.stops.length - 1);
    return { userStopIndex: idx, userProgress: progress };
  }, [view, location]);

  if (!view || !location || !assessment) return null;

  const hasCrossed = view ? view.trip.routeProgress > userProgress + 0.02 : false;

  const catchStatus: "safe" | "tight" | "missed" =
    !view
      ? "missed"
      : view.trip.status === "completed" || hasCrossed
        ? "missed"
        : view.trip.currentStopId === view.route.stops[userStopIndex]?.id
          ? "tight"
          : "safe";

  const handleClose = () => {
    setBookingStep("details");
    setSelectedSeats([]);
    setPassengers([{ name: "", age: "", seatNumber: "" }]);
    setAcUpgrade(false);
    setLuggageUpgrade(false);
    onClose();
  };

  // Fare calculation — base rate depends on whether bus has AC built-in
  const busHasAc = view.bus.amenities?.includes("ac") ?? false;
  const baseRatePerSeat = busHasAc ? 170 : 120;   // ₹170 for AC bus, ₹120 regular
  const acAddonRate = (!busHasAc && acUpgrade) ? 50 : 0;  // AC addon only if bus isn't AC
  const farePerSeat = baseRatePerSeat + acAddonRate;
  // ✅ Use passengers.length — always ≥ 1, not selectedSeats (may be 0 if map not used)
  const seatCount = passengers.length;
  const seatSubtotal = farePerSeat * seatCount;
  const luggageFee = luggageUpgrade ? 30 : 0;
  const gst = Math.round(seatSubtotal * 0.05);     // 5% GST on seat fares only
  const totalFare = seatSubtotal + luggageFee + gst;

  const handleConfirmPay = () => {
    bookTicket({
      ticketCode,
      tripId: view.trip.tripId,
      busNumber: view.bus.busNumber,
      passengerName: passengers.map(p => p.name).join(", "),
      passengerAge: Number(passengers[0]?.age) || 25,
      seatNumbers: selectedSeats,
      boardingStop: assessment.targetStopName,
      alightingStop: view.route.destination ?? "Destination",
      fare: totalFare,
      timestamp: new Date().toISOString(),
    });
    setBookingStep("ticket");
  };

  const handleTrackLive = () => {
    selectTrip(view.trip.tripId);
    handleClose();
  };

  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatId);
      if (isSelected) {
        setPassengers((p) => p.filter((x) => x.seatNumber !== seatId));
        return prev.filter((s) => s !== seatId);
      } else {
        setPassengers((p) => [...p, { name: "", age: "", seatNumber: seatId }]);
        return [...prev, seatId];
      }
    });
  };

  const handleAddPassenger = () => {
    // Find next available seat not already taken
    const cols = ["A", "B", "C", "D"];
    let nextSeat = "";
    outer: for (let r = 1; r <= 8; r++) {
      for (const c of cols) {
        const id = `${r}${c}`;
        if (!occupiedSeats.has(id) && !selectedSeats.includes(id)) {
          nextSeat = id;
          break outer;
        }
      }
    }
    if (!nextSeat) return; // no free seats
    setSelectedSeats((prev) => [...prev, nextSeat]);
    setPassengers((prev) => [...prev, { name: "", age: "", seatNumber: nextSeat }]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return; // always keep at least 1
    const seatToRemove = passengers[index].seatNumber;
    setSelectedSeats((prev) => prev.filter((s) => s !== seatToRemove));
    setPassengers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updatePassenger = (index: number, field: "name" | "age", value: string) => {
    setPassengers((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p))
    );
  };

  // Draw the ticket directly on a canvas using Canvas 2D API.
  // This completely bypasses html2canvas and its oklch incompatibility with Tailwind v4.
  const drawTicketCanvas = (): HTMLCanvasElement => {
    const SCALE = 3;
    const W = 420;
    const pCount = passengers.length;
    // Calculate total height based on content
    const HEADER_H = 72;
    const BODY_PAD = 24;
    const LABEL_H = 22;
    const PASSENGER_H = 52;
    const DIVIDER_H = 24;
    const INFO_ROW_H = 52;
    const QR_H = 140;
    const FOOTER_H = 28;
    const TOTAL_H =
      HEADER_H +
      BODY_PAD +
      LABEL_H +
      pCount * PASSENGER_H +
      DIVIDER_H +
      INFO_ROW_H +
      DIVIDER_H +
      INFO_ROW_H +
      DIVIDER_H +
      QR_H +
      FOOTER_H +
      BODY_PAD;

    const canvas = document.createElement("canvas");
    canvas.width = W * SCALE;
    canvas.height = TOTAL_H * SCALE;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(SCALE, SCALE);

    // Helpers
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };
    const dashedLine = (x1: number, y: number, x2: number) => {
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
      ctx.restore();
    };
    const label = (text: string, x: number, y: number, align: CanvasTextAlign = "left") => {
      ctx.save();
      ctx.fillStyle = "#94a3b8";
      ctx.font = `700 8.5px 'Arial', sans-serif`;
      ctx.textAlign = align;
      ctx.fillText(text.toUpperCase(), x, y);
      ctx.restore();
    };
    const value = (text: string, x: number, y: number, color = "#1e293b", size = 12, bold = true, mono = false) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = `${bold ? "700" : "500"} ${size}px ${mono ? "monospace" : "'Arial', sans-serif"}`;
      ctx.fillText(text, x, y);
      ctx.restore();
    };
    const valueRight = (text: string, x: number, y: number, color = "#1e293b", size = 12, bold = true, mono = false) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = `${bold ? "700" : "500"} ${size}px ${mono ? "monospace" : "'Arial', sans-serif"}`;
      ctx.textAlign = "right";
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    // ── White background ─────────────────────────────────────────────────
    ctx.fillStyle = "#ffffff";
    rr(0, 0, W, TOTAL_H, 0);
    ctx.fill();

    // ── Header gradient ───────────────────────────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#f97316");
    grad.addColorStop(1, "#4f46e5");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, HEADER_H);

    // Bus icon box
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    rr(20, 20, 32, 32, 7);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    rr(20, 20, 32, 32, 7);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.fillText("🚌", 24, 43);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillText("BusSetu Pass", 62, 42);

    // Ticket code badge
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    rr(W - 110, 24, 94, 24, 6);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(ticketCode, W - 20, 41);
    ctx.textAlign = "left";

    // ── Notch cutouts ─────────────────────────────────────────────────────
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(0, HEADER_H + 1, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W, HEADER_H + 1, 12, 0, Math.PI * 2);
    ctx.fill();

    // ── Body ──────────────────────────────────────────────────────────────
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, HEADER_H, W, TOTAL_H - HEADER_H);

    let y = HEADER_H + BODY_PAD;

    // Passenger details label
    label("Passenger Details", 24, y);
    y += LABEL_H;

    // Passenger rows
    passengers.forEach((p, idx) => {
      ctx.fillStyle = "#ffffff";
      rr(16, y, W - 32, PASSENGER_H - 6, 10);
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      rr(16, y, W - 32, PASSENGER_H - 6, 10);
      ctx.stroke();

      value(`${p.name}  (${p.age} Yrs)`, 28, y + 22, "#1e293b", 13);
      label(`Passenger ${idx + 1}`, 28, y + 37);

      // Seat badge
      ctx.fillStyle = "#eef2ff";
      rr(W - 100, y + 10, 76, 24, 7);
      ctx.fill();
      valueRight(`Seat ${p.seatNumber}`, W - 28, y + 27, "#4f46e5", 12, true, true);

      y += PASSENGER_H;
    });

    y += 8;

    // Divider
    dashedLine(16, y, W - 16);
    y += DIVIDER_H;

    // Stop + ETA
    label("Nearest Stop", 24, y);
    label("Boarding ETA", W - 24, y, "right");
    y += 16;
    value(assessment.targetStopName, 24, y, "#1e293b", 12, false);
    valueRight(formatMin(assessment.busEtaSec), W - 24, y, "#1e293b", 12, true, true);
    y += INFO_ROW_H - 16;

    // Divider
    dashedLine(16, y, W - 16);
    y += DIVIDER_H;

    // Fare + Status
    label("Total Fare", 24, y);
    label("Status", W - 24, y, "right");
    y += 16;
    value(`\u20B9${totalFare}.00`, 24, y, "#16a34a", 20, true, true);

    // Status dot
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(W - 24 - 84, y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    valueRight("CONFIRMED", W - 24, y, "#16a34a", 12);
    y += INFO_ROW_H - 16;

    // Divider
    dashedLine(16, y, W - 16);
    y += DIVIDER_H;

    // QR placeholder (simple grid pattern)
    const qrSize = 88;
    const qrX = (W - qrSize) / 2;
    ctx.fillStyle = "#ffffff";
    rr(qrX - 14, y - 8, qrSize + 28, qrSize + 28, 14);
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    rr(qrX - 14, y - 8, qrSize + 28, qrSize + 28, 14);
    ctx.stroke();

    // Draw a simple QR-like grid
    ctx.fillStyle = "#1e293b";
    const m = 8; // module size
    const pat = [
      [1,1,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,1,0],
      [1,0,1,1,1,0,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,0],
      [1,0,1,1,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,0],
      [1,1,1,1,1,1,1,0,1,0,1],
      [0,0,0,0,0,0,0,0,0,1,0],
      [1,0,1,1,0,0,1,0,1,1,1],
      [0,1,0,0,1,0,0,1,0,0,1],
      [1,1,0,1,0,1,1,0,1,1,0],
    ];
    pat.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (cell) ctx.fillRect(qrX + ci * m, y + ri * m, m - 1, m - 1);
      });
    });
    y += qrSize + 28;

    // Scan text
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SCAN ON BUS ENTRY", W / 2, y);
    ctx.textAlign = "left";

    return canvas;
  };



  const downloadTicketPng = () => {
    setIsDownloading(true);
    try {
      const canvas = drawTicketCanvas();
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      const name = (passengers[0]?.name || "Passenger").replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `BusSetu_Pass_${name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PNG error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadTicketPdf = () => {
    setIsDownloading(true);
    try {
      const canvas = drawTicketCanvas();
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgW = 150;
      const imgH = (canvas.height * imgW) / canvas.width;
      pdf.addImage(imgData, "PNG", (210 - imgW) / 2, 20, imgW, imgH);
      const name = (passengers[0]?.name || "Passenger").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`BusSetu_Pass_${name}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const isFormValid = passengers.length > 0 && passengers.every(p => p.name.trim() !== "" && p.age.trim() !== "");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex h-[90vh] md:h-[85vh] max-h-[820px] w-full max-w-lg md:max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
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
                  {/* ── Passengers Section ── */}
                  <div className="space-y-2.5">
                    {/* Header row with - count + controls */}
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5" />
                        Passengers
                      </label>
                      {/* ± counter */}
                      <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-2xl px-1 py-1">
                        <button
                          type="button"
                          onClick={() => handleRemovePassenger(passengers.length - 1)}
                          disabled={passengers.length <= 1}
                          className="h-7 w-7 rounded-xl bg-white border border-border/60 shadow-sm flex items-center justify-center text-slate-600 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title="Remove last passenger"
                        >
                          <span className="text-base font-black leading-none">−</span>
                        </button>
                        <span className="w-6 text-center font-mono text-sm font-black text-foreground">{passengers.length}</span>
                        <button
                          type="button"
                          onClick={handleAddPassenger}
                          disabled={passengers.length >= 8}
                          className="h-7 w-7 rounded-xl bg-brand text-white shadow-sm flex items-center justify-center hover:bg-brand/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title="Add passenger"
                        >
                          <span className="text-base font-black leading-none">+</span>
                        </button>
                      </div>
                    </div>

                    {/* Passenger rows */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {passengers.map((p, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-border/50 bg-white/60 backdrop-blur-sm p-3 space-y-2 shadow-sm"
                        >
                          {/* Row header: Passenger N + seat badge + remove */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-brand text-white text-[9px] font-black flex items-center justify-center">
                                {idx + 1}
                              </div>
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wide">
                                Passenger {idx + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Seat badge */}
                              <span className="font-mono text-[10px] font-extrabold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">
                                {p.seatNumber || "—"}
                              </span>
                              {/* Per-passenger fare chip */}
                              <span className="font-mono text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                ₹{farePerSeat}
                              </span>
                              {/* Remove button — hidden for first passenger */}
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePassenger(idx)}
                                  className="h-6 w-6 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Name + Age inputs */}
                          <div className="grid grid-cols-[1fr_80px] gap-2">
                            <input
                              type="text"
                              placeholder={`Name`}
                              value={p.name}
                              onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                              className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-brand font-medium"
                            />
                            <input
                              type="number"
                              placeholder="Age"
                              min={1}
                              max={120}
                              value={p.age}
                              onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                              className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-brand font-medium"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seat Selector Grid */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                        Select Seats
                      </label>
                      {selectedSeats.length > 0 && (
                        <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full font-mono">
                          Selected: {selectedSeats.join(", ")}
                        </span>
                      )}
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/20 p-3">
                      <div className="mb-2 text-[9px] font-black tracking-widest text-center text-muted-foreground/60 border-b border-border/40 pb-1.5 uppercase">
                        🚌 Front / Driver Side
                      </div>

                      <div className="grid grid-cols-[24px_1fr_1fr_12px_1fr_1fr] gap-y-1.5 text-center items-center justify-items-center">
                        <div />
                        <div className="text-[9px] font-black text-muted-foreground/50">A</div>
                        <div className="text-[9px] font-black text-muted-foreground/50">B</div>
                        <div />
                        <div className="text-[9px] font-black text-muted-foreground/50">C</div>
                        <div className="text-[9px] font-black text-muted-foreground/50">D</div>

                        {Array.from({ length: 8 }).map((_, rIdx) => {
                          const row = rIdx + 1;
                          const seatA = `${row}A`;
                          const seatB = `${row}B`;
                          const seatC = `${row}C`;
                          const seatD = `${row}D`;

                          return (
                            <div key={row} className="contents">
                              <div className="text-[9px] font-black text-muted-foreground/45">{row}</div>
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
                              <div className="w-2" />
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
                    </div>
                  </div>

                  {/* Add-ons: AC (only if bus has no AC) & Luggage */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* AC toggle — hidden if bus already has AC built-in */}
                    {!busHasAc ? (
                      <button
                        type="button"
                        onClick={() => setAcUpgrade(prev => !prev)}
                        className={`flex items-center justify-between border rounded-2xl p-3 text-left transition-all cursor-pointer ${
                          acUpgrade
                            ? "border-sky-300 bg-sky-50/50 shadow-sm"
                            : "border-border bg-card hover:bg-muted/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Snowflake className={`h-4 w-4 ${acUpgrade ? "text-sky-500 animate-spin" : "text-muted-foreground"}`} />
                          <div>
                            <span className="text-[11px] font-black block">AC Cabin</span>
                            <span className="text-[9px] text-muted-foreground block">+₹50/passenger</span>
                          </div>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${acUpgrade ? "border-sky-500 bg-sky-500 text-white" : "border-border bg-card"}`}>
                          {acUpgrade && <Check className="h-2.5 w-2.5" />}
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 border border-sky-200 bg-sky-50/60 rounded-2xl p-3">
                        <Snowflake className="h-4 w-4 text-sky-500" />
                        <div>
                          <span className="text-[11px] font-black text-sky-700 block">AC Included</span>
                          <span className="text-[9px] text-sky-500 block">Built-in premium</span>
                        </div>
                        <Check className="h-3.5 w-3.5 text-sky-500 ml-auto" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setLuggageUpgrade(prev => !prev)}
                      className={`flex items-center justify-between border rounded-2xl p-3 text-left transition-all cursor-pointer ${
                        luggageUpgrade
                          ? "border-indigo-300 bg-indigo-50/50 shadow-sm"
                          : "border-border bg-card hover:bg-muted/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 ${luggageUpgrade ? "text-indigo-500" : "text-muted-foreground"}`} />
                        <div>
                          <span className="text-[11px] font-black block">Luggage Ins.</span>
                          <span className="text-[9px] text-muted-foreground block">+₹30 flat</span>
                        </div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${luggageUpgrade ? "border-indigo-500 bg-indigo-500 text-white" : "border-border bg-card"}`}>
                        {luggageUpgrade && <Check className="h-2.5 w-2.5" />}
                      </div>
                    </button>
                  </div>

                  {/* Fare Details Breakdown — always visible, based on passenger count */}
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 space-y-2 text-[11px]">
                    <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-2">Fare Breakdown</div>

                    {/* Per-passenger base */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">
                        {busHasAc ? "AC Base fare" : "Base fare"} ({seatCount} passenger{seatCount > 1 ? "s" : ""} × ₹{baseRatePerSeat})
                      </span>
                      <span className="font-mono font-bold text-slate-800">₹{seatCount * baseRatePerSeat}</span>
                    </div>

                    {/* AC addon */}
                    {!busHasAc && acUpgrade && (
                      <div className="flex justify-between items-center text-sky-600">
                        <span className="flex items-center gap-1">
                          <Snowflake className="h-3 w-3" />
                          AC upgrade ({seatCount} × ₹50)
                        </span>
                        <span className="font-mono font-bold">+₹{seatCount * 50}</span>
                      </div>
                    )}

                    {/* Luggage */}
                    {luggageUpgrade && (
                      <div className="flex justify-between items-center text-indigo-600">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Luggage protection (flat)
                        </span>
                        <span className="font-mono font-bold">+₹30</span>
                      </div>
                    )}

                    {/* GST */}
                    <div className="flex justify-between items-center text-slate-400">
                      <span>GST @ 5%</span>
                      <span className="font-mono font-bold">+₹{gst}</span>
                    </div>

                    {/* Total */}
                    <div className="border-t border-emerald-200 pt-2 flex justify-between items-center">
                      <div>
                        <span className="text-sm font-black text-slate-800">Total Payable</span>
                        <span className="block text-[9px] text-slate-400 font-semibold">
                          {seatCount} passenger{seatCount > 1 ? "s" : ""} · all charges incl.
                        </span>
                      </div>
                      <span className="font-mono text-xl font-black text-emerald-600">₹{totalFare}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmPay}
                    disabled={!isFormValid}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-semibold text-brand-foreground shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Confirm Booking & Pay (₹{totalFare})
                  </button>
                </div>
              )}

              {/* STEP 3: Boarding Pass Ticket */}
              {bookingStep === "ticket" && (
                <div className="space-y-4 py-2">
                  {/* Success Header Banner */}
                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-black text-slate-800">Booking Confirmed!</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Conductor will scan QR code on boarding</p>
                    </div>
                  </div>

                  {/* Digital Boarding Pass Wrapper */}
                  <div
                    ref={ticketRef}
                    style={{
                      background: "#ffffff",
                      borderRadius: "1.5rem",
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      margin: "0 auto",
                      width: "100%",
                      maxWidth: "400px",
                      position: "relative",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Notch Cutouts */}
                    <div style={{ position: "absolute", left: 0, top: "5rem", transform: "translateX(-50%)", height: 24, width: 24, borderRadius: "50%", background: "#f8fafc", border: "1px solid #e2e8f0", zIndex: 10 }} />
                    <div style={{ position: "absolute", right: 0, top: "5rem", transform: "translateX(50%)", height: 24, width: 24, borderRadius: "50%", background: "#f8fafc", border: "1px solid #e2e8f0", zIndex: 10 }} />

                    {/* 1. Header (BusSetu Smart Bus Ticket) */}
                    <div style={{ background: "linear-gradient(135deg, #f97316 0%, #4f46e5 100%)", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ height: 32, width: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "16px" }}>🎫</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 900, fontSize: 15, color: "#fff", display: "block", lineHeight: 1.2 }}>BusSetu</span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Smart Bus Ticket</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, background: "rgba(0,0,0,0.2)", padding: "3px 8px", borderRadius: 6, color: "#fff", display: "block" }}>{ticketCode}</span>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginTop: 2, display: "block" }}>ID: BST-{view.trip.tripId.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>

                    {/* 2. QR Code (Most Important) & 3. Ticket Status */}
                    <div style={{ background: "#f8fafc", padding: "1.25rem", borderBottom: "2px dashed #e2e8f0", display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ background: "#ffffff", padding: 10, borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", flexShrink: 0 }}>
                        <QrCode style={{ height: 84, width: 84, color: "#1e293b" }} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ height: 8, width: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
                          <span style={{ fontSize: 11, fontWeight: 900, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em" }}>🟢 Confirmed</span>
                        </div>
                        <div style={{ fontSize: 9, color: "#64748b", fontWeight: 600, lineHeight: 1.4 }}>
                          Conductor scan karega.<br />Please keep this screen open on boarding.
                        </div>
                        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                          {["🟢 Confirmed", "🟡 Boarding", "🔵 In Journey"].map((s, idx) => {
                            const isCurrent = idx === 0; // Confirmed is current state
                            return (
                              <span
                                key={s}
                                style={{
                                  fontSize: 7.5,
                                  background: isCurrent ? "#eef2ff" : "#f1f5f9",
                                  border: isCurrent ? "1px solid #c7d2fe" : "1px solid #e2e8f0",
                                  borderRadius: 4,
                                  padding: "2px 5px",
                                  color: isCurrent ? "#4f46e5" : "#64748b",
                                  fontWeight: 700
                                }}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Ticket Content Body */}
                    <div style={{ background: "#ffffff", fontSize: 12, color: "#334155" }}>
                      
                      {/* 4. Passenger Details */}
                      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 8.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>👤 Passenger Details</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {passengers.map((p, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: 12 }}>
                              <div>
                                <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 12.5 }}>{p.name || `Passenger ${idx + 1}`}</div>
                                <div style={{ fontSize: 8.5, color: "#94a3b8", fontWeight: 600, marginTop: 1 }}>ID: PSN-{idx + 1}092 · Phone: +91 ******99</div>
                              </div>
                              <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5", fontSize: 11.5, background: "#eef2ff", padding: "2px 8px", borderRadius: 6 }}>Seat {p.seatNumber}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. Journey Details */}
                      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 8.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>🗺️ Journey Details</span>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 8, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>From</span>
                            <span style={{ display: "block", fontWeight: 800, color: "#1e293b", fontSize: 12, marginTop: 1 }}>{view.route.origin ?? "Prayagraj Bus Stand"}</span>
                            <span style={{ display: "block", fontSize: 10, color: "#64748b", marginTop: 2, fontFamily: "monospace" }}>Dep: 08:30 AM</span>
                          </div>
                          <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <span style={{ fontSize: 14 }}>➔</span>
                            <span style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700 }}>08 Jul 2026</span>
                          </div>
                          <div style={{ flex: 1, textAlign: "right" }}>
                            <span style={{ fontSize: 8, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>To</span>
                            <span style={{ display: "block", fontWeight: 800, color: "#1e293b", fontSize: 12, marginTop: 1 }}>{view.route.destination ?? "Lucknow Charbagh"}</span>
                            <span style={{ display: "block", fontSize: 10, color: "#64748b", marginTop: 2, fontFamily: "monospace" }}>Arr: 12:15 PM</span>
                          </div>
                        </div>
                      </div>

                      {/* 6. Bus Details & 7. Seat Details */}
                      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                          <span style={{ fontSize: 8.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>🚌 Bus Details</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: "#64748b" }}>Bus No:</span><span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>{view.bus.busNumber}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: "#64748b" }}>Operator:</span><span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>{view.operator.name}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: "#64748b" }}>Type:</span><span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>{view.bus.busType ?? "AC Seater"}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: "#64748b" }}>Driver:</span><span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>Ram Singh</span></div>
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: 8.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>💺 Seat Details</span>
                          {passengers.slice(0, 1).map((p, i) => {
                            const seatLetter = p.seatNumber.slice(-1);
                            const isWindow = seatLetter === "A" || seatLetter === "D";
                            return (
                              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: "#64748b" }}>Coach:</span><span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>A</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: "#64748b" }}>Seat:</span><span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>{p.seatNumber}</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: "#64748b" }}>Window Seat:</span><span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>{isWindow ? "YES" : "NO"}</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: "#64748b" }}>Women Res:</span><span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>NO</span></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 9. Boarding Information & 10. Drop Point */}
                      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 8.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>📍 Terminal &amp; Boarding Info</span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: 8 }}>
                            <span style={{ fontSize: 7.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Boarding Stop</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#1e293b", display: "block", marginTop: 1 }}>{assessment.targetStopName}</span>
                            <span style={{ fontSize: 8, color: "#4f46e5", fontWeight: 700, display: "block", marginTop: 2 }}>Rep: 08:15 AM · Platform 3</span>
                          </div>
                          <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: 8 }}>
                            <span style={{ fontSize: 7.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Drop Point</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#1e293b", display: "block", marginTop: 1 }}>{view.route.destination ?? "Lucknow Charbagh"}</span>
                            <span style={{ fontSize: 8, color: "#16a34a", fontWeight: 700, display: "block", marginTop: 2 }}>Exp Arr: 12:15 PM</span>
                          </div>
                        </div>
                      </div>

                      {/* 11. Fare Details & 12. Payment */}
                      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                        <span style={{ fontSize: 8.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>💳 Fare Breakdown &amp; Payment</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 9.5, color: "#64748b" }}>Ticket Base ({seatCount} × ₹{baseRatePerSeat})</span>
                            <span style={{ fontSize: 9.5, fontWeight: 600, color: "#1e293b", fontFamily: "monospace" }}>₹{seatCount * baseRatePerSeat}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 9.5, color: "#64748b" }}>GST (5%)</span>
                            <span style={{ fontSize: 9.5, fontWeight: 600, color: "#64748b", fontFamily: "monospace" }}>₹{gst}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 9.5, color: "#64748b" }}>Convenience Fee</span>
                            <span style={{ fontSize: 9.5, fontWeight: 600, color: "#64748b", fontFamily: "monospace" }}>₹10</span>
                          </div>
                          <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <span style={{ fontSize: 11, fontWeight: 900, color: "#1e293b", display: "block" }}>Total Amount</span>
                              <span style={{ fontSize: 8.5, color: "#16a34a", fontWeight: 700 }}>🟢 UPI Paid · Txn: TXN-{ticketCode}</span>
                            </div>
                            <span style={{ fontSize: 18, fontWeight: 900, color: "#16a34a", fontFamily: "monospace" }}>₹{totalFare + 10}</span>
                          </div>
                        </div>
                      </div>

                      {/* 13. Live Status */}
                      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 8.5, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>📡 Live Radar Info</span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                          <div style={{ background: "#f8fafc", padding: "6px", borderRadius: 8, textAlign: "center" }}>
                            <span style={{ fontSize: 7, color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>Current Bus</span>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#1e293b", display: "block", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{view.trip.currentStopId ? "Naini Junction" : "Origin"}</span>
                          </div>
                          <div style={{ background: "#f8fafc", padding: "6px", borderRadius: 8, textAlign: "center" }}>
                            <span style={{ fontSize: 7, color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>ETA to You</span>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#f97316", display: "block", marginTop: 2 }}>{formatMin(assessment.busEtaSec)}</span>
                          </div>
                          <div style={{ background: "#f8fafc", padding: "6px", borderRadius: 8, textAlign: "center" }}>
                            <span style={{ fontSize: 7, color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>Current Delay</span>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#ef4444", display: "block", marginTop: 2 }}>{view.trip.delay ?? 3} Mins</span>
                          </div>
                        </div>
                      </div>

                      {/* 🌟 BusSetu Exclusive: Live Seat & Progress & Occupancy */}
                      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                        <span style={{ fontSize: 8.5, color: "#4f46e5", textTransform: "uppercase", fontWeight: 900, letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>🌟 BusSetu Exclusives</span>
                        
                        {/* Live Seat indicator */}
                        <div style={{ display: "flex", gap: 6, alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", padding: "6px 10px", borderRadius: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 10 }}>🟢</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>Live Seat Indicator: Seat {passengers.map(p => p.seatNumber).join(", ")} is occupied by You</span>
                        </div>

                        {/* Occupancy */}
                        {(() => {
                          const occupancyPct = Math.round(((view.trip.passenger.occupiedSeats + view.trip.passenger.standingPassengers) / view.bus.totalSeats) * 100);
                          return (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontSize: 9.5, color: "#64748b", fontWeight: 600 }}>Current Occupancy</span>
                                <span style={{ fontSize: 9.5, color: "#4f46e5", fontWeight: 800 }}>{occupancyPct}%</span>
                              </div>
                              <div style={{ height: 6, background: "#cbd5e1", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${occupancyPct}%`, background: "linear-gradient(to right, #4f46e5, #8b5cf6)", borderRadius: 3 }} />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Journey progress map/stops */}
                        <div>
                          <span style={{ fontSize: 8, color: "#94a3b8", display: "block", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Live Journey Progress</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto", paddingBottom: 2 }}>
                            {view.route.stops.slice(0, 5).map((stop, idx) => {
                              const stopProgress = view.route.stops.length <= 1 ? 0 : idx / (view.route.stops.length - 1);
                              const isPassed = view.trip.routeProgress > stopProgress + 0.02;
                              const isCurrent = Math.abs(view.trip.routeProgress - stopProgress) < 0.05;
                              return (
                                <div key={stop.id} style={{ display: "flex", alignItems: "center", flex: idx < 4 ? 1 : "initial" }}>
                                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                                    <div style={{ height: 8, width: 8, borderRadius: "50%", background: isPassed ? "#22c55e" : isCurrent ? "#f97316" : "#cbd5e1", margin: "0 auto" }} />
                                    <span style={{ fontSize: 7, fontWeight: 700, color: isPassed ? "#22c55e" : isCurrent ? "#f97316" : "#94a3b8", display: "block", marginTop: 2 }}>{stop.name.split(" ")[0]}</span>
                                    <span style={{ fontSize: 6, display: "block", marginTop: 1 }}>{isPassed ? "✅" : isCurrent ? "🟢" : "↓"}</span>
                                  </div>
                                  {idx < 4 && <div style={{ height: 1, background: isPassed ? "#22c55e" : "#cbd5e1", flex: 1, minWidth: 20, marginBottom: 12 }} />}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* 14. Emergency & 15. Rules */}
                      <div style={{ padding: "1rem 1.25rem", background: "#ffffff", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ background: "#fff5f5", border: "1px solid #fee2e2", padding: "8px", borderRadius: 10 }}>
                          <span style={{ fontSize: 8.5, color: "#ef4444", fontWeight: 800, textTransform: "uppercase", display: "block" }}>🆘 Emergency</span>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: "#1e293b", display: "block", marginTop: 2 }}>BusSetu Support</span>
                          <button
                            type="button"
                            onClick={() => alert("SOS Triggered! Dispatching emergency response to bus coordinates.")}
                            style={{
                              marginTop: 4,
                              background: "#dc2626",
                              color: "#ffffff",
                              fontSize: 8,
                              fontWeight: 900,
                              padding: "3px 8px",
                              borderRadius: 4,
                              border: "none",
                              cursor: "pointer"
                            }}
                          >
                            TRIGGER SOS
                          </button>
                        </div>
                        <div style={{ background: "#f0f9ff", border: "1px solid #e0f2fe", padding: "8px", borderRadius: 10 }}>
                          <span style={{ fontSize: 8.5, color: "#0284c7", fontWeight: 800, textTransform: "uppercase", display: "block" }}>📋 Rules</span>
                          <span style={{ fontSize: 7.5, color: "#64748b", display: "block", marginTop: 2, lineHeight: 1.3 }}>
                            • No Smoking<br />
                            • Carry Valid Govt ID<br />
                            • Report 15 min early
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Footer bar */}
                    <div style={{ background: "linear-gradient(135deg, #f97316 0%, #4f46e5 100%)", padding: "0.5rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em" }}>🚌 BusSetu Smart Mobility</span>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.7)" }}>{ticketCode}</span>
                    </div>
                  </div>

                  {/* 8. Live Tracking Button ⭐ */}
                  <button
                    onClick={handleTrackLive}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition-transform cursor-pointer"
                  >
                    📡 TRACK LIVE BUS ON RADAR ➔
                  </button>

                  {/* Download Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={downloadTicketPng}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-white py-3 text-[11px] font-black text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                    >
                      📷 Save as PNG
                    </button>
                    <button
                      onClick={downloadTicketPdf}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50 py-3 text-[11px] font-black text-indigo-700 shadow-sm hover:bg-indigo-100 disabled:opacity-50 cursor-pointer"
                    >
                      📄 Download PDF
                    </button>
                  </div>
                  
                  <button
                    onClick={handleClose}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-100 border border-slate-200/60 py-3 text-xs font-black text-slate-700 hover:bg-slate-200/80 cursor-pointer"
                  >
                    Done · Back to Map 🗺️
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
          ? "bg-muted-foreground/15 border-transparent text-muted-foreground/45 cursor-not-allowed"
          : selected
            ? "bg-brand border-brand text-brand-foreground shadow-sm shadow-brand/20 scale-105"
            : "bg-card border-border hover:border-brand/50 hover:bg-brand/5 text-foreground cursor-pointer"
      }`}
    >
      <Armchair className="h-4 w-4" />
    </button>
  );
}

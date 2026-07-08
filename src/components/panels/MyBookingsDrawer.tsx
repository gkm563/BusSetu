import { motion, AnimatePresence } from "framer-motion";
import { Ticket, X, ArrowRight, ShieldCheck, QrCode } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { useLiveStore } from "@/store/useLiveStore";
import { formatEta } from "@/utils/format";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";

interface MyBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyBookingsDrawer({ isOpen, onClose }: MyBookingsDrawerProps) {
  const bookedTickets = useUiStore((s) => s.bookedTickets);
  const tripsById = useLiveStore((s) => s.tripsById);
  const routesById = useLiveStore((s) => s.routesById);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1050] bg-black"
          />

          {/* Slide over */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-[1060] w-full max-w-sm border-l border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-brand" />
                <h3 className="font-display font-bold text-sm text-foreground">
                  My Booked Passes ({bookedTickets.length})
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {bookedTickets.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
                  <Ticket className="h-10 w-10 mx-auto text-muted-foreground/30 stroke-[1.2]" />
                  <p>No booked boarding passes found.</p>
                  <p className="text-[10px]">Select a bus on the map to book your seat.</p>
                </div>
              ) : (
                bookedTickets.map((t) => {
                  const trip = tripsById[t.tripId];
                  const route = routesById[trip?.routeId ?? ""];
                  
                  // Live calculations for the booked bus
                  const speed = trip ? Math.round(trip.gps.speed) : 0;
                  const currentStopName = trip?.currentStopId 
                    ? route?.stops.find((s) => s.id === trip.currentStopId)?.name 
                    : null;
                  
                  const targetEtaIso = trip?.eta[trip.nextStopId ?? ""];
                  const liveEtaText = targetEtaIso 
                    ? formatEta(targetEtaIso)
                    : "Live";

                  return (
                    <TicketCard
                      key={t.ticketCode}
                      t={t}
                      trip={trip}
                      route={route}
                      liveEtaText={liveEtaText}
                      currentStopName={currentStopName}
                      speed={speed}
                    />
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TicketCard({ t, trip, route, liveEtaText, currentStopName, speed }: any) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    try {
      const node = ticketRef.current;
      const rect = node.getBoundingClientRect();

      const clone = node.cloneNode(true) as HTMLElement;

      // Strip all CSS classes so Tailwind v4 oklch() vars don't break html2canvas
      clone.removeAttribute("class");
      clone.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));

      clone.style.position = "fixed";
      clone.style.top = "-9999px";
      clone.style.left = "-9999px";
      clone.style.width = rect.width + "px";
      clone.style.zIndex = "-1";
      clone.style.pointerEvents = "none";
      document.body.appendChild(clone);

      let canvas;
      try {
        canvas = await html2canvas(clone, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: rect.width,
          height: clone.scrollHeight,
          windowWidth: rect.width,
          onclone: (clonedDoc, clonedEl) => {
            // Strip all stylesheets so html2canvas never parses oklch() from Tailwind v4
            clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((s) => s.remove());
            clonedEl.removeAttribute("class");
            clonedEl.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));
            const reset = clonedDoc.createElement("style");
            reset.textContent = "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }";
            clonedDoc.head.appendChild(reset);
          },
        });
      } finally {
        document.body.removeChild(clone);
      }

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      const safePassengerName = (t.passengerName || "Passenger").replace(/[^a-zA-Z0-9]/g, "_");
      const safeBusNumber = (t.busNumber || "Bus").replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `BusSetu_Ticket_${safePassengerName}_${safeBusNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed: " + String(err));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={ticketRef}
        className="print-ticket relative rounded-2xl border border-border bg-card/40 p-4 shadow-sm overflow-hidden flex flex-col gap-3.5 hover:border-brand/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-1 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <img src="/favicon.jpg" alt="Logo" className="h-4 w-4 rounded" />
            <span className="font-display font-bold text-xs uppercase text-foreground tracking-wide">BusSetu Ticket</span>
          </div>
          <span className="font-mono text-[9px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
            {t.ticketCode}
          </span>
        </div>
        
        {/* Ticket header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] font-bold text-brand uppercase tracking-wider">
              🚌 {t.busNumber}
            </span>
            <h4 className="font-display font-bold text-xs text-foreground mt-0.5">
              {t.boardingStop} <ArrowRight className="inline-block h-3 w-3 mx-1 text-muted-foreground" /> {t.alightingStop}
            </h4>
          </div>
        </div>

        {/* Passenger details */}
        <div className="grid grid-cols-3 gap-2 text-[10px] border-t border-border/50 pt-2.5">
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Passenger</span>
            <span className="font-semibold text-foreground truncate block">{t.passengerName}</span>
          </div>
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Seat(s)</span>
            <span className="font-mono font-bold text-brand block">{t.seatNumbers?.join(", ")}</span>
          </div>
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Fare</span>
            <span className="font-semibold text-success block">₹{t.fare}</span>
          </div>
        </div>

        {/* Dynamic Telemetry Status */}
        {trip ? (
          <div className="rounded-xl bg-brand/5 border border-brand/10 p-2.5 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[8px] uppercase font-bold">
                  Live Tracking Status
                </span>
                <span className="font-medium text-foreground truncate block">
                  {currentStopName ? `Near ${currentStopName}` : `${speed} km/h`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[8px] uppercase font-bold">ETA</span>
              <span className="font-mono font-bold text-brand">{liveEtaText}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-muted/40 p-2 text-center text-[9px] text-muted-foreground">
            Bus offline · Trip completed
          </div>
        )}

        {/* QR Button stub */}
        <div className="flex items-center justify-between border-t border-dashed border-border/70 pt-2.5">
          <span className="text-[9px] text-success font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Booked Live
          </span>
          <QrCode className="h-5 w-5 text-muted-foreground/60" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-accent cursor-pointer"
        >
          Print
        </button>
        <button
          onClick={downloadTicket}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-accent disabled:opacity-50 cursor-pointer"
        >
          {isDownloading ? "Generating..." : "Download Ticket"}
        </button>
      </div>
    </div>
  );
}

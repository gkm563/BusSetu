import { motion, AnimatePresence } from "framer-motion";
import { Ticket, X, ArrowRight, ShieldCheck, QrCode } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { useLiveStore } from "@/store/useLiveStore";
import { formatEta } from "@/utils/format";

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
                    <div
                      key={t.ticketCode}
                      className="relative rounded-2xl border border-border bg-card/40 p-4 shadow-sm overflow-hidden flex flex-col gap-3.5 hover:border-brand/40 transition-colors"
                    >
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
                        <span className="font-mono text-[9px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {t.ticketCode}
                        </span>
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

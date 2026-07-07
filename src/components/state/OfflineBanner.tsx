import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Slim top-of-viewport banner shown when the browser reports offline.
 * Cached radar data stays visible underneath — this only signals that
 * new positions/ETAs may be stale.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          role="status"
          aria-live="polite"
          className="pointer-events-auto absolute left-1/2 top-3 z-[700] flex -translate-x-1/2 items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3.5 py-1.5 text-[12px] font-semibold text-warning shadow-lg backdrop-blur-md"
        >
          <WifiOff className="h-3.5 w-3.5" aria-hidden />
          You&rsquo;re offline · showing last known positions
        </motion.div>
      )}
    </AnimatePresence>
  );
}

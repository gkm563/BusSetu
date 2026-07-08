import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Radar } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Sticky "Try the Live Radar" bar that appears once the hero scrolls out
 * of view, keeping the primary action one tap away on long landing scroll.
 */
export function StickyRadarBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(560px,calc(100vw-1.5rem))] items-center justify-between gap-3 rounded-full border border-border/60 bg-background/85 px-4 py-2.5 shadow-xl backdrop-blur-xl"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <Radar className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-foreground">
                Ready to track a bus?
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                Live positions and ETAs are one tap away.
              </div>
            </div>
          </div>
          <Link
            to="/search"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-[12px] font-semibold text-brand-foreground shadow-md transition-transform hover:scale-[1.03]"
          >
            Open Map
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

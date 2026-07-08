import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Radar } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/30 blur-[120px]" />
      </div>
      <div className="mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-brand via-[oklch(0.5_0.22_255)] to-[oklch(0.45_0.20_270)] p-10 text-brand-foreground shadow-[0_40px_120px_-30px_rgba(37,99,235,0.6)] sm:p-16"
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
          >
            <defs>
              <pattern id="cta-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M36 0H0V36" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Radar is live now
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Ready to track every bus?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              Open the live map and see the entire fleet moving in real time — right now.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/search"
                search={{ trip: "t-alld-lko-03", from: "Prayagraj", to: "Lucknow", via: "Mirzapur" }}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand shadow-lg transition-transform hover:scale-[1.03]"
              >
                <Radar className="h-4 w-4" />
                Open Live Map
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/routes"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                Explore Routes
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

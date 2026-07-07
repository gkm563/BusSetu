import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, PlayCircle, Radar, Users } from "lucide-react";
import { useState } from "react";
import { HeroRadarInteractive, RadarDemoModal } from "./HeroRadarInteractive";

const TRUST = [
  { icon: Radar, label: "Live Tracking" },
  { icon: Clock, label: "Real-Time ETA" },
  { icon: MapPin, label: "Nearby Buses" },
  { icon: Users, label: "Seat Availability" },
];

export function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <section className="relative overflow-hidden pt-10 sm:pt-14 lg:pt-20">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[640px] rounded-full bg-success/10 blur-3xl" />
      </div>
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.1] text-foreground [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
      >
        <defs>
          <pattern id="hero-page-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0H0V44" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-page-grid)" />
      </svg>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:pb-24 lg:pb-28">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Live · 150+ buses streaming now
            </div>

            <h1 className="mt-5 font-display text-[40px] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[68px]">
              Track any bus,{" "}
              <span className="bg-gradient-to-r from-brand via-[oklch(0.62_0.20_245)] to-[oklch(0.68_0.16_195)] bg-clip-text text-transparent">
                live.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Know when it arrives, where it is, and whether there&rsquo;s a seat &mdash; from one
              live radar.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/radar"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/30 transition-transform hover:scale-[1.03] sm:w-auto"
              >
                <Radar className="h-4 w-4" />
                Open Live Radar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/70 bg-card/70 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-accent sm:w-auto"
              >
                <PlayCircle className="h-4 w-4" />
                Watch 30&#8209;sec demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-md">
              {TRUST.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-2 rounded-2xl border border-border/50 bg-card/60 px-3 py-2 text-[11px] font-medium text-muted-foreground backdrop-blur-sm"
                >
                  <div className="grid h-6 w-6 place-items-center rounded-lg bg-brand/10 text-brand">
                    <t.icon className="h-3 w-3" />
                  </div>
                  <span className="truncate">{t.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column: radar */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-brand/20 via-transparent to-success/10 blur-2xl" />
            <HeroRadarInteractive />
          </motion.div>
        </div>
      </div>
      <RadarDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}

import { motion } from "framer-motion";
import { Compass, Filter, Navigation, Radar, Sparkles, Timer } from "lucide-react";

const FEATURES = [
  {
    icon: Radar,
    title: "Live Bus Radar",
    body: "Every bus, every trip — moving on a live map, refreshed second by second.",
    accent: "brand",
    art: RadarArt,
  },
  {
    icon: Navigation,
    title: "Nearby Buses",
    body: "See which buses are coming towards you and which just crossed your stop.",
    accent: "success",
    art: NearbyArt,
  },
  {
    icon: Compass,
    title: "Route Intelligence",
    body: "Search origin, destination, or a via stop to find the exact right run.",
    accent: "brand",
    art: RouteArt,
  },
  {
    icon: Timer,
    title: "Real-Time ETA",
    body: "Live arrival estimates at every stop — with punctuality history.",
    accent: "warning",
    art: EtaArt,
  },
  {
    icon: Filter,
    title: "Smart Filters",
    body: "AC, government, women-friendly, seats available — filter the entire fleet live.",
    accent: "brand",
    art: FilterArt,
  },
  {
    icon: Sparkles,
    title: "Catch This Bus",
    body: "Tells you whether you can walk to a stop in time — before the bus arrives.",
    accent: "success",
    art: CatchArt,
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Product
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Built like FlightRadar — for buses.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Certainty for passengers. Intelligence for operators. All from one live surface.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-24px_rgba(37,99,235,0.35)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-70">
                <f.art />
              </div>
              <div className="relative pt-32">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    f.accent === "success"
                      ? "bg-success/10 text-success"
                      : f.accent === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-brand/10 text-brand"
                  }`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Mini SVG illustrations for each feature card ------------- */

function RadarArt() {
  return (
    <svg viewBox="0 0 400 160" className="h-full w-full text-brand">
      <defs>
        <radialGradient id="ra-g" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="160" fill="url(#ra-g)" />
      {[40, 80, 120].map((r) => (
        <circle
          key={r}
          cx="200"
          cy="120"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.28"
        />
      ))}
      <circle cx="200" cy="120" r="6" fill="currentColor" />
      <g className="animate-pulse">
        <circle cx="130" cy="90" r="3.5" fill="currentColor" />
        <circle cx="270" cy="80" r="3.5" fill="currentColor" />
        <circle cx="230" cy="60" r="3.5" fill="currentColor" />
      </g>
    </svg>
  );
}

function NearbyArt() {
  return (
    <svg viewBox="0 0 400 160" className="h-full w-full text-success">
      <defs>
        <linearGradient id="na-g" x1="0" x2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 20 120 Q 150 40 380 100" stroke="url(#na-g)" strokeWidth="3" fill="none" />
      <circle
        cx="200"
        cy="90"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />
      <circle
        cx="200"
        cy="90"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <circle cx="200" cy="90" r="5" fill="currentColor" />
      <circle cx="90" cy="110" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="310" cy="95" r="4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function RouteArt() {
  return (
    <svg viewBox="0 0 400 160" className="h-full w-full text-brand">
      <path
        d="M 40 130 L 140 130 L 200 70 L 300 70 L 360 130"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.85"
      />
      {[
        [40, 130],
        [140, 130],
        [200, 70],
        [300, 70],
        [360, 130],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="5"
          fill="var(--color-background)"
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function EtaArt() {
  return (
    <svg viewBox="0 0 400 160" className="h-full w-full text-warning">
      <circle
        cx="200"
        cy="90"
        r="52"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        opacity="0.15"
      />
      <path
        d="M 200 38 A 52 52 0 1 1 148 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <text
        x="200"
        y="98"
        textAnchor="middle"
        className="font-display"
        fontSize="26"
        fontWeight="700"
        fill="currentColor"
      >
        4m
      </text>
    </svg>
  );
}

function FilterArt() {
  return (
    <svg viewBox="0 0 400 160" className="h-full w-full text-brand">
      {["AC", "Gov", "Women", "Seats"].map((t, i) => (
        <g key={t} transform={`translate(${60 + i * 78} ${72})`}>
          <rect
            width="70"
            height="32"
            rx="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity={0.4 + i * 0.15}
          />
          <text
            x="35"
            y="21"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="currentColor"
            opacity={0.7}
          >
            {t}
          </text>
        </g>
      ))}
    </svg>
  );
}

function CatchArt() {
  return (
    <svg viewBox="0 0 400 160" className="h-full w-full text-success">
      <path
        d="M 40 130 Q 200 40 360 120"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="6 6"
        opacity="0.6"
      />
      <g transform="translate(90 110)">
        <circle r="14" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <circle r="6" fill="currentColor" />
      </g>
      <g transform="translate(320 110)">
        <rect x="-14" y="-8" width="28" height="16" rx="4" fill="currentColor" />
        <circle
          cx="-8"
          cy="10"
          r="3"
          fill="var(--color-background)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="8"
          cy="10"
          r="3"
          fill="var(--color-background)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}

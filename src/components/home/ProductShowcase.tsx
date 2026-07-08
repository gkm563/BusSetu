import { motion } from "framer-motion";
import { ArrowRight, Bus as BusIcon, Compass, Gauge, MapPin, Users, Zap } from "lucide-react";
import { HeroRadar } from "./HeroRadar";

/**
 * A large product showcase that mimics the actual BusSetu radar UI —
 * frame it in a browser-window chrome and layer real-looking side
 * panels over a stylized live map.
 */
export function ProductShowcase() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            The Product
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            One live surface. Everything you need.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Live map, bus details, timeline, nearby discovery — designed to answer "when is my bus?"
            in a single glance.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Ambient glow */}
          <div className="absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-br from-brand/25 via-transparent to-success/15 blur-3xl" />

          <div className="overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-[0_40px_100px_-40px_rgba(37,99,235,0.45)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 border-b border-border/60 bg-card/80 px-4 py-3 backdrop-blur-md">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-center text-[11px] text-muted-foreground">
                bussetu.app/search
              </div>
              <div className="hidden gap-1 sm:flex">
                <span className="h-6 w-14 rounded-md bg-muted/70" />
              </div>
            </div>

            {/* Body */}
            <div className="relative aspect-[16/10] w-full">
              <div className="absolute inset-0 p-0">
                <HeroRadar compact />
              </div>

              {/* Left: Nearby panel mockup */}
              <div className="pointer-events-none absolute bottom-4 left-4 hidden w-[280px] md:block">
                <NearbyMock />
              </div>

              {/* Right: Bus details mockup */}
              <div className="pointer-events-none absolute right-4 top-4 hidden w-[300px] md:block">
                <BusDetailsMock />
              </div>
            </div>
          </div>

          {/* Feature callouts */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CALLOUTS.map((c) => (
              <div
                key={c.title}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <c.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-sm font-semibold">{c.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.body}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const CALLOUTS = [
  {
    icon: MapPin,
    title: "Nearby awareness",
    body: "Buses ranked by direction, distance, and seats.",
  },
  {
    icon: Compass,
    title: "Route intelligence",
    body: "Trip timeline, upcoming stops, and live ETAs.",
  },
  {
    icon: Zap,
    title: "Catch This Bus",
    body: "Instantly know if you can walk to a stop in time.",
  },
];

function NearbyMock() {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/90 p-3 shadow-2xl backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 text-brand">
          <Zap className="h-3.5 w-3.5" />
        </div>
        <div className="text-[11px] font-semibold">Smart Discovery</div>
        <span className="ml-auto rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand">
          5 km
        </span>
      </div>
      {[
        { n: "UP-70 3204", d: "0.8 km", t: "4 min", s: "success" },
        { n: "UP-70 1121", d: "1.4 km", t: "9 min", s: "warning" },
        { n: "MP-09 8442", d: "2.2 km", t: "14 min", s: "muted" },
      ].map((b, i) => (
        <div
          key={i}
          className="mb-1.5 flex items-center gap-2 rounded-xl border border-border/50 bg-card/80 p-2"
        >
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-brand-foreground">
            <BusIcon className="h-3 w-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-semibold">{b.n}</div>
            <div className="text-[9px] text-muted-foreground">{b.d} away</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold">{b.t}</div>
            <div className="text-[9px] text-muted-foreground">ETA</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BusDetailsMock() {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/90 p-3 shadow-2xl backdrop-blur-md">
      <div className="flex items-start gap-2 border-b border-border/60 pb-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-brand-foreground">
          <BusIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-xs font-semibold">UP-70 3204</span>
            <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-success">
              Running
            </span>
          </div>
          <div className="text-[9px] text-muted-foreground">UPSRTC · Government</div>
        </div>
      </div>
      <div className="mt-2.5">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Route
        </div>
        <div className="mt-0.5 text-[11px] font-medium">Prayagraj → Mirzapur</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/5 rounded-full bg-brand" />
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
          <span>Civil Lines</span>
          <span>Mirzapur</span>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {[
          { icon: Gauge, label: "42", sub: "km/h" },
          { icon: Users, label: "18", sub: "seats" },
          { icon: Compass, label: "N", sub: "→" },
        ].map((m, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-card/80 p-1.5 text-center">
            <m.icon className="mx-auto h-3 w-3 text-muted-foreground" />
            <div className="font-display text-[11px] font-semibold">{m.label}</div>
            <div className="text-[8px] text-muted-foreground">{m.sub}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 rounded-lg bg-brand/5 p-1.5 text-[9px] font-medium text-brand">
        <ArrowRight className="h-2.5 w-2.5" /> Next stop: Naini · 3 min
      </div>
    </div>
  );
}

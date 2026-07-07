import { motion } from "framer-motion";
import { ArrowRight, MapPin, Radar, Ticket } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: MapPin,
    title: "Search destination",
    body: "Type where you're going. We surface the routes and buses that serve it.",
  },
  {
    n: "02",
    icon: Radar,
    title: "See live buses",
    body: "Every matching bus, live on the radar with seats, ETA and direction.",
  },
  {
    n: "03",
    icon: Ticket,
    title: "Track and board",
    body: "Follow your bus, walk to the stop with confidence, and board on time.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border/60 bg-card/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            How it works
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Three taps to your bus.
          </h2>
        </div>

        <div className="relative grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-8">
                <div className="pointer-events-none absolute -right-6 -top-6 font-display text-[110px] font-bold leading-none text-brand/5">
                  {s.n}
                </div>
                <div className="relative">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-md shadow-brand/30">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden md:block">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
                    className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-background p-1.5 text-brand shadow"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

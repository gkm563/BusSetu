import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "I stopped standing at the bus stop guessing. I now leave home the exact moment I need to.",
    name: "Aditi Sharma",
    role: "Daily commuter · Prayagraj",
    avatarColor: "oklch(0.72 0.15 20)",
  },
  {
    quote: "BusSetu feels like magic. It's the FlightRadar for buses I've been waiting for.",
    name: "Rahul Mehta",
    role: "Student · Mirzapur",
    avatarColor: "oklch(0.68 0.18 260)",
  },
  {
    quote: "The nearby discovery is uncanny — it always finds the exact right bus in seconds.",
    name: "Neha Kapoor",
    role: "Office worker · Varanasi",
    avatarColor: "oklch(0.7 0.18 150)",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Loved by riders
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            The bus stop, upgraded.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-md sm:p-7"
            >
              <div className="pointer-events-none absolute -right-6 -top-8 font-display text-[120px] leading-none text-brand/5">
                "
              </div>
              <div className="relative">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-full font-display text-sm font-semibold text-white"
                    style={{ background: t.avatarColor }}
                  >
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{t.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

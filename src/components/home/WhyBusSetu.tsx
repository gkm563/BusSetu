import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const WITHOUT = [
  "No live tracking",
  "Unknown arrival time",
  "No nearby bus awareness",
  "Guesswork at the stop",
  "No seat information",
];

const WITH = [
  "Live location, second-by-second",
  "Real-time ETA at every stop",
  "Buses coming towards you, ranked",
  "Smart discovery + catch-this-bus",
  "Live seat availability",
];

export function WhyBusSetu() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Why BusSetu
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Certainty replaces guesswork.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Without BusSetu
            </div>
            <ul className="space-y-3">
              {WITHOUT.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-danger/10 text-danger">
                    <X className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/5 via-card to-success/5 p-6 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.5)] sm:p-8"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-foreground">
                With BusSetu
              </div>
              <ul className="space-y-3">
                {WITH.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

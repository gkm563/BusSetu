import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const STATS = [
  { value: 150, suffix: "+", label: "Live Buses" },
  { value: 30, suffix: "+", label: "Routes" },
  { value: 20, suffix: "+", label: "Cities" },
  { value: 99, suffix: "%", label: "Tracking Accuracy" },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative border-y border-border/60 bg-card/40 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Network Status
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            The pulse of the road, in numbers
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} active={inView} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  suffix,
  label,
  active,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  active: boolean;
  delay: number;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 30, stiffness: 80 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (active) mv.set(value);
  }, [active, mv, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-7"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative font-display text-4xl font-semibold sm:text-5xl">
        <motion.span>{display}</motion.span>
        <span className="text-brand">{suffix}</span>
      </div>
      <div className="relative mt-2 text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

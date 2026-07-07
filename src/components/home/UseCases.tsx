import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  LandPlot,
  Map,
  Users,
  Waypoints,
} from "lucide-react";

const CASES = [
  { icon: Briefcase, label: "Daily commuters", tint: "brand" },
  { icon: GraduationCap, label: "Students", tint: "success" },
  { icon: Map, label: "Tourists", tint: "warning" },
  { icon: Building2, label: "Office workers", tint: "brand" },
  { icon: Heart, label: "Women", tint: "danger" },
  { icon: Users, label: "Families", tint: "success" },
  { icon: Waypoints, label: "Operators", tint: "brand" },
  { icon: LandPlot, label: "Government", tint: "warning" },
];

const TINT = {
  brand: "bg-brand/10 text-brand",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
} as const;

export function UseCases() {
  return (
    <section className="border-y border-border/60 bg-card/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Built for everyone on the road
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            One platform. Every rider.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {CASES.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${TINT[c.tint as keyof typeof TINT]}`}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{c.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

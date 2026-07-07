import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ = [
  {
    q: "How does BusSetu know where every bus is?",
    a: "Buses stream GPS via the operator's tracking system or the driver app. BusSetu ingests those signals in real time and renders them on the live radar.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. Rider access — live map, nearby buses, ETAs, filters — is free forever. Operators subscribe for fleet intelligence and analytics.",
  },
  {
    q: "How accurate are the ETAs?",
    a: "ETAs use live speed, traffic, route geometry and historical punctuality per route. Accuracy is typically within a couple of minutes on active routes.",
  },
  {
    q: "Can I book a seat from BusSetu?",
    a: "Not yet — booking is coming soon. Today you can see live seat availability so you know before you board.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. BusSetu is a fully responsive web app designed to feel native on any phone, with a dedicated mobile-first radar layout.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-t border-border/60 bg-card/40 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            FAQ
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Quick answers.</h2>
        </div>
        <div className="space-y-2.5">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isOpen ? "border-brand/40 bg-card" : "border-border/60 bg-card/70"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-[15px] font-semibold">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180 text-brand" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Radio, Route as RouteIcon, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BusSetu" },
      {
        name: "description",
        content:
          "BusSetu is the live tracking & intelligence platform for buses. Learn why we're building it.",
      },
      { property: "og:title", content: "About BusSetu" },
      {
        property: "og:description",
        content:
          "A live bus tracking platform inspired by FlightRadar24 — built for India's roads.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-14">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand">About Us</div>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Every bus, always on the map.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          BusSetu is a live bus tracking and intelligence platform. Think of FlightRadar24 or
          FlightAware — but for the millions of city and intercity buses that move people every day.
          We started BusSetu to give passengers certainty and give operators a modern nervous system
          for their fleets.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card
            icon={<Radio className="h-5 w-5" />}
            title="Live signal"
            body="Positions, speeds, seats — refreshed every second, straight from the vehicle."
          />
          <Card
            icon={<RouteIcon className="h-5 w-5" />}
            title="Route intelligence"
            body="Every trip is a first-class object. Search by trip, route, stop or city."
          />
          <Card
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Built to scale"
            body="Ready for a Driver App and real WebSocket streams — no rewrites needed."
          />
        </div>

        {/* Developer Spotlights section */}
        <div className="mt-16 rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/20 p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-4 border-white shadow-xl">
                <img
                  src="/developer-gkm.jpg"
                  alt="Gautam Kumar (GKM)"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
                Lead Developer & Architect
              </span>
              <h2 className="font-display text-2xl font-black text-slate-800">
                Gautam Kumar (GKM)
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                BusSetu was designed and engineered from scratch by Gautam Kumar. Inspired by the complexities of public transportation in regions like Prayagraj, Gautam created this comprehensive telemetry dashboard to eliminate wait-time uncertainty for millions of daily passengers.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                <a
                  href="https://gkm563.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand bg-brand/5 border border-brand/10 hover:bg-brand/10 px-3 py-1 rounded-xl transition-colors shadow-sm"
                >
                  🌐 Portfolio
                </a>
                <a
                  href="https://github.com/gkm563"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1 rounded-xl transition-colors shadow-sm"
                >
                  💻 GitHub
                </a>
                <a
                  href="https://linkedin.com/in/gkm563"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-100 hover:bg-sky-100 px-3 py-1 rounded-xl transition-colors shadow-sm"
                >
                  💼 LinkedIn
                </a>
              </div>
              <div className="pt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Developed in 2026 · Made with ❤️ in India
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-xl font-semibold">What's coming next</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· Seat booking with live availability</li>
            <li>· BusSetu Driver — the app that powers real-time signal</li>
            <li>· Operator dashboards for fleet-wide intelligence</li>
            <li>· Punctuality & delay analytics per route</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Card({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-3 font-display font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

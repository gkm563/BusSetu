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
        <div className="text-xs font-semibold uppercase tracking-wider text-brand">About</div>
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

        <div className="mt-14 rounded-3xl border border-border/60 bg-card p-6">
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

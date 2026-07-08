import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Code, Terminal, Webhook, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Developers & Telemetry APIs — BusSetu" },
      {
        name: "description",
        content: "Developer documentation for BusSetu APIs. Integrate live bus location feeds, stops catalog queries, and ticket transaction hooks.",
      },
    ],
  }),
  component: DevelopersPage,
});

function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
            Developer APIs
          </span>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight">
            Build with real-time transit data.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            BusSetu exposes unified REST endpoints and low-latency WebSocket channels. Access active trip GPS coordinates, route geometries, timetable delays, and occupancy telemetry.
          </p>
        </div>

        {/* Code sandbox mockup */}
        <div className="mt-12 rounded-2xl border border-slate-900 bg-slate-950 p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-4">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="ml-3 text-[10px] font-mono text-slate-500 uppercase font-black">GET /api/v1/trips/TRIP-240708-001</span>
          </div>
          <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`{
  "status": "success",
  "data": {
    "tripId": "TRIP-240708-001",
    "busNumber": "UP70 AB 1234",
    "status": "running",
    "gps": {
      "latitude": 25.4358,
      "longitude": 81.8463,
      "speed": 54,
      "heading": 85
    },
    "passenger": {
      "occupiedSeats": 14,
      "vacantSeats": 24,
      "standingPassengers": 4
    }
  }
}`}
          </pre>
        </div>

        {/* API Features */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DevCard
            icon={<Terminal className="h-5 w-5" />}
            title="REST API Endpoints"
            body="Retrieve detailed static catalogs of bus routes, stops coordinates, and operators metadata."
          />
          <DevCard
            icon={<Webhook className="h-5 w-5" />}
            title="WebSocket Channels"
            body="Subscribe to real-time 1-second interval telemetry streaming directly from active onboard GPS hardware."
          />
          <DevCard
            icon={<RefreshCw className="h-5 w-5" />}
            title="Webhooks Integration"
            body="Receive HTTP POST trigger requests on ticket bookings, checkout completions, and delays."
          />
          <DevCard
            icon={<Code className="h-5 w-5" />}
            title="SDK Packages"
            body="Official wrappers in JavaScript, Python, and Go to kickstart your integrations immediately."
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DevCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-3 font-display font-bold text-slate-800 text-xs">{title}</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Monitor, Cpu, ShieldAlert, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/desktop")({
  head: () => ({
    meta: [
      { title: "BusSetuDesktop — Enterprise Operator Control Console" },
      {
        name: "description",
        content: "Download BusSetuDesktop for offline-first fleet tracking, telemetry logging, timetable configuration, and real-time operator alerts.",
      },
    ],
  }),
  component: DesktopPage,
});

function DesktopPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
              Operator Tools
            </span>
            <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight leading-tight">
              Control your fleet with BusSetuDesktop.
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Designed specifically for fleet dispatchers, transport operators, and bus union managers. BusSetuDesktop provides a high-speed, offline-first dashboard capable of displaying thousands of concurrent GPS updates, live driver logs, and routing alerts.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-md cursor-pointer"
              >
                Download for Windows x64
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                Download for macOS (Apple Silicon)
              </a>
            </div>
          </div>
          <div className="flex-1">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-100 p-4 shadow-xl relative overflow-hidden">
              <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video shadow-inner relative flex items-center justify-center border border-slate-950">
                {/* SVG mock UI */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">bussetu-desktop-v2.6.4</span>
                  </div>
                  <div className="space-y-2 my-auto">
                    <div className="h-1 bg-slate-800 rounded w-1/3" />
                    <div className="h-1.5 bg-slate-700 rounded w-2/3" />
                    <div className="h-1 bg-slate-800 rounded w-1/2" />
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-brand">
                    <span>📡 Uptime 99.98%</span>
                    <span>14 Active Feeds</span>
                  </div>
                </div>
                <Monitor className="h-14 w-14 text-slate-700/60" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<Cpu className="h-6 w-6" />}
            title="Local Telemetry Processor"
            body="Process telemetry data locally. The app runs smoothly even with bad internet connection, caching updates and auto-syncing when online."
          />
          <FeatureCard
            icon={<Monitor className="h-6 w-6" />}
            title="Multi-Screen Dispatcher Mode"
            body="Designed to drag route timelines and charts across multiple displays. Watch speeds, delays, and passenger capacity indices in real-time."
          />
          <FeatureCard
            icon={<ShieldAlert className="h-6 w-6" />}
            title="Driver Alert Trigger"
            body="Broadcast safety warnings or route deviations directly to the driver console. The app links seamlessly with hardware GPS sirens."
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-4 font-display font-bold text-slate-800">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

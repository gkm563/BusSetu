import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Navigation, Sparkles, Wallet, Eye } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — BusSetu Live Tracking Platform" },
      {
        name: "description",
        content: "Discover BusSetu's telemetry features: high-contrast Leaflet maps, rotated bus icons, AI assistance, seat vacancy gauges, and PDF passes.",
      },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
            Product Features
          </span>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight">
            Built for certainty. Engineered for speed.
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Discover the features that make BusSetu the smartest real-time live tracking and ticketing dashboard on India's highways.
          </p>
        </div>

        {/* Feature Sections */}
        <div className="mt-16 space-y-16">
          <FeatureBlock
            icon={<Navigation className="h-6 w-6" />}
            title="Interactive GPS Radar Map"
            body="Follow buses as they move. Using custom Leaflet integration, markers render actual rotated vectors representing the vehicle's real-time heading. Dual outlines make sure markers remain highly legible across all light/dark map tiles."
            badge="01 · Map Telemetry"
          />
          <FeatureBlock
            icon={<Sparkles className="h-6 w-6" />}
            title="Multilingual Gemini AI Assistant"
            body="Get suggestions, timing queries, and route recommendations in English, Hindi, or Thai. The assistant automatically shifts translations based on your input text and generates interactive links that point directly to map trackers."
            badge="02 · Generative AI"
            reverse
          />
          <FeatureBlock
            icon={<Eye className="h-6 w-6" />}
            title="Live Seat Occupancy Sensors"
            body="Check vacant seats, standing passengers, and women-reserved statistics before booking. Circular animated SVG progress dials show crowd levels at a glance (plenty of seats, moderate crowd, or full)."
            badge="03 · Capacity Index"
          />
          <FeatureBlock
            icon={<Wallet className="h-6 w-6" />}
            title="Canvas Boarding Passes"
            body="Generate passenger passes with scanned barcodes. Drawn via Canvas 2D API, these passes display exact stop sequences and download directly as high-resolution PNG or print-ready PDF files for offline boarding."
            badge="04 · Pass Wallet"
            reverse
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FeatureBlock({
  icon,
  title,
  body,
  badge,
  reverse = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  badge: string;
  reverse?: boolean;
}) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-10 ${reverse ? "md:flex-row-reverse" : ""}`}>
      <div className="flex-1 space-y-4">
        <span className="text-[9px] font-black uppercase tracking-widest text-brand">{badge}</span>
        <h3 className="font-display text-2xl font-black text-slate-800 leading-snug">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
      </div>
      <div className="flex-1">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex items-center justify-center min-h-[220px]">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand shadow-inner">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

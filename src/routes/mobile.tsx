import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Smartphone, Bell, Ticket, MapPin } from "lucide-react";

export const Route = createFileRoute("/mobile")({
  head: () => ({
    meta: [
      { title: "BusSetuMobile — Live Tracking & Tickets for Android & iOS" },
      {
        name: "description",
        content: "Track buses on-the-go with BusSetuMobile. Get live ETA notifications, download smart boarding tickets, and track routes from your mobile device.",
      },
    ],
  }),
  component: MobilePage,
});

function MobilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* SVG Phone Mockup */}
          <div className="flex-1 order-2 md:order-1 flex justify-center">
            <div className="relative w-64 h-[500px] bg-slate-900 border-[8px] border-slate-850 rounded-[38px] shadow-2xl p-3 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-4 bg-slate-900 flex justify-center">
                <div className="w-24 h-3 bg-black rounded-b-xl" />
              </div>
              <div className="bg-slate-50 flex-1 rounded-[28px] overflow-hidden p-4 pt-6 flex flex-col justify-between border border-slate-950">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black text-brand">
                    <span>🟢 LIVE TRACKER</span>
                    <span>9:41 AM</span>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm space-y-1">
                    <div className="h-1 bg-slate-200 rounded w-1/4" />
                    <div className="h-2 bg-slate-400 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
                <div className="my-auto flex flex-col items-center text-center">
                  <Smartphone className="h-16 w-16 text-slate-300" />
                  <span className="text-[10px] font-extrabold text-slate-400 mt-2">BusSetu App</span>
                </div>
                <div className="bg-brand text-white rounded-xl py-2 text-center text-xs font-bold shadow-sm">
                  Track Live Bus
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6 order-1 md:order-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
              Mobile Application
            </span>
            <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight leading-tight">
              Track and book from your phone.
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Never wait at the bus stand again. With BusSetuMobile, you can watch the bus moving on the radar in real-time, view boarding stop platforms, choose women-reserved seats, and export offline smart tickets with QR codes directly.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-white hover:bg-slate-850 transition-colors shadow-md w-fit cursor-pointer"
              >
                <span className="text-xl">🤖</span>
                <div className="text-left leading-tight">
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Get it on</div>
                  <div className="text-xs font-black">Google Play</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-white hover:bg-slate-850 transition-colors shadow-md w-fit cursor-pointer"
              >
                <span className="text-xl">🍎</span>
                <div className="text-left leading-tight">
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Download on the</div>
                  <div className="text-xs font-black">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Info list */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <InfoTile
            icon={<MapPin className="h-5 w-5" />}
            title="Real-Time Bus Radar"
            body="View high-accuracy, 1-second interval positions of intercity buses with detailed route milestones."
          />
          <InfoTile
            icon={<Bell className="h-5 w-5" />}
            title="Smart Proximity Alerts"
            body="Receive push notifications when your bus approaches platform 3 or gets within 2 km of your location."
          />
          <InfoTile
            icon={<Ticket className="h-5 w-5" />}
            title="Offline Pass Wallet"
            body="Store ticket booking confirmation QR passes locally. Show it offline to conductors for seamless boarding."
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoTile({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-3 font-display font-bold text-slate-800 text-sm">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, Shield } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — BusSetu" },
      {
        name: "description",
        content: "Transparent pricing for commuters, operators, and enterprises. Free live bus tracking, premium fleet scaling, and enterprise developer API access.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Pricing Plans</div>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight">
            Plans for passengers & operators.
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Real-time live tracking is free for everyone. Choose fleet scaling plans to unlock advanced telemetry, route analytics, and developer APIs.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {/* Commuter Plan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 flex flex-col justify-between shadow-sm relative overflow-hidden hover:scale-[1.01] transition-transform">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                For Passengers
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-slate-800">Commuter Free</h3>
              <p className="mt-2 text-sm text-slate-500">Live tracker access for daily riders.</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black font-display text-slate-800">₹0</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ forever</span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>Unlimited live tracking on Map</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>AI Advisor queries & schedules</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>Direct ticket booking</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>Interactive Smart PDF Pass downloads</span>
                </li>
              </ul>
            </div>
            
            <a
              href="/search?trip=t-alld-lko-03&from=Prayagraj&to=Lucknow&via=Mirzapur"
              className="mt-8 block w-full text-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Start Tracking Live
            </a>
          </div>

          {/* Fleet Operator Plan */}
          <div className="rounded-3xl border-2 border-brand bg-white p-8 flex flex-col justify-between shadow-md relative overflow-hidden hover:scale-[1.01] transition-transform">
            <div className="absolute top-0 right-0 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
              Most Popular
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">
                For Fleet Owners
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-slate-800">Operator Growth</h3>
              <p className="mt-2 text-sm text-slate-500">Fleet telemetry & schedule logs.</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black font-display text-brand">₹4,999</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                  <span>Up to 25 live tracking bus feeds</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                  <span>Driver app GPS console access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                  <span>Punctuality & ETA delay reports</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                  <span>Smart ticket reservation management</span>
                </li>
              </ul>
            </div>
            
            <a
              href="/contact"
              className="mt-8 block w-full text-center rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand/90 transition-colors shadow-sm"
            >
              Sign Up Operator
            </a>
          </div>

          {/* Enterprise Developer Plan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 flex flex-col justify-between shadow-sm relative overflow-hidden hover:scale-[1.01] transition-transform">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                For Enterprises
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-slate-800">Enterprise API</h3>
              <p className="mt-2 text-sm text-slate-500">Unrestricted telemetry streams.</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-black font-display text-slate-800">Custom</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ yearly billing</span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                  <span>REST API & WebSocket streams access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                  <span>Custom hardware GPS integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                  <span>SLA uptime guarantees</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                  <span>Dedicated tech support manager</span>
                </li>
              </ul>
            </div>
            
            <a
              href="/contact"
              className="mt-8 block w-full text-center rounded-xl bg-slate-150 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-sm"
            >
              Contact Enterprise Sales
            </a>
          </div>
        </div>

        {/* Security / Quality badge */}
        <div className="mt-16 text-center max-w-lg mx-auto bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4 text-left shadow-sm">
          <Shield className="h-8 w-8 text-brand shrink-0" />
          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Enterprise Uptime SLA</h4>
            <p className="text-xs text-slate-500 leading-normal mt-0.5">
              All live streaming GPS channels maintain a 99.9% network SLA backed by high-speed hardware telemetry modules.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

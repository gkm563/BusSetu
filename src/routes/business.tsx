import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, Map, ShieldCheck, PieChart } from "lucide-react";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Solutions for Business — Corporate Transit & Charters" },
      {
        name: "description",
        content: "Optimize corporate staff commutes and manage charter bus fleets with BusSetu's telemetry software, route analytics, and dispatch consoles.",
      },
    ],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
            Corporate Solutions
          </span>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight leading-tight">
            Streamline employee transit & fleet operations.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            From daily staff shuttles to large-scale intercity charters, BusSetu provides operators and enterprises with the tools to track movements, configure optimized route segments, and verify safety protocols.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <BenefitCard
            icon={<Briefcase className="h-5 w-5" />}
            title="Corporate Commutes"
            body="Help employees track corporate shuttle pickups with exact ETAs. Reduce wait times and improve employee punctuality."
          />
          <BenefitCard
            icon={<Map className="h-5 w-5" />}
            title="Dynamic Routing"
            body="Optimize route overlays dynamically using active traffic feeds. Bypass road blocks automatically."
          />
          <BenefitCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Safe Boarding Hooks"
            body="Verify employee boarding using smart QR scans and automated platform entry/exit check-ins."
          />
          <BenefitCard
            icon={<PieChart className="h-5 w-5" />}
            title="Cost & Fleet Analytics"
            body="Track fuel cost efficiency, trip delays, driver speeds, and seat utilization in unified Excel/PDF exports."
          />
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-900 text-white p-8 sm:p-10 text-center max-w-4xl mx-auto space-y-6 shadow-xl">
          <h3 className="font-display text-2xl font-black">Ready to optimize your transport logistics?</h3>
          <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
            Get in touch with our enterprise mobility architects to custom-brand your driver apps and configure dedicated telemetry servers.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-xl bg-brand px-6 py-3 text-xs font-bold text-white hover:bg-brand/90 transition-colors shadow-lg cursor-pointer"
          >
            Contact Mobility Team
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function BenefitCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-3 font-display font-bold text-slate-800 text-sm">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

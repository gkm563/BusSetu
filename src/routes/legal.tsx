import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Lock, FileSpreadsheet } from "lucide-react";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal & Privacy Policy — BusSetu" },
      {
        name: "description",
        content: "Read the Privacy Policy, Terms of Service, Cookie policies, and telemetry licenses for using BusSetu services.",
      },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
            Legal Center
          </span>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight">
            Privacy & Terms.
          </h1>
          <p className="text-slate-500 text-sm">
            Read how we safeguard passenger information and regulate telemetry access.
          </p>
        </div>

        {/* Categories */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
          <LegalBox
            icon={<Lock className="h-5 w-5" />}
            title="Privacy Policy"
            body="We collect only necessary telemetry identifiers. Ticket details are encrypted and hashed locally."
          />
          <LegalBox
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Terms of Service"
            body="Guidelines for operators transmitting driver GPS feeds. Abuse of location feeds results in ban."
          />
          <LegalBox
            icon={<FileSpreadsheet className="h-5 w-5" />}
            title="API Agreement"
            body="Terms regulating enterprise developer access, rate limits, and caching policies."
          />
        </div>

        {/* Content body */}
        <div className="prose prose-slate max-w-3xl mx-auto text-slate-600 text-xs leading-relaxed space-y-6">
          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">1. Information Collection</h3>
          <p>
            BusSetu does not store passenger location histories. User coordinates accessed by geolocation hooks remain strictly within the browser context and are never transmitted to our cloud servers. Active driver tracking uses temporary transient signals which expire after trip completion.
          </p>

          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">2. API Rate Limiting</h3>
          <p>
            Developer endpoints are subject to a rate limiting ceiling of 120 calls per minute for basic developer keys. Operators requiring higher thresholds must subscribe to enterprise service agreements.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LegalBox({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="font-display font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

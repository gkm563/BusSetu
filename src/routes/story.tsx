import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Compass, Award } from "lucide-react";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Our Story — The BusSetu Mission" },
      {
        name: "description",
        content: "Learn how BusSetu was built from scratch. Read about our journey, mission, and the vision of GKM to rebuild public transit tracking.",
      },
    ],
  }),
  component: StoryPage,
});

function StoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
            Our Journey
          </span>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight">
            How it all began.
          </h1>
          <p className="text-slate-500 text-sm">
            The mission to connect every passenger and bus operator in a unified telemetry network.
          </p>
        </div>

        <div className="prose prose-slate max-w-3xl mx-auto text-slate-600 text-sm leading-relaxed space-y-5">
          <p>
            In early 2026, Gautam Kumar (GKM) realized a major bottleneck in daily commutes across Uttar Pradesh's highways: **wait-time anxiety**. Passengers spent hours at bus stands like Prayagraj, unsure if their target AC service had left or got stuck in traffic.
          </p>
          <p>
            Inspired by real-time flight tracking platforms, Gautam set out to construct **BusSetu** (translating to *Bus Bridge*). The platform was designed from scratch to connect on-board GPS coordinates directly to a low-latency web dashboard, making highway travel predictable.
          </p>
          <p>
            Today, BusSetu powers hundreds of simulated and active telemetry feeds, giving users instantaneous access to routes, ETAs, delays, and seat vacancy layouts on one interactive live radar.
          </p>
        </div>

        {/* Core Values */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
          <ValueCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Open Access"
            body="Commuter features are completely free and open. Information shouldn't have a barrier."
          />
          <ValueCard
            icon={<Compass className="h-5 w-5" />}
            title="Certainty First"
            body="We eliminate guesswork at terminals. Know exactly which platform and seat is active."
          />
          <ValueCard
            icon={<Award className="h-5 w-5" />}
            title="Local Focus"
            body="Optimized for local Indian transit corridors and languages like Hindi and Thai."
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ValueCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
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

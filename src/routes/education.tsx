import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GraduationCap, Bell, ShieldAlert, CheckSquare } from "lucide-react";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Solutions for Education — Live School Bus Tracking" },
      {
        name: "description",
        content: "Give parents peace of mind and simplify school transportation. Track school bus fleets, receive proximity notifications, and monitor student safety.",
      },
    ],
  }),
  component: EducationPage,
});

function EducationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
            Education Solutions
          </span>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight leading-tight">
            Keep student transit safe and predictable.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            School transport requires absolute precision. BusSetu's school tracking package provides administrators with live route compliance checks, while parents receive automated notifications as the bus nears their stop.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <BenefitCard
            icon={<GraduationCap className="h-5 w-5" />}
            title="Parent Live Tracking"
            body="Parents can follow their child's school bus path in real-time, eliminating long waits at bus stops during bad weather."
          />
          <BenefitCard
            icon={<Bell className="h-5 w-5" />}
            title="Instant ETA Alerts"
            body="Receive automated SMS/push messages when the school bus gets within 5 minutes or 1.5 km of the pickup address."
          />
          <BenefitCard
            icon={<ShieldAlert className="h-5 w-5" />}
            title="Speed Compliance"
            body="Monitor vehicle speeds and receive alerts when a driver exceeds school zone safety limits."
          />
          <BenefitCard
            icon={<CheckSquare className="h-5 w-5" />}
            title="Student Attendance"
            body="Conductors can verify check-ins using simple mobile scanning codes, instantly updating school administrators."
          />
        </div>

        {/* School FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto space-y-6">
          <h3 className="font-display text-2xl font-black text-slate-800 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <FaqItem
              q="Does this require expensive hardware on school buses?"
              a="No. Drivers can use the basic BusSetuMobile Driver App on any standard Android device, which transmits GPS coordinates securely."
            />
            <FaqItem
              q="Is child location metadata kept secure?"
              a="Absolutely. Student names and route coordinates are encrypted and accessible only to verified school parents and transport coordinators."
            />
          </div>
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

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1 shadow-sm">
      <h4 className="font-display font-bold text-slate-800 text-sm">{q}</h4>
      <p className="text-xs leading-relaxed text-slate-500">{a}</p>
    </div>
  );
}

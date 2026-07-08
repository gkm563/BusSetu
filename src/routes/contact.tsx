import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, MapPin, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BusSetu" },
      {
        name: "description",
        content: "Get in touch with the BusSetu team — operators, partners and passengers welcome.",
      },
      { property: "og:title", content: "Contact BusSetu" },
      {
        property: "og:description",
        content: "Reach the team building live bus tracking for India.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-14">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand">Contact</div>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Talk to us.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Passenger, operator, or partner — we'd love to hear from you.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-3 rounded-3xl border border-border/60 bg-card p-5"
          >
            <Field label="Name" placeholder="Your name" />
            <Field label="Email" placeholder="you@example.com" type="email" />
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="How can we help?"
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground"
            >
              Send message
            </button>
          </form>

          <div className="space-y-3">
            <InfoCard icon={<Mail className="h-4 w-4" />} title="Email" body="hello@BusSetu.app" />
            <InfoCard
              icon={<MessageSquare className="h-4 w-4" />}
              title="Support"
              body="Every weekday, 9am–7pm IST"
            />
            <InfoCard
              icon={<MapPin className="h-4 w-4" />}
              title="Based in"
              body="Prayagraj, India"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
      />
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        <div className="text-sm font-medium">{body}</div>
      </div>
    </div>
  );
}

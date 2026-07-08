import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Download, FileText, Image } from "lucide-react";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press & Media Kit — BusSetu" },
      {
        name: "description",
        content: "Access BusSetu press releases, official media kits, brand assets, logos, and executive screenshots.",
      },
    ],
  }),
  component: PressPage,
});

function PressPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
            Press Room
          </span>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight">
            Media resources & assets.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Find the latest announcements, brand guidelines, logo files, and high-resolution platform mockups for print and digital publications.
          </p>
        </div>

        {/* Media Kit grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3 max-w-4xl">
          <PressCard
            icon={<FileText className="h-6 w-6" />}
            title="Press Releases"
            body="Read the official launching release of BusSetu v2.0 Smart Passer system."
            size="240 KB"
          />
          <PressCard
            icon={<Image className="h-6 w-6" />}
            title="Brand Assets & Logos"
            body="Download SVG logo files, color palettes, and typography guidelines."
            size="1.2 MB"
          />
          <PressCard
            icon={<Download className="h-6 w-6" />}
            title="Executive Headshots"
            body="Official portraits of Gautam Kumar (GKM) and the engineering team."
            size="4.5 MB"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PressCard({ icon, title, body, size }: { icon: React.ReactNode; title: string; body: string; size: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div className="space-y-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
          {icon}
        </div>
        <h3 className="font-display font-bold text-slate-800 text-sm">{title}</h3>
        <p className="text-xs leading-relaxed text-slate-500">{body}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span>Zip Archive</span>
        <span className="text-brand flex items-center gap-1 cursor-pointer hover:underline">
          Download ({size})
        </span>
      </div>
    </div>
  );
}

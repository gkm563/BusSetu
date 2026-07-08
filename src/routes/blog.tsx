import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar, User } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Transit Insights — BusSetu" },
      {
        name: "description",
        content: "Stay updated with BusSetu's updates: real-time telemetry releases, Gemini AI advisor enhancements, and public transportation analytics.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
            Company Blog
          </span>
          <h1 className="font-display text-4xl font-black text-slate-800 sm:text-5xl tracking-tight">
            Insights & Transit Tech.
          </h1>
          <p className="text-slate-500 text-sm">
            Read updates on hardware GPS adapters, LLM routing prompts, and dispatcher interfaces.
          </p>
        </div>

        {/* Blog Post Grid */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <PostCard
            title="Introducing Gemini 2.5 Flash Multilingual Advisor"
            summary="How we integrated Google Gemini LLMs to auto-detect Hindi/Thai inputs and generate interactive links directly inside chat logs."
            date="July 08, 2026"
            author="Gautam Kumar"
            category="AI & LLMs"
          />
          <PostCard
            title="Dumping Canvas Lag on Mobile Ticket Exports"
            summary="A deep dive into why HTML5 Canvas performs 10x faster than traditional rasterizers when exporting ticket passes with high-contrast notches."
            date="July 04, 2026"
            author="Gautam Kumar"
            category="Engineering"
          />
          <PostCard
            title="Optimizing Highway GPS Markers visibility"
            summary="Why we added dual outlines and expanded scale sizes to React-Leaflet bus marker elements to ensure contrast across map types."
            date="June 28, 2026"
            author="Gautam Kumar"
            category="Design Systems"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PostCard({
  title,
  summary,
  date,
  author,
  category,
}: {
  title: string;
  summary: string;
  date: string;
  author: string;
  category: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
      <div>
        <span className="text-[9px] font-black uppercase tracking-widest text-brand bg-brand/5 border border-brand/10 px-2 py-0.5 rounded-md">
          {category}
        </span>
        <h3 className="mt-4 font-display font-bold text-slate-800 text-base leading-snug">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{summary}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {date}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {author}
        </span>
      </div>
    </div>
  );
}

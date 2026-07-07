import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyBusSetu } from "@/components/home/WhyBusSetu";
import { UseCases } from "@/components/home/UseCases";
import { Testimonials } from "@/components/home/Testimonials";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { StickyRadarBar } from "@/components/home/StickyRadarBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BusSetu — Track Every Bus. Live." },
      {
        name: "description",
        content:
          "The world's smartest live bus tracking platform. See every bus in real time, know ETAs, seats, and the closest ride — from one live radar.",
      },
      { property: "og:title", content: "BusSetu — Track Every Bus. Live." },
      {
        property: "og:description",
        content:
          "Live positions, ETAs, seats and route intelligence for every bus. FlightRadar for buses.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} aria-label="BusSetu landing page">
        <section id="top" aria-label="Live Radar preview and introduction">
          <Hero />
        </section>
        <section aria-label="Platform statistics">
          <StatsSection />
        </section>
        <section id="features" className="scroll-mt-24" aria-label="Product features">
          <FeaturesGrid />
        </section>
        <section id="product" className="scroll-mt-24" aria-label="Live Radar product showcase">
          <ProductShowcase />
        </section>
        <section id="routes" className="scroll-mt-24" aria-label="How BusSetu routes work">
          <HowItWorks />
        </section>
        <section id="about" className="scroll-mt-24" aria-label="About BusSetu">
          <WhyBusSetu />
        </section>
        <section aria-label="Use cases">
          <UseCases />
        </section>
        <section aria-label="Testimonials">
          <Testimonials />
        </section>
        <section
          id="support"
          className="scroll-mt-24"
          aria-label="Support and frequently asked questions"
        >
          <FaqSection />
        </section>
        <section aria-label="Get started">
          <FinalCTA />
        </section>
      </main>
      <Footer />
      <StickyRadarBar />
    </div>
  );
}

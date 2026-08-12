"use client";

import { useRouter } from "next/navigation";

// Landing page components
import ScrollProgress from "@/components/landing/ScrollProgress";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TickerBar from "@/components/landing/TickerBar";
import MarketTicker from "@/components/landing/MarketTicker";
import TrustSection from "@/components/landing/TrustSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import ComparisonMatrix from "@/components/landing/ComparisonMatrix";
import RoadmapPreview from "@/components/landing/RoadmapPreview";
import StatsSection from "@/components/landing/StatsSection";
import Testimonials from "@/components/landing/Testimonials";
import FAQSection from "@/components/landing/FAQSection";
import FooterCTA from "@/components/landing/FooterCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  const router = useRouter();

  function handleCtaClick() {
    router.push("/auth");
  }

  function handleExploreClick() {
    router.push("/explore");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Global scroll progress bar */}
      <ScrollProgress />

      {/* Floating glass pill navbar */}
      <Navbar onCtaClick={handleCtaClick} />

      {/* A. Hero Section — Split cinematic layout */}
      <HeroSection
        onCtaClick={handleCtaClick}
        onExploreClick={handleExploreClick}
      />

      {/* B. Continuous ticker bar */}
      <TickerBar />

      {/* C. Live Market Snapshot cards */}
      <MarketTicker />

      {/* D. Trust & Evidence section */}
      <TrustSection />

      {/* E. Feature Bento Grid */}
      <FeatureGrid />

      {/* F. How It Works — Scroll-drawn path */}
      <HowItWorks />

      {/* G. StackSense vs. The Rest — Comparison matrix */}
      <ComparisonMatrix />

      {/* H. Product Showcase & Roadmap Preview */}
      <RoadmapPreview />

      {/* I. Stats with animated counters */}
      <StatsSection />

      {/* J. Testimonials */}
      <Testimonials />

      {/* K. FAQ Accordion */}
      <FAQSection />

      {/* L. Massive Footer CTA */}
      <FooterCTA onCtaClick={handleCtaClick} />

      {/* M. Minimal Footer */}
      <Footer />
    </div>
  );
}

"use client";

import { getMarketIntelligence, type MarketEntry } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Landing page components
import ScrollProgress from "@/components/landing/ScrollProgress";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TickerBar from "@/components/landing/TickerBar";
import MarketResults from "@/components/landing/MarketResults";
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
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketEntry[] | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!location.trim()) return;
    setLoading(true);
    try {
      const data = await getMarketIntelligence(location, []);
      setMarketData(data);
      document.getElementById("market-results")?.scrollIntoView({ behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  function handleCtaClick() {
    router.push("/auth");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Global scroll progress bar */}
      <ScrollProgress />

      {/* Floating glass pill navbar */}
      <Navbar onCtaClick={handleCtaClick} />

      {/* A. Hero Section — Split cinematic layout */}
      <HeroSection
        location={location}
        setLocation={setLocation}
        loading={loading}
        onAnalyze={handleAnalyze}
        onCtaClick={handleCtaClick}
      />

      {/* B. Continuous ticker bar */}
      <TickerBar />

      {/* C. Market results (shown after user searches) */}
      {marketData && (
        <MarketResults
          marketData={marketData}
          location={location}
          onCtaClick={handleCtaClick}
        />
      )}

      {/* D. Live Market Snapshot cards */}
      <MarketTicker />

      {/* E. Trust & Evidence section */}
      <TrustSection />

      {/* F. Feature Bento Grid */}
      <FeatureGrid />

      {/* G. How It Works — Scroll-drawn path */}
      <HowItWorks />

      {/* H. StackSense vs. The Rest — Comparison matrix */}
      <ComparisonMatrix />

      {/* I. Product Showcase & Roadmap Preview */}
      <RoadmapPreview />

      {/* J. Stats with animated counters */}
      <StatsSection />

      {/* K. Testimonials */}
      <Testimonials />

      {/* L. FAQ Accordion */}
      <FAQSection />

      {/* M. Massive Footer CTA */}
      <FooterCTA onCtaClick={handleCtaClick} />

      {/* N. Minimal Footer */}
      <Footer />
    </div>
  );
}

"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import {
  TrendingUp,
  GitBranch,
  Route,
  MapPin,
  FileSearch,
  Radar,
  type LucideIcon,
} from "lucide-react";
import { CircularCarousel, type CarouselItem } from "@/components/ui/circular-carousel";
import { cn } from "@/lib/utils";

interface FeatureEntry {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
}

const FEATURES: FeatureEntry[] = [
  {
    icon: TrendingUp,
    title: "Career Discovery",
    desc: "AI-matched stack pathways based on local market saturation and your experience level. Find the path of least resistance to your next role.",
    tag: "Analytics",
  },
  {
    icon: MapPin,
    title: "Local Hiring Intelligence",
    desc: "Filter hiring velocity by exact city or remote preferences. London, Berlin, SF — each market has radically different demand curves.",
    tag: "Location",
  },
  {
    icon: GitBranch,
    title: "Skill Gap Delta Engine",
    desc: "Calculates the exact missing skills when transitioning from one stack to another. No redundant tutorials.",
    tag: "Skills",
  },
  {
    icon: Route,
    title: "Personalized Roadmaps",
    desc: "Step-by-step milestones with project concepts and key topics, sequenced by dependency — not by playlist.",
    tag: "Roadmaps",
  },
  {
    icon: FileSearch,
    title: "Resume & Portfolio Alignment",
    desc: "Analyzes your current experience to highlight high-value missing keywords and projects that recruiters actually search for.",
    tag: "Resume",
  },
  {
    icon: Radar,
    title: "Market Trend Radar",
    desc: "Real-time analytics on rising vs. declining technologies. Know which bets to make before the market shifts.",
    tag: "Trends",
  },
];

// Map FEATURES to CarouselItem format
const carouselItems: CarouselItem[] = FEATURES.map((f, i) => ({
  id: String(i + 1),
  title: f.title,
  description: f.desc,
  tag: f.tag,
}));

export default function FeatureGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState(0);

  const activeFeature = FEATURES[activeIndex];
  const ActiveIcon = activeFeature.icon;

  return (
    <section id="features" ref={ref} className="py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Everything you need to navigate the market
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
            Six precision tools that replace guesswork with verified career intelligence.
          </p>
        </motion.div>

        {/* Circular Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <CircularCarousel
            items={carouselItems}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
            autoPlay
            autoPlayInterval={4000}
            className="min-h-[420px]"
          />
        </motion.div>

        {/* Detail panel for active feature */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-10 mx-auto max-w-xl"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-[#09090b] p-6 md:p-8">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-cyan-400/[0.08] border border-cyan-400/20 flex items-center justify-center">
                  <ActiveIcon className="w-6 h-6 text-cyan-400" />
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold tracking-tight text-white">
                      {activeFeature.title}
                    </h3>
                    <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan-400/80">
                      {activeFeature.tag}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {activeFeature.desc}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

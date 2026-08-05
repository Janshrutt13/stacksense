"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { MarketEntry } from "@/lib/actions";
import MagneticButton from "./MagneticButton";

interface MarketResultsProps {
  marketData: MarketEntry[];
  location: string;
  onCtaClick: () => void;
}

export default function MarketResults({ marketData, location, onCtaClick }: MarketResultsProps) {
  return (
    <section id="market-results" className="px-4 py-20 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold tracking-tight mb-2">Market signal, not opinions.</h2>
        <p className="text-zinc-400 mb-10 text-sm">
          Showing demand data for <span className="text-white font-medium">{location}</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="rounded-3xl border border-white/[0.08] bg-[#09090b] p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium">Live market intelligence</span>
        </div>
        <p className="text-zinc-400 text-sm mb-6">
          Weekly telemetry from local postings, ranked by real hiring volume in your region.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {marketData.slice(0, 8).map((item, i) => (
            <motion.div
              key={item.stack}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
              className="rounded-xl bg-[#18181b] border border-white/[0.06] p-4 card-elevated"
            >
              <p className="text-xs text-zinc-400 mb-1">{item.stack}</p>
              <p className="text-2xl font-bold text-cyan-400">{item.pct}%</p>
              <p className="text-xs text-zinc-500">{item.jobs.toLocaleString()} roles</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <MagneticButton
            onClick={onCtaClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-colors"
          >
            Generate my roadmap <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </div>
      </motion.div>
    </section>
  );
}

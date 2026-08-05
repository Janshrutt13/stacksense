"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, X } from "lucide-react";

const ROWS = [
  { feature: "Data Source", traditional: "Opinions & surveys", stacksense: "Live job postings" },
  { feature: "Update Frequency", traditional: "Static / annual", stacksense: "Weekly telemetry" },
  { feature: "Location Awareness", traditional: "Global averages", stacksense: "City-level precision" },
  { feature: "Skill Gap Analysis", traditional: "Not available", stacksense: "Automated delta engine" },
  { feature: "Curriculum Basis", traditional: "Generic playlists", stacksense: "Demand-sequenced milestones" },
  { feature: "Salary Data", traditional: "Self-reported", stacksense: "Posting-verified ranges" },
  { feature: "AI Hallucinations", traditional: "Common risk", stacksense: "Evidence-only output" },
  { feature: "Personalization", traditional: "One-size-fits-all", stacksense: "Stack × location × level" },
];

export default function ComparisonMatrix() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="comparison" ref={ref} className="py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            StackSense vs. The Rest
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            See why evidence-backed intelligence outperforms traditional career advice.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl border border-white/[0.06] bg-[#09090b] overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-3 border-b border-white/[0.06]">
            <div className="px-5 py-4">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Feature</span>
            </div>
            <div className="px-5 py-4 border-l border-white/[0.06]">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Traditional</span>
            </div>
            <div className="px-5 py-4 border-l border-cyan-400/20 bg-cyan-400/[0.02] relative">
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-medium">StackSense</span>
              {/* Glow border top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              className={`grid grid-cols-3 ${i < ROWS.length - 1 ? "border-b border-white/[0.04]" : ""}`}
            >
              <div className="px-5 py-3.5">
                <span className="text-sm text-zinc-300">{row.feature}</span>
              </div>
              <div className="px-5 py-3.5 border-l border-white/[0.06] flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span className="text-sm text-zinc-500">{row.traditional}</span>
              </div>
              <div className="px-5 py-3.5 border-l border-cyan-400/20 bg-cyan-400/[0.02] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-sm text-zinc-300">{row.stacksense}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

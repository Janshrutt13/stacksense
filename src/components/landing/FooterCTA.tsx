"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MagneticButton from "./MagneticButton";

interface FooterCTAProps {
  onCtaClick: () => void;
}

export default function FooterCTA({ onCtaClick }: FooterCTAProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");

  return (
    <section ref={ref} className="relative py-32 px-4 overflow-hidden">
      {/* Radial background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-black tracking-tight mb-4"
        >
          Build Skills Companies{" "}
          <span className="gradient-text">Actually Need.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-zinc-400 text-sm mb-8 leading-relaxed"
        >
          Join thousands of developers who stopped guessing and started learning
          with verified market intelligence. No credit card required.
        </motion.p>

        {/* Email capture + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto mb-6"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 w-full px-5 py-3.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-400/30 transition-colors"
          />
          <MagneticButton
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-colors whitespace-nowrap"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="inline-flex items-center gap-2 text-xs text-zinc-500"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          All systems operational
        </motion.div>
      </div>
    </section>
  );
}

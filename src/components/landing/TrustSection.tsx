"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield } from "lucide-react";

const LOGOS = [
  "LinkedIn Jobs",
  "Indeed",
  "GitHub Trends",
  "Stack Overflow",
  "Glassdoor",
  "Tech Career Pages",
  "HackerNews",
  "AngelList",
];

function LogoItem({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 mx-8 shrink-0">
      <div className="w-6 h-6 rounded bg-white/[0.06] flex items-center justify-center">
        <span className="text-[8px] font-bold text-zinc-500">{name.charAt(0)}</span>
      </div>
      <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">{name}</span>
    </div>
  );
}

export default function TrustSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Powered by Verified Market Intelligence
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
            We aggregate data from the platforms that actually power the hiring ecosystem.
          </p>
        </motion.div>

        {/* Logo Marquee */}
        <div className="relative overflow-hidden mb-12">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />

          <div className="flex animate-marquee-slow">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <LogoItem key={`${logo}-${i}`} name={logo} />
            ))}
          </div>
        </div>

        {/* Reverse marquee */}
        <div className="relative overflow-hidden mb-12">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />

          <div className="flex animate-marquee-reverse">
            {[...LOGOS.slice().reverse(), ...LOGOS.slice().reverse()].map((logo, i) => (
              <LogoItem key={`rev-${logo}-${i}`} name={logo} />
            ))}
          </div>
        </div>

        {/* Evidence Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-400 leading-relaxed">
              Recommendations are strictly calculated from active job postings and verified market
              signals — never AI assumptions. Every data point maps to a real hiring signal.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

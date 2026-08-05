"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const STATS = [
  { value: 1200000, suffix: "+", label: "Jobs indexed", prefix: "" },
  { value: 150, suffix: "+", label: "Regions covered", prefix: "" },
  { value: 14, suffix: " min", label: "Avg. roadmap build", prefix: "" },
  { value: 0, suffix: "", label: "Fluff", prefix: "" },
];

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="border-t border-white/[0.06] px-4 py-16">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="text-4xl font-black mb-1">
              {s.value === 0 ? (
                "0"
              ) : s.value >= 1000000 ? (
                <AnimatedCounter
                  target={1.2}
                  suffix="M+"
                  duration={2}
                  className="text-4xl font-black"
                />
              ) : (
                <AnimatedCounter
                  target={s.value}
                  suffix={s.suffix}
                  prefix={s.prefix}
                  duration={2}
                  className="text-4xl font-black"
                />
              )}
            </p>
            <p className="text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

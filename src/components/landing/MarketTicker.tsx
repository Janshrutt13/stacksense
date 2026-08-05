"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* Mini sparkline for each card */
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const h = 24;
  const w = 64;
  const step = w / (points.length - 1);

  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-sparkline" />
    </svg>
  );
}

const MARKET_CARDS = [
  {
    name: "Next.js",
    demand: "+28%",
    salary: "$145k",
    roles: "31,884",
    sparkline: [12, 18, 15, 22, 20, 28, 25, 32, 30, 34],
    color: "#06b6d4",
  },
  {
    name: "React",
    demand: "+18%",
    salary: "$142k",
    roles: "44,200",
    sparkline: [30, 32, 28, 35, 33, 38, 36, 40, 39, 42],
    color: "#3b82f6",
  },
  {
    name: "Fastify",
    demand: "+45%",
    salary: "$138k",
    roles: "8,420",
    sparkline: [4, 6, 8, 10, 14, 18, 22, 28, 32, 38],
    color: "#06b6d4",
  },
  {
    name: "TypeScript",
    demand: "+32%",
    salary: "$148k",
    roles: "48,210",
    sparkline: [22, 26, 24, 30, 28, 34, 32, 38, 36, 42],
    color: "#3b82f6",
  },
  {
    name: "PostgreSQL",
    demand: "+22%",
    salary: "$145k",
    roles: "26,105",
    sparkline: [14, 16, 18, 17, 20, 22, 24, 26, 25, 28],
    color: "#06b6d4",
  },
  {
    name: "Supabase",
    demand: "+68%",
    salary: "$135k",
    roles: "4,200",
    sparkline: [2, 4, 6, 10, 14, 20, 28, 36, 42, 52],
    color: "#3b82f6",
  },
];

export default function MarketTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="market-data" ref={ref} className="py-16 px-4 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-2">Live Market Snapshot</h2>
          <p className="text-sm text-zinc-500">Real-time demand metrics across top technologies</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {MARKET_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-white/[0.06] bg-[#18181b] p-4 card-elevated"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">{card.name}</span>
                <span className="text-xs font-medium text-emerald-400">{card.demand}</span>
              </div>
              <Sparkline points={card.sparkline} color={card.color} />
              <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                <span>{card.salary} avg</span>
                <span>{card.roles}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

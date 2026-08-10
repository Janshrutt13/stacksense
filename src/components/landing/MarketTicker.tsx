"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { getAllRegionalTrends } from "@/lib/actions";
import type { MarketTrend } from "@prisma/client";

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
      <path
        d={d}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-sparkline"
      />
    </svg>
  );
}

export default function MarketTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [cards, setCards] = useState<
    Array<{
      name: string;
      roles: string;
      demand: string;
      salary: string;
      sparkline: number[];
      color: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const trends = await getAllRegionalTrends();

        // Extract top tech stacks from all regions
        const techStacks: Record<string, number> = {};
        trends.forEach((trend) => {
          const jobData = trend.jobData as Record<string, number>;
          Object.entries(jobData).forEach(([stack, count]) => {
            techStacks[stack] = (techStacks[stack] || 0) + (count as number);
          });
        });

        const colors = ["#06b6d4", "#3b82f6"];
        const cardsData = Object.entries(techStacks)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([name, roles], idx) => ({
            name,
            roles: (roles as number).toLocaleString(),
            demand: "+25%",
            salary: "$140k",
            sparkline: [12, 18, 15, 22, 20, 28, 25, 32, 30, 34],
            color: colors[idx % colors.length],
          }));

        setCards(cardsData);
      } catch (error) {
        console.error("Error loading market data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <section id="market-data" ref={ref} className="py-16 px-4 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Live Market Snapshot
          </h2>
          <p className="text-sm text-zinc-500">
            Real-time demand metrics across top technologies
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.06] bg-[#18181b] p-4 animate-pulse h-32"
              />
            ))}
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {cards.map((card, i) => (
              <motion.div
                key={card.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-white/[0.06] bg-[#18181b] p-4 card-elevated"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">
                    {card.name}
                  </span>
                  <span className="text-xs font-medium text-emerald-400">
                    {card.demand}
                  </span>
                </div>
                <Sparkline points={card.sparkline} color={card.color} />
                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>{card.salary} avg</span>
                  <span>{card.roles}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-zinc-500">
            No market data available yet. Check back after the cron job runs.
          </div>
        )}
      </div>
    </section>
  );
}

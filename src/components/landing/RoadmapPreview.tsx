"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const MOCK_ROADMAP = [
  { title: "TypeScript foundations", week: "Week 1–2" },
  { title: "Next.js app router", week: "Week 3–5" },
  { title: "Fastify services", week: "Week 6–7" },
  { title: "PostgreSQL modelling", week: "Week 8–9" },
  { title: "Docker & deployment", week: "Week 10–11" },
  { title: "System design", week: "Week 12" },
];

const DEMAND_INDEX = [
  { name: "TypeScript", jobs: 48210, pct: 100 },
  { name: "Next.js", jobs: 31884, pct: 66 },
  { name: "PostgreSQL", jobs: 26105, pct: 54 },
  { name: "Fastify", jobs: 8420, pct: 18 },
  { name: "Prisma", jobs: 12300, pct: 26 },
];

export default function RoadmapPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="roadmap-preview" ref={ref} className="py-28 px-4 bg-[#09090b]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Your fastest path to production.
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg leading-relaxed">
            A twelve-week sequence for a modern full-stack web developer, generated from live demand data.
            Next.js + Fastify + TypeScript + PostgreSQL + Prisma + Supabase.
          </p>
        </motion.div>

        {/* Staggered Product Screens */}
        <div className="relative">
          {/* Background screen (tilted) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="absolute top-4 left-4 right-4 bottom-0 rounded-3xl border border-white/[0.04] bg-[#18181b]/50 transform rotate-1"
          />

          {/* Main screen */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative rounded-3xl border border-white/[0.08] bg-[#09090b] overflow-hidden shadow-2xl shadow-black/40"
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs text-zinc-500 ml-2">stacksense.app / roadmap — Berlin</span>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
              {/* Roadmap Steps */}
              <div className="p-5 space-y-2.5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">Roadmap</p>
                {MOCK_ROADMAP.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.06] bg-[#18181b]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        {i === 0 ? (
                          <span className="text-cyan-400 text-xs">✓</span>
                        ) : (
                          <span className="text-cyan-400 text-xs font-medium">{i + 1}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <span className="text-xs text-zinc-500">{item.week}</span>
                  </motion.div>
                ))}
              </div>

              {/* Demand Index */}
              <div className="p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-medium">Demand Index</p>
                <div className="space-y-5">
                  {DEMAND_INDEX.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                    >
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-zinc-300">{item.name}</span>
                        <span className="text-zinc-500">{item.jobs.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${item.pct}%` } : {}}
                          transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stack summary */}
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <p className="text-xs text-zinc-500 mb-2">Target Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Next.js", "Fastify", "TypeScript", "PostgreSQL", "Prisma", "Supabase"].map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/[0.08] bg-white/[0.03] text-zinc-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

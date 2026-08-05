"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "StackSense showed me that the market in Berlin was hungry for Go + Kubernetes, not just React. Changed my entire learning trajectory — landed a senior role in 6 weeks.",
    name: "Marta K.",
    role: "Senior Backend Engineer",
    company: "Delivery Hero",
  },
  {
    quote: "I was stuck in tutorial hell for 8 months. The skill delta engine showed me I only needed to learn 3 things to be competitive. Got hired within a month.",
    name: "James Chen",
    role: "Full-Stack Developer",
    company: "Stripe",
  },
  {
    quote: "As a hiring manager, I can confirm — StackSense's demand data aligns almost perfectly with what we actually look for in candidates. It's eerily accurate.",
    name: "Sarah Obi",
    role: "Engineering Manager",
    company: "Vercel",
  },
  {
    quote: "The local market filter is a game-changer. Remote roles want different stacks than London roles. Nobody else surfaces this.",
    name: "Luca Rossi",
    role: "Career Switcher → Dev",
    company: "Formerly Finance",
  },
  {
    quote: "Replaced my entire career planning process. The roadmap it generated was more pragmatic than anything I'd seen from bootcamps or mentors.",
    name: "Aisha Patel",
    role: "Junior Developer",
    company: "Monzo",
  },
  {
    quote: "The comparison with traditional roadmaps sold me. Real data beats opinions every time. My team now uses it for upskilling planning.",
    name: "Tom Eriksson",
    role: "Tech Lead",
    company: "Klarna",
  },
];

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Trusted by engineers who ship
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            From career switchers to tech leads at top companies.
          </p>
        </motion.div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="break-inside-avoid rounded-2xl border border-white/[0.06] bg-[#09090b] p-5 card-elevated"
            >
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-white/[0.08] flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-400">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

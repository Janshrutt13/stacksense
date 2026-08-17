"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import MagneticButton from "./MagneticButton";

const bars = [34, 48, 41, 62, 55, 74, 69, 88];

const techList = [
  { name: "Next.js", roles: "48,120", demand: 66 },
  { name: "TypeScript", roles: "61,430", demand: 84 },
  { name: "React", roles: "72,905", demand: 100 },
  { name: "PostgreSQL", roles: "34,260", demand: 47 },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function HeroSection({
  onCtaClick,
  onExploreClick,
}: {
  onCtaClick: () => void;
  onExploreClick: () => void;
}) {
  const wrap = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 20 });
  const sy = useSpring(my, { stiffness: 90, damping: 20 });

  const tiltX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const tiltY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const floatX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const floatY = useTransform(sy, [-0.5, 0.5], [-12, 12]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section ref={wrap} className="relative overflow-hidden px-6 pb-24 pt-36 md:pt-48">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
        {/* Left */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease }}
            className="mt-7 text-5xl font-semibold leading-[1.02] tracking-tighter text-white md:text-6xl lg:text-[4.25rem]"
          >
            Learn what companies actually need.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400"
          >
            Stop following random tutorials. Discover your optimal technology stack using
            verified hiring data, salary trends, and company requirements.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <MagneticButton
              onClick={onCtaClick}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-400 px-6 text-sm font-semibold text-black transition-shadow duration-300 hover:bg-cyan-300"
            >
              Find my tech stack
              <ArrowRight className="size-4" aria-hidden="true" />
            </MagneticButton>
            <button
              onClick={onExploreClick}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/[0.08] px-6 text-sm font-medium text-zinc-400 transition-all duration-300 hover:border-white/20 hover:text-white"
            >
              Explore market trends
            </button>
          </motion.div>
        </div>

        {/* Right — Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
          className="relative"
        >
          {/* Outer glass wrapper */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
            {/* Terminal */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c]">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <span className="size-2 rounded-full bg-zinc-700" />
                <span className="size-2 rounded-full bg-zinc-700" />
                <span className="size-2 rounded-full bg-cyan-400/70" />
                <span className="ml-3 text-[11px] text-zinc-500">
                  stacksense.app / terminal — Berlin
                </span>
              </div>

              <div className="space-y-4 p-5">
                {/* Hiring Growth */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
                    <TrendingUp className="size-3.5 text-cyan-400" aria-hidden="true" />
                    Hiring growth
                  </div>
                  <div className="mt-4 flex h-24 items-end gap-2">
                    {bars.map((h, i) => (
                      <motion.span
                        key={i}
                        initial={{ height: 4, opacity: 0.3 }}
                        animate={{ height: `${h}%`, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.5 + i * 0.07, ease }}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500/25 to-cyan-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Top Hiring Technologies */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-4">
                  <p className="text-[11px] uppercase tracking-widest text-zinc-500">
                    Top hiring technologies
                  </p>
                  <div className="mt-4 space-y-3">
                    {techList.map((t, i) => (
                      <div key={t.name}>
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-white">{t.name}</span>
                          <span className="text-zinc-500">{t.roles} roles</span>
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${t.demand}%` }}
                            transition={{ duration: 0.9, delay: 0.6 + i * 0.1, ease }}
                            className="h-full rounded-full bg-cyan-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating salary card with parallax */}
          <motion.div
            style={{ x: floatX, y: floatY }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease }}
            className="absolute -bottom-12 -left-10 hidden w-56 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl sm:block"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
              <Wallet className="size-3.5 text-cyan-400" aria-hidden="true" />
              Salary insights
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white">€82,400</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-cyan-400">
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              +6.4% median, full-stack TS
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

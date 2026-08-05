"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Sparkles, ArrowRight, Search, TrendingUp, MapPin } from "lucide-react";
import MagneticButton from "./MagneticButton";

interface HeroSectionProps {
  location: string;
  setLocation: (val: string) => void;
  loading: boolean;
  onAnalyze: (e: React.FormEvent) => void;
  onCtaClick: () => void;
}

/* Mini sparkline SVG for the hero dashboard widget */
function MiniSparkline({ color = "#06b6d4" }: { color?: string }) {
  return (
    <svg width="80" height="28" viewBox="0 0 80 28" fill="none" className="animate-sparkline">
      <path
        d="M2 24 L12 18 L22 20 L32 12 L42 14 L52 8 L62 10 L72 4 L78 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M2 24 L12 18 L22 20 L32 12 L42 14 L52 8 L62 10 L72 4 L78 6 L78 28 L2 28Z"
        fill={`url(#sparkGrad-${color.replace('#', '')})`}
        opacity="0.15"
      />
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Interactive Hero Dashboard Widget (right side) */
function HeroDashboard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [5, -5]), {
    stiffness: 100,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-5, 5]), {
    stiffness: 100,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="relative w-full max-w-md"
    >
      <div className="rounded-3xl border border-white/[0.08] bg-[#09090b] p-5 space-y-4 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-medium">Live Hiring Trends</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03]">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-zinc-400">San Francisco / Remote</span>
          </div>
        </div>

        {/* Trend Rows */}
        {[
          { name: "Next.js", growth: "+34%", salary: "$152k", roles: "8,420", color: "#06b6d4" },
          { name: "TypeScript", growth: "+28%", salary: "$148k", roles: "12,100", color: "#3b82f6" },
          { name: "PostgreSQL", growth: "+22%", salary: "$145k", roles: "6,800", color: "#06b6d4" },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/[0.06] bg-[#18181b]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-white">{item.name}</span>
                <span className="text-xs text-emerald-400 font-medium">{item.growth}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                <span>Avg. {item.salary}</span>
                <span>·</span>
                <span>{item.roles} roles</span>
              </div>
            </div>
            <MiniSparkline color={item.color} />
          </div>
        ))}

        {/* Skill Gap Badge */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04]">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-xs text-zinc-300">
            React → <span className="text-cyan-400 font-medium">Fullstack Next.js + Fastify + PostgreSQL</span>
          </span>
        </div>
      </div>

      {/* Ambient glow behind widget */}
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-cyan-500/[0.04] blur-3xl" />
    </motion.div>
  );
}

export default function HeroSection({
  location,
  setLocation,
  loading,
  onAnalyze,
  onCtaClick,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-20">
      {/* Ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column - Text */}
        <div>
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-400 mb-8"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Powered by Real-Time Hiring Telemetry
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black tracking-tighter leading-[1.05] mb-6"
          >
            Learn What Companies{" "}
            <span className="gradient-text">Actually Need.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-zinc-400 text-lg leading-relaxed max-w-xl mb-10"
          >
            Stop following random tutorials. Discover your optimal tech stack using verified
            hiring data, local salary trends, and company requirements.
          </motion.p>

          {/* Action Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <MagneticButton
              onClick={onCtaClick}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-colors"
            >
              Explore My Career Path <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <button
              onClick={() => document.getElementById("market-data")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-sm text-zinc-300 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
            >
              View Live Market
            </button>
          </motion.div>

          {/* Search bar below hero text */}
          <motion.form
            onSubmit={onAnalyze}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center gap-0 w-full max-w-lg mt-8"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-l-full border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm">
              <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search your city (e.g., London, Remote)"
                className="bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none w-full"
              />
            </div>
            <MagneticButton
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3.5 rounded-r-full bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-60 shrink-0"
            >
              {loading ? "Analyzing…" : <>Analyze <ArrowRight className="w-4 h-4" /></>}
            </MagneticButton>
          </motion.form>
        </div>

        {/* Right Column - Dashboard Widget */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hidden lg:flex justify-center"
        >
          <HeroDashboard />
        </motion.div>
      </div>
    </section>
  );
}

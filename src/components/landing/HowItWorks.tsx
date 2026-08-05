"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Search, Database, GitCompare, BookOpen } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    number: "01",
    title: "Select Experience Level & Location",
    desc: "Tell us your current stack, experience level, and target city or remote preference.",
  },
  {
    icon: Database,
    number: "02",
    title: "Aggregate Verified Hiring Data",
    desc: "We scan thousands of active job postings to build a real-time demand profile for your market.",
  },
  {
    icon: GitCompare,
    number: "03",
    title: "Calculate Skill Delta",
    desc: "Our engine diffs what you know against what the market pays for — surfacing only the gaps that matter.",
  },
  {
    icon: BookOpen,
    number: "04",
    title: "Receive Interactive Learning Roadmap",
    desc: "Get a step-by-step curriculum with milestones, project ideas, and key topics — sequenced by dependency.",
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.6"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={sectionRef} className="py-28 px-4 bg-[#09090b]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">How It Works</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            From zero to a personalized career roadmap in four simple steps.
          </p>
        </motion.div>

        <div ref={containerRef} className="relative">
          {/* Animated SVG Line */}
          <div className="absolute left-[27px] md:left-[31px] top-0 bottom-0 w-px">
            <svg
              width="2"
              height="100%"
              viewBox="0 0 2 600"
              preserveAspectRatio="none"
              className="h-full w-[2px]"
            >
              {/* Background track */}
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="600"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              {/* Animated fill */}
              <motion.line
                x1="1"
                y1="0"
                x2="1"
                y2="600"
                stroke="url(#lineGrad)"
                strokeWidth="2"
                strokeDasharray="6 6"
                style={{ pathLength }}
              />
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                  className="flex items-start gap-6 pl-2"
                >
                  {/* Step circle */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#18181b] border border-white/[0.08] flex items-center justify-center shrink-0 relative z-10">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest mb-1 block">
                      Step {step.number}
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight mb-1.5">{step.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

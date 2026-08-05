"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Where does StackSense get its data?",
    a: "We aggregate from active job postings across LinkedIn, Indeed, company career pages, and other verified hiring platforms. Data is refreshed weekly to ensure accuracy. We never rely on surveys, self-reported salaries, or AI-generated assumptions.",
  },
  {
    q: "How is this different from roadmaps on YouTube or Reddit?",
    a: "Traditional roadmaps are based on opinions — someone's personal journey or a content creator's preference. StackSense roadmaps are generated from actual hiring demand in your specific market. Every recommendation maps to a real data point.",
  },
  {
    q: "Can I filter by my specific city?",
    a: "Yes. StackSense provides city-level hiring intelligence. Demand for technologies varies dramatically between markets — what's hot in San Francisco may be irrelevant in Berlin. We surface these differences so you learn what's actually hiring near you.",
  },
  {
    q: "What if I already know some of the technologies?",
    a: "Our Skill Delta Engine calculates only the gap between your current stack and what the market demands. You'll never be told to learn something you already know. The roadmap adapts to your existing experience level.",
  },
  {
    q: "Is StackSense free?",
    a: "The market intelligence dashboard and basic demand data are free. Personalized roadmaps, skill delta analysis, and resume alignment features are available on our Pro plan. No credit card required to start.",
  },
  {
    q: "How often is the data updated?",
    a: "Market intelligence is refreshed on a weekly cadence. Major shifts in hiring trends are flagged within 48 hours. You'll always see the most current demand landscape for your target market.",
  },
];

function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors pr-4">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm text-zinc-400 leading-relaxed pb-5 pr-8">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" ref={ref} className="py-28 px-4 bg-[#09090b]">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            Everything you need to know about how StackSense works.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

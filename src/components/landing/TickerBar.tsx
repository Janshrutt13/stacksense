"use client";

const TICKER_ITEMS = [
  "TypeScript · 48,210 roles",
  "React · 44,200 roles",
  "Next.js · 31,884 roles",
  "Node.js · 38,900 roles",
  "PostgreSQL · 26,105 roles",
  "Python · 41,200 roles",
  "Docker · 19,800 roles",
  "Kubernetes · 14,770 roles",
  "Go · 12,300 roles",
  "Rust · 7,800 roles",
  "GraphQL · 11,200 roles",
  "Tailwind CSS · 22,400 roles",
];

export default function TickerBar() {
  return (
    <div className="border-y border-white/[0.06] py-3 overflow-hidden bg-[#09090b]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs text-zinc-500">
            <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

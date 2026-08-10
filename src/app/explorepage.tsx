"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllRegionalTrends } from "@/lib/actions";
import { normalizeLocation } from "@/lib/utils";
import type { MarketTrend } from "@prisma/client";
import RoadmapGenerator from "@/components/RoadmapGenerator";
import MarketRadar from "@/components/MarketRadar";

export default function ExplorePage() {
  const [allTrends, setAllTrends] = useState<MarketTrend[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRegionalTrends().then((data) => {
      setAllTrends(data);
      setLoading(false);
    });
  }, []);

  const trends = query.trim()
    ? allTrends.filter((t) =>
        t.location.toLowerCase().includes(normalizeLocation(query).toLowerCase())
      )
    : allTrends;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      {/* Main split-pane container */}
      <div className="relative h-screen flex">
        {/* Left Pane: Market Radar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-1/2 border-r border-slate-800/50 overflow-y-auto"
        >
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Market Radar
              </h1>
              <p className="text-slate-400 mt-2">
                Real-time tech stack demand across regions
              </p>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search location (e.g. Bangalore, Jaipur…)"
                className="mt-4 w-full rounded-lg bg-slate-800/60 border border-slate-700/50 px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/70"
              />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-slate-800/30 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <MarketRadar trends={trends} />
            )}
          </div>
        </motion.div>

        {/* Right Pane: Roadmap Generator */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-1/2 overflow-y-auto"
        >
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Generate Roadmap</h2>
              <p className="text-slate-400 mt-2">
                AI-powered learning path based on market demand
              </p>
            </div>
            <RoadmapGenerator marketData={trends} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

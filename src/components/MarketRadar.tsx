import { motion } from "framer-motion";
import type { MarketTrend } from "@prisma/client";
import type { ScrapedJob, ScrapedArticle } from "@/lib/types";

interface MarketRadarProps {
  trends: MarketTrend[];
}

export default function MarketRadar({ trends }: MarketRadarProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {trends.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-12">
          No market data available yet. Try searching a location.
        </p>
      )}
      {trends.map((trend) => {
        const jobData = trend.jobData as ScrapedJob[];
        const articles = trend.articleData as ScrapedArticle[];

        return (
          <motion.div
            key={trend.id}
            variants={item}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300"
          >
            {/* Glassmorphism effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">
                {trend.location}
              </h3>

              {/* Job counts */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {jobData.map((job) => (
                  <div
                    key={job.tech}
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30"
                  >
                    <p className="text-xs text-slate-400">{job.tech}</p>
                    <p className="text-lg font-bold text-cyan-400">
                      {job.openings.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">{job.demandScore}</p>
                  </div>
                ))}
              </div>

              {/* Top articles */}
              {articles && articles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/30">
                  <p className="text-xs font-semibold text-slate-300 mb-2">
                    Trending Articles
                  </p>
                  <div className="space-y-2">
                    {articles.slice(0, 2).map((article, idx) => (
                      <a
                        key={idx}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-400 hover:text-blue-300 truncate transition-colors"
                      >
                        {article.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 mt-3">
                Updated {new Date(trend.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

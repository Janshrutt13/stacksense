"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import type { MarketTrend } from "@prisma/client";
import type { ScrapedJob } from "@/lib/types";

const experienceLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

const roadmapResultSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  phases: z.array(
    z.object({
      name: z.string(),
      duration: z.string(),
      topics: z.array(z.string()),
      projects: z.array(z.string()),
    }),
  ),
  resources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(["course", "article", "video", "book"]),
    }),
  ),
});

type RoadmapType = z.infer<typeof roadmapResultSchema>;

interface RoadmapGeneratorProps {
  marketData: MarketTrend[];
}

export default function RoadmapGenerator({ marketData }: RoadmapGeneratorProps) {
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [generating, setGenerating] = useState(false);

  const { register, handleSubmit, watch } = useForm({
    resolver: zodResolver(z.object({ experienceLevel: experienceLevelSchema })),
    defaultValues: { experienceLevel: "beginner" },
  });

  const experienceLevel = watch("experienceLevel");

  async function onSubmit() {
    setGenerating(true);
    try {
      const marketContext = marketData
        .map((t) => {
          const jobs = t.jobData as unknown as ScrapedJob[];
          return `${t.location}: ${jobs.map((j) => `${j.tech} (${j.openings} openings, ${j.demandScore} demand)`).join(", ")}`;
        })
        .join("\n");

      const topStack = marketData.length > 0
        ? (marketData[0].jobData as unknown as ScrapedJob[])?.[0]?.tech || "React"
        : "React";

      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceLevel,
          currentSkills: [],
          location: marketData.length > 0 ? marketData[0].location : "Remote",
          targetStack: topStack,
          marketContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Map the API response to our display format
        if (data.milestones) {
          setRoadmap({
            title: data.targetStack || topStack,
            description: data.deltaAnalysis || `A ${experienceLevel} level roadmap`,
            duration: `${data.estimatedWeeks || 12} weeks`,
            phases: data.milestones.map((m: { title: string; weekRange: string; keyConcepts: string[]; projectIdea: string }) => ({
              name: m.title,
              duration: m.weekRange,
              topics: m.keyConcepts || [],
              projects: m.projectIdea ? [m.projectIdea] : [],
            })),
            resources: [],
          });
        }
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Experience Level
          </label>
          <select
            {...register("experienceLevel")}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={generating}
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-300"
        >
          {generating ? "Generating..." : "Generate Roadmap"}
        </motion.button>
      </form>

      {/* Roadmap Display */}
      {roadmap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mt-8"
        >
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-blue-300 mb-2">
              {roadmap.title}
            </h3>
            <p className="text-slate-400 mb-4">{roadmap.description}</p>
            <p className="text-sm text-cyan-400">Duration: {roadmap.duration}</p>
          </div>

          {/* Phases */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-slate-200">Learning Phases</h4>
            {roadmap.phases.map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4"
              >
                <h5 className="font-semibold text-blue-300 mb-2">
                  {phase.name} ({phase.duration})
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Topics:</p>
                    <ul className="space-y-1">
                      {phase.topics.map((topic, i) => (
                        <li key={i} className="text-cyan-400">
                          • {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Projects:</p>
                    <ul className="space-y-1">
                      {phase.projects.map((project, i) => (
                        <li key={i} className="text-cyan-400">
                          • {project}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Resources */}
          {roadmap.resources.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-slate-200">Resources</h4>
              <div className="space-y-2">
                {roadmap.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-slate-800/30 border border-slate-700/30 rounded-lg p-3 hover:border-blue-500/50 transition-colors"
                  >
                    <p className="text-blue-400 hover:text-blue-300 font-medium">
                      {resource.title}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {resource.type}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

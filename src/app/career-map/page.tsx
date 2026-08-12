"use client";

import { useState, useEffect } from "react";
import { generateCareerRoadmap } from "@/actions/roadmap";
import type { RoadmapFormData, GeneratedRoadmapResponse } from "@/types/roadmap";

const LOADING_MSGS = [
  "ANALYZING SKILL PROFILE...",
  "MAPPING SKILL BRIDGE...",
  "SOURCING RESOURCES...",
  "COMPILING ROADMAP...",
];

export default function CareerMapPage() {
  const [form, setForm] = useState<RoadmapFormData>({
    currentRole: "",
    currentTechStack: [],
    yearsOfExp: 0,
    targetTechStack: [],
    targetRole: "",
    additionalInfo: "",
  });

  const [rawCurrentStack, setRawCurrentStack] = useState("");
  const [rawTargetStack, setRawTargetStack] = useState("");

  const [result, setResult] = useState<GeneratedRoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setMsgIdx((prev) => (prev + 1) % LOADING_MSGS.length);
      }, 1800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse comma separated inputs
    const currentTechStack = rawCurrentStack.split(",").map((s) => s.trim()).filter(Boolean);
    const targetTechStack = rawTargetStack.split(",").map((s) => s.trim()).filter(Boolean);

    // Validation
    const errors: Record<string, string> = {};
    if (!form.currentRole.trim()) errors.currentRole = "Current role is required.";
    if (currentTechStack.length === 0) errors.currentTechStack = "At least one technology required.";
    if (targetTechStack.length === 0) errors.targetTechStack = "At least one target technology required.";
    if (form.yearsOfExp < 0) errors.yearsOfExp = "Years of experience cannot be negative.";

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const submissionData: RoadmapFormData = {
      ...form,
      currentTechStack,
      targetTechStack,
    };

    const data = await generateCareerRoadmap(submissionData);
    if (!data) {
      setError("Generation failed. Check your inputs and try again.");
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-widest mb-1">Career Roadmap</h1>
        </div>

        {!loading && !result && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 border border-zinc-800 p-6 rounded-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider">Current Role</label>
                <input
                  type="text"
                  value={form.currentRole}
                  onChange={(e) => setForm({ ...form, currentRole: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-none text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="e.g. Frontend Developer"
                />
                {validationErrors.currentRole && (
                  <p className="text-red-400 font-mono text-xs">{validationErrors.currentRole}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={form.yearsOfExp}
                  onChange={(e) => setForm({ ...form, yearsOfExp: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-none text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                {validationErrors.yearsOfExp && (
                  <p className="text-red-400 font-mono text-xs">{validationErrors.yearsOfExp}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider">Current Tech Stack (comma separated)</label>
              <input
                type="text"
                value={rawCurrentStack}
                onChange={(e) => setRawCurrentStack(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-none text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="React, Tailwind, Node.js"
              />
              {validationErrors.currentTechStack && (
                <p className="text-red-400 font-mono text-xs">{validationErrors.currentTechStack}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider">Target Role</label>
                <input
                  type="text"
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-none text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="e.g. Full Stack Engineer"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider">Target Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={rawTargetStack}
                  onChange={(e) => setRawTargetStack(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-none text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="Next.js, Prisma, PostgreSQL"
                />
                {validationErrors.targetTechStack && (
                  <p className="text-red-400 font-mono text-xs">{validationErrors.targetTechStack}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider">Additional Context (Optional)</label>
              <textarea
                value={form.additionalInfo}
                onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-none text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors h-24 resize-none"
                placeholder="Any specific goals, time constraints, or learning preferences?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-300 rounded-none uppercase font-bold tracking-widest px-6 py-3 transition-colors"
            >
              Generate Roadmap
            </button>
          </form>
        )}

        {error && (
          <div className="bg-zinc-900 border border-red-500/50 p-6 rounded-none space-y-4">
            <p className="text-red-400 font-mono text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-red-500 text-white hover:bg-red-400 rounded-none uppercase font-bold tracking-widest px-6 py-3 transition-colors inline-block"
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6 bg-zinc-900 border border-zinc-800 rounded-none">
            <div className="animate-spin border-2 border-zinc-700 border-t-emerald-400 w-8 h-8 rounded-full" />
            <div className="flex items-center space-x-1">
              <span className="text-emerald-400 font-mono text-sm uppercase tracking-widest">
                {LOADING_MSGS[msgIdx]}
              </span>
              <span className="text-emerald-400 font-mono text-sm animate-pulse">_</span>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-widest">Your Roadmap</h2>
                <p className="text-zinc-400 font-mono text-xs mt-1">Targeting {result.targetRole || "Software Engineer"}</p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-zinc-400 hover:text-zinc-100 font-mono text-xs uppercase tracking-widest transition-colors"
              >
                [ Start Over ]
              </button>
            </div>

            <div className="space-y-6">
              {result.phases.map((phase, idx) => (
                <div key={idx} className="relative">
                  <div className="bg-zinc-800 px-4 py-2 flex justify-between items-center rounded-none">
                    <h3 className="text-zinc-100 font-mono font-bold uppercase">
                      PHASE {phase.phaseNumber} — {phase.title}
                    </h3>
                    <span className="border border-emerald-500/50 text-emerald-400 bg-emerald-950/30 px-2 py-1 text-xs font-mono uppercase">
                      {phase.duration}
                    </span>
                  </div>

                  <div className="border-l-2 border-zinc-800 ml-4 pl-6 py-4 space-y-6">
                    <div>
                      <p className="text-zinc-400 text-sm">{phase.objective}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {phase.topics.map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="border border-zinc-700 text-zinc-300 px-2 py-0.5 text-xs font-mono"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {phase.resources.map((resource, rIdx) => (
                        <div key={rIdx} className="bg-zinc-900 border border-zinc-800 p-4 rounded-none">
                          <div className="flex justify-between items-start mb-2">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono text-sm inline-flex items-center gap-1"
                            >
                              {resource.name} <span>⬀</span>
                            </a>
                            <div className="flex gap-2 shrink-0">
                              <span className="border border-emerald-500/50 text-emerald-400 bg-emerald-950/30 px-2 py-1 text-xs font-mono uppercase">
                                {resource.type}
                              </span>
                              <span className="border border-emerald-500/50 text-emerald-400 bg-emerald-950/30 px-2 py-1 text-xs font-mono uppercase">
                                {resource.estimatedTime}
                              </span>
                            </div>
                          </div>
                          <p className="text-zinc-500 text-xs mt-1">{resource.whyRecommended}</p>
                        </div>
                      ))}
                    </div>

                    {phase.projectIdea && (
                      <div className="border border-zinc-700 bg-zinc-900/50 p-4 mt-4 rounded-none">
                        <div className="text-emerald-400 font-mono text-xs uppercase mb-1 tracking-widest">
                          PROJECT
                        </div>
                        <h4 className="text-zinc-100 font-bold mb-2">{phase.projectIdea.title}</h4>
                        <p className="text-zinc-400 text-sm">{phase.projectIdea.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

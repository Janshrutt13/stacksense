"use client";

import { db } from "@/lib/db";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Milestone = {
  title: string;
  weekRange: string;
  description: string;
  keyConcepts: string[];
  projectIdea: string;
};

type RoadmapData = {
  targetStack: string;
  estimatedWeeks: number;
  deltaAnalysis: string;
  milestones: Milestone[];
};

export default function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/roadmap/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRoadmap(data.nodes as RoadmapData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function toggleComplete(i: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Roadmap not found.</p>
        <Link href="/dashboard" className="text-cyan-400 text-sm hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const progress = Math.round((completed.size / roadmap.milestones.length) * 100);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <span className="font-bold text-sm">StackSense</span>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-24 rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500">{progress}%</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {roadmap.estimatedWeeks} weeks · {roadmap.milestones.length} milestones
          </div>
          <h1 className="text-4xl font-black mb-3">{roadmap.targetStack}</h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">{roadmap.deltaAnalysis}</p>
        </div>

        <div className="relative">
          {/* connecting line */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-white/[0.06]" />

          <div className="space-y-4">
            {roadmap.milestones.map((milestone, i) => {
              const done = completed.has(i);
              return (
                <div key={i} className="relative pl-14">
                  {/* node dot */}
                  <button
                    onClick={() => toggleComplete(i)}
                    className="absolute left-2.5 top-4 -translate-x-1/2 z-10"
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400 transition-colors" />
                    )}
                  </button>

                  <div
                    className={`rounded-2xl border p-5 transition-colors ${
                      done
                        ? "border-cyan-400/30 bg-cyan-400/[0.03]"
                        : "border-white/[0.08] bg-[#09090b]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-cyan-400">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-sm font-semibold">{milestone.title}</h3>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-white/[0.08] text-zinc-500">
                          {milestone.weekRange}
                        </span>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-sm mb-4">{milestone.description}</p>

                    {milestone.keyConcepts.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                          <BookOpen className="w-3 h-3" /> Key concepts
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {milestone.keyConcepts.map((c) => (
                            <span
                              key={c}
                              className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-400"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-400">{milestone.projectIdea}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

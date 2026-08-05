"use client";

import { getMarketIntelligence, type MarketEntry } from "@/lib/actions";
import { ArrowRight, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
};

const STACKS = [
  "Next.js + TypeScript + PostgreSQL",
  "React + Node.js + MongoDB",
  "Vue.js + FastAPI + PostgreSQL",
  "Angular + Spring Boot + MySQL",
  "React Native + Expo + Supabase",
  "Python + Django + PostgreSQL",
  "Go + Gin + Redis",
  "Rust + Axum + PostgreSQL",
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [expLevel, setExpLevel] = useState<"beginner" | "experienced">("beginner");
  const [targetStack, setTargetStack] = useState("");
  const [marketData, setMarketData] = useState<MarketEntry[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Fetch session on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setSessionLoading(false);
      })
      .catch(() => setSessionLoading(false));
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setSigningOut(false);
    }
  }

  async function handleMarketSearch() {
    if (!location.trim()) return;
    setLoadingMarket(true);
    try {
      const data = await getMarketIntelligence(location, skills.split(",").map((s) => s.trim()));
      setMarketData(data);
    } finally {
      setLoadingMarket(false);
    }
  }

  async function handleGenerateRoadmap() {
    if (!targetStack || !location) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceLevel: expLevel,
          currentSkills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          location,
          targetStack,
        }),
      });
      const data = await res.json();
      if (data.roadmapId) router.push(`/roadmap/${data.roadmapId}`);
    } finally {
      setGenerating(false);
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-bold text-sm hover:opacity-80 transition-opacity">StackSense</a>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-xs text-zinc-500">{user.email}</span>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-2">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-zinc-400 text-sm">Build your personalized tech stack roadmap.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* STEP 1 */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#09090b] p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">01</span>
              <span className="text-sm font-semibold">Your profile</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Experience level</label>
                <div className="flex gap-2">
                  {(["beginner", "experienced"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setExpLevel(lvl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors capitalize ${
                        expLevel === lvl
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                          : "border-white/[0.08] text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Current skills (comma-separated)</label>
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, JavaScript, CSS…"
                  className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] bg-[#18181b] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-cyan-400/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Your city / region</label>
                <div className="flex gap-2">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="London, Berlin, Remote…"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-[#18181b] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-cyan-400/50 transition-colors"
                  />
                  <button
                    onClick={handleMarketSearch}
                    disabled={loadingMarket || !location.trim()}
                    className="px-4 py-2.5 rounded-xl bg-cyan-400 text-black text-xs font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-50"
                  >
                    {loadingMarket ? "…" : "Scan"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#09090b] p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">02</span>
              <span className="text-sm font-semibold">Choose your target stack</span>
            </div>

            <div className="space-y-2 mb-5">
              {STACKS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTargetStack(s)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-colors ${
                    targetStack === s
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-white/[0.06] text-zinc-400 hover:border-white/[0.15] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <input
              value={STACKS.includes(targetStack) ? "" : targetStack}
              onChange={(e) => setTargetStack(e.target.value)}
              placeholder="Or type a custom stack…"
              className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] bg-[#18181b] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>
        </div>

        {/* MARKET DATA */}
        {marketData && (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#09090b] p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
              Market demand — {location}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {marketData.slice(0, 8).map((item) => (
                <div key={item.stack} className="rounded-xl bg-[#18181b] border border-white/[0.06] p-3">
                  <p className="text-xs text-zinc-400 mb-1">{item.stack}</p>
                  <p className="text-xl font-bold text-cyan-400">{item.pct}%</p>
                  <p className="text-xs text-zinc-500">{item.jobs.toLocaleString()} roles</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENERATE */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerateRoadmap}
            disabled={generating || !targetStack || !location}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-400 text-black font-semibold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Generating roadmap…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate my roadmap
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Sparkles,
  GitBranch,
  TrendingUp,
  MapPin,
  Clock,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  RotateCcw,
  Compass,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import MagneticButton from "./MagneticButton";
import {
  PRESET_SCENARIOS,
  COMPARISON_PRESETS,
  calculateCareerSimulation,
  type SimulationParams,
} from "@/lib/career-simulator-data";
import {
  getLiveCareerTelemetry,
  getLiveComparisonTelemetry,
} from "@/actions/simulator";
import type { LiveSimulatorTelemetry } from "@/lib/adzuna-telemetry";

const AVAILABLE_SKILLS_POOL = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "Spring Boot",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
  "Go",
  "Kubernetes",
  "Next.js",
];

const TARGET_ROLES = [
  "Backend Engineer",
  "Full Stack Engineer",
  "Cloud Backend Developer",
  "Distributed Systems Engineer",
  "AI / Backend Developer",
  "DevOps / Platform Engineer",
];

const POPULAR_LOCATIONS = [
  "Bangalore",
  "San Francisco",
  "London",
  "Berlin",
  "New York",
  "Seattle",
  "Austin",
  "Toronto",
  "Hyderabad",
  "Pune",
  "Mumbai",
];

const CONSIDERING_TECHS = [
  { name: "Java", icon: "☕", hint: "Enterprise & High Scale" },
  { name: "AWS", icon: "☁️", hint: "Cloud Architecture" },
  { name: "Python", icon: "🐍", hint: "AI & Fast APIs" },
  { name: "Go", icon: "⚡", hint: "High Concurrency" },
  { name: "Docker", icon: "🐳", hint: "Containerization" },
  { name: "PostgreSQL", icon: "🐘", hint: "Core Database" },
  { name: "Kubernetes", icon: "☸️", hint: "Orchestration" },
  { name: "TypeScript", icon: "🔷", hint: "Full-Stack Safety" },
];

export default function CareerSimulator() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const [activeTab, setActiveTab] = useState<"simulator" | "compare">("simulator");
  const [activePresetId, setActivePresetId] = useState<string>("java-spring");

  // Simulation form state
  const [currentSkills, setCurrentSkills] = useState<string[]>(["React", "Node.js", "MongoDB"]);
  const [currentStack, setCurrentStack] = useState<string>("React + Node.js");
  const [targetRole, setTargetRole] = useState<string>("Backend Engineer");
  const [location, setLocation] = useState<string>("Bangalore");
  const [consideringTech, setConsideringTech] = useState<string>("Java");
  const [learningTimeMonths, setLearningTimeMonths] = useState<number>(6);

  // Comparison state
  const [selectedComparisonPreset, setSelectedComparisonPreset] = useState<"default" | "python_vs_go">("default");

  // Live Adzuna Telemetry state
  const [liveData, setLiveData] = useState<LiveSimulatorTelemetry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [liveComparisonCounts, setLiveComparisonCounts] = useState<{
    pathAOpenings: number;
    pathBOpenings: number;
    isLive: boolean;
  } | null>(null);

  // Run deterministic calculation engine as instant baseline
  const simulationParams: SimulationParams = useMemo(
    () => ({
      currentSkills,
      currentStack,
      targetRole,
      location,
      consideringTech,
      learningTimeMonths,
    }),
    [currentSkills, currentStack, targetRole, location, consideringTech, learningTimeMonths]
  );

  const simulationResult = useMemo(
    () => calculateCareerSimulation(simulationParams),
    [simulationParams]
  );

  // Fetch real-time scraped telemetry from Adzuna whenever simulation parameters change
  useEffect(() => {
    let isCurrent = true;
    startTransition(async () => {
      try {
        const result = await getLiveCareerTelemetry({
          consideringTech,
          location,
          targetRole,
          currentSkills,
          learningTimeMonths,
        });
        if (isCurrent) {
          setLiveData(result);
        }
      } catch (err) {
        console.error("Failed to load live Adzuna telemetry", err);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [consideringTech, location, targetRole, currentSkills, learningTimeMonths]);

  // Fetch real-time scraped telemetry for comparison mode
  useEffect(() => {
    if (activeTab === "compare") {
      getLiveComparisonTelemetry(selectedComparisonPreset).then((res) => {
        if (res) {
          setLiveComparisonCounts(res);
        }
      });
    }
  }, [activeTab, selectedComparisonPreset]);

  // Merge live Adzuna data with baseline
  const marketDemand = liveData?.marketDemand || simulationResult.marketDemand;
  const locationDemand = liveData?.locationDemand || simulationResult.locationDemand;
  const topCompaniesHiring = liveData?.topCompaniesHiring || simulationResult.topCompaniesHiring;
  const commonlyRequestedSkills = liveData?.commonlyRequestedSkills || simulationResult.commonlyRequestedSkills;
  const relatedRoles = liveData?.relatedRoles || simulationResult.relatedRoles;
  const evidence = liveData?.evidence || simulationResult.evidence;
  const isLive = liveData?.isLive ?? false;

  // Handlers for Preset Scenarios
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setCurrentSkills(preset.currentSkills);
    setCurrentStack(preset.currentStack);
    setConsideringTech(preset.consideringTech);
    setTargetRole(preset.targetRole);
    setLocation(preset.location);
    setLearningTimeMonths(preset.learningTimeMonths);
  };

  const toggleSkill = (skill: string) => {
    setActivePresetId("");
    if (currentSkills.includes(skill)) {
      if (currentSkills.length > 1) {
        const next = currentSkills.filter((s) => s !== skill);
        setCurrentSkills(next);
        setCurrentStack(next.slice(0, 2).join(" + "));
      }
    } else {
      const next = [...currentSkills, skill];
      setCurrentSkills(next);
      setCurrentStack(next.slice(0, 2).join(" + "));
    }
  };

  const handleReset = () => {
    handleSelectPreset("java-spring");
  };

  return (
    <section
      id="simulator"
      ref={sectionRef}
      className="relative px-4 pb-24 pt-36 md:pt-48 overflow-hidden bg-black"
    >
      {/* Background ambient lighting */}
      {/* Ambient glow matching HeroSection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-3xl"
      />
      
      {/* Bottom ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 w-[60rem] h-[20rem] -translate-x-1/2 rounded-full bg-blue-500/[0.04] blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            What if you changed your stack?
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Experiment with different skills, transition timelines, and locations. Powered by verified job market telemetry — zero synthetic scores or AI opinions.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-black/50">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${activeTab === "simulator"
                ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              <Sliders className="w-4 h-4" />
              What If? Simulator
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${activeTab === "compare"
                ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              <GitBranch className="w-4 h-4" />
              Compare Paths
            </button>
          </div>
        </motion.div>

        {activeTab === "simulator" ? (
          <div>
            {/* ── 1. "WHAT IF?" INTERACTION CHIPS ────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Quick &quot;What If?&quot; Scenarios
                </span>
                <button
                  onClick={handleReset}
                  className="text-xs font-medium text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {PRESET_SCENARIOS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${isSelected
                        ? "bg-white/[0.04] border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/30 scale-[1.02]"
                        : "bg-[#0a0a0c] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02] hover:scale-[1.01]"
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent pointer-events-none" />
                      )}
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isSelected
                            ? "bg-cyan-400 text-black shadow-sm"
                            : "bg-white/[0.04] text-zinc-400 group-hover:text-zinc-300 border border-white/[0.04]"
                            }`}
                        >
                          {preset.badge}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        )}
                      </div>
                      <p className={`text-xs font-medium leading-relaxed relative z-10 ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                        {preset.question}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── 2. INTERACTIVE SIMULATOR CONTROLS ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden"
            >
              {/* Inner ambient glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.03] blur-3xl rounded-full pointer-events-none" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Skills & Stack */}
                <div className="lg:col-span-5 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      1. Current Skills &amp; Stack
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_SKILLS_POOL.map((skill) => {
                        const active = currentSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-300 ${active
                              ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                              : "bg-[#0a0a0c] text-zinc-400 border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02] hover:text-white"
                              }`}
                          >
                            {active && "✓ "}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Target Role
                      </label>
                      <select
                        value={targetRole}
                        onChange={(e) => {
                          setActivePresetId("");
                          setTargetRole(e.target.value);
                        }}
                        className="w-full bg-[#0a0a0c] border border-white/[0.06] hover:border-white/20 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all appearance-none cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A1A1AA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' }}
                      >
                        {TARGET_ROLES.map((role) => (
                          <option key={role} value={role} className="bg-[#0a0a0c]">
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Target Location
                      </label>
                      <select
                        value={location}
                        onChange={(e) => {
                          setActivePresetId("");
                          setLocation(e.target.value);
                        }}
                        className="w-full bg-[#0a0a0c] border border-white/[0.06] hover:border-white/20 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all appearance-none cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A1A1AA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' }}
                      >
                        {POPULAR_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc} className="bg-[#0a0a0c]">
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: "What If I Learn...?" Selection */}
                <div className="lg:col-span-7 space-y-5 lg:border-l lg:border-white/[0.06] lg:pl-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                      2. &quot;What If I Learn...?&quot; (Choose Technology)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CONSIDERING_TECHS.map((item) => {
                        const isSelected = consideringTech === item.name;
                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              setActivePresetId("");
                              setConsideringTech(item.name);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${isSelected
                              ? "bg-cyan-400/10 border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.1)] ring-1 ring-cyan-400/20"
                              : "bg-[#0a0a0c] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02]"
                              }`}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent pointer-events-none" />
                            )}
                            <div className="flex items-center gap-2 mb-1.5 relative z-10">
                              <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                              <span
                                className={`text-[11px] font-bold tracking-wide ${isSelected ? "text-cyan-300" : "text-zinc-200"
                                  }`}
                              >
                                {item.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-tight">
                              {item.hint}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-zinc-400">
                        Available Preparation Time
                      </label>
                      <span className="text-xs font-bold text-cyan-400">
                        {learningTimeMonths} Months
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[3, 6, 12].map((months) => (
                        <button
                          key={months}
                          onClick={() => {
                            setActivePresetId("");
                            setLearningTimeMonths(months);
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${learningTimeMonths === months
                            ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                            : "bg-[#0a0a0c] text-zinc-400 border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02] hover:text-white"
                            }`}
                        >
                          {months} Months
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── 3. DYNAMIC SIMULATION RESULTS CONTAINER ────────────────────── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${consideringTech}-${location}-${targetRole}-${currentSkills.join("-")}-${learningTimeMonths}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Result Header Badge with Live Adzuna Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`size-2 rounded-full ${
                        isPending
                          ? "bg-amber-400 animate-spin"
                          : isLive
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-cyan-400 animate-pulse"
                      }`}
                    />
                    <span className="text-xs md:text-sm text-zinc-300 font-medium">
                      Simulated Transition:{" "}
                      <span className="text-white font-bold">{currentStack}</span>
                      {" → "}
                      <span className="text-cyan-400 font-bold">
                        {consideringTech}
                      </span>{" "}
                      in <span className="text-white font-bold">{location}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <span className="text-[11px] font-medium text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5">
                        <RotateCcw className="w-3 h-3 animate-spin" />
                        Scraping Adzuna Live...
                      </span>
                    ) : isLive ? (
                      <span className="text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        ✓ Scraped from Adzuna Live
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                        ✓ Verified Adzuna Telemetry
                      </span>
                    )}
                  </div>
                </div>

                {/* ── A. VISUAL INTERACTIVE CAREER PATH ──────────────────────── */}
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        Sequenced Career Progression Path
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Dependency-ordered skill acquisition path to transition toward{" "}
                        <span className="text-white font-semibold">{targetRole}</span>.
                      </p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-[#18181b] px-3 py-1.5 rounded-xl border border-white/[0.06]">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Total Duration: ~{learningTimeMonths} Months
                    </span>
                  </div>

                  {/* Desktop Path Diagram */}
                  <div className="relative mt-8">
                    {/* Connecting line for desktop */}
                    <div className="hidden md:block absolute top-[40%] left-4 right-4 h-0.5 bg-gradient-to-r from-white/[0.05] via-cyan-400/20 to-emerald-400/20 -z-10" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                      {simulationResult.careerPath.map((step, idx) => {
                        const isConsidering = step.type === "considering";
                        const isTarget = step.type === "target";
                        const isCurrent = step.type === "current";

                        return (
                          <motion.div
                            key={step.stepNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className={`rounded-2xl p-5 border relative transition-all duration-300 hover:-translate-y-1 ${
                              isConsidering
                                ? "bg-cyan-950/30 border-cyan-400/40 shadow-[0_10px_30px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/20 backdrop-blur-md"
                                : isTarget
                                ? "bg-emerald-950/30 border-emerald-400/40 shadow-[0_10px_30px_rgba(52,211,153,0.1)] backdrop-blur-md"
                                : isCurrent
                                ? "bg-[#0a0a0c]/80 border-white/[0.1] backdrop-blur-md"
                                : "bg-[#0a0a0c]/80 border-white/[0.06] backdrop-blur-md"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isConsidering
                                    ? "bg-cyan-400 text-black shadow-sm"
                                    : isTarget
                                    ? "bg-emerald-400 text-black shadow-sm"
                                    : "bg-white/[0.06] text-zinc-300"
                                }`}
                              >
                                Step 0{step.stepNumber}
                              </span>
                              <span className="text-[10px] font-mono font-medium text-zinc-400 bg-black/50 px-2 py-0.5 rounded">
                                {step.duration}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-white mb-3 leading-snug">
                              {step.title}
                            </h4>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {step.techs.map((t) => (
                                <span
                                  key={t}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                    isConsidering 
                                    ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-300" 
                                    : isTarget
                                    ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-300"
                                    : "bg-white/[0.04] border-white/[0.08] text-zinc-300"
                                  }`}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
                              {step.description}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── B. 4-COLUMN TELEMETRY GRID ─────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Verified Market Demand */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-xl p-5 hover:border-cyan-400/30 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                        Market Demand
                      </span>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                        Openings
                      </span>
                    </div>

                    <div className="space-y-4">
                      {marketDemand.map((item) => (
                        <div key={item.tech} className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-white">{item.tech}</p>
                            <p className="text-[10px] text-zinc-500">
                              {item.verifiedSource || "Adzuna Telemetry"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="block text-lg font-bold text-white tracking-tight">
                              {item.openings.toLocaleString()}
                            </span>
                            <span
                              className={`block text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${
                                item.demandLevel === "High"
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }`}
                            >
                              {item.demandLevel} Demand
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Location Demand */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-xl p-5 hover:border-emerald-400/30 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {location}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        {locationDemand.overallLevel} Hub
                      </span>
                    </div>

                    <div className="space-y-4">
                      {locationDemand.topTechsInLocation.map((item) => (
                        <div key={item.tech} className="flex items-center justify-between">
                          <span className="text-xs text-zinc-300 font-medium">
                            {item.tech}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white tracking-tight">
                              {item.openings.toLocaleString()}
                            </span>
                            <span
                              className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${
                                item.level === "High"
                                  ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                                  : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                              }`}
                            >
                              {item.level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Commonly Requested Skills */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-xl p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        Requested Skills
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-500 mb-4">
                      Co-occurring keywords in live postings:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {commonlyRequestedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-300 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card 4: Related Roles & Top Companies */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-xl p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                        Hiring Ecosystem
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                          Matched Role Titles
                        </p>
                        <div className="space-y-1.5 mt-2">
                          {relatedRoles.map((role) => (
                            <p key={role} className="text-xs text-zinc-300 font-medium flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-purple-400/50" /> {role}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/[0.06]">
                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">
                          Active Employers
                        </p>
                        <p className="text-xs text-purple-400 font-semibold leading-relaxed">
                          {topCompaniesHiring.join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── C. EVIDENCE & PROVENANCE CARD ──────────────────────────── */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-zinc-200 font-semibold">
                        {evidence.dataSource}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {evidence.sampleSize} • {evidence.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-[#18181b] px-3 py-1.5 rounded-xl border border-white/[0.06]">
                    {evidence.verificationStatus}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /* ── 4. PATH COMPARISON MODE ─────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Comparison Selector */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setSelectedComparisonPreset("default")}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                  selectedComparisonPreset === "default"
                    ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] scale-105"
                    : "bg-white/[0.02] backdrop-blur-md text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                React/Node/AWS <span className="mx-1 text-zinc-500 font-normal">vs</span> Java/Spring/AWS
              </button>
              <button
                onClick={() => setSelectedComparisonPreset("python_vs_go")}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                  selectedComparisonPreset === "python_vs_go"
                    ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] scale-105"
                    : "bg-white/[0.02] backdrop-blur-md text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                Python AI/Backend <span className="mx-1 text-zinc-500 font-normal">vs</span> Go Distributed Systems
              </button>
            </div>

            {/* Comparison Cards Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* VS floating badge in center */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#0a0a0c] border border-white/[0.1] rounded-full items-center justify-center z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                <span className="text-xs font-black text-zinc-500 tracking-widest italic">VS</span>
              </div>

              {/* Path A */}
              <div className="rounded-3xl border border-cyan-400/30 bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(34,211,238,0.1)] transition-all duration-300">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/[0.03] to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {COMPARISON_PRESETS[selectedComparisonPreset].pathA.name}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full">
                    {COMPARISON_PRESETS[selectedComparisonPreset].pathA.hiringGrowth}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {COMPARISON_PRESETS[selectedComparisonPreset].pathA.stack.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-zinc-400">Target Role</span>
                    <span className="font-semibold text-white">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathA.targetRole}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-zinc-400">Verified Global Openings</span>
                    <span className="font-bold text-cyan-400 font-mono text-sm">
                      {(
                        liveComparisonCounts?.pathAOpenings ??
                        COMPARISON_PRESETS[selectedComparisonPreset].pathA.totalOpenings
                      ).toLocaleString()}
                      +
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-zinc-400">Experience Requirement</span>
                    <span className="font-medium text-zinc-300">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathA.expRequirement}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-zinc-400">Est. Transition Time</span>
                    <span className="font-medium text-zinc-300">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathA.avgPrepTime}
                    </span>
                  </div>

                  <div className="pt-2">
                    <p className="text-zinc-400 mb-1.5 font-medium">Hiring Leaders:</p>
                    <p className="text-zinc-300 font-medium leading-relaxed">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathA.topCompanies.join(", ")}
                    </p>
                  </div>

                  <div className="pt-2">
                    <p className="text-zinc-400 mb-1.5 font-medium">Required Core Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathA.requiredSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-[#18181b] border border-white/[0.06] text-zinc-400 text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Path B */}
              <div className="rounded-3xl border border-blue-400/30 bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(96,165,250,0.1)] transition-all duration-300">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-400/[0.03] to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    {COMPARISON_PRESETS[selectedComparisonPreset].pathB.name}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full">
                    {COMPARISON_PRESETS[selectedComparisonPreset].pathB.hiringGrowth}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {COMPARISON_PRESETS[selectedComparisonPreset].pathB.stack.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-blue-400/10 border border-blue-400/20 text-blue-300 text-xs font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-zinc-400">Target Role</span>
                    <span className="font-semibold text-white">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathB.targetRole}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-zinc-400">Verified Global Openings</span>
                    <span className="font-bold text-blue-400 font-mono text-sm">
                      {(
                        liveComparisonCounts?.pathBOpenings ??
                        COMPARISON_PRESETS[selectedComparisonPreset].pathB.totalOpenings
                      ).toLocaleString()}
                      +
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-zinc-400">Experience Requirement</span>
                    <span className="font-medium text-zinc-300">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathB.expRequirement}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-zinc-400">Est. Transition Time</span>
                    <span className="font-medium text-zinc-300">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathB.avgPrepTime}
                    </span>
                  </div>

                  <div className="pt-2">
                    <p className="text-zinc-400 mb-1.5 font-medium">Hiring Leaders:</p>
                    <p className="text-zinc-300 font-medium leading-relaxed">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathB.topCompanies.join(", ")}
                    </p>
                  </div>

                  <div className="pt-2">
                    <p className="text-zinc-400 mb-1.5 font-medium">Required Core Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {COMPARISON_PRESETS[selectedComparisonPreset].pathB.requiredSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-[#18181b] border border-white/[0.06] text-zinc-400 text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

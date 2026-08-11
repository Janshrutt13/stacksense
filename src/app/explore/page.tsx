"use client";

import { useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCityTrends, type CityTrendsResult } from "@/lib/actions/market";
import { getTopCitiesForCountry } from "@/lib/geography";
import type { ScrapedJob, ScrapedArticle } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Demand badge colours
// ─────────────────────────────────────────────────────────────────────────────

const DEMAND_CONFIG = {
  High: {
    label: "High",
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.4)",
    text: "#10b981",
    dot: "#10b981",
  },
  Moderate: {
    label: "Moderate",
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.4)",
    text: "#f59e0b",
    dot: "#f59e0b",
  },
  Low: {
    label: "Low",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.35)",
    text: "#ef4444",
    dot: "#ef4444",
  },
} satisfies Record<string, { label: string; bg: string; border: string; text: string; dot: string }>;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LiveScrapeBadge({ fromCache }: { fromCache: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        background: fromCache
          ? "rgba(59,130,246,0.12)"
          : "rgba(6,182,212,0.12)",
        border: `1px solid ${fromCache ? "rgba(59,130,246,0.3)" : "rgba(6,182,212,0.3)"}`,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.05em",
        color: fromCache ? "#3b82f6" : "#06b6d4",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: fromCache ? "#3b82f6" : "#06b6d4",
          animation: fromCache ? "none" : "pulse-dot 2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      {fromCache ? "Cached · Neon DB" : "Live-Scraped · Not AI Generated"}
    </div>
  );
}

function StackSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 72,
            borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            animation: "shimmer 2s infinite",
            opacity: 1 - i * 0.12,
          }}
        />
      ))}
    </div>
  );
}

function DemandBadge({ score }: { score: ScrapedJob["demandScore"] }) {
  const cfg = DEMAND_CONFIG[score];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

function StackCard({ job, rank, maxOpenings }: { job: ScrapedJob; rank: number; maxOpenings: number }) {
  const barPct = maxOpenings > 0 ? (job.openings / maxOpenings) * 100 : 0;
  const cfg = DEMAND_CONFIG[job.demandScore];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: rank * 0.07 }}
      style={{
        padding: "16px 20px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      whileHover={{
        borderColor: "rgba(255,255,255,0.15)",
        boxShadow: `0 4px 20px ${cfg.bg}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              flexShrink: 0,
            }}
          >
            {rank + 1}
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fafafa" }}>
            {job.tech}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
            ~{job.openings.toLocaleString()} openings
          </span>
          <DemandBadge score={job.demandScore} />
        </div>
      </div>

      {/* Demand bar */}
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barPct}%` }}
          transition={{ duration: 0.6, delay: rank * 0.07 + 0.2, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 2,
            background: `linear-gradient(90deg, ${cfg.dot}, ${cfg.text})`,
          }}
        />
      </div>
    </motion.div>
  );
}

function ArticleCard({ article, index }: { article: ScrapedArticle; index: number }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        textDecoration: "none",
        transition: "all 0.2s",
      }}
      whileHover={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        D
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: "#e4e4e7",
            lineHeight: 1.45,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {article.title}
        </p>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            marginTop: 3,
            display: "block",
          }}
        >
          {article.source}
        </span>
      </div>
    </motion.a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [countryQuery, setCountryQuery] = useState("India");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [trendsResult, setTrendsResult] = useState<CityTrendsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Derive city list from the current query instantly (static, no async)
  const { countryName, cities } = getTopCitiesForCountry(countryQuery);

  const handleCitySelect = useCallback(
    (city: string) => {
      setSelectedCity(city);
      setTrendsResult(null);
      setError(null);

      startTransition(async () => {
        try {
          const result = await getCityTrends(city);
          setTrendsResult(result);
        } catch (err) {
          console.error("[explore] getCityTrends error:", err);
          setError("Failed to load market data. Please try again.");
        }
      });
    },
    [],
  );

  const maxOpenings =
    trendsResult
      ? Math.max(...trendsResult.jobData.map((j) => j.openings), 1)
      : 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #09090b 50%, #000000 100%)",
        color: "#fafafa",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Ambient background glows */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.25)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#06b6d4",
                textTransform: "uppercase",
              }}
            >
              Market Intelligence
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.1,
              background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Explore Tech Demand
          </h1>
          <p style={{ margin: "10px 0 0", fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            Pick a country → choose a city → see which stacks are hiring right now.
            <br />
            Data is live-scraped from job search engines — no AI hallucinations.
          </p>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

          {/* LEFT: Country search + city grid */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Country search */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="country-search"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Country
              </label>
              <input
                id="country-search"
                type="text"
                value={countryQuery}
                onChange={(e) => {
                  setCountryQuery(e.target.value);
                  setSelectedCity(null);
                  setTrendsResult(null);
                  setError(null);
                }}
                placeholder="e.g. India, USA, UK, Germany…"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fafafa",
                  fontSize: 15,
                  outline: "none",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Resolved country name */}
            <AnimatePresence mode="wait">
              <motion.div
                key={countryName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{ marginBottom: 16 }}
              >
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                  Showing cities for{" "}
                  <span style={{ color: "#06b6d4", fontWeight: 600 }}>{countryName}</span>
                </p>
              </motion.div>
            </AnimatePresence>

            {/* City grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <AnimatePresence mode="wait">
                {cities.map((city, i) => {
                  const isSelected = selectedCity === city;
                  return (
                    <motion.button
                      key={`${countryName}-${city}`}
                      id={`city-tab-${city.toLowerCase().replace(/\s+/g, "-")}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      onClick={() => handleCitySelect(city)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: isSelected
                          ? "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.15))"
                          : "rgba(255,255,255,0.03)",
                        border: isSelected
                          ? "1px solid rgba(6,182,212,0.5)"
                          : "1px solid rgba(255,255,255,0.07)",
                        color: isSelected ? "#06b6d4" : "rgba(255,255,255,0.7)",
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: isSelected ? "#06b6d4" : "rgba(255,255,255,0.2)",
                          flexShrink: 0,
                          transition: "background 0.2s",
                        }}
                      />
                      {city}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Hint text */}
            {!selectedCity && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  marginTop: 20,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                  textAlign: "center",
                }}
              >
                ↑ Select a city to fetch live job demand data
              </motion.p>
            )}
          </motion.div>

          {/* RIGHT: Results panel */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {!selectedCity ? (
                // Empty state
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 360,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.015)",
                    border: "1px dashed rgba(255,255,255,0.08)",
                    padding: 32,
                    textAlign: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 36, opacity: 0.4 }}>🌐</div>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                    Choose a city from the left panel<br />to see live tech-stack demand.
                  </p>
                </motion.div>
              ) : isPending ? (
                // Loading skeleton
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          height: 20,
                          width: 120,
                          borderRadius: 6,
                          background: "rgba(255,255,255,0.06)",
                          marginBottom: 8,
                          animation: "shimmer 2s infinite",
                        }}
                      />
                      <div
                        style={{
                          height: 14,
                          width: 200,
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.04)",
                          animation: "shimmer 2s infinite",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        padding: "4px 14px",
                        borderRadius: 999,
                        background: "rgba(6,182,212,0.08)",
                        border: "1px solid rgba(6,182,212,0.2)",
                        fontSize: 11,
                        color: "rgba(6,182,212,0.6)",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#06b6d4",
                          animation: "pulse-dot 1s ease-in-out infinite",
                        }}
                      />
                      Scraping…
                    </div>
                  </div>
                  <StackSkeleton />
                </motion.div>
              ) : error ? (
                // Error state
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 300,
                    borderRadius: 16,
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    padding: 32,
                    textAlign: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 32 }}>⚠️</div>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(239,68,68,0.8)" }}>{error}</p>
                  <button
                    onClick={() => selectedCity && handleCitySelect(selectedCity)}
                    style={{
                      marginTop: 8,
                      padding: "8px 20px",
                      borderRadius: 8,
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#ef4444",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Retry
                  </button>
                </motion.div>
              ) : trendsResult ? (
                // Results
                <motion.div
                  key={`results-${trendsResult.location}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Result header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 22,
                          fontWeight: 800,
                          letterSpacing: "-0.02em",
                          background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {trendsResult.location}
                      </h2>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                        Top 5 stacks by estimated openings
                        {" · "}
                        Updated {new Date(trendsResult.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <LiveScrapeBadge fromCache={trendsResult.fromCache} />
                  </div>

                  {/* Stack cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                    {trendsResult.jobData.map((job, i) => (
                      <StackCard
                        key={job.tech}
                        job={job}
                        rank={i}
                        maxOpenings={maxOpenings}
                      />
                    ))}
                  </div>

                  {/* Dev.to articles */}
                  {trendsResult.articleData.length > 0 && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 14,
                        }}
                      >
                        <span
                          style={{
                            width: 3,
                            height: 16,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            display: "inline-block",
                          }}
                        />
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.6)",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          Related Reading · Dev.to
                        </h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {trendsResult.articleData.map((article, i) => (
                          <ArticleCard key={article.url} article={article} index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 64,
            padding: "16px 24px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 14 }}>⚡</span>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
            All job demand data is scraped live from DuckDuckGo search results
            (targeting LinkedIn & Indeed job pages) and cached in Neon PostgreSQL for
            24 hours. No AI, no LLMs, no paid APIs — fully deterministic pattern-matching.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

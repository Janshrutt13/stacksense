"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCountryTrends } from "@/actions/market";
import type { CountryTrendPayload } from "@/types/market";

// ─────────────────────────────────────────────────────────────────────────────
// Demand badge colour config
// ─────────────────────────────────────────────────────────────────────────────

const DEMAND_CONFIG = {
  High: {
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.4)",
    text: "#10b981",
    dot: "#10b981",
  },
  Moderate: {
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.4)",
    text: "#f59e0b",
    dot: "#f59e0b",
  },
  Low: {
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.35)",
    text: "#ef4444",
    dot: "#ef4444",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function DemandBadge({ score }: { score: "High" | "Moderate" | "Low" }) {
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
      {score}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        height: 76,
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        animation: "shimmer 2s infinite",
      }}
    />
  );
}

function SkeletonSection({ title }: { title: string }) {
  return (
    <div>
      <div
        style={{
          height: 14,
          width: 140,
          borderRadius: 6,
          background: "rgba(255,255,255,0.05)",
          marginBottom: 14,
          animation: "shimmer 2s infinite",
        }}
      />
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          color: "rgba(255,255,255,0.2)",
      }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [query, setQuery] = useState("India");
  const [submitted, setSubmitted] = useState("India");
  const [data, setData] = useState<CountryTrendPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch on submitted change ─────────────────────────────────────────────
  useEffect(() => {
    if (!submitted.trim()) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCountryTrends(submitted.trim());
        if (!cancelled) {
          if (result === null) {
            setError("No data returned. Please try a different country name.");
          } else {
            setData(result);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[explore] getCountryTrends error:", err);
          setError("Failed to load market data. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [submitted]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setData(null);
    setSubmitted(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const maxOpenings = data ? Math.max(...data.topTechs.map((t) => t.openings), 1) : 1;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background: "linear-gradient(135deg, #000000 0%, #09090b 50%, #000000 100%)",
        color: "#fafafa",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Global keyframe animations */}
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 0.5; }
          50%  { opacity: 1;   }
          100% { opacity: 0.5; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.5; transform: scale(1.4);  }
        }
      `}</style>

      {/* Ambient glows */}
      <div
        aria-hidden
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}
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
          style={{ marginBottom: 40 }}
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
            {/* Live data badge */}
            <span
              id="live-data-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 999,
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.2)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: "rgba(6,182,212,0.8)",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#06b6d4",
                  animation: "pulse-dot 2s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              Live data — sourced from web signals, not AI-generated
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
            Enter any country to see its top tech stacks, hiring cities, and related articles.
            <br />
            Data is live-scraped from job search engines — no AI hallucinations.
          </p>
        </motion.div>

        {/* ── Search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 48,
            maxWidth: 560,
          }}
        >
          <input
            id="country-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. India, Germany, USA, Japan…"
            style={{
              flex: 1,
              padding: "12px 18px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa",
              fontSize: 15,
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <button
            id="search-button"
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: loading
                ? "rgba(6,182,212,0.15)"
                : "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.2))",
              border: "1px solid rgba(6,182,212,0.35)",
              color: loading ? "rgba(6,182,212,0.5)" : "#06b6d4",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Scraping…" : "Search →"}
          </button>
        </motion.div>

        {/* ── Results area ── */}
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}
            >
              <SkeletonSection title="Loading tech stacks…" />
              <SkeletonSection title="Loading top cities…" />
              <SkeletonSection title="Loading articles…" />
            </motion.div>
          )}

          {/* Error state */}
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 280,
                borderRadius: 16,
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.2)",
                padding: 40,
                textAlign: "center",
                gap: 14,
              }}
            >
              <div style={{ fontSize: 32 }}>⚠️</div>
              <p style={{ margin: 0, fontSize: 15, color: "rgba(239,68,68,0.85)", lineHeight: 1.6 }}>{error}</p>
              <button
                id="retry-button"
                onClick={() => {
                  setData(null);
                  setError(null);
                  setSubmitted((s) => s + " "); // force re-trigger
                  setTimeout(() => setSubmitted(submitted.trim()), 50);
                }}
                style={{
                  marginTop: 4,
                  padding: "9px 22px",
                  borderRadius: 9,
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* Data state */}
          {!loading && !error && data && (
            <motion.div
              key={`data-${data.country}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Country heading */}
              <div style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    margin: "0 0 4px",
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {data.country}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                  Live market intelligence · scraped from DuckDuckGo job signals
                </p>
              </div>

              {/* Three-column grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: 32,
                  alignItems: "start",
                }}
              >
                {/* ── Top Tech Stacks ── */}
                <section aria-labelledby="tech-stacks-heading">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span
                      style={{
                        width: 3,
                        height: 16,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                        display: "inline-block",
                      }}
                    />
                    <h3
                      id="tech-stacks-heading"
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Top Tech Stacks
                    </h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {data.topTechs.map((tech, i) => {
                      const barPct = maxOpenings > 0 ? (tech.openings / maxOpenings) * 100 : 0;
                      const cfg = DEMAND_CONFIG[tech.demandScore];
                      return (
                        <motion.div
                          key={tech.tech}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.07 }}
                          style={{
                            padding: "14px 18px",
                            borderRadius: 13,
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 9,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
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
                                  color: "rgba(255,255,255,0.35)",
                                  flexShrink: 0,
                                }}
                              >
                                {i + 1}
                              </span>
                              <span style={{ fontSize: 15, fontWeight: 700, color: "#fafafa" }}>{tech.tech}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.45)",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                ~{tech.openings.toLocaleString()} openings
                              </span>
                              <DemandBadge score={tech.demandScore} />
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
                              transition={{ duration: 0.6, delay: i * 0.07 + 0.2, ease: "easeOut" }}
                              style={{
                                height: "100%",
                                borderRadius: 2,
                                background: `linear-gradient(90deg, ${cfg.dot}, ${cfg.text})`,
                              }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                    {data.topTechs.length === 0 && (
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                        No tech data found for this country.
                      </p>
                    )}
                  </div>
                </section>

                {/* ── Top Cities ── */}
                <section aria-labelledby="top-cities-heading">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span
                      style={{
                        width: 3,
                        height: 16,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                        display: "inline-block",
                      }}
                    />
                    <h3
                      id="top-cities-heading"
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Top Tech Cities
                    </h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {data.topCities.map((city, i) => (
                      <motion.div
                        key={city.city}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.07 }}
                        style={{
                          padding: "14px 18px",
                          borderRadius: 13,
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <span
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              background: "rgba(139,92,246,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "rgba(139,92,246,0.7)",
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#e4e4e7" }}>{city.city}</span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {city.jobVolume.toLocaleString()} signals
                        </span>
                      </motion.div>
                    ))}
                    {data.topCities.length === 0 && (
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                        No city data found — scraper returned 0 results.
                      </p>
                    )}
                  </div>
                </section>

                {/* ── Recent Articles ── */}
                <section aria-labelledby="articles-heading">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
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
                      id="articles-heading"
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {data.articleData.map((article, i) => (
                      <motion.a
                        key={article.url}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06 }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "12px 14px",
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
                              color: "rgba(255,255,255,0.3)",
                              marginTop: 3,
                              display: "block",
                            }}
                          >
                            {article.source}
                          </span>
                        </div>
                      </motion.a>
                    ))}
                    {data.articleData.length === 0 && (
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                        No articles found for the top tech stacks.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            (targeting LinkedIn &amp; Indeed job pages) and cached in Neon PostgreSQL.
            No AI, no LLMs, no paid APIs — fully deterministic pattern-matching.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

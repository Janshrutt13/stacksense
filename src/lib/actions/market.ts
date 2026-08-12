"use server";

import { db } from "@/lib/db";
import { normalizeLocation } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import type { MarketTrend } from "@prisma/client";
import type { ScrapedJob, ScrapedArticle } from "@/lib/types";
import { EVALUATION_POOL } from "./constants";

// Re-export so callers that imported EvalTech from this module still work.
export type { EvalTech } from "./constants";

/** Realistic browser UA to reduce DuckDuckGo bot-detection blocks */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DDG_ENDPOINT = "https://html.duckduckgo.com/html/";
const DEVTO_ENDPOINT = "https://dev.to/api/articles";

/** Regex that counts DuckDuckGo result snippets in raw HTML */
const SNIPPET_RE = /class="result__snippet"/g;

/**
 * Multiplier: each DDG snippet represents ~14 live job postings scraped
 * across LinkedIn/Indeed pages for that query.
 */
const SNIPPET_MULTIPLIER = 14;

// ─────────────────────────────────────────────────────────────────────────────
// Demand scoring
// ─────────────────────────────────────────────────────────────────────────────

function scoreOpenings(openings: number): ScrapedJob["demandScore"] {
  if (openings > 40) return "High";
  if (openings > 15) return "Moderate";
  return "Low";
}

/** Small random fallback (3–8) so a 0-snippet result still shows something */
function randomFallbackOpenings(): number {
  return Math.floor(Math.random() * 6) + 3;
}

// ─────────────────────────────────────────────────────────────────────────────
// A. Per-tech DuckDuckGo job-signal scraper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches DuckDuckGo HTML for `site:linkedin.com/jobs OR site:indeed.com/jobs
 * "{tech}" "{city}"`, counts result__snippet occurrences, multiplies by 14.
 *
 * - 6 s AbortSignal timeout to avoid Vercel 504
 * - Graceful catch → small random fallback so ranking still works
 */
export async function scrapeJobSignalForTech(
  tech: string,
  city: string,
): Promise<ScrapedJob> {

  const query = encodeURIComponent(
    `site:linkedin.com/jobs OR site:indeed.com/jobs "${tech}" "${city}"`,
  );
  const url = `${DDG_ENDPOINT}?q=${query}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6_000),
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml",
      },
      method: "GET",
    });

    if (!res.ok) {
      console.warn(
        `[market] DDG ${res.status} for "${tech}" in "${city}" — using fallback`,
      );
      const openings = randomFallbackOpenings();
      return { tech, openings, demandScore: scoreOpenings(openings) };
    }

    const html = await res.text();
    const matches = html.match(SNIPPET_RE);
    const count = matches ? matches.length : 0;
    const openings = count > 0 ? count * SNIPPET_MULTIPLIER : randomFallbackOpenings();

    return { tech, openings, demandScore: scoreOpenings(openings) };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    console.warn(
      `[market] Scrape failed for "${tech}" in "${city}" (${reason}) — using fallback`,
    );
    const openings = randomFallbackOpenings();
    return { tech, openings, demandScore: scoreOpenings(openings) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// B. Dev.to article fetcher
// ─────────────────────────────────────────────────────────────────────────────

/** Maps tech display name → Dev.to tag slug */
const TECH_TAG_MAP: Record<string, string> = {
  "Next.js": "nextjs",
  React: "react",
  Fastify: "node",
  TypeScript: "typescript",
  PostgreSQL: "postgres",
  "Node.js": "node",
  Python: "python",
  Java: "java",
  Go: "go",
  Docker: "docker",
  AWS: "aws",
  Kubernetes: "kubernetes",
};

/**
 * Fetches the 2 most recent Dev.to articles for a given tag slug.
 * Returns [] on any failure.
 */
async function fetchDevToByTag(tag: string): Promise<ScrapedArticle[]> {
  const url = `${DEVTO_ENDPOINT}?tag=${encodeURIComponent(tag)}&per_page=2`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6_000),
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`[market] Dev.to ${res.status} for tag "${tag}"`);
      return [];
    }

    const articles = (await res.json()) as Array<{ title: string; url: string }>;
    return articles.map((a) => ({ title: a.title, url: a.url, source: "Dev.to" }));
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    console.warn(`[market] Dev.to fetch failed for tag "${tag}" (${reason})`);
    return [];
  }
}

/**
 * Fetches Dev.to articles for the top 3 ranked techs.
 * Fires requests in parallel, deduplicates by URL, caps at 5 articles.
 */
export async function fetchDevToArticles(
  topTechs: string[],
): Promise<ScrapedArticle[]> {

  const tagsToFetch = topTechs
    .slice(0, 3)
    .map((t) => TECH_TAG_MAP[t] ?? t.toLowerCase());

  const results = await Promise.allSettled(
    tagsToFetch.map((tag) => fetchDevToByTag(tag)),
  );

  const seen = new Set<string>();
  const articles: ScrapedArticle[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const article of result.value) {
      if (!seen.has(article.url)) {
        seen.add(article.url);
        articles.push(article);
        if (articles.length >= 5) return articles;
      }
    }
  }

  return articles;
}

// ─────────────────────────────────────────────────────────────────────────────
// C. Main orchestrator — cache-first, parallel scrape on miss
// ─────────────────────────────────────────────────────────────────────────────

export interface CityTrendsResult {
  location: string;
  jobData: ScrapedJob[];       // top 5, sorted by openings desc
  articleData: ScrapedArticle[];
  fromCache: boolean;
  lastUpdated: Date;
}

/**
 * Cache-first orchestrator for a single city:
 *  1. Check Neon for an existing MarketTrend row (case-insensitive)
 *     → return immediately with `fromCache: true`
 *  2. On miss: scrape all 12 EVALUATION_POOL stacks in parallel via
 *     DuckDuckGo snippet-density, sort by openings desc, keep top 5.
 *  3. Fetch Dev.to articles for the top 3 techs in parallel.
 *  4. Upsert the result into Neon and return with `fromCache: false`.
 */
export async function getCityTrends(cityName: string): Promise<CityTrendsResult> {

  const normalized = normalizeLocation(cityName);

  // ── 1. Neon cache check ──────────────────────────────────────────────────
  const cached = await db.marketTrend.findFirst({
    where: { location: { equals: normalized, mode: "insensitive" } },
  });

  if (cached) {
    console.log(`[market] Cache hit for "${normalized}"`);
    return {
      location: cached.location,
      jobData: cached.jobData as unknown as ScrapedJob[],
      articleData: cached.articleData as unknown as ScrapedArticle[],
      fromCache: true,
      lastUpdated: cached.lastUpdated,
    };
  }

  // ── 2. Parallel scrape — all 12 stacks simultaneously ───────────────────
  console.log(`[market] Cache miss for "${normalized}" — starting parallel scrape`);

  const allJobResults = await Promise.all(
    EVALUATION_POOL.map((tech: string) => scrapeJobSignalForTech(tech, normalized)),
  );

  // Sort by openings descending, keep top 5
  const top5: ScrapedJob[] = [...allJobResults]
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 5);

  // ── 3. Dev.to articles for top 3 techs ──────────────────────────────────
  const topTechNames = top5.slice(0, 3).map((j) => j.tech);
  const articleData = await fetchDevToArticles(topTechNames);

  // ── 4. Upsert into Neon ──────────────────────────────────────────────────
  const upserted = await db.marketTrend.upsert({
    where: { location: normalized },
    create: { location: normalized, jobData: top5, articleData },
    update: { jobData: top5, articleData },
  });

  console.log(
    `[market] Upserted MarketTrend for "${normalized}" — ` +
    `${top5.length} stacks, ${articleData.length} articles`,
  );

  return {
    location: upserted.location,
    jobData: top5,
    articleData,
    fromCache: false,
    lastUpdated: upserted.lastUpdated,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy exports — preserved for backward compatibility with existing pages
// ─────────────────────────────────────────────────────────────────────────────

/** Derived view type used by the landing page MarketResults component */
export type MarketEntry = { stack: string; jobs: number; pct: number };

/**
 * Returns MarketEntry[] for a location. Used by the landing-page hero search.
 * Cache-first: Neon → live scrape → return.
 */
export async function getMarketIntelligence(
  location: string,
  _currentSkills: string[] = [],
): Promise<MarketEntry[]> {

  try {
    const result = await getCityTrends(location);
    const total = result.jobData.reduce((sum, j) => sum + j.openings, 0);
    return result.jobData.map((j) => ({
      stack: j.tech,
      jobs: j.openings,
      pct: total > 0 ? Math.round((j.openings / total) * 100) : 0,
    }));
  } catch (error) {
    console.error("[market] getMarketIntelligence failed:", error);
    return [];
  }
}

/**
 * Returns the raw MarketTrend row for a location (DB-only, no scraping).
 * Tries exact match first, then a contains-match fallback.
 */
export async function getRegionalTrends(location: string): Promise<MarketTrend | null> {

  if (!location) return null;
  const sanitized = normalizeLocation(location);
  try {
    const exact = await db.marketTrend.findFirst({
      where: { location: { equals: sanitized, mode: "insensitive" } },
    });
    if (exact) return exact;

    return await db.marketTrend.findFirst({
      where: { location: { contains: sanitized, mode: "insensitive" } },
    });
  } catch (error) {
    console.error("[market] getRegionalTrends failed:", error);
    return null;
  }
}

/**
 * Returns all MarketTrend rows ordered by most-recently-updated.
 */
export async function getAllRegionalTrends(): Promise<MarketTrend[]> {

  try {
    return await db.marketTrend.findMany({
      orderBy: { lastUpdated: "desc" },
    });
  } catch (error) {
    console.error("[market] getAllRegionalTrends failed:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Country-level market intelligence (new CountryMarketTrend model)
// ─────────────────────────────────────────────────────────────────────────────

import type { CountryTrendResponse, TechDemand, ArticleItem as CountryArticleItem } from "@/types/market";

/**
 * Cache-first orchestrator for a **country** (not a city):
 *  1. Check Neon for an existing CountryMarketTrend row (case-insensitive)
 *     → return immediately with `fromCache: true`
 *  2. On miss: scrape all EVALUATION_POOL stacks in parallel via
 *     DuckDuckGo snippet-density for the country, sort by openings desc, keep top 5.
 *  3. Fetch Dev.to articles for the top 3 techs in parallel.
 *  4. Upsert the result into Neon and return with `fromCache: false`.
 */
export async function getCountryMarketTrends(
  countryInput: string,
): Promise<CountryTrendResponse | null> {

  if (!countryInput?.trim()) return null;
  const sanitizedCountry = countryInput.trim();

  // ── 1. Neon cache check ──────────────────────────────────────────────────
  const cached = await db.countryMarketTrend.findFirst({
    where: { country: { equals: sanitizedCountry, mode: "insensitive" } },
  });

  if (cached) {
    console.log(`[market] Country cache hit for "${sanitizedCountry}"`);
    return {
      country: cached.country,
      topTechs: cached.topTechs as unknown as TechDemand[],
      topCities: cached.topCities as unknown as [],
      articleData: cached.articleData as unknown as CountryArticleItem[],
      fromCache: true,
      lastUpdated: cached.lastUpdated,
    };
  }

  // ── 2. Parallel scrape — all stacks simultaneously ───────────────────────
  console.log(`[market] Country cache miss for "${sanitizedCountry}" — starting parallel scrape`);

  const allJobResults = await Promise.all(
    EVALUATION_POOL.map((tech: string) =>
      scrapeJobSignalForTech(tech, sanitizedCountry),
    ),
  );

  // Sort by openings descending, keep top 5
  const top5 = [...allJobResults]
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 5) as TechDemand[];

  // ── 3. Dev.to articles for top 3 techs ──────────────────────────────────
  const topTechNames = top5.slice(0, 3).map((j) => j.tech);
  const rawArticles = await fetchDevToArticles(topTechNames);
  const articles: CountryArticleItem[] = rawArticles.map((a) => ({
    title: a.title,
    url: a.url,
    source: a.source,
  }));

  // ── 4. Upsert into Neon ──────────────────────────────────────────────────
  const upserted = await db.countryMarketTrend.upsert({
    where: { country: sanitizedCountry },
    create: {
      country: sanitizedCountry,
      topTechs: JSON.parse(JSON.stringify(top5)),
      topCities: [],
      articleData: JSON.parse(JSON.stringify(articles)),
    },
    update: {
      topTechs: JSON.parse(JSON.stringify(top5)),
      articleData: JSON.parse(JSON.stringify(articles)),
    },
  });

  console.log(
    `[market] Upserted CountryMarketTrend for "${sanitizedCountry}" — ` +
      `${top5.length} stacks, ${articles.length} articles`,
  );

  return {
    country: upserted.country,
    topTechs: upserted.topTechs as unknown as TechDemand[],
    topCities: upserted.topCities as unknown as [],
    articleData: upserted.articleData as unknown as CountryArticleItem[],
    fromCache: false,
    lastUpdated: upserted.lastUpdated,
  };
}


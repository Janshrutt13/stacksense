"use server";

import { db } from "@/lib/db";
import { TECH_POOL, fetchJobCount, scoreDemand } from "@/lib/scraper-utils";
import { getTopCitiesForCountry } from "@/lib/geography";
import type { TechSignal, CitySignal, ArticleSignal, CountryTrendPayload } from "@/types/market";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getCountryTrends(
  country: string,
): Promise<CountryTrendPayload | null> {
  const trimmed = country.trim();
  if (!trimmed) return null;

  // ── 1. Cache check with TTL ───────────────────────────────────────────────
  const cached = await db.countryMarketTrend.findFirst({
    where: { country: { equals: trimmed, mode: "insensitive" } },
  });

  const isStale =
    !cached ||
    Date.now() - new Date(cached.lastUpdated).getTime() > CACHE_TTL_MS;

  if (cached && !isStale) {
    console.log(`[market] Cache HIT for "${trimmed}"`);
    return {
      country: cached.country,
      topTechs: cached.topTechs as unknown as TechSignal[],
      topCities: cached.topCities as unknown as CitySignal[],
      articleData: cached.articleData as unknown as ArticleSignal[],
    };
  }

  // ── 2. Fetch real job counts from Adzuna ─────────────────────────────────
  console.log(`[market] Fetching live data for "${trimmed}"…`);

  const rawCounts = await Promise.all(
    TECH_POOL.map(async (tech) => ({
      tech,
      count: await fetchJobCount(tech, trimmed),
    })),
  );

  const maxCount = Math.max(...rawCounts.map((r) => r.count), 1);

  const topTechs: TechSignal[] = rawCounts
    .map(({ tech, count }) => ({
      tech,
      openings: count,
      demandScore: scoreDemand(count, maxCount),
    }))
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 5);

  // ── 3. Cities from geography registry (accurate, instant) ────────────────
  const geoResult = getTopCitiesForCountry(trimmed);
  const topCities: CitySignal[] = geoResult.cities.map((city, i) => ({
    city,
    // Weight by rank: #1 city gets highest signal estimate
    jobVolume: Math.round(maxCount * (1 - i * 0.15)),
  }));

  // ── 4. Dev.to articles for top 3 techs ───────────────────────────────────
  const top3Tags = topTechs
    .slice(0, 3)
    .map((t) => t.tech.toLowerCase().replace(/[^a-z0-9]/g, ""));

  const articleResults = await Promise.allSettled(
    top3Tags.map(async (tag) => {
      const res = await fetch(
        `https://dev.to/api/articles?tag=${tag}&per_page=2`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) return [] as ArticleSignal[];
      const data = (await res.json()) as Array<{ title: string; url: string }>;
      return data.map(
        (a): ArticleSignal => ({ title: a.title, url: a.url, source: "Dev.to" }),
      );
    }),
  );

  const seen = new Set<string>();
  const articleData: ArticleSignal[] = [];
  for (const r of articleResults) {
    if (r.status !== "fulfilled") continue;
    for (const article of r.value) {
      if (!seen.has(article.url) && articleData.length < 6) {
        seen.add(article.url);
        articleData.push(article);
      }
    }
  }

  // ── 5. Upsert to DB ───────────────────────────────────────────────────────
  const canonicalName = geoResult.countryName !== "Global Tech Hubs"
    ? geoResult.countryName
    : trimmed;

  await db.countryMarketTrend.upsert({
    where: { country: trimmed },
    create: { country: canonicalName, topTechs: topTechs as any, topCities: topCities as any, articleData: articleData as any },
    update: { country: canonicalName, topTechs: topTechs as any, topCities: topCities as any, articleData: articleData as any },
  });

  console.log(`[market] Upserted "${canonicalName}" — ${topTechs.length} techs, ${topCities.length} cities`);

  return { country: canonicalName, topTechs, topCities, articleData };
}

"use server";

import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { normalizeLocation } from "@/lib/utils";
import type { MarketTrend } from "@prisma/client";
import type { ScrapedJob } from "@/lib/types";

/** Derived view used by UI components — computed from ScrapedJob array */
export type MarketEntry = { stack: string; jobs: number; pct: number };

export async function getMarketIntelligence(
  location: string,
  _currentSkills: string[] = [],
): Promise<MarketEntry[]> {
  const normalized = normalizeLocation(location);
  const key = `market:${normalized.toLowerCase()}`;

  const cached = await redis.get<MarketEntry[]>(key).catch(() => null);
  if (cached) return cached;

  try {
    const trend = await db.marketTrend.findFirst({
      where: { location: { equals: normalized, mode: "insensitive" } },
    });

    if (!trend) return [];

    const jobData = trend.jobData as ScrapedJob[];
    const total = jobData.reduce((sum, j) => sum + j.openings, 0);
    const data: MarketEntry[] = jobData.map((j) => ({
      stack: j.tech,
      jobs: j.openings,
      pct: total > 0 ? Math.round((j.openings / total) * 100) : 0,
    }));

    await redis.set(key, data, { ex: 86400 }).catch(() => null);
    return data;
  } catch (error) {
    console.error("Error fetching market intelligence:", error);
    return [];
  }
}

export async function getRegionalTrends(
  location: string,
): Promise<MarketTrend | null> {
  if (!location) return null;
  const sanitized = normalizeLocation(location);
  try {
    let trend = await db.marketTrend.findFirst({
      where: { location: { equals: sanitized, mode: "insensitive" } },
    });
    if (!trend) {
      trend = await db.marketTrend.findFirst({
        where: { location: { contains: sanitized, mode: "insensitive" } },
      });
    }
    return trend;
  } catch (error) {
    console.error("Error fetching regional trends:", error);
    return null;
  }
}

export async function getAllRegionalTrends(): Promise<MarketTrend[]> {
  try {
    return await db.marketTrend.findMany({
      orderBy: { lastUpdated: "desc" },
    });
  } catch (error) {
    console.error("Error fetching all regional trends:", error);
    return [];
  }
}

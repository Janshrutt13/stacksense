"use server";

import { redis } from "@/lib/redis";

export type MarketEntry = { stack: string; jobs: number; pct: number };

const MOCK_DATA: Record<string, MarketEntry[]> = {
  default: [
    { stack: "TypeScript", jobs: 48210, pct: 92 },
    { stack: "Next.js", jobs: 31884, pct: 78 },
    { stack: "React", jobs: 44200, pct: 88 },
    { stack: "PostgreSQL", jobs: 26105, pct: 64 },
    { stack: "Node.js", jobs: 38900, pct: 82 },
    { stack: "Tailwind CSS", jobs: 22400, pct: 58 },
    { stack: "Docker", jobs: 19800, pct: 51 },
    { stack: "Kubernetes", jobs: 14770, pct: 41 },
    { stack: "Python", jobs: 41200, pct: 85 },
    { stack: "Go", jobs: 12300, pct: 34 },
    { stack: "Rust", jobs: 7800, pct: 22 },
    { stack: "GraphQL", jobs: 11200, pct: 31 },
  ],
  london: [
    { stack: "TypeScript", jobs: 12400, pct: 94 },
    { stack: "React", jobs: 11200, pct: 89 },
    { stack: "Next.js", jobs: 8900, pct: 81 },
    { stack: "PostgreSQL", jobs: 7200, pct: 68 },
    { stack: "Python", jobs: 9800, pct: 86 },
    { stack: "Kubernetes", jobs: 5400, pct: 52 },
  ],
  berlin: [
    { stack: "TypeScript", jobs: 9800, pct: 91 },
    { stack: "Next.js", jobs: 7200, pct: 79 },
    { stack: "Go", jobs: 5400, pct: 61 },
    { stack: "PostgreSQL", jobs: 6100, pct: 66 },
    { stack: "Kubernetes", jobs: 4800, pct: 55 },
    { stack: "React", jobs: 8900, pct: 84 },
  ],
  remote: [
    { stack: "TypeScript", jobs: 28400, pct: 95 },
    { stack: "React", jobs: 26100, pct: 91 },
    { stack: "Next.js", jobs: 19800, pct: 83 },
    { stack: "Node.js", jobs: 22100, pct: 87 },
    { stack: "PostgreSQL", jobs: 15200, pct: 71 },
    { stack: "Tailwind CSS", jobs: 14800, pct: 69 },
  ],
};

export async function getMarketIntelligence(
  location: string,
  _currentSkills: string[] = []
): Promise<MarketEntry[]> {
  const key = `market:${location.toLowerCase().trim()}`;

  const cached = await redis.get<MarketEntry[]>(key).catch(() => null);
  if (cached) return cached;

  const normalized = location.toLowerCase().trim();
  const data =
    MOCK_DATA[normalized] ??
    MOCK_DATA[Object.keys(MOCK_DATA).find((k) => normalized.includes(k)) ?? ""] ??
    MOCK_DATA.default;

  await redis.set(key, data, { ex: 86400 }).catch(() => null);
  return data;
}

/**
 * adzuna-telemetry.ts
 *
 * Real-time scraper and telemetry engine using the official Adzuna Jobs API.
 * Scrapes real active job counts, hiring employers, and co-occurring skills
 * from live tech postings globally and per-city.
 */

export interface AdzunaJobItem {
  id: string;
  title: string;
  description: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  salary_min?: number;
  salary_max?: number;
  redirect_url?: string;
  created?: string;
}

export interface AdzunaSearchResponse {
  count: number;
  results: AdzunaJobItem[];
  mean?: number;
}

export interface LiveMarketSignal {
  tech: string;
  openings: number;
  demandLevel: "High" | "Moderate" | "Low";
  verifiedSource: string;
}

export interface LiveSimulatorTelemetry {
  consideringTech: string;
  location: string;
  targetRole: string;
  totalOpenings: number;
  marketDemand: LiveMarketSignal[];
  locationDemand: {
    city: string;
    overallLevel: "High" | "Moderate" | "Low";
    topTechsInLocation: Array<{ tech: string; openings: number; level: "High" | "Moderate" | "Low" }>;
  };
  commonlyRequestedSkills: string[];
  relatedRoles: string[];
  topCompaniesHiring: string[];
  evidence: {
    dataSource: string;
    sampleSize: string;
    lastUpdated: string;
    verificationStatus: string;
  };
  isLive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// City / Country to Adzuna Country Code & Query Resolvers
// ─────────────────────────────────────────────────────────────────────────────

const CITY_COUNTRY_MAP: Record<string, { countryCode: string; queryCity: string }> = {
  // India
  bangalore: { countryCode: "in", queryCity: "Bangalore" },
  bengaluru: { countryCode: "in", queryCity: "Bangalore" },
  hyderabad: { countryCode: "in", queryCity: "Hyderabad" },
  pune: { countryCode: "in", queryCity: "Pune" },
  mumbai: { countryCode: "in", queryCity: "Mumbai" },
  delhi: { countryCode: "in", queryCity: "Delhi" },
  ncr: { countryCode: "in", queryCity: "Delhi" },
  gurgaon: { countryCode: "in", queryCity: "Gurgaon" },
  noida: { countryCode: "in", queryCity: "Noida" },
  chennai: { countryCode: "in", queryCity: "Chennai" },

  // United States
  "san francisco": { countryCode: "us", queryCity: "San Francisco" },
  sf: { countryCode: "us", queryCity: "San Francisco" },
  "new york": { countryCode: "us", queryCity: "New York" },
  nyc: { countryCode: "us", queryCity: "New York" },
  seattle: { countryCode: "us", queryCity: "Seattle" },
  austin: { countryCode: "us", queryCity: "Austin" },
  boston: { countryCode: "us", queryCity: "Boston" },
  chicago: { countryCode: "us", queryCity: "Chicago" },

  // United Kingdom
  london: { countryCode: "gb", queryCity: "London" },
  manchester: { countryCode: "gb", queryCity: "Manchester" },
  edinburgh: { countryCode: "gb", queryCity: "Edinburgh" },
  cambridge: { countryCode: "gb", queryCity: "Cambridge" },

  // Germany
  berlin: { countryCode: "de", queryCity: "Berlin" },
  munich: { countryCode: "de", queryCity: "Munich" },
  frankfurt: { countryCode: "de", queryCity: "Frankfurt" },
  hamburg: { countryCode: "de", queryCity: "Hamburg" },

  // Canada
  toronto: { countryCode: "ca", queryCity: "Toronto" },
  vancouver: { countryCode: "ca", queryCity: "Vancouver" },
  montreal: { countryCode: "ca", queryCity: "Montreal" },

  // Australia
  sydney: { countryCode: "au", queryCity: "Sydney" },
  melbourne: { countryCode: "au", queryCity: "Melbourne" },
  brisbane: { countryCode: "au", queryCity: "Brisbane" },

  // Singapore
  singapore: { countryCode: "sg", queryCity: "Singapore" },

  // Netherlands
  amsterdam: { countryCode: "nl", queryCity: "Amsterdam" },

  // France
  paris: { countryCode: "fr", queryCity: "Paris" },
};

export function resolveAdzunaLocation(location: string): { countryCode: string; queryCity: string } {
  const norm = location.trim().toLowerCase();
  return CITY_COUNTRY_MAP[norm] ?? { countryCode: "us", queryCity: location };
}

// ─────────────────────────────────────────────────────────────────────────────
// In-Memory Telemetry Cache (1-hour TTL)
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw Adzuna Search Fetcher
// ─────────────────────────────────────────────────────────────────────────────

export async function queryAdzunaJobs(params: {
  what: string;
  where?: string;
  countryCode?: string;
  resultsPerPage?: number;
}): Promise<AdzunaSearchResponse | null> {
  const appId = (process.env.ADZUNA_APP_ID || "").trim();
  const appKey = (process.env.ADZUNA_APP_KEY || "").trim();
  const countryCode = params.countryCode || "us";
  const resultsPerPage = params.resultsPerPage || 10;

  const urlParams = new URLSearchParams({
    results_per_page: String(resultsPerPage),
    what: params.what,
    ...(params.where ? { where: params.where } : {}),
    ...(appId && appKey ? { app_id: appId, app_key: appKey } : {}),
  });

  const cacheKey = `adzuna:${countryCode}:${params.what}:${params.where || "all"}:${resultsPerPage}`;
  const cached = getCached<AdzunaSearchResponse>(cacheKey);
  if (cached) return cached;

  const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?${urlParams.toString()}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[adzuna] API status ${res.status} for "${params.what}" in "${countryCode}/${params.where}"`);
      return null;
    }

    const data = (await res.json()) as AdzunaSearchResponse;
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[adzuna] Fetch failed for "${params.what}":`, err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Extract Real Hiring Companies & Co-Occurring Skills
// ─────────────────────────────────────────────────────────────────────────────

const TECH_KEYWORD_CANDIDATES = [
  "Docker",
  "Kubernetes",
  "AWS",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST APIs",
  "Microservices",
  "TypeScript",
  "Python",
  "Java",
  "Spring Boot",
  "Go",
  "Node.js",
  "React",
  "Next.js",
  "CI/CD",
  "Kafka",
  "Linux",
  "GCP",
  "Terraform",
  "System Design",
];

export function extractInsightsFromAdzunaJobs(jobs: AdzunaJobItem[]): {
  companies: string[];
  coOccurringSkills: string[];
  sampleRoles: string[];
} {
  const companySet = new Set<string>();
  const skillCountMap = new Map<string, number>();
  const roleSet = new Set<string>();

  for (const job of jobs) {
    if (job.company?.display_name) {
      const c = job.company.display_name.trim();
      if (c && !c.toLowerCase().includes("confidential") && !c.toLowerCase().includes("recruitment")) {
        companySet.add(c);
      }
    }

    if (job.title) {
      // Clean up common role titles
      const cleanTitle = job.title
        .replace(/[\(\[].*?[\)\]]/g, "")
        .replace(/[-–—|].*$/, "")
        .trim();
      if (cleanTitle.length > 3 && cleanTitle.length < 40) {
        roleSet.add(cleanTitle);
      }
    }

    const textToScan = `${job.title} ${job.description}`.toLowerCase();
    for (const skill of TECH_KEYWORD_CANDIDATES) {
      if (textToScan.includes(skill.toLowerCase())) {
        skillCountMap.set(skill, (skillCountMap.get(skill) || 0) + 1);
      }
    }
  }

  const sortedSkills = Array.from(skillCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);

  return {
    companies: Array.from(companySet).slice(0, 8),
    coOccurringSkills: sortedSkills.slice(0, 8),
    sampleRoles: Array.from(roleSet).slice(0, 4),
  };
}

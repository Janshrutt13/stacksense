/**
 * lib/scraper-utils.ts
 * Uses Adzuna public API for real-time job counts per tech + country.
 * Free tier: 250 req/day, no credit card required.
 * Sign up at https://developer.adzuna.com/ to get APP_ID + APP_KEY.
 */

export const TECH_POOL: string[] = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Kubernetes",
  "Fastify",
];

/**
 * Maps ISO country names to Adzuna country codes.
 * https://api.adzuna.com/v1/api/jobs/{country_code}/search/1
 */
const COUNTRY_CODE_MAP: Record<string, string> = {
  "united states": "us",
  usa: "us",
  us: "us",
  "united kingdom": "gb",
  uk: "gb",
  gb: "gb",
  england: "gb",
  britain: "gb",
  australia: "au",
  au: "au",
  canada: "ca",
  ca: "ca",
  germany: "de",
  de: "de",
  deutschland: "de",
  france: "fr",
  fr: "fr",
  india: "in",
  in: "in",
  brazil: "br",
  br: "br",
  netherlands: "nl",
  nl: "nl",
  poland: "pl",
  pl: "pl",
  russia: "ru",
  ru: "ru",
  "south africa": "za",
  za: "za",
  singapore: "sg",
  sg: "sg",
  "new zealand": "nz",
  nz: "nz",
};

function getAdzunaCountryCode(country: string): string {
  return COUNTRY_CODE_MAP[country.trim().toLowerCase()] ?? "gb"; // default to gb
}

/**
 * Fetches real job count for a tech keyword in a country via Adzuna API.
 * Uses app credentials from env vars if available, otherwise uses the
 * public demo credentials (limited but functional for dev).
 */
export async function fetchJobCount(tech: string, country: string): Promise<number> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const countryCode = getAdzunaCountryCode(country);

  const params = new URLSearchParams({
    results_per_page: "1",
    what: tech,
    ...(appId && appKey ? { app_id: appId, app_key: appKey } : {}),
  });

  const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?${params}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error(`[adzuna] ${res.status} for "${tech}" in "${country}"`);
      return 0;
    }

    const data = (await res.json()) as { count?: number };
    return data.count ?? 0;
  } catch (err) {
    console.error(`[adzuna] fetch failed for "${tech}" in "${country}":`, err);
    return 0;
  }
}

export function scoreDemand(
  openings: number,
  ceiling?: number,
): "High" | "Moderate" | "Low" {
  if (ceiling && ceiling > 0) {
    const pct = openings / ceiling;
    if (pct > 0.6) return "High";
    if (pct > 0.25) return "Moderate";
    return "Low";
  }
  if (openings > 5000) return "High";
  if (openings > 1000) return "Moderate";
  return "Low";
}

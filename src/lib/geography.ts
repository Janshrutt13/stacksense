/**
 * geography.ts — Static country → top-5-cities registry.
 *
 * No AI, no API calls. Deterministic lookups only.
 * Used by the /explore page to instantly surface relevant cities when a user
 * types a country name or alias.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CountryLookup {
  countryName: string;
  cities: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Country → Top 5 Tech-Hub Cities registry
// Keys are lowercase canonical country names.
// ─────────────────────────────────────────────────────────────────────────────

const COUNTRY_CITIES: Record<string, { displayName: string; cities: string[] }> = {
  india: {
    displayName: "India",
    cities: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune"],
  },
  "united states": {
    displayName: "United States",
    cities: ["San Francisco", "New York", "Austin", "Seattle", "Boston"],
  },
  "united kingdom": {
    displayName: "United Kingdom",
    cities: ["London", "Manchester", "Edinburgh", "Bristol", "Cambridge"],
  },
  germany: {
    displayName: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  },
  canada: {
    displayName: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal", "Ottawa", "Calgary"],
  },
  australia: {
    displayName: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  },
  singapore: {
    displayName: "Singapore",
    cities: ["Singapore", "Jurong East", "Tampines", "Woodlands", "Ang Mo Kio"],
  },
  japan: {
    displayName: "Japan",
    cities: ["Tokyo", "Osaka", "Yokohama", "Kyoto", "Nagoya"],
  },
  netherlands: {
    displayName: "Netherlands",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Eindhoven", "Utrecht"],
  },
  france: {
    displayName: "France",
    cities: ["Paris", "Lyon", "Bordeaux", "Toulouse", "Nantes"],
  },
  brazil: {
    displayName: "Brazil",
    cities: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre"],
  },
  uae: {
    displayName: "UAE",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"],
  },
  sweden: {
    displayName: "Sweden",
    cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Linköping"],
  },
  poland: {
    displayName: "Poland",
    cities: ["Warsaw", "Kraków", "Wrocław", "Poznań", "Gdańsk"],
  },
  "south korea": {
    displayName: "South Korea",
    cities: ["Seoul", "Busan", "Incheon", "Daejeon", "Daegu"],
  },
  china: {
    displayName: "China",
    cities: ["Beijing", "Shanghai", "Shenzhen", "Guangzhou", "Hangzhou"],
  },
  ireland: {
    displayName: "Ireland",
    cities: ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
  },
  spain: {
    displayName: "Spain",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],
  },
  "new zealand": {
    displayName: "New Zealand",
    cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Dunedin"],
  },
  israel: {
    displayName: "Israel",
    cities: ["Tel Aviv", "Jerusalem", "Haifa", "Beer Sheva", "Herzliya"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Alias map — maps common abbreviations/names to canonical lowercase keys above
// ─────────────────────────────────────────────────────────────────────────────

const ALIASES: Record<string, string> = {
  // India
  in: "india",
  ind: "india",
  bharat: "india",

  // United States
  us: "united states",
  usa: "united states",
  "u.s.": "united states",
  "u.s.a.": "united states",
  america: "united states",
  "united states of america": "united states",

  // United Kingdom
  uk: "united kingdom",
  gb: "united kingdom",
  britain: "united kingdom",
  "great britain": "united kingdom",
  england: "united kingdom",

  // Germany
  de: "germany",
  deutschland: "germany",

  // Canada
  ca: "canada",
  can: "canada",

  // Australia
  au: "australia",
  aus: "australia",
  "down under": "australia",

  // Singapore
  sg: "singapore",
  sgp: "singapore",

  // Japan
  jp: "japan",
  jpn: "japan",
  nippon: "japan",

  // Netherlands
  nl: "netherlands",
  holland: "netherlands",
  "the netherlands": "netherlands",

  // France
  fr: "france",

  // Brazil
  br: "brazil",
  brasil: "brazil",

  // UAE
  "united arab emirates": "uae",
  "u.a.e.": "uae",
  "dubai": "uae",    // city often used as country proxy

  // Sweden
  se: "sweden",
  sverige: "sweden",

  // Poland
  pl: "poland",

  // South Korea
  korea: "south korea",
  "republic of korea": "south korea",
  kr: "south korea",

  // China
  cn: "china",
  prc: "china",

  // Ireland
  ie: "ireland",
  eire: "ireland",

  // Spain
  es: "spain",
  espana: "spain",
  españa: "spain",

  // New Zealand
  nz: "new zealand",
  aotearoa: "new zealand",

  // Israel
  il: "israel",
};

// ─────────────────────────────────────────────────────────────────────────────
// Fallback — global tech hubs for unrecognised input
// ─────────────────────────────────────────────────────────────────────────────

const GLOBAL_FALLBACK: CountryLookup = {
  countryName: "Global Tech Hubs",
  cities: ["Bangalore", "San Francisco", "London", "Berlin", "Toronto"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Given any free-text country query (including aliases, abbreviations, or
 * partial names), returns the canonical country name and its top-5 tech-hub
 * cities. Falls back to global tech hubs for unrecognised input.
 *
 * Case-insensitive, trims whitespace.
 *
 * @example
 * getTopCitiesForCountry("usa")
 * // → { countryName: "United States", cities: ["San Francisco", "New York", ...] }
 *
 * getTopCitiesForCountry("xyz")
 * // → { countryName: "Global Tech Hubs", cities: ["Bangalore", "San Francisco", ...] }
 */
export function getTopCitiesForCountry(query: string): CountryLookup {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return GLOBAL_FALLBACK;

  // 1. Resolve alias (e.g. "usa" → "united states")
  const canonical = ALIASES[normalized] ?? normalized;

  // 2. Direct registry lookup
  const entry = COUNTRY_CITIES[canonical];
  if (entry) {
    return { countryName: entry.displayName, cities: entry.cities };
  }

  // 3. Fuzzy partial-match: find any key that starts with the query
  const partialKey = Object.keys(COUNTRY_CITIES).find((k) => k.startsWith(canonical));
  if (partialKey) {
    const found = COUNTRY_CITIES[partialKey];
    return { countryName: found.displayName, cities: found.cities };
  }

  // 4. Reverse partial: the query contains a known country key
  const reverseKey = Object.keys(COUNTRY_CITIES).find((k) => canonical.includes(k));
  if (reverseKey) {
    const found = COUNTRY_CITIES[reverseKey];
    return { countryName: found.displayName, cities: found.cities };
  }

  return GLOBAL_FALLBACK;
}

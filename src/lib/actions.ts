/**
 * Barrel re-export — all market intelligence logic lives in actions/market.ts.
 * This file is kept so that existing imports from "@/lib/actions" continue
 * to resolve without modification anywhere in the codebase.
 * NOTE: "use server" is intentionally omitted here — it lives in market.ts.
 */
export type { MarketEntry, CityTrendsResult } from "@/lib/actions/market";
export {
  getMarketIntelligence,
  getRegionalTrends,
  getAllRegionalTrends,
  getCityTrends,
  fetchDevToArticles,
  scrapeJobSignalForTech,
} from "@/lib/actions/market";
export { EVALUATION_POOL } from "@/lib/actions/constants";


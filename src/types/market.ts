/**
 * Shared TypeScript interfaces for the Country Tech Intelligence Engine.
 * This file MUST NOT contain "use server" — it is imported by both
 * server actions and client components.
 */

export interface TechSignal {
  tech: string;
  openings: number;
  demandScore: "High" | "Moderate" | "Low";
}

export interface CitySignal {
  city: string;
  jobVolume: number;
}

export interface ArticleSignal {
  title: string;
  url: string;
  source: string;
}

export interface CountryTrendPayload {
  country: string;
  topTechs: TechSignal[];
  topCities: CitySignal[];
  articleData: ArticleSignal[];
}

/** Alias used by the legacy getCountryMarketTrends orchestrator */
export type TechDemand = TechSignal;

/** Alias used by the legacy getCountryMarketTrends orchestrator */
export type ArticleItem = ArticleSignal;

/** Extended response that includes cache metadata */
export interface CountryTrendResponse {
  country: string;
  topTechs: TechDemand[];
  topCities: CitySignal[] | [];
  articleData: ArticleItem[];
  fromCache: boolean;
  lastUpdated: Date;
}

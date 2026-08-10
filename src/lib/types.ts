/** Shape written by scraper.py into MarketTrend.jobData (JSON array) */
export interface ScrapedJob {
  tech: string;
  openings: number;
  demandScore: "High" | "Moderate" | "Low";
}

/** Shape written by scraper.py into MarketTrend.articleData (JSON array) */
export interface ScrapedArticle {
  title: string;
  url: string;
  source: string;
}

export interface RoadmapMilestone {
  phase: number;
  title: string;
  duration: string;
  skills: string[];
  resources: string[];
  projects: string[];
}

export interface GeneratedRoadmap {
  stack: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  location: string;
  milestones: RoadmapMilestone[];
  marketInsights: string;
  estimatedTimeToHire: string;
  generatedAt: Date;
}

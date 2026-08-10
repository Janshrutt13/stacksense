import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Parser from "rss-parser";

type RSSItem = {
  title?: string;
  link?: string;
  pubDate?: string;
};

// ─── TypeScript Interfaces ────────────────────────────────────────────────
interface ApifyJobItem {
  jobTitle: string;
  company: string;
  location: string;
  remote: boolean;
  techStack: string[];
}

interface ApifyJobData {
  items: ApifyJobItem[];
  totalCount: number;
  region: string;
}

interface Article {
  title: string;
  url: string;
  source: string;
  publishedDate: string;
}

interface AggregatedMarketData {
  jobCounts: Record<string, number>;
  remotePercentage: number;
  topTechStacks: string[];
  articles: Article[];
  lastUpdated: string;
}

// ─── Helper: Fetch Apify Job Data ─────────────────────────────────────────
async function fetchApifyJobData(
  region: string,
  techStack: string,
): Promise<ApifyJobData> {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    throw new Error("APIFY_API_TOKEN not configured");
  }

  // Start the actor run and wait for finish
  const response = await fetch(
    "https://api.apify.com/v2/acts/curious_coder~linkedin-jobs-scraper/runs?waitForFinish=60",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apifyToken}`,
      },
      body: JSON.stringify({
        queries: `${techStack} ${region}`,
        location: region,
        maxResults: 100,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Apify API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data: { defaultDatasetId: string };
  };
  const datasetId = data.data.defaultDatasetId;

  // Fetch dataset results
  const resultsResponse = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items`,
    {
      headers: { Authorization: `Bearer ${apifyToken}` },
    },
  );

  const items = (await resultsResponse.json()) as ApifyJobItem[];

  return {
    items,
    totalCount: items.length,
    region,
  };
}

// ─── Helper: Fetch Dev.to Articles ────────────────────────────────────────
async function fetchDevToArticles(techStack: string): Promise<Article[]> {
  try {
    const response = await fetch(
      `https://dev.to/api/articles?tag=${encodeURIComponent(techStack)}&per_page=10`,
    );

    if (!response.ok) {
      throw new Error(`Dev.to API error: ${response.statusText}`);
    }

    const articles = (await response.json()) as Array<{
      title: string;
      url: string;
      published_at: string;
    }>;

    return articles.map((a) => ({
      title: a.title,
      url: a.url,
      source: "dev.to",
      publishedDate: a.published_at,
    }));
  } catch (error) {
    console.error("Error fetching Dev.to articles:", error);
    return [];
  }
}

// ─── Helper: Fetch Medium Articles via RSS ────────────────────────────────
async function fetchMediumArticles(techStack: string): Promise<Article[]> {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL(
      `https://medium.com/feed/tag/${encodeURIComponent(techStack)}`,
    );

    return (feed.items as RSSItem[] || [])
      .slice(0, 10)
      .map((item) => ({
        title: item.title || "Untitled",
        url: item.link || "",
        source: "medium",
        publishedDate: item.pubDate || new Date().toISOString(),
      }));
  } catch (error) {
    console.error("Error fetching Medium articles:", error);
    return [];
  }
}

// ─── Helper: Aggregate Articles from Multiple Sources ────────────────────
async function fetchArticles(techStack: string): Promise<Article[]> {
  const [devToArticles, mediumArticles] = await Promise.all([
    fetchDevToArticles(techStack),
    fetchMediumArticles(techStack),
  ]);

  return [...devToArticles, ...mediumArticles]
    .sort(
      (a, b) =>
        new Date(b.publishedDate).getTime() -
        new Date(a.publishedDate).getTime(),
    )
    .slice(0, 10);
}

// ─── Main Cron Handler ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const regions = ["San Francisco", "New York", "London", "Singapore"];
    const techStacks = ["Next.js", "React", "TypeScript", "Node.js", "Fastify"];

    for (const region of regions) {
      const aggregatedData: AggregatedMarketData = {
        jobCounts: {},
        remotePercentage: 0,
        topTechStacks: [],
        articles: [],
        lastUpdated: new Date().toISOString(),
      };

      let totalJobs = 0;
      let remoteJobs = 0;
      const techStackCounts: Record<string, number> = {};

      // Fetch job data for each tech stack
      for (const stack of techStacks) {
        try {
          const jobData = await fetchApifyJobData(region, stack);
          aggregatedData.jobCounts[stack] = jobData.totalCount;
          totalJobs += jobData.totalCount;
          remoteJobs += jobData.items.filter((j) => j.remote).length;

          // Count tech stack occurrences
          jobData.items.forEach((job) => {
            job.techStack.forEach((tech) => {
              techStackCounts[tech] = (techStackCounts[tech] || 0) + 1;
            });
          });
        } catch (error) {
          console.error(`Error fetching Apify data for ${stack}:`, error);
        }
      }

      // Calculate remote percentage
      if (totalJobs > 0) {
        aggregatedData.remotePercentage = Math.round(
          (remoteJobs / totalJobs) * 100,
        );
      }

      // Get top tech stacks
      aggregatedData.topTechStacks = Object.entries(techStackCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tech]) => tech);

      // Fetch articles from Dev.to and Medium
      try {
        const articles = await fetchArticles(techStacks.join(", "));
        aggregatedData.articles = articles;
      } catch (error) {
        console.error("Error fetching articles:", error);
      }

      // Upsert to database
      await db.marketTrend.upsert({
        where: { location: region },
        update: {
          jobData: aggregatedData.jobCounts,
          articles: aggregatedData.articles,
          updatedAt: new Date(),
        },
        create: {
          location: region,
          jobData: aggregatedData.jobCounts,
          articles: aggregatedData.articles,
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Market data aggregated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to aggregate market data" },
      { status: 500 },
    );
  }
}

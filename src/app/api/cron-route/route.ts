import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrapeJobSignalForTech, fetchDevToArticles } from "@/lib/actions/market";
import { EVALUATION_POOL } from "@/lib/actions/constants";

// ─── Main Cron Handler ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const regions = ["San Francisco", "New York", "London", "Singapore"];

    for (const region of regions) {
      // Scrape all evaluation pool techs in parallel
      const allJobResults = await Promise.all(
        EVALUATION_POOL.map((tech: string) => scrapeJobSignalForTech(tech, region)),
      );

      // Sort by openings descending, keep top 5
      const top5 = [...allJobResults]
        .sort((a, b) => b.openings - a.openings)
        .slice(0, 5);

      // Fetch Dev.to articles for the top 3 techs
      const topTechNames = top5.slice(0, 3).map((j) => j.tech);
      const articleData = await fetchDevToArticles(topTechNames);

      // Upsert to database using actual schema fields
      await db.marketTrend.upsert({
        where: { location: region },
        update: {
          jobData: top5 as any,
          articleData: articleData as any,
        },
        create: {
          location: region,
          jobData: top5 as any,
          articleData: articleData as any,
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

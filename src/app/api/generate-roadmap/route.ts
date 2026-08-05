import { getSessionFromCookies } from "@/lib/auth";
import { db } from "@/lib/db";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const roadmapSchema = z.object({
  targetStack: z.string(),
  estimatedWeeks: z.number(),
  deltaAnalysis: z.string(),
  milestones: z.array(
    z.object({
      title: z.string(),
      weekRange: z.string(),
      description: z.string(),
      keyConcepts: z.array(z.string()),
      projectIdea: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { experienceLevel, currentSkills, location, targetStack } = body;

  const prompt = `You are a strict technical recruiter and senior engineer.
Generate a learning roadmap for a developer who wants to master: ${targetStack}.
Location: ${location}. Experience level: ${experienceLevel}.
Current skills: ${currentSkills?.join(", ") || "none"}.

${
  experienceLevel === "experienced"
    ? "Calculate the skill delta — skip concepts they already know from their current skills. Jump straight to advanced topics."
    : "Start from fundamentals and build up progressively."
}

Return a structured roadmap with milestones. Be specific, practical, and evidence-backed.`;

  const { object } = await generateObject({
    model: google("gemini-3.5-flash"),
    schema: roadmapSchema,
    prompt,
  });

  const roadmap = await db.roadmap.create({
    data: {
      userId: session.userId,
      targetStack: object.targetStack,
      nodes: object as unknown as object,
      marketData: { location, estimatedWeeks: object.estimatedWeeks },
    },
  });

  return NextResponse.json({ roadmapId: roadmap.id, ...object });
}

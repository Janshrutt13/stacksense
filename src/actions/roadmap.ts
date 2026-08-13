"use server";

import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { RoadmapFormData, GeneratedRoadmapResponse, RoadmapPhase } from "@/types/roadmap";

const RoadmapSchema = z.object({
  phases: z.array(
    z.object({
      phaseNumber: z.number(),
      title: z.string(),
      duration: z.string().describe("Total phase timeline, e.g. '3-4 Weeks'"),
      objective: z.string(),
      topics: z.array(z.string()),
      resources: z.array(
        z.object({
          name: z.string().describe("Exact resource name, e.g. 'Fireship React in 100 Seconds'"),
          type: z.enum(["YouTube", "Course", "Documentation", "Book", "Interactive", "Article"]),
          url: z.string().url().describe(
            "A real, direct https:// URL. No placeholders, no example.com, no shortened links. YouTube links must be youtube.com/watch?v=... format."
          ),
          estimatedTime: z.string().describe("Completion time, e.g. '8 hours' or '3 days'"),
          whyRecommended: z.string().describe("Why this is the community standard for this topic"),
        })
      ),
      projectIdea: z.object({
        title: z.string(),
        description: z.string(),
      }),
    })
  ),
});

// Runtime URL safety filter — removes hallucinated or placeholder URLs
function sanitizePhases(phases: RoadmapPhase[]): RoadmapPhase[] {
  const BAD_PATTERNS = ["example.com", "placeholder", "your-link", "insert", "localhost"];
  return phases.map((phase) => ({
    ...phase,
    resources: phase.resources.filter(
      (r) =>
        r.url.startsWith("https://") &&
        !BAD_PATTERNS.some((p) => r.url.toLowerCase().includes(p))
    ),
  }));
}

export async function generateCareerRoadmap(
  formData: RoadmapFormData
): Promise<GeneratedRoadmapResponse | null> {
  try {
    const { currentRole, currentTechStack, yearsOfExp, targetTechStack, targetRole, additionalInfo } = formData;

    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      system: `You are a Principal Software Architect creating technical career transition roadmaps.
RULES:
- Every resource URL must be a real, direct, working https:// link.
- Provide a diverse mix of resources: YouTube tutorials, popular courses, official documentation, and high-quality online articles/blogs.
- NEVER generate placeholder URLs, example.com links, or shortened URLs.
- If you are not certain a URL is real, use the official documentation URL for that technology instead.`,
      prompt: `
Create a 4-phase technical career transition roadmap.

- Current Role: ${currentRole} (${yearsOfExp} years experience)
- Current Tech Stack: ${currentTechStack.join(", ")}
- Target Tech Stack: ${targetTechStack.join(", ")}
- Target Role: ${targetRole || "Software Engineer"}
- Context: ${additionalInfo || "None"}

Requirements:
1. Bridge only the actual skill delta — skip what they already know from ${yearsOfExp} YoE.
2. Output exactly 4 sequential phases.
3. Each phase: 3-4 diverse resources with real URLs (mix of YouTube, courses, articles, docs), time estimates, and one portfolio project idea.
      `,
      schema: RoadmapSchema,
    });

    const cleanedPhases = sanitizePhases(object.phases as RoadmapPhase[]);

    const saved = await prisma.careerRoadmap.create({
      data: {
        currentRole,
        currentTechStack,
        yearsOfExp,
        targetTechStack,
        targetRole,
        additionalInfo,
        phases: JSON.parse(JSON.stringify(cleanedPhases)),
      },
    });

    return {
      id: saved.id,
      currentRole: saved.currentRole,
      yearsOfExp: saved.yearsOfExp,
      targetRole: saved.targetRole ?? undefined,
      targetTechStack: saved.targetTechStack,
      phases: saved.phases as unknown as GeneratedRoadmapResponse["phases"],
      createdAt: saved.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("[generateCareerRoadmap error]:", error);
    return null;
  }
}

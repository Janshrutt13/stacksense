/**
 * The pool of technologies evaluated for every city market-trend lookup.
 * Exactly 12 stacks are scraped in parallel via DuckDuckGo snippet density.
 */
export const EVALUATION_POOL = [
  "Next.js",
  "React",
  "Fastify",
  "TypeScript",
  "PostgreSQL",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Docker",
  "AWS",
  "Kubernetes",
] as const;

/** Union type of every evaluatable technology name. */
export type EvalTech = (typeof EVALUATION_POOL)[number];

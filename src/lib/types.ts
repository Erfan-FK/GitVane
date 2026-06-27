import { z } from "zod";

/** A single fact detected about the repo, with a confidence flag for UI badges. */
export const DetectedFactSchema = z.object({
  value: z.string(),
  confidence: z.enum(["high", "medium", "low"]).default("high"),
});
export type DetectedFact = z.infer<typeof DetectedFactSchema>;

/** Package.json script entry, command is the exact runnable command. */
export const ScriptCommandSchema = z.object({
  name: z.string(),
  raw: z.string(),
});
export type ScriptCommand = z.infer<typeof ScriptCommandSchema>;

/**
 * The deterministic source of truth produced by the analysis layer.
 * Everything downstream (scoring, templates, the LLM prompt) reads from this.
 */
export const RepoProfileSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  defaultBranch: z.string(),
  commitSha: z.string(),
  description: z.string().nullable().default(null),
  stars: z.number().default(0),
  homepage: z.string().nullable().default(null),
  primaryLanguage: z.string().nullable().default(null),

  // Stack detection
  languages: z.array(z.string()).default([]),
  packageManager: z.enum(["pnpm", "yarn", "npm", "bun", "unknown"]).default("unknown"),
  frameworks: z.array(z.string()).default([]),
  runtime: z.string().nullable().default(null),

  // Commands (exact, from package.json scripts)
  scripts: z.object({
    install: z.string().nullable().default(null),
    dev: z.string().nullable().default(null),
    build: z.string().nullable().default(null),
    lint: z.string().nullable().default(null),
    test: z.string().nullable().default(null),
    typecheck: z.string().nullable().default(null),
    format: z.string().nullable().default(null),
    start: z.string().nullable().default(null),
  }),
  allScripts: z.array(ScriptCommandSchema).default([]),

  // Areas
  hasFrontend: z.boolean().default(false),
  hasBackend: z.boolean().default(false),
  frontendDirs: z.array(z.string()).default([]),
  backendDirs: z.array(z.string()).default([]),
  apiRoutes: z.array(z.string()).default([]),

  // Tooling / ecosystem
  styling: z.array(z.string()).default([]), // tailwind, shadcn, css-modules, etc
  uiLibraries: z.array(z.string()).default([]),
  database: z.array(z.string()).default([]), // prisma, drizzle, supabase, etc
  ormFiles: z.array(z.string()).default([]),
  testing: z.array(z.string()).default([]), // vitest, jest, playwright
  ci: z.array(z.string()).default([]),
  monorepo: z.boolean().default(false),
  envVars: z.array(z.string()).default([]),

  // Existing agent-readiness artifacts
  existingAgentFiles: z.array(z.string()).default([]),
  hasReadme: z.boolean().default(false),

  // Risk signals used to build failure-modes.md
  riskNotes: z.array(z.string()).default([]),

  // A small set of representative top-level paths for context
  notableDirs: z.array(z.string()).default([]),
});
export type RepoProfile = z.infer<typeof RepoProfileSchema>;

/** A file GitVane generates for the target repo. */
export const GeneratedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  language: z.string().default("markdown"),
  // Whether this file's prose was synthesized by the LLM or built from templates.
  source: z.enum(["template", "llm", "llm-verified"]).default("template"),
});
export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;

/** One item in the Agent Readiness checklist. */
export const ScoreItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  weight: z.number(),
  present: z.boolean(),
  applicable: z.boolean().default(true),
  detail: z.string().optional(),
});
export type ScoreItem = z.infer<typeof ScoreItemSchema>;

export const ReadinessScoreSchema = z.object({
  score: z.number(), // 0-100
  maxApplicable: z.number(),
  items: z.array(ScoreItemSchema),
  missing: z.array(z.string()),
});
export type ReadinessScore = z.infer<typeof ReadinessScoreSchema>;

/** The full analysis payload returned by /api/analyze and stored/cached. */
export const AnalysisResultSchema = z.object({
  id: z.string(),
  profile: RepoProfileSchema,
  score: ReadinessScoreSchema,
  files: z.array(GeneratedFileSchema),
  generatedAt: z.string(),
  usedLLM: z.boolean().default(false),
  fromCache: z.boolean().default(false),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

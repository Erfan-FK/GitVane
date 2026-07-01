/** Visual identity key resolved to an icon/logo component on the Docs page. */
export type IconKey =
  | "claude"
  | "copilot"
  | "cursor"
  | "windsurf"
  | "agents"
  | "llms"
  | "validation"
  | "failure"
  | "design"
  | "api"
  | "auth"
  | "database"
  | "env";

export interface FileDoc {
  path: string;
  title: string;
  tool: string;
  purpose: string;
  why: string;
  when: string;
  stage: 1 | 2;
  /** Billing tier required to generate this file with full fidelity. */
  tier: "free" | "premium";
  /** Drives the icon/logo shown on the Docs page. */
  iconKey: IconKey;
  /** Tailwind text color class used as the icon accent. */
  accent: string;
  /** Optional before/after sample illustrating the free vs premium difference. */
  sample?: { free: string; premium: string };
}

/** Documentation for every file GitVane can generate. Drives the /docs page. */
export const FILE_CATALOG: FileDoc[] = [
  {
    path: "AGENTS.md",
    title: "AGENTS.md",
    tool: "All agents",
    purpose:
      "The core operating file for AI agents: what the repo is, its stack, structure, commands, the rules to follow, and what not to modify.",
    why: "Agents read this first. It replaces the context you'd otherwise paste into every chat, so tools work correctly from the start.",
    when: "Always generated.",
    stage: 1,
    tier: "free",
    iconKey: "agents",
    accent: "text-emerald-500",
    sample: {
      free: "Built with Next.js. Frontend code lives in src/. See the directory layout for how the project is organized.",
      premium: "A Next.js App Router app. UI lives in src/app and src/components; data access is isolated in src/lib/db, and server actions in src/lib/actions handle mutations. Treat src/lib/db as the only place that talks to Postgres.",
    },
  },
  {
    path: "llms.txt",
    title: "llms.txt",
    tool: "All LLMs",
    purpose:
      "A root-level, link-rich Markdown map of the project for LLMs — a curated index of what matters and where to find it.",
    why: "An emerging standard (llmstxt.org). Lets any LLM or agent quickly orient itself in the repo without crawling everything.",
    when: "Always generated.",
    stage: 1,
    tier: "free",
    iconKey: "llms",
    accent: "text-sky-500",
  },
  {
    path: "CLAUDE.md",
    title: "CLAUDE.md",
    tool: "Claude / Claude Code",
    purpose: "Points Claude Code at AGENTS.md and gives a quick stack reference.",
    why: "Claude Code looks for CLAUDE.md by name. This keeps it in sync with AGENTS.md instead of duplicating rules.",
    when: "Always generated.",
    stage: 1,
    tier: "free",
    iconKey: "claude",
    accent: "text-orange-500",
  },
  {
    path: ".github/copilot-instructions.md",
    title: "Copilot Instructions",
    tool: "GitHub Copilot",
    purpose:
      "Tells Copilot which package manager to use, the coding conventions to follow, and the checks to run.",
    why: "Copilot automatically reads this file, so its inline suggestions match your conventions.",
    when: "Always generated.",
    stage: 1,
    tier: "free",
    iconKey: "copilot",
    accent: "text-foreground",
  },
  {
    path: ".cursor/rules/project.mdc",
    title: "Cursor Rules",
    tool: "Cursor",
    purpose:
      "Project conventions, style rules, validation commands, and frontend/backend boundaries for Cursor.",
    why: "Cursor applies these rules to every edit, keeping changes consistent with the project.",
    when: "Always generated.",
    stage: 1,
    tier: "free",
    iconKey: "cursor",
    accent: "text-foreground",
  },
  {
    path: ".windsurf/rules/project.md",
    title: "Windsurf Rules",
    tool: "Windsurf",
    purpose: "Always-on rules describing the stack, conventions, validation, and guardrails.",
    why: "Windsurf reads workspace rules and applies them to Cascade's edits.",
    when: "Always generated.",
    stage: 1,
    tier: "free",
    iconKey: "windsurf",
    accent: "text-teal-500",
  },
  {
    path: "docs/validation.md",
    title: "Validation Runbook",
    tool: "All agents",
    purpose:
      "The exact install, dev, lint, typecheck, test, and build commands — pulled from package.json and the lockfile.",
    why: "Agents frequently guess commands wrong. This gives them the precise, runnable commands for your repo.",
    when: "Always generated.",
    stage: 1,
    tier: "free",
    iconKey: "validation",
    accent: "text-green-500",
  },
  {
    path: "docs/failure-modes.md",
    title: "Failure Modes",
    tool: "All agents",
    purpose:
      "A 'be careful' guide: files not to touch, risky areas, generated files, and auth/database warnings.",
    why: "Prevents the most common and costly mistakes agents make in an unfamiliar repo.",
    when: "Always generated.",
    stage: 1,
    tier: "free",
    iconKey: "failure",
    accent: "text-amber-500",
  },
  {
    path: "docs/design-system.md",
    title: "Design System",
    tool: "All agents",
    purpose:
      "Component style, Tailwind/shadcn usage, colors, spacing, and how new UI should look.",
    why: "Helps agents produce UI that matches your existing app instead of inventing new patterns.",
    when: "Generated when frontend code is detected.",
    stage: 1,
    tier: "premium",
    iconKey: "design",
    accent: "text-pink-500",
    sample: {
      free: "Style with Tailwind utility classes. Reuse existing shadcn/ui components.",
      premium: "Buttons use the `Button` primitive from src/components/ui with variant=\"default|outline|ghost\"; never hand-roll buttons. Spacing follows a 4px scale; cards use rounded-xl + border-border. Use the `cn()` helper for conditional classes.",
    },
  },
  {
    path: "docs/api-map.md",
    title: "API Map",
    tool: "All agents",
    purpose: "API routes, handlers, auth rules, response format, and service structure.",
    why: "Helps agents avoid breaking backend logic or changing response shapes clients rely on.",
    when: "Generated when backend/API code is detected.",
    stage: 1,
    tier: "premium",
    iconKey: "api",
    accent: "text-violet-500",
    sample: {
      free: "API routes live under src/app/api. Preserve response shapes.",
      premium: "POST /api/analyze accepts { repo, refresh } and returns AnalysisResult. All routes return { error } with a matching HTTP status on failure. Auth-gated routes read the session via getCurrentUser(); never bypass it.",
    },
  },
  {
    path: ".github/instructions/frontend.instructions.md",
    title: "Frontend Instructions",
    tool: "GitHub Copilot",
    purpose: "Path-scoped rules for UI code: reuse components, follow Tailwind/shadcn, reuse states.",
    why: "Targets frontend directories so agents get the right guidance only where it applies.",
    when: "Generated when frontend code is detected.",
    stage: 1,
    tier: "premium",
    iconKey: "copilot",
    accent: "text-foreground",
    sample: {
      free: "Reuse existing components. Use Tailwind utility classes.",
      premium: "applyTo: src/components/**, src/app/**. Compose shadcn/ui primitives; never hand-roll buttons. Reuse existing loading/empty/error states; never import server-only modules into client components.",
    },
  },
  {
    path: ".github/instructions/backend.instructions.md",
    title: "Backend Instructions",
    tool: "GitHub Copilot",
    purpose: "Path-scoped rules for server code: validate input, preserve response shapes, respect auth.",
    why: "Targets backend directories with precise, scoped guidance.",
    when: "Generated when backend/API code is detected.",
    stage: 1,
    tier: "premium",
    iconKey: "copilot",
    accent: "text-foreground",
    sample: {
      free: "Validate input. Preserve response shapes. Respect auth.",
      premium: "applyTo: src/app/api/**. Access data only through src/lib/db; never skip it. Preserve { error } response shape and status codes. Read sessions via getCurrentUser(); never bypass auth.",
    },
  },
  {
    path: "docs/auth-flow.md",
    title: "Auth Flow",
    tool: "All agents",
    purpose: "How authentication works, the provider, env vars, middleware, and protected routes.",
    why: "Stops agents from bypassing auth or breaking protected routes.",
    when: "Generated when auth (provider, session, or auth env vars) is detected.",
    stage: 1,
    tier: "premium",
    iconKey: "auth",
    accent: "text-red-500",
    sample: {
      free: "Don't weaken auth checks. Protected routes must stay protected.",
      premium: "Provider: Supabase Auth. Sessions read via getCurrentUser() in src/lib/supabase/auth. Middleware refreshes the session; protected routes redirect unauthenticated users to /login. Never log tokens.",
    },
  },
  {
    path: "docs/database.md",
    title: "Database Guide",
    tool: "All agents",
    purpose: "Data layer, schema/config files, and migration rules.",
    why: "Prevents unsafe schema and migration changes.",
    when: "Generated when a data layer is detected.",
    stage: 1,
    tier: "premium",
    iconKey: "database",
    accent: "text-blue-500",
    sample: {
      free: "Use the existing data layer. Don't edit applied migrations.",
      premium: "Data layer: Prisma (prisma/schema.prisma). Edit the schema then run prisma generate; never hand-edit generated client. Create new migrations for changes; never modify applied ones. Keep queries parameterized.",
    },
  },
  {
    path: "docs/env-vars.md",
    title: "Environment Variables",
    tool: "All agents",
    purpose: "Detected env vars, which are secrets, and how to configure them.",
    why: "Helps agents configure and run the app correctly.",
    when: "Generated when environment variables are detected.",
    stage: 1,
    tier: "premium",
    iconKey: "env",
    accent: "text-yellow-500",
    sample: {
      free: "Copy .env.example to .env.local. Don't commit secrets.",
      premium: "DATABASE_URL (secret), NEXT_PUBLIC_SUPABASE_URL (config), ANTHROPIC_API_KEY (secret). Read through the config layer, not scattered process.env. Add new vars to .env.example with placeholders.",
    },
  },
];

/** Kept for backwards-compatibility; all specialized files are now generated. */
export const STAGE2_CATALOG: FileDoc[] = [];

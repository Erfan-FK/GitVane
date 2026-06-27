export interface FileDoc {
  path: string;
  title: string;
  tool: string;
  purpose: string;
  why: string;
  when: string;
  stage: 1 | 2;
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
  },
  {
    path: "CLAUDE.md",
    title: "CLAUDE.md",
    tool: "Claude / Claude Code",
    purpose: "Points Claude Code at AGENTS.md and gives a quick stack reference.",
    why: "Claude Code looks for CLAUDE.md by name. This keeps it in sync with AGENTS.md instead of duplicating rules.",
    when: "Always generated.",
    stage: 1,
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
  },
  {
    path: ".windsurf/rules/project.md",
    title: "Windsurf Rules",
    tool: "Windsurf",
    purpose: "Always-on rules describing the stack, conventions, validation, and guardrails.",
    why: "Windsurf reads workspace rules and applies them to Cascade's edits.",
    when: "Always generated.",
    stage: 1,
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
  },
  {
    path: "docs/api-map.md",
    title: "API Map",
    tool: "All agents",
    purpose: "API routes, handlers, auth rules, response format, and service structure.",
    why: "Helps agents avoid breaking backend logic or changing response shapes clients rely on.",
    when: "Generated when backend/API code is detected.",
    stage: 1,
  },
];

export const STAGE2_CATALOG: FileDoc[] = [
  {
    path: ".github/instructions/frontend.instructions.md",
    title: "Frontend Instructions",
    tool: "GitHub Copilot",
    purpose: "Path-scoped rules for UI code: reuse components, follow Tailwind/shadcn, reuse states.",
    why: "Targets frontend directories so agents get the right guidance only where it applies.",
    when: "Coming soon (Deep Analyze).",
    stage: 2,
  },
  {
    path: ".github/instructions/backend.instructions.md",
    title: "Backend Instructions",
    tool: "GitHub Copilot",
    purpose: "Path-scoped rules for server code: validate input, preserve response shapes, respect auth.",
    why: "Targets backend directories with precise, scoped guidance.",
    when: "Coming soon (Deep Analyze).",
    stage: 2,
  },
  {
    path: "docs/auth-flow.md",
    title: "Auth Flow",
    tool: "All agents",
    purpose: "How authentication works, middleware, and protected routes.",
    why: "Stops agents from bypassing auth or breaking protected routes.",
    when: "Coming soon (Deep Analyze).",
    stage: 2,
  },
  {
    path: "docs/database.md",
    title: "Database Guide",
    tool: "All agents",
    purpose: "Schema overview, models, and migration rules.",
    why: "Prevents unsafe schema and migration changes.",
    when: "Coming soon (Deep Analyze).",
    stage: 2,
  },
  {
    path: "docs/env-vars.md",
    title: "Environment Variables",
    tool: "All agents",
    purpose: "Detected env vars, where they're used, and which are required.",
    why: "Helps agents configure and run the app correctly.",
    when: "Coming soon (Deep Analyze).",
    stage: 2,
  },
];

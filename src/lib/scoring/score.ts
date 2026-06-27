import type { RepoProfile, ReadinessScore, ScoreItem } from "@/lib/types";

/**
 * Computes the Agent Readiness Score from a RepoProfile.
 * Items that aren't applicable (e.g. design-system for a backend-only repo)
 * are excluded from the denominator so the score stays fair.
 */
export function computeReadinessScore(profile: RepoProfile): ReadinessScore {
  const has = (file: string) => profile.existingAgentFiles.includes(file);
  const hasAny = (pred: (f: string) => boolean) => profile.existingAgentFiles.some(pred);

  const items: ScoreItem[] = [
    {
      id: "agents-md",
      label: "AGENTS.md",
      weight: 25,
      present: has("AGENTS.md") || has("CLAUDE.md"),
      applicable: true,
      detail: "The core operating file for AI agents.",
    },
    {
      id: "copilot",
      label: "Copilot instructions",
      weight: 10,
      present: has(".github/copilot-instructions.md") || hasAny((f) => f.startsWith(".github/instructions/")),
      applicable: true,
      detail: "Guides GitHub Copilot's suggestions.",
    },
    {
      id: "cursor",
      label: "Cursor rules",
      weight: 10,
      present: has(".cursorrules") || hasAny((f) => f.startsWith(".cursor/rules/")),
      applicable: true,
      detail: "Project conventions for Cursor.",
    },
    {
      id: "validation",
      label: "Validation runbook",
      weight: 15,
      present: has("docs/validation.md"),
      applicable: true,
      detail: "Exact install/lint/test/build commands.",
    },
    {
      id: "failure-modes",
      label: "Failure modes",
      weight: 10,
      present: has("docs/failure-modes.md"),
      applicable: true,
      detail: "Risky areas and what not to touch.",
    },
    {
      id: "design-system",
      label: "Design system guide",
      weight: 10,
      present: has("docs/design-system.md"),
      applicable: profile.hasFrontend,
      detail: "How new UI should look and behave.",
    },
    {
      id: "api-map",
      label: "API map",
      weight: 10,
      present: has("docs/api-map.md"),
      applicable: profile.hasBackend,
      detail: "Routes, handlers, and response shapes.",
    },
    {
      id: "readme-scripts",
      label: "README + clear scripts",
      weight: 10,
      present: profile.hasReadme && hasUsableScripts(profile),
      applicable: true,
      detail: "A README and runnable package scripts.",
    },
  ];

  const applicable = items.filter((i) => i.applicable);
  const maxApplicable = applicable.reduce((sum, i) => sum + i.weight, 0);
  const earned = applicable
    .filter((i) => i.present)
    .reduce((sum, i) => sum + i.weight, 0);

  const score = maxApplicable === 0 ? 0 : Math.round((earned / maxApplicable) * 100);

  const missing = applicable
    .filter((i) => !i.present)
    .map((i) => i.label);

  return { score, maxApplicable, items, missing };
}

function hasUsableScripts(profile: RepoProfile): boolean {
  const s = profile.scripts;
  return Boolean(s.build || s.dev || s.test || s.lint);
}

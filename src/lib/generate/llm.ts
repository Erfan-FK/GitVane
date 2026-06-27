import Anthropic from "@anthropic-ai/sdk";
import type { RepoProfile } from "@/lib/types";
import type { ProseBlocks } from "@/lib/generate/prose";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

export function isLLMConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Static system prompt — kept constant so Anthropic prompt caching can reuse it
 * across requests. All repo-specific data goes in the (uncached) user turn.
 */
const SYSTEM_PROMPT = `You are GitVane's documentation engine. You write concise, accurate prose blocks that help AI coding agents work inside a specific repository.

Strict rules:
- You are given a structured RepoProfile of FACTS. Treat it as ground truth.
- NEVER invent commands, scripts, file paths, routes, frameworks, or libraries that are not present in the profile.
- Do not include install/lint/test/build commands in prose — those are templated separately.
- Be specific to THIS repo; avoid generic filler. No marketing language.
- Write in direct, imperative English. Short paragraphs and short bullets.
- Output ONLY by calling the provided tool. Do not add commentary.`;

const TOOL = {
  name: "emit_prose",
  description: "Emit the prose blocks used to enrich the generated agent files.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description: "1-2 sentences: what this repo is and does.",
      },
      architecture: {
        type: "string",
        description:
          "One short paragraph on how the project is organized (layers, key directories, data flow). Use only facts from the profile.",
      },
      conventions: {
        type: "array",
        items: { type: "string" },
        description: "4-8 imperative coding-convention bullets specific to this repo.",
      },
      designNotes: {
        type: "string",
        description:
          "Only if the repo has frontend. A short paragraph on UI/design conventions agents should follow.",
      },
      apiNotes: {
        type: "string",
        description:
          "Only if the repo has backend/API. A short paragraph on API/server conventions agents should follow.",
      },
      extraRisks: {
        type: "array",
        items: { type: "string" },
        description: "0-5 repo-specific 'be careful' bullets beyond the obvious ones.",
      },
    },
    required: ["summary", "architecture", "conventions"],
  },
};

/** Compact, token-lean view of the profile passed to the model. */
function profileContext(profile: RepoProfile): string {
  return JSON.stringify(
    {
      name: `${profile.owner}/${profile.repo}`,
      description: profile.description,
      languages: profile.languages,
      frameworks: profile.frameworks,
      packageManager: profile.packageManager,
      runtime: profile.runtime,
      hasFrontend: profile.hasFrontend,
      hasBackend: profile.hasBackend,
      frontendDirs: profile.frontendDirs,
      backendDirs: profile.backendDirs,
      apiRoutes: profile.apiRoutes.slice(0, 20),
      styling: profile.styling,
      uiLibraries: profile.uiLibraries,
      database: profile.database,
      testing: profile.testing,
      ci: profile.ci,
      monorepo: profile.monorepo,
      notableDirs: profile.notableDirs,
      scripts: profile.allScripts.slice(0, 20),
      envVars: profile.envVars,
    },
    null,
    0,
  );
}

export async function generateProse(profile: RepoProfile): Promise<ProseBlocks | null> {
  if (!isLLMConfigured()) return null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const res = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [TOOL],
      tool_choice: { type: "tool", name: "emit_prose" },
      messages: [
        {
          role: "user",
          content: `RepoProfile (facts, JSON):\n${profileContext(profile)}\n\nWrite the prose blocks. hasFrontend=${profile.hasFrontend}, hasBackend=${profile.hasBackend}.`,
        },
      ],
    });

    const toolUse = res.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return null;
    return toolUse.input as ProseBlocks;
  } catch (err) {
    console.error("[gitvane] LLM prose generation failed:", (err as Error).message);
    return null;
  }
}

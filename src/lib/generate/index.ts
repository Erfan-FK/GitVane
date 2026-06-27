import type { RepoProfile, GeneratedFile } from "@/lib/types";
import { buildAllFiles } from "@/lib/generate/templates";
import { generateProse, isLLMConfigured } from "@/lib/generate/llm";
import { verifyProse } from "@/lib/generate/verify";
import { EMPTY_PROSE } from "@/lib/generate/prose";

export interface GenerateResult {
  files: GeneratedFile[];
  usedLLM: boolean;
}

/**
 * Facts-first generation:
 * 1. Try the LLM for prose blocks (if configured).
 * 2. Verify/scrub the prose against the profile facts.
 * 3. Assemble all files from templates, merging in the (verified) prose.
 * Always returns a complete set of files, even if the LLM is unavailable.
 */
export async function generateFiles(profile: RepoProfile): Promise<GenerateResult> {
  let usedLLM = false;
  let prose = EMPTY_PROSE;

  if (isLLMConfigured()) {
    const raw = await generateProse(profile);
    if (raw) {
      prose = verifyProse(profile, raw);
      usedLLM = true;
    }
  }

  const files = buildAllFiles(profile, prose);
  return { files, usedLLM };
}

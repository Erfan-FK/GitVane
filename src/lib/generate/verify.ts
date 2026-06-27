import type { RepoProfile } from "@/lib/types";
import type { ProseBlocks } from "@/lib/generate/prose";

/**
 * Verification pass: the LLM is instructed not to invent commands or paths, but
 * we defensively scrub its output. We drop any convention/risk bullet that
 * references a package-manager script that doesn't exist in the profile.
 */
export function verifyProse(profile: RepoProfile, prose: ProseBlocks): ProseBlocks {
  const knownScripts = new Set(profile.allScripts.map((s) => s.name));

  const cleanBullet = (b: string): boolean => {
    // Match `pnpm run foo`, `npm run foo`, `yarn foo`, `bun run foo`
    const cmdRegex = /\b(?:pnpm|npm|yarn|bun)\s+(?:run\s+)?([a-z0-9:_-]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = cmdRegex.exec(b)) !== null) {
      const script = m[1].toLowerCase();
      // Allow well-known lifecycle verbs that aren't custom scripts.
      const lifecycle = ["install", "i", "add", "remove", "ci", "exec", "dlx", "create"];
      if (lifecycle.includes(script)) continue;
      if (!knownScripts.has(script)) {
        return false; // references a fabricated script — drop it
      }
    }
    return true;
  };

  return {
    summary: prose.summary,
    architecture: prose.architecture,
    conventions: prose.conventions?.filter(cleanBullet),
    designNotes: profile.hasFrontend ? prose.designNotes : undefined,
    apiNotes: profile.hasBackend ? prose.apiNotes : undefined,
    extraRisks: prose.extraRisks?.filter(cleanBullet),
  };
}

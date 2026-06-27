import { fetchRepoData } from "@/lib/github/fetch-repo";
import { buildRepoProfile } from "@/lib/analysis/detect";
import { computeReadinessScore } from "@/lib/scoring/score";
import { generateFiles } from "@/lib/generate";
import { getCached, setCached } from "@/lib/cache";
import { getDbCached, setDbCached } from "@/lib/supabase/cache-db";
import type { AnalysisResult } from "@/lib/types";

export interface AnalyzeOptions {
  token?: string | null;
  /** Skip cache and force a fresh analysis. */
  refresh?: boolean;
}

/**
 * Full pipeline: fetch → profile → score → generate. Cached by owner/repo.
 */
export async function analyzeRepo(
  owner: string,
  repo: string,
  opts: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  if (!opts.refresh) {
    const mem = getCached(owner, repo);
    if (mem) return { ...mem, fromCache: true };

    const db = await getDbCached(owner, repo);
    if (db) {
      setCached(owner, repo, db);
      return { ...db, fromCache: true };
    }
  }

  const raw = await fetchRepoData(owner, repo, opts.token);
  const profile = buildRepoProfile(raw);
  const score = computeReadinessScore(profile);
  const { files, usedLLM } = await generateFiles(profile);

  const result: AnalysisResult = {
    id: `${owner}/${repo}`,
    profile,
    score,
    files,
    generatedAt: new Date().toISOString(),
    usedLLM,
    fromCache: false,
  };

  setCached(owner, repo, result);
  // Persist to the shared DB cache (no-op if service role not configured).
  await setDbCached(result).catch(() => {});
  return result;
}

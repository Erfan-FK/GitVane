import { fetchRepoData } from "@/lib/github/fetch-repo";
import { buildRepoProfile } from "@/lib/analysis/detect";
import { computeReadinessScore } from "@/lib/scoring/score";
import { generateFiles } from "@/lib/generate";
import { getCached, setCached } from "@/lib/cache";
import { getDbCached, setDbCached } from "@/lib/supabase/cache-db";
import { isScopeEmpty, scopeCacheKey, type ScopeOptions } from "@/lib/scope";
import type { AnalysisResult } from "@/lib/types";

export interface AnalyzeOptions {
  token?: string | null;
  /** Skip cache and force a fresh analysis. */
  refresh?: boolean;
  /** gitingest-style filters controlling which files feed the profiler. */
  scope?: ScopeOptions | null;
}

/**
 * Full pipeline: fetch → profile → score → generate. Cached by owner/repo.
 */
export async function analyzeRepo(
  owner: string,
  repo: string,
  opts: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  const scope = opts.scope ?? null;
  const scoped = !isScopeEmpty(scope);
  const scopeKey = scopeCacheKey(scope);

  if (!opts.refresh) {
    const mem = getCached(owner, repo, scopeKey);
    if (mem) return { ...mem, fromCache: true };

    // The shared DB cache is keyed by owner/repo only, so it's reused for the
    // default (unscoped) analysis but bypassed for custom scopes.
    if (!scoped) {
      const db = await getDbCached(owner, repo);
      if (db) {
        setCached(owner, repo, db);
        return { ...db, fromCache: true };
      }
    }
  }

  const raw = await fetchRepoData(owner, repo, opts.token, scope);
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

  setCached(owner, repo, result, scopeKey);
  // Persist to the shared DB cache only for the default (unscoped) analysis
  // (no-op if service role not configured).
  if (!scoped) await setDbCached(result).catch(() => {});
  return result;
}

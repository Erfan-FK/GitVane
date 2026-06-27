import type { AnalysisResult } from "@/lib/types";

interface CacheEntry {
  sha: string;
  result: AnalysisResult;
  expiresAt: number;
}

/**
 * Simple in-process cache keyed by `owner/repo`. Survives across requests
 * within the same server process (good enough for local/dev). Supabase-backed
 * persistent caching is layered on in the analyze orchestrator when configured.
 */
const store = new Map<string, CacheEntry>();

const TTL_MS = 1000 * 60 * 60; // 1 hour

function key(owner: string, repo: string): string {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

export function getCached(owner: string, repo: string): AnalysisResult | null {
  const entry = store.get(key(owner, repo));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key(owner, repo));
    return null;
  }
  return entry.result;
}

export function setCached(owner: string, repo: string, result: AnalysisResult): void {
  store.set(key(owner, repo), {
    sha: result.profile.commitSha,
    result,
    expiresAt: Date.now() + TTL_MS,
  });
}

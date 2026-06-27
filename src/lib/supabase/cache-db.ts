import { createAdminClient } from "@/lib/supabase/admin";
import { AnalysisResultSchema, type AnalysisResult } from "@/lib/types";

const TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

function key(owner: string, repo: string): string {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

/** Reads a cached analysis from the shared repo_cache table (service role). */
export async function getDbCached(owner: string, repo: string): Promise<AnalysisResult | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("repo_cache")
    .select("result, expires_at")
    .eq("key", key(owner, repo))
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  const parsed = AnalysisResultSchema.safeParse(data.result);
  return parsed.success ? parsed.data : null;
}

/** Upserts an analysis into the shared repo_cache table (service role). */
export async function setDbCached(result: AnalysisResult): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.from("repo_cache").upsert({
    key: key(result.profile.owner, result.profile.repo),
    sha: result.profile.commitSha,
    result,
    expires_at: new Date(Date.now() + TTL_MS).toISOString(),
  });
}

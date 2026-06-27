import { createClient } from "@/lib/supabase/server";
import type { AnalysisResult } from "@/lib/types";

export interface HistoryItem {
  id: string;
  owner: string;
  repo: string;
  score: number | null;
  usedLlm: boolean;
  createdAt: string;
}

/**
 * Saves an analysis to the signed-in user's history. RLS ensures users can
 * only write their own rows. Best-effort: failures are swallowed.
 */
export async function saveAnalysisForUser(
  userId: string,
  result: AnalysisResult,
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        owner: result.profile.owner,
        repo: result.profile.repo,
        commit_sha: result.profile.commitSha,
        score: result.score.score,
        used_llm: result.usedLLM,
        detected: result.profile,
      })
      .select("id")
      .single();

    if (error || !data) return;

    const rows = result.files.map((f) => ({
      analysis_id: data.id,
      path: f.path,
      content: f.content,
      language: f.language,
      source: f.source,
    }));
    await supabase.from("generated_files").insert(rows);
  } catch {
    // best-effort persistence
  }
}

/** Lists the most recent analyses for the signed-in user. */
export async function listUserAnalyses(limit = 30): Promise<HistoryItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("analyses")
      .select("id, owner, repo, score, used_llm, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id as string,
      owner: r.owner as string,
      repo: r.repo as string,
      score: r.score as number | null,
      usedLlm: r.used_llm as boolean,
      createdAt: r.created_at as string,
    }));
  } catch {
    return [];
  }
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ResultView } from "@/components/result/result-view";
import { analyzeRepo } from "@/lib/analyze";
import { GitHubError } from "@/lib/github/client";
import { getCurrentUser } from "@/lib/supabase/auth";
import { saveAnalysisForUser } from "@/lib/history";
import { scopeFromSearchParams, isScopeEmpty } from "@/lib/scope";

export async function generateMetadata(
  props: PageProps<"/result/[owner]/[repo]">,
): Promise<Metadata> {
  const { owner, repo } = await props.params;
  return {
    title: `${owner}/${repo}`,
    description: `Agent-readiness analysis and generated agent files for ${owner}/${repo}.`,
  };
}

export default async function ResultPage(props: PageProps<"/result/[owner]/[repo]">) {
  const { owner, repo } = await props.params;
  const searchParams = await props.searchParams;
  const scope = scopeFromSearchParams(searchParams);

  let result;
  try {
    result = await analyzeRepo(owner, repo, {
      scope: isScopeEmpty(scope) ? null : scope,
    });
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  // Persist to the signed-in user's history (best-effort, fresh runs only).
  if (!result.fromCache) {
    const user = await getCurrentUser();
    if (user) await saveAnalysisForUser(user.id, result);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <ResultView result={result} />
      </main>
      <SiteFooter />
    </>
  );
}

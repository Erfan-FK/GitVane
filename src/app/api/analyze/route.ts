import { NextResponse, type NextRequest } from "next/server";
import { analyzeRepo } from "@/lib/analyze";
import { parseRepoInput } from "@/lib/github/parse";
import { GitHubError } from "@/lib/github/client";

export async function POST(request: NextRequest) {
  let body: { repo?: string; refresh?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = body.repo ? parseRepoInput(body.repo) : null;
  if (!parsed) {
    return NextResponse.json(
      { error: "Provide a valid `repo` (owner/repo or a github.com URL)." },
      { status: 400 },
    );
  }

  try {
    const result = await analyzeRepo(parsed.owner, parsed.repo, { refresh: body.refresh });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GitHubError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: (err as Error).message || "Analysis failed." },
      { status: 500 },
    );
  }
}

import { createGitHubClient, GitHubError } from "@/lib/github/client";

export interface TreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  size: number;
}

export interface RepoMeta {
  owner: string;
  repo: string;
  defaultBranch: string;
  commitSha: string;
  treeSha: string;
  description: string | null;
  stars: number;
  homepage: string | null;
  primaryLanguage: string | null;
  truncated: boolean;
}

export interface RawRepoData {
  meta: RepoMeta;
  tree: TreeEntry[];
  /** path -> decoded UTF-8 contents for the files we chose to read. */
  files: Record<string, string>;
}

/**
 * The set of high-signal files we read contents for (everything else is
 * detected from the tree listing alone). Kept small to control cost/latency.
 */
const HIGH_SIGNAL_FILES = [
  "package.json",
  "tsconfig.json",
  "jsconfig.json",
  "next.config.js",
  "next.config.ts",
  "next.config.mjs",
  "vite.config.ts",
  "vite.config.js",
  "tailwind.config.js",
  "tailwind.config.ts",
  "components.json",
  "README.md",
  "readme.md",
  ".env.example",
  ".env.sample",
  "docker-compose.yml",
  "turbo.json",
  "nx.json",
  "pnpm-workspace.yaml",
];

/** Suffix matches for files anywhere in the tree we still want to read. */
const HIGH_SIGNAL_SUFFIXES = ["prisma/schema.prisma"];

export async function fetchRepoData(
  owner: string,
  repo: string,
  token?: string | null,
): Promise<RawRepoData> {
  const gh = createGitHubClient(token);

  let repoRes;
  try {
    repoRes = await gh.repos.get({ owner, repo });
  } catch (e: unknown) {
    const status = (e as { status?: number })?.status ?? 500;
    if (status === 404) {
      throw new GitHubError(`Repository ${owner}/${repo} not found or is private.`, 404);
    }
    if (status === 403) {
      throw new GitHubError("GitHub API rate limit reached. Add a GITHUB_TOKEN.", 403);
    }
    throw new GitHubError(`Failed to fetch repository: ${(e as Error).message}`, status);
  }

  const defaultBranch = repoRes.data.default_branch;

  const branchRes = await gh.repos.getBranch({ owner, repo, branch: defaultBranch });
  const commitSha = branchRes.data.commit.sha;
  const treeSha = branchRes.data.commit.commit.tree.sha;

  // Single recursive tree call — the backbone of cheap analysis.
  const treeRes = await gh.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: "1",
  });

  const tree: TreeEntry[] = (treeRes.data.tree || [])
    .filter((t) => t.path && (t.type === "blob" || t.type === "tree"))
    .map((t) => ({
      path: t.path as string,
      type: t.type as "blob" | "tree",
      size: t.size ?? 0,
    }));

  const treePaths = new Set(tree.filter((t) => t.type === "blob").map((t) => t.path));

  // Decide which files to read.
  const toRead = new Set<string>();
  for (const f of HIGH_SIGNAL_FILES) {
    if (treePaths.has(f)) toRead.add(f);
  }
  for (const t of tree) {
    if (t.type !== "blob") continue;
    if (HIGH_SIGNAL_SUFFIXES.some((suf) => t.path.endsWith(suf))) {
      toRead.add(t.path);
    }
    // GitHub Actions workflow files
    if (t.path.startsWith(".github/workflows/") && /\.ya?ml$/.test(t.path)) {
      toRead.add(t.path);
    }
  }

  const files: Record<string, string> = {};
  await Promise.all(
    Array.from(toRead).map(async (path) => {
      try {
        const content = await fetchFileContent(gh, owner, repo, path, commitSha);
        if (content != null) files[path] = content;
      } catch {
        // Non-fatal: skip files we couldn't read.
      }
    }),
  );

  return {
    meta: {
      owner,
      repo,
      defaultBranch,
      commitSha,
      treeSha,
      description: repoRes.data.description ?? null,
      stars: repoRes.data.stargazers_count ?? 0,
      homepage: repoRes.data.homepage || null,
      primaryLanguage: repoRes.data.language ?? null,
      truncated: Boolean(treeRes.data.truncated),
    },
    tree,
    files,
  };
}

async function fetchFileContent(
  gh: ReturnType<typeof createGitHubClient>,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<string | null> {
  const res = await gh.repos.getContent({ owner, repo, path, ref });
  const data = res.data as { content?: string; encoding?: string; size?: number };
  if (!data.content) return null;
  // Skip very large blobs (>200KB) to keep things lean.
  if ((data.size ?? 0) > 200_000) return null;
  const buff = Buffer.from(data.content, (data.encoding as BufferEncoding) || "base64");
  return buff.toString("utf-8");
}

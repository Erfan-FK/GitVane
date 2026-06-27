export interface ParsedRepo {
  owner: string;
  repo: string;
}

/**
 * Accepts any of:
 *   - owner/repo
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo.git
 *   - git@github.com:owner/repo.git
 *   - github.com/owner/repo/tree/main/...
 * Returns null if it can't confidently extract owner + repo.
 */
export function parseRepoInput(input: string): ParsedRepo | null {
  if (!input) return null;
  let s = input.trim();

  // Strip protocol + known hosts
  s = s.replace(/^git@github\.com:/i, "");
  s = s.replace(/^https?:\/\//i, "");
  s = s.replace(/^(www\.)?github\.com\//i, "");

  // Drop query string / hash
  s = s.split("?")[0].split("#")[0];

  // Now expect owner/repo[/...]
  const parts = s.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const owner = sanitizeSegment(parts[0]);
  let repo = sanitizeSegment(parts[1]);
  repo = repo.replace(/\.git$/i, "");

  if (!owner || !repo) return null;
  if (!isValidSegment(owner) || !isValidSegment(repo)) return null;

  return { owner, repo };
}

function sanitizeSegment(seg: string): string {
  return seg.trim();
}

function isValidSegment(seg: string): boolean {
  // GitHub allows alphanumerics, hyphens, underscores, and dots.
  return /^[A-Za-z0-9._-]+$/.test(seg);
}

export function repoSlug(owner: string, repo: string): string {
  return `${owner}/${repo}`;
}

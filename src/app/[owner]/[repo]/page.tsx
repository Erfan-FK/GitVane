import { redirect } from "next/navigation";

/**
 * Deep-link shortcut: swap "github.com/owner/repo" for "gitvane.com/owner/repo"
 * (i.e. replace the "hub" in github with "vane") to jump straight into an
 * analysis. This root-level segment only matches unknown two-part paths —
 * static routes like /docs, /pricing, /auth/* take priority — so it acts as a
 * catch-all that forwards into the canonical /result view, preserving any
 * gitingest-style scope query params.
 */
export default async function RepoShortcut(props: PageProps<"/[owner]/[repo]">) {
  const { owner, repo } = await props.params;
  const searchParams = await props.searchParams;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }
  const query = qs.toString();

  // Strip a trailing ".git" some users paste from clone URLs.
  const cleanRepo = repo.replace(/\.git$/i, "");
  redirect(`/result/${owner}/${cleanRepo}${query ? `?${query}` : ""}`);
}

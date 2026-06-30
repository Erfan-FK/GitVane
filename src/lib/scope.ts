import type { TreeEntry } from "@/lib/github/fetch-repo";

/**
 * gitingest-style scoping options that control WHICH repo files feed the
 * profiler. All fields are optional; an empty/undefined scope analyzes the
 * whole tree (the default behavior).
 */
export interface ScopeOptions {
  /** Glob patterns; if non-empty, only matching paths are kept. */
  include?: string[];
  /** Glob patterns; matching paths are dropped (applied after include). */
  exclude?: string[];
  /** File extensions to keep (without the leading dot), e.g. ["ts","tsx"]. */
  fileTypes?: string[];
  /** Drop blobs larger than this many KB. 0/undefined disables the limit. */
  maxFileSizeKb?: number;
}

export const EMPTY_SCOPE: ScopeOptions = {};

export function isScopeEmpty(scope?: ScopeOptions | null): boolean {
  if (!scope) return true;
  return (
    !scope.include?.length &&
    !scope.exclude?.length &&
    !scope.fileTypes?.length &&
    !scope.maxFileSizeKb
  );
}

/** Convert a glob (supporting `*`, `**`, `?`) into an anchored RegExp. */
function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        // `**` matches across path separators
        re += ".*";
        i++;
        if (glob[i + 1] === "/") i++; // consume trailing slash of `**/`
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else if ("\\^$.|+()[]{}".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp(`^${re}$`, "i");
}

function matchesAny(path: string, globs: string[]): boolean {
  return globs.some((g) => {
    const trimmed = g.trim();
    if (!trimmed) return false;
    // A bare pattern with no slash should match by basename too.
    const re = globToRegExp(trimmed);
    if (re.test(path)) return true;
    if (!trimmed.includes("/")) {
      const base = path.split("/").pop() ?? path;
      return re.test(base);
    }
    return false;
  });
}

function extOf(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
}

/** Apply scope to a flat tree listing. Directories are always retained. */
export function applyScopeToTree(tree: TreeEntry[], scope?: ScopeOptions | null): TreeEntry[] {
  if (isScopeEmpty(scope)) return tree;
  const s = scope as ScopeOptions;
  const include = (s.include ?? []).filter(Boolean);
  const exclude = (s.exclude ?? []).filter(Boolean);
  const types = (s.fileTypes ?? []).map((t) => t.replace(/^\./, "").toLowerCase()).filter(Boolean);
  const maxBytes = s.maxFileSizeKb ? s.maxFileSizeKb * 1024 : 0;

  return tree.filter((entry) => {
    if (entry.type !== "blob") return true; // keep trees for structure
    if (include.length && !matchesAny(entry.path, include)) return false;
    if (exclude.length && matchesAny(entry.path, exclude)) return false;
    if (types.length && !types.includes(extOf(entry.path))) return false;
    if (maxBytes && entry.size > maxBytes) return false;
    return true;
  });
}

/** Stable string used to disambiguate cache entries by scope. */
export function scopeCacheKey(scope?: ScopeOptions | null): string {
  if (isScopeEmpty(scope)) return "";
  const s = scope as ScopeOptions;
  const norm = {
    include: [...(s.include ?? [])].map((x) => x.trim()).filter(Boolean).sort(),
    exclude: [...(s.exclude ?? [])].map((x) => x.trim()).filter(Boolean).sort(),
    fileTypes: [...(s.fileTypes ?? [])].map((x) => x.replace(/^\./, "").toLowerCase()).sort(),
    maxFileSizeKb: s.maxFileSizeKb ?? 0,
  };
  return JSON.stringify(norm);
}

/** Parse comma/newline/space separated patterns from a textarea/input. */
export function parsePatternList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Serialize scope into URL search params (omitting empty fields). */
export function scopeToSearchParams(scope: ScopeOptions): URLSearchParams {
  const sp = new URLSearchParams();
  if (scope.include?.length) sp.set("include", scope.include.join(","));
  if (scope.exclude?.length) sp.set("exclude", scope.exclude.join(","));
  if (scope.fileTypes?.length) sp.set("types", scope.fileTypes.join(","));
  if (scope.maxFileSizeKb) sp.set("maxKb", String(scope.maxFileSizeKb));
  return sp;
}

/** Parse scope from a plain object of URL search params. */
export function scopeFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): ScopeOptions {
  const get = (k: string): string | undefined => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const scope: ScopeOptions = {};
  const include = get("include");
  const exclude = get("exclude");
  const types = get("types");
  const maxKb = get("maxKb");
  if (include) scope.include = parsePatternList(include);
  if (exclude) scope.exclude = parsePatternList(exclude);
  if (types) scope.fileTypes = parsePatternList(types);
  if (maxKb && Number(maxKb) > 0) scope.maxFileSizeKb = Number(maxKb);
  return scope;
}

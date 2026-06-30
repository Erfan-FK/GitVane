"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseRepoInput } from "@/lib/github/parse";
import {
  parsePatternList,
  scopeToSearchParams,
  type ScopeOptions,
} from "@/lib/scope";
import { ArrowRight, LoaderCircle, Search, SlidersHorizontal } from "lucide-react";

const EXAMPLES = [
  "vercel/next.js",
  "shadcn-ui/ui",
  "honojs/hono",
  "t3-oss/create-t3-app",
];

export function RepoInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [fileTypes, setFileTypes] = useState("");
  const [maxKb, setMaxKb] = useState("");

  function buildScope(): ScopeOptions {
    const scope: ScopeOptions = {};
    const inc = parsePatternList(include);
    const exc = parsePatternList(exclude);
    const types = parsePatternList(fileTypes).map((t) => t.replace(/^\./, ""));
    const kb = Number(maxKb);
    if (inc.length) scope.include = inc;
    if (exc.length) scope.exclude = exc;
    if (types.length) scope.fileTypes = types;
    if (kb > 0) scope.maxFileSizeKb = kb;
    return scope;
  }

  function submit(raw: string) {
    const parsed = parseRepoInput(raw);
    if (!parsed) {
      setError("Enter a valid GitHub repo, e.g. owner/repo or a github.com URL.");
      return;
    }
    setError(null);
    const qs = scopeToSearchParams(buildScope()).toString();
    const href = `/result/${parsed.owner}/${parsed.repo}${qs ? `?${qs}` : ""}`;
    startTransition(() => router.push(href));
  }

  const hasScope = Boolean(include || exclude || fileTypes || maxKb);

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:border-foreground/30 focus-within:shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="flex items-center gap-2 px-3 py-2.5"
        >
          <Search className="ml-1 size-5 shrink-0 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://github.com/owner/repo"
            aria-label="GitHub repository URL"
            className="h-11 border-0 bg-transparent px-1 text-base shadow-none focus-visible:ring-0"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          <Button type="submit" size="lg" className="shrink-0" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                Analyze
                <ArrowRight />
              </>
            )}
          </Button>
        </form>

        {/* Connected footer row: examples + advanced toggle, flush with input */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 pb-2.5 text-sm">
          <span className="text-xs text-muted-foreground">Try</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setValue(ex);
                submit(ex);
              }}
              className="rounded-md px-1.5 py-0.5 font-mono text-xs text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
            >
              {ex}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            aria-expanded={advancedOpen}
            className={
              "ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs transition-colors hover:bg-accent " +
              (hasScope || advancedOpen
                ? "text-foreground"
                : "text-muted-foreground")
            }
          >
            <SlidersHorizontal className="size-3.5" />
            Advanced
            {hasScope && (
              <span className="size-1.5 rounded-full bg-foreground" aria-hidden />
            )}
          </button>
        </div>

        {advancedOpen && (
          <div className="grid gap-3 border-t border-border/70 bg-muted/30 p-4 text-left sm:grid-cols-2">
            <ScopeField
              label="Include"
              hint="Globs, comma-separated"
              placeholder="src/**, packages/*/src/**"
              value={include}
              onChange={setInclude}
            />
            <ScopeField
              label="Exclude"
              hint="Globs, comma-separated"
              placeholder="**/*.test.ts, dist/**"
              value={exclude}
              onChange={setExclude}
            />
            <ScopeField
              label="File types"
              hint="Extensions, comma-separated"
              placeholder="ts, tsx, py"
              value={fileTypes}
              onChange={setFileTypes}
            />
            <ScopeField
              label="Max file size"
              hint="In KB (blank = no limit)"
              placeholder="200"
              value={maxKb}
              onChange={setMaxKb}
              inputMode="numeric"
            />
          </div>
        )}
      </div>

      {error && <p className="mt-2 px-1 text-sm text-foreground/80">{error}</p>}
    </div>
  );
}

function ScopeField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "numeric";
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        spellCheck={false}
        autoComplete="off"
        className="h-9 rounded-md bg-background font-mono text-xs"
      />
    </label>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseRepoInput } from "@/lib/github/parse";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";

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

  function submit(raw: string) {
    const parsed = parseRepoInput(raw);
    if (!parsed) {
      setError("Enter a valid GitHub repo, e.g. owner/repo or a github.com URL.");
      return;
    }
    setError(null);
    startTransition(() => {
      router.push(`/result/${parsed.owner}/${parsed.repo}`);
    });
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="group relative flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-foreground/30"
      >
        <Search className="ml-2 size-5 shrink-0 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://github.com/owner/repo"
          aria-label="GitHub repository URL"
          className="h-11 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
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
              Analyze Repo
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <div className="mt-3 flex min-h-5 items-center justify-between gap-3 px-1 text-sm">
        {error ? (
          <p className="text-foreground/80">{error}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
            <span className="text-xs uppercase tracking-wide">Try</span>
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
          </div>
        )}
      </div>
    </div>
  );
}

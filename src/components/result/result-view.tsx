"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/types";
import { buildFileTree } from "@/lib/file-tree";
import { ScoreCard } from "@/components/result/score-card";
import { FileTree } from "@/components/result/file-tree";
import { FilePreview } from "@/components/result/file-preview";
import { DownloadButton } from "@/components/result/download-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GithubIcon } from "@/components/icons/github";
import { Star, Sparkles, Database, Zap } from "lucide-react";

export function ResultView({ result }: { result: AnalysisResult }) {
  const { profile, score, files } = result;
  const tree = useMemo(() => buildFileTree(files), [files]);
  const [selected, setSelected] = useState(files[0]?.path ?? "");
  const selectedFile = files.find((f) => f.path === selected) ?? files[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      {/* Repo header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {profile.owner}/{profile.repo}
            </h1>
            <a
              href={`https://github.com/${profile.owner}/${profile.repo}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Open on GitHub"
            >
              <GithubIcon width={18} height={18} />
            </a>
          </div>
          {profile.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {profile.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {profile.stars > 0 && (
              <Badge variant="muted" className="gap-1">
                <Star className="size-3" /> {formatStars(profile.stars)}
              </Badge>
            )}
            {profile.frameworks.slice(0, 3).map((f) => (
              <Badge key={f} variant="outline">
                {f}
              </Badge>
            ))}
            {profile.packageManager !== "unknown" && (
              <Badge variant="outline">{profile.packageManager}</Badge>
            )}
            {profile.database.slice(0, 2).map((d) => (
              <Badge key={d} variant="outline" className="gap-1">
                <Database className="size-3" /> {d}
              </Badge>
            ))}
            {result.usedLLM ? (
              <Badge variant="muted" className="gap-1">
                <Sparkles className="size-3" /> AI-enriched
              </Badge>
            ) : (
              <Badge variant="muted" className="gap-1">
                <Zap className="size-3" /> Fast scan
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DownloadButton files={files} repo={profile.repo} />
        </div>
      </div>

      {/* Score */}
      <div className="mb-6">
        <ScoreCard score={score} />
        {score.missing.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Missing:{" "}
            <span className="text-foreground">{score.missing.join(", ")}</span>. GitVane
            generated {files.length} files to fix this.
          </p>
        )}
      </div>

      {/* Tree + preview */}
      <Card className="grid grid-cols-1 overflow-hidden p-0 md:grid-cols-[260px_1fr]">
        <div className="border-b border-border bg-muted/30 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Generated files
            </span>
            <Badge variant="muted">{files.length}</Badge>
          </div>
          <FileTree root={tree} selected={selected} onSelect={setSelected} />
        </div>
        <div className="min-h-[520px]">
          {selectedFile && <FilePreview file={selectedFile} />}
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Add these files to your repo, then commit them. Want to go deeper?{" "}
        <Link href="/pricing" className="underline underline-offset-2 hover:text-foreground">
          Deep Analyze
        </Link>{" "}
        is coming soon.
      </p>
    </div>
  );
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

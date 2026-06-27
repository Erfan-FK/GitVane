"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GeneratedFile } from "@/lib/types";
import { CopyButton } from "@/components/result/copy-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, Sparkles } from "lucide-react";

export function FilePreview({ file }: { file: GeneratedFile }) {
  const [view, setView] = useState<"rendered" | "raw">("rendered");
  const isMarkdown = file.path.endsWith(".md") || file.path.endsWith(".mdc");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-mono text-sm">{file.path}</span>
          {file.source !== "template" && (
            <Badge variant="muted" className="hidden gap-1 sm:inline-flex">
              <Sparkles className="size-3" /> AI-enriched
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isMarkdown && (
            <div className="flex items-center rounded-md border border-border p-0.5 text-xs">
              <button
                onClick={() => setView("rendered")}
                className={cn(
                  "rounded px-2 py-1 transition-colors",
                  view === "rendered"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Preview
              </button>
              <button
                onClick={() => setView("raw")}
                className={cn(
                  "rounded px-2 py-1 transition-colors",
                  view === "raw"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Raw
              </button>
            </div>
          )}
          <CopyButton text={file.content} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        {isMarkdown && view === "rendered" ? (
          <div className="gv-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{file.content}</ReactMarkdown>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-foreground/90">
            {file.content}
          </pre>
        )}
      </div>
    </div>
  );
}

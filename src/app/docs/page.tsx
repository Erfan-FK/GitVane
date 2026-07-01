import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FILE_CATALOG, type FileDoc, type IconKey } from "@/lib/file-catalog";
import { Reveal } from "@/components/docs/reveal";
import { BeforeAfter } from "@/components/site/before-after";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  TriangleAlert,
  Palette,
  Network,
  KeyRound,
  Database,
  Settings2,
  BookMarked,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  ClaudeLogo,
  CopilotLogo,
  CursorLogo,
  WindsurfLogo,
} from "@/components/brand/tool-logos";
import { cn } from "@/lib/utils";

function FileIcon({ iconKey, className }: { iconKey: IconKey; className?: string }) {
  switch (iconKey) {
    case "claude":
      return <ClaudeLogo className={className} />;
    case "copilot":
      return <CopilotLogo className={className} />;
    case "cursor":
      return <CursorLogo className={className} />;
    case "windsurf":
      return <WindsurfLogo className={className} />;
    default: {
      const map: Record<string, LucideIcon> = {
        agents: BookMarked,
        llms: Sparkles,
        validation: ShieldCheck,
        failure: TriangleAlert,
        design: Palette,
        api: Network,
        auth: KeyRound,
        database: Database,
        env: Settings2,
      };
      const Icon = map[iconKey] ?? FileText;
      return <Icon className={className} />;
    }
  }
}

export const metadata: Metadata = {
  title: "Docs",
  description:
    "What each file GitVane generates is for, why it matters, and how it helps AI coding agents.",
};

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-4xl px-5 py-14">
          <header className="mb-10">
            <Badge variant="outline" className="mb-4">
              Documentation
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight">
              The files GitVane generates
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Each file has a job: to give AI coding agents the context they need to
              work correctly in your repo. Here&apos;s what every file does, why it
              matters, and when it&apos;s generated.
            </p>
          </header>

          <Reveal>
            <div className="mb-10" data-reveal>
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                Why these files matter
              </div>
              <BeforeAfter />
            </div>

            <LlmsExplainer />

            <SectionHeading
              title="Universal files"
              sub="Read by every AI agent and LLM, regardless of editor."
            />
            <div className="space-y-4">
              {FILE_CATALOG.filter((d) => UNIVERSAL.has(d.path)).map((doc) => (
                <div key={doc.path} data-reveal>
                  <DocCard doc={doc} />
                </div>
              ))}
            </div>

            <SectionHeading
              title="Editor-specific files"
              sub="Tuned to where each tool looks for its instructions."
            />
            <div className="space-y-4">
              {FILE_CATALOG.filter((d) => EDITOR.has(d.path)).map((doc) => (
                <div key={doc.path} data-reveal>
                  <DocCard doc={doc} />
                </div>
              ))}
            </div>

            <SectionHeading
              title="Deep files"
              sub="Generated automatically when GitVane detects frontend, backend, auth, a database, or environment variables."
            />
            <div className="space-y-4">
              {FILE_CATALOG.filter((d) => !UNIVERSAL.has(d.path) && !EDITOR.has(d.path)).map(
                (doc) => (
                  <div key={doc.path} data-reveal>
                    <DocCard doc={doc} />
                  </div>
                ),
              )}
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** Files read by any agent/LLM vs. files tuned to a specific editor. */
const UNIVERSAL = new Set([
  "AGENTS.md",
  "llms.txt",
  "docs/validation.md",
  "docs/failure-modes.md",
]);
const EDITOR = new Set([
  "CLAUDE.md",
  ".github/copilot-instructions.md",
  ".cursor/rules/project.mdc",
  ".windsurf/rules/project.md",
]);

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4 mt-12" data-reveal>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function LlmsExplainer() {
  return (
    <Card className="mb-2 border-sky-500/30 bg-sky-500/5 p-6" data-reveal>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-sky-500/30 bg-background text-sky-500">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h3 className="text-base font-semibold">
            What is <code className="font-mono">llms.txt</code>?
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            An emerging open standard (
            <span className="font-mono">llmstxt.org</span>): a single
            Markdown file at the repo root that gives any LLM a curated,
            link-rich map of the project — so a model can orient itself fast
            instead of crawling every file. GitVane generates one for you
            automatically.
          </p>
        </div>
      </div>
    </Card>
  );
}

function DocCard({ doc, dimmed }: { doc: FileDoc; dimmed?: boolean }) {
  return (
    <Card className={dimmed ? "p-5 opacity-75" : "p-5"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-md border border-border bg-muted/40",
              doc.accent,
            )}
          >
            <FileIcon iconKey={doc.iconKey} className="size-4" />
          </span>
          <div>
            <code className="text-sm font-medium">{doc.path}</code>
            <div className="mt-0.5 text-xs text-muted-foreground">{doc.title}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {doc.tier === "premium" ? (
            <Badge className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3" />
              Premium
            </Badge>
          ) : (
            <Badge variant="muted">Free</Badge>
          )}
          <Badge variant="muted">{doc.tool}</Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Purpose" value={doc.purpose} />
        <Field label="Why it helps" value={doc.why} />
      </div>

      {doc.sample && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <SampleBlock label="Free (templated)" tone="muted" value={doc.sample.free} />
          <SampleBlock label="Premium (deep)" tone="premium" value={doc.sample.premium} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ArrowRight className="size-3" />
        {doc.when}
      </div>
    </Card>
  );
}

function SampleBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "premium";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        tone === "premium"
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border bg-muted/30",
      )}
    >
      <div
        className={cn(
          "mb-1 text-[10px] font-medium uppercase tracking-wide",
          tone === "premium"
            ? "text-amber-600 dark:text-amber-400"
            : "text-muted-foreground",
        )}
      >
        {label}
      </div>
      <p className="text-xs leading-relaxed text-foreground/80">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <p className="mt-1 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FILE_CATALOG, STAGE2_CATALOG, type FileDoc } from "@/lib/file-catalog";
import { FileText, ArrowRight } from "lucide-react";

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

          <div className="space-y-4">
            {FILE_CATALOG.map((doc) => (
              <DocCard key={doc.path} doc={doc} />
            ))}
          </div>

          <h2 className="mb-4 mt-14 text-2xl font-semibold tracking-tight">
            Coming soon: specialized files
          </h2>
          <p className="mb-6 max-w-2xl text-muted-foreground">
            Deep Analyze will add path-scoped instructions and deeper docs derived
            from your code&apos;s structure.
          </p>
          <div className="space-y-4">
            {STAGE2_CATALOG.map((doc) => (
              <DocCard key={doc.path} doc={doc} dimmed />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function DocCard({ doc, dimmed }: { doc: FileDoc; dimmed?: boolean }) {
  return (
    <Card className={dimmed ? "p-5 opacity-75" : "p-5"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-muted/40">
            <FileText className="size-4" />
          </span>
          <div>
            <code className="text-sm font-medium">{doc.path}</code>
            <div className="mt-0.5 text-xs text-muted-foreground">{doc.title}</div>
          </div>
        </div>
        <Badge variant="muted" className="shrink-0">
          {doc.tool}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Purpose" value={doc.purpose} />
        <Field label="Why it helps" value={doc.why} />
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ArrowRight className="size-3" />
        {doc.when}
      </div>
    </Card>
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

import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RepoInput } from "@/components/landing/repo-input";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-16">
        <div className="pointer-events-none absolute inset-0 gv-grid-bg" aria-hidden />
        <div
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          style={{ animation: "gv-fade-up 0.6s ease-out both" }}
        >
          <Badge variant="outline" className="mb-6 gap-1.5 py-1 pl-1.5 pr-3">
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-foreground text-background">
              <Sparkles className="size-2.5" />
            </span>
            repo → agent operating files
          </Badge>

          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
            Make any repo
            <br />
            <span className="text-muted-foreground">agent-ready.</span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Generate AGENTS.md, Copilot instructions, Cursor rules, validation
            runbooks, design rules, and API maps from any GitHub repository — so
            you stop explaining your repo to AI tools every time.
          </p>

          <div className="mt-9 w-full max-w-xl">
            <RepoInput />
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            Works with public repos · No sign-in required
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

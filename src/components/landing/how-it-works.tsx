"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BeforeAfter } from "@/components/site/before-after";
import { useGsapContext, prefersReducedMotion } from "@/lib/use-gsap";
import {
  ClaudeLogo,
  CopilotLogo,
  CursorLogo,
  WindsurfLogo,
} from "@/components/brand/tool-logos";
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";

interface StepText {
  n: string;
  title: string;
  body: string;
}

const STEPS: StepText[] = [
  {
    n: "01",
    title: "Copy a repo from GitHub",
    body: "Grab any public repository URL — yours or someone else's. No sign-in, no install.",
  },
  {
    n: "02",
    title: "Paste it into GitVane",
    body: "Drop the URL in and hit Analyze. GitVane scans the file tree and key config files.",
  },
  {
    n: "03",
    title: "Get the score and the files",
    body: "An Agent Readiness Score plus AGENTS.md, llms.txt, editor rules, validation and more — commands pulled straight from your repo.",
  },
  {
    n: "04",
    title: "Drop them into your editor",
    body: "Commit the files. Every future AI session starts already understanding your repo.",
  },
];

const REPO_URL = "https://github.com/vercel/next.js";

export function HowItWorks() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  return (
    <div className="w-full">
      <header className="mx-auto w-full max-w-3xl px-5 pb-8 pt-16 text-center">
        <Badge variant="outline" className="mb-4">
          How it works
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Watch a repo become agent-ready
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Copy a GitHub link, paste it into GitVane, get the operating files your
          AI agents actually read — generated once, useful in every session after.
        </p>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5">
        {reduced ? <StaticDemo /> : <LoopDemo />}
      </div>

      {/* Compact step legend */}
      <div className="mx-auto mt-10 grid w-full max-w-4xl gap-3 px-5 sm:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-lg border border-border bg-card p-4">
            <div className="font-mono text-xs text-muted-foreground">{s.n}</div>
            <div className="mt-1 text-sm font-semibold">{s.title}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      <Differentiator />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Looping, auto-playing product demo (single GSAP timeline)          */
/* ------------------------------------------------------------------ */

const FILES = [
  { name: "AGENTS.md", icon: <FileText className="size-3.5 text-emerald-500" /> },
  { name: "llms.txt", icon: <Sparkles className="size-3.5 text-sky-500" /> },
  { name: "CLAUDE.md", icon: <ClaudeLogo className="size-3.5 text-orange-500" /> },
  { name: ".cursor/rules", icon: <CursorLogo className="size-3.5" /> },
  { name: "copilot", icon: <CopilotLogo className="size-3.5" /> },
  { name: ".windsurf/rules", icon: <WindsurfLogo className="size-3.5 text-teal-500" /> },
];

function LoopDemo() {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const urlRef = useRef<HTMLSpanElement>(null);

  const scope = useGsapContext(({ gsap }) => {
    const root = scope.current!;
    const q = gsap.utils.selector(root);
    const stage = q(".gv-stage")[0] as HTMLElement;
    const cursor = q(".gv-cursor")[0] as HTMLElement;
    const ripple = q(".gv-ripple")[0] as HTMLElement;
    const ghScreen = q(".gv-screen-gh")[0] as HTMLElement;
    const appScreen = q(".gv-screen-app")[0] as HTMLElement;
    const copyBtn = q(".gv-copy-btn")[0] as HTMLElement;
    const analyzeBtn = q(".gv-analyze-btn")[0] as HTMLElement;
    const copyLabel = q(".gv-copy-label")[0] as HTMLElement;
    const results = q(".gv-results")[0] as HTMLElement;
    const loading = q(".gv-loading")[0] as HTMLElement;
    const chips = q(".gv-chip");

    // Position helper: center of an element, relative to the stage.
    const center = (el: HTMLElement) => {
      const s = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
    };

    const url = REPO_URL;
    const typed = { n: 0 };

    function reset() {
      gsap.set(ghScreen, { autoAlpha: 1 });
      gsap.set(appScreen, { autoAlpha: 0 });
      gsap.set(results, { autoAlpha: 0 });
      gsap.set(loading, { autoAlpha: 0 });
      gsap.set(chips, { autoAlpha: 0, y: 8 });
      gsap.set(copyLabel, { textContent: "Copy URL" });
      typed.n = 0;
      if (urlRef.current) urlRef.current.textContent = "";
      if (scoreRef.current) scoreRef.current.textContent = "0";
      const c = center(copyBtn);
      gsap.set(cursor, { x: c.x - 60, y: c.y + 90, autoAlpha: 1 });
    }

    function click(label: string) {
      const tl = gsap.timeline();
      tl.to(cursor, { scale: 0.85, duration: 0.08, ease: "power2.out" }, label)
        .set(ripple, { autoAlpha: 0.5, scale: 0.3 }, label)
        .to(ripple, { scale: 3, autoAlpha: 0, duration: 0.5, ease: "power2.out" }, label)
        .to(cursor, { scale: 1, duration: 0.18, ease: "back.out(2.2)" }, `${label}+=0.09`);
      return tl;
    }

    reset();

    const moveTo = (el: HTMLElement, dur = 0.7) => {
      const p = center(el);
      return { x: p.x, y: p.y, duration: dur, ease: "power3.inOut" };
    };

    const master = gsap.timeline({ repeat: -1, repeatDelay: 1, defaults: { ease: "power3.out" } });

    master
      // 1. Move to the GitHub copy button and click.
      .to(cursor, moveTo(copyBtn), "+=0.4")
      .add(click("copy"), ">-0.1")
      .set(copyLabel, { textContent: "Copied!" }, ">")
      .to({}, { duration: 0.5 })
      // 2. Crossfade to the GitVane app.
      .to(ghScreen, { autoAlpha: 0, duration: 0.4 })
      .to(appScreen, { autoAlpha: 1, duration: 0.4 }, "<0.1")
      // move cursor toward the search field
      .to(cursor, moveTo(urlRef.current!.parentElement as HTMLElement, 0.6), "<")
      // 3. Type the URL (constant speed).
      .to(typed, {
        n: url.length,
        duration: 1.1,
        ease: "none",
        onUpdate: () => {
          if (urlRef.current) urlRef.current.textContent = url.slice(0, Math.round(typed.n));
        },
      })
      // 4. Move to Analyze and click.
      .to(cursor, moveTo(analyzeBtn, 0.5), "+=0.2")
      .add(click("analyze"), ">-0.1")
      // 5. Loading.
      .to(loading, { autoAlpha: 1, duration: 0.3 }, ">")
      .to({}, { duration: 0.9 })
      .to(loading, { autoAlpha: 0, duration: 0.3 })
      // 6. Reveal results + count the score + stagger file chips.
      .to(results, { autoAlpha: 1, duration: 0.4 })
      .to(
        { v: 0 },
        {
          v: 92,
          duration: 1,
          ease: "power1.out",
          onUpdate: function () {
            if (scoreRef.current)
              scoreRef.current.textContent = String(Math.round(this.targets()[0].v));
          },
        },
        "<",
      )
      .to(chips, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3 }, "<0.2")
      // 7. Hold, then fade out and reset for the loop.
      .to({}, { duration: 2.4 })
      .to([appScreen, cursor], { autoAlpha: 0, duration: 0.5 })
      .add(() => reset());
  }, []);

  return (
    <div ref={scope}>
      <div className="gv-stage relative mx-auto aspect-[4/3] w-full max-w-2xl sm:aspect-[16/10]">
        {/* GitHub screen */}
        <div className="gv-screen-gh absolute inset-0">
          <BrowserChrome url="github.com/vercel/next.js" label="GitHub">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold sm:text-base">vercel / next.js</div>
                <div className="text-xs text-muted-foreground">The React Framework</div>
              </div>
              <div className="gv-copy-btn inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background">
                <Copy className="size-3.5" />
                <span className="gv-copy-label">Copy URL</span>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              {["app/", "packages/", "docs/", "package.json"].map((f) => (
                <div key={f} className="font-mono text-xs text-muted-foreground">
                  {f}
                </div>
              ))}
            </div>
          </BrowserChrome>
        </div>

        {/* GitVane app screen */}
        <div className="gv-screen-app absolute inset-0">
          <BrowserChrome url="gitvane.app" label="GitVane">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate font-mono text-xs sm:text-sm">
                <span ref={urlRef} />
                <span className="gv-caret">|</span>
              </span>
              <span className="gv-analyze-btn inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background">
                Analyze <ArrowRight className="size-3" />
              </span>
            </div>

            <div className="gv-loading absolute inset-x-5 top-1/2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Analyzing repository…
            </div>

            <div className="gv-results mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Readiness
                </div>
                <div className="flex items-baseline">
                  <span ref={scoreRef} className="text-3xl font-semibold tabular-nums">
                    0
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {FILES.map((f) => (
                  <div
                    key={f.name}
                    className="gv-chip flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5"
                  >
                    {f.icon}
                    <span className="truncate font-mono text-[11px]">{f.name}</span>
                    <Check className="ml-auto size-3 text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </BrowserChrome>
        </div>

        {/* Fake cursor */}
        <div className="gv-cursor pointer-events-none absolute left-0 top-0 z-20 -ml-1 -mt-1">
          <div className="gv-ripple absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/30 opacity-0" />
          <svg viewBox="0 0 24 24" className="size-5 drop-shadow-sm" aria-hidden>
            <path
              d="M5 3l14 7-6 2-2 6-6-15z"
              className="fill-foreground stroke-background"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function BrowserChrome({
  url,
  children,
  label,
}: {
  url: string;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0 shadow-md">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <div className="ml-2 flex-1 truncate rounded-md border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
          {url}
        </div>
        {label && (
          <span className="hidden text-[10px] uppercase tracking-wide text-muted-foreground sm:block">
            {label}
          </span>
        )}
      </div>
      <div className="relative flex-1 p-5">{children}</div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Static fallback (reduced motion / no JS)                            */
/* ------------------------------------------------------------------ */

function StaticDemo() {
  return (
    <div className="mx-auto max-w-2xl">
      <BrowserChrome url="gitvane.app" label="GitVane">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <span className="flex-1 truncate font-mono text-xs sm:text-sm">
            {REPO_URL}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background">
            Analyze <ArrowRight className="size-3" />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {FILES.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5"
            >
              {f.icon}
              <span className="truncate font-mono text-[11px]">{f.name}</span>
              <Check className="ml-auto size-3 text-emerald-500" />
            </div>
          ))}
        </div>
      </BrowserChrome>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Why GitVane is different + Free/Pro + comparison                    */
/* ------------------------------------------------------------------ */

function Differentiator() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-20">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Not a one-time summary. Operating files that live in the repo.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Most tools turn a repo into a diagram or a chat you throw away. GitVane
          commits persistent agent files that keep helping every future AI session.
        </p>
      </div>

      <BeforeAfter />

      <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
        <Card className="p-6">
          <Badge variant="muted" className="mb-3">
            Free
          </Badge>
          <p className="text-sm text-muted-foreground">
            Deterministic, facts-only files generated from your repo — no API key
            needed. Score, AGENTS.md, llms.txt, editor rules, validation and
            failure-mode guides.
          </p>
        </Card>
        <Card className="border-amber-500/30 p-6">
          <Badge className="mb-3 gap-1 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="size-3" />
            Pro
          </Badge>
          <p className="text-sm text-muted-foreground">
            LLM-written, repo-specific prose on every file, plus specialized
            outputs: design-system, api-map, auth-flow, path-scoped rules, and deep
            analysis.
          </p>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            Analyze a repo <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/docs">See the files</Link>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Search,
  ShieldCheck,
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
    body: "Drop the URL into the search bar and hit Analyze. GitVane scans the file tree and key config files.",
  },
  {
    n: "03",
    title: "Get an Agent Readiness Score",
    body: "A facts-first scan detects your stack and scores how ready the repo is for AI agents — and what's missing.",
  },
  {
    n: "04",
    title: "Generate the agent files",
    body: "AGENTS.md, llms.txt, Cursor / Copilot / Windsurf rules, validation and failure-mode docs — commands pulled straight from your repo.",
  },
  {
    n: "05",
    title: "Drop them into your editor",
    body: "Commit the files. Every future AI session in Cursor, Claude Code, Copilot or Windsurf starts already understanding your repo.",
  },
];

export function HowItWorks() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  return (
    <div className="w-full">
      <header className="mx-auto w-full max-w-3xl px-5 pb-4 pt-16 text-center">
        <Badge variant="outline" className="mb-4">
          How it works
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Watch a repo become agent-ready
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          From a GitHub link to operating files your AI agents actually read —
          generated once, useful in every session after.
        </p>
      </header>

      {reduced ? <StaticStory /> : <ScrollStory />}

      <Differentiator />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Animated, scroll-scrubbed story                                     */
/* ------------------------------------------------------------------ */

function ScrollStory() {
  const progressRef = useRef<HTMLDivElement>(null);

  const scope = useGsapContext(({ gsap }) => {
    const scenes = gsap.utils.toArray<HTMLElement>(".gv-scene");
    const labels = gsap.utils.toArray<HTMLElement>(".gv-step-label");

    // All scenes start hidden except the first.
    gsap.set(scenes, { autoAlpha: 0, y: 24 });
    gsap.set(scenes[0], { autoAlpha: 1, y: 0 });
    gsap.set(labels, { opacity: 0.35 });
    gsap.set(labels[0], { opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".gv-story",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
      },
    });

    scenes.forEach((scene, i) => {
      if (i === 0) {
        // Intra-scene reveal for the first scene's inner elements.
        tl.from(scene.querySelectorAll<HTMLElement>("[data-pop]"), {
          autoAlpha: 0,
          y: 12,
          stagger: 0.15,
          duration: 0.4,
        });
        return;
      }
      const prev = scenes[i - 1];
      tl.to(prev, { autoAlpha: 0, y: -24, duration: 0.4 })
        .to(labels[i - 1], { opacity: 0.35, duration: 0.3 }, "<")
        .to(scene, { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.1")
        .to(labels[i], { opacity: 1, duration: 0.3 }, "<")
        .from(
          scene.querySelectorAll<HTMLElement>("[data-pop]"),
          { autoAlpha: 0, y: 12, stagger: 0.12, duration: 0.4 },
          "<0.1",
        )
        .to({}, { duration: 0.5 }); // hold
    });

    // Score counter for scene 03.
    const counter = progressRef.current;
    if (counter) {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: 87,
        ease: "none",
        scrollTrigger: {
          trigger: ".gv-scene-score",
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
        onUpdate: () => {
          counter.textContent = String(Math.round(obj.v));
        },
      });
    }
  }, []);

  return (
    <div ref={scope} className="relative">
      {/* Tall scroll track; the panel sticks while we scrub through scenes. */}
      <div className="gv-story relative mx-auto max-w-5xl px-5" style={{ height: "440vh" }}>
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-6">
          {/* step rail */}
          <div className="flex items-center gap-2">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="gv-step-label flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px]"
              >
                {s.n}
              </div>
            ))}
          </div>

          {/* stage */}
          <div className="relative h-[420px] w-full max-w-2xl">
            <SceneShell>
              <SceneCopy />
            </SceneShell>
            <SceneShell>
              <ScenePaste />
            </SceneShell>
            <SceneShell className="gv-scene-score">
              <SceneScore counterRef={progressRef} />
            </SceneShell>
            <SceneShell>
              <SceneFiles />
            </SceneShell>
            <SceneShell>
              <SceneEditor />
            </SceneShell>
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`gv-scene absolute inset-0 flex flex-col items-center justify-center ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/* ---- individual scenes ---- */

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
    <Card className="w-full overflow-hidden p-0">
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
      <div className="p-5">{children}</div>
    </Card>
  );
}

function SceneCopy() {
  return (
    <div className="w-full">
      <p className="mb-3 text-center text-sm font-medium text-muted-foreground" data-pop>
        <span className="font-mono text-xs">01</span> · Copy the repo URL from GitHub
      </p>
      <BrowserChrome url="github.com/vercel/next.js" label="GitHub">
        <div className="flex items-center justify-between gap-3" data-pop>
          <div>
            <div className="text-sm font-semibold">vercel / next.js</div>
            <div className="text-xs text-muted-foreground">
              The React Framework
            </div>
          </div>
          <div
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-foreground px-2.5 py-1.5 text-xs font-medium text-background"
            data-pop
          >
            <Copy className="size-3.5" />
            Copy URL
          </div>
        </div>
      </BrowserChrome>
    </div>
  );
}

function ScenePaste() {
  return (
    <div className="w-full">
      <p className="mb-3 text-center text-sm font-medium text-muted-foreground" data-pop>
        <span className="font-mono text-xs">02</span> · Paste it into GitVane
      </p>
      <Card className="p-2" data-pop>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate font-mono text-sm">
            https://github.com/vercel/next.js
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background">
            Analyze <ArrowRight className="size-3.5" />
          </span>
        </div>
      </Card>
      <div className="mt-3 text-center text-xs text-muted-foreground" data-pop>
        Scanning file tree &amp; config files…
      </div>
    </div>
  );
}

function SceneScore({
  counterRef,
}: {
  counterRef: React.RefObject<HTMLDivElement | null>;
}) {
  const stack = ["Next.js", "TypeScript", "pnpm", "Turbopack", "Vitest"];
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card className="flex flex-col items-center justify-center p-6" data-pop>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Agent Readiness
        </div>
        <div className="mt-1 flex items-baseline">
          <div ref={counterRef} className="text-6xl font-semibold tabular-nums">
            0
          </div>
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
      </Card>
      <Card className="p-5" data-pop>
        <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Detected stack
        </div>
        <div className="flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs"
              data-pop
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground" data-pop>
          Missing: AGENTS.md · Cursor rules · validation guide
        </div>
      </Card>
    </div>
  );
}

function SceneFiles() {
  const files = [
    { name: "AGENTS.md", icon: <FileText className="size-4 text-emerald-500" /> },
    { name: "llms.txt", icon: <Sparkles className="size-4 text-sky-500" /> },
    { name: "CLAUDE.md", icon: <ClaudeLogo className="size-4 text-orange-500" /> },
    { name: ".cursor/rules", icon: <CursorLogo className="size-4" /> },
    { name: "copilot-instructions", icon: <CopilotLogo className="size-4" /> },
    { name: ".windsurf/rules", icon: <WindsurfLogo className="size-4 text-teal-500" /> },
  ];
  return (
    <div className="w-full">
      <p className="mb-3 text-center text-sm font-medium text-muted-foreground" data-pop>
        <span className="font-mono text-xs">04</span> · Generate the agent files
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {files.map((f) => (
          <Card
            key={f.name}
            className="flex items-center gap-2 p-3"
            data-pop
          >
            {f.icon}
            <span className="truncate font-mono text-xs">{f.name}</span>
            <Check className="ml-auto size-3.5 text-emerald-500" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function SceneEditor() {
  return (
    <div className="w-full">
      <p className="mb-3 text-center text-sm font-medium text-muted-foreground" data-pop>
        <span className="font-mono text-xs">05</span> · Drop them into your editor
      </p>
      <BrowserChrome url="cursor · vercel/next.js" label="Cursor">
        <div className="space-y-2" data-pop>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CursorLogo className="size-4" />
            Agent context loaded from AGENTS.md
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs leading-relaxed">
            <span className="text-muted-foreground">You:</span> add a new API
            route
            <br />
            <span className="text-emerald-500">Agent:</span> Using pnpm, App
            Router conventions, and your existing route patterns…
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500" data-pop>
            <ShieldCheck className="size-3.5" />
            No more guessing commands or conventions.
          </div>
        </div>
      </BrowserChrome>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Static fallback (reduced motion / no JS)                            */
/* ------------------------------------------------------------------ */

function StaticStory() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <div className="relative">
        <div
          className="absolute left-[27px] top-2 bottom-2 w-px bg-border sm:left-[31px]"
          aria-hidden
        />
        <div className="space-y-6">
          {STEPS.map((step) => (
            <div key={step.n} className="relative flex gap-4 sm:gap-6">
              <div className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-border bg-background font-mono text-sm sm:size-16">
                {step.n}
              </div>
              <Card className="flex-1 p-5">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Why GitVane is different + Free/Pro                                 */
/* ------------------------------------------------------------------ */

function Differentiator() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-20">
      <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          Not a one-time summary. Operating files that live in the repo.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Most tools turn a repo into a diagram or a chat you throw away.
          GitVane commits persistent agent files that keep helping every future
          AI coding session.
        </p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          <Card className="p-6">
            <Badge variant="muted" className="mb-3">
              Free
            </Badge>
            <p className="text-sm text-muted-foreground">
              Deterministic, facts-only files generated from your repo — no API
              key needed. Score, AGENTS.md, llms.txt, editor rules, validation
              and failure-mode guides.
            </p>
          </Card>
          <Card className="border-amber-500/30 p-6">
            <Badge className="mb-3 gap-1 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3" />
              Pro
            </Badge>
            <p className="text-sm text-muted-foreground">
              LLM-written, repo-specific prose on every file, plus specialized
              outputs: design-system, api-map, auth-flow, path-scoped rules, and
              deep analysis.
            </p>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
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
    </div>
  );
}

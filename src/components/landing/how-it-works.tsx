"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ScanLine,
  Gauge,
  FileText,
  Download,
  type LucideIcon,
} from "lucide-react";

interface Step {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  detail: string[];
}

const STEPS: Step[] = [
  {
    n: "01",
    icon: Search,
    title: "Paste a GitHub repo",
    body: "Drop in a repo URL or owner/repo. No sign-in required for public repos.",
    detail: ["https://github.com/owner/repo", "owner/repo"],
  },
  {
    n: "02",
    icon: ScanLine,
    title: "GitVane analyzes it",
    body: "A fast, facts-first scan reads the file tree and key config files to detect your stack — language, framework, package manager, scripts, frontend/backend, database, tests, and CI.",
    detail: ["Next.js", "TypeScript", "pnpm", "Tailwind", "Prisma", "Vitest"],
  },
  {
    n: "03",
    icon: Gauge,
    title: "See your Agent Readiness Score",
    body: "A 0–100 score shows how ready your repo is for AI agents, plus exactly what's missing.",
    detail: ["No AGENTS.md", "No Cursor rules", "No validation guide"],
  },
  {
    n: "04",
    icon: FileText,
    title: "Preview the generated files",
    body: "Commands and paths come straight from your repo (never guessed); an LLM adds repo-specific prose, then a verification pass strips anything fabricated.",
    detail: ["AGENTS.md", ".cursor/rules", "docs/validation.md"],
  },
  {
    n: "05",
    icon: Download,
    title: "Copy or download",
    body: "Copy a file or download everything as a zip. Commit the files — they keep helping every future AI session.",
    detail: ["Copy file", "Download .zip"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function HowItWorks() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16">
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <Badge variant="outline" className="mb-4">
          How it works
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          From repo to agent-ready in seconds
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          GitVane turns any GitHub repository into the operating files AI coding
          agents need — generated once, useful for every session after.
        </p>
      </motion.header>

      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-[27px] top-2 bottom-2 w-px bg-border sm:left-[31px]" aria-hidden />

        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative flex gap-4 sm:gap-6"
            >
              <div className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-border bg-background sm:size-16">
                <step.icon className="size-6" />
              </div>
              <Card className="flex-1 p-5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{step.n}</span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {step.detail.map((d) => (
                    <span
                      key={d}
                      className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-foreground/70"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="mt-16 rounded-lg border border-border bg-muted/30 p-8 text-center"
      >
        <h2 className="text-xl font-semibold">What makes GitVane different</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Most tools turn a repo into a one-time summary, diagram, or chat context.
          GitVane turns a repo into persistent <strong className="text-foreground">agent
          operating files</strong> that live in the repository and help every future
          AI coding session.
        </p>
      </motion.div>
    </div>
  );
}

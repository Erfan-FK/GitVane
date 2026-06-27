import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "GitVane pricing — start free, go deeper with Pro.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    tagline: "For trying GitVane on public repos.",
    cta: { label: "Analyze a repo", href: "/" },
    highlighted: false,
    features: [
      "Public GitHub repos",
      "Agent Readiness Score",
      "All Stage 1 files (AGENTS.md, Cursor, Copilot, Windsurf, docs)",
      "Copy & download as zip",
      "Fast quick-scan analysis",
    ],
  },
  {
    name: "Pro",
    price: "Soon",
    tagline: "Deep Analyze and specialized outputs.",
    cta: { label: "Coming soon", href: "/", disabled: true },
    highlighted: true,
    features: [
      "Everything in Free",
      "Deep Analyze (AST, monorepo, auth-flow)",
      "Path-scoped Copilot instructions",
      "docs/auth-flow, database, env-vars, component-map",
      "Saved history & re-analysis",
      "Private repos",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-4xl px-5 py-16">
          <header className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">
              Pricing
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Start free. Go deeper when you need to.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              GitVane is free for public repositories. Pro unlocks Deep Analyze and
              specialized, path-scoped outputs.
            </p>
          </header>

          <div className="grid gap-5 sm:grid-cols-2">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={
                  tier.highlighted
                    ? "relative border-foreground/30 p-6 shadow-md"
                    : "p-6"
                }
              >
                {tier.highlighted && (
                  <Badge className="absolute -top-2.5 right-5">Deep Analyze</Badge>
                )}
                <h2 className="text-lg font-semibold">{tier.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                  {tier.price === "$0" && (
                    <span className="text-sm text-muted-foreground">/forever</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>

                <ul className="mt-5 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-foreground text-background">
                        <Check className="size-2.5" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Button
                    asChild={!tier.cta.disabled}
                    disabled={tier.cta.disabled}
                    variant={tier.highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    {tier.cta.disabled ? (
                      <span>{tier.cta.label}</span>
                    ) : (
                      <Link href={tier.cta.href}>{tier.cta.label}</Link>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

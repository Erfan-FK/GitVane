import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const WITHOUT = [
  "Guesses the wrong package manager (npm vs pnpm)",
  "Invents commands that don't exist in the repo",
  "Ignores your conventions and reinvents components",
  "Edits generated files and applied migrations",
  "You re-paste the same context into every chat",
];

const WITH = [
  "Uses the exact install / test / build commands",
  "Follows your stack, structure, and conventions",
  "Reuses existing components and patterns",
  "Knows which files and migrations not to touch",
  "Every session starts already understanding the repo",
];

/**
 * Side-by-side "agent without GitVane" vs "agent with GitVane" comparison —
 * the core persuasion visual for why the generated files matter.
 */
export function BeforeAfter() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border bg-red-500/5 px-4 py-3">
          <span className="grid size-6 place-items-center rounded-full bg-red-500/15 text-red-500">
            <X className="size-3.5" />
          </span>
          <span className="text-sm font-semibold">Agent without GitVane</span>
        </div>
        <ul className="space-y-2.5 p-4">
          {WITHOUT.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
              <X className="mt-0.5 size-4 shrink-0 text-red-500/70" />
              {t}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border bg-emerald-500/5 px-4 py-3">
          <span className="grid size-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
            <Check className="size-3.5" />
          </span>
          <span className="text-sm font-semibold">Agent with GitVane files</span>
        </div>
        <ul className="space-y-2.5 p-4">
          {WITH.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              {t}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

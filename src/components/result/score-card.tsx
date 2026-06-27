import type { ReadinessScore } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X, Minus } from "lucide-react";

function ScoreGauge({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative grid size-32 place-items-center">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-semibold tabular-nums">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function ScoreCard({ score }: { score: ReadinessScore }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex flex-col items-center gap-1">
          <ScoreGauge score={score.score} />
          <span className="text-sm font-medium">Agent Readiness</span>
        </div>

        <div className="w-full flex-1">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {score.items.map((item) => {
              const state = !item.applicable
                ? "na"
                : item.present
                  ? "yes"
                  : "no";
              return (
                <li key={item.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full",
                      state === "yes" && "bg-foreground text-background",
                      state === "no" && "border border-border text-muted-foreground",
                      state === "na" && "text-muted-foreground/50",
                    )}
                  >
                    {state === "yes" && <Check className="size-2.5" />}
                    {state === "no" && <X className="size-2.5" />}
                    {state === "na" && <Minus className="size-2.5" />}
                  </span>
                  <span
                    className={cn(
                      state === "na" && "text-muted-foreground/60 line-through",
                      state === "no" && "text-foreground",
                      state === "yes" && "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Card>
  );
}

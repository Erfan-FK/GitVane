import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl px-5 py-8">
          <div className="mb-6 flex items-center gap-3">
            <Skeleton className="h-8 w-64" />
          </div>
          <Card className="mb-6 flex items-center gap-8 p-6">
            <Skeleton className="size-32 rounded-full" />
            <div className="flex-1 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-3/4" />
              ))}
            </div>
          </Card>
          <Card className="grid grid-cols-1 overflow-hidden p-0 md:grid-cols-[260px_1fr]">
            <div className="space-y-2 border-r border-border p-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
            <div className="grid min-h-[520px] place-items-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <LoaderCircle className="size-6 animate-spin" />
                <p className="text-sm">Analyzing repository and generating agent files…</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

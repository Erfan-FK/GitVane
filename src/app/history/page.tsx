import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listUserAnalyses } from "@/lib/history";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { History as HistoryIcon, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "History",
  description: "Your past GitVane analyses.",
};

export default async function HistoryPage() {
  if (!isSupabaseConfigured()) redirect("/");
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await listUserAnalyses();

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-5 py-12">
          <div className="mb-8 flex items-center gap-2.5">
            <HistoryIcon className="size-5" />
            <h1 className="text-2xl font-semibold tracking-tight">Your analyses</h1>
          </div>

          {items.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t analyzed any repos yet.
              </p>
              <Button asChild size="sm">
                <Link href="/">Analyze a repo</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {items.map((item) => (
                <Link key={item.id} href={`/result/${item.owner}/${item.repo}`}>
                  <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-accent/50">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {item.owner}/{item.repo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {item.score != null && (
                        <Badge variant="muted">{item.score}/100</Badge>
                      )}
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

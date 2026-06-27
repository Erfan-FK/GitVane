"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TriangleAlert, RotateCw } from "lucide-react";

export default function ResultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <div className="grid size-12 place-items-center rounded-full border border-border text-muted-foreground">
        <TriangleAlert className="size-6" />
      </div>
      <h1 className="mt-5 text-xl font-semibold">Couldn&apos;t analyze this repo</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || "Something went wrong while fetching or analyzing the repository."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={reset}>
          <RotateCw />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function ResultNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <div className="grid size-12 place-items-center rounded-full border border-border text-muted-foreground">
        <SearchX className="size-6" />
      </div>
      <h1 className="mt-5 text-xl font-semibold">Repository not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t find this repository, or it&apos;s private. GitVane currently
        supports public GitHub repos.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/">Analyze another repo</Link>
        </Button>
      </div>
    </main>
  );
}

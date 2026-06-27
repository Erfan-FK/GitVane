import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { GithubIcon } from "@/components/icons/github";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="size-4" />
          <span>GitVane</span>
          <span className="text-border">·</span>
          <span>Make any repo agent-ready.</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <a
            href="https://github.com/Erfan-FK/GitVane"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <GithubIcon />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

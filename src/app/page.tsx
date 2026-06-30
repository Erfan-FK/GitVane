import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RepoInput } from "@/components/landing/repo-input";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-16">
        <div className="pointer-events-none absolute inset-0 gv-grid-bg" aria-hidden />
        <div
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center"
          style={{ animation: "gv-fade-up 0.6s ease-out both" }}
        >
          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
            Make any repo
            <br />
            <span className="text-muted-foreground">agent-ready.</span>
          </h1>

          <p className="mt-5 text-balance text-base text-muted-foreground sm:text-lg">
            Generate the files AI agents need to understand your repo.
          </p>

          <div className="mt-9 w-full max-w-xl">
            <RepoInput />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

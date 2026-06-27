import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Card } from "@/components/ui/card";
import { LogoMark } from "@/components/brand/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to GitVane with GitHub to save your analysis history.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-16">
        <Card className="w-full max-w-sm p-8">
          <div className="flex flex-col items-center text-center">
            <div className="grid size-12 place-items-center rounded-xl bg-foreground text-background">
              <LogoMark className="size-7" />
            </div>
            <h1 className="mt-4 text-xl font-semibold tracking-tight">
              Sign in to GitVane
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Save your analysis history and unlock more.
            </p>
          </div>

          <div className="mt-6">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            No account needed to analyze public repos.{" "}
            <Link href="/" className="underline underline-offset-2 hover:text-foreground">
              Try it
            </Link>
            .
          </p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}

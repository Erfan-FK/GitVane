import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { HowItWorks } from "@/components/landing/how-it-works";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How GitVane turns a GitHub repository into agent-ready operating files in seconds.",
};

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <HowItWorks />
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "GitVane — Make any repo agent-ready",
    template: "%s · GitVane",
  },
  description:
    "GitVane analyzes a GitHub repo and generates the instruction files AI coding agents need: AGENTS.md, Copilot instructions, Cursor rules, validation runbooks, design rules, and API maps.",
  keywords: [
    "AGENTS.md",
    "AI coding agents",
    "Cursor rules",
    "GitHub Copilot",
    "Claude",
    "repo instructions",
  ],
  openGraph: {
    title: "GitVane — Make any repo agent-ready",
    description:
      "Generate AGENTS.md, Copilot instructions, Cursor rules, validation runbooks, design rules, and API maps from any GitHub repository.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

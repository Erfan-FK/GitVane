import type { RawRepoData, TreeEntry } from "@/lib/github/fetch-repo";
import { RepoProfileSchema, type RepoProfile, type ScriptCommand } from "@/lib/types";

interface PackageJson {
  name?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
  engines?: Record<string, string>;
}

const EXT_LANGUAGE: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript",
  js: "JavaScript",
  jsx: "JavaScript",
  mjs: "JavaScript",
  cjs: "JavaScript",
  py: "Python",
  rb: "Ruby",
  go: "Go",
  rs: "Rust",
  java: "Java",
  php: "PHP",
  css: "CSS",
  scss: "SCSS",
  vue: "Vue",
  svelte: "Svelte",
  astro: "Astro",
};

export function buildRepoProfile(raw: RawRepoData): RepoProfile {
  const { meta, tree, files } = raw;
  const paths = tree.map((t) => t.path);
  const pathSet = new Set(paths);
  const blobs = tree.filter((t) => t.type === "blob");

  const pkg = parseJson<PackageJson>(files["package.json"]);
  const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
  const hasDep = (name: string) => name in deps;

  const packageManager = detectPackageManager(pkg, pathSet);
  const languages = detectLanguages(blobs);
  const frameworks = detectFrameworks(deps, pathSet);
  const runtime = detectRuntime(pkg, pathSet);

  const scripts = pkg?.scripts ?? {};
  const allScripts: ScriptCommand[] = Object.entries(scripts).map(([name, raw]) => ({
    name,
    raw,
  }));
  const mappedScripts = mapScripts(scripts, packageManager);

  const { hasFrontend, frontendDirs } = detectFrontend(deps, paths);
  const { hasBackend, backendDirs, apiRoutes } = detectBackend(deps, paths);

  const styling = detectStyling(deps, pathSet, blobs);
  const uiLibraries = detectUiLibraries(deps, pathSet);
  const { database, ormFiles } = detectDatabase(deps, paths);
  const testing = detectTesting(deps, pathSet);
  const ci = detectCi(paths);
  const monorepo = detectMonorepo(pkg, pathSet, paths);
  const envVars = detectEnvVars(files);

  const existingAgentFiles = detectExistingAgentFiles(pathSet);
  const hasReadme = pathSet.has("README.md") || pathSet.has("readme.md");
  const notableDirs = topLevelDirs(tree);

  const riskNotes = buildRiskNotes({
    packageManager,
    database,
    deps,
    pathSet,
    paths,
    apiRoutes,
  });

  const profile: RepoProfile = {
    owner: meta.owner,
    repo: meta.repo,
    defaultBranch: meta.defaultBranch,
    commitSha: meta.commitSha,
    description: meta.description,
    stars: meta.stars,
    homepage: meta.homepage,
    primaryLanguage: meta.primaryLanguage,

    languages,
    packageManager,
    frameworks,
    runtime,

    scripts: mappedScripts,
    allScripts,

    hasFrontend,
    hasBackend,
    frontendDirs,
    backendDirs,
    apiRoutes,

    styling,
    uiLibraries,
    database,
    ormFiles,
    testing,
    ci,
    monorepo,
    envVars,

    existingAgentFiles,
    hasReadme,
    riskNotes,
    notableDirs,
  };

  // Validate / coerce defaults via Zod before returning.
  return RepoProfileSchema.parse(profile);
}

function parseJson<T>(content: string | undefined): T | null {
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function detectPackageManager(
  pkg: PackageJson | null,
  pathSet: Set<string>,
): RepoProfile["packageManager"] {
  if (pkg?.packageManager) {
    const pm = pkg.packageManager.split("@")[0];
    if (pm === "pnpm" || pm === "yarn" || pm === "npm" || pm === "bun") return pm;
  }
  if (pathSet.has("pnpm-lock.yaml")) return "pnpm";
  if (pathSet.has("bun.lockb") || pathSet.has("bun.lock")) return "bun";
  if (pathSet.has("yarn.lock")) return "yarn";
  if (pathSet.has("package-lock.json")) return "npm";
  return "unknown";
}

function detectLanguages(blobs: TreeEntry[]): string[] {
  const counts: Record<string, number> = {};
  for (const b of blobs) {
    const ext = b.path.split(".").pop()?.toLowerCase();
    if (!ext) continue;
    const lang = EXT_LANGUAGE[ext];
    if (lang) counts[lang] = (counts[lang] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang)
    .slice(0, 6);
}

function detectFrameworks(deps: Record<string, string>, pathSet: Set<string>): string[] {
  const fw: string[] = [];
  const add = (name: string) => {
    if (!fw.includes(name)) fw.push(name);
  };

  if ("next" in deps) add("Next.js");
  if ("@remix-run/react" in deps || "@remix-run/node" in deps) add("Remix");
  if ("@sveltejs/kit" in deps) add("SvelteKit");
  if ("nuxt" in deps) add("Nuxt");
  if ("astro" in deps) add("Astro");
  if ("gatsby" in deps) add("Gatsby");
  if ("expo" in deps) add("Expo");
  if ("react-native" in deps) add("React Native");
  if ("react" in deps && fw.length === 0) add("React");
  else if ("react" in deps && !fw.includes("Next.js")) add("React");
  if ("vue" in deps && !fw.includes("Nuxt")) add("Vue");
  if ("svelte" in deps && !fw.includes("SvelteKit")) add("Svelte");
  if ("@angular/core" in deps) add("Angular");

  // Backend frameworks
  if ("express" in deps) add("Express");
  if ("fastify" in deps) add("Fastify");
  if ("@nestjs/core" in deps) add("NestJS");
  if ("hono" in deps) add("Hono");
  if ("koa" in deps) add("Koa");
  if ("@hapi/hapi" in deps) add("Hapi");

  // Build tools
  if ("vite" in deps && !fw.some((f) => ["SvelteKit", "Nuxt", "Astro"].includes(f))) {
    add("Vite");
  }

  // From config files
  if ((pathSet.has("next.config.js") || pathSet.has("next.config.ts") || pathSet.has("next.config.mjs")) && !fw.includes("Next.js")) {
    add("Next.js");
  }

  return fw;
}

function detectRuntime(pkg: PackageJson | null, pathSet: Set<string>): string | null {
  if (pathSet.has("deno.json") || pathSet.has("deno.jsonc")) return "Deno";
  if (pathSet.has("bun.lockb") || pathSet.has("bun.lock")) return "Bun";
  if (pkg?.engines?.node) return `Node.js ${pkg.engines.node}`;
  if (pkg) return "Node.js";
  return null;
}

function mapScripts(
  scripts: Record<string, string>,
  pm: RepoProfile["packageManager"],
): RepoProfile["scripts"] {
  const runner = pm === "unknown" ? "npm run" : pm === "npm" ? "npm run" : `${pm} run`;
  const installCmd =
    pm === "unknown" ? "npm install" : pm === "npm" ? "npm install" : `${pm} install`;

  const find = (...names: string[]): string | null => {
    for (const n of names) {
      if (scripts[n]) return `${runner} ${n}`;
    }
    return null;
  };

  return {
    install: installCmd,
    dev: find("dev", "start:dev", "develop", "serve"),
    build: find("build"),
    lint: find("lint", "eslint"),
    test: find("test", "test:unit"),
    typecheck: find("typecheck", "type-check", "tsc", "check-types"),
    format: find("format", "prettier"),
    start: find("start"),
  };
}

function detectFrontend(deps: Record<string, string>, paths: string[]): {
  hasFrontend: boolean;
  frontendDirs: string[];
} {
  const dirs = new Set<string>();
  const fewIndicators = [
    "src/app",
    "src/pages",
    "src/components",
    "app",
    "pages",
    "components",
  ];
  for (const d of fewIndicators) {
    if (paths.some((p) => p === d || p.startsWith(`${d}/`))) dirs.add(d);
  }
  const hasUiDep =
    "react" in deps || "vue" in deps || "svelte" in deps || "@angular/core" in deps;
  const hasComponentFiles = paths.some((p) => /\.(tsx|jsx|vue|svelte)$/.test(p));
  const hasFrontend = hasUiDep || hasComponentFiles || dirs.size > 0;
  return { hasFrontend, frontendDirs: Array.from(dirs) };
}

function detectBackend(deps: Record<string, string>, paths: string[]): {
  hasBackend: boolean;
  backendDirs: string[];
  apiRoutes: string[];
} {
  const dirs = new Set<string>();
  const apiRoutes: string[] = [];

  // Next.js app router route handlers
  for (const p of paths) {
    if (/(^|\/)app\/.*route\.(ts|js)$/.test(p)) {
      apiRoutes.push(p);
      dirs.add("app/api");
    }
    if (/(^|\/)pages\/api\//.test(p) && /\.(ts|js)$/.test(p)) {
      apiRoutes.push(p);
      dirs.add("pages/api");
    }
  }

  const backendDepNames = [
    "express",
    "fastify",
    "@nestjs/core",
    "hono",
    "koa",
    "@hapi/hapi",
    "apollo-server",
    "graphql-yoga",
  ];
  const hasBackendDep = backendDepNames.some((d) => d in deps);

  const serverDirs = ["server", "src/server", "api", "src/api", "controllers", "src/controllers", "routes", "src/routes"];
  for (const d of serverDirs) {
    if (paths.some((p) => p === d || p.startsWith(`${d}/`))) dirs.add(d);
  }

  const hasBackend = hasBackendDep || apiRoutes.length > 0 || dirs.size > 0;
  return {
    hasBackend,
    backendDirs: Array.from(dirs),
    apiRoutes: apiRoutes.slice(0, 40),
  };
}

function detectStyling(
  deps: Record<string, string>,
  pathSet: Set<string>,
  blobs: TreeEntry[],
): string[] {
  const styles: string[] = [];
  const hasTailwindConfig =
    pathSet.has("tailwind.config.js") ||
    pathSet.has("tailwind.config.ts") ||
    pathSet.has("tailwind.config.cjs") ||
    pathSet.has("tailwind.config.mjs");
  if ("tailwindcss" in deps || hasTailwindConfig) styles.push("Tailwind CSS");
  if (pathSet.has("components.json")) styles.push("shadcn/ui");
  if ("styled-components" in deps) styles.push("styled-components");
  if ("@emotion/react" in deps || "@emotion/styled" in deps) styles.push("Emotion");
  if ("sass" in deps || blobs.some((b) => /\.scss$/.test(b.path))) styles.push("Sass");
  if (blobs.some((b) => /\.module\.css$/.test(b.path))) styles.push("CSS Modules");
  return styles;
}

function detectUiLibraries(deps: Record<string, string>, pathSet: Set<string>): string[] {
  const libs: string[] = [];
  if (pathSet.has("components.json")) libs.push("shadcn/ui");
  if (Object.keys(deps).some((d) => d.startsWith("@radix-ui/"))) libs.push("Radix UI");
  if ("@mui/material" in deps) libs.push("MUI");
  if ("antd" in deps) libs.push("Ant Design");
  if ("@mantine/core" in deps) libs.push("Mantine");
  if ("@chakra-ui/react" in deps) libs.push("Chakra UI");
  if ("lucide-react" in deps || "lucide" in deps) libs.push("Lucide icons");
  if ("framer-motion" in deps || "motion" in deps) libs.push("Framer Motion");
  return libs;
}

function detectDatabase(deps: Record<string, string>, paths: string[]): {
  database: string[];
  ormFiles: string[];
} {
  const database: string[] = [];
  const ormFiles: string[] = [];

  const prismaSchema = paths.find((p) => p.endsWith("prisma/schema.prisma") || p === "schema.prisma");
  if ("@prisma/client" in deps || "prisma" in deps || prismaSchema) {
    database.push("Prisma");
    if (prismaSchema) ormFiles.push(prismaSchema);
  }
  if ("drizzle-orm" in deps) {
    database.push("Drizzle");
    const dz = paths.find((p) => /drizzle\.config\.(ts|js)$/.test(p));
    if (dz) ormFiles.push(dz);
  }
  if ("@supabase/supabase-js" in deps || paths.some((p) => p.startsWith("supabase/"))) {
    database.push("Supabase");
  }
  if ("mongoose" in deps) database.push("Mongoose");
  if ("typeorm" in deps) database.push("TypeORM");
  if ("sequelize" in deps) database.push("Sequelize");
  if ("kysely" in deps) database.push("Kysely");
  if ("pg" in deps && database.length === 0) database.push("PostgreSQL (pg)");

  return { database, ormFiles };
}

function detectTesting(deps: Record<string, string>, pathSet: Set<string>): string[] {
  const t: string[] = [];
  if ("vitest" in deps) t.push("Vitest");
  if ("jest" in deps) t.push("Jest");
  if ("@playwright/test" in deps || "playwright" in deps) t.push("Playwright");
  if ("cypress" in deps) t.push("Cypress");
  if ("mocha" in deps) t.push("Mocha");
  if (Object.keys(deps).some((d) => d.startsWith("@testing-library/"))) {
    t.push("Testing Library");
  }
  return t;
}

function detectCi(paths: string[]): string[] {
  const ci: string[] = [];
  const workflows = paths.filter(
    (p) => p.startsWith(".github/workflows/") && /\.ya?ml$/.test(p),
  );
  if (workflows.length) ci.push("GitHub Actions");
  if (paths.includes(".gitlab-ci.yml")) ci.push("GitLab CI");
  if (paths.some((p) => p.startsWith(".circleci/"))) ci.push("CircleCI");
  return ci;
}

function detectMonorepo(
  pkg: PackageJson | null,
  pathSet: Set<string>,
  paths: string[],
): boolean {
  if (pathSet.has("pnpm-workspace.yaml")) return true;
  if (pathSet.has("turbo.json")) return true;
  if (pathSet.has("nx.json")) return true;
  if (pkg?.workspaces) return true;
  const hasPackagesDir = paths.some((p) => p.startsWith("packages/"));
  const hasAppsDir = paths.some((p) => p.startsWith("apps/"));
  return hasPackagesDir && hasAppsDir;
}

function detectEnvVars(files: Record<string, string>): string[] {
  const content = files[".env.example"] || files[".env.sample"];
  if (!content) return [];
  const vars: string[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=/);
    if (match) vars.push(match[1]);
  }
  return Array.from(new Set(vars)).slice(0, 60);
}

function detectExistingAgentFiles(pathSet: Set<string>): string[] {
  const candidates = [
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
    ".github/copilot-instructions.md",
    ".cursorrules",
    ".cursor/rules/project.mdc",
    ".windsurfrules",
    "docs/validation.md",
    "docs/design-system.md",
    "docs/api-map.md",
    "docs/failure-modes.md",
  ];
  const found = candidates.filter((c) => pathSet.has(c));
  // dynamic matches
  for (const p of pathSet) {
    if (p.startsWith(".cursor/rules/") && p.endsWith(".mdc")) found.push(p);
    if (p.startsWith(".github/instructions/") && p.endsWith(".instructions.md")) found.push(p);
    if (p.startsWith(".windsurf/rules/")) found.push(p);
  }
  return Array.from(new Set(found));
}

function topLevelDirs(tree: TreeEntry[]): string[] {
  const dirs = tree
    .filter((t) => t.type === "tree" && !t.path.includes("/"))
    .map((t) => t.path)
    .filter((d) => !d.startsWith("."));
  return dirs.slice(0, 20);
}

function buildRiskNotes(args: {
  packageManager: RepoProfile["packageManager"];
  database: string[];
  deps: Record<string, string>;
  pathSet: Set<string>;
  paths: string[];
  apiRoutes: string[];
}): string[] {
  const { packageManager, database, deps, pathSet, paths, apiRoutes } = args;
  const notes: string[] = [];

  if (packageManager !== "unknown") {
    const others = ["npm", "yarn", "pnpm", "bun"].filter((p) => p !== packageManager);
    notes.push(
      `This repo uses ${packageManager}. Do not use ${others.join("/")} — it will create a conflicting lockfile.`,
    );
  }
  if (database.includes("Prisma")) {
    notes.push("Do not hand-edit generated Prisma client code; change schema.prisma and re-run generate/migrate instead.");
  }
  if (database.includes("Drizzle")) {
    notes.push("Do not hand-edit generated Drizzle migration files; change the schema and regenerate.");
  }
  if (paths.some((p) => /migrations?\//.test(p))) {
    notes.push("Be careful with database migration files — do not modify already-applied migrations.");
  }
  const hasMiddleware =
    pathSet.has("middleware.ts") ||
    pathSet.has("middleware.js") ||
    pathSet.has("src/middleware.ts");
  const hasAuth = Object.keys(deps).some((d) =>
    /next-auth|@auth\/|@clerk|@supabase\/auth|lucia|passport/.test(d),
  );
  if (hasMiddleware && hasAuth) {
    notes.push("Do not bypass the auth middleware; protected routes rely on it.");
  }
  if (apiRoutes.length > 0) {
    notes.push("Preserve existing API response shapes; clients depend on them.");
  }
  if (paths.some((p) => /\.(tsx|jsx)$/.test(p)) && (pathSet.has("middleware.ts") || apiRoutes.length > 0)) {
    notes.push("Do not import server-only code into client components.");
  }
  notes.push("Do not edit generated/build output (e.g. dist/, build/, .next/, out/).");

  return notes;
}

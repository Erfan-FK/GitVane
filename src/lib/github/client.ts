import { Octokit } from "@octokit/rest";
import dns from "node:dns";
import { ProxyAgent, setGlobalDispatcher } from "undici";

// On some Windows/dual-stack networks, Node's fetch (undici) hangs trying an
// IPv6 address for api.github.com. Prefer IPv4 to avoid connect timeouts.
dns.setDefaultResultOrder("ipv4first");

// Node's global fetch (undici) does NOT honor system/HTTP(S)_PROXY settings.
// If a proxy is configured via env, route all outbound requests through it so
// the GitHub API is reachable behind a corporate proxy or VPN client.
const PROXY_URL =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;

if (PROXY_URL) {
  setGlobalDispatcher(new ProxyAgent(PROXY_URL));
}

/**
 * Creates an Octokit client. Uses the optional per-request token (a logged-in
 * user's OAuth token) first, then falls back to the server GITHUB_TOKEN, then
 * to unauthenticated access (subject to the 60 req/hr limit).
 */
export function createGitHubClient(token?: string | null): Octokit {
  const auth = token || process.env.GITHUB_TOKEN || undefined;
  return new Octokit({
    auth,
    userAgent: "gitvane/0.1",
  });
}

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
  }
}

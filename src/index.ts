import * as platforms from "./platforms";
import type { VersionResult } from "./platforms";
import { NotFoundError } from "./platforms";
import { HOMEPAGE } from "./homepage";

export interface CacheStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface Env {
  VERSIONS?: CacheStore;
}

type Handler = (params: string[]) => Promise<VersionResult>;

const routes: [RegExp, string, Handler][] = [
  [/^\/v1\/pypi\/(.+)$/, "pypi", ([pkg]) => platforms.pypi(pkg)],
  [/^\/v1\/npm\/(.+)$/, "npm", ([pkg]) => platforms.npm(pkg)],
  [/^\/v1\/github\/([^/]+)\/([^/]+)$/, "github", ([u, r]) => platforms.github(u, r)],
  [/^\/v1\/docker\/([^/]+)\/([^/]+)$/, "docker", ([u, i]) => platforms.docker(u, i)],
  [/^\/v1\/jetbrains\/(.+)$/, "jetbrains", ([p]) => platforms.jetbrains(p)],
  [/^\/v1\/helm\/([^/]+)\/([^/]+)$/, "helm", ([r, c]) => platforms.helm(r, c)],
  [/^\/v1\/crates\/(.+)$/, "crates", ([n]) => platforms.crates(n)],
  [/^\/v1\/go\/(.+)$/, "go", ([m]) => platforms.go(m)],
  [/^\/v1\/homebrew\/(.+)$/, "homebrew", ([f]) => platforms.homebrew(f)],
  [/^\/v1\/rubygems\/(.+)$/, "rubygems", ([g]) => platforms.rubygems(g)],
  [/^\/v1\/nuget\/(.+)$/, "nuget", ([p]) => platforms.nuget(p)],
  [/^\/v1\/packagist\/([^/]+)\/([^/]+)$/, "packagist", ([v, p]) => platforms.packagist(v, p)],
  [/^\/v1\/aur\/(.+)$/, "aur", ([p]) => platforms.aur(p)],
  [/^\/v1\/maven\/([^/]+)\/([^/]+)$/, "maven", ([g, a]) => platforms.maven(g, a)],
  [/^\/v1\/artifacthub\/([^/]+)\/([^/]+)\/([^/]+)$/, "artifacthub", ([k, r, p]) => platforms.artifacthub(k, r, p)],
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const MAX_PARAM_LEN = 256;
const SAFE_PARAM = /^[\w.@\/-]+$/;

function validateParams(params: string[]): boolean {
  return params.every(
    (p) => p.length > 0 && p.length <= MAX_PARAM_LEN && SAFE_PARAM.test(p) && !p.includes(".."),
  );
}

function json(data: unknown, status = 200, cache = false): Response {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...CORS };
  if (cache) headers["Cache-Control"] = "public, s-maxage=3600, max-age=300";
  return new Response(JSON.stringify(data, null, 2) + "\n", { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/health") {
      return json({ status: "ok" });
    }

    if (path === "/" || path === "") {
      return new Response(HOMEPAGE, {
        headers: { "Content-Type": "text/html", ...CORS },
      });
    }

    if (path === "/v1") {
      const platformList = routes.map(([, name]) => name);
      return json({ platforms: platformList });
    }

    for (const [pattern, , handler] of routes) {
      const match = path.match(pattern);
      if (!match) continue;
      const params = match.slice(1);

      if (!validateParams(params)) {
        return json({ error: "Invalid parameter" }, 400);
      }

      // Check cache
      if (env.VERSIONS) {
        const cached = await env.VERSIONS.get(path);
        if (cached) return json(JSON.parse(cached), 200, true);
      }

      try {
        const result = await handler(params);
        if (env.VERSIONS) {
          await env.VERSIONS.put(path, JSON.stringify(result), { expirationTtl: 3600 });
        }
        return json(result, 200, true);
      } catch (err: unknown) {
        if (err instanceof NotFoundError) {
          return json({ error: err.message }, 404);
        }
        return json({ error: "Upstream request failed" }, 502);
      }
    }

    return json({ error: "Not found" }, 404);
  },
};

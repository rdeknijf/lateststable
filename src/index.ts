import * as platforms from "./platforms";
import type { VersionResult } from "./platforms";
import { NotFoundError } from "./platforms";

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

const HOMEPAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>lateststable.org</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 640px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fafafa;
    }
    @media (prefers-color-scheme: dark) {
      body { color: #e0e0e0; background: #1a1a1a; }
      a { color: #6cb6ff; }
      .example { background: #1e1e1e; border-color: #333; }
    }
    h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.25rem; }
    .tagline { color: #666; margin-bottom: 2rem; }
    @media (prefers-color-scheme: dark) { .tagline { color: #999; } }
    h2 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 0.75rem; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .platforms { list-style: none; margin-bottom: 1rem; }
    .platforms li { margin-bottom: 0.35rem; font-size: 0.95rem; }
    .platforms .name { font-weight: 600; display: inline-block; min-width: 100px; }
    .example {
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 2rem;
      overflow-x: auto;
    }
    .example pre { font-size: 0.85rem; line-height: 1.5; color: #e0e0e0; }
    footer { color: #999; font-size: 0.85rem; }
  </style>
</head>
<body>
  <h1>lateststable.org</h1>
  <p class="tagline">Free JSON API for the latest stable version of anything.</p>

  <h2>Platforms</h2>
  <ul class="platforms">
    <li><span class="name">PyPI</span> <a href="/v1/pypi/fastapi">/v1/pypi/{package}</a></li>
    <li><span class="name">npm</span> <a href="/v1/npm/express">/v1/npm/{package}</a></li>
    <li><span class="name">GitHub</span> <a href="/v1/github/denoland/deno">/v1/github/{user}/{repo}</a></li>
    <li><span class="name">Docker</span> <a href="/v1/docker/library/nginx">/v1/docker/{user}/{image}</a></li>
    <li><span class="name">Crates.io</span> <a href="/v1/crates/serde">/v1/crates/{crate}</a></li>
    <li><span class="name">Go</span> <a href="/v1/go/golang.org/x/text">/v1/go/{module}</a></li>
    <li><span class="name">Homebrew</span> <a href="/v1/homebrew/jq">/v1/homebrew/{formula}</a></li>
    <li><span class="name">RubyGems</span> <a href="/v1/rubygems/rails">/v1/rubygems/{gem}</a></li>
    <li><span class="name">NuGet</span> <a href="/v1/nuget/Newtonsoft.Json">/v1/nuget/{package}</a></li>
    <li><span class="name">Packagist</span> <a href="/v1/packagist/laravel/framework">/v1/packagist/{vendor}/{package}</a></li>
    <li><span class="name">Maven</span> <a href="/v1/maven/org.apache.kafka/kafka-clients">/v1/maven/{groupId}/{artifactId}</a></li>
    <li><span class="name">Helm</span> <a href="/v1/helm/bitnami/postgresql">/v1/helm/{repo}/{chart}</a></li>
    <li><span class="name">JetBrains</span> <a href="/v1/jetbrains/IIU">/v1/jetbrains/{product}</a></li>
    <li><span class="name">Artifact Hub</span> <a href="/v1/artifacthub/helm/bitnami/postgresql">/v1/artifacthub/{kind}/{repo}/{package}</a></li>
    <li><span class="name">AUR</span> <a href="/v1/aur/yay">/v1/aur/{package}</a></li>
  </ul>

  <h2>Example</h2>
  <div class="example"><pre>GET /v1/pypi/fastapi

{
  "name": "fastapi",
  "version": "0.115.0",
  "major": "0",
  "minor": "115",
  "patch": "0",
  "date": null,
  "platform": "pypi"
}</pre></div>

  <footer>
    <a href="https://github.com/rdeknijf/lateststable">Source</a>
  </footer>
</body>
</html>`;

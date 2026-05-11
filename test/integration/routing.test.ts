import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import worker from "../../src/index";
import type { Env } from "../../src/index";

const mockFetch = vi.fn();
beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function req(path: string, method = "GET") {
  return new Request(`http://localhost${path}`, { method });
}

const env: Env = {};

describe("CORS", () => {
  it("OPTIONS returns CORS headers", async () => {
    const res = await worker.fetch(req("/v1/pypi/fastapi", "OPTIONS"), env);
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
  });

  it("GET responses include CORS headers", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ info: { version: "0.115.0" } }),
    );

    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("error responses include CORS headers", async () => {
    const res = await worker.fetch(req("/v1/unknown/path"), env);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});

describe("homepage", () => {
  it("GET / returns HTML containing lateststable.org", async () => {
    const res = await worker.fetch(req("/"), env);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/html");
    const body = await res.text();
    expect(body).toContain("lateststable.org");
  });
});

describe("/v1", () => {
  it("returns JSON array of all 14 platform names", async () => {
    const res = await worker.fetch(req("/v1"), env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.platforms).toHaveLength(15);
    expect(data.platforms).toContain("pypi");
    expect(data.platforms).toContain("npm");
    expect(data.platforms).toContain("docker");
    expect(data.platforms).toContain("maven");
  });
});

describe("route matching", () => {
  const routes: [string, string, unknown][] = [
    ["/v1/pypi/requests", "pypi", { info: { version: "2.31.0" } }],
    ["/v1/npm/express", "npm", { "dist-tags": { latest: "4.21.0" } }],
    ["/v1/github/user/repo", "github", { tag_name: "v1.0.0", published_at: "2024-01-01T00:00:00Z" }],
    ["/v1/docker/lib/img", "docker", { results: [{ name: "1.0.0" }] }],
    ["/v1/jetbrains/IIU", "jetbrains", { IIU: [{ version: "2024.1", date: "2024-01-01" }] }],
    ["/v1/helm/bitnami/pg", "helm", { version: "1.0.0" }],
    ["/v1/crates/serde", "crates", { crate: { newest_version: "1.0.0" }, versions: [{ num: "1.0.0", yanked: false }] }],
    ["/v1/go/golang.org/x/text", "go", { Version: "v0.19.0" }],
    ["/v1/homebrew/jq", "homebrew", { versions: { stable: "1.7.1" } }],
    ["/v1/rubygems/rails", "rubygems", { version: "7.2.1" }],
    ["/v1/nuget/Pkg", "nuget", { versions: ["1.0.0"] }],
    ["/v1/packagist/laravel/framework", "packagist", { packages: { "laravel/framework": [{ version: "11.0.0" }] } }],
    ["/v1/aur/yay", "aur", { results: [{ Version: "12.0.0-1" }] }],
    ["/v1/maven/org/art", "maven", { response: { docs: [{ latestVersion: "1.0.0" }] } }],
    ["/v1/artifacthub/helm/bitnami/pg", "artifacthub", { version: "1.0.0" }],
  ];

  it.each(routes)("GET %s returns 200 with platform=%s", async (path, platform, mockBody) => {
    mockFetch.mockResolvedValueOnce(jsonResponse(mockBody));
    const res = await worker.fetch(req(path), env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.platform).toBe(platform);
  });
});

describe("404s", () => {
  it("unknown platform", async () => {
    const res = await worker.fetch(req("/v1/unknown/pkg"), env);
    expect(res.status).toBe(404);
    const data: any = await res.json();
    expect(data.error).toBe("Not found");
  });

  it("random path", async () => {
    const res = await worker.fetch(req("/random/path"), env);
    expect(res.status).toBe(404);
  });

  it("missing params", async () => {
    const res = await worker.fetch(req("/v1/docker/only-one"), env);
    expect(res.status).toBe(404);
  });
});

describe("error propagation", () => {
  it("upstream 404 returns 404 JSON with error", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    const res = await worker.fetch(req("/v1/pypi/nonexistent"), env);
    expect(res.status).toBe(404);
    const data: any = await res.json();
    expect(data.error).toContain("not found on PyPI");
  });
});

describe("response format", () => {
  it("JSON is pretty-printed with trailing newline", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ info: { version: "0.115.0" } }),
    );

    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    const text = await res.text();
    expect(text).toContain("\n");
    expect(text).toMatch(/\n$/);
    expect(text).toContain("  ");
  });
});

describe("health check", () => {
  it("GET /health returns 200 with status ok", async () => {
    const res = await worker.fetch(req("/health"), env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.status).toBe("ok");
  });
});

describe("input validation", () => {
  it("path traversal is neutralized by URL parsing", async () => {
    // new URL() normalizes ../../ so /v1/pypi/../../etc/passwd becomes /etc/passwd
    const res = await worker.fetch(req("/v1/pypi/../../etc/passwd"), env);
    expect(res.status).toBe(404);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects encoded path traversal", async () => {
    const res = await worker.fetch(req("/v1/pypi/..%2f..%2fetc%2fpasswd"), env);
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects params with control characters", async () => {
    const res = await worker.fetch(req("/v1/pypi/pkg%00name"), env);
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects overly long params", async () => {
    const long = "a".repeat(257);
    const res = await worker.fetch(req(`/v1/pypi/${long}`), env);
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("accepts valid package names with dots and hyphens", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ info: { version: "1.0.0" } }),
    );
    const res = await worker.fetch(req("/v1/pypi/my-package.v2"), env);
    expect(res.status).toBe(200);
  });

  it("accepts scoped npm packages", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ "dist-tags": { latest: "1.0.0" } }),
    );
    const res = await worker.fetch(req("/v1/npm/@scope/pkg"), env);
    expect(res.status).toBe(200);
  });
});

describe("upstream failure handling", () => {
  it("returns 502 for unexpected upstream errors", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));
    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    expect(res.status).toBe(502);
    const data: any = await res.json();
    expect(data.error).toBe("Upstream request failed");
  });

  it("does not leak internal error details", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Cannot read properties of undefined"));
    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    expect(res.status).toBe(502);
    const data: any = await res.json();
    expect(data.error).not.toContain("Cannot read");
  });
});

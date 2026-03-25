import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import worker from "../../src/index";
import type { Env, CacheStore } from "../../src/index";

const mockFetch = vi.fn();
beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function req(path: string) {
  return new Request(`http://localhost${path}`);
}

function createCache(): CacheStore {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => { store.set(key, value); }),
  };
}

describe("caching", () => {
  it("cache miss: fetches upstream and stores in cache", async () => {
    const cache = createCache();
    const env: Env = { VERSIONS: cache };

    mockFetch.mockResolvedValueOnce(
      jsonResponse({ info: { version: "0.115.0" } }),
    );

    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    expect(res.status).toBe(200);

    expect(cache.put).toHaveBeenCalledWith(
      "/v1/pypi/fastapi",
      expect.any(String),
      expect.objectContaining({ expirationTtl: 3600 }),
    );

    const storedValue = JSON.parse((cache.put as any).mock.calls[0][1]);
    expect(storedValue.version).toBe("0.115.0");
    expect(storedValue.platform).toBe("pypi");
  });

  it("cache hit: returns cached value without upstream fetch", async () => {
    const cached = {
      name: "fastapi",
      version: "0.114.0",
      major: "0",
      minor: "114",
      patch: "0",
      date: null,
      platform: "pypi",
    };
    const cache: CacheStore = {
      get: vi.fn(async () => JSON.stringify(cached)),
      put: vi.fn(),
    };
    const env: Env = { VERSIONS: cache };

    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.version).toBe("0.114.0");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("cached value matches VersionResult JSON structure", async () => {
    const cache = createCache();
    const env: Env = { VERSIONS: cache };

    mockFetch.mockResolvedValueOnce(
      jsonResponse({ "dist-tags": { latest: "4.21.0" } }),
    );

    await worker.fetch(req("/v1/npm/express"), env);

    const parsed = JSON.parse((cache.put as any).mock.calls[0][1]);
    expect(parsed).toEqual({
      name: "express",
      version: "4.21.0",
      major: "4",
      minor: "21",
      patch: "0",
      date: null,
      platform: "npm",
    });
  });

  it("errors are not cached", async () => {
    const cache = createCache();
    const env: Env = { VERSIONS: cache };

    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    const res = await worker.fetch(req("/v1/pypi/nonexistent"), env);
    expect(res.status).toBe(404);
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("works without cache", async () => {
    const env: Env = {};

    mockFetch.mockResolvedValueOnce(
      jsonResponse({ info: { version: "0.115.0" } }),
    );

    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.version).toBe("0.115.0");
  });
});

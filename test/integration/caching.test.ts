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

function req(path: string) {
  return new Request(`http://localhost${path}`);
}

function createKV(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => { store.set(key, value); }),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

describe("caching", () => {
  it("cache miss: fetches upstream and stores in KV", async () => {
    const kv = createKV();
    const env: Env = { VERSIONS: kv };

    mockFetch.mockResolvedValueOnce(
      jsonResponse({ info: { version: "0.115.0" } }),
    );

    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    expect(res.status).toBe(200);

    expect(kv.put).toHaveBeenCalledWith(
      "/v1/pypi/fastapi",
      expect.any(String),
      expect.objectContaining({ expirationTtl: 3600 }),
    );

    const storedValue = JSON.parse((kv.put as any).mock.calls[0][1]);
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
    const cachedStr = JSON.stringify(cached);
    const kv = {
      get: vi.fn(async () => cachedStr),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      getWithMetadata: vi.fn(),
    } as unknown as KVNamespace;
    const env: Env = { VERSIONS: kv };

    const res = await worker.fetch(req("/v1/pypi/fastapi"), env);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.version).toBe("0.114.0");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("cached value matches VersionResult JSON structure", async () => {
    const kv = createKV();
    const env: Env = { VERSIONS: kv };

    mockFetch.mockResolvedValueOnce(
      jsonResponse({ "dist-tags": { latest: "4.21.0" } }),
    );

    await worker.fetch(req("/v1/npm/express"), env);

    const parsed = JSON.parse((kv.put as any).mock.calls[0][1]);
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
    const kv = createKV();
    const env: Env = { VERSIONS: kv };

    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    const res = await worker.fetch(req("/v1/pypi/nonexistent"), env);
    expect(res.status).toBe(404);
    expect(kv.put).not.toHaveBeenCalled();
  });

  it("works without KV binding", async () => {
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

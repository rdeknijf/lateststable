import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { crates } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("crates", () => {
  it("returns first non-yanked version", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        crate: { newest_version: "1.0.200" },
        versions: [
          { num: "1.0.200", yanked: false, created_at: "2024-03-01T00:00:00Z" },
          { num: "1.0.199", yanked: false },
        ],
      }),
    );

    const res = await crates("serde");
    expect(res).toEqual({
      name: "serde",
      version: "1.0.200",
      major: "1",
      minor: "0",
      patch: "200",
      date: "2024-03-01",
      platform: "crates",
    });
  });

  it("uses max_stable_version over a newer-published backport", async () => {
    // wasmtime: 48.0.8 was published after 50.0.1, so it is newest_version
    // and first in versions[].
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        crate: { newest_version: "48.0.8", max_stable_version: "50.0.1" },
        versions: [
          { num: "48.0.8", yanked: false, created_at: "2026-10-29T00:00:00Z" },
          { num: "50.0.1", yanked: false, created_at: "2026-10-20T00:00:00Z" },
        ],
      }),
    );

    const res = await crates("wasmtime");
    expect(res.version).toBe("50.0.1");
    expect(res.date).toBe("2026-10-20");
  });

  it("skips yanked versions", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        crate: { newest_version: "2.0.0" },
        versions: [
          { num: "2.0.0", yanked: true },
          { num: "1.9.0", yanked: false, created_at: "2024-01-01T00:00:00Z" },
        ],
      }),
    );

    const res = await crates("mycrate");
    expect(res.version).toBe("1.9.0");
  });

  it("falls back to newest_version when all yanked", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        crate: { newest_version: "1.0.0" },
        versions: [
          { num: "1.0.0", yanked: true },
          { num: "0.9.0", yanked: true },
        ],
      }),
    );

    const res = await crates("allyanked");
    expect(res.version).toBe("1.0.0");
    expect(res.date).toBeNull();
  });

  it("handles missing versions array", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ crate: { newest_version: "3.0.0" } }),
    );

    const res = await crates("nocrate");
    expect(res.version).toBe("3.0.0");
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(crates("nope")).rejects.toThrow("Crate 'nope' not found");
  });
});

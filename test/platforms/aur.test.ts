import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { aur } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("aur", () => {
  it("strips pkgrel from version", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ results: [{ Version: "12.4.2-1" }] }),
    );

    const res = await aur("yay");
    expect(res).toEqual({
      name: "yay",
      version: "12.4.2",
      major: "12",
      minor: "4",
      patch: "2",
      date: null,
      platform: "aur",
    });
  });

  it("handles version without dash", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ results: [{ Version: "1.0.0" }] }),
    );

    const res = await aur("pkg");
    expect(res.version).toBe("1.0.0");
  });

  it("handles version with multiple dashes (takes first segment)", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ results: [{ Version: "2.0.0-3-g1234abc" }] }),
    );

    const res = await aur("multi");
    expect(res.version).toBe("2.0.0");
  });

  it("throws on empty results", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ results: [] }));

    await expect(aur("nope")).rejects.toThrow(
      "Package 'nope' not found on AUR",
    );
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(aur("bad")).rejects.toThrow("Package 'bad' not found on AUR");
  });
});

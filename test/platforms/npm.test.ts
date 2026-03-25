import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { npm } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("npm", () => {
  it("returns latest version", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ "dist-tags": { latest: "4.21.0" } }),
    );

    const res = await npm("express");
    expect(res).toEqual({
      name: "express",
      version: "4.21.0",
      major: "4",
      minor: "21",
      patch: "0",
      date: null,
      platform: "npm",
    });
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(npm("nonexistent-pkg-xyz")).rejects.toThrow(
      "Package 'nonexistent-pkg-xyz' not found on npm",
    );
  });
});

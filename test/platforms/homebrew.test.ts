import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { homebrew } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("homebrew", () => {
  it("returns stable version", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ versions: { stable: "1.7.1" } }),
    );

    const res = await homebrew("jq");
    expect(res).toEqual({
      name: "jq",
      version: "1.7.1",
      major: "1",
      minor: "7",
      patch: "1",
      date: null,
      platform: "homebrew",
    });
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(homebrew("nope")).rejects.toThrow("Formula 'nope' not found");
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rubygems } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("rubygems", () => {
  it("returns gem version", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ version: "7.2.1" }));

    const res = await rubygems("rails");
    expect(res).toEqual({
      name: "rails",
      version: "7.2.1",
      major: "7",
      minor: "2",
      patch: "1",
      date: null,
      platform: "rubygems",
    });
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(rubygems("nope")).rejects.toThrow("Gem 'nope' not found");
  });
});

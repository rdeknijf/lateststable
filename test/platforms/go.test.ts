import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { go } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("go", () => {
  it("strips v-prefix and parses date", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ Version: "v0.19.0", Time: "2024-10-01T00:00:00Z" }),
    );

    const res = await go("golang.org/x/text");
    expect(res).toEqual({
      name: "golang.org/x/text",
      version: "0.19.0",
      major: "0",
      minor: "19",
      patch: "0",
      date: "2024-10-01",
      platform: "go",
    });
  });

  it("returns null date when Time is missing", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ Version: "v1.0.0" }));

    const res = await go("example.com/mod");
    expect(res.date).toBeNull();
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(go("no/mod")).rejects.toThrow("Module 'no/mod' not found");
  });
});

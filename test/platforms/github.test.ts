import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { github } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("github", () => {
  it("strips v-prefix and parses date", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        tag_name: "v1.42.0",
        published_at: "2024-03-15T10:00:00Z",
      }),
    );

    const res = await github("denoland", "deno");
    expect(res).toEqual({
      name: "denoland/deno",
      version: "1.42.0",
      major: "1",
      minor: "42",
      patch: "0",
      date: "2024-03-15",
      platform: "github",
    });
  });

  it("works without v-prefix", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ tag_name: "2.0.1", published_at: "2024-01-01T00:00:00Z" }),
    );

    const res = await github("user", "repo");
    expect(res.version).toBe("2.0.1");
  });

  it("returns null date when published_at is missing", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ tag_name: "v3.0.0" }),
    );

    const res = await github("user", "repo");
    expect(res.date).toBeNull();
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(github("user", "nope")).rejects.toThrow(
      "No releases found for 'user/nope'",
    );
  });
});

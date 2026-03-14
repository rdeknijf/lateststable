import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { helm } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("helm", () => {
  it("returns chart version with date", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ version: "15.5.0", created_at: "2024-06-01T12:00:00Z" }),
    );

    const res = await helm("bitnami", "postgresql");
    expect(res).toEqual({
      name: "bitnami/postgresql",
      version: "15.5.0",
      major: "15",
      minor: "5",
      patch: "0",
      date: "2024-06-01",
      platform: "helm",
    });
  });

  it("returns null date when created_at is missing", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ version: "1.0.0" }));

    const res = await helm("repo", "chart");
    expect(res.date).toBeNull();
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(helm("repo", "nope")).rejects.toThrow(
      "Chart 'repo/nope' not found",
    );
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { artifacthub } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("artifacthub", () => {
  it("returns package version with date", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ version: "15.5.0", created_at: "2024-06-01T12:00:00Z" }),
    );

    const res = await artifacthub("helm", "bitnami", "postgresql");
    expect(res).toEqual({
      name: "bitnami/postgresql",
      version: "15.5.0",
      major: "15",
      minor: "5",
      patch: "0",
      date: "2024-06-01",
      platform: "artifacthub",
    });
  });

  it("works with non-helm package types", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ version: "2.1.0", created_at: "2024-03-15T10:00:00Z" }),
    );

    const res = await artifacthub("falco", "security-hub", "falco-rules");
    expect(res).toEqual({
      name: "security-hub/falco-rules",
      version: "2.1.0",
      major: "2",
      minor: "1",
      patch: "0",
      date: "2024-03-15",
      platform: "artifacthub",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://artifacthub.io/api/v1/packages/falco/security-hub/falco-rules",
      expect.any(Object),
    );
  });

  it("returns null date when created_at is missing", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ version: "1.0.0" }));

    const res = await artifacthub("helm", "repo", "chart");
    expect(res.date).toBeNull();
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(artifacthub("helm", "repo", "nope")).rejects.toThrow(
      "Package 'repo/nope' (helm) not found on Artifact Hub",
    );
  });
});

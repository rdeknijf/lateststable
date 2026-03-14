import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { jetbrains } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("jetbrains", () => {
  it("returns latest release", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ IIU: [{ version: "2024.3.1", date: "2024-12-10" }] }),
    );

    const res = await jetbrains("IIU");
    expect(res).toEqual({
      name: "IIU",
      version: "2024.3.1",
      major: "2024",
      minor: "3",
      patch: "1",
      date: "2024-12-10",
      platform: "jetbrains",
    });
  });

  it("throws on empty releases array", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ XYZ: [] }));

    await expect(jetbrains("XYZ")).rejects.toThrow(
      "No releases found for 'XYZ'",
    );
  });

  it("throws when product key is missing", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    await expect(jetbrains("NOPE")).rejects.toThrow(
      "No releases found for 'NOPE'",
    );
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(jetbrains("BAD")).rejects.toThrow("Product 'BAD' not found");
  });
});

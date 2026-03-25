import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { maven } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("maven", () => {
  it("returns latest version", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ response: { docs: [{ latestVersion: "3.7.0" }] } }),
    );

    const res = await maven("org.apache.kafka", "kafka-clients");
    expect(res).toEqual({
      name: "org.apache.kafka:kafka-clients",
      version: "3.7.0",
      major: "3",
      minor: "7",
      patch: "0",
      date: null,
      platform: "maven",
    });
  });

  it("throws when no docs found", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ response: { docs: [] } }),
    );

    await expect(maven("com.nope", "nope")).rejects.toThrow(
      "Artifact 'com.nope:nope' not found",
    );
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(maven("bad", "bad")).rejects.toThrow(
      "Artifact 'bad:bad' not found",
    );
  });
});

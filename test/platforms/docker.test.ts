import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { docker } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function tagsResponse(tags: string[]) {
  return new Response(
    JSON.stringify({ results: tags.map((name) => ({ name })) }),
  );
}

describe("docker", () => {
  it("picks highest semver tag", async () => {
    mockFetch.mockResolvedValueOnce(
      tagsResponse(["latest", "alpine", "1.25.3", "1.25.2", "1.24.0"]),
    );

    const res = await docker("library", "nginx");
    expect(res).toEqual({
      name: "library/nginx",
      version: "1.25.3",
      major: "1",
      minor: "25",
      patch: "3",
      date: null,
      platform: "docker",
    });
  });

  it("filters non-semver tags", async () => {
    mockFetch.mockResolvedValueOnce(
      tagsResponse(["latest", "alpine", "slim", "2.0.0"]),
    );

    const res = await docker("lib", "img");
    expect(res.version).toBe("2.0.0");
  });

  it("handles v-prefixed tags", async () => {
    mockFetch.mockResolvedValueOnce(tagsResponse(["v3.1.0", "v2.0.0"]));

    const res = await docker("lib", "img");
    expect(res.version).toBe("3.1.0");
  });

  it("sorts numerically not lexicographically", async () => {
    mockFetch.mockResolvedValueOnce(tagsResponse(["1.9.0", "1.10.0", "1.2.0"]));

    const res = await docker("lib", "img");
    expect(res.version).toBe("1.10.0");
  });

  it("throws when no semver tags exist", async () => {
    mockFetch.mockResolvedValueOnce(tagsResponse(["latest", "alpine", "slim"]));

    await expect(docker("lib", "img")).rejects.toThrow(
      "No semver tags found for 'lib/img'",
    );
  });

  it("throws on empty results", async () => {
    mockFetch.mockResolvedValueOnce(tagsResponse([]));

    await expect(docker("lib", "img")).rejects.toThrow(
      "No semver tags found for 'lib/img'",
    );
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

    await expect(docker("lib", "nope")).rejects.toThrow(
      "Image 'lib/nope' not found on Docker Hub",
    );
  });
});

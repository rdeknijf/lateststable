import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pypi } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("pypi", () => {
  it("returns version for a valid package", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ info: { version: "0.115.0" } }),
    );

    const res = await pypi("fastapi");
    expect(res).toEqual({
      name: "fastapi",
      version: "0.115.0",
      major: "0",
      minor: "115",
      patch: "0",
      date: null,
      platform: "pypi",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://pypi.org/pypi/fastapi/json",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(pypi("nonexistent")).rejects.toThrow(
      "Package 'nonexistent' not found on PyPI",
    );
  });
});

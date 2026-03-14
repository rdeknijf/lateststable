import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nuget } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("nuget", () => {
  it("returns latest stable version", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ versions: ["12.0.0", "13.0.1", "13.0.2-beta1", "13.0.3"] }),
    );

    const res = await nuget("Newtonsoft.Json");
    expect(res).toEqual({
      name: "Newtonsoft.Json",
      version: "13.0.3",
      major: "13",
      minor: "0",
      patch: "3",
      date: null,
      platform: "nuget",
    });
  });

  it("filters prerelease versions", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ versions: ["1.0.0", "1.0.1-beta", "1.0.2-rc1", "1.1.0"] }),
    );

    const res = await nuget("MyPkg");
    expect(res.version).toBe("1.1.0");
  });

  it("falls back to last version when all are prerelease", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ versions: ["1.0.0-alpha", "1.0.0-beta", "1.0.0-rc1"] }),
    );

    const res = await nuget("AllPre");
    expect(res.version).toBe("1.0.0-rc1");
  });

  it("uses lowercase URL but preserves original name", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ versions: ["8.0.0"] }));

    const res = await nuget("Microsoft.Extensions.Logging");
    expect(res.name).toBe("Microsoft.Extensions.Logging");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("microsoft.extensions.logging"),
      expect.any(Object),
    );
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(nuget("Nope")).rejects.toThrow(
      "Package 'Nope' not found on NuGet",
    );
  });
});

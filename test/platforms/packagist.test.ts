import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { packagist } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function packagistResponse(vendor: string, pkg: string, versions: { version: string }[]) {
  return jsonResponse({ packages: { [`${vendor}/${pkg}`]: versions } });
}

describe("packagist", () => {
  it("returns latest stable version", async () => {
    mockFetch.mockResolvedValueOnce(
      packagistResponse("laravel", "framework", [
        { version: "v11.0.0" },
        { version: "v10.48.0" },
      ]),
    );

    const res = await packagist("laravel", "framework");
    expect(res).toEqual({
      name: "laravel/framework",
      version: "11.0.0",
      major: "11",
      minor: "0",
      patch: "0",
      date: null,
      platform: "packagist",
    });
  });

  it("filters dev versions", async () => {
    mockFetch.mockResolvedValueOnce(
      packagistResponse("vendor", "pkg", [
        { version: "dev-main" },
        { version: "2.0.0" },
      ]),
    );

    const res = await packagist("vendor", "pkg");
    expect(res.version).toBe("2.0.0");
  });

  it("filters alpha/beta/RC case-insensitively", async () => {
    mockFetch.mockResolvedValueOnce(
      packagistResponse("vendor", "pkg", [
        { version: "3.0.0-Alpha" },
        { version: "3.0.0-BETA" },
        { version: "3.0.0-rc1" },
        { version: "2.5.0" },
      ]),
    );

    const res = await packagist("vendor", "pkg");
    expect(res.version).toBe("2.5.0");
  });

  it("strips v-prefix from version", async () => {
    mockFetch.mockResolvedValueOnce(
      packagistResponse("vendor", "pkg", [{ version: "v1.2.3" }]),
    );

    const res = await packagist("vendor", "pkg");
    expect(res.version).toBe("1.2.3");
  });

  it("throws when all versions are unstable", async () => {
    mockFetch.mockResolvedValueOnce(
      packagistResponse("vendor", "pkg", [
        { version: "dev-main" },
        { version: "1.0.0-beta" },
      ]),
    );

    await expect(packagist("vendor", "pkg")).rejects.toThrow(
      "No stable versions for 'vendor/pkg'",
    );
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(packagist("vendor", "nope")).rejects.toThrow(
      "Package 'vendor/nope' not found on Packagist",
    );
  });
});

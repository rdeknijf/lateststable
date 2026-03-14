import { describe, it, expect } from "vitest";
import { parseVersion, isSemver, compareSemver } from "../src/version";

describe("parseVersion", () => {
  it.each([
    ["1.2.3", { major: "1", minor: "2", patch: "3" }],
    ["v1.2.3", { major: "1", minor: "2", patch: "3" }],
    ["1.2", { major: "1", minor: "2", patch: null }],
    ["5", { major: "5", minor: null, patch: null }],
    ["v5", { major: "5", minor: null, patch: null }],
    ["0.0.1", { major: "0", minor: "0", patch: "1" }],
    ["2024.3.1", { major: "2024", minor: "3", patch: "1" }],
    ["v0.0.0", { major: "0", minor: "0", patch: "0" }],
    ["10.20.30", { major: "10", minor: "20", patch: "30" }],
  ] as const)("parses %s", (input, expected) => {
    expect(parseVersion(input)).toEqual(expected);
  });

  it("returns nulls for empty string", () => {
    expect(parseVersion("")).toEqual({ major: "", minor: null, patch: null });
  });
});

describe("isSemver", () => {
  it.each([
    "1.2.3",
    "v1.2.3",
    "1.2",
    "v1",
    "0.0.0",
    "1",
    "v0.0.1",
    "1.10.0",
    "999.999.999",
  ])("returns true for %s", (tag) => {
    expect(isSemver(tag)).toBe(true);
  });

  it.each([
    "latest",
    "alpine",
    "1.2.3-beta",
    "sha-abc123",
    "",
    "1.2.3.4",
    "v",
    "abc",
    "v1.2.3-rc1",
    "1.2.3-alpha.1",
  ])("returns false for %s", (tag) => {
    expect(isSemver(tag)).toBe(false);
  });
});

describe("compareSemver", () => {
  it.each([
    ["1.2.3", "1.2.3", 0],
    ["v1.2.3", "1.2.3", 0],
    ["2.0.0", "1.0.0", 1],
    ["1.0.0", "2.0.0", -1],
    ["1.3.0", "1.2.0", 1],
    ["1.2.0", "1.3.0", -1],
    ["1.2.4", "1.2.3", 1],
    ["1.2.3", "1.2.4", -1],
    ["1.10.0", "1.9.0", 1],
    ["1", "1.0.0", 0],
    ["1.0", "1.0.0", 0],
    ["v2", "2.0.0", 0],
  ] as const)("compareSemver(%s, %s) = %d", (a, b, expected) => {
    if (expected === 0) {
      expect(compareSemver(a, b)).toBe(0);
    } else if (expected > 0) {
      expect(compareSemver(a, b)).toBeGreaterThan(0);
    } else {
      expect(compareSemver(a, b)).toBeLessThan(0);
    }
  });

  it("sorts an array correctly", () => {
    const versions = ["1.9.0", "1.10.0", "2.0.0", "0.1.0", "1.0.0"];
    const sorted = [...versions].sort(compareSemver);
    expect(sorted).toEqual(["0.1.0", "1.0.0", "1.9.0", "1.10.0", "2.0.0"]);
  });
});

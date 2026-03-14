export interface VersionParts {
  major: string | null;
  minor: string | null;
  patch: string | null;
}

export function parseVersion(version: string): VersionParts {
  const v = version.replace(/^v/, "");
  const parts = v.split(".");
  return {
    major: parts[0] ?? null,
    minor: parts[1] ?? null,
    patch: parts[2] ?? null,
  };
}

const SEMVER_RE = /^v?\d+(\.\d+)?(\.\d+)?$/;

export function isSemver(tag: string): boolean {
  return SEMVER_RE.test(tag);
}

export function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

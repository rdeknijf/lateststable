import { parseVersion, isSemver, compareSemver, compareNumericPrefix } from "./version";

export interface VersionResult {
  name: string;
  version: string;
  major: string | null;
  minor: string | null;
  patch: string | null;
  date: string | null;
  platform: string;
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamError";
  }
}

// Only a 404 or 410 means the thing does not exist. Any other failure (a 403
// rate limit, a 429, a 5xx) is the upstream failing, which the router maps to
// a 502 instead of a misleading "not found".
function ensureOk(res: Response, notFound: string): void {
  if (res.ok) return;
  if (res.status === 404 || res.status === 410) throw new NotFoundError(notFound);
  throw new UpstreamError(`Upstream returned HTTP ${res.status}`);
}

function result(
  name: string,
  version: string,
  platform: string,
  date?: string,
): VersionResult {
  return { name, version, ...parseVersion(version), date: date ?? null, platform };
}

const TIMEOUT_MS = 10_000;

async function upstream(url: string, headers: Record<string, string> = {}): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": "lateststable.org", ...headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

// PyPI
export async function pypi(pkg: string): Promise<VersionResult> {
  const res = await upstream(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`);
  ensureOk(res, `Package '${pkg}' not found on PyPI`);
  const data: any = await res.json();
  return result(pkg, data.info.version, "pypi");
}

// npm
export async function npm(pkg: string): Promise<VersionResult> {
  const res = await upstream(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
  ensureOk(res, `Package '${pkg}' not found on npm`);
  const data: any = await res.json();
  return result(pkg, data["dist-tags"].latest, "npm");
}

// GitHub releases. GITHUB_TOKEN (optional, read-only) lifts the API limit from 60 to 5000 requests per hour.
function githubAuth(): Record<string, string> {
  const auth = process.env.GITHUB_TOKEN;
  return auth ? { Authorization: `Bearer ${auth}` } : {};
}

export async function github(user: string, repo: string): Promise<VersionResult> {
  const res = await upstream(
    `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/releases/latest`,
    githubAuth(),
  );
  ensureOk(res, `No releases found for '${user}/${repo}'`);
  const data: any = await res.json();
  const version = data.tag_name.replace(/^v/, "");
  return result(`${user}/${repo}`, version, "github", data.published_at?.split("T")[0]);
}

// Docker Hub
export async function docker(user: string, image: string): Promise<VersionResult> {
  const res = await upstream(
    `https://hub.docker.com/v2/repositories/${encodeURIComponent(user)}/${encodeURIComponent(image)}/tags?page_size=100&ordering=last_updated`,
  );
  ensureOk(res, `Image '${user}/${image}' not found on Docker Hub`);
  const data: any = await res.json();
  const tags = data.results
    .map((t: any) => t.name)
    .filter((t: string) => isSemver(t))
    // "26", "26.13" and "26.13.0" compare equal; prefer the most specific tag.
    .sort((a: string, b: string) => compareSemver(a, b) || a.split(".").length - b.split(".").length)
    .reverse();
  if (!tags.length) throw new NotFoundError(`No semver tags found for '${user}/${image}'`);
  return result(`${user}/${image}`, tags[0].replace(/^v/, ""), "docker");
}

// JetBrains
export async function jetbrains(product: string): Promise<VersionResult> {
  const res = await upstream(
    `https://data.services.jetbrains.com/products/releases?code=${encodeURIComponent(product)}&latest=true&type=release`,
  );
  ensureOk(res, `Product '${product}' not found`);
  const data: any = await res.json();
  const releases = data[product];
  if (!releases?.length) throw new NotFoundError(`No releases found for '${product}'`);
  return result(product, releases[0].version, "jetbrains", releases[0].date);
}

// Helm (Artifact Hub)
export async function helm(repo: string, chart: string): Promise<VersionResult> {
  const res = await upstream(
    `https://artifacthub.io/api/v1/packages/helm/${encodeURIComponent(repo)}/${encodeURIComponent(chart)}`,
  );
  ensureOk(res, `Chart '${repo}/${chart}' not found`);
  const data: any = await res.json();
  return result(`${repo}/${chart}`, data.version, "helm", data.created_at?.split("T")[0]);
}

// Crates.io (Rust)
export async function crates(name: string): Promise<VersionResult> {
  const res = await upstream(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`);
  ensureOk(res, `Crate '${name}' not found`);
  const data: any = await res.json();
  // newest_version and versions[] order are by publish date, so a backport
  // (wasmtime 48.0.8 after 50.0.1) would win. max_stable_version is the
  // highest non-prerelease, non-yanked version.
  const version =
    data.crate.max_stable_version ??
    data.versions?.find((v: any) => !v.yanked)?.num ??
    data.crate.newest_version;
  const entry = data.versions?.find((v: any) => v.num === version);
  return result(name, version, "crates", entry?.created_at?.split("T")[0]);
}

// Go modules
export async function go(module: string): Promise<VersionResult> {
  const res = await upstream(`https://proxy.golang.org/${encodeURIComponent(module)}/@latest`);
  ensureOk(res, `Module '${module}' not found`);
  const data: any = await res.json();
  return result(module, data.Version.replace(/^v/, ""), "go", data.Time?.split("T")[0]);
}

// Homebrew
export async function homebrew(formula: string): Promise<VersionResult> {
  const res = await upstream(`https://formulae.brew.sh/api/formula/${encodeURIComponent(formula)}.json`);
  ensureOk(res, `Formula '${formula}' not found`);
  const data: any = await res.json();
  return result(formula, data.versions.stable, "homebrew");
}

// RubyGems
export async function rubygems(gem: string): Promise<VersionResult> {
  const res = await upstream(`https://rubygems.org/api/v1/gems/${encodeURIComponent(gem)}.json`);
  ensureOk(res, `Gem '${gem}' not found`);
  const data: any = await res.json();
  return result(gem, data.version, "rubygems");
}

// NuGet
export async function nuget(pkg: string): Promise<VersionResult> {
  const id = pkg.toLowerCase();
  const res = await upstream(`https://api.nuget.org/v3-flatcontainer/${encodeURIComponent(id)}/index.json`);
  ensureOk(res, `Package '${pkg}' not found on NuGet`);
  const data: any = await res.json();
  const stable = data.versions.filter((v: string) => !v.includes("-"));
  const version = stable.length ? stable[stable.length - 1] : data.versions[data.versions.length - 1];
  return result(pkg, version, "nuget");
}

// Packagist (PHP/Composer)
export async function packagist(vendor: string, pkg: string): Promise<VersionResult> {
  const fullName = `${vendor}/${pkg}`;
  const res = await upstream(`https://repo.packagist.org/p2/${encodeURIComponent(vendor)}/${encodeURIComponent(pkg)}.json`);
  ensureOk(res, `Package '${fullName}' not found on Packagist`);
  const data: any = await res.json();
  const versions = data.packages[fullName]
    ?.filter((v: any) => !/dev|alpha|beta|RC/i.test(v.version))
    ?.map((v: any) => v.version);
  if (!versions?.length) throw new NotFoundError(`No stable versions for '${fullName}'`);
  return result(fullName, versions[0].replace(/^v/, ""), "packagist");
}

// AUR (Arch User Repository)
export async function aur(pkg: string): Promise<VersionResult> {
  const res = await upstream(`https://aur.archlinux.org/rpc/v5/info/${encodeURIComponent(pkg)}`);
  ensureOk(res, `Package '${pkg}' not found on AUR`);
  const data: any = await res.json();
  if (!data.results?.length) throw new NotFoundError(`Package '${pkg}' not found on AUR`);
  const version = data.results[0].Version.split("-")[0];
  return result(pkg, version, "aur");
}

// Artifact Hub (all package types)
export async function artifacthub(kind: string, repo: string, pkg: string): Promise<VersionResult> {
  const res = await upstream(
    `https://artifacthub.io/api/v1/packages/${encodeURIComponent(kind)}/${encodeURIComponent(repo)}/${encodeURIComponent(pkg)}`,
  );
  ensureOk(res, `Package '${repo}/${pkg}' (${kind}) not found on Artifact Hub`);
  const data: any = await res.json();
  return result(`${repo}/${pkg}`, data.version, "artifacthub", data.created_at?.split("T")[0]);
}

// Maven Central
// Reads maven-metadata.xml from the repository itself. The search.maven.org
// index lags months behind, and <release> can be a milestone or RC.
const MAVEN_PRERELEASE = /[-.](alpha|beta|rc|cr|m|milestone|snapshot|preview|ea|dev|pre)([-.]?\d+)?([-.]|$)/i;

export async function maven(groupId: string, artifactId: string): Promise<VersionResult> {
  const notFound = `Artifact '${groupId}:${artifactId}' not found`;
  const path = `${groupId.split(".").map(encodeURIComponent).join("/")}/${encodeURIComponent(artifactId)}`;
  const res = await upstream(`https://repo1.maven.org/maven2/${path}/maven-metadata.xml`);
  ensureOk(res, notFound);
  const xml = await res.text();
  const versions = [...xml.matchAll(/<version>([^<]+)<\/version>/g)].map((m) => m[1].trim());
  const release = xml.match(/<release>([^<]+)<\/release>/)?.[1].trim();
  const stable = versions.filter((v) => !MAVEN_PRERELEASE.test(v));
  if (!stable.length) throw new NotFoundError(`No stable versions for '${groupId}:${artifactId}'`);
  // <versions> is in publish order, so take the numeric maximum. On a tie
  // (guava 33.7.2-jre vs 33.7.2-android) prefer <release>, else the last listed.
  let best = stable[0];
  for (const v of stable) {
    const cmp = compareNumericPrefix(v, best);
    if (cmp > 0 || (cmp === 0 && best !== release)) best = v;
  }
  return result(`${groupId}:${artifactId}`, best, "maven");
}

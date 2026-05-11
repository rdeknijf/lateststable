import { parseVersion, isSemver, compareSemver } from "./version";

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

function result(
  name: string,
  version: string,
  platform: string,
  date?: string,
): VersionResult {
  return { name, version, ...parseVersion(version), date: date ?? null, platform };
}

const TIMEOUT_MS = 10_000;

async function upstream(url: string): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": "lateststable.org" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

// PyPI
export async function pypi(pkg: string): Promise<VersionResult> {
  const res = await upstream(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`);
  if (!res.ok) throw new NotFoundError(`Package '${pkg}' not found on PyPI`);
  const data: any = await res.json();
  return result(pkg, data.info.version, "pypi");
}

// npm
export async function npm(pkg: string): Promise<VersionResult> {
  const res = await upstream(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
  if (!res.ok) throw new NotFoundError(`Package '${pkg}' not found on npm`);
  const data: any = await res.json();
  return result(pkg, data["dist-tags"].latest, "npm");
}

// GitHub releases
export async function github(user: string, repo: string): Promise<VersionResult> {
  const res = await upstream(
    `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/releases/latest`,
  );
  if (!res.ok) throw new NotFoundError(`No releases found for '${user}/${repo}'`);
  const data: any = await res.json();
  const version = data.tag_name.replace(/^v/, "");
  return result(`${user}/${repo}`, version, "github", data.published_at?.split("T")[0]);
}

// Docker Hub
export async function docker(user: string, image: string): Promise<VersionResult> {
  const res = await upstream(
    `https://hub.docker.com/v2/repositories/${encodeURIComponent(user)}/${encodeURIComponent(image)}/tags?page_size=100&ordering=last_updated`,
  );
  if (!res.ok) throw new NotFoundError(`Image '${user}/${image}' not found on Docker Hub`);
  const data: any = await res.json();
  const tags = data.results
    .map((t: any) => t.name)
    .filter((t: string) => isSemver(t))
    .sort(compareSemver)
    .reverse();
  if (!tags.length) throw new NotFoundError(`No semver tags found for '${user}/${image}'`);
  return result(`${user}/${image}`, tags[0].replace(/^v/, ""), "docker");
}

// JetBrains
export async function jetbrains(product: string): Promise<VersionResult> {
  const res = await upstream(
    `https://data.services.jetbrains.com/products/releases?code=${encodeURIComponent(product)}&latest=true&type=release`,
  );
  if (!res.ok) throw new NotFoundError(`Product '${product}' not found`);
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
  if (!res.ok) throw new NotFoundError(`Chart '${repo}/${chart}' not found`);
  const data: any = await res.json();
  return result(`${repo}/${chart}`, data.version, "helm", data.created_at?.split("T")[0]);
}

// Crates.io (Rust)
export async function crates(name: string): Promise<VersionResult> {
  const res = await upstream(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`);
  if (!res.ok) throw new NotFoundError(`Crate '${name}' not found`);
  const data: any = await res.json();
  const latest = data.versions?.find((v: any) => !v.yanked);
  const version = latest?.num ?? data.crate.newest_version;
  return result(name, version, "crates", latest?.created_at?.split("T")[0]);
}

// Go modules
export async function go(module: string): Promise<VersionResult> {
  const res = await upstream(`https://proxy.golang.org/${encodeURIComponent(module)}/@latest`);
  if (!res.ok) throw new NotFoundError(`Module '${module}' not found`);
  const data: any = await res.json();
  return result(module, data.Version.replace(/^v/, ""), "go", data.Time?.split("T")[0]);
}

// Homebrew
export async function homebrew(formula: string): Promise<VersionResult> {
  const res = await upstream(`https://formulae.brew.sh/api/formula/${encodeURIComponent(formula)}.json`);
  if (!res.ok) throw new NotFoundError(`Formula '${formula}' not found`);
  const data: any = await res.json();
  return result(formula, data.versions.stable, "homebrew");
}

// RubyGems
export async function rubygems(gem: string): Promise<VersionResult> {
  const res = await upstream(`https://rubygems.org/api/v1/gems/${encodeURIComponent(gem)}.json`);
  if (!res.ok) throw new NotFoundError(`Gem '${gem}' not found`);
  const data: any = await res.json();
  return result(gem, data.version, "rubygems");
}

// NuGet
export async function nuget(pkg: string): Promise<VersionResult> {
  const id = pkg.toLowerCase();
  const res = await upstream(`https://api.nuget.org/v3-flatcontainer/${encodeURIComponent(id)}/index.json`);
  if (!res.ok) throw new NotFoundError(`Package '${pkg}' not found on NuGet`);
  const data: any = await res.json();
  const stable = data.versions.filter((v: string) => !v.includes("-"));
  const version = stable.length ? stable[stable.length - 1] : data.versions[data.versions.length - 1];
  return result(pkg, version, "nuget");
}

// Packagist (PHP/Composer)
export async function packagist(vendor: string, pkg: string): Promise<VersionResult> {
  const fullName = `${vendor}/${pkg}`;
  const res = await upstream(`https://repo.packagist.org/p2/${encodeURIComponent(vendor)}/${encodeURIComponent(pkg)}.json`);
  if (!res.ok) throw new NotFoundError(`Package '${fullName}' not found on Packagist`);
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
  if (!res.ok) throw new NotFoundError(`Package '${pkg}' not found on AUR`);
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
  if (!res.ok) throw new NotFoundError(`Package '${repo}/${pkg}' (${kind}) not found on Artifact Hub`);
  const data: any = await res.json();
  return result(`${repo}/${pkg}`, data.version, "artifacthub", data.created_at?.split("T")[0]);
}

// Maven Central
export async function maven(groupId: string, artifactId: string): Promise<VersionResult> {
  const res = await upstream(
    `https://search.maven.org/solrsearch/select?q=g:${encodeURIComponent(groupId)}+AND+a:${encodeURIComponent(artifactId)}&rows=1&wt=json`,
  );
  if (!res.ok) throw new NotFoundError(`Artifact '${groupId}:${artifactId}' not found`);
  const data: any = await res.json();
  if (!data.response.docs.length) throw new NotFoundError(`Artifact '${groupId}:${artifactId}' not found`);
  return result(`${groupId}:${artifactId}`, data.response.docs[0].latestVersion, "maven");
}

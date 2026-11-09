export const COPY = {
  "meta_description": "Free JSON API for the latest stable version of a package on PyPI, npm, GitHub, Docker Hub, Maven Central and ten more registries. No key needed.",
  "tagline": "Free JSON API for the latest stable version on 15 registries.",
  "no_key_line": "You need no key or account.",
  "lookup": {
    "registry_label": "Registry",
    "package_label": "Package",
    "button": "Get",
    "parts": "{registry} takes {shape}, for example {example}.",
    "invalid": "Names take only letters, digits, dot, hyphen, underscore, @ and slash.",
    "network": "No response from lateststable.org. Retry in a moment.",
    "unreadable": "The response body is not JSON."
  },
  "response": {
    "heading": "Response",
    "copy": "Copy curl",
    "copied": "Copied",
    "copy_failed": "Copy failed"
  },
  "legend": {
    "heading": "Legend",
    "stable": "Registry with a stable version",
    "tags": "Prerelease tags beside the four registries with their own rule",
    "failed": "Hollow tile: its most recent lookup failed",
    "action": "Select a tile to run its lookup"
  },
  "rules": {
    "heading": "What stable means per registry",
    "intro": "Maven can list a milestone as a package's release and Docker Hub a partial tag like 26.13, so lateststable applies its own rule at four registries. The other eleven return the latest the registry reports.",
    "column_registry": "Registry",
    "column_url": "URL",
    "column_rule": "Rule",
    "tag_own": "own rule",
    "tag_registry": "registry decides",
    "items": {
      "pypi": "info.version from the PyPI JSON API.",
      "npm": "dist-tags.latest from the npm registry.",
      "github": "The tag of GitHub's latest release, minus a leading v, with its publish date.",
      "docker": "Highest numeric tag among the 100 most recently updated; 26.13.0 ranks above 26.13.",
      "crates": "max_stable_version, highest stable by number, so wasmtime 50.0.1 beats a later-published 48.0.8 backport; if absent, first listed non-yanked version, else newest_version; neither filters prereleases.",
      "go": "The version proxy.golang.org reports at @latest, minus the leading v.",
      "homebrew": "versions.stable from the formulae.brew.sh API.",
      "rubygems": "The version field from the RubyGems API.",
      "nuget": "Last listed version without a prerelease suffix; if all have one, the last listed.",
      "packagist": "First version in the p2 metadata that is not dev, alpha, beta or RC.",
      "maven": "Highest numeric version in maven-metadata.xml, skipping any with a prerelease qualifier such as RC.",
      "helm": "The chart version Artifact Hub reports.",
      "jetbrains": "The first result from the JetBrains releases API, queried with type=release.",
      "artifacthub": "The package version Artifact Hub reports for kind/repo/package.",
      "aur": "AUR's Version field with the package release suffix removed."
    }
  },
  "shape": {
    "heading": "The response",
    "intro": "lateststable returns these fields for all 15 registries.",
    "fields": {
      "name": "Package name as requested; maven as groupId:artifactId, artifacthub as repo/package",
      "version": "The version string",
      "major": "First dot-separated segment after any leading v, as a string",
      "minor": "Second dot-separated segment, null when the version has none",
      "patch": "Third dot-separated segment, null when the version has none",
      "date": "Release date as YYYY-MM-DD at github, jetbrains, crates and go; null elsewhere",
      "platform": "The registry key, as listed at /v1"
    },
    "status_heading": "Status codes",
    "status": {
      "200": "The body is the object described above",
      "400": "Parameter has disallowed characters, consecutive dots, or over 256 characters",
      "404": "No such package, or no version passes lateststable's rule",
      "502": "The registry failed or timed out"
    },
    "notes_heading": "Notes",
    "cache": "lateststable caches a successful lookup for one hour and never caches an error.",
    "cors": "Access-Control-Allow-Origin is *, so a browser page can call the API.",
    "list": "GET /v1 lists every registry key."
  },
  "footer": {
    "built_by": "Built by",
    "source": "Source",
    "license": "MIT license"
  }
} as const;

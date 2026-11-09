# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: developers who need the latest stable version of a package, image, or tool in a script, a CI job, a Dockerfile generator, or an agent. They arrive from a link or a search, and they want the URL shape and a real response within seconds. (Confirmed by Rutger, 2026-11-09.)

Secondary: people who judge whether to hire or trust Rutger de Knijf. They read the same page and draw their conclusion from how exact it is. They get no separate section and no sales text. (Confirmed by Rutger, 2026-11-09.)

## Product Purpose

lateststable.org is a free JSON API. It answers one question: what is the latest stable version of X? The caller sends one GET request and receives one flat JSON object in the same shape for every registry. Success means a developer copies a URL from the homepage and uses it without reading anything else.

## Positioning

"Stable" is decided per registry, because each registry has a different way to get it wrong. Registries publish milestones, backports, and partial tags, and a naive "latest" field returns those. A neighboring version API could not truthfully copy the specific source rules listed under Evidence on Hand. A person who judges Rutger must conclude that he gets the details right. (Confirmed by Rutger, 2026-11-09.)

## Operating Context

Callers are curl, CI pipelines, scripts, and frontends (CORS is open). Readers open the homepage in a browser, often once, to learn the URL shape. The homepage also appears as a 1200x750 screenshot on the deknijf.com Projects page, next to five sibling API homepages (grid, isde, zonecheck, adfeed, nbcheck), and it must hold up in that row.

## Capabilities and Constraints

- 15 platforms, listed live at `GET /v1`: pypi, npm, github, docker, jetbrains, helm, crates, go, homebrew, rubygems, nuget, packagist, aur, maven, artifacthub.
- Response fields: `name`, `version`, `major`, `minor`, `patch`, `date`, `platform`. `date` is set for github, jetbrains, crates, and go, and null for every other registry.
- Errors: 404 with `{"error": ...}` when the thing does not exist, 400 for an invalid parameter, 502 when the upstream fails.
- No key, no account. CORS `*`, methods GET and OPTIONS.
- Successful lookups are cached in memory for 1 hour, and errors are not cached. Successful responses carry `Cache-Control: public, s-maxage=3600, max-age=300`.
- The API contract must not change for a homepage change: routes, response shapes, CORS, caching, `/health`.
- The homepage is one inline HTML response from the app. There are no static-file routes, and the app has zero runtime dependencies.

## Brand Commitments

- The name is `lateststable.org`, lowercase, always with `.org`.
- Maker credit: "Built by Rutger de Knijf", linking to https://deknijf.com, next to the GitHub source link. (Confirmed by Rutger, 2026-11-09.)
- No em dashes or en dashes in visible text.

## Evidence on Hand

Per-registry "stable" rules, all in `src/platforms.ts`:

- Maven: reads `maven-metadata.xml` from `repo1.maven.org`, removes alpha, beta, RC, milestone, snapshot, preview, EA, and dev versions, and takes the numeric maximum.
- crates.io: uses the `max_stable_version` that crates.io computes, so a backport published after a newer major does not win. This is the registry's answer, not a lateststable filter.
- Docker Hub: keeps semver tags only, and prefers the most specific tag (`26.13.0` over `26.13`).
- NuGet: removes versions with a prerelease suffix, and returns the last prerelease when nothing else exists.
- Packagist: removes dev, alpha, beta, and RC versions.
- GitHub: uses the repository's latest release.
- JetBrains: asks for `type=release`.
- Homebrew: reads `versions.stable`.
- npm: reads `dist-tags.latest`.
- AUR: removes the package release suffix.

Other facts the repository proves: public source at https://github.com/rdeknijf/lateststable, MIT license, first commit 2019-12-05, zero runtime dependencies, tests for all 15 platforms with mocked upstreams.

Absent, and must not be invented: usage numbers, customer logos, testimonials, uptime figures, an SLA, star counts.

## Product Principles

1. The API is the proof. Show real requests and real responses, not descriptions of them.
2. Say exactly what the service does, including where a source only passes on the upstream's answer.
3. One question, one URL shape, one response shape. The page must feel as small as the API is.
4. Credit the maker once and let the precision do the rest.

## Accessibility & Inclusion

Light and dark color schemes and phone width must both work. WCAG AA contrast and full keyboard use.

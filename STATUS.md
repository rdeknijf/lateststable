# Status

Attention: focus

## Goal

Free public JSON API at lateststable.org that returns the latest stable version of a package, library, or tool across 15 platforms (pypi, npm, github, docker, jetbrains, helm, crates, go, homebrew, rubygems, nuget, packagist, aur, maven, artifacthub).

## Last Run

2026-11-01: refresh (PR #7, merged as `c58a65f`, deployed through square PR #1020). Dependencies and GitHub Actions to latest, a live-vs-upstream check of 37 lookups, and fixes for the maven, crates, and docker sources and for upstream error mapping.

## Current State

- Stack: Bun + TypeScript 7, Vitest 5, zero runtime dependencies, in-memory 1-hour TTL cache (errors not cached). Entrypoint `src/server.ts`, routing in `src/index.ts`, fetchers in `src/platforms.ts`.
- Container listens on `$PORT` (default 3000) and exposes `/health`. `Dockerfile` builds on `oven/bun:1-alpine` (resolved to Bun 1.4.4 on 2026-11-01), non-root.
- CI: `.github/workflows/ci.yml` runs the type check and tests on every pull request and on `main`. `.github/workflows/build.yml` builds and pushes `ghcr.io/rdeknijf/lateststable:<full commit SHA>` on every push to `main`. No `:latest` tag.
- Deploy: Flux Kustomization `clusters/buckland/flux/kustomization-lateststable.yaml` in square applies `context/lateststable/infra/` (Deployment, Service, Ingress for `lateststable.org` and `www.lateststable.org`, `ghcr-pull` SealedSecret). A merge here does not deploy: the Deployment pins the image SHA in square.
- Live (checked 2026-11-01 08:30 UTC): Deployment `lateststable` in namespace `lateststable` on buckland is 1/1 and runs `ghcr.io/rdeknijf/lateststable:c58a65fd067c554c4e3b2f824d11389e50a6511c`. Live answers after the deploy: kafka-clients 4.4.0, guava 33.7.2-jre, wasmtime 50.0.1, library/node 26.13.0.
- GitHub token (2026-11-02): GitHub lookups send `GITHUB_TOKEN` as a bearer token (PR #10, `527a63d`), deployed through square PR #1033. The token is a fine-grained PAT (public repositories read-only, no permissions, no expiry), sealed as SealedSecret `lateststable-github`. Checked from the pod: GitHub `rate_limit` core limit 5000 (was 60).
- Upstream check (2026-11-01): pypi, npm, github, docker, crates, go, homebrew, rubygems, nuget, packagist, helm, artifacthub, jetbrains, and aur matched upstream. Wrong before this refresh: maven (stale search index, milestones and RCs returned), crates (a backport published after a newer major won), docker (`26.13` instead of `26.13.0`), and every source reported an upstream 403/429/5xx as 404.
- Backlog: beads `lst` on the erebor Dolt server. Open: `lst-5xj` (tags fallback for repos without GitHub Releases).

## Decisions

- Production runs on buckland k3s via Flux, image pinned by commit SHA, never `:latest`.
- GitHub issues are the inbox and public showcase; beads (`lst`) is the backlog. Push to GitHub only per epic via `scripts/bd-sync push`.
- Maven versions come from `repo1.maven.org` `maven-metadata.xml`, not `search.maven.org` (its index lags months behind).

## Blockers

- None.

## Resume

1. Read `AGENTS.md` and `README.md` here, then `context/lateststable/README.md` and `context/lateststable/infra/README.md` in square (read square files via `git show origin/main:<path>`).
2. Run `scripts/bd-sync pull`, then `bd ready`.
3. Run `bun install && bunx tsc --noEmit && bun run test`.
4. Verify live: `curl -fsS https://lateststable.org/health` and `kubectl --context buckland -n lateststable get deploy,pods`.
5. To deploy a merged commit: wait for the `build` run on `main`, then bump the image SHA in square `context/lateststable/infra/deployment.yaml`.

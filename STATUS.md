# Status

Attention: focus

## Goal

Free public JSON API at lateststable.org that returns the latest stable version of a package, library, or tool across 15 platforms (pypi, npm, github, docker, jetbrains, helm, crates, go, homebrew, rubygems, nuget, packagist, aur, maven, artifacthub).

## Last Run

2026-09-17: STATUS.md created from repo docs, git history, and bd. Live checks added afterwards by Muninn.

## Current State

- Stack: Bun + TypeScript, Vitest tests, zero runtime dependencies, in-memory 1-hour TTL cache (errors not cached). Entrypoint `src/server.ts`, routing in `src/index.ts`, fetchers in `src/platforms.ts`.
- Container listens on `$PORT` (default 3000) and exposes `/health`. `Dockerfile` builds on `oven/bun:1-alpine`, non-root.
- CI: `.github/workflows/build.yml` builds and pushes the image to GHCR on push to `main`, tagged with the commit SHA (commit `bebee6e`, PR #1).
- Latest commit on this checkout: `c3e0304` (beads database added, prefix `lst`, PR #3). Working tree was clean at session start.
- Deploy manifests live in square at `context/lateststable/infra/` (Deployment, Service, Ingress, `ghcr-pull` SealedSecret, Flux Kustomization `clusters/buckland/flux/kustomization-lateststable.yaml`).
- Backlog: `bd count` = 0 beads; `bd ready` = no open issues.
- Live (verified 2026-09-17 by Muninn): `https://lateststable.org/health` returns `{"status":"ok"}`. Deployment `lateststable` is `1/1` on Buckland k3s (age 91d), image `ghcr.io/rdeknijf/lateststable:7e47d25...`. So the square-side `context/lateststable/README.md` and `infra/README.md` "UNTESTED, not deployed" notes are stale.

## Decisions

- Production runs on Buckland k3s via Flux, image pinned by commit SHA, never `:latest` (per app README and commit `7e47d25`).
- GitHub issues are the inbox and public showcase; beads (`lst`) is the backlog. Push to GitHub only per epic via `scripts/bd-sync push`.
- Three environments only: laptop dev, Buckland pre-prod, erebor prod (square-wide rule, 2026-07-29).

## Blockers

- None known.

## Deadlines

| Date | Item |
|------|------|

## Resume

1. Read `CLAUDE.md` and `README.md` here, then `../README.md` and `../infra/README.md` in square (read square files via `git show origin/main:<path>`).
2. Run `scripts/bd-sync pull`, then `bd ready`.
3. Run `bun install && bun run test`.
4. Verify live: `curl -fsS https://lateststable.org/health` and `kubectl --context buckland -n lateststable get deploy,pods`.
5. Fix the stale "UNTESTED" notes in square `context/lateststable/` (live deploy confirmed 2026-09-17).

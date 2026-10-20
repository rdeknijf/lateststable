# lateststable

Free JSON API for the latest stable version of anything. Containerized; the
production instance runs on k3s (image built to GHCR by CI, SHA-pinned by a
private GitOps repo).

## Stack

- **Runtime**: Bun (TypeScript)
- **Package manager**: bun
- **Testing**: Vitest

## Commands

- `bun run dev` — local dev server with watch mode
- `bun run start` — production server
- `bun run test` — run all tests
- `docker compose up --build` — run locally via Docker

## Architecture

- `src/index.ts` — routing, caching, CORS, homepage HTML
- `src/platforms.ts` — 15 platform fetchers (pypi, npm, github, docker, jetbrains, helm, crates, go, homebrew, rubygems, nuget, packagist, aur, maven, artifacthub)
- `src/version.ts` — parseVersion, isSemver, compareSemver
- `src/cache.ts` — in-memory TTL cache (1 hour default)
- `src/server.ts` — Bun HTTP server entrypoint

## Testing

Uses `vi.stubGlobal("fetch", vi.fn())` to mock outbound requests. Integration tests import the handler directly and call `handler.fetch(req, env)` with mock env objects.

## Caching

In-memory TTL cache (1 hour). Errors are not cached. The server functions without caching if `VERSIONS` is not provided in env.

## Issue tracking

The backlog is beads in this repository: `.beads/`, id prefix `lst`, synced with GitHub issues in `rdeknijf/lateststable`. The tracked `.beads/issues.jsonl` is the backup, and a pre-commit hook (`scripts/bd-export-hook.sh`) keeps it current on every commit. On a fresh clone, restore the working data with `bd bootstrap --yes`.

Pull at the start of a session:

```sh
scripts/bd-sync pull
```

Push only per epic, never the whole backlog:

```sh
scripts/bd-sync push --parent <epic-id>
scripts/bd-sync push --issues <id,id>
```

A bare `bd github sync` is forbidden. It pushes every bead to GitHub, and GitHub holds only what was pushed on purpose. `scripts/bd-sync` refuses a push without a scope for that reason.

GitHub issues are the INBOX, not the backlog. This repository is public, so an issue is also the showcase that outside readers see. `scripts/bd-sync pull` brings a new issue into beads, and triage does the routing.

Status vocabulary:

- `open` plus label `triage`: unrouted inbox item.
- `open`: routed and ready to pick up.
- `in_progress`: someone is on it.
- `blocked`: waiting on something.
- `blocked` plus label `needs-human`: waiting on Rutger.
- `closed`: done.

Effort is a label: `effort:XS`, `effort:S`, `effort:M`, `effort:L`, `effort:XL`.

bd's own git hooks are not installed here (`bd init --skip-hooks`), so pre-commit keeps its hooks. `bd remember` is not used.

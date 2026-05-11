# lateststable

Free JSON API for the latest stable version of anything. Self-hosted via Docker + Traefik.

## Stack

- **Runtime**: Bun (TypeScript)
- **Package manager**: bun
- **Testing**: Vitest

## Commands

- `bun run dev` — local dev server with watch mode
- `bun run start` — production server
- `bun run test` — run all tests
- `docker compose up -d --build` — deploy via Docker

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

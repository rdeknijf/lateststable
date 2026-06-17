# lateststable.org

Free JSON API that returns the latest stable version of any package, library, or tool.

**Live at [lateststable.org](https://lateststable.org)**

## Usage

```
GET https://lateststable.org/v1/pypi/fastapi
```

```json
{
  "name": "fastapi",
  "version": "0.135.2",
  "major": "0",
  "minor": "135",
  "patch": "2",
  "date": null,
  "platform": "pypi"
}
```

## Supported Platforms

| Platform | Endpoint | Example |
|----------|----------|---------|
| PyPI | `/v1/pypi/{package}` | [/v1/pypi/fastapi](https://lateststable.org/v1/pypi/fastapi) |
| npm | `/v1/npm/{package}` | [/v1/npm/express](https://lateststable.org/v1/npm/express) |
| GitHub | `/v1/github/{user}/{repo}` | [/v1/github/denoland/deno](https://lateststable.org/v1/github/denoland/deno) |
| Docker Hub | `/v1/docker/{user}/{image}` | [/v1/docker/library/nginx](https://lateststable.org/v1/docker/library/nginx) |
| Crates.io | `/v1/crates/{crate}` | [/v1/crates/serde](https://lateststable.org/v1/crates/serde) |
| Go | `/v1/go/{module}` | [/v1/go/golang.org/x/text](https://lateststable.org/v1/go/golang.org/x/text) |
| Homebrew | `/v1/homebrew/{formula}` | [/v1/homebrew/jq](https://lateststable.org/v1/homebrew/jq) |
| RubyGems | `/v1/rubygems/{gem}` | [/v1/rubygems/rails](https://lateststable.org/v1/rubygems/rails) |
| NuGet | `/v1/nuget/{package}` | [/v1/nuget/Newtonsoft.Json](https://lateststable.org/v1/nuget/Newtonsoft.Json) |
| Packagist | `/v1/packagist/{vendor}/{package}` | [/v1/packagist/laravel/framework](https://lateststable.org/v1/packagist/laravel/framework) |
| Maven | `/v1/maven/{groupId}/{artifactId}` | [/v1/maven/org.apache.kafka/kafka-clients](https://lateststable.org/v1/maven/org.apache.kafka/kafka-clients) |
| Helm | `/v1/helm/{repo}/{chart}` | [/v1/helm/bitnami/postgresql](https://lateststable.org/v1/helm/bitnami/postgresql) |
| JetBrains | `/v1/jetbrains/{product}` | [/v1/jetbrains/IIU](https://lateststable.org/v1/jetbrains/IIU) |
| AUR | `/v1/aur/{package}` | [/v1/aur/yay](https://lateststable.org/v1/aur/yay) |

## Run Locally

```bash
bun install
bun run dev
```

## Run Tests

```bash
bun run test
```

124 tests covering all platforms, routing, caching, CORS, and error handling.

## Deploy

The container listens on `$PORT` (default `3000`) and exposes `/health` for
readiness checks, so it runs anywhere:

```bash
docker compose up --build        # local → http://localhost:3000
```

The `Dockerfile` builds a minimal image (~50MB, `oven/bun:1-alpine`, non-root).
The production instance at [lateststable.org](https://lateststable.org) runs on a
single-node k3s cluster: CI builds an immutable image tagged with the commit SHA,
pushes it to GHCR, and the Deployment pins that SHA (no moving `:latest`). Point
any ingress/reverse proxy at port 3000.

## Architecture

- **Zero runtime dependencies** — just Bun and the source TypeScript
- **In-memory TTL cache** — successful lookups cached for 1 hour, errors never cached
- **CORS enabled** — use it from any frontend

## License

MIT

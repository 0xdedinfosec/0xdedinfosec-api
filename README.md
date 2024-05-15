[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/0xdedinfosec/0xdedinfosec-api)

# 0xDedinfosec API

-   **Framework**: [Honojs](https://hono.dev/)
-   **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/)
-   **Database**: [Turso DB](https://turso.tech/)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Rate Limiting**: [Cloudflare Wokers Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

# Setup

Create both files at root folder

## .dev.vars

```bash
DATABASE_URL="" # Turso DB URL
DATABASE_AUTH_TOKEN="" # Turso DB Rest API Token
```

## .env

```bash
DATABASE_URL="" # Turso DB URL
DATABASE_AUTH_TOKEN="" # Turso DB Rest API Token
```

## run the dev server

```bash
bun i
bun run dev
```

# License

Licensed under the [MIT license](https://github.com/0xdedinfosec/0xdedinfosec-api/blob/main/LICENSE.md).

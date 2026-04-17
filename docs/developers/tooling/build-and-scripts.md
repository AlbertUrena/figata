# Build Tools and Scripts

> **Read this doc when** running the dev server, building Cloudflare outputs, using validation scripts, or touching files in `scripts/`, `package.json`, `_redirects`, `_headers`, or `wrangler.*.jsonc`.

## Overview

The repo is still mostly static HTML/CSS/JS, but it now has an explicit **Cloudflare packaging step** for production deployment:
- `dist-public/` for the public site + Pages worker
- `dist-admin/` for the Admin + Pages worker
- `dist-jobs/` for the scheduled Worker runtime

| Area | Files |
|------|------|
| Local dev | `scripts/dev-server.js` |
| Cloudflare public build | `scripts/build-cloudflare-public.js`, `wrangler.public.jsonc` |
| Cloudflare admin build | `scripts/build-cloudflare-admin.js`, `wrangler.admin.jsonc` |
| Cloudflare jobs build | `scripts/build-cloudflare-jobs.js`, `wrangler.jobs.jsonc` |
| Shared bundle helper | `scripts/build-cloudflare-utils.js` |
| Validation | `scripts/validate-*.js` |
| Analytics/report jobs | `scripts/run-analytics-*.js` |

## npm Scripts

| Script | Purpose |
|------|---------|
| `npm run dev` | Start local dev server |
| `npm run build-cloudflare-public` | Build `dist-public/` |
| `npm run build-cloudflare-admin` | Build `dist-admin/` |
| `npm run build-cloudflare-jobs` | Build `dist-jobs/worker.mjs` |
| `npm run build:cloudflare` | Run all three Cloudflare builds |
| `npm run generate:home-featured` | Regenerate `data/home-featured.json` |
| `npm run analytics:curate` | Build local curated analytics facts |
| `npm run analytics:health-report` | Build quality snapshot + health report |
| `npm run analytics:kpis` | Build KPI snapshot artifacts |
| `npm run analytics:report:weekly` | Generate weekly AI report |
| `npm run analytics:report:monthly` | Generate monthly AI report |
| `npm run analytics:optimization` | Build optimization artifacts |
| `npm run validate:*` | Run schema/runtime validators |
| `npm run check:admin-ui` | Validate admin DOM IDs |
| `npm test` | Menu traits + allergens smoke tests |

## Local Dev Server

Run:

```bash
npm run dev
```

Default URL:

```txt
http://127.0.0.1:5173
```

### Local API surface

The dev server now mirrors the Cloudflare routes used in production:

| Endpoint | Method | Notes |
|------|--------|-------|
| `/api/session` | GET | Returns local bypass session payload |
| `/api/publish` | POST | Returns `501` in local dev |
| `/api/analytics/collect` | POST | Alias to local analytics ingest |
| `/api/analytics/snapshot` | GET | Alias to local inspect snapshot |
| `/api/analytics/ai-analyst` | POST | Alias to local AI analyst endpoint |
| `/__local/save-drafts` | POST | Writes drafts to local disk |
| `/__analytics/collect` | POST | Local analytics ingest |
| `/__analytics/inspect` | GET | Local analytics snapshot |
| `/__analytics/ai-analyst` | POST | Local AI analyst |

That split lets the Admin behave like production while still supporting local-only tooling.

## Cloudflare Build Outputs

### `dist-public/`

Built by `scripts/build-cloudflare-public.js`.

Includes:
- public static site files
- `_headers`
- `_redirects`
- generated `_worker.js` for `/api/analytics/collect`

### `dist-admin/`

Built by `scripts/build-cloudflare-admin.js`.

Includes:
- `admin/app/`
- `assets/`
- `data/`
- `shared/`
- root redirect page to `/admin/app/`
- generated `_worker.js` for admin APIs

Not included:
- `admin/cms/`

### `dist-jobs/`

Built by `scripts/build-cloudflare-jobs.js`.

Includes:
- `worker.mjs` for scheduled AI reports / optimization refresh
- named Durable Object export for publish coordination

## Wrangler Configs

| File | Purpose |
|------|---------|
| `wrangler.public.jsonc` | Pages config for `trattoriafigata` |
| `wrangler.admin.jsonc` | Pages config for `figata-admin` |
| `wrangler.jobs.jsonc` | Worker config for `figata-jobs` |

Important bindings across those configs:
- `ANALYTICS_BUCKET` -> R2 bucket for raw events + artifacts
- `PUBLISH_COORDINATOR` -> Durable Object binding for publish lock
- `FIGATA_ACCESS_*` vars -> Access validation config
- `OPENAI_API_KEY`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` -> worker secrets/vars

## Validation Guidance

Good default validation sweep after Cloudflare/runtime changes:

```bash
npm run build:cloudflare
npm run validate:analytics
npm run validate:analytics-ai-analyst
npm run validate:analytics-ai-reports
npm run check:admin-ui
npm test
```

If the change touches publish/data contracts, also run:

```bash
npm run validate:restaurant
npm run validate:reservations
npm run validate:media
```

## Legacy Notes

- `netlify.toml` and `netlify/functions/*` are legacy/archive context and are no longer the supported runtime path.
- `admin/cms/` is legacy/archive and excluded from Cloudflare deploys.

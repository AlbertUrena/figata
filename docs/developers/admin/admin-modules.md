# Admin Modules Reference

> **Read this doc when** modifying a specific admin module, adding a new one, or understanding how module APIs connect to `app.js`.

## Overview

All admin modules:
- are wrapped in an IIFE
- register on `window.FigataAdmin`
- expose a small public API
- receive app state through ctx factories or inline ctx objects

The module system did not change with the Cloudflare migration. What changed is the meaning of the auth, publish, and analytics modules.

## High-Impact Modules

| Module | Namespace | Purpose |
|------|-----------|---------|
| `constants.js` | `FigataAdmin.constants` | Shared endpoints, localStorage keys, timings, defaults |
| `auth.js` | `FigataAdmin.auth` | Cloudflare session helpers + localhost bypass |
| `drafts.js` | `FigataAdmin.drafts` | localStorage persistence for drafts |
| `publish.js` | `FigataAdmin.publish` | Validates drafts and submits to `/api/publish` |
| `dashboard.js` | `FigataAdmin.dashboard` | Analytics cards + AI analyst chat wiring |
| `navigation.js` | `FigataAdmin.navigation` | Panel FSM and motion helpers |
| `sidebar.js` | `FigataAdmin.sidebar` | Sidebar collapse, session menu, responsive sync |
| `accordion.js` | `FigataAdmin.accordion` | Sidebar accordion behaviors |
| `panels.js` | `FigataAdmin.panels` | Panel transitions and visibility |

## `constants.js`

Important runtime exports:
- `DATA_ENDPOINTS`
- `LOCAL_SAVE_DRAFTS_ENDPOINT`
- `DEV_AUTH_BYPASS_KEY`
- `CLOUDFLARE_SESSION_ENDPOINT`
- `CLOUDFLARE_PUBLISH_ENDPOINT`
- `CLOUDFLARE_ANALYTICS_SNAPSHOT_ENDPOINT`
- `CLOUDFLARE_AI_ANALYST_ENDPOINT`
- `CLOUDFLARE_LOGOUT_PATH`

## `auth.js`

The auth module no longer exposes a real identity widget. It now wraps the Cloudflare session model.

| Export | Signature | Purpose |
|------|-----------|---------|
| `getIdentity` | `()` | Legacy compatibility helper; returns `null` |
| `isLocalDevHost` | `()` | Detect localhost / 127.0.0.1 |
| `setDevAuthBypass` | `(enabled)` | Toggle local bypass in localStorage |
| `isDevAuthBypassEnabled` | `()` | Check current bypass state |
| `applyDevAuthBypassQueryToggle` | `()` | Reads `?devAuthBypass=1|0` |
| `createLocalBypassUser` | `()` | Builds synthetic local user payload |
| `buildRequestHeaders` | `()` | Builds no-store/session request headers |
| `fetchSession` | `()` | GET `/api/session` and return verified session payload |
| `beginLogin` | `()` | Reload into the Cloudflare Access gate |
| `logout` | `()` | Redirect to `/cdn-cgi/access/logout` |
| `getUserEmail` | `(user)` | Extract email from session payload |
| `getUserDisplayName` | `(user)` | Extract display name from session payload |

## `publish.js`

| Export | Signature | Purpose |
|------|-----------|---------|
| `publishChanges` | `(target, ctx)` | Validate drafts, lock UI, POST to `/api/publish`, render success/error state |

Key behavior changes after the Cloudflare migration:
- no JWT acquisition from the browser
- no `Authorization: Bearer ...` header
- request goes to `/api/publish`
- same client-side draft validations still run before submit

## `dashboard.js`

Main environment split:
- local dev -> `/__analytics/inspect`, `/__analytics/ai-analyst`
- Cloudflare preview/prod -> `/api/analytics/snapshot`, `/api/analytics/ai-analyst`

That keeps the dashboard code mostly unchanged while swapping the backend runtime.

## `drafts.js`

Still localStorage-based. The Cloudflare migration did not change draft persistence semantics.

## `navigation.js`, `sidebar.js`, `accordion.js`, `panels.js`

These modules remain UI/state modules. They do not depend on Netlify or Cloudflare directly.

## Adding a New Module

1. Create `admin/app/modules/<name>.js`
2. Wrap it in an IIFE
3. Register on `window.FigataAdmin`
4. Load it before `app.js` in `admin/app/index.html`
5. Add a delegate in `app.js`
6. Update this doc and `docs/developers/admin/admin-panel.md`

## Migration Notes

When touching admin modules, prefer Cloudflare terminology:
- say `session` instead of `identity widget`
- say `Access` instead of `Netlify Identity`
- say `/api/publish` instead of `/.netlify/functions/publish`

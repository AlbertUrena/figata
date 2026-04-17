# Analytics Heatmaps And Replay

> Read this doc when enabling Clarity/Hotjar-style UX evidence, wiring replay config on public routes, or running the biweekly replay review.

Canonical runtime: `shared/analytics-replay.js`

## Goal

Replay/heatmap capture exists to complement the quantitative funnel with visual evidence:
- dead clicks
- rage clicks
- ignored sections
- scroll drop-offs
- hesitation before CTA or cart actions

## Current Strategy

| Area | Decision |
|------|----------|
| Provider | `Microsoft Clarity` first |
| Runtime model | One shared public runtime, no route-local vendor snippets |
| Activation | Deferred async script injection after page load + idle window |
| Scope | Public routes only (`home`, `menu`, `menu_detail`, `eventos`, `nosotros`) |
| Internal traffic | Always excluded |
| Replay cadence | Quincenal (14 days) |
| Route filtering | Custom tags: `route_name`, `page_type`, `page_path`, `entry_source`, `visit_context`, `traffic_class`, `visitor_type` |

### Sampling note

Figata currently uses a **coupled conservative** mode for heatmaps/replay.

That means:
- one provider script powers both heatmaps and replay
- the runtime activates the provider only for the stricter replay sample (`5%`)
- heatmaps therefore build from the same conservative sampled sessions until Figata adopts a split-capable setup later

This keeps privacy and client weight aligned with governance instead of overcapturing sessions just to grow heatmaps faster.

## Runtime Files

| File | Responsibility |
|------|----------------|
| `shared/analytics-replay.js` | Provider config resolution, sampling, deferred load, route tags, replay review checklist |
| `shared/public-analytics.js` | Emits `figata:analytics-page-context` so replay tooling can retag same-document route changes |
| `shared/analytics-config.js` | Architecture defaults for provider, route allowlist, review cadence, and deferred load timing |
| `shared/analytics-taxonomy.js` | Canonical `replay_sampled` event contract |
| `scripts/validate-analytics-replay.js` | Static validation for provider defaults, route allowlist, and sampling behavior |

## Public Load Order

Load replay after the analytics SDK/performance runtime and before `shared/public-analytics.js`.

```html
<script src="shared/analytics-sdk.js" defer></script>
<script src="shared/analytics-performance.js" defer></script>
<script src="shared/analytics-replay.js" defer></script>
<script src="shared/public-analytics.js" defer></script>
```

That order lets replay listen for the first `figata:analytics-page-context` event without duplicating route logic.

## Production Activation

Replay is now configured centrally through `shared/analytics-config.js` for the public production site.

The supported optional bootstrap override is:

```html
<script>
  window.__FIGATA_ANALYTICS_REPLAY_CONFIG = {
    provider: 'clarity',
    projectId: 'YOUR_CLARITY_PROJECT_ID',
    consentV2: {
      analytics_Storage: 'granted',
      ad_Storage: 'denied'
    }
  };
</script>
```

Notes:
- the default Clarity project id is centralized in `shared/analytics-config.js` (`UX_EVIDENCE.projectId`)
- `projectId` can also come from `window.__FIGATA_CLARITY_PROJECT_ID`
- `consentV2` is optional; use it only if the deployment already has a consent gate
- if no id is configured, the runtime reports `missing_project_id` and does not load any third-party script

## Privacy And Masking

The runtime applies `data-clarity-mask="true"` to:
- `input`
- `textarea`
- `select`
- `[contenteditable="true"]`
- `[data-analytics-sensitive]`

Operational rules:
- never review internal/admin sessions as product evidence
- do not copy customer-entered text into tickets or docs
- when a replay reveals an issue, describe the pattern, not the person/session narrative

## Route Panels

Use provider filters with these tags:

| Panel | Route filter | Why |
|------|--------------|-----|
| Homepage acquisition | `route_name=home` | Detect ignored hero/featured CTA zones |
| Menu exploration | `route_name=menu` or `menu_detail` | Detect confusion before detail open, cart, and checkout intent |
| Eventos storytelling | `route_name=eventos` | Detect abandonment inside cotizador or CTA dead zones |
| Brand / trust | `route_name=nosotros` | Detect scroll loss before social proof / story blocks |

Recommended saved views:
- `route_name=menu_detail`
- `route_name=eventos`
- `entry_source=qr`
- `visit_context=in_restaurant_probable`

## Biweekly Review Protocol

1. Start from KPI anomaly or funnel drop, not from random recordings.
2. Filter by `route_name`, `page_path`, and acquisition segment.
3. Review rage/dead clicks before general scroll behavior.
4. Capture one evidence clip or heatmap snapshot per finding.
5. Translate each finding into backlog language with:
   - route
   - affected UI block
   - expected behavior
   - observed behavior
   - impacted metric/KPI
   - owner
6. Close the review with one of: `fix`, `experiment`, `monitor`, `discard`.

## Backlog Translation Template

| Field | Example |
|------|---------|
| Route | `/menu/margherita` |
| Evidence | Rage clicks on gallery image expecting zoom |
| Quant signal | `item_detail_open -> add_to_cart` below baseline |
| Hypothesis | Gallery affordance suggests zoom but none exists |
| Action | Add zoom affordance or disable misleading cursor treatment |
| Owner | Frontend |
| Review date | Next quincenal UX review |

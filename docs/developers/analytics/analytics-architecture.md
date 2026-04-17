# Analytics Architecture

> Read this doc when planning analytics work, adding new routes or CTAs, or deciding how client capture, transport, modeling, and reporting fit together.

## Objective

Figata analytics exists to answer business questions without turning the public site into a heavy client. The system is designed around one reusable runtime, one canonical event envelope, and a clear separation between capture, transport, modeling, and consumption.

## Business Questions

Analytics v1 must answer:
- Which channels bring visits with real intent?
- Which pages, sections, and CTAs move users toward contact, booking, or order intent?
- Which menu items generate curiosity, consideration, add-to-cart, and purchase?
- Which sessions are new, recurrent, in-store, remote, internal, or QA?
- Which routes and assets degrade performance enough to hurt intent?

Analytics v2 extends that to:
- Cohorts, recurrence, and return quality by channel.
- Editorial/content influence on decision-making.
- Heatmaps, replay, AI summaries, and lightweight experimentation.

## Operating Principles

- One client runtime: all public routes emit through the same SDK.
- Low overhead first: deferred boot, batching, `sendBeacon`/`keepalive`, throttled scroll, sampled replay.
- Pseudonymous only: no direct PII, no aggressive fingerprinting, no exact location storage.
- Environment-aware: `dev`, `preview`, and `prod` do not behave the same.
- Route-agnostic foundation: a new route such as `/reservas` should only need route config + instrumentation hooks, not a rewrite.
- Strict contracts: events that do not pass taxonomy, contract, and governance rules are dropped or quarantined.

## System Layers

| Layer | Responsibility | Primary artifacts |
|------|----------------|-------------------|
| Capture | Observe browser behavior and user intent with shared context | `shared/analytics-config.js`, `shared/analytics-taxonomy.js`, `shared/analytics-contract.js`, future SDK/runtime modules |
| Transport | Queue, batch, retry, and deliver envelopes without blocking UX | future client SDK + local/dev endpoint + production ingest endpoint |
| Modeling | Normalize raw payloads into visitors, sessions, events, sources, and curated facts | future ingest pipeline + warehouse transforms |
| Exploitation | Dashboards, AI reports, replay, experimentation, admin chat | future PBIs 17-22 |

## End-to-End Flow

```text
Public Route
  -> route plugin decides what to observe
  -> shared SDK enriches event with visitor/session/source/context/internal flags
  -> governance filter removes forbidden payload fields
  -> transport queue batches events and flushes with beacon/fetch keepalive
  -> ingest endpoint writes raw event log
  -> raw events are normalized to curated facts
  -> dashboards / AI / replay / experiments read curated datasets
```

## Component Map

| Component | Role | Notes |
|----------|------|-------|
| `shared/analytics-config.js` | Architecture constants, environment resolution, route registry | Includes future route placeholders such as `/reservas` |
| `shared/analytics-taxonomy.js` | Canonical event and property dictionary | Single naming authority |
| `shared/analytics-contract.js` | Envelope validation, type checks, idempotency helpers | Shared by runtime and validators |
| `shared/analytics-governance.js` | Privacy, retention, access, prohibited fields, traffic policy | Shared by runtime and pipeline |
| `shared/analytics-sdk.js` | Runtime entrypoint for `track`, queueing, batching, and flush | Shared by all public routes and local ingest validation |
| `shared/analytics-performance.js` | Runtime for network sampling, route-ready marks, and asset timing | Shared by all public routes; route scripts only add lightweight marks |
| `shared/analytics-wifi-assist.js` | Runtime for QR-session Wi-Fi Assist UX and visit-context reinforcement | Mounted on `/menu` and `/eventos`; upgrades `visit_context` when stronger local-network signals appear |
| `shared/analytics-commerce.js` | Shared commerce funnel instrumentation helpers | Owns reusable `item_impression` / cart / checkout / purchase helpers for home + menu |
| `shared/analytics-pipeline.js` | Shared raw→curated ETL helpers for local ingest modeling | Used by the dev inspector, CLI runner, and pipeline validator |
| `shared/analytics-kpi-catalog.js` | Official KPI definitions, derived formulas, segment rollups, and leaderboard helpers | Consumed by CLI exports, local inspect snapshots, and downstream dashboard work |
| `shared/analytics-cohorts.js` | Advanced cohort, retention, timing, and performance-context rollups | Powers Dashboard v2 without duplicating logic in the admin UI |
| `shared/analytics-replay.js` | Deferred heatmap/session-replay provider runtime with route tags, masking, and sampling guards | Clarity-first today; project id is centralized in `shared/analytics-config.js` and still fail-closes if removed/overridden empty |
| `shared/analytics-ai-reports.js` | Shared period windows, AI payload preparation, prompt guardrails, and Markdown/HTML report rendering | Keeps weekly/monthly AI reporting on validated aggregates instead of raw event logs |
| `shared/analytics-ai-analyst.js` | Shared AI analyst retrieval, memory trimming, structured-answer normalization, and prompt planning | Powers the admin chat using latest AI report artifacts plus the live snapshot payload when available |
| `shared/analytics-optimization.js` | Shared experiment backlog, lightweight recommendation lists, and decision-log rendering | Converts validated KPI/cohort snapshots into a repeatable optimization review instead of ad-hoc product guesses |
| `scripts/run-analytics-pipeline.js` | Local ETL runner for partitioned raw/curated outputs | Default source is the dev NDJSON log; supports date-window backfill |
| `scripts/run-analytics-kpi-catalog.js` | Local KPI export runner for JSON/Markdown snapshots | Reuses curated facts instead of duplicating dashboard formulas |
| `scripts/run-analytics-ai-report.js` | Weekly/monthly executive report job with source payload history + AI/mock provider modes | Stores JSON, Markdown, HTML, prompt metadata, and distribution manifests per period |
| `scripts/run-analytics-optimization.js` | Optimization snapshot job for experiment backlog + recommendation lists | Writes backlog, template, recommendation, decision-log, and Markdown review artifacts |
| `cloudflare/public/worker.js` | Production/preview analytics ingest endpoint | Validates batched browser events and stores raw NDJSON batches in R2 |
| `cloudflare/common/analytics-snapshot.js` | Shared snapshot builder for Cloudflare Admin and jobs | Reads raw R2 partitions and derives curated, quality, KPI, and cohort payloads |
| `cloudflare/common/analytics-report-service.js` | Shared R2 report/artifact service | Loads latest AI reports and writes weekly/monthly/optimization artifacts |
| `cloudflare/admin/worker.js` | Admin analytics API runtime | Serves `/api/session`, `/api/analytics/snapshot`, `/api/analytics/ai-analyst`, and `/api/publish` |
| `cloudflare/jobs/worker.js` | Scheduled analytics/report runtime | Runs weekly/monthly AI reports and optimization refresh in Cloudflare |
| `events_fact` / `sessions_fact` / `visitors_fact` | Curated operational facts | Built locally now; future warehouse can reuse the same contract semantics |

## Environment Strategy

Environment resolution precedence:
1. Explicit override in HTML or bootstrap global.
2. Hostname/path heuristics.
3. Fallback to `prod` only when no safer classification applies.

| Environment | Typical hosts | Emission policy | Default traffic class |
|------------|---------------|-----------------|-----------------------|
| `dev` | `localhost`, `127.0.0.1`, local files | Local debug + local ingest only | `development` |
| `preview` | ephemeral deploy URLs, QA links, `*.pages.dev`, `*.netlify.app`, `*.github.io` unless overridden | Batched ingest allowed, excluded from business dashboards by default | `preview` |
| `prod` | approved production hosts or explicit override | Full runtime + business reporting | `public` |

## Ownership Matrix

| Area | Owner | Supporting roles |
|------|-------|------------------|
| Client SDK and route instrumentation | Frontend | Product, Data |
| Ingest endpoint and transport guarantees | Backend/Platform | Frontend, Data |
| Curated modeling and KPI semantics | Data | Product |
| KPI approval and rollout decisions | Product/Business | Frontend, Data |
| Privacy, retention, internal-traffic policy | Product + Platform | Data |

## V1 vs V2 Boundary

| Scope | Included in V1 | Deferred to V2 |
|------|----------------|----------------|
| Capture | Core lifecycle, source, CTA, menu funnel, editorial, performance, Wi-Fi context | Advanced experimentation and AI usage telemetry |
| Identity | Pseudonymous `visitor_id` and `session_id` | Any CRM or nominal joins |
| Reporting | Operational funnel + KPI dashboards | Cohorts, retention intelligence, AI narratives |
| UX evidence | Sampling hooks, governance, and shared route tags for replay | Replay/heatmap tooling activation through `shared/analytics-replay.js` |

## Rollout Phases

| Phase | PBIs | Go / no-go criteria |
|------|------|----------------------|
| Foundation | 01-04 | Architecture, taxonomy, contracts, governance validated |
| Reliable capture | 05-13 | Shared SDK, identity, source, exclusions, base instrumentation live |
| Data platform | 14-16 | Raw-to-curated pipeline stable, quality checks green, KPI catalog approved |
| Exploitation | 17-19 | Dashboards and replay operate on trusted datasets |
| Intelligence | 20-22 | AI/reporting uses guarded, validated aggregates |

## Readiness Checklist

Instrumentation can start only when all are true:
- Shared architecture doc exists and is current.
- Event taxonomy has one canonical definition per event.
- Envelope contract covers visitor, session, source, and event relationships.
- Governance forbids PII and defines retention/access.
- Route registry covers current public routes and future placeholders.
- Validation tooling can fail the build locally when analytics artifacts drift.

## Public Route Coverage

The shared public runtime in `shared/public-analytics.js` owns the base route matrix for the current public site.

| Route | Lifecycle | CTA / nav | Section / scroll | Notes |
|------|-----------|-----------|------------------|-------|
| `/` | `session_start`, `page_view`, `page_exit`, `source_attribution_resolved` | `nav_link_click`, `cta_click`, compatibility CTA aliases, `burger_menu_toggle` | `section_view`, `scroll_milestone` | Homepage featured cards extend this with commerce `item_impression` and desktop preview `item_detail_open` through `shared/analytics-commerce.js` |
| `/menu` | `session_start`, `page_view`, `page_exit`, `source_attribution_resolved` | `nav_link_click`, `cta_click`, compatibility CTA aliases, `burger_menu_toggle` | `menu_section_view`, `scroll_milestone` | Catalog/detail/account flows extend this with `item_impression`, `item_detail_open`, `add_to_cart`, `remove_from_cart`, `cart_view`, `begin_checkout`, `purchase`, editorial decision events, and QR-session Wi-Fi Assist (`wifi_assist_shown`, `wifi_assist_dismissed`, `wifi_assist_copy_password`, `wifi_assist_cta_click`, `visit_context_confirmed`) |
| `/eventos` | `session_start`, `page_view`, `page_exit`, `source_attribution_resolved` | `nav_link_click`, `cta_click`, compatibility CTA aliases, `burger_menu_toggle` | `section_view`, `scroll_milestone` | Editorial and cotizador-specific events extend this in later PBIs; QR sessions also reuse `shared/analytics-wifi-assist.js` so in-store flows stay centralized |
| `/nosotros` | `session_start`, `page_view`, `page_exit`, `source_attribution_resolved` | `nav_link_click`, `cta_click`, compatibility CTA aliases, `burger_menu_toggle` | `section_view`, `scroll_milestone` | Uses the same shared runtime even with route-local loaders |

Vanity paths `/ig`, `/qr`, and `/wsp` are acquisition entry helpers, not content routes. They redirect into canonical public routes while preserving UTM and visit-context hints for the attribution layer.

## Local QA Support

During local development, `scripts/dev-server.js` exposes `/__analytics/inspect` (and the Cloudflare-compatible alias `/api/analytics/snapshot`) with:
- the parsed recent event log
- a `curatedSnapshot` for the current inspect window (`events_fact`, `sessions_fact`, `visitors_fact`, manifest)
- a `kpiSnapshot` with official global KPIs, standard segment rollups, and leaderboard helpers
- a `cohortSnapshot` with retention windows, timing rows, performance-context buckets, and curiosity items
- a derived `decisionSummary` grouped by session/source/result
- a derived `inStoreSummary` grouped by session/context/Wi-Fi Assist flow
- a derived `performanceBaseline` grouped by route with percentiles + heavy assets

That summary is intentionally lightweight and local-only; it helps validate PBIs 10-13 before the warehouse models in PBIs 14-16 exist.

## Decisions Locked By This Version

- `visitor_id`, `session_id`, `entry_source`, and `visit_context` are first-class model fields.
- Internal traffic is never mixed into business reporting by default.
- The client runtime emits one canonical envelope regardless of page.
- Preview traffic is observable but excluded from operational KPIs unless explicitly included.
- Future routes plug into the route catalog instead of inventing route-local tracking models.

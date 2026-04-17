# Analytics Data Model

> Read this doc when designing event payloads, ingest schemas, deduplication rules, or curated analytics tables.

Canonical source of truth:
- `shared/analytics-contract.js`
- `shared/analytics-taxonomy.js`
- `shared/analytics-governance.js`

## Core Entities

| Entity | Grain | Key fields |
|-------|-------|------------|
| `visitors` | One pseudonymous browser identity | `visitor_id`, `first_seen_at`, `last_seen_at`, `is_returning_visitor` |
| `sessions` | One active visit window | `session_id`, `visitor_id`, `session_sequence`, `started_at`, `ended_at`, `entry_source`, `visit_context` |
| `events` | One canonical analytics envelope | `event_id`, `session_id`, `visitor_id`, `event_name`, `occurred_at` |
| `sources` | One attribution snapshot per session | `session_id`, `entry_source`, `entry_source_detail`, `source_medium`, `source_campaign`, `referrer_host` |

## Relationship Model

```text
visitor (1)
  -> sessions (many)
    -> events (many)
    -> source snapshot (1 current canonical entry source per session)
```

The model must always support reconstructing:
- first touch by visitor,
- current session source/context,
- event sequence within a session,
- commercial funnel per item/category/channel.

`visit_context` is session-scoped but can be promoted during the same session when stronger evidence appears. Example: a QR session may start as `in_restaurant_probable` and later become `in_restaurant_confirmed_wifi`; downstream models should keep both the final context and the transition timeline.

## Canonical Event Envelope

The canonical event payload has three layers:

1. Envelope metadata
- `event_id`
- `event_name`
- `event_version`
- `schema_version`
- `occurred_at`
- `sent_at`
- `transport_name`

2. Session and route context
- `visitor_id`
- `session_id`
- `session_sequence`
- `entry_source`
- `entry_source_detail`
- `visit_context`
- `visit_context_confidence`
- `environment`
- `is_internal`
- `traffic_class`
- `page_path`
- `page_type`
- `route_name`
- `site_section`
- `navigation_type`

3. Event-specific properties
- Defined per event in `shared/analytics-taxonomy.js`
- Validated and normalized by `shared/analytics-contract.js`

## Enumerations

| Field | Allowed values |
|------|----------------|
| `entry_source` | `direct`, `instagram`, `qr`, `whatsapp`, `google`, `events`, `delivery`, `referral`, `unknown` |
| `visit_context` | `remote`, `in_restaurant_probable`, `in_restaurant_confirmed_wifi`, `delivery_intent`, `events_intent`, `unknown` |
| `traffic_class` | `public`, `internal`, `preview`, `development`, `admin`, `automation` |
| `navigation_type` | `hard`, `soft`, `reload`, `restore`, `back_forward`, `unknown` |

## Idempotency And Deduplication

Each event definition declares idempotency fields.

| Event family | Recommended dedupe grain |
|-------------|---------------------------|
| Lifecycle | `session_id + page_path + navigation_type` |
| Scroll / section | `session_id + page_path + section_id/milestone` |
| Menu impression | `session_id + item_id + list_id + list_position` |
| Detail / editorial | `session_id + item_id + detail_origin + media/story/pairing id` |
| Cart / checkout | `session_id + item_id + quantity + cart_id/order_id` |
| Performance | `session_id + route_name + metric window` |

Rules:
- `event_id` is always unique at emission time.
- Idempotency key is used by ingest to collapse repeated deliveries.
- Raw duplicates are retained for audit only if the warehouse supports quarantine; curated facts keep the latest valid representative.

## Contract Rules

- Required properties must be present and typed.
- Unknown properties are allowed only when prefixed as approved extension fields or explicitly listed in the event definition.
- Strings are trimmed.
- Undefined values are dropped before transport.
- Prohibited fields and PII-like values fail validation.

## Curated Tables

| Table | Purpose |
|------|---------|
| `analytics_events_fact` | Canonical row per accepted event |
| `analytics_sessions_fact` | Session-level source/context/performance rollups |
| `analytics_visitors_fact` | Visitor recurrence and cohort base |
| `analytics_sources_dim` | Normalized channel and attribution mapping |
| `analytics_items_funnel_fact` | Item/category funnel transitions |
| `analytics_performance_fact` | Route and asset timing for correlation |

The local pipeline currently materializes the foundational facts as `events_fact`, `sessions_fact`, and `visitors_fact`. Dimensional refinements such as `sources_dim`, `items_funnel_fact`, and `performance_fact` remain part of PBIs 15-16.

## KPI Layer

`shared/analytics-kpi-catalog.js` is the official semantic layer on top of curated facts.

It standardizes:
- KPI definitions and formulas
- base vs derived metric labeling
- standard windows (`daily`, `weekly`, `monthly`)
- standard segments (`entry_source`, `visit_context`, `visitor_type`, `route_name`)

`device_type` remains a planned segment until the shared analytics envelope persists it into curated facts. Dashboards should keep the filter disabled instead of inventing an ungoverned fallback.

## Contract Testing

Local validation must confirm:
- every event references known properties,
- example payloads satisfy the envelope contract,
- idempotency fields exist in each event definition,
- governance blocks disallowed fields and values.

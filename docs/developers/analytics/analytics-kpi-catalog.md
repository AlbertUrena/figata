# Analytics KPI Catalog

> Read this doc when defining official analytics KPIs, generating derived metric snapshots, or building dashboards/reporting surfaces on top of curated analytics data.

## Purpose

PBI 16 turns the curated analytics facts into one reusable KPI catalog so dashboards, AI reports, and future admin surfaces all speak the same metric language.

Primary artifacts:
- `shared/analytics-kpi-catalog.js` — canonical KPI definitions, formulas, segments, and snapshot builders
- `scripts/run-analytics-kpi-catalog.js` — generates `kpi-catalog.json` + `kpi-catalog.md`
- `scripts/validate-analytics-kpi-catalog.js` — fixture-based validation for KPI formulas, business validation metadata, and planned device segmentation

## Reporting Scope

The catalog supports two explicit scope modes:
- `all_traffic` — includes dev/preview/internal rows so local QA remains observable
- `business_only` — excludes `internal`, `admin`, `preview`, `development`, and `automation`

Dashboards and executive reporting should default to `business_only`. Local validation can use `all_traffic`.

## Standard Windows

- `daily` — day-level operational reading
- `weekly` — default operating review
- `monthly` — executive and trend review

## Standard Segments

Currently available:
- `entry_source`
- `visit_context`
- `visitor_type`
- `route_name`

Planned:
- `device_type`

`device_type` stays explicitly flagged as `planned` until the shared analytics envelope persists that dimension into curated facts. Any dashboard that exposes the filter should render it disabled until then instead of inventing a local fallback.

## KPI Families

The catalog groups metrics into:
- acquisition
- behavior
- commerce
- decision
- operation
- performance

Every KPI includes:
- `id`
- `label`
- `family`
- `type` (`base` or `derived`)
- `formula`
- `purpose`
- `sourceTables`
- `sourceEvents`
- `windows`
- `segments`
- `businessValidation`

## Priority KPIs

The current priority set covers:
- `sessions_total`
- `unique_visitors_total`
- `returning_visitor_rate`
- `qr_session_share`
- `cta_click_total`
- `cta_engagement_rate`
- `item_impression_total`
- `item_detail_open_total`
- `detail_open_session_rate`
- `detail_opens_per_session`
- `unique_detail_opens_per_session`
- `add_to_cart_total`
- `detail_to_cart_session_rate`
- `begin_checkout_total`
- `cart_to_checkout_session_rate`
- `purchase_total`
- `purchase_session_rate`
- `checkout_to_purchase_session_rate`
- `purchase_value_total`
- `average_order_value`
- `detail_opens_before_purchase`
- `time_from_first_detail_to_purchase_ms`
- `in_store_confirmation_rate`
- `average_route_ready_ms`
- `slow_session_rate`
- `fast_route_purchase_session_rate`
- `slow_route_purchase_session_rate`
- `performance_conversion_gap`

Derived metrics are explicitly labeled as `type = derived` both in the code catalog and in the generated Markdown export.

## Business Validation

Priority KPIs carry `businessValidation` metadata tied to the roadmap inputs:
- `analytics PBI/V1.md`
- `analytics PBI/V2.md`
- `analytics PBI/Comportamiento de decision en el menu.md`

This is the contract that keeps dashboards/reporting aligned with the product/business intent of the analytics roadmap.

## Outputs

Generate a reusable snapshot with:

```bash
npm run analytics:kpis
```

Optional flags:
- `--input=/absolute/path/events.ndjson`
- `--output=/absolute/path/output-dir`
- `--from=YYYY-MM-DD`
- `--to=YYYY-MM-DD`
- `--business-only=true`

Outputs:
- `kpi-catalog.json`
- `kpi-catalog.md`

## Local Inspect Support

`/__analytics/inspect` now includes `kpiSnapshot` so Chrome QA can validate:
- global KPI values
- segment-level KPI rollups
- item leaderboards
- CTA leaderboards

It also accepts `scope`, `from`, `to`, and `entry_source` filters so the admin dashboard in PBI 17 can request business-only or QA-inclusive KPI snapshots without reimplementing formulas in the browser.

This is the handoff surface for PBI 17 dashboard work.

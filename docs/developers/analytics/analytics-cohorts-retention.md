# Analytics Cohorts And Retention

> Read this doc when extending Dashboard v2, validating cohort/retention logic, or correlating timing/performance context with conversion.

## Purpose

PBI 18 adds an advanced snapshot on top of curated analytics so the admin dashboard can explain _who_ is returning, _when_ intent happens, and _how_ network/performance quality changes those outcomes.

Primary artifacts:
- `shared/analytics-cohorts.js` — cohort, retention, timing, performance-context, and curiosity rollups
- `scripts/validate-analytics-cohorts.js` — fixture-based validation for retention windows, timing rows, network context, and high-curiosity/low-conversion items

## Snapshot Contents

`cohortSnapshot` currently exposes:
- `cohorts.by_visitor_type`
- `cohorts.by_entry_source`
- `retention.overall`
- `retention.by_entry_source`
- `timing.by_hour`
- `timing.by_day_of_week`
- `performance_context.by_network_type`
- `performance_context.by_speed_bucket`
- `curiosity_items`

## Scope And Filters

The snapshot follows the same filters used by Dashboard v1:
- `scope=business_only|all_traffic`
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `entry_source=...`

The same planned limitation still applies:
- `device_type` is not yet persisted in curated analytics, so device filtering stays disabled in the dashboard even though the UI reserves the control.

## Retention Rules

Current retention is computed on visitor return windows:
- `return_1d_rate`
- `return_7d_rate`
- `return_30d_rate`
- `average_sessions_per_visitor`

The visitor is bucketed by the entry source of the first visible session in the current filtered window.

## Timing And Performance Context

Timing views summarize:
- sessions by local hour
- sessions by local day of week
- detail-open session rate
- purchase session rate

Performance-context views summarize:
- purchase session rate by `network_effective_type`
- purchase/detail-open rates by route-ready speed bucket (`fast`, `steady`, `slow`)

## Curiosity Items

`curiosity_items` highlights plates with:
- strong detail-open activity
- weak or zero purchase follow-through

This table is meant for diagnosis, not for claiming causal truth. Any change recommendation should still be validated through content/design/product review before experimentation.

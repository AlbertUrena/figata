# Analytics Quality And Observability

> Read this doc when validating dataset health, triaging analytics incidents, or reviewing local alert snapshots.

## Purpose

PBI 15 adds a quality layer on top of the raw→curated pipeline so dashboards, KPI catalogs, and AI reports do not rely on silently broken data.

Primary artifacts:
- `shared/analytics-quality.js` — reusable health checks and Markdown report rendering
- `scripts/run-analytics-health-report.js` — generates `quality-snapshot.json` + `health-report.md`
- `scripts/validate-analytics-quality.js` — fixture-based validation for missing-core-event, quarantine, and internal-audit alerts

## Health Checks

Current checks:
- `quarantine_nonzero` — invalid payloads were rejected into `raw/quarantine`
- `duplicate_rate_warn` / `duplicate_rate_high` — duplicate pressure from `event_id` + `idempotency_key`
- `freshness_lag` — latest event is older than the freshness threshold
- `core_event_missing` — one of `session_start`, `page_view`, `source_attribution_resolved` is absent
- `critical_nulls` — curated rows are missing required analytics dimensions
- `internal_audit_failed` — `is_internal=true` leaked into rows marked as `traffic_class=public`
- funnel consistency alerts when downstream events appear without upstream intent events

## Inspect Snapshot

`/__analytics/inspect` now includes:
- `curatedSnapshot`
- `qualitySnapshot`
- `kpiSnapshot`
- `decisionSummary`
- `inStoreSummary`
- `performanceBaseline`

This is the fastest local observability surface while PBIs 16-20 are still being built.

## Health Report

```bash
npm run analytics:health-report
```

Optional flags:
- `--input=/absolute/path/events.ndjson`
- `--output=/absolute/path/output-dir`
- `--from=YYYY-MM-DD`
- `--to=YYYY-MM-DD`

Outputs:
- `quality-snapshot.json`
- `health-report.md`

## Weekly Cadence

Recommended weekly flow:
1. Run `npm run analytics:curate -- --from=YYYY-MM-DD --to=YYYY-MM-DD` for the reporting window.
2. Run `npm run analytics:health-report -- --from=YYYY-MM-DD --to=YYYY-MM-DD`.
3. Review `qualitySnapshot.status` and alert list before publishing dashboards or AI narratives.
4. Record any accepted residual risk next to the reporting deliverable.

## Incident Playbook

1. Confirm whether the issue is `quarantine`, duplicates, freshness, or missing core coverage.
2. Inspect `qualitySnapshot.alerts` and compare against `curatedSnapshot.manifest`.
3. If the issue is route-local, reproduce it in Chrome and confirm the payload in `events[]`.
4. Re-run `npm run validate:analytics`, `npm run validate:analytics-pipeline`, and `npm run validate:analytics-quality`.
5. Reprocess only the affected date window with `npm run analytics:curate -- --from=... --to=...`.
6. Regenerate the health report and only resume downstream reporting once the status is back to `ok` or the risk is documented.

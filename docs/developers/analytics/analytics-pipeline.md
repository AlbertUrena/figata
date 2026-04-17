# Analytics Pipeline

> Read this doc when running the local analytics ETL, debugging raw vs curated outputs, or preparing downstream KPI/dashboard work.

## Purpose

PBI 14 turns public analytics events into a local `raw -> curated` pipeline so the repo can answer funnel, recurrence, performance, and in-store questions before a warehouse exists.

Primary artifacts:
- `shared/analytics-pipeline.js` — reusable normalization, dedupe, partitioning, and aggregation helpers
- `scripts/run-analytics-pipeline.js` — CLI runner that reads NDJSON raw events and writes partitioned outputs
- `scripts/validate-analytics-pipeline.js` — fixture-based validator for dedupe, curated facts, and backfill safety

## Flow

```text
raw NDJSON
  -> parse lines
  -> validate with analytics contract + governance
  -> keep accepted rows in raw layer
  -> quarantine invalid rows
  -> dedupe by event_id + idempotency_key
  -> build curated events_fact
  -> aggregate sessions_fact
  -> aggregate visitors_fact
  -> write partitioned outputs + manifest
```

## Default CLI

```bash
npm run analytics:curate
npm run validate:analytics-pipeline
```

Runner options:
- `--input=/absolute/path/events.ndjson` to override the raw source file
- `--output=/absolute/path/output-dir` to override the output root
- `--from=YYYY-MM-DD` to backfill/reprocess only partitions on or after a date
- `--to=YYYY-MM-DD` to backfill/reprocess only partitions on or before a date

Default paths:
- input: `${TMPDIR}/figata-analytics-dev.ndjson`
- output: `analytics-output/latest/`

## Output Layout

```text
analytics-output/latest/
├── manifests/
│   └── latest-run.json
├── raw/
│   ├── events/date=YYYY-MM-DD/events.ndjson
│   └── quarantine/date=YYYY-MM-DD/quarantine.ndjson
└── curated/
    ├── events_fact/date=YYYY-MM-DD/events.ndjson
    ├── sessions_fact/date=YYYY-MM-DD/sessions.ndjson
    ├── visitors_fact/date=YYYY-MM-DD/visitors.ndjson
    └── summary.json
```

## Raw Layer

`raw/events/*` keeps every accepted payload after contract/governance validation.

Each row includes:
- `processed_at`
- `partition_date`
- `event_id`
- `idempotency_key`
- `validation_status`
- `duplicate_reason`
- `curated_included`
- `payload`

`raw/quarantine/*` keeps rejected rows with parse/contract errors for controlled reprocessing.

## Curated Tables

### `events_fact`

Grain: one canonical representative event after dedupe.

Includes:
- the full sanitized event payload
- `partition_date`
- `idempotency_key`
- `event_family`
- `event_stage`
- `event_status`
- `processed_at`

### `sessions_fact`

Grain: one session.

Includes:
- attribution snapshot (`entry_source`, `source_medium`, etc.)
- `visit_context_initial`, `visit_context_final`, `visit_context_history`
- route/path coverage
- funnel counts (`item_detail_open`, `add_to_cart`, `purchase`, etc.)
- performance averages (`route_ready`, `fcp`, `dom_interactive`)
- Wi-Fi Assist counts (`shown`, `dismissed`, `copy`, `cta`, `confirmed`)
- revenue rollups (`purchase_count`, `purchase_value_total`)

### `visitors_fact`

Grain: one pseudonymous visitor.

Includes:
- `first_seen_at`, `last_seen_at`
- `session_count`, `returning_session_count`
- total events / purchases / purchase value
- unique entry sources and visit contexts
- `has_in_restaurant_visit`
- `has_confirmed_wifi_session`

## Dedupe Rules

The pipeline applies two checks:
- `event_id` duplicates are kept in raw but excluded from curated output
- `idempotency_key` duplicates keep the latest valid representative in curated output

This mirrors the contract rules already enforced client-side while keeping raw auditability for PBI 15.

## Backfill / Reprocess

Controlled reprocessing is date-window based.

Recommended pattern:

```bash
npm run analytics:curate -- --from=2026-04-15 --to=2026-04-16
```

This rewrites only the requested partition files in the output directory without resetting unrelated files.

## Local QA Support

`/__analytics/inspect` now exposes `curatedSnapshot` for the recent event window so PBIs 14-16 can be checked in Chrome without leaving the local dev server.

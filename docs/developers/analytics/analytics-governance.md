# Analytics Governance

> Read this doc when deciding what data can be collected, how long it may be kept, who can access it, and how internal traffic is treated.

Canonical source of truth: `shared/analytics-governance.js`

## Privacy Model

Figata analytics is pseudonymous by design.

Allowed:
- pseudonymous `visitor_id` and `session_id`
- coarse source and context classification
- route, CTA, menu, and performance behavior
- coarse geolocation only if provided by provider at country/city level later in the pipeline

Forbidden:
- names, emails, phones, exact addresses
- exact GPS coordinates
- payment card data
- free-text fields that could capture customer PII without sanitization
- fingerprinting techniques beyond stable local identifiers needed for recurrence

## Data Classification

| Class | Examples | Handling |
|------|----------|----------|
| Operational pseudonymous | `visitor_id`, `session_id`, `entry_source`, `page_path` | Allowed in raw + curated datasets |
| Sensitive business | revenue, item conversion, AI report outputs | Restricted to approved admin/reporting roles |
| Prohibited | email, phone, exact address, card data | Must never be stored |

## Retention Policy

| Entity / dataset | Retention | Notes |
|------------------|-----------|-------|
| Raw ingest events | 14 days | Enough for replay, reprocessing, incident triage |
| Curated events fact | 395 days | Covers year-over-year comparison |
| Sessions fact | 395 days | Supports recurrence and timing analysis |
| Visitors fact | 395 days rolling | Pseudonymous recurrence window |
| Heatmap / replay sessions | 30 days | Sampled only, exclude internal traffic |
| AI report payload snapshots | 180 days | Auditability for generated narratives |

## Access Policy

| Role | Allowed detail |
|-----|----------------|
| Product / Business | Curated dashboards, aggregated exports |
| Frontend | Raw sample payloads for debugging + curated aggregates |
| Data / Platform | Raw and curated datasets for maintenance |
| Exec summaries | Aggregated/anonymized reporting only |

## Internal Traffic Policy

Internal traffic must always carry:
- `is_internal = true`
- `traffic_class` set to `internal`, `preview`, `development`, `admin`, or `automation`

Sources of internal classification:
- localhost/dev hosts
- preview environments
- admin surface
- explicit opt-in via query, local storage, or cookie
- future authenticated admin/staff role hooks

Operational rule:
- dashboards and AI reports exclude `is_internal = true` by default.
- audits must retain counts of excluded traffic by day and class.

## Sampling Policy

| Surface | Default sample rate | Internal traffic |
|--------|----------------------|------------------|
| Core event tracking | 100% | Kept but flagged/excluded |
| Heatmaps | 20% | 0% |
| Session replay | 5% | 0% |
| AI/admin usage telemetry | 100% | Kept inside admin dataset only |

Current implementation note:
- `shared/analytics-replay.js` runs in `coupled_conservative` mode with one provider script for both heatmaps and replay.
- Because that provider load is coupled, the runtime uses the stricter replay sample as the activation gate until Figata adopts a split-capable setup later.

## Incident Rules

If governance validation fails:
- drop the event from business transport,
- log locally in dev/preview,
- count the rejection by rule ID,
- investigate before re-enabling if the issue appears in production.

## Review Checklist

Before enabling a new event or vendor:
- Does it avoid direct PII?
- Is the retention defined?
- Is internal traffic behavior defined?
- Does sampling need to be lower than 100%?
- Is the dataset access level explicit?

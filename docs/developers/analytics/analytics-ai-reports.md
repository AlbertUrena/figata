# Analytics AI Reports

> Read this doc when generating weekly/monthly executive reports, wiring OpenAI report jobs, or auditing the stored AI report history.

Canonical runtime helpers:
- `shared/analytics-ai-reports.js`
- `scripts/run-analytics-ai-report.js`
- `scripts/validate-analytics-ai-report.js`

## Goal

PBI 20 turns curated analytics data into repeatable executive narratives without making the model responsible for raw calculations.

The contract is:
- pipeline + KPI + cohort + quality layers calculate
- AI interprets and prioritizes
- the repository stores the source payload, the prompt metadata, and the rendered artifacts for auditability

## Report Types

| Type | Default window | Comparison | Optional baseline | Schedule |
|------|----------------|------------|-------------------|----------|
| `weekly` | Latest closed Monday-Sunday window | Prior week | Prior 4 completed weeks | Monday 07:00 `America/Santo_Domingo` |
| `monthly` | Latest closed calendar month | Prior month | Prior 3 completed months | Day 1 08:00 `America/Santo_Domingo` |

Override any period with:
- `--from=YYYY-MM-DD`
- `--to=YYYY-MM-DD`
- `--previous-from=YYYY-MM-DD`
- `--previous-to=YYYY-MM-DD`
- `--baseline-periods=N`

## Provider Modes

| Provider | When to use | Notes |
|------|-------------|------|
| `mock` | Local validation, no network, no OpenAI key | Uses deterministic heuristics so the pipeline stays testable offline |
| `openai` | Production or approved environments with `OPENAI_API_KEY` | Calls the Responses API with structured JSON schema output |
| `auto` | Default | Falls back to `mock` when no `OPENAI_API_KEY` is present |

## OpenAI Configuration

Environment variables:
- `OPENAI_API_KEY` — required for `provider=openai`
- `FIGATA_ANALYTICS_REPORT_RECIPIENTS` — optional comma-separated distribution targets for metadata/audit

CLI overrides:
- `--provider=openai|mock|auto`
- `--model=gpt-5.2`
- `--reasoning-effort=low|medium|high`
- `--max-output-tokens=2200`

The script stores prompt metadata and structured output, but not raw secret values.

## Prompt Guardrails

Every generated report carries and stores these rules:
- no invented metrics or percentages
- explicit separation of `observation`, `inference`, and `hypothesis`
- every important finding must reference concrete metrics
- no causal language without evidence
- non-technical Spanish for partners/operations

The model output schema is intentionally narrow:
- `executive_summary`
- `key_findings[]`
- `recommendations[]`
- `watchouts[]`

The scorecard, tables, and period comparisons are rendered from validated local aggregates, not improvised by the model.

## Source Payload

The stored `source-payload.json` includes:
- business context
- schedule metadata
- current / previous / baseline periods
- KPI scorecard with deltas vs previous and baseline
- top channels and routes
- item intelligence and curiosity candidates
- retention, timing, and performance-context slices
- quality status and alerts
- metric reference map used by Markdown/HTML rendering

## Artifact Layout

Generated files live under:
- latest snapshot: `analytics-output/latest/ai-reports/<type>/`
- historical record: `analytics-output/history/ai-reports/<type>/<period-key>/`

Each history folder contains:
- `source-payload.json`
- `prompt.json`
- `report.json`
- `report.md`
- `report.html`
- `distribution.json`
- `manifest.json`
- `provider-response.json` only when `provider=openai`

`manifest.json` also stores the synthetic `report_generated` event payload used for downstream audit hooks.

## Commands

```bash
npm run analytics:report -- --type=weekly
npm run analytics:report:weekly
npm run analytics:report:monthly
npm run validate:analytics-ai-reports
```

Useful local examples:

```bash
npm run analytics:report -- --type=weekly --provider=mock --from=2026-04-16 --to=2026-04-16 --previous-from=2026-04-15 --previous-to=2026-04-15
npm run analytics:report -- --type=monthly --provider=openai --model=gpt-5.2 --reasoning-effort=medium
```

## Validation Coverage

`validate:analytics-ai-reports` verifies:
- weekly and monthly window resolution
- schedule metadata
- stored prompt guardrails
- source payload structure
- rendered Markdown/HTML artifacts
- history + latest artifact writing
- metric references on findings and recommendations

## Operational Flow

1. Resolve the closed reporting window.
2. Build `current`, `previous`, and optional `baseline` snapshots from the same NDJSON source.
3. Generate quality, KPI, and cohort slices for each window.
4. Build one compact AI payload from validated aggregates.
5. Call OpenAI or local mock mode.
6. Normalize the narrative into the shared schema.
7. Render `report.md` and `report.html`.
8. Persist history + latest artifacts for audit and later admin consumption.

## Practical Notes

- Default scope is `business_only` so internal/dev/admin traffic stays out of executive narratives.
- The report pipeline is safe to run without OpenAI credentials; it switches to `mock` mode automatically.
- `report.html` is designed as the human-friendly shareable artifact; `report.json` is the machine-friendly artifact for future admin surfaces.
- PBI 21 should read these stored report bundles instead of rebuilding prompt payloads from scratch.

# Analytics AI Analyst

> **Read this doc when** working on the Admin AI chat, the retrieval stack, prompt guardrails, or the Cloudflare/local endpoints that answer analytics questions.

## Overview

The AI analyst is the Admin-side chat that answers business questions using:
- latest scheduled AI report artifacts
- a current KPI/quality/cohort snapshot for the selected filter window
- strict prompt guardrails from shared runtime helpers

Core files:
- `shared/analytics-ai-analyst.js`
- `shared/analytics-openai.js`
- `cloudflare/common/analytics-report-service.js`
- `cloudflare/common/analytics-snapshot.js`
- `cloudflare/admin/worker.js`
- `scripts/dev-server.js`
- `admin/app/modules/dashboard.js`

## Data Sources

### Cloudflare preview / production

The worker builds answers from:
1. **latest weekly/monthly AI reports in R2**
2. **live snapshot payload from raw events in R2** via the same modeling helpers used by the dashboard

### Local development

The dev server builds answers from:
1. latest report artifacts on disk in `analytics-output/latest/ai-reports`
2. the current `/__analytics/inspect` snapshot window

The analyst never reasons directly over raw NDJSON lines in the UI.

## Request Contract

`POST /api/analytics/ai-analyst` in Cloudflare, or `POST /__analytics/ai-analyst` locally.

```json
{
  "question": "Compara QR vs Instagram en intencion de compra.",
  "mode": "short_qa",
  "scope": "auto",
  "memory": [
    { "role": "user", "text": "Que cambio esta semana?" }
  ],
  "previous_response_id": "resp_optional",
  "filters": {
    "from": "2026-04-10",
    "to": "2026-04-16",
    "entry_source": "qr",
    "includeInternal": false
  }
}
```

## Response Contract

```json
{
  "provider": "openai",
  "question": "Que cambio esta semana?",
  "answer": "Resumen corto...",
  "evidence": [],
  "limitations": [],
  "follow_ups": [],
  "question_template_id": "weekly_summary",
  "response_scope": "weekly",
  "confidence": "medium",
  "source_refs": [],
  "suggested_questions": [],
  "conversation": {
    "previous_response_id": null,
    "response_id": null,
    "memory_turns_used": 1
  }
}
```

## Providers

| Provider | When used |
|------|-----------|
| `openai` | `OPENAI_API_KEY` exists in the worker/dev environment |
| `mock` | No OpenAI key is available, but the UI should remain testable |

The fail-soft `mock` path is intentional and should not break the dashboard.

## Endpoint Matrix

| Environment | Endpoint | Runtime |
|------|----------|---------|
| Local | `POST /__analytics/ai-analyst` | `scripts/dev-server.js` |
| Local compatibility | `POST /api/analytics/ai-analyst` | alias in `scripts/dev-server.js` |
| Cloudflare preview/prod | `POST /api/analytics/ai-analyst` | `cloudflare/admin/worker.js` |

## Cloudflare Retrieval Flow

```text
Request -> admin worker
        -> verified Access session
        -> load latest weekly/monthly reports from R2
        -> build filtered live snapshot from raw events in R2
        -> route to best template/scope
        -> call OpenAI or mock provider
        -> normalize structured answer
        -> return JSON to Admin dashboard
```

## Prompt Guardrails

`shared/analytics-ai-analyst.js` enforces:
- max question size
- memory trimming
- template routing
- evidence-first output structure
- explicit limitations when context is weak
- Spanish-first answer style
- no invented KPIs

## Dashboard Integration

`admin/app/modules/dashboard.js` is responsible for:
- sending current dashboard filters
- rendering the thread
- preserving `previous_response_id` when present
- rendering answer, evidence, limitations, and follow-up chips

The browser does not compute AI logic on its own.

## Validation

Run:

```bash
npm run validate:analytics-ai-analyst
```

The validator now checks:
- R2-backed latest report loading
- prompt/template routing
- live-context derivation
- mock answer structure
- `GET /api/session` worker contract
- `POST /api/analytics/ai-analyst` worker contract

## Legacy Notes

`netlify/functions/analytics-ai-analyst.js` is legacy/archive context and is no longer the supported production endpoint.

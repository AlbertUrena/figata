# Analytics Experimentation

> **Read this doc when** working on lightweight experimentation, recommendation lists, or optimization review artifacts.

---

## Overview

The experimentation layer in Figata is intentionally lightweight.

It does **not** start with a full feature-flag platform or multivariate testing engine.
Instead, it creates a repeatable system for:
- explicit experiment hypotheses
- fixed primary KPI + guardrails
- recommendation lists grounded in observed behavior
- decision logging with `rollout`, `iterate`, or `discard`

Core files:
- `shared/analytics-optimization.js`
- `scripts/run-analytics-optimization.js`
- `scripts/validate-analytics-optimization.js`

---

## What This Layer Produces

Running:

```bash
npm run analytics:optimization
```

generates:
- `analytics-output/latest/optimization/backlog.json`
- `analytics-output/latest/optimization/experiment-template.json`
- `analytics-output/latest/optimization/recommendations.json`
- `analytics-output/latest/optimization/decision-log.json`
- `analytics-output/latest/optimization/optimization-summary.json`
- `analytics-output/latest/optimization/review.md`

These artifacts are the first operating surface for PBI 22.

---

## Experiment Backlog

The shared backlog currently prioritizes:

1. `menu_category_order_v1`
2. `home_primary_cta_copy_v1`
3. `menu_pairings_position_v1`

Each entry includes:
- `experiment_id`
- title
- route/surface
- explicit hypothesis
- variants
- primary KPI
- success threshold
- minimum session requirement
- guardrails
- suggested owner
- recommended decision based on the current analytics snapshot

This ensures no experiment is launched without:
- an explicit hypothesis
- a primary KPI
- guardrails

---

## Recommendation Lists

The lightweight recommendation snapshot currently derives:

### `top_of_moment`
- based on item purchase units
- intended for simple “top del momento” modules

### `curiosity_rescue`
- based on curiosity score / detail-to-purchase gap
- intended for “esto interesa pero no cierra” surfaces

### `combo_sugerido`
- based on co-purchase patterns from purchase event item arrays
- intended for simple combo or upsell suggestions

These are intentionally:
- non-ML
- deterministic
- explainable
- cheap to compute

---

## Decision Logic

The decision engine uses simple rules:

- `iterate`
  - sample too small
  - idea still plausible but evidence is not strong enough

- `discard`
  - at least one guardrail is violated
  - or there is no recommendation signal worth surfacing

- `rollout`
  - enough traffic exists
  - the primary KPI exceeds the configured threshold
  - guardrails are healthy

This is not meant to claim hard causal truth without a proper live test.
It is meant to force disciplined review instead of opinion-only product changes.

---

## Validation

Run:

```bash
npm run validate:analytics-optimization
```

The validator checks:
- every experiment has hypothesis, KPI, and guardrails
- the template includes explicit decision options
- recommendation lists can be derived from fixture data
- combo suggestions can be inferred from purchase item co-occurrence
- the CLI generates latest/history artifacts correctly

---

## Operational Rule

The rule for this layer is strict:

- do not execute product changes without an explicit hypothesis
- do not read results without a documented decision
- do not interpret weak samples as causal truth

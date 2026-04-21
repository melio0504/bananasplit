# Decisions Continuity

## Decision Format
Use this for important technical decisions:

```
Date:
Area:
Decision:
Why:
Tradeoff:
Follow-up:
```

## Current Decisions
Date: 2026-04-21
Area: Repository structure
Decision: Keep `app/`, `api/`, and `landing/` as separate projects inside one repository instead of using a shared-package monorepo layout.
Why: Team wants one repository without shared components/packages and with simpler project boundaries.
Tradeoff: Some types or utilities may be duplicated across projects until duplication becomes painful enough to extract.
Follow-up: Reassess only if duplication starts slowing down development.

Date: 2026-04-21
Area: Frontend app architecture
Decision: Build `app/` as offline-first, with local persistence as source of truth and backend sync added later.
Why: Core product must remain usable without internet and should not depend on backend availability for MVP flows.
Tradeoff: Requires repository and local data-layer design now, plus later sync complexity.
Follow-up: Choose exact local database and sync metadata strategy before scaffolding feature code.

Date: 2026-04-21
Area: Frontend stack
Decision: Use React, Vite, TypeScript, Tailwind CSS, `shadcn/ui`, and TanStack Query in `app/`.
Why: Stack is productive, TypeScript-friendly, mobile-ready, and fits later Capacitor wrapping.
Tradeoff: Need discipline to avoid generic-looking UI and to keep TanStack Query separate from true local persistence concerns.
Follow-up: Define app folder structure and repository/data boundaries before implementation.


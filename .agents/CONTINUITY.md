# Continuity

## Snapshot
- 2026-04-21 [USER] Goal: build `bananasplit` as an offline-first expense-sharing app inspired by Splitwise.
- 2026-04-21 [USER] Current priority: focus on `app/` first; backend comes later for auth and sync.
- 2026-04-21 [USER] Repository shape should stay simple: `app/`, `api/`, `landing/`.
- 2026-04-21 [USER] No shared-package monorepo setup wanted right now.
- 2026-04-21 [USER] Frontend stack direction: React + TypeScript + `shadcn/ui`.
- 2026-04-21 [USER] State/data direction: TanStack Query in app, but core functionality must work offline.
- 2026-04-21 [CODE] `.agents` instructions were partially copied from another project and are being normalized to this repo.
- 2026-04-21 [TOOL] `.agents/AGENTS.md` now points continuity operations to `.agents/CONTINUITY.md`.

## Done (recent)
- 2026-04-21 [CODE] Scaffolded `app/` with Vite, React, TypeScript, Tailwind v4, TanStack Query, React Router, and `shadcn/ui`.
- 2026-04-21 [CODE] Implemented mobile-first MVP wireframe routes for onboarding, dashboard, group details, expense details, settings, and not-found.
- 2026-04-21 [CODE] Added BananaSplit yellow theme tokens, shared mobile shell, bottom navigation, placeholder logo placement, and mock local-query data flow.
- 2026-04-21 [TOOL] `npm run lint` passed in `app/`.
- 2026-04-21 [TOOL] `npm run build` passed in `app/`.
- 2026-04-21 [CODE] Normalized `.agents` rules and continuity docs from old-project state to `bananasplit`-specific guidance.

## Decisions
- 2026-04-21 [CODE] D001 ACTIVE: keep one repository with separate `app/`, `api/`, and `landing/` projects instead of shared-package monorepo.
- 2026-04-21 [CODE] D002 ACTIVE: build `app/` offline-first with local persistence as source of truth; backend sync/auth later.
- 2026-04-21 [CODE] D003 ACTIVE: frontend stack direction is React + Vite + TypeScript + Tailwind + `shadcn/ui` + TanStack Query.
- 2026-04-21 [CODE] D004 ACTIVE: use mock repository/query layer now so UI routes are ready before real local database is selected.

## Now
- 2026-04-21 [USER] User asked to start coding the `app/` and implement mobile-first wireframe screens.

## Next
- 2026-04-21 [ASSUMPTION] Next likely step is choosing the real offline local database and replacing mock repository data behind the same query/repository boundaries.

## Open Questions
- 2026-04-21 [UNCONFIRMED] Exact local database choice for offline-first app still not locked.
- 2026-04-21 [UNCONFIRMED] Exact sync strategy and backend API shape are deferred.

## Working Set
- `.agents/AGENTS.md`
- `.agents/CONTINUITY.md`
- `app/package.json`
- `app/src/index.css`
- `app/src/App.tsx`
- `app/src/app/router/index.tsx`
- `app/src/components/common/*`
- `app/src/features/dashboard/*`
- `app/src/features/groups/*`
- `app/src/features/expenses/*`
- `app/src/features/onboarding/*`
- `app/src/features/settings/*`
- `app/src/lib/data/mock-data.ts`
- `app/src/lib/repositories/mock-app-repository.ts`

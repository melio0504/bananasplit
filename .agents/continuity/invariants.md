# Invariants Continuity

## Product Direction
- `app/` is the primary build target right now.
- `app/` must work offline for core MVP flows.
- `api/` is deferred for later auth and sync work; current app architecture must not depend on it.

## Repository Shape
- Keep `app/`, `api/`, and `landing/` as separate top-level projects.
- Do not assume shared components, shared packages, or shared types across projects for now.
- Prefer feature-based folders over large flat directories in both frontend and backend.

## Frontend Constraints
- Use TypeScript throughout `app/`.
- Use `shadcn/ui` for base UI components and keep generated UI separate from app-specific components.
- TanStack Query may wrap repository reads/mutations, but local persistence remains source of truth.
- Design mobile-first because Capacitor support is planned later.

## Engineering Rules
- Keep code modular; avoid code files longer than 300 lines where practical.
- Do not hide failures with silent fallbacks during development.
- Do not leave empty `try/catch` blocks.
- Keep entrypoints stable and isolate change-heavy logic behind smaller modules.


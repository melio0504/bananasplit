# Pitfalls Continuity

## Frequent Risks
- Treating TanStack Query as the offline database. It is not; local persistence must exist underneath.
- Letting feature code talk directly to storage implementation instead of going through repositories.
- Designing screens desktop-first, then discovering later that Capacitor/mobile flows feel cramped or hover-dependent.
- Duplicating business logic across components, hooks, and storage adapters instead of centralizing it.
- Overfitting app structure to future sync before core offline flows are working.

## Expected Failure Modes To Watch
- Local schema changes without migration planning can break persisted user data during development.
- Balance calculations can drift if expense split math lives in multiple places.
- Generated `shadcn/ui` components can become a dumping ground if app-specific wrappers are not separated cleanly.
- Early “temporary” types using `any` can leak into core money logic and hide defects.


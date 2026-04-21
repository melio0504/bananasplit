# Architecture Continuity

## Repository Structure
- Main product app: `app/`
- Backend API: `api/`
- Future marketing site: `landing/`
- Agent continuity and project rules: `.agents/`

## App-First Direction
- Build `app/` first.
- App is offline-first and must remain usable without internet.
- Backend exists later for auth, sync, and remote backup; it is not required for core MVP flows.
- Capacitor support comes later, so app architecture should stay mobile-friendly from start.

## Frontend Stack
- React + Vite + TypeScript
- Tailwind CSS
- `shadcn/ui`
- TanStack Query for server-like and repository-backed data flows
- Local-first data layer behind repositories

## Data Flow Reality
- Local database is source of truth for MVP.
- UI reads and writes through app-side repositories, not direct backend calls.
- TanStack Query can wrap repository reads/mutations, but it does not replace local persistence.
- Sync should be additive later, not something that forces a rewrite of app features.

## Folder Strategy
- Keep `app/`, `api/`, and `landing/` independent inside same repository.
- Do not assume shared packages/components across projects.
- Prefer feature-based folders in `app/src` and `api/src` to support multiple developers.
- Keep entrypoints stable and split growing features into dedicated folders instead of flat file piles.


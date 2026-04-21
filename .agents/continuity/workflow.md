# Workflow Continuity

## Default Build Flow
1. Read `.agents/CONTINUITY.md` before acting.
2. Verify current repository structure and nearby code before editing.
3. Keep changes narrow, modular, and aligned with offline-first app direction.
4. Preserve stable entrypoints and push complexity into feature folders, repositories, and supporting modules.
5. Summarize exact files changed, validation performed, and residual risk.

## Validation Expectations
- Run lint, typecheck, and build when tooling is available and relevant to the change.
- If tooling is unavailable or not yet configured, state that explicitly.
- For data-layer changes, validate both type safety and expected runtime flow when possible.

## Update Discipline
- When a durable technical choice is made, add it to `decisions.md`.
- When a recurring bug pattern or sharp edge appears, add it to `pitfalls.md`.
- When project constraints change, update `invariants.md`.
- Keep `.agents/CONTINUITY.md` compact and factual.


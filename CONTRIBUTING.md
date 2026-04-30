# Contributing to BananaSplit

Thanks for your interest in contributing to the first project of Programming Pares community!

## Development Setup

1. Clone the repository.

```bash
git clone git@github.com:Programming-Pares/bananasplit.git
```

2. Install dependencies:

```bash
cd app
npm install
```

3. Create local environment files when working on Google auth, sync, or the Worker API.

`app/.env.local` is used by Vite/browser code:

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

`app/.dev.vars` is used by Wrangler/Worker code:

```bash
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_if_needed
```

The current Google ID-token flow uses `GOOGLE_CLIENT_ID`. The client secret is not used yet.

4. Apply local D1 migrations when working with the Worker API:

```bash
npm run db:migrate:local
```

5. Start the frontend-only development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

For auth, sync, or any `/api` work, run both servers in separate terminals:

```bash
npm run cf:dev
```

```bash
npm run dev
```

Wrangler serves the Worker API at `http://localhost:8787`. Vite serves the app at `http://localhost:5173` and proxies `/api` requests to Wrangler.

### Google OAuth Local Setup

In Google Cloud Console, use an OAuth client of type **Web application**.

Authorized JavaScript origins should include:

```text
http://localhost:5173
http://127.0.0.1:5173
http://localhost:8787
http://127.0.0.1:8787
```

If Google login shows `Error 401: invalid_client`, check that `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` are both set to the same valid Web client ID, then restart Vite and Wrangler.

## Useful Commands

Run these from the `app/` directory:

- `npm run dev` - Start Vite dev server
- `npm run cf:dev` - Start the Cloudflare Worker locally with Wrangler
- `npm run lint` - Run ESLint
- `npm run build` - Type-check and build production bundle
- `npm run preview` - Preview production build
- `npm run db:migrate:local` - Apply D1 migrations to the local Wrangler database
- `npm run db:migrate:remote` - Apply D1 migrations to the remote D1 database
- `npx wrangler deploy --dry-run` - Validate the Worker bundle without deploying

Before opening a PR, run:

```bash
npm run lint
npm run build
npx wrangler deploy --dry-run
```

If your PR changes D1 schema or Worker sync/auth behavior, also run:

```bash
npm run db:migrate:local
npx wrangler d1 execute app-db --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

## Worker, D1, and Local Files

- Worker source lives in `app/worker/`
- Worker API routes live in `app/worker/api/`
- D1 migrations live in `app/migrations/`
- Vite proxies `/api` to `http://localhost:8787`
- Local app data is still stored offline-first in IndexedDB through Dexie
- Sync pushes local Dexie `syncOutbox` rows to D1 when signed in and online

Do not commit local/generated files:

- `app/.wrangler/`
- `app/dist/`
- `app/.env.local`
- `app/.dev.vars`

Use example values in docs instead of committing real secrets or Google client credentials.

## Branch Naming (Conventional)

Use this format for branch names:

```text
<type>/<short-kebab-description>
```

Examples:

- `feat/add-expense-validation`
- `fix/group-balance-rounding`
- `docs/update-readme-setup`
- `refactor/simplify-query-hooks`

Allowed `type` values:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

## Commit Messages (Conventional Commits)

Use this format:

```text
type(scope): short summary
```

- Use lowercase `type`
- Keep summary in imperative mood ("add", "fix", "update")
- Keep summary concise (about 72 chars or less)
- Use `!` after `type` or `scope` for breaking changes

Examples:

- `feat(groups): add member invite form`
- `fix(expenses): correct split total rounding`
- `docs(readme): clarify local setup`
- `refactor(queries): simplify group fetch hook`
- `feat(db)!: rename settlement schema`

## Pull Request Titles (Conventional)

Use the same Conventional Commit style for PR titles:

```text
type(scope): short summary
```

Examples:

- `feat(activity): add filter by group`
- `fix(dashboard): avoid duplicate recent activity rows`
- `docs(contributing): document PR title format`

## Pull Request Checklist

- Keep PRs focused and reasonably small
- Ensure branch name is conventional
- Ensure commit messages are conventional
- Ensure PR title is conventional
- Run `npm run lint` and `npm run build` from `app/`
- Update docs when behavior or developer workflow changes
- Add screenshots for UI changes when helpful

## Code Style

- Follow existing TypeScript/React patterns in `app/src/`
- Prefer small, focused components and hooks
- Reuse shared UI components from `app/src/components/ui/` when possible
- Avoid unrelated refactors in the same PR

## Reporting Issues

When opening an issue, include:

- Expected behavior
- Actual behavior
- Steps to reproduce
- Environment details (OS, browser)
- Screenshots or recordings (if UI-related)

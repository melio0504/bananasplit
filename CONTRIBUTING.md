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

3. Start the development server:

```bash
npm run dev
```

## Useful Commands

Run these from the `app/` directory:

- `npm run dev` - Start Vite dev server
- `npm run lint` - Run ESLint
- `npm run build` - Type-check and build production bundle
- `npm run preview` - Preview production build

Before opening a PR, run:

```bash
npm run lint
npm run build
```

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

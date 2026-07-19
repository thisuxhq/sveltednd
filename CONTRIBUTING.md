# Contributing to @thisux/sveltednd

Thanks for contributing to **@thisux/sveltednd** — a lightweight drag and drop
library for Svelte 5.

By submitting a pull request or other contribution, you agree that your work is
licensed under the same [MIT License](LICENSE) as the project, and copyright is
held by **THISUX Private Limited** (or assigned as required for distribution).

> **CI runs automatically** on every PR. Lint, type-check, and tests must pass
> before merge.

Please also follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Development setup

1. **Fork** the repo and **clone** your fork:

   ```bash
   git clone https://github.com/<your-username>/sveltednd.git
   cd sveltednd
   bun install
   ```

2. Verify the toolchain:

   ```bash
   bun run dev      # Demo app (SvelteKit)
   bun run build    # Library build (vite + svelte-package)
   bun run test     # Vitest unit tests
   bun run check    # TypeScript / svelte-check
   bun run lint     # Prettier + ESLint
   ```

Package manager: **Bun** is preferred (`bun install`, `bun run …`). npm works
for install if needed.

## Branching

- Create a feature branch from `main` — do not commit directly to `main`.
- Prefer descriptive names: `feat/keyboard-dnd`, `fix/touch-stuck-state`,
  `docs/api-examples`.

```bash
git checkout -b feat/my-change
```

## Commit messages

This repo enforces **[Conventional Commits](https://www.conventionalcommits.org/)**
via Husky + commitlint. Non-conforming commits are rejected.

Format: `type(scope): description`

| Type       | When to use                                           |
| ---------- | ----------------------------------------------------- |
| `feat`     | New user-facing feature (triggers minor version bump) |
| `fix`      | Bug fix (triggers patch bump)                         |
| `docs`     | Documentation only                                    |
| `chore`    | Tooling, deps, config                                 |
| `refactor` | Code restructure, no behavior change                  |
| `test`     | Adding or fixing tests                                |
| `ci`       | CI/CD changes                                         |
| `style`    | Formatting only                                       |

Breaking changes: append `!` (e.g. `feat!: …`) or add a `BREAKING CHANGE:`
footer.

Examples:

```
feat: add keyboard drag support
fix: prevent stuck drag state on mobile
docs: update README with touch examples
```

## Pull requests

1. Keep PRs focused — one concern per PR when practical.
2. Update or add tests for behavior changes (`*.spec.ts` next to source under
   `src/lib/`).
3. Run before opening the PR:

   ```bash
   bun run format
   bun run lint
   bun run check
   bun run test
   ```

4. Fill in the PR template: summary, type of change, and checklist.
5. Link related issues (`Fixes #123`).

### Project-specific rules

- **TypeScript** strict mode; use `import type` for type-only imports.
- Always include **`.js` extensions** in relative imports (NodeNext resolution).
- Prefer `$lib` for internal imports: `import { x } from '$lib/actions/index.js'`.
- Svelte actions: setup → handlers → `addEventListener` → return
  `{ update(), destroy() }`.
- State uses Svelte 5 **`$state` runes**, not legacy stores.
- Formatting: **tabs**, single quotes in JS/TS, no trailing commas, 100 char
  print width.
- Do not add dependencies unless the change clearly needs them.

## Reporting issues

- Prefer the [issue templates](https://github.com/thisuxhq/sveltednd/issues/new/choose)
  (bug report / feature request).
- Search existing issues first.
- For **security** findings, do **not** open a public issue — see
  [SECURITY.md](SECURITY.md) and email `hello@thisux.com`.

## Documentation

- Keep the README API examples accurate when you change public APIs.
- Demo routes under `src/routes/` are the living examples — update them when
  behavior changes.
- Changelog entries for releases are managed via release-please; no need to
  hand-edit version numbers in PRs unless asked.

---

Thanks for helping improve **@thisux/sveltednd**.

# CI/CD Release Pipeline — Design Spec

**Date:** 2026-04-02
**Status:** Approved

## Goal

Automate testing on every PR and npm publishing on every release, driven by conventional commits and `release-please`.

---

## Trigger Summary

| Event                             | CI runs | Release PR updated | npm published |
| --------------------------------- | ------- | ------------------ | ------------- |
| PR opened / push to PR branch     | ✅      | —                  | —             |
| Merge to `main` (fix/feat commit) | ✅      | ✅                 | —             |
| Merge the Release PR to `main`    | ✅      | ✅ (closes itself) | ✅            |

---

## Workflow 1: `ci.yml`

**Trigger:** `push` to any branch, `pull_request` targeting `main`

**Purpose:** Gate PRs. Catch lint, type, and test failures before they reach main.

**Steps:**

1. Checkout repo
2. Set up Bun
3. `bun install --frozen-lockfile`
4. `bun run lint` (Prettier check + ESLint)
5. `bun run check` (svelte-check / TypeScript)
6. `bun run test` (Vitest --run)

**Node version:** 20 (LTS). Bun version: `latest`.

---

## Workflow 2: `release.yml`

**Trigger:** `push` to `main` only

**Purpose:** Maintain the Release PR and publish to npm when a release is created.

### Job 1: `release-please`

Uses `google-github-actions/release-please-action@v4`.

- Reads conventional commits since the last release
- Creates or updates a Release PR titled `chore: release X.Y.Z`
- Release PR contains: bumped `package.json` version + updated `CHANGELOG.md`
- When the Release PR is merged, creates a GitHub Release + git tag (`vX.Y.Z`)
- Outputs: `release_created` boolean, `tag_name`, `upload_url`

**Permissions required:** `contents: write`, `pull-requests: write`

### Job 2: `publish`

**Condition:** `needs.release-please.outputs.release_created == 'true'`

Only runs when a release was actually created (i.e. the Release PR was merged). Skipped on all other merges.

**Steps:**

1. Checkout repo at the release tag
2. Set up Bun
3. `bun install --frozen-lockfile`
4. `bun run build` (vite build + svelte-package + publint)
5. `bun publish --access public` using `NPM_TOKEN` secret
6. Upload `dist/` tarball to the GitHub Release as an asset

---

## Config Files

### `release-please-config.json` (repo root)

```json
{
	"packages": {
		".": {
			"package-name": "@thisux/sveltednd",
			"release-type": "node",
			"changelog-path": "CHANGELOG.md",
			"bump-minor-pre-major": true,
			"draft": false,
			"prerelease": false
		}
	}
}
```

`bump-minor-pre-major: true` means `feat:` bumps minor while version is `0.x.x` (pre-1.0). After `1.0.0` it follows standard semver.

### `.release-please-manifest.json` (repo root)

```json
{ ".": "0.1.2" }
```

Tells release-please the last released version so it computes the next bump correctly.

---

## Secrets Required

| Secret      | Where to create                                 | Purpose                        |
| ----------- | ----------------------------------------------- | ------------------------------ |
| `NPM_TOKEN` | npmjs.com → Access Tokens → **Automation** type | Publishes to npm, bypasses 2FA |

The default `GITHUB_TOKEN` (auto-provided by Actions) is used for release-please — no extra setup needed.

---

## Conventional Commit → Version Bump Mapping

| Commit prefix                  | Bump (pre-1.0) | Bump (post-1.0) | CHANGELOG section   |
| ------------------------------ | -------------- | --------------- | ------------------- |
| `fix:`                         | patch          | patch           | Bug Fixes           |
| `feat:`                        | minor          | minor           | Features            |
| `feat!:` or `BREAKING CHANGE:` | minor\*        | major           | ⚠️ Breaking Changes |
| `docs:`, `chore:`, `refactor:` | none           | none            | (omitted or misc)   |

\*`bump-minor-pre-major` prevents a breaking change from jumping to `1.0.0` prematurely.

---

## Files Created

```
.github/
  workflows/
    ci.yml          ← lint + check + test on every PR
    release.yml     ← release-please + npm publish on main
release-please-config.json
.release-please-manifest.json
CHANGELOG.md        ← created/maintained by release-please automatically
```

---

## One-Time Setup Checklist (human steps)

1. Create an npm **Automation Token** at npmjs.com → Access Tokens → Generate New Token → Automation
2. Add it to GitHub: repo → Settings → Secrets and variables → Actions → New secret → `NPM_TOKEN`
3. Merge this PR — first Release PR will appear automatically after the next `fix:` or `feat:` commit lands on main

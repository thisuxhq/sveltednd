# CI/CD Release Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GitHub Actions workflows that run lint/check/test on every PR and automatically publish to npm via `release-please` when a Release PR is merged to main.

**Architecture:** Two workflows — `ci.yml` (runs on every push/PR) and `release.yml` (runs on pushes to main, uses `release-please` to manage the Release PR and triggers `bun publish` only when a release is created). Two `release-please` config files tell it the package name, release type, and last released version.

**Tech Stack:** GitHub Actions, `google-github-actions/release-please-action@v4`, `oven-sh/setup-bun@v2`, Bun, npm registry

---

## Files

| File                            | Action | Purpose                                                      |
| ------------------------------- | ------ | ------------------------------------------------------------ |
| `.github/workflows/ci.yml`      | Create | Lint + type-check + test on every PR and push                |
| `.github/workflows/release.yml` | Create | release-please bot + npm publish on main                     |
| `release-please-config.json`    | Create | Tells release-please the package name, type, changelog path  |
| `.release-please-manifest.json` | Create | Tracks last released version (0.1.2) so next bump is correct |

---

### Task 1: Create the CI workflow

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow directories**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Write `ci.yml`**

Create `.github/workflows/ci.yml` with this exact content:

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Lint
        run: bun run lint

      - name: Type check
        run: bun run check

      - name: Test
        run: bun run test
```

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "✅ YAML valid"
```

Expected: `✅ YAML valid`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add CI workflow for lint, type-check, and tests"
```

---

### Task 2: Create the release-please config files

**Files:**

- Create: `release-please-config.json`
- Create: `.release-please-manifest.json`

- [ ] **Step 1: Write `release-please-config.json`**

Create `release-please-config.json` in the repo root:

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

`bump-minor-pre-major: true` means `feat:` commits bump minor while the version is `0.x.x`. Without this, a `feat!:` (breaking change) would jump straight to `1.0.0` — undesirable for a pre-1.0 library.

- [ ] **Step 2: Write `.release-please-manifest.json`**

Create `.release-please-manifest.json` in the repo root:

```json
{ ".": "0.1.2" }
```

This tells release-please that `0.1.2` is already published so it computes the next version correctly. If this file is missing or wrong, release-please will re-release an already-published version.

- [ ] **Step 3: Validate both JSON files**

```bash
python3 -c "import json; json.load(open('release-please-config.json'))" && echo "✅ config valid"
python3 -c "import json; json.load(open('.release-please-manifest.json'))" && echo "✅ manifest valid"
```

Expected: both print `✅ ... valid`

- [ ] **Step 4: Commit**

```bash
git add release-please-config.json .release-please-manifest.json
git commit -m "ci: add release-please config and manifest"
```

---

### Task 3: Create the release workflow

**Files:**

- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Write `release.yml`**

Create `.github/workflows/release.yml` with this exact content:

```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
      tag_name: ${{ steps.release.outputs.tag_name }}
    steps:
      - uses: google-github-actions/release-please-action@v4
        id: release
        with:
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json

  publish:
    needs: release-please
    if: ${{ needs.release-please.outputs.release_created }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Publish to npm
        run: bun publish --access public
        env:
          BUN_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**How it works:**

- `release-please` job runs on every push to main. It reads conventional commits and keeps a Release PR up to date. When the Release PR is merged, it creates a GitHub Release and sets `release_created = true`.
- `publish` job only runs when `release_created` is true. It builds and publishes. On normal feature/fix merges, this job is skipped.

- [ ] **Step 2: Validate YAML syntax**

```bash
python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/release.yml'))" && echo "✅ YAML valid"
```

Expected: `✅ YAML valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release-please and npm publish workflow"
```

---

### Task 4: Push and verify

**Files:** None (verification only)

- [ ] **Step 1: Add NPM_TOKEN to GitHub Secrets (human step)**

Before pushing, the `NPM_TOKEN` secret must exist in GitHub or the publish job will fail.

1. Go to [npmjs.com](https://www.npmjs.com) → your avatar → **Access Tokens**
2. Click **Generate New Token** → choose **Automation** type
3. Copy the token
4. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
5. Name: `NPM_TOKEN`, Value: the token you copied
6. Click **Add secret**

- [ ] **Step 2: Push the branch and open a PR**

```bash
git push origin HEAD
```

Then open a PR on GitHub targeting `main`.

- [ ] **Step 3: Verify CI runs**

In the GitHub PR, the **Checks** tab should show `CI` running with 4 steps: Install → Lint → Type check → Test.

Expected: all steps green ✅

If lint fails: run `bun run format` locally, commit the changes, push again.
If type-check fails: run `bun run check` locally and fix errors.
If tests fail: run `bun run test` locally and fix failures.

- [ ] **Step 4: Merge the PR**

Once CI is green, merge to main.

- [ ] **Step 5: Verify release-please ran**

Go to GitHub → **Actions** → **Release** workflow. You should see it ran after the merge.

If there were any `fix:` or `feat:` commits in the PR, a new **Release PR** will appear (titled something like `chore: release 0.1.3`). That's the automated Release PR — merge it when you're ready to publish the next version.

If there were only `ci:` or `docs:` commits (like in this PR), release-please runs but no Release PR is created — that's correct, those prefixes don't trigger a release.

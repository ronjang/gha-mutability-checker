# gha-mutability-check

Readymade Action that scans your repository's workflows, classifies action usage by mutability, scores risk, and opens an issue with a prioritized pinning plan.

## What it does
- Scans workflow files (`.github/workflows/**/*.yml` / `.yaml`) for `uses:` in steps and reusable workflow calls.
- Classifies references (SHA, tag, branch, docker digest/tag, local, missing/invalid) and notes transitive risk as "unknown" for now.
- Scores each unique action reference and produces an overall score to help you prioritize pinning.
- Creates a GitHub Issue containing the full Markdown report, optionally failing the run when the score is below a threshold.

## Quick start
Create `.github/workflows/mutability-report.yml`:

```yaml
name: Action Mutability Report
on:
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * 1'

jobs:
  scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
    steps:
      - uses: actions/checkout@v4
      - name: Run mutability check
        uses: ronjang/gha-mutability-checker@67afcdcb4c8325ef83182c687c19f6b36bde5acf #v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          issue-title-prefix: Action Mutability Report
          issue-label: mutability-report
          issue-mode: create
          paths: .github/workflows
          verbose: false
```

## Inputs
- `github-token` (required): Token with `contents:read` and `issues:write`.
- `issue-title-prefix` (default `Action Mutability Report`): Title prefix for the issue.
- `issue-label` (default `mutability-report`): Label to apply. The action attempts to create it if missing.
- `issue-mode` (default `create`): `create` or `update` (update is stubbed for now).
- `fail-under` (optional): If the overall score is below this number, the action fails.
- `paths` (default `.github/workflows`): Comma-separated workflow paths/globs.
- `verbose` (default `false`): Enable verbose logging.

## Outputs
- `overall-score`: Overall mutability score.
- `issue-number`: Issue created or updated.
- `actions-scanned`: Count of unique action references.
- `workflows-scanned`: Number of workflow files processed.

## Permissions
Required for the job running this action:
- `contents: read`
- `issues: write`

Label creation may require additional permissions depending on your org settings. If label creation fails, the action proceeds without applying the label.

## Scoring philosophy (SUBJECT TO CHANGE)
The initial heuristic starts at 100 and subtracts penalties for mutable refs (branches, tags, missing refs) and applies a small transitive-risk adjustment. SHA pins and docker digests score highest. The scoring module is pluggable; future versions can swap weights or logic without changing the scanner.

## Limitations and outlook
- Transitive dependency analysis is not implemented; risk is marked as "unknown" to encourage review of nested actions and downloads.
- Line numbers for findings are not guaranteed; file/job/step context is always provided.

## Development
- Install deps: `npm ci`
- Tests: `npm test`
- Lint: `npm run lint`
- Build: `npm run build` (bundles to `dist/` via ncc)
- CI ensures `dist/` is up to date (`npm run ci:dist`).

## Sample report
See `docs/sample-report.md` for an example Markdown issue body.

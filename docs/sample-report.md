# Action Mutability Report

**Overall Score:** 72

## Summary
- Workflows scanned: 3
- Total uses: 9
- Unique actions: 6
- Parse errors: 0

### Reference Types
- SHA pinned: 3
- Short SHA: 0
- Tags (semver/major/minor): 2
- Branch refs: 2
- Docker digests: 1
- Docker tags: 1
- Local actions: 0
- Missing/invalid refs: 0

## Prioritized Actions
| Action | Score | Ref Type | Occurrences | Top reasons |
| --- | --- | --- | --- | --- |
| actions/checkout@main | 30 (D) | branch | 2 | Branch reference is mutable and can drift.<br>Ref is mutable; transitive dependencies compound drift risk. |
| docker://ghcr.io/example/image:latest | 50 (C) | docker-tag | 1 | Docker tag is mutable; images can change without digest pinning.<br>Ref is mutable; transitive dependencies compound drift risk. |
| actions/setup-node@v3 | 55 (C) | tag-major | 2 | Major tag is mutable; new minors/patches can change behavior.<br>Ref is mutable; transitive dependencies compound drift risk. |
| org/workflows/reusable.yml@v1.2.3 | 70 (B) | tag-semver | 1 | Semver tag is mutable until replaced with a SHA.<br>Ref is mutable; transitive dependencies compound drift risk. |
| actions/cache@9c95c53c... | 95 (A) | sha-short | 2 | Short SHA is less explicit; collisions or rewrites are possible.<br>Transitive dependency risk unknown; root is pinned but internals may drift. |
| docker://ghcr.io/example/image@sha256:abc123 | 95 (A) | docker-digest | 1 | Docker digest is immutable.<br>Transitive dependency risk unknown; root is pinned but internals may drift. |

## Detailed Findings
### actions/checkout@main
- Score: 30 (D)
- Kind: github-action
- Classification: branch
- Occurrences: 2
- Transitive risk: unknown - Transitive dependency analysis not implemented in this version.
- Locations:
- .github/workflows/ci.yml (job: build, step step Checkout)
- .github/workflows/release.yml (job: release, step step Checkout)
- Top contributors:
  - Branch reference is mutable and can drift.
  - Ref is mutable; transitive dependencies compound drift risk.
- Recommendations:
  - Pin this action to a commit SHA.
  - Pin to SHA to reduce both direct and transitive risk.

## Transitive dependencies
Action internals may call additional actions, download scripts/binaries, or use containers without digests. This starter version reports transitive risk as "unknown"; deeper analysis can be added to inspect referenced repositories and images.

## How to interpret the score
Higher scores indicate stronger pinning (e.g., commit SHAs, digests). Lower scores highlight mutable refs like branches or floating tags. Use the prioritized list to pin the riskiest references first. Scores may change as the heuristic evolves.

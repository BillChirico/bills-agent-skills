# Manage PRs

GitHub pull request maintenance skill for review comments, unresolved threads, top-level conversation blockers, merge conflicts, and CI failures.

## When to Use

- Fixing PR review comments or requested changes
- Resolving unresolved review threads after fixes are committed and pushed
- Unblocking PRs with merge conflicts, stale branches, or failing checks
- Preparing a PR for merge with no unresolved actionable comments and no red required checks

## Folder Contents

- `SKILL.md` - Main end-to-end PR maintenance workflow.
- `agents/openai.yaml` - Agent integration metadata for the skill surface.
- `scripts/inspect_pr_state.py` - Inspects review threads, top-level comments, review summaries, and checks.
- `scripts/resolve_review_threads.py` - Resolves explicit GitHub review-thread IDs after fixes are pushed.

## Requirements

- GitHub CLI
- GitHub authentication that can read and update pull requests in the target repository. Classic tokens need `repo` for private repositories; fine-grained tokens need **Pull requests: Read and write**.
- Python 3

```bash
gh auth status
```

If authentication is missing:

```bash
gh auth login
```

## Usage

From the target repository:

```bash
python3 "<skill-dir>/scripts/inspect_pr_state.py" --repo "." --pr "<number-or-url>"
```

If the current branch has exactly one PR, omit `--pr`.

After the requested fixes are committed, pushed, and live PR state has been re-read:

```bash
python3 "<skill-dir>/scripts/resolve_review_threads.py" --repo "." --thread-id "<thread-id>"
```

Do not resolve review threads from memory. The clean workflow is inspect live PR state, patch the real blocker, verify locally, commit and push, re-read GitHub, then resolve only the exact thread IDs that were fixed.

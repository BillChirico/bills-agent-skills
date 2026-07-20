---
name: manage-prs
description: Manage and maintain GitHub pull requests end-to-end. Use when asked to fix PR review comments, unresolved review threads, top-level PR conversation comments, requested changes, merge conflicts, or CI/CD failures; when the user says to manage, maintain, clean up, unblock, get green, finish, or prepare a PR; or when a PR must have no unresolved actionable comments and no failing checks.
---

# Manage PRs

## Operating Rule

Treat GitHub as the source of truth. Do not rely on stale browser state, old summaries, local guesses, or a previous agent's report.

Only mark review threads resolved after:

1. The related fix is committed.
2. The branch is pushed.
3. The live PR state is re-read and the fixed thread IDs are still the threads being resolved.

Top-level PR conversation comments do not have review-thread resolution. Address them by fixing the issue, pushing the fix, and replying only when a reply is useful or explicitly requested.

## Quick Start

From the target repo:

```bash
python3 "<skill-dir>/scripts/inspect_pr_state.py" --repo "." --pr "<number-or-url>"
```

If the current branch has exactly one PR, omit `--pr`.

After fixes are pushed and the live thread IDs are confirmed:

```bash
python3 "<skill-dir>/scripts/resolve_review_threads.py" --repo "." --thread-id "<thread-id>"
```

## Workflow

1. Confirm the target PR.
   - Use a provided PR number/URL when present.
   - Otherwise run `gh pr view --json number,url,headRefName,headRepositoryOwner`.
   - Run `git status --short` before editing. Preserve unrelated user changes.

2. Refresh from GitHub.
   - Run `git fetch --all --prune`.
   - Inspect mergeability with `gh pr view <pr> --json number,url,headRefName,baseRefName,mergeable,mergeStateStatus,reviewDecision`.
   - If the branch is behind or conflicted, update from the PR base using the repo's normal merge/rebase pattern before calling the PR clean.

3. Inventory every blocker.
   - Run `inspect_pr_state.py`.
   - Read unresolved review threads.
   - Read top-level PR conversation comments.
   - Read review summary bodies, especially `CHANGES_REQUESTED`.
   - Read failing and pending checks.
   - For failing GitHub Actions checks, fetch logs with `gh run view <run-id> --log` or use the existing `gh-fix-ci` skill/script if available.
   - For external CI providers, open the details URL if tooling is available; otherwise report the exact external URL and continue with local reproduction where possible.

4. Cluster comments by root cause.
   - Multiple comments often point at one bug. Fix the bug once instead of making one-off edits for each comment.
   - Separate actionable requests from stale, duplicate, or already-addressed comments.
   - Do not resolve a stale-looking thread until live code proves it is obsolete and the branch has been pushed.

5. Fix and verify.
   - Reproduce failing CI locally when feasible.
   - Run the narrowest meaningful existing verification first, then broader repository-prescribed gates when the PR touches shared code.
   - Do not weaken lint, typecheck, tests, snapshots, coverage, security checks, or required workflows to get green.

6. Commit and push.
   - Use the repo's commit conventions.
   - If push is rejected, fetch/rebase or merge the remote branch, rerun the relevant checks, then push again.
   - Never resolve review threads before this push succeeds.

7. Re-check GitHub.
   - Re-run `inspect_pr_state.py`.
   - Re-run `gh pr checks <pr>` or the provider-specific status command.
   - If checks are pending, wait or watch them when practical. Do not claim there are no failing checks while required checks are still red.

8. Resolve completed review threads.
   - Resolve only the exact thread IDs whose requested changes were fixed and pushed.
   - Use `resolve_review_threads.py` or the GraphQL mutation directly.
   - Re-run `inspect_pr_state.py` and confirm unresolved actionable review threads are zero.

9. Final report.
   - Include the PR URL/number.
   - List the comments fixed, top-level comments addressed, and CI failures cleared.
   - State the exact verification run.
   - If anything remains pending or externally blocked, say exactly which check/comment and link the details.

## Comment Handling Rules

- Review threads: fix, push, then resolve via GraphQL `resolveReviewThread`.
- Top-level PR conversation comments: fix the underlying issue. Reply only when a human needs a note; do not pretend they can be resolved.
- Review summary bodies: treat `CHANGES_REQUESTED` as actionable even when there is no inline thread.
- Bot comments: handle if they identify a real blocker. Ignore noise only after proving it is non-actionable.
- Duplicates: mention they are duplicates in the final report, but still verify there is no separate unresolved request.

## CI/CD Handling Rules

- Required checks must not be failing when done.
- A local green test does not replace a red GitHub check. Use logs to connect the local fix to the failing workflow.
- Treat pending checks as pending, not green.
- Treat skipped/neutral checks as their own bucket. They are not failures unless branch protection or the PR UI marks them as blockers.
- If a failure is environmental or third-party, gather the run URL, error text, and retry status before reporting it as blocked.
- If several PRs share the same failing workflow, fix the shared workflow once and verify each affected PR state separately.

## Useful GraphQL Mutation

Use this only after the fix is pushed:

```bash
gh api graphql \
  -f threadId="<thread-id>" \
  -f query='mutation($threadId:ID!){resolveReviewThread(input:{threadId:$threadId}){thread{id isResolved}}}'
```

## Bundled Scripts

- `scripts/inspect_pr_state.py`: prints unresolved review threads, top-level PR comments, review summaries, and status checks for a PR.
- `scripts/resolve_review_threads.py`: resolves explicit review-thread IDs after the branch has been fixed and pushed.

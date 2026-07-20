---
name: github-pr-resolver
description: Resolve GitHub pull request review threads and failing CI checks end to end. Use when a PR must be inspected from live GitHub state, review feedback must be implemented and pushed, exact review threads must be resolved, and checks must be verified before completion.
---

# GitHub PR Resolver

Take a pull request from unresolved feedback to a verified, review-ready state.

## Required Outcome

Do not stop at a local patch. Completion means:

- Every current review thread and PR conversation has been inspected from GitHub.
- Every actionable request is fixed or explicitly reported as blocked.
- The intended changes are committed and pushed.
- Only the exact threads addressed by the pushed code are resolved.
- The PR is re-read after the push.
- Required checks are passing, or a concrete external blocker is reported.

## Prerequisites

```bash
gh auth status
git status --short
```

For private repositories, a classic token needs `repo`; a fine-grained token needs access to the target repository with Pull requests set to read/write. The authenticated user also needs permission to push the PR branch.

## Non-Negotiable Rules

1. **GitHub is the source of truth.** Never rely on an old pasted review, cached thread list, or local TODO as the final state.
2. **Paginate review threads.** The first 100 threads are not “all threads.”
3. **Preserve user work.** Do not overwrite unrelated local changes or force-push unless the user explicitly authorized it.
4. **Judge feedback, then act.** Confirm each comment is still applicable and technically correct. Do not apply a suggestion blindly.
5. **Fix root causes.** Multiple comments caused by one defect should receive one cohesive fix, not duplicated patches.
6. **Push before resolving.** A local edit or unpushed commit is not enough. Re-read the pushed diff before resolving anything.
7. **Resolve exact IDs only.** Never bulk-resolve from a stale list.
8. **Parallel work is optional.** Use it only when the runtime supports it and file ownership does not overlap. It is never a reason to block the workflow.

## Workflow

### 1. Resolve the Target

Accept a PR URL, PR number, or the pull request for the current branch.

```bash
gh pr view <PR> --json number,title,url,state,isDraft,headRefName,baseRefName,headRepositoryOwner,mergeStateStatus
gh repo view --json nameWithOwner
git status --short
```

Stop and report if the PR is closed, the branch cannot be checked out safely, authentication is missing, or unrelated local changes overlap files that must be edited.

### 2. Fetch the Complete Live State

Collect all four review surfaces:

1. Inline review threads, including replies and resolution state
2. Top-level PR conversation comments
3. Submitted reviews and requested-change summaries
4. Status checks and workflow failures

Use a paginated GraphQL query for review threads:

```bash
gh api graphql --paginate \
  -f owner=OWNER \
  -f repo=REPO \
  -F number=PR_NUMBER \
  -f query='query($owner:String!,$repo:String!,$number:Int!,$endCursor:String){
    repository(owner:$owner,name:$repo){
      pullRequest(number:$number){
        reviewThreads(first:100,after:$endCursor){
          nodes{
            id isResolved isOutdated path line originalLine
            comments(first:100){
              nodes{id url body createdAt author{login}}
              pageInfo{hasNextPage endCursor}
            }
          }
          pageInfo{hasNextPage endCursor}
        }
      }
    }
  }'
```

If a thread reports more than 100 comments, fetch its remaining comment pages before triage; the outer pagination only advances review threads.

Fetch the other surfaces separately:

```bash
gh api --paginate 'repos/OWNER/REPO/issues/PR_NUMBER/comments?per_page=100'
gh api --paginate 'repos/OWNER/REPO/pulls/PR_NUMBER/reviews?per_page=100'
gh pr checks <PR>
gh pr diff <PR>
```

Do not treat top-level comments as review threads: they have no thread-resolution mutation. Address them in code and reply when a response is useful.

### 3. Triage Every Item

Track each unresolved thread with:

- Thread ID and comment URL
- Author
- File and line
- Requested outcome
- Root cause or related thread group
- Status: actionable, already addressed, obsolete, non-actionable, or blocked

Use these rules:

- **Actionable:** The current pushed code still has the issue. Fix it.
- **Already addressed:** The current pushed code demonstrably satisfies the request. Verify, then resolve.
- **Obsolete/outdated:** The referenced code moved or disappeared. Confirm the replacement path is correct before resolving.
- **Non-actionable:** Praise, questions with no requested change, or automation noise. Do not invent work.
- **Blocked/ambiguous:** Explain the exact missing decision or access instead of guessing.

Submitted `CHANGES_REQUESTED` reviews can remain visible after their comments are fixed; only the reviewer can replace that review state. Report it without pretending it was cleared.

### 4. Implement the Smallest Cohesive Fix

- Read repository instructions before editing.
- Inspect the current implementation and nearby callers.
- Group comments only when they share a root cause.
- Keep unrelated cleanup out of the patch.
- Run the repository's prescribed formatter, linter, build, and relevant verification commands.
- Re-read the diff for accidental changes, generated noise, and secrets.

If independent comments touch separate files, they may be handled in parallel. Assign exclusive file ownership and reconcile the combined diff before verification.

### 5. Commit and Push

Use the repository's commit convention. One commit per root-cause group is usually clearer than one commit per comment.

```bash
git diff --check
git status --short
git add <exact-files>
git commit -m "fix(scope): address review feedback"
git push
```

Never stage unrelated user changes. Never force-push without explicit authorization.

### 6. Re-Read, Then Resolve Exact Threads

After the push:

1. Fetch the PR diff and unresolved threads again.
2. Confirm each intended fix exists on the remote PR head.
3. Resolve only the exact thread IDs satisfied by that pushed diff.

```bash
gh api graphql \
  -f threadId=THREAD_ID \
  -f query='mutation($threadId:ID!){
    resolveReviewThread(input:{threadId:$threadId}){
      thread{id isResolved}
    }
  }'
```

Require `isResolved: true` before marking the item complete. If a mutation fails, refresh the thread state and retry only after identifying the cause.

### 7. Get Checks Green

```bash
gh pr checks <PR> --watch --interval 10
```

For a failure:

1. Open the failing run and read the actual failed step.
2. Reproduce it locally when practical.
3. Fix the root cause, run focused verification, commit, and push.
4. Re-read GitHub state again before resolving any newly addressed thread.

Do not claim success for queued, skipped-but-required, cancelled, or failing checks. If the failure is external or unrelated, report the check name, run URL, and evidence.

### 8. Final Audit

Fetch everything one last time and confirm:

- Zero unresolved actionable review threads
- No unanswered actionable top-level comments
- No unaddressed requested-change summaries
- Required checks are passing
- The remote PR contains every reported fix
- The worktree contains no accidental staged or modified files from this task

## Completion Report

Return:

- PR URL
- Commits pushed
- Thread IDs or links resolved
- Verification commands run
- Final check state
- Any remaining reviewer-owned or external blockers

Keep the report short. “Fixed locally” is not a completion state.

## Reference

See [references/github_api_reference.md](references/github_api_reference.md) for intent patterns, API troubleshooting, and rate-limit notes.

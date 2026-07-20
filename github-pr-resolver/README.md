# GitHub PR Resolver

GitHub pull request resolution skill for fixing review threads, resolving comments, and verifying CI before calling the work done.

## When to Use

- Fixing unresolved PR review comments
- Cleaning up open GitHub review threads
- Driving PR comments from live GitHub state instead of stale local notes
- Verifying CI after review fixes

## Folder Contents

- `SKILL.md` - Main review-thread resolution workflow.
- `commands/resolve-pr.md` - Slash command wrapper for `/resolve-pr`.
- `references/github_api_reference.md` - GitHub GraphQL and review-thread API notes.

## Requirements

- GitHub CLI
- GitHub authentication that can read and update pull requests in the target repository

```bash
gh auth status
```

If authentication is missing:

```bash
gh auth login
```

## Usage

```text
/resolve-pr https://github.com/owner/repo/pull/123
```

Core discipline: fetch every unresolved thread, fix from live state, commit and push fixes, re-read the remote PR, resolve the exact satisfied GitHub threads, then verify zero actionable feedback remains and required checks are green.

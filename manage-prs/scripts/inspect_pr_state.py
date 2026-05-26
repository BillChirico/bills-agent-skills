#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from shutil import which
from typing import Any, Sequence


FAILURE_CHECKRUN_CONCLUSIONS = {
    "ACTION_REQUIRED",
    "CANCELLED",
    "FAILURE",
    "STALE",
    "STARTUP_FAILURE",
    "TIMED_OUT",
}
SKIPPED_CHECKRUN_CONCLUSIONS = {"NEUTRAL", "SKIPPED"}
FAILURE_STATUS_STATES = {"ERROR", "FAILURE"}
PENDING_CHECKRUN_STATUSES = {"EXPECTED", "IN_PROGRESS", "PENDING", "QUEUED", "REQUESTED", "WAITING"}
PENDING_STATUS_STATES = {"EXPECTED", "PENDING"}


class CommandResult:
    def __init__(self, returncode: int, stdout: str, stderr: str) -> None:
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Inspect GitHub PR comments, review threads, reviews, and status checks.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--repo", default=".", help="Path inside the target Git repository.")
    parser.add_argument("--pr", default=None, help="PR number or URL. Defaults to current branch PR.")
    parser.add_argument("--json", action="store_true", help="Emit JSON output.")
    parser.add_argument("--include-resolved", action="store_true", help="Include resolved review threads.")
    parser.add_argument("--threads-limit", type=int, default=100)
    parser.add_argument("--comments-limit", type=int, default=100)
    parser.add_argument("--reviews-limit", type=int, default=100)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = find_git_root(Path(args.repo))
    if repo_root is None:
        print("Error: not inside a Git repository.", file=sys.stderr)
        return 1

    if not ensure_gh(repo_root):
        return 1

    owner, repo = resolve_repo(repo_root)
    if owner is None or repo is None:
        print("Error: unable to resolve GitHub owner/repo.", file=sys.stderr)
        return 1

    pr_number = resolve_pr_number(args.pr, repo_root)
    if pr_number is None:
        return 1

    data = fetch_pr_state(
        owner=owner,
        repo=repo,
        number=pr_number,
        repo_root=repo_root,
        threads_limit=max(1, args.threads_limit),
        comments_limit=max(1, args.comments_limit),
        reviews_limit=max(1, args.reviews_limit),
    )
    if data is None:
        return 1

    summary = summarize_pr_state(data, include_resolved=args.include_resolved)
    if args.json:
        print(json.dumps(summary, indent=2))
    else:
        render_summary(summary)
    return 0


def run_command(args: Sequence[str], cwd: Path) -> CommandResult:
    process = subprocess.run(args, cwd=cwd, text=True, capture_output=True)
    return CommandResult(process.returncode, process.stdout, process.stderr)


def run_gh(args: Sequence[str], cwd: Path) -> CommandResult:
    return run_command(["gh", *args], cwd=cwd)


def find_git_root(start: Path) -> Path | None:
    result = run_command(["git", "rev-parse", "--show-toplevel"], cwd=start)
    if result.returncode != 0:
        return None
    return Path(result.stdout.strip())


def ensure_gh(repo_root: Path) -> bool:
    if which("gh") is None:
        print("Error: gh is not installed or not on PATH.", file=sys.stderr)
        return False
    result = run_gh(["auth", "status"], cwd=repo_root)
    if result.returncode == 0:
        return True
    print((result.stderr or result.stdout or "Error: gh is not authenticated.").strip(), file=sys.stderr)
    return False


def resolve_repo(repo_root: Path) -> tuple[str | None, str | None]:
    result = run_gh(["repo", "view", "--json", "owner,name"], cwd=repo_root)
    if result.returncode == 0:
        try:
            data = json.loads(result.stdout or "{}")
        except json.JSONDecodeError:
            data = {}
        owner = data.get("owner", {}).get("login")
        repo = data.get("name")
        if isinstance(owner, str) and isinstance(repo, str):
            return owner, repo

    remote = run_command(["git", "remote", "get-url", "origin"], cwd=repo_root)
    if remote.returncode != 0:
        return None, None
    match = re.search(r"github\.com[:/](?P<owner>[^/]+)/(?P<repo>[^/.]+)(?:\.git)?$", remote.stdout.strip())
    if not match:
        return None, None
    return match.group("owner"), match.group("repo")


def resolve_pr_number(pr_value: str | None, repo_root: Path) -> int | None:
    if pr_value:
        match = re.search(r"(?:/pull/)?(?P<number>\d+)(?:\D*)$", pr_value.strip())
        if not match:
            print(f"Error: unable to parse PR number from {pr_value!r}.", file=sys.stderr)
            return None
        return int(match.group("number"))

    result = run_gh(["pr", "view", "--json", "number"], cwd=repo_root)
    if result.returncode != 0:
        print((result.stderr or result.stdout or "Error: unable to resolve current branch PR.").strip(), file=sys.stderr)
        return None
    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        print("Error: unable to parse gh pr view output.", file=sys.stderr)
        return None
    number = data.get("number")
    if not isinstance(number, int):
        print("Error: current branch has no PR number.", file=sys.stderr)
        return None
    return number


def fetch_pr_state(
    *,
    owner: str,
    repo: str,
    number: int,
    repo_root: Path,
    threads_limit: int,
    comments_limit: int,
    reviews_limit: int,
) -> dict[str, Any] | None:
    query = """
query(
  $owner: String!,
  $repo: String!,
  $number: Int!,
  $threadsLimit: Int!,
  $commentsLimit: Int!,
  $reviewsLimit: Int!
) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      id
      number
      title
      url
      state
      isDraft
      mergeable
      reviewDecision
      headRefName
      headRefOid
      baseRefName
      baseRefOid
      reviewThreads(first: $threadsLimit) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          startLine
          subjectType
          comments(first: 30) {
            nodes {
              id
              body
              author { login }
              url
              path
              line
              originalLine
              createdAt
              updatedAt
              outdated
            }
          }
        }
      }
      comments(first: $commentsLimit, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          id
          body
          author { login }
          url
          createdAt
          updatedAt
        }
      }
      reviews(first: $reviewsLimit, states: [CHANGES_REQUESTED, COMMENTED]) {
        nodes {
          id
          state
          body
          author { login }
          url
          submittedAt
          comments(first: 30) {
            nodes {
              id
              body
              author { login }
              url
              path
              line
              originalLine
              createdAt
              updatedAt
            }
          }
        }
      }
      statusCheckRollup {
        contexts(first: 100) {
          nodes {
            __typename
            ... on CheckRun {
              name
              status
              conclusion
              detailsUrl
              startedAt
              completedAt
            }
            ... on StatusContext {
              context
              state
              targetUrl
              createdAt
            }
          }
        }
      }
    }
  }
}
"""
    result = run_gh(
        [
            "api",
            "graphql",
            "-f",
            f"query={query}",
            "-f",
            f"owner={owner}",
            "-f",
            f"repo={repo}",
            "-F",
            f"number={number}",
            "-F",
            f"threadsLimit={threads_limit}",
            "-F",
            f"commentsLimit={comments_limit}",
            "-F",
            f"reviewsLimit={reviews_limit}",
        ],
        cwd=repo_root,
    )
    if result.returncode != 0:
        print((result.stderr or result.stdout or "Error: GraphQL PR query failed.").strip(), file=sys.stderr)
        return None
    try:
        data = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        print("Error: unable to parse GraphQL response.", file=sys.stderr)
        return None
    pull_request = data.get("data", {}).get("repository", {}).get("pullRequest")
    if not isinstance(pull_request, dict):
        print("Error: GraphQL response did not contain pullRequest data.", file=sys.stderr)
        return None
    return pull_request


def summarize_pr_state(data: dict[str, Any], *, include_resolved: bool) -> dict[str, Any]:
    threads = data.get("reviewThreads", {}).get("nodes") or []
    selected_threads = [thread for thread in threads if include_resolved or not thread.get("isResolved")]
    top_level_comments = data.get("comments", {}).get("nodes") or []
    reviews = data.get("reviews", {}).get("nodes") or []
    check_nodes = data.get("statusCheckRollup", {}).get("contexts", {}).get("nodes") or []
    checks = [normalize_check(node) for node in check_nodes]

    return {
        "number": data.get("number"),
        "title": data.get("title"),
        "url": data.get("url"),
        "state": data.get("state"),
        "isDraft": data.get("isDraft"),
        "mergeable": data.get("mergeable"),
        "reviewDecision": data.get("reviewDecision"),
        "headRefName": data.get("headRefName"),
        "headRefOid": data.get("headRefOid"),
        "baseRefName": data.get("baseRefName"),
        "baseRefOid": data.get("baseRefOid"),
        "unresolvedReviewThreads": [normalize_thread(thread) for thread in selected_threads],
        "topLevelComments": [normalize_top_level_comment(comment) for comment in top_level_comments],
        "reviewSummaries": [normalize_review(review) for review in reviews],
        "failingChecks": [check for check in checks if check["bucket"] == "failing"],
        "pendingChecks": [check for check in checks if check["bucket"] == "pending"],
        "passingChecks": [check for check in checks if check["bucket"] == "passing"],
        "skippedChecks": [check for check in checks if check["bucket"] == "skipped"],
        "unknownChecks": [check for check in checks if check["bucket"] == "unknown"],
    }


def normalize_thread(thread: dict[str, Any]) -> dict[str, Any]:
    comments = thread.get("comments", {}).get("nodes") or []
    return {
        "id": thread.get("id"),
        "isResolved": thread.get("isResolved"),
        "isOutdated": thread.get("isOutdated"),
        "path": thread.get("path"),
        "line": thread.get("line"),
        "startLine": thread.get("startLine"),
        "subjectType": thread.get("subjectType"),
        "comments": [normalize_inline_comment(comment) for comment in comments],
    }


def normalize_inline_comment(comment: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": comment.get("id"),
        "author": (comment.get("author") or {}).get("login"),
        "body": comment.get("body"),
        "url": comment.get("url"),
        "path": comment.get("path"),
        "line": comment.get("line"),
        "originalLine": comment.get("originalLine"),
        "createdAt": comment.get("createdAt"),
        "updatedAt": comment.get("updatedAt"),
        "outdated": comment.get("outdated"),
    }


def normalize_top_level_comment(comment: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": comment.get("id"),
        "author": (comment.get("author") or {}).get("login"),
        "body": comment.get("body"),
        "url": comment.get("url"),
        "createdAt": comment.get("createdAt"),
        "updatedAt": comment.get("updatedAt"),
    }


def normalize_review(review: dict[str, Any]) -> dict[str, Any]:
    comments = review.get("comments", {}).get("nodes") or []
    return {
        "id": review.get("id"),
        "state": review.get("state"),
        "author": (review.get("author") or {}).get("login"),
        "body": review.get("body"),
        "url": review.get("url"),
        "submittedAt": review.get("submittedAt"),
        "comments": [normalize_inline_comment(comment) for comment in comments],
    }


def normalize_check(node: dict[str, Any]) -> dict[str, Any]:
    typename = node.get("__typename")
    if typename == "CheckRun":
        name = node.get("name") or ""
        status = normalize_text(node.get("status"))
        conclusion = normalize_text(node.get("conclusion"))
        if conclusion in FAILURE_CHECKRUN_CONCLUSIONS:
            bucket = "failing"
        elif conclusion in SKIPPED_CHECKRUN_CONCLUSIONS:
            bucket = "skipped"
        elif status in PENDING_CHECKRUN_STATUSES or not conclusion:
            bucket = "pending"
        elif conclusion == "SUCCESS":
            bucket = "passing"
        else:
            bucket = "unknown"
        return {
            "type": typename,
            "name": name,
            "status": status,
            "conclusion": conclusion,
            "bucket": bucket,
            "url": node.get("detailsUrl"),
            "startedAt": node.get("startedAt"),
            "completedAt": node.get("completedAt"),
        }

    if typename == "StatusContext":
        name = node.get("context") or ""
        state = normalize_text(node.get("state"))
        if state in FAILURE_STATUS_STATES:
            bucket = "failing"
        elif state in PENDING_STATUS_STATES:
            bucket = "pending"
        elif state == "SUCCESS":
            bucket = "passing"
        else:
            bucket = "unknown"
        return {
            "type": typename,
            "name": name,
            "state": state,
            "bucket": bucket,
            "url": node.get("targetUrl"),
            "createdAt": node.get("createdAt"),
        }

    return {"type": typename or "Unknown", "name": "", "bucket": "unknown", "url": None}


def normalize_text(value: object) -> str:
    return str(value or "").strip().upper()


def render_summary(summary: dict[str, Any]) -> None:
    print(f"PR #{summary['number']}: {summary['title']}")
    print(summary["url"])
    print(
        "state={state} draft={draft} mergeable={mergeable} reviewDecision={review}".format(
            state=summary["state"],
            draft=summary["isDraft"],
            mergeable=summary["mergeable"],
            review=summary["reviewDecision"],
        )
    )
    print(f"head={summary['headRefName']}@{short_sha(summary['headRefOid'])} base={summary['baseRefName']}@{short_sha(summary['baseRefOid'])}")

    render_threads(summary["unresolvedReviewThreads"])
    render_top_level_comments(summary["topLevelComments"])
    render_reviews(summary["reviewSummaries"])
    render_checks("Failing checks", summary["failingChecks"])
    render_checks("Pending checks", summary["pendingChecks"])
    render_checks("Skipped checks", summary["skippedChecks"])
    render_checks("Unknown checks", summary["unknownChecks"])
    print(f"Passing checks: {len(summary['passingChecks'])}")


def short_sha(value: object) -> str:
    text = str(value or "")
    return text[:12] if text else "unknown"


def render_threads(threads: list[dict[str, Any]]) -> None:
    print(f"\nUnresolved review threads: {len(threads)}")
    for thread in threads:
        location = format_location(thread)
        print(f"- {thread['id']} {location} outdated={thread['isOutdated']}")
        for comment in thread["comments"]:
            body = first_line(comment.get("body"))
            print(f"  @{comment.get('author')}: {body}")
            if comment.get("url"):
                print(f"  {comment['url']}")


def render_top_level_comments(comments: list[dict[str, Any]]) -> None:
    print(f"\nTop-level PR comments: {len(comments)}")
    for comment in comments:
        body = first_line(comment.get("body"))
        print(f"- {comment['id']} @{comment.get('author')}: {body}")
        if comment.get("url"):
            print(f"  {comment['url']}")


def render_reviews(reviews: list[dict[str, Any]]) -> None:
    print(f"\nReview summaries: {len(reviews)}")
    for review in reviews:
        body = first_line(review.get("body"))
        print(f"- {review['id']} {review['state']} @{review.get('author')}: {body}")
        if review.get("url"):
            print(f"  {review['url']}")
        for comment in review["comments"]:
            body = first_line(comment.get("body"))
            print(f"  inline @{comment.get('author')} {comment.get('path')}:{comment.get('line')}: {body}")


def render_checks(title: str, checks: list[dict[str, Any]]) -> None:
    print(f"\n{title}: {len(checks)}")
    for check in checks:
        detail = check.get("conclusion") or check.get("state") or check.get("status") or ""
        print(f"- {check.get('name')} {detail}")
        if check.get("url"):
            print(f"  {check['url']}")


def format_location(thread: dict[str, Any]) -> str:
    path = thread.get("path") or "unknown"
    start = thread.get("startLine")
    line = thread.get("line")
    if start and line and start != line:
        return f"{path}:{start}-{line}"
    if line:
        return f"{path}:{line}"
    return path


def first_line(value: object) -> str:
    text = str(value or "").strip().splitlines()
    if not text:
        return ""
    line = text[0].strip()
    return line[:197] + "..." if len(line) > 200 else line


if __name__ == "__main__":
    raise SystemExit(main())

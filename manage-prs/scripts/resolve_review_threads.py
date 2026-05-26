#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from shutil import which
from typing import Any, Sequence


class CommandResult:
    def __init__(self, returncode: int, stdout: str, stderr: str) -> None:
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Resolve explicit GitHub pull request review-thread IDs.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--repo", default=".", help="Path inside the target Git repository.")
    parser.add_argument("--thread-id", action="append", default=[], help="Review thread ID to resolve. Repeatable.")
    parser.add_argument("--from-json", default=None, help="JSON output from inspect_pr_state.py; resolves unresolvedReviewThreads.")
    parser.add_argument("--dry-run", action="store_true", help="Print thread IDs without mutating GitHub.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = find_git_root(Path(args.repo))
    if repo_root is None:
        print("Error: not inside a Git repository.", file=sys.stderr)
        return 1
    if not ensure_gh(repo_root):
        return 1

    thread_ids = list(dict.fromkeys([*args.thread_id, *load_thread_ids(args.from_json)]))
    if not thread_ids:
        print("Error: no thread IDs provided.", file=sys.stderr)
        return 1

    if args.dry_run:
        for thread_id in thread_ids:
            print(f"would resolve {thread_id}")
        return 0

    failed = False
    for thread_id in thread_ids:
        if resolve_thread(thread_id, repo_root):
            print(f"resolved {thread_id}")
        else:
            failed = True
    return 1 if failed else 0


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


def load_thread_ids(path_value: str | None) -> list[str]:
    if not path_value:
        return []
    path = Path(path_value)
    try:
        data = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as error:
        print(f"Error: unable to read {path}: {error}", file=sys.stderr)
        raise SystemExit(1)

    threads = data.get("unresolvedReviewThreads")
    if not isinstance(threads, list):
        print("Error: JSON does not contain unresolvedReviewThreads.", file=sys.stderr)
        raise SystemExit(1)

    ids = []
    for thread in threads:
        if isinstance(thread, dict) and isinstance(thread.get("id"), str):
            ids.append(thread["id"])
    return ids


def resolve_thread(thread_id: str, repo_root: Path) -> bool:
    query = "mutation($threadId:ID!){resolveReviewThread(input:{threadId:$threadId}){thread{id isResolved}}}"
    result = run_gh(["api", "graphql", "-f", f"threadId={thread_id}", "-f", f"query={query}"], cwd=repo_root)
    if result.returncode != 0:
        print((result.stderr or result.stdout or f"Error: failed to resolve {thread_id}.").strip(), file=sys.stderr)
        return False
    try:
        data: dict[str, Any] = json.loads(result.stdout or "{}")
    except json.JSONDecodeError:
        print(f"Error: unable to parse resolve response for {thread_id}.", file=sys.stderr)
        return False
    resolved = data.get("data", {}).get("resolveReviewThread", {}).get("thread", {}).get("isResolved")
    if resolved is not True:
        print(f"Error: GitHub did not report {thread_id} as resolved.", file=sys.stderr)
        return False
    return True


if __name__ == "__main__":
    raise SystemExit(main())

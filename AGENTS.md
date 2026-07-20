# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Repository Overview

This is a collection of custom agent skills. Skills are self-contained modules that provide AI coding agents with specialized capabilities through structured workflows and documentation.

## Structure

```text
bills-agent-skills/
├── .claude-plugin/
│   └── marketplace.json
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── README.md
├── app-store-image-enhancer/
│   ├── README.md
│   ├── SKILL.md
│   └── commands/
│       └── app-store-image-enhancer-command.md
├── discord-messages/
│   ├── README.md
│   ├── SKILL.md
│   └── references/
│       ├── syntax-highlighting.md
│       └── templates.md
├── github-pr-resolver/
│   ├── README.md
│   ├── SKILL.md
│   ├── commands/
│   │   └── resolve-pr.md
│   └── references/
│       └── github_api_reference.md
├── manage-prs/
│   ├── README.md
│   ├── SKILL.md
│   ├── agents/
│   │   └── openai.yaml
│   └── scripts/
│       ├── inspect_pr_state.py
│       └── resolve_review_threads.py
├── wow-route-generator/
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── README.md
│   ├── SKILL.md
│   ├── examples/
│   │   └── routes/
│   │       ├── eversong-example.json
│   │       └── zulaman-example.json
│   ├── references/
│   │   └── coordinate-projection.md
│   └── scripts/
│       └── build-route-map.mjs
├── volvox/
│   ├── README.md
│   ├── SKILL.md
│   ├── assets/
│   └── references/
│       ├── app-store-guidelines.md
│       ├── press-kit.md
│       ├── product-info.md
│       └── voice-guide.md
```

## Skills Architecture

Each skill follows this pattern:

- **SKILL.md**: Frontmatter with `name` and `description`, followed by workflow documentation
- **README.md**: Human-facing overview, requirements, folder map, and usage notes
- **commands/**: Slash command definitions (e.g., `/resolve-pr`, `/enhance-image`)
- **references/**: Supporting documentation for complex APIs or workflows

All top-level folders containing `SKILL.md` are installable through the Agent Skills CLI. The Claude Code marketplace is a separate catalog and currently publishes `github-pr-resolver` and `wow-route-generator`.

## Working with Skills

### Prerequisites

The `github-pr-resolver` and `manage-prs` skills require the GitHub CLI:

```bash
# Verify gh CLI is installed and authenticated
gh auth status

# If not authenticated, run:
gh auth login
```

For private repositories, a classic token needs `repo`; a fine-grained token needs access to the target repository with Pull requests set to read/write. Git push authentication is configured separately by `gh auth login` or the user's Git credential helper.

The `wow-route-generator` skill requires Node.js 18 or newer.

### Validation

Run these checks after changing skill metadata, documentation, or marketplace entries:

```bash
npx skills add . --list
claude plugin validate . --strict
node --check wow-route-generator/scripts/build-route-map.mjs
python3 manage-prs/scripts/inspect_pr_state.py --help
python3 manage-prs/scripts/resolve_review_threads.py --help
```

Marketplace plugin versions are pinned. Bump a plugin's version whenever its published contents change, or Claude Code users will not receive the update.

## Commit Convention

This repository uses conventional commits: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `refactor`, `style`, `perf`, `test`, `chore`

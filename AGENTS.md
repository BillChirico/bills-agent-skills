# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Repository Overview

This is a collection of custom agent skills. Skills are self-contained modules that provide AI coding agents with specialized capabilities through structured workflows and documentation.

## Structure

```text
bills-claude-skills/
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

## Working with Skills

### Prerequisites

The `github-pr-resolver` and `manage-prs` skills require the GitHub CLI:

```bash
# Verify gh CLI is installed and authenticated
gh auth status

# If not authenticated, run:
gh auth login
```

Token requires `repo` scope for full repository access.

## Commit Convention

This repository uses conventional commits: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `refactor`, `style`, `perf`, `test`, `chore`

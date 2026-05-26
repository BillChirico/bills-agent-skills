# Bill's Claude Skills

Custom skills for Claude Code that automate common workflows.

## Installation

```text
# Add marketplace
/plugin marketplace add BillChirico/bills-claude-skills

# Install a skill
/plugin install github-pr-resolver@bills-claude-skills
```

## Skills

### App Store Image Enhancer

Enhances image resolution, sharpness, and clarity using Python and Pillow.

```text
/enhance-image ./assets/icon.png app-icon
```

[View documentation](app-store-image-enhancer/README.md)

---

### Discord Markdown

Formats copy-paste-ready Discord messages, embeds, templates, and bot responses.

[View documentation](discord/README.md)

---

### GitHub PR Resolver

Resolves all PR review comments and ensures CI passes.

```text
/resolve-pr https://github.com/owner/repo/pull/123
```

**What it does:**
- Fetches all review threads (paginated)
- Creates todo list with author names and comment links
- Fixes issues in parallel (groups by file)
- Commits and pushes fixes before resolving each thread
- Verifies resolution succeeded
- Waits for CI to pass, fixes failures if needed
- Final verification: zero unresolved + all CI green

[View documentation](github-pr-resolver/README.md)

---

### Volvox Brand

Applies Volvox LLC's official brand identity, colors, typography, and voice.

[View documentation](volvox/README.md)

---

## Prerequisites

- [Claude Code CLI](https://claude.ai/code)
- [GitHub CLI](https://cli.github.com/) with `repo` scope for `github-pr-resolver`
- Python 3 and Pillow for `app-store-image-enhancer`

## License

MIT

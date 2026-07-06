# Bill's Agent Skills

Custom skills for AI coding agents that automate common workflows.

## Installation

### Skills.sh (recommended)

```bash
npx skills add BillChirico/bills-agent-skills
```

### Source

Clone the repo and copy any skill folder to your agent's skills directory:

```bash
git clone https://github.com/BillChirico/bills-agent-skills.git
cp -r bills-agent-skills/<skill-name> ~/.agents/skills/
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

### Manage PRs

Maintains GitHub PRs end-to-end: review comments, requested changes, merge conflicts, and CI failures.

[View documentation](manage-prs/README.md)

---

### Volvox Brand

Applies Volvox LLC's official brand identity, colors, typography, and voice.

[View documentation](volvox/README.md)

---

## Prerequisites

- An AI coding agent (for example, GitHub Copilot)
- [GitHub CLI](https://cli.github.com/) with `repo` scope for `github-pr-resolver` and `manage-prs`
- Python 3 and Pillow for `app-store-image-enhancer`

## License

MIT

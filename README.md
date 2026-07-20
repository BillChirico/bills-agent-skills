# Bill's Agent Skills

Custom skills for AI coding agents that automate common workflows.

## Installation

### Skills.sh (recommended)

```bash
npx skills add BillChirico/bills-agent-skills
```

This discovers all six skills in the repository.

### Claude Code marketplace

```bash
claude plugin marketplace add BillChirico/bills-agent-skills
claude plugin install github-pr-resolver@bills-agent-skills
claude plugin install wow-route-generator@bills-agent-skills
```

The marketplace currently publishes the GitHub PR Resolver and WoW Route Generator plugins. Use the Skills CLI above for the full collection.

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

### Discord Messages

Formats copy-paste-ready Discord messages, embeds, templates, and bot responses.

[View documentation](discord-messages/README.md)

---

### GitHub PR Resolver

Drives actionable PR feedback to resolution and verifies required checks.

```text
/resolve-pr https://github.com/owner/repo/pull/123
```

**What it does:**

- Fetches all review threads (paginated)
- Tracks every actionable thread with author names and comment links
- Groups related comments by root cause and parallelizes only independent file scopes
- Commits and pushes fixes before resolving each thread
- Verifies resolution succeeded
- Waits for CI to pass, fixes failures if needed
- Final verification: zero unresolved actionable feedback and all required checks green

[View documentation](github-pr-resolver/README.md)

---

### Manage PRs

Maintains GitHub PRs end-to-end: review comments, requested changes, merge conflicts, and CI failures.

[View documentation](manage-prs/README.md)

---

### WoW Route Generator

Generates coordinate-accurate World of Warcraft gathering-route maps from LootRoute JSON, Lua node data, verified zone bounds, and Wowhead object locations.

[View documentation](wow-route-generator/README.md)

---

### Volvox Brand

Applies Volvox LLC's official brand identity, colors, typography, and voice.

[View documentation](volvox/README.md)

---

## Prerequisites

- An AI coding agent (for example, GitHub Copilot)
- [GitHub CLI](https://cli.github.com/) authenticated for the target repository for `github-pr-resolver` and `manage-prs`
- Node.js 18 or newer for `wow-route-generator`
- Python 3 and Pillow for `app-store-image-enhancer`

## License

MIT

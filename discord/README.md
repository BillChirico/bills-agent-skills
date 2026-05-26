# Discord Markdown

Discord formatting skill for copy-paste-ready chat messages, bot responses, embeds, forum posts, webhook payloads, and templates.

## When to Use

- Writing Discord announcements, moderation notices, or product updates
- Formatting embed descriptions or bot responses
- Preparing messages with mentions, timestamps, spoilers, masked links, quotes, or code blocks
- Looking up Discord code block language identifiers

## Folder Contents

- `SKILL.md` - Main Discord markdown workflow and output rules.
- `syntax-highlighting.md` - Supported code block language identifiers.
- `templates.md` - Reusable message templates for announcements, community posts, moderation, and more.

## Requirements

No runtime dependencies.

## Usage

Ask for a Discord-ready message, then return the final copy inside a fenced `markdown` code block. If the message contains nested code blocks, use a four-backtick outer fence so Discord markdown stays intact.

Every final Discord message should include a metadata table with character count, mentions, links, and code block usage.

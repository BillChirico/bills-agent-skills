# Discord Messages

Discord messages formatting skill for copy-paste-ready chat messages, bot responses, embeds, forum posts, webhook payloads, and templates — plus structural and tone guidance for writing the announcements themselves.

## When to Use

- Writing Discord announcements, moderation notices, or product updates
- Formatting embed descriptions or bot responses
- Preparing messages with mentions, timestamps, spoilers, masked links, quotes, or code blocks
- Looking up Discord code block language identifiers

## Folder Contents

- `SKILL.md` - Main Discord messages workflow, structural/tone guidance for announcements, and output rules.
- `references/syntax-highlighting.md` - Supported code block language identifiers.
- `references/templates.md` - Reusable message templates for announcements, community posts, moderation, and more.

## Requirements

No runtime dependencies.

## Usage

Before drafting, identify the delivery context (chat, Nitro chat, bot/webhook content, embed, or forum post) so the correct limits and payload shape are used. Masked links work in ordinary Discord chat as well as bot, webhook, and embed content. Compose using the structure and emoji-density guidance in `SKILL.md`, and return the final copy inside a fenced `markdown` code block. If the message contains nested code blocks, use a four-backtick outer fence so Discord markdown stays intact.

Every final Discord message should include a metadata table with character count, mentions, links, and code block usage.

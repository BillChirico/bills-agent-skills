---
name: discord-markdown
description: Format text for Discord using markdown syntax, and draft well-structured Discord announcements. Use when composing Discord messages, bot responses, embed descriptions, forum posts, webhook payloads, announcements, patch notes, or any content destined for Discord's chat interface. Triggers on requests mentioning Discord formatting, Discord messages, Discord bots, Discord embeds, Discord announcements, or when the user needs text styled or structured for Discord's rendering engine — including requests to "turn this into a Discord post," add/reduce emoji, or clean up formatting for a specific channel or thread. Covers bold, italic, underline, strikethrough, spoilers, code blocks with syntax highlighting, headers, subtext, lists, block quotes, masked links, timestamps, mentions, plus structural/tone guidance for announcements (section skeleton, bolded lead-ins, calibrated emoji density) and the pre-draft question that determines link style (masked vs. bare URL). Always presents Discord-ready messages inside fenced code blocks so the user can copy-paste them directly into Discord with all markdown formatting preserved.
---

# Discord Markdown Formatting

Format text for Discord's chat rendering engine. Discord uses a modified subset of Markdown with some unique additions (spoilers, timestamps, subtext, guild navigation).

## Before You Draft

Two questions shape everything below — resolve them before writing instead of guessing:

1. **Who's posting this, and how?** A person typing/pasting it into a channel themselves, or a bot/webhook (an announcement bot, an integration, a webhook payload)? This is the single most important fact for link formatting — see "Masked Links" under Links below. If it isn't stated, default to assuming a person is posting it manually: that's both the more common case and the one where masked links silently fail, so it's the safer default to assume.
2. **What's the actual content?** Pull real features, changes, or details from the user, a changelog, or a repo rather than inventing filler. If research tools are available (reading a CHANGELOG, a repo, docs), use them instead of asking the user to dictate every bullet.

## Composing Announcements — Structure & Tone

Announcements get skimmed, not read start-to-finish — most people scan headers and bold text before deciding whether a bullet is worth reading. Structure for that:

```
# [emoji] Title

**One-line hook** — what this is, in a sentence.

Attribution / byline, if relevant (see Links below for how to format any URLs in it).

## [emoji] Section header (Features, What's New, Details, etc.)

### [emoji] Subsection, if the content has natural categories
- **Bolded lead-in** — supporting detail
- **Bolded lead-in** — supporting detail

## [emoji] Upcoming / Next Steps, if there's a roadmap angle
- What's planned, in the same bolded-lead-in style

## [emoji] Contact / Support, if there's somewhere to follow up
Plain-language pointer + the actual link(s)

_Closing tagline, italicized_
```

Not every announcement needs every section — a one-off event invite doesn't need "Upcoming." Adapt the skeleton to what's actually being announced instead of padding sections for symmetry. `references/templates.md` has ready-made structures for specific announcement types (feature release, maintenance notice, launch, incident report, etc.) — check there first before freehand drafting.

### Bolded lead-ins, not walls of text

Inside bullets, bold the key term or claim, then let the rest of the sentence explain it: `**Auto-mail loot** — attaches up to 12 stacks per run and mails it to your alt.` This lets someone scanning catch the gist from the bold words alone, and read the detail only if they care. Avoid long unstructured prose paragraphs inside a features section.

### Emoji density

The right density, refined against real feedback rather than guessed: **emoji on the title and on every section/subsection header, plus one emoji on a genuine standout bullet per section — not on every bullet.**

- Zero emoji reads flat and corporate for a community announcement.
- An emoji on every bullet reads noisy and undermines which item is actually the highlight — if everything is emphasized, nothing is.
- Headers get emoji because that's where visual navigation happens; 1 (occasionally 2) bullets per section get an emoji to flag the standout item — the rest rely on bold text alone.

When picking which bullet gets the emoji, pick the one that's most novel, most impressive, or most likely to make someone go "oh nice" — not just the first one in the list.

## Output Presentation — CRITICAL

When composing a Discord message for the user, **always present the final message inside a fenced code block** so the user can copy-paste it directly into Discord with all markdown formatting intact.

**Why:** Chat interfaces render markdown (e.g., `**bold**` becomes **bold**). If the user copies rendered text, the markdown syntax is stripped and the message loses its formatting when pasted into Discord. A code block preserves the raw syntax.

### How to Present Discord Messages

Always wrap the final copy-paste-ready message in a fenced code block with the `markdown` language tag:

````
```markdown
# 🚀 Announcement

**This is bold** and ~~this is struck~~ and ||this is a spoiler||

> Block quote here

-# Subtext footer
```
````

### Rules

1. **Always use a fenced code block** — Triple backticks with `markdown` language identifier
2. **The ENTIRE message goes in ONE block** — Everything the user will paste into Discord lives inside a single fenced code block. No part of the Discord message should ever appear outside the block as rendered markdown
3. **Explain outside the block** — Put any notes, options, or context _before_ or _after_ the code block, never inside it
4. **Handle nested code blocks** — If the Discord message itself contains code blocks, use four backticks (``````) as the outer fence so the inner triple backticks are preserved. The user copies everything between the outer fence — the inner triple backticks are part of the Discord message:

`````
````markdown
Here's some code:

```javascript
console.log("hello");
```

Pretty cool right?
````
`````

5. **Multiple messages = multiple blocks** — If providing alternatives or a multi-message sequence, use a separate code block for each with a label above it
6. **Message metadata summary** — Always display a metadata summary table immediately after every Discord message code block (see below)
7. **Templates too** — When presenting templates from the reference files, they should also be in copyable code blocks following these same rules
8. **Never partially render** — Do NOT put headers, bold text, code snippets, or any other Discord-formatted content outside the code block. If it's part of the Discord message, it goes inside the block. The user should never have to assemble a message from rendered markdown and code blocks

### Message Metadata Summary

After **every** Discord message code block, include a summary table with the following stats:

| Stat                 | Description                                       | How to Count                                                                                                            |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Characters**       | Total character count of the message              | Count all characters inside the code block. Show as `X / 2,000` for chat messages or `X / 4,096` for embed descriptions |
| **Sections**         | Number of header-delimited sections               | Count all `#`, `##`, `###` headers. If no headers, show `0`                                                             |
| **User Mentions**    | Users mentioned via `<@USER_ID>` or `<@!USER_ID>` | Count unique `<@...>` patterns (not role mentions)                                                                      |
| **Role Mentions**    | Roles mentioned via `<@&ROLE_ID>`                 | Count unique `<@&...>` patterns. Include `@everyone` and `@here`                                                        |
| **Channel Mentions** | Channels linked via `<#CHANNEL_ID>` or `<id:...>` | Count unique `<#...>` and `<id:...>` patterns                                                                           |
| **URLs**             | Links in the message                              | Count raw URLs and masked links `[text](url)`                                                                           |
| **Code Blocks**      | Code blocks with language info                    | If the message contains fenced code blocks, list languages used (e.g., `javascript`, `bash`). Show `—` if none          |

Format the summary as a compact table directly below the code block:

```
| Stat               | Value          |
|--------------------|----------------|
| Characters         | 437 / 2,000    |
| Sections           | 3              |
| User Mentions      | 1              |
| Role Mentions      | 1 (@everyone)  |
| Channel Mentions   | 0              |
| URLs               | 0              |
| Code Blocks        | —              |
```

**Notes:**

- For role mentions, parenthetically note if `@everyone` or `@here` is included since those ping the entire server
- For code blocks, list each language, e.g. `javascript, bash` — or `(no lang)` if the block has no language identifier
- If characters exceed 80% of the limit, add a ⚠️ warning
- If characters exceed the limit, add a 🚫 and suggest splitting the message
- For URLs, flag it if the message contains masked links `[text](url)` while the delivery context is a regular user message — those render as literal text, not clickable links (see "Masked Links" under Links)

### Example Interaction

**User:** "Write me a Discord announcement about a new SDK release that includes code examples"

**Your response should look like:**

Here's your SDK announcement:

````markdown
# 🚀 Volvox SDK v2.0 — Breaking Changes

Hey @everyone — we just shipped **v2.0** of the SDK and there are a few things you need to know before upgrading.

## What Changed

The `createJar` method now accepts an options object instead of positional arguments:

**Before:**

```ts
const jar = createJar("Lunch Spots", ["Chipotle", "Sweetgreen"], true);
```

**After:**

```ts
const jar = createJar({
  name: "Lunch Spots",
  options: ["Chipotle", "Sweetgreen"],
  allowDuplicates: true,
});
```

## New: Shake Events

```ts
jar.on("shake", (result) => {
  console.log(`🎉 Selected: ${result.option}`);
});
```

> 💡 Full migration guide pinned in <#dev-resources>

Drop questions in <#sdk-support> — <@core-team> is standing by. 🫡

-# v2.0.0 • <t:1770537600:D>
````

| Stat             | Value                |
| ---------------- | -------------------- |
| Characters       | 659 / 2,000          |
| Sections         | 3                    |
| User Mentions    | 1                    |
| Role Mentions    | 1 (@everyone)        |
| Channel Mentions | 2                    |
| URLs             | 0                    |
| Code Blocks      | 3 — `ts`, `ts`, `ts` |

**Key:** Notice the outer fence uses four backticks (``````) because the Discord message contains inner triple-backtick code blocks. The user copies everything between the outer fence — inner backticks are part of the message.

---

## Quick Reference

| Style                 | Syntax               | Renders As           |
| --------------------- | -------------------- | -------------------- |
| Bold                  | `**text**`           | **text**             |
| Italic                | `*text*` or `_text_` | _text_               |
| Underline             | `__text__`           | underlined text      |
| Strikethrough         | `~~text~~`           | ~~text~~             |
| Spoiler               | `\|\|text\|\|`       | hidden until clicked |
| Inline code           | `` `code` ``         | monospaced           |
| Bold italic           | `***text***`         | **_text_**           |
| Underline italic      | `__*text*__`         | underlined italic    |
| Underline bold        | `__**text**__`       | underlined bold      |
| Underline bold italic | `__***text***__`     | all three            |
| Strikethrough bold    | `~~**text**~~`       | struck bold          |

## Text Formatting

### Emphasis

```
*italic* or _italic_
**bold**
***bold italic***
__underline__
~~strikethrough~~
||spoiler text||
```

### Combining Styles

Nest formatting markers from outside in. Discord resolves them in this order: underline → bold → italic → strikethrough.

```
__**bold underline**__
__*italic underline*__
__***bold italic underline***__
~~**bold strikethrough**~~
~~__**bold underline strikethrough**__~~
||**bold spoiler**||
```

### Escaping

Prefix any markdown character with `\` to display it literally:

```
\*not italic\*
\*\*not bold\*\*
\|\|not a spoiler\|\|
```

## Headers

Headers require `#` at the **start of a line** followed by a space. Only three levels are supported.

```
# Large Header
## Medium Header
### Small Header
```

**Important:** Headers do not work inline. The `#` must be the first character on the line.

## Subtext

Small, muted gray text below content. Useful for footnotes, disclaimers, or attribution.

```
-# This renders as subtext
```

## Block Quotes

### Single-line

```
> This is a single block quote
```

### Multi-line

Everything after `>>>` (including subsequent lines) becomes quoted:

```
>>> This entire block
including this line
and this line
are all quoted
```

## Lists

### Unordered

Use `-` or `*` with a space. Indent with spaces for nesting:

```
- Item one
- Item two
  - Nested item
  - Another nested item
    - Deep nested
```

### Ordered

```
1. First item
2. Second item
3. Third item
```

**Auto-numbering trick:** Discord auto-increments if you repeat `1.`:

```
1. First
1. Second (renders as 2.)
1. Third (renders as 3.)
```

## Code Blocks

### Inline Code

```
Use `inline code` for short snippets
```

### Multi-line Code Block

Wrap code with triple backticks on their own lines:

````
```
function hello() {
  return "world";
}
```
````

### Syntax Highlighting

Add a language identifier after the opening backticks:

````
```javascript
function hello() {
  return "world";
}
```
````

See [references/syntax-highlighting.md](references/syntax-highlighting.md) for the full list of supported languages.

**Commonly used languages:** `javascript`, `typescript`, `python`, `csharp`, `json`, `bash`, `css`, `html`, `sql`, `yaml`, `diff`, `markdown`

## Links

### Masked Links

```
[Click here](https://example.com)
```

**Masked links only render as clickable in bot messages, webhook messages, and embeds — never in a normal message a person types or pastes.** Discord's own engineering team has confirmed on the public API-docs issue tracker that masked-link rendering has never been rolled out for general user messages: send `[label](url)` in a regular chat message and Discord shows the literal brackets, label, and URL as plain text, not a link.

Since this skill's default output (see "Output Presentation" above) is a copy-paste-ready message for a person to post themselves, **default to bare or auto-linked URLs, not masked links**, unless "Before You Draft" confirmed the message is going out through a bot or webhook. When multiple links need attribution, skip masking entirely and write the URL out bare next to its label, e.g. `Built by **Name** under **Company** (https://company.com) → https://product.com` — note this is deliberately *not* a masked link, since masking is exactly what to avoid in this context. Bolding the name/label this way is a good default — it's the same bolded-lead-in pattern recommended above — but it isn't mandatory; plain text is equally correct when the surrounding message or template doesn't use bold elsewhere. Either way, the URL itself stays unformatted so it remains a clean clickable link.

If the message _is_ bot/webhook-authored and masked links are safe to use, still keep emoji out of the label — Discord explicitly disallows emoji inside a masked link's clickable text (`[🎉 Patch Notes](url)` won't mask; `🎉 [Patch Notes](url)` will).

### Auto-linking

Discord auto-links any valid URL pasted directly:

```
Check out https://example.com for more info
```

### Suppressing Link Previews

Wrap a URL in angle brackets to prevent Discord from generating a preview embed:

```
<https://example.com>
```

## Timestamps

Dynamic timestamps that display in each user's local timezone.

**Format:** `<t:UNIX_TIMESTAMP:FORMAT_FLAG>`

| Flag | Output Style              | Example                            |
| ---- | ------------------------- | ---------------------------------- |
| `t`  | Short time                | `4:20 PM`                          |
| `T`  | Long time                 | `4:20:30 PM`                       |
| `d`  | Short date                | `02/08/2026`                       |
| `D`  | Long date                 | `February 8, 2026`                 |
| `f`  | Short date/time (default) | `February 8, 2026 4:20 PM`         |
| `F`  | Long date/time            | `Sunday, February 8, 2026 4:20 PM` |
| `R`  | Relative                  | `2 hours ago`                      |

**Example:**

```
Event starts <t:1770537600:F>
That was <t:1770537600:R>
```

**Tip:** Use `Math.floor(Date.now() / 1000)` or `date +%s` to get the current Unix timestamp.

## Mentions & References

```
<@USER_ID>          → @username mention
<@!USER_ID>         → @username mention (nickname format)
<@&ROLE_ID>         → @role mention
<#CHANNEL_ID>       → #channel link
<id:browse>         → Browse Channels link
<id:customize>      → Customize Community link
<id:guide>          → Server Guide link
<id:linked-roles>   → Linked Roles link
```

## Emoji

```
:emoji_name:                    → Standard/custom emoji
<:emoji_name:EMOJI_ID>          → Custom emoji
<a:emoji_name:EMOJI_ID>         → Animated custom emoji
```

## Discord-Specific Gotchas

1. **Masked links don't work in normal messages** — `[label](url)` only renders as clickable in bot/webhook/embed content; in a regular message it shows as literal text. Default to bare URLs unless the message is bot/webhook-authored (see "Masked Links" under Links)
2. **No nested block quotes** — Discord does not support `>>` for nested quotes
3. **Headers need line start** — `#` must be the first character on the line (not inline)
4. **Underline is NOT standard Markdown** — `__text__` underlines in Discord but bolds in standard Markdown
5. **Spoilers are Discord-only** — `||text||` has no equivalent in standard Markdown
6. **Lists need a blank line** — Start lists after a blank line or they may not render
7. **Embed markdown differs** — Some formatting behaves differently in embeds vs chat messages
8. **2000 character limit** — Standard messages max at 2,000 characters; nitro users get 4,000
9. **Embed description limit** — Embed descriptions max at 4,096 characters
10. **Code block language names are case-insensitive** — `JS`, `js`, and `JavaScript` all work

## Formatting for Different Contexts

> **Reminder:** Regardless of context, always present the final Discord-ready message inside a fenced code block so the user can copy-paste it directly. See "Output Presentation" above.

### Chat Messages

Full markdown support **except masked links** — `[label](url)` renders as literal text here, not a clickable link. Use bare or auto-linked URLs instead. 2,000 character limit (4,000 with Nitro).

### Embed Descriptions

Full markdown support. 4,096 character limit. Masked links work reliably here.

### Embed Field Values

Limited markdown. 1,024 character limit per field.

### Bot Messages / Webhooks

Full markdown support, **and masked links work correctly here** (unlike regular chat messages) — this is the one context where `[label](url)` is safe to use. Use embeds for richer formatting.

### Forum Posts

Full markdown support in the post body. Title is plain text only.

## Resources

- **Syntax highlighting:** [references/syntax-highlighting.md](references/syntax-highlighting.md) — full list of supported languages with examples
- **Templates:** [references/templates.md](references/templates.md) — copy-paste templates for common Discord formatting patterns

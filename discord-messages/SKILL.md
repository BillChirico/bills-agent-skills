---
name: discord-messages
description: Format text for Discord using markdown syntax, and draft well-structured Discord announcements. Use when composing Discord messages, bot responses, embed descriptions, forum posts, webhook payloads, announcements, patch notes, or any content destined for Discord's chat interface. Triggers on requests mentioning Discord formatting, Discord messages, Discord bots, Discord embeds, Discord announcements, or when the user needs text styled or structured for Discord's rendering engine — including requests to "turn this into a Discord post," add/reduce emoji, or clean up formatting for a specific channel or thread. Covers bold, italic, underline, strikethrough, spoilers, code blocks with syntax highlighting, headers, subtext, lists, block quotes, masked links, timestamps, mentions, plus structural and tone guidance for announcements. Always presents Discord-ready messages inside fenced code blocks so the user can copy-paste them directly into Discord with all markdown formatting preserved.
---

# Discord Messages Formatting

Format text for Discord's chat rendering engine. Discord uses a modified subset of Markdown with some unique additions (spoilers, timestamps, subtext, guild navigation).

## Before You Draft

Two questions shape everything below — resolve them before writing instead of guessing:

1. **Where will it be posted?** Standard chat, Nitro chat, bot/webhook content, an embed, or a forum post? This determines the character limit and whether the output needs plain message content or embed fields. If unspecified, assume standard chat.
2. **What's the actual content?** Pull real features, changes, or details from the user, a changelog, or a repo rather than inventing filler. If you have tools that can read files or URLs, use them to pull real content instead of asking the user to dictate every bullet.

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

The right density, refined against real feedback rather than guessed: **emoji on the title and every section/subsection header, plus one emoji on a genuine standout bullet per section — never on every bullet, and skip it entirely if nothing in the section actually stands out.**

- Zero emoji reads flat and corporate for a community announcement.
- An emoji on every bullet reads noisy and undermines which item is actually the highlight — if everything is emphasized, nothing is.
- Headers get emoji because that's where visual navigation happens; a standout bullet gets one emoji to flag it — the rest rely on bold text alone.

When picking which bullet gets the emoji, pick the one that's most novel, most impressive, or most likely to make someone go "oh nice" — not just the first one in the list.

## Output Presentation — CRITICAL

When composing a Discord message for the user, **always present the final message inside a fenced code block** so the user can copy-paste it directly into Discord with all markdown formatting intact.

**Why:** Chat interfaces render markdown (e.g., `**bold**` becomes **bold**). If the user copies rendered text, the markdown syntax is stripped and the message loses its formatting when pasted into Discord. A code block preserves the raw syntax.

### How to Present Discord Messages

Always wrap the final copy-paste-ready message in a fenced code block with the `markdown` language tag.

**Backtick fence escalation rule:** The outer fence must use N+1 backticks, where N is the length of the longest backtick fence appearing inside the Discord message. Default is triple backticks; if the message contains triple-backtick code blocks, use four backticks; if it contains four-backtick fences, use five. This preserves all inner backticks when the user copies the raw code block into Discord.

**No inner code blocks** — use triple backticks:
```markdown
# 🚀 Announcement

**This is bold** and ~~this is struck~~ and ||this is a spoiler||

> Block quote here

-# Subtext footer
```

**Inner triple-backtick code blocks** — use four backticks:
````markdown
Here's some code:

```javascript
console.log("hello");
```

Pretty cool right?
````

### Rules

1. **Always use a fenced code block** — Apply the backtick fence escalation rule above to determine the correct fence depth
2. **The ENTIRE message goes in ONE block** — Everything the user will paste into Discord lives inside a single fenced code block. No part of the Discord message should ever appear outside the block as rendered markdown
3. **Explain outside the block** — Put any notes, options, or context _before_ or _after_ the code block, never inside it
4. **Multiple messages = multiple blocks** — If providing alternatives or a multi-message sequence, use a separate code block for each with a label above it
5. **Message metadata summary** — Always display a metadata summary table immediately after every Discord message code block (see below)
6. **Templates too** — When presenting templates from the reference files, they should also be in copyable code blocks following these same rules
7. **Never partially render** — Do NOT put headers, bold text, code snippets, or any other Discord-formatted content outside the code block. If it's part of the Discord message, it goes inside the block. The user should never have to assemble a message from rendered markdown and code blocks

### Message Metadata Summary

After **every** Discord message code block, include a summary table with the following stats:

| Stat                 | Description                                       | How to Count                                                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Characters**       | Total character count of the message              | Count all characters inside the code block. Show as `X / limit`, using the limit for the message's actual context — see "Formatting for Different Contexts" below (2,000 for standard chat, bot/webhook content, and API-created forum bodies; 4,000 for Nitro chat; 4,096 for embed descriptions; 100 for forum titles). |
| **Sections**         | Number of header-delimited sections               | Count all `#`, `##`, `###` headers. If no headers, show `0`                                                                                                                                                                                                   |
| **User Mentions**    | Users mentioned via `<@USER_ID>` or `<@!USER_ID>` | Count unique `<@...>` patterns (not role mentions)                                                                                                                                                                                                            |
| **Role Mentions**    | Roles mentioned via `<@&ROLE_ID>`                 | Count unique `<@&...>` patterns. Include `@everyone` and `@here`                                                                                                                                                                                              |
| **Channel Mentions** | Channels linked via `<#CHANNEL_ID>` or `<id:...>` | Count unique `<#...>` and `<id:...>` patterns                                                                                                                                                                                                                 |
| **URLs**             | Links in the message                              | Count raw URLs and masked links `[text](url)`                                                                                                                                                                                                                 |
| **Code Blocks**      | Code blocks with language info                    | If the message contains fenced code blocks, list languages used (e.g., `javascript`, `bash`). Show `—` if none                                                                                                                                                |

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
- For URLs, count each destination once whether it is bare, angle-bracketed, or presented as a masked link

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

### Combining Styles

Nest formatting markers from outside in — Discord resolves them in this order: underline → bold → italic → strikethrough. The combinations in the Quick Reference table above cover the common cases; two that come up often but aren't in that table:

```
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

Masked links render as clickable text in ordinary chat messages as well as bot, webhook, and embed content. Use them when a readable label is clearer than exposing the full URL. Use a bare URL when the destination itself matters, and wrap a URL in angle brackets when a preview should be suppressed.

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

1. **No nested block quotes** — Discord does not support `>>` for nested quotes
2. **Headers need line start** — `#` must be the first character on the line (not inline)
3. **Underline is NOT standard Markdown** — `__text__` underlines in Discord but bolds in standard Markdown
4. **Spoilers are Discord-only** — `||text||` has no equivalent in standard Markdown
5. **Lists need a blank line** — Start lists after a blank line or they may not render
6. **Embed markdown differs** — Some formatting behaves differently in embeds vs chat messages
7. **Character limits vary by context** — see "Formatting for Different Contexts" below for the exact limit per message type
8. **Code block language names are case-insensitive** — `JS`, `js`, and `JavaScript` all work

## Formatting for Different Contexts

> **Reminder:** Regardless of context, always present the final Discord-ready message inside a fenced code block so the user can copy-paste it directly. See "Output Presentation" above.

### Chat Messages

Masked links and the standard Discord markdown subset are supported. The standard limit is 2,000 characters; Nitro raises a person's message limit to 4,000.

### Embed Descriptions

Full markdown support. 4,096 character limit. Masked links work reliably here.

### Embed Field Values

Limited markdown. 1,024 character limit per field.

### Bot Messages / Webhooks

Message content supports masked links and is limited to 2,000 characters through the API. Use embeds for richer formatting.

### Forum Posts

The forum title is plain text and limited to 100 characters. The starter post is message content: 2,000 characters through the API, or the posting person's normal 2,000/4,000 chat limit in the client. Forum starter messages additionally support headings, lists, and masked links.

## Resources

- **Syntax highlighting:** [references/syntax-highlighting.md](references/syntax-highlighting.md) — full list of supported languages with examples
- **Templates:** [references/templates.md](references/templates.md) — copy-paste templates for common Discord formatting patterns
- **Official chat formatting:** [Discord Markdown Text 101](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline)
- **Official API limits:** [Discord Message Resource](https://docs.discord.com/developers/resources/message) and [Channel Resource](https://docs.discord.com/developers/resources/channel)

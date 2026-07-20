# Discord Formatting Templates

Copy-paste starting points for the most common Discord message types. Replace the bracketed placeholders with real content.

These are skeletons, not finished copy. Before filling one in, apply the judgment from `SKILL.md`: confirm the delivery context so the correct character limit and payload shape are used, choose masked or bare links based on readability, and calibrate emoji and bold to the message's tone rather than copying the skeleton mechanically. A celebratory community post can lean into more emoji; a moderation notice or incident report usually reads better leaner.

## Announcements

> **Note:** These include `@everyone` to notify the whole server. Remove it for a quieter post, or swap in `@here` (online members only) or a role mention like `<@&ROLE_ID>`.

### Feature Release

```
# 🚀 New Feature: [Feature Name] @everyone

We just shipped **[feature name]** — here's what it does:

- **[Benefit 1]** — brief description
- **[Benefit 2]** — brief description
- **[Benefit 3]** — brief description

> Try it now: [instructions, or the actual URL]

-# Released [date] • Questions? Ask in <#CHANNEL_ID>
```

### Product Launch

```
# 🎊 [Product Name] is Live! @everyone

After [X months/weeks] of building, **[Product Name]** is officially available on [platforms].

## What Is It?

[One-paragraph elevator pitch]

## Key Features

- **[Feature 1]** — [short description]
- **[Feature 2]** — [short description]
- **[Feature 3]** — [short description]

## Get It

- 📱 iOS: https://example.com/ios
- 🤖 Android: https://example.com/android
- 🌐 Web: https://example.com

> 🐛 Found a bug? Report it in <#CHANNEL_ID>
> 💡 Feature request? Drop it in <#CHANNEL_ID>

-# Built by <@USER_ID> • v1.0.0
```

### Maintenance Notice

```
# ⚠️ Scheduled Maintenance @everyone

**When:** <t:UNIX_TIMESTAMP:F> (<t:UNIX_TIMESTAMP:R>)
**Duration:** ~[X] minutes
**Impact:** [what will be unavailable]

> We'll update this channel when maintenance is complete.

-# Last updated <t:UNIX_TIMESTAMP:R>
```

### Giveaway / Contest

```
# 🎁 Giveaway: [Prize Name] @everyone

**Prize:** [description of what they win]
**Winners:** [X] winner(s)
**Ends:** <t:UNIX_TIMESTAMP:F> (<t:UNIX_TIMESTAMP:R>)

## How to Enter

1. React to this message with 🎉
2. [Optional: follow @account]
3. [Optional: invite a friend]

## Rules

- Must be a member of this server
- One entry per person
- Winner announced in <#CHANNEL_ID>

> *No purchase necessary. ||Winner selected randomly via [tool].||*

-# Hosted by <@USER_ID> • Good luck!
```

## Community & Moderation

### Welcome Message

```
# 👋 Welcome to [Server Name]!

Hey <@USER_ID>, glad you're here! Here's how to get started:

1. Read the rules in <#CHANNEL_ID>
2. Grab your roles in <id:customize>
3. Introduce yourself in <#CHANNEL_ID>
4. Check out <id:guide> for a full walkthrough

> **Need help?** Ping <@&ROLE_ID> anytime.
```

### Server Rules

```
# 📋 Server Rules

## 1. Be Respectful

Treat everyone with dignity. No harassment, hate speech, or personal attacks.

## 2. Stay On Topic

Use the right channels. Check <id:browse> to find the right place.

## 3. No Spam

No unsolicited DMs, repeated messages, or self-promotion without permission.

## 4. Follow Discord's Terms of Service

> https://discord.com/terms

-# Updated <t:UNIX_TIMESTAMP:D> • Violations may result in a mute or ban
```

### Moderation Notice

```
# ⚠️ Moderation Notice

**User:** <@USER_ID>
**Action:** [Verbal warning / Mute / Temp ban / Ban]
**Duration:** [if applicable]
**Reason:** [brief description of the violation]
**Rule violated:** Rule #[X] — [rule name]

> [Quote of the offending message, or a description of the behavior]

-# Logged by <@USER_ID> • <t:UNIX_TIMESTAMP:f> • Strike [X] of [Y]
```

## Development & Technical

### Bug Report

````
## 🐛 Bug Report

**Summary:** [one-line description]

**Steps to reproduce:**
1. Go to [location]
2. Click on [element]
3. Observe [unexpected behavior]

**Expected:** [what should happen]
**Actual:** [what happens instead]

**Environment:**
- OS: [e.g., Windows 11, macOS 14]
- Version: [e.g., v1.2.3]
- Browser: [if applicable]

```
paste relevant error output here
```

-# Reported by <@USER_ID> • <t:UNIX_TIMESTAMP:d>
````

Uses a four-backtick outer fence because the error-output block is itself a nested triple-backtick code block — see the "Backtick fence escalation rule" in `SKILL.md`.

### Changelog / Release Notes

```
# 📦 v[X.Y.Z] Changelog

## ✨ New

- [Feature description]
- [Feature description]

## 🐛 Fixes

- Fixed [issue description]
- Fixed [issue description]

## ⚠️ Breaking

- [Breaking change] — see ||migration guide in <#CHANNEL_ID>||

-# Full diff: https://example.com/releases/x.y.z
```

### Incident / Outage Report

```
# 🔴 Incident Report: [Brief Title]

**Status:** 🔴 Investigating / 🟡 Identified / 🟢 Resolved
**Start:** <t:UNIX_TIMESTAMP:F>
**Resolved:** <t:UNIX_TIMESTAMP:F> / _ongoing_

## What Happened

[Clear explanation of the issue, who/what was affected, and current impact]

## Timeline

- <t:TIMESTAMP:t> — Issue detected
- <t:TIMESTAMP:t> — Root cause identified
- <t:TIMESTAMP:t> — Fix deployed

## Root Cause

||[Technical explanation, spoiler-tagged for non-technical readers]||

## Next Steps

- [ ] [Preventative measure 1]
- [ ] [Preventative measure 2]

-# Report by <@USER_ID> • Post-mortem in <#CHANNEL_ID>
```

### Feature Request

```
## 💡 Feature Request

**Title:** [Short, descriptive name]
**Priority:** 🔴 High / 🟡 Medium / 🟢 Low
**Problem:** [What problem does this solve? Who has it?]
**Proposed solution:** [How should it work?]
**Alternatives considered:** [Other approaches you thought about]

> [Mockups, screenshots, or examples]

-# Vote with 👍 if you want this • Submitted <t:UNIX_TIMESTAMP:d>
```

## Events

### Event Announcement

```
# 🎉 [Event Name]

**When:** <t:UNIX_TIMESTAMP:F> (<t:UNIX_TIMESTAMP:R>)
**Where:** [location / voice channel / link]
**What:** [description]

## Schedule

- <t:TIMESTAMP_1:t> — [Activity 1]
- <t:TIMESTAMP_2:t> — [Activity 2]
- <t:TIMESTAMP_3:t> — [Activity 3]

> **RSVP:** React with ✅ if you're coming!

-# Hosted by <@USER_ID>
```

Works for meetups, workshops, and game nights alike — swap the schedule for a curriculum, a match lineup, or whatever fits the occasion.

### AMA (Ask Me Anything)

```
# 🎤 AMA with [Guest Name]

**Who:** [Brief bio — title, known for, etc.]
**When:** <t:UNIX_TIMESTAMP:F> (<t:UNIX_TIMESTAMP:R>)
**Where:** <#CHANNEL_ID>

## How It Works

1. Drop your questions in this thread **before** the event
2. Upvote questions you want answered (react 👍)
3. [Guest] answers live starting at <t:UNIX_TIMESTAMP:t>

> *Please keep questions respectful and on-topic.*

-# Organized by <@USER_ID>
```

## Informational

### FAQ Entry

```
### ❓ [Question goes here?]

[Clear, concise answer.]

> **Example:**
> [example or demonstration]

-# See also: <#CHANNEL_ID>
```

Uses a lower-level header on purpose — FAQ entries are typically compiled together under one shared title. Bump it to `#` if posting standalone.

### Onboarding Checklist

```
# ✅ [Server/Project] Onboarding

Welcome! Complete these steps to get set up:

## Account Setup

- [ ] Read the server rules in <#CHANNEL_ID>
- [ ] Grab your roles in <id:customize>
- [ ] Set your server nickname to [format]

## Get Connected

- [ ] Introduce yourself in <#CHANNEL_ID>
- [ ] Join the <#CHANNEL_ID> voice chat

## [Project-Specific]

- [ ] Clone the repo: `git clone [URL]`
- [ ] Set up your environment — see <#CHANNEL_ID>

> **Stuck?** Ping <@&ROLE_ID> — we don't bite. Usually.

-# Last updated <t:UNIX_TIMESTAMP:D>
```

## Formatting Tricks

### Separators & Spacing

Discord doesn't support `---` for horizontal rules, and it collapses deliberately-blank lines. For a visual break, use a Unicode rule:

```
─────────────────────
```

For a blank line Discord won't collapse, put an underscore-space-underscore on its own line: `_ _`.

### Color-Coded Text

Discord doesn't support colored text natively, but a `diff` code block colors lines by their prefix:

````
```diff
+ This line is green (added)
- This line is red (removed)
! This line is orange (in some themes)
```
````

### Aligned / Columnar Text

Discord doesn't render Markdown tables or true multi-column layout in regular messages. Fake alignment with a plain code block, which uses a monospaced font:

````
```
Name        Role          Status
Alice       Admin         Online
Bob         Moderator     Offline
```
````

### Embed-Like Formatting

Simulate an embed's look with a block quote containing a header and bold fields:

```
> ## 📌 Important Notice
>
> This mimics an embed's appearance using a block quote, a header, and bold fields.
>
> **Field 1:** Value
> **Field 2:** Value
```

### Progress Bar

Build a visual progress bar from Unicode block characters:

```
**Upload Progress**
█████████░ 90%
```

### Collapsible Reveal

Spoiler tags hide an answer until someone chooses to reveal it — handy for quiz answers or spoiler warnings:

```
### Answer
||The answer goes here.||
```

### Timestamp Quick Reference

Generate a Unix timestamp for `<t:UNIX_TIMESTAMP:FORMAT>` at [hammertime.cyou](https://hammertime.cyou) or [discordtimestamp.com](https://discordtimestamp.com), or with `date +%s` / `Math.floor(Date.now() / 1000)`:

```
Short time:  <t:1700000000:t>  →  2:13 PM
Long date:   <t:1700000000:D>  →  November 14, 2023
Full:        <t:1700000000:F>  →  November 14, 2023 2:13 PM
Relative:    <t:1700000000:R>  →  2 months ago
```

See the "Timestamps" section in `SKILL.md` for the complete list of format flags.

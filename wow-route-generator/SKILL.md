---
name: wow-route-generator
description: This skill should be used when the user asks to "generate a WoW route map", "show a WoW route on the map", "make a route screenshot", "plot herb and mining nodes", "overlay LootRoute points on Eversong Woods", "make this route preview look like Wowhead", or otherwise needs a coordinate-accurate World of Warcraft gathering-route map from route JSON and Wowhead object locations.
compatibility: Requires Node.js 18+ and network access. Agent Browser is needed only for screenshot verification.
metadata:
  version: "0.3.3"
---

# WoW Route Generator

Generate a real World of Warcraft zone map with Wowhead herb and mining pins plus a world-coordinate route overlay. Produce a responsive Codex inline visualization and, when requested, a verified PNG screenshot.

Keep the result data-driven. Never redraw a WoW map with image generation, hand-place nodes, eyeball route alignment, or stretch route extrema to fit the map. A polished wrong route is still wrong—just with better lighting.

## Resolve skill resources

Set `SKILL_ROOT` to the directory containing this loaded `SKILL.md`. Resolve it from the skill path supplied by the runtime; never assume a home directory or installation root. Treat every bundled path in this skill as relative to `SKILL_ROOT`.

## Preserve the route contract

Treat route JSON as read-only input.

- Read waypoint rows only from the top-level `Points` array.
- Use the first two values of each row as world `X` and `Y`.
- Ignore every other route field.
- Never create, edit, validate, or document route metadata for rendering.
- Never create an additional JSON document for renderer inputs.
- Never write map bounds, object sources, presentation settings, or fetch settings into the route.

Pass renderer inputs directly to the builder CLI. Confirm the route bytes are unchanged after rendering when worktree safety matters.

## Required inputs

Resolve these inputs before building:

- Route JSON with at least two `Points` rows.
- LootRoute-style Lua node table containing herb and mining GameObject IDs.
- Wowhead database zone ID used by object-page `g_mapperData`.
- Verified minimum and maximum world `X` and `Y` bounds for the zone.
- Clean PNG or JPEG map path/URL, or a Wowhead zone ID whose default clean-map asset exists.
- Absolute output path for the HTML fragment.

Stop when an ID, map asset, or world bound cannot be verified. Ask for the missing data instead of guessing.

## Workflow

### 1. Inspect current truth

Read repository instructions, working-tree status, the route, and the node source. Preserve dirty files. Render the working-copy route unless a committed revision is explicitly needed.

Verify numeric WoW IDs with Wowhead. Keep these concepts distinct:

- Wowhead database zone ID for object-page pins and clean-map filenames.
- WoW `UiMapID` for in-game map APIs and `/way` commands.
- GameObject IDs for herb and mining pages.

These IDs are not interchangeable.

### 2. Verify coordinate inputs

Read `references/coordinate-projection.md`. Obtain zone bounds from tested repository data, an authoritative runtime capture, or multiple cross-checked known positions. Never derive bounds from route extrema.

### 3. Build directly from source files

Run the deterministic builder without creating another JSON document:

```bash
node "$SKILL_ROOT/scripts/build-route-map.mjs" \
  --route /absolute/path/to/route.json \
  --node-data /absolute/path/to/NodeData.lua \
  --node-table MID \
  --wowhead-zone-id 15968 \
  --min-world-x 3887.5 \
  --max-world-x 10164.599609375 \
  --min-world-y -9270.830078125 \
  --max-world-y 143.75 \
  --output /absolute/thread-visualization-path/zone-route-map.html \
  --standalone /tmp/zone-route-map-preview.html
```

Add `--map-image-path` or `--map-image-url` only when overriding the default Wowhead clean-map asset. Add `--open-route` only for a deliberately open path. Add `--title` only to override the title derived from the route filename.

To render a committed route, pass a repository-relative `--route` together with `--repo` and `--git-ref`. State the selected revision; never silently hide a dirty working copy.

The command prints a JSON summary with source pages, pages containing zone data, failures, raw observations, unique herb and mining pins, route-point count, map dimensions, and output paths. Treat warnings as incomplete evidence and retry transient failures once.

### Route examples

Read `examples/routes/eversong-example.json` for a complete Eversong route. It is copied from the current bundled artifact and includes the runtime-managed `bundleRevision` field.

Read `examples/routes/zulaman-example.json` for a complete Zul'Aman route. It uses the verified world-coordinate transform for Wowhead zone `15947` and current Midnight herb and mining locations, including [Tranquility Bloom object `516932`](https://www.wowhead.com/object=516932/tranquility-bloom).

Use these examples to understand route structure and waypoint ordering. Before creating or changing `Meta`, inspect the target repository's current `BuildRouteMeta` and `SerializeRoute` implementations. Rendering still reads only `Points` and never writes either example.

### 4. Check the output contract

Confirm all of the following:

- Fragment size remains below 2 MB.
- No document wrapper tags appear in the fragment.
- No placeholders or literal escaped markup remains.
- Route-point count matches the selected source.
- Pins remain split into herbs and mining.
- Every route point projects inside the map tolerance.
- Source route bytes remain unchanged.

The builder rejects empty routes, invalid coordinates, conflicting map-image inputs, missing node tables, zero-pin zones, and out-of-map projections.

### 5. Verify visually

When the `visualize` skill is available, read it fully and follow its inline HTML contract. Put the fragment in the current thread-scoped visualization directory.

Open the standalone preview with `agent-browser`, capture screenshots, and inspect them with the local image viewer:

```bash
agent-browser --session wow-route-generator open file:///tmp/zone-route-map-preview.html
agent-browser --session wow-route-generator set viewport 900 680
agent-browser --session wow-route-generator screenshot /absolute/output/zone-route-map.png
agent-browser --session wow-route-generator set viewport 390 480
agent-browser --session wow-route-generator screenshot /tmp/zone-route-map-narrow.png
agent-browser --session wow-route-generator close
```

Check both widths for a loaded map, terrain-aligned pins, correctly projected route geometry, readable route contrast, a wrapped legend, and no excessive empty screenshot area. Fix source data or projection errors rather than applying arbitrary SVG offsets.

### 6. Respond with the visual

Keep the response short and describe only what the map reveals. Emit the Codex inline visualization directive on its own line:

```text
::codex-inline-vis{file="zone-route-map.html"}
```

Embed a PNG with an absolute local path only when a static screenshot is requested or the inline view is insufficient.

## Visual encoding

Keep the map dominant:

- Theme series 1: route line and waypoint rings.
- Theme series 2: circular herb pins.
- Theme series 3: diamond mining pins.
- Thin background-colored route halo for contrast over parchment terrain.
- One compact legend; no metric-card pileup, toolbar, filters, or invented controls.

Preserve category meaning with both color and shape. Keep waypoint marks small enough to show route geometry without turning every point into a stop sign.

## Maintenance

Check the builder syntax after changing it:

```bash
node --check "$SKILL_ROOT/scripts/build-route-map.mjs"
```

Render a live route after parser, projection, or map-image changes. Compare the summary against current Wowhead data rather than freezing historical counts.

Keep source retrieval public and unauthenticated. Never place cookies, tokens, private repository credentials, or copied browser headers in commands or output files.

## Resources

- `scripts/build-route-map.mjs` — Fetch pins, validate projection, embed the map, and build inline/standalone HTML.
- `examples/routes/eversong-example.json` — Complete canonical Eversong route example.
- `examples/routes/zulaman-example.json` — Complete canonical Zul'Aman route example.
- `references/coordinate-projection.md` — Coordinate formulas, source requirements, Wowhead extraction, and troubleshooting.

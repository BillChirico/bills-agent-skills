# Coordinate projection and source validation

Use this reference when preparing a new zone or diagnosing a misplaced overlay. Keep all renderer inputs outside the route JSON and pass them directly to `build-route-map.mjs`.

## Coordinate projection

Wowhead pins are percentages on the clean zone map. LootRoute points are WoW world coordinates. Project them with verified zone bounds:

```text
mapXPercent = (worldY - minimumWorldY) / (maximumWorldY - minimumWorldY) * 100
mapYPercent = (maximumWorldX - worldX) / (maximumWorldX - minimumWorldX) * 100
```

The swapped axes and inverted world `X` are intentional. WoW world `X` runs north-south while map `Y` runs top-bottom.

Verify bounds from a trusted runtime or data source. Strong evidence includes:

- Existing tested zone bounds in the target repository.
- WoW map APIs evaluated at map corners in-game.
- Multiple known map pins cross-checked against captured world positions.

Reject a projection when landmarks, pins, and route geometry disagree. Never repair alignment by fitting the route to its own extrema, adding arbitrary offsets, or scaling the route independently from the map.

## Route input

Read only the top-level `Points` array. Each row must provide finite world `X` and `Y` values in its first two positions. Ignore remaining row values and every other route field. Rendering must not rewrite the source file.

When `--git-ref` is set, keep `--route` repository-relative and provide `--repo`. Without `--git-ref`, resolve `--route` from the current working directory or pass an absolute path.

## Lua node source

Point `--node-data` at a LootRoute-style Lua source and `--node-table` at the relevant table. Each resource row must contain:

- Numeric `nid` GameObject ID.
- Quoted `name`.
- `Art = "h"` for herbs or `Art = "m"` for mining.

The parser reads only the selected table and deduplicates repeated GameObject IDs. Verify every numeric ID with Wowhead; do not substitute item IDs, spell IDs, or placeholders.

## Wowhead extraction

The builder requests each public object page and extracts its `g_mapperData` assignment. It selects the `--wowhead-zone-id` key and recursively gathers `coords` arrays. Pages without data for that zone are valid and count as empty.

Identical coordinates are deduplicated within each resource category. Herb and mining categories remain separate so overlapping resource types stay visible. The output summary reports raw observations, pages with data, failed pages, and unique rendered pins.

Because Wowhead HTML can change, treat a sudden zero-pin result as a parser or source change—not proof that a zone has no nodes. Open one known object page and confirm that `var g_mapperData` still exists before changing the parser.

## Map image

Without an explicit image input, the builder requests:

```text
https://wow.zamimg.com/images/wow/maps/enus/zoom/<wowhead-zone-id>.jpg
```

Use `--map-image-url` for another public PNG/JPEG or `--map-image-path` for a local file. Never pass both. The builder detects actual image dimensions and uses them for SVG projection.

## Troubleshooting

### Route projects outside the map

Confirm the route's zone/instance, all four world bounds, and axis orientation. A route from another instance cannot be fixed by loosening projection tolerance.

### Clean map returns 404

Confirm the Wowhead database zone ID. A WoW `UiMapID` used by `/way` commands is not necessarily the filename used by Wowhead's clean-map CDN.

### No Lua nodes are found

Confirm the selected table name and inspect its actual rows. Do not weaken the parser to accept unrelated data shapes.

### Some pages fail

Check connectivity and retry once. Keep partial output only when at least one page succeeds and disclose the failure count. Do not use authentication cookies, private tokens, or copied browser credentials.

### Screenshot clips the map

Use a viewport wide enough for the map and legend, capture a normal viewport screenshot, and inspect it before responding. Avoid full-page capture when the wrapper leaves unused vertical space.

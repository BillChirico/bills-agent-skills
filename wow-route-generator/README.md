# WoW Route Generator

Generate coordinate-accurate World of Warcraft gathering-route maps from LootRoute-style route JSON, Lua node data, verified zone bounds, and Wowhead object locations.

The skill produces a responsive inline HTML visualization and can also create a browser-ready preview for verified PNG screenshots. It keeps route JSON read-only and refuses to guess map IDs, coordinate bounds, or missing assets.

## Installation

```bash
npx skills add BillChirico/bills-agent-skills --skill wow-route-generator
```

## Example requests

```text
Generate a WoW route map from route/Eversong_Midnight.json and the MID node table.
```

```text
Overlay this LootRoute route on Eversong Woods with herb and mining pins, then capture a PNG.
```

## Requirements

- Node.js 18 or newer.
- Route JSON with at least two top-level `Points` rows.
- LootRoute-style Lua node data with herb and mining GameObject IDs.
- Verified Wowhead zone ID and world-coordinate bounds.
- A clean PNG/JPEG zone map or a matching Wowhead map asset.

Network access is required when the builder fetches Wowhead object pages or a remote map image.

## Included examples

- `eversong-example.json` — Eversong Woods Midnight gathering route.
- `zulaman-example.json` — Zul'Aman Midnight gathering route derived from current herb and mining locations, including [Tranquility Bloom](https://www.wowhead.com/object=516932/tranquility-bloom).

## Folder map

```text
wow-route-generator/
├── .claude-plugin/
│   └── plugin.json
├── README.md
├── SKILL.md
├── examples/
│   └── routes/
│       ├── eversong-example.json
│       └── zulaman-example.json
├── references/
│   └── coordinate-projection.md
└── scripts/
    └── build-route-map.mjs
```

## Syntax check

```bash
node --check scripts/build-route-map.mjs
```

See [SKILL.md](SKILL.md) for the complete workflow and safety contract.

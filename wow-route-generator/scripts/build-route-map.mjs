#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const defaultObjectBaseUrl = "https://www.wowhead.com/object=";
const defaultRequestTimeoutMilliseconds = 20_000;
const defaultRequestAttempts = 3;
const defaultConcurrency = 8;
const defaultProjectionTolerancePercent = 0.5;
const requestPolicy = Object.freeze({
  attempts: defaultRequestAttempts,
  concurrency: defaultConcurrency,
  timeoutMilliseconds: defaultRequestTimeoutMilliseconds,
});
const valueArguments = new Set([
  "--git-ref",
  "--map-image-path",
  "--map-image-url",
  "--max-world-x",
  "--max-world-y",
  "--min-world-x",
  "--min-world-y",
  "--node-data",
  "--node-table",
  "--object-base-url",
  "--output",
  "--repo",
  "--route",
  "--standalone",
  "--title",
  "--wowhead-zone-id",
]);
const requiredArguments = [
  "route",
  "node-data",
  "node-table",
  "wowhead-zone-id",
  "min-world-x",
  "max-world-x",
  "min-world-y",
  "max-world-y",
  "output",
];

function printHelp() {
  process.stdout.write(`Usage:
  node build-route-map.mjs \\
    --route <route.json> \\
    --node-data <NodeData.lua> \\
    --node-table <table-name> \\
    --wowhead-zone-id <id> \\
    --min-world-x <number> --max-world-x <number> \\
    --min-world-y <number> --max-world-y <number> \\
    --output <fragment.html> [options]

Options:
  --repo <path>                  Repository containing the route for --git-ref.
  --git-ref <ref>                Read the route from a committed Git revision.
  --map-image-path <path>        Use a local PNG or JPEG map.
  --map-image-url <url>          Use a remote PNG or JPEG map.
  --open-route                   Do not close the final route segment.
  --title <text>                 Override the title derived from the route filename.
  --standalone <preview.html>    Also write a browser-ready preview.
  --object-base-url <url>        Override the Wowhead object URL prefix.
  --help                         Show this help.
`);
}

function parseArguments(argumentsList) {
  const parsed = {};

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--help") {
      parsed.help = true;
      continue;
    }
    if (argument === "--open-route") {
      parsed["open-route"] = true;
      continue;
    }

    if (!valueArguments.has(argument)) {
      throw new Error(`Unknown argument: ${argument}`);
    }

    const value = argumentsList[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${argument}`);
    }
    parsed[argument.slice(2)] = value;
    index += 1;
  }

  if (!parsed.help) {
    for (const argument of requiredArguments) {
      if (parsed[argument] === undefined) {
        throw new Error(`--${argument} is required`);
      }
    }
    if (parsed["map-image-path"] && parsed["map-image-url"]) {
      throw new Error("--map-image-path and --map-image-url cannot both be set");
    }
    if (parsed["git-ref"] && !parsed.repo) {
      throw new Error("--repo is required when --git-ref is set");
    }
    if (parsed.repo && !parsed["git-ref"]) {
      throw new Error("--repo requires --git-ref");
    }
  }

  return parsed;
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function assertFiniteNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
}

function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}

function parseFiniteNumber(value, label) {
  return assertFiniteNumber(Number(value), label);
}

function parsePositiveInteger(value, label) {
  return assertPositiveInteger(Number(value), label);
}

function buildInputs(parsedArguments) {
  const routePath = assertNonEmptyString(parsedArguments.route, "--route");
  const gitRef = parsedArguments["git-ref"];
  const repo = parsedArguments.repo;
  if (gitRef && (path.isAbsolute(routePath) || routePath.split(/[\\/]/).includes(".."))) {
    throw new Error("--route must be repository-relative when --git-ref is set");
  }

  const worldBounds = {
    maximumX: parseFiniteNumber(parsedArguments["max-world-x"], "--max-world-x"),
    maximumY: parseFiniteNumber(parsedArguments["max-world-y"], "--max-world-y"),
    minimumX: parseFiniteNumber(parsedArguments["min-world-x"], "--min-world-x"),
    minimumY: parseFiniteNumber(parsedArguments["min-world-y"], "--min-world-y"),
  };
  if (worldBounds.maximumX <= worldBounds.minimumX) {
    throw new Error("--max-world-x must be greater than --min-world-x");
  }
  if (worldBounds.maximumY <= worldBounds.minimumY) {
    throw new Error("--max-world-y must be greater than --min-world-y");
  }

  const title = parsedArguments.title
    ?? path.basename(routePath, path.extname(routePath)).replaceAll("_", " ");

  return {
    isRouteClosed: parsedArguments["open-route"] !== true,
    mapImagePath: parsedArguments["map-image-path"]
      ? path.resolve(assertNonEmptyString(parsedArguments["map-image-path"], "--map-image-path"))
      : undefined,
    mapImageUrl: parsedArguments["map-image-url"],
    nodeDataPath: path.resolve(assertNonEmptyString(parsedArguments["node-data"], "--node-data")),
    nodeTable: assertNonEmptyString(parsedArguments["node-table"], "--node-table"),
    objectBaseUrl: parsedArguments["object-base-url"]
      ? assertNonEmptyString(parsedArguments["object-base-url"], "--object-base-url")
      : defaultObjectBaseUrl,
    outputPath: path.resolve(parsedArguments.output),
    routeGitRef: gitRef ? assertNonEmptyString(gitRef, "--git-ref") : undefined,
    routePath: gitRef ? routePath : path.resolve(routePath),
    routeRepo: repo ? path.resolve(assertNonEmptyString(repo, "--repo")) : undefined,
    standalonePath: parsedArguments.standalone ? path.resolve(parsedArguments.standalone) : undefined,
    title: assertNonEmptyString(title, "--title"),
    wowheadZoneId: parsePositiveInteger(parsedArguments["wowhead-zone-id"], "--wowhead-zone-id"),
    worldBounds,
  };
}

async function loadRoute(routeConfig) {
  let routeBody;
  if (routeConfig.gitRef) {
    try {
      routeBody = execFileSync("git", ["show", `${routeConfig.gitRef}:${routeConfig.path}`], {
        cwd: routeConfig.repo,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not read ${routeConfig.gitRef}:${routeConfig.path}: ${detail}`);
    }
  } else {
    routeBody = await readFile(routeConfig.path, "utf8");
  }

  let parsedRoute;
  try {
    parsedRoute = JSON.parse(routeBody);
  } catch (error) {
    throw new Error(`Route JSON is invalid: ${error instanceof Error ? error.message : String(error)}`);
  }
  assertObject(parsedRoute, "Route JSON");

  const points = parsedRoute.Points;
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error("Route must contain at least two points");
  }

  return points.map((point, index) => {
    if (!Array.isArray(point) || point.length < 2) {
      throw new Error(`Route point ${index + 1} must contain X and Y values`);
    }
    const worldX = assertFiniteNumber(point[0], `Route point ${index + 1} X`);
    const worldY = assertFiniteNumber(point[1], `Route point ${index + 1} Y`);
    return [worldX, worldY];
  });
}

function extractLuaTable(source, tableName) {
  const escapedName = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const assignment = new RegExp(`(?:^|\\n)\\s*${escapedName}\\s*=\\s*\\{`, "m").exec(source);
  if (!assignment) {
    throw new Error(`Could not find Lua table ${tableName}`);
  }

  const start = source.indexOf("{", assignment.index);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === "-" && nextCharacter === "-") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start + 1, index);
    }
  }

  throw new Error(`Lua table ${tableName} is not closed`);
}

function validateNodeObject(rawNode, index) {
  const label = `Node row ${index + 1}`;
  const node = assertObject(rawNode, label);
  const id = assertPositiveInteger(node.id ?? node.nid, `${label} ID`);
  const type = node.type ?? node.art ?? node.Art;
  if (type !== "h" && type !== "m") {
    throw new Error(`${label} type must be "h" or "m"`);
  }
  return {
    id,
    name: typeof node.name === "string" && node.name.trim() !== "" ? node.name : `Object ${id}`,
    type,
  };
}

async function loadNodes(nodesConfig) {
  const source = await readFile(nodesConfig.luaPath, "utf8");
  const tableBody = extractLuaTable(source, nodesConfig.tableName);
  const parsedNodes = [...tableBody.matchAll(/\{([^{}]*)\}/g)].flatMap(([, row], index) => {
    const id = row.match(/\bnid\s*=\s*(\d+)/)?.[1];
    const name = row.match(/\bname\s*=\s*"([^"]+)"/)?.[1];
    const type = row.match(/\bArt\s*=\s*"([hm])"/)?.[1];
    if (!id && !name && !type) return [];
    return [validateNodeObject({ id: Number(id), name, type }, index)];
  });

  if (parsedNodes.length === 0) {
    throw new Error("No herb or mining objects were found in the configured node source");
  }

  const uniqueNodes = new Map();
  for (const node of parsedNodes) {
    const existing = uniqueNodes.get(node.id);
    if (existing && existing.type !== node.type) {
      throw new Error(`Object ${node.id} is classified as both herb and mining`);
    }
    uniqueNodes.set(node.id, existing ?? node);
  }
  return [...uniqueNodes.values()];
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchWithRetry(url, policy) {
  let lastError;
  for (let attempt = 1; attempt <= policy.attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), policy.timeoutMilliseconds);
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; wow-route-generator/1.0)" },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < policy.attempts) await delay(200 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`${url} failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

function findJsonObjectAfter(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return null;
  const start = source.indexOf("{", markerIndex + marker.length);
  if (start === -1) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === '"') {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

function collectCoordinates(value, output) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectCoordinates(entry, output));
    return;
  }
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value.coords)) {
    for (const coordinate of value.coords) {
      if (!Array.isArray(coordinate) || coordinate.length < 2) continue;
      const x = Number(coordinate[0]);
      const y = Number(coordinate[1]);
      if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 100 && y >= 0 && y <= 100) {
        output.push([x, y]);
      }
    }
    return;
  }

  Object.values(value).forEach((entry) => collectCoordinates(entry, output));
}

function buildObjectUrl(baseUrl, objectId) {
  return baseUrl.includes("{id}") ? baseUrl.replaceAll("{id}", String(objectId)) : `${baseUrl}${objectId}`;
}

async function fetchNodePage(node, zoneId, objectBaseUrl, policy) {
  const response = await fetchWithRetry(buildObjectUrl(objectBaseUrl, node.id), policy);
  const html = await response.text();
  const mapperJson = findJsonObjectAfter(html, "var g_mapperData");
  if (!mapperJson) return { ...node, coords: [] };

  let mapperData;
  try {
    mapperData = JSON.parse(mapperJson);
  } catch (error) {
    throw new Error(`Object ${node.id} contains invalid mapper data: ${error instanceof Error ? error.message : String(error)}`);
  }

  const coords = [];
  collectCoordinates(mapperData[String(zoneId)], coords);
  return { ...node, coords };
}

async function fetchNodeData(nodes, zoneId, objectBaseUrl, policy) {
  const results = [];
  const failures = [];

  for (let index = 0; index < nodes.length; index += policy.concurrency) {
    const batch = nodes.slice(index, index + policy.concurrency);
    const settled = await Promise.allSettled(
      batch.map((node) => fetchNodePage(node, zoneId, objectBaseUrl, policy)),
    );
    settled.forEach((result, offset) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        const node = batch[offset];
        failures.push({ id: node.id, reason: result.reason });
        results.push({ ...node, coords: [] });
      }
    });
  }

  failures.forEach((failure) => {
    const detail = failure.reason instanceof Error ? failure.reason.message : String(failure.reason);
    process.stderr.write(`warning: object ${failure.id}: ${detail}\n`);
  });

  const observations = results.reduce((sum, node) => sum + node.coords.length, 0);
  const pagesWithData = results.filter((node) => node.coords.length > 0).length;
  if (pagesWithData === 0) {
    throw new Error(`No configured objects contain pins for Wowhead zone ${zoneId}`);
  }

  const byType = { h: new Map(), m: new Map() };
  for (const node of results) {
    for (const coordinate of node.coords) {
      byType[node.type].set(`${coordinate[0]},${coordinate[1]}`, coordinate);
    }
  }

  return {
    failedPages: failures.length,
    herbs: [...byType.h.values()],
    mining: [...byType.m.values()],
    observations,
    pagesWithData,
  };
}

function detectImage(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return {
      height: buffer.readUInt32BE(20),
      mimeType: "image/png",
      width: buffer.readUInt32BE(16),
    };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      if (startOfFrameMarkers.has(marker)) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          mimeType: "image/jpeg",
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }
      const segmentLength = buffer.readUInt16BE(offset + 2);
      if (segmentLength < 2) break;
      offset += segmentLength + 2;
    }
  }

  throw new Error("Map image must be a valid PNG or JPEG");
}

async function loadMapImage(imagePath, imageUrl, wowheadZoneId, policy) {
  let imageBuffer;
  if (imagePath) {
    imageBuffer = await readFile(imagePath);
  } else {
    const resolvedImageUrl = imageUrl
      ?? `https://wow.zamimg.com/images/wow/maps/enus/zoom/${wowheadZoneId}.jpg`;
    const response = await fetchWithRetry(resolvedImageUrl, policy);
    imageBuffer = Buffer.from(await response.arrayBuffer());
  }

  const detected = detectImage(imageBuffer);

  return {
    data: imageBuffer.toString("base64"),
    ...detected,
  };
}

function projectWorldPoint(point, bounds) {
  return [
    (point[1] - bounds.minimumY) * 100 / (bounds.maximumY - bounds.minimumY),
    (bounds.maximumX - point[0]) * 100 / (bounds.maximumX - bounds.minimumX),
  ];
}

function validateRouteProjection(route, worldBounds) {
  const margin = defaultProjectionTolerancePercent;
  route.forEach((point, index) => {
    const [mapX, mapY] = projectWorldPoint(point, worldBounds);
    if (mapX < -margin || mapX > 100 + margin || mapY < -margin || mapY > 100 + margin) {
      throw new Error(
        `Route point ${index + 1} projects outside the map at ${mapX.toFixed(2)}, ${mapY.toFixed(2)} percent`,
      );
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  const slug = value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "route";
}

function buildFragment(inputs, mapImage, route, nodeData) {
  const rootId = `wow-route-generator-${slugify(inputs.title)}`;
  const title = escapeHtml(inputs.title);
  const routeLabel = "Smooth route";
  const herbLabel = "Herbs";
  const miningLabel = "Mining";
  const closedPathSuffix = inputs.isRouteClosed ? ' + " Z"' : "";

  return `<div id="${rootId}">
  <div class="viz-row wrm-legend" aria-label="Map legend">
    <span><span class="wrm-route-swatch" aria-hidden="true"></span>${routeLabel} · ${route.length} points</span>
    <span><span class="wrm-herb-swatch" aria-hidden="true"></span>${herbLabel} · ${nodeData.herbs.length} pins</span>
    <span><span class="wrm-mining-swatch" aria-hidden="true"></span>${miningLabel} · ${nodeData.mining.length} pins</span>
  </div>
  <svg class="wrm-map" viewBox="0 0 ${mapImage.width} ${mapImage.height}" role="img" aria-labelledby="${rootId}-title ${rootId}-description">
    <title id="${rootId}-title">${title}</title>
    <desc id="${rootId}-description">A ${route.length}-point gathering route over the zone map with ${nodeData.herbs.length} herb pins and ${nodeData.mining.length} mining pins.</desc>
    <image href="data:${mapImage.mimeType};base64,${mapImage.data}" width="${mapImage.width}" height="${mapImage.height}"></image>
    <g class="wrm-herb-layer"></g>
    <g class="wrm-mining-layer"></g>
    <g class="wrm-route-layer"></g>
  </svg>
</div>

<style>
  #${rootId} {
    color: var(--foreground);
    width: 100%;
  }

  #${rootId} .wrm-legend {
    color: var(--muted-foreground);
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  #${rootId} .wrm-legend > span {
    align-items: center;
    display: inline-flex;
    gap: 0.35rem;
  }

  #${rootId} .wrm-route-swatch {
    background: var(--viz-series-1);
    display: inline-block;
    height: 3px;
    width: 18px;
  }

  #${rootId} .wrm-herb-swatch {
    background: var(--viz-series-2);
    border-radius: 50%;
    display: inline-block;
    height: 7px;
    width: 7px;
  }

  #${rootId} .wrm-mining-swatch {
    background: var(--viz-series-3);
    display: inline-block;
    height: 7px;
    transform: rotate(45deg);
    width: 7px;
  }

  #${rootId} .wrm-map {
    display: block;
    height: auto;
    max-width: 100%;
    width: 100%;
  }

  #${rootId} .wrm-herb-pin {
    fill: var(--viz-series-2);
    opacity: 0.72;
  }

  #${rootId} .wrm-mining-pin {
    fill: var(--viz-series-3);
    opacity: 0.82;
  }

  #${rootId} .wrm-route-halo {
    fill: none;
    opacity: 0.72;
    stroke: var(--background);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 4.8;
    vector-effect: non-scaling-stroke;
  }

  #${rootId} .wrm-route {
    fill: none;
    stroke: var(--viz-series-1);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.4;
    vector-effect: non-scaling-stroke;
  }

  #${rootId} .wrm-waypoint {
    fill: var(--background);
    stroke: var(--viz-series-1);
    stroke-width: 0.9;
    vector-effect: non-scaling-stroke;
  }
</style>

<script>
  (() => {
    const root = document.getElementById(${JSON.stringify(rootId)});
    const herbLayer = root.querySelector(".wrm-herb-layer");
    const miningLayer = root.querySelector(".wrm-mining-layer");
    const routeLayer = root.querySelector(".wrm-route-layer");
    const namespace = "http://www.w3.org/2000/svg";
    const width = ${mapImage.width};
    const height = ${mapImage.height};
    const herbs = ${JSON.stringify(nodeData.herbs)};
    const mining = ${JSON.stringify(nodeData.mining)};
    const route = ${JSON.stringify(route)};
    const bounds = ${JSON.stringify(inputs.worldBounds)};

    const create = (name, attributes = {}) => {
      const element = document.createElementNS(namespace, name);
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
      return element;
    };

    const projectMapPoint = ([x, y]) => [x * width / 100, y * height / 100];
    const projectWorldPoint = ([worldX, worldY]) => projectMapPoint([
      (worldY - bounds.minimumY) * 100 / (bounds.maximumY - bounds.minimumY),
      (bounds.maximumX - worldX) * 100 / (bounds.maximumX - bounds.minimumX),
    ]);

    const herbFragment = document.createDocumentFragment();
    herbs.forEach((point) => {
      const [cx, cy] = projectMapPoint(point);
      herbFragment.appendChild(create("circle", {
        class: "wrm-herb-pin",
        cx: cx.toFixed(2),
        cy: cy.toFixed(2),
        r: 1.05,
      }));
    });
    herbLayer.appendChild(herbFragment);

    const miningFragment = document.createDocumentFragment();
    mining.forEach((point) => {
      const [cx, cy] = projectMapPoint(point);
      miningFragment.appendChild(create("rect", {
        class: "wrm-mining-pin",
        height: 1.9,
        transform: \`rotate(45 \${cx.toFixed(2)} \${cy.toFixed(2)})\`,
        width: 1.9,
        x: (cx - 0.95).toFixed(2),
        y: (cy - 0.95).toFixed(2),
      }));
    });
    miningLayer.appendChild(miningFragment);

    const routePathData = route
      .map((point, index) => {
        const [x, y] = projectWorldPoint(point);
        return \`\${index === 0 ? "M" : "L"} \${x.toFixed(2)} \${y.toFixed(2)}\`;
      })
      .join(" ")${closedPathSuffix};

    routeLayer.appendChild(create("path", { class: "wrm-route-halo", d: routePathData }));
    routeLayer.appendChild(create("path", { class: "wrm-route", d: routePathData }));

    const waypointFragment = document.createDocumentFragment();
    route.forEach((point) => {
      const [cx, cy] = projectWorldPoint(point);
      waypointFragment.appendChild(create("circle", {
        class: "wrm-waypoint",
        cx: cx.toFixed(2),
        cy: cy.toFixed(2),
        r: 1.55,
      }));
    });
    routeLayer.appendChild(waypointFragment);
  })();
</script>
`;
}

function buildStandalone(title, fragment) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light dark;
      --background: light-dark(#ffffff, #181818);
      --foreground: light-dark(#181818, #f4f4f4);
      --muted-foreground: light-dark(#5d5d5d, #a9a9a9);
      --viz-series-1: light-dark(#006dcc, #73b7ff);
      --viz-series-2: light-dark(#b85d00, #f0a45d);
      --viz-series-3: light-dark(#087f5b, #68d6a8);
    }
    body {
      background: var(--background);
      color: var(--foreground);
      font-family: ui-sans-serif, system-ui, sans-serif;
      margin: 0;
      padding: 16px;
    }
    .viz-row {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 0.8rem;
    }
  </style>
</head>
<body>
${fragment}</body>
</html>
`;
}

async function main() {
  const parsedArguments = parseArguments(process.argv.slice(2));
  if (parsedArguments.help) {
    printHelp();
    return;
  }

  const inputs = buildInputs(parsedArguments);
  const route = await loadRoute({
    gitRef: inputs.routeGitRef,
    path: inputs.routePath,
    repo: inputs.routeRepo,
  });
  validateRouteProjection(route, inputs.worldBounds);
  const nodes = await loadNodes({ luaPath: inputs.nodeDataPath, tableName: inputs.nodeTable });
  const [mapImage, nodeData] = await Promise.all([
    loadMapImage(inputs.mapImagePath, inputs.mapImageUrl, inputs.wowheadZoneId, requestPolicy),
    fetchNodeData(nodes, inputs.wowheadZoneId, inputs.objectBaseUrl, requestPolicy),
  ]);
  const fragment = buildFragment(inputs, mapImage, route, nodeData);

  await mkdir(path.dirname(inputs.outputPath), { recursive: true });
  await writeFile(inputs.outputPath, fragment);
  if (inputs.standalonePath) {
    await mkdir(path.dirname(inputs.standalonePath), { recursive: true });
    await writeFile(inputs.standalonePath, buildStandalone(inputs.title, fragment));
  }

  process.stdout.write(`${JSON.stringify({
    failedPages: nodeData.failedPages,
    herbPins: nodeData.herbs.length,
    mapHeight: mapImage.height,
    mapWidth: mapImage.width,
    miningPins: nodeData.mining.length,
    observations: nodeData.observations,
    output: inputs.outputPath,
    pagesWithData: nodeData.pagesWithData,
    routePoints: route.length,
    sourcePages: nodes.length,
    standalone: inputs.standalonePath ?? null,
  })}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`wow-route-generator: ${message}\n`);
  process.exitCode = 1;
});

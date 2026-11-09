import { COPY } from "./homepage-copy";
import { ARCHIVO_WOFF2, MONO_WOFF2 } from "./homepage-fonts";

export interface Registry {
  id: keyof typeof COPY.rules.items;
  name: string;
  symbol: string;
  shape: string;
  example: string;
  /** Number of path segments the route takes; null when a name may hold slashes. */
  parts: number | null;
  /** True where src/platforms.ts applies its own rule instead of the registry's pointer. */
  ownRule: boolean;
}

// Order along the chart's diagonal, bottom left to top right: registries that
// answer for themselves first, the four with lateststable's own rule last.
export const REGISTRIES: Registry[] = [
  { id: "pypi", name: "PyPI", symbol: "Py", shape: "/v1/pypi/{package}", example: "fastapi", parts: null, ownRule: false },
  { id: "npm", name: "npm", symbol: "Np", shape: "/v1/npm/{package}", example: "express", parts: null, ownRule: false },
  { id: "github", name: "GitHub", symbol: "Gh", shape: "/v1/github/{user}/{repo}", example: "denoland/deno", parts: 2, ownRule: false },
  { id: "crates", name: "crates.io", symbol: "Cr", shape: "/v1/crates/{crate}", example: "serde", parts: null, ownRule: false },
  { id: "go", name: "Go", symbol: "Go", shape: "/v1/go/{module}", example: "golang.org/x/text", parts: null, ownRule: false },
  { id: "homebrew", name: "Homebrew", symbol: "Br", shape: "/v1/homebrew/{formula}", example: "jq", parts: null, ownRule: false },
  { id: "rubygems", name: "RubyGems", symbol: "Rb", shape: "/v1/rubygems/{gem}", example: "rails", parts: null, ownRule: false },
  { id: "helm", name: "Helm", symbol: "Hm", shape: "/v1/helm/{repo}/{chart}", example: "bitnami/postgresql", parts: 2, ownRule: false },
  { id: "jetbrains", name: "JetBrains", symbol: "Jb", shape: "/v1/jetbrains/{product}", example: "IIU", parts: null, ownRule: false },
  { id: "artifacthub", name: "Artifact Hub", symbol: "Ah", shape: "/v1/artifacthub/{kind}/{repo}/{package}", example: "helm/argo/argo-cd", parts: 3, ownRule: false },
  { id: "aur", name: "AUR", symbol: "Au", shape: "/v1/aur/{package}", example: "yay", parts: null, ownRule: false },
  { id: "packagist", name: "Packagist", symbol: "Pk", shape: "/v1/packagist/{vendor}/{package}", example: "laravel/framework", parts: 2, ownRule: true },
  { id: "maven", name: "Maven", symbol: "Mv", shape: "/v1/maven/{groupId}/{artifactId}", example: "org.slf4j/slf4j-api", parts: 2, ownRule: true },
  { id: "docker", name: "Docker Hub", symbol: "Dk", shape: "/v1/docker/{user}/{image}", example: "library/nginx", parts: 2, ownRule: true },
  { id: "nuget", name: "NuGet", symbol: "Ng", shape: "/v1/nuget/{package}", example: "Serilog", parts: null, ownRule: true },
];

export const BAND: [number, number][] = [
  [1, 9], [2, 8], [3, 8], [4, 7], [5, 6], [6, 6], [7, 5], [8, 5],
  [9, 4], [10, 3], [11, 2], [12, 2], [13, 1], [14, 0], [15, 0],
];

type Tag = "alpha" | "beta" | "rc" | "m" | "snap";

const TAG_LABEL: Record<string, Tag> = {
  alpha: "alpha", beta: "beta", rc: "rc", cr: "rc", m: "m", milestone: "m",
  snapshot: "snap", preview: "snap", ea: "snap", dev: "snap", pre: "snap",
};

// [column, row, tag name, column in the stacked layout or 0 when hidden there].
// A tile that shares an edge with a registry tile must name a tag that registry
// removes; test/integration/homepage.test.ts enforces this. Entries with a
// stacked column come first, in reading order, because that layout auto-places.
export const FRINGE: [number, number, string, number][] = [
  [12, 1, "beta", 2], [13, 0, "milestone", 3], [12, 3, "rc", 4], [12, 0, "alpha", 5],
  [13, 2, "dev", 2], [14, 2, "snapshot", 3], [14, 1, "m", 4], [15, 1, "preview", 5],
  [15, 2, "ea", 0], [13, 3, "cr", 0], [14, 3, "pre", 0],
];

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function tile(reg: Registry, index: number): string {
  const [c, r] = BAND[index];
  return `<a class="tile" href="/v1/${reg.id}/${reg.example}" data-reg="${reg.id}" data-pkg="${esc(reg.example)}" style="--c:${c + 1};--r:${r + 1}" title="${esc(`${reg.name}: ${reg.example}`)}"><span class="sym">${reg.symbol}</span><span class="ver" data-ver>&nbsp;</span><span class="pkg" data-name>${esc(reg.example.split("/").pop() as string)}</span><span class="name">${esc(reg.name)}</span></a>`;
}

function fringe([c, r, tag, phone]: [number, number, string, number]): string {
  return `<span class="tag t-${TAG_LABEL[tag]}${phone ? " keep" : ""}" aria-hidden="true" style="--c:${c + 1};--r:${r + 1};--pc:${phone}">${tag}</span>`;
}

const CODE_TOKENS = /info\.version|dist-tags\.latest|versions\.stable|max_stable_version|newest_version|maven-metadata\.xml|type=release|@latest|kind\/repo\/package/g;

function ruleRow(reg: Registry): string {
  return `<tr>
    <td class="cell-reg"><span class="mini" aria-hidden="true">${reg.symbol}</span>${esc(reg.name)}</td>
    <td class="cell-url"><a href="/v1/${reg.id}/${reg.example}">${esc(reg.shape).replace(/\//g, "/<wbr>")}</a></td>
    <td class="cell-rule">${esc(COPY.rules.items[reg.id]).replace(CODE_TOKENS, "<code>$&</code>")}</td>
  </tr>`;
}

const options = REGISTRIES.map(
  (r) => `<option value="${r.id}"${r.id === "pypi" ? " selected" : ""}>${esc(r.name)}</option>`,
).join("");

const clientData = JSON.stringify({
  registries: REGISTRIES.map(({ id, name, shape, example, parts }) => ({ id, name, shape, example, parts })),
  text: COPY.lookup,
  response: COPY.response,
}).replace(/</g, "\\u003c");

const fields = (Object.entries(COPY.shape.fields) as [string, string][])
  .map(([k, v]) => `<div class="row"><dt><code>${k}</code></dt><dd>${esc(v)}</dd></div>`)
  .join("");

const statuses = (Object.entries(COPY.shape.status) as [string, string][])
  .map(([k, v]) => `<div class="row"><dt><code>${k}</code></dt><dd>${esc(v)}</dd></div>`)
  .join("");

const placeholderJson = `{
  "name": "fastapi",
  "version": "x.y.z",
  "major": "x",
  "minor": "y",
  "patch": "z",
  "date": null,
  "platform": "pypi"
}`;

export const HOMEPAGE = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>lateststable.org</title>
<meta name="description" content="${esc(COPY.meta_description)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%230c0d0f'/%3E%3Crect x='10' width='6' height='6' fill='%23f7f8f8'/%3E%3C/svg%3E">
<script>document.documentElement.className = "js";</script>
<style>
@font-face { font-family: "Archivo"; src: url(data:font/woff2;base64,${ARCHIVO_WOFF2}) format("woff2"); font-weight: 400 800; font-stretch: 100% 125%; font-display: swap; }
@font-face { font-family: "Spline Sans Mono"; src: url(data:font/woff2;base64,${MONO_WOFF2}) format("woff2"); font-weight: 400 600; font-display: swap; }

:root {
  --paper: #f7f8f8;
  --ink: #101114;
  --muted: #4c5157;
  --line: #c8ccd0;
  --stable: #0c0d0f;
  --stable-ink: #f4f5f6;
  --pending: #33363b;
  --tag-ink: #15171a;
  --alpha: #f2cf1d;
  --beta: #5db0ea;
  --rc: #ef6f7c;
  --m: #55bb8a;
  --snap: #f2994a;
  --focus: #7a3fd1;
  --focus-on-stable: #b79bf0;
}
.chart, .page, footer { --t: max(72px, min(6.25cqi, 10svh)); }
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #0e1012;
    --ink: #eceef0;
    --muted: #a6adb5;
    --line: #2e3338;
    --stable: #f1f2f3;
    --stable-ink: #0c0d0f;
    --pending: #c2c6cb;
    --focus: #b79bf0;
    --focus-on-stable: #6a35c0;
  }
}

* { box-sizing: border-box; margin: 0; }
html { background: var(--paper); color: var(--ink); -webkit-text-size-adjust: 100%; scrollbar-color: var(--muted) var(--paper); }
body { font: 400 16px/1.5 "Archivo", system-ui, sans-serif; font-stretch: 100%; background: var(--paper); font-variant-numeric: tabular-nums; container-type: inline-size; }
::selection { background: var(--focus); color: var(--paper); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
a { color: inherit; text-underline-offset: 3px; text-decoration-thickness: 1px; }
a:hover { text-decoration-thickness: 2px; }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
code, pre, .ver, .tag, select, input { font-family: "Spline Sans Mono", ui-monospace, monospace; }
input, select, button { font-size: 16px; color: inherit; border-radius: 0; caret-color: var(--focus); }

.chart {
  display: grid;
  grid-template-columns: repeat(16, var(--t));
  grid-template-rows: repeat(10, var(--t));
  width: max-content;
  margin: 0 auto;
}

.title { grid-column: 1 / 10; grid-row: 1 / 6; padding: calc(var(--t) * .42) calc(var(--t) * .5) 0 calc(var(--t) * .42); }
h1 { font-size: calc(var(--t) * .92); line-height: 1; font-weight: 800; font-stretch: 112%; letter-spacing: -.03em; }
.tagline { font-size: calc(var(--t) * .29); line-height: 1.25; margin-top: calc(var(--t) * .2); max-width: 30ch; text-wrap: balance; }
.nokey { color: var(--muted); font-size: 15px; margin-top: 6px; }

.lookup { display: grid; grid-template-columns: minmax(0, 11em) minmax(0, 1fr) auto; gap: 8px; margin-top: calc(var(--t) * .3); align-items: end; }
.field { display: grid; gap: 3px; min-width: 0; }
.field label { font-size: 13px; color: var(--muted); }
select, input[type="text"] { height: 46px; width: 100%; padding: 0 10px; background: transparent; border: 2px solid var(--ink); }
select option { background: var(--paper); color: var(--ink); }
input::placeholder { color: var(--muted); opacity: 1; }
.go { height: 46px; padding: 0 20px; font: 700 16px/1 "Archivo", sans-serif; font-stretch: 112%; background: transparent; color: var(--ink); border: 2px solid var(--ink); cursor: pointer; transition: background-color .15s, color .15s; }
.go:hover { background: var(--stable); color: var(--stable-ink); border-color: var(--stable); }
.help { font-size: 13px; color: var(--muted); margin-top: 8px; }
html:not(.js) .lookup, html:not(.js) .help, html:not(.js) .copy { display: none; }

.tile, .tag { grid-column: var(--c); grid-row: var(--r); }
.tile {
  position: relative; display: grid; grid-template-rows: auto 1fr auto auto; padding: calc(var(--t) * .06);
  background: var(--stable); color: var(--stable-ink); text-decoration: none; overflow: hidden;
  box-shadow: 0 0 0 .5px var(--paper) inset;
  transition: background-color .5s cubic-bezier(.16, 1, .3, 1), color .5s cubic-bezier(.16, 1, .3, 1);
}
.js .tile:not(.landed):not(.miss) { background: var(--pending); }
.tile:hover, .tile:focus-visible, .copy:focus-visible { outline: 3px solid var(--focus-on-stable); outline-offset: -3px; }
.tile.active::after, .key.act::after { content: ""; position: absolute; top: 0; right: 0; background: var(--paper); }
.tile.active::after { width: calc(var(--t) * .2); height: calc(var(--t) * .2); }
.tile.miss { background: transparent; color: var(--ink); box-shadow: 0 0 0 1px var(--ink) inset; }
.tile.miss.active::after { background: var(--ink); }
.tile.miss:hover, .tile.miss:focus-visible { outline-color: var(--focus); }
.sym { font: 800 calc(var(--t) * .26)/1 "Archivo", sans-serif; font-stretch: 112%; letter-spacing: -.01em; }
.ver { font-size: max(11px, calc(var(--t) * .175)); line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; }
.ver.long { font-size: max(10px, calc(var(--t) * .14)); line-height: 1.56; }
.pkg, .name { font-size: max(10.5px, calc(var(--t) * .135)); line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pkg { font-family: "Spline Sans Mono", ui-monospace, monospace; }

.tag { display: flex; align-items: flex-end; padding: calc(var(--t) * .07); color: var(--tag-ink); font-size: max(11px, calc(var(--t) * .14)); line-height: 1; box-shadow: 0 0 0 .5px var(--paper) inset; }
.t-alpha { background: var(--alpha); } .t-beta { background: var(--beta); } .t-rc { background: var(--rc); } .t-m { background: var(--m); } .t-snap { background: var(--snap); }

.legend { grid-column: 1 / 5; grid-row: 6 / 9; padding: calc(var(--t) * .3) calc(var(--t) * .15) 0 calc(var(--t) * .42); font-size: 13px; line-height: 1.3; }
.legend h2 { font: 800 15px/1.2 "Archivo", sans-serif; font-stretch: 112%; margin-bottom: 6px; }
.legend ul { list-style: none; padding: 0; display: grid; gap: 5px; }
.legend li { display: grid; grid-template-columns: 16px 1fr; gap: 8px; align-items: start; }
.key { width: 16px; height: 16px; display: inline-block; }
.key.stable { background: var(--stable); }
.key.hollow { box-shadow: 0 0 0 1px var(--ink) inset; }
.key.act { position: relative; background: var(--stable); }
.key.act::after { width: 7px; height: 7px; }
.key.tags { display: grid; grid-template-columns: repeat(5, 1fr); }
.key.tags i { display: block; }

.response {
  grid-column: 12 / 17; grid-row: 6 / 11;
  background: var(--stable); color: var(--stable-ink); padding: calc(var(--t) * .28);
  display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden;
}
.res-head { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.res-head h2 { margin-right: auto; }
.res-head h2 { font: 700 14px/1.2 "Archivo", sans-serif; font-stretch: 112%; }
.status { font-family: "Spline Sans Mono", monospace; font-size: 13px; }
.curl { margin-top: 10px; padding-bottom: 10px; border-bottom: 1px solid color-mix(in srgb, var(--stable-ink) 32%, var(--stable)); }
.curl code { font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; display: block; }
.copy { font: 500 12px/1 "Archivo", sans-serif; color: inherit; background: transparent; border: 1px solid color-mix(in srgb, var(--stable-ink) 55%, var(--stable)); padding: 6px 8px; cursor: pointer; white-space: nowrap; min-height: 28px; }
.copy:hover { border-color: var(--stable-ink); }
.response pre { margin-top: 10px; font-size: calc(var(--t) * .178); line-height: 1.42; overflow: auto; white-space: pre; scrollbar-color: color-mix(in srgb, var(--stable-ink) 45%, var(--stable)) var(--stable); }
.response pre .hot { font-weight: 600; }
.response .err { color: inherit; white-space: pre-wrap; font-size: 14px; line-height: 1.45; font-family: "Archivo", sans-serif; }
.response ::selection { background: var(--focus-on-stable); color: var(--stable); }

.page { width: min(100%, calc(var(--t) * 16)); margin: 0 auto; padding: 0 calc(var(--t) * .42); }
section { margin-top: calc(var(--t) * 1.6); }
section h2 { font: 800 clamp(28px, calc(var(--t) * .6), 46px)/1.08 "Archivo", sans-serif; font-stretch: 112%; letter-spacing: -.02em; max-width: 24ch; text-wrap: balance; }
.intro { margin-top: 14px; max-width: 62ch; font-size: 18px; color: var(--muted); }

table { border-collapse: collapse; width: 100%; margin-top: 26px; font-size: 15px; }
th, td { text-align: left; vertical-align: top; padding: 11px 16px 11px 0; border-bottom: 1px solid var(--line); }
thead th { font-size: 13px; font-weight: 500; color: var(--muted); }
tbody th { font: 800 15px/1.3 "Archivo", sans-serif; font-stretch: 112%; padding-top: 26px; }
tbody th::first-letter { text-transform: uppercase; }
.cell-reg { white-space: nowrap; font-weight: 600; }
.cell-url { font-family: "Spline Sans Mono", monospace; font-size: 13.5px; white-space: nowrap; }
.cell-rule code { font-family: "Spline Sans Mono", monospace; }
.mini { display: inline-grid; place-items: center; width: 28px; height: 28px; margin-right: 10px; background: var(--stable); color: var(--stable-ink); font: 800 12px/1 "Archivo", sans-serif; font-stretch: 112%; vertical-align: middle; }

.shape { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: calc(var(--t) * .8); margin-top: 26px; }
.shape h3 { font: 800 16px/1.2 "Archivo", sans-serif; font-stretch: 112%; margin-bottom: 8px; }
.shape .aside > * + h3 { margin-top: 28px; }
dl .row { display: grid; grid-template-columns: 7.5em 1fr; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--line); font-size: 15px; }
dd { margin: 0; }
code { font-size: .92em; }
.notes { list-style: none; padding: 0; font-size: 15px; }
.notes li { padding: 9px 0; border-bottom: 1px solid var(--line); }

footer { margin-top: calc(var(--t) * 1.4); padding: 18px 0 32px; border-top: 2px solid var(--ink); display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: 15px; }
footer .right { margin-left: auto; color: var(--muted); }

@media (min-width: 1168px) {
  .chart { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: var(--t) var(--t); }
  .title, .legend { background: var(--paper); }
}
@media (max-width: 1167px) {
  .chart, .page, footer { --t: 68px; }
  .chart { grid-template-columns: repeat(5, minmax(0, 1fr)); grid-template-rows: none; grid-auto-rows: auto; width: auto; max-width: 592px; padding: 0 16px; }
  .chart > * { grid-column: auto; grid-row: auto; }
  .title, .response, .legend { grid-column: 1 / -1; }
  .title { order: 1; padding: 28px 0 22px; }
  h1 { font-size: clamp(32px, 10.6vw, 72px); }
  .tagline { font-size: 21px; }
  .response { order: 2; margin: 0 0 12px; padding: 16px; }
  .response pre { font-size: 13.5px; }
  .tile { order: 3; aspect-ratio: 1; min-width: 0; }
  .tag { display: none; aspect-ratio: 1; }
  .tag.keep { display: flex; order: 4; grid-column: var(--pc); }
  .legend { order: 5; padding: 22px 0 0; }
  .lookup { grid-template-columns: minmax(0, 1fr) auto; }
  .lookup .field:first-child { grid-column: 1 / -1; }
  .page { padding: 0 16px; }
  section { margin-top: 64px; }
  .go, select, input[type="text"] { height: 48px; }
  .copy { min-height: 36px; }
  .shape { grid-template-columns: 1fr; gap: 28px; }
}
@media (max-width: 640px) {
  table, tbody, tr, td { display: block; }
  thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  tbody th { display: block; }
  tbody tr { padding: 12px 0; border-bottom: 1px solid var(--line); }
  td { border: 0; padding: 3px 0; }
  .cell-url { white-space: normal; }
  .cell-url, .cell-rule { padding-left: 38px; }
  dl .row { grid-template-columns: 6.5em 1fr; }
  footer .right { margin-left: 0; width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .tile, .go { transition: none; } }
@media (forced-colors: active) { .tile, .tag { border: 1px solid CanvasText; } .key, .tag { forced-color-adjust: none; } }
</style>
<noscript><style>.ver { visibility: hidden; }</style></noscript>
</head>
<body>
<main>
<div class="chart">
  <div class="title">
    <h1>lateststable.org</h1>
    <p class="tagline">${esc(COPY.tagline)}</p>
    <p class="nokey">${esc(COPY.no_key_line)}</p>
    <form class="lookup" id="lookup" autocomplete="off">
      <div class="field"><label for="reg">${esc(COPY.lookup.registry_label)}</label><select id="reg">${options}</select></div>
      <div class="field"><label for="pkg">${esc(COPY.lookup.package_label)}</label><input id="pkg" type="text" spellcheck="false" autocapitalize="off" placeholder="fastapi"></div>
      <button class="go" id="go" type="submit">${esc(COPY.lookup.button)}</button>
    </form>
    <p class="help" id="help">${esc(REGISTRIES[0].shape)}</p>
    <p class="sr" role="status" id="say"></p>
  </div>

  <div class="response" id="response">
    <div class="res-head"><h2>${esc(COPY.response.heading)}</h2><span class="status" id="status"></span><button class="copy" id="copy" type="button">${esc(COPY.response.copy)}</button></div>
    <div class="curl"><code id="curl">curl -s https://lateststable.org/v1/pypi/fastapi</code></div>
    <pre id="out">${placeholderJson}</pre>
  </div>

  ${FRINGE.map(fringe).join("")}
  ${REGISTRIES.map(tile).join("")}

  <div class="legend">
    <h2>${esc(COPY.legend.heading)}</h2>
    <ul>
      <li><span class="key stable"></span><span>${esc(COPY.legend.stable)}</span></li>
      <li><span class="key tags"><i class="t-alpha"></i><i class="t-beta"></i><i class="t-rc"></i><i class="t-m"></i><i class="t-snap"></i></span><span>${esc(COPY.legend.tags)}</span></li>
      <li><span class="key hollow"></span><span>${esc(COPY.legend.failed)}</span></li>
      <li><span class="key act"></span><span>${esc(COPY.legend.action)}</span></li>
    </ul>
  </div>
</div>

<div class="page">
  <section>
    <h2>${esc(COPY.rules.heading)}</h2>
    <p class="intro">${esc(COPY.rules.intro)}</p>
    <table>
      <thead><tr><th scope="col">${esc(COPY.rules.column_registry)}</th><th scope="col">${esc(COPY.rules.column_url)}</th><th scope="col">${esc(COPY.rules.column_rule)}</th></tr></thead>
      <tbody><tr><th colspan="3" scope="rowgroup">${esc(COPY.rules.tag_own)}</th></tr>${REGISTRIES.filter((r) => r.ownRule).map(ruleRow).join("")}</tbody>
      <tbody><tr><th colspan="3" scope="rowgroup">${esc(COPY.rules.tag_registry)}</th></tr>${REGISTRIES.filter((r) => !r.ownRule).map(ruleRow).join("")}</tbody>
    </table>
  </section>

  <section>
    <h2>${esc(COPY.shape.heading)}</h2>
    <p class="intro">${esc(COPY.shape.intro)}</p>
    <div class="shape">
      <dl>${fields}</dl>
      <div class="aside">
        <h3>${esc(COPY.shape.status_heading)}</h3>
        <dl>${statuses}</dl>
        <h3>${esc(COPY.shape.notes_heading)}</h3>
        <ul class="notes">
          <li>${esc(COPY.shape.cache)}</li>
          <li>${esc(COPY.shape.cors)}</li>
          <li><a href="/v1">${esc(COPY.shape.list)}</a></li>
        </ul>
      </div>
    </div>
  </section>

</div>
</main>
<div class="page">
  <footer>
    <span>${esc(COPY.footer.built_by)} <a href="https://deknijf.com">Rutger de Knijf</a></span>
    <a href="https://github.com/rdeknijf/lateststable">${esc(COPY.footer.source)}</a>
    <span class="right">${esc(COPY.footer.license)}</span>
  </footer>
</div>

<script type="application/json" id="data">${clientData}</script>
<script>
(function () {
  var data = JSON.parse(document.getElementById("data").textContent);
  var text = data.text;
  var byId = {};
  data.registries.forEach(function (r) { byId[r.id] = r; });
  var SAFE = /^[\w.@\/-]+$/;
  var HOST = "https://lateststable.org";

  var reg = document.getElementById("reg");
  var pkg = document.getElementById("pkg");
  var out = document.getElementById("out");
  var status = document.getElementById("status");
  var curl = document.getElementById("curl");
  var copy = document.getElementById("copy");
  var help = document.getElementById("help");
  var say = document.getElementById("say");
  var current = 0;

  function tileOf(id) { return document.querySelector('.tile[data-reg="' + id + '"]'); }

  function get(path) {
    var opts = {};
    if (window.AbortSignal && AbortSignal.timeout) opts.signal = AbortSignal.timeout(15000);
    return fetch(path, opts).then(function (res) {
      return res.text().then(function (raw) {
        var body = null;
        try { body = JSON.parse(raw); } catch (e) { body = null; }
        return { status: res.status, ok: res.ok, body: body };
      });
    });
  }

  function paint(id, name, version) {
    var el = tileOf(id);
    var ver = el.querySelector("[data-ver]");
    var label = name.split("/").pop();
    ver.textContent = version;
    ver.classList.toggle("long", version.length > 8);
    el.querySelector("[data-name]").textContent = label;
    el.setAttribute("data-pkg", name);
    el.href = "/v1/" + id + "/" + name;
    el.title = byId[id].name + ": " + name + " " + version;
    el.classList.remove("miss");
    el.classList.add("landed");
  }

  function fail(id, name) {
    var el = tileOf(id);
    var ver = el.querySelector("[data-ver]");
    ver.textContent = "failed";
    ver.classList.remove("long");
    el.querySelector("[data-name]").textContent = name.split("/").pop();
    el.setAttribute("data-pkg", name);
    el.classList.remove("landed");
    el.classList.add("miss");
  }

  data.registries.forEach(function (r) {
    function stale() { return tileOf(r.id).getAttribute("data-pkg") !== r.example; }
    get("/v1/" + r.id + "/" + r.example).then(function (res) {
      if (stale()) return;
      if (!res.ok || !res.body) throw new Error("miss");
      paint(r.id, r.example, res.body.version);
    }).catch(function () {
      if (!stale()) fail(r.id, r.example);
    });
  });

  function setActive(id) {
    document.querySelectorAll(".tile.active").forEach(function (t) { t.classList.remove("active"); });
    tileOf(id).classList.add("active");
  }

  function showJson(body) {
    out.className = "";
    out.textContent = "";
    JSON.stringify(body, null, 2).split("\n").forEach(function (line, i) {
      if (i) out.appendChild(document.createTextNode("\n"));
      if (line.indexOf('"version"') !== -1) {
        var hot = document.createElement("span");
        hot.className = "hot";
        hot.textContent = line;
        out.appendChild(hot);
      } else {
        out.appendChild(document.createTextNode(line));
      }
    });
  }

  function showError(message, quiet) {
    out.className = "err";
    out.textContent = message;
    if (!quiet) say.textContent = message;
  }

  function pathOf(r) {
    return r.shape.replace("/v1/" + r.id + "/", "").replace(/[{}]/g, "");
  }

  function problem(r, name) {
    if (!SAFE.test(name) || name.indexOf("..") !== -1) return text.invalid;
    if (r.parts !== null && name.split("/").length !== r.parts) {
      return text.parts.replace("{registry}", r.name).replace("{shape}", pathOf(r)).replace("{example}", r.example);
    }
    return "";
  }

  function lookup(id, name, quiet) {
    var r = byId[id];
    var bad = problem(r, name);
    if (bad) {
      current++;
      status.textContent = "";
      showError(bad, quiet);
      return;
    }
    var path = "/v1/" + id + "/" + name;
    var token = ++current;
    setActive(id);
    curl.textContent = "curl -s " + HOST + path;
    status.textContent = "GET";
    get(path).then(function (res) {
      if (token !== current) return;
      status.textContent = String(res.status);
      if (res.ok && res.body) {
        showJson(res.body);
        paint(id, name, res.body.version);
        if (!quiet) say.textContent = res.body.name + " " + res.body.version;
      } else {
        fail(id, name);
        showError(res.body && res.body.error ? res.body.error : text.unreadable, quiet);
      }
    }).catch(function () {
      if (token !== current) return;
      status.textContent = "";
      fail(id, name);
      showError(text.network, quiet);
    });
  }

  function sync() {
    var r = byId[reg.value];
    pkg.placeholder = r.example;
    help.textContent = r.shape;
  }

  reg.addEventListener("change", sync);
  document.getElementById("lookup").addEventListener("submit", function (e) {
    e.preventDefault();
    var id = reg.value;
    var name = pkg.value.trim() || byId[id].example;
    if (id === "maven") name = name.replace(":", "/");
    lookup(id, name);
  });

  document.querySelectorAll(".tile").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      var id = el.getAttribute("data-reg");
      reg.value = id;
      pkg.value = el.getAttribute("data-pkg");
      sync();
      lookup(id, pkg.value);
      if (window.matchMedia("(max-width: 1167px)").matches) document.getElementById("response").scrollIntoView({ block: "nearest" });
    });
  });

  copy.addEventListener("click", function () {
    function flash(label) {
      copy.textContent = label;
      setTimeout(function () { copy.textContent = data.response.copy; }, 1500);
    }
    if (!navigator.clipboard) { flash(data.response.copy_failed); return; }
    navigator.clipboard.writeText(curl.textContent).then(function () { flash(data.response.copied); }, function () { flash(data.response.copy_failed); });
  });

  lookup("pypi", "fastapi", true);
})();
</script>
</body>
</html>`;

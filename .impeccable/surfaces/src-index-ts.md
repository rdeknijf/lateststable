---
version: 1
slug: "src-index-ts"
primary_target: "src/index.ts"
related_targets: []
---

# Homepage surface brief

Scope: `GET /` of lateststable.org, one inline HTML response. Mode: Persuade (the tool's landing page). Build path: code-led, because no image generation is available in this environment.

Audience and job: developers who want the URL shape and a real response within seconds. Secondary readers judge Rutger from how exact the page is. Action: run a lookup in the first viewport. Proof: live API output and the per-registry rules from `src/platforms.ts`. Constraints: API contract unchanged, no static-file route, no third-party runtime request, light and dark, phone width, no em or en dashes in visible text.

Chosen by Rutger's delegation on 2026-11-09 after the dice assigned another world: he said to decide unless deciding was impossible.

## Direction contract

THESIS: A chart of nuclides for software versions. Stable versions sit in black along a diagonal valley, and the tags that do not survive sit beside it in color. It refuses the category's headline, code panel and endpoint table stack.

OWN-WORLD: White lab chart paper in light mode and an inverted chart in dark mode. Square tiles only, on one grid of 16 by 10. Black is reserved for stable. Yellow, blue, red, green and orange belong to prerelease tags. Archivo at expanded width for symbols and the name, Spline Sans Mono for code and data only. A printed legend in the blank part of the chart.

STORY: The visitor sees what the service answers, runs a lookup, reads a real response. Then the visitor reads, registry by registry, which rule produced the answer and where the registry itself decides. The visitor copies a URL.

FIRST VIEWPORT: At 1200x750 the 16 by 10 grid fills the screen. The diagonal band runs bottom left to top right, 15 black registry tiles, with colored tag tiles around the four own-rule registries at the top right end. Upper-left blank holds the name, one sentence and the working lookup. Lower-right blank holds the response as the largest black square. Lower-left blank holds the legend. Without JavaScript every tile, the curl line and the field names still read complete; versions arrive by client fetch.

FORM: Chart of nuclides, candidate 1 on the ordered list, taken as IMPECCABLE'S PICK. seed:8e9056febf83642e. Signature interaction: each tile receives its real version as its own lookup lands, a tile whose lookup fails turns hollow, and a lookup resolves its tile and fills the black response square.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Truth fence

The legend and the rule table must separate registries where lateststable applies a rule (maven, docker, nuget, packagist) from registries whose own pointer it passes on. The diagonal is ordered: registries that answer for themselves first, the four with an own rule at the top right end. A colored tag tile shares an edge only with a registry whose rule removes that tag, and a test enforces this. No version number is hardcoded in the page.

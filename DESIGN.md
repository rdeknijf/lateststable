---
name: lateststable.org
description: Free JSON API for the latest stable version on 15 registries, drawn as a chart of nuclides.
colors:
  stable: "#0c0d0f"
  stable-ink: "#f4f5f6"
  pending: "#33363b"
  alpha: "#f2cf1d"
  beta: "#5db0ea"
  rc: "#ef6f7c"
  m: "#55bb8a"
  snap: "#f2994a"
  tag-ink: "#15171a"
  focus: "#7a3fd1"
  focus-on-stable: "#b79bf0"
  paper: "#f7f8f8"
  ink: "#101114"
  muted: "#4c5157"
  line: "#c8ccd0"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "calc(var(--t) * .92)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(28px, calc(var(--t) * .6), 46px)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1.2
    fontVariation: "'wdth' 112"
  symbol:
    fontFamily: "Archivo, sans-serif"
    fontSize: "calc(var(--t) * .26)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 112"
  button:
    fontFamily: "Archivo, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1
    fontVariation: "'wdth' 112"
  lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  body-dense:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  version:
    fontFamily: "Spline Sans Mono, ui-monospace, monospace"
    fontSize: "max(11px, calc(var(--t) * .175))"
    fontWeight: 600
    lineHeight: 1.25
  data:
    fontFamily: "Spline Sans Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  field:
    fontFamily: "Spline Sans Mono, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 400
rounded:
  none: "0px"
spacing:
  tile: "max(72px, min(6.25cqi, 10svh))"
  tile-stacked: "68px"
  gutter: "calc(var(--t) * .42)"
  panel: "calc(var(--t) * .28)"
  section: "calc(var(--t) * 1.6)"
  footer: "calc(var(--t) * 1.4)"
  control-gap: "8px"
  inset: "10px"
  row-gap: "12px"
  gutter-stacked: "16px"
  block-gap: "26px"
components:
  tile-stable:
    backgroundColor: "{colors.stable}"
    textColor: "{colors.stable-ink}"
    rounded: "{rounded.none}"
    padding: "calc(var(--t) * .06)"
    size: "var(--t)"
  tile-pending:
    backgroundColor: "{colors.pending}"
    textColor: "{colors.stable-ink}"
    rounded: "{rounded.none}"
    padding: "calc(var(--t) * .06)"
    size: "var(--t)"
  tile-hollow:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "calc(var(--t) * .06)"
    size: "var(--t)"
  tag-alpha:
    backgroundColor: "{colors.alpha}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.none}"
    padding: "calc(var(--t) * .07)"
    size: "var(--t)"
  tag-beta:
    backgroundColor: "{colors.beta}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.none}"
    padding: "calc(var(--t) * .07)"
    size: "var(--t)"
  tag-rc:
    backgroundColor: "{colors.rc}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.none}"
    padding: "calc(var(--t) * .07)"
    size: "var(--t)"
  tag-m:
    backgroundColor: "{colors.m}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.none}"
    padding: "calc(var(--t) * .07)"
    size: "var(--t)"
  tag-snap:
    backgroundColor: "{colors.snap}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.none}"
    padding: "calc(var(--t) * .07)"
    size: "var(--t)"
  response-panel:
    backgroundColor: "{colors.stable}"
    textColor: "{colors.stable-ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.panel}"
    size: "calc(var(--t) * 5)"
  input-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "46px"
  button-get:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "46px"
  button-get-hover:
    backgroundColor: "{colors.stable}"
    textColor: "{colors.stable-ink}"
  button-copy:
    backgroundColor: "transparent"
    textColor: "{colors.stable-ink}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
  symbol-badge:
    backgroundColor: "{colors.stable}"
    textColor: "{colors.stable-ink}"
    rounded: "{rounded.none}"
    size: "28px"
---

# Design System: lateststable.org

## Overview

**Creative North Star: "The Chart of Nuclides"**

The system treats software versions like a physics reference chart. A stable version is a solid black tile, and a prerelease tag is a colored tile beside it. A reader understands the page the same way a reader understands a printed chart: position, fill, and a legend carry the meaning.

The surface is lab chart paper with square modules. Density is high inside the chart and calm in the prose below it. The chart is instrument output, so tiles receive real values from the API and show when a value fails. Nothing on the page decorates the chart.

Dark mode is the same chart with paper and stable fill exchanged. The chart keeps its structure and its five tag hues.

**Key Characteristics:**

- One square module sizes the chart, the gutters, and the section rhythm.
- A solid fill means a registry or an API answer.
- Five saturated hues name prerelease tags and do nothing else.
- Expanded Archivo names things, and Spline Sans Mono shows what the API reads or returns.
- All corners are square and no surface has elevation.

## Colors

The palette is a near-monochrome chart with one reserved set of tag hues and one violet for interaction state.

### Primary

- **Stable Black** (#0c0d0f, dark mode #f1f2f3): the fill of a registry tile with a stable version, the symbol badge, the legend key, and the response panel. In dark mode this token becomes a near-white fill.
- **Stable Ink** (#f4f5f6, dark mode #0c0d0f): text on Stable Black, and the base of the mixed hairlines inside the response panel.
- **Pending Graphite** (#33363b, dark mode #c2c6cb): the fill of a tile while its lookup runs.

### Secondary

- **Alpha Yellow** (#f2cf1d): the alpha tag.
- **Beta Blue** (#5db0ea): the beta tag.
- **Candidate Red** (#ef6f7c): the rc and cr tags.
- **Milestone Green** (#55bb8a): the m and milestone tags.
- **Snapshot Orange** (#f2994a): the snapshot, preview, ea, dev, and pre tags.
- **Tag Ink** (#15171a): the text on every tag hue in both color schemes.

### Tertiary

- **Instrument Violet** (#7a3fd1, dark mode #b79bf0): the focus ring on paper, text selection, and the text caret.
- **Pale Instrument Violet** (#b79bf0, dark mode #6a35c0): the focus and hover outline on a stable-filled tile, and text selection inside the response panel.

### Neutral

- **Chart Paper** (#f7f8f8, dark mode #0e1012): the page and the blank cells of the chart.
- **Ink** (#101114, dark mode #eceef0): running text, control borders, the footer rule, and the outline of a hollow tile.
- **Annotation Gray** (#4c5157, dark mode #a6adb5): field labels, help text, table column heads, and introductions.
- **Grid Line Gray** (#c8ccd0, dark mode #2e3338): the chart grid and the row dividers in tables and lists.

### Named Rules

**The Stable Fill Rule.** A solid Stable Black fill marks a registry or an API answer: a tile, a symbol badge, a legend key, or the response panel. The Get button takes this fill on hover and is the only control that does. No band, card, or navigation takes it.

**The Prerelease Hue Rule.** The five tag hues appear only on tag tiles and on their legend key. A link, a status, or an error never uses them.

**The Exchange Rule.** Dark mode exchanges paper, ink, stable fill, pending, and focus values. The five tag hues and Tag Ink stay identical in both schemes.

**The State Violet Rule.** Violet appears only for interaction state: focus, hover outline on a tile, selection, and caret. It never decorates a surface.

## Typography

**Display Font:** Archivo (with system-ui, sans-serif), embedded as a variable font at weights 400 to 800 and widths 100% to 125%.

**Body Font:** Archivo at 100% width (with system-ui, sans-serif).

**Label/Mono Font:** Spline Sans Mono (with ui-monospace, monospace), embedded at weights 400 to 600.

**Character:** Expanded Archivo has the heavy, wide confidence of a printed chart title. Spline Sans Mono is the quiet data line beneath it. The page embeds both faces in its HTML, so it makes no font request.

### Hierarchy

- **Display** (800, 0.92 of the tile, line height 1, 112% width): the product name only. The size is 68.1px on a 1200 wide viewport with a classic scrollbar, and on phones it is `clamp(32px, 10.6vw, 72px)`.
- **Headline** (800, 0.6 of the tile within 28px to 46px, line height 1.08, 112% width): section headings, with a `24ch` limit and balanced wrap.
- **Title** (700 to 800, 14px to 16px, line height 1.2, 112% width): the legend heading, the panel heading, table group heads, and subsection headings.
- **Symbol** (800, 0.26 of the tile, line height 1, 112% width): the two-letter registry symbol on a tile.
- **Button** (700, 16px, line height 1, 112% width): the primary control label.
- **Lead** (400, 18px, line height 1.5): section introductions in Annotation Gray, with a `62ch` limit.
- **Body** (400, 16px, line height 1.5, tabular numerals): the page default.
- **Body Dense** (400, 15px, line height 1.5, tabular numerals): tables, definition lists, notes, and the footer.
- **Label** (400, 13px, line height 1.5): field labels and help text. Column heads use weight 500, and legend entries use line height 1.3.
- **Version** (600, 0.175 of the tile, floor 11px, line height 1.25, mono): the live version on a tile.
- **Data** (400, 13px to 13.5px, line height 1.4, mono): the curl line, the status code, and URL shapes.
- **Field** (400, 16px, mono): the text in the select and the input. The 16px size stops mobile zoom on focus.

### Named Rules

**The Expanded Voice Rule.** Expanded width (112%) belongs to names and headings: the product name, symbols, headings, and the Get button. Running text stays at 100%.

**The Machine Voice Rule.** Spline Sans Mono carries what the API reads or returns: code, URLs, versions, tag names, status codes, JSON, and the lookup controls. Prose never uses it.

**The Tile Text Rule.** Text under 12px exists only inside a chart tile, where the module sets the limit. Every other surface starts at 12px.

## Layout

The chart is one CSS grid of 16 columns by 10 rows on viewports 1168px and wider. The module, named `--t`, is `max(72px, min(6.25cqi, 10svh))`, so at 1200 by 750 with an overlay scrollbar the chart fills the viewport with 75px cells. Grid lines come from two 1px gradients in Grid Line Gray at module size, and the text blocks mask them with Chart Paper. Registry tiles, tag tiles, the response panel, the title, and the legend all take whole grid cells.

Below the chart, the content column is 16 modules wide at most with a gutter of 0.42 module. Sections are 1.6 modules apart. Tables and definition lists use 1px Grid Line Gray dividers and carry no vertical rules. The footer has a 2px Ink rule.

From 1167px and narrower, the module becomes a fixed 68px and the chart becomes five equal columns, 592px wide at most. The order is title and lookup, response, registry tiles, a reduced set of eight tag tiles, then the legend. The response panel follows its content height. Gutters become 16px and sections 64px apart. Controls grow to 48px high. At 640px and narrower, tables stack into blocks and the URL and rule lines indent 38px to clear the symbol badge.

### Named Rules

**The One Module Rule.** On the wide layout, chart cells, type, gutters, and section gaps derive from the module. A new chart element takes whole cells.

## Elevation & Depth

The system is flat. Depth does not exist, and fill alone separates one tile from another. Two zero-offset inset shadows act as strokes and carry no height.

### Shadow Vocabulary

- **Tile seam** (`box-shadow: 0 0 0 .5px var(--paper) inset`): the hairline that separates adjacent filled tiles.
- **Hollow stroke** (`box-shadow: 0 0 0 1px var(--ink) inset`): the outline of a tile whose lookup failed, and of the matching legend key.

### Named Rules

**The Flat Chart Rule.** No surface casts a shadow. An inset stroke with zero offset is the only permitted use of `box-shadow`.

## Shapes

All corners are square. Controls set `border-radius: 0` explicitly, so browser defaults do not round them. The one recurring form beyond the square is the corner notch: a small square of Chart Paper cut from the top right of the active tile, at 0.2 module. On a hollow tile the notch is Ink. The legend key repeats it at 7px.

### Named Rules

**The Square Rule.** Every tile, panel, control, and badge has square corners.

**The Notch Rule.** The top right notch means one thing: this tile ran the most recent lookup. Exactly one tile carries it.

## Components

### Registry Tile

The chart's atom: a link that holds a two-letter symbol, a live version, a package name, and a registry name.

- **Shape:** one grid cell, square corners, padding of 0.06 module.
- **Pending:** Pending Graphite fill until its lookup lands.
- **Landed:** Stable Black fill with Stable Ink text. Fill and text cross-fade over `.5s cubic-bezier(.16, 1, .3, 1)`, and reduced motion removes the transition.
- **Failed:** a transparent fill, the hollow stroke, Ink text, and the word "failed" in the version line.
- **Active:** the top right notch.
- **Hover / Focus:** a 3px outline inset by 3px in Pale Instrument Violet on a filled tile, and in Instrument Violet on a hollow tile.
- **Interior text:** package and registry names are the smallest text in the system and stay inside the tile.

### Tag Tile

A static colored cell in one of the five tag hues, one grid cell in size, with the tag name in mono at the bottom left and hidden from assistive technology. It sits beside a registry tile only when that registry's rule removes the tag.

### Response Panel

The largest solid square on the chart, five modules on each side at wide widths. It holds a heading, a status code, the Copy curl control, a curl line above a mixed-color hairline, and the JSON output. The `version` line of the JSON is weight 600. An error replaces the JSON with Archivo text at 14px, and the panel keeps its fill.

### Inputs / Fields

- **Style:** a 2px Ink stroke, transparent fill, square corners, 46px high and 48px on the stacked layout, mono text.
- **Label:** Label type above the control, 3px away.
- **Focus:** a 3px Instrument Violet outline, offset 2px.

### Buttons

- **Get:** a 2px Ink stroke, transparent fill, Button type, 46px high. On hover it takes the Stable Black fill over `.15s`.
- **Copy curl:** lives only on the response panel, with a 1px hairline stroke mixed at 55% Stable Ink, Archivo 500 at 12px. On hover the stroke becomes full Stable Ink.

### Symbol Badge

A 28px square with the registry symbol in Stable Black, used in the rule table to tie each row back to its tile.

### Legend

A plain list in Label type under a Title heading, set in a blank region of the chart. Each entry starts with a 16px key that shows the real treatment: solid, the five tag hues in one square, hollow, or notched. A new tile state requires a new legend entry.

### Links

Links inherit their color and keep a 1px underline, 3px below the baseline. Hover thickens the underline to 2px.

## Do's and Don'ts

### Do:

- **Do** size any chart element in whole modules.
- **Do** show a failed lookup with a hollow tile and the word "failed".
- **Do** give each new tile state a key in the printed legend.
- **Do** use Instrument Violet for every focus ring, and Pale Instrument Violet on a stable-filled surface.
- **Do** test both color schemes, because the stable fill changes from near-black to near-white.
- **Do** keep every animation to fill and text color, and remove it under reduced motion.

### Don't:

- **Don't** round a corner on a tile, panel, control, or badge.
- **Don't** use a shadow to lift a surface. The zero-offset inset strokes are the only shadows.
- **Don't** use a tag hue for a link, a status, an error, or a decoration.
- **Don't** signal a failure with color. Hollow is the failure treatment.
- **Don't** fill a band, a card, or navigation with Stable Black.
- **Don't** set running text in Spline Sans Mono or in expanded Archivo.
- **Don't** set text under 12px outside a chart tile.

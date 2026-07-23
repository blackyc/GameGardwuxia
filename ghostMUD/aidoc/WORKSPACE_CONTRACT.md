# ghostMUD Workspace Contract

## Canonical project root

The only development, build, runtime, review, and release root is:

```text
D:\git\GameGardwuxia\ghostMUD
```

All commands, screenshots, browser verification, and code edits must use this
directory. `D:\MUD\ghostMUD` is not an acceptance target and must not receive
new product work. Do not copy complete files between the two directories:
the canonical root can contain newer changes that are absent elsewhere.

Before changing runtime code, verify the root with:

```powershell
git rev-parse --show-toplevel
```

Expected result: `D:/git/GameGardwuxia/ghostMUD`.

## Figma-to-runtime asset contract

Figma is the visual source of truth. It does not generate runtime UI by itself.
Every accepted Figma element needs one explicit implementation decision:

| Asset class | Runtime rule | Repository destination |
| --- | --- | --- |
| Paper, borders, spacing, text hierarchy, simple nodes, lines, state colors | Rebuild with HTML/CSS. Do not export a bitmap. | `src/styles/`, `src/ui/` |
| Hand-drawn frame, painted texture, irregular ornamental silhouette, illustration | Export a flattened PNG/WebP with transparency when needed. | `public/ui/` |
| Reference screenshot, mood board, rejected exploration, editable working source | Do not ship. Keep in Figma or archive. | Figma / `aidoc/archive_*/` |

Do not use a screenshot of a complete Figma screen as a runtime background.
Do not add Figma links or copied layer IDs as a substitute for implementation.
Each runtime asset must be named by purpose, for example:

```text
public/ui/frame-room-anchor-v1.webp
public/ui/texture-paper-fiber-v1.webp
public/ui/ornament-route-seal-v1.webp
```

## Required visual acceptance loop

1. Build or update the component in Figma.
2. Record its state contract: default, hover, pressed, disabled, locked, and
   responsive behavior where applicable.
3. Decide CSS reconstruction or bitmap export using the table above.
4. Implement in this repository only.
5. Verify at mobile and desktop widths against the Figma component, then retain
   the screenshot evidence in the current task/audit record.

## Manual Figma export procedure

Only perform this procedure after a component has been accepted and classified
as a bitmap asset above.

1. Open the canonical Figma component, not a page screenshot or a reference
   image. Select exactly one exportable layer or frame.
2. Confirm the layer bounds are tight. Remove any temporary backdrop, notes,
   red annotations, or extra transparent padding before export.
3. In Figma's right sidebar, open **Export**, add one export setting, choose
   **PNG**, and set scale to **2x**. PNG is required when the asset has a
   transparent background.
4. Use the purpose-based filename from the asset contract. Example:
   `frame-room-anchor-v1.png`.
5. Put the exported file in `public/ui/` and tell the implementation task the
   exact filename. The implementation will reference it as `/ui/<filename>`.
6. Do not export text, interaction states, or complete pages. They remain
   semantic HTML/CSS so labels, localization, accessibility, and state changes
   continue to work.
7. For an opaque full-frame illustration, export **JPG at 2x** instead. The
   implementation task may convert approved raster assets to WebP after visual
   verification; the source PNG/JPG should remain available in Figma.

## Interaction authority

Before editing `张望`, `探索`, route discovery, child-room entry, search events, or related quest triggers, read:

```text
aidoc/LOOK_FIND_INTERACTION_AUTHORITY_V1.md
```

That file is the source of truth for these interactions and overrides legacy inline-perception behavior. Migration coverage is tracked in `aidoc/LOOK_FIND_MIGRATION_REPORT_V1.md`.

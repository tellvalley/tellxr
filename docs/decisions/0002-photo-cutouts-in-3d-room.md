# 0002 — Photo cut-outs in the 3D room, and an asset pipeline

Date: 8 October 2026 · Status: accepted (supersedes the first draft, which used a flat stage-photo backdrop)

## Context

The first real artwork arrived as flat PNG exports from Figma: a stage backdrop, two plants, a couple cut-out, an envelope front and six blank wax seals, about 19 MB in total. A first build used the stage photo as a 2.5D backdrop; on review it did not look real enough, so the 3D room from M2 was kept instead.

## Decision

- Keep the **3D Emerald Salon room** as the setting. Photos with transparent backgrounds (the couple, the plants) stand in it as planes, **lit by the room's lights** and turned towards the camera so they never look paper-thin.
- The **couple photo belongs to the event** (`content.couplePhoto`); without one, two silhouettes stand in. Plants and envelope art belong to the template.
- **Wax seals are shared** across templates and chosen per event; the monogram comes from the hosts' initials.
- Templates may provide **HTML envelope art**. It shows immediately, so guests see something within the first second while the room loads behind it.
- Originals live in a **git-ignored `assets-src/`**; `npm run assets` (sharp) produces WebP and enforces the 300 KB per-image budget. The stage backdrop is kept there but not used.

## Consequences

- The full experience is about 2.2 MB uncompressed (images about 0.6 MB), well inside the 6 MB budget.
- Designers keep working in Figma; cut-outs drop straight into any 3D room.
- Cut-outs read best from the front; camera stops avoid looking at them edge-on.
- Couple photos must have a transparent background; the host editor (MVP) will need automatic background removal.

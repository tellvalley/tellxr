# 0002 — Photographic 2.5D templates and an asset pipeline

Date: 7 October 2026 · Status: accepted

## Context

The first real artwork arrived as flat PNG exports from Figma: a stage backdrop, two foreground plants, a couple cut-out, an envelope front and six blank wax seals, about 19 MB in total. Full 3D models would need a modelling tool and much more data.

## Decision

- Build Spotlight Stage as **2.5D**: each photo is an unlit plane at its own depth (backdrop far, couple mid, plants near). Camera moves between stops create real parallax.
- The **couple photo belongs to the event**, not the template, so every couple brings their own cut-out (`content.couplePhoto`). Backdrop and plants belong to the template.
- **Wax seals are shared** across templates and chosen per event; the monogram comes from the hosts' initials.
- Templates may provide **HTML envelope art**. It shows immediately, so guests see something within the first second while textures load behind it.
- Originals live in a **git-ignored `assets-src/`**; `npm run assets` (sharp) produces WebP and enforces the 300 KB per-image budget.

## Consequences

- The full Spotlight Stage experience is about 2.2 MB uncompressed (images 0.66 MB), well inside the 6 MB budget.
- Designers keep working in Figma; no 3D tooling needed for new templates of this kind.
- Parallax is convincing for gentle camera moves only; large orbits would reveal that layers are flat, so camera stops stay mostly frontal.
- Couple photos must have a transparent background; the host editor (MVP) will need automatic background removal.

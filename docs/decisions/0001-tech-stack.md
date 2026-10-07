# 0001 — Tech stack: Next.js + Three.js instead of Unity

Date: 7 October 2026 · Status: accepted

## Context

The reference product (WedX) ships each invitation as a Unity WebGL build of about 20 MB, with all text drawn inside a canvas. Our guests open links from WhatsApp on mid-range Android phones and mobile data, and our team designs in Figma and builds with Claude.

## Decision

- **Next.js (TypeScript) on Vercel** for the guest page, API and later the host editor.
- **Three.js via React Three Fiber** for scenes, **GSAP** for camera motion (from M2).
- **Tailwind CSS** for HTML UI, **Zod** for validating event content against template schemas.
- **Supabase** proposed for database, auth and storage (to confirm before M5).
- Fonts self-hosted via `@fontsource` packages.

## Consequences

- Target download drops from ~20 MB to under 6 MB, with the envelope usable under 3 MB.
- Names, dates and RSVP stay in HTML: accessible, translatable, editable without rebuilding scenes.
- No game-engine editor: scenes are code, so complex 3D art needs a modelling tool (Blender) and an asset pipeline.
- Next.js 16 with Cache Components has new conventions; check its bundled docs before using unfamiliar APIs.

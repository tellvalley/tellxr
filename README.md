# TellXR

Immersive invitations that open beautifully on any phone. Weddings first; events and artist booking later.

Technical spec: [`docs/TECHNICAL.md`](docs/TECHNICAL.md).

© Tell Valley Studios. All rights reserved; see [`LICENSE`](LICENSE).

## Status

Prototype. **M1–M3** done: invites play as a 3D journey (envelope → room → story → card), driven entirely by event config, with real artwork: watercolour envelope, wax seals, the couple's photo and plants in the Emerald Salon room.

Sample invites:

- `/e/prodigydan-daniella`: ProdigyDan & Daniella (main sample)
- `/e/amara-tobi`: a second couple, proving a new invite needs data only

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Update artwork

Put the original PNG exports in `assets-src/` (same names as in `scripts/optimize-assets.mjs`), then run `npm run assets`. Originals stay out of Git.

## Add a sample invite

1. Copy `content/events/prodigydan-daniella.json` to a new file and change the details.
2. Import it in `lib/events.ts` and add it to `rawEvents`.
3. Visit `/e/<your-slug>`. If any field is invalid, the build fails with a message naming it.

## Project layout

| Path | What lives there |
| --- | --- |
| `app/` | Routes: guest page `/e/[slug]`, API `/api/events/[slug]` |
| `components/` | HTML UI: invite card, story panels |
| `engine/` | Shared 3D runtime: stages, camera rig, envelope, overlays, quality tiers |
| `templates/<id>/` | One folder per template: manifest, content schema, scene, layout |
| `public/` | Optimised images: seals, template art, sample event media |
| `scripts/` | `npm run assets`: compress design exports from `assets-src/` |
| `content/events/` | Sample event configs |
| `lib/` | Event schema, data access, formatting |
| `docs/` | Technical spec and decision records |

# TellXR

Immersive invitations that open beautifully on any phone. Weddings first; events and artist booking later.

Technical spec: [`docs/TECHNICAL.md`](docs/TECHNICAL.md).

© Tell Valley Studios. All rights reserved; see [`LICENSE`](LICENSE).

## Status

Prototype. **M1 Foundations** and **M2 Engine skeleton** done: the invite plays as a 3D journey (envelope → room → story → card) with placeholder shapes, entirely driven by event config. Real Emerald Salon art arrives in M3.

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

## Add a sample invite

1. Copy `content/events/prodigydan-daniella.json` to a new file and change the details.
2. Import it in `lib/events.ts` and add it to `rawEvents`.
3. Visit `/e/<your-slug>`. If any field is invalid, the build fails with a message naming it.

## Project layout

| Path | What lives there |
| --- | --- |
| `app/` | Routes: guest page `/e/[slug]`, API `/api/events/[slug]` |
| `components/` | HTML UI: invite card, story panels |
| `templates/emerald-salon/` | First template: manifest and content schema (scene arrives in M3) |
| `content/events/` | Sample event configs |
| `lib/` | Event schema, data access, formatting |
| `docs/` | Technical spec and decision records |

# TellXR — Technical Spec

What the prototype must do and how it is built. Product strategy, roadmap and business planning live in the team's private PRD, not in this public repo.

## Prototype requirements: the guest experience

A guest taps a link, opens an envelope, walks into the couple's room, reads their story, sees the invite and RSVPs, all in about two minutes. The sample event is **ProdigyDan & Daniella**; sample data is in `content/events/`.

**Guest flow**

1. **Link preview.** In WhatsApp the link shows the couple's names, a cover image and "You're invited", or the guest's own name when the link is personal.
2. **Loader.** A branded mark and progress bar while assets download. Under 3 s on 4G.
3. **Envelope.** A sealed envelope in the event colours, greeting the guest by name when known ("Dear Tunde"). Tapping the seal opens it and starts the music, since browsers only allow audio after a tap.
4. **Room.** The camera glides into a 3D room. The couple photo stands in the scene, their names glow above them, and up to four story panels sit around the room. The camera pauses on each panel; the guest can tap to skip ahead.
5. **Invite card.** "View invitation" moves the camera to a table and blurs the background. The card shows names, date, time, venue (with a map link) and dress code.
6. **Actions.** Buttons under the card: RSVP, Add to calendar, Directions, and Gallery and Gift registry when the host has turned them on.
7. **RSVP.** A short HTML form: attending yes or no, number attending (capped by the guest's allowance), dietary note, message to the couple. Saved to the database with a thank-you screen.
8. **Return visit.** Reopening a personal link skips straight to the card and shows the guest's existing RSVP, which they can change until the RSVP deadline.

**Acceptance criteria**

- [ ] Every name, date, colour, image, story line and link on screen comes from the event config; none is hard-coded.
- [ ] Swapping in a second sample config renders a different invite with no code change.
- [ ] Works on Chrome for Android and Safari for iPhone, portrait first; landscape and desktop are usable.
- [ ] Mute and replay controls are always visible once music starts.
- [ ] If WebGL is missing or the phone is too slow, a 2D fallback shows the same card and RSVP.
- [ ] `prefers-reduced-motion` replaces camera flights with fades.
- [ ] An RSVP submitted on a phone appears in the database within 5 seconds.
- [ ] Performance budget in the non-functional requirements is met on a mid-range Android phone.

## Non-functional requirements

Speed on a mid-range Android phone over mobile data is the requirement everything else bends to.

| Area | Requirement |
| --- | --- |
| Performance budget | Envelope tappable with under 3 MB loaded; full experience under 6 MB; room assets stream in while the envelope shows |
| Assets | Images as WebP or AVIF, each under 300 KB; textures compressed (KTX2); models compressed (Draco or Meshopt); music under 2 MB |
| Rendering | Device pixel ratio capped at 2; quality tier drops automatically when frame rate falls below 30 fps |
| Fallback | No WebGL, or the low tier still too slow → 2D version with the same content and RSVP |
| Accessibility | All information in HTML text; contrast AA; buttons at least 44 px; reduced-motion mode; captions for story panels readable by screen readers |
| Privacy | Guest links use random tokens; guest names never appear in URLs; only the host sees RSVPs; follow the Nigeria Data Protection Act 2023 for guest personal data |
| Security | RSVP endpoint rate-limited and token-checked; host data isolated per account (row-level security) |
| Reliability | Published invites served from a CDN; an outage of the editor never takes guest pages down |
| Observability | Anonymous analytics for opens, stage reached and RSVPs; error reporting on the guest page |

## Architecture and tech stack

One Next.js app on Vercel serves the guest page, the API and later the host editor; Supabase holds the data. Guest pages are cached at the edge, so a busy wedding weekend costs almost nothing.

```
Guest's phone ──taps link──▶ ┌ Next.js on Vercel ───────────────┐      ┌ Supabase ─────────┐
                             │  Guest invite page (CDN-cached)  │      │  Postgres          │
                             │      │ RSVP                      │      │  Auth (MVP)        │
                             │      ▼                           │      │  Storage           │
                             │  API routes ─────────queries────────▶  │                    │
                             │      ▲                           │      └────────────────────┘
Host's phone (MVP) ────────▶ │  Host editor (MVP)               │
                             └──────────────▲───────────────────┘
                                            │ bundled at build
                             Templates (in repo): scene.tsx, template.json, assets
```

Templates ship inside the app bundle; the API is the only part that talks to the database.

| Layer | Choice | Why |
| --- | --- | --- |
| App framework | Next.js (React, TypeScript) | Guest pages, API routes and preview images in one codebase |
| 3D | Three.js with React Three Fiber and drei | Light, mature, huge community; a scene is just components |
| Motion | GSAP | Smooth, tunable camera flights and timelines |
| Styling | Tailwind CSS | Quick to match Figma colours, type and spacing |
| Validation | Zod | Checks event content against each template's schema |
| Data, auth, files | Supabase (Postgres, row-level security, Auth, Storage) | One service, generous free tier, per-host data isolation |
| Hosting | Vercel | Preview link per pull request, edge caching, wildcard subdomains |
| Asset pipeline | gltf-transform, sharp | Compress models, textures and images to the budget |
| Monitoring (MVP) | Vercel Analytics, Sentry | Funnel numbers and error alerts |

## Data model

Everything hangs off **Event**, never Wedding. A wedding is an event of type `wedding` whose hosts have the roles bride and groom; a concert later is type `concert` with an organiser and artists. The prototype uses the first five tables; the rest are reserved names so we do not paint ourselves into a corner.

| Entity | Key fields | Notes | Phase |
| --- | --- | --- | --- |
| Event | id, slug, type, title, starts_at, timezone, venue, status (draft, published, archived), template_id, template_version, content (JSON), owner_id | `content` holds the slot values the template asks for, validated against the template's schema | Prototype |
| EventHost | event_id, display_name, role (bride, groom, celebrant, organiser, artist), photo | Separates people from the event so any type can have any roles | Prototype |
| Template | id, name, version, event_types, scene_module, assets_base_url, content_schema (JSON Schema), preview_image | Versioned so published events never break when a template changes | Prototype |
| Guest | id, event_id, name, phone, email, group, max_party_size, token | `token` is random and is the only guest identifier in links | Prototype |
| Rsvp | id, guest_id (nullable for general links), event_id, attending, party_size, dietary_note, message, updated_at | One row per guest, updated on change | Prototype |
| Account | id, name, email or phone, plan | Hosts, planners and admins | MVP |
| Membership | account_id, event_id, role (owner, editor, viewer) | Lets planners and co-hosts share events | MVP |
| Media | id, event_id, kind, url, width, height, bytes | Every uploaded file, for size checks and cleanup | MVP |
| AnalyticsEvent | event_id, guest_id, kind (opened, envelope, room, card, rsvp), at | Funnel for hosts and for us | MVP |

## Template system

A template is a scene plus a contract: it declares the slots it needs, and the engine refuses to render content that does not satisfy them. That contract is what lets hosts edit safely and lets us add templates without touching the engine.

**A template folder holds**

- `template.json`: id, name, version, supported event types, camera stops.
- `layout.ts` (or `stops.ts`): camera stops, layer positions and envelope art. Its **content schema** (which slots exist, their types, limits and defaults, such as `story` up to 4 panels of 140 characters, `palette.primary`) lives beside it in `schema.ts`.
- `scene.tsx`: the 3D scene. It receives validated content and a quality tier, and exposes named **camera stops** (`envelope`, `room`, `story-1`…`story-4`, `card`).
- `assets/`: models, textures and default images, already compressed.
- `preview.webp`: the thumbnail for the template gallery.

**Shared engine (all templates reuse)**

- Stage machine: `loading → envelope → room → story → card → rsvp`, with skip and back.
- Camera rig that flies between a template's named stops with GSAP.
- HTML overlay layer for the card, buttons, RSVP form and audio controls.
- Quality tiers, the 2D fallback and reduced-motion handling.
- Content loading and validation (Zod), personalisation from the guest token, analytics events.

**Rules**

- Templates never fetch data or talk to the API; the engine hands them content.
- Positions and scales live in the template, not in event data. Hosts choose from options the template offers (for example, photo framing: full, half, close).
- A published event pins `template_version`, so a template update never changes an invite that guests have already seen.

**Template so far:** `emerald-salon`, a dark green panelled 3D room (lamp, gold frame, story boards, table) with photographic cut-outs standing in it: the event's couple photo (or two silhouettes if none) and potted plants, lit by the room. Watercolour envelope art with a wax seal. Used by both sample events.

**Shared by every template**

- Content schema in `templates/shared-schema.ts`; a template extends it (and may make optional slots such as `couplePhoto` required).
- Six wax seal styles in `public/seals/` (`brick`, `scarlet`, `vermilion`, `silver`, `berry`, `gold`), chosen per event with `content.seal`. The monogram is the hosts' initials, pressed in from data.
- A template may supply envelope art (`EnvelopeArt`); the engine then shows an HTML envelope with the names, seal and monogram, which appears instantly while the scene loads behind it.

**Asset pipeline:** design exports go in the git-ignored `assets-src/` folder; `npm run assets` converts them to WebP in `public/` and fails if any image is over 300 KB.

## Routes and API

Guest pages are public and cacheable; everything that writes goes through a small, token-checked API.

**Guest routes**

| Route | Purpose | Phase |
| --- | --- | --- |
| `/e/[slug]` | General invite for an event | Prototype |
| `/e/[slug]?t=[guestToken]` | Personal invite: greeting by name, RSVP tied to the guest | Prototype |
| `[slug].platform-domain` | Same as `/e/[slug]`, via wildcard subdomain and middleware rewrite | MVP |
| `/e/[slug]/opengraph-image` | Generated link-preview image per event and guest | Prototype |

**API**

| Method and path | Does | Auth | Phase |
| --- | --- | --- | --- |
| `GET /api/events/[slug]` | Published event content for the guest page | Public | Prototype |
| `GET /api/guests/me?t=` | Guest name, party allowance, existing RSVP | Guest token | Prototype |
| `PUT /api/rsvp` | Create or update the RSVP | Guest token, or none for general links, rate-limited | Prototype |
| `POST /api/analytics` | Record stage reached | Public, rate-limited | MVP |
| `/api/host/events` (CRUD) | Create and edit events, publish | Host session | MVP |
| `/api/host/events/[id]/guests` (CRUD, CSV import) | Manage guests and tokens | Host session | MVP |
| `GET /api/host/events/[id]/rsvps` | RSVP dashboard data and CSV export | Host session | MVP |
| `/api/admin/templates` | Publish and version templates | Admin | MVP |

In the prototype, `GET /api/events/[slug]` reads a JSON file in the repo, so the guest page works before the database exists; only `PUT /api/rsvp` needs the database from day one.

## Repo structure and development workflow

One GitHub repository, built in Claude Code sessions, with every change previewed on a real phone before it is merged.

**Folder layout**

```
/app
  /e/[slug]/page.tsx          guest invite page
  /e/[slug]/opengraph-image.tsx
  /api/events/[slug]/route.ts
  /api/rsvp/route.ts
/components                   HTML UI: invite card, story panels, RSVP form
/engine                       shared: stage machine, camera rig, overlay, quality tiers, fallback
/templates
  /emerald-salon
    template.json             manifest + camera stops
    schema.ts                 content schema (Zod)
    scene.tsx
    /assets
/content/events               sample configs (prodigydan-daniella.json, amara-tobi.json)
/lib                          schemas (Zod), data access, formatting, tokens
/docs                         TECHNICAL.md, /decisions (one file per decision)
/public
CLAUDE.md                     conventions Claude follows in every session
```

**How we work**

1. Connect GitHub to Claude.
2. Each Claude Code session works in this repository; the technical spec lives at `docs/TECHNICAL.md`.
3. `CLAUDE.md` records the rules: TypeScript, data never hard-coded, performance budget, small commits.
4. Each feature is one branch and one pull request with a short description and screenshots.
5. Vercel builds a preview link for every pull request; open it on your phone and approve or ask for changes.
6. Merging to `main` deploys the live site.
7. Decisions that are hard to undo (database, hosting, domain) get a one-page record in `docs/decisions`.

## Prototype milestones

Six milestones take the prototype from an empty repo to a shareable invite; each ends with a preview link tested on a phone.

- [x] **M1 Foundations:** repo, Next.js app, `CLAUDE.md`, technical spec, sample config and its schema, Vercel deploy.
- [x] **M2 Engine skeleton:** stage machine and camera rig flying between placeholder stops; HTML overlay; quality tiers.
- [x] **M3 Real artwork in the room:** Emerald Salon with the Figma assets (watercolour envelope, six wax seals with monogram, couple cut-out, plants), all from ProdigyDan & Daniella's config. Story board art still to come.
- [ ] **M4 Guest features:** personal tokens and greeting, music with mute, add to calendar, directions, link-preview image.
- [ ] **M5 RSVP:** database, RSVP form and API, return-visit state, rate limiting.
- [ ] **M6 Hardening:** performance budget met, 2D fallback, reduced motion, second sample config, real-phone test pass.

**Figma work that runs alongside:** envelope and seal (M3), invite card layout with sample text kept separate from the background (M3), buttons and RSVP form (M4–M5), loader mark (M2), Emerald Salon room layers (M3).

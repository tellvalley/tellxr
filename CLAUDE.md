# TellXR — working rules for Claude

Read `docs/TECHNICAL.md` before starting a milestone. It is the source of truth for scope.

**This repository is public.** Never commit secrets, API keys, `.env` files or real guest/host data. Keep product strategy, pricing, roadmap beyond the prototype and competitor notes out of the repo; they live in the private PRD.
@AGENTS.md

## Product rules (never break these)

- **Data, not code.** No event-specific text, names, dates, colours or links in components. Everything comes from an event config validated by `lib/event-schema.ts` and the template's `schema.ts`.
- **Event, not wedding.** Use event / host / guest in names, routes and tables. Wedding-only wording lives in per-type maps (see `invitationLine` in `components/invite-card.tsx`).
- **Real text stays real.** Names, dates, venue, RSVP and buttons are HTML, never drawn into the 3D canvas.
- **Templates never fetch data.** The engine validates content and passes it in.
- **Guest privacy.** Guests are identified only by random tokens; never put guest names in URLs or logs.

## Performance budget (check on every PR that adds assets)

- Envelope tappable with under 3 MB loaded; whole experience under 6 MB.
- Images WebP/AVIF under 300 KB each; music under 2 MB; compressed models and textures.
- Device pixel ratio capped at 2; 30 fps on a mid-range Android phone.
- Fonts are self-hosted from `@fontsource` packages (`app/fonts.ts`); do not add Google Fonts requests.

## Code conventions

- TypeScript, strict. Validate external data with Zod.
- Next.js 16 App Router with Cache Components enabled. Read `node_modules/next/dist/docs/` before using an API you are unsure of. Notable: `params` is a Promise; `dynamicParams` is not supported; unknown slugs call `notFound()` (with Partial Prefetching this returns status 200 with a noindex not-found page, which is expected).
- Styling with Tailwind v4. Event colours are CSS variables `--event-primary` and `--event-bg`, exposed as `text-event-primary`, `bg-event-bg` etc.
- Layout: `app/` routes, `components/` HTML UI, `engine/` shared 3D runtime, `templates/<id>/` per-template scene + schema + assets, `content/events/` sample configs, `lib/` schemas and helpers.
- Mobile first: design and test at 390 × 844 before desktop.

## Workflow

- One milestone feature per branch and pull request; keep commits small.
- Before opening a PR: `npx tsc --noEmit`, `npm run lint`, `npm run build`, and a phone-size screenshot of any changed page.
- Record hard-to-undo decisions in `docs/decisions/NNNN-title.md`.
- When scope changes, update `docs/TECHNICAL.md` here and the private PRD together.
- Secrets go only in Vercel environment variables (and a local, git-ignored `.env.local`).

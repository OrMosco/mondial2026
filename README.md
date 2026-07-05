# World Cup 2026 — Live Radial Bracket

A live, animated version of the radial World Cup bracket poster design: 32 teams
on the outer ring, arcing inward through five knockout rounds to a gold trophy
at the center. Losing teams dim and gray out; winners advance to the next ring
in color with a score pill, all the way to a crowned champion.

## Quick start

```bash
npm install
npm run dev
```

That's it — **no API key, no config**. The app fetches the real FIFA World Cup
2026 knockout bracket from the free public [worldcup26.ir](https://worldcup26.ir)
API and shows it live, polling for score updates. The status badge in the top
bar reads **Live** when real data is loaded.

## Live data

- Source: `worldcup26.ir` — open reads (no key / no auth) with CORS enabled, so
  the browser calls it directly. No dev proxy or serverless function required,
  in dev or production.
- The app builds the knockout tree deterministically from each match's
  "Winner Match N" references, so the bracket wiring is always correct.
- Until the real Round of 32 is fully drawn (i.e. the group stage has finished),
  the app falls back to **bundled sample data** and shows a "Sample data" badge
  plus a round slider to scrub from the pre-tournament poster through to a
  crowned champion. Once 32 knockout teams are seeded, it switches to Live.
- A transient API blip won't drop a live view back to sample — the last good
  bracket is kept until the next successful poll.

Optional overrides via env (`.env`): `VITE_WC26_BASE` (API base URL),
`VITE_POLL_MS` (poll interval, default 60000).

## How it works

- `src/bracket/geometry.ts` — pure radial math (angles, rings, arcs), ported
  from the original design export so the layout matches pixel-for-pixel.
- `src/bracket/bracketModel.ts` — resolves match winners and propagates them
  inward round by round; dims any eliminated team at every ring.
- `src/data/worldCup26.ts` — live provider: fetches teams + games, builds the
  bracket from the "Winner Match N" reference graph, normalizes to the model.
- `src/data/sampleData.ts` — bundled fallback dataset; the Round of 32 scores
  reproduce the original "after a match" design reference exactly.
- `src/data/useLiveBracket.ts` — chooses live vs sample, polls, exposes state.

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` — typecheck + production build.
- `npm run preview` — preview the production build locally.

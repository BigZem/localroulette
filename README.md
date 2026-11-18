# LocalRoulette

**Spin Your City. Discover Something New.** Mobile-first discovery for Teesside, designed to expand across the UK.

This branch is the working MVP rebuild. The original starter remains in `event-roulette-pwa-starter/` until the new app passes checks. The application lives at the repository root.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. `TICKETMASTER_API_KEY` is optional and stays server-side. Without it, live places use OpenStreetMap; the clearly labelled demo mode works without external keys.

## Validation

```bash
npm run check
```

The GitHub Actions workflow runs tests, TypeScript, linting, and a production build. A successful workflow does not replace real Android phone and live-provider testing.

## Status

Premium payments and sponsored placements are not active. Three daily spins use browser storage and can be bypassed. Saved activities are device-local. No database of verified Teesside listings is deployed yet. See `docs/` for release and future data plans.

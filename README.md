# LocalRoulette

**Spin Your City. Discover Something New.** A mobile-first Teesside discovery app with a fair roulette wheel, configurable live place search, optional events, saved ideas and a planned Premium tier.

The application lives at the repository root. The original `event-roulette-pwa-starter/` folder is retained for reference while the new app is validated.

## Local setup

Node.js 22.18+ is required for TypeScript unit tests. The app uses Next.js, React and strict TypeScript.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` on that same computer. Browser geolocation and PWA installation require HTTPS on a real phone. The app runs without keys in its clearly labelled demonstration mode. For live places, create a Geoapify Places API key and set `GEOAPIFY_API_KEY` in `.env.local`. `TICKETMASTER_API_KEY` adds live events. These keys are **server-side only**; never prefix them with `NEXT_PUBLIC_` or commit `.env.local`.

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run smoke
npm run content:audit
npm run content:live-audit
```

GitHub Actions runs the tests, TypeScript check, lint, production build and a local runtime smoke check on the working branch. A successful build does not prove phone or live-provider behaviour.

## Discovery and data quality

- **Geoapify:** live places through the Places API using OpenStreetMap contributor data. Obtain a key from [Geoapify](https://www.geoapify.com/) and check its current free-tier quota and attribution terms. Add `GEOAPIFY_API_KEY` to `.env.local` locally and to the host's encrypted server environment for deployment. The app sends location, radius and category to Geoapify; the key never goes to the browser. Provider data is crowdsourced and should be checked before travel.
- **OpenStreetMap Overpass:** an optional diagnostic fallback, enabled only with `ENABLE_PUBLIC_OVERPASS=true` when no Geoapify key is present. Public endpoints failed or timed out in our GitHub and Vercel checks, so this is not the recommended production source.
- **Ticketmaster:** optional live events through the Discovery API. The key stays on the server. Only provider-supplied GBP prices are shown, with a warning that fees and availability can change.
- **Curated:** `lib/providers/curated.ts` is the place for reviewed real listings. It currently contains **zero** records.
- **Demonstration:** `lib/providers/demo.ts` contains **12** example activity ideas. These are labelled as examples and never presented as genuine upcoming events or venue bookings.

Providers return a common Activity model. Search applies location, radius, budget, audience, category and date filters, then deduplicates results. Unknown prices are excluded from strict budget filters; places without parseable hours are excluded from time filters. Provider calls use timeouts, small in-memory caches and basic per-instance rate protection. For larger traffic, add a shared cache, global quotas and provider agreements.

`npm run content:audit` reports stored content counts. Live Geoapify and Ticketmaster results are fetched per request and **not stored in a database**, so there is no fixed live-content count.
`npm run content:live-audit` checks food, outdoor and the default surprise search around Middlesbrough through the configured place provider. Its numbers vary with provider availability and are not a total inventory. The separate GitHub Actions live-audit workflow can rerun this check manually; to use Geoapify there, add a repository Actions secret named `GEOAPIFY_API_KEY`.
For a local audit with the key in `.env.local`, run `node --env-file=.env.local scripts/live-audit.mjs`. Next.js loads `.env.local` for the app, but a standalone Node script does not.
`/api/coverage?category=food` (or another place category, or `surprise`) is a bounded, cached check for current matching Middlesbrough places. It reports candidate, opening-hours and eligible counts to explain why a filter may return few results. The counts reflect a limited provider sample, not a total inventory. A provider failure returns `eligibleCount: null`, not a misleading zero.

## Free tier and future income

Three spins per UK calendar day are counted in browser storage. This can be bypassed; it is a lightweight MVP limit rather than secure billing. Browsing activities is unlimited. Saved ideas stay on the device and share links use activity IDs.

Premium is planned at **£4.99/month**, but billing and paid features are not active. Future affiliate offers require a clear disclosure. Paid placements must never secretly influence roulette odds. There is no affiliate or subscription income active today.

## Deployment

The recommended first host is Vercel, which supports the Next.js API routes needed to keep external provider keys off the client. Import this GitHub repository, set the **root directory to the repository root**, build with `npm run build`, and configure `GEOAPIFY_API_KEY` and, if available, `TICKETMASTER_API_KEY` only in encrypted server environment settings. Redeploy after adding a key. A free plan may be suitable for initial testing, subject to current hosting and provider terms and limits. If Vercel's GitHub login connection has not been enabled, source uploads can deploy previews but Git pushes will not deploy automatically.

Verify HTTPS, API responses, source attribution, cache behaviour, saved ideas, share links, PWA installation and mobile layouts before public launch. The GitHub branch is source storage; it is not itself a live phone link. The app has no verified live Middlesbrough inventory until a key is configured and `/api/coverage` returns a provider result.

## Android

See [android/README.md](android/README.md). A Play Store release should wrap the verified HTTPS PWA as a Trusted Web Activity after real-device testing. There is no APK or AAB yet.

## Privacy and launch work

No account or analytics SDK is included. Location is requested only after a tap; rounded coordinates are sent to the server for search and are not stored in an activity database. Provider services receive the search parameters needed to answer. The MVP privacy and terms pages require the real operator identity and legal review before public launch. `docs/future-schema.sql` is a design for future data storage, not an active database.

Future work: verified Teesside content coverage, robust global provider quotas, account syncing, secure spin entitlements, billing, disclosed partner offers, personalisation, and Android store release.

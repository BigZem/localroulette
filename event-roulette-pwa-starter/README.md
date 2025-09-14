# LocalRoulette – PWA Starter

A tiny Next.js project that spins a nearby idea to do around Teesside.
- Uses `/data/seeds.json` (curated + seasonal) + OpenTripMap (live places).
- PWA manifest included; add to Home Screen on mobile.
- No Google Sheets required.

## Quick start
```bash
npm install
echo OPENTRIPMAP_API_KEY=your_key > .env.local
npm run dev
```

Visit http://localhost:3000 then hit **Spin**.

## Deploy
- Push to GitHub → import to Vercel → add `OPENTRIPMAP_API_KEY` env → Deploy.

## Customise
- Edit `data/seeds.json` (add/remove places).
- Tweak weighting in `pages/api/spin.ts`.

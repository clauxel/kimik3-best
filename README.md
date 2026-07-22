# Kimi K3 Best

Production source for [kimik3.best](https://kimik3.best/), a source-first Kimi K3 research map built from the public [clauxel/kimik3](https://github.com/clauxel/kimik3) source ledger.

## Pages

- `/` - Kimi K3 source map and route finder.
- `/official-sources/` - official Kimi and Moonshot launch, help and product sources.
- `/api-and-developer/` - API quickstart, reasoning effort, context and cost planner.
- `/architecture/` - KDA, Attention Residuals, FlashKDA and architecture papers.
- `/reviews-and-media/` - external reviews, media and community signals.
- `/companion-pages/` - practical context, pricing, deployment and benchmark page map.
- `/follow-up-watchlist/` - technical report, weights, GitHub and Hugging Face checks.

Every HTML page includes a generated explainer video and visual summary. Core content is generated from `../kimik3/data/kimi-k3-sources.json`, then published as static assets behind a Cloudflare Worker with D1 analytics.

## Build

```sh
npm run build
npm run start
```

## Deploy

```sh
npx wrangler d1 migrations apply kimik3-best-analytics --remote
npx wrangler deploy
```

Cloudflare DNS and registrar nameserver setup is handled by `scripts/configure-cloudflare-launch.mjs` when the required credentials are available in the environment or local Keychain.

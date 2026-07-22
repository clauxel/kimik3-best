# Website changelog

## 2026-07-23 - Initial Kimi K3 Best launch

- Built `kimik3.best` as a source-first Kimi K3 research map powered by the public `clauxel/kimik3` source ledger.
- Generated seven core pages: home, official sources, API/developer notes, architecture, reviews/media, companion pages and follow-up watchlist.
- Added Privacy, Terms and 404 pages; every HTML page has a generated WebM explainer video plus a 1280x720 visual summary image.
- Added interactive tools for source routing, source filtering, API cost planning, architecture selection, review classification, companion page routing and follow-up tracking.
- Added sitemap, robots, llms.txt, product.json, JSON-LD, canonical, Open Graph and Twitter metadata for the public page set.
- Added the public IndexNow key file and submitted the 9-URL sitemap set to Google Search Console, Bing Webmaster and IndexNow.
- Created Cloudflare D1 database `kimik3-best-analytics`, applied migrations and verified remote analytics storage through the deployed Worker.
- Deployed Cloudflare Worker `kimik3-best` with workers.dev, apex and www triggers. Cloudflare zone, proxied apex/www DNS and Worker routes are configured.
- Updated Spaceship nameservers to Cloudflare `archer.ns.cloudflare.com` and `sydney.ns.cloudflare.com`; production apex HTTPS returns 200 and `www` redirects to the apex URL.
- Verification passed: generator/media/static validation, desktop/mobile visual QA, production route/API probes, D1 analytics storage, search submission, report-center registration and the open-source build completion gate.

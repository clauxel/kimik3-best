#!/usr/bin/env node
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const pub = join(root, "public");
const origin = "https://kimik3.best";

const routes = [
  "",
  "official-sources",
  "api-and-developer",
  "architecture",
  "reviews-and-media",
  "companion-pages",
  "follow-up-watchlist"
];

const htmlRoutes = [...routes, "privacy", "terms"];
const forbidden = [
  /kimik3\.club/i,
  /Inner Page SEO/i,
  /keyword density/i,
  /on-page seo/i,
  /release audit/i,
  /Open Kimi 3 assistant/i,
  /127\.0\.0\.1/i,
  /inner-page-building/i,
  /open-source-code-website-build/i,
  /as requested/i,
  /per instruction/i,
  /user requested/i,
  /audit score/i,
  /search intent/i,
  /keyword data/i,
  /用户要求/,
  /提示词残留/
];

function pageUrl(route) {
  return `${origin}/${route ? `${route}/` : ""}`;
}

async function assertAsset(file, minSize) {
  await access(join(pub, "assets", "media", file));
  const info = await stat(join(pub, "assets", "media", file));
  assert.ok(info.size > minSize, `${file} is too small`);
}

function extractMedia(html, route) {
  const images = [...html.matchAll(/(?:src|poster)="\/assets\/media\/([^"]+\.(?:png|webm))"/g)].map((match) => match[1]);
  const video = images.find((file) => file.endsWith(".webm"));
  const pngs = images.filter((file) => file.endsWith(".png"));
  assert.ok(video, `${route || "/"} needs a WebM explainer video`);
  assert.ok(pngs.length >= 2, `${route || "/"} needs image and poster assets`);
  return { video, pngs };
}

for (const route of routes) {
  const html = await readFile(join(pub, route, "index.html"), "utf8");
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route || "/"} must have one H1`);
  assert.match(html, new RegExp(`<link rel="canonical" href="${pageUrl(route).replaceAll(".", "\\.")}">`), `${route || "/"} canonical mismatch`);
  assert.match(html, new RegExp(`<meta property="og:url" content="${pageUrl(route).replaceAll(".", "\\.")}">`), `${route || "/"} og:url mismatch`);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<script type="application\/ld\+json">/);
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(jsonLd, `${route || "/"} JSON-LD missing`);
  JSON.parse(jsonLd);
  assert.match(html, /<section class="hero hero-[^"]+"/, `${route || "/"} must have full-screen hero`);
  assert.match(html, /<video class="hero-video" autoplay muted loop playsinline/, `${route || "/"} needs full-screen hero video`);
  assert.match(html, /<video class="motion-source" controls muted loop playsinline/, `${route || "/"} needs controlled explainer video`);
  assert.match(html, /<img src="\/assets\/media\/[^"]+\.png" width="1280" height="720"/, `${route || "/"} needs fixed-size visual image`);
  const stories = (html.match(/<article class="story">/g) || []).length;
  const visuals = (html.match(/class="story-visual"/g) || []).length;
  assert.ok(stories >= 3, `${route || "/"} needs story sections`);
  assert.equal(visuals, stories, `${route || "/"} every story needs a visual companion`);
  assert.match(html, /class="source-spark"/, `${route || "/"} source cards need visual markers`);
  for (const pattern of forbidden) assert.doesNotMatch(html, pattern, `${route || "/"} leaks old or private copy`);
  const media = extractMedia(html, route);
  await assertAsset(media.video, 20000);
  for (const png of media.pngs) await assertAsset(png, 6000);
}

for (const route of ["privacy", "terms"]) {
  const html = await readFile(join(pub, route, "index.html"), "utf8");
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route} must have one H1`);
  assert.match(html, /<video class="motion-source" controls muted loop playsinline/, `${route} needs an explainer video`);
  assert.match(html, /<img src="\/assets\/media\/[^"]+\.png" width="1280" height="720"/, `${route} needs a visual image`);
  for (const pattern of forbidden) assert.doesNotMatch(html, pattern, `${route} leaks old or private copy`);
  const media = extractMedia(html, route);
  await assertAsset(media.video, 20000);
  for (const png of media.pngs) await assertAsset(png, 6000);
}

const notFound = await readFile(join(pub, "404.html"), "utf8");
assert.match(notFound, /<meta name="robots" content="noindex,follow">/);
assert.match(notFound, /<video class="motion-source" controls muted loop playsinline/, "404 needs an explainer video");
for (const pattern of forbidden) assert.doesNotMatch(notFound, pattern, "404 leaks old or private copy");
const notFoundMedia = extractMedia(notFound, "404");
await assertAsset(notFoundMedia.video, 20000);

const product = JSON.parse(await readFile(join(pub, "product.json"), "utf8"));
assert.equal(product.origin, origin);
assert.equal(product.sourceRepository, "https://github.com/clauxel/kimik3");
assert.equal(product.sourceCounts.total, 36);
assert.equal(product.pages.length, routes.length);
assert.equal(product.currentStatus.technicalReport, "pending official release");

const ledger = JSON.parse(await readFile(join(pub, "data", "kimi-k3-sources.json"), "utf8"));
assert.equal(ledger.sources.length, 36);
assert.equal(ledger.status.officialGitHubKimiK3Repo, "not found in current scan");
const ledgerText = JSON.stringify(ledger);
for (const pattern of forbidden) assert.doesNotMatch(ledgerText, pattern, "public source ledger leaks private copy");

const manifest = JSON.parse(await readFile(join(pub, "assets", "media", "kimi-k3-media-manifest.json"), "utf8"));
assert.equal(manifest.pageCount, 10);
assert.ok(manifest.durationSeconds >= 10);
for (const key of ["home", "official", "api", "architecture", "reviews", "companion", "watchlist", "privacy", "terms", "notfound"]) {
  assert.ok(manifest.files[key], `manifest missing ${key}`);
  await assertAsset(manifest.files[key].video, 20000);
  await assertAsset(manifest.files[key].image, 6000);
  await assertAsset(manifest.files[key].poster, 6000);
}

const css = await readFile(join(pub, "assets", "k3.css"), "utf8");
assert.match(css, /min-height:\s*100svh/, "hero must be full screen");
assert.doesNotMatch(css, /letter-spacing:\s*-\d/, "CSS must not use negative letter spacing");
assert.doesNotMatch(css, /clamp\(/, "CSS must avoid viewport-scaled type");
for (const token of [".hero-video", ".story-visual", ".source-spark", ".simple-video"]) {
  assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `CSS missing ${token}`);
}

const js = await readFile(join(pub, "assets", "k3.js"), "utf8");
for (const token of ["api_cost_plan", "source_filter", "watchlist_update", "video_play"]) {
  assert.match(js, new RegExp(token), `JS missing ${token}`);
}

const sitemap = await readFile(join(pub, "sitemap.xml"), "utf8");
for (const route of [...routes, "privacy", "terms"]) {
  assert.match(sitemap, new RegExp(pageUrl(route).replaceAll(".", "\\.")), `sitemap missing ${route || "/"}`);
}

const robots = await readFile(join(pub, "robots.txt"), "utf8");
assert.match(robots, new RegExp(`Sitemap: ${origin.replaceAll(".", "\\.")}/sitemap.xml`));

const indexNowKey = "590a3ab02487cffe4cfd55b0df769f65";
const indexNowKeyFile = await readFile(join(pub, `${indexNowKey}.txt`), "utf8");
assert.equal(indexNowKeyFile, indexNowKey, "IndexNow key file mismatch");

console.log(JSON.stringify({
  ok: true,
  pages: htmlRoutes.length + 1,
  indexablePages: routes.length + 2,
  sourceLedger: product.sourceCounts.total,
  videos: manifest.pageCount,
  durationSeconds: manifest.durationSeconds
}, null, 2));

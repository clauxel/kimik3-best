#!/usr/bin/env node
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const publicRoot = join(root, "public");
const sourceRoot = resolve(root, "../kimik3");
const origin = "https://kimik3.best";
const supportEmail = "support@aigeamy.com";
const collectedAt = "2026-07-23T00:30:00+08:00";
const updated = "2026-07-23";

const sourceLedger = JSON.parse(await readFile(join(sourceRoot, "data/kimi-k3-sources.json"), "utf8"));
const sources = sourceLedger.sources;
const byId = new Map(sources.map((source) => [source.id, source]));

const sourceNotes = {
  "official-kimi-k3-blog": "Official launch page for Kimi K3, including the 2.8T-parameter framing, KDA, Attention Residuals, native vision, 1M-token context and pending report/weight notes.",
  "moonshot-homepage": "Moonshot company page that mirrors the K3 positioning in Chinese and routes readers to Kimi, API, Kimi Code and product lines.",
  "kimi-help-getting-started": "Official help entry for Kimi model selection, multimodal inputs, files, URLs, videos and output formats.",
  "kimi-agent-overview": "Official product timeline showing Kimi K3 as the capability base for Chat, Agent, Agent Swarm, Kimi Work, Kimi Code and API.",
  "kimi-model-mode-selection": "Official mode selection guide that separates K2.6, K3 and K3 Cluster fit, reasoning intensity and membership context limits.",
  "kimi-websites-overview": "Official Kimi Websites help page connecting K3 vision and coding ability to website generation and iterative edits.",
  "kimi-api-platform-home": "Official API platform entry listing Kimi K3 as the flagship model and showing current public price points at collection time.",
  "kimi-api-quickstart": "Official quickstart with OpenAI-compatible API shape, base URL and a Kimi K3 example model.",
  "kimi-k3-api-guide": "Official K3 API guide covering reasoning effort, streaming, vision input, structured output, tool choice, dynamic tools and 1M context limits.",
  "kimi-k3-pricing": "Official K3 pricing reference for pay-as-you-go billing, cache hit, input and output metering.",
  "kimi-code-models": "Official Kimi Code model configuration page with model IDs, context configuration and compatible coding endpoints.",
  "kimi-code-whats-new": "Official changelog showing the K3 release window and model-list refresh behavior for API-key users.",
  "moonshot-github-org": "Official MoonshotAI GitHub organization, useful for tracking Kimi Code, Kimi CLI, K2 lines, Attention Residuals and FlashKDA.",
  "moonshot-hf-org": "Official Moonshot Hugging Face organization; the source ledger did not find an official Kimi-K3 weight repo there at collection time.",
  "arxiv-kimi-linear": "Kimi Linear paper introducing Kimi Delta Attention, the architecture thread the K3 launch page points back to.",
  "arxiv-attention-residuals": "Attention Residuals paper describing cross-layer attention as an alternative to fixed residual accumulation.",
  "github-attention-residuals": "Official repository with paper, pseudocode and evaluation summaries for Attention Residuals.",
  "github-flashkda": "Official FlashKDA kernel implementation that links the KDA research line to inference engineering.",
  "hf-kimi-linear-collection": "Moonshot Hugging Face collection for Kimi Linear checkpoints and paper references.",
  "nature-scientists": "Science news coverage that should be treated as external interpretation, not an official benchmark source.",
  "ap-kimi-k3": "Wire-news coverage of launch-week market attention and open-model discussion.",
  "tomshardware-kimi-k3": "Hardware-oriented report summarizing scale, context, architecture and pending weight status.",
  "generative-ai-review": "Early hands-on comparison for vibe coding; useful as a product signal, not as a rigorous benchmark.",
  "cnblogs-engineering-review": "Chinese engineering review using Kimi Code for a physics sandbox, game and logic solver from empty projects.",
  "datalearner-kimi-k3": "Chinese technical explainer that aggregates official and secondary information and should be read with source labels visible.",
  "kimik3-io-about": "Third-party measurement disclosure page; useful for methodology and conflict-of-interest checks.",
  "huggingface-community-overview": "Community article that summarizes K3 concepts from a model-card perspective but is not an official model card.",
  "bilibili-search-kimi-k3": "Video search queue for Chinese release reactions, tutorials, official clips and practical demos.",
  "v2ex-membership-thread": "Community discussion about membership tiers, 1M-context access, Kimi Code and product limitations.",
  "v2ex-resource-site-thread": "Community thread showing reader demand for Kimi K3 entry points, API cost, local deployment and hardware pages.",
  "hn-digest-kimi-k3": "Hacker News digest useful for developer concerns around price, context length and reasoning efficiency.",
  "youtube-search-kimi-k3": "Queued English-video search slot for follow-up review and tutorial extraction.",
  "official-images-in-blog": "Official blog image inventory; this site uses original generated visuals instead of copying those images.",
  "kimi3-org-companion-pages": "Independent practical page map for context, cost, pricing, deployment, hardware, benchmark and comparison readers.",
  "hf-thirdparty-placeholder": "Third-party Hugging Face placeholder that must not be treated as official Kimi K3 weights.",
  "k3-tech-report-watch": "Top-priority watch item for the official technical report covering architecture, training and evaluation details."
};

const sourceTitles = {
  "cnblogs-engineering-review": "Cnblogs engineering review: Kimi Code builds games, physics and logic tools",
  "datalearner-kimi-k3": "DataLearner Kimi K3 technical explainer",
  "v2ex-membership-thread": "V2EX discussion: membership tiers and 1M-context access",
  "v2ex-resource-site-thread": "V2EX discussion: demand for Kimi K3 resource pages"
};

const media = {
  home: ["kimi-k3-best-home.png", "kimi-k3-best-home.webm", "kimi-k3-best-home-poster.png"],
  official: ["kimi-k3-best-official.png", "kimi-k3-best-official.webm", "kimi-k3-best-official-poster.png"],
  api: ["kimi-k3-best-api.png", "kimi-k3-best-api.webm", "kimi-k3-best-api-poster.png"],
  architecture: ["kimi-k3-best-architecture.png", "kimi-k3-best-architecture.webm", "kimi-k3-best-architecture-poster.png"],
  reviews: ["kimi-k3-best-reviews.png", "kimi-k3-best-reviews.webm", "kimi-k3-best-reviews-poster.png"],
  companion: ["kimi-k3-best-companion.png", "kimi-k3-best-companion.webm", "kimi-k3-best-companion-poster.png"],
  watchlist: ["kimi-k3-best-watchlist.png", "kimi-k3-best-watchlist.webm", "kimi-k3-best-watchlist-poster.png"],
  privacy: ["kimi-k3-best-privacy.png", "kimi-k3-best-privacy.webm", "kimi-k3-best-privacy-poster.png"],
  terms: ["kimi-k3-best-terms.png", "kimi-k3-best-terms.webm", "kimi-k3-best-terms-poster.png"],
  notfound: ["kimi-k3-best-notfound.png", "kimi-k3-best-notfound.webm", "kimi-k3-best-notfound-poster.png"]
};

const pages = [
  {
    key: "home",
    path: "",
    pageClass: "home",
    accent: "#3dd6c6",
    title: "Kimi K3 Best - Source-First Kimi K3 Research Map",
    description: "A practical Kimi K3 research map built from the clauxel/kimik3 source ledger, with official sources, API notes, architecture papers, reviews and follow-up checks.",
    h1: "Kimi K3 Best Source Map",
    eyebrow: "36-source Kimi K3 research navigator",
    lead: "Track what is official, what is developer-ready and what still needs verification before you quote, build with or compare Kimi K3.",
    primaryHref: "/official-sources/",
    primaryText: "Open official sources",
    secondaryHref: "/api-and-developer/",
    secondaryText: "Plan an API build",
    sourceIds: ["official-kimi-k3-blog", "kimi-api-quickstart", "arxiv-kimi-linear", "k3-tech-report-watch"],
    chapters: ["Official facts", "API shape", "Architecture trail", "Review boundary", "Watch queue"],
    statLabel: "sources organized",
    statValue: "36",
    sections: [
      {
        title: "Start with the source boundary",
        text: "The library separates Moonshot/Kimi pages from papers, API docs, external reviews and community material. That makes the site useful for readers who need a claim they can trace.",
        visual: "Official pages sit at the center; secondary materials stay on labeled outer rings."
      },
      {
        title: "Use the page by job",
        text: "Developers can jump to model IDs, reasoning effort, context and pricing notes. Researchers can follow KDA, Attention Residuals and FlashKDA. Editors can find what must be rechecked after the technical report and full weights land.",
        visual: "Choose a job, then route to the page where the supporting source set is already filtered."
      },
      {
        title: "Keep fast-moving facts honest",
        text: "The source ledger was collected at 2026-07-23T00:30:00+08:00. Pricing, model hosting, weights and technical-report availability can change, so this site marks follow-up work explicitly.",
        visual: "Status markers distinguish verified, queued, pending official release and not-official items."
      }
    ],
    tool: "source-router"
  },
  {
    key: "official",
    path: "official-sources",
    pageClass: "official",
    accent: "#f2c14e",
    title: "Kimi K3 Official Sources - Launch, Help Center and Product Pages",
    description: "Official Kimi K3 source map covering the Kimi launch page, Moonshot company page, Kimi help center, model-mode guide and Kimi Websites overview.",
    h1: "Kimi K3 Official Sources",
    eyebrow: "Official facts before secondary claims",
    lead: "Use this page when you need the public Kimi and Moonshot pages that can support Kimi K3 claims without mixing in third-party commentary.",
    primaryHref: "/api-and-developer/",
    primaryText: "See API notes",
    secondaryHref: "/follow-up-watchlist/",
    secondaryText: "Check pending items",
    sourceIds: ["official-kimi-k3-blog", "moonshot-homepage", "kimi-help-getting-started", "kimi-agent-overview", "kimi-model-mode-selection", "kimi-websites-overview"],
    chapters: ["Launch page", "Company page", "Help center", "Mode selection", "Website builder"],
    statLabel: "official entries",
    statValue: "6",
    sections: [
      {
        title: "What the official launch page supports",
        text: "The Kimi K3 blog is the primary source for the 2.8T-parameter open 3T-class positioning, native vision, 1M-token context, KDA, Attention Residuals and the pending technical report and full-weight release notes.",
        visual: "Use it for headline facts, then route architecture details to the paper trail."
      },
      {
        title: "Product help pages explain usage fit",
        text: "The help center and model-mode pages are better for product behavior: K2.6 versus K3 versus K3 Cluster, multimodal input support, tool workflows, credit usage and membership context limits.",
        visual: "Product docs answer usage questions that the launch page does not fully cover."
      },
      {
        title: "Keep official and independent material separate",
        text: "Official sources can support direct Kimi K3 facts. External reviews, community screenshots and third-party measurements can support interpretation only when they are clearly labeled.",
        visual: "The source cards below preserve source type, priority and status so claims do not drift."
      }
    ],
    tool: "source-filter"
  },
  {
    key: "api",
    path: "api-and-developer",
    pageClass: "api",
    accent: "#ff6f61",
    title: "Kimi K3 API and Developer Notes - Pricing, Context and Model IDs",
    description: "Practical Kimi K3 API notes from the source ledger: OpenAI-compatible API shape, base URL, model examples, reasoning effort, 1M context, pricing and Kimi Code endpoints.",
    h1: "Kimi K3 API and Developer Notes",
    eyebrow: "Build planning from official docs",
    lead: "Translate the Kimi API and Kimi Code entries into a concrete build checklist: endpoint shape, reasoning effort, context settings, token cost planning and current caveats.",
    primaryHref: "/architecture/",
    primaryText: "Read architecture",
    secondaryHref: "/official-sources/",
    secondaryText: "Review official pages",
    sourceIds: ["kimi-api-platform-home", "kimi-api-quickstart", "kimi-k3-api-guide", "kimi-k3-pricing", "kimi-code-models", "kimi-code-whats-new"],
    chapters: ["Base URL", "Reasoning effort", "1M context", "Vision input", "Cost plan"],
    statLabel: "developer entries",
    statValue: "6",
    sections: [
      {
        title: "API shape and model examples",
        text: "The source ledger records the official quickstart as OpenAI-compatible, with base_url set to https://api.moonshot.ai/v1 and example model kimi-k3. Kimi Code uses separate coding endpoints and model configuration.",
        visual: "A build can start OpenAI-compatible, then branch for Kimi Code endpoints when coding tools need them."
      },
      {
        title: "Reasoning and context controls matter",
        text: "The K3 API guide notes that K3 always thinks. Developers can adjust reasoning_effort across low, high and max, and can set max_completion_tokens up to 1,048,576 when a workflow needs the long context ceiling.",
        visual: "The planner below lets teams test token volume against the recorded price points."
      },
      {
        title: "Pricing must be rechecked before production",
        text: "At collection time, the API platform showed cache hit $0.30/MTok, input $3.00/MTok and output $15.00/MTok. Treat those as planning defaults and verify the current platform page before billing decisions.",
        visual: "Cost cards show separate cache, input and output meters because K3 pricing is not one flat token rate."
      }
    ],
    tool: "api-cost"
  },
  {
    key: "architecture",
    path: "architecture",
    pageClass: "architecture",
    accent: "#8f7cff",
    title: "Kimi K3 Architecture Trail - KDA, Attention Residuals and FlashKDA",
    description: "A Kimi K3 architecture trail through Kimi Linear, Kimi Delta Attention, Attention Residuals, FlashKDA and official implementation repositories.",
    h1: "Kimi K3 Architecture Trail",
    eyebrow: "Papers and official implementations",
    lead: "Follow the research and implementation sources that explain the architecture terms used in the Kimi K3 launch materials.",
    primaryHref: "/reviews-and-media/",
    primaryText: "Read external reviews",
    secondaryHref: "/follow-up-watchlist/",
    secondaryText: "Track weight release",
    sourceIds: ["arxiv-kimi-linear", "arxiv-attention-residuals", "github-attention-residuals", "github-flashkda", "hf-kimi-linear-collection", "moonshot-github-org"],
    chapters: ["KDA", "AttnRes", "FlashKDA", "HF collection", "Weight watch"],
    statLabel: "paper and repo entries",
    statValue: "7",
    sections: [
      {
        title: "Kimi Delta Attention is the key architecture thread",
        text: "The Kimi Linear paper introduces KDA and reports up to 75% KV-cache reduction and up to 6x decoding throughput at 1M context in the paper setting. The K3 page points to KDA as part of the model architecture.",
        visual: "Read KDA as a research lineage, not as a standalone deployment promise for K3 weights."
      },
      {
        title: "Attention Residuals explain the other named component",
        text: "The Attention Residuals paper and repository describe cross-layer attention for reducing information dilution in deep PreNorm models, plus Block AttnRes for large-scale training efficiency.",
        visual: "The diagram pairs deep-layer signal flow with the official repository and paper."
      },
      {
        title: "FlashKDA is the implementation bridge",
        text: "FlashKDA is an official MoonshotAI kernel repository. It is useful for understanding engineering direction, and it becomes more important after official K3 weights and inference notes can be verified.",
        visual: "Kernel, model-hosting and vLLM support should be revisited when official weights are published."
      }
    ],
    tool: "architecture-map"
  },
  {
    key: "reviews",
    path: "reviews-and-media",
    pageClass: "reviews",
    accent: "#38b66f",
    title: "Kimi K3 Reviews, Media and Community Signals",
    description: "External Kimi K3 reviews and media signals from Nature, AP, Tom's Hardware, engineering tests, community discussions, video queues and measurement disclosures.",
    h1: "Kimi K3 Reviews and Media Signals",
    eyebrow: "Interpretation without confusing source types",
    lead: "Use external reviews as launch-week signals while keeping them separate from official Kimi K3 facts and benchmark claims.",
    primaryHref: "/companion-pages/",
    primaryText: "Open practical map",
    secondaryHref: "/official-sources/",
    secondaryText: "Return to official facts",
    sourceIds: ["nature-scientists", "ap-kimi-k3", "tomshardware-kimi-k3", "generative-ai-review", "cnblogs-engineering-review", "kimik3-io-about", "hn-digest-kimi-k3", "bilibili-search-kimi-k3"],
    chapters: ["Science news", "Wire news", "Hardware view", "Engineering test", "Community queue"],
    statLabel: "review and media entries",
    statValue: "15",
    sections: [
      {
        title: "News coverage shows market and research attention",
        text: "Nature, AP and Tom's Hardware are useful for understanding launch-week reaction, hardware-reader framing and open-model competition. They should not replace official benchmark or technical-report sources.",
        visual: "Media cards sit in a separate lane from official launch and API docs."
      },
      {
        title: "Hands-on reviews are product signals",
        text: "Engineering reviews and vibe-coding tests can reveal workflow quality, but sample size, prompts, plan limits and tool settings matter. This page marks them as external evidence.",
        visual: "The classifier below separates science news, hands-on review, measurement and community discussion."
      },
      {
        title: "Community threads reveal practical pain points",
        text: "V2EX, Hacker News, Bilibili and YouTube searches help find questions about 1M context access, pricing, coding tools, demos and tutorials. They move fast, so they live in a refreshable queue.",
        visual: "Community sources are useful for content planning, but volatile details need current checks."
      }
    ],
    tool: "review-classifier"
  },
  {
    key: "companion",
    path: "companion-pages",
    pageClass: "companion",
    accent: "#e24d5c",
    title: "Kimi K3 Practical Companion Pages - Context, Pricing, Deployment and Benchmarks",
    description: "A practical Kimi K3 companion map for context window, API cost, pricing, local deployment, hardware requirements, benchmarks, alternatives and use-case pages.",
    h1: "Kimi K3 Practical Companion Pages",
    eyebrow: "Reader jobs beside the source ledger",
    lead: "Route practical reader questions to the right topic page while keeping the official source boundary visible.",
    primaryHref: "/api-and-developer/",
    primaryText: "Plan API cost",
    secondaryHref: "/follow-up-watchlist/",
    secondaryText: "See follow-ups",
    sourceIds: ["kimi3-org-companion-pages", "v2ex-resource-site-thread", "v2ex-membership-thread", "hn-digest-kimi-k3", "bilibili-search-kimi-k3", "youtube-search-kimi-k3"],
    chapters: ["Context", "Cost", "Deployment", "Hardware", "Benchmark"],
    statLabel: "practical page groups",
    statValue: "5",
    sections: [
      {
        title: "Map each reader job to a page type",
        text: "The companion-page ledger covers context window, API cost, pricing, local deployment, hardware requirements, open-source status, benchmarks, reviews, alternatives, tools, use cases and coding workflows.",
        visual: "A route finder maps reader intent to pages rather than forcing everything onto one long document."
      },
      {
        title: "Keep practical guidance source-aware",
        text: "A pricing or hardware page can be helpful only when it shows which facts came from official docs, which are estimates and which require follow-up after weights, licenses or model cards are released.",
        visual: "Practical pages should carry status tags, not just polished summaries."
      },
      {
        title: "Use community demand without copying noise",
        text: "Community threads prove that readers want cost, local-run, membership and setup guidance. This page turns that demand into clean navigation and avoids importing screenshots or stale claims.",
        visual: "Demand signals become page routing, not unverified public assertions."
      }
    ],
    tool: "companion-router"
  },
  {
    key: "watchlist",
    path: "follow-up-watchlist",
    pageClass: "watchlist",
    accent: "#ffffff",
    title: "Kimi K3 Follow-Up Watchlist - Technical Report, Weights and Official Repos",
    description: "Kimi K3 follow-up watchlist for the official technical report, full weights, MoonshotAI GitHub repo, Hugging Face model page, Bilibili and YouTube refreshes.",
    h1: "Kimi K3 Follow-Up Watchlist",
    eyebrow: "Pending facts that must be rechecked",
    lead: "Track the facts that are too important to freeze: technical report, full weights, official GitHub/Hugging Face model pages, video queues and third-party placeholders.",
    primaryHref: "/official-sources/",
    primaryText: "Return to sources",
    secondaryHref: "/architecture/",
    secondaryText: "Review architecture",
    sourceIds: ["k3-tech-report-watch", "official-kimi-k3-blog", "moonshot-github-org", "moonshot-hf-org", "hf-thirdparty-placeholder", "youtube-search-kimi-k3", "bilibili-search-kimi-k3"],
    chapters: ["Tech report", "Full weights", "GitHub", "Hugging Face", "Video refresh"],
    statLabel: "high-priority checks",
    statValue: "7",
    sections: [
      {
        title: "Technical report is the highest-priority refresh",
        text: "The launch materials said more architecture, training and evaluation detail would arrive with the Kimi K3 technical report. Until then, paper pages should be described as architecture context rather than a full K3 report.",
        visual: "The report slot stays open until an official technical report URL can be verified."
      },
      {
        title: "Weights and model hosting require official-org checks",
        text: "At collection time the ledger did not find an official MoonshotAI GitHub or moonshotai Hugging Face Kimi-K3 weight repository. Third-party placeholders must stay separated from official release pages.",
        visual: "Official organization checks prevent same-name placeholder pages from becoming false release claims."
      },
      {
        title: "Video and community queues should be rescanned",
        text: "Bilibili and YouTube results change quickly. The next pass should extract titles, channels, dates, links and categories only when the source can be inspected directly.",
        visual: "Queued video searches are useful for content expansion but not stable enough for fixed claims."
      }
    ],
    tool: "watchlist"
  }
];

const navItems = [
  ["Official", "/official-sources/"],
  ["API", "/api-and-developer/"],
  ["Architecture", "/architecture/"],
  ["Reviews", "/reviews-and-media/"],
  ["Watchlist", "/follow-up-watchlist/"]
];

function escape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pageUrl(page) {
  return `${origin}/${page.path ? `${page.path}/` : ""}`;
}

function pageDir(page) {
  return page.path ? join(publicRoot, page.path) : publicRoot;
}

function asset(page, index) {
  return media[page.key][index];
}

function getSource(id) {
  const source = byId.get(id);
  if (!source) throw new Error(`Unknown source id ${id}`);
  return source;
}

function sourceCard(id) {
  const source = getSource(id);
  const note = sourceNotes[id] || `${source.sourceType} source in the Kimi K3 research ledger.`;
  const title = sourceTitles[id] || source.title;
  const status = source.status === "verified" ? "Verified" : source.status;
  return `<article class="source-card" data-category="${escape(source.category)}" data-status="${escape(source.status)}" data-priority="${escape(source.priority)}">
    <div class="source-spark" aria-hidden="true"><span></span><i></i></div>
    <div>
      <p class="source-meta">${escape(source.priority)} · ${escape(status)} · ${escape(source.sourceType)}</p>
      <h3>${escape(title)}</h3>
      <p>${escape(note)}</p>
    </div>
    <a href="${escape(source.url)}" rel="noopener noreferrer" target="_blank" data-track="source_card">Open source</a>
  </article>`;
}

function schema(page) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.h1,
    description: page.description,
    url: pageUrl(page),
    dateModified: updated,
    isPartOf: { "@type": "WebSite", name: "Kimi K3 Best", url: origin },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: page.sections.map((section) => ({
        "@type": "Question",
        name: section.title,
        acceptedAnswer: { "@type": "Answer", text: section.text }
      }))
    },
    about: page.sourceIds.map((id) => {
      const source = getSource(id);
      return { "@type": "CreativeWork", name: source.title, url: source.url };
    })
  });
}

function nav(activePage) {
  return `<header class="site-header" data-track-zone="nav">
    <a class="brand" href="/" aria-label="Kimi K3 Best home"><span class="brand-mark"></span><b>Kimi K3 Best</b><small>Source Map</small></a>
    <nav aria-label="Primary navigation">${navItems.map(([label, href]) => `<a href="${href}"${activePage.path && href.includes(activePage.path) ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
  </header>`;
}

function hero(page) {
  return `<section class="hero hero-${page.pageClass}" style="--accent:${page.accent}">
    <video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="/assets/media/${asset(page, 2)}" aria-label="${escape(page.h1)} explainer background">
      <source src="/assets/media/${asset(page, 1)}" type="video/webm">
    </video>
    <div class="hero-shade"></div>
    <div class="hero-copy">
      <p class="eyebrow">${escape(page.eyebrow)}</p>
      <h1>${escape(page.h1)}</h1>
      <p class="lead">${escape(page.lead)}</p>
      <div class="hero-actions">
        <a class="primary" href="${page.primaryHref}" data-track="internal_link">${escape(page.primaryText)}</a>
        <a href="${page.secondaryHref}" data-track="internal_link">${escape(page.secondaryText)}</a>
      </div>
    </div>
    <aside class="hero-panel" aria-label="${escape(page.h1)} quick facts">
      <div class="hero-stat"><strong>${escape(page.statValue)}</strong><span>${escape(page.statLabel)}</span></div>
      <ol>${page.chapters.map((chapter, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${escape(chapter)}</li>`).join("")}</ol>
    </aside>
    <a class="scroll-cue" href="#overview" aria-label="Scroll to overview">Explore</a>
  </section>`;
}

function explainerVideo(page) {
  return `<section class="explainer" id="overview" style="--accent:${page.accent}">
    <div class="section-heading">
      <span>Page explainer</span>
      <h2>${escape(page.h1)} in motion</h2>
      <p>This short video summarizes the page: the source set, the decision boundary and the practical next action.</p>
    </div>
    <div class="video-shell">
      <video class="motion-source" controls muted loop playsinline preload="metadata" poster="/assets/media/${asset(page, 2)}">
        <source src="/assets/media/${asset(page, 1)}" type="video/webm">
      </video>
      <img src="/assets/media/${asset(page, 0)}" width="1280" height="720" alt="${escape(page.h1)} visual summary">
    </div>
  </section>`;
}

function storyVisual(page, section, index) {
  const steps = page.chapters;
  const active = steps[index % steps.length];
  return `<figure class="story-visual" aria-label="${escape(section.title)} visual">
    <div class="visual-board">
      <span class="visual-kicker">${String(index + 1).padStart(2, "0")} · ${escape(active)}</span>
      <strong>${escape(section.visual)}</strong>
      <div class="visual-rings" aria-hidden="true">
        <i></i><i></i><i></i>
      </div>
      <div class="visual-bars" aria-hidden="true">${steps.map((step, stepIndex) => `<b style="--i:${stepIndex}">${escape(step)}</b>`).join("")}</div>
    </div>
  </figure>`;
}

function storySections(page) {
  return `<section class="story-grid" aria-label="${escape(page.h1)} guide">
    ${page.sections.map((section, index) => `<article class="story">
      <div class="story-copy">
        <span class="section-index">${String(index + 1).padStart(2, "0")}</span>
        <h2>${escape(section.title)}</h2>
        <p>${escape(section.text)}</p>
      </div>
      ${storyVisual(page, section, index)}
    </article>`).join("")}
  </section>`;
}

function sourceRouterTool() {
  return `<section class="instrument source-router" id="tool" data-tool="source-router">
    <div class="tool-copy">
      <span>Source router</span>
      <h2>Choose the job and get a clean reading path</h2>
      <p>Use the router when a reader asks for a fact, an API setup, a paper trail, an external review or a pending release check.</p>
    </div>
    <div class="tool-panel">
      <label>Reader job
        <select id="sourceJob">
          <option value="official">Quote official Kimi K3 facts</option>
          <option value="api">Plan an API integration</option>
          <option value="architecture">Understand KDA and AttnRes</option>
          <option value="reviews">Compare launch-week reviews</option>
          <option value="watchlist">Check weight and report status</option>
        </select>
      </label>
      <output id="sourceRouterOutput">Start with Official Sources, then use the Watchlist before quoting release status.</output>
    </div>
  </section>`;
}

function sourceFilterTool(page) {
  return `<section class="instrument source-filter" id="tool" data-tool="source-filter">
    <div class="tool-copy">
      <span>Source filter</span>
      <h2>Filter visible cards by trust boundary</h2>
      <p>Keep official facts, verified docs and pending items distinct when preparing a Kimi K3 page or brief.</p>
    </div>
    <div class="tool-panel segmented" role="group" aria-label="Source filters">
      <button type="button" data-filter-source="all" class="is-active">All</button>
      <button type="button" data-filter-source="verified">Verified</button>
      <button type="button" data-filter-source="P0">P0</button>
      <button type="button" data-filter-source="pending official release">Pending</button>
    </div>
  </section>`;
}

function apiCostTool() {
  return `<section class="instrument api-cost-tool" id="tool" data-tool="api-cost">
    <div class="tool-copy">
      <span>API cost planner</span>
      <h2>Estimate a Kimi K3 API scenario</h2>
      <p>Defaults come from the source ledger's API platform snapshot. Recheck the official platform before production billing.</p>
    </div>
    <div class="tool-panel grid-inputs">
      <label>Cache hit $/MTok <input id="cacheRate" type="number" step="0.01" min="0" value="0.30"></label>
      <label>Input $/MTok <input id="inputRate" type="number" step="0.01" min="0" value="3.00"></label>
      <label>Output $/MTok <input id="outputRate" type="number" step="0.01" min="0" value="15.00"></label>
      <label>Cache tokens / month <input id="cacheTokens" type="number" min="0" value="50000000"></label>
      <label>Input tokens / month <input id="inputTokens" type="number" min="0" value="25000000"></label>
      <label>Output tokens / month <input id="outputTokens" type="number" min="0" value="6000000"></label>
      <output id="costOutput">Estimated monthly API spend: $0.00</output>
    </div>
  </section>`;
}

function architectureTool() {
  return `<section class="instrument architecture-tool" id="tool" data-tool="architecture-map">
    <div class="tool-copy">
      <span>Architecture map</span>
      <h2>Trace the named K3 components</h2>
      <p>The map links KDA, Attention Residuals and FlashKDA to the supporting paper or official implementation source.</p>
    </div>
    <div class="arch-map" aria-label="Kimi K3 architecture map">
      <button type="button" data-arch="kda" class="is-active">KDA</button>
      <button type="button" data-arch="attnres">Attention Residuals</button>
      <button type="button" data-arch="flashkda">FlashKDA</button>
      <output id="archOutput">KDA comes from Kimi Linear and is the main attention-efficiency thread referenced by K3 materials.</output>
    </div>
  </section>`;
}

function reviewClassifierTool() {
  return `<section class="instrument review-tool" id="tool" data-tool="review-classifier">
    <div class="tool-copy">
      <span>Review classifier</span>
      <h2>Label external evidence before using it</h2>
      <p>Classify a source as science news, hands-on review, community discussion, measurement or queued video search.</p>
    </div>
    <div class="tool-panel">
      <label>Source type
        <select id="reviewType">
          <option value="science">Science or mainstream news</option>
          <option value="hands-on">Hands-on coding review</option>
          <option value="community">Community thread</option>
          <option value="measurement">Third-party measurement</option>
          <option value="video">Video search queue</option>
        </select>
      </label>
      <output id="reviewOutput">Use as context and interpretation. Verify claims through official docs or benchmark sources.</output>
    </div>
  </section>`;
}

function companionTool() {
  return `<section class="instrument companion-tool" id="tool" data-tool="companion-router">
    <div class="tool-copy">
      <span>Companion route finder</span>
      <h2>Match a reader question to a practical page</h2>
      <p>The route finder keeps practical pages aligned with source-backed boundaries.</p>
    </div>
    <div class="tool-panel">
      <label>Reader question
        <select id="companionQuestion">
          <option value="context">How big is the context window?</option>
          <option value="cost">How much would the API cost?</option>
          <option value="deploy">Can I run it locally?</option>
          <option value="hardware">What hardware would I need?</option>
          <option value="compare">How does it compare with other models?</option>
        </select>
      </label>
      <output id="companionOutput">Route to the context-window page, then cite official membership and API context limits.</output>
    </div>
  </section>`;
}

function watchlistTool() {
  return `<section class="instrument watchlist-tool" id="tool" data-tool="watchlist">
    <div class="tool-copy">
      <span>Release watchlist</span>
      <h2>Mark which checks are still open</h2>
      <p>Use this before saying that weights, reports or official repos are available.</p>
    </div>
    <div class="watch-grid">
      ${[
        ["Technical report", "Pending official release"],
        ["Full weights", "Scheduled in official materials; verify current status"],
        ["MoonshotAI GitHub Kimi-K3", "Not found in collection scan"],
        ["moonshotai Hugging Face Kimi-K3", "Not found in collection scan"],
        ["Third-party placeholders", "Not official"],
        ["YouTube extraction", "Queued"],
        ["Bilibili video sample", "Needs second-pass extraction"]
      ].map(([label, status]) => `<label><input type="checkbox" class="watch-check"> <span>${escape(label)}</span><small>${escape(status)}</small></label>`).join("")}
      <output id="watchOutput">0 of 7 follow-up checks marked complete.</output>
    </div>
  </section>`;
}

function tool(page) {
  if (page.tool === "source-router") return sourceRouterTool();
  if (page.tool === "source-filter") return sourceFilterTool(page);
  if (page.tool === "api-cost") return apiCostTool();
  if (page.tool === "architecture-map") return architectureTool();
  if (page.tool === "review-classifier") return reviewClassifierTool();
  if (page.tool === "companion-router") return companionTool();
  if (page.tool === "watchlist") return watchlistTool();
  return "";
}

function sourceSection(page) {
  return `<section class="source-section" aria-label="${escape(page.h1)} sources">
    <div class="section-heading">
      <span>Source cards</span>
      <h2>Sources used on this page</h2>
      <p>Cards are generated from the clauxel/kimik3 source ledger and keep source type, priority and status visible.</p>
    </div>
    <div class="source-grid">${page.sourceIds.map(sourceCard).join("")}</div>
  </section>`;
}

function related(page) {
  const relatedPages = pages.filter((candidate) => candidate.key !== page.key).slice(0, 3);
  if (page.key !== "home") {
    const home = pages[0];
    relatedPages[0] = home;
  }
  return `<section class="related" aria-label="Related pages">
    <p>Continue the map</p>
    <div>${relatedPages.map((candidate) => `<a href="/${candidate.path ? `${candidate.path}/` : ""}" data-track="internal_link">
      <span>${escape(candidate.eyebrow)}</span>
      <strong>${escape(candidate.h1)}</strong>
    </a>`).join("")}</div>
  </section>`;
}

function footer() {
  return `<footer>
    <a href="/">Kimi K3 Best</a>
    <p>Independent source-first Kimi K3 map generated from the public clauxel/kimik3 research ledger. Official facts, secondary reviews and pending checks are labeled separately.</p>
    <p><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="mailto:${supportEmail}">${supportEmail}</a></p>
  </footer>`;
}

function html(page) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(page.title)}</title>
  <meta name="description" content="${escape(page.description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${pageUrl(page)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Kimi K3 Best">
  <meta property="og:title" content="${escape(page.title)}">
  <meta property="og:description" content="${escape(page.description)}">
  <meta property="og:url" content="${pageUrl(page)}">
  <meta property="og:image" content="${origin}/assets/media/${asset(page, 0)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(page.title)}">
  <meta name="twitter:description" content="${escape(page.description)}">
  <meta name="theme-color" content="#090907">
  <link rel="preload" href="/assets/media/${asset(page, 1)}" as="video" type="video/webm">
  <link rel="stylesheet" href="/assets/k3.css">
  <script type="application/ld+json">${schema(page)}</script>
</head>
<body class="page-${page.pageClass}">
  ${nav(page)}
  <main>
    ${hero(page)}
    ${explainerVideo(page)}
    ${storySections(page)}
    ${tool(page)}
    ${sourceSection(page)}
    ${related(page)}
  </main>
  ${footer()}
  <script src="/assets/k3.js" defer></script>
</body>
</html>`;
}

function simplePage({ path, title, h1, description, robots = "index,follow", body, mediaKey }) {
  const url = `${origin}/${path}/`;
  const mediaFiles = media[mediaKey];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${origin}/assets/media/${mediaFiles[0]}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/k3.css">
</head>
<body class="page-simple">
  ${nav({ path })}
  <main class="simple-main">
    <h1>${escape(h1)}</h1>
    ${body}
    <section class="simple-video" aria-label="${escape(h1)} explainer video">
      <video class="motion-source" controls muted loop playsinline preload="metadata" poster="/assets/media/${mediaFiles[2]}">
        <source src="/assets/media/${mediaFiles[1]}" type="video/webm">
      </video>
      <img src="/assets/media/${mediaFiles[0]}" width="1280" height="720" alt="${escape(h1)} visual summary">
    </section>
  </main>
  ${footer()}
  <script src="/assets/k3.js" defer></script>
</body>
</html>`;
}

function productData() {
  const countByBatch = sources.reduce((acc, source) => {
    acc[source.batch] = (acc[source.batch] || 0) + 1;
    return acc;
  }, {});
  const countByStatus = sources.reduce((acc, source) => {
    acc[source.status] = (acc[source.status] || 0) + 1;
    return acc;
  }, {});
  return {
    name: "Kimi K3 Best",
    origin,
    collectedAt,
    sourceRepository: "https://github.com/clauxel/kimik3",
    pages: pages.map((page) => ({
      key: page.key,
      path: pageUrl(page),
      title: page.title,
      sourceIds: page.sourceIds
    })),
    sourceCounts: {
      total: sources.length,
      byBatch: countByBatch,
      byStatus: countByStatus
    },
    currentStatus: sourceLedger.status,
    apiDefaults: {
      cacheHitUsdPerMTok: 0.3,
      inputUsdPerMTok: 3,
      outputUsdPerMTok: 15,
      pricingRequiresCurrentOfficialCheck: true
    }
  };
}

function sitemap() {
  const routeUrls = pages.map(pageUrl);
  routeUrls.push(`${origin}/privacy/`, `${origin}/terms/`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routeUrls.map((url) => `  <url><loc>${url}</loc><lastmod>${updated}</lastmod><changefreq>weekly</changefreq><priority>${url === `${origin}/` ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`;
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}

function llms() {
  return `# Kimi K3 Best

Source-first Kimi K3 research map generated from https://github.com/clauxel/kimik3.

Collected source ledger timestamp: ${collectedAt}

## Pages
${pages.map((page) => `- ${page.h1}: ${pageUrl(page)} - ${page.description}`).join("\n")}

## Current source boundaries
- Official technical report: ${sourceLedger.status.technicalReport}
- Full weights: ${sourceLedger.status.fullWeights}
- Official MoonshotAI GitHub Kimi-K3 repo: ${sourceLedger.status.officialGitHubKimiK3Repo}
- Official moonshotai Hugging Face Kimi-K3 repo: ${sourceLedger.status.officialHuggingFaceKimiK3Repo}

## Source repository
- clauxel/kimik3: https://github.com/clauxel/kimik3
`;
}

async function write(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

await rm(publicRoot, { recursive: true, force: true });
await mkdir(join(publicRoot, "assets", "media"), { recursive: true });
await mkdir(join(publicRoot, "data"), { recursive: true });
await copyFile(join(root, "src", "k3.css"), join(publicRoot, "assets", "k3.css"));
await copyFile(join(root, "src", "k3.js"), join(publicRoot, "assets", "k3.js"));

for (const page of pages) {
  await write(join(pageDir(page), "index.html"), html(page));
}

await write(join(publicRoot, "privacy", "index.html"), simplePage({
  path: "privacy",
  title: "Privacy | Kimi K3 Best",
  h1: "Privacy",
  description: "Privacy information for Kimi K3 Best.",
  mediaKey: "privacy",
  body: `<p>Kimi K3 Best stores only basic same-origin analytics events such as page views and tool interactions. It does not ask for API keys, accounts or private documents.</p><figure class="story-visual simple-visual"><div class="visual-board"><span class="visual-kicker">Data boundary</span><strong>Only page path, event name and timestamp are used for site health signals.</strong><div class="visual-rings"><i></i><i></i><i></i></div></div></figure>`
}));

await write(join(publicRoot, "terms", "index.html"), simplePage({
  path: "terms",
  title: "Terms | Kimi K3 Best",
  h1: "Terms",
  description: "Terms for using Kimi K3 Best.",
  mediaKey: "terms",
  body: `<p>Kimi K3 Best is an independent source map for public Kimi K3 materials. It is provided for research and planning, and fast-moving facts should be checked against their official source before operational decisions.</p><figure class="story-visual simple-visual"><div class="visual-board"><span class="visual-kicker">Use boundary</span><strong>Official pages, papers, external reviews and watchlist items are labeled separately.</strong><div class="visual-rings"><i></i><i></i><i></i></div></div></figure>`
}));

await write(join(publicRoot, "404.html"), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Not Found | Kimi K3 Best</title>
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${origin}/404.html">
  <meta property="og:image" content="${origin}/assets/media/${media.notfound[0]}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/k3.css">
</head>
<body class="page-simple">
  ${nav({ path: "404" })}
  <main class="simple-main">
    <h1>Page not found</h1>
    <p>The source map moved. Start from the Kimi K3 Best home page or open the official-source index.</p>
    <p><a class="primary text-button" href="/">Open home</a> <a class="text-button" href="/official-sources/">Official sources</a></p>
    <section class="simple-video" aria-label="Page not found explainer video">
      <video class="motion-source" controls muted loop playsinline preload="metadata" poster="/assets/media/${media.notfound[2]}">
        <source src="/assets/media/${media.notfound[1]}" type="video/webm">
      </video>
      <img src="/assets/media/${media.notfound[0]}" width="1280" height="720" alt="Page not found visual summary">
    </section>
  </main>
  ${footer()}
  <script src="/assets/k3.js" defer></script>
</body>
</html>`);

await write(join(publicRoot, "sitemap.xml"), sitemap());
await write(join(publicRoot, "robots.txt"), robots());
await write(join(publicRoot, "llms.txt"), llms());
await write(join(publicRoot, "product.json"), `${JSON.stringify(productData(), null, 2)}\n`);
await write(join(publicRoot, "data", "kimi-k3-sources.json"), `${JSON.stringify(sourceLedger, null, 2)}\n`);

console.log(JSON.stringify({
  ok: true,
  pages: pages.length,
  sources: sources.length,
  origin,
  sourceRepository: "https://github.com/clauxel/kimik3"
}, null, 2));

const $ = (id) => document.getElementById(id);

const routeCopy = {
  official: "Start with Official Sources, then use the Watchlist before quoting release status.",
  api: "Open API and Developer Notes for base URL, model examples, reasoning effort, context and pricing defaults.",
  architecture: "Use the Architecture Trail for KDA, Attention Residuals, FlashKDA and related official repositories.",
  reviews: "Use Reviews and Media Signals for interpretation only, then verify hard claims against official sources.",
  watchlist: "Open the Watchlist before saying technical reports, weights or official model repos are available."
};

const archCopy = {
  kda: "KDA comes from Kimi Linear and is the main attention-efficiency thread referenced by K3 materials.",
  attnres: "Attention Residuals explain the cross-layer attention component named in K3 architecture materials.",
  flashkda: "FlashKDA is the official kernel implementation to revisit when verified K3 weight and inference details arrive."
};

const reviewCopy = {
  science: "Use as context and interpretation. Verify claims through official docs or benchmark sources.",
  "hands-on": "Useful as a product workflow signal. Keep sample size, prompts and tool settings visible.",
  community: "Useful for demand signals and pain points. Recheck screenshots, pricing and access details before quoting.",
  measurement: "Use only with methodology and conflict-of-interest context visible.",
  video: "Treat as a refresh queue until titles, channels, dates and links are extracted directly."
};

const companionCopy = {
  context: "Route to the context-window page, then cite official membership and API context limits.",
  cost: "Route to API cost planning and recheck the current official pricing page before billing decisions.",
  deploy: "Route to local-deployment guidance and wait for official weights, license and model-card verification.",
  hardware: "Route to hardware requirements and separate raw weight size from runnable inference requirements.",
  compare: "Route to benchmarks, reviews and alternatives while keeping official claims apart from external tests."
};

function track(event, extra = {}) {
  fetch("/api/analytics/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, path: location.pathname, ...extra }),
    keepalive: true
  }).catch(() => {});
}

function bootVideos() {
  document.querySelectorAll("video").forEach((video) => {
    video.muted = true;
    video.play?.().catch(() => {});
  });
}

function updateRouter() {
  const select = $("sourceJob");
  const output = $("sourceRouterOutput");
  if (!select || !output) return;
  output.textContent = routeCopy[select.value] || routeCopy.official;
  track("route_pick", { value: select.value });
}

function updateCost() {
  const ids = ["cacheRate", "inputRate", "outputRate", "cacheTokens", "inputTokens", "outputTokens"];
  if (!ids.every($) || !$("costOutput")) return;
  const values = Object.fromEntries(ids.map((id) => [id, Number($(id).value) || 0]));
  const total =
    (values.cacheRate * values.cacheTokens +
      values.inputRate * values.inputTokens +
      values.outputRate * values.outputTokens) /
    1_000_000;
  $("costOutput").textContent = `Estimated monthly API spend: $${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  track("api_cost_plan");
}

function filterSources(button) {
  const filter = button.dataset.filterSource;
  document.querySelectorAll("[data-filter-source]").forEach((item) => item.classList.toggle("is-active", item === button));
  let visible = 0;
  document.querySelectorAll(".source-card").forEach((card) => {
    const match =
      filter === "all" ||
      card.dataset.status === filter ||
      card.dataset.priority === filter;
    card.hidden = !match;
    if (match) visible += 1;
  });
  track("source_filter", { filter, visible });
}

function pickArchitecture(button) {
  document.querySelectorAll("[data-arch]").forEach((item) => item.classList.toggle("is-active", item === button));
  const output = $("archOutput");
  if (output) output.textContent = archCopy[button.dataset.arch] || archCopy.kda;
  track("architecture_pick", { value: button.dataset.arch });
}

function updateReview() {
  const select = $("reviewType");
  const output = $("reviewOutput");
  if (!select || !output) return;
  output.textContent = reviewCopy[select.value] || reviewCopy.science;
  track("review_classify", { value: select.value });
}

function updateCompanion() {
  const select = $("companionQuestion");
  const output = $("companionOutput");
  if (!select || !output) return;
  output.textContent = companionCopy[select.value] || companionCopy.context;
  track("companion_pick", { value: select.value });
}

function updateWatchlist() {
  const checks = [...document.querySelectorAll(".watch-check")];
  const output = $("watchOutput");
  if (!checks.length || !output) return;
  const complete = checks.filter((check) => check.checked).length;
  output.textContent = `${complete} of ${checks.length} follow-up checks marked complete.`;
  track("watchlist_update", { complete });
}

document.addEventListener("DOMContentLoaded", () => {
  bootVideos();
  updateCost();
  track("page_view");
});

document.addEventListener("input", (event) => {
  if (event.target.closest(".api-cost-tool")) updateCost();
});

document.addEventListener("change", (event) => {
  if (event.target.id === "sourceJob") updateRouter();
  if (event.target.id === "reviewType") updateReview();
  if (event.target.id === "companionQuestion") updateCompanion();
  if (event.target.classList.contains("watch-check")) updateWatchlist();
});

document.addEventListener("click", (event) => {
  const filter = event.target.closest("[data-filter-source]");
  if (filter) filterSources(filter);

  const arch = event.target.closest("[data-arch]");
  if (arch) pickArchitecture(arch);

  const tracked = event.target.closest("[data-track]");
  if (tracked) track(tracked.dataset.track);
});

document.querySelector(".motion-source")?.addEventListener("play", () => track("video_play"), { once: true });

#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { setTimeout as wait } from "node:timers/promises";

const root = resolve(new URL("..", import.meta.url).pathname);
const reportsDir = join(root, "reports", "screenshots");
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const origin = process.env.VISUAL_URL || "https://kimik3.best/";
const port = Number(process.env.CDP_PORT || 9358);
const profile = `/tmp/kimik3-best-cdp-${Date.now()}`;

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve: ok, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else ok(data.result);
      }
    };
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
}

async function getJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

async function waitForChrome() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      return await getJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await wait(250);
    }
  }
  throw new Error("Chrome DevTools endpoint did not become ready");
}

async function openPage() {
  await waitForChrome();
  return getJson(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  return new Cdp(ws);
}

async function inspectViewport(viewport) {
  const target = await openPage();
  const cdp = await connect(target.webSocketDebuggerUrl);
  const url = `${origin}${origin.includes("?") ? "&" : "?"}visualCheck=${Date.now()}-${viewport.name}`;

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile
  });
  if (viewport.mobile) {
    await cdp.send("Emulation.setUserAgentOverride", {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
    });
  }
  await cdp.send("Page.navigate", { url });
  await wait(4500);

  const evaluation = await cdp.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const selectors = [".site-header", ".brand", "nav", ".hero", ".eyebrow", ".hero h1", ".lead", ".hero-actions", ".hero-panel"];
      const box = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return { selector, missing: true };
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          selector,
          display: style.display,
          visibility: style.visibility,
          text: (element.innerText || element.textContent || "").trim().slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          inViewport: rect.left >= -1 && rect.right <= window.innerWidth + 1
        };
      };
      const videos = [...document.querySelectorAll("video")].map((video) => ({
        src: video.currentSrc || video.src,
        readyState: video.readyState,
        width: video.videoWidth,
        height: video.videoHeight
      }));
      return {
        url: location.href,
        innerWidth,
        innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        heroHeight: Math.round(document.querySelector(".hero")?.getBoundingClientRect().height || 0),
        boxes: selectors.map(box),
        videos
      };
    })()`
  });

  const result = evaluation.result.value;
  const important = result.boxes.filter((entry) => !entry.missing && entry.display !== "none" && [".site-header", ".brand", ".hero", ".hero h1", ".lead", ".hero-actions", ".hero-panel"].includes(entry.selector));
  const clipped = important.filter((entry) => !entry.inViewport);
  const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await mkdir(reportsDir, { recursive: true });
  const screenshotFile = `production-${viewport.name}.png`;
  const screenshotPath = join(reportsDir, screenshotFile);
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
  cdp.ws.close();

  return {
    ...result,
    viewport,
    screenshotPath: `reports/screenshots/${screenshotFile}`,
    clipped,
    status: clipped.length === 0 && result.scrollWidth <= result.innerWidth + 1 && result.heroHeight >= viewport.height ? "pass" : "fail"
  };
}

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--disable-component-update",
  "--disable-background-networking",
  "--disable-extensions",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  "about:blank"
], { stdio: "ignore" });

try {
  const results = [];
  for (const viewport of [
    { name: "desktop-1440", width: 1440, height: 900, mobile: false },
    { name: "mobile-390", width: 390, height: 844, mobile: true }
  ]) {
    results.push(await inspectViewport(viewport));
  }
  const failed = results.filter((result) => result.status !== "pass");
  const report = {
    ok: failed.length === 0,
    generatedAt: new Date().toISOString(),
    fallbackReason: "Codex in-app browser production navigation timed out; CDP headless Chrome used with explicit CSS viewports.",
    results
  };
  await writeFile(join(root, "reports", "prod-visual-check.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  chrome.kill("SIGTERM");
  await wait(500);
  if (!chrome.killed) chrome.kill("SIGKILL");
  await rm(profile, { recursive: true, force: true });
}

#!/usr/bin/env node
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const mediaRoot = join(root, "public", "assets", "media");
const durationSeconds = 12;
const fps = 15;

const pages = [
  {
    key: "home",
    image: "kimi-k3-best-home.png",
    video: "kimi-k3-best-home.webm",
    poster: "kimi-k3-best-home-poster.png",
    title: "Kimi K3 Best Source Map",
    subtitle: "36 public sources organized by claim boundary, API use, architecture, reviews and follow-up checks.",
    accent: "#3dd6c6",
    secondary: "#f2c14e",
    chapters: ["Official facts", "API shape", "Architecture trail", "Review boundary", "Watch queue"]
  },
  {
    key: "official",
    image: "kimi-k3-best-official.png",
    video: "kimi-k3-best-official.webm",
    poster: "kimi-k3-best-official-poster.png",
    title: "Kimi K3 Official Sources",
    subtitle: "Launch page, Moonshot company page, help center and model-mode guidance stay ahead of secondary claims.",
    accent: "#f2c14e",
    secondary: "#3dd6c6",
    chapters: ["Launch page", "Company page", "Help center", "Mode selection", "Website builder"]
  },
  {
    key: "api",
    image: "kimi-k3-best-api.png",
    video: "kimi-k3-best-api.webm",
    poster: "kimi-k3-best-api-poster.png",
    title: "Kimi K3 API Notes",
    subtitle: "OpenAI-compatible API shape, reasoning effort, 1M context, vision input and price planning.",
    accent: "#ff6f61",
    secondary: "#f2c14e",
    chapters: ["Base URL", "Reasoning effort", "1M context", "Vision input", "Cost plan"]
  },
  {
    key: "architecture",
    image: "kimi-k3-best-architecture.png",
    video: "kimi-k3-best-architecture.webm",
    poster: "kimi-k3-best-architecture-poster.png",
    title: "Kimi K3 Architecture Trail",
    subtitle: "KDA, Attention Residuals and FlashKDA connect K3 claims to papers and official implementations.",
    accent: "#8f7cff",
    secondary: "#3dd6c6",
    chapters: ["KDA", "AttnRes", "FlashKDA", "HF collection", "Weight watch"]
  },
  {
    key: "reviews",
    image: "kimi-k3-best-reviews.png",
    video: "kimi-k3-best-reviews.webm",
    poster: "kimi-k3-best-reviews-poster.png",
    title: "Reviews and Media Signals",
    subtitle: "Science news, hands-on reviews, hardware reporting and communities are separated from official facts.",
    accent: "#38b66f",
    secondary: "#f2c14e",
    chapters: ["Science news", "Wire news", "Hardware view", "Engineering test", "Community queue"]
  },
  {
    key: "companion",
    image: "kimi-k3-best-companion.png",
    video: "kimi-k3-best-companion.webm",
    poster: "kimi-k3-best-companion-poster.png",
    title: "Practical Companion Pages",
    subtitle: "Context, cost, deployment, hardware and comparison pages route reader jobs to the right evidence.",
    accent: "#e24d5c",
    secondary: "#3dd6c6",
    chapters: ["Context", "Cost", "Deployment", "Hardware", "Benchmark"]
  },
  {
    key: "watchlist",
    image: "kimi-k3-best-watchlist.png",
    video: "kimi-k3-best-watchlist.webm",
    poster: "kimi-k3-best-watchlist-poster.png",
    title: "Kimi K3 Follow-Up Watchlist",
    subtitle: "Technical report, full weights, official GitHub and Hugging Face pages must be rechecked before quoting.",
    accent: "#ffffff",
    secondary: "#ff6f61",
    chapters: ["Tech report", "Full weights", "GitHub", "Hugging Face", "Video refresh"]
  },
  {
    key: "privacy",
    image: "kimi-k3-best-privacy.png",
    video: "kimi-k3-best-privacy.webm",
    poster: "kimi-k3-best-privacy-poster.png",
    title: "Privacy Boundary",
    subtitle: "Kimi K3 Best uses only page path, event name and timestamp for same-origin site health signals.",
    accent: "#3dd6c6",
    secondary: "#f2c14e",
    chapters: ["No keys", "No accounts", "Event name", "Page path", "Timestamp"]
  },
  {
    key: "terms",
    image: "kimi-k3-best-terms.png",
    video: "kimi-k3-best-terms.webm",
    poster: "kimi-k3-best-terms-poster.png",
    title: "Use Boundary",
    subtitle: "Official pages, papers, external reviews and pending checks remain labeled separately for research use.",
    accent: "#f2c14e",
    secondary: "#e24d5c",
    chapters: ["Research use", "Official facts", "External views", "Current checks", "Source labels"]
  },
  {
    key: "notfound",
    image: "kimi-k3-best-notfound.png",
    video: "kimi-k3-best-notfound.webm",
    poster: "kimi-k3-best-notfound-poster.png",
    title: "Route Back to the Map",
    subtitle: "A missing URL should return readers to the Kimi K3 source map or official-source index.",
    accent: "#ffffff",
    secondary: "#3dd6c6",
    chapters: ["Home", "Official", "API", "Architecture", "Watchlist"]
  }
];

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function waitForChrome(port, chromeProcess, stderr) {
  const started = Date.now();
  while (Date.now() - started < 15000) {
    if (chromeProcess.exitCode !== null) {
      throw new Error(`Chrome exited early with code ${chromeProcess.exitCode}\n${stderr()}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find((target) => target.type === "page") || targets[0];
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch {
      await delay(250);
    }
  }
  throw new Error(`Timed out waiting for Chrome DevTools\n${stderr()}`);
}

async function launchChrome() {
  const chromeBin = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const profile = await mkdtemp(join(tmpdir(), "kimik3-best-media-"));
  const port = 9300 + Math.floor(Math.random() * 500);
  let stderr = "";
  const chromeProcess = spawn(chromeBin, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"] });
  chromeProcess.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  const wsUrl = await waitForChrome(port, chromeProcess, () => stderr);
  return {
    wsUrl,
    async close() {
      chromeProcess.kill("SIGTERM");
      await delay(300);
      if (chromeProcess.exitCode === null) chromeProcess.kill("SIGKILL");
      await rm(profile, { recursive: true, force: true });
    }
  };
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const request = this.pending.get(message.id);
      if (!request) return;
      this.pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend });
    });
  }

  close() {
    this.socket.close();
  }
}

async function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });
  return new Cdp(socket);
}

function renderer(page, duration, frameRate) {
  return new Promise((resolveRender, rejectRender) => {
    const width = 1280;
    const height = 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const totalFrames = Math.round(duration * frameRate);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const recorder = new MediaRecorder(canvas.captureStream(frameRate), {
      mimeType: mime,
      videoBitsPerSecond: 1400000
    });
    const chunks = [];

    function hexToRgb(hex) {
      const clean = hex.replace("#", "");
      const full = clean.length === 3 ? clean.split("").map((part) => part + part).join("") : clean;
      const int = parseInt(full, 16);
      return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
    }

    function rgba(hex, alpha) {
      const [r, g, b] = hexToRgb(hex);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function wrap(text, x, y, maxWidth, lineHeight, font) {
      ctx.font = font;
      const words = text.split(" ");
      let line = "";
      let cursor = y;
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && line) {
          ctx.fillText(line, x, cursor);
          cursor += lineHeight;
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) ctx.fillText(line, x, cursor);
      return cursor;
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#090907");
      gradient.addColorStop(0.38, "#15150f");
      gradient.addColorStop(1, "#261b16");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = 0.36;
      ctx.strokeStyle = "rgba(244,241,232,0.16)";
      ctx.lineWidth = 1;
      const offset = (t * 90) % 80;
      for (let x = -80 + offset; x < width + 80; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 170, height);
        ctx.stroke();
      }
      for (let y = -80 + offset; y < height + 80; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y + 80);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(885, 250);
      ctx.rotate(t * Math.PI * 2);
      for (let i = 0; i < 5; i += 1) {
        ctx.strokeStyle = i % 2 ? rgba(page.secondary, 0.36) : rgba(page.accent, 0.58);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-145 + i * 22, -145 + i * 22, 290 - i * 44, 290 - i * 44);
        ctx.stroke();
      }
      ctx.restore();

      const scanX = -280 + ((t * width * 1.7) % (width + 560));
      const scan = ctx.createLinearGradient(scanX, 0, scanX + 300, height);
      scan.addColorStop(0, "rgba(255,255,255,0)");
      scan.addColorStop(0.5, rgba(page.accent, 0.32));
      scan.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = scan;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = rgba(page.accent, 0.14);
      ctx.fillRect(64, 66, 286, 6);
      ctx.fillStyle = rgba(page.secondary, 0.62);
      ctx.fillRect(64, 66, 120 + Math.sin(t * Math.PI * 2) * 70, 6);

      ctx.fillStyle = "#f4f1e8";
      ctx.font = "700 70px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      wrap(page.title, 64, 172, 690, 78, "700 70px system-ui, -apple-system, BlinkMacSystemFont, sans-serif");
      ctx.fillStyle = "rgba(244,241,232,0.76)";
      wrap(page.subtitle, 68, 348, 610, 36, "400 24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif");

      const active = Math.floor(t * page.chapters.length) % page.chapters.length;
      page.chapters.forEach((chapter, index) => {
        const y = 494 + index * 34;
        const isActive = index === active;
        ctx.fillStyle = isActive ? page.accent : "rgba(244,241,232,0.16)";
        ctx.fillRect(68, y - 18, 220 + index * 32, 24);
        ctx.fillStyle = isActive ? "#090907" : "rgba(244,241,232,0.78)";
        ctx.font = "700 15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(`${String(index + 1).padStart(2, "0")}  ${chapter}`, 82, y);
      });

      for (let i = 0; i < 13; i += 1) {
        const x = 735 + i * 35;
        const h = 54 + Math.sin(t * Math.PI * 2 + i * 0.65) * 45 + i * 4;
        ctx.fillStyle = i % 3 === 0 ? rgba(page.secondary, 0.68) : rgba(page.accent, 0.76);
        ctx.fillRect(x, 620 - h, 19, h);
      }

      ctx.strokeStyle = rgba(page.accent, 0.72);
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 120; i += 1) {
        const x = 730 + i * 3.5;
        const y = 498 + Math.sin(i * 0.15 + t * Math.PI * 4) * 38 + Math.cos(i * 0.04) * 28;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(9,9,7,0.76)";
      ctx.fillRect(804, 114, 332, 112);
      ctx.strokeStyle = "rgba(244,241,232,0.2)";
      ctx.strokeRect(804, 114, 332, 112);
      ctx.fillStyle = page.accent;
      ctx.font = "700 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("SOURCE BOUNDARY", 828, 153);
      ctx.fillStyle = "rgba(244,241,232,0.78)";
      ctx.font = "400 17px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("official · external · pending", 828, 190);
    }

    function toBase64(blob) {
      return new Promise((resolveBase64) => {
        const reader = new FileReader();
        reader.onload = () => resolveBase64(String(reader.result).split(",")[1]);
        reader.readAsDataURL(blob);
      });
    }

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onerror = () => rejectRender(recorder.error);
    recorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: mime });
        resolveRender({
          image: canvas.dataset.image,
          poster: canvas.dataset.poster,
          video: await toBase64(blob),
          mime,
          durationSeconds: duration
        });
      } catch (error) {
        rejectRender(error);
      }
    };

    (async () => {
      draw(0);
      canvas.dataset.image = canvas.toDataURL("image/png").split(",")[1];
      draw(0.45);
      canvas.dataset.poster = canvas.toDataURL("image/png").split(",")[1];
      recorder.start();
      for (let frame = 0; frame < totalFrames; frame += 1) {
        draw(frame / totalFrames);
        await new Promise((resolveFrame) => setTimeout(resolveFrame, 1000 / frameRate));
      }
      recorder.stop();
    })().catch(rejectRender);
  });
}

async function main() {
  await mkdir(mediaRoot, { recursive: true });
  const chrome = await launchChrome();
  const cdp = await connect(chrome.wsUrl);
  const manifest = {
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    durationSeconds,
    files: {}
  };

  try {
    await cdp.send("Runtime.enable");
    for (const page of pages) {
      const expression = `(${renderer.toString()})(${JSON.stringify(page)}, ${durationSeconds}, ${fps})`;
      const result = await cdp.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true
      });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Renderer exception");
      const value = result.result.value;
      await writeFile(join(mediaRoot, page.image), Buffer.from(value.image, "base64"));
      await writeFile(join(mediaRoot, page.poster), Buffer.from(value.poster, "base64"));
      await writeFile(join(mediaRoot, page.video), Buffer.from(value.video, "base64"));
      manifest.files[page.key] = {
        image: page.image,
        poster: page.poster,
        video: page.video,
        mime: value.mime,
        durationSeconds: value.durationSeconds
      };
      console.log(`generated ${page.key}`);
    }
  } finally {
    cdp.close();
    await chrome.close();
  }

  await writeFile(join(mediaRoot, "kimi-k3-media-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, pages: pages.length, durationSeconds }, null, 2));
}

await main();

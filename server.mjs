import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(new URL("./public", import.meta.url).pathname);
const port = Number(process.env.PORT || 4173);
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"application/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".png":"image/png", ".svg":"image/svg+xml", ".webm":"video/webm", ".xml":"application/xml; charset=utf-8", ".txt":"text/plain; charset=utf-8" };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    if (pathname === "/api/health") {
      response.writeHead(200, { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" });
      response.end(JSON.stringify({ ok: true, service: "kimik3.best-local", stored: false }));
      return;
    }
    if (pathname === "/api/analytics/events") {
      response.writeHead(200, { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" });
      response.end(JSON.stringify({ ok: true, stored: false, local: true }));
      return;
    }
    let target = resolve(root, `.${pathname}`);
    if (!(target === root || target.startsWith(`${root}${sep}`))) throw new Error("Forbidden");
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = join(target, "index.html");
    const body = await readFile(normalize(target));
    response.writeHead(200, { "content-type": types[extname(target)] || "application/octet-stream", "cache-control":"no-store" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type":"text/html; charset=utf-8", "x-robots-tag":"noindex,follow" });
    response.end(await readFile(join(root, "404.html")));
  }
}).listen(port, "127.0.0.1", () => console.log(`Kimi K3 local server: http://127.0.0.1:${port}`));

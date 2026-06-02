// Headless smoke test: load every page, capture real runtime errors, verify maps
// render, screenshot the key pages. Uses the system Chrome (no browser download).
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const EXE = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE || "http://127.0.0.1:3000";
const PAGES = [
  "/", "/affaire-saint-ouen", "/explorer", "/comparer",
  "/methodes", "/sources", "/debats/blanchiment", "/a-propos",
  "/en/", "/en/affaire-saint-ouen", "/en/methodes"
];
const MAP_PAGES = new Set(["/affaire-saint-ouen", "/explorer", "/en/affaire-saint-ouen"]);
const SHOTS = new Set(["/", "/affaire-saint-ouen", "/explorer", "/comparer", "/methodes"]);

// Errors from the IGN basemap / glyphs / CDN CSS are environmental, not app bugs.
const BENIGN = /geopf\.fr|demotiles|unpkg\.com|favicon|AJAXError|Failed to fetch|net::ERR|status of 4|status of 5|tile/i;

await mkdir("test/shots", { recursive: true });
const browser = await puppeteer.launch({ executablePath: EXE, headless: true, args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,900"] });
const results = [];

for (const path of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const real = [], benign = [];
  const push = (s) => (BENIGN.test(s) ? benign : real).push(s);
  page.on("console", (m) => { if (m.type() === "error") push("console: " + m.text()); });
  page.on("pageerror", (e) => push("pageerror: " + e.message));
  page.on("requestfailed", (r) => push("reqfail: " + r.url()));

  try {
    await page.goto(BASE + path, { waitUntil: "load", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 3500)); // let reactive blocks + maps run
    if (MAP_PAGES.has(path)) {
      const canvas = await page.$("canvas.maplibregl-canvas");
      if (!canvas) real.push("NO MAP CANVAS rendered");
    }
    // Heuristic: Framework renders block errors into elements with class 'observablehq--error'
    const blockErrors = await page.$$eval(".observablehq--error", (els) => els.map((e) => e.textContent.slice(0, 120)));
    for (const be of blockErrors) real.push("block-error: " + be);
    if (SHOTS.has(path)) {
      const name = path === "/" ? "home" : path.replaceAll("/", "_").replace(/^_/, "");
      await page.screenshot({ path: `test/shots/${name}.png` });
    }
  } catch (e) {
    real.push("nav: " + e.message);
  }
  results.push({ path, real, benign });
  await page.close();
}
await browser.close();

let bad = 0;
for (const r of results) {
  const tag = r.real.length ? "✗" : "✓";
  if (r.real.length) bad++;
  console.log(`${tag} ${r.path}   (${r.benign.length} benign)`);
  for (const e of r.real.slice(0, 8)) console.log("     " + e);
}
console.log(`\n${results.length - bad}/${results.length} pages clean (real errors only)`);
process.exit(bad ? 1 : 0);

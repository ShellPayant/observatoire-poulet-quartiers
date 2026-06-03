---
title: My neighborhood (EN)
toc: false
---

```js
import { evidenceBadge, sourceLine } from "../components/evidence.js";
import { fmtInt } from "../components/format.js";
import { createMap, addPoints, maplibregl } from "../components/maps.js";
import { withinRadius, depOf } from "../components/geo.js";
import { fetchBankruptcies, fetchCompany } from "../components/civic.js";
import { shareButton } from "../components/share.js";
import { BRAND_KEYS, NAMED_CHAINS, labelOf, isNamed } from "../components/brands.js";
const registry = await FileAttachment("../data/registry.json").json();
const datasets = registry.datasets;
const survival = await FileAttachment("../data/fastfood_survival.json").json();
const SHARDS = {
  "01": FileAttachment("../data/fastfood/01.json"), "02": FileAttachment("../data/fastfood/02.json"), "03": FileAttachment("../data/fastfood/03.json"),
  "04": FileAttachment("../data/fastfood/04.json"), "05": FileAttachment("../data/fastfood/05.json"), "06": FileAttachment("../data/fastfood/06.json"),
  "07": FileAttachment("../data/fastfood/07.json"), "08": FileAttachment("../data/fastfood/08.json"), "09": FileAttachment("../data/fastfood/09.json"),
  "10": FileAttachment("../data/fastfood/10.json"), "11": FileAttachment("../data/fastfood/11.json"), "12": FileAttachment("../data/fastfood/12.json"),
  "13": FileAttachment("../data/fastfood/13.json"), "14": FileAttachment("../data/fastfood/14.json"), "15": FileAttachment("../data/fastfood/15.json"),
  "16": FileAttachment("../data/fastfood/16.json"), "17": FileAttachment("../data/fastfood/17.json"), "18": FileAttachment("../data/fastfood/18.json"),
  "19": FileAttachment("../data/fastfood/19.json"), "21": FileAttachment("../data/fastfood/21.json"), "22": FileAttachment("../data/fastfood/22.json"),
  "23": FileAttachment("../data/fastfood/23.json"), "24": FileAttachment("../data/fastfood/24.json"), "25": FileAttachment("../data/fastfood/25.json"),
  "26": FileAttachment("../data/fastfood/26.json"), "27": FileAttachment("../data/fastfood/27.json"), "28": FileAttachment("../data/fastfood/28.json"),
  "29": FileAttachment("../data/fastfood/29.json"), "2A": FileAttachment("../data/fastfood/2A.json"), "2B": FileAttachment("../data/fastfood/2B.json"),
  "30": FileAttachment("../data/fastfood/30.json"), "31": FileAttachment("../data/fastfood/31.json"), "32": FileAttachment("../data/fastfood/32.json"),
  "33": FileAttachment("../data/fastfood/33.json"), "34": FileAttachment("../data/fastfood/34.json"), "35": FileAttachment("../data/fastfood/35.json"),
  "36": FileAttachment("../data/fastfood/36.json"), "37": FileAttachment("../data/fastfood/37.json"), "38": FileAttachment("../data/fastfood/38.json"),
  "39": FileAttachment("../data/fastfood/39.json"), "40": FileAttachment("../data/fastfood/40.json"), "41": FileAttachment("../data/fastfood/41.json"),
  "42": FileAttachment("../data/fastfood/42.json"), "43": FileAttachment("../data/fastfood/43.json"), "44": FileAttachment("../data/fastfood/44.json"),
  "45": FileAttachment("../data/fastfood/45.json"), "46": FileAttachment("../data/fastfood/46.json"), "47": FileAttachment("../data/fastfood/47.json"),
  "48": FileAttachment("../data/fastfood/48.json"), "49": FileAttachment("../data/fastfood/49.json"), "50": FileAttachment("../data/fastfood/50.json"),
  "51": FileAttachment("../data/fastfood/51.json"), "52": FileAttachment("../data/fastfood/52.json"), "53": FileAttachment("../data/fastfood/53.json"),
  "54": FileAttachment("../data/fastfood/54.json"), "55": FileAttachment("../data/fastfood/55.json"), "56": FileAttachment("../data/fastfood/56.json"),
  "57": FileAttachment("../data/fastfood/57.json"), "58": FileAttachment("../data/fastfood/58.json"), "59": FileAttachment("../data/fastfood/59.json"),
  "60": FileAttachment("../data/fastfood/60.json"), "61": FileAttachment("../data/fastfood/61.json"), "62": FileAttachment("../data/fastfood/62.json"),
  "63": FileAttachment("../data/fastfood/63.json"), "64": FileAttachment("../data/fastfood/64.json"), "65": FileAttachment("../data/fastfood/65.json"),
  "66": FileAttachment("../data/fastfood/66.json"), "67": FileAttachment("../data/fastfood/67.json"), "68": FileAttachment("../data/fastfood/68.json"),
  "69": FileAttachment("../data/fastfood/69.json"), "70": FileAttachment("../data/fastfood/70.json"), "71": FileAttachment("../data/fastfood/71.json"),
  "72": FileAttachment("../data/fastfood/72.json"), "73": FileAttachment("../data/fastfood/73.json"), "74": FileAttachment("../data/fastfood/74.json"),
  "75": FileAttachment("../data/fastfood/75.json"), "76": FileAttachment("../data/fastfood/76.json"), "77": FileAttachment("../data/fastfood/77.json"),
  "78": FileAttachment("../data/fastfood/78.json"), "79": FileAttachment("../data/fastfood/79.json"), "80": FileAttachment("../data/fastfood/80.json"),
  "81": FileAttachment("../data/fastfood/81.json"), "82": FileAttachment("../data/fastfood/82.json"), "83": FileAttachment("../data/fastfood/83.json"),
  "84": FileAttachment("../data/fastfood/84.json"), "85": FileAttachment("../data/fastfood/85.json"), "86": FileAttachment("../data/fastfood/86.json"),
  "87": FileAttachment("../data/fastfood/87.json"), "88": FileAttachment("../data/fastfood/88.json"), "89": FileAttachment("../data/fastfood/89.json"),
  "90": FileAttachment("../data/fastfood/90.json"), "91": FileAttachment("../data/fastfood/91.json"), "92": FileAttachment("../data/fastfood/92.json"),
  "93": FileAttachment("../data/fastfood/93.json"), "94": FileAttachment("../data/fastfood/94.json"), "95": FileAttachment("../data/fastfood/95.json"),
  "97": FileAttachment("../data/fastfood/97.json")
};
```

<div style="display:flex;justify-content:flex-end"><a href="/mon-quartier" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇫🇷 Français</a></div>

# 🏘️ My neighborhood

Type your address: we look at the **fast-food shops around you** — how many there are, which have **closed** or gone **bankrupt**, and **how long they last** on average. National data (SIRENE), live bankruptcies (BODACC). *The life and death of shops, measured honestly — not a ranking.*

```js
const address = view(Inputs.text({ value: "Mairie de Saint-Ouen", placeholder: "e.g. 12 rue Albert-Dhalenne, Saint-Ouen", label: "Address or city", submit: "Locate", width: 460 }));
```
```js
const radius = view(Inputs.range([250, 3000], { value: 1000, step: 250, label: "Radius (metres)" }));
```

```js
async function geocode(q) {
  try {
    const r = await fetch("https://data.geopf.fr/geocodage/search?" + new URLSearchParams({ q, limit: "1" }));
    const f = (await r.json()).features?.[0];
    if (!f) return null;
    return { lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], label: f.properties.label, citycode: f.properties.citycode };
  } catch { return null; }
}
const located = address && address.trim().length > 2 ? await geocode(address) : null;
```
```js
async function loadShops(citycode) {
  const fa = SHARDS[depOf(citycode)];
  if (!fa) return [];
  return (await fa.json()).map((a) => ({ brand: BRAND_KEYS[a[0]], ferme: a[1] === 1, created: a[2], closed: a[3], lifespan: a[4], siren: a[5], commune: a[6], lon: a[7], lat: a[8] }));
}
const shopsAll = located?.citycode ? await loadShops(located.citycode) : [];
const near = located ? withinRadius(shopsAll, [located.lat, located.lon], radius) : [];
const active = near.filter((s) => !s.ferme);
const closed = near.filter((s) => s.ferme);
```

```js
display(located
  ? html`<div class="pq-source">📍 ${located.label} — <b>${fmtInt(near.length, "en")}</b> fast-food shops within ${radius} m (${fmtInt(active.length, "en")} open, ${fmtInt(closed.length, "en")} closed).</div>`
  : html`<div class="pq-gate" style="border-color:var(--pq-emerg);background:#fdf8ee">Type an address and press “Locate”.</div>`);
```

## The map

```js
const mapEl = document.createElement("div");
mapEl.style = "height:460px;border-radius:.6rem;overflow:hidden;position:relative";
display(mapEl);
const map = createMap(mapEl, { center: [2.34, 48.86], zoom: 12 });
await new Promise((res) => map.on("load", res));
map.resize();
const fc = (shops) => ({ type: "FeatureCollection", features: shops.map((s) => ({ type: "Feature", geometry: { type: "Point", coordinates: [s.lon, s.lat] }, properties: { brand: s.brand, created: s.created, closed: s.closed } })) });
const popup = (e) => { const p = e.features[0].properties; new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<b>${isNamed(p.brand) ? labelOf(p.brand, "en") : "Independent / other"}</b><br>opened ${p.created || "?"}${p.closed ? " · closed " + p.closed : ""}`).addTo(map); };
addPoints(map, { sourceId: "fermes", geojson: fc([]), color: "#9a9a9a", radius: 4, onClick: popup });
addPoints(map, { sourceId: "actifs", geojson: fc([]), color: "#1f7a4d", radius: 5, onClick: popup });
```
```js
{
  map.getSource("actifs")?.setData(fc(active));
  map.getSource("fermes")?.setData(fc(closed));
  if (located) {
    if (map._am) map._am.remove();
    map._am = new maplibregl.Marker({ color: "#c64b1e" }).setLngLat([located.lon, located.lat]).addTo(map);
    map.flyTo({ center: [located.lon, located.lat], zoom: radius < 800 ? 15 : radius < 1600 ? 14 : 13, speed: 1.4 });
  }
}
```

## In numbers

```js
const localMedian = (() => { const a = closed.map((s) => s.lifespan).filter((x) => x != null && x >= 0).sort((x, y) => x - y); return a.length ? +(a[Math.floor(a.length / 2)] / 365.25).toFixed(1) : null; })();
function tile(v, label, color = "#c64b1e") { return html`<div class="pq-kpi"><div class="v" style="color:${color}">${v}</div><div class="l">${label}</div></div>`; }
display(html`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.7rem;margin:.5rem 0">
  ${tile(fmtInt(near.length, "en"), "fast-food shops")}
  ${tile(fmtInt(active.length, "en"), "still open", "#1f7a4d")}
  ${tile(fmtInt(closed.length, "en"), "have closed", "#9a6210")}
  ${tile(localMedian != null ? localMedian + " yr" : "—", "median lifespan (closed)")}
</div>`);
display(html`<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">${evidenceBadge("documenté", "en")}${sourceLine("sirene_stock", datasets, "en")}</div>`);
```

## How long do they last? (survival curve)

```js
const natKm = survival.national.km.map((d) => ({ t: d.t, survival: d.survival }));
display(Plot.plot({
  height: 300, marginLeft: 50,
  y: { label: "% still open", domain: [0, 1], tickFormat: "%", grid: true },
  x: { label: "Age (years)", domain: [1, 10], ticks: [1, 3, 5, 10] },
  marks: [Plot.lineY(natKm, { x: "t", y: "survival", stroke: "#888", strokeWidth: 2.5, marker: "circle" })]
}));
display(html`<div class="pq-source" style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">Nationally, the median lifespan of <b>closed</b> fast-food shops is <b>${survival.national.median_life_years} years</b>, and <b>${Math.round((survival.national.km.find((k) => k.t === 5)?.survival || 0) * 100)}%</b> survive past 5 years. ${evidenceBadge("émergent", "en")}</div>`);
```

## Bankruptcies on record (BODACC, live)

```js
const bankruptcies = near.length ? await fetchBankruptcies(near.map((s) => s.siren)) : new Map();
const failed = near.filter((s) => bankruptcies.has(s.siren));
display((() => {
  if (!near.length) return html`<div class="pq-source">—</div>`;
  if (!failed.length) return html`<div class="pq-source">No insolvency proceedings found in BODACC for shops in this radius. <i>A closure isn’t always a bankruptcy, and vice-versa.</i></div>`;
  const items = failed.slice(0, 25).map((s) => { const last = (bankruptcies.get(s.siren) || []).sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0]; const who = isNamed(s.brand) ? labelOf(s.brand, "en") : `Independent — ${s.commune}`; return html`<li><b>${who}</b> · ${last?.nature || "proceeding"} <span style="color:#888">(${last?.date || "?"})</span></li>`; });
  return html`<div><div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.3rem">${evidenceBadge("documenté", "en")}${sourceLine("bodacc", datasets, "en")}</div><ul style="columns:2;font-size:.9rem">${items}</ul></div>`;
})());
```

<div class="pq-source">Out of respect, <b>independent</b> shops are never named (only the town and years are shown); only well-known brands are identified.</div>

## Share

```js
const topBrand = (() => { const c = {}; for (const s of near) if (s.brand !== "independant") c[s.brand] = (c[s.brand] || 0) + 1; const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return e ? e[0] : null; })();
display(shareButton(() => ({ place: located?.label, radius, total: near.length, active: active.length, closed: closed.length, medianLife: localMedian, survival5: survival.national.km.find((k) => k.t === 5)?.survival, bankruptcies: failed.length, topBrandLabel: topBrand ? labelOf(topBrand, "en") : null }), "en"));
```

## What these numbers don’t say

<div class="pq-gate" style="border-style:solid;border-color:var(--pq-emerg);background:#fdf8ee">

- **Approximate closure date** (SIRENE last-processing date; exact period history is a future refinement) — lifespans are estimates.
- **Survival ≠ causation** — a curve describes longevity, not *why* a shop closes.
- **Bankruptcy ≠ closure** — many shops cease without a proceeding; some proceedings don’t end in closure.
- **SIRENE, not OpenStreetMap** — counts differ from the [explorer](/explorer)’s OSM layer by design.
- **NAF 56.10C** = all fast food, not only chicken.

See **[Methods & limits](/en/methodes)**.
</div>

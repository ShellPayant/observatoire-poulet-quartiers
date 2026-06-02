---
title: The Saint-Ouen affair (EN)
toc: true
---

```js
import { evidenceBadge, sourceLine, kpiCard } from "../components/evidence.js";
import { createMap, addChoropleth, paintChoropleth, addPoints, RAMPS, legend, indexBy, maplibregl } from "../components/maps.js";
import { fmtPrice, fmtPct } from "../components/format.js";
const summary = await FileAttachment("../data/summary.json").json();
const registry = await FileAttachment("../data/registry.json").json();
const datasets = registry.datasets;
const bench = await FileAttachment("../data/dvf_benchmarks.json").json();
const communes = await FileAttachment("../data/communes_grandparis.geojson").json();
const dvf = await FileAttachment("../data/dvf_communes.json").json();
const cibles = await FileAttachment("../data/enseignes_cibles.geojson").json();
```

<div style="display:flex;justify-content:flex-end"><a href="/affaire-saint-ouen" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇫🇷 Français</a></div>

# 📍 The Master Poulet affair in Saint-Ouen

In April 2026, a **Master Poulet** chicken shop opened in the heart of Saint-Ouen’s new town centre, almost under the town hall’s windows. Three days later the mayor closed it and placed **concrete blocks** at the door; an administrative court ruled the blocking an **illegal violation of the freedom of enterprise**; the city replied with giant **flowerpots**. Behind the €5 braised chicken lies a **real-estate bet** and a deeper question: *who decides what gets sold on your street?*

This page tells the story with a lens **sympathetic to accessibility and freedom of enterprise** — while giving the **objections** and the **data limits** equal billing.

```js
const strip = document.createElement("div");
strip.style = "display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.7rem;margin:1rem 0";
for (const k of summary.kpis.filter((k) => ["prix_so", "prix_so_evol", "master_poulet", "crime_so"].includes(k.id)))
  strip.append(kpiCard(k, datasets, "en"));
display(strip);
```

## A real-estate bet

Saint-Ouen has seen a decade of dramatic appreciation — metro line 14, the Docks eco-district, the 2024 Olympic Village — making it the **2nd most expensive town in Seine-Saint-Denis**. Low-cost chicken locates where prices (and incomes) are *already* lower: that is a **location effect**, not proof of impact.

```js
const labels = bench.meta.labels;
const lines = [];
for (const r of bench.communes) lines.push({ annee: r.annee, prix: r.median_prix_m2, place: labels[r.code_commune] || r.code_commune });
for (const r of bench.departements.filter((d) => d.code_departement === "93"))
  lines.push({ annee: r.annee, prix: r.median_prix_m2, place: "Seine-Saint-Denis median (93)" });
display(Plot.plot({
  height: 320, marginLeft: 56,
  y: { label: "€/m² (median)", grid: true, tickFormat: (d) => d / 1000 + "k" },
  x: { label: "Year", tickFormat: "d" },
  color: { legend: true },
  marks: [Plot.lineY(lines, { x: "annee", y: "prix", stroke: "place", strokeWidth: 2.5, marker: "circle" })]
}));
```

```js
const priceById = indexBy(dvf.latest, "code_commune", "median_prix_m2");
const { breaks } = paintChoropleth(communes, priceById, RAMPS.prix, "code");
const mapEl = document.createElement("div");
mapEl.style = "height:460px;border-radius:.6rem;overflow:hidden;position:relative";
display(mapEl);
const map = createMap(mapEl, { center: [2.3365, 48.903], zoom: 12.2 });
map.on("load", () => {
  map.resize();
  addChoropleth(map, { sourceId: "prix", geojson: communes,
    onClick: (e) => { const p = e.features[0].properties; new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<b>${p.nom}</b><br>${p._v ? fmtPrice(p._v, "en") : "not disclosed"}`).addTo(map); } });
  addPoints(map, { sourceId: "cibles", geojson: cibles, color: "#c64b1e", radius: 6,
    onClick: (e) => { const p = e.features[0].properties; new maplibregl.Popup().setLngLat(e.geometry?.coordinates || e.lngLat).setHTML(`<b>${p.name || "Outlet"}</b><br>${(p.brand || "").replaceAll("_", " ")}`).addTo(map); } });
});
const lg = legend("Median price (€/m²)", breaks, RAMPS.prix, { fmt: (x) => Math.round(x).toLocaleString("en-GB"), nodata: "not disclosed" });
lg.style.cssText += "position:absolute;bottom:8px;left:8px;z-index:2";
mapEl.appendChild(lg);
```

<div class="pq-source">Prices: DVF (Etalab/DGFiP). Points: OpenStreetMap + reference list (partial). Basemap: © IGN Géoplateforme.</div>

## The debate, both sides

<div class="pq-contra">
<div class="pq-col">
<h4>✅ For the chain</h4>

- **The rule of law spoke.** Walling up a legal shop with concrete blocks is a *“serious and manifestly illegal violation of the freedom of enterprise”* (a constitutional principle). The court said so plainly. ${evidenceBadge("documenté","en")}
- **Real popular demand.** Queues, low prices amid inflation: a €7 meal “feeds two”. ${evidenceBadge("documenté","en")}
- **Jobs and inclusion.** Geographer Simon Vonthron (INRAE) calls the snack a *“social shock absorber”* and a route to employment. ${evidenceBadge("émergent","en")}
- **The right tools exist.** Pre-emption rights, local planning — built in advance, transparently, not by walling a shop overnight. ${evidenceBadge("documenté","en")}

</div>
<div class="pq-col">
<h4>⚖️ Objections & limits</h4>

- **Opened without all permits**, including an unauthorized terrace it later removed. ${evidenceBadge("documenté","en")}
- **Neighbourhood nuisances** (noise, smells, late deliveries) are real — though they can be regulated rather than banned. ${evidenceBadge("émergent","en")}
- **Opinion backs the mayor:** 55% of French, 75% of manual workers (Ifop, May 2026). ${evidenceBadge("documenté","en")}
- **Meat traceability** is questioned — yet 77% of French food-service chicken was already imported in 2019. ${evidenceBadge("contesté","en")}

</div>
</div>

```js
display(sourceLine(["dossier", "ifop_darwin"], datasets, "en"));
```

## What the data cannot say

<div class="pq-gate" style="border-style:solid;border-color:var(--pq-emerg);background:#fdf8ee">

- **Correlation isn’t causation**, and **reverse causation** is likely (cheap food locates where rents are *already* low).
- **Crime exists only at municipal level** — attributing it to a neighbourhood or a shop is an **ecological fallacy**.
- The **set of target outlets is partial** (OpenStreetMap + reference) and dated.

See **[Methods & limits](/en/methodes)**.
</div>

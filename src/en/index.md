---
title: Home (EN)
toc: false
---

```js
import { kpiCard, evidenceBadge } from "../components/evidence.js";
const summary = await FileAttachment("../data/summary.json").json();
const registry = await FileAttachment("../data/registry.json").json();
const datasets = registry.datasets;
```

<div style="display:flex;justify-content:flex-end"><a href="/" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇫🇷 Français</a></div>

<div style="text-align:center;max-width:760px;margin:1rem auto 0">

# 🍗 Poulet & Quartiers Observatory

<h2 style="font-weight:400;color:var(--theme-foreground-muted);margin-top:-.4rem">Are cheap fried-chicken chains reshaping French neighborhoods? <b>Open data, your own opinion.</b></h2>

</div>

The **Master Poulet** affair in Saint-Ouen (April 2026) turned a grilled-chicken shop into a national debate: gentrification vs. popular demand, “junk food” vs. freedom of enterprise, real estate, class, safety. The debate overflows with figures — on prices, “food deserts”, crime, even money laundering — yet **almost none are sourced**, and several stigmatize working-class neighborhoods.

This **independent** observatory gathers the **open public data actually available** for Greater Paris (real estate, fast food, crime, social context), maps it honestly, **labels every claim** (documented / emerging / contested) — and lets you **form your own opinion**.

```js
const strip = document.createElement("div");
strip.style = "display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.8rem;margin:1.5rem 0";
for (const k of summary.kpis) strip.append(kpiCard(k, datasets, "en"));
display(strip);
```

<div class="pq-source" style="margin-top:-.6rem">MVP scope: Greater Paris — Paris (75), Hauts-de-Seine (92), Seine-Saint-Denis (93), Val-de-Marne (94).</div>

## Three ways to explore

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1rem;margin:.5rem 0 1rem">
  <a class="pq-modecard" href="/en/affaire-saint-ouen"><div style="font-size:1.6rem">📍</div><b>The Saint-Ouen affair</b><div style="font-size:.85rem;color:var(--theme-foreground-muted)">The story, the timeline, property prices and the debate — on one concrete case, two-sided.</div></a>
  <a class="pq-modecard" href="/explorer"><div style="font-size:1.6rem">🗺️</div><b>Explore the map</b><div style="font-size:.85rem;color:var(--theme-foreground-muted)">Prices, fast-food density, target chains, municipal crime. (French UI)</div></a>
  <a class="pq-modecard" href="/comparer"><div style="font-size:1.6rem">⚖️</div><b>Compare two areas</b><div style="font-size:.85rem;color:var(--theme-foreground-muted)">Put two municipalities side by side. (French UI)</div></a>
</div>

## How to read this site

Every figure carries an **evidence label**. The rule: never present a correlation as a cause, nor a rumor as a fact.

```js
const lg = document.createElement("div");
lg.style = "display:flex;flex-wrap:wrap;gap:1.2rem;margin:.4rem 0";
for (const [lvl, desc] of [
  ["documenté", "Established, sourced fact — official data or cross-checked reporting."],
  ["émergent", "Plausible but unproven lead — interpret with caution."],
  ["contesté", "Disputed or unsupported claim — shown for information, not validated."]
]) {
  const row = document.createElement("div");
  row.style = "display:flex;gap:.5rem;align-items:flex-start;max-width:300px";
  const d = document.createElement("div");
  d.style = "font-size:.82rem;color:var(--theme-foreground-muted)";
  d.textContent = desc;
  row.append(evidenceBadge(lvl, "en"), d);
  lg.append(row);
}
display(lg);
```

> **Neutrality.** This observatory is affiliated with no chain and no politician. A pro–Master-Poulet brief was used as raw material: it is cited **only as one party’s position**, never as the site’s voice. See [Methods & limits](/en/methodes).

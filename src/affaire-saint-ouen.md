---
title: L’affaire Saint-Ouen
toc: true
---

```js
import { evidenceBadge, sourceLine, kpiCard } from "./components/evidence.js";
import { createMap, addChoropleth, paintChoropleth, addPoints, RAMPS, legend, indexBy, maplibregl } from "./components/maps.js";
import { fmtPrice, fmtInt, fmtPct } from "./components/format.js";
const summary = await FileAttachment("data/summary.json").json();
const registry = await FileAttachment("data/registry.json").json();
const datasets = registry.datasets;
const pc = await FileAttachment("data/pro_contra.json").json();
const bench = await FileAttachment("data/dvf_benchmarks.json").json();
const communes = await FileAttachment("data/communes_grandparis.geojson").json();
const dvf = await FileAttachment("data/dvf_communes.json").json();
const cibles = await FileAttachment("data/enseignes_cibles.geojson").json();
```

<div style="display:flex;justify-content:flex-end"><a href="/en/affaire-saint-ouen" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇬🇧 English</a></div>

# 📍 L’affaire Master Poulet de Saint-Ouen

En avril 2026, l’ouverture d’un **Master Poulet** au cœur du nouveau centre-ville de Saint-Ouen, presque sous les fenêtres de la mairie, déclenche un bras de fer : blocs de béton, victoire au tribunal administratif, jardinières géantes, puis une bataille politique nationale. Derrière le poulet braisé à 5 €, un **pari foncier** et une question de fond : *qui décide de ce qui se vend en bas de chez vous ?*

Cette page raconte l’affaire **avec un regard favorable à l’accessibilité et à la liberté d’entreprendre** — tout en plaçant, à parts égales, **les objections** et **les limites des données**. Chaque élément porte son étiquette de preuve.

```js
const strip = document.createElement("div");
strip.style = "display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.7rem;margin:1rem 0";
for (const k of summary.kpis.filter((k) => ["prix_so", "prix_so_evol", "master_poulet", "crime_so"].includes(k.id)))
  strip.append(kpiCard(k, datasets, "fr"));
display(strip);
```

## La chronologie des faits

```js
const tl = document.createElement("div");
tl.style = "border-left:3px solid var(--pq-accent);padding-left:1.1rem;margin:.5rem 0 1rem";
for (const it of pc.timeline) {
  const row = document.createElement("div");
  row.style = "margin:.7rem 0";
  const head = document.createElement("div");
  head.style = "display:flex;gap:.5rem;align-items:center;flex-wrap:wrap";
  const date = document.createElement("b");
  date.textContent = it.date;
  head.append(date, evidenceBadge(it.level, "fr"));
  const txt = document.createElement("div");
  txt.style = "font-size:.9rem;color:var(--theme-foreground)";
  txt.textContent = it.text;
  row.append(head, txt);
  tl.appendChild(row);
}
display(tl);
```

<div class="pq-source">Reconstitution d’après la note de synthèse fournie et la presse (franceinfo, JDD, La Libre). La ligne du 24 mars (« demande sans réponse ») repose sur la seule parole du gérant.</div>

## Le quartier : un pari foncier

Saint-Ouen a connu une décennie de valorisation spectaculaire — ligne 14 du métro, écoquartier des Docks, Village olympique 2024 — qui en fait la **2ᵉ commune la plus chère de Seine-Saint-Denis**. Le maire assume une stratégie de **montée en gamme**. La défense de l’enseigne rétorque que *« le commerce qui marche, c’est un Master Poulet »*.

```js
const labels = bench.meta.labels;
const lines = [];
for (const r of bench.communes) lines.push({ annee: r.annee, prix: r.median_prix_m2, lieu: labels[r.code_commune] || r.code_commune });
for (const r of bench.departements.filter((d) => d.code_departement === "93"))
  lines.push({ annee: r.annee, prix: r.median_prix_m2, lieu: "Médiane Seine-Saint-Denis (93)" });
display(Plot.plot({
  height: 320,
  marginLeft: 56,
  y: { label: "€/m² (médiane)", grid: true, tickFormat: (d) => (d / 1000) + "k" },
  x: { label: "Année", tickFormat: "d" },
  color: { legend: true },
  marks: [
    Plot.lineY(lines, { x: "annee", y: "prix", stroke: "lieu", strokeWidth: 2.5, marker: "circle" }),
    Plot.text(lines.filter((d) => d.annee === Math.max(...lines.map((l) => l.annee))), { x: "annee", y: "prix", text: (d) => Math.round(d.prix / 1000) + "k", dx: 14, fontSize: 11 })
  ]
}));
```

<div class="pq-source">Prix médian au m² des ventes d’appartements et maisons (DVF géolocalisé, millésimes disponibles). Source : Etalab / DGFiP — Licence Ouverte 2.0. Lecture : à Saint-Ouen, le prix médian s’établit autour de ${fmtPrice(summary.saint_ouen.price_series.at(-1).median_prix_m2)} en ${summary.saint_ouen.price_series.at(-1).annee}.</div>

### La carte du secteur

Cliquez une commune (prix médian) ou un point (enseigne-cible identifiée). La restauration de poulet à bas prix se concentre là où les prix — et les revenus — sont déjà plus bas : c’est un **effet de localisation** (la cause précède l’enseigne), pas une preuve d’impact.

```js
const priceById = indexBy(dvf.latest, "code_commune", "median_prix_m2");
const { breaks } = paintChoropleth(communes, priceById, RAMPS.prix, "code");
const mapEl = document.createElement("div");
mapEl.style = "height:480px;border-radius:.6rem;overflow:hidden;position:relative";
display(mapEl);
const map = createMap(mapEl, { center: [2.3365, 48.903], zoom: 12.4 });
map.on("load", () => {
  map.resize();
  addChoropleth(map, {
    sourceId: "prix", geojson: communes,
    onClick: (e) => {
      const p = e.features[0].properties;
      new maplibregl.Popup().setLngLat(e.lngLat)
        .setHTML(`<b>${p.nom}</b><br>${p._v ? fmtPrice(p._v) : "prix non diffusé"}`).addTo(map);
    }
  });
  addPoints(map, {
    sourceId: "cibles", geojson: cibles, color: "#c64b1e", radius: 6,
    onClick: (e) => {
      const p = e.features[0].properties;
      new maplibregl.Popup().setLngLat(e.geometry?.coordinates || e.lngLat)
        .setHTML(`<b>${p.name || "Enseigne"}</b><br>${(p.brand || "").replaceAll("_", " ")}<br><span style="color:#888">${p.provenance}</span>`).addTo(map);
    }
  });
});
const lg = legend("Prix médian (€/m²)", breaks, RAMPS.prix, { fmt: (x) => Math.round(x).toLocaleString("fr-FR"), nodata: "non diffusé" });
lg.style.cssText += "position:absolute;bottom:8px;left:8px;z-index:2";
mapEl.appendChild(lg);
const pin = document.createElement("div");
pin.className = "pq-legend";
pin.style.cssText = "position:absolute;top:8px;left:8px;z-index:2";
pin.innerHTML = `<span style="color:#c64b1e">●</span> enseignes-cibles poulet/crousti`;
mapEl.appendChild(pin);
```

<div class="pq-source">Prix : DVF (Etalab/DGFiP). Points : OpenStreetMap + liste de référence — couverture partielle, non exhaustive. Fond : © IGN Géoplateforme.</div>

## Le concept clé : « marécage » ou « mirage » alimentaire ?

> Le géographe **Simon Vonthron** (INRAE) recadre le débat. La France n’est pas dans un « désert alimentaire ». Il oppose le **marécage alimentaire** (une offre saine noyée sous une offre malsaine) et surtout le **mirage alimentaire** : une offre saine qui *existe* mais reste inaccessible — non par le prix ou la distance, mais par une **barrière sociale**. Ouvrir une Biocoop « très marquée socialement » peut alors exclure davantage qu’inclure. Sa conclusion : agir sur les seuls locaux commerciaux, sans partir des pratiques des habitants, est *« un coup d’épée dans l’eau »*. <span class="pq-source">Source : franceinfo, grand entretien (10/05/2026).</span>

## À vous de juger : devinez, puis comparez

Avant de voir les chiffres : **à votre avis**, comment le prix médian au m² à Saint-Ouen a-t-il évolué autour de l’ouverture&nbsp;? Réglez votre estimation pour la dernière année, puis révélez les données réelles.

```js
const so = summary.saint_ouen.price_series;
const first = so[0], last = so.at(-1);
const guess = view(Inputs.range([3000, 11000], { step: 100, value: 8000, label: `Estimation à Saint-Ouen en ${last.annee} (€/m²)` }));
```

```js
const revealed = view(Inputs.toggle({ label: "Révéler les données réelles (DVF)" }));
```

```js
const so2 = summary.saint_ouen.price_series;
const f = so2[0], l = so2.at(-1);
const guessLine = [{ annee: f.annee, prix: f.median_prix_m2, série: "Votre estimation" }, { annee: l.annee, prix: guess, série: "Votre estimation" }];
const actual = revealed ? so2.map((r) => ({ annee: r.annee, prix: r.median_prix_m2, série: "Données réelles (DVF)" })) : [];
display(Plot.plot({
  height: 300, marginLeft: 56,
  y: { label: "€/m²", grid: true, domain: [3000, 11000], tickFormat: (d) => d / 1000 + "k" },
  x: { label: "Année", tickFormat: "d", domain: [f.annee, l.annee] },
  color: { legend: true, domain: ["Votre estimation", "Données réelles (DVF)"], range: ["#888", "#08519c"] },
  marks: [
    Plot.lineY(guessLine, { x: "annee", y: "prix", stroke: "série", strokeWidth: 2, strokeDasharray: "5 4" }),
    Plot.lineY(actual, { x: "annee", y: "prix", stroke: "série", strokeWidth: 2.5, marker: "circle" })
  ]
}));
```

```js
display((() => {
  const d = document.createElement("div");
  if (!revealed) { d.className = "pq-source"; d.textContent = "Réglez le curseur, puis cochez « Révéler »."; return d; }
  const realPct = Math.round(((last.median_prix_m2 - first.median_prix_m2) / first.median_prix_m2) * 100);
  const guessPct = Math.round(((guess - first.median_prix_m2) / first.median_prix_m2) * 100);
  d.innerHTML = `<div class="pq-gate" style="border-style:solid;border-color:var(--pq-doc);background:#f1f8f3">
    <b>Réel : ${fmtPct(realPct, "fr", { sign: true })}</b> entre ${first.annee} et ${last.annee} (de ${fmtPrice(first.median_prix_m2)} à ${fmtPrice(last.median_prix_m2)}).
    Votre estimation : ${fmtPct(guessPct, "fr", { sign: true })}.
    <div class="pq-source" style="margin-top:.4rem">⚠ Aucun lien de cause à effet n’est établi : ce graphique est <b>descriptif</b>. Les prix dépendent d’abord du métro, des Docks et des JO — pas du poulet. Voir <a href="/methodes">Méthodes &amp; limites</a>.</div>
  </div>`;
  return d;
})());
```

## Le débat, à parts égales

```js
const grid = document.createElement("div");
grid.className = "pq-contra";
function col(title, items, cls) {
  const c = document.createElement("div");
  c.className = "pq-col";
  const h = document.createElement("h4");
  h.textContent = title;
  c.appendChild(h);
  for (const it of items) {
    const a = document.createElement("div");
    a.className = "pq-arg " + cls;
    const head = document.createElement("div");
    head.style = "display:flex;gap:.5rem;align-items:center;flex-wrap:wrap";
    const b = document.createElement("b");
    b.textContent = it.title;
    head.append(b, evidenceBadge(it.level, "fr"));
    const d = document.createElement("div");
    d.style = "font-size:.86rem;color:var(--theme-foreground-muted);margin-top:.25rem";
    d.textContent = it.detail;
    a.append(head, d);
    c.appendChild(a);
  }
  return c;
}
grid.append(col("✅ Arguments en faveur de l’enseigne", pc.pro, "pro"), col("⚖️ Objections et limites", pc.contra, "con"));
display(grid);
```

### Ce que dit l’opinion (sondage Ifop, mai 2026)

```js
const pg = document.createElement("div");
pg.style = "display:grid;gap:.6rem;margin:.5rem 0;max-width:620px";
for (const p of pc.poll) {
  const row = document.createElement("div");
  row.innerHTML = `<div style="font-size:.85rem;display:flex;justify-content:space-between"><span>${p.label_fr}</span><b>${p.value}&nbsp;%</b></div>
    <div style="background:var(--theme-foreground-faintest);border-radius:999px;height:9px;overflow:hidden"><div style="width:${p.value}%;height:100%;background:var(--pq-accent)"></div></div>`;
  pg.appendChild(row);
}
display(pg);
display(sourceLine("ifop_darwin", datasets, "fr"));
```

L’écart **67 % → 47 %** (« pas dans ma rue » vs « ailleurs ») révèle un réflexe **NIMBY** : une majorité accepte le concept, mais pas les nuisances sous ses fenêtres. Ce qui plaide pour **réguler les nuisances**, plutôt que d’interdire l’enseigne.

## Ce que ces données ne disent pas

<div class="pq-gate" style="border-style:solid;border-color:var(--pq-emerg);background:#fdf8ee">

- **Corrélation n’est pas causalité.** Voir une enseigne là où les prix sont bas ne prouve pas qu’elle les fait baisser.
- **Causalité inverse.** La restauration à bas prix s’implante là où les loyers sont *déjà* bas — la cause précède souvent l’enseigne.
- **La délinquance n’existe qu’au niveau communal.** L’attribuer à un quartier ou à un commerce relèverait du **sophisme écologique**.
- **L’ensemble des enseignes-cibles est partiel** (OpenStreetMap + référence) et daté : ces chaînes ouvrent vite.

Tout est détaillé dans **[Méthodes & limites](/methodes)**.
</div>

---
title: Explorer la carte
toc: false
---

```js
import { sourceLine, evidenceBadge } from "./components/evidence.js";
import { createMap, addChoropleth, paintChoropleth, setChoroplethData, addPoints, pointVisible, RAMPS, legend, indexBy, maplibregl } from "./components/maps.js";
import { fmtInt, fmtNum } from "./components/format.js";
const registry = await FileAttachment("data/registry.json").json();
const datasets = registry.datasets;
const communes = await FileAttachment("data/communes_grandparis.geojson").json();
const dvf = await FileAttachment("data/dvf_communes.json").json();
const counts = await FileAttachment("data/fastfood_counts.json").json();
const crime = await FileAttachment("data/crime_communes.json").json();
const cibles = await FileAttachment("data/enseignes_cibles.geojson").json();
const fastfood = await FileAttachment("data/fastfood_osm.geojson").json();
```

<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">

# 🗺️ Explorer le Grand Paris

<a href="/en/" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇬🇧 English</a>
</div>

Activez une couche, cliquez une commune ou un point. **Une superposition n’est pas une preuve** : ces cartes sont descriptives. La délinquance n’est disponible qu’au niveau communal et s’affiche derrière un avertissement.

```js
// Precompute one value-map per metric.
const popById = new Map(crime.latest.map((r) => [r.code_commune, r.pop]));
const priceById = indexBy(dvf.latest, "code_commune", "median_prix_m2");
const crimeById = indexBy(crime.latest, "code_commune", "total_pour_mille");
const densById = new Map();
for (const c of counts.communes) {
  const pop = popById.get(c.code_commune);
  if (pop && c.n_fastfood != null) densById.set(c.code_commune, +((c.n_fastfood / pop) * 10000).toFixed(1));
}
const METRICS = {
  "Prix immobilier (€/m²)": { key: "prix", ramp: RAMPS.prix, values: priceById, unit: "€/m²", source: ["dvf"], level: "documenté",
    fmt: (v) => `${fmtInt(v)} €/m²`, legendFmt: (x) => Math.round(x).toLocaleString("fr-FR"), gated: false },
  "Densité de restauration rapide (pour 10 000 hab.)": { key: "dens", ramp: RAMPS.densite, values: densById, unit: "/10k hab", source: ["osm", "ssmsi"], level: "émergent",
    fmt: (v) => `${fmtNum(v)} /10k hab`, legendFmt: (x) => fmtNum(x), gated: false },
  "Délinquance enregistrée (commune)": { key: "crime", ramp: RAMPS.crime, values: crimeById, unit: "/1000 hab", source: ["ssmsi"], level: "documenté",
    fmt: (v) => `${fmtNum(v)} faits/1000 hab`, legendFmt: (x) => fmtNum(x), gated: true }
};
```

```js
const metricName = view(Inputs.radio(Object.keys(METRICS), { label: "Couche colorée", value: "Prix immobilier (€/m²)" }));
```
```js
const showCibles = view(Inputs.toggle({ label: "Points : enseignes-cibles poulet/crousti", value: true }));
const showFast = view(Inputs.toggle({ label: "Points : toute la restauration rapide (OSM)", value: false }));
```

```js
// Crime acknowledgement gate (idempotent across re-runs).
const crimeAck = Mutable(false);
const ackCrime = () => (crimeAck.value = true);
```

```js
// Build the map ONCE; wait for load so later blocks can repaint safely.
const mapEl = document.createElement("div");
mapEl.style = "height:560px;border-radius:.6rem;overflow:hidden;position:relative";
display(mapEl);
const map = createMap(mapEl, { center: [2.345, 48.86], zoom: 10.1 });
await new Promise((res) => map.on("load", res));
map.resize();
addChoropleth(map, {
  sourceId: "metric", geojson: communes,
  onClick: (e) => {
    const p = e.features[0].properties;
    const m = METRICS[metricName];
    new maplibregl.Popup().setLngLat(e.lngLat)
      .setHTML(`<b>${p.nom}</b><br>${p._v == null ? "donnée non diffusée" : m.fmt(p._v)}`).addTo(map);
  }
});
addPoints(map, { sourceId: "fast", geojson: fastfood, color: "#7a7a7a", radius: 2.5 });
addPoints(map, {
  sourceId: "cibles", geojson: cibles, color: "#c64b1e", radius: 6,
  onClick: (e) => {
    const p = e.features[0].properties;
    new maplibregl.Popup().setLngLat(e.geometry?.coordinates || e.lngLat)
      .setHTML(`<b>${p.name || "Enseigne"}</b><br>${(p.brand || "").replaceAll("_", " ")}<br><span style="color:#888;font-size:11px">${p.provenance}</span>`).addTo(map);
  }
});
pointVisible(map, "fast", false);
const legendHolder = document.createElement("div");
legendHolder.style = "position:absolute;bottom:8px;left:8px;z-index:2";
mapEl.appendChild(legendHolder);
```

```js
// Reactive repaint when metric / toggles / ack change.
{
  const m = METRICS[metricName];
  const blocked = m.gated && !crimeAck;
  if (blocked) {
    setChoroplethData(map, "metric", { type: "FeatureCollection", features: [] });
    legendHolder.innerHTML = "";
  } else {
    const { breaks } = paintChoropleth(communes, m.values, m.ramp, "code");
    setChoroplethData(map, "metric", communes);
    const lg = legend(metricName, breaks, m.ramp, { fmt: m.legendFmt, nodata: "non diffusé" });
    legendHolder.replaceChildren(lg);
  }
  pointVisible(map, "cibles", showCibles);
  pointVisible(map, "fast", showFast);
}
```

```js
// The gate UI (shown only when crime is selected but not yet acknowledged).
display((() => {
  const m = METRICS[metricName];
  if (!(m.gated && !crimeAck)) {
    const d = document.createElement("div");
    const meta = document.createElement("div");
    meta.style = "display:flex;gap:.5rem;align-items:center;margin:.4rem 0";
    meta.append(evidenceBadge(m.level, "fr"), sourceLine(m.source, datasets, "fr"));
    d.appendChild(meta);
    return d;
  }
  const g = document.createElement("div");
  g.className = "pq-gate";
  g.innerHTML = `<b>⚠ Donnée sensible — à lire avec précaution.</b>
    <p style="margin:.4rem 0;font-size:.9rem">La délinquance n’est disponible qu’au niveau <b>communal</b>. Elle décrit une commune entière — <b>jamais</b> un quartier, un commerce ou une population. Établir un lien avec un restaurant relèverait du <b>sophisme écologique</b>.</p>`;
  const btn = document.createElement("button");
  btn.textContent = "J’ai compris, afficher la couche";
  btn.style = "background:var(--pq-contest,#b23b3b);color:#fff;border:none;border-radius:.4rem;padding:.45rem .9rem;cursor:pointer;font-weight:600";
  btn.onclick = ackCrime;
  g.appendChild(btn);
  return g;
})());
```

<div class="pq-source">Couches — Prix : DVF (Etalab/DGFiP). Densité : comptage OpenStreetMap rapporté à la population INSEE (indicatif, non exhaustif). Délinquance : SSMSI, niveau communal. Points : OpenStreetMap + liste de référence. Fond : © IGN Géoplateforme.</div>

## Lire ces cartes honnêtement

- **Le prix** dépend d’abord des transports, des projets urbains et du bâti — pas de la restauration.
- **La densité de fast-foods** marque surtout une offre, pas des comportements ni des effets santé.
- **La délinquance communale** ne se découpe pas en quartiers : c’est un **contexte**, jamais une cause attribuable à un commerce.

➡️ **[Méthodes & limites](/methodes)** détaille chaque choix et chaque biais.

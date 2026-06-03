---
title: Mon quartier
toc: false
---

```js
import { evidenceBadge, sourceLine } from "./components/evidence.js";
import { fmtInt, fmtNum } from "./components/format.js";
import { createMap, addPoints, maplibregl } from "./components/maps.js";
import { withinRadius, depOf } from "./components/geo.js";
import { fetchBankruptcies, fetchCompany } from "./components/civic.js";
import { shareButton } from "./components/share.js";
import { BRAND_KEYS, BRAND_LABELS, NAMED_CHAINS, labelOf, colorOf, isNamed } from "./components/brands.js";
const registry = await FileAttachment("data/registry.json").json();
const datasets = registry.datasets;
const meta = await FileAttachment("data/fastfood_meta.json").json();
const survival = await FileAttachment("data/fastfood_survival.json").json();
// Static map of département shards (Framework needs literal FileAttachment calls).
const SHARDS = {
  "01": FileAttachment("data/fastfood/01.json"), "02": FileAttachment("data/fastfood/02.json"), "03": FileAttachment("data/fastfood/03.json"),
  "04": FileAttachment("data/fastfood/04.json"), "05": FileAttachment("data/fastfood/05.json"), "06": FileAttachment("data/fastfood/06.json"),
  "07": FileAttachment("data/fastfood/07.json"), "08": FileAttachment("data/fastfood/08.json"), "09": FileAttachment("data/fastfood/09.json"),
  "10": FileAttachment("data/fastfood/10.json"), "11": FileAttachment("data/fastfood/11.json"), "12": FileAttachment("data/fastfood/12.json"),
  "13": FileAttachment("data/fastfood/13.json"), "14": FileAttachment("data/fastfood/14.json"), "15": FileAttachment("data/fastfood/15.json"),
  "16": FileAttachment("data/fastfood/16.json"), "17": FileAttachment("data/fastfood/17.json"), "18": FileAttachment("data/fastfood/18.json"),
  "19": FileAttachment("data/fastfood/19.json"), "21": FileAttachment("data/fastfood/21.json"), "22": FileAttachment("data/fastfood/22.json"),
  "23": FileAttachment("data/fastfood/23.json"), "24": FileAttachment("data/fastfood/24.json"), "25": FileAttachment("data/fastfood/25.json"),
  "26": FileAttachment("data/fastfood/26.json"), "27": FileAttachment("data/fastfood/27.json"), "28": FileAttachment("data/fastfood/28.json"),
  "29": FileAttachment("data/fastfood/29.json"), "2A": FileAttachment("data/fastfood/2A.json"), "2B": FileAttachment("data/fastfood/2B.json"),
  "30": FileAttachment("data/fastfood/30.json"), "31": FileAttachment("data/fastfood/31.json"), "32": FileAttachment("data/fastfood/32.json"),
  "33": FileAttachment("data/fastfood/33.json"), "34": FileAttachment("data/fastfood/34.json"), "35": FileAttachment("data/fastfood/35.json"),
  "36": FileAttachment("data/fastfood/36.json"), "37": FileAttachment("data/fastfood/37.json"), "38": FileAttachment("data/fastfood/38.json"),
  "39": FileAttachment("data/fastfood/39.json"), "40": FileAttachment("data/fastfood/40.json"), "41": FileAttachment("data/fastfood/41.json"),
  "42": FileAttachment("data/fastfood/42.json"), "43": FileAttachment("data/fastfood/43.json"), "44": FileAttachment("data/fastfood/44.json"),
  "45": FileAttachment("data/fastfood/45.json"), "46": FileAttachment("data/fastfood/46.json"), "47": FileAttachment("data/fastfood/47.json"),
  "48": FileAttachment("data/fastfood/48.json"), "49": FileAttachment("data/fastfood/49.json"), "50": FileAttachment("data/fastfood/50.json"),
  "51": FileAttachment("data/fastfood/51.json"), "52": FileAttachment("data/fastfood/52.json"), "53": FileAttachment("data/fastfood/53.json"),
  "54": FileAttachment("data/fastfood/54.json"), "55": FileAttachment("data/fastfood/55.json"), "56": FileAttachment("data/fastfood/56.json"),
  "57": FileAttachment("data/fastfood/57.json"), "58": FileAttachment("data/fastfood/58.json"), "59": FileAttachment("data/fastfood/59.json"),
  "60": FileAttachment("data/fastfood/60.json"), "61": FileAttachment("data/fastfood/61.json"), "62": FileAttachment("data/fastfood/62.json"),
  "63": FileAttachment("data/fastfood/63.json"), "64": FileAttachment("data/fastfood/64.json"), "65": FileAttachment("data/fastfood/65.json"),
  "66": FileAttachment("data/fastfood/66.json"), "67": FileAttachment("data/fastfood/67.json"), "68": FileAttachment("data/fastfood/68.json"),
  "69": FileAttachment("data/fastfood/69.json"), "70": FileAttachment("data/fastfood/70.json"), "71": FileAttachment("data/fastfood/71.json"),
  "72": FileAttachment("data/fastfood/72.json"), "73": FileAttachment("data/fastfood/73.json"), "74": FileAttachment("data/fastfood/74.json"),
  "75": FileAttachment("data/fastfood/75.json"), "76": FileAttachment("data/fastfood/76.json"), "77": FileAttachment("data/fastfood/77.json"),
  "78": FileAttachment("data/fastfood/78.json"), "79": FileAttachment("data/fastfood/79.json"), "80": FileAttachment("data/fastfood/80.json"),
  "81": FileAttachment("data/fastfood/81.json"), "82": FileAttachment("data/fastfood/82.json"), "83": FileAttachment("data/fastfood/83.json"),
  "84": FileAttachment("data/fastfood/84.json"), "85": FileAttachment("data/fastfood/85.json"), "86": FileAttachment("data/fastfood/86.json"),
  "87": FileAttachment("data/fastfood/87.json"), "88": FileAttachment("data/fastfood/88.json"), "89": FileAttachment("data/fastfood/89.json"),
  "90": FileAttachment("data/fastfood/90.json"), "91": FileAttachment("data/fastfood/91.json"), "92": FileAttachment("data/fastfood/92.json"),
  "93": FileAttachment("data/fastfood/93.json"), "94": FileAttachment("data/fastfood/94.json"), "95": FileAttachment("data/fastfood/95.json"),
  "97": FileAttachment("data/fastfood/97.json")
};
```

<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">

# 🏘️ Mon quartier

<a href="/en/my-neighborhood" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇬🇧 English</a>
</div>

Tapez votre adresse : on regarde les **fast-foods autour de vous** — combien il y en a, lesquels ont **fermé** ou fait **faillite**, et **combien de temps ils tiennent** en moyenne. Données nationales (SIRENE), faillites en direct (BODACC). *La vie et la mort des commerces, mesurées honnêtement — pas un palmarès.*

```js
const address = view(Inputs.text({ value: "Mairie de Saint-Ouen", placeholder: "ex. 12 rue Albert-Dhalenne, Saint-Ouen", label: "Adresse ou ville", submit: "Localiser", width: 460 }));
```
```js
const radius = view(Inputs.range([250, 3000], { value: 1000, step: 250, label: "Rayon (mètres)" }));
```

```js
// Geocode (reactive on address) via the IGN Géoplateforme — address never stored.
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
// Load the département shard for the located commune and decode the positional tuples.
async function loadShops(citycode) {
  const dep = depOf(citycode);
  const fa = SHARDS[dep];
  if (!fa) return [];
  const raw = await fa.json();
  return raw.map((a) => ({ brand: BRAND_KEYS[a[0]], ferme: a[1] === 1, created: a[2], closed: a[3], lifespan: a[4], siren: a[5], commune: a[6], lon: a[7], lat: a[8] }));
}
const shopsAll = located?.citycode ? await loadShops(located.citycode) : [];
const near = located ? withinRadius(shopsAll, [located.lat, located.lon], radius) : [];
const active = near.filter((s) => !s.ferme);
const closed = near.filter((s) => s.ferme);
const enoughData = near.length >= 8;
```

```js
display(located
  ? html`<div class="pq-source">📍 ${located.label} — <b>${fmtInt(near.length)}</b> fast-foods dans un rayon de ${radius} m (${fmtInt(active.length)} ouverts, ${fmtInt(closed.length)} fermés).</div>`
  : html`<div class="pq-gate" style="border-color:var(--pq-emerg);background:#fdf8ee">Tapez une adresse puis « Localiser ».</div>`);
```

## La carte du quartier

```js
const mapEl = document.createElement("div");
mapEl.style = "height:460px;border-radius:.6rem;overflow:hidden;position:relative";
display(mapEl);
const map = createMap(mapEl, { center: [2.34, 48.86], zoom: 12 });
await new Promise((res) => map.on("load", res));
map.resize();
const fc = (shops) => ({ type: "FeatureCollection", features: shops.map((s) => ({ type: "Feature", geometry: { type: "Point", coordinates: [s.lon, s.lat] }, properties: { brand: s.brand, created: s.created, closed: s.closed } })) });
const popup = (e) => { const p = e.features[0].properties; new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<b>${isNamed(p.brand) ? labelOf(p.brand, "fr") : "Indépendant / autre"}</b><br>ouvert ${p.created || "?"}${p.closed ? " · fermé " + p.closed : ""}`).addTo(map); };
addPoints(map, { sourceId: "fermes", geojson: fc([]), color: "#9a9a9a", radius: 4, onClick: popup });
addPoints(map, { sourceId: "actifs", geojson: fc([]), color: "#1f7a4d", radius: 5, onClick: popup });
```
```js
// reactive repaint + recenter when the search/radius changes
{
  map.getSource("actifs")?.setData(fc(active));
  map.getSource("fermes")?.setData(fc(closed));
  if (located) {
    if (map._am) map._am.remove();
    map._am = new maplibregl.Marker({ color: "#c64b1e" }).setLngLat([located.lon, located.lat]).addTo(map);
    map.flyTo({ center: [located.lon, located.lat], zoom: radius < 800 ? 15 : radius < 1600 ? 14 : 13, speed: 1.4 });
  }
}
const legendBox = document.createElement("div");
legendBox.className = "pq-legend";
legendBox.style.cssText = "position:absolute;top:8px;left:8px;z-index:2";
legendBox.innerHTML = `<div class="row"><span style="color:#1f7a4d">●</span> ouvert</div><div class="row"><span style="color:#9a9a9a">●</span> fermé</div><div class="row"><span style="color:#c64b1e">▮</span> votre adresse</div>`;
mapEl.appendChild(legendBox);
```

<div class="pq-source">Établissements de restauration rapide (SIRENE, NAF 56.10C), géolocalisés (INSEE). Fond : © IGN Géoplateforme. ${sourceLine ? "" : ""}</div>

## En chiffres

```js
function tile(v, label, color = "#c64b1e") {
  return html`<div class="pq-kpi"><div class="v" style="color:${color}">${v}</div><div class="l">${label}</div></div>`;
}
const localMedian = (() => {
  const a = closed.map((s) => s.lifespan).filter((x) => x != null && x >= 0).sort((x, y) => x - y);
  return a.length ? +(a[Math.floor(a.length / 2)] / 365.25).toFixed(1) : null;
})();
const topBrand = (() => {
  const c = {};
  for (const s of near) if (s.brand !== "independant") c[s.brand] = (c[s.brand] || 0) + 1;
  const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return e ? e[0] : null;
})();
display(html`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.7rem;margin:.5rem 0">
  ${tile(fmtInt(near.length), "fast-foods recensés")}
  ${tile(fmtInt(active.length), "encore ouverts", "#1f7a4d")}
  ${tile(fmtInt(closed.length), "ont fermé", "#9a6210")}
  ${tile(localMedian != null ? localMedian + " ans" : "—", "durée de vie médiane (fermés)")}
  ${tile(topBrand ? labelOf(topBrand, "fr") : "—", "enseigne dominante")}
</div>`);
display(html`<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">${evidenceBadge("documenté", "fr")}${sourceLine("sirene_stock", datasets, "fr")}</div>`);
```

## Combien de temps tiennent-ils ? (courbe de survie)

```js
function computeKm(shops) {
  const now = new Date();
  const ageY = (ym) => { if (!ym) return null; const [y, m] = ym.split("-").map(Number); return (now - new Date(y, (m || 1) - 1, 1)) / (365.25 * 864e5); };
  const rows = shops.map((s) => ({ born: ageY(s.created), life: s.ferme && s.lifespan != null ? s.lifespan / 365.25 : null, ferme: s.ferme }));
  return [1, 3, 5, 10].map((t) => {
    const elig = rows.filter((r) => r.born != null && r.born >= t);
    const fail = elig.filter((r) => r.ferme && r.life != null && r.life < t);
    return { t, survival: elig.length ? 1 - fail.length / elig.length : null, n: elig.length };
  });
}
const localKm = enoughData ? computeKm(near).map((d) => ({ ...d, série: "Votre quartier" })) : [];
const natKm = survival.national.km.map((d) => ({ t: d.t, survival: d.survival, série: "France entière" }));
display(Plot.plot({
  height: 300, marginLeft: 50,
  y: { label: "% encore ouverts", domain: [0, 1], tickFormat: "%", grid: true },
  x: { label: "Âge (années)", domain: [1, 10], ticks: [1, 3, 5, 10] },
  color: { legend: true, domain: ["Votre quartier", "France entière"], range: ["#c64b1e", "#888"] },
  marks: [
    Plot.lineY(natKm, { x: "t", y: "survival", stroke: "série", strokeWidth: 2, strokeDasharray: "4 3", marker: "circle" }),
    localKm.length ? Plot.lineY(localKm, { x: "t", y: "survival", stroke: "série", strokeWidth: 2.5, marker: "circle" }) : null
  ].filter(Boolean)
}));
display(html`<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">${evidenceBadge("émergent", "fr")}${sourceLine("sirene_stock", datasets, "fr")}</div>`);
```

<div class="pq-source">Survie discrète : parmi les établissements assez vieux pour avoir pu atteindre l’âge t, part encore ouverte. ${!enoughData && located ? "<b>Trop peu d’établissements ici pour une courbe locale fiable — élargissez le rayon.</b> " : ""}Au niveau national, la durée de vie médiane des fast-foods <b>fermés</b> est de <b>${survival.national.median_life_years} ans</b> et <b>${Math.round((survival.national.km.find((k) => k.t === 5)?.survival || 0) * 100)} %</b> passent le cap des 5 ans.</div>

## Votre commune vs la France

```js
const com = located ? survival.communes.find((c) => c.code_commune === located.citycode) : null;
const benchRows = [
  { lieu: "Votre quartier", v: localMedian },
  com ? { lieu: "Votre commune", v: com.median_life_years } : null,
  { lieu: "France entière", v: survival.national.median_life_years }
].filter((r) => r && r.v != null);
display(benchRows.length ? Plot.plot({
  height: 160, marginLeft: 120, x: { label: "Durée de vie médiane des fermés (ans)", grid: true },
  marks: [Plot.barX(benchRows, { x: "v", y: "lieu", fill: "#c64b1e", sort: { y: "x" } }), Plot.text(benchRows, { x: "v", y: "lieu", text: (d) => d.v + " ans", dx: 16 })]
}) : html`<div class="pq-source">Donnée locale insuffisante.</div>`);
```

## Ouvertures et fermetures dans le temps

```js
const byYear = {};
for (const s of near) {
  const oy = s.created ? +s.created.slice(0, 4) : null;
  const cy = s.closed ? +s.closed.slice(0, 4) : null;
  if (oy) (byYear[oy] ??= { an: oy, ouvertures: 0, fermetures: 0 }).ouvertures++;
  if (cy) (byYear[cy] ??= { an: cy, ouvertures: 0, fermetures: 0 }).fermetures++;
}
const series = Object.values(byYear).filter((d) => d.an >= 2005).sort((a, b) => a.an - b.an);
display(series.length ? Plot.plot({
  height: 260, marginLeft: 40, x: { label: "Année", tickFormat: "d" }, y: { label: "Nombre", grid: true },
  color: { legend: true, domain: ["ouvertures", "fermetures"], range: ["#1f7a4d", "#b23b3b"] },
  marks: [
    Plot.barY(series.flatMap((d) => [{ an: d.an, t: "ouvertures", n: d.ouvertures }, { an: d.an, t: "fermetures", n: -d.fermetures }]), { x: "an", y: "n", fill: "t" }),
    Plot.ruleY([0])
  ]
}) : html`<div class="pq-source">Pas assez de données pour ce graphique.</div>`);
```

## Faillites recensées (BODACC, en direct)

```js
const sirens = near.map((s) => s.siren);
const bankruptcies = near.length ? await fetchBankruptcies(sirens) : new Map();
const failed = near.filter((s) => bankruptcies.has(s.siren));
display((() => {
  if (!near.length) return html`<div class="pq-source">—</div>`;
  if (!failed.length) return html`<div class="pq-source">Aucune procédure collective (liquidation, redressement) trouvée dans BODACC pour les établissements de ce rayon. <i>Une fermeture n’implique pas toujours une faillite, et inversement.</i></div>`;
  const items = failed.slice(0, 25).map((s) => {
    const evs = bankruptcies.get(s.siren) || [];
    const last = evs.sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
    const who = isNamed(s.brand) ? labelOf(s.brand, "fr") : `Indépendant — ${s.commune}`;
    return html`<li><b>${who}</b> · ${last?.nature || "procédure collective"} <span style="color:#888">(${last?.date || "?"})</span></li>`;
  });
  return html`<div><div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.3rem">${evidenceBadge("documenté", "fr")}${sourceLine("bodacc", datasets, "fr")}</div><ul style="columns:2;font-size:.9rem">${items}</ul></div>`;
})());
```

## Les doyens et les plus éphémères

```js
display((() => {
  if (!enoughData) return html`<div class="pq-source">Élargissez le rayon pour ce classement.</div>`;
  const named = (s) => (isNamed(s.brand) ? labelOf(s.brand, "fr") : `Indépendant — ${s.commune}`);
  const doyens = active.filter((s) => s.created).sort((a, b) => a.created.localeCompare(b.created)).slice(0, 5);
  const ephem = closed.filter((s) => s.lifespan != null && s.lifespan >= 0).sort((a, b) => a.lifespan - b.lifespan).slice(0, 5);
  const col = (title, rows, fmt) => html`<div class="pq-col"><h4>${title}</h4><ol style="font-size:.9rem">${rows.map((s) => html`<li>${named(s)} <span style="color:#888">${fmt(s)}</span></li>`)}</ol></div>`;
  return html`<div class="pq-contra">
    ${col("🏆 Doyens encore ouverts", doyens, (s) => "depuis " + (s.created?.slice(0, 4) || "?"))}
    ${col("💨 Les plus éphémères", ephem, (s) => "≈ " + Math.round(s.lifespan / 365.25 * 10) / 10 + " ans")}
  </div>`;
})());
```

<div class="pq-source">Par respect, les commerces <b>indépendants</b> ne sont jamais nommés (seuls la commune et les années sont affichés) ; seules les enseignes connues sont identifiées.</div>

## Les enseignes connues : qui sont-elles ?

```js
const namedNear = [...new Set(near.filter((s) => isNamed(s.brand)).map((s) => s.siren))].slice(0, 5);
const companies = namedNear.length ? (await Promise.all(namedNear.map((s) => fetchCompany(s)))).filter(Boolean) : [];
display((() => {
  if (!near.length) return html`<div class="pq-source">—</div>`;
  if (!companies.length) return html`<div class="pq-source">Aucune enseigne connue identifiée dans ce rayon (surtout des indépendants).</div>`;
  const rows = companies.map((c) => html`<li><b>${c.nom}</b> — ${c.n_etab_ouverts ?? "?"} établissements ouverts${c.tranche_effectif ? `, tranche d’effectif ${c.tranche_effectif}` : ""}. ${c.ca != null ? `<b>CA ${fmtInt(c.ca)} € (${c.exercice})</b>` : `<i>Chiffre d’affaires non public</i>`}</li>`);
  return html`<div><div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.3rem">${evidenceBadge("documenté", "fr")}${sourceLine("inpi_rne", datasets, "fr")}</div><ul style="font-size:.9rem">${rows}</ul></div>`;
})());
```

<div class="pq-source">⚠ ≈ 60 % des petites SARL/SAS déposent des comptes <b>confidentiels</b> : le chiffre d’affaires par commerce est le plus souvent indisponible. On affiche la taille (établissements, effectif) et le CA <b>seulement s’il est public</b>.</div>

## Partager

```js
display(shareButton(() => ({
  place: located?.label, radius, total: near.length, active: active.length, closed: closed.length,
  medianLife: localMedian, survival5: survival.national.km.find((k) => k.t === 5)?.survival,
  bankruptcies: failed.length, topBrandLabel: topBrand ? labelOf(topBrand, "fr") : null
}), "fr"));
```

## Ce que ces chiffres ne disent pas

<div class="pq-gate" style="border-style:solid;border-color:var(--pq-emerg);background:#fdf8ee">

- **Date de fermeture approchée.** Elle vient de la date de dernier traitement SIRENE (la date exacte des périodes d’état est un raffinement à venir) — les durées de vie sont donc des estimations.
- **Survie ≠ causalité.** Une courbe décrit une longévité observée ; elle ne dit pas *pourquoi* un commerce ferme, ni qu’un quartier « tue » les commerces.
- **Faillite ≠ fermeture.** Beaucoup de commerces cessent sans procédure ; certaines procédures ne mènent pas à la fermeture.
- **Source SIRENE, pas OpenStreetMap.** Cette page compte l’univers légal national (SIRENE) ; les chiffres diffèrent donc de la couche « restauration rapide » de l’[explorateur](/explorer) (OpenStreetMap, contributif).
- **NAF 56.10C** (restauration rapide) : toutes les enseignes, pas seulement le poulet. La scission 2026 (56.11J/56.12Y) n’est pas encore peuplée.

Détails dans **[Méthodes & limites](/methodes)**.
</div>

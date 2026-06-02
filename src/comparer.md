---
title: Comparer deux quartiers
toc: false
---

```js
import { sourceLine, evidenceBadge } from "./components/evidence.js";
import { fmtInt, fmtNum, fmtPrice } from "./components/format.js";
const registry = await FileAttachment("data/registry.json").json();
const datasets = registry.datasets;
const communes = await FileAttachment("data/communes_grandparis.geojson").json();
const dvf = await FileAttachment("data/dvf_communes.json").json();
const counts = await FileAttachment("data/fastfood_counts.json").json();
const crime = await FileAttachment("data/crime_communes.json").json();
```

<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">

# ⚖️ Comparer deux communes

<a href="/en/" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇬🇧 English</a>
</div>

Mettez deux communes côte à côte. Les valeurs manquantes signalent une **donnée non diffusée** (secret statistique) — jamais un zéro.

```js
const list = communes.features.map((f) => ({ code: f.properties.code, nom: f.properties.nom }))
  .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
const byCode = (arr) => new Map(arr.map((r) => [r.code_commune, r]));
const priceL = byCode(dvf.latest), countL = byCode(counts.communes), crimeL = byCode(crime.latest);
const seriesByCode = new Map();
for (const r of dvf.series) {
  if (!seriesByCode.has(r.code_commune)) seriesByCode.set(r.code_commune, []);
  seriesByCode.get(r.code_commune).push(r);
}
const pick = (code, def) => list.find((c) => c.code === code) || def;
```

```js
const A = view(Inputs.select(list, { label: "Commune A", format: (d) => d.nom, value: pick("93070") }));
```
```js
const B = view(Inputs.select(list, { label: "Commune B", format: (d) => d.nom, value: pick("93045") }));
```

```js
function metricRow(label, va, vb, fmt, { source, level, caveat, max } = {}) {
  const a = va, b = vb;
  const m = max ?? Math.max(a ?? 0, b ?? 0, 1);
  const bar = (v, align) => `<div style="background:var(--theme-foreground-faintest);border-radius:4px;height:10px;${align}"><div style="width:${v == null ? 0 : Math.round((v / m) * 100)}%;height:100%;background:var(--pq-accent);border-radius:4px;${align.includes('flex-end') ? 'margin-left:auto' : ''}"></div></div>`;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td style="text-align:right;font-weight:600;width:22%">${fmt(a)}</td>
    <td style="width:28%">${bar(a, 'display:flex;justify-content:flex-end')}</td>
    <td style="text-align:center;font-size:.8rem;color:var(--theme-foreground-muted);width:0">${label}</td>
    <td style="width:28%">${bar(b, 'display:flex')}</td>
    <td style="text-align:left;font-weight:600;width:22%">${fmt(b)}</td>`;
  return { tr, source, level, caveat, label };
}

const dens = (code) => {
  const c = countL.get(code), cr = crimeL.get(code);
  if (!c || !cr?.pop) return null;
  return +((c.n_fastfood / cr.pop) * 10000).toFixed(1);
};

const rows = [
  metricRow("Prix médian (€/m²)", priceL.get(A.code)?.median_prix_m2, priceL.get(B.code)?.median_prix_m2, (v) => v == null ? "—" : fmtPrice(v), { source: ["dvf"], level: "documenté" }),
  metricRow("Fast-foods recensés (OSM)", countL.get(A.code)?.n_fastfood, countL.get(B.code)?.n_fastfood, (v) => v == null ? "—" : fmtInt(v), { source: ["osm"], level: "émergent" }),
  metricRow("Densité /10 000 hab.", dens(A.code), dens(B.code), (v) => v == null ? "—" : fmtNum(v), { source: ["osm", "ssmsi"], level: "émergent" }),
  metricRow("Enseignes-cibles poulet/crousti", countL.get(A.code)?.n_cibles, countL.get(B.code)?.n_cibles, (v) => v == null ? "—" : fmtInt(v), { source: ["osm"], level: "émergent" }),
  metricRow("Délinquance /1000 hab. (commune)", crimeL.get(A.code)?.total_pour_mille, crimeL.get(B.code)?.total_pour_mille, (v) => v == null ? "—" : fmtNum(v), { source: ["ssmsi"], level: "documenté", caveat: "niveau communal — contexte, pas cause (sophisme écologique)" })
];

const wrap = document.createElement("div");
const head = document.createElement("div");
head.style = "display:flex;justify-content:space-between;font-weight:700;margin:.5rem 0";
head.innerHTML = `<span>${A.nom}</span><span>${B.nom}</span>`;
const table = document.createElement("table");
table.style = "width:100%;border-collapse:collapse";
const tbody = document.createElement("tbody");
for (const r of rows) {
  tbody.appendChild(r.tr);
  const meta = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = 5;
  td.style = "padding:0 0 .7rem 0;border-bottom:1px solid var(--theme-foreground-faintest)";
  const line = document.createElement("div");
  line.style = "display:flex;gap:.5rem;align-items:center;justify-content:center;flex-wrap:wrap";
  line.append(evidenceBadge(r.level, "fr"), sourceLine(r.source, datasets, "fr"));
  td.appendChild(line);
  if (r.caveat) {
    const c = document.createElement("div");
    c.className = "pq-source";
    c.style.textAlign = "center";
    c.textContent = "⚠ " + r.caveat;
    td.appendChild(c);
  }
  meta.appendChild(td);
  tbody.appendChild(meta);
}
table.appendChild(tbody);
wrap.append(head, table);
display(wrap);
```

### Tendance du prix au m²

```js
const sA = (seriesByCode.get(A.code) || []).map((r) => ({ ...r, lieu: A.nom }));
const sB = (seriesByCode.get(B.code) || []).map((r) => ({ ...r, lieu: B.nom }));
display(Plot.plot({
  height: 260, marginLeft: 56,
  y: { label: "€/m²", grid: true, tickFormat: (d) => d / 1000 + "k" },
  x: { label: "Année", tickFormat: "d" },
  color: { legend: true },
  marks: [Plot.lineY([...sA, ...sB], { x: "annee", y: "median_prix_m2", stroke: "lieu", strokeWidth: 2.5, marker: "circle" })]
}));
```

<div class="pq-source">Prix : DVF (Etalab/DGFiP). Une commune sans courbe = moins de 5 ventes par an (valeur masquée). La comparaison est descriptive : elle ne mesure aucun effet d’une enseigne.</div>

---
title: Sources & données
toc: false
---

```js
const registry = await FileAttachment("data/registry.json").json();
const datasets = registry.datasets;
```

<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">

# 📚 Sources & données

<a href="/en/" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇬🇧 English</a>
</div>

Toutes les données proviennent de **sources publiques ouvertes**, réutilisées sous **Licence Ouverte / Etalab 2.0** (OpenStreetMap : ODbL). Chaque chiffre du site renvoie à l’une de ces fiches.

```js
const cards = document.createElement("div");
cards.style = "display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:1rem;margin:1rem 0";
for (const d of Object.values(datasets)) {
  const card = document.createElement("div");
  card.className = "pq-kpi";
  card.style.gap = ".35rem";
  card.innerHTML = `
    <div style="font-weight:700;font-size:1rem">${d.name_fr}</div>
    <div class="pq-source" style="margin-top:0">${d.producer} · ${d.license}</div>
    <div style="font-size:.84rem;margin:.2rem 0"><b>Granularité :</b> ${d.grain}<br><b>Version :</b> ${d.version} · <b>Clé de jointure :</b> ${d.join_key}</div>
    <div style="font-size:.82rem;color:var(--theme-foreground-muted)">${d.coverage_note_fr}</div>
    <div style="margin-top:.3rem"><a href="${d.homepage}" target="_blank" rel="noopener">Accéder au jeu de données →</a></div>`;
  cards.appendChild(card);
}
display(cards);
```

## Reproductibilité

Le site est alimenté par un **pipeline de données reproductible** (Node + DuckDB) qui télécharge ces sources, les nettoie et publie des fichiers GeoJSON/JSON. Toute personne peut le rejouer et vérifier les chiffres. Les artefacts publiés (prix par commune, points de restauration, délinquance communale, contours) sont des **données ouvertes dérivées**, réutilisables aux mêmes conditions.

## Attribution

> Contient des données **Etalab / DGFiP** (DVF), **INSEE** (SIRENE, recensement), **SSMSI — Ministère de l’Intérieur** (délinquance), **IGN** (contours, fond de carte) et **© les contributeurs OpenStreetMap** (ODbL). Réutilisation sous Licence Ouverte / Etalab 2.0. Observatoire indépendant, non affilié à une enseigne.

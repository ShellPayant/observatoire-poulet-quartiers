---
title: Accueil
toc: false
---

```js
import { kpiCard, evidenceBadge } from "./components/evidence.js";
const summary = await FileAttachment("data/summary.json").json();
const registry = await FileAttachment("data/registry.json").json();
const datasets = registry.datasets;
```

<div style="display:flex;justify-content:flex-end"><a href="/en/" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇬🇧 English</a></div>

<div style="text-align:center;max-width:760px;margin:1rem auto 0">

# 🍗 Observatoire Poulet & Quartiers

<h2 style="font-weight:400;color:var(--theme-foreground-muted);margin-top:-.4rem">Des fast-foods de poulet à bas prix bouleversent-ils nos quartiers&nbsp;? <b>Les données ouvertes, l’avis libre.</b></h2>

</div>

L’affaire **Master Poulet** à Saint-Ouen (avril 2026) a transformé un restaurant de poulet braisé en débat national : gentrification contre demande populaire, « malbouffe » contre liberté d’entreprendre, immobilier, classe sociale, sécurité. Le débat déborde de chiffres assénés — sur les prix, les « déserts alimentaires », la délinquance, voire le blanchiment — mais **presque aucun n’est sourcé**, et plusieurs stigmatisent des quartiers populaires.

Cet observatoire **indépendant** rassemble les **données publiques réellement disponibles** (immobilier, restauration rapide, délinquance, contexte social) pour le **Grand Paris**, les cartographie honnêtement, **étiquette chaque affirmation** (documenté / émergent / contesté) — et vous laisse **vous faire votre propre opinion**.

```js
const strip = document.createElement("div");
strip.style = "display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.8rem;margin:1.5rem 0";
for (const k of summary.kpis) strip.append(kpiCard(k, datasets, "fr"));
display(strip);
```

<div class="pq-source" style="margin-top:-.6rem">Périmètre du MVP : ${summary.scope_fr}. Données arrêtées au millésime le plus récent disponible par source.</div>

## Trois façons d’explorer

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1rem;margin:.5rem 0 1rem">
  <a class="pq-modecard" href="/affaire-saint-ouen">
    <div style="font-size:1.6rem">📍</div>
    <b>L’affaire Saint-Ouen</b>
    <div style="font-size:.85rem;color:var(--theme-foreground-muted)">Le récit, la chronologie, le prix de l’immobilier et le débat — sur un cas concret, en deux colonnes (pour / objections).</div>
  </a>
  <a class="pq-modecard" href="/explorer">
    <div style="font-size:1.6rem">🗺️</div>
    <b>Explorer la carte</b>
    <div style="font-size:.85rem;color:var(--theme-foreground-muted)">Prix au m², densité de restauration rapide, enseignes-cibles, délinquance communale : activez les couches, cliquez une commune.</div>
  </a>
  <a class="pq-modecard" href="/comparer">
    <div style="font-size:1.6rem">⚖️</div>
    <b>Comparer deux quartiers</b>
    <div style="font-size:.85rem;color:var(--theme-foreground-muted)">Mettez deux communes côte à côte : prix, restauration rapide, contexte de délinquance.</div>
  </a>
  <a class="pq-modecard" href="/mon-quartier">
    <div style="font-size:1.6rem">🏘️</div>
    <b>Mon quartier <span class="pq-badge pq-badge--documenté" style="vertical-align:middle">nouveau</span></b>
    <div style="font-size:.85rem;color:var(--theme-foreground-muted)">Tapez votre adresse : combien de fast-foods autour de vous, lesquels ont fermé ou fait faillite, et combien de temps ils tiennent (toute la France).</div>
  </a>
</div>

## Comment lire ce site

Chaque chiffre porte une **étiquette de preuve**. C’est la règle de l’observatoire : ne jamais présenter une corrélation comme une cause, ni une rumeur comme un fait.

```js
const lg = document.createElement("div");
lg.style = "display:flex;flex-wrap:wrap;gap:1.2rem;align-items:flex-start;margin:.4rem 0";
const items = [
  ["documenté", "Fait établi et sourcé — donnée officielle ou fait de presse recoupé."],
  ["émergent", "Piste plausible mais non démontrée — à interpréter avec prudence."],
  ["contesté", "Affirmation discutée ou non étayée — présentée pour information, pas validée."]
];
for (const [lvl, desc] of items) {
  const row = document.createElement("div");
  row.style = "display:flex;gap:.5rem;align-items:flex-start;max-width:300px";
  const b = evidenceBadge(lvl, "fr");
  const d = document.createElement("div");
  d.style = "font-size:.82rem;color:var(--theme-foreground-muted)";
  d.textContent = desc;
  row.append(b, d);
  lg.append(row);
}
display(lg);
```

> **Neutralité.** Cet observatoire n’est affilié à aucune enseigne ni à aucun élu. Un dossier de soutien à Master Poulet a servi de matière première : il est cité **uniquement comme la position d’une partie**, jamais comme la voix du site. Voir [Méthodes & limites](/methodes) et [Sources & données](/sources).

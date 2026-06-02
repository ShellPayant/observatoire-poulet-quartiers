---
title: "Débat : blanchiment ?"
toc: false
---

```js
import { evidenceBadge } from "../components/evidence.js";
```

<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">

# 💶 Le débat sur le « blanchiment »

<a href="/en/" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇬🇧 English</a>
</div>

Une rumeur tenace accompagne les fast-foods à forte intensité de liquide : ils « serviraient à blanchir de l’argent ». Parce que c’est une accusation grave et facile à coller à des commerces tenus par des entrepreneurs souvent issus de l’immigration, l’observatoire la traite **frontalement** — en séparant ce qui est **prouvé** de ce qui relève de la **rumeur**. Et nous **n’en faisons aucune carte** : il n’existe aucune donnée publique attribuant ce délit à un commerce précis.

```js
const rows = [
  ["documenté", "Le risque général est réel.", "La littérature anti-blanchiment reconnaît que les commerces à forte intensité de liquide (restauration rapide comprise) sont, en théorie, exposés : recettes difficiles à auditer, modèle en franchise. C’est un constat sectoriel mondial, pas une accusation."],
  ["contesté", "Aucune affaire visant ces enseignes n’est établie.", "Aucune enquête judiciaire publique ne vise Master Poulet ou Tasty Crousti pour blanchiment. L’absence de preuve n’est ni une preuve de culpabilité, ni une preuve d’innocence — c’est une absence de preuve."],
  ["émergent", "Pourquoi la rumeur prospère.", "Expansion rapide, marketing viral, clientèle jeune, propriétaires issus de l’immigration, certification halal, concentration en quartiers populaires : ce faisceau alimente le soupçon. Ce sont des conditions de suspicion — pas des faits."],
  ["documenté", "Ce qu’il faudrait pour l’affirmer.", "Une affirmation crédible exigerait une enquête, des comptes, une décision de justice. Sans cela, répéter l’accusation, c’est diffuser une rumeur — exactement ce que cet observatoire refuse de faire."]
];
const wrap = document.createElement("div");
wrap.style = "display:grid;gap:.8rem;margin:1rem 0";
for (const [lvl, title, body] of rows) {
  const card = document.createElement("div");
  card.className = "pq-arg " + (lvl === "contesté" ? "con" : "pro");
  const head = document.createElement("div");
  head.style = "display:flex;gap:.5rem;align-items:center;flex-wrap:wrap";
  const b = document.createElement("b");
  b.textContent = title;
  head.append(b, evidenceBadge(lvl, "fr"));
  const d = document.createElement("div");
  d.style = "font-size:.9rem;color:var(--theme-foreground-muted);margin-top:.3rem";
  d.textContent = body;
  card.append(head, d);
  wrap.appendChild(card);
}
display(wrap);
```

## En résumé

Le risque structurel des activités en liquide est **documenté** ; son application à **ces enseignes précises** est **non démontrée**. Tant qu’aucune procédure ne l’établit, l’observatoire s’en tient aux terrains solides : le **prix de l’immobilier**, l’**environnement alimentaire**, et le **récit juridique et politique** de l’affaire. Le reste appartient au débat public — pas aux données.

<div class="pq-source">Cadre : littérature anti-blanchiment (risque sectoriel des activités cash-intensives). Aucune source publique n’établit d’affaire de blanchiment contre Master Poulet ou Tasty Crousti à la date de cette page. Voir <a href="/methodes">Méthodes &amp; limites</a>.</div>

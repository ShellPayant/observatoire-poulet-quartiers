---
title: Méthodes & limites
toc: true
---

```js
import { evidenceBadge } from "./components/evidence.js";
```

<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">

# 🧭 Méthodes & limites

<a href="/en/methodes" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇬🇧 English</a>
</div>

Cet observatoire applique une règle simple : **ne jamais présenter une corrélation comme une cause, ni une rumeur comme un fait.** Voici comment chaque chiffre est fabriqué, et ce qu’il permet — ou non — de dire.

## Les étiquettes de preuve

```js
const lg = document.createElement("div");
lg.style = "display:grid;gap:.6rem;margin:.4rem 0";
for (const [lvl, desc] of [
  ["documenté", "Fait établi et sourcé : donnée officielle (Etalab, INSEE, SSMSI, IGN) ou fait de presse recoupé."],
  ["émergent", "Piste plausible mais non démontrée en France : à interpréter avec prudence, jamais comme une preuve."],
  ["contesté", "Affirmation discutée, partielle ou non étayée : présentée pour information, explicitement non validée."]
]) {
  const row = document.createElement("div");
  row.style = "display:flex;gap:.6rem;align-items:flex-start";
  const d = document.createElement("div");
  d.style = "font-size:.88rem";
  d.textContent = desc;
  row.append(evidenceBadge(lvl, "fr"), d);
  lg.appendChild(row);
}
display(lg);
```

## Le glossaire des pièges

**Corrélation ≠ causalité.** Deux phénomènes qui varient ensemble ne s’expliquent pas forcément l’un l’autre. Une carte qui superpose « fast-foods » et « prix bas » ne prouve aucun effet.

**Causalité inverse (effet de sélection).** Le sens du lien est souvent l’inverse de l’intuition : la restauration à bas prix s’implante là où les **loyers sont déjà bas**, parce que c’est moins cher — pas l’inverse. Attribuer la baisse des prix à l’enseigne, c’est confondre la cause et la conséquence.

**Sophisme écologique.** Déduire une caractéristique d’un individu (ou d’un quartier, ou d’un commerce) à partir d’une moyenne de zone. Notre délinquance est **communale** : l’appliquer à un quartier ou à un restaurant serait un sophisme écologique.

**MAUP (problème des unités spatiales modifiables).** Les résultats changent selon le découpage choisi (commune, IRIS, rayon de 300 m…). Nous publions chaque donnée **à sa maille d’origine**, sans inventer de zone intermédiaire.

**Autocorrélation spatiale (indice de Moran).** Prix et délinquance se ressemblent entre voisins : ce n’est pas indépendant. Toute analyse causale sérieuse doit le corriger — ce que des cartes descriptives ne font pas, d’où leur statut purement descriptif.

**Secret statistique.** L’INSEE et le SSMSI masquent les valeurs des très petites zones. Chez nous, une valeur masquée reste **« non diffusée »** — **jamais** remplacée par zéro.

## Comment chaque couche est fabriquée

### Prix immobilier (DVF) ${evidenceBadge("documenté","fr")}
**Source :** DVF géolocalisé (Etalab/DGFiP). **Traitement :** ventes d’appartements et maisons uniquement ; prix au m² = valeur foncière ÷ surface bâtie ; valeurs aberrantes écrêtées à [500, 25 000] €/m² ; **médiane** par commune et par année, publiée seulement à partir de **5 ventes**. **On peut dire :** « le prix médian observé à Saint-Ouen est de X €/m² ». **On ne peut pas dire :** « tel commerce a fait varier les prix ».
*Exclut l’Alsace-Moselle, les ventes en l’état futur d’achèvement (neuf) et les donations.*

### Densité de restauration rapide ${evidenceBadge("émergent","fr")}
**Source :** OpenStreetMap (`amenity=fast_food`), rapporté à la population INSEE. **Limite majeure :** OSM est **contributif et non exhaustif** — il sous-estime probablement le nombre réel. La base officielle (INSEE SIRENE, code NAF 56.10C) est devenue en avril 2026 un fichier national de ~0,8 Go nécessitant une jointure lourde : son intégration est prévue pour la **version nationale**. **On peut dire :** « OSM recense N points ». **On ne peut pas dire :** « il y a exactement N fast-foods », ni en déduire un effet sur la santé.

### Délinquance (SSMSI) ${evidenceBadge("documenté","fr")}
**Source :** bases communales SSMSI (police + gendarmerie). **Contrainte dure :** disponible **uniquement au niveau communal** — jamais infra-communal. L’indice global affiché est la somme de toutes les catégories rapportée à la population (les unités de compte étant hétérogènes, c’est un repère, pas une mesure exacte). **Affichée derrière un avertissement** : contexte, jamais cause attribuable à un commerce ou à une population.

### Identification des enseignes-cibles ${evidenceBadge("émergent","fr")}
**Sources combinées :** liste de référence (le restaurant emblématique de Saint-Ouen) + correspondance de marque OpenStreetMap. Chaque point porte une **provenance** (`seed` / `osm_brand`). SIRENE ne contient pas l’enseigne commerciale : impossible d’y lire « Master Poulet ». La couverture est donc **partielle** et **datée** (ces chaînes ouvrent vite).

### « Devinez puis comparez » ${evidenceBadge("documenté","fr")}
Une invitation à confronter votre intuition aux données réelles. Le graphe révélé est **strictement descriptif** : il ne mesure aucun effet de l’enseigne.

### Mon quartier : survie, fermetures & faillites ${evidenceBadge("documenté","fr")}
**Sources :** base **SIRENE** (INSEE) pour la création, l’état (actif/fermé) et l’enseigne de chaque établissement de restauration rapide (NAF 56.10C) — ~430 000 au niveau national, géolocalisés ; **BODACC** (interrogé en direct) pour les procédures collectives (faillites) ; **Annuaire des Entreprises** pour la taille des enseignes connues. **Survie :** méthode discrète façon Kaplan-Meier (parmi les établissements assez vieux pour avoir pu atteindre l’âge t, part encore ouverte) — **étiquetée « émergent »** car descriptive. **Limites assumées :** la **date de fermeture** est approchée (dernier traitement SIRENE) ; **faillite ≠ fermeture** ; les **indépendants ne sont jamais nommés** ; le **chiffre d’affaires** est rarement public (≈ 60 % de comptes confidentiels) ; couverture **SIRENE** (univers légal), différente de la couche **OpenStreetMap** de l’explorateur.

## Ce que nous avons délibérément refusé de faire

- **Aucune carte du « blanchiment ».** Le risque général des activités à forte intensité de liquide est documenté, mais **aucune affaire visant ces enseignes n’est établie**. Voir [Débat : blanchiment ?](/debats/blanchiment).
- **Aucun cadrage « grand remplacement » / identitaire.** Le halal n’apparaît que comme description factuelle de l’affaire.
- **Aucun titre causal.** Pas de « les fast-foods font baisser les prix » ni « augmentent la délinquance ».

## Feuille de route (transparence)

| Version | Ajouts prévus |
|---|---|
| **v1 — national** | SIRENE 56.10C (univers légal), revenus/pauvreté Filosofi (IRIS), QPV, échelle France |
| **v2 — inférentiel** | Étude d’événement (*difference-in-differences*) autour d’une ouverture, **avec intervalles de confiance** et avertissement de causalité inverse — jamais en page d’accueil |

> Une erreur, une donnée à corriger ? Voir [À propos](/a-propos). Les données sont datées : toute affirmation est horodatée par son millésime.

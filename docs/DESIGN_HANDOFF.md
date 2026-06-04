# Handoff — Refonte « marbre & or » de l'Observatoire Poulet & Quartiers

> **Pour le développeur (toi ou Claude Code).** Ce dossier contient des **maquettes de référence en HTML/CSS/JS vanilla**. Ce ne sont **pas** des fichiers à copier tels quels dans le repo. La tâche est de **recréer ces designs dans l'environnement existant du repo** — `ShellPayant/observatoire-poulet-quartiers`, qui tourne sous **Observable Framework** (pages Markdown `src/*.md` + composants `src/components/*.js`) — en respectant ses patterns établis.

---

## 1. Vue d'ensemble

Refonte visuelle et UX complète de l'observatoire. Deux objectifs :
1. **Une direction artistique forte** — « marbre & or antique » néoclassique : on donne à un sujet populaire/viral (la « guerre du poulet ») la gravité d'une institution, sans condescendance.
2. **Rendre le produit user-friendly** — carte lisible, étiquettes de preuve claires, portail de délinquance respectueux, et intégration de la nouvelle fonction **« Mon quartier »**.

Le tout est **bilingue FR/EN**, **clair/sombre**, sans cookie ni pisteur, et chaque chiffre est sourcé.

## 2. Fidélité

**Haute fidélité (hifi).** Couleurs, typographies, espacements et interactions sont définitifs. Recréer pixel-perfect en portant les valeurs vers le thème Observable. Les tokens sont déjà centralisés (voir §6) — c'est la pièce maîtresse à porter en premier.

## 3. Architecture cible (Observable Framework)

| Maquette HTML (ce dossier) | Cible dans le repo |
|---|---|
| `index.html` | `src/index.md` |
| `explorer.html` + `assets/explorer.js` | `src/explorer.md` |
| `affaire-saint-ouen.html` + `assets/affaire.js` | `src/affaire-saint-ouen.md` |
| `mon-quartier.html` + `assets/quartier.js` + `assets/quartier-data.js` | nouvelle page `src/mon-quartier.md` |
| `systeme.html` | `src/a-propos.md` / page méthodes, ou un `src/systeme.md` dédié |
| `assets/tokens.css` | thème global — `observablehq.config.js` `head` + un `src/style.css` importé, ou `src/components/theme.css` |
| `assets/site.js` | petit module global chargé dans le `head` (toggles thème/langue, scroll-reveal) |

**Important sur le porting de données :** mes maquettes utilisent un **échantillon de démonstration** (`assets/quartier-data.js`, 3 quartiers) **calé sur le schéma de shard réel**. En production, `mon-quartier.md` doit lire les vrais shards `src/data/fastfood/<dep>.json` via `FileAttachment`, pas mon échantillon. Le schéma de tuple est respecté à l'identique (voir §7).

## 4. Pages / écrans

### 4.1 Accueil (`index.html` → `src/index.md`)
- **Hero monumental** : grille 2 colonnes. À gauche, eyebrow + H1 display serif avec le mot « monument » en dégradé doré animé (`.gild`), sous-titre, 2 CTA, 3 gages de confiance. À droite, **image encadrée** (cadre doré dégradé + passe-partout) de la photo portique, avec **parallaxe douce au scroll** (translateY 0.08×), **balayage de lumière** animé (`.frame__sweep`, `@keyframes sweep`), et une **plaque dorée** chiffrée en débord (6 399 €/m²). Sous le hero, une bande de **frise sculptée** (`.frieze-strip`).
- **Bandeau KPI** : grille de 8 cartes `.kpi`. Chaque carte = valeur display, libellé, éventuel `.kpi__caveat` (mise en garde ambrée), badge de preuve, et bouton « source » qui déplie la ligne de source (caché par défaut). Données dans le tableau `KPIS` en bas de `index.html`.
- **« La règle de la maison »** : 3 cartes expliquant les étiquettes de preuve (documenté / émergent / contesté), chacune avec glyphe + couleur.
- **4 modes** : grille 2×2. La 1re carte (`.mode--feat`) est **mise en avant** (bord doré, fond dégradé, badge « Nouveau ») → Mon quartier. Puis Affaire Saint-Ouen, Explorer, Comparer.
- **Note de neutralité** : encart ambré rappelant l'indépendance.

### 4.2 Explorer la carte (`explorer.html` → `src/explorer.md`)
- **Rail de contrôles** (gauche, 320px) : sélecteur de **couche colorée** segmenté (Prix / Densité / Délinquance — chacun avec son dégradé d'aperçu) ; **toggles de points** (enseignes-cibles, toute la restauration rapide) ; métadonnées de couche (badge de preuve + source).
- **Scène carte** : tuiles communales **projetées depuis des coordonnées réelles** (pas une vraie tuile raster — un fond schématique). Aides d'orientation ajoutées pour la lisibilité : **labels de département** en filigrane, **communes-repères nommées**, **épingle sur Saint-Ouen** (le protagoniste), **boussole**. Bande de **Seine** pour le repère.
- **Légende flottante** : titre, **mots qualitatifs aux extrémités** (← moins cher · plus cher →), échelle 5 paliers, bornes chiffrées, mention « non diffusé », et indice « cliquez une case ».
- **Interactions** : survol → tooltip ; clic → **popup** (avec gestion des bords : flip + clamp) ; recherche d'adresse (filtre communes) ; **portail de délinquance** (modal de consentement avant d'afficher la couche crime — voir §5).
- **Mobile** : le rail devient un **tiroir** (bottom sheet) déclenché par un bouton flottant.
- **Crime = ardoise, jamais rouge** (anti-stigmate, choix délibéré).

### 4.3 L'affaire Saint-Ouen (`affaire-saint-ouen.html` → `src/affaire-saint-ouen.md`)
- **Hero** plein cadre sur l'image de colonnes, scrim dégradé.
- **Scrollytelling** : grille 2 colonnes. Figure **sticky** à gauche (machine à états : timeline → graphe prix → graphe délinquance) ; étapes de texte à droite qui pilotent l'état via `IntersectionObserver` (rootMargin -45%/-45%). Les graphes sont en SVG, dessinés depuis les vraies séries (`PRICE`, `CRIME_SO` dans `affaire.js`).
- **« Dessinez votre estimation »** : SVG interactif — l'utilisateur fait glisser le point 2024, lit son estimation + variation, puis « Révéler la donnée réelle » trace la vraie courbe (−9 %).
- **Débat pour / objections** : 2 colonnes à parts égales, chaque argument avec son badge de preuve + une note rappelant que le « pour » vient d'un dossier de soutien (position d'une partie, pas la voix du site).
- **« Ce que ces données ne disent pas »** : 3 cartes de garde-fous.

### 4.4 Mon quartier (`mon-quartier.html` → nouvelle `src/mon-quartier.md`) — **LA nouvelle fonction**
- **Hero + barre de recherche** : champ d'adresse + puces d'exemples + zone de statut.
- **Géocodage** (`geocode()` dans `quartier.js`) : presets d'abord (démo déterministe — plusieurs « Saint-Ouen » existent en France), puis **IGN live** (`https://data.geopf.fr/geocodage/search`) pour toute autre adresse, avec timeout + repli gracieux.
- **Résultats** : 6 tuiles stats (total / ouverts / fermés / durée de vie médiane / survie à 5 ans / faillites BODACC) ; **courbe de survie** (quartier vs commune vs France, Kaplan-Meier discret — `survivalCurve()`) ; **répartition par enseigne** (couleurs de marque, tag « enseigne » pour les chaînes, indépendants jamais nommés) ; **cartes de fermetures** (faillites BODACC mises en évidence) ; note d'honnêteté.
- **Faillites BODACC en direct** (`fetchBankruptcies()`) : requête par SIREN sur l'API ODS de la DILA, par lots, avec timeout et dégradation gracieuse.
- **Curseur de rayon** : 200–1500 m, recalcule tout.
- **Carte partageable** : `buildCard()` dessine un canvas **1200×630** (ratio OG) en bronze + marbre, téléchargeable en PNG.
- **Deep-link** : `?q=<adresse>` lance l'analyse au chargement.

### 4.5 Système / méthodes (`systeme.html`)
Planche du design system : identité + note de DA, palette (neutres + accent + preuve + 3 rampes de carte), typographie (3 specimens), composants (badges, boutons, carte KPI, ligne de source, filet doré, mouvement), règles de méthode, et registre des sources.

## 5. Interactions & comportements clés

- **Toggle thème** (`site.js`) : `data-theme="dark"` sur `<html>`, persisté en `localStorage['pq-theme']`.
- **Toggle langue** (`site.js`) : swap du texte via attributs `data-fr`/`data-en` ; pour le HTML riche (ex. le H1 doré), `data-fr-html`/`data-en-html`. Persisté en `localStorage['pq-lang']`.
- **Scroll-reveal** (`site.js`) : classe `.reveal` → `.in` via `IntersectionObserver` ; classes de délai `.reveal-d1…d4`. Neutralisé sous `prefers-reduced-motion` et si pas de JS.
- **Portail de délinquance** (`explorer.js`) : sélectionner la couche crime ouvre un `alertdialog` ; tant que l'utilisateur n'a pas consenti (`ackCrime`), la couche est masquée et la valeur crime des popups affiche « masqué · gate ». Rappelle le **sophisme écologique** (donnée communale, jamais un quartier).
- **Mouvement** : parallaxe hero, balayage de lumière, chatoiement doré du titre, reveals — **tous désactivés** sous `prefers-reduced-motion`.

## 6. Design tokens (extrait — source complète : `assets/tokens.css`)

**Polices :** display = **Newsreader** (serif éditorial) · UI/données = **Public Sans** · mono/étiquettes = **IBM Plex Mono**.

**Clair (défaut) :**
```
--paper:#F2E8D6  --surface:#FBF5E9  --surface-2:#EBDFC9  --surface-3:#E1D2B6
--ink:#241B0F    --ink-2:#6B5B40    --ink-3:#9B8A6C
--line:#DDCEB0   --line-2:#C9B791
--accent:#A97C28 (or antique)  --accent-strong:#846017 (AA texte)  --accent-deep:#5A4310
--accent-soft:#EBDBB6  --accent-tint:#F4E9D2  --gold:#C49A3E  --gold-lo:#8A6A2E
--on-accent:#FBF5E9
```
**Preuve (toujours couleur + glyphe, colorblind-safe) :**
```
documenté ✓ → --doc:#3F7A4E (vert-de-gris)
émergent  ~ → --eme:#97701A (or)
contesté  ! → --con:#A33B2B (rouge pompéien)
```
**Rampes de carte (5 paliers) :** `--prix-0..4` (or→terracotta), `--dens-0..4` (vert-de-gris), `--crim-0..4` (**ardoise, jamais rouge**). `--nodata:#E2D8C2`.

**Sombre :** bloc `[data-theme="dark"]` — « après l'heure au musée », charcoal-bronze, or plus vif (`--accent:#D2A24A`, `--gold:#E6C168`). Toutes les variables ont leur équivalent sombre.

**Rayons :** 4 / 8 / 12 / 18 / 26 px + pill. **Ombres :** 3 niveaux chauds. **Largeur max :** 1180px (prose 720).

**Motifs classiques :** `.rule-gold` (filet doré à ornement central), `.gilt` (filet dégradé), `.marble` (texture veinée), `.gild` (texte doré animé), `@keyframes sweep` (balayage de lumière).

## 7. Schéma de données « Mon quartier » (à respecter pour le port)

Tuple de shard (mirroir du repo, voir `pipeline/22_sirene_ff.js`) :
```
[brand_index, ferme01, creation_YYYYMM, fermeture_YYYYMM, lifespan_jours, siren, code_commune, lon, lat]
```
`brand_keys` (index) : `['master_poulet','tasty_crousti','pb_poulet_braise','chik_chill','kfc','chicken_autre','poulet_autre','independant']`. Les 5 premiers sont des **enseignes nommables** ; les autres (dont `independant`) ne sont **jamais nommés** (RGPD).

Benchmarks de survie réels embarqués (national + communes) dans `quartier-data.js` → en prod, recalculer depuis les shards. Chiffres d'ancrage : national 393 015 établissements / 91,6 % survie 5 ans ; Saint-Ouen (93070) 255 ouverts / 312 fermés / médiane 9,3 ans / 90,9 % à 5 ans.

## 8. Assets

Toute l'imagerie classique est **dérivée d'une seule photo de référence** fournie par l'utilisateur (`assets/img/portico.png`), recadrée en : `hero.png` (portique), `columns.png`, `floor.png`, `frieze.png`. **À remplacer idéalement par de vraies photographies sous licence** en production. Polices via Google Fonts (Newsreader, Public Sans, IBM Plex Mono).

## 9. Accessibilité & garde-fous (à préserver impérativement)
- Preuve = **couleur + glyphe** (jamais la couleur seule).
- Délinquance = **ardoise** + portail de consentement + rappel du sophisme écologique. Jamais rouge, jamais à l'échelle d'un quartier.
- Indépendants **jamais nommés**. `null` ≠ `0` (secret statistique = « non diffusé »).
- Cibles tactiles ≥ 44px. `prefers-reduced-motion` respecté partout.
- Aucun cookie, aucun pisteur. Géocodage et BODACC = appels directs aux API publiques, rien n'est stocké.

## 10. Fichiers de ce bundle
```
index.html                 — accueil
explorer.html              — carte
affaire-saint-ouen.html    — scrollytelling
mon-quartier.html          — Mon quartier (nouvelle fonction)
systeme.html               — design system / méthodes
assets/tokens.css          — TOKENS (à porter en premier)
assets/site.js             — toggles thème/langue, scroll-reveal
assets/explorer.js         — logique carte
assets/affaire.js          — scrollytelling + graphes + draw-your-guess
assets/quartier.js         — géocodage, survie, BODACC, carte partageable
assets/quartier-data.js    — échantillon de démo (schéma shard réel) — à remplacer par les vrais shards
assets/img/                — recadrages de la photo de référence
```

# CLAUDE.md — working notes for this repo

Civic open-data observatory on low-cost fast-food chicken chains in Greater Paris. Read `README.md` first. This file captures conventions so a future session can extend the site safely.

## Architecture (one-liner)
Node + DuckDB pipeline downloads public open data → publishes flat GeoJSON/JSON into `src/data/` → Observable Framework static site renders maps (MapLibre) + charts (Plot) from those files. No server, no DB at runtime.

## Layout
- `pipeline/*.js` — data stages (ESM, run with `node`). `lib/db.js` (DuckDB helpers, BigInt→Number), `lib/util.js` (paths, fetch, scope constants). Outputs go to `src/data/`.
- `src/*.md` — FR pages; `src/en/*.md` — EN mirror (imports use `../components`, FileAttachment uses `../data`).
- `src/components/*.js` — `evidence.js` (badges/source lines/KPI cards), `maps.js` (MapLibre helpers), `format.js` (fr/en formatting), `i18n.js` (label dictionary `t(lang,key)`).
- `src/data/registry.json` — hand-maintained dataset metadata; drives `/sources` and every `sourceLine`.
- `data/seed/enseignes_cibles.csv` — high-trust chain seed (the Saint-Ouen flagship).

## Non-negotiable conventions
1. **Evidence label on every number.** Use `evidenceBadge(level, lang)` and `sourceLine(sourceId, datasets, lang)`. Levels are the FR canon: `documenté | émergent | contesté`.
2. **Suppressed/secret values are `null`, never `0`.** Enforced in `32_crime.js` (SSMSI `est_diffuse`) and DVF (N≥5). UI shows "non diffusé".
3. **Crime stays commune-level, behind the ecological-fallacy gate** (`explorer.md`). Never disaggregate, never attribute to a shop or population.
4. **Aggregate up, never fabricate down.** Spatial joins (DuckDB `spatial`, `ST_Within`) assign points to communes; no invented sub-zones (MAUP).
5. **FR is primary; mirror new pages under `src/en/`** and register in `observablehq.config.js` `pages`.
6. **The dossier is one party's position**, surfaced only in the case-study pro/contra — never the site's voice.

## Data-source gotchas (already discovered)
- **DVF**: `files.data.gouv.fr/geo-dvf/latest/csv/{year}/departements/{dep}.csv.gz`. "latest" has **2021–2024** (no 2020). Paris uses **arrondissement codes 75101–75120** (not 75056) — geometry must match (Paris OpenData arrondissements).
- **GeoSirene (Etalab) decommissioned 04/2026** → INSEE geolocation parquet (0.8 GB, geolocation only, no NAF/name). 56.10C universe deferred; OSM used instead.
- **SSMSI** commune parquet: column is `indicateur` (not `classe`); `est_diffuse='diff'` means published. Years 2016–2025.
- **Overpass** needs a `User-Agent` + `Accept` header (else 406); rotate endpoints on 429. Result cached in `data/raw/osm_fastfood.json`.
- **Geocoding**: legacy `api-adresse.data.gouv.fr` decommissioned ~01/2026 → use `data.geopf.fr/geocodage`.
- DuckDB returns **BigInt** for integer columns → `normalize()` in `lib/db.js`; JSON via `bigintReplacer`.

## Map pattern (`maps.js`)
GeoJSON choropleth without vector tiles: `paintChoropleth()` mutates `_color`/`_v` on features by quantile class, then `setChoroplethData()` calls `source.setData()`. Create the map **once** (await `map.on('load')`), then a separate reactive block repaints on input change. Points via `addPoints` + `pointVisible`.

## Verify
`npm run build` (compile/link check, must end "links validated") then `node test/smoke.mjs` (headless Chrome; must print "11/11 pages clean"). Sanity: pipeline log must show Saint-Ouen ≈ 6 399 €/m².

## Extending
- **New commune metric** → add a value-map in `explorer.md` `METRICS` + a registry source. Keep the same legend/badge pattern.
- **New layer from a new dataset** → add a `pipeline/NN_*.js` stage writing to `src/data/`, a `registry.json` entry, and load via `FileAttachment`.
- **National scale-up** → switch `DEPARTEMENTS`/`DVF_YEARS` in `lib/util.js`; at national volume, move choropleths to **PMTiles** (tippecanoe) instead of raw GeoJSON.

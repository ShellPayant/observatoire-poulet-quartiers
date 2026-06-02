// Stage 20 — fast-food layer + target-chain identification (Grand Paris).
//
// Source of brand identity: OpenStreetMap (amenity=fast_food). The legal universe
// (INSEE SIRENE NAF 56.10C) became a single ~0.8 GB national parquet in April 2026
// (geolocation only, needs a stock join) — deferred to the national version and
// documented as such. OSM is contributor-based and NOT exhaustive; the UI says so.
//
// Outputs:
//   src/data/fastfood_osm.geojson  — every fast-food POI (density proxy), with commune
//   src/data/fastfood_counts.json  — count per commune (choropleth / compare)
//   src/data/enseignes_cibles.geojson — target-brand outlets + the seed flagship
import { openDb, loadSpatial, rows } from "./lib/db.js";
import { writeJSON, fetchWithRetry, log, exists, RAW, SEED, PUBLISH } from "./lib/util.js";
import { resolve } from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";

// Grand Paris bounding box (trimmed to real polygons by a spatial join below).
const BBOX = { s: 48.70, w: 2.05, n: 49.0, e: 2.65 };
const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];
const UA = "ObservatoirePouletQuartiers/0.1 (civic open-data project; contact: observatoire@example.org)";

// Brand normalisation: lower(name|brand|operator) → canonical key.
const BRAND_SQL = `
  CASE
    WHEN nm ~ 'master\\s*poulet'                         THEN 'master_poulet'
    WHEN nm ~ 'tasty\\s*crous|crousti|krousty'           THEN 'tasty_crousti'
    WHEN nm ~ 'poulet\\s*brais|pb\\s*poulet'             THEN 'pb_poulet_braise'
    WHEN nm ~ 'chik.?chill'                              THEN 'chik_chill'
    WHEN nm ~ 'chicken\\s*(street|spot|nation|time|house)' THEN 'chicken_autre'
    WHEN nm ~ 'crous|poulet|chicken'                     THEN 'poulet_autre'
    ELSE NULL
  END`;

async function fetchOverpass() {
  const query = `[out:json][timeout:90];
nwr["amenity"="fast_food"](${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e});
out center tags;`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json,*/*",
    "User-Agent": UA
  };
  let lastErr;
  for (const ep of OVERPASS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        log("chains", `Overpass → ${ep}${attempt ? " (retry)" : ""}`);
        const res = await fetchWithRetry(ep, {
          timeoutMs: 120000,
          retries: 0,
          init: { method: "POST", headers, body: "data=" + encodeURIComponent(query) }
        });
        return await res.json();
      } catch (e) {
        lastErr = e;
        log("chains", `endpoint failed: ${e.message}`);
        if (/HTTP 429|HTTP 504/.test(e.message)) await new Promise((r) => setTimeout(r, 6000));
        else break; // try next endpoint
      }
    }
  }
  throw lastErr;
}

async function main() {
  const rawPath = resolve(RAW, "osm_fastfood.json");
  let pts;
  if (await exists(rawPath)) {
    pts = JSON.parse(await readFile(rawPath, "utf8"));
    log("chains", `reusing cached OSM (${pts.length} POIs) — delete data/raw/osm_fastfood.json to refetch`);
  } else {
    const osm = await fetchOverpass();
    pts = (osm.elements || [])
      .map((el) => {
        const t = el.tags || {};
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (lat == null || lon == null) return null;
        return {
          osm_id: `${el.type}/${el.id}`,
          name: t.name ?? null,
          brand: t.brand ?? null,
          operator: t.operator ?? null,
          cuisine: t.cuisine ?? null,
          lat,
          lon
        };
      })
      .filter(Boolean);
    log("chains", `${pts.length} fast-food POIs in bbox`);
    await mkdir(RAW, { recursive: true });
    await writeFile(rawPath, JSON.stringify(pts), "utf8");
  }

  const { conn } = await openDb();
  await loadSpatial(conn);
  const communesGeo = resolve(PUBLISH, "communes_grandparis.geojson").replace(/\\/g, "/");
  const rawPathSql = rawPath.replace(/\\/g, "/");

  await conn.run(`
    CREATE TEMP TABLE communes AS
      SELECT code AS code_commune, nom AS nom_commune, dep, geom
      FROM ST_Read('${communesGeo}');
    CREATE TEMP TABLE pts AS
      SELECT *, lower(coalesce(name, brand, operator, '')) AS nm,
             ST_Point(lon, lat) AS geom
      FROM read_json('${rawPathSql}');
    CREATE TEMP TABLE joined AS
      SELECT p.osm_id, p.name, p.brand, p.operator, p.cuisine, p.lat, p.lon,
             ${BRAND_SQL} AS brand_key,
             c.code_commune, c.nom_commune, c.dep
      FROM pts p JOIN communes c ON ST_Contains(c.geom, p.geom);
  `);

  const all = await rows(conn, `SELECT * FROM joined ORDER BY code_commune`);
  log("chains", `${all.length} POIs within Grand Paris polygons`);

  // (1) Density proxy GeoJSON — all fast-food POIs in scope.
  await writeJSON(resolve(PUBLISH, "fastfood_osm.geojson"), {
    type: "FeatureCollection",
    meta: { source: "osm", note_fr: "Restauration rapide (amenity=fast_food) — OpenStreetMap, non exhaustif." },
    features: all.map((r) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [r.lon, r.lat] },
      properties: { name: r.name, brand_key: r.brand_key, code_commune: r.code_commune, nom_commune: r.nom_commune }
    }))
  });

  // (2) Counts per commune (+ targeted count) for choropleth / compare.
  const counts = await rows(conn, `
    SELECT code_commune, any_value(nom_commune) AS nom_commune, dep,
           count(*) AS n_fastfood,
           count(*) FILTER (WHERE brand_key IS NOT NULL) AS n_cibles
    FROM joined GROUP BY code_commune, dep ORDER BY code_commune`);
  await writeJSON(resolve(PUBLISH, "fastfood_counts.json"), {
    meta: { source: "osm", note_fr: "Comptage OpenStreetMap des points de restauration rapide. Non exhaustif." },
    communes: counts
  });

  // (3) Target-brand outlets + seed flagship → enseignes_cibles.
  const seedSql = resolve(SEED, "enseignes_cibles.csv").replace(/\\/g, "/");
  const cibles = await rows(conn, `
    WITH osm_cibles AS (
      SELECT name, brand_key AS brand, lat, lon, code_commune, nom_commune,
             'osm_brand' AS provenance, 'osm_brand' AS match_confidence, NULL AS opening_date
      FROM joined WHERE brand_key IS NOT NULL
    ),
    seed AS (
      SELECT name, brand, CAST(lat AS DOUBLE) AS lat, CAST(lon AS DOUBLE) AS lon,
             CAST(code_commune AS VARCHAR) AS code_commune, city AS nom_commune,
             provenance, 'seed' AS match_confidence, opening_date
      FROM read_csv_auto('${seedSql}', types={'code_commune':'VARCHAR','postcode':'VARCHAR'})
      WHERE lat IS NOT NULL AND lon IS NOT NULL
        AND code_commune IN (SELECT code_commune FROM communes)
    ),
    -- prefer the seed flagship: drop OSM points of the same brand within ~120 m
    osm_keep AS (
      SELECT o.* FROM osm_cibles o
      WHERE NOT EXISTS (
        SELECT 1 FROM seed s
        WHERE s.brand = o.brand
          AND abs(s.lat - o.lat) < 0.0011 AND abs(s.lon - o.lon) < 0.0016
      )
    )
    SELECT * FROM seed UNION ALL SELECT * FROM osm_keep`);
  log("chains", `${cibles.length} target-brand outlets (provenance: ` +
    Object.entries(cibles.reduce((a, r) => ((a[r.provenance] = (a[r.provenance] || 0) + 1), a), {}))
      .map(([k, v]) => `${k}=${v}`).join(", ") + ")");

  await writeJSON(resolve(PUBLISH, "enseignes_cibles.geojson"), {
    type: "FeatureCollection",
    meta: {
      source: "osm+seed",
      note_fr: "Enseignes-cibles (poulet/crousti). Identification par marque OpenStreetMap + liste de référence. Couverture partielle — à compléter."
    },
    features: cibles.map((r) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [r.lon, r.lat] },
      properties: {
        name: r.name, brand: r.brand, code_commune: r.code_commune, nom_commune: r.nom_commune,
        provenance: r.provenance, match_confidence: r.match_confidence, opening_date: r.opening_date
      }
    }))
  });

  // Brand breakdown for the log + a small summary input.
  const byBrand = await rows(conn, `SELECT brand_key AS brand, count(*) n FROM joined WHERE brand_key IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`);
  log("chains", "target brands found in OSM:", byBrand.map((b) => `${b.brand}:${b.n}`).join("  ") || "(none)");
}

main().catch((e) => {
  console.error("[chains] FAILED:", e);
  process.exit(1);
});

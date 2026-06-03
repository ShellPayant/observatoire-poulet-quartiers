// Stage 22 — national fast-food survival dataset (the spine of "Mon quartier").
//
// SIRENE StockEtablissement (NAF 56.10C, +the empty-for-now 2026 split 56.11J/56.12Y)
// gives creation date + open/closed status + brand name; the INSEE geolocation parquet
// gives coordinates. ~430k establishments nationally (~257k already closed) — far too
// many to ship as one file, so per-shop rows are SHARDED BY DÉPARTEMENT (loaded on
// demand by the page), while survival aggregates are pre-computed here.
//
// MVP closure date = dateDernierTraitementEtablissement (approx, flagged). Precise
// StockEtablissementHistorique.dateFin is a deferred upgrade.
import { openDb, rows } from "./lib/db.js";
import { writeJSON, fetchWithRetry, log, PUBLISH } from "./lib/util.js";
import { brandCase, BRAND_KEYS } from "./lib/brands.js";
import { resolve } from "node:path";

const NAF = "'56.10C','56.11J','56.12Y'";
const HORIZONS = { 1: 365, 3: 1096, 5: 1826, 10: 3653 }; // years → days

async function resolveParquet(datasetSlug, titleRe) {
  const res = await fetchWithRetry(`https://www.data.gouv.fr/api/1/datasets/${datasetSlug}/`, { timeoutMs: 40000 });
  const d = await res.json();
  const r = d.resources.find((x) => x.format === "parquet" && titleRe.test(x.title || ""));
  if (!r) throw new Error(`parquet not found for ${datasetSlug} / ${titleRe}`);
  return r.url;
}

async function main() {
  const STOCK = await resolveParquet(
    "base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret",
    /StockEtablissement -/);
  const GEOLOC = await resolveParquet(
    "61d5e2d372a52d9f9411ff88", /.*/);
  log("sirene", "stock:", STOCK.slice(-40));
  log("sirene", "geoloc:", GEOLOC.slice(-40));

  const { conn } = await openDb();
  await conn.run("SET http_timeout=600000; SET enable_http_metadata_cache=true; SET preserve_insertion_order=false;");

  log("sirene", "filtering national fast-food + joining coordinates (this is the heavy step)…");
  const t0 = Date.now();
  await conn.run(`
    CREATE TEMP TABLE ff_final AS
    WITH ff AS (
      SELECT CAST(siret AS VARCHAR) AS siret,
             CAST(siret AS VARCHAR)[1:9] AS siren,
             etatAdministratifEtablissement AS etat,
             try_cast(dateCreationEtablissement AS DATE)          AS date_creation,
             try_cast(dateDernierTraitementEtablissement AS DATE) AS date_traitement,
             lower(coalesce(enseigne1Etablissement, denominationUsuelleEtablissement, '')) AS nm,
             CAST(codeCommuneEtablissement AS VARCHAR) AS code_commune
      FROM read_parquet('${STOCK}')
      WHERE activitePrincipaleEtablissement IN (${NAF}) AND siret IS NOT NULL
    ),
    geo AS (
      SELECT CAST(siret AS VARCHAR) AS siret, x_longitude AS lon, y_latitude AS lat
      FROM read_parquet('${GEOLOC}')
      WHERE siret IN (SELECT siret FROM ff)
    )
    SELECT f.siren,
           (f.etat='F')                                                          AS ferme,
           f.date_creation,
           CASE WHEN f.etat='F' THEN f.date_traitement END                       AS date_fermeture,
           CASE WHEN f.etat='F' THEN date_diff('day', f.date_creation, f.date_traitement) END AS lifespan_jours,
           date_diff('day', f.date_creation, current_date)                       AS born_days_ago,
           ${brandCase("f.nm")}                                                  AS brand,
           f.code_commune,
           round(g.lon, 5) AS lon, round(g.lat, 5) AS lat
    FROM ff f JOIN geo g USING (siret)
    WHERE f.date_creation IS NOT NULL AND g.lon IS NOT NULL AND g.lat IS NOT NULL
      AND date_diff('day', f.date_creation, current_date) >= 0;
  `);
  log("sirene", `ff_final built in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  const tot = (await rows(conn, `
    SELECT count(*) n, count(*) FILTER (WHERE NOT ferme) na, count(*) FILTER (WHERE ferme) nf FROM ff_final`))[0];
  log("sirene", `${tot.n.toLocaleString("fr-FR")} géolocalisés · ${tot.na.toLocaleString("fr-FR")} actifs · ${tot.nf.toLocaleString("fr-FR")} fermés`);

  // ---- survival helper (one row of conditional counts → JS turns into curves) ----
  const horizonCols = Object.entries(HORIZONS).map(([y, d]) =>
    `count(*) FILTER (WHERE born_days_ago>=${d}) AS elig_${y},
     count(*) FILTER (WHERE born_days_ago>=${d} AND ferme AND lifespan_jours>=0 AND lifespan_jours<${d}) AS fail_${y}`).join(",\n");
  const km = (r) => Object.keys(HORIZONS).map((y) => ({
    t: +y, survival: r[`elig_${y}`] ? +(1 - r[`fail_${y}`] / r[`elig_${y}`]).toFixed(4) : null, eligible: r[`elig_${y}`]
  }));

  const nat = (await rows(conn, `
    SELECT count(*) FILTER (WHERE NOT ferme) AS n_active, count(*) FILTER (WHERE ferme) AS n_closed,
           round(median(lifespan_jours) FILTER (WHERE ferme AND lifespan_jours>=0)/365.25,1) AS median_life_years,
           round(median(born_days_ago) FILTER (WHERE NOT ferme)/365.25,1) AS median_age_active_years,
           ${horizonCols}
    FROM ff_final`))[0];

  const brands = await rows(conn, `
    SELECT brand, count(*) FILTER (WHERE NOT ferme) AS n_active, count(*) FILTER (WHERE ferme) AS n_closed,
           round(median(lifespan_jours) FILTER (WHERE ferme AND lifespan_jours>=0)/365.25,1) AS median_life_years,
           count(*) FILTER (WHERE born_days_ago>=1826) AS elig_5,
           count(*) FILTER (WHERE born_days_ago>=1826 AND ferme AND lifespan_jours>=0 AND lifespan_jours<1826) AS fail_5
    FROM ff_final GROUP BY brand ORDER BY (n_active+n_closed) DESC`);
  for (const b of brands) b.survival_5y = b.elig_5 ? +(1 - b.fail_5 / b.elig_5).toFixed(4) : null;

  const communes = await rows(conn, `
    SELECT code_commune, count(*) FILTER (WHERE NOT ferme) AS n_active, count(*) FILTER (WHERE ferme) AS n_closed,
           round(median(lifespan_jours) FILTER (WHERE ferme AND lifespan_jours>=0)/365.25,1) AS median_life_years,
           count(*) FILTER (WHERE born_days_ago>=1826) AS elig_5,
           count(*) FILTER (WHERE born_days_ago>=1826 AND ferme AND lifespan_jours>=0 AND lifespan_jours<1826) AS fail_5
    FROM ff_final GROUP BY code_commune HAVING (n_active+n_closed) >= 30`);
  for (const c of communes) { c.survival_5y = c.elig_5 ? +(1 - c.fail_5 / c.elig_5).toFixed(4) : null; delete c.elig_5; delete c.fail_5; }

  await writeJSON(resolve(PUBLISH, "fastfood_survival.json"), {
    meta: {
      source: "sirene_stock", generated: new Date().toISOString().slice(0, 10),
      note_fr: "Survie discrète (style Kaplan-Meier) : parmi les établissements assez vieux pour avoir pu atteindre l’âge t, part encore ouverte. Descriptif, non causal.",
      naf_note: "NAF 56.10C (restauration rapide). La scission 2026 (56.11J/56.12Y) n’est pas encore peuplée."
    },
    national: { km: km(nat), median_life_years: nat.median_life_years, median_age_active_years: nat.median_age_active_years,
      n_active: nat.n_active, n_closed: nat.n_closed, by_brand: brands.map(({ elig_5, fail_5, ...b }) => b) },
    communes
  }, { pretty: false });
  log("sirene", `survie nationale 5 ans = ${(km(nat).find((k) => k.t === 5).survival * 100).toFixed(0)}% · durée de vie médiane (fermés) = ${nat.median_life_years} ans · ${communes.length} communes benchmark`);

  // ---- shard per-shop rows by département ----
  const deps = (await rows(conn, `SELECT DISTINCT substr(code_commune,1,2) AS dep FROM ff_final WHERE code_commune IS NOT NULL ORDER BY 1`)).map((r) => r.dep);
  const depCounts = [];
  for (const dep of deps) {
    const shops = await rows(conn, `
      SELECT brand AS b, (CASE WHEN ferme THEN 1 ELSE 0 END) AS e,
             strftime(date_creation,'%Y-%m') AS c, strftime(date_fermeture,'%Y-%m') AS f,
             lifespan_jours AS l, siren AS s, code_commune AS m, lon, lat
      FROM ff_final WHERE substr(code_commune,1,2)='${dep}' ORDER BY code_commune`);
    depCounts.push({ dep, n: shops.length });
    // Positional tuples (no repeated keys) — schema in fastfood_meta.json.shard_schema.
    await writeJSON(resolve(PUBLISH, `fastfood/${dep}.json`),
      shops.map((r) => [BRAND_KEYS.indexOf(r.b), r.e, r.c, r.f, r.l, r.s, r.m, r.lon, r.lat]));
  }

  await writeJSON(resolve(PUBLISH, "fastfood_meta.json"), {
    generated: new Date().toISOString().slice(0, 10), source: "sirene_stock",
    n_total: tot.n, n_active: tot.na, n_closed: tot.nf, naf_note: "56.10C",
    brand_keys: BRAND_KEYS,
    shard_schema: ["brand_index", "ferme01", "creation_YYYYMM", "fermeture_YYYYMM", "lifespan_jours", "siren", "code_commune", "lon", "lat"],
    deps: depCounts.sort((a, b) => b.n - a.n)
  }, { pretty: true });
  log("sirene", `wrote ${deps.length} département shards + fastfood_survival.json + fastfood_meta.json`);
}

main().catch((e) => { console.error("[sirene] FAILED:", e); process.exit(1); });

// Stage 10 — DVF real-estate prices for the Grand Paris scope.
// Reads the geolocated transaction files (one gzip per département-year),
// cleans + winsorizes, and writes commune-year medians + benchmark series.
//
// Honesty rules baked in:
//   - Ventes only; Appartement/Maison only; prix/m² winsorized to [500, 25000].
//   - A commune-year median is published ONLY when N >= 5 sales (else omitted → null on the map).
import { openDb, rows } from "./lib/db.js";
import { writeJSON, fetchWithRetry, log, PUBLISH, DEPARTEMENTS, DVF_YEARS } from "./lib/util.js";
import { resolve } from "node:path";

const BASE = "https://files.data.gouv.fr/geo-dvf/latest/csv";
const MIN_SALES = 5;
const PRICE_FLOOR = 500;
const PRICE_CEIL = 25000;

// Communes used as named benchmarks on the case-study page.
const BENCH_COMMUNES = {
  "93070": "Saint-Ouen-sur-Seine",
  "93045": "Les Lilas",
  "75056": "Paris"
};

async function discoverFiles() {
  const urls = [];
  await Promise.all(
    DEPARTEMENTS.flatMap((dep) =>
      DVF_YEARS.map(async (year) => {
        const url = `${BASE}/${year}/departements/${dep}.csv.gz`;
        try {
          const res = await fetchWithRetry(url, { init: { method: "HEAD" }, timeoutMs: 30000, retries: 1 });
          if (res.ok) urls.push({ url, dep, year });
        } catch {
          log("dvf", `skip (unavailable): ${dep}/${year}`);
        }
      })
    )
  );
  urls.sort((a, b) => (a.dep + a.year).localeCompare(b.dep + b.year));
  return urls;
}

async function main() {
  log("dvf", `scope = ${DEPARTEMENTS.join(", ")} · years ${DVF_YEARS[0]}–${DVF_YEARS.at(-1)}`);
  const files = await discoverFiles();
  if (!files.length) throw new Error("No DVF files reachable — aborting.");
  log("dvf", `${files.length} département-year files found; reading…`);

  const { conn } = await openDb();
  const urlList = files.map((f) => `'${f.url}'`).join(", ");

  // Materialize cleaned per-sale rows once, then aggregate several ways.
  await conn.run(`
    CREATE TEMP TABLE sales AS
    SELECT
      CAST(code_commune AS VARCHAR)       AS code_commune,
      any_value(nom_commune) OVER (PARTITION BY code_commune) AS nom_commune,
      CAST(code_departement AS VARCHAR)   AS code_departement,
      EXTRACT(year FROM CAST(date_mutation AS DATE)) AS annee,
      valeur_fonciere / surface_reelle_bati          AS prix_m2
    FROM read_csv_auto([${urlList}], union_by_name = true,
                       types = {'code_commune':'VARCHAR','code_departement':'VARCHAR','code_postal':'VARCHAR'})
    WHERE nature_mutation = 'Vente'
      AND type_local IN ('Appartement','Maison')
      AND valeur_fonciere > 0
      AND surface_reelle_bati > 0
      AND (valeur_fonciere / surface_reelle_bati) BETWEEN ${PRICE_FLOOR} AND ${PRICE_CEIL};
  `);

  const total = await rows(conn, `SELECT count(*) AS n FROM sales`);
  log("dvf", `${total[0].n.toLocaleString("fr-FR")} cleaned sales in scope`);

  // (1) Commune-year medians, suppressed below the N threshold.
  const communes = await rows(conn, `
    SELECT code_commune, any_value(nom_commune) AS nom_commune, code_departement, annee,
           count(*)                              AS n_ventes,
           round(median(prix_m2))                AS median_prix_m2,
           round(quantile_cont(prix_m2, 0.25))   AS p25,
           round(quantile_cont(prix_m2, 0.75))   AS p75
    FROM sales
    GROUP BY code_commune, code_departement, annee
    HAVING count(*) >= ${MIN_SALES}
    ORDER BY code_commune, annee;
  `);

  // (2) Latest year available per commune → the default choropleth value.
  const latest = await rows(conn, `
    WITH ranked AS (
      SELECT code_commune, any_value(nom_commune) AS nom_commune, code_departement, annee,
             count(*) AS n_ventes, round(median(prix_m2)) AS median_prix_m2,
             row_number() OVER (PARTITION BY code_commune ORDER BY annee DESC) AS rk
      FROM sales GROUP BY code_commune, code_departement, annee HAVING count(*) >= ${MIN_SALES}
    )
    SELECT code_commune, nom_commune, code_departement, annee AS annee_ref, n_ventes, median_prix_m2
    FROM ranked WHERE rk = 1 ORDER BY code_commune;
  `);

  // (3) Département medians per year (a benchmark line).
  const depts = await rows(conn, `
    SELECT code_departement, annee, count(*) AS n_ventes, round(median(prix_m2)) AS median_prix_m2
    FROM sales GROUP BY code_departement, annee ORDER BY code_departement, annee;
  `);

  // (4) Named benchmark series for the case study (Saint-Ouen, Les Lilas, Paris).
  const benchKeys = Object.keys(BENCH_COMMUNES).map((c) => `'${c}'`).join(", ");
  const benchCommunes = await rows(conn, `
    SELECT code_commune, annee, count(*) AS n_ventes, round(median(prix_m2)) AS median_prix_m2
    FROM sales WHERE code_commune IN (${benchKeys})
    GROUP BY code_commune, annee HAVING count(*) >= ${MIN_SALES} ORDER BY code_commune, annee;
  `);

  await writeJSON(resolve(PUBLISH, "dvf_communes.json"), {
    meta: {
      source: "dvf",
      scope: DEPARTEMENTS,
      years: DVF_YEARS,
      min_sales: MIN_SALES,
      winsor: [PRICE_FLOOR, PRICE_CEIL],
      generated_for: "Observatoire Poulet & Quartiers",
      note_fr: "Médiane du prix au m² (ventes d’appartements et maisons). Valeur masquée si moins de 5 ventes."
    },
    latest,
    series: communes,
    departements: depts
  });

  await writeJSON(resolve(PUBLISH, "dvf_benchmarks.json"), {
    meta: { labels: BENCH_COMMUNES, source: "dvf" },
    communes: benchCommunes,
    departements: depts
  });

  // Sanity check surfaced in the log (Saint-Ouen should be ~6,300 €/m²).
  const so = benchCommunes.filter((r) => r.code_commune === "93070");
  log("dvf", "Saint-Ouen median €/m² by year:", so.map((r) => `${r.annee}:${r.median_prix_m2}`).join("  "));
  log("dvf", `wrote dvf_communes.json (${communes.length} commune-years) + dvf_benchmarks.json`);
}

main().catch((e) => {
  console.error("[dvf] FAILED:", e);
  process.exit(1);
});

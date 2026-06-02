// Stage 32 — recorded crime (SSMSI), COMMUNE level only.
//
// HARD CONSTRAINT: this data exists only at municipal scale. It is shown as
// context behind an ecological-fallacy gate in the UI — never attributed to a
// neighborhood, a business, or a population. Suppressed values (est_diffuse != 'diff')
// are kept NULL, never zero.
import { openDb, rows } from "./lib/db.js";
import { writeJSON, log, PUBLISH } from "./lib/util.js";
import { resolve } from "node:path";

const PARQUET =
  "https://static.data.gouv.fr/resources/bases-statistiques-communale-departementale-et-regionale-de-la-delinquance-enregistree-par-la-police-et-la-gendarmerie-nationales/20260326-124228/donnee-comm-data.gouv-parquet-2025-geographie2025-produit-le2026-02-03.parquet";
const REF_YEAR = 2024; // aligned with the most recent complete DVF year

async function main() {
  const { conn } = await openDb();
  await conn.run(`
    CREATE TEMP TABLE crime AS
    SELECT CAST(CODGEO_2025 AS VARCHAR) AS code_commune, annee, indicateur,
           CASE WHEN est_diffuse = 'diff' THEN nombre END          AS nombre,
           CASE WHEN est_diffuse = 'diff' THEN taux_pour_mille END AS taux_pour_mille,
           insee_pop
    FROM read_parquet('${PARQUET}')
    WHERE CODGEO_2025 LIKE '75%' OR CODGEO_2025 LIKE '92%'
       OR CODGEO_2025 LIKE '93%' OR CODGEO_2025 LIKE '94%';
  `);

  const parisCodes = await rows(conn, `SELECT DISTINCT code_commune FROM crime WHERE code_commune LIKE '75%' ORDER BY 1`);
  log("crime", "Paris codes present:", parisCodes.map((r) => r.code_commune).join(", "));

  // Per-indicator detail for the reference year (popup / compare).
  const byIndicator = await rows(conn, `
    SELECT code_commune, annee, indicateur, nombre, round(taux_pour_mille, 2) AS taux_pour_mille
    FROM crime WHERE annee = ${REF_YEAR} ORDER BY code_commune, indicateur`);

  // Overall indicator (all categories summed) — a rough, explicitly-caveated proxy.
  const totals = await rows(conn, `
    SELECT code_commune, annee,
           sum(nombre)                                  AS total_faits,
           max(insee_pop)                               AS pop,
           round(sum(nombre) * 1000.0 / max(insee_pop), 1) AS total_pour_mille,
           count(*) FILTER (WHERE nombre IS NULL)       AS n_indic_masques
    FROM crime GROUP BY code_commune, annee ORDER BY code_commune, annee`);

  const latest = totals.filter((r) => r.annee === REF_YEAR);
  const series = totals;
  const saintOuen = totals.filter((r) => r.code_commune === "93070");

  await writeJSON(resolve(PUBLISH, "crime_communes.json"), {
    meta: {
      source: "ssmsi",
      grain: "commune",
      ref_year: REF_YEAR,
      years: [...new Set(totals.map((r) => r.annee))].sort(),
      note_fr:
        "Délinquance enregistrée par la police/gendarmerie, au niveau COMMUNAL uniquement. Indice global = somme de toutes les catégories rapportée à la population (à manier avec prudence : unités de compte hétérogènes). Valeurs masquées (secret statistique) exclues, jamais comptées comme zéro.",
      caveat_fr:
        "Ces données décrivent une commune entière, pas un quartier ni un commerce. Toute lecture infra-communale relève du sophisme écologique."
    },
    latest,
    series,
    by_indicator: byIndicator,
    saint_ouen: saintOuen
  });

  log("crime", `ref year ${REF_YEAR}: ${latest.length} communes; Saint-Ouen ` +
    (saintOuen.find((r) => r.annee === REF_YEAR)?.total_pour_mille ?? "—") + " faits/1000 hab");
  log("crime", `wrote crime_communes.json (${byIndicator.length} indicator-rows for ${REF_YEAR})`);
}

main().catch((e) => {
  console.error("[crime] FAILED:", e);
  process.exit(1);
});

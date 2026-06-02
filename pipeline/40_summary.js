// Stage 40 — assemble summary.json: headline KPIs + the Saint-Ouen mini-dashboard.
// Reads the already-published artefacts so the home + case-study pages load instantly.
// Every KPI carries an evidence `level` and a `source` id (→ registry.json).
import { readJSON, writeJSON, exists, log, PUBLISH } from "./lib/util.js";
import { resolve } from "node:path";

const SO = "93070"; // Saint-Ouen-sur-Seine

async function maybe(name) {
  const p = resolve(PUBLISH, name);
  return (await exists(p)) ? readJSON(p) : null;
}

async function main() {
  const dvf = await maybe("dvf_communes.json");
  const bench = await maybe("dvf_benchmarks.json");
  const counts = await maybe("fastfood_counts.json");
  const crime = await maybe("crime_communes.json");
  const cibles = await maybe("enseignes_cibles.geojson");

  const soPrice = (bench?.communes || []).filter((r) => r.code_commune === SO).sort((a, b) => a.annee - b.annee);
  const soPriceLatest = soPrice.at(-1);
  const soPriceFirst = soPrice[0];
  const soCounts = (counts?.communes || []).find((c) => c.code_commune === SO);
  const soCrime = (crime?.saint_ouen || []).find((r) => r.annee === (crime?.meta?.ref_year));

  // Brand breakdown among target outlets.
  const brandTally = {};
  for (const f of cibles?.features || []) {
    const b = f.properties.brand || "autre";
    brandTally[b] = (brandTally[b] || 0) + 1;
  }
  const nMasterPoulet = brandTally["master_poulet"] || 0;
  const nCibles = (cibles?.features || []).length;
  const nFastfood = (counts?.communes || []).reduce((s, c) => s + (c.n_fastfood || 0), 0);

  const kpis = [
    soPriceLatest && {
      id: "prix_so", label_fr: `Prix médian à Saint-Ouen (${soPriceLatest.annee})`,
      label_en: `Median price in Saint-Ouen (${soPriceLatest.annee})`,
      value: soPriceLatest.median_prix_m2, unit: "€/m²", level: "documenté", source: "dvf"
    },
    soPriceFirst && soPriceLatest && {
      id: "prix_so_evol",
      label_fr: `Évolution du prix à Saint-Ouen (${soPriceFirst.annee}→${soPriceLatest.annee})`,
      label_en: `Price change in Saint-Ouen (${soPriceFirst.annee}→${soPriceLatest.annee})`,
      value: Math.round(((soPriceLatest.median_prix_m2 - soPriceFirst.median_prix_m2) / soPriceFirst.median_prix_m2) * 100),
      unit: "%", level: "documenté", source: "dvf"
    },
    {
      id: "fastfood_total", label_fr: "Points de restauration rapide recensés (Grand Paris, OSM)",
      label_en: "Fast-food points mapped (Grand Paris, OSM)",
      value: nFastfood, unit: "", level: "documenté", source: "osm", caveat_fr: "comptage OpenStreetMap, non exhaustif"
    },
    {
      id: "cibles_total", label_fr: "Enseignes-cibles poulet/crousti localisées",
      label_en: "Target chicken/crousti outlets located",
      value: nCibles, unit: "", level: "émergent", source: "osm", caveat_fr: "couverture partielle (OSM + référence)"
    },
    {
      id: "master_poulet", label_fr: "Restaurants Master Poulet localisés",
      label_en: "Master Poulet outlets located",
      value: nMasterPoulet, unit: "", level: "émergent", source: "osm", caveat_fr: "OSM + liste de référence"
    },
    soCrime && {
      id: "crime_so", label_fr: `Délinquance enregistrée à Saint-Ouen (${crime.meta.ref_year}, toutes catégories)`,
      label_en: `Recorded crime in Saint-Ouen (${crime.meta.ref_year}, all categories)`,
      value: soCrime.total_pour_mille, unit: "/1000 hab", level: "documenté", source: "ssmsi",
      caveat_fr: "niveau communal — ne décrit pas un quartier (sophisme écologique)"
    },
    {
      id: "ifop_maire", label_fr: "Français approuvant l’action du maire (Ifop, mai 2026)",
      label_en: "French approving the mayor’s action (Ifop, May 2026)",
      value: 55, unit: "%", level: "documenté", source: "ifop_darwin"
    }
  ].filter(Boolean);

  const summary = {
    generated: new Date().toISOString().slice(0, 10),
    scope_fr: "Grand Paris — Paris (75), Hauts-de-Seine (92), Seine-Saint-Denis (93), Val-de-Marne (94)",
    kpis,
    saint_ouen: {
      code_commune: SO,
      price_series: soPrice,
      benchmarks: bench?.meta?.labels || {},
      bench_departements: bench?.departements || [],
      crime_series: crime?.saint_ouen || [],
      crime_ref_year: crime?.meta?.ref_year ?? null,
      fastfood: soCounts || null
    }
  };

  await writeJSON(resolve(PUBLISH, "summary.json"), summary, { pretty: true });
  log("summary", `wrote summary.json — ${kpis.length} KPIs; Saint-Ouen price ${soPriceLatest?.median_prix_m2} €/m², ` +
    `${nMasterPoulet} Master Poulet, crime ${soCrime?.total_pour_mille}/1000`);
}

main().catch((e) => {
  console.error("[summary] FAILED:", e);
  process.exit(1);
});

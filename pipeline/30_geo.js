// Stage 30 — commune (and Paris arrondissement) boundaries for Grand Paris.
// Source: geo.api.gouv.fr (Etalab) — official, lightweight contour geometries.
// Paris is fetched as its 20 arrondissements (codes 75101–75120) so geometries
// line up with DVF/crime codes; 92/93/94 as communes.
import { writeJSON, fetchWithRetry, log, PUBLISH, DEPARTEMENTS } from "./lib/util.js";
import { resolve } from "node:path";

const GEO = "https://geo.api.gouv.fr";

async function communesOf(dep) {
  const url = `${GEO}/departements/${dep}/communes?geometry=contour&format=geojson&fields=nom,code,codeDepartement`;
  const res = await fetchWithRetry(url, { timeoutMs: 60000 });
  const fc = await res.json();
  return fc.features.map((f) => ({
    type: "Feature",
    geometry: f.geometry,
    properties: {
      code: f.properties.code,
      nom: f.properties.nom,
      dep: f.properties.codeDepartement || dep
    }
  }));
}

async function parisArrondissements() {
  // Paris OpenData: arrondissements carry the INSEE code (c_arinsee = 75101…75120).
  const url = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/arrondissements/exports/geojson";
  const res = await fetchWithRetry(url, { timeoutMs: 60000 });
  const fc = await res.json();
  return fc.features.map((f) => {
    const p = f.properties || {};
    const code = String(p.c_arinsee ?? p.insee ?? p.code);
    const nom = p.l_aroff || p.l_ar || p.nom || `Paris ${code}`;
    return { type: "Feature", geometry: f.geometry, properties: { code, nom, dep: "75" } };
  });
}

async function main() {
  const features = [];
  for (const dep of DEPARTEMENTS) {
    const part = dep === "75" ? await parisArrondissements() : await communesOf(dep);
    log("geo", `${dep}: ${part.length} polygones`);
    features.push(...part);
  }
  const fc = { type: "FeatureCollection", features };
  const { bytes } = await writeJSON(resolve(PUBLISH, "communes_grandparis.geojson"), fc);
  log("geo", `wrote communes_grandparis.geojson — ${features.length} polygones, ${(bytes / 1024 / 1024).toFixed(1)} Mo`);
}

main().catch((e) => {
  console.error("[geo] FAILED:", e);
  process.exit(1);
});

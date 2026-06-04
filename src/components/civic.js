// Client-side, on-demand open-data lookups for the visitor's neighborhood.
// Both are free public APIs (CORS-enabled). They degrade gracefully: on any
// failure the page shows "indisponible" and the rest keeps working.

const BODACC =
  "https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records";

/**
 * Bankruptcies (procédures collectives) for a set of SIRENs, batched.
 * Returns Map<siren, [{nature, date, ville}]>. Capped to bound API calls.
 */
export async function fetchBankruptcies(sirens, { cap = 300, batch = 20 } = {}) {
  const uniq = [...new Set(sirens.filter(Boolean))].slice(0, cap);
  const out = new Map();
  for (let i = 0; i < uniq.length; i += batch) {
    const chunk = uniq.slice(i, i + batch);
    const where = `familleavis_lib="Procédures collectives" and (${chunk.map((s) => `registre like "${s}"`).join(" or ")})`;
    const url = `${BODACC}?` + new URLSearchParams({ where, limit: "100", select: "registre,jugement,dateparution,ville" });
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      for (const rec of j.results || []) {
        const siren = (rec.registre || []).map((x) => String(x).replace(/\s/g, "")).find((x) => /^\d{9}$/.test(x));
        if (!siren) continue;
        const jug = typeof rec.jugement === "string" ? safeParse(rec.jugement) : rec.jugement;
        const nature = jug?.nature || jug?.famille || "procédure collective";
        if (!out.has(siren)) out.set(siren, []);
        out.get(siren).push({ nature, date: rec.dateparution, ville: rec.ville });
      }
    } catch { /* ignore, keep going */ }
  }
  return out;
}

/** Company size/financials for one SIREN (Annuaire des Entreprises). CA is rarely public. */
export async function fetchCompany(siren) {
  try {
    const r = await fetch(`https://recherche-entreprises.api.gouv.fr/search?` +
      new URLSearchParams({ q: siren, per_page: "1" }));
    if (!r.ok) return null;
    const e = (await r.json()).results?.[0];
    if (!e) return null;
    let ca = null, exercice = null, resultat = null;
    if (e.finances && typeof e.finances === "object") {
      const years = Object.keys(e.finances).sort();
      const y = years.at(-1);
      if (y) { ca = e.finances[y]?.ca ?? null; resultat = e.finances[y]?.resultat_net ?? null; exercice = y; }
    }
    return {
      nom: e.nom_complet, ca, resultat, exercice,
      n_etab_ouverts: e.nombre_etablissements_ouverts,
      tranche_effectif: e.tranche_effectif_salarie,
      categorie: e.categorie_entreprise,
      date_creation: e.date_creation
    };
  } catch {
    return null;
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }

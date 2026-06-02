// Minimal synchronous i18n for component labels. Pages pass `lang` ('fr' | 'en').
// Long-form prose lives in the .md pages themselves; this covers shared UI chrome.
const DICT = {
  level_documenté: { fr: "documenté", en: "documented" },
  level_émergent: { fr: "émergent", en: "emerging" },
  level_contesté: { fr: "contesté", en: "contested" },
  level_help_documenté: {
    fr: "Fait établi et sourcé (donnée officielle ou fait de presse recoupé).",
    en: "Established, sourced fact (official data or cross-checked reporting)."
  },
  level_help_émergent: {
    fr: "Piste plausible mais non démontrée — à interpréter avec prudence.",
    en: "Plausible but unproven lead — interpret with caution."
  },
  level_help_contesté: {
    fr: "Affirmation discutée ou non étayée — présentée pour information.",
    en: "Disputed or unsupported claim — shown for information."
  },
  source: { fr: "Source : ", en: "Source: " },
  sources: { fr: "Sources : ", en: "Sources: " },
  layer_prix: { fr: "Prix immobilier (€/m²)", en: "Property price (€/m²)" },
  layer_fastfood: { fr: "Densité de restauration rapide", en: "Fast-food density" },
  layer_cibles: { fr: "Enseignes-cibles (poulet/crousti)", en: "Target chains (chicken/crousti)" },
  layer_crime: { fr: "Délinquance (commune)", en: "Crime (municipal)" },
  legend_nodata: { fr: "donnée non diffusée", en: "not disclosed" },
  gate_title: { fr: "Donnée sensible — à lire avec précaution", en: "Sensitive data — read with care" },
  gate_body: {
    fr: "La délinquance n’est disponible qu’au niveau communal. Elle décrit une commune entière — jamais un quartier, un commerce ou une population. Établir un lien avec un restaurant relèverait du sophisme écologique.",
    en: "Crime is available only at municipal level. It describes a whole municipality — never a neighborhood, a business or a population. Linking it to a restaurant would be an ecological fallacy."
  },
  gate_accept: { fr: "J’ai compris, afficher la couche", en: "I understand, show the layer" },
  guess_prompt: {
    fr: "À votre avis, comment le prix au m² a-t-il évolué autour de l’ouverture ? Tracez votre estimation.",
    en: "In your view, how did €/m² evolve around the opening? Draw your guess."
  },
  guess_reveal: { fr: "Révéler les données réelles", en: "Reveal the real data" },
  guess_caveat: {
    fr: "Aucun lien de cause à effet n’est établi : ce graphique est descriptif.",
    en: "No causal link is established: this chart is descriptive."
  },
  pro: { fr: "Arguments en faveur de l’enseigne", en: "Arguments for the chain" },
  contra: { fr: "Objections et limites", en: "Objections and limits" },
  toggle_lang: { fr: "English", en: "Français" },
  year: { fr: "Année", en: "Year" }
};

export function t(lang, key, vars) {
  const entry = DICT[key];
  let s = entry ? entry[lang] ?? entry.fr ?? key : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

/** A small FR/EN switch link for the top of a page. */
export function langToggle(lang, otherHref) {
  const a = document.createElement("a");
  a.href = otherHref;
  a.textContent = (lang === "en" ? "🇫🇷 Français" : "🇬🇧 English");
  a.style = "font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem;";
  return a;
}

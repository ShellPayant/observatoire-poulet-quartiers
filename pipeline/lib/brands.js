// Shared brand classifier — used by both the OSM stage (20_chains.js) and the
// national SIRENE stage (22_sirene_ff.js). `nm` is a SQL expression that lowercases
// the best available name (OSM: name|brand|operator; SIRENE: enseigne|denomination).
export const BRAND_KEYS = [
  "master_poulet", "tasty_crousti", "pb_poulet_braise", "chik_chill",
  "kfc", "chicken_autre", "poulet_autre", "independant"
];

export function brandCase(nm) {
  return `CASE
    WHEN ${nm} ~ 'master\\s*poulet'                         THEN 'master_poulet'
    WHEN ${nm} ~ 'tasty\\s*crous|crousti|krousty'           THEN 'tasty_crousti'
    WHEN ${nm} ~ 'poulet\\s*brais|pb\\s*poulet'             THEN 'pb_poulet_braise'
    WHEN ${nm} ~ 'chik.?chill'                              THEN 'chik_chill'
    WHEN ${nm} ~ 'k\\.?f\\.?c|kentucky'                     THEN 'kfc'
    WHEN ${nm} ~ 'chicken\\s*(street|spot|nation|time|house)' THEN 'chicken_autre'
    WHEN ${nm} ~ 'crous|poulet|chicken'                     THEN 'poulet_autre'
    ELSE 'independant'
  END`;
}

// Display labels + colours (colourblind-safe-ish, named chains vivid, generic muted).
export const BRAND_LABELS = {
  master_poulet:    { fr: "Master Poulet",            en: "Master Poulet",          color: "#c64b1e" },
  tasty_crousti:    { fr: "Tasty Crousti",            en: "Tasty Crousti",          color: "#e0851e" },
  pb_poulet_braise: { fr: "PB Poulet Braisé",         en: "PB Poulet Braisé",       color: "#8a5a2b" },
  chik_chill:       { fr: "Chik'Chill",               en: "Chik'Chill",             color: "#b9770e" },
  kfc:              { fr: "KFC",                       en: "KFC",                    color: "#a4133c" },
  chicken_autre:    { fr: "Autre enseigne « chicken »", en: "Other 'chicken' brand", color: "#9e6240" },
  poulet_autre:     { fr: "Autre poulet/crousti",      en: "Other chicken/crousti",  color: "#caa472" },
  independant:      { fr: "Indépendant / autre",       en: "Independent / other",    color: "#9a9a9a" }
};

export const NAMED_CHAINS = ["master_poulet", "tasty_crousti", "pb_poulet_braise", "chik_chill", "kfc"];

// Client-side copy of the brand keys/labels/colours (mirrors pipeline/lib/brands.js).
// Shard tuples encode brand as an index into BRAND_KEYS.
export const BRAND_KEYS = [
  "master_poulet", "tasty_crousti", "pb_poulet_braise", "chik_chill",
  "kfc", "chicken_autre", "poulet_autre", "independant"
];
export const NAMED_CHAINS = ["master_poulet", "tasty_crousti", "pb_poulet_braise", "chik_chill", "kfc"];
export const BRAND_LABELS = {
  master_poulet:    { fr: "Master Poulet",            en: "Master Poulet",          color: "#c64b1e" },
  tasty_crousti:    { fr: "Tasty Crousti",            en: "Tasty Crousti",          color: "#e0851e" },
  pb_poulet_braise: { fr: "PB Poulet Braisé",         en: "PB Poulet Braisé",       color: "#8a5a2b" },
  chik_chill:       { fr: "Chik'Chill",               en: "Chik'Chill",             color: "#b9770e" },
  kfc:              { fr: "KFC",                       en: "KFC",                    color: "#a4133c" },
  chicken_autre:    { fr: "Autre « chicken »",         en: "Other 'chicken'",        color: "#9e6240" },
  poulet_autre:     { fr: "Autre poulet/crousti",      en: "Other chicken/crousti",  color: "#caa472" },
  independant:      { fr: "Indépendant / autre",       en: "Independent / other",    color: "#9a9a9a" }
};
export const labelOf = (brand, lang = "fr") => (BRAND_LABELS[brand]?.[lang] ?? brand);
export const colorOf = (brand) => (BRAND_LABELS[brand]?.color ?? "#9a9a9a");
export const isNamed = (brand) => NAMED_CHAINS.includes(brand);

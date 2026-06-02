// Locale-aware formatting helpers (French primary).
const loc = (lang) => (lang === "en" ? "en-GB" : "fr-FR");

export function fmtInt(n, lang = "fr") {
  return n == null ? "—" : new Intl.NumberFormat(loc(lang)).format(Math.round(n));
}

export function fmtNum(n, lang = "fr", digits = 1) {
  return n == null ? "—" : new Intl.NumberFormat(loc(lang), { maximumFractionDigits: digits }).format(n);
}

export function fmtPrice(n, lang = "fr") {
  return n == null ? "—" : `${fmtInt(n, lang)} €/m²`;
}

export function fmtPct(n, lang = "fr", { sign = false } = {}) {
  if (n == null) return "—";
  const s = sign && n > 0 ? "+" : "";
  return `${s}${fmtNum(n, lang, 1)} %`;
}

/** Format a KPI {value, unit} for display. */
export function fmtValue(kpi, lang = "fr") {
  if (kpi.value == null) return "—";
  if (kpi.unit === "%") return fmtPct(kpi.value, lang, { sign: kpi.id?.includes("evol") });
  if (kpi.unit === "€/m²") return fmtPrice(kpi.value, lang);
  const num = Number.isInteger(kpi.value) ? fmtInt(kpi.value, lang) : fmtNum(kpi.value, lang, 1);
  return kpi.unit ? `${num} ${kpi.unit}` : num;
}

// Evidence labels, source attribution lines, and KPI cards.
// These render plain DOM nodes (no framework globals needed) so they work
// identically in every page and in the EN mirror.
import { t } from "./i18n.js";
import { fmtValue } from "./format.js";

const LEVELS = { documenté: "documenté", documented: "documenté", émergent: "émergent", emerging: "émergent", contesté: "contesté", contested: "contesté" };
const canon = (lvl) => LEVELS[lvl] || "documenté";

/** A pill badge: documenté / émergent / contesté (translated, color-coded). */
export function evidenceBadge(level, lang = "fr") {
  const c = canon(level);
  const span = document.createElement("span");
  span.className = `pq-badge pq-badge--${c}`;
  span.textContent = t(lang, `level_${c}`);
  span.title = t(lang, `level_help_${c}`);
  span.setAttribute("role", "note");
  return span;
}

/** Attribution line linking a dataset's homepage (from registry datasets). */
export function sourceLine(sourceId, datasets, lang = "fr") {
  const div = document.createElement("div");
  div.className = "pq-source";
  const ids = Array.isArray(sourceId) ? sourceId : [sourceId];
  const parts = ids.map((id) => {
    const d = datasets?.[id];
    if (!d) return id;
    const name = lang === "en" ? d.name_en : d.name_fr;
    return `<a href="${d.homepage}" target="_blank" rel="noopener">${name}</a> — ${d.producer} · ${d.license}`;
  });
  div.innerHTML = t(lang, ids.length > 1 ? "sources" : "source") + parts.join(" ; ");
  return div;
}

/** A headline KPI card: value, label, evidence badge, optional caveat, source. */
export function kpiCard(kpi, datasets, lang = "fr") {
  const card = document.createElement("div");
  card.className = "pq-kpi";

  const v = document.createElement("div");
  v.className = "v";
  v.textContent = fmtValue(kpi, lang);

  const l = document.createElement("div");
  l.className = "l";
  l.textContent = lang === "en" ? kpi.label_en || kpi.label_fr : kpi.label_fr;

  const meta = document.createElement("div");
  meta.style = "display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin-top:.1rem";
  meta.appendChild(evidenceBadge(kpi.level, lang));

  card.append(v, l, meta);

  const caveat = lang === "en" ? kpi.caveat_en || kpi.caveat_fr : kpi.caveat_fr;
  if (caveat) {
    const c = document.createElement("div");
    c.className = "pq-source";
    c.textContent = "⚠ " + caveat;
    card.appendChild(c);
  }
  if (kpi.source) card.appendChild(sourceLine(kpi.source, datasets, lang));
  return card;
}

/** Inline number + badge, for use mid-sentence (returns a <span>). */
export function statInline(text, level, lang = "fr") {
  const span = document.createElement("span");
  span.style = "display:inline-flex;gap:.35rem;align-items:baseline";
  const b = document.createElement("b");
  b.textContent = text;
  span.append(b, evidenceBadge(level, lang));
  return span;
}

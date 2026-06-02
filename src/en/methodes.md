---
title: Methods & limits (EN)
toc: true
---

```js
import { evidenceBadge } from "../components/evidence.js";
```

<div style="display:flex;justify-content:flex-end"><a href="/methodes" style="font-size:.8rem;text-decoration:none;border:1px solid var(--theme-foreground-faintest);border-radius:999px;padding:.15rem .7rem">🇫🇷 Français</a></div>

# 🧭 Methods & limits

The observatory follows one rule: **never present a correlation as a cause, nor a rumor as a fact.** Here is how each figure is built and what it can — or cannot — support.

## Evidence labels

```js
const lg = document.createElement("div");
lg.style = "display:grid;gap:.6rem;margin:.4rem 0";
for (const [lvl, desc] of [
  ["documenté", "Established, sourced fact: official data (Etalab, INSEE, SSMSI, IGN) or cross-checked reporting."],
  ["émergent", "Plausible but unproven in France: interpret with caution, never as proof."],
  ["contesté", "Disputed, partial or unsupported: shown for information, explicitly not validated."]
]) {
  const row = document.createElement("div");
  row.style = "display:flex;gap:.6rem;align-items:flex-start";
  const d = document.createElement("div");
  d.style = "font-size:.88rem";
  d.textContent = desc;
  row.append(evidenceBadge(lvl, "en"), d);
  lg.appendChild(row);
}
display(lg);
```

## The pitfalls, in plain words

**Correlation ≠ causation.** Two things moving together need not explain each other. A map overlaying “fast food” and “low prices” proves no effect.

**Reverse causation (selection effect).** The link often runs the other way: cheap food locates where rents are **already low**, because it is cheaper — not the reverse.

**Ecological fallacy.** Inferring an individual (or a shop, or a street) from a zone average. Our crime data is **municipal**: applying it to a neighbourhood or a restaurant would be an ecological fallacy.

**MAUP (modifiable areal unit problem).** Results change with the chosen zoning. We publish each dataset at **its native scale**, inventing no intermediate zone.

**Spatial autocorrelation (Moran’s I).** Neighbouring prices and crime resemble each other; serious causal work must correct for it — which descriptive maps do not, hence their descriptive-only status.

**Statistical secrecy.** Small-area values are suppressed by INSEE/SSMSI. Here a suppressed value stays **“not disclosed”** — **never** replaced by zero.

## How each layer is built

- **Property prices (DVF)** ${evidenceBadge("documenté","en")} — sales of flats/houses only; €/m² winsorized to [500, 25,000]; **median** per municipality-year, published only from **5 sales**. Excludes Alsace-Moselle, new-builds and gifts.
- **Fast-food density** ${evidenceBadge("émergent","en")} — OpenStreetMap (`amenity=fast_food`) per capita. **Contributor-based and non-exhaustive.** The official SIRENE (NAF 56.10C) universe is a ~0.8 GB national parquet since April 2026 — planned for the national version.
- **Crime (SSMSI)** ${evidenceBadge("documenté","en")} — **municipal level only**, shown behind a warning: context, never a cause attributable to a shop or a population.
- **Target-chain identification** ${evidenceBadge("émergent","en")} — reference list + OpenStreetMap brand match, each point carrying its provenance. SIRENE has no trade name, so coverage is **partial** and **dated**.

## What we deliberately did NOT do

- **No money-laundering map.** The general cash-business risk is documented, but **no case against these chains is established**. See [the debate](/debats/blanchiment).
- **No “great replacement” framing.** Halal appears only as factual description.
- **No causal headlines.**

## Roadmap

| Version | Planned |
|---|---|
| **v1 — national** | SIRENE 56.10C, Filosofi income/poverty (IRIS), QPV, France-wide |
| **v2 — inferential** | Event-study (difference-in-differences) around an opening, **with confidence intervals** and reverse-causation warnings — never on the home page |

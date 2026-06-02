# Design brief / prompt — make Observatoire Poulet & Quartiers user-friendly & marketable

> Paste the block below into a fresh Claude (Code) session opened in this repo. It assumes the working site already exists; it is a **redesign + growth** brief, not a rebuild.

---

You are a **senior product designer and front-end engineer** redesigning a live civic-data website. Your job is to make it **delightful, trustworthy, mobile-first, and shareable** — without weakening its rigor or neutrality. Read `README.md` and `CLAUDE.md` first, run `npm run dev`, and look at `test/shots/` for the current state before changing anything.

## The product
**Observatoire Poulet & Quartiers** — an independent, bilingual (FR-primary / EN) open-data observatory about the neighborhood footprint of low-cost halal fried-chicken chains (Master Poulet, Tasty Crousti) in Greater Paris. It rides a genuinely viral French news story (the April-2026 "guerre du poulet" in Saint-Ouen: concrete blocks, a court win, giant flowerpots, a national political fight). It maps real open data — property prices (DVF), fast-food density (OSM), commune crime (SSMSI) — and lets citizens **form their own opinion**. Tech: **Observable Framework** (static) + **MapLibre GL JS** + **Observable Plot**. Pages: `/`, `/affaire-saint-ouen`, `/explorer`, `/comparer`, `/methodes`, `/debats/blanchiment`, `/sources`, `/a-propos`, plus an `/en/` mirror.

## Audience & goal
General French public + journalists + curious citizens, mostly **on mobile**, arriving from social media. The current site is correct and serious but visually plain and desktop-leaning. Make it feel like a **polished, modern data-journalism product** (think *The Pudding* / NYT graphics / a great civic dashboard) that someone *wants* to share — while staying credible enough for a journalist to cite.

## Non-negotiables — DO NOT break or dilute
1. **Neutrality.** No advocacy. The site presents data and both sides; it never takes a position. The pro-chain dossier is quoted only as one party's view.
2. **Evidence labels on every number.** Keep the `documenté / émergent / contesté` badge system (`src/components/evidence.js`) and a `SourceLine` on every figure. You may restyle them; you may not remove them.
3. **Anti-stigma + ethics.** Keep the crime ecological-fallacy gate; no money-laundering map; no identity/"replacement" framing; respectful treatment of working-class neighborhoods.
4. **Bilingual FR-primary / EN**, and **RGPD-safe**: no third-party trackers; if you add analytics, use a cookieless privacy-first option (e.g., Plausible self-host) and disclose it.
5. **Don't break the data contracts.** The pipeline writes JSON/GeoJSON to `src/data/`; reuse those shapes. Restyle the data layer (`maps.js`, components), don't rewrite it. Keep it **static-deployable** (no server).
6. Keep `npm run build` ("links validated") and `node test/smoke.mjs` ("11/11 pages clean") **green** after every change.

## Design objectives

**1. Brand identity & art direction.** Design a memorable, credible identity that balances a *playful subject* (chicken, virality) with *serious data*. Deliver: a wordmark/logo (a chicken + map-pin motif works), a one-line tagline (current: « Les données ouvertes, l'avis libre »), and an art-direction note. Avoid anything that mocks the neighborhoods or the cuisine — wit, not condescension.

**2. Design system / tokens.** Replace the ad-hoc inline CSS (currently in `observablehq.config.js` `head` and per-element styles) with a coherent token set: color (a warm terracotta accent `~#c64b1e` is in use, plus the green/amber/red evidence colors — refine into an accessible scale), typography (a distinctive editorial display face for headlines + a highly-readable sans for data/UI), spacing, radius, elevation, and dark-mode. Centralize as CSS variables + a small Framework theme.

**3. Homepage & hero.** Make the first screen do the job in 5 seconds: a striking hero (an animated/illustrated map teaser or a bold stat), a crisp value proposition, and one obvious primary CTA into the experience. Turn the KPI strip and the "how to read this site" evidence legend into a designed feature, not a list.

**4. The map experience (highest impact).** Polish `/explorer`: a refined layer switcher, a legible floating legend, hover tooltips + nicer popups, smooth transitions when switching metrics, loading/empty states, a working address search with a clear result, and a respectful, prominent crime gate. Must be **fully usable on a phone** (controls collapse into a sheet/drawer; map fills the screen).

**5. Case-study scrollytelling.** Upgrade `/affaire-saint-ouen` from static sections to a **sticky-map scrollytelling** narrative (map/figure pinned on one side, steps advancing on scroll, with `prefers-reduced-motion` fallback). Make the "draw your guess" and the two-column pour/objections debate feel like signature interactive moments.

**6. Shareability & growth (this is the "marketable" part).**
   - **Open Graph / social cards**: generate a per-page share image (Saint-Ouen stat, a map thumbnail, the headline). The chicken-war story is shared constantly — every URL must preview beautifully on X/WhatsApp/LinkedIn.
   - **"Your neighborhood" deep links**: let a user land on a specific commune and get a shareable card with its price + fast-food + crime context (NYT "is your area…" energy), with all the usual caveats.
   - A shareable result from `/comparer` and the "draw your guess" reveal.
   - SEO basics (titles, meta, structured data, FR-first), and a lightweight press/about kit.

**7. Mobile & responsive.** Mobile-first throughout: the two-column debate stacks, tables become cards, charts and maps resize, tap targets ≥44px, no horizontal scroll.

**8. Accessibility & performance.** WCAG 2.1 AA: keyboard-navigable controls and gate, visible focus, colorblind-safe sequential ramps (no red/green-only), alt text / table fallback for every map, `prefers-reduced-motion`. Keep initial JS/CSS lean; lazy-load the heavy map and DuckDB only where needed.

**9. Microcopy & tone (bilingual).** Warm, plain, confident. Author FR first, then mirror EN. Keep the honest caveats but make them feel like a *feature* (transparency as a selling point), not fine print.

## Tech constraints
- Stay on **Observable Framework**. Theme via `observablehq.config.js` (`theme`, `head`, `style`) and a real stylesheet; restyle the components in `src/components/`. If you believe a migration is warranted, write a short justification first — default is to stay.
- Reuse `evidenceBadge`, `sourceLine`, `kpiCard`, and the `maps.js` helpers (`createMap`, `addChoropleth`, `paintChoropleth`, `addPoints`, `legend`). Extend, don't replace.
- Basemap is IGN Géoplateforme; you may switch to a cleaner vector style if it improves legibility, keeping attribution.

## Deliverables
1. A **design system** file (tokens + components) and a one-page `STYLE.md` rationale.
2. Restyled **hero, nav, footer, KPI cards, badges, legend, popups, tables**.
3. **Scrollytelling** case study + **mobile** map experience.
4. **OG share-image** generation + deep-linkable commune view.
5. A **before/after** screenshot set (reuse `test/smoke.mjs`, add mobile viewports).
6. Updated FR + EN microcopy.

## Process & acceptance
- Work in small increments; after each, run `npm run build` and `node test/smoke.mjs` and keep both green.
- Verify on mobile (375px) and desktop (1280px) viewports.
- Acceptance: visibly more polished and shareable, fully responsive, AA-accessible, **every figure still carries an evidence label + source**, neutrality and the crime gate intact, and the build + smoke test pass.

## Inspiration
The Pudding, NYT "You Draw It" / personalized graphics, Observable Framework showcase, Institut Paris Region Cartoviz, Observatoire des Territoires, Datawrapper map styling. Borrow their clarity and shareability, keep our neutrality and rigor.

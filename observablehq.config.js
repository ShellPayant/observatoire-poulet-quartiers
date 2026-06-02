// Observatoire Poulet & Quartiers — Observable Framework config
// French is the primary language; an English mirror lives under /en/.

export default {
  title: "Observatoire Poulet & Quartiers",
  // Root locally; set PAGES_BASE in CI for a GitHub project-pages sub-path.
  base: process.env.PAGES_BASE || "/",
  // A neutral, source-cited civic observatory. The sidebar leads with the FR site.
  pages: [
    {
      name: "Le site",
      pages: [
        { name: "Accueil", path: "/index" },
        { name: "L’affaire Saint-Ouen", path: "/affaire-saint-ouen" },
        { name: "Explorer la carte", path: "/explorer" },
        { name: "Comparer deux quartiers", path: "/comparer" }
      ]
    },
    {
      name: "Comprendre",
      pages: [
        { name: "Méthodes & limites", path: "/methodes" },
        { name: "Débat : blanchiment ?", path: "/debats/blanchiment" },
        { name: "Sources & données", path: "/sources" },
        { name: "À propos", path: "/a-propos" }
      ]
    },
    {
      name: "English",
      pages: [
        { name: "Home", path: "/en/index" },
        { name: "The Saint-Ouen affair", path: "/en/affaire-saint-ouen" },
        { name: "Methods & limits", path: "/en/methodes" }
      ]
    }
  ],
  // Neutral, readable theme.
  theme: ["air", "wide"],
  root: "src",
  cleanUrls: true,
  toc: false,
  search: true,
  head: `
    <meta name="description" content="Observatoire indépendant et bilingue : données ouvertes sur l'empreinte des fast-foods de poulet à bas prix (Master Poulet, Tasty Crousti) sur l'immobilier, l'environnement alimentaire et la délinquance en Île-de-France. Données et clarté — chacun se fait son avis.">
    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css">
    <style>
      :root { --pq-doc:#1f7a4d; --pq-emerg:#b9770e; --pq-contest:#b23b3b; --pq-accent:#c64b1e; }
      .pq-badge { display:inline-flex; align-items:center; gap:.3em; font-size:.72rem; font-weight:600;
        padding:.08em .5em; border-radius:999px; line-height:1.5; white-space:nowrap; vertical-align:middle; }
      .pq-badge--documenté { background:#e6f4ec; color:#1f7a4d; border:1px solid #bfe3cf; }
      .pq-badge--émergent  { background:#fbf1dd; color:#946012; border:1px solid #efd9a8; }
      .pq-badge--contesté  { background:#fbe9e9; color:#a23232; border:1px solid #f0c9c9; }
      .pq-source { font-size:.72rem; color:var(--theme-foreground-muted); margin-top:.15rem; }
      .pq-source a { color:var(--theme-foreground-muted); text-decoration:underline dotted; }
      .pq-kpi { border:1px solid var(--theme-foreground-faintest); border-radius:.7rem; padding:.9rem 1rem;
        background:var(--theme-background-alt); display:flex; flex-direction:column; gap:.25rem; }
      .pq-kpi .v { font-size:1.7rem; font-weight:700; line-height:1; }
      .pq-kpi .l { font-size:.82rem; color:var(--theme-foreground-muted); }
      .pq-modecard { border:1px solid var(--theme-foreground-faintest); border-radius:.8rem; padding:1.1rem 1.2rem;
        text-decoration:none; color:inherit; display:block; transition:.15s; background:var(--theme-background-alt); }
      .pq-modecard:hover { border-color:var(--pq-accent); transform:translateY(-2px); }
      .pq-gate { border:1px dashed var(--pq-contest); background:#fcf4f4; border-radius:.6rem; padding:1rem 1.2rem; }
      .pq-legend { font-size:.75rem; background:var(--theme-background); border:1px solid var(--theme-foreground-faintest);
        border-radius:.5rem; padding:.5rem .6rem; }
      .pq-legend .row { display:flex; align-items:center; gap:.4rem; margin:.12rem 0; }
      .pq-legend .sw { width:14px; height:14px; border-radius:3px; display:inline-block; }
      .maplibregl-popup-content { font: 13px/1.4 var(--sans-serif); border-radius:.5rem; }
      .pq-contra { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
      @media (max-width:760px){ .pq-contra { grid-template-columns:1fr; } }
      .pq-col h4 { margin:.2rem 0 .5rem; }
      .pq-arg { border-left:3px solid; padding:.4rem .7rem; margin:.5rem 0; border-radius:.2rem; background:var(--theme-background-alt); }
      .pq-arg.pro { border-color:var(--pq-doc); }
      .pq-arg.con { border-color:var(--pq-contest); }
    </style>`,
  header: `<div style="display:flex;align-items:center;gap:.5rem;font-weight:600">
      <span style="font-size:1.2rem">🍗</span>
      <span>Observatoire Poulet &amp; Quartiers</span>
      <span style="font-weight:400;color:var(--theme-foreground-muted)">· données ouvertes, avis libre</span>
    </div>`,
  footer: `<div style="font-size:.8rem;color:var(--theme-foreground-muted)">
      Données : <a href="https://www.data.gouv.fr">data.gouv.fr</a> · Etalab / DGFiP · INSEE · SSMSI · IGN ·
      <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>.
      Réutilisation sous <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/">Licence Ouverte / Etalab 2.0</a>
      (OSM : ODbL). Observatoire indépendant — non affilié à une enseigne.
      <a href="/methodes">Méthodes &amp; limites</a> · <a href="/sources">Sources</a>.
    </div>`
};

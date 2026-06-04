// Shareable "neighborhood card" — drawn to a <canvas> (1200×630, OG ratio) so it
// works on a static site with zero infra, and downloaded as a PNG for social posts.

export function neighborhoodCard(stats, lang = "fr") {
  const W = 1200, H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const t = (fr, en) => (lang === "en" ? en : fr);

  // background
  ctx.fillStyle = "#fbfaf8";
  ctx.fillRect(0, 0, W, H);
  // header band
  ctx.fillStyle = "#c64b1e";
  ctx.fillRect(0, 0, W, 132);
  ctx.fillStyle = "#fff";
  ctx.font = "700 46px Georgia, serif";
  ctx.fillText("🍗 " + t("Mon quartier", "My neighborhood"), 48, 70);
  ctx.font = "400 24px system-ui, sans-serif";
  ctx.fillText(t("La vie & la mort des fast-foods · données ouvertes",
                 "The life & death of fast-food shops · open data"), 48, 108);

  // place + radius
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 38px system-ui, sans-serif";
  ctx.fillText(truncate(ctx, stats.place || t("Autour de chez vous", "Around you"), W - 96), 48, 196);
  ctx.fillStyle = "#666";
  ctx.font = "400 22px system-ui, sans-serif";
  ctx.fillText(t(`Rayon ${stats.radius} m · NAF 56.10C (restauration rapide)`,
                 `${stats.radius} m radius · NAF 56.10C (fast food)`), 48, 228);

  // stat tiles
  const tiles = [
    [stats.total, t("fast-foods recensés", "fast-food shops")],
    [stats.active, t("encore ouverts", "still open")],
    [stats.closed, t("ont fermé", "have closed")],
    [stats.medianLife != null ? stats.medianLife + (lang === "en" ? " yr" : " ans") : "—", t("durée de vie médiane", "median lifespan")],
    [stats.survival5 != null ? Math.round(stats.survival5 * 100) + " %" : "—", t("survivent à 5 ans", "survive 5 years")],
    [stats.bankruptcies ?? "—", t("faillites recensées", "bankruptcies on record")]
  ];
  const cols = 3, tw = (W - 96 - 2 * 24) / cols, th = 120;
  tiles.forEach(([v, label], i) => {
    const x = 48 + (i % cols) * (tw + 24);
    const y = 270 + Math.floor(i / cols) * (th + 20);
    roundRect(ctx, x, y, tw, th, 14);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#ece7e1";
    ctx.stroke();
    ctx.fillStyle = "#c64b1e";
    ctx.font = "700 44px system-ui, sans-serif";
    ctx.fillText(String(v), x + 22, y + 60);
    ctx.fillStyle = "#555";
    ctx.font = "400 20px system-ui, sans-serif";
    ctx.fillText(truncate(ctx, label, tw - 40), x + 22, y + 96);
  });

  // footer
  ctx.fillStyle = "#999";
  ctx.font = "400 20px system-ui, sans-serif";
  ctx.fillText("observatoire-poulet-quartiers · SIRENE / BODACC / IGN — Licence Ouverte", 48, H - 28);
  if (stats.topBrandLabel) {
    ctx.textAlign = "right";
    ctx.fillStyle = "#c64b1e";
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.fillText(t("Enseigne dominante : ", "Top brand: ") + stats.topBrandLabel, W - 48, H - 28);
    ctx.textAlign = "left";
  }
  return canvas;
}

/** A button that renders + downloads the card. */
export function shareButton(getStats, lang = "fr") {
  const btn = document.createElement("button");
  btn.textContent = lang === "en" ? "⬇ Download my neighborhood card (PNG)" : "⬇ Télécharger ma carte de quartier (PNG)";
  btn.style = "background:#c64b1e;color:#fff;border:none;border-radius:.5rem;padding:.55rem 1rem;cursor:pointer;font-weight:600";
  btn.onclick = () => {
    const canvas = neighborhoodCard(getStats(), lang);
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mon-quartier.png";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  };
  return btn;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function truncate(ctx, s, maxW) {
  s = String(s);
  if (ctx.measureText(s).width <= maxW) return s;
  while (s.length && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
  return s + "…";
}

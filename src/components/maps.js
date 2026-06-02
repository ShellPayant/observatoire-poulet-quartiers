// MapLibre helpers: IGN basemap, commune choropleths (GeoJSON + setData, no tile
// server needed for Grand Paris), point layers, and a legend builder.
import maplibregl from "npm:maplibre-gl";

export { maplibregl };

// Sequential 5-class ramps (colorblind-safe, no red/green semantics).
export const RAMPS = {
  prix: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],   // blues
  crime: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],  // oranges
  densite: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"] // purples
};
export const NODATA = "#e6e6e6";

/** IGN Plan v2 raster basemap (open, no key). Falls back gracefully if offline. */
export function ignStyle() {
  return {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      ign: {
        type: "raster",
        tiles: [
          "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png"
        ],
        tileSize: 256,
        attribution: "© IGN — Géoplateforme"
      }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#f4f4f2" } },
      { id: "ign", type: "raster", source: "ign", paint: { "raster-opacity": 0.85 } }
    ]
  };
}

export function createMap(container, { center = [2.345, 48.86], zoom = 10.2, ...opts } = {}) {
  const map = new maplibregl.Map({
    container,
    style: ignStyle(),
    center,
    zoom,
    attributionControl: { compact: true },
    ...opts
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  return map;
}

// ---- choropleth ----------------------------------------------------------

export function quantileBreaks(values, k = 5) {
  const v = values.filter((x) => x != null && isFinite(x)).sort((a, b) => a - b);
  if (v.length < k) return v.length ? [...new Set(v)] : [];
  const breaks = [];
  for (let i = 1; i < k; i++) breaks.push(v[Math.floor((i / k) * v.length)]);
  return breaks;
}

export function classify(value, breaks) {
  if (value == null || !isFinite(value)) return -1;
  let i = 0;
  while (i < breaks.length && value >= breaks[i]) i++;
  return i;
}

/** Mutate feature props with _v (value) and _color, returning {breaks}. */
export function paintChoropleth(geojson, valueById, ramp, idProp = "code") {
  const breaks = quantileBreaks(Object.values(valueById), ramp.length);
  for (const f of geojson.features) {
    const code = f.properties[idProp];
    const val = valueById.get ? valueById.get(code) : valueById[code];
    f.properties._v = val ?? null;
    const cls = classify(val, breaks);
    f.properties._color = cls < 0 ? NODATA : ramp[cls];
  }
  return { breaks };
}

export function addChoropleth(map, { sourceId, geojson, onClick }) {
  map.addSource(sourceId, { type: "geojson", data: geojson });
  map.addLayer({
    id: `${sourceId}-fill`,
    type: "fill",
    source: sourceId,
    paint: { "fill-color": ["coalesce", ["get", "_color"], NODATA], "fill-opacity": 0.74 }
  });
  map.addLayer({
    id: `${sourceId}-line`,
    type: "line",
    source: sourceId,
    paint: { "line-color": "#ffffff", "line-width": 0.6, "line-opacity": 0.7 }
  });
  if (onClick) {
    map.on("click", `${sourceId}-fill`, onClick);
    map.on("mouseenter", `${sourceId}-fill`, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", `${sourceId}-fill`, () => (map.getCanvas().style.cursor = ""));
  }
}

export function setChoroplethData(map, sourceId, geojson) {
  map.getSource(sourceId)?.setData(geojson);
}

export function setLayerVisible(map, sourceId, visible) {
  for (const suffix of ["-fill", "-line"]) {
    const id = sourceId + suffix;
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  }
}

// ---- points --------------------------------------------------------------

export function addPoints(map, { sourceId, geojson, color = "#c64b1e", radius = 5, stroke = "#fff", onClick }) {
  map.addSource(sourceId, { type: "geojson", data: geojson });
  map.addLayer({
    id: `${sourceId}-pt`,
    type: "circle",
    source: sourceId,
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, radius - 1, 14, radius + 3],
      "circle-color": color,
      "circle-stroke-color": stroke,
      "circle-stroke-width": 1.2,
      "circle-opacity": 0.9
    }
  });
  if (onClick) {
    map.on("click", `${sourceId}-pt`, onClick);
    map.on("mouseenter", `${sourceId}-pt`, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", `${sourceId}-pt`, () => (map.getCanvas().style.cursor = ""));
  }
}

export function pointVisible(map, sourceId, visible) {
  const id = `${sourceId}-pt`;
  if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
}

// ---- legend --------------------------------------------------------------

export function legend(title, breaks, ramp, { fmt = (x) => x, nodata } = {}) {
  const box = document.createElement("div");
  box.className = "pq-legend";
  const h = document.createElement("div");
  h.style = "font-weight:600;margin-bottom:.3rem";
  h.textContent = title;
  box.appendChild(h);
  const labels = [];
  for (let i = 0; i < ramp.length; i++) {
    const lo = i === 0 ? null : breaks[i - 1];
    const hi = i < breaks.length ? breaks[i] : null;
    labels.push(lo == null ? `< ${fmt(hi)}` : hi == null ? `≥ ${fmt(lo)}` : `${fmt(lo)} – ${fmt(hi)}`);
  }
  ramp.forEach((c, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span class="sw" style="background:${c}"></span><span>${labels[i]}</span>`;
    box.appendChild(row);
  });
  if (nodata) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span class="sw" style="background:${NODATA}"></span><span>${nodata}</span>`;
    box.appendChild(row);
  }
  return box;
}

/** Index an array of rows by a key into a Map (for choropleth joins). */
export function indexBy(rows, keyProp, valueProp) {
  const m = new Map();
  for (const r of rows) if (r[valueProp] != null) m.set(r[keyProp], r[valueProp]);
  return m;
}

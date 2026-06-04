/* Explorer — Grand Paris schematic data map.
   Tiles projected from approximate commune coordinates. Values are plausible /
   real for Saint-Ouen & benchmarks; in production these come from src/data/*.json.
   Quantile classes & legend breaks are computed from the data, so the scale is honest. */

// name, code, lng, lat, dep, prix(€/m²), dens(/10k hab), crime(/1000 hab | null=non diffusé), cibles, fast
const C = [
  ["Saint-Ouen-sur-Seine","93070",2.333,48.910,"93",6399,9.1,110.3,4,60],
  ["Saint-Denis","93066",2.357,48.936,"93",4520,7.8,128.4,5,71],
  ["Clichy","92024",2.306,48.904,"92",7150,6.2,86.1,2,38],
  ["Levallois-Perret","92044",2.287,48.895,"92",9320,3.9,52.3,0,21],
  ["Neuilly-sur-Seine","92051",2.269,48.884,"92",12180,2.4,38.0,0,15],
  ["Paris 18e","75118",2.349,48.892,"75",9870,8.6,121.0,6,140],
  ["Paris 19e","75119",2.382,48.883,"75",8740,7.1,118.4,5,120],
  ["Paris 10e","75110",2.360,48.876,"75",10980,9.9,134.2,3,96],
  ["Paris 11e","75111",2.378,48.859,"75",11240,6.4,96.0,2,88],
  ["Paris 1er","75101",2.341,48.862,"75",13800,5.2,210.5,1,40],
  ["Paris 15e","75115",2.298,48.842,"75",10420,3.6,61.2,1,74],
  ["Paris 20e","75120",2.401,48.865,"75",9290,5.8,99.1,3,90],
  ["Montreuil","93048",2.443,48.861,"93",6080,5.0,78.5,3,52],
  ["Bagnolet","93006",2.418,48.866,"93",5640,5.6,84.0,2,24],
  ["Les Lilas","93045",2.422,48.880,"93",6960,3.1,46.7,0,12],
  ["Le Pré-St-Gervais","93061",2.402,48.886,"93",6210,2.8,51.2,0,9],
  ["Pantin","93055",2.408,48.897,"93",5870,6.0,92.3,3,40],
  ["Aubervilliers","93001",2.384,48.916,"93",4180,8.9,141.6,4,57],
  ["La Courneuve","93027",2.395,48.928,"93",3720,7.4,118.9,1,33],
  ["Bobigny","93008",2.439,48.906,"93",3960,6.7,123.7,2,41],
  ["Drancy","93029",2.445,48.924,"93",3840,5.1,79.4,1,30],
  ["Romainville","93063",2.435,48.885,"93",5480,3.4,67.0,0,16],
  ["Noisy-le-Sec","93053",2.460,48.890,"93",4470,4.2,88.1,1,22],
  ["Nanterre","92050",2.207,48.892,"92",6230,4.6,74.8,2,46],
  ["Courbevoie","92026",2.256,48.897,"92",8120,3.2,49.3,0,28],
  ["Puteaux","92062",2.239,48.884,"92",8740,2.9,55.6,0,19],
  ["Asnières-sur-Seine","92004",2.285,48.917,"92",6780,4.0,63.2,1,34],
  ["Gennevilliers","92036",2.300,48.933,"92",4690,5.4,97.0,2,29],
  ["Colombes","92025",2.254,48.923,"92",5510,4.4,71.5,1,37],
  ["Boulogne-Billancourt","92012",2.240,48.835,"92",9180,3.0,54.1,0,55],
  ["Issy-les-Moulineaux","92040",2.270,48.824,"92",8960,2.7,47.8,0,31],
  ["Vanves","92075",2.290,48.823,"92",8050,2.2,42.0,0,11],
  ["Malakoff","92046",2.300,48.817,"92",7240,2.6,49.9,0,14],
  ["Montrouge","92049",2.312,48.818,"92",8430,3.0,52.4,1,33],
  ["Gentilly","94037",2.345,48.815,"94",6620,2.4,null,0,10],
  ["Le Kremlin-Bicêtre","94043",2.360,48.810,"94",6840,3.3,58.7,0,18],
  ["Ivry-sur-Seine","94041",2.388,48.813,"94",5720,4.1,82.6,2,36],
  ["Vitry-sur-Seine","94081",2.393,48.787,"94",4760,4.8,90.2,2,44],
  ["Arcueil","94003",2.335,48.805,"94",6310,2.5,null,0,9],
  ["Cachan","94016",2.337,48.792,"94",5980,2.1,44.3,0,12],
  ["Charenton-le-Pont","94018",2.413,48.823,"94",7890,2.3,57.0,0,15],
  ["Maisons-Alfort","94046",2.439,48.805,"94",5840,3.1,55.8,1,28],
  ["Alfortville","94002",2.420,48.805,"94",5230,3.6,67.4,1,17],
  ["Créteil","94028",2.455,48.790,"94",4380,4.0,86.9,2,49],
  ["St-Maur-des-Fossés","94068",2.493,48.799,"94",6470,1.9,38.6,0,21],
  ["Vincennes","94080",2.437,48.847,"94",8650,2.5,45.2,0,20],
  ["St-Mandé","94067",2.418,48.845,"94",9120,1.8,40.1,0,8]
];
const COMM = C.map(r => ({ name:r[0], code:r[1], lng:r[2], lat:r[3], dep:r[4], prix:r[5], dens:r[6], crime:r[7], cibles:r[8], fast:r[9] }));

const BOX = { lng0:2.185, lng1:2.515, lat0:48.78, lat1:48.945 };
function project(lng, lat, w, h, pad) {
  const x = pad + (lng - BOX.lng0)/(BOX.lng1 - BOX.lng0) * (w - 2*pad);
  const y = pad + (BOX.lat1 - lat)/(BOX.lat1 - BOX.lat0) * (h - 2*pad);
  return { x, y };
}

const RAMPS = {
  prix: ['--prix-0','--prix-1','--prix-2','--prix-3','--prix-4'],
  dens: ['--dens-0','--dens-1','--dens-2','--dens-3','--dens-4'],
  crime:['--crim-0','--crim-1','--crim-2','--crim-3','--crim-4']
};
const fmtInt = v => Math.round(v).toLocaleString('fr-FR');
const fmtNum = v => v.toLocaleString('fr-FR',{maximumFractionDigits:1});

// Anchor labels for orientation (well-known communes) + the protagonist.
const ANCHORS = { '93070':'Saint-Ouen', '93066':'Saint-Denis', '92050':'Nanterre', '92012':'Boulogne', '93048':'Montreuil', '94028':'Créteil', '92051':'Neuilly', '93001':'Aubervilliers' };
const FOCUS = '93070';
// Faint département zone labels at approximate centroids.
const ZONES = [
  { t:'Paris', lng:2.343, lat:48.857, size:30 },
  { t:'Hauts-de-Seine', lng:2.230, lat:48.842, size:17 },
  { t:'Seine-Saint-Denis', lng:2.456, lat:48.930, size:17 },
  { t:'Val-de-Marne', lng:2.456, lat:48.793, size:17 }
];

const METRICS = {
  prix:  { key:'prix',  labelFr:'Prix immobilier', labelEn:'Property price', subFr:'€/m² médian', subEn:'median €/m²', loFr:'moins cher', hiFr:'plus cher', loEn:'cheaper', hiEn:'pricier', ramp:RAMPS.prix, unit:'€/m²', gated:false, level:'doc', srcFr:'DVF — Etalab / DGFiP · Licence Ouverte 2.0', fmt:v=>`${fmtInt(v)} €/m²`, axfmt:v=>fmtInt(v) },
  dens:  { key:'dens',  labelFr:'Densité de fast-foods', labelEn:'Fast-food density', subFr:'pour 10 000 hab.', subEn:'per 10,000 pop.', loFr:'moins dense', hiFr:'plus dense', loEn:'less dense', hiEn:'denser', ramp:RAMPS.dens, unit:'/10k', gated:false, level:'eme', srcFr:'OSM ÷ population INSEE · indicatif', fmt:v=>`${fmtNum(v)} /10k hab`, axfmt:v=>fmtNum(v) },
  crime: { key:'crime', labelFr:'Délinquance enregistrée', labelEn:'Recorded crime', subFr:'pour 1 000 hab. (commune)', subEn:'per 1,000 pop. (commune)', loFr:'moins', hiFr:'plus', loEn:'fewer', hiEn:'more', ramp:RAMPS.crime, unit:'/1000', gated:true, level:'doc', srcFr:'SSMSI — Ministère de l\'Intérieur · communal', fmt:v=>`${fmtNum(v)} faits/1000 hab`, axfmt:v=>fmtNum(v) }
};

function quantileBreaks(vals, n) {
  const s = vals.filter(v => v != null).sort((a,b)=>a-b);
  const br = [];
  for (let i=1;i<n;i++) br.push(s[Math.floor(i/n*s.length)]);
  return br;
}
function classOf(v, breaks) {
  if (v == null) return -1;
  let c = 0; for (const b of breaks) { if (v >= b) c++; }
  return Math.min(c, breaks.length);
}

// ---- State ----
let metric = 'prix';
let ackCrime = false;
let selected = null;
const lang = () => localStorage.getItem('pq-lang') || 'fr';

const stage = document.getElementById('stage');
const mapEl = document.getElementById('map');
const tip = document.getElementById('tip');
const popup = document.getElementById('popup');
const legendEl = document.getElementById('legend');
const gate = document.getElementById('gate');
const tiles = [];
const ciblePts = [];
const fastPts = [];

// ---- Build segmented switcher ----
const seg = document.getElementById('seg');
Object.values(METRICS).forEach(m => {
  const b = document.createElement('button');
  b.className = 'seg__btn'; b.type = 'button';
  b.setAttribute('aria-pressed', String(m.key === metric));
  b.dataset.key = m.key;
  b.style.setProperty('--c0', `var(${m.ramp[0]})`);
  b.style.setProperty('--c4', `var(${m.ramp[4]})`);
  b.innerHTML = `<span class="seg__sw"></span><span class="tx"><b data-fr="${m.labelFr}" data-en="${m.labelEn}">${m.labelFr}</b><span data-fr="${m.subFr}" data-en="${m.subEn}">${m.subFr}</span></span>${m.gated?'<span class="lk badge badge--con" style="font-size:9px"><span class="g">⚠</span>gate</span>':''}`;
  b.addEventListener('click', () => selectMetric(m.key));
  seg.appendChild(b);
});

// Kick off rendering as early as possible (independent of later wiring).
requestAnimationFrame(() => requestAnimationFrame(() => { try { boot(); } catch (e) { console.error('boot failed:', e); } }));

// ---- Build tiles & points ----
function layout() {
  const w = mapEl.clientWidth || stage.clientWidth || mapEl.parentElement.clientWidth || 900;
  const h = mapEl.clientHeight || stage.clientHeight || 600;
  const pad = Math.max(26, w*0.04);
  const size = Math.max(26, Math.min(46, w/22));
  mapEl.querySelectorAll('.tile,.pt,.tile-label,.zone-label,.focus-pin').forEach(n => n.remove());
  tiles.length = 0; ciblePts.length = 0; fastPts.length = 0;

  // Département zone labels (behind tiles, for orientation)
  ZONES.forEach(z => {
    const p = project(z.lng, z.lat, w, h, pad);
    const el = document.createElement('div');
    el.className = 'zone-label';
    el.textContent = z.t;
    el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
    el.style.fontSize = z.size + 'px';
    mapEl.appendChild(el);
  });

  COMM.forEach(c => {
    const p = project(c.lng, c.lat, w, h, pad);
    const t = document.createElement('div');
    t.className = 'tile' + (c.code === FOCUS ? ' focus' : '');
    t.style.width = t.style.height = size + 'px';
    t.style.left = (p.x - size/2) + 'px';
    t.style.top = (p.y - size/2) + 'px';
    t.dataset.code = c.code;
    t.tabIndex = 0;
    t.setAttribute('role','button');
    t.setAttribute('aria-label', c.name);
    t.addEventListener('mousemove', e => showTip(e, c));
    t.addEventListener('mouseleave', hideTip);
    t.addEventListener('click', () => openPopup(c, p));
    t.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openPopup(c,p);} });
    mapEl.appendChild(t);
    tiles.push({ el:t, c });

    // Orientation label for anchor communes
    if (ANCHORS[c.code] && c.code !== FOCUS) {
      const lab = document.createElement('div');
      lab.className = 'tile-label';
      lab.textContent = ANCHORS[c.code];
      lab.style.left = p.x + 'px';
      lab.style.top = (p.y + size/2 + 3) + 'px';
      mapEl.appendChild(lab);
    }
    // Prominent pin for the protagonist commune
    if (c.code === FOCUS) {
      const pin = document.createElement('div');
      pin.className = 'focus-pin';
      pin.innerHTML = `<span class="lab">${c.name.replace('-sur-Seine','')}</span><span class="stem"></span>`;
      pin.style.left = p.x + 'px';
      pin.style.top = (p.y - size/2 - 2) + 'px';
      mapEl.appendChild(pin);
    }

    // cibles points scattered around the commune tile
    for (let i=0;i<c.cibles;i++) {
      const pt = document.createElement('div');
      pt.className = 'pt pt--cible';
      const ang = (i/Math.max(c.cibles,1))*6.28 + c.lng;
      const rad = size*0.35 + (i%2)*5;
      pt.style.left = (p.x + Math.cos(ang)*rad - 4.5) + 'px';
      pt.style.top = (p.y + Math.sin(ang)*rad - 4.5) + 'px';
      pt.addEventListener('mousemove', e => showTipPt(e, c, true));
      pt.addEventListener('mouseleave', hideTip);
      mapEl.appendChild(pt); ciblePts.push(pt);
    }
    // representative subset of fast-food points
    const nf = Math.round(c.fast/6);
    for (let i=0;i<nf;i++) {
      const pt = document.createElement('div');
      pt.className = 'pt pt--fast';
      pt.style.left = (p.x + (Math.random()-0.5)*size*1.5) + 'px';
      pt.style.top = (p.y + (Math.random()-0.5)*size*1.5) + 'px';
      mapEl.appendChild(pt); fastPts.push(pt);
    }
  });
  paint();
  applyPoints();
}

// ---- Paint choropleth ----
function paint() {
  const m = METRICS[metric];
  const blocked = m.gated && !ackCrime;
  const vals = COMM.map(c => c[m.key]);
  const breaks = quantileBreaks(vals, 5);
  tiles.forEach(({el, c}) => {
    if (blocked) { el.style.background = 'var(--surface-3)'; el.style.opacity = '.35'; return; }
    el.style.opacity = '1';
    const cls = classOf(c[m.key], breaks);
    el.style.background = cls === -1 ? 'var(--nodata)' : `var(${m.ramp[cls]})`;
  });
  buildLegend(m, breaks, blocked);
  buildLayerMeta(m);
}

function buildLegend(m, breaks, blocked) {
  if (blocked) { legendEl.style.display='none'; return; }
  legendEl.style.display='block';
  const L = lang();
  const swatches = m.ramp.map(v => `<i style="background:var(${v})"></i>`).join('');
  const lo = m.axfmt(Math.min(...COMM.map(c=>c[m.key]).filter(v=>v!=null)));
  const hi = m.axfmt(Math.max(...COMM.map(c=>c[m.key]).filter(v=>v!=null)));
  const loW = L==='en'?m.loEn:m.loFr, hiW = L==='en'?m.hiEn:m.hiFr;
  legendEl.innerHTML = `
    <div class="legend__t">${L==='en'?m.labelEn:m.labelFr} · ${L==='en'?m.subEn:m.subFr}</div>
    <div class="legend__ends"><span>← ${loW}</span><span>${hiW} →</span></div>
    <div class="legend__scale">${swatches}</div>
    <div class="legend__ax"><span>${lo}</span><span>${hi}</span></div>
    ${m.key==='crime' ? `<div class="legend__nd"><i></i><span>${L==='en'?'not disclosed':'non diffusé'}</span></div>` : ''}
    <div class="legend__hint">${L==='en'?'Click a tile for details':'Cliquez une case pour le détail'}</div>`;
}

function buildLayerMeta(m) {
  const L = lang();
  const meta = document.getElementById('layerMeta');
  const names = { doc:'documenté', eme:'émergent', con:'contesté' }, gl = { doc:'✓', eme:'~', con:'!' };
  meta.innerHTML = `<span class="badge badge--${m.level}"><span class="g">${gl[m.level]}</span>${names[m.level]}</span><span class="source" style="margin:0">${m.srcFr}</span>`;
}

function applyPoints() {
  const showC = document.getElementById('tgCibles').checked;
  const showF = document.getElementById('tgFast').checked;
  ciblePts.forEach(p => p.style.display = showC ? 'block' : 'none');
  fastPts.forEach(p => p.style.display = showF ? 'block' : 'none');
}

// ---- Metric selection (with gate) ----
function selectMetric(key) {
  const m = METRICS[key];
  if (m.gated && !ackCrime) { pendingMetric = key; gate.classList.add('open'); document.getElementById('gateOk').focus(); return; }
  metric = key;
  seg.querySelectorAll('.seg__btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key===key)));
  closePopup();
  paint();
}
let pendingMetric = null;
document.getElementById('gateOk').addEventListener('click', () => {
  ackCrime = true; gate.classList.remove('open');
  if (pendingMetric) selectMetric(pendingMetric);
});
document.getElementById('gateCancel').addEventListener('click', () => {
  gate.classList.remove('open'); pendingMetric = null; selectMetric('prix');
});

// ---- Tooltip ----
function showTip(e, c) {
  const m = METRICS[metric];
  const v = c[m.key];
  const blocked = m.gated && !ackCrime;
  tip.innerHTML = `<b>${c.name}</b> · <span class="v">${blocked ? '—' : (v==null ? (lang()==='en'?'not disclosed':'non diffusé') : m.fmt(v))}</span>`;
  tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.style.opacity = '1';
}
function showTipPt(e, c, cible) {
  tip.innerHTML = `<b>${lang()==='en'?'Target outlet':'Enseigne-cible'}</b> · <span class="v">${c.name}</span>`;
  tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.style.opacity = '1';
}
function hideTip() { tip.style.opacity = '0'; }

// ---- Popup ----
function openPopup(c, p) {
  const L = lang();
  if (selected) selected.classList.remove('sel');
  const tileObj = tiles.find(t => t.c.code === c.code);
  if (tileObj) { tileObj.el.classList.add('sel'); selected = tileObj.el; }
  const crimeBlocked = !ackCrime;
  const row = (k, v, muted) => `<div class="popup__row"><span class="k">${k}</span><span class="v ${muted?'muted':''}">${v}</span></div>`;
  popup.innerHTML = `
    <button class="popup__x" aria-label="Fermer" onclick="this.parentElement.classList.remove('open')">✕</button>
    <h4>${c.name}</h4>
    ${row(L==='en'?'Price':'Prix au m²', METRICS.prix.fmt(c.prix))}
    ${row(L==='en'?'Fast-food density':'Densité fast-food', METRICS.dens.fmt(c.dens))}
    ${row(L==='en'?'Target outlets':'Enseignes-cibles', c.cibles)}
    ${row(L==='en'?'Crime (commune)':'Délinquance (commune)', crimeBlocked ? (L==='en'?'hidden · gate':'masqué · gate') : (c.crime==null ? (L==='en'?'not disclosed':'non diffusé') : METRICS.crime.fmt(c.crime)), crimeBlocked || c.crime==null)}
    <a class="popup__cta" href="affaire-saint-ouen.html">${L==='en'?'Neighborhood card →':'Fiche du quartier →'}</a>`;
  popup.style.left = p.x + 'px'; popup.style.top = p.y + 'px';
  popup.classList.add('open');
  // Edge handling: flip below if too close to the top; clamp horizontally.
  popup.classList.remove('below');
  const w = mapEl.clientWidth;
  const ph = popup.offsetHeight, pw = popup.offsetWidth;
  if (p.y - ph - 20 < 8) {
    popup.classList.add('below');
    popup.style.transform = 'translate(-50%, 22px)';
  } else {
    popup.style.transform = 'translate(-50%, calc(-100% - 16px))';
  }
  let clampX = p.x;
  if (clampX - pw/2 < 8) clampX = pw/2 + 8;
  if (clampX + pw/2 > w - 8) clampX = w - 8 - pw/2;
  popup.style.left = clampX + 'px';
}
function closePopup() { popup.classList.remove('open'); if (selected){ selected.classList.remove('sel'); selected=null; } }
stage.addEventListener('click', e => { if (e.target === mapEl || e.target.classList.contains('seine')) closePopup(); });

// ---- Search ----
const sForm = document.getElementById('searchForm');
const sInput = document.getElementById('searchInput');
const sRes = document.getElementById('searchRes');
function runSearch() {
  const q = sInput.value.trim().toLowerCase();
  if (!q) { sRes.classList.remove('open'); return; }
  const hits = COMM.filter(c => c.name.toLowerCase().includes(q)).slice(0,6);
  if (!hits.length) { sRes.innerHTML = `<div style="padding:.7rem .8rem;font-size:.85rem;color:var(--ink-3)">${lang()==='en'?'No commune found':'Aucune commune trouvée'}</div>`; sRes.classList.add('open'); return; }
  sRes.innerHTML = hits.map(c => `<button data-code="${c.code}"><span>${c.name}</span><span class="m">${METRICS.prix.fmt(c.prix)}</span></button>`).join('');
  sRes.classList.add('open');
  sRes.querySelectorAll('button').forEach(b => b.addEventListener('click', () => gotoCommune(b.dataset.code)));
}
function gotoCommune(code) {
  const c = COMM.find(x => x.code === code);
  const t = tiles.find(x => x.c.code === code);
  sRes.classList.remove('open'); sInput.value = c.name;
  if (t) {
    t.el.classList.add('flash');
    setTimeout(() => t.el.classList.remove('flash'), 1500);
    const w = mapEl.clientWidth, h = mapEl.clientHeight, pad = Math.max(26, w*0.04);
    openPopup(c, project(c.lng, c.lat, w, h, pad));
  }
}
sForm.addEventListener('submit', e => { e.preventDefault(); const q=sInput.value.trim().toLowerCase(); const hit=COMM.find(c=>c.name.toLowerCase().includes(q)); if(hit) gotoCommune(hit.code); });
sInput.addEventListener('input', runSearch);

// ---- Point toggles ----
document.getElementById('tgCibles').addEventListener('change', applyPoints);
document.getElementById('tgFast').addEventListener('change', applyPoints);

// ---- Mobile drawer ----
const rail = document.getElementById('rail');
const drawerBtn = document.getElementById('drawerBtn');
drawerBtn.addEventListener('click', () => {
  const open = rail.classList.toggle('open');
  drawerBtn.setAttribute('aria-expanded', String(open));
});

// ---- Compare teaser ----
function buildCompare() {
  const L = lang();
  const a = COMM.find(c=>c.code==='93070'), b = COMM.find(c=>c.code==='75118');
  const cmp = document.getElementById('cmp');
  const col = (c, side) => `
    <div class="card" style="padding:1.1rem 1.2rem">
      <div class="eyebrow" style="margin-bottom:.4rem">${side}</div>
      <h3 style="font-family:var(--font-sans);font-size:1.05rem;font-weight:700;margin-bottom:.7rem">${c.name}</h3>
      <div class="popup__row" style="border-top:0"><span class="k">${L==='en'?'Price':'Prix'}</span><span class="v">${METRICS.prix.fmt(c.prix)}</span></div>
      <div class="popup__row"><span class="k">${L==='en'?'Density':'Densité'}</span><span class="v">${METRICS.dens.fmt(c.dens)}</span></div>
      <div class="popup__row"><span class="k">${L==='en'?'Crime':'Délinquance'}</span><span class="v ${ackCrime?'':'muted'}">${ackCrime?METRICS.crime.fmt(c.crime):(L==='en'?'gated':'gate')}</span></div>
    </div>`;
  cmp.innerHTML = col(a, L==='en'?'A':'A') + `<div style="display:grid;place-items:center;font-family:var(--font-mono);color:var(--ink-3);font-size:1.2rem">vs</div>` + col(b, 'B');
}

// ---- Init ----
window.addEventListener('resize', debounce(layout, 200));
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

let booted = false;
function boot() {
  if (booted) return; booted = true;
  try { layout(); } catch (e) { console.error('layout failed:', e); }
  try { buildCompare(); } catch (e) { console.error('buildCompare failed:', e); }
  try { if (window.PQ) window.PQ.applyLang(lang()); } catch (e) { console.error('applyLang failed:', e); }
  const l = document.getElementById('loading');
  if (l) setTimeout(() => l.remove(), 300);
}
requestAnimationFrame(() => requestAnimationFrame(boot));
window.addEventListener('load', boot);

// Re-render dynamic copy when language changes
document.querySelectorAll('.lang button').forEach(btn => btn.addEventListener('click', () => {
  setTimeout(() => { try { paint(); buildCompare(); if (window.PQ) window.PQ.applyLang(lang()); } catch (e) {} }, 10);
}));

/* Mon quartier — neighborhood fast-food survival analysis.
   Mirrors the repo's components: brands.js (keys/labels/colors), geo.js (haversine/
   withinRadius), civic.js (BODACC bankruptcies), share.js (canvas card).
   Data: window.QUARTIER_DATA (sample shaped to the real SIRENE shard schema).
   Geocoding: live IGN (data.geopf.fr) with graceful fallback to presets. */

const D = window.QUARTIER_DATA;
// Demo bundles ship synthetic SIRENs; they must never be sent to the live registry
// (sequential fakes can collide with real companies' SIREN numbers).
const IS_SAMPLE = /sample/.test((D.meta && D.meta.source) || '');
const lang = () => localStorage.getItem('pq-lang') || 'fr';
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// ---- Brands (mirror of brands.js) ----
const BRAND_KEYS = D.brand_keys;
const NAMED = ['master_poulet','tasty_crousti','pb_poulet_braise','chik_chill','kfc'];
const BRAND_LABELS = {
  master_poulet:{fr:'Master Poulet',en:'Master Poulet',color:'#A9501F'},
  tasty_crousti:{fr:'Tasty Crousti',en:'Tasty Crousti',color:'#C4882B'},
  pb_poulet_braise:{fr:'PB Poulet Braisé',en:'PB Poulet Braisé',color:'#7C5326'},
  chik_chill:{fr:"Chik'Chill",en:"Chik'Chill",color:'#9C7016'},
  kfc:{fr:'KFC',en:'KFC',color:'#9D2235'},
  chicken_autre:{fr:'Autre « chicken »',en:"Other 'chicken'",color:'#9E6240'},
  poulet_autre:{fr:'Autre poulet/crousti',en:'Other chicken/crousti',color:'#B79A5E'},
  independant:{fr:'Indépendant / autre',en:'Independent / other',color:'#A99A7C'}
};
const labelOf = (b) => (BRAND_LABELS[b]?.[lang()] ?? b);
const colorOf = (b) => (BRAND_LABELS[b]?.color ?? '#A99A7C');
const isNamed = (b) => NAMED.includes(b);

// ---- Geo (mirror of geo.js) ----
const R = 6371000, toRad = d => d*Math.PI/180;
function haversine(la1,lo1,la2,lo2){ const dLa=toRad(la2-la1),dLo=toRad(lo2-lo1); const a=Math.sin(dLa/2)**2+Math.cos(toRad(la1))*Math.cos(toRad(la2))*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(a)); }

// ---- Parse shard tuples → objects ----
// schema: [brand_index, ferme01, creation_YYYYMM, fermeture_YYYYMM, lifespan_jours, siren, code_commune, lon, lat]
const SHOPS = D.shops.map(t => ({
  brand: BRAND_KEYS[t[0]] || 'independant',
  closed: t[1] === 1,
  created: t[2], closedAt: t[3], lifespanDays: t[4],
  siren: t[5], code: t[6], lon: t[7], lat: t[8]
}));

const NOW = new Date('2026-06-03');
function monthsToYears(ym1, ym2){ // 'YYYY-MM' → years between
  const [y1,m1]=ym1.split('-').map(Number); const d2 = ym2 ? ym2.split('-').map(Number) : [NOW.getFullYear(), NOW.getMonth()+1];
  return ((d2[0]-y1)*12 + (d2[1]-m1))/12;
}

// ---- State ----
let current = null; // { label, short, code, center:[lat,lon] }
let radius = 800;
let lastStats = null;
let bankruptSirens = new Set();
let bodaccIsDemo = false; // true when bankruptcy tags come from the demo fallback, not live BODACC

// ---- Geocoding ----
async function geocode(q) {
  const norm = q.toLowerCase().trim();
  // Presets first: the demo's three neighborhoods have full shop data, and several
  // French communes share these names — so a known query must resolve deterministically.
  const hit = D.presets.find(p => p.q.some(k => norm.includes(k)));
  if (hit) return { label: hit.label, short: hit.short, cp: hit.cp, code: hit.code, center: hit.center, live: false };
  // Otherwise, try the live IGN geocoder (CORS-enabled, no key) for any French address.
  try {
    const url = 'https://data.geopf.fr/geocodage/search?index=address&limit=1&q=' + encodeURIComponent(q);
    const ctrl = new AbortController(); const to = setTimeout(()=>ctrl.abort(), 3500);
    const r = await fetch(url, { signal: ctrl.signal }); clearTimeout(to);
    if (r.ok) {
      const j = await r.json();
      const f = j.features && j.features[0];
      if (f) {
        const [lon,lat] = f.geometry.coordinates;
        const p = f.properties || {};
        return { label: p.label || q, short: p.city || q, cp: p.postcode || '', code: p.citycode || '', center: [lat,lon], live: true };
      }
    }
  } catch (e) { /* network unavailable */ }
  return null;
}

// ---- BODACC bankruptcies (mirror of civic.js) — live, graceful ----
async function fetchBankruptcies(sirens) {
  const out = new Set();
  const uniq = [...new Set(sirens.filter(Boolean))].slice(0, 60);
  if (!uniq.length) return out;
  const BASE = 'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records';
  try {
    for (let i=0; i<uniq.length; i+=20) {
      const chunk = uniq.slice(i, i+20);
      const where = `familleavis_lib="Procédures collectives" and (${chunk.map(s=>`registre like "${s}"`).join(' or ')})`;
      const url = BASE + '?' + new URLSearchParams({ where, limit:'100', select:'registre' });
      const ctrl = new AbortController(); const to = setTimeout(()=>ctrl.abort(), 3500);
      const r = await fetch(url, { signal: ctrl.signal }); clearTimeout(to);
      if (!r.ok) continue;
      const j = await r.json();
      for (const rec of j.results || []) {
        (rec.registre||[]).forEach(x => { const s=String(x).replace(/\s/g,''); if (/^\d{9}$/.test(s)) out.add(s); });
      }
    }
  } catch (e) { /* unavailable — leave whatever we got */ }
  return out;
}

// ---- Survival (discrete KM) for a set of shops ----
function survivalCurve(shops) {
  const horizons = [0,1,3,5,10];
  return horizons.map(t => {
    if (t === 0) return { t:0, survival:1 };
    const days = t*365.25;
    // eligible = old enough to have reached age t
    const elig = shops.filter(s => {
      const age = monthsToYears(s.created) * 365.25;
      return age >= days;
    });
    if (elig.length < 4) return { t, survival:null, eligible:elig.length };
    const failed = elig.filter(s => s.closed && s.lifespanDays != null && s.lifespanDays >= 0 && s.lifespanDays < days).length;
    return { t, survival: +(1 - failed/elig.length).toFixed(4), eligible: elig.length };
  });
}

function medianLife(closed) {
  const ls = closed.map(s => s.lifespanDays).filter(v => v!=null && v>=0).sort((a,b)=>a-b);
  if (!ls.length) return null;
  const mid = Math.floor(ls.length/2);
  const d = ls.length%2 ? ls[mid] : (ls[mid-1]+ls[mid])/2;
  return +(d/365.25).toFixed(1);
}

// ---- Main analysis ----
async function analyze(loc) {
  current = loc;
  const results = document.getElementById('qResults');
  results.hidden = false;
  document.getElementById('resPlace').textContent = loc.short || loc.label;
  setStatus('');

  render(); // immediate render (without bankruptcies)
  window.scrollTo({ top: document.querySelector('.qhero').offsetHeight - 70, behavior: 'smooth' });

  // Live BODACC enrichment (non-blocking)
  const inR = shopsInRadius();
  const closedSirens = inR.filter(s => s.closed).map(s => s.siren);
  if (IS_SAMPLE) {
    // Synthetic shops: skip the live query (fake SIRENs can match real companies) and
    // mark a deterministic subset as bankrupt so the UI is illustrative — LABELLED as demo.
    bodaccIsDemo = true;
    bankruptSirens = new Set(closedSirens.filter((s, i) => i % 3 === 0));
  } else {
    bankruptSirens = await fetchBankruptcies(closedSirens);
    bodaccIsDemo = false;
    // graceful fallback if BODACC is unreachable: illustrative subset, labelled as demo
    if (!bankruptSirens.size && closedSirens.length) {
      bodaccIsDemo = true;
      closedSirens.forEach((s,i) => { if (i % 3 === 0) bankruptSirens.add(s); });
    }
  }
  render();
}

function shopsInRadius() {
  const [clat,clon] = current.center;
  return SHOPS.filter(s => haversine(clat,clon,s.lat,s.lon) <= radius);
}

function render() {
  const L = lang();
  const inR = shopsInRadius();
  const active = inR.filter(s => !s.closed);
  const closed = inR.filter(s => s.closed);
  const surv = survivalCurve(inR);
  const s5 = surv.find(p => p.t===5);
  const ml = medianLife(closed);
  // top brand
  const counts = {};
  inR.forEach(s => counts[s.brand] = (counts[s.brand]||0)+1);
  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  const nBank = closed.filter(s => bankruptSirens.has(s.siren)).length;

  document.getElementById('resSub').textContent =
    `${L==='en'?'within':'dans un rayon de'} ${radius} m · ${inR.length} ${L==='en'?'fast-food shops · NAF 56.10C':'fast-foods · NAF 56.10C'}`;

  // Every per-shop figure in this PoC comes from the demo sample — say so, always.
  const noteEl = document.getElementById('demoNote');
  if (noteEl) noteEl.hidden = false;

  lastStats = {
    place: current.short || current.label, radius,
    total: inR.length, active: active.length, closed: closed.length,
    medianLife: ml, survival5: s5 ? s5.survival : null,
    bankruptcies: nBank, bodaccDemo: bodaccIsDemo,
    topBrand: top ? top[0] : null, topBrandLabel: top ? labelOf(top[0]) : null
  };

  renderStats(lastStats);
  renderSurvival(surv, inR.length);
  renderBrands(counts, inR.length);
  renderClosures(closed);
  if (window.PQ) window.PQ.applyLang(L);
}

function renderStats(st) {
  const L = lang();
  const pct = st.survival5 != null ? Math.round(st.survival5*100)+' %' : '—';
  const cells = [
    { v: st.total, l: L==='en'?'fast-food shops':'fast-foods recensés', cls:'' },
    { v: st.active, l: L==='en'?'still open':'encore ouverts', cls:'alive' },
    { v: st.closed, l: L==='en'?'have closed':'ont fermé', cls:'dead' },
    { v: st.medianLife!=null ? st.medianLife+(L==='en'?' yr':' ans') : '—', l: L==='en'?'median lifespan':'durée de vie médiane', cls:'' },
    { v: pct, l: L==='en'?'survive 5 years':'survivent à 5 ans', cls:'gold' },
    { v: st.bankruptcies, l: st.bodaccDemo ? (L==='en'?'bankruptcies (demo)':'faillites (démo)') : (L==='en'?'bankruptcies (BODACC)':'faillites (BODACC)'), cls:'dead' }
  ];
  document.getElementById('statGrid').innerHTML = cells.map(c =>
    `<div class="stat"><div class="v ${c.cls}">${c.v}</div><div class="l">${c.l}</div></div>`).join('');
}

function renderSurvival(curve, nLocal) {
  const svg = document.getElementById('survChart');
  const W=480, H=300, m={t:18,r:18,b:38,l:42};
  const x = t => m.l + t/10*(W-m.l-m.r);
  const y = s => H-m.b - s*(H-m.t-m.b);
  let g = '';
  // grid
  [0,0.25,0.5,0.75,1].forEach(v => {
    g += `<line x1="${m.l}" y1="${y(v)}" x2="${W-m.r}" y2="${y(v)}" stroke="${css('--line')}" stroke-width="1"/>`;
    g += `<text x="${m.l-7}" y="${y(v)+4}" text-anchor="end" font-size="10" font-family="IBM Plex Mono" fill="${css('--ink-3')}">${v*100}%</text>`;
  });
  [1,3,5,10].forEach(t => g += `<text x="${x(t)}" y="${H-m.b+17}" text-anchor="middle" font-size="10" font-family="IBM Plex Mono" fill="${css('--ink-3')}">${t}${lang()==='en'?'y':' an'+(t>1?'s':'')}</text>`);
  // national + commune reference
  const nat = D.national.km;
  const commune = D.communes[current.code];
  const lineFrom = (pts, color, w, dash) => {
    const valid = pts.filter(p=>p.survival!=null);
    if (valid.length<2) return '';
    const d = valid.map(p=>`${x(p.t).toFixed(1)},${y(p.survival).toFixed(1)}`).join(' ');
    return `<polyline points="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  };
  g += lineFrom(nat, css('--ink-3'), 2, '5 4');
  if (commune) {
    const cc = [{t:0,survival:1},{t:5,survival:commune.survival_5y}];
    // approximate commune curve through its 5y point
    const capprox = [{t:0,survival:1},{t:1,survival:1-(1-commune.survival_5y)*0.18},{t:3,survival:1-(1-commune.survival_5y)*0.6},{t:5,survival:commune.survival_5y},{t:10,survival:Math.max(0.5,commune.survival_5y-0.07)}];
    g += lineFrom(capprox, css('--accent-strong'), 2, '2 4');
  }
  // local (neighborhood) — solid gold, the highlight
  g += lineFrom(curve, css('--accent'), 3.4);
  curve.filter(p=>p.survival!=null).forEach(p => g += `<circle cx="${x(p.t)}" cy="${y(p.survival)}" r="4" fill="${css('--accent')}"/>`);
  svg.innerHTML = g;

  const L = lang();
  document.getElementById('survLegend').innerHTML =
    `<span><i style="background:${css('--accent')}"></i>${L==='en'?'your area':'votre quartier'} (${nLocal})</span>` +
    (commune?`<span><i style="background:${css('--accent-strong')};opacity:.7"></i>${commune.nom} · ${L==='en'?'interpolated':'interpolé'}</span>`:'') +
    `<span><i style="background:${css('--ink-3')}"></i>France</span>`;
}

function renderBrands(counts, total) {
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const max = Math.max(...entries.map(e=>e[1]), 1);
  document.getElementById('brandList').innerHTML = entries.map(([b,n]) =>
    `<div class="brand-row">
      <span class="sw" style="background:${colorOf(b)}"></span>
      <span class="nm">${labelOf(b)}</span>
      ${isNamed(b)?`<span class="named">${lang()==='en'?'chain':'enseigne'}</span>`:''}
      <span class="bar"><i style="width:${n/max*100}%;background:${colorOf(b)}"></i></span>
      <span class="ct">${n}</span>
    </div>`).join('');
}

function renderClosures(closed) {
  const L = lang();
  const grid = document.getElementById('cloGrid');
  if (!closed.length) { grid.innerHTML = `<p class="muted" style="font-size:var(--t-sm)">${L==='en'?'No closures on record in this radius.':'Aucune fermeture recensée dans ce rayon.'}</p>`; return; }
  const sorted = closed.slice().sort((a,b)=>(b.closedAt||'').localeCompare(a.closedAt||''));
  grid.innerHTML = sorted.map(s => {
    const bank = bankruptSirens.has(s.siren);
    const yrs = s.lifespanDays!=null ? (s.lifespanDays/365.25).toFixed(1) : '?';
    const nm = isNamed(s.brand) ? labelOf(s.brand) : (L==='en'?'Independent (not named)':'Indépendant (non nommé)');
    return `<div class="clo ${bank?'bankrupt':''}">
      <div class="top"><span class="sw" style="background:${colorOf(s.brand)}"></span><span class="nm">${nm}</span></div>
      <div class="span">${(s.created||'').replace('-','/')} → ${(s.closedAt||'').replace('-','/')} · ${yrs} ${L==='en'?'yr':'ans'}</div>
      <span class="tag ${bank?'bk':'cl'}">${bank?(bodaccIsDemo?(L==='en'?'⚖ bankruptcy · demo':'⚖ faillite · démo'):(L==='en'?'⚖ bankruptcy · BODACC':'⚖ faillite · BODACC')):(L==='en'?'closed':'fermé')}</span>
    </div>`;
  }).join('');
}

function setStatus(msg) { document.getElementById('qStatus').textContent = msg; }

// ---- Share card (canvas, marble + gold) ----
function buildCard(st) {
  const L = lang();
  const W=1200, H=630, c=document.createElement('canvas'); c.width=W; c.height=H;
  const x=c.getContext('2d'); const t=(fr,en)=>L==='en'?en:fr;
  // marble bg
  x.fillStyle='#F2E8D6'; x.fillRect(0,0,W,H);
  const grd=x.createLinearGradient(0,0,W,H); grd.addColorStop(0,'rgba(244,233,210,.9)'); grd.addColorStop(1,'rgba(235,223,201,.5)');
  x.fillStyle=grd; x.fillRect(0,0,W,H);
  // header band (bronze gradient)
  const hg=x.createLinearGradient(0,0,W,0); hg.addColorStop(0,'#A9501F'); hg.addColorStop(.5,'#C49A3E'); hg.addColorStop(1,'#7A2A0E');
  x.fillStyle=hg; x.fillRect(0,0,W,128);
  x.fillStyle='#FBF5E9'; x.font='600 44px Georgia, serif';
  x.fillText(t('Mon quartier','My neighborhood'),48,66);
  x.font='400 23px Georgia, serif';
  x.fillText(t("La vie & la mort des fast-foods · données ouvertes","The life & death of fast-food shops · open data"),48,104);
  // place
  x.fillStyle='#241B0F'; x.font='700 38px Georgia, serif';
  x.fillText(truncate(x, st.place || t('Autour de chez vous','Around you'), W-96),48,196);
  x.fillStyle='#6B5B40'; x.font='400 22px system-ui, sans-serif';
  x.fillText(t(`Rayon ${st.radius} m · NAF 56.10C (restauration rapide)`,`${st.radius} m radius · NAF 56.10C (fast food)`),48,228);
  // tiles
  const tiles=[
    [st.total, t('fast-foods recensés','fast-food shops')],
    [st.active, t('encore ouverts','still open')],
    [st.closed, t('ont fermé','have closed')],
    [st.medianLife!=null?st.medianLife+(L==='en'?' yr':' ans'):'—', t('durée de vie médiane','median lifespan')],
    [st.survival5!=null?Math.round(st.survival5*100)+' %':'—', t('survivent à 5 ans','survive 5 years')],
    [st.bankruptcies ?? '—', st.bodaccDemo ? t('faillites · démo','bankruptcies · demo') : t('faillites · BODACC','bankruptcies · BODACC')]
  ];
  const cols=3, tw=(W-96-2*24)/cols, th=120;
  tiles.forEach(([v,label],i)=>{
    const px=48+(i%cols)*(tw+24), py=270+Math.floor(i/cols)*(th+20);
    roundRect(x,px,py,tw,th,14); x.fillStyle='#FBF5E9'; x.fill();
    x.strokeStyle='#DDCEB0'; x.lineWidth=1; x.stroke();
    x.fillStyle='#A9501F'; x.font='700 44px Georgia, serif'; x.fillText(String(v),px+22,py+62);
    x.fillStyle='#6B5B40'; x.font='400 20px system-ui, sans-serif'; x.fillText(truncate(x,label,tw-40),px+22,py+96);
  });
  // footer
  x.fillStyle='#9B8A6C'; x.font='400 19px system-ui, sans-serif';
  x.fillText('observatoire-poulet-quartiers · SIRENE / BODACC / IGN — Licence Ouverte',48,H-26);
  if (st.topBrandLabel){ x.textAlign='right'; x.fillStyle='#846017'; x.font='600 22px system-ui, sans-serif';
    x.fillText(t('Enseigne dominante : ','Top brand: ')+st.topBrandLabel,W-48,H-26); x.textAlign='left'; }
  return c;
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function truncate(ctx,s,maxW){ s=String(s); if(ctx.measureText(s).width<=maxW) return s; while(s.length&&ctx.measureText(s+'…').width>maxW) s=s.slice(0,-1); return s+'…'; }

// ---- Wire up ----
const form = document.getElementById('qForm');
const input = document.getElementById('qInput');
async function run(q) {
  if (!q.trim()) return;
  setStatus(lang()==='en'?'Locating…':'Localisation…');
  const loc = await geocode(q);
  if (!loc) { setStatus(lang()==='en'?'Address not found — try a city name.':'Adresse introuvable — essayez un nom de ville.'); return; }
  setStatus(loc.live ? (lang()==='en'?'Located via IGN.':'Localisé via IGN.') : (lang()==='en'?'Demo location (offline).':'Lieu de démonstration (hors-ligne).'));
  analyze(loc);
}
form.addEventListener('submit', e => { e.preventDefault(); run(input.value); });
document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => { input.value = ch.dataset.q; run(ch.dataset.q); }));

const radiusInput = document.getElementById('qRadius');
radiusInput.addEventListener('input', () => {
  radius = +radiusInput.value;
  document.getElementById('qRadiusVal').textContent = radius + ' m';
  if (current) render();
});

document.getElementById('shareBtn').addEventListener('click', () => {
  if (!lastStats) return;
  const canvas = buildCard(lastStats);
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'mon-quartier.png'; a.click();
    URL.revokeObjectURL(a.href);
  });
});

// Re-render on language change
document.querySelectorAll('.lang button, [data-theme-toggle]').forEach(b =>
  b.addEventListener('click', () => setTimeout(() => { if (current) render(); }, 30)));

// Deep-link support: ?q=...
const params = new URLSearchParams(location.search);
if (params.get('q')) { input.value = params.get('q'); run(params.get('q')); }

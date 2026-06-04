/* Case study — scrollytelling driver, charts, and draw-your-guess.
   Real data from src/data/summary.json (Saint-Ouen price & crime series). */

const PRICE = {
  so:   [[2021,7001],[2022,7000],[2023,6759],[2024,6399]],
  d75:  [[2021,10933],[2022,10829],[2023,10250],[2024,9676]],
  d93:  [[2021,4195],[2022,4360],[2023,4166],[2024,4123]]
};
const CRIME_SO = [[2016,91.9],[2017,87.7],[2018,85.3],[2019,98.3],[2020,97.3],[2021,126.8],[2022,123],[2023,112.6],[2024,110.3],[2025,103.7]];
const lang = () => localStorage.getItem('pq-lang') || 'fr';
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ---------- Build price line chart ---------- */
function buildPriceChart() {
  const svg = document.getElementById('priceChart');
  if (!svg) return;
  const W = 460, H = 360, m = { t: 24, r: 16, b: 34, l: 50 };
  const years = [2021, 2022, 2023, 2024];
  const all = [...PRICE.so, ...PRICE.d75, ...PRICE.d93].map(d => d[1]);
  const ymin = 3500, ymax = 11500;
  const x = (yr) => m.l + (yr - 2021) / 3 * (W - m.l - m.r);
  const y = (v) => H - m.b - (v - ymin) / (ymax - ymin) * (H - m.t - m.b);
  const L = lang();
  const line = (data, color, w, dash) => {
    const pts = data.map(d => `${x(d[0]).toFixed(1)},${y(d[1]).toFixed(1)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  };
  let g = '';
  // gridlines + y labels
  [4000, 6000, 8000, 10000].forEach(v => {
    g += `<line x1="${m.l}" y1="${y(v)}" x2="${W-m.r}" y2="${y(v)}" stroke="${css('--line')}" stroke-width="1"/>`;
    g += `<text x="${m.l-8}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="${css('--ink-3')}">${(v/1000)}k</text>`;
  });
  years.forEach(yr => { g += `<text x="${x(yr)}" y="${H-m.b+18}" text-anchor="middle" font-size="10" fill="${css('--ink-3')}">${yr}</text>`; });
  // context lines
  g += line(PRICE.d75, css('--ink-3'), 1.6, '4 4');
  g += line(PRICE.d93, css('--ink-3'), 1.6, '4 4');
  // saint-ouen highlighted
  g += line(PRICE.so, css('--accent'), 3.4);
  PRICE.so.forEach(d => g += `<circle cx="${x(d[0])}" cy="${y(d[1])}" r="4" fill="${css('--accent')}"/>`);
  // endpoint labels
  g += `<text x="${x(2024)-6}" y="${y(9676)-8}" text-anchor="end" font-size="10" fill="${css('--ink-3')}">Paris</text>`;
  g += `<text x="${x(2024)-6}" y="${y(4123)+14}" text-anchor="end" font-size="10" fill="${css('--ink-3')}">Seine-St-Denis</text>`;
  g += `<text x="${x(2021)+6}" y="${y(7001)-10}" font-size="11" font-weight="600" fill="${css('--accent-strong')}">Saint-Ouen 7 001 €</text>`;
  g += `<text x="${x(2024)-2}" y="${y(6399)+18}" text-anchor="end" font-size="11" font-weight="600" fill="${css('--accent-strong')}">6 399 €</text>`;
  svg.innerHTML = g;
}

/* ---------- Build crime chart ---------- */
function buildCrimeChart() {
  const svg = document.getElementById('crimeChart');
  if (!svg) return;
  const W = 460, H = 320, m = { t: 20, r: 16, b: 32, l: 40 };
  const xs = CRIME_SO.map(d => d[0]); const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const x = (yr) => m.l + (yr - x0) / (x1 - x0) * (W - m.l - m.r);
  const ymax = 140;
  const y = (v) => H - m.b - v / ymax * (H - m.t - m.b);
  let g = '';
  [40, 80, 120].forEach(v => {
    g += `<line x1="${m.l}" y1="${y(v)}" x2="${W-m.r}" y2="${y(v)}" stroke="${css('--line')}" stroke-width="1"/>`;
    g += `<text x="${m.l-7}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="${css('--ink-3')}">${v}</text>`;
  });
  [2016, 2019, 2022, 2025].forEach(yr => g += `<text x="${x(yr)}" y="${H-m.b+17}" text-anchor="middle" font-size="10" fill="${css('--ink-3')}">${yr}</text>`);
  // area + line (slate, not red)
  const pts = CRIME_SO.map(d => `${x(d[0]).toFixed(1)},${y(d[1]).toFixed(1)}`).join(' ');
  g += `<polygon points="${m.l},${y(0)} ${pts} ${W-m.r},${y(0)}" fill="${css('--crim-1')}" opacity="0.28"/>`;
  g += `<polyline points="${pts}" fill="none" stroke="${css('--crim-3')}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  CRIME_SO.forEach(d => g += `<circle cx="${x(d[0])}" cy="${y(d[1])}" r="3" fill="${css('--crim-3')}"/>`);
  // peak + latest annotations
  g += `<text x="${x(2021)}" y="${y(126.8)-8}" text-anchor="middle" font-size="10" font-weight="600" fill="${css('--crim-3')}">pic 126,8</text>`;
  g += `<text x="${x(2025)-4}" y="${y(103.7)-8}" text-anchor="end" font-size="10" font-weight="600" fill="${css('--crim-3')}">103,7</text>`;
  svg.innerHTML = g;
}

/* ---------- Scrollytelling state machine ---------- */
const states = document.querySelectorAll('.figstate');
const figLabel = document.getElementById('figLabel');
const LABELS = { timeline: ['La chronologie', 'The timeline'], price: ['Le prix au m²', 'Price per m²'], crime: ['La délinquance', 'Recorded crime'] };
let currentState = 'timeline';
function setState(name, hot) {
  if (name !== currentState) {
    currentState = name;
    states.forEach(s => s.classList.toggle('on', s.dataset.state === name));
    if (figLabel && LABELS[name]) figLabel.textContent = LABELS[name][lang() === 'en' ? 1 : 0];
  }
  // highlight timeline item
  if (name === 'timeline') {
    document.querySelectorAll('#timeline li').forEach(li => li.classList.toggle('hot', li.dataset.k === hot));
  }
}

function initScrolly() {
  const steps = document.querySelectorAll('.step');
  if (!steps.length) return;
  if (!('IntersectionObserver' in window)) { return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) setState(e.target.dataset.step, e.target.dataset.hot);
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  steps.forEach(s => io.observe(s));
}

/* ---------- Draw your guess ---------- */
function initGuess() {
  const svg = document.getElementById('guessSvg');
  if (!svg) return;
  const W = 460, H = 300, m = { t: 24, r: 24, b: 34, l: 52 };
  const ymin = 5000, ymax = 9500;
  const x2021 = m.l, x2024 = W - m.r;
  const yv = (v) => H - m.b - (v - ymin) / (ymax - ymin) * (H - m.t - m.b);
  const vy = (py) => ymin + (H - m.b - py) / (H - m.t - m.b) * (ymax - ymin);
  const START = 7001, ACTUAL = 6399;
  let guess = 7800, revealed = false;

  const valEl = document.getElementById('guessVal');
  const pctEl = document.getElementById('guessPct');
  const revEl = document.getElementById('guessReveal');

  function render() {
    const L = lang();
    let g = '';
    [6000, 7000, 8000, 9000].forEach(v => {
      g += `<line x1="${m.l}" y1="${yv(v)}" x2="${W-m.r}" y2="${yv(v)}" stroke="${css('--line')}" stroke-width="1"/>`;
      g += `<text x="${m.l-8}" y="${yv(v)+4}" text-anchor="end" font-size="10" fill="${css('--ink-3')}">${(v/1000)}k</text>`;
    });
    g += `<text x="${x2021}" y="${H-m.b+18}" text-anchor="middle" font-size="10" fill="${css('--ink-3')}">2021</text>`;
    g += `<text x="${x2024}" y="${H-m.b+18}" text-anchor="middle" font-size="10" fill="${css('--ink-3')}">2024</text>`;
    // start point
    g += `<circle cx="${x2021}" cy="${yv(START)}" r="5" fill="${css('--ink-2')}"/>`;
    g += `<text x="${x2021+8}" y="${yv(START)-8}" font-size="10" fill="${css('--ink-2')}">7 001 €</text>`;
    // guess line
    g += `<line x1="${x2021}" y1="${yv(START)}" x2="${x2024}" y2="${yv(guess)}" stroke="${css('--gold-lo')}" stroke-width="2.5" stroke-dasharray="${revealed?'2 5':'0'}" stroke-linecap="round"/>`;
    g += `<circle id="grip" cx="${x2024}" cy="${yv(guess)}" r="8" fill="${css('--accent')}" stroke="${css('--surface')}" stroke-width="2"/>`;
    if (revealed) {
      g += `<line x1="${x2021}" y1="${yv(START)}" x2="${x2024}" y2="${yv(ACTUAL)}" stroke="${css('--doc')}" stroke-width="3" stroke-linecap="round"/>`;
      g += `<circle cx="${x2024}" cy="${yv(ACTUAL)}" r="6" fill="${css('--doc')}"/>`;
      g += `<text x="${x2024-8}" y="${yv(ACTUAL)+16}" text-anchor="end" font-size="11" font-weight="600" fill="${css('--doc')}">6 399 € réel</text>`;
    }
    svg.innerHTML = g;
  }
  function update() {
    const pct = Math.round((guess - START) / START * 100);
    valEl.textContent = Math.round(guess / 10) * 10 + ' €';
    valEl.textContent = (Math.round(guess / 10) * 10).toLocaleString('fr-FR') + ' €';
    pctEl.textContent = (pct >= 0 ? '+' : '') + pct + ' %';
    pctEl.style.color = pct >= 0 ? css('--con') : css('--doc');
    render();
  }

  let dragging = false;
  function pointerY(ev) {
    const r = svg.getBoundingClientRect();
    const cy = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
    return cy / r.height * H;
  }
  function move(ev) {
    if (!dragging) return;
    ev.preventDefault();
    guess = Math.max(ymin + 100, Math.min(ymax - 100, vy(pointerY(ev))));
    update();
  }
  svg.addEventListener('pointerdown', (e) => { dragging = true; guess = Math.max(ymin+100, Math.min(ymax-100, vy(pointerY(e)))); update(); });
  addEventListener('pointermove', move);
  addEventListener('pointerup', () => dragging = false);

  document.getElementById('revealBtn').addEventListener('click', () => {
    revealed = true; render();
    const L = lang();
    const pct = Math.round((guess - START) / START * 100);
    const over = guess > ACTUAL;
    revEl.innerHTML = (L === 'en'
      ? `The real median <b>fell to 6&nbsp;399 €/m² (−9%)</b>. ${over ? 'Like most people, you guessed higher than reality' : 'You guessed close to — or below — reality'}. The “price surge” narrative isn't in the data.`
      : `Le prix médian réel a <b>reculé à 6&nbsp;399 €/m² (−9 %)</b>. ${over ? 'Comme la plupart des gens, vous avez estimé plus haut que la réalité' : 'Vous avez visé juste — ou plus bas que la réalité'}. Le récit de la « flambée » n'est pas dans les données.`);
    document.getElementById('revealBtn').disabled = true;
    document.getElementById('revealBtn').style.opacity = '.5';
  });

  update();
}

/* ---------- Boot ---------- */
function boot() {
  try { buildPriceChart(); } catch (e) { console.error(e); }
  try { buildCrimeChart(); } catch (e) { console.error(e); }
  try { initScrolly(); } catch (e) { console.error(e); }
  try { initGuess(); } catch (e) { console.error(e); }
}
requestAnimationFrame(() => requestAnimationFrame(boot));

/* Rebuild charts on language/theme change */
document.querySelectorAll('.lang button, [data-theme-toggle]').forEach(b =>
  b.addEventListener('click', () => setTimeout(() => { buildPriceChart(); buildCrimeChart(); if (figLabel && LABELS[currentState]) figLabel.textContent = LABELS[currentState][lang()==='en'?1:0]; }, 30)));

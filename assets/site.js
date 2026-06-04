/* Shared behavior for the Observatoire prototype.
   - Theme (light/dark) with persistence
   - Language toggle FR/EN (swaps [data-fr]/[data-en] text; mock only)
   - Mobile nav drawer
   - KPI source expanders
   Build: vanilla, no deps. Mirrors what the Observable Framework theme would wire up. */

(function () {
  const root = document.documentElement;
  root.classList.add('js');

  /* ---- Scroll reveal ---- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('in')); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  /* ---- Theme ---- */
  const savedTheme = localStorage.getItem('pq-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('pq-theme', next);
    syncThemeBtn();
  }
  function syncThemeBtn() {
    const isDark = root.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      b.textContent = isDark ? '☀' : '☾';
      b.setAttribute('aria-label', isDark ? 'Passer en clair' : 'Passer en sombre');
    });
  }

  /* ---- Language (mock) ---- */
  const savedLang = localStorage.getItem('pq-lang') || 'fr';
  function applyLang(lang) {
    localStorage.setItem('pq-lang', lang);
    document.querySelectorAll('[data-fr]').forEach(el => {
      const txt = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-fr');
      if (txt != null) el.textContent = txt;
    });
    // HTML-bearing strings (so inline <em>, <b> survive the swap)
    document.querySelectorAll('[data-fr-html]').forEach(el => {
      const html = lang === 'en' ? el.getAttribute('data-en-html') : el.getAttribute('data-fr-html');
      if (html != null) el.innerHTML = html;
    });
    document.querySelectorAll('.lang button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    root.setAttribute('lang', lang);
  }

  /* ---- Wire up after DOM ready ---- */
  function init() {
    syncThemeBtn();
    initReveal();
    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));
    document.querySelectorAll('.lang button').forEach(b =>
      b.addEventListener('click', () => applyLang(b.dataset.lang)));
    applyLang(savedLang);

    const burger = document.querySelector('.nav__burger');
    const links = document.querySelector('.nav__links');
    if (burger && links) {
      burger.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
      });
      links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
      }));
    }

    document.querySelectorAll('.kpi__src-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.closest('.kpi').querySelector('.kpi__src');
        const open = panel.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.PQ = { toggleTheme, applyLang, refreshReveal: initReveal };
})();

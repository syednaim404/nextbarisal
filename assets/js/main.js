(function () {
  const $ = id => document.getElementById(id);

  // ---------- dark / light theme (remembered between pages) ----------
  const root = document.documentElement;
  const btn = $('themeBtn');
  const saved = () => { try { return localStorage.getItem('nb-theme'); } catch (e) { return null; } };
  const save = t => { try { localStorage.setItem('nb-theme', t); } catch (e) { /* private mode */ } };
  const apply = t => {
    root.setAttribute('data-bs-theme', t);
    const icon = btn && btn.querySelector('i');
    if (icon) icon.className = t === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  };
  apply(saved() || 'dark'); // first visit opens in dark mode
  if (btn) btn.addEventListener('click', () => {
    const t = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    apply(t); save(t);
  });

  // ---------- hero carousel (home): load the next slide's photo ahead of time ----------
  const hero = $('heroCarousel');
  if (hero) {
    const bgs = hero.querySelectorAll('.hero-bg');
    const preload = i => {
      const b = bgs[i % bgs.length], m = b && /url\('(.*?)'\)/.exec(b.getAttribute('style') || '');
      if (m) new Image().src = m[1];
    };
    preload(1);
    hero.addEventListener('slide.bs.carousel', e => preload(e.to + 1));
  }

  // ---------- smooth card sliders (home: projects, offers) ----------
  function initSlider(id, prevId, nextId, ms) {
    const s = $(id), p = $(prevId), n = $(nextId);
    if (!s || !p || !n) return;
    const step = () => s.firstElementChild.offsetWidth + 24;
    const move = dir => {
      const end = s.scrollLeft + s.clientWidth >= s.scrollWidth - 10;
      if (dir > 0 && end) s.scrollTo({ left: 0, behavior: 'smooth' });
      else s.scrollBy({ left: dir * step(), behavior: 'smooth' });
    };
    n.onclick = () => move(1);
    p.onclick = () => move(-1);
    let t = setInterval(() => move(1), ms);
    s.addEventListener('mouseenter', () => clearInterval(t));
    s.addEventListener('mouseleave', () => (t = setInterval(() => move(1), ms)));
  }
  initSlider('slider', 'prevBtn', 'nextBtn', 4000);
  initSlider('offerSlider', 'offerPrev', 'offerNext', 4500);

  // ---------- marquees: duplicate items, keep the same pixel speed for any length ----------
  document.querySelectorAll('.marquee').forEach(m => {
    const tr = m.querySelector('.track'), speed = +m.dataset.speed || 40;
    if (!tr) return;
    tr.innerHTML += tr.innerHTML;
    const set = () => tr.style.setProperty('--d', (tr.scrollWidth / 2 / speed) + 's');
    set(); window.addEventListener('load', set);
  });

  // ---------- gallery lightbox ----------
  const lb = $('lightbox');
  if (lb && window.bootstrap) {
    const box = new bootstrap.Modal(lb);
    document.querySelectorAll('.g-item').forEach(b => b.addEventListener('click', () => {
      $('lightImg').src = b.dataset.full; box.show();
    }));
  }

  // ---------- count-up stats ----------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, max = +el.dataset.count; let n = 0;
      const t = setInterval(() => { n += Math.ceil(max / 40); if (n >= max) { n = max; clearInterval(t); } el.textContent = n + '+'; }, 30);
      io.unobserve(el);
    }), { threshold: .6 });
    counters.forEach(el => io.observe(el));
  }

  // ---------- projects page: category filter (also reads ?type=school from the address) ----------
  const fbtns = document.querySelectorAll('.filter-btn');
  if (fbtns.length) {
    const show = f => {
      fbtns.forEach(x => x.classList.toggle('active', x.dataset.filter === f));
      document.querySelectorAll('.pcard-col').forEach(c => { c.hidden = !(f === 'all' || c.dataset.cat === f); });
    };
    fbtns.forEach(b => b.addEventListener('click', () => show(b.dataset.filter)));
    const type = new URLSearchParams(location.search).get('type');
    if (type && [...fbtns].some(x => x.dataset.filter === type)) show(type);
  }

  // ---------- contact form (demo only) + service picked from a card ----------
  const cf = $('contactForm');
  if (cf) {
    const sel = $('cService'), want = new URLSearchParams(location.search).get('service');
    if (sel && want) [...sel.options].forEach(o => { if (o.value === want) sel.value = want; });
    cf.addEventListener('submit', e => {
      e.preventDefault();
      const m = $('formMsg');
      if (!cf.checkValidity()) { m.textContent = 'Please fill in every field.'; m.style.color = 'var(--red)'; return; }
      m.textContent = 'Thanks, we will reply within one working day.'; m.style.color = 'var(--green)'; cf.reset();
    });
  }

  const nx = $('next');
  if (nx) nx.setAttribute('title', 'n@!3');

  // ---------- scroll reveal animations ----------
  (function () {
    const rules = [            // [selector, effect, columns used for the stagger delay]
      ['section .head', 'up', 1],
      ['.card-nb', 'up', 3],
      ['.step', 'up', 4],
      ['.svc-block', 'up', 1],
      ['.feat', 'up', 2],
      ['.offer-grid .offer', 'zoom', 4],
      ['.proj-grid .proj', 'up', 3],
      ['.pcard-col', 'up', 3],
      ['#projects .slider, #offers .slider', 'up', 1],
      ['#stack .container', 'up', 1],
      ['.gallery .g-item', 'zoom', 4],
      ['#reviewCarousel', 'zoom', 1],
      ['.about-img', 'left', 1],
      ['.about-text', 'right', 1],
      ['.info-card', 'up', 4],
      ['.form-card', 'left', 1],
      ['.contact-map', 'right', 1],
      ['.cta-box', 'zoom', 1],
      ['.foot-top > div', 'up', 4]
    ];
    const els = [];
    rules.forEach(([sel, fx, cols]) => document.querySelectorAll(sel).forEach((el, i) => {
      if (el.hasAttribute('data-rv')) return;
      el.setAttribute('data-rv', fx);
      el.style.setProperty('--rd', (i % cols) * 0.12 + 's');
      els.push(el);
    }));
    const clear = el => { el.removeAttribute('data-rv'); el.classList.remove('in'); el.style.removeProperty('--rd'); };
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(clear); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.classList.add('in');
      setTimeout(() => clear(e.target), 1400);   // hand the element back to its normal hover styles
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  })();



  const yr = $('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();

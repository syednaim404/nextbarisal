(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeBtn');
  const icon = btn.querySelector('i');
  const apply = t => {
    root.setAttribute('data-bs-theme', t);
    icon.className = t === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  };
  apply('dark'); // the site always opens in dark mode
  btn.addEventListener('click', () => apply(root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark'));

  // hero carousel: load the next slide's photo ahead of time so slides never show blank
  (function () {
    const hero = document.getElementById('heroCarousel');
    if (!hero) return;
    const bgs = hero.querySelectorAll('.hero-bg');
    const preload = i => {
      const b = bgs[i % bgs.length], m = b && /url\('(.*?)'\)/.exec(b.getAttribute('style') || '');
      if (m) new Image().src = m[1];
    };
    preload(1);
    hero.addEventListener('slide.bs.carousel', e => preload(e.to + 1));
  })();

  // smooth card sliders (projects + blog)
  function initSlider(id, prevId, nextId, ms) {
    const s = document.getElementById(id);
    if (!s) return;
    const step = () => s.firstElementChild.offsetWidth + 24;
    const move = dir => {
      const end = s.scrollLeft + s.clientWidth >= s.scrollWidth - 10;
      if (dir > 0 && end) s.scrollTo({ left: 0, behavior: 'smooth' });
      else s.scrollBy({ left: dir * step(), behavior: 'smooth' });
    };
    document.getElementById(nextId).onclick = () => move(1);
    document.getElementById(prevId).onclick = () => move(-1);
    let t = setInterval(() => move(1), ms);
    s.addEventListener('mouseenter', () => clearInterval(t));
    s.addEventListener('mouseleave', () => (t = setInterval(() => move(1), ms)));
  }
  initSlider('slider', 'prevBtn', 'nextBtn', 4000);
  initSlider('blogSlider', 'blogPrev', 'blogNext', 3500);
  initSlider('offerSlider', 'offerPrev', 'offerNext', 4500);

  // marquees: duplicate items, keep the same pixel speed for any length
  document.querySelectorAll('.marquee').forEach(m => {
    const tr = m.querySelector('.track'), speed = +m.dataset.speed || 40;
    tr.innerHTML += tr.innerHTML;
    const set = () => tr.style.setProperty('--d', (tr.scrollWidth / 2 / speed) + 's');
    set(); window.addEventListener('load', set);
  });

  // gallery lightbox
  const box = new bootstrap.Modal(document.getElementById('lightbox'));
  document.querySelectorAll('.g-item').forEach(b => b.addEventListener('click', () => {
    document.getElementById('lightImg').src = b.dataset.full; box.show();
  }));

  // count-up stats
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, max = +el.dataset.count; let n = 0;
    const t = setInterval(() => { n += Math.ceil(max / 40); if (n >= max) { n = max; clearInterval(t); } el.textContent = n + '+'; }, 30);
    io.unobserve(el);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));

  // contact form (demo only)
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const m = document.getElementById('formMsg');
    if (!e.target.checkValidity()) { m.textContent = 'Please fill in every field.'; m.style.color = 'var(--red)'; return; }
    m.textContent = 'Thanks, we will reply within one working day.'; m.style.color = 'var(--green)'; e.target.reset();
  });

  // login form (demo only: connect it to your Laravel /login route)
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const m = document.getElementById('loginMsg');
    const ok = e.target.checkValidity();
    m.textContent = ok ? 'Demo form: connect this to your Laravel /login route.' : 'Enter your email and password.';
    m.style.color = ok ? 'var(--yellow)' : 'var(--red)';
  });

  // active menu link: set on click and while scrolling
  const links = [...document.querySelectorAll('#menu .nav-link')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href')));
  let lock = 0;
  const setActive = a => links.forEach(l => l.classList.toggle('active', l === a));
  links.forEach(a => a.addEventListener('click', () => { setActive(a); lock = Date.now() + 900; }));
  const spy = () => {
    if (Date.now() < lock) return;
    let cur = links[0];
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= 120) cur = links[i]; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = links[links.length - 1];
    setActive(cur);
  };
  window.addEventListener('scroll', spy, { passive: true }); spy();

  // close the mobile menu after tapping a link
  document.querySelectorAll('#menu .nav-link, #menu .btn-nb').forEach(a => a.addEventListener('click', () => {
    const oc = bootstrap.Offcanvas.getInstance(document.getElementById('menu'));
    if (oc) oc.hide();
  }));

  // scroll reveal animations: elements fade/slide/zoom in when they enter the screen
  (function () {
    const rules = [            // [selector, effect, columns used for the stagger delay]
      ['section .head', 'up', 1],
      ['#services .card-nb', 'up', 3],
      ['#projects .slider, #blog .slider, #offers .slider', 'up', 1],
      ['#websites .cat', 'zoom', 3],
      ['#stack .container', 'up', 1],
      ['#gallery .g-item', 'zoom', 4],
      ['#reviewCarousel', 'zoom', 1],
      ['#contact .col-lg-5', 'left', 1],
      ['#contact .col-lg-7', 'right', 1],
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

  document.getElementById('yr').textContent = new Date().getFullYear();
})();

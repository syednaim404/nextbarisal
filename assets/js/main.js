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

  // ---------- smooth card sliders (home: projects, offers, blog) ----------
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
  initSlider('blogSlider', 'blogPrev', 'blogNext', 3500);
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

  // ---------- login form (demo only: connect it to your Laravel /login route) ----------
  const lf = $('loginForm');
  if (lf) lf.addEventListener('submit', e => {
    e.preventDefault();
    const m = $('loginMsg'), ok = lf.checkValidity();
    m.textContent = ok ? 'Demo form: connect this to your Laravel /login route.' : 'Enter your email and password.';
    m.style.color = ok ? 'var(--yellow)' : 'var(--red)';
  });

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
      ['#websites .cat', 'zoom', 3],
      ['.pcard-col', 'up', 3],
      ['#projects .slider, #blog .slider, #offers .slider', 'up', 1],
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


  // ---------- blog details page (blog-details.html?id=<post-id>) ----------
  const POSTS = [
    { id: 'laravel-first-choice-2026', cat: 'Laravel', date: '29 Oct 2026', read: '4 min read',
      title: 'Why Laravel is still our first choice in 2026',
      summary: 'Frameworks come and go. Here is why we keep building client projects on Laravel.',
      img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=70',
      body: [
        'Every year a new framework promises to make web development faster. We try many of them, but when a client needs a billing system, a school portal or an online store, we still reach for Laravel first.',
        'h:Everything you need is already there',
        'Login, roles, validation, queues, mail, file storage and scheduled jobs all come built in. That means we spend our time on your business rules instead of rebuilding the basics.',
        'h:Easy for the next developer',
        'Laravel has clear conventions. If your project changes hands, a new developer can find the routes, models and views quickly. That protects your investment.',
        'h:Safe by default',
        'Protection against SQL injection, cross-site scripting and CSRF is switched on out of the box, so a simple mistake is less likely to become a security problem.',
        'h:What we like most',
        'l:A huge community and lots of ready-made packages|Smooth upgrades from one version to the next|Works well with MySQL, Redis and cheap shared or cloud hosting',
        'If you are planning a web application and want to know whether Laravel fits, send us a message and we will give you an honest answer.'
      ] },
    { id: 'online-payment-mistakes', cat: 'E-commerce', date: '21 Oct 2026', read: '5 min read',
      title: '5 mistakes small shops make with online payments',
      summary: 'Avoid these common problems and your customers will trust your checkout.',
      img: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=70',
      body: [
        'Taking payments online is easier than ever in Bangladesh, but many small shops still lose sales because of avoidable mistakes.',
        'h:1. Offering only one payment method',
        'Some customers prefer bKash, others Nagad, a card or cash on delivery. Give people a choice and more of them will finish the order.',
        'h:2. Not confirming the payment',
        'Always show a clear success page and send a message or email with the order number. Silence makes customers worry and call you.',
        'h:3. Hiding the delivery cost',
        'Surprise charges at the last step are the top reason people leave a checkout. Show the total early.',
        'h:4. Skipping a record of every payment',
        'Keep each transaction ID in your system. When a customer says "I already paid", you can check in seconds.',
        'h:5. Using a weak admin password',
        'Your order panel holds customer details. Use a strong, unique password and turn on two-step login where possible.',
        'We can set up a secure checkout for your shop, from product pages to payment and order tracking.'
      ] },
    { id: 'website-safety-checklist', cat: 'Security', date: '14 Oct 2026', read: '4 min read',
      title: 'Keep your business website safe: a simple checklist',
      summary: 'Ten minutes with this list can prevent most common website problems.',
      img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=70',
      body: [
        'You do not need to be a security expert to protect your website. Most attacks use the same simple gaps, and they are easy to close.',
        'h:Do these today',
        'l:Use HTTPS on every page, with the padlock showing in the browser|Choose strong, unique passwords for hosting, email and the admin panel|Remove old admin accounts for people who no longer work with you|Keep your CMS, plugins and framework updated',
        'h:Do these every month',
        'l:Check that automatic backups are really running|Restore one backup to a test site to be sure it works|Review who has access to your domain and hosting accounts',
        'h:If something looks wrong',
        'Change your passwords first, then contact your developer. The sooner you act, the smaller the damage.',
        'Want us to review your site? We offer a quick security check for local businesses.'
      ] },
    { id: 'plan-mobile-app-two-weeks', cat: 'Mobile apps', date: '06 Oct 2026', read: '5 min read',
      title: 'How we plan a mobile app in two weeks',
      summary: 'A clear plan before coding saves time, money and surprises.',
      img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=70',
      body: [
        'Many app projects go over budget because the plan was unclear. We spend the first two weeks making sure everyone agrees on what will be built.',
        'h:Week 1: understand the business',
        'We talk to you and your staff, list who will use the app, and write down the three or four things the app must do well. Everything else waits for a later version.',
        'h:Week 2: design and estimate',
        'We sketch the main screens, test them on paper with real users, then give you a timeline and a fixed price for the first release.',
        'h:What you receive',
        'l:A simple screen-by-screen design|A feature list split into "now" and "later"|A clear timeline and price',
        'After that, development starts in small steps and you see progress every week.'
      ] },
    { id: 'flutter-vs-native', cat: 'Mobile apps', date: '30 Sep 2026', read: '4 min read',
      title: 'Choosing between Flutter and native apps',
      summary: 'One codebase or two? A plain comparison to help you decide.',
      img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=70',
      body: [
        'When you plan a mobile app, one of the first questions is whether to build with Flutter or separately for Android and iOS.',
        'h:Choose Flutter when',
        'l:You need Android and iOS at the same time on a sensible budget|Your app is mostly screens, forms, lists and payments|You want to ship fast and update both platforms together',
        'h:Choose native when',
        'l:You need deep access to device features such as advanced camera or Bluetooth work|You are building a game or a very heavy animation app|You already have separate Android and iOS teams',
        'h:Our advice',
        'For most local businesses, such as shops, schools and delivery services, Flutter is the faster and cheaper choice and the result feels smooth to users.',
        'Not sure which one fits your idea? Tell us about it and we will recommend the right path.'
      ] }
  ];

  const bd = $('blogDetail');
  if (bd) {
    const want = new URLSearchParams(location.search).get('id');
    const i = Math.max(0, POSTS.findIndex(p => p.id === want));
    const p = POSTS[i];
    const link = x => 'blog-details.html?id=' + x.id;
    document.title = p.title + ' | NextBarisal';
    const md = $('metaDesc'); if (md) md.setAttribute('content', p.summary);
    $('blogCrumb').textContent = p.title;
    $('blogChip').textContent = p.cat;
    $('blogTitle').textContent = p.title;
    $('blogSummary').textContent = p.summary;
    const im = $('blogImage'); im.src = p.img; im.alt = p.title;
    $('blogMeta').innerHTML = '<span><i class="fa-regular fa-calendar me-1"></i>' + p.date + '</span><span><i class="fa-regular fa-clock me-1"></i>' + p.read + '</span><span><i class="fa-solid fa-tag me-1"></i>' + p.cat + '</span>';
    $('blogBody').innerHTML = p.body.map(t =>
      t.startsWith('h:') ? '<h3>' + t.slice(2) + '</h3>' :
      t.startsWith('l:') ? '<ul>' + t.slice(2).split('|').map(x => '<li>' + x + '</li>').join('') + '</ul>' :
      '<p>' + t + '</p>').join('');
    const prev = POSTS[i + 1], next = POSTS[i - 1];
    $('blogNav').innerHTML =
      (prev ? '<a class="btn btn-ghost" href="' + link(prev) + '"><i class="fa-solid fa-arrow-left me-2"></i>Older article</a>' : '<span></span>') +
      (next ? '<a class="btn btn-ghost" href="' + link(next) + '">Newer article<i class="fa-solid fa-arrow-right ms-2"></i></a>' : '<span></span>');
    $('blogRecent').innerHTML = POSTS.map(x =>
      '<li><a' + (x.id === p.id ? ' class="active"' : '') + ' href="' + link(x) + '"><i class="fa-regular fa-newspaper"></i>' + x.title + '</a></li>').join('');
  }


  const yr = $('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();

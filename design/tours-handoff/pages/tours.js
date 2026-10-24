/* =========================================================================
   Vantage · Tours page (/tours): "a plane where every window is a tour".
   Mockup behaviour. GSAP 3 + ScrollTrigger + ScrollToPlugin, plain JS.

   Real in this mockup: the overview plane, the pinned scroll ride (zoom in,
   hold, pull back, glide), "see all windows", clicking a window to zoom
   straight in, photo flipping, filters as window shades, sort with photos
   sliding to new windows, planes of 10 windows with "next plane", the phone
   layout (plane points up), the reduced-motion grid, empty / waiting / error,
   light + dark, and version A (outside) / B (inside).
   Mocked: the tour data (the API gives you this) and the 21 sample tours on
   the 30-tour page. See TOURS-HANDOFF.md for how to port it.
   ========================================================================= */
(function () {
  'use strict';

  var doc = document, html = doc.documentElement, W = window;
  var gsap = W.gsap, ST = W.ScrollTrigger;
  if (gsap && ST) {
    gsap.registerPlugin(ST);
    if (W.ScrollToPlugin) gsap.registerPlugin(W.ScrollToPlugin);
    ST.config({ ignoreMobileResize: true });   // the ride is rebuilt on width changes (see init → resize)
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var Q = new URLSearchParams(location.search);
  var PRE = new URLSearchParams(html.getAttribute('data-preset') || '');
  function opt(k) { return Q.has(k) ? Q.get(k) : PRE.get(k); }
  function assign(a) { for (var i = 1; i < arguments.length; i++) for (var k in arguments[i]) a[k] = arguments[i][k]; return a; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---------- Data (the API sends these fields) ---------- */
  var PHOTO = 'https://res.cloudinary.com/azfjsm2k/image/upload/w_1200,f_auto,q_auto/';
  // Mockup-only changes: departure dates are made up (summer 2027), The Northern Lights
  // pretends to be new (no reviews) and The Wine Taster pretends to have $300 off.
  var REAL = [
    { slug: 'the-forest-hiker', name: 'The Forest Hiker', start: 'Banff, Canada', days: 5, difficulty: 'easy', rating: 5.0, reviews: 9, price: 397, discount: 0, group: 25, next: '2027-06-12', summary: 'Breathtaking hike through the Canadian Banff National Park.' },
    { slug: 'the-sea-explorer', name: 'The Sea Explorer', start: 'Miami, USA', days: 7, difficulty: 'medium', rating: 4.8, reviews: 6, price: 497, discount: 0, group: 15, next: '2027-06-06', summary: 'Exploring the jaw-dropping US east coast by foot and by boat.' },
    { slug: 'the-snow-adventurer', name: 'The Snow Adventurer', start: 'Aspen, USA', days: 4, difficulty: 'difficult', rating: 4.5, reviews: 6, price: 997, discount: 0, group: 10, next: '2027-07-03', summary: 'Exciting adventure in the snow with snowboarding and skiing.' },
    { slug: 'the-city-wanderer', name: 'The City Wanderer', start: 'New York, USA', days: 9, difficulty: 'easy', rating: 4.6, reviews: 5, price: 1197, discount: 0, group: 20, next: '2027-07-18', summary: 'Living the life of wanderlust in the most beautiful cities in the US.' },
    { slug: 'the-park-camper', name: 'The Park Camper', start: 'Las Vegas, USA', days: 10, difficulty: 'medium', rating: 4.7, reviews: 7, price: 1497, discount: 0, group: 15, next: '2027-06-27', summary: "Breathing in nature in America's most spectacular national parks." },
    { slug: 'the-northern-lights', name: 'The Northern Lights', start: 'Yellowknife, Canada', days: 3, difficulty: 'easy', rating: 0, reviews: 0, price: 1497, discount: 0, group: 12, next: '2027-08-21', summary: 'Enjoy the Northern Lights in one of the best places in the world.' },
    { slug: 'the-wine-taster', name: 'The Wine Taster', start: 'California, USA', days: 5, difficulty: 'easy', rating: 4.4, reviews: 7, price: 1997, discount: 300, group: 8, next: '2027-09-04', summary: 'Exquisite wines, scenic views, exclusive barrel tastings, and much more.' },
    { slug: 'the-star-gazer', name: 'The Star Gazer', start: 'Utah, USA', days: 9, difficulty: 'medium', rating: 4.8, reviews: 6, price: 2997, discount: 0, group: 8, next: '2027-08-08', summary: 'The most remote and stunningly beautiful places for seeing the night sky.' },
    { slug: 'the-sports-lover', name: 'The Sports Lover', start: 'California, USA', days: 14, difficulty: 'difficult', rating: 3.9, reviews: 7, price: 2997, discount: 0, group: 8, next: '2027-07-10', summary: 'Surfing, skating, parajumping, rock climbing and more, all in one tour.' }
  ];
  // The 30-tour page: 21 made-up tours that borrow the 9 photos, to show three planes.
  function sampleTours(n) {
    var places = ['Denver, USA', 'Quebec City, Canada', 'Seattle, USA', 'Halifax, Canada', 'Austin, USA', 'Portland, USA', 'Calgary, Canada'];
    var out = [];
    for (var k = 0; k < n; k++) {
      var num = 10 + k;
      out.push({
        slug: 'sample-tour-' + num, photo: REAL[k % 9].slug, name: 'Sample Tour ' + num, start: places[k % places.length],
        days: [3, 4, 5, 6, 7, 8, 9, 10, 12, 14][(k * 7) % 10], difficulty: ['easy', 'medium', 'difficult'][(k * 2 + 1) % 3],
        rating: [4.2, 4.5, 4.9, 3.8, 4.6][k % 5], reviews: 2 + (k * 5) % 11, price: [297, 447, 597, 797, 997, 1297, 1597, 1897, 2297, 2697][(k * 3) % 10],
        discount: 0, group: [8, 10, 12, 15, 20][k % 5], next: '2027-0' + (6 + k % 4) + '-' + pad2(1 + (k * 3) % 28),
        summary: 'A made-up tour that borrows a photo, so you can see what three planes look like.'
      });
    }
    return out;
  }

  var GROUPS = ['difficulty', 'length', 'price'];
  var LABEL = {
    difficulty: { easy: 'Easy', medium: 'Medium', difficult: 'Difficult' },
    length: { short: 'Up to 5 days', medium: '6–9 days', long: '10+ days' },
    price: { under500: 'Under $500', mid: '$500–$1,500', over1500: 'Over $1,500' }
  };
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function dateOf(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dateNice(iso) { return dateOf(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
  function money(n) { return '$' + n.toLocaleString('en-US'); }
  function salePrice(t) { return t.price - (t.discount || 0); }
  function lengthOf(t) { return t.days <= 5 ? 'short' : t.days <= 9 ? 'medium' : 'long'; }
  function priceBand(t) { var p = salePrice(t); return p < 500 ? 'under500' : p <= 1500 ? 'mid' : 'over1500'; }
  var GET = { difficulty: function (t) { return t.difficulty; }, length: lengthOf, price: priceBand };
  function matches(t, f) { // OR inside a group, AND across groups
    return GROUPS.every(function (g) { return !f[g].length || f[g].indexOf(GET[g](t)) > -1; });
  }
  function ratingKey(t) { return t.reviews ? t.rating : -1; }
  var SORTS = {
    'price-asc': function (a, b) { return salePrice(a) - salePrice(b) || ratingKey(b) - ratingKey(a) || dateOf(a.next) - dateOf(b.next); },
    'price-desc': function (a, b) { return salePrice(b) - salePrice(a) || ratingKey(b) - ratingKey(a) || dateOf(a.next) - dateOf(b.next); },
    'rating': function (a, b) { return ratingKey(b) - ratingKey(a) || b.reviews - a.reviews || salePrice(a) - salePrice(b); },
    'length-asc': function (a, b) { return a.days - b.days || salePrice(a) - salePrice(b); }
  };
  function photoURL(t, k) { return PHOTO + (t.photo || t.slug) + '-' + (k ? k : 'cover'); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function reduced() {
    return html.getAttribute('data-motion') === 'reduce' ||
      (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  var ICON = {
    arrow: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    people: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.4 3.4 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
    prev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

  /* ---------- Plane geometry (plane units = px at scale 1) ----------
     Drawn sideways, nose on the left: 1520 × 520. Window n (0-based) is centred at
     x = 276 + 112n, y = 236 and is 100 wide × 128 tall (the Hero B window's shape).
     On phones the same drawing is turned 90° so the nose points up: the window column
     sits at x = 284 and windows are 128 wide × 100 tall. */
  var PER_PLANE = 10;
  var G = { len: 1520, dep: 520, x0: 276, pitch: 112, cy: 236, along: 100, across: 128 };
  function slotRect(i) {
    var c = G.x0 + G.pitch * i;
    return S.orient === 'h'
      ? { cx: c, cy: G.cy, w: G.along, h: G.across }
      : { cx: G.dep - G.cy, cy: c, w: G.across, h: G.along };
  }

  /* ---------- Motion timings, in screens of scroll (1 = 100vh) ----------
     Each window takes 1 screen: glide 0.15 → zoom in 0.25 → hold 0.4 → pull back 0.2. */
  var D = { intro: 0.2, glide0: 0.25, glide: 0.15, zoom: 0.25, hold: 0.4, back: 0.2, outro: 0.3, end: 0.3 };
  var ZOOM = { h: { approach: 1.55, hold: 2.25 }, v: { approach: 2.1, hold: 2.8 } };

  /* ---------- State + elements ---------- */
  var S = {
    all: [], by: {}, results: [], filters: { difficulty: [], length: [], price: [] }, sort: 'price-asc',
    plane: 0, slots: [], views: {}, orient: 'h', mode: 'ride', phase: 'ready',
    tl: null, st: null, segs: [], focusIdx: -1, photo: 0, bob: null, busy: false, directing: false,
    static: !!Q.get('shot'), noteOn: false
  };
  var el = {};

  /* ---------- Results + planes ---------- */
  function readFilters() {
    var f = { difficulty: [], length: [], price: [] };
    $$('input[type="checkbox"]', el.form).forEach(function (b) { if (b.checked) f[b.name].push(b.value); });
    S.filters = f;
    S.sort = el.sort.value;
  }
  function activeCount() { return S.filters.difficulty.length + S.filters.length.length + S.filters.price.length; }
  function computeResults() {
    S.results = S.all.filter(function (t) { return matches(t, S.filters); }).sort(SORTS[S.sort] || SORTS['price-asc']);
  }
  function planeCount() { return Math.max(1, Math.ceil(S.results.length / PER_PLANE)); }
  function capacity(k) { return S.all.length ? clamp(S.all.length - PER_PLANE * k, 0, PER_PLANE) : PER_PLANE; }
  function planeTours(k) { return S.results.slice(PER_PLANE * k, PER_PLANE * (k + 1)); }
  function openCount() { return S.slots.filter(function (s) { return s.tour; }).length; }

  /* ---------- Window slots ---------- */
  function buildSlots(n) {
    if (S.slots.length === n) return;
    el.slots.innerHTML = '';
    S.slots = [];
    for (var i = 0; i < n; i++) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'win';
      b.setAttribute('data-slot', i);
      b.innerHTML = '<span class="win__frame" aria-hidden="true"><span class="win__ring"></span><span class="win__glass">' +
        '<span class="win__glare"></span><span class="win__glare win__glare--2"></span>' +
        '<span class="win__shade"><span class="win__handle"></span></span></span></span><span class="win__tag" aria-hidden="true"></span>';
      el.slots.appendChild(b);
      S.slots.push({ el: b, glass: $('.win__glass', b), shade: $('.win__shade', b), tag: $('.win__tag', b), tour: null });
      placeSlot(b, i);
    }
    drawRecesses(n);
  }
  function placeSlot(b, i) {
    var r = slotRect(i);
    b.style.left = (r.cx - r.w / 2) + 'px';
    b.style.top = (r.cy - r.h / 2) + 'px';
    b.style.width = r.w + 'px';
    b.style.height = r.h + 'px';
    b.style.setProperty('--em', (Math.min(r.w, r.h) / 56) + 'px');
  }
  function viewFor(t) {
    var v = S.views[t.slug];
    if (!v) {
      v = doc.createElement('span');
      v.className = 'win__view';
      v.setAttribute('data-slug', t.slug);
      v.innerHTML = '<img src="' + photoURL(t, 0) + '" alt="" decoding="async">';
      S.views[t.slug] = v;
    }
    return v;
  }
  function setShade(s, open, instant) {
    s.el.classList.toggle('is-shut', !open);
    if (gsap) gsap.set(s.shade, { y: 0, yPercent: open ? -84 : 0 });   // y: 0 so GSAP ignores the CSS default
    else s.shade.style.transform = open ? '' : 'none';
  }
  function slotLabel(t, i) { return 'Window ' + (i + 1) + ': ' + t.name + ', ' + money(salePrice(t)) + '. Look closer.'; }
  function syncSlot(s, i, t) {
    s.tour = t || null;
    var b = s.el;
    if (t) {
      b.disabled = false;
      b.removeAttribute('aria-hidden');
      b.setAttribute('aria-label', slotLabel(t, i));
      b.classList.remove('is-empty');
    } else {
      b.disabled = true;
      b.setAttribute('aria-hidden', 'true');
      b.removeAttribute('aria-label');
      b.classList.add('is-empty');
    }
  }
  // Put the right photo in every window, right now (no motion).
  function fillSlots(shut) {
    var list = planeTours(S.plane);
    S.slots.forEach(function (s, i) {
      var t = list[i];
      var cur = $('.win__view', s.glass);
      if (cur && (!t || cur.getAttribute('data-slug') !== t.slug)) cur.remove();
      if (t && !$('.win__view', s.glass)) s.glass.insertBefore(viewFor(t), s.glass.firstChild);
      syncSlot(s, i, t);
      setShade(s, !!t && !shut, true);
    });
    renderTags();
  }
  function tagText(t) {
    if (S.sort === 'rating') return t.reviews ? '★ ' + t.rating.toFixed(1) : 'New';
    if (S.sort === 'length-asc') return t.days + ' days';
    return money(salePrice(t));
  }
  function renderTags() {
    S.slots.forEach(function (s) {
      var t = s.tour;
      if (!t) { s.tag.innerHTML = ''; return; }
      s.tag.innerHTML = S.orient === 'v' ? '<b>' + esc(t.name.replace(/^The /, '')) + '</b>' + esc(tagText(t)) : esc(tagText(t));
    });
  }

  /* ---------- Layout: overview fit, zoom target, camera states ---------- */
  function navSpace() { return parseFloat(getComputedStyle(el.stage).getPropertyValue('--nav-space')) || 100; }
  function layout() {
    var w = el.stage.clientWidth, h = el.stage.clientHeight;
    S.W = w; S.H = h;
    var orient = w < 700 ? 'v' : 'h';
    if (orient !== S.orient) {
      S.orient = orient;
      el.plane.setAttribute('data-orient', orient);
      S.slots.forEach(function (s, i) { placeSlot(s.el, i); });
      renderTags();
    }
    var PW = orient === 'h' ? G.len : G.dep, PH = orient === 'h' ? G.dep : G.len;
    S.PW = PW; S.PH = PH;
    var sr = el.stage.getBoundingClientRect(), br = el.ovPlane.getBoundingClientRect();
    var box = { x: br.left - sr.left, y: br.top - sr.top, w: br.width, h: Math.max(br.height, 120) };
    var s0 = Math.min(box.w / PW, box.h / PH);
    if (orient === 'h') {
      S.cam0 = { x: box.x + (box.w - PW * s0) / 2, y: box.y + (box.h - PH * s0) / 2, scale: s0 };
    } else {
      S.cam0 = { x: box.x - 6, y: box.y + (box.h - PH * s0) / 2, scale: s0 };
      var room = (w - 12 - S.cam0.x) / s0 - (G.dep - G.cy + G.across / 2 + 54);
      el.plane.style.setProperty('--label-max', Math.max(140, room) + 'px');
    }
    S.s0 = s0;
    el.plane.style.setProperty('--inv', (1 / s0).toFixed(4));
    // the plane shrinks to the top of its box while a note (empty / waiting / error) shows under it
    var sn = Math.min(box.w / PW, (box.h * (orient === 'h' ? 0.5 : 0.4)) / PH);
    S.camNote = { x: orient === 'h' ? box.x + (box.w - PW * sn) / 2 : box.x + (box.w - PW * sn) / 2, y: box.y, scale: sn };
    S.noteTop = box.y + PH * sn + 14;

    // where the zoomed window sits, and the info beside / under it
    var top = navSpace() + (orient === 'h' ? 62 : 52);
    if (orient === 'h') {
      var wide = w >= 1100, gap = wide ? 56 : 32;
      var cardW = wide ? clamp(w * 0.3, 360, 460) : clamp(w * 0.36, 300, 380);
      var availH = h - top - 28;
      var th = Math.min(availH, 680), tw = th * G.along / G.across;
      var maxTw = w - 2 * (wide ? 40 : 24) - gap - cardW;
      if (tw > maxTw) { tw = maxTw; th = tw * G.across / G.along; }
      var total = tw + gap + cardW;
      S.T = { x: (w - total) / 2, y: top + (availH - th) / 2, w: tw, h: th };
      S.cardBox = { left: S.T.x + tw + gap, width: cardW, top: S.T.y + th / 2, yPercent: -50 };
    } else {
      var tw2 = w - 32, th2 = tw2 * G.along / G.across, maxH = (h - top) * 0.42;
      if (th2 > maxH) { th2 = maxH; tw2 = th2 * G.across / G.along; }
      S.T = { x: (w - tw2) / 2, y: top + 4, w: tw2, h: th2 };
      S.cardBox = { left: 16, width: w - 32, top: S.T.y + th2 + 12, yPercent: 0 };
    }
    S.T.cx = S.T.x + S.T.w / 2;
    S.T.cy = S.T.y + S.T.h / 2;
    S.sA = s0 * ZOOM[orient].approach;
    S.sZ = s0 * ZOOM[orient].hold;
    S.k = (slotRect(0).w * S.sA) / S.T.w;   // zoomed window scale at the start of each zoom
    gsap.set(el.focus, { left: S.T.x, top: S.T.y, width: S.T.w, height: S.T.h });
    el.focusWin.style.fontSize = (Math.min(S.T.w, S.T.h) / 56) + 'px';
    gsap.set(el.card, S.cardBox);
    gsap.set(el.note, { top: S.noteTop });
  }
  function camAt(i, s) { var b = slotRect(i); return { x: S.T.cx - b.cx * s, y: S.T.cy - b.cy * s, scale: s }; }
  function camRest() { return S.noteOn ? S.camNote : S.cam0; }
  // everything as it is on the whole-plane overview
  function setOverviewState() {
    gsap.set(el.camera, camRest());
    gsap.set(el.focus, { autoAlpha: 0, scale: S.k, x: 0, y: 0 });
    gsap.set([el.veil, el.hud, el.endcard], { autoAlpha: 0 });
    gsap.set(el.card, { autoAlpha: 0, y: 0 });
    gsap.set([el.ov, el.sun], { autoAlpha: 1, y: 0 });
    gsap.set(el.plane, { '--tag-o': 1 });
    $$('.cloud').forEach(function (c) { gsap.set(c, { x: 0 }); });
  }

  /* ---------- The ride: one scrubbed timeline, pinned with ScrollTrigger ---------- */
  function buildTimeline(n) {
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false } });
    var t = D.intro, prev = S.cam0, segs = [], zooms = [];
    tl.addLabel('overview', 0);
    for (var i = 0; i < n; i++) {
      var g = i ? D.glide : D.glide0, a = camAt(i, S.sA), z = camAt(i, S.sZ);
      segs.push(t);
      // glide along the plane to window i (from the whole plane for the first one)
      tl.fromTo(el.camera, prev, assign({}, a, { duration: g, ease: 'power1.inOut' }), t);
      if (i === 0) {
        tl.fromTo(el.ov, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -18, duration: g * 0.6 }, t);
        tl.fromTo(el.sun, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: g * 0.5 }, t);
        tl.fromTo(el.plane, { '--tag-o': 1 }, { '--tag-o': 0, duration: g * 0.4 }, t);
        tl.fromTo(el.hud, { autoAlpha: 0 }, { autoAlpha: 1, duration: g * 0.6 }, t + g * 0.4);
      }
      t += g;
      zooms.push(t);   // (not a label: labels are the snap points)
      // zoom in: camera closes in, the window grows to fill most of the screen, info slides in
      tl.fromTo(el.camera, a, assign({}, z, { duration: D.zoom, ease: 'power2.inOut' }), t);
      tl.fromTo(el.focus, { scale: S.k }, { scale: 1, duration: D.zoom, ease: 'power2.inOut' }, t);
      tl.fromTo(el.focus, { autoAlpha: 0 }, { autoAlpha: 1, duration: D.zoom * 0.2 }, t);
      tl.fromTo(el.veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: D.zoom * 0.6 }, t + D.zoom * 0.2);
      tl.fromTo(el.card, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: D.zoom * 0.4, ease: 'power2.out' }, t + D.zoom * 0.6);
      t += D.zoom;
      // hold while reading (snap point in the middle)
      tl.addLabel('win' + i, t + D.hold / 2);
      t += D.hold;
      // pull back a little
      tl.fromTo(el.card, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -14, duration: D.back * 0.3 }, t);
      tl.fromTo(el.veil, { autoAlpha: 1 }, { autoAlpha: 0, duration: D.back * 0.6 }, t + D.back * 0.1);
      tl.fromTo(el.focus, { scale: 1 }, { scale: S.k, duration: D.back, ease: 'power2.inOut' }, t);
      tl.fromTo(el.focus, { autoAlpha: 1 }, { autoAlpha: 0, duration: D.back * 0.2 }, t + D.back * 0.8);
      tl.fromTo(el.camera, z, assign({}, a, { duration: D.back, ease: 'power2.inOut' }), t);
      t += D.back;
      prev = a;
    }
    // back out to the whole plane, then the end card
    tl.fromTo(el.camera, prev, assign({}, S.cam0, { duration: D.outro, ease: 'power1.inOut' }), t);
    tl.fromTo(el.hud, { autoAlpha: 1 }, { autoAlpha: 0, duration: D.outro * 0.4 }, t);
    tl.fromTo(el.endcard, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: D.outro * 0.5, ease: 'power2.out' }, t + D.outro * 0.5);
    tl.fromTo(el.plane, { '--tag-o': 0 }, { '--tag-o': 1, duration: D.outro * 0.4 }, t + D.outro * 0.6);
    tl.fromTo(el.sun, { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: D.outro * 0.4 }, t + D.outro * 0.6);
    t += D.outro;
    tl.addLabel('end', t + D.end / 2);
    t += D.end;
    tl.set({}, {}, t);
    // clouds drift slower than the plane (parallax)
    $$('.cloud').forEach(function (c) {
      var d = +c.getAttribute('data-depth') || 0.3;
      tl.fromTo(c, { x: 0 }, { x: -d * S.W * Math.max(1, n) * 0.3, duration: t }, 0);
    });
    S.segs = segs;
    S.zooms = zooms;
    return tl;
  }
  function onRideUpdate() {
    if (!S.tl) return;
    var time = S.tl.time(), idx = 0;
    for (var i = 0; i < S.segs.length; i++) if (time >= S.segs[i] - 0.0001) idx = i;
    if (idx !== S.focusIdx) setFocus(idx);
    var home = time < 0.03;
    if (home !== S.home) {
      S.home = home;
      el.stage.classList.toggle('is-riding', !home);
      if (home) startBob(); else stopBob();
      hideBubble();
    }
  }
  function killRide() {
    if (S.st) { S.st.kill(true); S.st = null; }
    if (S.tl) { S.tl.kill(); S.tl = null; }
    S.segs = [];
    S.home = true;
    el.stage.classList.remove('is-riding');
  }
  function startRide() {
    killRide();
    S.focusIdx = -1;
    setOverviewState();
    var n = openCount();
    if (!gsap || S.mode !== 'ride' || S.phase !== 'ready' || !n) return;
    S.tl = buildTimeline(n);
    S.tl.eventCallback('onUpdate', onRideUpdate);
    setFocus(0);
    renderRail();
    updateEnd();
    if (S.static) return;
    S.st = ST.create({
      id: 'ride', trigger: el.stage, start: 'top top', pin: true, scrub: 0.5, animation: S.tl,
      end: function () { return '+=' + Math.round(S.tl.duration() * el.stage.clientHeight); },
      snap: { snapTo: 'labelsDirectional', inertia: false, duration: { min: 0.25, max: 0.8 }, delay: 0.08, ease: 'power2.inOut' }
    });
  }
  function labelY(label) {
    var st = S.st, tl = S.tl;
    if (!isFinite(st.start) || !isFinite(st.end)) ST.refresh();   // a trigger made mid-resize may not be measured yet
    return st.start + (tl.labels[label] / tl.duration()) * (st.end - st.start);
  }
  // Jump the ride to a label with no in-between motion (used after a direct animation).
  function jumpToLabel(label) {
    if (!S.tl) return;
    var p = S.tl.labels[label] / S.tl.duration();
    if (S.st) {
      S.st.scroll(labelY(label));
      ST.update();
      var tw = S.st.getTween && S.st.getTween();
      if (tw) tw.progress(1);
    }
    S.tl.progress(p);
    onRideUpdate();
  }
  function currentLabel() {
    if (!S.tl) return 'overview';
    var time = S.tl.time(), best = 'overview', bd = Infinity;
    Object.keys(S.tl.labels).forEach(function (k) {
      if (k.indexOf('in') === 0) return;
      var d = Math.abs(S.tl.labels[k] - time);
      if (d < bd) { bd = d; best = k; }
    });
    return best;
  }
  function atHome() { return !S.tl || S.tl.time() < 0.03; }

  /* ---------- The zoomed window + info ---------- */
  function setFocus(i) {
    S.focusIdx = i;
    var s = S.slots[i], t = s && s.tour;
    if (!t) return;
    S.focusTour = t;
    S.photo = 0;
    el.track.innerHTML = [0, 1, 2, 3].map(function (k) {
      return '<img src="' + photoURL(t, k) + '" alt="' + esc(t.name) + ', photo ' + (k + 1) + ' of 4" decoding="async"' + (k ? ' aria-hidden="true"' : '') + '>';
    }).join('');
    gsap.set(el.track, { xPercent: 0 });
    el.dots.innerHTML = [0, 1, 2, 3].map(function (k) {
      return '<button type="button" aria-label="Photo ' + (k + 1) + ' of 4" aria-current="' + (k ? 'false' : 'true') + '"></button>';
    }).join('');
    el.focusWin.setAttribute('aria-label', 'Photos of ' + t.name);
    el.card.innerHTML = infoHTML(t, { id: 'card-name', heading: 'h2' });
    var n = openCount();
    el.winCount.textContent = 'Window ' + (i + 1) + ' of ' + n;
    el.prevWin.disabled = i === 0;
    el.nextWin.disabled = i >= n - 1;
    $$('button', el.rail).forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); });
  }
  function levelHTML(d) { return '<span class="level level--' + d + '" aria-hidden="true"><i></i><i></i><i></i></span>'; }
  function infoHTML(t, o) {
    var h = o.heading || 'h2', sale = t.discount > 0;
    return '<' + h + ' class="info__name"' + (o.id ? ' id="' + o.id + '" tabindex="-1"' : '') + '><span class="info__title">' + esc(t.name) + '</span>' +
      '<span class="info__from"><span class="sr-only">, starts in </span>' + ICON.pin + esc(t.start) + '</span></' + h + '>' +
      '<p class="info__summary">' + esc(t.summary) + '</p>' +
      '<ul class="info__facts">' +
        '<li>' + ICON.clock + t.days + ' days</li>' +
        '<li>' + levelHTML(t.difficulty) + LABEL.difficulty[t.difficulty] + '</li>' +
        '<li>' + ICON.people + 'Up to ' + t.group + ' people</li>' +
      '</ul>' +
      '<p class="info__rating">' + (t.reviews
        ? '<span class="star" aria-hidden="true">★</span><span><span class="sr-only">Rated </span>' + t.rating.toFixed(1) + ' <span class="dim">(' + t.reviews + ' reviews)</span></span>'
        : '<span class="pill-new">New</span><span class="dim">No reviews yet</span>') + '</p>' +
      '<div class="info__buy">' +
        '<p class="info__price">' + (sale ? '<span class="info__sale"><span class="sale-tag">$' + t.discount + ' off</span></span>' : '') +
          '<strong>' + money(salePrice(t)) + '</strong>' + (sale ? '<s><span class="sr-only">was </span>' + money(t.price) + '</s>' : '') + '<span>per person</span></p>' +
        '<p class="info__next">Next trip <strong>' + dateNice(t.next) + '</strong></p>' +
      '</div>' +
      '<a class="btn btn--cta info__cta" href="/tours/' + t.slug + '" data-slug="' + t.slug + '">View tour<span class="sr-only">: ' + esc(t.name) + '</span>' + ICON.arrow + '</a>';
  }
  function goPhoto(root, k, animate) {
    var track = $('.track', root), imgs = $$('img', track);
    if (!imgs.length) return;
    k = (k + imgs.length) % imgs.length;
    root._photo = k;
    if (animate && !reduced() && gsap) gsap.to(track, { xPercent: -100 * k, duration: 0.55, ease: 'power3.inOut', overwrite: true });
    else if (gsap) gsap.set(track, { xPercent: -100 * k });
    else track.style.transform = 'translateX(' + (-100 * k) + '%)';
    imgs.forEach(function (img, j) { img.setAttribute('aria-hidden', j === k ? 'false' : 'true'); });
    $$('.dots button', root).forEach(function (b, j) { b.setAttribute('aria-current', j === k ? 'true' : 'false'); });
  }
  function wirePhotos(root) {
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || !root.contains(b)) return;
      var k = root._photo || 0;
      if (b.classList.contains('photo-btn--prev')) goPhoto(root, k - 1, true);
      else if (b.classList.contains('photo-btn--next')) goPhoto(root, k + 1, true);
      else if (b.parentNode.classList.contains('dots')) goPhoto(root, $$('button', b.parentNode).indexOf(b), true);
    });
    var x0 = null;
    root.addEventListener('pointerdown', function (e) { if (!e.target.closest('button')) x0 = e.clientX; });
    root.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) goPhoto(root, (root._photo || 0) + (dx < 0 ? 1 : -1), true);
    });
  }

  /* ---------- Direct moves: click a window, see all windows, next / previous window ---------- */
  function slotScreen(i) {
    var r = S.slots[i].el.getBoundingClientRect(), sr = el.stage.getBoundingClientRect();
    return { cx: r.left - sr.left + r.width / 2, cy: r.top - sr.top + r.height / 2, w: r.width };
  }
  function zoomTo(i, viaKeyboard) {
    if (!S.slots[i] || !S.slots[i].tour || S.busy) return;
    if (!S.tl) return;
    hideBubble();
    if (S.static || reduced()) { jumpToLabel('win' + i); return; }
    if (!atHome()) { fadeJump('win' + i, viaKeyboard); return; }
    setFocus(i);
    var b = slotScreen(i), z = camAt(i, S.sZ);
    S.directing = true;
    stopBob();
    gsap.timeline({ onComplete: function () {
      gsap.set(el.focus, { x: 0, y: 0 });
      jumpToLabel('win' + i);
      S.directing = false;
      if (viaKeyboard) focusCard();
    } })
      .to(el.ov, { autoAlpha: 0, y: -18, duration: 0.3 }, 0)
      .to(el.sun, { autoAlpha: 0, y: -30, duration: 0.3 }, 0)
      .to(el.plane, { '--tag-o': 0, duration: 0.25 }, 0)
      .to(el.flyer, { x: 0, y: 0, rotation: 0, duration: 0.3 }, 0)
      .to(el.camera, { x: z.x, y: z.y, scale: z.scale, duration: 1, ease: 'power3.inOut' }, 0)
      .fromTo(el.focus, { x: b.cx - S.T.cx, y: b.cy - S.T.cy, scale: b.w / S.T.w, autoAlpha: 0 },
        { x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.inOut' }, 0)
      .to(el.focus, { autoAlpha: 1, duration: 0.15 }, 0)
      .to(el.veil, { autoAlpha: 1, duration: 0.5 }, 0.35)
      .to(el.hud, { autoAlpha: 1, duration: 0.3 }, 0.45)
      .fromTo(el.card, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.65);
  }
  function fadeJump(label, viaKeyboard) {
    S.directing = true;
    gsap.to([el.focus, el.card], { opacity: 0, duration: 0.15, onComplete: function () {
      jumpToLabel(label);
      gsap.fromTo([el.focus, el.card], { opacity: 0 }, { opacity: 1, duration: 0.25 });
      S.directing = false;
      if (viaKeyboard) focusCard();
    } });
  }
  function seeAll(viaKeyboard) {
    if (!S.tl || atHome()) return;
    var i = Math.max(0, S.focusIdx);
    if (S.static || reduced()) { jumpToLabel('overview'); if (viaKeyboard) focusSlot(i); return; }
    var r = slotRect(i), c0 = S.cam0;
    var tx = c0.x + r.cx * c0.scale, ty = c0.y + r.cy * c0.scale;
    var focusShown = gsap.getProperty(el.focus, 'opacity') > 0.05;
    S.directing = true;
    var tl = gsap.timeline({ onComplete: function () {
      gsap.set(el.focus, { x: 0, y: 0 });
      jumpToLabel('overview');
      S.directing = false;
      if (viaKeyboard) focusSlot(i);
    } });
    tl.to([el.card, el.hud, el.endcard], { autoAlpha: 0, duration: 0.2 }, 0)
      .to(el.veil, { autoAlpha: 0, duration: 0.35 }, 0)
      .to(el.camera, { x: c0.x, y: c0.y, scale: c0.scale, duration: 0.9, ease: 'power3.inOut' }, 0)
      .to([el.ov, el.sun], { autoAlpha: 1, y: 0, duration: 0.35 }, 0.55)
      .to(el.plane, { '--tag-o': 1, duration: 0.35 }, 0.6);
    if (focusShown) {
      tl.to(el.focus, { x: tx - S.T.cx, y: ty - S.T.cy, scale: (r.w * c0.scale) / S.T.w, duration: 0.9, ease: 'power3.inOut' }, 0)
        .to(el.focus, { autoAlpha: 0, duration: 0.15 }, 0.75);
    }
  }
  function scrollToLabel(label) {
    if (!S.st) { jumpToLabel(label); return; }
    var y = labelY(label);
    if (reduced() || !W.ScrollToPlugin) { jumpToLabel(label); return; }
    gsap.to(W, { scrollTo: { y: y, autoKill: false }, duration: 0.9, ease: 'power2.inOut' });
  }
  function stepWindow(d) {
    var n = openCount(), j = clamp(S.focusIdx + d, 0, n - 1);
    scrollToLabel('win' + j);
  }
  function focusCard() { var h = $('#card-name'); if (h) h.focus({ preventScroll: true }); }
  function focusSlot(i) { var s = S.slots[i]; if (s && s.tour) s.el.focus({ preventScroll: true }); }

  /* ---------- Rail + end card ---------- */
  function renderRail() {
    var n = openCount();
    el.rail.innerHTML = S.slots.slice(0, n).map(function (s, i) {
      return '<li><button type="button" data-rail="' + i + '" aria-label="Window ' + (i + 1) + ': ' + esc(s.tour.name) + '"></button></li>';
    }).join('');
  }
  function updateEnd() {
    var pc = planeCount(), more = S.plane < pc - 1;
    el.endTitle.textContent = pc > 1 ? "That's every window on this plane." : "That's every window.";
    el.endNext.hidden = !more;
  }

  /* ---------- Idle bob + page-load glide ---------- */
  function startBob() {
    if (S.bob || reduced() || S.static || !gsap || S.mode !== 'ride' || S.loading) return;
    S.bob = gsap.to(el.flyer, { y: S.orient === 'h' ? 5 : 0, x: S.orient === 'v' ? 3 : 0, rotation: 0.35, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }
  function stopBob() {
    if (S.bob) { S.bob.kill(); S.bob = null; }
    if (gsap) gsap.to(el.flyer, { x: 0, y: 0, rotation: 0, duration: 0.3, overwrite: true });
  }
  function shadesOf(list) { return list.map(function (s) { return s.shade; }); }
  function openShadesTween(list, stagger) {
    list.forEach(function (s) { s.el.classList.remove('is-shut'); });
    return gsap.to(shadesOf(list), { y: 0, yPercent: -84, duration: 0.55, ease: 'back.out(1.5)', stagger: stagger || 0.07 });
  }
  function closeShadesTween(list, stagger) {
    return gsap.to(shadesOf(list), { y: 0, yPercent: 0, duration: 0.42, ease: 'bounce.out', stagger: stagger || 0.04,
      onComplete: function () { list.forEach(function (s) { s.el.classList.add('is-shut'); }); } });
  }
  function playLoadIn(done) {
    var open = S.slots.filter(function (s) { return s.tour; });
    if (S.static || reduced()) { done(); return; }
    S.loading = true;
    open.forEach(function (s) { setShade(s, false, true); });
    var h = S.orient === 'h';
    gsap.timeline({ onComplete: function () { S.loading = false; done(); startBob(); } })
      .from(el.flyer, h ? { x: S.W * 0.8, y: -70, rotation: -4, duration: 1.6, ease: 'power3.out' }
                        : { y: S.H * 0.9, duration: 1.4, ease: 'power3.out' })
      .add(open.length ? openShadesTween(open, 0.07) : gsap.to({}, { duration: 0 }), '-=0.5')
      .fromTo(el.plane, { '--tag-o': 0 }, { '--tag-o': 1, duration: 0.4 }, '-=0.45');
  }

  /* ---------- Filters + sort: shades down, then photos slide to their new windows ---------- */
  function viewRect(i) {
    var g = S.slots[i].glass, r = g.getBoundingClientRect(), pr = el.plane.getBoundingClientRect();
    var sc = pr.width / S.PW;
    return { left: (r.left - pr.left) / sc + g.clientLeft, top: (r.top - pr.top) / sc + g.clientTop, width: g.clientWidth, height: g.clientHeight };
  }
  function transitionSlots(before, done) {
    var after = planeTours(S.plane);
    var afterSlugs = after.map(function (t) { return t.slug; });
    if (reduced() || S.static || !gsap) { fillSlots(); done(); return; }
    var leaving = [], moves = [], entering = [];
    before.forEach(function (slug, i) { if (slug && afterSlugs.indexOf(slug) < 0) leaving.push(i); });
    afterSlugs.forEach(function (slug, j) {
      var from = before.indexOf(slug);
      if (from < 0) entering.push(j);
      else if (from !== j) moves.push({ from: from, to: j, slug: slug });
    });
    var dest = moves.map(function (m) { return m.to; });
    var vacated = moves.map(function (m) { return m.from; }).filter(function (i) { return dest.indexOf(i) < 0; });
    var rects = S.slots.map(function (s, i) { return viewRect(i); });
    var changed = {};
    leaving.concat(dest, vacated, entering).forEach(function (i) { changed[i] = true; });
    var tl = gsap.timeline({ onComplete: function () {
      S.slots.forEach(function (s, i) { syncSlot(s, i, after[i]); if (!after[i]) { setShade(s, false, true); } });
      renderTags();
      S.slots.forEach(function (s) { s.el.classList.remove('is-tagless'); });
      done();
    } });
    Object.keys(changed).forEach(function (i) { S.slots[i].el.classList.add('is-tagless'); });
    if (S.sort !== S.lastSort) S.slots.forEach(function (s) { s.el.classList.add('is-tagless'); });
    S.lastSort = S.sort;
    var t = 0;
    // A. shades slide down on windows whose tour no longer matches
    if (leaving.length) {
      tl.add(closeShadesTween(leaving.map(function (i) { return S.slots[i]; }), 0.05), 0);
      t = 0.42 + 0.05 * (leaving.length - 1) + 0.05;
      tl.add(function () { leaving.forEach(function (i) { var v = $('.win__view', S.slots[i].glass); if (v) v.remove(); }); }, t);
    }
    // B. photos that stay slide along the plane to their new window
    if (moves.length) {
      var dur = 0.75;
      tl.add(function () {
        moves.forEach(function (m) {
          var v = S.views[m.slug], r = rects[m.from];
          el.flight.appendChild(v);
          gsap.set(v, { position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: getComputedStyle(S.slots[m.from].glass).borderRadius, x: 0, y: 0, scale: 1 });
        });
      }, t);
      moves.forEach(function (m, k) {
        var r = rects[m.to], v = S.views[m.slug], lift = -(18 / S.s0);
        tl.to(v, { left: r.left, top: r.top, width: r.width, height: r.height, duration: dur, ease: 'power2.inOut' }, t + k * 0.03);
        tl.to(v, { y: lift, scale: 1.06, duration: dur / 2, ease: 'sine.out', yoyo: true, repeat: 1 }, t + k * 0.03);
      });
      if (vacated.length) tl.add(closeShadesTween(vacated.map(function (i) { return S.slots[i]; }), 0.03), t + 0.08);
      t += dur + 0.03 * (moves.length - 1);
      tl.add(function () {
        moves.forEach(function (m) {
          var v = S.views[m.slug], s = S.slots[m.to];
          gsap.set(v, { clearProps: 'all' });
          var old = $('.win__view', s.glass); if (old && old !== v) old.remove();
          s.glass.insertBefore(v, s.glass.firstChild);
          setShade(s, true, true);
        });
      }, t);
    }
    // C. new matches appear: photo goes in behind the closed shade, then the shade goes up
    if (entering.length) {
      tl.add(function () {
        entering.forEach(function (j) {
          var s = S.slots[j], old = $('.win__view', s.glass);
          if (old) old.remove();
          s.glass.insertBefore(viewFor(after[j]), s.glass.firstChild);
          setShade(s, false, true);
        });
      }, t);
      tl.add(openShadesTween(entering.map(function (j) { return S.slots[j]; }), 0.06), t + 0.02);
    }
    // empty windows at the end of the plane keep (or get) their shades down
    S.slots.forEach(function (s, i) { if (!after[i] && before[i] && leaving.indexOf(i) < 0 && vacated.indexOf(i) < 0) tl.add(closeShadesTween([s]), 0); });
  }
  function slugsNow() { return S.slots.map(function (s) { return s.tour ? s.tour.slug : null; }); }
  function onFiltersChanged() {
    readFilters();
    computeResults();
    updateCount(true);
    updatePlanes();
    renderList();
    if (S.mode === 'grid') { renderGrid(); return; }
    if (S.phase !== 'ready') return;
    if (S.busy) { S.pending = true; return; }
    if (S.plane > 0) { goPlane(0); return; }   // new results start again from plane 1
    var before = slugsNow();
    if (!atHome()) jumpToLabel('overview');
    killRide();
    setOverviewState();
    S.busy = true;
    transitionSlots(before, function () {
      S.busy = false;
      if (S.pending) { S.pending = false; onFiltersChanged(); return; }
      afterChange();
    });
  }
  function afterChange() {
    var n = openCount();
    setNote(n ? null : 'empty', function () { startRide(); updateEnd(); });
  }

  /* ---------- Planes: 10 windows each; next plane flies in, this one flies off ---------- */
  function updatePlanes() {
    var pc = planeCount();
    el.planes.hidden = pc < 2;
    el.planeLabel.textContent = 'Plane ' + (S.plane + 1) + ' of ' + pc;
    el.prevPlane.disabled = S.plane === 0;
    el.nextPlane.disabled = S.plane >= pc - 1;
  }
  function goPlane(k) {
    var pc = planeCount();
    if (k < 0 || k > pc - 1 || k === S.plane || S.busy) return;
    hideBubble();
    if (S.mode !== 'ride' || !gsap) { S.plane = k; updatePlanes(); return; }
    if (!atHome()) jumpToLabel('overview');
    killRide();
    setOverviewState();
    S.busy = true;
    stopBob();
    var h = S.orient === 'h';
    var off = h ? { x: -S.W * 1.15, y: -50, rotation: -3 } : { x: 0, y: -S.H * 1.25, rotation: 0 };
    var on = h ? { x: S.W * 1.1, y: 40, rotation: -2 } : { x: 0, y: S.H * 1.2, rotation: 0 };
    var finish = function () {
      S.busy = false;
      if (S.pending) { S.pending = false; onFiltersChanged(); return; }
      setNote(openCount() ? null : 'empty', function () { startRide(); startBob(); });
      say('Plane ' + (k + 1) + ' of ' + planeCount() + '. ' + openCount() + ' windows.');
    };
    if (reduced()) { S.plane = k; buildSlots(capacity(k)); fillSlots(); updatePlanes(); finish(); return; }
    var tl = gsap.timeline({ onComplete: finish });
    tl.to(el.plane, { '--tag-o': 0, duration: 0.2 }, 0)
      .to(el.flyer, assign({ duration: 0.65, ease: 'power2.in' }, off), 0)
      .add(function () {
        S.plane = k;
        buildSlots(capacity(k));
        fillSlots(true);
        updatePlanes();
      })
      .set(el.flyer, on)
      .to(el.flyer, { x: 0, y: 0, rotation: 0, duration: 1.1, ease: 'power3.out' })
      .add(function () { openShadesTween(S.slots.filter(function (s) { return s.tour; }), 0.06); }, '-=0.35')
      .to(el.plane, { '--tag-o': 1, duration: 0.3 }, '+=0.25')
      .to({}, { duration: 0.3 });
  }

  /* ---------- Count, list, live region ---------- */
  var liveTimer = null;
  function updateCount(announce) {
    var m = S.results.length, N = S.all.length, f = activeCount();
    el.countN.textContent = f ? (m ? m : 'No') : N;
    el.countLabel.textContent = !f ? (N === 1 ? 'tour' : 'tours') : m ? 'of ' + N + ' tours match' : 'tours match';
    el.clearAll.hidden = !f;
    el.clearChip.hidden = !f;
    if (announce) {
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () {
        say(!f ? 'Showing all ' + N + ' tours.' : m ? m + ' of ' + N + ' tours match.' : 'No tours match. Clear filters to see all ' + N + '.');
      }, 700);
    }
  }
  function renderList() {
    el.list.innerHTML = S.results.length ? S.results.map(function (t) {
      return '<li><a href="/tours/' + t.slug + '" data-slug="' + t.slug + '"><span class="list__name">' + esc(t.name) + '</span>' +
        '<span class="list__meta">' + esc(t.start) + ' · ' + t.days + ' days · ' + LABEL.difficulty[t.difficulty] + ' · ' + money(salePrice(t)) + '</span></a></li>';
    }).join('') : '<li class="list__empty">No tours match these filters.</li>';
  }
  function say(text) { if (!el.live) return; el.live.textContent = ''; setTimeout(function () { el.live.textContent = text; }, 30); }
  var toastTimer = null;
  function toast(htmlText) {
    el.toast.innerHTML = htmlText;
    el.toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('is-on'); }, 2600);
  }

  /* ---------- Hover / focus name bubble (overview) ---------- */
  function showBubble(b) {
    var i = +b.getAttribute('data-slot'), s = S.slots[i];
    if (!s || !s.tour || !atHome() || S.busy) return;
    var r = b.getBoundingClientRect(), sr = el.stage.getBoundingClientRect();
    el.bubble.textContent = s.tour.name;
    el.bubble.style.left = (r.left - sr.left + r.width / 2) + 'px';   // CSS centres it above the window
    el.bubble.style.top = (r.top - sr.top) + 'px';
    el.bubble.classList.add('is-on');
  }
  function hideBubble() { if (el.bubble) el.bubble.classList.remove('is-on'); }

  /* ---------- Notes: empty / waiting / error (the plane shrinks up, the note sits under it) ---------- */
  function setNote(which, done) {
    var on = !!which;
    el.note.hidden = !on;
    ['empty', 'waiting', 'error'].forEach(function (k) { el['note_' + k].hidden = k !== which; });
    if (on === S.noteOn || S.mode !== 'ride' || !gsap) { S.noteOn = on; if (done) done(); return; }
    S.noteOn = on;
    var to = camRest();
    if (S.static || reduced()) { gsap.set(el.camera, to); if (done) done(); }
    else gsap.to(el.camera, { x: to.x, y: to.y, scale: to.scale, duration: 0.7, ease: 'power3.inOut', onComplete: done });
    if (on) gsap.fromTo(el.note, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: S.static ? 0 : 0.4, delay: S.static ? 0 : 0.25 });
  }

  /* ---------- Waiting + error ---------- */
  var waitTimer = null, waitStart = 0;
  function setQuiet(quiet) {
    el.stage.classList.toggle('is-quiet', quiet);
    $$('input, select', el.ov).forEach(function (x) { x.disabled = quiet; });
    el.ride.setAttribute('aria-busy', S.phase === 'waiting' ? 'true' : 'false');
  }
  function startWaiting(autoReadyMs, seed) {
    S.phase = 'waiting';
    killRide();
    S.all = []; S.results = [];
    buildSlots(PER_PLANE);
    fillSlots(true);
    setQuiet(true);
    updateCount(false);
    el.countN.textContent = '';
    el.countLabel.textContent = 'Loading tours…';
    renderList();
    el.list.innerHTML = '<li class="list__empty">Loading the tours…</li>';
    if (S.mode === 'ride') {
      layout();
      setOverviewState();
      setNote('waiting');
      gsap.set(el.camera, S.camNote);
      if (!reduced() && !S.static) {
        S.wave = gsap.to(shadesOf(S.slots), { y: 0, yPercent: -16, duration: 0.5, ease: 'sine.inOut', stagger: { each: 0.1, repeat: -1, yoyo: true } });
      }
    } else {
      el.gridWrap.hidden = false;
      el.grid.innerHTML = '<li class="grid-empty"><div class="note__card">' + el.note_waiting.innerHTML.replace(/ id="[^"]*"/g, '').replace('<button', '<button data-retry') + '</div></li>';
    }
    waitStart = Date.now() - (seed || 0) * 1000;
    tickWait();
    clearInterval(waitTimer);
    waitTimer = setInterval(tickWait, 1000);
    say('Loading the tours. The first load can take up to a minute.');
    if (autoReadyMs) setTimeout(function () { if (S.phase === 'waiting') ready(true); }, autoReadyMs);
  }
  function tickWait() {
    var s = Math.floor((Date.now() - waitStart) / 1000);
    var txt = Math.floor(s / 60) + ':' + pad2(s % 60);
    $$('#wait-time, .grid .note__time').forEach(function (n) { n.textContent = txt; });
    var slow = s >= 60;
    el.waitSlow.hidden = !slow;
    $$('.grid .note__slow').forEach(function (n) { n.hidden = !slow; });
  }
  function stopWaiting() {
    clearInterval(waitTimer);
    if (S.wave) { S.wave.kill(); S.wave = null; }
  }
  function showError() {
    stopWaiting();
    S.phase = 'error';
    killRide();
    S.all = []; S.results = [];
    buildSlots(PER_PLANE);
    fillSlots(true);
    setQuiet(true);
    el.countN.textContent = '0';
    el.countLabel.textContent = 'tours loaded';
    el.list.innerHTML = '<li class="list__empty">The tours didn\'t load. Try again from the top of the page.</li>';
    if (S.mode === 'ride') {
      layout();
      setOverviewState();
      setNote('error');
      gsap.set(el.camera, S.camNote);
    } else {
      el.gridWrap.hidden = false;
      el.grid.innerHTML = '<li class="grid-empty"><div class="note__card" role="alert">' + el.note_error.innerHTML.replace(/ id="[^"]*"/g, '').replace('<button', '<button data-retry') + '</div></li>';
    }
  }
  // The data arrived (mockup: from the arrays above)
  function ready(fromWaiting) {
    stopWaiting();
    S.phase = 'ready';
    S.all = opt('tours') === '30' ? REAL.concat(sampleTours(21)) : REAL.slice();
    S.by = {};
    S.all.forEach(function (t) { S.by[t.slug] = t; });
    readFilters();
    computeResults();
    var pc = planeCount();
    S.plane = clamp((+opt('plane') || 1) - 1, 0, pc - 1);
    setQuiet(false);
    updateCount(false);
    updatePlanes();
    renderList();
    if (S.mode === 'grid') { renderGrid(); return; }
    buildSlots(capacity(S.plane));
    layout();
    var n = planeTours(S.plane).length;
    if (fromWaiting) {
      fillSlots(true);
      openShadesTween(S.slots.filter(function (s) { return s.tour; }), 0.07);
      setNote(n ? null : 'empty', function () { startRide(); startBob(); });
      say(S.all.length + ' tours loaded.');
      return;
    }
    S.noteOn = !n;
    fillSlots(false);
    setOverviewState();
    if (!n) {
      el.note.hidden = false;
      el.note_empty.hidden = false;
      gsap.fromTo(el.note, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: S.static || reduced() ? 0 : 0.4 });
      return;
    }
    var zoom = opt('zoom'), at = opt('at');
    var go = function () {
      startRide();
      if (S.static && at) { seekStatic(at); return; }
      if (zoom) {
        var idx = planeTours(S.plane).map(function (t) { return t.slug; }).indexOf(zoom);
        // wait for the page's load event: ScrollTrigger refreshes then, and a jump made before it is lost
        var jump = function () { setTimeout(function () { ST.refresh(); if (idx > -1) jumpToLabel('win' + idx); }, 60); };
        if (doc.readyState === 'complete') jump(); else W.addEventListener('load', jump);
      }
    };
    if (zoom || S.static) go(); else playLoadIn(go);
  }
  // Screenshots: freeze the ride at a label or a time (no pinning)
  function seekStatic(at) {
    if (!S.tl) return;
    var time = isNaN(+at) ? S.tl.labels[at] : +at;
    if (time === undefined) return;
    S.tl.seek(time, false);
    onRideUpdate();
  }

  /* ---------- Reduced motion: windows in a grid, info under each ---------- */
  function renderGrid() {
    el.gridWrap.hidden = false;
    if (!S.results.length) {
      el.grid.innerHTML = '<li class="grid-empty"><div class="note__card"><p class="note__hand hand">every shade is down</p><h2 class="note__title">No tours match all of those</h2>' +
        '<p class="note__text">Try taking one filter off, or start over.</p><button type="button" class="btn btn--cta" data-clear>Clear filters</button></div></li>';
      return;
    }
    el.grid.innerHTML = S.results.map(function (t, i) {
      return '<li class="gcard"><div class="win win--card" role="group" aria-label="Photos of ' + esc(t.name) + '"><span class="win__frame"><span class="win__ring" aria-hidden="true"></span><span class="win__glass">' +
        '<span class="track">' + [0, 1, 2, 3].map(function (k) { return '<img src="' + photoURL(t, k) + '" alt="' + esc(t.name) + ', photo ' + (k + 1) + ' of 4" loading="lazy" decoding="async"' + (k ? ' aria-hidden="true"' : '') + '>'; }).join('') + '</span>' +
        '<span class="win__glare" aria-hidden="true"></span><span class="win__glare win__glare--2" aria-hidden="true"></span><span class="win__shade" aria-hidden="true"><span class="win__handle"></span></span>' +
        '<button type="button" class="photo-btn photo-btn--prev" aria-label="Previous photo of ' + esc(t.name) + '">' + ICON.prev + '</button>' +
        '<button type="button" class="photo-btn photo-btn--next" aria-label="Next photo of ' + esc(t.name) + '">' + ICON.next + '</button>' +
        '<span class="dots" role="group" aria-label="Choose a photo">' + [0, 1, 2, 3].map(function (k) { return '<button type="button" aria-label="Photo ' + (k + 1) + ' of 4" aria-current="' + (k ? 'false' : 'true') + '"></button>'; }).join('') + '</span>' +
        '</span></span></div><div class="info">' + infoHTML(t, { heading: 'h3' }) + '</div></li>';
    }).join('');
    $$('.win--card', el.grid).forEach(function (w) { wirePhotos(w); });
  }

  /* ---------- Modes: ride (motion) or grid (reduced motion) ---------- */
  function syncIntro() {
    var sub = $('#intro-sub');
    if (!sub._ride) sub._ride = sub.textContent;
    sub.textContent = S.mode === 'grid' ? sub.getAttribute('data-grid-text') : sub._ride;
  }
  function setMode() {
    var mode = (!gsap || !ST || reduced()) ? 'grid' : 'ride';
    S.mode = mode;
    syncIntro();
    doc.body.classList.toggle('is-grid', mode === 'grid');
    el.gridWrap.hidden = mode !== 'grid';
    if (mode === 'grid') {
      killRide();
      stopBob();
      if (S.phase === 'ready') renderGrid();
    } else {
      el.grid.innerHTML = '';
      if (S.phase === 'ready') {
        buildSlots(capacity(S.plane));
        layout();
        fillSlots(false);
        S.noteOn = !planeTours(S.plane).length;
        el.note.hidden = !S.noteOn;
        ['empty', 'waiting', 'error'].forEach(function (k) { el['note_' + k].hidden = !(S.noteOn && k === 'empty'); });
        startRide();
        if (S.noteOn) gsap.set(el.note, { autoAlpha: 1, y: 0 });
        startBob();
      }
    }
  }

  /* ---------- Theme, motion, version (A / B) switches ---------- */
  function syncThemeLabels() {
    var dark = html.getAttribute('data-theme') === 'dark';
    $$('[data-label-light]').forEach(function (b) { b.setAttribute('aria-label', b.getAttribute(dark ? 'data-label-dark' : 'data-label-light')); });
    $$('[data-text-light]').forEach(function (b) { b.textContent = b.getAttribute(dark ? 'data-text-dark' : 'data-text-light'); });
  }
  function wireSwitches() {
    syncThemeLabels();
    $$('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        try { localStorage.setItem('vantage-theme', next); } catch (e) {}
        syncThemeLabels();
      });
    });
    var m = $('#motion-toggle');
    m.setAttribute('aria-pressed', html.getAttribute('data-motion') === 'reduce' ? 'true' : 'false');
    m.addEventListener('click', function () {
      var on = html.getAttribute('data-motion') !== 'reduce';
      if (on) html.setAttribute('data-motion', 'reduce'); else html.removeAttribute('data-motion');
      m.setAttribute('aria-pressed', on ? 'true' : 'false');
      try { localStorage.setItem('vantage-motion', on ? 'reduce' : ''); } catch (e) {}
      W.scrollTo(0, 0);
      setMode();
    });
    $$('#review button').forEach(function (b) {
      b.setAttribute('aria-pressed', html.getAttribute('data-view') === b.getAttribute('data-view') ? 'true' : 'false');
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-view');
        html.setAttribute('data-view', v);
        $$('#review button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var u = new URL(location.href);
        if (v === 'inside') u.searchParams.set('view', 'inside'); else u.searchParams.delete('view');
        history.replaceState(null, '', u.toString());
      });
    });
  }

  /* ---------- Seats for version B (decoration) ---------- */
  function drawSeats() {
    var g = $('#seats');
    if (!g || g.childNodes.length) return;
    var out = '';
    for (var i = 0; i < PER_PLANE; i++) {
      var x = G.x0 + G.pitch * i;
      out += '<g transform="translate(' + x + ' 0)">' +
        '<path class="c-seat" d="M-48 458H32Q42 458 42 468V476Q42 486 32 486H-48Q-58 486 -58 476V468Q-58 458 -48 458Z"/>' +
        '<path class="c-seat" d="M4 494L18 362Q20 348 34 348H50Q64 350 62 364L50 494Z"/>' +
        '<path class="c-cover" d="M18 362Q20 348 34 348H50Q64 350 62 364L59 386H15Z"/>' +
        '<path class="c-pipe" d="M37 398L32 480"/>' +
        '<path class="c-arm" d="M-44 432H26Q32 432 32 438V442Q32 448 26 448H-44Q-50 448 -50 442V438Q-50 432 -44 432Z"/>' +
        '<path class="c-leg" d="M-36 488L-30 504M30 488L24 504"/></g>';
    }
    g.innerHTML = out;
  }
  // version B: a window recess in the cabin wall behind each window that exists on this plane
  function drawRecesses(n) {
    var g = $('#recess');
    if (!g) return;
    var out = '';
    for (var i = 0; i < n; i++) {
      var x = G.x0 + G.pitch * i;
      out += '<rect x="' + (x - 64) + '" y="156" width="128" height="160" rx="58"/>';
    }
    g.innerHTML = out;
  }

  /* ---------- Parts sheet (pages/tours-parts.html) ---------- */
  function partWin(t, o) {
    o = o || {};
    var w = o.w || 120, h = o.land ? w * G.along / G.across : w * G.across / G.along, em = Math.min(w, h) / 56;
    var shade = o.shade === 'closed' ? 'transform:none' : o.shade === 'peek' ? 'transform:translateY(-16%)' : 'transform:translateY(-84%)';
    var photo = t ? '<span class="win__view"><img src="' + photoURL(t, o.k || 0) + '" alt=""></span>' : '';
    return '<div class="win ' + (o.cls || '') + (o.shade === 'closed' ? ' is-shut' : '') + '" style="width:' + w + 'px;height:' + h + 'px;font-size:' + em + 'px">' +
      '<span class="win__frame"><span class="win__ring"></span><span class="win__glass">' + photo +
      '<span class="win__glare"></span><span class="win__glare win__glare--2"></span>' +
      '<span class="win__shade" style="' + shade + '"><span class="win__handle"></span></span>' + (o.extra || '') + '</span></span>' +
      (o.tag ? '<span class="win__tag"' + (o.land ? ' style="left:calc(100% + 14px);top:50%;transform:translateY(-50%);text-align:left;border-radius:.7em;line-height:1.2;padding:.15em .7em .2em"' : '') + '>' + o.tag + '</span>' : '') + '</div>';
  }
  function cell(inner, cap) { return '<div class="parts__cell">' + inner + '<p class="parts__cap">' + cap + '</p></div>'; }
  function renderParts() {
    var T = {}; REAL.forEach(function (t) { T[t.slug] = t; });
    var sea = T['the-sea-explorer'], star = T['the-star-gazer'], nl = T['the-northern-lights'], wine = T['the-wine-taster'], forest = T['the-forest-hiker'];
    var dots = '<span class="dots">' + [0, 1, 2, 3].map(function (k) { return '<button type="button" aria-label="Photo ' + (k + 1) + ' of 4" aria-current="' + (k === 1 ? 'true' : 'false') + '"></button>'; }).join('') + '</span>';
    var arrows = '<button type="button" class="photo-btn photo-btn--prev" aria-label="Previous photo">' + ICON.prev + '</button><button type="button" class="photo-btn photo-btn--next" aria-label="Next photo">' + ICON.next + '</button>';
    var marks = [[2, 30, 1], [5.5, 70, 2], [56, 64, 3], [78, 11, 4], [62, 17.5, 5], [27, 33, 6], [10, 41, 7], [33, 90, 8]].map(function (m) {
      return '<span class="anatomy__dot" style="left:' + m[0] + '%;top:' + m[1] + '%">' + m[2] + '</span>';
    }).join('');
    $('#p-anatomy').innerHTML =
      '<div class="anatomy">' + partWin(sea, { w: 320, k: 1, extra: arrows + dots }) + marks + '</div>' +
      '<ol class="anatomy__legend">' +
      ['<strong>Bezel</strong> <span>white (night: neutral-200), navy outline max(1.5px, .4em), radius 23em</span>',
       '<strong>Ring</strong> <span>sand-100, 0.3em sand-300 edge, inset 1.6em, radius 21em</span>',
       '<strong>Glass + photo</strong> <span>inset 4.2em, radius 18.6em, overflow hidden; photo is object-fit: cover</span>',
       '<strong>Shade</strong> <span>sand-100 with sand-300 ridges every 3.2em; open = yPercent −84, closed = 0</span>',
       '<strong>Shade handle</strong> <span>7em × 1.6em, navy-600 with a navy outline</span>',
       '<strong>Glare</strong> <span>two white bars at 32% opacity, rotated 28°</span>',
       '<strong>Photo arrows</strong> <span>46px, white with a navy pop shadow; zoomed window and grid only</span>',
       '<strong>Dots</strong> <span>one per photo (cover + 3); the current one is sun-300 and slightly bigger</span>'
      ].map(function (txt, i) { return '<li><b>' + (i + 1) + '</b><div>' + txt + '</div></li>'; }).join('') + '</ol>';
    $('#p-states').innerHTML = '<div class="parts__sky parts__row">' +
      cell(partWin(forest, { w: 150, tag: '$397' }), 'Open') +
      cell(partWin(sea, { w: 150, tag: '$497', cls: 'is-hover' }), 'Hover: lifts 4px + name bubble') +
      cell(partWin(star, { w: 150, tag: '$2,997', cls: 'is-focus' }), 'Keyboard focus: sun + navy ring') +
      cell(partWin(nl, { w: 150, shade: 'closed' }), 'Shade down: no match') +
      cell(partWin(null, { w: 150, shade: 'peek' }), 'Waiting: shades peek up and down') +
      '</div><div class="parts__sky parts__sky--night parts__row" data-theme="dark">' +
      cell(partWin(wine, { w: 150, tag: '$1,697' }), 'Night: open') +
      cell(partWin(null, { w: 150, shade: 'closed' }), 'Night: shade down glows') +
      '</div>';
    $('#p-tags').innerHTML = '<div class="parts__sky parts__row">' +
      cell(partWin(sea, { w: 110, tag: '$497' }), 'Price sort') +
      cell(partWin(forest, { w: 110, tag: '★ 5.0' }), 'Rating sort') +
      cell(partWin(nl, { w: 110, tag: 'New' }), 'Rating sort, no reviews') +
      cell(partWin(star, { w: 110, tag: '9 days' }), 'Length sort') +
      cell('<div style="width:300px">' + partWin(sea, { w: 92, land: true, tag: '<b>Sea Explorer</b>$497' }) + '</div>', 'Phone: label beside the window') +
      '</div>';
    $('#p-info').innerHTML = [[sea, 'Rated'], [nl, 'New (no reviews yet)'], [wine, 'On sale']].map(function (x) {
      return '<div class="parts__cell"><article class="card">' + infoHTML(x[0], { heading: 'h3' }) + '</article><p class="parts__cap">' + x[1] + '</p></div>';
    }).join('');
    $('#p-hud').innerHTML =
      '<div class="hud"><button type="button" class="btn btn--ghost btn--sm"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="4" height="10" rx="2"/><rect x="10" y="7" width="4" height="10" rx="2"/><rect x="17" y="7" width="4" height="10" rx="2"/></svg>See all windows</button>' +
      '<ol class="rail">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return '<li><button type="button" aria-label="Window ' + (k + 1) + '" aria-current="' + (k === 1 ? 'true' : 'false') + '"></button></li>'; }).join('') + '</ol>' +
      '<div class="hud__step"><button type="button" class="icon-btn icon-btn--sm" aria-label="Previous window">' + ICON.prev + '</button><span class="hud__count">Window 2 of 9</span><button type="button" class="icon-btn icon-btn--sm" aria-label="Next window">' + ICON.next + '</button></div></div>' +
      '<div class="parts__row"><div class="planes"><button type="button" class="icon-btn icon-btn--sm" aria-label="Previous plane">' + ICON.prev + '</button><span class="planes__label">Plane 2 of 3</span><button type="button" class="btn btn--plane">Next plane ' + ICON.next + '</button></div>' +
      '<div class="tally"><p class="count"><strong>4</strong> of 9 tours match</p><button type="button" class="text-btn">Clear filters</button></div>' +
      '<p class="bubble is-on" style="position:relative;transform:none;margin-top:12px">The Sea Explorer</p></div>' +
      '<div class="endcard"><p class="endcard__title">That\'s every window on this plane.</p><div class="endcard__actions"><button type="button" class="btn btn--cta">Next plane ' + ICON.arrow + '</button><button type="button" class="btn btn--ghost">See all windows</button></div></div>';
    $('#p-notes').innerHTML = ['note-empty', 'note-waiting', 'note-error'].map(function (id) {
      var src = { 'note-empty': '<p class="note__hand hand">every shade is down</p><h3 class="note__title">No tours match all of those</h3><p class="note__text">Try taking one filter off, or start over.</p><button type="button" class="btn btn--cta">Clear filters</button>',
        'note-waiting': '<h3 class="note__title">Getting the windows ready</h3><p class="note__text">Our server naps when it\'s quiet. Waking it up can take up to a minute, then the shades go up.</p><p class="note__time">0:24</p><p class="note__hand hand">no need to refresh</p>',
        'note-error': '<h3 class="note__title">We can\'t load the tours right now</h3><p class="note__text">Something went wrong on our side, or the connection dropped. Give it a moment, then try again.</p><button type="button" class="btn btn--cta">Try again</button>' }[id];
      return '<div class="note__card">' + src + '</div>';
    }).join('');
  }

  /* ---------- Init ---------- */
  function init() {
    if (doc.body.getAttribute('data-page') === 'parts') {
      $$('[data-theme-toggle]').forEach(function (b) {
        b.addEventListener('click', function () {
          var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          html.setAttribute('data-theme', next);
          try { localStorage.setItem('vantage-theme', next); } catch (e) {}
          syncThemeLabels();
        });
      });
      syncThemeLabels();
      renderParts();
      return;
    }
    el = {
      ride: $('#ride'), stage: $('#stage'), sun: $('.sun-btn'), ov: $('#ov'), ovPlane: $('#ov-plane'), form: $('#filters'), sort: $('#sort'),
      countN: $('#count-n'), countLabel: $('#count-label'), clearAll: $('#clear-all'), clearChip: $('#clear-chip'),
      planes: $('#planes'), planeLabel: $('#plane-label'), prevPlane: $('#prev-plane'), nextPlane: $('#next-plane'),
      camera: $('#camera'), flyer: $('#flyer'), plane: $('#plane'), slots: $('#slots'), flight: $('#flight'),
      focus: $('#focus'), focusWin: $('#focus-win'), track: $('#track'), dots: $('#focus-win .dots'),
      card: $('#card'), hud: $('#hud'), rail: $('#rail'), winCount: $('#win-count'), prevWin: $('#prev-win'), nextWin: $('#next-win'),
      seeAll: $('#see-all'), veil: $('#veil'), bubble: $('#bubble'), endcard: $('#endcard'), endTitle: $('#end-title'), endNext: $('#end-next'),
      note: $('#note'), note_empty: $('#note-empty'), note_waiting: $('#note-waiting'), note_error: $('#note-error'),
      waitSlow: $('#wait-slow'), gridWrap: $('#grid-wrap'), grid: $('#grid'), list: $('#list'), live: $('#live'), toast: $('#toast')
    };
    wireSwitches();
    drawSeats();
    el.plane.setAttribute('data-orient', S.orient);

    // presets (state pages) and URL
    PRE.forEach(function (v, k) { var box = $('input[name="' + k + '"][value="' + v + '"]', el.form); if (box) box.checked = true; });
    Q.forEach(function (v, k) { var box = $('input[name="' + k + '"][value="' + v + '"]', el.form); if (box) box.checked = true; });
    if (opt('sort') && SORTS[opt('sort')]) el.sort.value = opt('sort');

    // controls
    el.form.addEventListener('change', onFiltersChanged);
    el.sort.addEventListener('change', onFiltersChanged);
    [el.clearAll, el.clearChip].forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('input', el.form).forEach(function (b) { b.checked = false; });
        onFiltersChanged();
        $('input', el.form).focus();   // the button hides itself, so keep focus in the filters
      });
    });
    var clearAndFocus = function () {
      $$('input', el.form).forEach(function (b) { b.checked = false; });
      onFiltersChanged();
      setTimeout(function () { var f = $('.win:not([disabled])', el.slots); if (f && S.mode === 'ride') f.focus({ preventScroll: true }); }, 1400);
    };
    $('#clear-empty').addEventListener('click', clearAndFocus);
    el.grid.addEventListener('click', function (e) {
      if (e.target.closest('[data-clear]')) clearAndFocus();
      if (e.target.closest('[data-retry]')) startWaiting(2400);
    });
    el.prevPlane.addEventListener('click', function () { goPlane(S.plane - 1); });
    el.nextPlane.addEventListener('click', function () { goPlane(S.plane + 1); });
    el.endNext.addEventListener('click', function () { goPlane(S.plane + 1); });
    $('#end-all').addEventListener('click', function (e) { seeAll(e.detail === 0); });
    el.seeAll.addEventListener('click', function (e) { seeAll(e.detail === 0); });
    el.prevWin.addEventListener('click', function () { stepWindow(-1); });
    el.nextWin.addEventListener('click', function () { stepWindow(1); });
    el.rail.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rail]'); if (!b) return;
      var j = +b.getAttribute('data-rail');
      if (Math.abs(j - S.focusIdx) <= 1) scrollToLabel('win' + j); else fadeJump('win' + j);
    });
    $('#error-retry').addEventListener('click', function () { startWaiting(2400); });
    $('#wait-retry').addEventListener('click', function () { startWaiting(2400); });

    // windows: click / Enter zooms straight in; hover or focus shows the name
    el.slots.addEventListener('click', function (e) {
      var b = e.target.closest('.win'); if (!b || b.disabled) return;
      zoomTo(+b.getAttribute('data-slot'), e.detail === 0);
    });
    el.slots.addEventListener('pointerover', function (e) { var b = e.target.closest('.win'); if (b && e.pointerType !== 'touch') showBubble(b); });
    el.slots.addEventListener('pointerout', function (e) { if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.win')) hideBubble(); });
    el.slots.addEventListener('focusin', function (e) { var b = e.target.closest('.win'); if (b && atHome()) showBubble(b); });
    el.slots.addEventListener('focusout', hideBubble);
    wirePhotos(el.focusWin);
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && S.tl && !atHome() && !S.directing) { e.preventDefault(); seeAll(true); }
    });
    // links: in the mockup, show where they go
    doc.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-slug]');
      if (!a) return;
      e.preventDefault();
      toast('In the app this opens <code>/tours/' + a.getAttribute('data-slug') + '</code>');
    });
    // resize: re-fit and rebuild the ride, staying on the same window
    var rt = null, lastW = W.innerWidth;
    W.addEventListener('resize', function () {
      // remember where we were before ScrollTrigger's own refresh moves things
      if (!S.resizeLabel) S.resizeLabel = currentLabel();
      clearTimeout(rt);
      rt = setTimeout(function () {
        var label = S.resizeLabel || currentLabel();
        S.resizeLabel = null;
        if (S.mode !== 'ride' || S.phase !== 'ready' || S.busy || !gsap) return;
        if (Math.abs(W.innerWidth - lastW) < 2 && S.st) { ST.refresh(); jumpToLabel(label); return; }
        lastW = W.innerWidth;
        killRide();
        layout();
        fillSlots(false);
        if (S.noteOn) gsap.set(el.camera, S.camNote);
        startRide();
        if (S.st) ST.refresh();
        if (label !== 'overview') jumpToLabel(label);
      }, 160);
    });

    S.mode = (!gsap || !ST || reduced()) ? 'grid' : 'ride';
    syncIntro();
    doc.body.classList.toggle('is-grid', S.mode === 'grid');
    el.gridWrap.hidden = S.mode !== 'grid';
    var start = opt('state') || html.getAttribute('data-state') || 'ready';
    var go = function () {
      if (start === 'waiting') startWaiting(0, +opt('t') || 0);
      else if (start === 'error') showError();
      else ready(false);
    };
    // wait for fonts so the overview measures the final layout
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(go); else go();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();

  // For poking around in the console (and the tests)
  W.VantageTours = {
    state: S, zoomTo: zoomTo, seeAll: seeAll, goPlane: goPlane, jumpToLabel: jumpToLabel,
    labels: function () { return S.tl ? S.tl.labels : {}; }, seek: seekStatic
  };
})();

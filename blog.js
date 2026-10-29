/* blog.js: מה שמשותף לעמודי הבלוג (עמוד המאמרים ועמוד המאמר). אותה התנהגות כמו site.js של דף הבית,
   בלי הבוט, האלבום והתהליך. בסוף: עמוד המאמרים עצמו (רק אם יש #blg-grid).
   סדר טעינה: kit.js, a11y.js, articles.js, blog.js (ואחריו article.js בעמוד המאמר). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var STILL = /(^|[?&])still(=|&|$)/.test(location.search);
  var calm = function () { return STILL || root.classList.contains('a11y-still') || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  if (STILL) root.classList.add('still');

  /* ---------- אייקונים (אותם של דף הבית) ---------- */
  function I(p, sw) { return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var IC = {
    phone: I('<path d="M5 4.5h3.5l1.7 4.2-2.2 1.5a11 11 0 0 0 5.8 5.8l1.5-2.2 4.2 1.7V19a1.5 1.5 0 0 1-1.6 1.5C10.4 20 4 13.6 3.5 6.1A1.5 1.5 0 0 1 5 4.5z"/>'),
    chat: I('<path d="M12 3.8a8.2 8.2 0 0 0-7.1 12.3L4 20l4-1a8.2 8.2 0 1 0 4-15.2z"/><path d="M8.6 10.6h6.8M8.6 13.6h4.4"/>'),
    check: I('<path d="M5 12.5l4.2 4.2L19 7"/>', 2.4),
    down: I('<path d="M12 5v14M6 13l6 6 6-6"/>', 1.9),
    chevL: I('<path d="M14.5 6l-6 6 6 6"/>', 1.8),
    plus: I('<path d="M12 5v14M5 12h14"/>', 2),
    menu: I('<path d="M4 7h16M4 12h16M4 17h16"/>', 1.9),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>', 1.9),
    arrowL: I('<path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5"/>', 1.8),
    lock: I('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
    share: I('<circle cx="17.5" cy="5.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/><path d="M8.7 10.8l6.6-4M8.7 13.2l6.6 4"/>'),
    link: I('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>'),
    clock: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    search: I('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>', 2.1)
  };
  function icons(r) { $$('[data-ico]', r).forEach(function (el) { var k = el.getAttribute('data-ico'); if (IC[k]) el.outerHTML = IC[k]; }); }

  /* ---------- גלים: עותקים של הגל מהפתיחה (.h-wave, שנמצא בעמוד פעם אחת) ----------
     data-wave="dn" = אותו גל (שוקולד ← שמנת), data-wave="up" = הגל ההפוך (שמנת ← שוקולד), כל אחד עם id-ים משלו */
  (function () {
    var src = $('.h-wave'), n = 0; if (!src) return;
    $$('[data-wave]').forEach(function (ph) {
      var isUp = ph.getAttribute('data-wave') === 'up', sfx = '-bw' + (++n);
      var t = document.createElement('div');
      t.innerHTML = src.outerHTML.replace(/id="([\w-]+)"/g, 'id="$1' + sfx + '"').replace(/url\(#([\w-]+)\)/g, 'url(#$1' + sfx + ')');
      var svg = t.firstElementChild;
      if (isUp) {
        svg.setAttribute('class', 't-wave');
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', 'translate(1440 1760) scale(-1 -1)');
        Array.prototype.slice.call(svg.childNodes).forEach(function (c) { if ((c.nodeName || '').toLowerCase() !== 'defs') g.appendChild(c); });
        svg.appendChild(g);
      }
      $$('.h-drip', svg).forEach(function (p) { p.style.fill = 'url(#hdrip' + sfx + ')'; });
      $$('.h-gl', svg).forEach(function (p) { p.style.stroke = 'url(#hgl' + sfx + ')'; });
      ph.parentNode.replaceChild(svg, ph);
    });
  })();

  /* ---------- חותמת זהב עם שוליים מסולסלים ---------- */
  var sid = 0;
  function sealSVG() {
    var id = 'bsg' + (sid++), n = 24, R = 45, r = 6.6, d = '';
    for (var k = 0; k <= n; k++) {
      var a = k / n * Math.PI * 2, x = (R * Math.cos(a)).toFixed(2), y = (R * Math.sin(a)).toFixed(2);
      d += k === 0 ? 'M' + x + ' ' + y : ' A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + y;
    }
    return '<svg viewBox="-52 -52 104 104" aria-hidden="true"><defs>' +
      '<radialGradient id="' + id + 'a" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".3" stop-color="#EACB7E"/><stop offset=".66" stop-color="#C29540"/><stop offset="1" stop-color="#7E5818"/></radialGradient>' +
      '<radialGradient id="' + id + 'b" cx="62%" cy="70%" r="75%"><stop offset="0" stop-color="#F5DE9C"/><stop offset=".55" stop-color="#C9A04A"/><stop offset="1" stop-color="#9C722B"/></radialGradient></defs>' +
      '<path d="' + d + 'Z" fill="url(#' + id + 'a)"/>' +
      '<circle r="37" fill="url(#' + id + 'b)" stroke="rgba(110,74,20,.55)" stroke-width="1.2"/>' +
      '<circle r="33" fill="none" stroke="rgba(90,58,14,.55)" stroke-width="1.1" stroke-dasharray="2.4 2.6"/>' +
      '<circle r="37" fill="none" stroke="rgba(255,246,216,.55)" stroke-width=".8" transform="translate(-.8 -.8)"/>' +
      '<ellipse cx="-14" cy="-20" rx="14" ry="6" fill="rgba(255,250,232,.35)" transform="rotate(-30 -14 -20)"/></svg>';
  }
  function seals(r) { $$('.seal', r).forEach(function (el) { if (el.__s) return; el.__s = 1; el.insertAdjacentHTML('afterbegin', sealSVG()); }); }

  /* ---------- הלוגו בזהב: תיבה הדוקה סביב הכתב, וזהב מבריק ---------- */
  function goldLogos() {
    $$('.hdr .logo svg, .foot .logo svg').forEach(function (svg) {
      svg.setAttribute('viewBox', '60 82 1240 408');
      var g = svg.querySelector('linearGradient'); if (!g) return;
      g.setAttribute('gradientUnits', 'userSpaceOnUse');
      g.setAttribute('x1', '0'); g.setAttribute('y1', '92'); g.setAttribute('x2', '140'); g.setAttribute('y2', '480');
      g.innerHTML = '<stop offset="0" stop-color="#FFF3CC"/><stop offset=".28" stop-color="#F3D894"/><stop offset=".5" stop-color="#DDB766"/><stop offset=".66" stop-color="#C79A4A"/><stop offset=".82" stop-color="#E7C77D"/><stop offset="1" stop-color="#B98B3E"/>';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', goldLogos); else goldLogos();

  /* ---------- אבק זהב (כל canvas.dust, data-n = כמה גרגרים) ---------- */
  function dust(cv) {
    var n = +cv.getAttribute('data-n') || 34;
    var ctx = cv.getContext('2d'), P = [], w = 0, h = 0, on = false, dpr = Math.min(2, devicePixelRatio || 1);
    function size() { var r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function seed() { P = []; for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, v: .08 + Math.random() * .25, d: (Math.random() - .5) * .15, t: Math.random() * 6.28 }); }
    function draw() {
      if (!on) return;
      ctx.clearRect(0, 0, w, h);
      P.forEach(function (p) {
        if (!calm()) { p.y -= p.v; p.x += p.d; p.t += .02; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } }
        var a = .25 + .45 * (.5 + .5 * Math.sin(p.t));
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        g.addColorStop(0, 'rgba(255,236,170,' + a + ')'); g.addColorStop(1, 'rgba(201,160,74,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 6.29); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    size(); seed();
    addEventListener('resize', function () { size(); seed(); });
    new IntersectionObserver(function (es) { var was = on; on = es[0].isIntersecting; if (on && !was) draw(); }).observe(cv);
  }

  /* ---------- כניסה בגלילה ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
  function reveal(r) { $$('.rv,.place,.kin', r).forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); }); }

  /* ---------- סרטונים: מתנגנים רק כשהם על המסך ---------- */
  function videos(r) {
    $$('video', r).forEach(function (v) {
      if (v.__o) return; v.__o = 1;
      new IntersectionObserver(function (es) { if (es[0].isIntersecting && !calm()) v.play().catch(function () { }); else v.pause(); }, { threshold: .25 }).observe(v);
    });
  }

  /* ---------- הודעה קטנה ---------- */
  var tt = 0;
  function toast(m) { var t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 3400); }

  /* מה שעמוד המאמר (article.js) יכול להשתמש בו אחרי שהוא מוסיף תוכן לעמוד */
  window.PatBlog = {
    $: $, $$: $$, calm: calm, toast: toast, IC: IC,
    dress: function (r) { seals(r); icons(r); reveal(r); videos(r); }
  };

  /* =====================================================================
     עמוד המאמרים: נושאים (פס שוקולד עם בורר זהב שזז, באותה שורה של הכותרת) והכרטיסים. רץ רק כשיש #blg-grid
     ===================================================================== */
  (function () {
    var grid = $('#blg-grid'), A = window.PAT_ARTICLES, T = window.PAT_TOPICS; if (!grid || !A || !T) return;
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var seg = $('#blg-seg'), count = $('#blg-count'), cur = 'all';
    var TILT = [-.8, .6, -.5, .8, -.6, .5, -.9, .7, -.4];
    var tname = function (k) { var t = T.filter(function (x) { return x.key === k; })[0]; return t ? t.name : ''; };
    var list = function (k) { return A.filter(function (a) { return k === 'all' || a.cat === k; }); };
    function card(a, i) {
      return '<article class="pcard" style="--r:' + TILT[i % TILT.length] + 'deg;--d:' + (i % 4) * 110 + 'ms">' +
        '<span class="ptag"><i aria-hidden="true"></i>' + esc(a.tag) + '</span>' +
        '<figure class="pc-ph"><img src="' + esc(a.img) + '" alt="' + esc(a.alt) + '" loading="lazy" decoding="async"></figure>' +
        '<h3>' + esc(a.title) + '</h3><p>' + esc(a.ex) + '</p>' +
        '<a class="pc-btn" href="' + esc(a.href) + '" aria-label="לקריאה: ' + esc(a.title) + '">לקריאה<i data-ico="arrowL"></i></a></article>';
    }

    /* הנושאים: פס שוקולד, והבורר בזהב מחליק אל הנושא שנבחר */
    seg.innerHTML = '<span class="sg-ind" aria-hidden="true"></span>' + T.map(function (t) {
      return '<button type="button" class="sg" data-k="' + t.key + '" aria-pressed="' + (t.key === 'all') + '"><span>' + esc(t.name) + '</span></button>';
    }).join('');
    var ind = $('.sg-ind', seg);
    function place() { var b = $('.sg[aria-pressed="true"]', seg); if (!b) return; ind.style.width = b.offsetWidth + 'px'; ind.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }

    function paint(first) {
      var L = list(cur);
      grid.innerHTML = L.map(card).join('');
      icons(grid);
      count.textContent = (L.length === 1 ? 'מאמר אחד' : L.length + ' מאמרים') + (cur === 'all' ? '' : ' ב' + tname(cur));
      var cs = $$('.pcard', grid);
      if (first) { cs.forEach(function (c) { c.classList.add('rv'); }); reveal(grid); return; }
      if (calm()) return;
      cs.forEach(function (c) { c.classList.add('drop'); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { cs.forEach(function (c) { c.classList.add('on'); }); }); });
    }
    paint(true);
    place();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    addEventListener('resize', place);

    seg.addEventListener('click', function (e) {
      var b = e.target.closest('.sg'); if (!b || b.getAttribute('data-k') === cur) return;
      cur = b.getAttribute('data-k');
      $$('.sg', seg).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      place(); paint();
      if (b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
    });

  })();

  /* ---------- הפעלה ---------- */
  seals(document); icons(document); reveal(document); videos(document);
  $$('canvas.dust').forEach(dust);

  /* ---------- גלילה: הדר וכפתור צף ---------- */
  var hdr = $('#hdr'), fab = $('#fab');
  function onScroll() {
    if (hdr) hdr.classList.toggle('solid', scrollY > 40);
    if (fab) {
      var hide = scrollY < 300 || $$('[data-cta]').some(function (z) { var r = z.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
      fab.classList.toggle('hide', hide);
    }
  }
  var raf = 0;
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; onScroll(); }); }, { passive: true });
  onScroll();

  /* ---------- תפריט במובייל ---------- */
  var dr = $('#drawer'), mb = $('#mbtn');
  function drawer(on) { dr.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); document.body.style.overflow = on ? 'hidden' : ''; }
  if (dr && mb) {
    mb.addEventListener('click', function () { drawer(true); });
    $('#mx').addEventListener('click', function () { drawer(false); });
    dr.addEventListener('click', function (e) { if (e.target.closest('a')) drawer(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') drawer(false); });
  }

  /* ---------- נגישות ---------- */
  if (window.PatA11y) PatA11y.init({ position: innerWidth > 820 ? 'end' : 'start' });
  $$('[data-a11y]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var b = document.getElementById('a11y-btn'); if (b) b.click(); }); });
})();

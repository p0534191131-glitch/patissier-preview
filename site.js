/* site.js: פטיסייר, אתר בסגנון "היומן". */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var STILL = /(^|[?&])still(=|&|$)/.test(location.search);
  var calm = function () { return STILL || root.classList.contains('a11y-still') || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var mobile = function () { return innerWidth <= 820; };

  /* ---------- אייקונים ---------- */
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
    lock: I('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>')
  };
  function icons(r) { $$('[data-ico]', r).forEach(function (el) { var k = el.getAttribute('data-ico'); if (IC[k]) el.outerHTML = IC[k]; }); }

  /* ---------- גלים בין שמנת לשוקולד: עותקים של הגל מהפתיחה, כל אחד עם id-ים משלו ----------
     data-wave="dn" = הגל של תחתית הפתיחה (שוקולד ← שמנת), data-wave="up" = הגל ההפוך שבראש הצעת המחיר (שמנת ← שוקולד) */
  (function () {
    var dn = $('#top .h-wave'), up = $('#bot .t-wave'), n = 0;
    $$('[data-wave]').forEach(function (ph) {
      var isUp = ph.getAttribute('data-wave') === 'up', src = isUp ? up : dn; if (!src) return;
      var sfx = '-w' + (++n);
      ph.insertAdjacentHTML('afterend', src.outerHTML.replace(/id="([\w-]+)"/g, 'id="$1' + sfx + '"').replace(/url\(#([\w-]+)\)/g, 'url(#$1' + sfx + ')'));
      var svg = ph.nextElementSibling; ph.remove();
      if (!isUp) { // בגל של הפתיחה הגרדיאנטים מגיעים מה-CSS, אז מפנים אותם ל-id החדש
        $$('.h-drip', svg).forEach(function (p) { p.style.fill = 'url(#hdrip' + sfx + ')'; });
        $$('.h-gl', svg).forEach(function (p) { p.style.stroke = 'url(#hgl' + sfx + ')'; });
      }
    });
  })();

  /* ---------- הלוגו בזהב כ-SVG (לאווטאר בחלון השיחה) ---------- */
  var GOLD = '<stop offset="0" stop-color="#FFF3CC"/><stop offset=".28" stop-color="#F3D894"/><stop offset=".5" stop-color="#DDB766"/><stop offset=".66" stop-color="#C79A4A"/><stop offset=".82" stop-color="#E7C77D"/><stop offset="1" stop-color="#B98B3E"/>';
  var lgn = 0;
  function logoSVG() {
    var id = 'lgc' + (lgn++);
    return '<svg viewBox="60 82 1240 408" aria-hidden="true"><defs><linearGradient id="' + id + 'g" gradientUnits="userSpaceOnUse" x1="0" y1="92" x2="140" y2="480">' + GOLD + '</linearGradient>' +
      '<mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="0" y="0" width="1376" height="768"><image href="media/img/logo-mask.png" width="1376" height="768"/><rect x="200" y="480" width="1176" height="288" fill="black"/></mask></defs>' +
      '<rect width="1376" height="768" fill="url(#' + id + 'g)" mask="url(#' + id + 'm)"/></svg>';
  }

  /* ---------- 4. התהליך: סרט זהב גלי שעובר דרך שש הנקודות, ונמתח בגלילה. כל שלב נדלק כשהסרט מגיע אליו,
     וכשגוללים חזרה הסרט מתקצר והשלבים כבים (לבקשת אפרים) ---------- */
  (function () {
    var W = $('#stepsw'), S = $('#steps'); if (!W || !S) return;
    var items = $$('.stp', S), dots = items.map(function (li) { return $('.stp-dot', li); });
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ribbon'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    W.appendChild(svg); S.classList.add('js');
    var len = 0, at = [], P = [], vert = false, best = 0, mk = null, ys = [];
    var f1 = function (v) { return v.toFixed(1); };
    function curve(p, q, s, A) { // קטע S רך בין שתי נקודות: הבקרה מוזזת לצד אחד, ובקטע הבא לצד השני
      var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L * A * s, ny = dx / L * A * s;
      return ' C' + f1(p[0] + dx / 3 + nx) + ' ' + f1(p[1] + dy / 3 + ny) + ' ' + f1(q[0] - dx / 3 + nx) + ' ' + f1(q[1] - dy / 3 + ny) + ' ' + f1(q[0]) + ' ' + f1(q[1]);
    }
    function build() {
      var b = W.getBoundingClientRect(); if (!b.width) return;
      P = dots.map(function (d) { var r = d.getBoundingClientRect(); return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top]; });
      vert = Math.abs(P[1][1] - P[0][1]) > Math.abs(P[1][0] - P[0][0]);
      var A = vert ? 12 : 30, k = P.length - 1;
      var u0 = [P[1][0] - P[0][0], P[1][1] - P[0][1]], uN = [P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]];
      var n0 = Math.sqrt(u0[0] * u0[0] + u0[1] * u0[1]), nN = Math.sqrt(uN[0] * uN[0] + uN[1] * uN[1]);
      // הסרט יוצא קצת מעבר לנקודה הראשונה והאחרונה, אבל לא עד קצה המסך
      var lead = vert ? 26 : Math.max(0, Math.min(46, innerWidth - b.right - 14)), tail = vert ? 0 : Math.max(0, Math.min(54, b.left - 14));
      var st = [P[0][0] - u0[0] / n0 * lead, P[0][1] - u0[1] / n0 * lead], en = [P[k][0] + uN[0] / nN * tail, P[k][1] + uN[1] / nN * tail];
      var d = 'M' + f1(st[0]) + ' ' + f1(st[1]) + ' L' + f1(P[0][0]) + ' ' + f1(P[0][1]), parts = [d];
      for (var i = 0; i < k; i++) { d += curve(P[i], P[i + 1], i % 2 ? -1 : 1, A); parts.push(d); }
      if (tail) d += ' L' + f1(en[0]) + ' ' + f1(en[1]);
      // אורך הסרט עד כל נקודה (בשביל ההדלקה)
      var tmp = document.createElementNS(NS, 'path'); svg.appendChild(tmp);
      at = parts.map(function (pd) { tmp.setAttribute('d', pd); return tmp.getTotalLength(); });
      tmp.setAttribute('d', d); len = tmp.getTotalLength(); tmp.remove();
      ys = [st[1]].concat(P.map(function (p) { return p[1]; }));
      var w = b.width, h = b.height, off = vert ? function (v) { return 'translate(' + v + ' 0)'; } : function (v) { return 'translate(0 ' + v + ')'; };
      var g = vert ? 'x1="0" y1="0" x2="0" y2="' + f1(h) + '"' : 'x1="' + f1(w) + '" y1="0" x2="0" y2="0"';
      svg.setAttribute('viewBox', '0 0 ' + f1(w) + ' ' + f1(h));
      svg.innerHTML = '<defs><linearGradient id="rbg" gradientUnits="userSpaceOnUse" ' + g + '>' +
        '<stop offset="0" stop-color="#B98B3C"/><stop offset=".14" stop-color="#F3DA98"/><stop offset=".3" stop-color="#C9A04A"/><stop offset=".48" stop-color="#E9CC80"/><stop offset=".64" stop-color="#B88A3A"/><stop offset=".82" stop-color="#F2D995"/><stop offset="1" stop-color="#C29540"/></linearGradient>' +
        '<filter id="rbs" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>' +
        '<mask id="rbm" maskUnits="userSpaceOnUse" x="-80" y="-80" width="' + f1(w + 160) + '" height="' + f1(h + 160) + '"><path d="' + d + '" fill="none" stroke="#fff" stroke-width="46" stroke-linecap="round" stroke-dasharray="' + f1(len + 2) + ' ' + f1(len + 2) + '"/></mask></defs>' +
        '<g mask="url(#rbm)" fill="none" stroke-linecap="round">' +
        '<path d="' + d + '" stroke="rgba(59,26,16,.22)" stroke-width="12" filter="url(#rbs)" transform="' + off(3) + '"/>' +
        '<path d="' + d + '" stroke="url(#rbg)" stroke-width="12"/>' +
        '<path d="' + d + '" stroke="rgba(255,248,222,.55)" stroke-width="2.4" transform="' + off(-2.6) + '"/>' +
        '<path d="' + d + '" stroke="rgba(74,40,12,.42)" stroke-width="1" stroke-dasharray="4 3.4" transform="' + off(-3.6) + '"/>' +
        '<path d="' + d + '" stroke="rgba(74,40,12,.42)" stroke-width="1" stroke-dasharray="4 3.4" transform="' + off(3.6) + '"/></g>';
      mk = svg.querySelector('mask path');
      paint();
    }
    // כמה מהסרט כבר נמתח: במחשב לפי מיקום השורה במסך, בטלפון לפי קו בשלושה רבעים מגובה המסך
    function reach() {
      if (calm()) return len;
      var b = W.getBoundingClientRect(), vh = innerHeight;
      if (!vert) return Math.max(0, Math.min(1, (vh * .9 - b.top - P[0][1]) / (vh * .48))) * len;
      var y = vh * .74 - b.top, pts = [0].concat(at); // ys[0] = תחילת הסרט, ys[i+1] = נקודה i
      if (y <= ys[0]) return 0;
      for (var i = 1; i < ys.length; i++) if (y < ys[i]) return pts[i - 1] + (pts[i] - pts[i - 1]) * (y - ys[i - 1]) / (ys[i] - ys[i - 1]);
      return len;
    }
    function paint() {
      if (!mk) return;
      best = reach();
      mk.setAttribute('stroke-dashoffset', f1(len + 2 - best));
      items.forEach(function (li, i) { li.classList.toggle('on', best >= at[i] - 3); });
    }
    var rq = 0, rt = 0;
    addEventListener('scroll', function () { if (!rq) rq = requestAnimationFrame(function () { rq = 0; paint(); }); }, { passive: true });
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    addEventListener('load', build);
    build();
  })();

  /* ---------- 6. סיפורי הצלחה: ציטוט אחד בכל פעם. מתחלף לבד כשהחלק על המסך, נעצר כשמצביעים או בוחרים ---------- */
  (function () {
    var T = $('#tst'), sec = $('#stories'); if (!T || !sec) return;
    var tabs = $$('.tst-t', T), qs = $$('.tst-q', T), cur = 0;
    function show(i, focus) {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) { var on = k === cur; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      qs.forEach(function (q, k) { var on = k === cur; q.classList.toggle('on', on); q.setAttribute('aria-hidden', on ? 'false' : 'true'); q.inert = !on; });
      if (focus) tabs[cur].focus();
    }
    var stop = function () { sec.classList.add('manual'); };
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { stop(); show(k); });
      t.addEventListener('keydown', function (e) {
        var to = e.key === 'ArrowLeft' ? cur + 1 : e.key === 'ArrowRight' ? cur - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (to === null) return; e.preventDefault(); stop(); show(to, true);
      });
      $('.tst-bar', t).addEventListener('animationend', function () { if (!sec.classList.contains('manual')) show(cur + 1); });
    });
    if (calm()) stop();
    T.addEventListener('pointerenter', function () { sec.classList.add('hold'); });
    T.addEventListener('pointerleave', function () { sec.classList.remove('hold'); });
    T.addEventListener('focusin', function () { sec.classList.add('hold'); });
    T.addEventListener('focusout', function (e) { if (!T.contains(e.relatedTarget)) sec.classList.remove('hold'); });
    new IntersectionObserver(function (es) { sec.classList.toggle('run', es[0].isIntersecting); }, { threshold: .45 }).observe(T);
    show(0);
  })();

  /* ---------- 8. יצירת קשר: טופס בנראות בלבד. לא נשלח לשום מקום, רק מראה "קיבלנו" ---------- */
  (function () {
    var f = $('#ctf'), ok = $('#ctok'); if (!f || !ok) return;
    function check(inp, err, good, msg) {
      inp.closest('.fld').classList.toggle('bad', !good);
      inp.setAttribute('aria-invalid', good ? 'false' : 'true');
      err.textContent = good ? '' : msg;
      return good;
    }
    var n = $('#cf-n'), p = $('#cf-p');
    var vn = function () { return check(n, $('#cf-ne'), n.value.trim().length > 1, 'חסר שם'); };
    var vp = function () { return check(p, $('#cf-pe'), p.value.replace(/\D/g, '').length >= 9, 'חסר מספר טלפון'); };
    n.addEventListener('input', function () { if (n.closest('.bad')) vn(); });
    p.addEventListener('input', function () { if (p.closest('.bad')) vp(); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = vn(), b = vp();
      if (!a) { n.focus(); return; }
      if (!b) { p.focus(); return; }
      ok.style.minHeight = f.offsetHeight + 'px';
      f.hidden = true; ok.hidden = false; ok.focus({ preventScroll: true });
    });
  })();

  /* ---------- חותמת זהב עם שוליים מסולסלים ---------- */
  var sid = 0;
  function sealSVG() {
    var id = 'sg' + (sid++), n = 24, R = 45, r = 6.6, d = '';
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
  function seals(r) { $$('.seal', r).forEach(function (el) { if (el.__s) return; el.__s = 1; el.insertAdjacentHTML('afterbegin', sealSVG()); if (el.hasAttribute('data-logo')) el.insertAdjacentHTML('beforeend', '<span class="logo" data-tone="ink"></span>'); }); }

  /* ---------- שלוש הרמות: שלושה כרטיסים זה לצד זה. בכל כרטיס כל הפריטים בטור אחד, באותו סדר,
     כדי שאפשר יהיה להשוות שורה מול שורה: כלול (וי), נוסף ברמה הזו (זהב), לא כלול (בהיר) ---------- */
  var TIERS = [
    { n: 1, name: 'נבחרת הקינוחים', who: 'בשביל מי שאוהבת לסדר בעצמה.' },
    { n: 2, name: 'בר של השמחות', who: 'בשביל מי שרוצה ראש שקט.' },
    { n: 3, name: 'בר קונספט', who: 'בשביל מי שרוצה שידברו על זה שנים.' }
  ];
  /* מה מקבלים: כל רמה מוסיפה את הדברים שלה על הקודמת (הנוסח של אפרים) */
  var ADD = [['קינוחים', 'עוגות ראווה'], ['משלוח', 'כלים', 'אביזרים', 'סכו״ם', 'מפות וניירות', 'הקמת הבר', 'איסוף הכלים'], ['עיצוב', 'לוגו', 'רעיון', 'צבעי האירוע', 'עוגה ממותגת']];
  var NO = I('<path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>', 2);
  var ALL = ADD.reduce(function (s, a) { return s + a.length; }, 0);
  if ($('#tgrid')) $('#tgrid').innerHTML = TIERS.map(function (t, i) {
    var lis = ADD.map(function (a, lv) {
      return a.map(function (x) {
        var st = lv > i ? 'no' : lv === i && i ? 'new' : 'yes';
        return '<li class="' + st + '"><span class="ck">' + (st === 'no' ? NO : IC.check) + '</span><span>' + x + '</span>' +
          (st === 'new' ? '<em>חדש</em>' : '') + (st === 'no' ? '<span class="sr"> (לא כלול)</span>' : '') + '</li>';
      }).join('');
    }).join('');
    var n = ADD.slice(0, i + 1).reduce(function (s, a) { return s + a.length; }, 0);
    return '<article class="pk" data-lv="' + i + '"><header class="pk-h"><span class="pk-n' + (i === 2 ? ' foil' : '') + '">' + t.n + '</span><div><h3>' + t.name + '</h3><p>' + t.who + '</p></div></header>' +
      '<div class="pk-b"><p class="pk-t"><span>מה כלול</span><b>' + n + ' מתוך ' + ALL + '</b></p><ul>' + lis + '</ul>' +
      '<p class="pk-p">המחיר המדויק לפי מספר האורחים</p><a class="btn btn-main" href="#bot" aria-label="לקבל הצעת מחיר ל' + t.name + '">לקבל הצעת מחיר</a></div></article>';
  }).join('');

  /* ---------- גלריה: הספר נבנה ב-book.js (ספר שולחן במראה מגזין, תלת ממד) ---------- */

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

  /* ---------- חותמות + אייקונים ---------- */
  seals(document); icons(document);

  /* ---------- אבק זהב ---------- */
  function dust(cv, n) {
    if (!cv) return;
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
  dust($('#dust'), 46); dust($('#dust2'), 26); dust($('#dust3'), 40);

  /* ---------- כניסה בגלילה ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
  $$('.rv,.place,.kin').forEach(function (el) { io.observe(el); });

  /* ---------- הבוט ---------- */
  var chat = null, touched = false;
  /* בדף הבית הבוט יושב בחלון שיחה רחב (.cwin) ולא בטלפון: אווטאר עם הלוגו, השם, ונקודה עם "עונה עכשיו" */
  function dress(el) {
    if (!el.closest('.cwin')) return;
    var av = $('.chat-av', el), nm = $('.chat-head b', el), sm = $('.chat-head small', el), tag = $('.chat-tag', el), inp = $('input.chat-in', el);
    if (av) { av.innerHTML = logoSVG(); av.setAttribute('aria-hidden', 'true'); }
    if (nm) nm.textContent = 'פטיסייר';
    if (sm) sm.textContent = 'עונה עכשיו';
    if (tag) tag.remove();
    if (inp) inp.setAttribute('aria-label', 'ההודעה שלך');
  }
  if ($('#chat')) dress($('#chat'));
  function mountBot() {
    if (chat || !window.Bot) return;
    if (!Store.S) Store.load();
    var el = $('#chat');
    var EMO = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    new MutationObserver(function () {
      $$('.msg', el).forEach(function (m) {
        if (m.__c) return; m.__c = 1;
        var w = document.createTreeWalker(m, NodeFilter.SHOW_TEXT), n;
        while ((n = w.nextNode())) if (EMO.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/(\S)?\s?[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]️?\s?/gu, function (m0, p) { return p ? p + (/[.!?,]/.test(p) ? ' ' : '. ') : ''; }).trim();
      });
    }).observe(el, { childList: true, subtree: true });
    chat = Bot.mountChat(el, { source: 'site', onLead: function () { toast('נשלח. נחזור אלייך עם ההצעה'); } });
    chat.t = Date.now();
    dress(el);
    // אחרי ההודעה הראשונה כפתורי התשובה המהירה כבר לא רלוונטיים
    var tr = $('#tries'), cf = $('.chat-foot', el);
    if (tr && cf) cf.addEventListener('submit', function () { tr.hidden = true; });
    var input = $('.chat-in', el), f = input.focus.bind(input);
    input.focus = function () { if (touched) f({ preventScroll: true }); };
    el.addEventListener('pointerdown', function () { touched = true; });
  }
  var wait = function () { return Math.max(0, 1700 - (Date.now() - chat.t)); };
  function send(text) {
    mountBot(); touched = true;
    setTimeout(function () { var i = $('#chat .chat-in'), f = $('#chat .chat-foot'); i.value = text; if (f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event('submit', { cancelable: true })); }, wait());
  }
  $$('#tries .try').forEach(function (b) { b.addEventListener('click', function () { send(b.textContent); $('#tries').hidden = true; }); });
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { mountBot(); o.disconnect(); } }, { threshold: .3 }).observe($('#bot .cwin') || $('#bot'));
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#bot"]'); if (!a) return;
    e.preventDefault(); drawer(false);
    ($('#bot .cwin') || $('#bot')).scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'center' });
    mountBot(); touched = true;
    setTimeout(function () { $('#chat .chat-in').focus(); }, Math.max(900, wait()));
  });

  /* ---------- סרטונים: מתנגנים רק כשהם על המסך ---------- */
  $$('video').forEach(function (v) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting && !calm()) v.play().catch(function () { }); else v.pause(); }, { threshold: .25 }).observe(v);
  });

  /* ---------- גלילה: הדר, המילה בזהב, כפתור צף ---------- */
  var hdr = $('#hdr'), word = $('#word'), fab = $('#fab'), zones = $$('[data-cta]').concat([$('#bot')]);
  function onScroll() {
    hdr.classList.toggle('solid', scrollY > 40);
    if (calm()) word.style.setProperty('--fill', 1);
    else { var r = word.getBoundingClientRect(); word.style.setProperty('--fill', Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight * .7))).toFixed(3)); }
    var hide = scrollY < 300 || zones.some(function (z) { var r = z.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
    fab.classList.toggle('hide', hide);
  }
  var raf = 0;
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; onScroll(); }); }, { passive: true });
  onScroll();

  /* ---------- תפריט במובייל ---------- */
  var dr = $('#drawer'), mb = $('#mbtn');
  function drawer(on) { dr.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); document.body.style.overflow = on ? 'hidden' : ''; }
  mb.addEventListener('click', function () { drawer(true); });
  $('#mx').addEventListener('click', function () { drawer(false); });
  dr.addEventListener('click', function (e) { if (e.target.closest('a')) drawer(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') drawer(false); });

  /* ---------- הודעה, הגדלה, נגישות ---------- */
  var tt = 0;
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 3400); }
  if (window.PatLightbox) PatLightbox.init();
  if (window.PatA11y) PatA11y.init({ position: innerWidth > 820 ? 'end' : 'start' });
  $$('[data-a11y]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var b = document.getElementById('a11y-btn'); if (b) b.click(); }); });
})();

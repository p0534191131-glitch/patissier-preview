/* i1.js: רעיון 1 · ההזמנה. נטען אחרי blog.js ו-article.js ובונה סביב התוכן הקיים (בלי לשנות טקסט, id או class).
   1. סאטן שוקולד, מצויר פעם אחת ב-canvas קבוע מאחורי כל העמוד.
   2. הפתיחה: הזמנה מתקפלת סגורה, הכותרת בפויל זהב שתופס אור. הגלילה פותחת את הכנפיים בתלת ממד וחושפת את צילום הבר
      שמודפס בפנים, ובכנף ימין את הפתיח. בטלפון: כריכה אחת שנפתחת ימינה, והצילום והפתיח בפנים.
   3. גוף המאמר: דף כותנה ארוך עם קצה פרום, לוגו בהטבעה עיוורת, פינות פויל לצילום, סרט סאטן לתווית המתנה, "נא להשיב" לרשימה. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('idea-1')) return;
  var B = window.PatBlog || {};
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var calm = B.calm || function () { return root.classList.contains('still') || root.classList.contains('a11y-still') || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var hero = $('.ar-hero'), art = $('#ar-art');
  if (!hero || !art) return;
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function hide(e) { e.setAttribute('aria-hidden', 'true'); return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function eio(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- קצה פרום: נקודות אקראיות קבועות (seed) לאורך כל צד ---------- */
  function rnd(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function edgeN(n, r) {
    var step = 9, c = [], o = [], i;
    for (i = 0; i <= Math.ceil(n / step) + 1; i++) c.push(r());
    for (i = 0; i <= n; i++) {
      var k = i / step, i0 = Math.floor(k), f = k - i0, f2 = (1 - Math.cos(f * Math.PI)) / 2, h = r();
      o.push(.55 * (c[i0] * (1 - f2) + c[i0 + 1] * f2) + .45 * h * h * h);
    }
    return o;
  }
  function deckle(w, h, ed, seed, amp, sp) {
    amp = amp || 2.6; sp = sp || 2.6;
    var r = rnd(seed), nx = Math.max(6, Math.round(w / sp)), ny = Math.max(6, Math.round(h / sp));
    var ax = amp / w * 100, ay = amp / h * 100, P = [], e, i;
    e = ed.t ? edgeN(nx, r) : null; for (i = 0; i <= nx; i++) P.push([i / nx * 100, e ? e[i] * ay : 0]);
    e = ed.r ? edgeN(ny, r) : null; for (i = 0; i <= ny; i++) P.push([100 - (e ? e[i] * ax : 0), i / ny * 100]);
    e = ed.b ? edgeN(nx, r) : null; for (i = 0; i <= nx; i++) P.push([100 - i / nx * 100, 100 - (e ? e[i] * ay : 0)]);
    e = ed.l ? edgeN(ny, r) : null; for (i = 0; i <= ny; i++) P.push([e ? e[i] * ax : 0, 100 - i / ny * 100]);
    return P;
  }
  function poly(P, mirror) {
    return 'polygon(' + P.map(function (p) { return (mirror ? 100 - p[0] : p[0]).toFixed(3) + '% ' + p[1].toFixed(3) + '%'; }).join(',') + ')';
  }

  /* ---------- הלוגו בהטבעה עיוורת (אותו לוגו של kit.js, בצבע הנייר) ---------- */
  var lid = 0;
  function blindLogo(fill) {
    var id = 'i1lg' + (lid++);
    return '<svg viewBox="60 82 1240 408" aria-hidden="true" focusable="false"><defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="0" y="0" width="1376" height="768">' +
      '<image href="media/img/logo-mask.png" width="1376" height="768"/><rect x="200" y="480" width="1176" height="288" fill="black"/></mask></defs>' +
      '<rect width="1376" height="768" fill="' + fill + '" mask="url(#' + id + ')"/></svg>';
  }

  /* =====================================================================
     1. סאטן שוקולד: קפלים רכים, אור מלמעלה מימין וברק (מצויר ברזולוציה נמוכה ומתוח)
     ===================================================================== */
  var cv = hide(mk('canvas', 'i1-satin')), sl = hide(mk('div', 'i1-satin-l'));
  document.body.insertBefore(sl, document.body.firstChild);
  document.body.insertBefore(cv, document.body.firstChild);
  var satinKey = '';
  function satin() {
    var vw = innerWidth, vh = innerHeight;
    var k = vw < 700 ? 2 : 2.4, w = Math.round(vw / k), h = Math.round(vh / k), key = w + 'x' + Math.round(h / 30);
    if (key === satinKey) return; satinKey = key;
    cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var im = ctx.createImageData(w, h), d = im.data;
    var L = [.46, -.62, .64], ln = Math.hypot(L[0], L[1], L[2]); L = [L[0] / ln, L[1] / ln, L[2] / ln];
    var Hv = [L[0], L[1], L[2] + 1], hn = Math.hypot(Hv[0], Hv[1], Hv[2]); Hv = [Hv[0] / hn, Hv[1] / hn, Hv[2] / hn];
    var C0 = [72, 34, 15], C1 = [104, 54, 27], C2 = [156, 93, 53], C3 = [224, 172, 122];
    function F(x, y) {
      var wp = .2 * Math.sin(y * 2.3 + 1.1) + .12 * Math.sin(x * 1.7 + y * .9 + 2.4);
      var u = x * .8 + y * .6 + wp, a = u * 6.4;
      return Math.sin(a) + .32 * Math.sin(2 * a + .4) + .42 * Math.sin(u * 11.5 + y * 2.4 + .7) + .3 * Math.sin((x * .55 - y * 1.1) * 4.6 + 1.9) + .22 * Math.sin((x * 1.25 + y * .15) * 2.8);
    }
    var e = .003, K = .085, i = 0;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++, i += 4) {
        var fx = x / h, fy = y / h, h0 = F(fx, fy);
        var nx = -(F(fx + e, fy) - h0) / e * K, ny = -(F(fx, fy + e) - h0) / e * K, nz = 1, nn = Math.hypot(nx, ny, nz); nx /= nn; ny /= nn; nz /= nn;
        var dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
        var nh = Math.max(0, nx * Hv[0] + ny * Hv[1] + nz * Hv[2]);
        var sh = Math.pow(nh, 7) * .46 + Math.pow(nh, 42) * .4;
        var t = clamp((dif - .28) / .64, 0, 1);
        var vx = x / w - .52, vy = y / h - .44, vig = Math.max(.7, 1 - .5 * (vx * vx * 1.5 + vy * vy * 1.9));
        var spot = .1 * Math.exp(-(vx * vx * 4 + vy * vy * 5));
        for (var c = 0; c < 3; c++) {
          var base = t < .5 ? C0[c] + (C1[c] - C0[c]) * t * 2 : C1[c] + (C2[c] - C1[c]) * (t - .5) * 2;
          base *= vig + spot;
          d[i + c] = base + (C3[c] - base) * sh * vig;
        }
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(im, 0, 0);
  }

  /* =====================================================================
     2. הפתיחה: ההזמנה המתקפלת
     ===================================================================== */
  var crumbs = $('.ar-crumbs', hero), label = $('.ar-hin > .label', hero), h1 = $('.ar-h1', hero),
    lead = $('.ar-lead', hero), meta = $('.ar-meta', hero), shot = $('.ar-shot'), img = shot && $('img', shot);

  var scene = mk('div', 'i1-scene');
  scene.innerHTML =
    '<div class="i1-stage"><div class="i1-rig"><div class="i1-card" role="group" aria-label="ההזמנה">' +
      '<i class="i1-cast" aria-hidden="true"></i><i class="i1-cast2" aria-hidden="true"></i>' +
      '<div class="i1-face i1-center"><div class="i1-win i1-win-c"></div><div class="i1-in-ph"></div><i class="i1-fold i1-fold-l"></i><i class="i1-fold i1-fold-r"></i></div>' +
      '<div class="i1-wing i1-wing-l">' +
        '<div class="i1-face i1-front"><span class="i1-blind" aria-hidden="true">' + blindLogo('#F1E2C4') + '</span><i class="i1-frame"></i><i class="i1-sheen"></i><i class="i1-shade"></i></div>' +
        '<div class="i1-face i1-back"><div class="i1-win i1-win-l"></div><i class="i1-crease"></i><i class="i1-shade"></i></div>' +
        '<i class="i1-edge"></i>' +
      '</div>' +
      '<div class="i1-wing i1-wing-r">' +
        '<div class="i1-face i1-front"><div class="i1-fr"></div><i class="i1-frame"></i><i class="i1-sheen"></i><i class="i1-shade"></i></div>' +
        '<div class="i1-face i1-back"><div class="i1-in-d"></div><i class="i1-shade"></i></div>' +
        '<i class="i1-edge"></i>' +
      '</div>' +
    '</div></div>' +
    '<button class="i1-hint" type="button"><span>לפתוח את ההזמנה</span><i aria-hidden="true"></i></button></div>';
  hero.appendChild(scene);

  var stage = $('.i1-stage', scene), card = $('.i1-card', scene), wl = $('.i1-wing-l', scene), wr = $('.i1-wing-r', scene);
  var fr = $('.i1-fr', scene), inD = $('.i1-in-d', scene), inPh = $('.i1-in-ph', scene), hint = $('.i1-hint', scene);

  /* החזית: פירורי הלחם למעלה, הכותרת למטה (בטלפון גם הלוגו בהטבעה באמצע) */
  if (crumbs) fr.appendChild(crumbs);
  fr.appendChild(hide(mk('span', 'i1-blind', blindLogo('#F2E4C8'))));
  if (h1) fr.appendChild(h1);
  /* הפנים: התווית, הפתיח, קו פויל, הפרטים, והקישור לתחילת המאמר */
  var inner = mk('div', 'i1-inner');
  if (label) inner.appendChild(label);
  if (lead) inner.appendChild(lead);
  inner.appendChild(hide(mk('i', 'i1-rule')));
  if (meta) inner.appendChild(meta);
  var go = mk('a', 'i1-go', 'להתחיל לקרוא<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>');
  go.href = '#ar-art';
  inner.appendChild(go);
  /* הצילום הראשי עובר לפנים ההזמנה (בכנף שמאל עותק בלי alt, כדי שהצילום ימשיך על הקפל) */
  if (img) {
    $('.i1-win-c', scene).appendChild(img);
    var dup = img.cloneNode(false); dup.alt = ''; dup.removeAttribute('fetchpriority'); hide(dup);
    $('.i1-win-l', scene).appendChild(dup);
  }

  var shFL = $('.i1-wing-l .i1-front .i1-shade', scene), shBL = $('.i1-wing-l .i1-back .i1-shade', scene),
    shFR = $('.i1-wing-r .i1-front .i1-shade', scene), shBR = $('.i1-wing-r .i1-back .i1-shade', scene);
  var foldL = $('.i1-fold-l', scene), foldR = $('.i1-fold-r', scene), cast = $('.i1-cast', scene), cast2 = $('.i1-cast2', scene);
  var foil = h1 && $('.ar-l2 > span', h1);
  var frontLinks = $$('a', fr), innerLinks = $$('a', inner);

  /* ---------- מדידות: גודל ההזמנה, כמה היא מוקטנת כשהיא פתוחה, והקצה הפרום של כל לוח ---------- */
  var G = {}, phone = null;
  function layout() {
    var vw = root.clientWidth, vh = stage.clientHeight || innerHeight, ph = vw <= 820;
    if (ph !== phone) { phone = ph; (ph ? inPh : inD).appendChild(inner); }
    var headT = ph ? 70 : 104, hintRoom = ph ? 66 : 80, availH = vh - headT - hintRoom, W, H, L, R;
    if (!ph) { W = Math.min(vw * .84, availH * .96 * 1.3, 1100); H = W / 1.3; L = W * .396; R = W * .596; }
    else { W = Math.min(vw - 36, 460); H = Math.min(W / .64, availH - 4); L = 0; R = W; }
    var m = Math.round(H * (ph ? .022 : .034)), tyC = headT + availH / 2 - vh / 2, s = 1, tx = 0, tyO = tyC;
    if (!ph) {
      var top2 = 86, bot = 34, spread = L + W + R;
      s = Math.min((vw - 2 * Math.max(24, vw * .035)) / spread, (vh - top2 - bot) / H, 1);
      tx = -s * (R - L) / 2;
      tyO = top2 + (vh - top2 - bot) / 2 - vh / 2;
    }
    G = { vw: vw, vh: vh, W: W, H: H, L: L, R: R, m: m, s: s, tx: tx, tyC: tyC, tyO: tyO, ph: ph, lx: G.lx, ly: G.ly };
    var st = card.style;
    st.setProperty('--W', W.toFixed(1) + 'px'); st.setProperty('--H', H.toFixed(1) + 'px');
    st.setProperty('--L', L.toFixed(1) + 'px'); st.setProperty('--R', R.toFixed(1) + 'px');
    st.setProperty('--m', m + 'px'); st.setProperty('--si', (1 / s).toFixed(4));
    card.classList.toggle('tight', !ph && H * s < 470); /* מסך נמוך או טאבלט: הפתיח נכנס בכנף קטנה יותר */
    $('.i1-center', scene).style.clipPath = poly(deckle(W, H, ph ? { t: 1, b: 1, l: 1 } : { t: 1, b: 1 }, 11));
    if (!ph) {
      var pl = deckle(L, H, { t: 1, r: 1, b: 1 }, 23);
      $('.i1-front', wl).style.clipPath = poly(pl); $('.i1-back', wl).style.clipPath = poly(pl, true);
    }
    var pr = deckle(R, H, { t: 1, b: 1, l: 1 }, 37);
    $('.i1-front', wr).style.clipPath = poly(pr); $('.i1-back', wr).style.clipPath = poly(pr, true);
    hint.style.top = (vh / 2 + tyC + H / 2 + 16).toFixed(0) + 'px';
    satin();
  }

  /* ---------- קלט: עכבר (לאור על הפויל ולהטיה קלה), ריחוף, לחיצה ---------- */
  var mouse = { x: 0, y: 0, tx: 0, ty: 0, lx: 0, ly: 0, last: -1e9, has: false };
  var hover = 0, hoverT = 0, cp = -1, ajar = 0, t0 = performance.now(), last = {}, raf = 0;
  function want() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', want, { passive: true });
  addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    mouse.tx = e.clientX / G.vw * 2 - 1; mouse.ty = e.clientY / G.vh * 2 - 1;
    mouse.lx = e.clientX; mouse.ly = e.clientY; mouse.last = performance.now(); mouse.has = true;
    want();
  }, { passive: true });
  card.addEventListener('pointerenter', function () { hoverT = 1; want(); });
  card.addEventListener('pointerleave', function () { hoverT = 0; want(); });
  function openIt() {
    var r = scene.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + .62 * (r.height - G.vh), behavior: calm() ? 'auto' : 'smooth' });
  }
  card.addEventListener('click', function (e) { if (cp > .05 || e.target.closest('a')) return; openIt(); });
  hint.addEventListener('click', openIt);
  go.addEventListener('click', function (e) {
    e.preventDefault();
    var r = art.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top - (G.ph ? 76 : 96), behavior: calm() ? 'auto' : 'smooth' });
  });

  /* ---------- כל פריים: הגלילה פותחת את הכנפיים, המצלמה מתרחקת, הצללים זזים, האור עובר על הפויל ---------- */
  function frame(now) {
    raf = 0;
    var still = calm(), vh = G.vh;
    var rect = scene.getBoundingClientRect(), fb = foil ? foil.getBoundingClientRect() : null; /* קודם קוראים, אחר כך כותבים */
    var range = Math.max(1, rect.height - vh), p = clamp(-rect.top / range, 0, 1), onScreen = rect.bottom > 0 && rect.top < innerHeight;
    if (still) cp = p > .2 ? 1 : 0;
    else if (cp < 0) cp = p;
    else { cp += (p - cp) * .12; if (Math.abs(p - cp) < .0005) cp = p; }
    if (!onScreen && cp === p) { if (last.off) return; last.off = true; } else last.off = false; /* רחוק מהפתיחה: לא כותבים כלום */
    var entr = still ? 1 : 1 - Math.pow(1 - clamp((now - t0 - 120) / 1400, 0, 1), 3);
    mouse.x += (mouse.tx - mouse.x) * .07; mouse.y += (mouse.ty - mouse.y) * .07;
    hover += (hoverT - hover) * .08;

    var o1 = eio(smooth(.03, .46, cp)), o2 = eio(smooth(.07, .5, cp));
    var cam = 1 - Math.pow(1 - smooth(.02, .44, cp), 2.2);
    var aim = still ? 0 : (G.ph ? 5 : 4 + hover * 7) * smooth(.4, 1, entr);
    ajar = still ? aim : ajar + (aim - ajar) * .1;
    var thR = ajar + (180 - ajar) * o1, thL = ajar * .8 + (180 - ajar * .8) * o2;

    var s = lerp(1, G.s, cam), tx = lerp(0, G.tx, cam), ty = lerp(G.tyC, G.tyO, cam) + (1 - entr) * 60;
    var tilt = still || G.ph ? 0 : 1 - .65 * cam;
    var rx = (still ? 2 : 4 - 1.5 * cam) - mouse.y * 5 * tilt + (1 - entr) * 16, ry = mouse.x * 7 * tilt;
    card.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ') rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    wr.style.transform = 'translateZ(1px) rotateY(' + thR.toFixed(2) + 'deg)';
    if (!G.ph) wl.style.transform = 'translateZ(1px) rotateY(' + (-thL).toFixed(2) + 'deg)';
    card.classList.toggle('open', cp > .05);

    var rR = thR * Math.PI / 180, rL = thL * Math.PI / 180;
    shFR.style.opacity = (thR < 90 ? .2 * thR / 90 : 0).toFixed(3);
    shBR.style.opacity = (thR > 90 ? .42 * (180 - thR) / 90 : 0).toFixed(3);
    foldR.style.opacity = (Math.sin(rR) * .5 * (thR > 20 ? 1 : thR / 20)).toFixed(3);
    if (!G.ph) {
      shFL.style.opacity = (thL < 90 ? .3 * thL / 90 : 0).toFixed(3);
      shBL.style.opacity = (thL > 90 ? .5 * (180 - thL) / 90 : 0).toFixed(3);
      foldL.style.opacity = (Math.sin(rL) * .6 * (thL > 20 ? 1 : thL / 20)).toFixed(3);
    }
    /* הצל נמתח בדיוק עד הקצה של כל כנף כפי שהיא נראית מלמעלה */
    var left = G.ph ? 0 : Math.min(0, G.L * Math.cos(rL)), right = Math.max(G.W, G.W - G.R * Math.cos(rR)), sx = (right - left) / G.W;
    cast.style.transform = 'translate3d(' + left.toFixed(1) + 'px,' + (G.H * .05).toFixed(1) + 'px,-26px) scaleX(' + sx.toFixed(4) + ')';
    cast2.style.transform = 'translate3d(' + left.toFixed(1) + 'px,3px,-3px) scaleX(' + sx.toFixed(4) + ')';
    cast.style.opacity = (.85 - .2 * hover).toFixed(3);

    /* מקלדת: רק מה שרואים אפשר להגיע אליו בטאב */
    var fOn = o1 < .5, iOn = o1 > .9;
    if (fOn !== last.fOn) { last.fOn = fOn; frontLinks.forEach(function (a) { a.tabIndex = fOn ? 0 : -1; }); }
    if (iOn !== last.iOn) { last.iOn = iOn; innerLinks.forEach(function (a) { a.tabIndex = iOn ? 0 : -1; }); }
    hint.style.opacity = ((1 - smooth(0, .05, cp)) * entr).toFixed(3);
    hint.style.visibility = cp > .06 ? 'hidden' : 'visible';

    /* האור על הפויל: אחרי העכבר; בלי עכבר, אור אחד עובר על הכותרת בכניסה ואז נושם לאט */
    var live = false;
    if (fb && fb.width && onScreen && cp < .5) {
      var tt = (now - t0) / 1000, idle = !mouse.has || now - mouse.last > 2600, Lx, Ly;
      if (still) { Lx = fb.left + fb.width * .68; Ly = fb.top + fb.height * .3; }
      else if (idle) {
        live = true;
        if (tt < 3.4) { var k = eio(smooth(.5, 3.2, tt)); Lx = fb.right + 60 - (fb.width + 120) * k; Ly = fb.top + fb.height * (.25 + .45 * k); }
        else { var q = tt - 3.4; Lx = fb.left + fb.width * (.55 + .42 * Math.sin(q * .45 - 1.2)); Ly = fb.top + fb.height * (.5 + .38 * Math.sin(q * .31)); }
      } else { Lx = mouse.lx; Ly = mouse.ly; }
      var lx = G.lx == null || still ? Lx : G.lx + (Lx - G.lx) * .1, ly = G.ly == null || still ? Ly : G.ly + (Ly - G.ly) * .1;
      if (Math.abs(Lx - lx) > .5 || Math.abs(Ly - ly) > .5) live = true;
      G.lx = lx; G.ly = ly;
      var fx = ((lx - fb.left) / fb.width * 100).toFixed(0) + '%', fy = ((ly - fb.top) / fb.height * 100).toFixed(0) + '%';
      if (fx !== last.fx || fy !== last.fy) { last.fx = fx; last.fy = fy; foil.style.setProperty('--fx', fx); foil.style.setProperty('--fy', fy); }
      var bx = (18 + lx / G.vw * 64).toFixed(1) + '%';
      if (bx !== last.bx) { last.bx = bx; foil.style.setProperty('--bx', bx); }
      var px = (lx / G.vw * 100).toFixed(0) + '%', py = (ly / vh * 100).toFixed(0) + '%';
      if (px !== last.px || py !== last.py) { last.px = px; last.py = py; card.style.setProperty('--px', px); card.style.setProperty('--py', py); }
    }

    var busy = onScreen && !still && (p !== cp || entr < 1 || Math.abs(aim - ajar) > .02 || Math.abs(mouse.tx - mouse.x) > .002 ||
      Math.abs(mouse.ty - mouse.y) > .002 || Math.abs(hoverT - hover) > .005 || live);
    if (busy) want();
  }

  /* =====================================================================
     3. גוף המאמר: דף הכותנה והפריטים שעליו
     ===================================================================== */
  var paper = hide(mk('div', 'i1-paper', '<i class="i1-pp"></i><i class="i1-pframe"></i>'));
  art.insertBefore(paper, art.firstChild);
  art.insertBefore(hide(mk('span', 'i1-blind i1-mark', blindLogo('#F6EBD5'))), paper.nextSibling);
  var pp = $('.i1-pp', paper), sheetKey = '';
  function sheet() {
    var w = art.offsetWidth, h = art.offsetHeight; if (!w || !h) return;
    var key = w + 'x' + h; if (key === sheetKey) return; sheetKey = key;
    pp.style.clipPath = poly(deckle(w, h, { t: 1, r: 1, b: 1, l: 1 }, 71, 3.4, 3.4));
  }
  if ('ResizeObserver' in window) new ResizeObserver(sheet).observe(art);

  /* צילום נוסף: ארבע פינות פויל */
  $$('.ar-pic .print', art).forEach(function (p) {
    ['tr', 'tl', 'br', 'bl'].forEach(function (k) { p.appendChild(hide(mk('i', 'i1-corner i1-c-' + k))); });
  });
  /* הטיפ: סרט סאטן שוקולד שעובר בעין הזהב של התווית */
  var tip = $('.ar-tip', art);
  if (tip) tip.insertAdjacentHTML('beforeend',
    '<svg class="i1-ribbon" viewBox="0 0 84 80" aria-hidden="true" focusable="false"><defs>' +
    '<linearGradient id="i1rbL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9C5D35"/><stop offset=".45" stop-color="#6A361C"/><stop offset="1" stop-color="#4A2312"/></linearGradient>' +
    '<linearGradient id="i1rbR" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A86A40"/><stop offset=".45" stop-color="#6E3A1E"/><stop offset="1" stop-color="#4A2312"/></linearGradient>' +
    '<linearGradient id="i1rbT" x1="0" x2="1"><stop offset="0" stop-color="#4E2614"/><stop offset=".5" stop-color="#7E4524"/><stop offset="1" stop-color="#4E2614"/></linearGradient></defs>' +
    '<path d="M39 30L27 66L32.5 62.5L35 68L44 32Z" fill="url(#i1rbT)"/><path d="M45 30L57 67L51.5 63.5L49 69L40 32Z" fill="url(#i1rbT)"/>' +
    '<path d="M42 30C33 16 12 8 6 18C1 27 12 38 42 30Z" fill="url(#i1rbL)"/><path d="M42 30C51 16 72 8 78 18C83 27 72 38 42 30Z" fill="url(#i1rbR)"/>' +
    '<path d="M38 27C30 18 16 13 10 18" fill="none" stroke="rgba(255,226,190,.4)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<path d="M46 27C54 18 66 13 74 17" fill="none" stroke="rgba(255,226,190,.3)" stroke-width="1.1" stroke-linecap="round"/>' +
    '<ellipse cx="42" cy="30" rx="6.4" ry="5.4" fill="#5C2E17"/><ellipse cx="40.6" cy="28.4" rx="3" ry="1.6" fill="rgba(255,226,190,.38)"/></svg>');
  /* הרשימה: כרטיס "נא להשיב" */
  var ck = $('#ar-check');
  if (ck) ck.insertBefore(hide(mk('p', 'i1-rsvp-k', 'נא להשיב')), ck.firstChild);

  /* ---------- הפעלה ---------- */
  layout();
  sheet();
  var rt = 0;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); sheet(); want(); }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sheet(); want(); });
  requestAnimationFrame(function () { card.classList.add('ok'); want(); });
})();

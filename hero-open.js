/* hero-open.js: בגלילה הצילום של מסך הפתיחה נפתח למסך מלא, ועליו נכתב "הסיפור שלנו" (29.10.2026).
   מסך הפתיחה נצמד בתוך מסילה גבוהה (.hs), והגלילה מניעה ציר זמן אחד, p מ-0 עד 1:
   1. 0.03-0.42  המסגרת המעוגלת נפתחת עד קצות המסך ונשארת מעוגלת (clip-path), הצילום והמנורה החתוכה זזים יחד (transform),
                 המצלמה נכנסת לאט פנימה (1 → 1.12), קו הזהב רץ עם הקצה ונעלם, והכותרת עפה החוצה בעומק.
   2. 0.34-0.95  שכבת אספרסו עולה מאחורי הטקסט, אבק זהב, התווית, הכותרת מילה אחרי מילה ("טעם." בזהב עם קו), והפסקה שורה אחרי שורה.
   3. אחרי 1     ההצמדה משתחררת וממשיכים לתמונות ולסרטון של הסיפור.
   הטקסט של הסיפור (#storyTxt) עובר מהחלק "הסיפור שלנו" לשכבה שעל הצילום, ולכן לא מופיע פעמיים.
   בתנועה מופחתת, ב-?still, במצב "בלי תנועה" של הנגישות ובתצוגה המקדימה של המערכת: בלי הצמדה ובלי תזוזה, הכול כמו קודם.
   בכל פריים משתנים רק transform, opacity, clip-path ו-filter. מדידות רק בשינוי גודל. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var hs = $('#hs'), hero = $('#top'), story = $('#story'), txt = $('#storyTxt');
  if (!hs || !hero || !story || !txt) return;
  var ph = $('.h-ph', hero), img = $('.h-ph img', hero), lamp = $('.h-lamp', hero), lampIm = $('.h-lamp-im', hero), lampPl = $('.h-lamp-pl', hero), ring = $('.h-ring', hero);
  var h1 = $('.h-h1', hero), sub = $('.h-sub', hero), cta = $('.h-cta', hero), spk = $$('.spk', hero);
  var veil = $('.hs-veil', hero), dustC = $('.hs-dust', hero), stage = $('.hs-story > .wrap', hero), stIn = $('.st-in', story);
  var h2 = $('h2', txt), lab = $('.label', txt);
  if (!ph || !img || !stage || !stIn || !h2) return;

  var framed = false; try { framed = window.top !== window; } catch (e) { framed = true; }
  var STILL = /(^|[?&])still(=|&|$)/.test(location.search);
  var rm = matchMedia('(prefers-reduced-motion: reduce)');
  var calm = function () { return framed || STILL || root.classList.contains('a11y-still') || rm.matches; };
  var mobile = function () { return innerWidth <= 820; };

  var IW = 1800, IH = 1200, OX = .358, OY = .5, SC = 1.0036;   // הצילום, ה-object-position שלו וה-scale הקטן שב-CSS
  var ZMAX = 1.12;                                              // כמה המצלמה נכנסת עד הסוף
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var inOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var outC = function (t) { return 1 - Math.pow(1 - t, 3); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var lerpR = function (A, B, t) { return { x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t), w: lerp(A.w, B.w, t), h: lerp(A.h, B.h, t) }; };
  function cover(B, fx, fy) { var s = Math.max(B.w / IW, B.h / IH), w = IW * s, h = IH * s; return { x: B.x + (B.w - w) * fx, y: B.y + (B.h - h) * fy, w: w, h: h }; }
  function zoomR(R, z, P) { return { x: P.x + (R.x - P.x) * z, y: P.y + (R.y - P.y) * z, w: R.w * z, h: R.h * z }; }
  var px = function (v) { return (Math.round(v * 100) / 100) + 'px'; };

  /* ---------- מצב: פעיל / רגיל ---------- */
  var on = false, isOpen = false, G = null, raf = 0, words = [], lines = [], em = null;
  var probeS = document.createElement('div'), probeL = document.createElement('div');
  probeS.style.cssText = probeL.style.cssText = 'position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none';
  probeS.style.height = '100svh'; probeL.style.height = '100lvh';
  document.body.appendChild(probeS); document.body.appendChild(probeL);

  function enable() {
    if (on) return; on = true;
    h2.classList.remove('kin');                     // את המילים מנהלת הגלילה, לא ה-kit
    stage.appendChild(txt);
    root.classList.add('hs-on');
    split(); textAt(0); measure(); go();
  }
  function disable() {
    if (!on) return; on = false;
    closeGeom(); clearText();
    var gp = $('.hs-gap', txt); if (gp) gp.style.cssText = '';
    root.classList.remove('hs-on');
    h2.classList.add('kin');
    stIn.appendChild(txt);
    hs.style.removeProperty('--hh'); hs.style.removeProperty('--run');
    if (window.PatHero3D && PatHero3D.pause) PatHero3D.pause(false);
  }

  /* ---------- מילים ושורות: כל מילה ב-span.hs-w (גם אחרי עריכה מה-CMS) ---------- */
  var mo = null, splitting = false;
  function wrapWords(el) {
    var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = tw.nextNode())) if (!(n.parentNode.classList && n.parentNode.classList.contains('hs-w')) && n.data.trim()) nodes.push(n);
    nodes.forEach(function (node) {
      var f = document.createDocumentFragment();
      node.data.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(' ')); return; }
        var s = document.createElement('span'); s.className = 'hs-w'; s.textContent = w; f.appendChild(s);
      });
      node.parentNode.replaceChild(f, node);
    });
  }
  function split() {
    splitting = true;
    wrapWords(h2); var p = $('p', txt); if (p) wrapWords(p);
    // בטלפון: מקום לכפתורים הצפים (וואטסאפ ונגישות) בפינה, רק לשורות שבגובה שלהם
    if (p && !$('.hs-gap', p)) { var g = document.createElement('i'); g.className = 'hs-gap'; g.setAttribute('aria-hidden', 'true'); p.insertBefore(g, p.firstChild); }
    words = $$('h2 .hs-w', txt); em = $('h2 em', txt);
    if (mo) mo.takeRecords();
    splitting = false;
  }
  function measureLines() {
    var p = $('p', txt); lines = [];
    if (!p) return;
    var ws = $$('.hs-w', p), top = null, cur = null;
    ws.forEach(function (w) { var t = w.offsetTop; if (top === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; } cur.push(w); });
  }
  function clearText() {
    [lab, $('p', txt)].concat(words, $$('.hs-w', txt)).forEach(function (el) { if (el) { el.style.opacity = ''; el.style.transform = ''; el.style.filter = ''; } });
    if (em) em.style.removeProperty('--u');
  }

  /* ---------- מדידה (רק בשינוי גודל): המסגרת, הצילום, המסך, המיקום של כל דבר ---------- */
  function relBox(el) {   // התיבה של אלמנט בלי transform, בקואורדינטות של מסך הפתיחה (מהמיקום המחושב ב-CSS, עם שברי פיקסלים)
    var par = el.offsetParent || hero, pr = par.getBoundingClientRect(), hr = hero.getBoundingClientRect(), cs = getComputedStyle(el);
    return { x: pr.left - hr.left + parseFloat(cs.left), y: pr.top - hr.top + parseFloat(cs.top), w: parseFloat(cs.width), h: parseFloat(cs.height), par: { x: pr.left - hr.left, y: pr.top - hr.top } };
  }
  function radii(cs, B) {
    return ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(function (c) {
      var v = cs['border' + c + 'Radius'].split(' '), h = v[0], w = v[1] || v[0];
      var f = function (s, L) { return /%$/.test(s) ? parseFloat(s) / 100 * L : parseFloat(s) || 0; };
      return [f(h, B.w), f(w, B.h)];
    });
  }
  function measure() {
    if (!on) return;
    var wasOpen = isOpen; if (wasOpen) closeGeom();
    var m = mobile();
    hs.style.setProperty('--hh', hero.offsetHeight + 'px');
    var hh = hero.offsetHeight, svh = probeS.offsetHeight || innerHeight, lvh = probeL.offsetHeight || innerHeight;
    // הווילון (29.10.2026): אחרי שהסיפור נכתב הוא נשאר במקום, ו"ספרי לנו על השמחה" (#bot) עולה עליו מלמטה.
    // המסילה ארוכה יותר בגובה של מסך (svh), כך ש-#bot נכנס מתחתית המסך בדיוק כשהסיפור גמר להיכתב.
    // #bot נמשך למעלה בגובה החלק הנצמד (--hs-cur), וגבוה לפחות כמו הצילום הפתוח (--hs-vh), שבמסך גבוה ארוך ממסך הפתיחה
    var cur = Math.min(hh, svh), vh = Math.max(lvh, svh);
    hs.style.setProperty('--run', 'calc(' + (m ? 230 : 250) + 'svh + ' + svh + 'px)');
    document.documentElement.style.setProperty('--hs-cur', cur + 'px');
    document.documentElement.style.setProperty('--hs-vh', vh + 'px');
    var stk = Math.min(0, svh - hh), run = hs.offsetHeight - hh - svh;
    var V = { x: 0, y: -stk, w: hero.clientWidth, h: Math.max(lvh, svh) };
    var F0 = relBox(ph), csPh = getComputedStyle(ph);
    var I = relBox(img); I.x = F0.x + parseFloat(getComputedStyle(img).left); I.y = F0.y + parseFloat(getComputedStyle(img).top);
    var c0 = cover(I, OX, OY), o = { x: I.x + I.w * OX, y: I.y + I.h * OY };
    var R0 = zoomR(c0, SC, o);
    // היעד: הצילום מכסה את כל המסך. במחשב העוגה קצת משמאל למרכז, בטלפון המצלמה נכנסת מלמטה כדי שהעוגה תעלה מעל הטקסט
    var R1 = cover(V, m ? .4 : .36, .5);
    var P = m ? { x: R1.x + R1.w * .43, y: V.y + V.h * .96 } : { x: V.x + V.w * .82, y: R1.y + R1.h * .5 };
    var Rmax = zoomR(R1, ZMAX, P);
    var hr = h1.getBoundingClientRect(), lr = null;
    $$('.h-l1,.h-l2', h1).forEach(function (l) { var b = l.getBoundingClientRect(); if (!b.width) return; lr = lr ? { l: Math.min(lr.l, b.left), t: Math.min(lr.t, b.top), r: Math.max(lr.r, b.right), b: Math.max(lr.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; });
    G = { stk: stk, run: Math.max(1, run), V: V, F0: F0, rad: radii(csPh, F0), radStr: csPh.borderRadius, shadow: csPh.boxShadow, R0: R0, R1: R1, P: P, L: { w: Rmax.w, h: Rmax.h },
      ring: ring ? relBox(ring) : null, h1o: lr ? px((lr.l + lr.r) / 2 - hr.left) + ' ' + px((lr.t + lr.b) / 2 - hr.top) : '50% 50%', k: Math.min(1, innerWidth / 1440) };
    gapForFabs(stk);
    measureLines();
    sizeDust();
    if (wasOpen) openGeom();
  }
  // השורות של הסיפור לא נכנסות מתחת לכפתורים הצפים: float עם shape-outside שמתחיל בגובה של הכפתורים
  function gapForFabs(stk) {
    var p = $('p', txt), g = p && $('.hs-gap', p); if (!g) return;
    g.style.cssText = '';
    if (!mobile()) return;
    var fabs = ['.wa-fab', '#a11y-btn'].map(function (s) { return $(s); }).filter(function (el) { return el && el.getClientRects().length; }).map(function (el) { return el.getBoundingClientRect(); });
    if (!fabs.length) return;
    var top = Math.min.apply(null, fabs.map(function (r) { return r.top; })), left = Math.min.apply(null, fabs.map(function (r) { return r.left; }));
    // הפסקה היא פריט flex (מכילה את ה-float), אז גובה ה-float = בדיוק עד השורה האחרונה. כמה סבבים עד שהמיקום מתייצב
    var H = innerHeight;
    for (var i = 0; i < 5; i++) {
      var pr = p.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      var pTop = pr.top - hr.top + stk, w = pr.right - left + 8;   // המיקום של הפסקה כשמסך הפתיחה נצמד
      if (w <= 8) return;
      g.style.cssText = 'float:right;width:' + px(w) + ';height:' + px(H) + ';shape-outside:inset(' + px(Math.max(0, top - pTop - 6)) + ' 0 0 0);pointer-events:none';
      var ws = $$('.hs-w', p), last = ws.length ? ws[ws.length - 1].getBoundingClientRect().bottom : pr.bottom;
      H = Math.max(0, last - p.getBoundingClientRect().top);
    }
  }

  /* ---------- כניסה למצב פתוח (פעם אחת, כשהגלילה מתחילה) ויציאה ממנו ---------- */
  var shd = null;
  function openGeom() {
    if (isOpen || !G) return; isOpen = true;
    var V = G.V, F = G.F0, pp = F.par;
    if (!shd) { shd = document.createElement('div'); shd.className = 'h-shd'; shd.setAttribute('aria-hidden', 'true'); ph.parentNode.insertBefore(shd, ph); }
    shd.style.cssText = 'left:' + px(F.x - pp.x) + ';top:' + px(F.y - pp.y) + ';width:' + px(F.w) + ';height:' + px(F.h) + ';border-radius:' + G.radStr + ';box-shadow:' + G.shadow;
    var box = 'left:' + px(V.x - pp.x) + ';top:' + px(V.y - pp.y) + ';width:' + px(V.w) + ';height:' + px(V.h) + ';animation:none;transform:none;';
    ph.style.cssText = box + 'border-radius:0;box-shadow:none;overflow:hidden';
    var plane = 'position:absolute;left:0;top:0;width:' + px(G.L.w) + ';height:' + px(G.L.h) + ';max-width:none;transform-origin:0 0;';
    img.style.cssText = plane + 'object-fit:fill';
    if (lamp) { lamp.style.cssText = box; lampIm.style.cssText = 'left:0;top:0;width:100%;height:100%;transform:none'; lampPl.style.cssText = plane; }
    [ring, sub, cta].forEach(function (el) { if (el) el.style.animation = 'none'; });
    h1.style.transformOrigin = G.h1o;
    hero.classList.add('is-open', 'h-entered');   // h-entered: אנימציית הכניסה לא מתחילה מחדש כשחוזרים למעלה
  }
  function closeGeom() {
    if (!isOpen) return; isOpen = false;
    [ph, img, lamp, lampIm, lampPl].forEach(function (el) { if (el) el.style.cssText = ''; });
    [ring, sub, cta, h1, veil, dustC].concat(spk).forEach(function (el) { if (!el) return; el.style.transform = ''; el.style.opacity = ''; el.style.filter = ''; el.style.animation = ''; el.style.transformOrigin = ''; });
    hero.classList.remove('is-open');
    if (window.PatHero3D && PatHero3D.pause) PatHero3D.pause(false);
  }

  /* ---------- פריים ---------- */
  var lastP = -1;
  function frame() {
    raf = 0;
    if (!on || !G) return;
    var p = clamp((G.stk - hs.getBoundingClientRect().top) / G.run, 0, 1);
    if (p === lastP) return; lastP = p;
    if (p <= 0) { if (isOpen) closeGeom(); textAt(0); dustOn(false); return; }
    if (!isOpen) openGeom();
    var V = G.V, k = G.k;

    // 1. המסגרת נפתחת
    var e = inOut(seg(p, .03, .42)), F = lerpR(G.F0, V, e);
    var t = Math.max(0, F.y - V.y), l = Math.max(0, F.x - V.x), r = Math.max(0, V.x + V.w - F.x - F.w), b = Math.max(0, V.y + V.h - F.y - F.h);
    var R = G.rad;   // העיגול נשאר לאורך כל הפתיחה, גם כשהצילום ממלא את המסך (29.10.2026: "שישאר עגול כל הזמן")
    ph.style.clipPath = 'inset(' + px(t) + ' ' + px(r) + ' ' + px(b) + ' ' + px(l) + ' round ' + R.map(function (c) { return px(c[0]); }).join(' ') + ' / ' + R.map(function (c) { return px(c[1]); }).join(' ') + ')';
    // הצילום והמנורה: אותו transform בדיוק. המצלמה נכנסת לאט לאורך כל הציר
    var B = lerpR(G.R0, G.R1, e), z = 1 + (ZMAX - 1) * inOut(p);
    var Pz = { x: clamp(G.P.x, B.x, B.x + B.w), y: clamp(G.P.y, B.y, B.y + B.h) }, Rr = zoomR(B, z, Pz);
    var tf = 'translate(' + px(Rr.x - V.x) + ',' + px(Rr.y - V.y) + ') scale(' + (Rr.w / G.L.w).toFixed(5) + ')';
    img.style.transform = tf;
    if (lamp) { lampPl.style.transform = tf; lamp.style.opacity = (1 - seg(e, .62, .96)).toFixed(3); }
    if (shd) shd.style.opacity = (1 - seg(e, 0, .14)).toFixed(3);
    if (ring) { ring.style.transform = 'translate(' + px(F.x + F.w - G.F0.x - G.F0.w) + ',' + px(F.y + F.h - G.F0.y - G.F0.h) + ')'; ring.style.opacity = (1 - seg(e, .04, .42)).toFixed(3); }
    spk.forEach(function (s) { s.style.opacity = (1 - seg(e, 0, .22)).toFixed(3); });
    // הכותרת עפה החוצה בעומק (לכיוון הצופה), עם טשטוש ודהייה. שורת המשנה והכפתור אחריה
    var a1 = outC(seg(p, .02, .24)), a2 = outC(seg(p, .035, .25)), a3 = outC(seg(p, .045, .26));
    h1.style.transform = 'translate3d(0,' + px(-70 * k * a1) + ',0) scale(' + (1 + .55 * a1).toFixed(4) + ')';
    h1.style.filter = a1 > 0 ? 'blur(' + px(12 * a1) + ')' : ''; h1.style.opacity = (1 - a1).toFixed(3);
    if (sub) { sub.style.transform = 'translate3d(0,' + px(46 * k * a2) + ',0) scale(' + (1 + .3 * a2).toFixed(4) + ')'; sub.style.filter = a2 > 0 ? 'blur(' + px(8 * a2) + ')' : ''; sub.style.opacity = (1 - a2).toFixed(3); }
    if (cta) { cta.style.transform = 'translate3d(0,' + px(70 * k * a3) + ',0) scale(' + (1 + .25 * a3).toFixed(4) + ')'; cta.style.filter = a3 > 0 ? 'blur(' + px(8 * a3) + ')' : ''; cta.style.opacity = (1 - a3).toFixed(3); }
    if (window.PatHero3D && PatHero3D.pause) PatHero3D.pause(a1 >= 1);

    // 2. האספרסו, האבק והסיפור
    veil.style.opacity = seg(p, .34, .52).toFixed(3);
    var d = seg(p, .4, .58); dustC.style.opacity = d.toFixed(3); dustOn(d > 0);
    textAt(p);
  }
  function textAt(p) {
    var a = outC(seg(p, .46, .55));
    if (lab) { lab.style.opacity = a.toFixed(3); lab.style.transform = 'translate3d(' + px(-30 * (1 - a)) + ',0,0)'; lab.style.filter = a < 1 ? 'blur(' + px(6 * (1 - a)) + ')' : ''; }
    // המילים נוחתות מעומק: גדולות ומטושטשות → בגודל הרגיל וחדות
    words.forEach(function (w, i) {
      var s = .5 + i * .034, v = outC(seg(p, s, s + .1));
      w.style.opacity = v.toFixed(3);
      w.style.transform = 'translate3d(0,' + (-.28 * (1 - v)).toFixed(3) + 'em,0) scale(' + (1 + 1.1 * (1 - v)).toFixed(4) + ')';
      w.style.filter = v < 1 ? 'blur(' + px(10 * (1 - v)) + ')' : '';
    });
    if (em) em.style.setProperty('--u', inOut(seg(p, .68, .78)).toFixed(3));
    var P = $('p', txt); if (P) { P.style.opacity = p > 0 ? '1' : '0'; P.style.transform = 'none'; }
    lines.forEach(function (ln, j) {
      var s = .62 + j * .036, v = outC(seg(p, s, s + .1)), tf = 'translate3d(0,' + px(16 * (1 - v)) + ',0)', fl = v < 1 ? 'blur(' + px(5 * (1 - v)) + ')' : '';
      ln.forEach(function (w) { w.style.opacity = v.toFixed(3); w.style.transform = tf; w.style.filter = fl; });
    });
  }

  /* ---------- אבק זהב על הצילום ---------- */
  var dctx = dustC.getContext('2d'), DP = [], dw = 0, dh = 0, drun = false, dpr = Math.min(2, devicePixelRatio || 1);
  function sizeDust() {
    dw = dustC.offsetWidth; dh = dustC.offsetHeight; if (!dw || !dh) return;
    dustC.width = Math.round(dw * dpr); dustC.height = Math.round(dh * dpr); dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    DP = []; var n = mobile() ? 26 : 48;
    for (var i = 0; i < n; i++) DP.push({ x: Math.random() * dw, y: Math.random() * dh, r: .6 + Math.random() * 1.9, v: .1 + Math.random() * .3, d: (Math.random() - .5) * .18, t: Math.random() * 6.28 });
  }
  function dustOn(v) { if (v && !drun) { drun = true; requestAnimationFrame(dust); } else if (!v) drun = false; }
  function dust() {
    if (!drun || !on) { drun = false; return; }
    dctx.clearRect(0, 0, dw, dh);
    DP.forEach(function (p) {
      p.y -= p.v; p.x += p.d; p.t += .02; if (p.y < -6) { p.y = dh + 6; p.x = Math.random() * dw; }
      var a = .22 + .5 * (.5 + .5 * Math.sin(p.t)), g = dctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      g.addColorStop(0, 'rgba(247,231,176,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(217,182,102,0)');
      dctx.fillStyle = g; dctx.beginPath(); dctx.arc(p.x, p.y, p.r * 3, 0, 6.29); dctx.fill();
    });
    requestAnimationFrame(dust);
  }

  /* ---------- אירועים ---------- */
  function go() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', function () { if (on) go(); }, { passive: true });
  var rt = 0;
  function refresh() {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (calm()) { disable(); return; }
      if (!on) enable(); else { measure(); }
      lastP = -1; go();
    }, 140);
  }
  addEventListener('resize', refresh);
  if (rm.addEventListener) rm.addEventListener('change', refresh);
  new MutationObserver(function () { if (calm() === on) refresh(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
  // עריכה מה-CMS: מפרקים שוב למילים ומודדים שורות
  mo = new MutationObserver(function () { if (splitting || !on) return; split(); if (G) gapForFabs(G.stk); measureLines(); lastP = -1; go(); });
  mo.observe(txt, { childList: true, subtree: true, characterData: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (on) { measure(); lastP = -1; go(); } });
  addEventListener('load', function () { if (on) { measure(); lastP = -1; go(); jumpHash(); } });

  // "הסיפור שלנו" בתפריט: גוללים לרגע שבו הסיפור כתוב על הצילום
  function storyY() { return hs.getBoundingClientRect().top + scrollY - G.stk + G.run * .94; }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#story"]'); if (!a || !on || !G) return;
    e.preventDefault();
    scrollTo({ top: storyY(), behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', '#story');
  });
  function jumpHash() { if (on && G && location.hash === '#story') scrollTo({ top: storyY(), behavior: 'auto' }); }

  if (!calm()) enable();
  // tick = לצייר עכשיו (בשביל בדיקות ותצוגות מקדימות שבהן requestAnimationFrame לא רץ)
  window.PatHeroOpen = { refresh: refresh, progress: function () { return lastP; }, tick: function () { lastP = -1; frame(); } };
})();

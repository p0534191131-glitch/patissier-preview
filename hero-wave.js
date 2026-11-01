/* hero-wave.js: במחשב, הצד הימני של הצילום בפתיחה (1.11.2026): צורת D, "אני רוצה בסגנון הזה של עגול ממש" (קו אדום).
   הצד הימני כולו חצי עיגול אחד, ברדיוס של חצי גובה המסגרת והמרכז באמצע הגובה. הקצה העליון והתחתון ישרים עד תחילת הקשת.
   הנקודה הכי ימנית ב-880 (בערך 40% מגובה המסגרת לפני שורת המשנה והכפתור), ולא מעבר לקצה של הצילום עצמו.
   "בלתי נשכחת" עולה בחלקה על הצילום, עם ההילה הכהה שב-site.css.
   קודם היו: גל לפי הכותרת (צורה 2), גל עם בטן לפי הקו האדום, חלון צר משמאל ל"בלתי נשכחת", וחלון רחב עם פינות 180.
   הצילום ממשיך עד הקצה השמאלי של המסך ונחתך ב-clip-path: path() (המשתנה --hw על #top). קו הזהב והצל מצוירים ב-SVG בתוך .h-ring, מאחורי הצילום.
   בפתיחה בגלילה (hero-open.js): התיבה של ה-D עוברת בקו ישר מה-D של מסך הפתיחה (D0) ל-D סופי (final) שגדול מהמסך,
   כך שהפינות של המסך בתוך העיגול והצילום ממלא הכול ("אני רוצה שזה ימלא את המסך ולא ישאר חלק"), והצד הימני תמיד חצי עיגול
   ("אני רוצה שתמיד ישאר עגול"). hero-open.js מגדיל את הצילום לאותו D סופי באותו קצב, ולכן הצילום תמיד מכסה את כל ה-D
   ואף פעם לא רואים את הקצה הישר של התמונה.
   בטלפון (עד 820) אין .hw: הכול כמו קודם. */
(function () {
  'use strict';
  var hero = document.getElementById('top'); if (!hero) return;
  var hin = hero.querySelector('.h-in'), ph = hero.querySelector('.h-ph'), ring = hero.querySelector('.h-ring');
  if (!hin || !ph || !ring) return;

  var NS = 'http://www.w3.org/2000/svg', svg = null, shPath = null, lnPath = null;
  var on = false, D0 = null, F0 = null, k = 1;
  var desk = function () { return innerWidth > 820; };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var f1 = function (v) { return (Math.round(v * 10) / 10).toString(); };

  // מיקום בקואורדינטות של מסך הפתיחה, לפי offset (בלי transform, גם באמצע אנימציית הכניסה)
  function pos(el) { var x = 0, y = 0; while (el && el !== hero) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return { x: x, y: y }; }

  /* ---------- מדידה: המסגרת והקצה הימני ---------- */
  function measure() {
    on = desk();
    hero.classList.toggle('hw', on);
    if (!on) { hero.style.removeProperty('--hw'); if (svg) svg.style.display = 'none'; return; }
    k = Math.min(1, innerWidth / 1440);
    var r = pos(ring); F0 = { x: r.x, y: r.y, w: ring.offsetWidth, h: ring.offsetHeight };   // .h-ring באותה תיבה של הצילום (ב-CSS)
    if (!F0.w || !F0.h) return;
    var W = F0.w, H = F0.h;
    // הנקודה הכי ימנית של החצי עיגול: 880 (רווח ברור משורת המשנה ומהכפתור), ולא מעבר לקצה של הצילום עצמו (מישור 1.5 על 1, כמו --hph ב-site.css)
    var s = parseFloat(getComputedStyle(hero).getPropertyValue('--hs')) || .857, Pw = 1.5 * Math.min(771 * s * k, (869.5 * k - 100) / 1.1233);
    var xR = Math.min(880 * k - ring.offsetLeft, Pw - 18 * k, W - 4 * k);
    D0 = { x: F0.x, y: F0.y, w: xR, h: H };   // ה-D של מסך הפתיחה: מהקצה השמאלי עד הנקודה הכי ימנית
    if (!svg) {
      svg = document.createElementNS(NS, 'svg'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); svg.setAttribute('class', 'hw-svg');
      svg.innerHTML = '<defs><filter id="hwBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter></defs><path class="hw-sh"/><path class="hw-ln"/>';
      ring.appendChild(svg); shPath = svg.querySelector('.hw-sh'); lnPath = svg.querySelector('.hw-ln');
    }
    svg.style.display = '';
    svg.querySelector('feGaussianBlur').setAttribute('stdDeviation', f1(20 * k));
    hero.style.setProperty('--hw', clipD(D0, F0));
    drawRing(D0, 1);
  }

  /* ---------- הצורה: תיבת D (בקואורדינטות של מסך הפתיחה) → הקו הפתוח: הקצה העליון, חצי עיגול, הקצה התחתון ---------- */
  function shape(D) {
    var R = D.h / 2, cx = D.x + D.w - R, cy = D.y + R, L = D.x - 60, pts = [[L, D.y], [cx, D.y]], n = 96;
    for (var i = 1; i < n; i++) { var t = -Math.PI / 2 + Math.PI * i / n; pts.push([cx + R * Math.cos(t), cy + R * Math.sin(t)]); }
    pts.push([cx, D.y + D.h], [L, D.y + D.h]);
    return pts;
  }
  // ה-D הסופי של הפתיחה, לפי V (המסך): גבוה מהמסך (רדיוס 0.62 מגובהו), והמרכז שלו שמאלה מהקצה הימני רק כמה שצריך
  // כדי ששתי הפינות של המסך יהיו בתוך העיגול (ועוד 12 ליתר ביטחון). hero-open.js מגדיל את הצילום כך שיכסה אותו
  function final(V) {
    var Rf = .62 * V.h, cx = V.x + V.w - Math.sqrt(Rf * Rf - V.h * V.h / 4) + 12 * k, x0 = V.x - 8;
    return { x: x0, y: V.y + V.h / 2 - Rf, w: cx + Rf - x0, h: 2 * Rf };
  }
  var lerpD = function (A, B, e) { return { x: A.x + (B.x - A.x) * e, y: A.y + (B.y - A.y) * e, w: A.w + (B.w - A.w) * e, h: A.h + (B.h - A.h) * e }; };
  var toD = function (pts, o) { return 'M' + pts.map(function (p) { return f1(p[0] - o.x) + ',' + f1(p[1] - o.y); }).join(' L'); };
  function clipD(D, O) { return "path('" + toD(shape(D), O) + " Z')"; }
  // קו הזהב: אותו קו, 14 מבחוץ לאורך הנורמל (גם למעלה ולמטה), ופתוח משמאל. הצל: אותה צורה, נמוך יותר ומטושטש
  function drawRing(D, shadowA) {
    var pts = shape(D), d = 14 * k, out = [];
    for (var i = 0; i < pts.length; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)], tx = p1[0] - p0[0], ty = p1[1] - p0[1], l = Math.sqrt(tx * tx + ty * ty) || 1;
      out.push([pts[i][0] + ty / l * d, pts[i][1] - tx / l * d]);
    }
    lnPath.setAttribute('d', toD(out, F0));
    lnPath.setAttribute('stroke-width', f1(2 * k));
    shPath.setAttribute('d', toD(pts, F0) + ' Z');
    shPath.setAttribute('transform', 'translate(0 ' + f1(26 * k) + ')');
    shPath.style.opacity = shadowA.toFixed(3);
  }

  var rt = 0;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(measure, 100); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  addEventListener('load', measure);
  measure();

  window.PatHeroWave = {
    on: function () { return on && !!D0; },
    refresh: measure,
    final: final,
    // בפתיחה בגלילה: V = התיבה של הצילום הפתוח (המסך), e = כמה נפתח (0-1)
    clip: function (F, V, e) { return clipD(lerpD(D0, final(V), e), V); },
    ring: function (F, e, V) { if (!D0) return; e = e || 0; drawRing(V && e ? lerpD(D0, final(V), e) : D0, 1 - clamp(e / .14, 0, 1)); }
  };
})();

/* i5.js: רעיון 5, "הבר נחשף". הקריאה בונה את הבר.
   צילום בר אמיתי מתחיל כסקיצה בעיפרון חום על נייר, ובכל חלק שקוראים עובר מכחול נוסף וצובע אותו (עם שוליים של זהב).
   כל חלק שנפתח מקבל חותמת זהב בתוכן העניינים. כשכל שבעת החלקים נקראו: הבר כולו בצבע, סרט שוקולד עם
   "ולכם נשאר רק לשמוח." בזהב, חותמת, ואבק זהב עדין.
   במחשב: דף נייר דביק לצד הטקסט (הצילום + תוכן העניינים). עד 1080: הצילום יושב במקום ההדפסה של הפתיחה,
   פס צר דביק למעלה מראה את הבר נבנה, ובסוף המאמר כרטיס סיום עם הרגע החתום.
   בלי תנועה (still, a11y-still, prefers-reduced-motion): הבר מוצג חשוף ומלא.
   לא משנה את article.js: קורא את ה-class-ים שהוא שם על תוכן העניינים (on/done). */
(function () {
  'use strict';
  var B = window.PatBlog, root = document.documentElement;
  if (!B || !root.classList.contains('idea-5')) return;
  var $ = B.$, $$ = B.$$;
  var art = $('#ar-art'), hero = $('.ar-hero'), body = $('.ar-body'), side = $('.ar-side'), toc = $('#ar-toc'), list = $('#ar-toc-l');
  var aprint = $('.ar-print'), share = $('.ar-share');
  if (!art || !hero || !body || !side || !toc || !list) return;

  var PHOTO = 'media/img/IMG_8964-lg.webp', N = 7, W = 1800;
  var LINE = 'ולכם נשאר רק לשמוח.';
  var ALT = 'בר קינוחים אמיתי שבנינו: פמוטי זהב, מדפים לבנים עם פרחים, ושורות של קינוחים בעבודת יד';
  var mqD = matchMedia('(min-width:1081px)');
  var lis = $$('li', list);
  var calm = B.calm();

  /* ---------- משיכות המכחול: שבע, מימין לשמאל (כמו שקוראים), כל אחת בכיוון הפוך מהקודמת ---------- */
  function strokeD(i) {
    var cx = Math.round(W - (i + .5) * (W / N));
    var a = [cx + 120, -170], b = [cx + 30, 280], c = [cx + 90, 800], d = [cx - 100, 1370], t;
    if (i % 2) { t = a; a = d; d = t; t = b; b = c; c = t; }
    return 'M' + a + 'C' + b + ' ' + c + ' ' + d;
  }

  /* הצילום כשכבה אחת: נייר, סקיצה, שוליים של זהב, ומעליהם הצילום בצבע דרך מסכה של משיכות מכחול */
  var uid = 0;
  function svg(vb) {
    var p = 'i5r' + (++uid), sw = 380, ds = [], i;
    for (i = 0; i < N; i++) ds.push(strokeD(i));
    var lines = function (stroke, w) {
      return ds.map(function (d, k) { return '<path class="i5-s" data-i="' + k + '" d="' + d + '" pathLength="1" fill="none" stroke="' + stroke + '" stroke-width="' + w + '"/>'; }).join('');
    };
    var R = 'x="-300" y="-300" width="2400" height="1800"';
    return '<svg class="i5-sv" viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>' +
      '<filter id="' + p + 'f" filterUnits="userSpaceOnUse" ' + R + ' color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".011 .046" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="120" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<filter id="' + p + 'k" color-interpolation-filters="sRGB"><feColorMatrix values=".13 .26 .05 0 .53  .12 .24 .05 0 .5  .11 .22 .04 0 .45  0 0 0 1 0"/></filter>' +
      '<linearGradient id="' + p + 'g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1800" y2="1200"><stop offset="0" stop-color="#A97C2E"/><stop offset=".18" stop-color="#F7E3A3"/><stop offset=".34" stop-color="#C9A04A"/><stop offset=".52" stop-color="#8A6220"/><stop offset=".68" stop-color="#E9CC80"/><stop offset=".84" stop-color="#C29540"/><stop offset="1" stop-color="#F7E3A3"/></linearGradient>' +
      '<mask id="' + p + 'm" maskUnits="userSpaceOnUse" ' + R + '><g filter="url(#' + p + 'f)">' + lines('#fff', sw) + '</g><rect class="i5-full" ' + R + ' fill="#fff"/></mask></defs>' +
      '<rect ' + R + ' fill="#F7EEDC"/>' +
      '<image class="i5-sk" data-k="' + p + 'k" width="1800" height="1200" preserveAspectRatio="xMidYMid slice"/>' +
      '<g class="i5-rim" filter="url(#' + p + 'f)">' + lines('url(#' + p + 'g)', sw + 36) + '</g>' +
      '<image class="i5-co" href="' + PHOTO + '" width="1800" height="1200" preserveAspectRatio="xMidYMid slice" mask="url(#' + p + 'm)"/></svg>';
  }

  /* הדפסה במסגרת: הצילום, סרט השוקולד עם המשפט בזהב, חותמת, ואבק זהב */
  function makePrint(cls, cap) {
    var f = document.createElement('figure');
    f.className = 'i5-print ' + cls;
    f.innerHTML = '<div class="print"><div class="ph i5-ph" role="img" aria-label="' + ALT + '">' + svg('0 0 1800 1200') + '<span class="i5-shine" aria-hidden="true"></span></div>' +
      '<div class="i5-rib" aria-hidden="true"><div class="i5-rbn"><span class="g3d" data-t="' + LINE + '"><span>' + LINE + '</span></span></div></div></div>' +
      '<span class="seal i5-ps" aria-hidden="true"></span><canvas class="i5-dust" aria-hidden="true"></canvas>' +
      (cap ? '<figcaption class="i5-cap">' + cap + '</figcaption>' : '');
    return f;
  }

  /* ---------- בונים ---------- */
  var pr = makePrint('i5-main', 'מסקיצה לבר אמיתי');
  var fin = makePrint('i5-fin', '');
  var strip = document.createElement('div');
  strip.className = 'i5-strip'; strip.setAttribute('aria-hidden', 'true');
  strip.innerHTML = '<div class="i5-band">' + svg('0 610 1800 360') + '</div><span class="i5-chip"><span class="seal"></span><b dir="ltr">0/7</b></span>';
  var chip = $('.i5-chip b', strip);
  var rail = document.createElement('div');
  rail.className = 'i5-rail';
  rail.innerHTML = '<div class="i5-rw"><div class="i5-panel"></div></div>';
  var panel = $('.i5-panel', rail);
  body.appendChild(rail);
  if (share) art.insertBefore(fin, share); else art.appendChild(fin);
  document.body.appendChild(strip);
  var TR = [-14, 9, -6, 12, -10, 7, -12];
  lis.forEach(function (li, i) {
    var s = document.createElement('span');
    s.className = 'seal i5-st'; s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--tr', TR[i % TR.length] + 'deg');
    li.appendChild(s);
  });
  B.dress(pr); B.dress(fin); B.dress(strip); B.dress(list);

  /* במחשב: הצילום ותוכן העניינים בדף הנייר הדביק. עד 1080: הצילום על ההדפסה של הפתיחה, תוכן העניינים במקומו */
  function place() {
    if (mqD.matches) { if (pr.parentNode !== panel) panel.appendChild(pr); if (toc.parentNode !== panel) panel.appendChild(toc); }
    else { if (aprint && pr.parentNode !== aprint) aprint.appendChild(pr); if (toc.parentNode !== side) side.appendChild(toc); }
  }
  place();
  if (mqD.addEventListener) mqD.addEventListener('change', function () { place(); measure(); tick(); });

  /* ---------- מידות: מאיפה הדף הדביק מתחיל, ואיפה הוא נעצר מתחת להדר (ומתחת לבורר הרעיונות, אם הוא שם) ---------- */
  var stripTop = 70;
  function measure() {
    var hr = hero.getBoundingClientRect(), br = body.getBoundingClientRect(), pt = parseFloat(getComputedStyle(hero).paddingTop) || 0;
    body.style.setProperty('--i5-up', Math.max(0, Math.round(br.top - hr.top - pt)) + 'px');
    var hdrH = innerWidth > 820 ? 72 : 60, top = hdrH + 28, st = hdrH + 9, pk = $('.ai-pick');
    if (pk && pk.getClientRects().length && getComputedStyle(pk).visibility !== 'hidden') {
      var r = pk.getBoundingClientRect(), p = panel.getBoundingClientRect();
      if (mqD.matches && r.left < p.right + 10 && r.right > p.left - 10) top = Math.max(top, Math.round(r.bottom + 14));
      st = Math.max(st, Math.round(r.bottom + 8));
    }
    stripTop = st;
    root.style.setProperty('--i5-top', top + 'px');
    root.style.setProperty('--i5-stop', st + 'px');
  }
  measure();
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); }).observe(hero);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  /* ---------- הסקיצה: עיפרון חום על נייר שמנת, מחושבת פעם אחת מהצילום עצמו (color dodge על טשטוש של ההפוך) ---------- */
  function blur(v, w, h, r) {
    var t = new Float32Array(Math.max(w, h)), L = r * 2 + 1, x, y, s, o;
    for (y = 0; y < h; y++) {
      o = y * w; s = 0;
      for (x = -r; x <= r; x++) s += v[o + Math.min(w - 1, Math.max(0, x))];
      for (x = 0; x < w; x++) { t[x] = s / L; s += v[o + Math.min(w - 1, x + r + 1)] - v[o + Math.max(0, x - r)]; }
      for (x = 0; x < w; x++) v[o + x] = t[x];
    }
    for (x = 0; x < w; x++) {
      s = 0;
      for (y = -r; y <= r; y++) s += v[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (y = 0; y < h; y++) { t[y] = s / L; s += v[Math.min(h - 1, y + r + 1) * w + x] - v[Math.max(0, y - r) * w + x]; }
      for (y = 0; y < h; y++) v[y * w + x] = t[y];
    }
  }
  /* גם גרסה מוארת וחמה של הצילום, כדי שכשהוא נחשף הוא יהיה בהיר (בלי לגעת בקובץ עצמו) */
  function lit(img) {
    var w = 1350, h = 900, c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h), a = d.data, L = new Float32Array(256), i, r, g, b, m;
    for (i = 0; i < 256; i++) L[i] = 255 * Math.pow(i / 255, .84);
    for (i = 0; i < a.length; i += 4) {
      r = a[i]; g = a[i + 1]; b = a[i + 2]; m = .299 * r + .587 * g + .114 * b;
      r = m + (r - m) * 1.14; g = m + (g - m) * 1.14; b = m + (b - m) * 1.14;
      a[i] = L[Math.max(0, Math.min(255, r | 0))] * 1.03; a[i + 1] = L[Math.max(0, Math.min(255, g | 0))] * 1.005; a[i + 2] = L[Math.max(0, Math.min(255, b | 0))] * .95;
    }
    x.putImageData(d, 0, 0);
    return c;
  }
  function sketch(img) {
    var w = 1200, h = 800, c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h), a = d.data, n = w * h, g = new Float32Array(n), v = new Float32Array(n), i, j, s, k;
    for (i = 0; i < n; i++) { j = i * 4; g[i] = .299 * a[j] + .587 * a[j + 1] + .114 * a[j + 2]; v[i] = 255 - g[i]; }
    blur(v, w, h, 6); blur(v, w, h, 6); blur(v, w, h, 6);
    for (i = 0; i < n; i++) {
      s = Math.min(255, g[i] * 256 / (256 - v[i])) / 255;
      s = Math.pow(s, 3.4) * (.84 + .16 * g[i] / 255);
      k = Math.max(0, Math.min(1, s + (Math.random() - .5) * .06));
      j = i * 4;
      a[j] = 74 + (248 - 74) * k; a[j + 1] = 44 + (239 - 44) * k; a[j + 2] = 26 + (222 - 26) * k;
    }
    x.putImageData(d, 0, 0);
    return c;
  }
  function setSk(url, fallback) {
    $$('.i5-sk').forEach(function (el) {
      el.setAttribute('href', url);
      if (fallback) el.setAttribute('filter', 'url(#' + el.getAttribute('data-k') + ')');
    });
    root.classList.add('i5-sk-on');
  }
  function fallback() { setSk(PHOTO, true); }
  (function () {
    var img = new Image(); img.decoding = 'async';
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 40); };
    img.onload = function () {
      idle(function () {
        try {
          var c = sketch(img);
          if (c.toBlob) c.toBlob(function (b) { if (b) setSk(URL.createObjectURL(b)); else fallback(); }, 'image/jpeg', .9);
          else setSk(c.toDataURL('image/jpeg', .9));
        } catch (e) { fallback(); return; }
        idle(function () {
          try {
            var c2 = lit(img);
            if (c2.toBlob) c2.toBlob(function (b) { if (!b) return; var u = URL.createObjectURL(b); $$('.i5-co').forEach(function (el) { el.setAttribute('href', u); }); }, 'image/jpeg', .92);
          } catch (e) { }
        }, { timeout: 900 });
      }, { timeout: 700 });
    };
    img.onerror = fallback;
    img.src = PHOTO;
  })();

  /* ---------- אבק זהב: פעם אחת, עדין, ונגמר ---------- */
  function dust(cv) {
    var x = cv.getContext('2d'); if (!x) return;
    var dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect(), w = r.width, h = r.height, P = [], t0 = 0, i;
    cv.width = w * dpr; cv.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (i = 0; i < 74; i++) P.push({ x: w * (.1 + Math.random() * .8), y: h * (.55 + Math.random() * .38), r: .8 + Math.random() * 2.1, vy: .22 + Math.random() * .75, vx: (Math.random() - .5) * .45, t: Math.random() * 6.3, d: Math.random() * 1500, star: Math.random() < .3 });
    function star(px, py, s, al) {
      x.fillStyle = 'rgba(255,238,184,' + al + ')';
      x.beginPath(); x.moveTo(px, py - s); x.quadraticCurveTo(px, py, px + s, py); x.quadraticCurveTo(px, py, px, py + s); x.quadraticCurveTo(px, py, px - s, py); x.quadraticCurveTo(px, py, px, py - s); x.fill();
    }
    function fr(now) {
      if (!t0) t0 = now;
      var e = now - t0, alive = false;
      x.clearRect(0, 0, w, h);
      P.forEach(function (p) {
        var le = e - p.d; if (le < 0) { alive = true; return; }
        var life = le / 3800; if (life >= 1) return;
        alive = true;
        p.y -= p.vy; p.x += p.vx + Math.sin(p.t + le / 520) * .22;
        var al = Math.sin(life * Math.PI) * (.6 + .4 * Math.sin(p.t + le / 170));
        var g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.4);
        g.addColorStop(0, 'rgba(255,242,196,' + al + ')'); g.addColorStop(.35, 'rgba(226,190,112,' + al * .75 + ')'); g.addColorStop(1, 'rgba(176,128,52,0)');
        x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, p.r * 3.4, 0, 6.29); x.fill();
        if (p.star) star(p.x, p.y, p.r * 3.2, al * .9);
      });
      if (alive) requestAnimationFrame(fr); else x.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(fr);
  }

  /* ---------- ההתקדמות: כל חלק שנפתח בתוכן העניינים = משיכת מכחול + חותמת. הולך רק קדימה ---------- */
  var reached = 0;
  function strokeOn(scope, i) { $$('.i5-s[data-i="' + i + '"]', scope).forEach(function (s) { s.classList.add('on'); }); }
  function finish(fig, withDust) {
    if (fig.__d) return; fig.__d = 1;
    fig.classList.add('i5-done');
    if (withDust && !calm) setTimeout(function () { dust($('.i5-dust', fig)); }, 650);
  }
  function step(i, delay) {
    setTimeout(function () {
      strokeOn(pr, i); strokeOn(strip, i);
      if (lis[i]) lis[i].classList.add('i5-got');
      chip.textContent = Math.max(+chip.textContent.split('/')[0] || 0, i + 1) + '/' + N;
      if (i === N - 1) setTimeout(function () { finish(pr, mqD.matches); strip.classList.add('i5-done'); }, calm ? 0 : 1550);
    }, calm ? 0 : delay);
  }
  function upto(n) {
    if (n <= reached) return;
    var from = reached; reached = n;
    for (var i = from; i < n; i++) step(i, (i - from) * 340);
  }
  function curK() { var k = 0; lis.forEach(function (li, i) { if (li.classList.contains('on')) k = i + 1; }); return k; }
  var mq = 0;
  new MutationObserver(function () { if (mq) return; mq = 1; Promise.resolve().then(function () { mq = 0; upto(curK()); }); })
    .observe(list, { attributes: true, attributeFilter: ['class'], subtree: true });

  /* כרטיס הסיום (עד 1080): כשהוא על המסך, המכחול עובר מהר על כל הבר, ואז הסרט, החותמת והאבק */
  function finRun() {
    if (fin.__r) return; fin.__r = 1;
    fin.classList.add('i5-fast');
    for (var i = 0; i < N; i++) (function (k) { setTimeout(function () { strokeOn(fin, k); }, calm ? 0 : k * 120); })(i);
    setTimeout(function () { finish(fin, true); }, calm ? 0 : N * 120 + 950);
    upto(N);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !mqD.matches) finRun(); }, { threshold: .45 }).observe(fin);

  /* בלי תנועה: הבר חשוף ומלא מההתחלה */
  function still() {
    calm = true; root.classList.add('i5-calm');
    [pr, fin, strip].forEach(function (el) { for (var i = 0; i < N; i++) strokeOn(el, i); el.classList.add('i5-done'); el.__d = 1; });
    fin.__r = 1;
  }
  if (calm) still();
  new MutationObserver(function () { if (!calm && B.calm()) still(); }).observe(root, { attributes: true, attributeFilter: ['class'] });

  /* ---------- הפס הדביק בטלפון: מופיע אחרי שעוברים את ההדפסה של הפתיחה, ונעלם כשכרטיס הסיום מגיע ---------- */
  function tick() {
    if (mqD.matches || calm) { strip.classList.remove('on'); return; }
    var pb = pr.getBoundingClientRect().bottom, fr = fin.getBoundingClientRect(), ar = art.getBoundingClientRect();
    strip.classList.toggle('on', pb < stripTop && fr.top > innerHeight * .62 && ar.bottom > stripTop + 120);
  }
  var raf = 0;
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; tick(); }); }, { passive: true });
  addEventListener('resize', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; measure(); tick(); }); });
  upto(curK());
  tick();
})();

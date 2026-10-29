/* article.js: עמוד המאמר (article.html). נטען אחרי blog.js ומשתמש ב-PatBlog (toast, dress, calm).
   זמן קריאה מחושב, פס התקדמות, תוכן עניינים שנדלק לפי הגלילה, רשימה לסימון (נשמרת בדפדפן),
   שיתוף בוואטסאפ והעתקת קישור, ושלושה כרטיסי "עוד מאמרים" מ-articles.js. */
(function () {
  'use strict';
  var B = window.PatBlog, art = document.getElementById('ar-art');
  if (!B || !art) return;
  var $ = B.$, $$ = B.$$;
  var SLUG = window.AR_SLUG || 'bar-mitzvah-guide'; /* AR_SLUG: מאמר אמיתי שנבנה ב-article-live.js */
  var A = window.PAT_ARTICLES || [];
  var me = A.filter(function (a) { return a.slug === SLUG; })[0] || { cat: 'guide', title: document.title.split(' · ')[0] };
  var secs = $$('.ar-sec', art);

  /* ---------- זמן קריאה ומספר החלקים: מחושבים ממה שכתוב במאמר ---------- */
  (function () {
    var txt = $$('.ar-intro, .ar-sec h2, .ar-sec > p, .ar-quote p, .ar-tip p, .ar-pic figcaption, .ar-ck-t', art).map(function (e) { return e.textContent; }).join(' ');
    var words = txt.trim().split(/\s+/).length;
    var min = Math.max(1, Math.round(words / 180));
    var rt = $('#ar-rt'), ns = $('#ar-ns'), tn = $('#ar-toc-n');
    if (rt) { rt.lastElementChild.textContent = min === 1 ? 'דקת קריאה אחת' : min === 2 ? 'שתי דקות קריאה' : min + ' דקות קריאה'; rt.hidden = false; }
    var parts = secs.length + ' חלקים';
    if (ns) { ns.textContent = parts; ns.hidden = false; }
    if (tn) tn.textContent = parts;
  })();

  /* ---------- תוכן העניינים: הנקודה של החלק שקוראים נדלקת, לחיצה קופצת לחלק ---------- */
  var toc = $('#ar-toc'), list = $('#ar-toc-l'), tbtn = toc && $('.ar-toc-t', toc);
  var items = list ? $$('a', list).map(function (a) {
    return { a: a, li: a.parentNode, sec: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (x) { return x.sec; }) : [];
  var cur = -2;
  function spy() {
    if (!items.length) return;
    var line = innerHeight * .34, k = -1;
    items.forEach(function (it, i) { if (it.sec.getBoundingClientRect().top <= line) k = i; });
    if (art.getBoundingClientRect().bottom <= innerHeight * .9) k = items.length - 1; /* סוף המאמר: החלק האחרון דולק */
    if (k === cur) return;
    cur = k;
    items.forEach(function (it, i) {
      it.li.classList.toggle('on', i === k);
      it.li.classList.toggle('done', i < k);
      if (i === k) it.a.setAttribute('aria-current', 'true'); else it.a.removeAttribute('aria-current');
    });
    list.style.setProperty('--f', k < 1 ? 0 : (k / (items.length - 1)).toFixed(3));
  }
  function setOpen(on, snap) {
    if (!toc) return;
    if (snap) toc.classList.add('snap');
    toc.classList.toggle('open', on);
    tbtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (snap) { void toc.offsetHeight; toc.classList.remove('snap'); }
  }
  if (tbtn) tbtn.addEventListener('click', function () { setOpen(!toc.classList.contains('open')); });
  if (list) list.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var sec = document.getElementById(a.getAttribute('href').slice(1)); if (!sec) return;
    e.preventDefault();
    if (toc.classList.contains('open')) setOpen(false, true); /* בטלפון: נסגר מיד, ואז קופצים (כדי שהקפיצה לא תחטיא) */
    sec.scrollIntoView({ behavior: B.calm() ? 'auto' : 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#' + sec.id); } catch (err) { }
    var h = $('h2', sec); if (h) h.focus({ preventScroll: true });
  });

  /* ---------- פס התקדמות הקריאה (על גוף המאמר בלבד) ---------- */
  var bar = $('.ar-prog i');
  function prog() {
    if (!bar) return;
    var r = art.getBoundingClientRect(), p = (innerHeight * .35 - r.top) / Math.max(1, r.height);
    bar.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
  }

  var raf = 0;
  function tick() { raf = 0; spy(); prog(); }
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  addEventListener('resize', function () { if (!raf) raf = requestAnimationFrame(tick); });
  tick();

  /* ---------- הרשימה לסימון: וי בזהב, מונה, וכשהכול מסומן: "את מוכנה לשיחה." ---------- */
  (function () {
    var ck = $('#ar-check'); if (!ck) return;
    var boxes = $$('input[type="checkbox"]', ck), KEY = 'pat-check-' + SLUG;
    var num = $('#ar-ck-n b'), sr = $('#ar-ck-sr'), fill = $('.ar-ck-bar i', ck), ready = $('#ar-ready'), reset = $('#ar-ck-reset');
    function load() {
      try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); boxes.forEach(function (b, i) { b.checked = v.indexOf(i) > -1; }); } catch (e) { }
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(boxes.reduce(function (acc, b, i) { if (b.checked) acc.push(i); return acc; }, []))); } catch (e) { }
    }
    function paint(first) {
      var n = boxes.filter(function (b) { return b.checked; }).length, all = n === boxes.length, was = !ready.hidden;
      num.textContent = n;
      fill.style.setProperty('--p', (n / boxes.length).toFixed(3));
      sr.textContent = all ? '. את מוכנה לשיחה.' : '';
      ready.hidden = !all;
      reset.hidden = n === 0;
      if (all && !was && !first) setTimeout(function () { ready.scrollIntoView({ behavior: B.calm() ? 'auto' : 'smooth', block: 'nearest' }); }, 120);
    }
    load(); paint(true);
    ck.addEventListener('change', function (e) { if (e.target.type === 'checkbox') { save(); paint(); } });
    reset.addEventListener('click', function () { boxes.forEach(function (b) { b.checked = false; }); save(); paint(); boxes[0].focus(); });
  })();

  /* ---------- שיתוף: וואטסאפ עם הכותרת והכתובת, והעתקת קישור ---------- */
  (function () {
    var url = location.origin + location.pathname, wa = $('#ar-wa'), cp = $('#ar-copy');
    if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(me.title + '\n' + url);
    if (!cp) return;
    function ok() { B.toast('הקישור הועתק'); }
    function old() {
      var t = document.createElement('textarea');
      t.value = url; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (e) { B.toast(url); }
      document.body.removeChild(t);
    }
    cp.addEventListener('click', function () {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(ok, old); else old();
    });
  })();

  /* ---------- עוד מאמרים: שלושה כרטיסי נייר (קודם מאותו נושא), באותו מבנה של עמוד המאמרים ---------- */
  (function () {
    var grid = $('#ar-more'); if (!grid || !A.length) return;
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var pool = A.filter(function (a) { return a.slug !== SLUG; });
    var pick = pool.filter(function (a) { return a.cat === me.cat; }).concat(pool.filter(function (a) { return a.cat !== me.cat; })).slice(0, 3);
    var TILT = [-.8, .6, -.5];
    grid.innerHTML = pick.map(function (a, i) {
      return '<article class="pcard rv" style="--r:' + TILT[i] + 'deg;--d:' + i * 110 + 'ms">' +
        '<span class="ptag"><i aria-hidden="true"></i>' + esc(a.tag) + '</span>' +
        '<figure class="pc-ph"><img src="' + esc(a.img) + '" alt="' + esc(a.alt) + '" loading="lazy" decoding="async"></figure>' +
        '<h3>' + esc(a.title) + '</h3><p>' + esc(a.ex) + '</p>' +
        '<a class="pc-btn" href="' + esc(a.href) + '" aria-label="לקריאה: ' + esc(a.title) + '">לקריאה<i data-ico="arrowL"></i></a></article>';
    }).join('');
    B.dress(grid);
  })();
})();

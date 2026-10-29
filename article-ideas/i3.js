/* i3.js: רעיון 3 לעמוד המאמר, "הקולנוע" (article.html?idea=3). זמני. נטען אחרי blog.js ו-article.js.
   בונה את הסרט: צילום דביק מאחורי הפתיחה וגוף המאמר שמתחלף בכל סצנה, פסי קולנוע וכתובית בפתיחה,
   כותרת שעולה מילה אחרי מילה, תווית "סצנה" וכרטיס נייר לכל חלק, ופריים קטן לכל סצנה בתוכן העניינים.
   לא נוגע בהתנהגות של article.js: רק עוטף ומזיז, ה-id וה-class נשארים. */
(function () {
  'use strict';
  var B = window.PatBlog, root = document.documentElement;
  var hero = document.querySelector('.ar-hero'), body = document.querySelector('.ar-body'), art = document.getElementById('ar-art');
  if (!B || !hero || !body || !art) return;
  var $ = B.$, $$ = B.$$, calm = B.calm;

  /* הצילומים, אחד לכל סצנה (0 = הפתיחה והמשפט הפותח). --op = איפה הקינוחים בפריים, --kx/--ky = כיוון הזום */
  var FR = [
    { s: 'media/img/IMG_9027-lg.webp', op: '50% 78%', m: '60% 70%', kx: '-1.5%', ky: '1.5%' },
    { s: 'media/gal/bar-pink-domes.webp', op: '50% 55%', m: '42% 50%', kx: '1.5%', ky: '-1%' },
    { s: 'media/img/IMG_6525-lg.webp', op: '50% 38%', m: '28% 30%', kx: '-1%', ky: '1%' },
    { s: 'media/gal/IMG_6543.webp', op: '50% 55%', m: '55% 50%', kx: '1.5%', ky: '1%' },
    { s: 'media/img/IMG_8964-lg.webp', op: '50% 72%', m: '62% 60%', kx: '-1.5%', ky: '-1%' },
    { s: 'media/img/IMG_8871-lg.webp', op: '50% 45%', m: '50% 40%', kx: '1%', ky: '1.5%' },
    { s: 'media/gal/IMG_8984.webp', op: '50% 60%', m: '35% 55%', kx: '-1.5%', ky: '1%' },
    { s: 'media/gal/IMG_8408.webp', op: '50% 58%', m: '30% 55%', kx: '1%', ky: '-1.5%' }
  ];
  var narrow = matchMedia('(max-width: 820px)');

  /* ---------- הסרט: עוטף את הפתיחה ואת גוף המאמר, והצילום הדביק ראשון בתוכו ---------- */
  var film = document.createElement('div');
  film.className = 'i3-film';
  hero.parentNode.insertBefore(film, hero);
  var reel = document.createElement('div');
  reel.className = 'i3-reel'; reel.setAttribute('aria-hidden', 'true');
  reel.innerHTML = FR.map(function (f, i) {
    return '<div class="i3-fr" data-op="' + f.op + '" data-m="' + f.m + '" style="--kx:' + f.kx + ';--ky:' + f.ky + '"><img alt="" decoding="async"' + (i ? '' : ' src="' + f.s + '"') + '></div>';
  }).join('') + '<i class="i3-grade"></i>';
  film.appendChild(reel);
  film.appendChild(hero);
  var shot = $('.ar-shot'); if (shot) film.appendChild(shot);
  film.appendChild(body);
  var frs = $$('.i3-fr', reel);
  function framing() { frs.forEach(function (f) { f.style.setProperty('--op', narrow.matches ? f.getAttribute('data-m') : f.getAttribute('data-op')); }); }
  framing();
  if (narrow.addEventListener) narrow.addEventListener('change', framing);
  function load(k) { var f = frs[k], im = f && f.firstChild; if (im && !im.getAttribute('src')) im.src = FR[k].s; }

  /* ---------- הפתיחה: פס עליון (ההדר יושב בו), ופס תחתון עם המשפט הפותח והפרטים, כמו כתובית ---------- */
  var top = document.createElement('div');
  top.className = 'i3-bar i3-top'; top.setAttribute('aria-hidden', 'true');
  var sub = document.createElement('div');
  sub.className = 'i3-bar i3-sub';
  sub.innerHTML = '<div class="wrap i3-sub-in"></div>';
  var lead = $('.ar-lead', hero), meta = $('.ar-meta', hero);
  if (lead) sub.firstChild.appendChild(lead);
  if (meta) sub.firstChild.appendChild(meta);
  hero.appendChild(top);
  hero.appendChild(sub);
  /* בזמן שהפס התחתון על המסך, הכפתורים הצפים (וואטסאפ ונגישות) יושבים מעליו ולא על הכתובית */
  function subH() { root.style.setProperty('--i3-sh', sub.offsetHeight + 'px'); }
  subH(); addEventListener('resize', subH);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(subH);
  /* רק בתמונת הפתיחה (לפני שמתחילים לגלול, כמו ההדר); ברגע שגוללים הם חוזרים למקום הרגיל */
  function subOn() { root.classList.toggle('i3-sub-on', scrollY < 40); }
  subOn(); addEventListener('scroll', subOn, { passive: true });

  /* ---------- מילה אחרי מילה: כל מילה בעטיפה משלה, עם המספר שלה בתור ---------- */
  function words(el, i) {
    i = i || 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 1) { i = words(n, i); return; }
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement('span');
        s.className = 'i3w'; s.style.setProperty('--i', i++); s.textContent = p;
        frag.appendChild(s);
      });
      el.replaceChild(frag, n);
    });
    return i;
  }
  var l1 = $('.ar-l1', hero), l2 = $('.ar-l2', hero);
  var n = l1 ? words(l1) : 0;
  if (l2) {
    /* "לבר מצווה": כל מילה בזהב תלת ממדי משלה, כדי שתעלה לבד */
    var t = (l2.getAttribute('data-t') || l2.textContent).trim().split(/\s+/);
    l2.className = 'ar-l2 i3-l2';
    l2.removeAttribute('data-t');
    l2.innerHTML = t.map(function (w, j) {
      return '<span class="g3d i3w" data-t="' + w + '" style="--i:' + (n + j) + '"><span>' + w + '</span></span>';
    }).join(' ');
  }

  /* ---------- הסצנות: כרטיס נייר לכל חלק, תווית "סצנה 01", והכותרת נכנסת מילה אחרי מילה ---------- */
  var secs = $$('.ar-sec', art);
  var cards = $$('.ar-intro, .ar-sec, .ar-share', art);
  cards.forEach(function (c) { c.classList.add('i3-card'); });
  secs.forEach(function (s) {
    var num = $('.ar-n', s), h = $('h2', s);
    if (num) num.innerHTML = '<span class="i3-sc">סצנה</span><b>' + num.textContent.trim() + '</b>';
    if (h) words(h);
  });
  if (calm() || !('IntersectionObserver' in window)) cards.forEach(function (c) { c.classList.add('i3-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('i3-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
    cards.forEach(function (c) { io.observe(c); });
  }
  /* קפיצה מתוכן העניינים: הכרטיס של היעד נכנס מיד (לפני ש-article.js מחשב לאן לגלול), כדי שהקפיצה לא תחטיא */
  var tocList = $('#ar-toc-l');
  if (tocList) tocList.addEventListener('click', function (e) {
    var a = e.target.closest('a'), sec = a && document.getElementById(a.getAttribute('href').slice(1));
    if (!sec || sec.classList.contains('i3-in')) return;
    sec.classList.add('i3-snap', 'i3-in'); void sec.offsetHeight;
    requestAnimationFrame(function () { sec.classList.remove('i3-snap'); });
  }, true);

  /* ---------- הצילום מתחלף בכל סצנה: כשהכרטיס הבא מגיע לחלק התחתון של המסך ---------- */
  var cur = -1;
  function show(k) {
    if (k === cur) return;
    var old = frs[cur], f = frs[k];
    cur = k;
    load(k); load(k + 1);
    f.classList.add('on', 'run');
    if (old) {
      old.classList.remove('on');
      clearTimeout(old.__t);
      old.__t = setTimeout(function () { if (!old.classList.contains('on')) old.classList.remove('run'); }, 1700);
    }
  }
  /* המיקום בעמוד בלי תנועת הכניסה של הכרטיס (offsetTop לא מושפע מ-transform) */
  function absTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
  function pick() {
    var line = scrollY + innerHeight * .8, k = 0;
    secs.forEach(function (s, i) { if (absTop(s) <= line) k = i + 1; });
    show(Math.min(k, frs.length - 1));
  }
  var raf = 0;
  function onScroll() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; pick(); }); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  pick();

  /* ---------- תוכן העניינים: פריים קטן מהצילום של כל סצנה (אחרי שהעמוד נטען, כדי לא לעכב את הפתיחה) ---------- */
  var tocLis = $$('#ar-toc-l li');
  function thumbs() {
    tocLis.forEach(function (li, i) { if (FR[i + 1]) li.style.setProperty('--ph', 'url("' + FR[i + 1].s + '")'); });
    frs.forEach(function (f, k) { load(k); });
  }
  if (document.readyState === 'complete') setTimeout(thumbs, 400);
  else addEventListener('load', function () { setTimeout(thumbs, 400); });

  root.classList.add('i3-on');
})();

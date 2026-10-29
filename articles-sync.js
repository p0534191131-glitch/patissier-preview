/* articles-sync.js: החיבור בין הבלוג באתר למסך "מאמרים" במערכת הניהול (design/admin/yoman/articles.html).
   המערכת שומרת את המאמרים ב-Store.S.articles (localStorage, מפתח patissier-yoman-v1, אותו מקום שהאתר והמערכת כבר חולקים).
   אם יש שם מאמרים, הם מחליפים את articles.js / live-articles.js: רק מה שמופיע באתר נכנס לרשימה, וכל מאמר נפתח גם כשהוא מוסתר
   (בשביל התצוגה בטלפון שבמערכת). אם המערכת עוד לא נפתחה, האתר נשאר עם הקבצים כמו שהם.
   נטען אחרי articles.js (ו-live-articles.js בעמוד המאמר). בדף הבית: בונה את ארבעת הכרטיסים של "בדף הבית". */
(function () {
  'use strict';
  var S = null;
  try { S = JSON.parse(localStorage.getItem('patissier-yoman-v1') || 'null'); } catch (e) { }
  if (!S || !Array.isArray(S.articles)) return;

  var T = {};
  (window.PAT_TOPICS || []).forEach(function (t) { T[t.key] = t.name; });
  var href = function (a) { return 'article.html?a=' + encodeURIComponent(a.slug); };
  var all = S.articles.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });

  window.PAT_ARTICLES = all.filter(function (a) { return a.show; }).map(function (a) {
    return { slug: a.slug, cat: a.cat, tag: T[a.cat] || 'מדריך', title: a.title, ex: a.ex, img: a.img, alt: a.alt || a.title, date: a.date, home: !!a.home, href: href(a) };
  });
  if (window.PAT_LIVE) {
    var L = {};
    all.forEach(function (a) { L[a.slug] = { title: a.title, meta_title: a.title, meta_description: a.ex, excerpt: a.ex, img: a.img, alt: a.alt, date: a.date, html: a.html }; });
    window.PAT_LIVE = L;
  }

  /* דף הבית: ארבעת המאמרים שסומנו "בדף הבית" (אם סומנו פחות, משלימים מהחדשים) */
  var grid = document.querySelector('#blog .pcards');
  if (!grid) return;
  var A = window.PAT_ARTICLES, pick = A.filter(function (a) { return a.home; });
  pick = pick.concat(A.filter(function (a) { return !a.home; })).slice(0, 4);
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var R = ['--r:-.8deg', '--r:.6deg;--d:120ms', '--r:-.5deg;--d:240ms', '--r:.8deg;--d:360ms'];
  grid.innerHTML = pick.map(function (a, i) {
    return '<article class="pcard rv" style="' + R[i] + '"><span class="ptag"><i aria-hidden="true"></i>' + esc(a.tag) + '</span>' +
      '<figure class="pc-ph"><img src="' + esc(a.img) + '" alt="' + esc(a.alt) + '" loading="lazy" decoding="async"></figure>' +
      '<h3>' + esc(a.title) + '</h3><p>' + esc(a.ex) + '</p>' +
      '<a class="pc-btn" href="' + esc(a.href) + '" aria-label="לקריאה: ' + esc(a.title) + '">לקריאה<i data-ico="arrowL"></i></a></article>';
  }).join('');
})();

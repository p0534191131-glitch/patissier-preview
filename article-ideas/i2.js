/* i2.js · רעיון 2: המגזין. המאמר ככתבה במגזין יוקרה מודפס.
   הפתיחה: כפולת עמודים תלת ממדית שמונחת על שולחן השוקולד. בגלילה היא ננעלת במקום, עולה ומתיישרת אל הקורא.
   הגוף: כותרת רצה, אות פתיחה בזהב, טורים, מספרי חלקים בקו מתאר, ציטוט שחוצה את הטורים, צילום עד הקצה, ותלוש לגזירה.
   לא משנה טקסט ולא id-ים: רק עוטף, מזיז ומוסיף קישוטים. נטען אחרי blog.js ו-article.js. */
(function () {
  'use strict';
  var root = document.documentElement, B = window.PatBlog;
  if (!root.classList.contains('idea-2') || !B) return;
  var $ = B.$, $$ = B.$$;
  var hero = $('.ar-hero'), hin = $('.ar-hin'), shot = $('.ar-shot'), fig = shot && $('.print', shot), seal = shot && $('.seal', shot);
  var crumbs = $('.ar-crumbs'), art = $('#ar-art');
  if (!hero || !hin || !fig || !art) return;

  /* ---------- 1. הכפולה ---------- */
  var RH = '<p class="i2-rh" aria-hidden="true"><span>פטיסייר</span><i></i><span>הבלוג</span><i></i><span>מדריך</span></p>';
  var top = document.createElement('div');
  top.className = 'wrap i2-top';
  var stage = document.createElement('div');
  stage.className = 'i2-stage';
  stage.innerHTML =
    '<div class="i2-lift"><div class="i2-mag">' +
      '<div class="i2-pg i2-pr">' + RH + '<p class="i2-fo" aria-hidden="true"><b>14</b></p></div>' +
      '<div class="i2-pg i2-pl"><div class="i2-ph"></div><p class="i2-fo" aria-hidden="true"><b>15</b></p></div>' +
    '</div></div>';
  var pinsp = document.createElement('div');
  pinsp.className = 'i2-pinsp';
  pinsp.setAttribute('aria-hidden', 'true');

  var mag = $('.i2-mag', stage), pr = $('.i2-pr', stage);
  if (crumbs) top.appendChild(crumbs);                 /* פירורי הלחם נשארים על השולחן, מעל המגזין */
  hero.insertBefore(top, hin);
  hero.insertBefore(stage, hin);
  hero.insertBefore(pinsp, stage.nextSibling);
  pr.insertBefore(hin, $('.i2-fo', pr));               /* התווית, הכותרת, שורת הפתיחה והפרטים: בעמוד הימני */
  $('.i2-ph', stage).appendChild(fig);                 /* הצילום הראשי: עד הקצה בעמוד השמאלי */
  if (seal) pr.appendChild(seal);

  /* ---------- הגלילה: המגזין ננעל, עולה מהשולחן ומתיישר ---------- */
  var end = 1;
  function measure() {
    var sticky = parseFloat(getComputedStyle(stage).top) || 0;
    var sp = pinsp.getBoundingClientRect();
    end = Math.max(1, sp.top + scrollY + sp.height - sticky - stage.offsetHeight);
  }
  var raf = 0, last = '';
  function tick() {
    raf = 0;
    var p = (B.calm() ? 1 : Math.min(1, Math.max(0, scrollY / (end * .72)))).toFixed(4);
    if (p !== last) { last = p; mag.style.setProperty('--p', p); }
  }
  function later() { if (!raf) raf = requestAnimationFrame(tick); }
  addEventListener('scroll', later, { passive: true });
  addEventListener('resize', function () { measure(); bleed(); later(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); bleed(); tick(); });

  /* ---------- 2. גוף המאמר ---------- */
  /* כותרת רצה ומספר עמוד בראש העמוד */
  var body = $('.ar-body'), grid = $('.ar-grid');
  if (body && grid) {
    var rh = document.createElement('div');
    rh.className = 'wrap i2-run';
    rh.setAttribute('aria-hidden', 'true');
    rh.innerHTML = RH + '<b class="i2-pn">16</b>';
    body.insertBefore(rh, grid);
  }

  /* תוכן העניינים הדביק: "תוכן הגיליון" (הכותרת הזאת מוסתרת מקוראי מסך, ה-nav נשאר "במאמר הזה") */
  var th = $('.ar-toc-h');
  if (th) th.textContent = 'תוכן הגיליון';

  /* אות פתיחה בזהב: האות הראשונה של הפסקה הראשונה עוברת לתוך span, הטקסט עצמו לא משתנה */
  var intro = $('.ar-intro', art);
  if (intro && intro.firstChild && intro.firstChild.nodeType === 3) {
    var tn = intro.firstChild, t = tn.nodeValue, k = t.search(/\S/);
    if (k > -1) {
      var dc = document.createElement('span');
      dc.className = 'i2-dc';
      dc.textContent = t.charAt(k);
      tn.nodeValue = t.slice(k + 1);
      intro.insertBefore(dc, tn);
    }
  }

  /* הרשימה לסימון: תלוש לגזירה, עם מספריים על הקו המקווקו */
  var ck = $('#ar-check');
  if (ck) ck.insertAdjacentHTML('afterbegin', '<span class="i2-sc" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg></span>');

  /* צילום עד הקצה: כמה רחוק הקצה השמאלי של המסך מהטור */
  function bleed() {
    var r = art.getBoundingClientRect();
    art.style.setProperty('--i2-bl', Math.max(0, Math.round(r.left)) + 'px');
  }

  measure(); bleed(); tick();
})();

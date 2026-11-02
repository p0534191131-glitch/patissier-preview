/* faq.js: שאלות נפוצות בדף הבית, "תפריט מודפס" (2.11.2026, סגנון 9 גרסה א). כל השאלות גלויות, אין מה לפתוח או לסגור.
   הכניסה בגלילה (השאלות מופיעות אחת אחרי השנייה) עובדת ב-CSS דרך .rv של site.js.
   כאן רק הנחיתה: קישור עם #faq (למשל מעמוד הבלוג) מגיע ישר לחלק, גם כשהפתיחה מחזירה את הגלילה למעלה.
   קפיצה אחת בלי גלילה חלקה (כמו "יצירת קשר" ב-contact-panel.js), ומפסיקים ברגע שהמשתמש נוגע. התפריט נחשף מיד. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var sec = d.getElementById('faq'); if (!sec || location.hash !== '#faq') return;
  var sheet = sec.querySelector('.fq-sheet'); if (sheet) sheet.classList.add('in');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function jump() {
    var stop = false, end = performance.now() + 1500;
    var quit = function () { stop = true; };
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (ev) { addEventListener(ev, quit, { once: true, passive: true }); });
    function go() {
      var y = Math.round(sec.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(sec).scrollMarginTop) || 0));
      if (Math.abs(y - scrollY) > 1) { root.style.scrollBehavior = 'auto'; scrollTo(0, y); root.style.scrollBehavior = ''; }
    }
    go();
    (function loop() { if (stop || performance.now() > end) return; go(); requestAnimationFrame(loop); })();
  }
  if (d.readyState === 'complete') jump(); else addEventListener('load', jump);
})();

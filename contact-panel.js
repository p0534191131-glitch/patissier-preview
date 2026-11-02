/* contact-panel.js: "יצירת קשר" בהדר ובמגירה מביא ישר ל-#contact בקפיצה אחת, בלי הגלילה החלקה שמריצה את כל האתר.
   2.11.2026: קודם זה היה חלון באנימציה (נשמר ב-contact-panel.panel-v1.js), ואפרים: "אני רוצה שיביא אותי ליצירת קשר
   רק לא אם אנימציה שהאתר טס אלא ישר יביא אותי לשם".
   בעמודים האחרים הקישור עובר ל-index.html#contact כרגיל, וכשדף הבית נטען עם #contact מוודאים שגם שם נוחתים בדיוק במקום. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var TRIG = '.hdr .nav a[href="#contact"],#drawer a[href="#contact"]';

  /* קפיצה בלי ה-scroll-behavior:smooth של האתר. אם משהו מעל עוד נטען וזז, מיישרים שוב בשנייה הראשונה,
     ומפסיקים ברגע שהמשתמש גולל בעצמו */
  function jump() {
    var t = d.getElementById('contact'); if (!t) return;
    var stop = false, end = performance.now() + 1200;
    var quit = function () { stop = true; };
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (ev) { addEventListener(ev, quit, { once: true, passive: true }); });
    function go() {
      var y = Math.round(t.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(t).scrollMarginTop) || 0));
      if (Math.abs(y - scrollY) > 1) { root.style.scrollBehavior = 'auto'; scrollTo(0, y); root.style.scrollBehavior = ''; }
    }
    go();
    (function loop() { if (stop || performance.now() > end) return; go(); requestAnimationFrame(loop); })();
  }

  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest(TRIG);
    if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !d.getElementById('contact')) return;
    e.preventDefault();
    /* המגירה בנייד נסגרת ב-site.js באותה לחיצה ומשחררת את הגלילה, אז קופצים רגע אחריה */
    setTimeout(jump, 0);
  }, true);

  /* הגעה מעמוד אחר (index.html#contact) */
  if (location.hash === '#contact') {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (d.readyState === 'complete') jump(); else addEventListener('load', jump);
  }
})();

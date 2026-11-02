/* hdr-kosher.js: חותמת הכשרות עוברת מהפתיחה להדר (2.11.2026, "אחרי הגלילה של ההירו ההכשר עובר להיות בהדר").
   החותמת שמתחת לכפתור (.h-kosher) עפה ומתכווצת אל המקום שלה בהדר (.hdr-kosher), צמוד לגלילה:
   - במסילה של הפתיחה (hero-open.js) המעוף רץ באותו קטע שבו הכפתור דוהה (p בין .045 ל-.26).
   - כשהחותמת עצמה עולה בגלילה עד ההדר (טלפון, או בלי המסילה) המעוף רץ לפי המרחק שלה מההדר.
   בגלילה חזרה למעלה היא חוזרת. בלי תנועה (prefers-reduced-motion, ?still, מצב נגישות): בלי מעוף, רק דהייה בהדר. */
(function () {
  var hk = document.querySelector('.h-kosher'), slot = document.querySelector('.hdr-kosher'), hero = document.getElementById('top'), hdr = document.getElementById('hdr');
  var im = slot && slot.querySelector('.hk-im');
  if (!slot || !im) return;
  if (!hk || !hero || !hdr) { slot.classList.add('on'); return; }
  var root = document.documentElement, rm = matchMedia('(prefers-reduced-motion: reduce)');
  var STILL = /[?&]still\b/.test(location.search);
  var calm = function () { return STILL || rm.matches || root.classList.contains('a11y-still'); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var GEO = 140;   // כמה פיקסלים לפני ההדר מתחיל המעוף כשהחותמת עולה בגלילה

  // המקום של החותמת בתוך הפתיחה בלי ה-transform שהמסילה שמה על הכפתור (offset מתעלם מ-transform)
  var O = null;
  function measure() {
    var x = 0, y = 0, e = hk;
    while (e && e !== hero) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    if (e !== hero) { var a = hk.getBoundingClientRect(), b = hero.getBoundingClientRect(); x = a.left - b.left; y = a.top - b.top; }
    O = { x: x, y: y };
  }
  function natural() { var h = hero.getBoundingClientRect(); return { x: h.left + O.x, y: h.top + O.y, w: hk.offsetWidth, h: hk.offsetHeight }; }

  var st = '';
  function set(s) {
    if (s === st) return; st = s;
    slot.classList.toggle('on', s === 'on');
    slot.classList.toggle('fly', s === 'fly');
    hk.classList.toggle('away', s !== 'off' && !calm());
    if (s !== 'fly') { im.style.width = ''; im.style.height = ''; im.style.transform = ''; }
  }

  var raf = 0, tl = 0;
  function frame() {
    raf = 0;
    if (!O) measure();
    var A = natural(), hb = hdr.getBoundingClientRect();
    if (calm()) { set(A.y + A.h / 2 < hb.bottom ? 'on' : 'off'); return; }
    var fr = root.classList.contains('hs-on') && window.PatHeroOpen ? seg(PatHeroOpen.progress(), .045, .26) : 0;
    var fg = seg(hb.bottom + GEO - A.y, 0, GEO);
    var f = Math.max(fr, fg);
    if (f <= 0) { set('off'); return; }
    if (f >= 1) { set('on'); return; }
    set('fly');
    // התיבה הקטנה בהדר נמתחת לגודל של החותמת בפתיחה, ובמעוף חוזרת לגודל שלה: גודל = A.w * s, מיקום = B + הזזה
    var B = slot.getBoundingClientRect(), e = ease(f), s = 1 + (B.width / A.w - 1) * e;
    im.style.width = A.w + 'px'; im.style.height = A.h + 'px';
    im.style.transform = 'translate(' + ((A.x - B.left) * (1 - e)).toFixed(1) + 'px,' + ((A.y - B.top) * (1 - e)).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    // ההדר מתכווץ באנימציה (102 ל-72): עוד שני פריימים מאוחרים כדי שהנחיתה תתיישר גם כשהגלילה נעצרת באמצע
    clearTimeout(tl); tl = setTimeout(go, 160); setTimeout(go, 460);
  }
  function go() { if (!raf) raf = requestAnimationFrame(frame); }
  // נרשם אחרי hero-open.js, כך שבכל פריים ההתקדמות של המסילה כבר מעודכנת כשהמעוף נמדד
  addEventListener('scroll', go, { passive: true });
  var rt = 0;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { measure(); st = '?'; go(); }, 180); });
  if (rm.addEventListener) rm.addEventListener('change', function () { st = '?'; go(); });
  new MutationObserver(function () { st = '?'; go(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
  addEventListener('load', function () { measure(); go(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); go(); });
  measure(); go();
})();

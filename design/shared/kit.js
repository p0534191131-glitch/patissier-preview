/* kit.js: כלי עזר משותפים לחמש הווריאציות. לא לערוך.
   1. .logo[data-tone="gold|cream|ink"]  -> הלוגו האמיתי (patissier בכתב יד), בלי השורה הישנה מתחתיו
   2. [data-d="domeChoc"]                -> <img> של קינוח מהאתר (מתוך desserts.js: window.D, window.DN)
   3. .kin                               -> הופך מילים ל-span.kw עם --i, ומוסיף class="go" ל-html אחרי טעינה
   4. ?still בכתובת                      -> מדלג על אנימציות כניסה (html.still), לצילומי בדיקה */
(function () {
  var q = location.search;
  if (/(^|[?&])still(=|&|$)/.test(q)) document.documentElement.classList.add('still');

  function logo(el) {
    var tone = el.getAttribute('data-tone') || 'gold';
    var id = 'lg' + Math.random().toString(36).slice(2, 7);
    var fill = tone === 'gold' ? 'url(#' + id + 'g)' : tone === 'cream' ? '#F2E3C6' : '#3F1E0E';
    el.innerHTML =
      '<svg viewBox="0 0 1376 500" role="img" aria-label="patissier"><defs>' +
      '<linearGradient id="' + id + 'g" x1="0" x2="1"><stop offset="0" stop-color="#8A6220"/><stop offset=".35" stop-color="#F7E3A3"/><stop offset=".6" stop-color="#C9A04A"/><stop offset="1" stop-color="#8A6220"/></linearGradient>' +
      '<mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="0" y="0" width="1376" height="768"><image href="media/img/logo-mask.png" width="1376" height="768"/><rect x="200" y="480" width="1176" height="288" fill="black"/></mask>' +
      '</defs><rect width="1376" height="768" fill="' + fill + '" mask="url(#' + id + 'm)"/></svg>';
  }

  function words(el) {
    if (el.__kin) return; el.__kin = 1;
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'kw'; s.style.setProperty('--i', i++); s.textContent = w; frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !/^(BR|SVG|IMG)$/i.test(n.tagName)) { walk(n); }
      });
    })(el);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.logo'), logo);
    Array.prototype.forEach.call(document.querySelectorAll('.kin'), words);
    Array.prototype.forEach.call(document.querySelectorAll('[data-d]'), function (el) {
      var k = el.getAttribute('data-d'); var url = window.D && window.D[k];
      if (!url) return;
      if (el.tagName === 'IMG') { el.src = url; if (!el.alt) el.alt = (window.DN && window.DN[k]) || ''; }
      else el.style.backgroundImage = 'url("' + url + '")';
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.add('go'); }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

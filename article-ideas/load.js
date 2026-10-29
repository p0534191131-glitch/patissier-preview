/* load.js: חמישה רעיונות לעמוד המאמר (זמני). article.html?idea=1..5
   ה-CSS של הרעיון נטען כבר ב-head (עם class="idea-N" על html). כאן נטען ה-JS שלו, ואחריו הבורר בראש העמוד. */
(function () {
  'use strict';
  var n = window.AR_IDEA; if (!n) return;
  var s = document.createElement('script'); s.src = 'article-ideas/i' + n + '.js'; document.body.appendChild(s);
  var NAMES = ['ההזמנה', 'המגזין', 'הקולנוע', 'מחברת המטבח', 'הבר נחשף'];
  var nav = document.createElement('nav');
  nav.className = 'ai-pick'; nav.setAttribute('aria-label', 'רעיונות לעמוד המאמר');
  nav.innerHTML = '<span>רעיון</span>' + NAMES.map(function (t, i) { var k = i + 1; return '<a href="?idea=' + k + '" title="' + t + '"' + (k === n ? ' aria-current="true"' : '') + '>' + k + '</a>'; }).join('');
  document.body.appendChild(nav);
  var st = document.createElement('style');
  st.textContent = '.ai-pick{position:fixed;top:116px;left:50%;z-index:95;transform:translateX(-50%);display:flex;align-items:center;gap:4px;padding:5px;border-radius:999px;background:linear-gradient(180deg,#6A381D,#55291A);box-shadow:0 0 0 1px rgba(201,160,74,.6),0 14px 26px -12px rgba(20,6,2,.7);font-family:var(--font)}' +
    '.ai-pick span{padding:0 12px 0 8px;font:500 15px/1 var(--font);color:#EBDCC0}' +
    '.ai-pick a{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;font:700 16px/1 var(--font);color:#F2E3C6;text-decoration:none}' +
    '.ai-pick a[aria-current]{color:#3F1E0E;background:linear-gradient(180deg,#F3DA98,#C9A04A);box-shadow:0 0 0 1px #8C6430}' +
    '@media (max-width:820px){.ai-pick{top:74px}}';
  document.head.appendChild(st);
})();

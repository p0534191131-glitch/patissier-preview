/* article-live.js: בונה את עמוד המאמר מתוך מאמר אמיתי של האתר החי (live-articles.js), לפי article.html?a=<slug>.
   רץ לפני blog.js ו-article.js, כדי שהם ימשיכו כרגיל (חשיפה בגלילה, תוכן עניינים, זמן קריאה, שיתוף, עוד מאמרים).
   בלי ?a= העמוד נשאר המאמר לדוגמה המקורי. */
(function () {
  'use strict';
  var L = window.PAT_LIVE || {}, q = new URLSearchParams(location.search).get('a');
  var a = q && L[q];
  if (!a) return;
  window.AR_SLUG = q;
  document.documentElement.classList.add('ar-live');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var me = (window.PAT_ARTICLES || []).filter(function (x) { return x.slug === q; })[0] || { tag: 'מדריך' };

  /* ---------- כותרת וחיפוש ---------- */
  document.title = (a.meta_title || a.title) + ' · פטיסייר';
  var md = $('meta[name="description"]'); if (md && a.meta_description) md.setAttribute('content', a.meta_description);

  /* ---------- הכותרת: חלק כללי ("המדריך המלא") עולה לתווית, ושתי המילים האחרונות בזהב תלת ממדי ---------- */
  var t = a.title.replace(/\s*\|\s*/g, ': ').trim(), label = me.tag, head = t;
  var m = /^(.+?[:?])\s+(.+)$/.exec(t);
  if (m) {
    var p1 = m[1].replace(/:$/, ''), p2 = m[2];
    if (/^(המדריך|סודות|טיפים)/.test(p1)) { label = p1; head = p2; }
    else if (/^(המדריך|טיפים)/.test(p2) || p2.split(' ').length <= 3) { head = p1; label = p2; }
    else head = p1;
  }
  var w = head.split(' '), gold = w.splice(-Math.min(2, w.length - 1)).join(' ');
  var h1 = $('.ar-h1');
  h1.innerHTML = '<span class="ar-l1">' + esc(w.join(' ')) + '</span> <span class="ar-l2 g3d" data-t="' + esc(gold) + '"><span>' + esc(gold) + '</span></span>';
  $('.ar-hin > .label').textContent = label;
  $('.ar-crumbs [aria-current]').textContent = me.tag;
  $('.ar-lead').textContent = a.excerpt || '';

  /* ---------- הצילום הראשי ---------- */
  var img = $('.ar-print img');
  img.src = a.img; img.alt = a.alt || a.title;

  /* ---------- גוף המאמר: כל h2 הוא חלק ממוספר; "שאלות נפוצות" נהיה אקורדיון ---------- */
  var src = document.createElement('div');
  src.innerHTML = a.html;
  src.querySelectorAll('[style]').forEach(function (e) { e.removeAttribute('style'); });
  src.querySelectorAll('a[href^="/blog/"]').forEach(function (e) {
    e.setAttribute('href', 'article.html?a=' + e.getAttribute('href').slice(6));
  });
  src.querySelectorAll('strong').forEach(function (e) { var b = document.createElement('b'); b.innerHTML = e.innerHTML; e.replaceWith(b); });

  var secs = [], cur = null;
  Array.prototype.slice.call(src.childNodes).forEach(function (n) {
    if (n.nodeType === 3 && !n.textContent.trim()) return;
    if (n.nodeName === 'H2') { cur = { h: n.textContent.trim(), nodes: [] }; secs.push(cur); return; }
    if (!cur) { cur = { h: '', nodes: [] }; secs.push(cur); }
    cur.nodes.push(n);
  });

  var art = $('#ar-art'), share = $('.ar-share', art);
  art.querySelectorAll('.ar-intro, .ar-sec').forEach(function (e) { e.remove(); });
  var toc = [], quoted = false, idx = 0;

  secs.forEach(function (s) {
    var faq = /שאלות נפוצות/.test(s.h);
    idx++;
    var id = faq ? 'faq' : 's' + idx;
    var sec = document.createElement('section');
    sec.className = 'ar-sec' + (faq ? ' ar-faq' : '');
    sec.id = id;
    sec.setAttribute('aria-labelledby', id + '-h');
    sec.innerHTML = '<span class="ar-n" aria-hidden="true">' + (faq ? 'לסיום' : String(idx).padStart(2, '0')) + '</span>' +
      '<h2 id="' + id + '-h" tabindex="-1">' + esc(s.h) + '</h2>';
    toc.push({ id: id, h: faq ? 'שאלות נפוצות' : s.h });

    if (faq) {
      /* כל h3 + התשובה שאחריו = כרטיס שנפתח */
      var box = document.createElement('div'); box.className = 'ar-qa';
      var d = null;
      s.nodes.forEach(function (n) {
        if (n.nodeName === 'H3') {
          d = document.createElement('details'); d.className = 'ar-q rv';
          d.innerHTML = '<summary><span>' + esc(n.textContent) + '</span><i class="ar-plus" aria-hidden="true"></i></summary><div class="ar-qb"></div>';
          box.appendChild(d);
        } else if (d) $('.ar-qb', d).appendChild(n);
      });
      if (box.firstChild) box.firstChild.open = true;
      sec.appendChild(box);
    } else {
      for (var i = 0; i < s.nodes.length; i++) {
        var n = s.nodes[i];
        if (n.nodeName === 'IMG') {
          /* תמונה בתוך המאמר: הדפסה עם מסגרת, והשורה הנטויה שאחריה היא הכיתוב */
          var cap = s.nodes[i + 1], capT = '';
          if (cap && cap.nodeName === 'P' && cap.children.length === 1 && cap.firstElementChild.nodeName === 'EM') { capT = cap.textContent; i++; }
          var fig = document.createElement('figure'); fig.className = 'ar-pic rv';
          fig.innerHTML = '<div class="print"><div class="ph"><img src="' + esc(n.getAttribute('src')) + '" alt="' + esc(n.getAttribute('alt')) + '" loading="lazy" decoding="async"></div></div>' +
            (capT ? '<figcaption>' + esc(capT) + '</figcaption>' : '');
          sec.appendChild(fig);
        } else if (n.nodeName === 'TABLE') {
          var tw = document.createElement('div'); tw.className = 'ar-table sheet rv'; tw.tabIndex = 0;
          tw.setAttribute('role', 'region'); tw.setAttribute('aria-label', 'טבלת השוואה');
          tw.appendChild(n); sec.appendChild(tw);
        } else if (n.nodeName === 'OL' || n.nodeName === 'UL') {
          n.classList.add(n.nodeName === 'OL' ? 'ar-steps' : 'ar-dots'); sec.appendChild(n);
        } else sec.appendChild(n);
      }
      /* ציטוט אחד באמצע המאמר: המשפט המודגש הראשון בחלק השני */
      if (!quoted && idx === 2) {
        var b = $('p b', sec);
        if (b) {
          quoted = true;
          var fq = document.createElement('figure'); fq.className = 'ar-quote rv';
          fq.innerHTML = '<span class="ar-qm" aria-hidden="true">״</span><blockquote><p>' + esc(b.textContent.replace(/[.\s]+$/, '')) + '.</p></blockquote>';
          var ps = sec.querySelectorAll(':scope > p');
          (ps[1] || ps[0]).after(fq);
        }
      }
    }
    art.insertBefore(sec, share);
  });

  /* ---------- סוף המאמר: הזמנה רכה להצעת מחיר ---------- */
  var end = document.createElement('div');
  end.className = 'ar-end sheet rv';
  end.innerHTML = '<span class="seal"></span><p class="ar-ready-h">רוצה בר כזה לשמחה שלך?</p>' +
    '<p class="ar-ready-p">ספרי לנו על השמחה, ובסוף תקבלי הצעת מחיר מסודרת לפי מספר האורחים.</p>' +
    '<a class="btn btn-main" href="index.html#bot">לקבל הצעת מחיר</a>';
  art.insertBefore(end, share);
  $('.ar-share-t').textContent = 'יש לך חברה שמתכננת שמחה? אפשר לשלוח לה את המאמר.';

  /* ---------- תוכן העניינים ושורת הפרטים ---------- */
  $('#ar-toc-l').innerHTML = toc.map(function (x) { return '<li><a href="#' + x.id + '">' + esc(x.h) + '</a></li>'; }).join('');
  var last = $('.ar-meta .ar-mi:last-child');
  if (last) {
    var dt = new Date(a.date + 'T12:00:00');
    last.textContent = 'עודכן ' + dt.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
  }
})();

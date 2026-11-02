/* contact-panel.js: "יצירת קשר" בהדר נפתח כחלון במקום, והעמוד לא נגלל (2.11.2026, אפרים: "זה מריץ את האתר פחות אהבתי את זה").
   החלון נחשף בעיגול שגדל מתוך הקישור שנלחץ, עם קו זהב על הקצה, והתוכן נכנס בשכבות. בסגירה הכול מתכווץ חזרה לקישור.
   בדף הבית הכרטיס האמיתי של #contact עובר לחלון וחוזר בסגירה (עם מקום שמור), אז הטופס עובד בדיוק כמו קודם (site.js + cms.js).
   בעמודים בלי #contact (בלוג, מאמר, הכשר) נבנה אותו כרטיס עם אותם מזהים, והבדיקה והשמירה כאן.
   חייב להיטען לפני cms.js, כדי שהמערכת תעדכן גם כאן את הטלפון, הוואטסאפ והכותרות. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var STILL = /(^|[?&])still(=|&|$)/.test(location.search);
  var calm = function () { return STILL || root.classList.contains('a11y-still') || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var TRIG = '.hdr .nav a[href="#contact"],.hdr .nav a[href="index.html#contact"],#drawer a[href="#contact"],#drawer a[href="index.html#contact"]';
  var KEY = 'patissier-yoman-v1';
  var EASE_IN = 700, EASE_OUT = 520, SCALE = .985;

  function I(p, sw) { return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var IC = {
    phone: I('<path d="M5 4.5h3.5l1.7 4.2-2.2 1.5a11 11 0 0 0 5.8 5.8l1.5-2.2 4.2 1.7V19a1.5 1.5 0 0 1-1.6 1.5C10.4 20 4 13.6 3.5 6.1A1.5 1.5 0 0 1 5 4.5z"/>'),
    chat: I('<path d="M12 3.8a8.2 8.2 0 0 0-7.1 12.3L4 20l4-1a8.2 8.2 0 1 0 4-15.2z"/><path d="M8.6 10.6h6.8M8.6 13.6h4.4"/>'),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>', 1.9),
    lock: I('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>')
  };

  /* ---------- החלון ---------- */
  var home = $('#contact .ct-card');
  var cp = d.createElement('div');
  cp.className = 'cp'; cp.id = 'cp'; cp.hidden = true;
  cp.innerHTML = '<div class="cp-bg"></div>' +
    '<div class="cp-win" role="dialog" aria-modal="true" aria-labelledby="cp-t" tabindex="-1">' +
      '<i class="cp-rim" aria-hidden="true"></i>' +   /* שכבת הזהב: מציצה רק על קצה העיגול */
      '<div class="cp-face choc on-choc">' +
        '<button class="cp-x" type="button" aria-label="סגירה">' + IC.close + '</button>' +
        '<div class="cp-body"><h2 class="cp-t" id="cp-t">יצירת קשר</h2>' +
          '<div class="cp-grid"><div class="cp-slot"></div><div class="ct-alt cp-alt"></div></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  d.body.appendChild(cp);
  var win = $('.cp-win', cp), slot = $('.cp-slot', cp), alt = $('.cp-alt', cp), xb = $('.cp-x', cp);

  /* בעמודים בלי #contact: אותו כרטיס בדיוק, עם אותם מזהים (אין כפילות, כי אין שם טופס אחר) */
  if (!home) {
    slot.innerHTML = '<div class="ct-card sheet lt"><span class="label gold">יצירת קשר</span>' +
      '<form class="ct-form" id="ctf" novalidate><h3>נשמח לשמוע ממך.</h3>' +
        '<div class="ct-row">' +
          '<div class="fld"><label for="cf-n">שם</label><input id="cf-n" name="name" aria-describedby="cf-ne" autocomplete="name" placeholder="השם שלך"><small class="err" id="cf-ne"></small></div>' +
          '<div class="fld"><label for="cf-p">טלפון</label><input id="cf-p" name="phone" aria-describedby="cf-pe" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="050-0000000"><small class="err" id="cf-pe"></small></div>' +
        '</div>' +
        '<div class="fld"><label for="cf-d">תאריך האירוע</label><input id="cf-d" name="date" placeholder="עברי או לועזי, גם בערך"></div>' +
        '<div class="fld"><label for="cf-m">כמה מילים</label><textarea id="cf-m" name="msg" rows="2" placeholder="על השמחה, על מספר האורחים, על מה שחשוב לך"></textarea></div>' +
        '<div class="ct-send"><button class="btn btn-main" type="submit">לשלוח</button><p class="ct-priv">' + IC.lock + 'הפרטים נשארים אצלנו, ורק אנחנו חוזרים אלייך.</p></div>' +
      '</form>' +
      '<div class="ct-ok" id="ctok" hidden tabindex="-1"><span class="seal" data-logo><span class="logo" data-tone="ink"></span></span><h3>קיבלנו, נחזור אלייך.</h3></div></div>';
    alt.innerHTML = '<h3>או בדרך שנוחה לך</h3>' +
      '<a class="ct-tel" href="tel:0504157281" aria-label="להתקשר 050-415-7281">' + IC.phone + '<b class="ltr">050-415-7281</b></a>' +
      '<a class="btn btn-line" href="https://wa.me/972504157281" target="_blank" rel="noopener">' + IC.chat + 'לכתוב בוואטסאפ</a>';
    wire();
  }

  /* הבדיקה וההודעה, כמו ב-site.js (שם זה רץ רק בדף הבית) */
  function wire() {
    var f = $('#ctf', cp), ok = $('#ctok', cp), n = $('#cf-n', cp), p = $('#cf-p', cp);
    function check(inp, err, good, msg) {
      inp.closest('.fld').classList.toggle('bad', !good);
      inp.setAttribute('aria-invalid', good ? 'false' : 'true');
      err.textContent = good ? '' : msg;
      return good;
    }
    var vn = function () { return check(n, $('#cf-ne', cp), n.value.trim().length > 1, 'חסר שם'); };
    var vp = function () { return check(p, $('#cf-pe', cp), p.value.replace(/\D/g, '').length >= 9, 'חסר מספר טלפון'); };
    n.addEventListener('input', function () { if (n.closest('.bad')) vn(); });
    p.addEventListener('input', function () { if (p.closest('.bad')) vp(); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = vn(), b = vp();
      if (!a) { n.focus(); return; }
      if (!b) { p.focus(); return; }
      ok.style.minHeight = f.offsetHeight + 'px';
      f.hidden = true; ok.hidden = false; ok.focus({ preventScroll: true });
      saveLead();
    });
  }
  /* הפנייה נכנסת לאותו מקום שהמערכת קוראת ממנו, כמו ב-cms.js בדף הבית. לא נשלח שום דבר החוצה */
  function saveLead() {
    var framed = false; try { framed = window.top !== window; } catch (e) { framed = true; }
    if (framed || STILL) return;
    var v = function (id) { var el = d.getElementById(id); return el ? el.value.trim() : ''; };
    var when = v('cf-d'), msg = v('cf-m'), t = new Date().toISOString().slice(0, 10);
    var lead = { id: 'l-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: v('cf-n'), phone: v('cf-p'), source: 'site', status: 'new', created: t, event: 'other', guests: 0, budget: 0, date: '', time: '', level: 1, type: 'pickup', area: '', colors: '', allergy: '', bar: null,
      notes: 'מהטופס באתר.' + (when ? ' תאריך האירוע: ' + when + '.' : '') + (msg ? ' ' + msg : '') };
    try {
      var S = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!S || !S.leads) return;
      S.leads.unshift(lead);
      var ss = S.siteStats, day = ss && ss.days && ss.days.filter(function (x) { return x.date === t; })[0];
      if (day) day.signups = (day.signups || 0) + 1;
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) { }
  }
  /* הכותרת של הדרכים האחרות מהמערכת (בדף הבית היא כבר מעודכנת בכרטיס עצמו) */
  function altTitle() {
    try {
      var D = window.PatCMS && PatCMS.data(), s = D && (D.site || []).filter(function (x) { return x.id === 'contact'; })[0];
      var t = s && s.fields && s.fields.alt, h = $('h3', alt); if (t && h) h.textContent = t;
    } catch (e) { }
  }

  /* ---------- פתיחה וסגירה ---------- */
  var open = false, trig = null, ph = null, timer = 0, doneT = 0, inerted = [];

  function center(el) {
    var r = el && el.getBoundingClientRect();
    if (!r || !r.width || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  /* מאיפה החשיפה מתחילה: הקישור עצמו, ואם הוא נסגר עם המגירה, כפתור התפריט */
  function originOf(t) {
    var inDrawer = t && t.closest('#drawer');
    return (!inDrawer && center(t)) || center($('#mbtn')) || { x: innerWidth / 2, y: 40 };
  }
  /* נקודה במסך -> נקודה בתוך החלון (לפני ה-scale), ורדיוס שמכסה את כל הפינות */
  function aim(o) {
    var r = win.getBoundingClientRect(), w = win.offsetWidth, h = win.offsetHeight, s = r.width / w || 1;
    var x = (o.x - (r.left + r.width / 2)) / s + w / 2, y = (o.y - (r.top + r.height / 2)) / s + h / 2;
    var R = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)) + 4;
    win.style.setProperty('--ox', x.toFixed(1) + 'px');
    win.style.setProperty('--oy', y.toFixed(1) + 'px');
    win.style.setProperty('--r', R.toFixed(1) + 'px');
  }
  /* קובעים את מרכז העיגול בלי מעבר, כדי שהעיגול וקו הזהב יגדלו (ויתכווצו) מאותה נקודה בדיוק */
  function setOrigin(o) {
    cp.classList.add('notr'); cp.classList.remove('done'); aim(o); void cp.offsetWidth;
    cp.classList.remove('notr'); void cp.offsetWidth;
  }
  function stagger(on) {
    var els = $$('.cp-x, .ct-card > .label, .ct-form > h3, .ct-form .fld, .ct-send, .cp-alt > *', cp);
    els.forEach(function (el, i) {
      if (on) { el.classList.add('cp-s'); el.style.setProperty('--i', i); }
      else { el.classList.remove('cp-s'); el.style.removeProperty('--i'); }
    });
  }
  /* נעילת הגלילה בלי overflow:hidden: ככה הרוחב, הסרגל וה-vw של הפתיחה לא משתנים, והנעיצות (sticky) נשארות במקום.
     גלגלת ומגע עוברים רק לגוף החלון כשיש בו מה לגלול, ואם משהו בכל זאת הזיז את העמוד (גרירת הסרגל) מחזירים מיד */
  var locked = false, lockX = 0, lockY = 0, ty = 0;
  function canScroll(el, dy) {
    var b = el && el.closest && el.closest('.cp-body');
    if (!b || b.scrollHeight <= b.clientHeight + 1) return false;
    return dy < 0 ? b.scrollTop > 0 : dy > 0 ? b.scrollTop + b.clientHeight < b.scrollHeight - 1 : true;
  }
  function onWheel(e) { if (!canScroll(e.target, e.deltaY)) e.preventDefault(); }
  function onTouchStart(e) { ty = e.touches[0].clientY; }
  function onTouchMove(e) { var y = e.touches[0].clientY, dy = ty - y; ty = y; if (e.touches.length > 1 || !canScroll(e.target, dy)) e.preventDefault(); }
  function onScroll() {
    if (!locked || (scrollX === lockX && scrollY === lockY)) return;
    var sb = root.style.scrollBehavior; root.style.scrollBehavior = 'auto';   /* בלי האנימציה של scroll-behavior:smooth */
    scrollTo(lockX, lockY); root.style.scrollBehavior = sb;
  }
  function lock(on) {
    var o = { passive: false, capture: true };
    if (on) {
      if (locked) return;
      locked = true; lockX = scrollX; lockY = scrollY;
      addEventListener('wheel', onWheel, o); addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
      addEventListener('touchmove', onTouchMove, o); addEventListener('scroll', onScroll, true);
    } else {
      if (!locked) return;
      locked = false;
      removeEventListener('wheel', onWheel, o); removeEventListener('touchstart', onTouchStart, { passive: true, capture: true });
      removeEventListener('touchmove', onTouchMove, o); removeEventListener('scroll', onScroll, true);
    }
    root.classList.toggle('cp-lock', on);
  }
  var SCROLL_KEYS = { ' ': 1, PageUp: -1, PageDown: 1, End: 1, Home: -1, ArrowUp: -1, ArrowDown: 1, Spacebar: 1 };

  function setInert(on) {
    if (on) {
      inerted = Array.prototype.filter.call(d.body.children, function (n) { return n !== cp && n.tagName !== 'SCRIPT' && !n.inert; });
      inerted.forEach(function (n) { n.inert = true; });
    } else { inerted.forEach(function (n) { n.inert = false; }); inerted = []; }
  }

  function show(t, o) {
    if (open) return;
    open = true; trig = t; clearTimeout(timer);
    if (home && home.parentNode !== slot) {
      /* מקום שמור בגובה הכרטיס, כדי שהעמוד מאחור לא יזוז במילימטר */
      ph = d.createElement('div'); ph.className = 'cp-ph'; ph.setAttribute('aria-hidden', 'true');
      ph.style.height = home.offsetHeight + 'px';
      home.parentNode.insertBefore(ph, home); slot.appendChild(home);
      alt.innerHTML = '';
      $$('#contact .ct-alt > *').forEach(function (n) {
        if (n.matches('a[href="#bot"]')) return;   /* הצעת מחיר גוללת לבוט, לא שייכת לחלון */
        var c = n.cloneNode(true); c.classList.remove('rv'); alt.appendChild(c);
      });
    } else if (!home) altTitle();
    stagger(true);
    lock(true);
    setInert(true);
    var still = calm();
    cp.classList.toggle('calm', still);
    cp.classList.remove('out', 'on');
    cp.hidden = false;
    setOrigin(o || originOf(t));
    cp.classList.add('on');
    clearTimeout(doneT);
    doneT = setTimeout(function () { if (open) cp.classList.add('done'); }, still ? 0 : EASE_IN + 40);   /* בסוף בלי חיתוך, שהצל יהיה שלם */
    setTimeout(function () { if (open) win.focus({ preventScroll: true }); }, still ? 0 : 160);
  }

  function hide() {
    if (!open) return;
    open = false; clearTimeout(doneT);
    var still = calm();
    if (!still) setOrigin(originOf(trig));
    cp.classList.remove('on'); cp.classList.add('out');
    timer = setTimeout(function () {
      cp.hidden = true; cp.classList.remove('out', 'done');
      stagger(false);
      if (home && ph) { ph.parentNode.insertBefore(home, ph); ph.remove(); ph = null; }
      setInert(false);
      lock(false);
      var back = trig && !trig.closest('#drawer') ? trig : $('#mbtn');
      if (back && back.offsetParent !== null) back.focus({ preventScroll: true });
    }, still ? 220 : EASE_OUT + 40);
  }

  /* לחיצה על "יצירת קשר" בהדר או במגירה: במקום לגלול, פותחים את החלון */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest(TRIG);
    if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();   /* בלי קפיצה ובלי שינוי בכתובת. המגירה עצמה נסגרת ב-site.js / blog.js */
    var o = a.closest('#drawer') ? null : center(a);
    if (a.closest('#drawer')) requestAnimationFrame(function () { show(a, null); });
    else show(a, o);
  }, true);

  xb.addEventListener('click', hide);
  $('.cp-bg', cp).addEventListener('click', hide);
  /* לחיצה על השוליים הריקים סביב החלון (מחוץ לו) */
  cp.addEventListener('click', function (e) { if (e.target === cp) hide(); });

  d.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); hide(); return; }
    /* מקשי גלילה לא מזיזים את העמוד מאחור (בשדות ובכפתורים הם עושים את שלהם) */
    if (SCROLL_KEYS[e.key] && !/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName) && !e.target.isContentEditable) {
      if (!canScroll(e.target === win ? $('.cp-body', cp) : e.target, SCROLL_KEYS[e.key])) e.preventDefault();
      return;
    }
    if (e.key !== 'Tab') return;
    /* מלכודת פוקוס: Tab נשאר בתוך החלון */
    var f = $$('a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])', win)
      .filter(function (el) { return el.offsetParent !== null && !el.closest('[hidden]'); });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1], cur = d.activeElement;
    if (e.shiftKey && (cur === first || cur === win)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (cur === last || !win.contains(cur))) { e.preventDefault(); first.focus(); }
  });

  window.PatContact = { open: function (o) { show(null, o || { x: innerWidth / 2, y: 40 }); }, close: hide, isOpen: function () { return open; } };
})();

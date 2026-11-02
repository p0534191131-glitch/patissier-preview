/* cms.js: החיבור בין האתר (site-v2) למערכת הניהול (design/admin/yoman). 26.10.2026.
   מקור אחד לשני הצדדים:
   - באתר: קורא את מה שפורסם במסך "עמודים ותוכן" (localStorage, מפתח patissier-yoman-pages-pub) ושם אותו בעמוד:
     טקסטים, חלקים מוסתרים, המלצות, ספר הגלריה (book3d.js קורא את PAT_BOOK), טלפון ווואטסאפ. סופר ביקורים ל"מי היה באתר",
     והטופס של "יצירת קשר" נכנס כפנייה חדשה במסך "פניות".
   - במערכת: pages.html טוען את הקובץ הזה בשביל רשימת החלקים והשדות (SECTIONS), ההעברה מהמבנה הישן (migrate),
     ובתצוגה המקדימה קורא ל-PatCMS.apply / PatCMS.target של האתר שבתוך המסגרת.
   ?draft בכתובת = מה שכתוב עכשיו במערכת, גם אם עוד לא פורסם (בשביל התצוגה המקדימה).
   אם המערכת עוד לא חוברה לאתר (S.settings.connections.site), האתר נשאר בדיוק כמו שהוא כתוב ב-HTML. */
(function () {
  'use strict';
  var KEY = 'patissier-yoman-v1', PK = 'patissier-yoman-pages-pub';

  /* ---------- החלקים של האתר והשדות שלהם. def = מה שכתוב היום באתר, מילה במילה ---------- */
  /* t: איך השדה נכנס לעמוד. text = טקסט רגיל · br = שורה חדשה בשדה = שורה חדשה באתר · btn = טקסט על כפתור (האייקון נשאר)
     gold = מילים בזהב תלת ממדי · lastEm = המילה האחרונה מודגשת · allEm = כל השורה מודגשת · word = "בלתי נשכח" שמתמלא בזהב */
  var SECTIONS = [
    { id: 'hero', name: 'מסך פתיחה', root: '#top', fixed: true, fields: [
      { k: 'top', l: 'השורה מעל', def: 'בר קינוחים לשמחה', s: '#top .h-la', t: 'br', lim: 30, rows: 2, r: 'השורה מעל המילים בזהב, באותו גודל כמוהן. במחשב היא עולה על התמונה.' },
      { k: 'gold', l: 'המילים בזהב', def: 'בלתי נשכחת', s: '#top .h-gold', t: 'gold', lim: 16, r: 'המילים הגדולות בזהב. עדיף שתיים, קצרות.' },
      { k: 'sub', l: 'משפט משנה', def: 'לבן שלך זה פעם בחיים\nועל פעם בחיים לא מתפשרים.', s: '#top .h-sub', t: 'br', lim: 80, rows: 2, r: 'שורה חדשה כאן = שורה חדשה באתר.' },
      { k: 'cta', l: 'כפתור', def: 'לקבל הצעת מחיר', s: '#top .h-cta .btn-g', lim: 22, r: 'מה כתוב על כפתור הזהב.' }] },
    /* הטקסט של הסיפור (#storyTxt) עובר בגלילה לשכבה שעל הצילום של מסך הפתיחה (hero-open.js), ולכן הוא נמצא לפי ה-id שלו ולא לפי #story.
       also = עוד אלמנט שמוסתר יחד עם החלק */
    { id: 'story', name: 'הסיפור שלנו', root: '#story', also: '#storyTxt', fields: [
      { k: 'label', l: 'תווית', def: 'הסיפור שלנו', s: '#storyTxt .label', lim: 24 },
      { k: 't1', l: 'כותרת, שורה 1', def: 'יש חלומות', s: '#storyTxt h2 .ln:nth-child(1)', lim: 30 },
      { k: 't2', l: 'כותרת, שורה 2', def: 'שיש להם טעם.', s: '#storyTxt h2 .ln:nth-child(2)', t: 'lastEm', lim: 30, r: 'המילה האחרונה יוצאת מודגשת.' },
      { k: 'text', l: 'הסיפור', def: 'הכול התחיל מנפש אומנית שחלמה אסתטיקה וראתה בכל קינוח יצירה. היום בפטיסייר אנחנו הופכים את החלומות האלה לברים של השמחות, בשילוב נדיר של מראה וואו וטעם איכותי ומפנק. וכל הטוב הזה בכשרות המהודרת של הרב לנדא.', s: '#storyTxt > p', lim: 400, rows: 6, r: 'הסיפור שלך, בפסקה אחת.' }] },
    { id: 'process', name: 'התהליך', root: '#process', fields: [
      { k: 'label', l: 'תווית', def: 'התהליך', s: '#process .head .label', lim: 24 },
      { k: 't1', l: 'כותרת, שורה 1', def: 'מהשיחה הראשונה', s: '#process .head h2 .ln:nth-child(1)', lim: 30 },
      { k: 't2', l: 'כותרת, שורה 2', def: 'ועד השמחה.', s: '#process .head h2 .ln:nth-child(2)', t: 'allEm', lim: 30, r: 'השורה הזו יוצאת מודגשת.' },
      { k: 's1', l: 'שלב 1', def: 'מספרים לנו על השמחה.', s: '#steps > li:nth-child(1) h3', lim: 40 },
      { k: 's1p', l: 'שלב 1, הסבר', def: 'שיחה קצרה, בלי טפסים.', s: '#steps > li:nth-child(1) > p', lim: 70 },
      { k: 's2', l: 'שלב 2', def: 'מקבלים הצעת מחיר.', s: '#steps > li:nth-child(2) h3', lim: 40 },
      { k: 's2p', l: 'שלב 2, הסבר', def: 'לפי מספר האורחים, לפני שמחליטים. בלי הפתעות.', s: '#steps > li:nth-child(2) > p', lim: 70 },
      { k: 'fin', l: 'שלב 3, הסיום', def: 'ולכם נשאר רק לארח בשמחה.', s: '#steps > li:nth-child(3) h3', t: 'lastEm', lim: 40, r: 'המילה האחרונה יוצאת בזהב.' }] },
    { id: 'bot', name: 'הצעת מחיר', root: '#bot', fixed: true, fields: [
      { k: 'label', l: 'תווית', def: 'הצעת מחיר', s: '#bot .qt-t .label', lim: 24 },
      { k: 't1', l: 'כותרת', def: 'ספרי לנו על השמחה.', s: '#bot .qt-t h2 .ln:nth-child(1)', lim: 34 },
      { k: 'text', l: 'פסקה', def: 'יש לך מספיק החלטות על הראש. שיחה קצרה בטלפון, בלי טפסים ובלי לחכות שיחזרו אלייך, ובסוף הצעת מחיר מדויקת.', s: '#bot .qt-p p:not(.priv)', lim: 220, rows: 3, r: 'למה לדבר עם הבוט ולא למלא טופס.' },
      { k: 'priv', l: 'שורת הפרטיות', def: 'הפרטים נשארים אצלנו, ורק אנחנו חוזרים אלייך.', s: '#bot .qt-p .priv', t: 'btn', lim: 60 }] },
    { id: 'gallery', name: 'גלריה', root: '#gallery', fields: [
      { k: 'label', l: 'תווית', def: 'גלריה', s: '#gallery .head .label', lim: 24 },
      { k: 'title', l: 'כותרת', def: 'ככה זה נראה.', s: '#gallery .head h2', lim: 50 },
      { k: 'text', l: 'משפט משנה', def: 'התמונות כאן הן של ברים אמיתיים שבנינו. לחיצה על תמונה מגדילה אותה.', s: '#gallery .head p', lim: 120, rows: 2, r: 'הברים עצמם בלשונית "ספר הגלריה".' }] },
    { id: 'stories', name: 'סיפורי הצלחה', root: '#stories', fields: [
      { k: 'label', l: 'תווית', def: 'סיפורי הצלחה', s: '#stories .head .label', lim: 24 },
      { k: 'title', l: 'כותרת', def: 'מה לקוחות מספרים.', s: '#stories .head h2', lim: 40, r: 'ההמלצות עצמן בלשונית "המלצות".' }] },
    /* 2.11.2026: חלק חדש אחרי סיפורי ההצלחה. השאלות עצמן מגיעות מהלשונית "שאלות נפוצות" (faqItem למטה) */
    { id: 'faq', name: 'שאלות נפוצות', root: '#faq', fields: [
      { k: 'label', l: 'תווית', def: 'שאלות נפוצות', s: '#faq .head .label', lim: 24 },
      { k: 'title', l: 'כותרת', def: 'מה שואלים אותנו.', s: '#faq .head h2', lim: 40, r: 'השאלות עצמן בלשונית "שאלות נפוצות".' }] },
    { id: 'blog', name: 'בלוג', root: '#blog', fields: [
      { k: 'label', l: 'תווית', def: 'בלוג ותוכן', s: '#blog .bl-head .label', lim: 24 },
      { k: 'title', l: 'כותרת', def: 'לקרוא לפני שמחליטים.', s: '#blog .bl-head h2', t: 'lastEm', lim: 40, r: 'המילה האחרונה יוצאת מודגשת. המאמרים עצמם במסך "מאמרים".' },
      { k: 'btn', l: 'כפתור', def: 'לכל המאמרים', s: '#blog .bl-head .btn', t: 'btn', lim: 22 }] },
    { id: 'contact', name: 'יצירת קשר', root: '#contact', fields: [
      { k: 'pre', l: 'המשפט מעל', def: 'לבן שלך זה פעם בחיים\nועל פעם בחיים לא מתפשרים.', s: '#contact .pre', t: 'br', lim: 80, rows: 2, r: 'שורה חדשה כאן = שורה חדשה באתר.' },
      { k: 'word', l: 'המילים שמתמלאות בזהב', def: 'בלתי נשכח', s: '#word', t: 'word', lim: 14 },
      { k: 'label', l: 'תווית', def: 'יצירת קשר', s: '#contact .ct-card .label', lim: 24 },
      { k: 'form', l: 'כותרת הטופס', def: 'נשמח לשמוע ממך.', s: '#ctf h3', lim: 34 },
      { k: 'ok', l: 'אחרי ששולחים', def: 'קיבלנו, נחזור אלייך.', s: '#ctok h3', lim: 34, r: 'מה רואים אחרי שליחת הטופס. הפנייה נכנסת למסך "פניות".' },
      { k: 'alt', l: 'כותרת הדרכים האחרות', def: 'או בדרך שנוחה לך', s: '#contact .ct-alt h3', lim: 34 }] }
  ];
  /* שלוש ההמלצות שכתובות היום באתר */
  var SITE_TM = [
    { id: 'tm-s1', name: 'מנחם', text: 'לא האמנתי עד שבאתי לראות את הבר. מעבר לכל דמיון. כל אורח נדהם.', visible: true },
    { id: 'tm-s2', name: 'שירה', text: 'מהרגע הראשון הרגשנו שאנחנו בידיים הכי טובות. התוצאה הייתה מדהימה.', visible: true },
    { id: 'tm-s3', name: 'רחל', text: 'מקצועיות ברמה הגבוהה ביותר. הבר היה הדבר הכי מדובר באירוע.', visible: true }];
  /* ספר הגלריה: ארבעת הברים כמו שהם ב-book3d.js */
  var BOOK_BARS = [{"id":"b1","visible":true,"title":"שמנת, שוקולד וזהב","when":"מאי 2026","see":"עוגת טפטוף שוקולד עם אוראו על רגל קריסטל, כיפות שוקולד מבריקות, כוסות מוס בשכבות, ארטיקים ומקרונים, ליד מנורה מוזהבת ופרחים לבנים.","story":"שמנת, שוקולד וזהב חוזרים לאורך כל השולחן, כדי שהכול ירגיש כמו יצירה אחת. ורגע לפני שהדלתות נפתחות, עוד סיבוב אחרון: מיישרים כיפה, מזיזים פרח, ונושמים.","lead":{"f":"IMG_6525","lg":1,"fx":0.42},"more":[{"f":"IMG_6509","lg":1,"fx":0.5,"mx":0.2},{"f":"IMG_6543","fx":0.5,"mx":0.58}]},{"id":"b2","visible":true,"title":"צבע על שחור","when":"מאי 2026","see":"מפה שחורה, ועליה שורות של בקבוקונים בצהוב, בוורוד ובלילך, מקרונים על מגש זהב, נשיקות שוקולד וגלילי ופל, בין שתי מנורות בד לבנות וזרי גיבסנית.","story":"על שחור עמוק כל צבע קופץ: צהוב, ורוד ולילך. כל שורה של בקבוקונים מסודרת ביד, אחד אחד, עד שהשולחן נראה כמו קופסת צבעים פתוחה.","lead":{"f":"IMG_6922","fx":0.5},"more":[{"f":"IMG_6944","fx":0.5,"mx":0.52}]},{"id":"b3","visible":true,"title":"ורוד, זהב ופרפר","when":"אוגוסט 2026","see":"עוגה לבנה עם פרחים ורודים ופרפר על רגל זהב, עוגיות שוקולד, כיפות ורודות עם סוכריית פסים, נשיקות בגביעי זהב ושורות ארוכות של קינוחים אישיים, על רקע שיש.","story":"פרפר אחד על העוגה, וכל השולחן כאילו ממריא איתו: ורוד, זהב ושורות שנמשכות עד הקצה. אנחנו אוהבים את הרגע שבו מישהו מתקרב ומגלה שגם הקינוח הכי קטן קיבל תשומת לב.","lead":{"f":"IMG_8429","fx":0.36},"more":[{"f":"IMG_8395","fx":0.5,"mx":0.3}]},{"id":"b4","visible":true,"title":"מדפים לבנים ונרות זהב","when":"אוגוסט 2026","see":"מדפים לבנים במדרגות עם פרחים, פמוטי זהב גבוהים, מדרגות זכוכית עם כוסות בשכבות וארטיקים קטנים, מקרונים, טארטלטים ועוגת שוקולד עם עיגולי זהב.","story":"כאן בנינו לגובה: מדפים, פמוטים ומדרגות זכוכית, כדי שהעין תטפס מהשולחן ועד הפרחים. וכשהנרות דלקו והכול עמד במקומו, ידענו שאפשר להתחיל לשמוח.","lead":{"f":"IMG_9027","lg":1,"fx":0.52},"more":[{"f":"IMG_9008","fx":0.5,"mx":0.5},{"f":"IMG_8984","fx":0.5,"mx":0.3}]}];

  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var byId = function (a, id) { for (var i = 0; i < (a || []).length; i++) if (a[i].id === id) return a[i]; return null; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function sec(id) { return byId(SECTIONS, id); }
  function field(sid, k) { var s = sec(sid); return s ? s.fields.filter(function (f) { return f.k === k; })[0] : null; }
  function isNew(site) { return !!(site && byId(site, 'story') && byId(site, 'process')); }
  function defaults() { return SECTIONS.map(function (s) { var f = {}; s.fields.forEach(function (x) { f[x.k] = x.def; }); return { id: s.id, name: s.name, visible: true, fields: f }; }); }

  /* ---------- במערכת: מהמבנה של האתר הישן למבנה של האתר החדש ---------- */
  function migrate(S) {
    var did = false;
    if (!isNew(S.site)) { S.siteOld = S.site; S.site = defaults(); did = true; }
    else {
      S.site.forEach(function (s) { var d = sec(s.id); if (d) d.fields.forEach(function (x) { if (s.fields[x.k] == null) { s.fields[x.k] = x.def; did = true; } }); });
      /* חלק חדש באתר (למשל "שאלות נפוצות", 2.11.2026) נכנס לרשימה במקום שלו, אחרי החלק שלפניו */
      SECTIONS.forEach(function (d, i) {
        if (byId(S.site, d.id)) return;
        var f = {}; d.fields.forEach(function (x) { f[x.k] = x.def; });
        var prev = i ? byId(S.site, SECTIONS[i - 1].id) : null;
        S.site.splice(prev ? S.site.indexOf(prev) + 1 : 0, 0, { id: d.id, name: d.name, visible: true, fields: f }); did = true;
      });
    }
    if (!S.testimonials) S.testimonials = [];
    if (!S.tmSite) { SITE_TM.slice().reverse().forEach(function (t) { if (!byId(S.testimonials, t.id)) S.testimonials.unshift(clone(t)); }); S.tmSite = true; did = true; }
    if (!S.book || !Array.isArray(S.book.bars)) { S.book = { bars: clone(BOOK_BARS) }; did = true; }
    S.settings.connections = S.settings.connections || {};
    if (!S.settings.connections.site) { S.settings.connections.site = true; did = true; }
    return did;
  }
  function snapOf(S) { return { site: S.site, faqs: S.faqs, testimonials: S.testimonials, gallery: S.gallery, book: S.book, areas: S.areas, biz: { business: S.settings.business, phone: S.settings.phone, wa: S.settings.wa } }; }

  /* ---------- הנתונים שהאתר מציג ---------- */
  function read(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function data() {
    var S = read(KEY); if (!S || !S.settings) return null;
    var draft = /(^|[?&])draft(=|&|$)/.test(location.search);
    if (draft) return isNew(S.site) ? snapOf(S) : null;
    if (!(S.settings.connections && S.settings.connections.site)) return null;
    var P = read(PK), snap = P && P.snap;
    return snap && isNew(snap.site) ? snap : null;
  }

  /* ---------- לשים את הנתונים בעמוד ---------- */
  function setBtn(el, v) {
    var tn = null; for (var i = 0; i < el.childNodes.length; i++) if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim()) { tn = el.childNodes[i]; break; }
    if (tn) tn.textContent = v; else el.appendChild(document.createTextNode(v));
  }
  function put(el, f, v) {
    v = String(v == null ? '' : v);
    var t = f.t || 'text';
    if (t === 'br') el.innerHTML = esc(v).replace(/\n/g, '<br>');
    else if (t === 'btn') setBtn(el, v);
    else if (t === 'gold') { el.setAttribute('data-t', v); var sp = el.querySelector('span'); if (sp) sp.textContent = v; else el.textContent = v; }
    else if (t === 'word') { if (el.firstChild && el.firstChild.nodeType === 3) el.firstChild.textContent = v; else el.insertBefore(document.createTextNode(v), el.firstChild); var w = el.querySelector('span'); if (w) w.textContent = v; }
    else if (t === 'lastEm') { var m = /^(.*?)(\S+)\s*$/.exec(v); el.innerHTML = m ? esc(m[1]) + '<em>' + esc(m[2]) + '</em>' : esc(v); }
    else if (t === 'allEm') el.innerHTML = '<em>' + esc(v) + '</em>';
    else el.textContent = v;
  }
  /* ---------- המלצה = צילום מסך מלא של וואטסאפ באנדרואיד (1.11.2026, סבב 2) ----------
     המסך בנוי בגודל של טלפון אמיתי (412 על 915) וה-CSS מקטין את כולו לרוחב הצילום (.wa-scr ב-site.css).
     שיחה חדשה: ההודעה הצהובה על ההצפנה, התאריך וההודעות צמודים לתחתית, ומעליהם טפט ריק. למטה שורת הכתיבה ופס הניווט.
     המילים של הלקוח נשארות מילה במילה. רק מחלקים אותן לבועות לפי משפטים (אחרי נקודה, סימן קריאה או שאלה, ובשורה חדשה).
     השעות, היום והבועה שקיבלה לב משתנים לפי המקום ברשימה. רק בצילום השני יש תשובה קצרה של העסק (בועה ירוקה, וי כחול כפול).
     index.html כתוב בדיוק עם מה שהפונקציה הזו בונה, כדי שהאתר ייראה אותו דבר גם בלי המערכת */
  /* at = שעת ההודעה הראשונה · day = מה כתוב מעל ההודעות · now = השעה בפס הסטטוס כשהשיחה לא מהיום (בשיחה של היום: כמה דקות אחרי ההודעה האחרונה) */
  var WA = { at: ['22:14', '21:36', '23:02', '20:48', '13:25', '22:41'], day: ['היום', 'אתמול', 'יום חמישי'], now: ['', '10:07', '12:31', '', '08:54', '19:12'],
    reply: 'תודה רבה! שמחנו להיות חלק מהשמחה 💛', e2e: 'ההודעות והשיחות מוצפנות מקצה לקצה. רק האנשים בצ\'אט הזה יכולים לקרוא אותן, להאזין להן או לשתף אותן. מידע נוסף' };
  function hhmm(s, add) { var p = s.split(':'), m = (+p[0] * 60 + +p[1] + add) % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); }
  function waSplit(s) {
    return String(s || '').split(/\n+/).reduce(function (a, l) { return a.concat(l.replace(/([.!?…]+)\s+/g, '$1\n').split('\n')); }, [])
      .map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function waShot(t, i, shown) {
    var nm = String(t.name || '').trim(), parts = waSplit(t.text), k3 = i % 3, at = WA.at[i % WA.at.length];
    var heart = k3 === 1 ? 0 : parts.length - 1, reply = i === 1, add = 0;
    var meta = function (m) { return '<i class="wa-m" aria-hidden="true"><span>' + hhmm(at, m) + '</span></i>'; };
    var bub = parts.map(function (p, k) {
      add = Math.floor(k * .6);
      return '<p class="wa-b' + (k ? '' : ' t') + (k === heart ? ' r' : '') + '">' + esc(p) + meta(add) +
        (k === heart ? '<span class="wa-re" role="img" aria-label="תגובה: לב">❤️</span>' : '') + '</p>';
    }).join('');
    var last = add + (reply ? 4 : 0);
    return '<figure class="wa rv' + (shown ? ' in' : '') + '"' + (i ? ' style="--d:' + Math.min(i, 5) * 120 + 'ms"' : '') + ' data-adm="' + esc(t.id) + '" aria-label="' + esc('צילום מסך מוואטסאפ: ' + (nm || 'לקוח')) + '"><div class="wa-scr">' +
      '<div class="wa-sb" aria-hidden="true"><span>' + (WA.now[i % 6] || hhmm(at, last + 3)) + '</span><i></i></div>' +
      '<div class="wa-top"><i class="wa-bk"></i><i class="wa-av"></i><b class="wa-nm">' + esc(nm) + '</b><i class="wa-ic"></i></div>' +
      '<div class="wa-chat"><p class="wa-e2e" aria-hidden="true"><i></i>' + esc(WA.e2e) + '</p><span class="wa-day">' + WA.day[k3] + '</span>' +
      (bub ? '<blockquote>' + bub + '</blockquote>' : '') + (reply ? '<p class="wa-b me t">' + esc(WA.reply) + meta(last) + '</p>' : '') +
      '<div class="wa-in" aria-hidden="true"><span class="wa-box"><i class="wa-emo"></i><span>הודעה</span><i class="wa-att"></i></span><i class="wa-mic"></i></div><i class="wa-nav"></i></div></div></figure>';
  }
  /* ---------- שאלות נפוצות = "תפריט מודפס" (2.11.2026, סגנון 9 גרסה א): כל שאלה היא שורה בתפריט, הכול גלוי.
     faqMenu מחלק לשני טורים לפי הסדר, במקום שבו שני הטורים יוצאים הכי קרובים באורך (לפי כמות הטקסט, ועוד קצת לכל שאלה בשביל המספר והרווח).
     index.html כתוב בדיוק עם מה ש-faqMenu בונה ---------- */
  function faqItem(f, i) {
    return '<div class="fq-it" style="--i:' + i + '" data-adm="' + esc(f.id) + '"><h3 class="fq-q"><span class="fq-n" aria-hidden="true">' + ('0' + (i + 1)).slice(-2) + '</span><span class="fq-t">' + esc(f.q) + '</span></h3>' +
      '<p class="fq-a">' + esc(f.a).replace(/\n/g, '<br>') + '</p></div>';
  }
  function faqMenu(list) {
    var w = list.map(function (f) { return String(f.q || '').length + String(f.a || '').length + 90; });
    var all = w.reduce(function (s, x) { return s + x; }, 0), h = list.length, run = 0, best = Infinity;
    for (var k = 1; k < list.length; k++) { run += w[k - 1]; var d = Math.abs(all - 2 * run); if (d < best) { best = d; h = k; } }
    var col = function (part, s) { return part.length ? '<div class="fq-col">' + part.map(function (f, j) { return faqItem(f, s + j); }).join('') + '</div>' : ''; };
    return col(list.slice(0, h), 0) + col(list.slice(h), h);
  }
  function faqLd(list) {
    return JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(function (f) {
      return { '@type': 'Question', name: String(f.q), acceptedAnswer: { '@type': 'Answer', text: String(f.a || '') } }; }) }).replace(/</g, '\\u003c');
  }
  function apply(D, o) {
    if (!D) return;
    o = o || {};
    var doc = o.doc || document, q = function (s) { try { return doc.querySelector(s); } catch (e) { return null; } };
    (D.site || []).forEach(function (s) {
      var d = sec(s.id); if (!d) return;
      d.fields.forEach(function (f) { var el = q(f.s); if (el && s.fields[f.k] != null) put(el, f, s.fields[f.k]); });
      var root = q(d.root), hide = !d.fixed && !s.visible, ghost = hide && o.ghost === s.id;
      [root, d.also ? q(d.also) : null].forEach(function (r) { if (r) { r.style.display = hide && !ghost ? 'none' : ''; r.style.opacity = ghost ? '.4' : ''; r.style.filter = ghost ? 'grayscale(.6)' : ''; } });
      Array.prototype.forEach.call(doc.querySelectorAll('a[href="' + d.root + '"]'), function (a) { a.style.display = hide ? 'none' : ''; });
    });
    /* המלצות: עד שש הראשונות שמוצגות, כל אחת כצילום מסך מלא מוואטסאפ (1.11.2026, במקום כרטיסי התודה) */
    var was = q('#stories .was');
    if (was && D.testimonials) {
      var vis = D.testimonials.filter(function (t) { return t.visible && (t.text || t.name); }).slice(0, 6);
      was.innerHTML = vis.map(function (t, i) { return waShot(t, i, o.shown); }).join('');
      var st = q('#stories'); if (st && !vis.length) st.style.display = 'none';
    }
    /* שאלות נפוצות: רק מה שמסומן "מוצג באתר", בסדר של המערכת. בלי שאלות מוצגות: החלק והקישורים אליו לא מוצגים */
    var fq = q('#faq [data-faqs]');
    if (fq && Array.isArray(D.faqs)) {
      var fv = D.faqs.filter(function (f) { return f && f.visible && String(f.q || '').trim(); });
      fq.innerHTML = faqMenu(fv);
      fq.classList.toggle('one', fv.length < 2);   /* שאלה אחת: טור אחד, בלי קו באמצע */
      var ld = q('#fq-ld'); if (ld) ld.textContent = faqLd(fv);
      if (!fv.length) { var fs = q('#faq'); if (fs) fs.style.display = 'none'; Array.prototype.forEach.call(doc.querySelectorAll('a[href="#faq"]'), function (a) { a.style.display = 'none'; }); }
    }
    /* טלפון ווואטסאפ, בכל מקום בעמוד */
    var b = D.biz || {};
    if (b.phone) {
      var ph = String(b.phone), tel = 'tel:' + ph.replace(/[^\d+]/g, '');
      Array.prototype.forEach.call(doc.querySelectorAll('a[href^="tel:"]'), function (a) { a.setAttribute('href', tel); a.setAttribute('aria-label', 'להתקשר ' + ph); var bb = a.querySelector('b'); if (bb) bb.textContent = ph; });
    }
    if (b.wa) {
      var wa = String(b.wa).replace(/\D/g, '');
      Array.prototype.forEach.call(doc.querySelectorAll('a[href^="https://wa.me/"]'), function (a) { var h = a.getAttribute('href'), qs = h.indexOf('?'); if (/^https:\/\/wa\.me\/\d/.test(h)) a.setAttribute('href', 'https://wa.me/' + wa + (qs > -1 ? h.slice(qs) : '')); });
    }
    /* אזורי המשלוח בפוטר, מהמערכת. בלי אזורים: העמודה לא מוצגת */
    var ar = q('[data-areas]');
    if (ar && Array.isArray(D.areas)) {
      var an = D.areas.map(function (a) { return a && a.name; }).filter(Boolean);
      if (an.length) ar.textContent = an.join(' · '); else if (ar.parentNode) ar.parentNode.hidden = true;
    }
  }
  /* ספר הגלריה: book3d.js קורא את זה לפני שהוא בונה את הספר */
  function bookFor(D) {
    if (!D || !D.book || !Array.isArray(D.book.bars)) return null;
    var bars = D.book.bars.filter(function (x) { return x.visible !== false && x.lead && (x.lead.f || x.lead.src); });
    return bars.length ? { bars: clone(bars).map(function (x) { x.more = x.more || []; x.when = x.when || ''; return x; }) } : null;
  }

  /* ---------- במערכת: איזה אלמנט לסמן בתצוגה המקדימה ---------- */
  function target(doc, tab, id, k) {
    var q = function (s) { try { return doc.querySelector(s); } catch (e) { return null; } };
    if (tab === 'texts') { var d = sec(id), f = d && k && field(id, k); return { sec: d ? q(d.root) : null, el: f ? q(f.s) : null }; }
    if (tab === 'reviews') return { sec: q('#stories'), el: id ? q('#stories [data-adm="' + id + '"]') : null };
    if (tab === 'faq') return { sec: q('#faq'), el: id ? q('#faq [data-adm="' + id + '"]') : null };
    if (tab === 'gallery') return { sec: q('#gallery'), el: q('#alb') };
    if (tab === 'biz') return { sec: q('#contact'), el: q('#contact .ct-alt') };
    return { sec: null, el: null };
  }

  window.PatCMS = { SECTIONS: SECTIONS, BOOK_BARS: BOOK_BARS, sec: sec, field: field, isNew: isNew, defaults: defaults, migrate: migrate, snapOf: snapOf, data: data, apply: apply, target: target, bookFor: bookFor, waShot: waShot, faqItem: faqItem, faqMenu: faqMenu };

  /* =========================================================
     באתר עצמו (לא במסכי המערכת)
     ========================================================= */
  if (document.body && document.body.hasAttribute('data-page')) return;
  var D = data();
  if (D) { apply(D); var bk = bookFor(D); if (bk) window.PAT_BOOK = bk; }

  var framed = false; try { framed = window.top !== window; } catch (e) { framed = true; }
  if (framed || /(^|[?&])still(=|&|$)/.test(location.search)) return;

  /* מי היה באתר: ביקור אחד לכל עמוד בכל טעינה (נשמר באותו מקום שהמערכת קוראת ממנו) */
  function withS(fn) {
    if (window.Store) { if (!Store.S) Store.load(); fn(Store.S); Store.save(); return; }
    var S = read(KEY); if (!S) return; fn(S); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
  }
  var pg = /article\.html/.test(location.pathname) ? 'מאמרים בבלוג' : /blog\.html/.test(location.pathname) ? 'הבלוג' : 'דף הבית';
  withS(function (S) {
    var d = new Date(), today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var ss = S.siteStats = S.siteStats || { days: [], sources: [], pages: [] };
    ss.days = ss.days || []; ss.pages = ss.pages || [];
    var day = ss.days.filter(function (x) { return x.date === today; })[0];
    if (!day) { day = { date: today, visits: 0, signups: 0 }; ss.days.push(day); ss.days = ss.days.slice(-60); }
    day.visits = (day.visits || 0) + 1;
    var p = ss.pages.filter(function (x) { return x.n === pg; })[0];
    if (!p) { p = { n: pg, v: 0 }; ss.pages.push(p); }
    p.v = (p.v || 0) + 1;
  });

  /* יצירת קשר: טופס שעבר את הבדיקה של site.js נכנס כפנייה חדשה */
  var f = document.getElementById('ctf');
  if (f && window.Store) f.addEventListener('submit', function () {
    setTimeout(function () {
      if (!f.hidden) return;   /* site.js הסתיר את הטופס רק אם השם והטלפון תקינים */
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      if (!Store.S) Store.load();
      var S = Store.S, when = v('cf-d'), msg = v('cf-m');
      S.leads.unshift({ id: Store.uid('l'), name: v('cf-n'), phone: v('cf-p'), source: 'site', status: 'new', created: Store.today(), event: 'other', guests: 0, budget: 0, date: '', time: '', level: 1, type: 'pickup', area: '', colors: '', allergy: '', bar: null,
        notes: 'מהטופס באתר.' + (when ? ' תאריך האירוע: ' + when + '.' : '') + (msg ? ' ' + msg : '') });
      var ss = S.siteStats, td = Store.today(), day = ss && ss.days && ss.days.filter(function (x) { return x.date === td; })[0];
      if (day) day.signups = (day.signups || 0) + 1;
      Store.save();
    }, 0);
  });
})();

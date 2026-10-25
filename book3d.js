/* book3d.js · הגלריה: ספר תלת ממדי אמיתי (נטען כמודול).
   מנוע: three.js 0.160.0 (רישיון MIT) מ-jsDelivr, נטען רק כשהחלק מתקרב למסך.
   הספר בנוי כמו ספר אמיתי: כריכה קשה עבה בבד פשתן בשוקולד חלב עם פויל זהב מוטבע, שדרה מעוגלת שמסתובבת בפתיחה,
   ועלים עבים: כל עלה הוא גוף תלת ממדי (שני צדדים וחיתוך זהב), מתעקל לתוך השדרה ומתכופף בזמן ההיפוך
   (שרשרת של 48 מקטעים לאורך הדף שכל אחד מסתובב קצת יותר מהקודם, אותו עיקרון כמו עצמות, נכתב מאפס).
   אור חם אחד עם צללים אמיתיים, השתקפות רכה לפויל ולחיתוך הזהב, ומצלמה שזזה בעדינות לפי העכבר.
   הרינדור רץ רק כשמשהו זז, ונעצר לגמרי כשהחלק מחוץ למסך.
   גיבוי: בלי WebGL, או כשמבקשים תנועה מופחתת, מוצגות אותן כפולות בדיוק, שטוחות, עם החלפה רכה. */

/* =====================================================================================
   הטקסטים של הספר. כולם טיוטה לאישור אפרים, וכאן עורכים אותם.
   title = כותרת קטנה לבר · when = חודש הצילום (מתאריך הקבצים) · see = מה רואים בצילום · story = הסיפור.
   lead = הצילום המוביל, more = צילומים נוספים. f = שם הקובץ, lg: 1 = יש גרסה גדולה ב-/media/img/,
   fx = איזה חלק מהרוחב נשאר כשהצילום נחתך לרוחב (0 שמאל, 1 ימין), mx = אותו דבר כשהוא נחתך לעומד.
   ===================================================================================== */
var BARS = [
  { title: 'שמנת, שוקולד וזהב', when: 'מאי 2026',
    see: 'עוגת טפטוף שוקולד עם אוראו על רגל קריסטל, כיפות שוקולד מבריקות, כוסות מוס בשכבות, ארטיקים ומקרונים, ליד מנורה מוזהבת ופרחים לבנים.',
    story: 'שמנת, שוקולד וזהב חוזרים לאורך כל השולחן, כדי שהכול ירגיש כמו יצירה אחת. ורגע לפני שהדלתות נפתחות, עוד סיבוב אחרון: מיישרים כיפה, מזיזים פרח, ונושמים.',
    lead: { f: 'IMG_6525', lg: 1, fx: .42 },
    more: [{ f: 'IMG_6509', lg: 1, fx: .5, mx: .2 }, { f: 'IMG_6543', fx: .5, mx: .58 }] },
  { title: 'צבע על שחור', when: 'מאי 2026',
    see: 'מפה שחורה, ועליה שורות של בקבוקונים בצהוב, בוורוד ובלילך, מקרונים על מגש זהב, נשיקות שוקולד וגלילי ופל, בין שתי מנורות בד לבנות וזרי גיבסנית.',
    story: 'על שחור עמוק כל צבע קופץ: צהוב, ורוד ולילך. כל שורה של בקבוקונים מסודרת ביד, אחד אחד, עד שהשולחן נראה כמו קופסת צבעים פתוחה.',
    lead: { f: 'IMG_6922', fx: .5 },
    more: [{ f: 'IMG_6944', fx: .5, mx: .52 }] },
  { title: 'ורוד, זהב ופרפר', when: 'אוגוסט 2026',
    see: 'עוגה לבנה עם פרחים ורודים ופרפר על רגל זהב, עוגיות שוקולד, כיפות ורודות עם סוכריית פסים, נשיקות בגביעי זהב ושורות ארוכות של קינוחים אישיים, על רקע שיש.',
    story: 'פרפר אחד על העוגה, וכל השולחן כאילו ממריא איתו: ורוד, זהב ושורות שנמשכות עד הקצה. אנחנו אוהבים את הרגע שבו מישהו מתקרב ומגלה שגם הקינוח הכי קטן קיבל תשומת לב.',
    lead: { f: 'IMG_8429', fx: .36 },
    more: [{ f: 'IMG_8395', fx: .5, mx: .3 }] },
  { title: 'מדפים לבנים ונרות זהב', when: 'אוגוסט 2026',
    see: 'מדפים לבנים במדרגות עם פרחים, פמוטי זהב גבוהים, מדרגות זכוכית עם כוסות בשכבות וארטיקים קטנים, מקרונים, טארטלטים ועוגת שוקולד עם עיגולי זהב.',
    story: 'כאן בנינו לגובה: מדפים, פמוטים ומדרגות זכוכית, כדי שהעין תטפס מהשולחן ועד הפרחים. וכשהנרות דלקו והכול עמד במקומו, ידענו שאפשר להתחיל לשמוח.',
    lead: { f: 'IMG_9027', lg: 1, fx: .52 },
    more: [{ f: 'IMG_9008', fx: .5, mx: .5 }, { f: 'IMG_8984', fx: .5, mx: .3 }] }
];
// הטקסטים הקבועים של הספר (הכריכה, השער והעמוד האחרון)
var BOOK = {
  title: 'שמחה בלתי נשכחת', sub: 'האלבום של פטיסייר',
  intro: 'ארבעה ברים אמיתיים שבנינו, כמו שהם.',
  toc: 'בספר', seeL: 'מה רואים כאן', storyL: 'הסיפור',
  endH: ['הבר הבא', 'יכול להיות שלך.'],
  endP: 'ספרי לנו על השמחה, ותקבלי הצעת מחיר מסודרת לפי מספר האורחים.',
  cta: 'לקבל הצעת מחיר', again: 'לחזור להתחלה'
};

/* ===================================================================================== */
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
const FONT = '"Google Sans","Rubik Local","Segoe UI",system-ui,sans-serif';
const C = { paper: '#FBF6EC', ink: '#3B1A10', body: '#4A2B1D', fade: '#7A604E', gd: '#86601F', g: '#BE9244' };
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const sm = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const html = document.documentElement;
const calm = () => /(^|[?&])still(=|&|$)/.test(location.search) || html.classList.contains('a11y-still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const phoneW = () => innerWidth <= 820;
const TEST = /(^|[?&])b3test/.test(location.search);
const MAXC = 10;                                                    // מצבים: 0 סגור, 1 שער, 2..9 ברים, 10 סוף

const G = document.getElementById('gallery'), A = document.getElementById('alb');

/* ---------- הצילומים: רשימה אחת לפי הסדר (גם להגדלה) ---------- */
const SRC = p => p.lg ? 'media/img/' + p.f + '-lg.webp' : 'media/gal/' + p.f + '.webp';
const PH = [];
BARS.forEach((b, i) => [b.lead].concat(b.more).forEach((p, k, all) => {
  p.n = PH.length; PH.push({ p, b: i, src: SRC(p), cap: b.title + ' · ' + b.when + ' · צילום ' + (k + 1) + ' מתוך ' + all.length });
}));
const IM = {};
function loadImg(src) {
  return new Promise(res => {
    const i = new Image(); i.decoding = 'async';
    i.onload = () => (i.decode ? i.decode() : Promise.resolve()).catch(() => { }).then(() => { IM[src] = i; res(i); });
    i.onerror = () => res(null); i.src = src;
  });
}
const img = p => IM[SRC(p)] || null;
let assetsP = null;
function assets() {
  return assetsP || (assetsP = Promise.all([
    Promise.all(PH.map(x => loadImg(x.src))), loadImg('media/img/logo-mask.png'),
    Promise.all([400, 500, 700].map(w => document.fonts.load(w + ' 40px "Google Sans"', 'אבגדה שמחה 2026'))).catch(() => { }).then(() => document.fonts.ready)
  ]));
}

/* ================================== מצבי ספר ================================== */
// D = מחשב: כפולות, דף 4:5. M = טלפון: עמוד אחד בכל פעם, דף 5:8
const MODES = {
  D: { k: 'D', ph: false, H: 1.25, J: 9, cw: 840, pt: .0066 },
  M: { k: 'M', ph: true, H: 1.6, J: 10, cw: 720, pt: .006 }
};
Object.values(MODES).forEach(m => { m.ch = Math.round(m.cw * m.H); m.U = m.cw / 100; m.hu = 100 * m.H; });
// מה מודפס על כל צד של כל עלה. n = מספר העמוד
function leafSpecs(m) {
  const L = [];
  if (!m.ph) {
    const s = [{ k: 'title', s: 'L' }];
    BARS.forEach((b, i) => s.push({ k: 'A', b: i, s: 'R' }, { k: 'A', b: i, s: 'L' }, { k: 'B', b: i, s: 'R' }, { k: 'B', b: i, s: 'L' }));
    s.push({ k: 'end', s: 'R' });
    s.forEach((x, q) => x.n = q + 1);
    for (let j = 1; j <= m.J; j++) L.push({ f: s[2 * j - 2], b: s[2 * j - 1] });
  } else {
    const s = [{ k: 'title' }];
    BARS.forEach((b, i) => s.push({ k: 'A', b: i }, { k: 'B', b: i }));
    s.push({ k: 'end' });
    s.forEach((x, q) => { x.n = q + 1; x.s = 'L'; L.push({ f: x, b: { k: 'blank', s: 'R' } }); });
  }
  return L;
}
// טקסט מלא של המצב הנוכחי (לקורא מסך) ושם קצר למונה
function describe(cur, m) {
  if (!cur) return 'הספר סגור. ' + BOOK.title + ', ' + BOOK.sub + '.';
  if (cur === 1) return BOOK.title + '. ' + BOOK.sub + '. ' + BOOK.intro + ' ' + BOOK.toc + ': ' + BARS.map(b => b.title).join(', ') + '.';
  if (cur === MAXC) return BOOK.endH.join(' ') + ' ' + BOOK.endP;
  const b = BARS[Math.floor((cur - 2) / 2)], a = cur % 2 === 0;
  return b.title + ', ' + b.when + '. ' + (a ? BOOK.seeL + ': ' + b.see : BOOK.storyL + ': ' + b.story);
}

/* ================================== ציור הדפים ================================== */
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.dir = 'rtl'; return c; }
const ff = (w, px) => w + ' ' + px.toFixed(1) + 'px ' + FONT;
function setLS(x, px) { if ('letterSpacing' in x) x.letterSpacing = (px || 0).toFixed(1) + 'px'; }
let GR = null;
function grain() {
  if (GR) return GR;
  const c = mk(160, 160), x = c.getContext('2d'), d = x.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random(); d.data[i] = 98; d.data[i + 1] = 64; d.data[i + 2] = 36; d.data[i + 3] = v * v * 26; }
  x.putImageData(d, 0, 0); return GR = c;
}
function paper(x, W, H) {
  x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
  x.fillStyle = x.createPattern(grain(), 'repeat'); x.fillRect(0, 0, W, H);
}
// הצל הרך ליד השדרה (בנוסף לעיקול האמיתי)
function gutter(x, W, H, side, a) {
  const w = W * .09, g = side === 'L' ? x.createLinearGradient(W, 0, W - w, 0) : x.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(56,24,8,' + (.34 * a) + ')'); g.addColorStop(.22, 'rgba(56,24,8,' + (.13 * a) + ')'); g.addColorStop(1, 'rgba(56,24,8,0)');
  x.fillStyle = g; if (side === 'L') x.fillRect(W - w, 0, w, H); else x.fillRect(0, 0, w, H);
}
function cover(x, im, X, Y, W, H, fx, fy) {
  if (!im) { x.fillStyle = '#E6D6BA'; x.fillRect(X, Y, W, H); return; }
  const iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max(W / iw, H / ih), sw = W / s, sh = H / s;
  x.drawImage(im, (iw - sw) * clamp(fx == null ? .5 : fx, 0, 1), (ih - sh) * clamp(fy == null ? .5 : fy, 0, 1), sw, sh, X, Y, W, H);
}
function wrap0(x, s, w) {
  const out = []; let cur = '';
  s.split(/\s+/).forEach(word => { const t = cur ? cur + ' ' + word : word; if (!cur || x.measureText(t).width <= w) cur = t; else { out.push(cur); cur = word; } });
  if (cur) out.push(cur); return out;
}
// כותרות מאוזנות (שורות באורך דומה), ובטקסט רץ בלי מילה בודדת בשורה האחרונה
function wrap(x, s, w, bal) {
  let L = wrap0(x, s, w);
  if (bal && L.length > 1) { let lo = w * .5, hi = w; for (let i = 0; i < 14; i++) { const m2 = (lo + hi) / 2; if (wrap0(x, s, m2).length > L.length) lo = m2; else hi = m2; } L = wrap0(x, s, hi); }
  const n = L.length;
  if (n > 1 && L[n - 1].indexOf(' ') < 0) { const p = L[n - 2].split(' '); if (p.length > 2) { const mv = p.pop(); L[n - 2] = p.join(' '); L[n - 1] = mv + ' ' + L[n - 1]; } }
  return L;
}
// הלוגו בזהב (מתוך מסכת הלוגו של האתר)
const LG = {};
function logo(tone) {
  if (LG[tone]) return LG[tone];
  const m = IM['media/img/logo-mask.png'], c = mk(620, 204), x = c.getContext('2d');
  if (m) x.drawImage(m, 60, 82, 1240, 408, 0, 0, 620, 204);
  x.globalCompositeOperation = 'source-in';
  const g = x.createLinearGradient(0, 0, 0, 204);
  if (tone === 'w') { g.addColorStop(0, '#fff'); g.addColorStop(1, '#fff'); }
  else if (tone === 'l') { g.addColorStop(0, '#F6DE9A'); g.addColorStop(.5, '#E2BE6C'); g.addColorStop(1, '#C69A48'); }
  else { g.addColorStop(0, '#C9A04A'); g.addColorStop(.5, '#A57A2C'); g.addColorStop(1, '#8A6220'); }
  x.fillStyle = g; x.fillRect(0, 0, 620, 204);
  return LG[tone] = c;
}
// פריסה זורמת: רשימת פריטים מלמעלה למטה, ואם לא נכנס מקטינים מעט
function lay(x, U, items, w, k) {
  let y = 0; const out = [];
  for (const it of items) {
    if (it.gap) y += it.gap * U * k;
    if (it.t === 'tx') {
      const z = it.z * U * k; x.font = ff(it.w || 400, z); setLS(x, (it.ls || 0) * z);
      const lines = it.one ? [it.s] : wrap(x, it.s, w, it.w >= 700), lh = z * (it.lh || 1.4);
      out.push({ it, lines, y, lh, z, h: lines.length * lh }); y += lines.length * lh;
    } else if (it.t === 'img') { const w2 = it.w * U * k, h = w2 * it.im.height / it.im.width; out.push({ it, y, w: w2, h }); y += h; }
    else if (it.t === 'rule' || it.t === 'orn') { const h = (it.t === 'orn' ? 2.4 : it.h || .42) * U; out.push({ it, y, h }); y += h; }
    else if (it.t === 'pill') { const h = 11 * U * k; out.push({ it, y, h, z: 4.4 * U * k }); y += h; }
    else if (it.t === 'link') { const z = 4.1 * U * k; out.push({ it, y, h: z * 1.9, z }); y += z * 1.9; }
  }
  setLS(x, 0); return { out, h: y };
}
function put(x, U, L, box, R, m) {
  const ctr = box.al === 'center', mid = (box.l + box.r) / 2;
  x.textBaseline = 'middle'; x.direction = 'rtl';
  for (const o of L.out) {
    const it = o.it, top = box.t + o.y;
    if (it.t === 'tx') {
      x.font = ff(it.w || 400, o.z); setLS(x, (it.ls || 0) * o.z); x.textAlign = ctr ? 'center' : 'right';
      if (it.gold) { const g = x.createLinearGradient(0, top, 0, top + o.h); g.addColorStop(0, '#CFA757'); g.addColorStop(.55, '#A67C2E'); g.addColorStop(1, '#86601F'); x.fillStyle = g; }
      else x.fillStyle = it.c || C.body;
      o.lines.forEach((ln, i) => x.fillText(ln, ctr ? mid : box.r, top + i * o.lh + o.lh / 2 + o.z * .04));
      setLS(x, 0);
    } else if (it.t === 'img') x.drawImage(it.im, ctr ? mid - o.w / 2 : box.r - o.w, top, o.w, o.h);
    else if (it.t === 'rule') { const w = it.w * U; x.fillStyle = C.g; x.fillRect(ctr ? mid - w / 2 : box.r - w, top, w, o.h); }
    else if (it.t === 'orn') {
      const w = it.w * U, cy = top + o.h / 2, cx = ctr ? mid : box.r - w / 2, d = .9 * U;
      x.fillStyle = C.g; x.fillRect(cx - w / 2, cy - .2 * U, w / 2 - 2.2 * U, .4 * U); x.fillRect(cx + 2.2 * U, cy - .2 * U, w / 2 - 2.2 * U, .4 * U);
      x.beginPath(); x.moveTo(cx, cy - d); x.lineTo(cx + d, cy); x.lineTo(cx, cy + d); x.lineTo(cx - d, cy); x.closePath(); x.fill();
    } else if (it.t === 'pill') {
      x.font = ff(700, o.z); const w = Math.max(x.measureText(it.s).width + 12 * U, 44 * U), h = o.h, l = ctr ? mid - w / 2 : box.r - w;
      const g = x.createLinearGradient(0, top, 0, top + h); g.addColorStop(0, '#F8E6AE'); g.addColorStop(.45, '#E2C276'); g.addColorStop(1, '#C49A48');
      x.fillStyle = 'rgba(70,34,12,.22)'; rr(x, l, top + .5 * U, w, h, h / 2); x.fill();
      x.fillStyle = g; rr(x, l, top, w, h, h / 2); x.fill();
      x.fillStyle = C.ink; x.textAlign = 'center'; x.fillText(it.s, l + w / 2, top + h / 2 + o.z * .04);
      if (it.reg) R.push({ x0: l / m.cw, y0: top / m.ch, x1: (l + w) / m.cw, y1: (top + h) / m.ch, a: it.reg });
    } else if (it.t === 'link') {
      x.font = ff(500, o.z); x.fillStyle = '#5E3020'; x.textAlign = 'center';
      const w = x.measureText(it.s).width, cx = ctr ? mid : box.r - w / 2, cy = top + o.h / 2;
      x.fillText(it.s, cx, cy); x.fillStyle = C.g; x.fillRect(cx - w / 2, cy + o.z * .62, w, Math.max(1.5, .3 * U));
      if (it.reg) R.push({ x0: (cx - w / 2 - 2 * U) / m.cw, y0: top / m.ch, x1: (cx + w / 2 + 2 * U) / m.cw, y1: (top + o.h) / m.ch, a: it.reg });
    }
  }
}
function rr(x, l, t, w, h, r) { x.beginPath(); x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath(); }
function flow(x, m, items, box, va, R) {
  const U = m.U; let L, k = 1;
  for (; k > .8; k -= .02) { L = lay(x, U, items, box.r - box.l, k); if (L.h <= box.b - box.t) break; }
  if (TEST && L.h > box.b - box.t + 1) console.warn('book3d: טקסט לא נכנס בעמוד', items[0] && items[0].s);
  const t = va === 'center' ? box.t + (box.b - box.t - L.h) / 2 : va === 'bottom' ? box.b - L.h : box.t;
  put(x, U, L, { l: box.l, r: box.r, t, al: box.al }, R, m);
  return { t, b: t + L.h, k };
}
function folio(x, m, side, n, light) {
  const U = m.U; x.font = ff(700, 3 * U); x.textBaseline = 'middle'; x.direction = 'ltr';
  x.fillStyle = light ? 'rgba(255,246,226,.9)' : C.gd; x.textAlign = side === 'L' ? 'left' : 'right';
  x.fillText(String(n), side === 'L' ? 8 * U : m.cw - 8 * U, m.ch - 5.4 * U); x.direction = 'rtl';
}
function frame(x, X, Y, W, H) { x.strokeStyle = 'rgba(59,26,16,.16)'; x.lineWidth = 1.4; x.strokeRect(X + .7, Y + .7, W - 1.4, H - 1.4); }
const reg = (R, m, X, Y, W, H, a) => R.push({ x0: X / m.cw, y0: Y / m.ch, x1: (X + W) / m.cw, y1: (Y + H) / m.ch, a });

// ציור צד אחד. מחזיר את הקנבס ואת האזורים הלחיצים בו (בקואורדינטות 0..1)
function paint(sp, m) {
  const W = m.cw, H = m.ch, U = m.U, c = mk(W, H), x = c.getContext('2d'), R = [], side = sp.s || 'L';
  x.direction = 'rtl'; paper(x, W, H);
  const b = sp.b != null ? BARS[sp.b] : null;
  if (sp.k === 'title') {
    const top = m.ph ? 12 : 9, tb = m.ph ? 84 : 66;
    flow(x, m, [{ t: 'img', im: logo('d'), w: m.ph ? 34 : 30 },
      { t: 'tx', s: BOOK.title, z: m.ph ? 9.4 : 8.4, w: 700, gold: 1, gap: 6, one: 1 },
      { t: 'tx', s: BOOK.sub, z: m.ph ? 4.4 : 3.9, w: 500, c: C.ink, gap: 2, ls: .12, one: 1 },
      { t: 'orn', w: 26, gap: 4.6 },
      { t: 'tx', s: BOOK.intro, z: m.ph ? 5.7 : 4.6, c: C.fade, gap: 4.2, lh: 1.5 }],
    { l: 10 * U, r: 90 * U, t: top * U, b: tb * U, al: 'center' }, 'center', R);
    // תוכן העניינים: לחיצה קופצת לבר
    const l = (m.ph ? 9 : 13) * U, r = (m.ph ? 91 : 87) * U, rowH = (m.ph ? 10 : 8.3) * U, z = (m.ph ? 5.6 : 4.6) * U;
    let y = (m.ph ? 98 : 76) * U;
    x.font = ff(700, 3.7 * U); setLS(x, .1 * 3.7 * U); x.fillStyle = C.gd; x.textAlign = 'right'; x.textBaseline = 'middle';
    x.fillText(BOOK.toc, r, y); setLS(x, 0); y += 4.6 * U;
    x.fillStyle = 'rgba(59,26,16,.5)'; x.fillRect(l, y, r - l, Math.max(1.5, .22 * U)); y += 1.2 * U;
    BARS.forEach((bar, i) => {
      const cy = y + rowH / 2, pg = m.ph ? 2 + 2 * i : 4 * i + 2;
      x.font = ff(500, z); x.fillStyle = C.ink; x.textAlign = 'right'; x.direction = 'rtl'; x.fillText(bar.title, r, cy);
      const tw = x.measureText(bar.title).width;
      x.font = ff(700, z * .92); x.fillStyle = C.gd; x.textAlign = 'left'; x.direction = 'ltr'; x.fillText(String(pg), l, cy);
      const nw = x.measureText(String(pg)).width; x.direction = 'rtl';
      x.fillStyle = 'rgba(138,98,32,.55)';
      for (let d = r - tw - 2.4 * U; d > l + nw + 2.4 * U; d -= 1.7 * U) x.fillRect(d - .2 * U, cy + z * .22, .4 * U, .4 * U);
      reg(R, m, l - U, y, r - l + 2 * U, rowH, { t: 'go', to: 2 + 2 * i });
      y += rowH; x.fillStyle = 'rgba(59,26,16,.14)'; x.fillRect(l, y - 1, r - l, 1.2);
    });
    gutter(x, W, H, side, 1);
  } else if (sp.k === 'A' && !m.ph) {
    // כפולה א: הצילום המוביל על עמוד וחצי, וטור צר עם הכותרת ומה רואים. הצד מתחלף בין הברים
    const odd = sp.b % 2 === 0, off = side === 'L' ? 0 : 100, PW = 142, p0 = odd ? 200 - PW : 0;
    x.save(); x.beginPath(); x.rect(0, 0, W, H); x.clip();
    cover(x, img(b.lead), (p0 - off) * U, 0, PW * U, H, b.lead.fx, .5); x.restore();
    const a = Math.max(0, p0 - off), z = Math.min(100, p0 + PW - off);
    if (z > a) reg(R, m, a * U, 0, (z - a) * U, H, { t: 'ph', n: b.lead.n });
    if (odd === (side === 'L')) {
      const box = side === 'L' ? { l: 8 * U, r: (200 - PW - 6.5) * U } : { l: (PW - 100 + 6.5) * U, r: 92 * U };
      box.t = 11 * U; box.b = H - 14 * U; box.al = 'right';
      flow(x, m, [{ t: 'tx', s: b.when, z: 3.7, w: 700, c: C.gd, ls: .1, one: 1 },
        { t: 'tx', s: b.title, z: 7, w: 700, c: C.ink, lh: 1.12, gap: 2.4 },
        { t: 'rule', w: 10, gap: 3.4 },
        { t: 'tx', s: BOOK.seeL, z: 3.7, w: 700, c: C.gd, gap: 3.4, ls: .06, one: 1 },
        { t: 'tx', s: b.see, z: 4.6, c: C.body, lh: 1.55, gap: 1.3 }], box, 'center', R);
      folio(x, m, side, sp.n);
    }
    gutter(x, W, H, side, 1.1);
  } else if (sp.k === 'B' && !m.ph && side === 'R') {
    // כפולה ב, ימין: הסיפור
    const box = { l: 11 * U, r: 91 * U, t: 12 * U, b: H - 22 * U, al: 'right' };
    flow(x, m, [{ t: 'tx', s: BOOK.storyL, z: 3.8, w: 700, c: C.gd, ls: .1, one: 1 },
      { t: 'tx', s: b.title, z: 8.4, w: 700, c: C.ink, lh: 1.1, gap: 2.2 },
      { t: 'rule', w: 12, gap: 3.8 },
      { t: 'tx', s: b.story, z: 5.3, c: C.body, lh: 1.62, gap: 4.2 }], box, 'center', R);
    const lw = 13 * U, lg = logo('d'); x.globalAlpha = .9; x.drawImage(lg, (W - lw) / 2 + 3 * U, H - 13.5 * U, lw, lw * lg.height / lg.width); x.globalAlpha = 1;
    folio(x, m, side, sp.n); gutter(x, W, H, side, 1);
  } else if (sp.k === 'B' && !m.ph) {
    // כפולה ב, שמאל: עוד צילומים
    if (b.more.length > 1) {
      const w = 79 * U, h = w / 1.5, gp = 3.4 * U, X = 9 * U, Y0 = (H - (2 * h + gp)) / 2 - 1.6 * U;
      b.more.slice(0, 2).forEach((p, i) => { const y = Y0 + i * (h + gp); cover(x, img(p), X, y, w, h, p.fx, .5); frame(x, X, y, w, h); reg(R, m, X, y, w, h, { t: 'ph', n: p.n }); });
      folio(x, m, side, sp.n);
    } else { const p = b.more[0]; cover(x, img(p), 0, 0, W, H, p.mx, .5); reg(R, m, 0, 0, W, H, { t: 'ph', n: p.n }); }
    gutter(x, W, H, side, 1.1);
  } else if (sp.k === 'A') {
    // טלפון, עמוד א: הצילום המלא למעלה, ומתחתיו הכותרת ומה רואים
    const ph = W / 1.7; cover(x, img(b.lead), 0, 0, W, ph, b.lead.fx, .5); reg(R, m, 0, 0, W, ph, { t: 'ph', n: b.lead.n });
    flow(x, m, [{ t: 'tx', s: b.when, z: 4.2, w: 700, c: C.gd, ls: .1, one: 1 },
      { t: 'tx', s: b.title, z: 7.6, w: 700, c: C.ink, lh: 1.12, gap: 1.8 },
      { t: 'tx', s: BOOK.seeL, z: 4.2, w: 700, c: C.gd, gap: 3.4, ls: .06, one: 1 },
      { t: 'tx', s: b.see, z: 5.7, c: C.body, lh: 1.5, gap: 1.2 }],
    { l: 7 * U, r: 91 * U, t: ph + 6 * U, b: H - 10 * U, al: 'right' }, 'center', R);
    folio(x, m, side, sp.n); gutter(x, W, H, side, 1);
  } else if (sp.k === 'B') {
    // טלפון, עמוד ב: הסיפור, ומתחתיו עוד צילומים
    const two = b.more.length > 1, pw = two ? 41 * U : 84 * U, ph = two ? pw / .92 : pw / 1.5, y1 = H - 11 * U, y0 = y1 - ph;
    b.more.slice(0, 2).forEach((p, i) => {
      const X = two ? (i ? 7 * U : 50 * U) : 7 * U;
      cover(x, img(p), X, y0, pw, ph, two ? p.mx : p.fx, .5); frame(x, X, y0, pw, ph); reg(R, m, X, y0, pw, ph, { t: 'ph', n: p.n });
    });
    flow(x, m, [{ t: 'tx', s: BOOK.storyL, z: 4.2, w: 700, c: C.gd, ls: .1, one: 1 },
      { t: 'tx', s: b.title, z: 7.2, w: 700, c: C.ink, lh: 1.12, gap: 1.6 },
      { t: 'tx', s: b.story, z: 5.9, c: C.body, lh: 1.55, gap: 3.2 }],
    { l: 7 * U, r: 91 * U, t: 8 * U, b: y0 - 5 * U, al: 'right' }, 'center', R);
    folio(x, m, side, sp.n); gutter(x, W, H, side, 1);
  } else if (sp.k === 'end') {
    const f = flow(x, m, [{ t: 'img', im: logo('d'), w: 26 },
      { t: 'tx', s: BOOK.endH[0], z: m.ph ? 10 : 9, w: 700, c: C.ink, gap: 8, one: 1, lh: 1.16 },
      { t: 'tx', s: BOOK.endH[1], z: m.ph ? 10 : 9, w: 700, c: C.ink, one: 1, lh: 1.16 },
      { t: 'orn', w: 22, gap: 4.4 },
      { t: 'tx', s: BOOK.endP, z: m.ph ? 5.7 : 4.7, c: C.fade, gap: 4.4, lh: 1.55 },
      { t: 'pill', s: BOOK.cta, gap: 7, reg: { t: 'cta' } },
      { t: 'link', s: BOOK.again, gap: 3, reg: { t: 'go', to: 1 } }],
    { l: 14 * U, r: 86 * U, t: 10 * U, b: H - 12 * U, al: 'center' }, 'center', R);
    folio(x, m, side, sp.n); gutter(x, W, H, side, 1);
  } else gutter(x, W, H, side, 1);                                   // גב ריק (בטלפון)
  return { c, R };
}
// נייר הפורזץ בפנים הכריכות: שוקולד עם נקודות זהב ומסגרת עם הלוגו
function endpaper(w, h, which, fx, fy) {
  const c = mk(w, h), x = c.getContext('2d'), U = w / 100;
  fx = fx || 0; fy = fy || 0;
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#6E3B1E'); g.addColorStop(1, '#552A14'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = x.createPattern(grain(), 'repeat'); x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(226,192,112,.42)'; const s = 4.4 * U;
  for (let yy = s / 2; yy < h; yy += s) for (let xx = s / 2 + ((Math.round(yy / s) % 2) * s / 2); xx < w; xx += s) { x.beginPath(); x.arc(xx, yy, .2 * U, 0, 7); x.fill(); }
  const bw = 54 * U, bh = 36 * U, bl = (w - bw) / 2, bt = (h - bh) / 2;
  x.fillStyle = '#5E3018'; x.fillRect(bl - 2 * U, bt - 2 * U, bw + 4 * U, bh + 4 * U);
  x.strokeStyle = 'rgba(226,192,112,.55)'; x.lineWidth = .3 * U; x.strokeRect(bl, bt, bw, bh); x.strokeRect(bl - 1.1 * U, bt - 1.1 * U, bw + 2.2 * U, bh + 2.2 * U);
  const lg = logo('l'), lw = 36 * U; x.drawImage(lg, (w - lw) / 2, bt + 6 * U, lw, lw * lg.height / lg.width);
  x.font = ff(500, 3.2 * U); setLS(x, .5 * U); x.fillStyle = '#E2C070'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl';
  x.fillText(which === 'f' ? BOOK.sub : BOOK.title, w / 2, bt + bh - 7 * U); setLS(x, 0);
  if (fx || fy) {
    const tw = fx * w, th2 = fy * h, l = which === 'f' ? 0 : tw, r = which === 'f' ? w - tw : w, pat = x.createPattern(linen().c, 'repeat');
    x.save(); x.beginPath(); x.rect(0, 0, w, h); x.rect(l, th2, r - l, h - 2 * th2); x.clip('evenodd');
    x.save(); x.scale(2, 2); x.fillStyle = pat; x.fillRect(0, 0, w, h); x.restore();
    const sh = (x0, y0, x1, y1) => { const g2 = x.createLinearGradient(x0, y0, x1, y1); g2.addColorStop(0, 'rgba(20,6,1,.45)'); g2.addColorStop(1, 'rgba(20,6,1,0)'); return g2; };
    x.fillStyle = sh(0, th2, 0, th2 - 1.4 * U); x.fillRect(0, 0, w, th2);
    x.fillStyle = sh(0, h - th2, 0, h - th2 + 1.4 * U); x.fillRect(0, h - th2, w, th2);
    if (which === 'f') { x.fillStyle = sh(w - tw, 0, w - tw + 1.4 * U, 0); x.fillRect(w - tw, 0, tw, h); } else { x.fillStyle = sh(tw, 0, tw - 1.4 * U, 0); x.fillRect(0, 0, tw, h); }
    x.restore();
  }
  return c;
}
// בד הפשתן: חוטים לאורך ולרוחב, עם עיבויים קטנים כמו בפשתן אמיתי
let LIN = null;
function linen() {
  if (LIN) return LIN;
  const n = 256, c = mk(n, n), x = c.getContext('2d'), b = mk(n, n), y = b.getContext('2d');
  x.fillStyle = '#56321F'; x.fillRect(0, 0, n, n); y.fillStyle = '#808080'; y.fillRect(0, 0, n, n);
  for (let i = 0; i < n; i++) {
    const a = Math.random(), d = Math.random();
    x.fillStyle = 'rgba(236,214,192,' + (a * .085).toFixed(3) + ')'; x.fillRect(0, i, n, 1);
    x.fillStyle = 'rgba(28,10,2,' + (d * .13).toFixed(3) + ')'; x.fillRect(i, 0, 1, n);
    y.fillStyle = 'rgba(255,255,255,' + (a * .35).toFixed(3) + ')'; y.fillRect(0, i, n, 1);
    y.fillStyle = 'rgba(0,0,0,' + (d * .35).toFixed(3) + ')'; y.fillRect(i, 0, 1, n);
    if (i % 2) { y.fillStyle = 'rgba(0,0,0,.12)'; y.fillRect(0, i, n, 1); y.fillRect(i, 0, 1, n); }
  }
  for (let k = 0; k < 120; k++) {
    const L = 6 + Math.random() * 26, X = Math.random() * n, Y = Math.random() * n, hz = Math.random() < .5, lt = Math.random() < .5;
    x.fillStyle = lt ? 'rgba(236,216,196,.11)' : 'rgba(30,12,4,.15)'; y.fillStyle = lt ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.3)';
    if (hz) { x.fillRect(X, Y, L, 1.4); y.fillRect(X, Y, L, 1.4); } else { x.fillRect(X, Y, 1.4, L); y.fillRect(X, Y, 1.4, L); }
  }
  return LIN = { c, b };
}
// הכריכה: צבע, מפת חספוס+מתכת (פויל = מתכת חלקה), ומפת תבליט (הפויל מוטבע פנימה)
function coverSet(w, h, kind) {
  const U = w / 100, col = mk(w, h), orm = mk(w, h), bmp = mk(w, h), msk = mk(w, h);
  const cx = col.getContext('2d'), ox = orm.getContext('2d'), bx = bmp.getContext('2d'), mx = msk.getContext('2d');
  const L = linen(), sc = kind === 'sp' ? 4 : 2;
  [[cx, L.c], [bx, L.b]].forEach(([c2, t]) => { c2.save(); c2.scale(sc, sc); c2.fillStyle = c2.createPattern(t, 'repeat'); c2.fillRect(0, 0, w / sc, h / sc); c2.restore(); });
  ox.fillStyle = 'rgb(255,226,0)'; ox.fillRect(0, 0, w, h);
  // הפויל
  mx.fillStyle = '#fff'; mx.textAlign = 'center'; mx.textBaseline = 'middle'; mx.direction = 'rtl';
  const blind = [];
  if (kind === 'front') {
    mx.font = ff(700, 12.6 * U); mx.fillText('שמחה', w / 2, 41 * U); mx.fillText('בלתי נשכחת', w / 2, 56 * U);
    const cy = 68 * U, d = 1.05 * U; mx.fillRect(w / 2 - 15 * U, cy - .22 * U, 12.4 * U, .44 * U); mx.fillRect(w / 2 + 2.6 * U, cy - .22 * U, 12.4 * U, .44 * U);
    mx.beginPath(); mx.moveTo(w / 2, cy - d); mx.lineTo(w / 2 + d, cy); mx.lineTo(w / 2, cy + d); mx.lineTo(w / 2 - d, cy); mx.closePath(); mx.fill();
    mx.font = ff(500, 4.5 * U); setLS(mx, .7 * U); mx.fillText(BOOK.sub, w / 2, 77 * U); setLS(mx, 0);
    const lg = logo('w'), lw = 22 * U; mx.drawImage(lg, (w - lw) / 2, h - 23 * U, lw, lw * lg.height / lg.width);
    blind.push([6 * U, 6 * U, w - 12 * U, h - 12 * U]);
  } else if (kind === 'sp') {
    mx.save(); mx.translate(w / 2, h / 2); mx.rotate(Math.PI / 2); mx.font = ff(700, w * .3); setLS(mx, w * .03);
    mx.fillText(BOOK.sub, 0, 0); setLS(mx, 0); mx.restore();
    blind.push([w * .14, h * .035, 0, 0], [w * .14, h * .965, 0, 0]);
  }
  // הטבעה עיוורת (בלי זהב): מסגרת דקה
  bx.strokeStyle = 'rgba(0,0,0,.55)'; bx.lineWidth = .55 * U; cx.strokeStyle = 'rgba(40,16,4,.28)'; cx.lineWidth = .55 * U;
  blind.forEach(r => { if (r[2]) { bx.strokeRect(r[0], r[1], r[2], r[3]); cx.strokeRect(r[0], r[1], r[2], r[3]); } else { bx.fillStyle = cx.fillStyle = 'rgba(0,0,0,.4)'; bx.fillRect(r[0], r[1] - .3 * U, w - 2 * r[0], .6 * U); } });
  const paintM = (c2, fill) => { const t = mk(w, h), tx = t.getContext('2d'); tx.drawImage(msk, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = fill(tx); tx.fillRect(0, 0, w, h); c2.drawImage(t, 0, 0); };
  paintM(cx, t => { const g = t.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#E9CB84'); g.addColorStop(.5, '#D8B266'); g.addColorStop(1, '#E3C27A'); return g; });
  paintM(ox, () => 'rgb(255,78,255)');
  bx.filter = 'blur(' + (.18 * U).toFixed(1) + 'px)'; paintM(bx, () => 'rgb(52,52,52)'); bx.filter = 'none';
  return { col, orm, bmp };
}

/* ================================== שלד הדף (HTML) ================================== */
let S = null;                                                       // המצב הכללי
function init() {
  G.classList.add('b3g');
  const head = $('.head', G), hw = head && head.parentNode;
  A.classList.add('b3'); A.setAttribute('aria-label', 'האלבום של פטיסייר'); A.innerHTML = '';
  const chev = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (d > 0 ? 'M14.5 6l-6 6 6 6' : 'M9.5 6l6 6-6 6') + '"/></svg>';
  A.insertAdjacentHTML('beforeend',
    '<div class="b3-side"><div class="b3-ui"><button type="button" class="b3-arr prev" aria-label="לסגור את הספר" disabled>' + chev(-1) + '</button>' +
    '<div class="b3-mid"><button type="button" class="btn btn-main b3-open">לפתוח את הספר</button><p class="b3-cnt"></p>' +
    '<div class="b3-dots" aria-hidden="true"><span class="b3-dl"><b></b><i></i><i></i><i></i></span><em>הגלילה מדפדפת</em></div></div>' +
    '<button type="button" class="b3-arr next" aria-label="לפתוח את הספר">' + chev(1) + '</button></div></div>' +
    '<div class="b3-stage" tabindex="0" role="group" aria-roledescription="ספר" aria-label="ספר הגלריה. החצים במקלדת מדפדפים, ואנטר מגדיל את הצילום שבעמוד.">' +
    '<p class="b3-load" aria-hidden="true">פותחים את הספר</p></div><canvas class="b3-cv" aria-hidden="true"></canvas>' +
    '<div class="b3-sr"><p class="b3-live" aria-live="polite"></p><ul>' +
    PH.map(x => '<li><button type="button" tabindex="-1" data-lb="' + x.src + '" data-cap="' + x.cap + '" aria-label="להגדיל: ' + x.cap + '"></button></li>').join('') + '</ul></div>');
  const side = $('.b3-side', A);
  if (head) { side.insertBefore(head, side.firstChild); if (hw && hw !== A && !hw.children.length) hw.style.display = 'none'; }
  S = { cur: 0, mode: null, E: null, flat: null, vis: false, used: false, stage: $('.b3-stage', A), cv: $('.b3-cv', A),
    prev: $('.b3-arr.prev', A), next: $('.b3-arr.next', A), open: $('.b3-open', A), cnt: $('.b3-cnt', A), dots: $('.b3-dots', A), live: $('.b3-live', A), btn: $$('.b3-sr button', A) };
  lbInit();
  S.next.addEventListener('click', () => { S.used = true; go(S.cur + 1); });
  S.prev.addEventListener('click', () => { S.used = true; go(S.cur - 1); });
  S.open.addEventListener('click', () => { S.used = true; go(1); setTimeout(() => { if (document.activeElement === S.open || document.activeElement === document.body) S.next.focus({ preventScroll: true }); }, 400); });
  S.stage.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return; e.preventDefault(); S.used = true;
    if (!S.cur) { go(1); return; }
    const n = photoAt(S.cur); if (n != null) S.btn[n].click();
  });
  document.addEventListener('keydown', e => {
    if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.altKey || e.ctrlKey || e.metaKey || $('.lb.on')) return;
    const a = document.activeElement;
    if (!A.contains(a)) {
      if (a && a !== document.body) return;
      const r = S.stage.getBoundingClientRect(); if (r.top > innerHeight * .6 || r.bottom < innerHeight * .4) return;
    }
    e.preventDefault(); S.used = true; go(S.cur + (e.key === 'ArrowLeft' ? 1 : -1));
  });
  ui();
  // נטען רק כשמתקרבים, ומרנדר רק כשבמסך
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); boot(); } }, { rootMargin: '900px 0px' }).observe(G);
  new IntersectionObserver(es => { S.vis = es[0].isIntersecting; if (S.E) S.E.vis(S.vis); }, { rootMargin: '120px 0px' }).observe(G);
  /* נעיצה: הבמה (כותרת, ספר וחצים) נעוצה מתחת להדר, והגלילה בזמן הנעיצה מדפדפת. מרווח גלילה אחרי הבמה נותן לה את האורך */
  S.pw = A.parentNode; S.pw.classList.add('b3-pw');
  S.sp = document.createElement('div'); S.sp.className = 'b3-spacer'; S.sp.setAttribute('aria-hidden', 'true'); S.pw.after(S.sp);
  S.pinOK = !calm() && webgl();
  S.scrub = { on: true, p: 0, ld: null };
  const onScroll = () => { S.scrub.p = tl(); scrubSync(); };
  addEventListener('scroll', onScroll, { passive: true });
  layoutPin(); onScroll();
  new ResizeObserver(() => { layoutPin(); onScroll(); }).observe(S.pw);
  // יצאת מהחלק לגמרי: הגלילה חוזרת לשלוט, והספר מתיישר לפיה בלי שרואים (כדי שכשחוזרים לא תהיה קפיצה)
  new IntersectionObserver(es => { const sc = S.scrub; if (!es[0].isIntersecting && sc && !sc.on && !S.flat) { sc.on = true; sc.ld = null; if (S.E) S.E.snap(sc.p); ui(); } }).observe(G);
  let rt = 0;
  addEventListener('resize', () => { layoutPin(); onScroll(); clearTimeout(rt); rt = setTimeout(resize, 120); });
  new MutationObserver(() => { const c = calm(); if (c !== S.calm) { S.calm = c; S.pinOK = !c && webgl(); if (S.E || S.flat) rebuild(); else { layoutPin(); onScroll(); } } }).observe(html, { attributes: true, attributeFilter: ['class'] });
  S.calm = calm();
  S.onScroll = onScroll;
  if (TEST) window.__b3 = { S, go, BARS };
}
/* ציר הגלילה של הספר (T): 0..1 הכריכה נפתחת בדרך אל החלק, 1..3 בזמן הנעיצה שני דפים מתהפכים.
   האורכים ביחידות של גובה מסך: עצירה קצרה על כל כפולה כדי שאפשר יהיה לראות אותה */
const PIN = { d0: .18, flip: .46, dwell: .26 }, PIN_D = PIN.d0 + 2 * (PIN.flip + PIN.dwell);
function layoutPin() {
  if (!S || !S.pw) return;
  const on = !S.flat && S.pinOK;
  G.classList.toggle('b3pin', on);
  S.sp.style.height = on ? Math.round(PIN_D * innerHeight) + 'px' : '0px';
  const hh = phoneW() ? 60 : 72, nat = parseFloat(getComputedStyle(G).paddingTop) || 0, stOff = A.offsetTop + S.stage.offsetTop;
  // נעוצים במקום הטבעי (בלי קפיצה). אם הכול לא נכנס במסך (טלפון, טאבלט): נעוצים כך שהספר והחצים מתחת להדר, והכותרת כבר מעל
  let top = hh + nat;
  if (top + S.pw.offsetHeight > innerHeight - 4) top = hh + 8 - stOff;
  S.pin = { on, top, s1: top - nat, off: nat + stOff };
  S.pw.style.top = on ? top + 'px' : '';
  G.style.scrollMarginTop = on ? (top - nat) + 'px' : '';             // הקישור "גלריה" מביא בדיוק לתחילת הנעיצה
}
function tl() {
  const P = S.pin; if (!P) return 0;
  const g = G.getBoundingClientRect().top, vh = innerHeight, start = vh * .8 - P.off;   // מתחילים כשראש הספר ב-80% מגובה המסך
  P.u = 0;
  if (g >= P.s1) return clamp((start - g) / Math.max(1, start - P.s1), 0, 1);
  if (!P.on) return 1;
  P.u = (P.s1 - g) / vh;
  let x = P.u - PIN.d0; if (x <= 0) return 1;
  for (let k = 0; k < 2; k++) { if (x < PIN.flip) return 1 + k + x / PIN.flip; x -= PIN.flip; if (x < PIN.dwell) return 2 + k; x -= PIN.dwell; }
  return 3;
}
// מי שולט בספר: הגלילה, עד שמדפדפים בעצמך. אחרי דפדוף ידני הגלילה מתחברת מחדש רק כשהמיקום שלה "פוגש" את הכפולה שבה הספר נמצא
// (כך אין קפיצה), או כשיוצאים מהחלק לגמרי וחוזרים
function scrubSync() {
  const sc = S.scrub; if (!sc || S.flat) return;
  if (!sc.on && S.cur <= 3 && !(S.E && S.E.busy())) {
    const d = sc.p - S.cur;
    if (Math.abs(d) < .03 || (sc.ld != null && (d > 0) !== (sc.ld > 0))) { sc.on = true; if (S.E) S.E.resync(); }
    sc.ld = d;
  }
  if (sc.on && S.E) S.E.scrub(sc.p);
  dots();
}
function manual() { const sc = S.scrub; if (!sc) return; sc.on = false; sc.ld = null; dots(); }
// המחוון: שלוש נקודות זהב (כפולה 1, 2, 3) עם קו שמתמלא, ומתחתיו "הגלילה מדפדפת". רק כשהגלילה שולטת
function dots() {
  const d = S.dots; if (!d) return;
  const T = S.scrub ? S.scrub.p : 0, show = !!(S.pin && S.pin.on && S.scrub && S.scrub.on && (S.E || !S.ready) && T > .55 && S.pin.u < PIN_D + .04);   // אחרי השחרור כבר לא מדפדפים
  d.classList.toggle('on', show);
  d.style.setProperty('--f', clamp((T - 1) / 2, 0, 1).toFixed(3));
  $$('i', d).forEach((x, k) => x.classList.toggle('on', T >= .55 + k));
}
// ההגדלה: אתחול נפרד רק לצילומי הספר (כמו בספר הקודם)
function lbInit() {
  if (!window.PatLightbox) return;
  const oth = $$('[data-lb]').filter(x => !A.contains(x));
  oth.forEach(x => { x.setAttribute('data-lbx', x.getAttribute('data-lb')); x.removeAttribute('data-lb'); });
  try { PatLightbox.init(); } catch (_) { }
  oth.forEach(x => { x.setAttribute('data-lb', x.getAttribute('data-lbx')); x.removeAttribute('data-lbx'); });
  // כשההגדלה נסגרת הפוקוס חוזר לספר עצמו (ולא לכפתור הנסתר שפתח אותה)
  const box = $$('.lb').pop();
  if (box) new MutationObserver(() => { if (!box.classList.contains('on')) setTimeout(() => { const f = document.activeElement; if (f && f.closest && f.closest('.b3-sr')) S.stage.focus({ preventScroll: true }); }, 0); }).observe(box, { attributes: true, attributeFilter: ['class'] });
}
function photoAt(cur) {
  if (cur < 2 || cur >= MAXC) return null;
  const b = BARS[Math.floor((cur - 2) / 2)]; return cur % 2 === 0 ? b.lead.n : b.more[0].n;
}
function ui() {
  const cur = S.cur, ph = S.mode ? S.mode.ph : phoneW();
  A.classList.toggle('shut', !cur);
  S.cnt.textContent = cur ? (ph ? 'עמוד ' : 'כפולה ') + cur + ' מתוך ' + MAXC : '';
  S.prev.disabled = !cur; S.next.disabled = cur >= MAXC;
  S.prev.setAttribute('aria-label', cur === 1 ? 'לסגור את הספר' : ph ? 'לעמוד הקודם' : 'לכפולה הקודמת');
  S.next.setAttribute('aria-label', !cur ? 'לפתוח את הספר' : ph ? 'לעמוד הבא' : 'לכפולה הבאה');
  if (S.lastLive !== cur) { S.lastLive = cur; clearTimeout(S.lt); S.lt = setTimeout(() => { S.live.textContent = describe(S.cur, S.mode || MODES.D); }, 500); }
  dots();
  const f = document.activeElement;
  if (f && A.contains(f) && f.disabled) (S.next.disabled ? S.prev : S.next).focus({ preventScroll: true });
}
function go(to) {
  to = clamp(to, S.flat ? 1 : 0, MAXC); if (to === S.cur) return;
  manual(to); S.cur = to; ui();
  if (S.E) S.E.go(to); else if (S.flat) S.flat.go(to);
}
function act(a) {
  if (!a) return;
  S.used = true;
  if (a.t === 'ph') S.btn[a.n].click();
  else if (a.t === 'go') go(a.to);
  else if (a.t === 'cta') { const b = $('a[href="#bot"]'); if (b) b.click(); }
}
async function boot() {
  try { await assets(); } catch (_) { }
  S.ready = true; rebuild();
}
function rebuild() {
  if (!S.ready) return;
  const m = phoneW() ? MODES.M : MODES.D;
  if (S.E) { S.E.dispose(); S.E = null; }
  if (S.flat) { S.flat.dispose(); S.flat = null; }
  S.mode = m; ui();
  if (calm() || !webgl()) { S.flat = Flat(m); A.classList.add('b3-ready', 'b3-flat'); ui(); layoutPin(); S.onScroll(); return; }
  A.classList.remove('b3-flat'); layoutPin(); S.onScroll();
  start3D(m).catch(err => { console.warn('book3d: עובר לגרסה השטוחה', err); if (S.E) { try { S.E.dispose(); } catch (_) { } S.E = null; } S.flat = Flat(m); A.classList.add('b3-ready', 'b3-flat'); ui(); layoutPin(); S.onScroll(); });
}
function resize() {
  if (!S.ready) return;
  const want = phoneW() ? 'M' : 'D';
  if (!S.mode || want !== S.mode.k) { rebuild(); return; }
  if (S.E) S.E.size(); if (S.flat) S.flat.size();
}
function webgl() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (_) { return false; }
}

/* ================================== הגרסה השטוחה (גיבוי) ================================== */
function Flat(m) {
  const st = S.stage, box = document.createElement('div'); box.className = 'b3-fl'; st.appendChild(box);
  const cache = {}, specs = leafSpecs(m);
  // הכפולה במצב cur: [ימין, שמאל]
  const facesAt = cur => {
    if (m.ph) { const f = specs[clamp(cur, 1, MAXC) - 1]; return [null, f.f]; }
    const c = clamp(cur, 1, MAXC), r = c === 1 ? { k: 'ep', w: 'f' } : specs[c - 2].b, l = c === MAXC ? { k: 'ep', w: 'b' } : specs[c - 1].f;
    return [r, l];
  };
  const draw = sp => { if (!sp) return null; const key = sp.k + (sp.b != null ? sp.b : '') + (sp.s || '') + (sp.w || ''); if (cache[key]) return cache[key];
    if (sp.k === 'ep') { const c = endpaper(m.cw, m.ch, sp.w); return cache[key] = { c, R: [] }; }
    return cache[key] = paint(sp, m); };
  let shown = -1;
  function show(cur) {
    const fs = facesAt(cur); box.innerHTML = '';
    const sp = document.createElement('div'); sp.className = 'b3-fs' + (m.ph ? ' one' : '');
    fs.slice().reverse().forEach((f, i) => {                          // בתצוגה: שמאל ואז ימין
      if (!f) return; const p = draw(f), w = document.createElement('div'); w.className = 'b3-fp ' + (m.ph || i === 0 ? 'l' : 'r');
      const c = p.c; c.className = 'b3-fc'; w.appendChild(c); sp.appendChild(w);
      c.onclick = e => { const r = c.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height; const h = p.R.find(z => u >= z.x0 && u <= z.x1 && v >= z.y0 && v <= z.y1); if (h) act(h.a); };
      c.style.cursor = 'default';
      c.onmousemove = e => { const r = c.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height; const h = p.R.find(z => u >= z.x0 && u <= z.x1 && v >= z.y0 && v <= z.y1); c.style.cursor = h ? (h.a.t === 'ph' ? 'zoom-in' : 'pointer') : 'default'; };
    });
    box.appendChild(sp); shown = cur; size();
    if (!calm()) sp.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
  }
  function size() {
    const r = st.getBoundingClientRect(), n = m.ph ? 1 : 2, asp = m.ch / m.cw;
    const w = Math.min((r.width - 12) / n, (r.height - 24) / asp), sp = $('.b3-fs', box);
    if (sp) { sp.style.width = (w * n) + 'px'; sp.style.height = (w * asp) + 'px'; }
  }
  // החלקה בטלפון
  let sx = null;
  box.addEventListener('pointerdown', e => { sx = [e.clientX, e.clientY]; });
  box.addEventListener('pointerup', e => { if (!sx) return; const dx = e.clientX - sx[0], dy = e.clientY - sx[1]; sx = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { S.used = true; go(S.cur + (dx > 0 ? 1 : -1)); } });
  if (!S.cur) { S.cur = 1; }
  show(S.cur);
  return { go: c => show(c), size, dispose: () => box.remove() };
}

/* ================================== התלת ממד ================================== */
let THREE = null;
async function start3D(m) {
  if (!THREE) THREE = await import(CDN);
  if (S.mode !== m || S.E) return;
  S.E = Engine(m);
  A.classList.add('b3-ready'); ui();
}

function Engine(m) {
  const T = THREE, cv = S.cv, W = 1, H = m.H, J = m.J, pt = m.pt, th = pt * .97;
  const bt = .024, o = .022, TT = J * pt, Sw = 2 * bt + TT, g = .07, y0 = bt + .0015;
  const N = 48, MR = 6, ds = W / N;
  const ren = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
  ren.setClearColor(0x000000, 0); ren.outputColorSpace = T.SRGBColorSpace; ren.toneMapping = T.NoToneMapping;
  ren.shadowMap.enabled = true; ren.shadowMap.type = T.PCFShadowMap;
  const aniso = Math.min(8, ren.capabilities.getMaxAnisotropy());
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 60);
  const disp = [];                                                   // כל מה שצריך לשחרר
  const keep = x => (disp.push(x), x);

  /* ---------- סביבה ואור ---------- */
  {
    const es = new T.Scene(), bx = new T.Mesh(new T.BoxGeometry(12, 12, 12), new T.MeshBasicMaterial({ color: 0x4a2c1a, side: T.BackSide })); es.add(bx);
    const pan = (w, h, c, k, p) => { const q = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k), side: T.DoubleSide })); q.position.set(p[0], p[1], p[2]); q.lookAt(0, 0, 0); es.add(q); };
    pan(5, 3.4, 0xfff0dc, 4, [-2.6, 5, 2.2]); pan(3, 4, 0xffd8a2, 1.6, [5, 1.6, -1.4]); pan(7, 2.2, 0xfff4e6, 1.1, [0, 2.4, 5.4]); pan(4, 2, 0xffe2b8, 1.2, [-5, 1.2, -2]);
    pan(9, 9, 0xfff5ea, 1.1, [0, 5.8, -.4]); pan(7, 3, 0xfff0d8, 2.4, [-.6, 3.6, -5.2]); pan(4, 3, 0xffd9a8, 1.3, [4.6, 3.2, 3]);
    const fl = new T.Mesh(new T.PlaneGeometry(12, 12), new T.MeshBasicMaterial({ color: 0x5c2e17 })); fl.rotation.x = -Math.PI / 2; fl.position.y = -1.2; es.add(fl);
    const pm = new T.PMREMGenerator(ren); const env = pm.fromScene(es, .04); scene.environment = keep(env.texture); pm.dispose();
    es.traverse(q => { if (q.geometry) q.geometry.dispose(); if (q.material) q.material.dispose(); });
  }
  scene.add(new T.HemisphereLight(0xfffaf4, 0x5a2c16, .32));
  const key = new T.SpotLight(0xfff8f0, 1.86, 0, .62, .9, 0);
  key.position.set(-1.9, 4.9, 2.5); key.target.position.set(.06, 0, -.08); key.castShadow = true; key.shadow.focus = .55;
  key.shadow.mapSize.set(m.ph ? 1024 : 2048, m.ph ? 1024 : 2048);
  Object.assign(key.shadow.camera, { near: 1, far: 14 });
  key.shadow.bias = -.0005; key.shadow.normalBias = .012; key.shadow.radius = m.ph ? 3 : 4;
  scene.add(key, key.target);
  // השולחן: רק הצל נראה, על רקע השוקולד של האתר. וכתם אור חם רך מתחת לספר
  const tableM = keep(new T.ShadowMaterial({ color: 0x160601, opacity: .55 }));
  const table = new T.Mesh(keep(new T.PlaneGeometry(14, 14)), tableM); table.rotation.x = -Math.PI / 2; table.position.y = -.0006; table.receiveShadow = true; scene.add(table);
  const radial = (stops) => { const c = mk(256, 256), x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(s => gr.addColorStop(s[0], s[1])); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); const t = keep(new T.CanvasTexture(c)); t.colorSpace = T.SRGBColorSpace; return t; };
  const pool = new T.Mesh(keep(new T.PlaneGeometry(1, 1)), keep(new T.MeshBasicMaterial({ map: radial([[0, 'rgba(255,226,180,.13)'], [.5, 'rgba(255,214,160,.05)'], [1, 'rgba(255,214,160,0)']]), transparent: true, depthWrite: false })));
  pool.rotation.x = -Math.PI / 2; pool.position.y = -.002; pool.renderOrder = -2; scene.add(pool);
  const blob = new T.Mesh(keep(new T.PlaneGeometry(1, 1)), keep(new T.MeshBasicMaterial({ map: radial([[0, 'rgba(16,5,1,.62)'], [.5, 'rgba(16,5,1,.4)'], [1, 'rgba(16,5,1,0)']]), transparent: true, depthWrite: false })));
  blob.rotation.x = -Math.PI / 2; blob.position.y = -.001; blob.renderOrder = -1;

  /* ---------- חומרים ---------- */
  const tex = (c, srgb) => { const t = new T.CanvasTexture(c); if (srgb !== false) t.colorSpace = T.SRGBColorSpace; t.anisotropy = aniso; return t; };
    const edgeM = keep(new T.MeshStandardMaterial({ color: 0x6a3d25, roughness: .88, metalness: 0, envMapIntensity: .8 }));
  const gl = mk(4, 16), glx = gl.getContext('2d'); glx.fillStyle = '#fff'; glx.fillRect(0, 0, 4, 16); glx.fillStyle = '#7a6040'; glx.fillRect(0, 0, 4, 3);
  const glT = keep(tex(gl)); glT.anisotropy = 1;
  const gildM = keep(new T.MeshStandardMaterial({ map: glT, color: 0xDDB462, metalness: .8, roughness: .34, envMapIntensity: 1.15 }));
  // מימדי הכריכה לפי הדפים (חישוב מדויק אחרי בניית צורת המנוחה, ראו למטה)
  let Wb = W + o, Hb = H + 2 * o;

  /* ---------- העלים ---------- */
  const specs = leafSpecs(m);
  const G0 = (N + 1) * (MR + 1), NE = 2 * (MR + 1) + 4 * (N + 1), NV = 2 * G0 + NE;
  const E0 = 2 * G0, H0 = E0 + 2 * (MR + 1), T0 = H0 + 2 * (N + 1);
  const baseIdx = [], baseUV = new Float32Array(NV * 2);
  {
    const f = (i, r) => r * (N + 1) + i, b = (i, r) => G0 + r * (N + 1) + i;
    for (let r = 0; r < MR; r++) for (let i = 0; i < N; i++) baseIdx.push(f(i, r), f(i + 1, r), f(i, r + 1), f(i + 1, r), f(i + 1, r + 1), f(i, r + 1));
    for (let r = 0; r < MR; r++) for (let i = 0; i < N; i++) baseIdx.push(b(i, r), b(i, r + 1), b(i + 1, r), b(i + 1, r), b(i, r + 1), b(i + 1, r + 1));
    for (let r = 0; r < MR; r++) { const a = E0 + 2 * r; baseIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    for (let i = 0; i < N; i++) { const a = H0 + 2 * i; baseIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    for (let i = 0; i < N; i++) { const a = T0 + 2 * i; baseIdx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    for (let r = 0; r <= MR; r++) for (let s2 = 0; s2 < 2; s2++) { const q = E0 + 2 * r + s2; baseUV[2 * q] = r / MR; baseUV[2 * q + 1] = s2; }
    for (let i = 0; i <= N; i++) for (let s2 = 0; s2 < 2; s2++) { let q = H0 + 2 * i + s2; baseUV[2 * q] = i / N; baseUV[2 * q + 1] = s2; q = T0 + 2 * i + s2; baseUV[2 * q] = i / N; baseUV[2 * q + 1] = s2; }
    for (let r = 0; r <= MR; r++) for (let i = 0; i <= N; i++) {
      const k1 = f(i, r), k2 = b(i, r), v = 1 - r / MR;
      baseUV[2 * k1] = 1 - i / N; baseUV[2 * k1 + 1] = v; baseUV[2 * k2] = i / N; baseUV[2 * k2 + 1] = v;
    }
  }
  const WC = new Float32Array(N); for (let i = 0; i < N; i++) WC[i] = Math.pow((i + .5) / N, 1.35);
  const blankT = { L: keep(tex(paint({ k: 'blank', s: 'L' }, m).c)), R: keep(tex(paint({ k: 'blank', s: 'R' }, m).c)) };
  const pageMat = t => new T.MeshStandardMaterial({ map: t, roughness: .62, metalness: 0, envMapIntensity: .42 });
  const leaves = [];
  const book = new T.Group(); scene.add(book); book.add(blob);
  for (let j = 1; j <= J; j++) {
    const geo = new T.BufferGeometry(), pos = new Float32Array(NV * 3), nrm = new Float32Array(NV * 3);
    geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nrm, 3));
    geo.setAttribute('uv', new T.BufferAttribute(baseUV.slice(), 2)); geo.setIndex(baseIdx);
    const nq = N * MR * 6; geo.addGroup(0, nq, 0); geo.addGroup(nq, nq, 1); geo.addGroup(2 * nq, baseIdx.length - 2 * nq, 2);
    const mf = pageMat(blankT.L), mb = pageMat(blankT.R);
    const mesh = new T.Mesh(geo, [mf, mb, gildM]); mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false;
    mesh.userData.j = j; book.add(mesh);
    const ang = []; for (let r = 0; r <= MR; r++) ang.push(new Float32Array(N));
    leaves.push({ j, geo, pos, nrm, mesh, mf, mb, ang, aL: new Float32Array(N), aR: new Float32Array(N), sp: specs[j - 1], tx: null, R: { f: [], b: [] } });
  }
  // מצב התנועה: 0 = הכריכה, 1..J = העלים
  const items = []; for (let i = 0; i <= J; i++) items.push({ e: 0, target: 0, tw: null, dir: 1, k: 0, tz: 0, p: 0, pt: 0, drag: false, dirty: true });

  // שורש העלה בשדרה: בספר סגור הוא בצד הספר, ובפתוח הוא יושב לרוחב השדרה
  const Lj = j => bt + (J - j + .5) * pt, hLj = j => bt + (J - j + .5) * pt, hRj = j => bt + (j - .5) * pt;
  let bAng = 0; const BOW = .016;
  function rest(out, xr, yr, h, xf, side) {
    const run = Math.max(.02, Math.abs(xr - xf)), dy = h - yr; let lo = -1.2, hi = 1.5, be = 0;
    for (let it = 0; it < 24; it++) {
      be = (lo + hi) / 2; let y = 0;
      for (let i = 0; i < N; i++) { const s = (i + .5) * ds, f = s < run ? 1 - s / run : 0; y += ds * Math.sin(be * f * f); }
      if (y > dy) hi = be; else lo = be;
    }
    const bow = BOW * Math.sin(bAng), k2 = Math.PI / W;
    for (let i = 0; i < N; i++) { const s = (i + .5) * ds, f = s < run ? 1 - s / run : 0, sl = bow * k2 * Math.cos(k2 * s); out[i] = side < 0 ? Math.PI - be * f * f - sl : be * f * f + sl; }
  }
  // צורת העלה: אינטרפולציה בין מנוחה משמאל למנוחה מימין, ועליה קימור (הקצה מוביל כשמרימים, נגרר כשנופל) וסיבוב קל מהפינה
  const lead = u => { u = clamp(u / .58, 0, 1); return Math.pow(Math.sin(Math.PI * u), 1.3); };
  const lag = u => { u = clamp((u - .4) / .6, 0, 1); return Math.pow(Math.sin(Math.PI * u), 1.5); };
  let be = 0;                                                       // סיבוב השדרה (0 סגור, π/2 פתוח)
  function leafShape(L) {
    bAng = be; const it = items[L.j], sb = Math.sin(be), rx = Lj(L.j) * sb, ryF = Lj(L.j) * Math.cos(be) + y0 * sb * sb;
    rest(L.aL, rx, ryF, hLj(L.j), -g * Math.sin(be), -1);
    rest(L.aR, rx, ryF, hRj(L.j), Sw + g, 1);
    const pk = it.p * .022, e = clamp(it.e + (it.target ? -pk : pk), 0, 1), b2 = sm(e);
    for (let r = 0; r <= MR; r++) {
      const zn = r / MR * 2 - 1, A = L.ang[r], kk = it.k + it.tz * zn;
      for (let i = 0; i < N; i++) A[i] = L.aL[i] + (L.aR[i] - L.aL[i]) * b2 + kk * WC[i];
    }
    L.root = [rx, ryF];
  }
  function leafGeo(L) {
    const P = L.pos, Nn = L.nrm, h2 = th / 2, [x0, y0r] = L.root;
    for (let r = 0; r <= MR; r++) {
      const A = L.ang[r], z = -H / 2 + r * H / MR; let px = x0, py = y0r;
      for (let i = 0; i <= N; i++) {
        const av = i === 0 ? A[0] : i === N ? A[N - 1] : (A[i - 1] + A[i]) * .5, nx = Math.sin(av), ny = -Math.cos(av);
        let k = 3 * (r * (N + 1) + i); P[k] = px + nx * h2; P[k + 1] = py + ny * h2; P[k + 2] = z; Nn[k] = nx; Nn[k + 1] = ny; Nn[k + 2] = 0;
        k = 3 * (G0 + r * (N + 1) + i); P[k] = px - nx * h2; P[k + 1] = py - ny * h2; P[k + 2] = z; Nn[k] = -nx; Nn[k + 1] = -ny; Nn[k + 2] = 0;
        if (i === N) { const tx = Math.cos(A[N - 1]), ty = Math.sin(A[N - 1]); for (let s = 0; s < 2; s++) { const q = 3 * (E0 + 2 * r + s), sg = s ? -1 : 1; P[q] = px + sg * nx * h2; P[q + 1] = py + sg * ny * h2; P[q + 2] = z; Nn[q] = tx; Nn[q + 1] = ty; Nn[q + 2] = 0; } }
        if (r === 0 || r === MR) { const B = r ? T0 : H0; for (let s = 0; s < 2; s++) { const q = 3 * (B + 2 * i + s), sg = s ? -1 : 1; P[q] = px + sg * nx * h2; P[q + 1] = py + sg * ny * h2; P[q + 2] = z; Nn[q] = 0; Nn[q + 1] = 0; Nn[q + 2] = r ? 1 : -1; } }
        if (i < N) { px += ds * Math.cos(A[i]); py += ds * Math.sin(A[i]); }
      }
    }
    L.geo.attributes.position.needsUpdate = true; L.geo.attributes.normal.needsUpdate = true; L.geo.boundingSphere = null; L.geo.boundingBox = null;
  }
  // רוחב הכריכה לפי קצות הדפים בפועל
  {
    be = Math.PI / 2; const Lf = leaves[J - 1]; leafShape(Lf); let px = Lf.root[0]; for (let i = 0; i < N; i++) px += ds * Math.cos(Lf.aL[i]);
    const L1 = leaves[0]; leafShape(L1); let qx = L1.root[0]; for (let i = 0; i < N; i++) qx += ds * Math.cos(L1.aR[i]);
    Wb = Math.max(-px + o, qx - Sw + o); be = 0;
  }

  /* ---------- הכריכות והשדרה ---------- */
  const boardGeo = (front) => {
    const gq = new T.BoxGeometry(Wb, bt, Hb); gq.translate(front ? Wb / 2 : -Wb / 2, bt / 2, 0);
    const p = gq.attributes.position, n = gq.attributes.normal, uv = gq.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const ny = n.getY(i), x = p.getX(i), z = p.getZ(i); if (Math.abs(ny) < .5) continue;
      if (front) uv.setXY(i, ny > 0 ? 1 - x / Wb : x / Wb, .5 + z / Hb); else uv.setXY(i, (x + Wb) / Wb, .5 - z / Hb);
    }
    return keep(gq);
  };
  const cw = 1024, chh = Math.round(cw * Hb / Wb);
  const cs = coverSet(cw, chh, 'front');
  const coverM = keep(new T.MeshStandardMaterial({ map: keep(tex(cs.col)), roughnessMap: keep(tex(cs.orm, false)), metalnessMap: keep(tex(cs.orm, false)), bumpMap: keep(tex(cs.bmp, false)), bumpScale: 1.2, roughness: 1, metalness: 1, envMapIntensity: 1.25 }));
  const backCs = coverSet(512, Math.round(512 * Hb / Wb), 'back');
  const backM = keep(new T.MeshStandardMaterial({ map: keep(tex(backCs.col)), roughness: .9, metalness: 0 }));
  const tfx = (o + .012) / Wb, tfy = (o + .012) / Hb;
  const epF = keep(new T.MeshStandardMaterial({ map: keep(tex(endpaper(m.cw, Math.round(m.cw * Hb / Wb), 'f', tfx, tfy))), roughness: .72, metalness: 0, envMapIntensity: .5 }));
  const epB = keep(new T.MeshStandardMaterial({ map: keep(tex(endpaper(m.cw, Math.round(m.cw * Hb / Wb), 'b', tfx, tfy))), roughness: .72, metalness: 0, envMapIntensity: .5 }));
  const backBoard = new T.Mesh(boardGeo(false), [edgeM, edgeM, epB, backM, edgeM, edgeM]); backBoard.castShadow = backBoard.receiveShadow = true; book.add(backBoard);
  const pivot = new T.Group(), frontBoard = new T.Mesh(boardGeo(true), [edgeM, edgeM, coverM, epF, edgeM, edgeM]);
  frontBoard.rotation.x = Math.PI; frontBoard.castShadow = frontBoard.receiveShadow = true; pivot.add(frontBoard); book.add(pivot);
  // השדרה: רצועת בד מעוגלת בין שתי הכריכות
  const SN = 18, spGeo = new T.BufferGeometry(), spPos = new Float32Array((SN + 1) * 2 * 3), spN = new Float32Array((SN + 1) * 2 * 3), spUV = new Float32Array((SN + 1) * 2 * 2), spI = [];
  for (let i = 0; i <= SN; i++) { spUV[4 * i] = i / SN; spUV[4 * i + 1] = 0; spUV[4 * i + 2] = i / SN; spUV[4 * i + 3] = 1; if (i < SN) { const a = 2 * i; spI.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  spGeo.setAttribute('position', new T.BufferAttribute(spPos, 3)); spGeo.setAttribute('normal', new T.BufferAttribute(spN, 3)); spGeo.setAttribute('uv', new T.BufferAttribute(spUV, 2)); spGeo.setIndex(spI); keep(spGeo);
  const ss = coverSet(256, Math.round(256 * Hb / (Sw * 1.25)), 'sp');
  const spM = keep(new T.MeshStandardMaterial({ map: keep(tex(ss.col)), roughnessMap: keep(tex(ss.orm, false)), metalnessMap: keep(tex(ss.orm, false)), bumpMap: keep(tex(ss.bmp, false)), bumpScale: 1, roughness: 1, metalness: 1, envMapIntensity: 1.2 }));
  const spine = new T.Mesh(spGeo, spM); spine.castShadow = true; spine.frustumCulled = false; book.add(spine);
  const spIn = new T.Mesh(spGeo, keep(new T.MeshStandardMaterial({ color: 0x2c1408, roughness: .95, metalness: 0, side: T.BackSide }))); spIn.frustumCulled = false; book.add(spIn);

  // קפיטל: רצועה קטנה בפסים של זהב ושוקולד בראש ובתחתית הגב של הדפים
  const hbC = mk(64, 8), hbx = hbC.getContext('2d'); for (let i = 0; i < 16; i++) { hbx.fillStyle = i % 2 ? '#E2C276' : '#5A2C16'; hbx.fillRect(i * 4, 0, 4, 8); }
  const hbT = keep(tex(hbC)); hbT.wrapS = T.RepeatWrapping; hbT.repeat.set(3, 1);
  const hbM = keep(new T.MeshStandardMaterial({ map: hbT, roughness: .5, metalness: .25, envMapIntensity: .9 }));
  const hbG = keep(new T.CylinderGeometry(.0062, .0062, 1, 10, 1)); hbG.rotateZ(Math.PI / 2);
  const bands = [-1, 1].map(sg => { const q = new T.Mesh(hbG, hbM); q.userData.sg = sg; q.castShadow = true; book.add(q); return q; });
  function coverPose() {
    const al = Math.PI * (1 - sm(items[0].e));
    be = (Math.PI - al) / 2;
    const s = Math.sin(be), c = Math.cos(be), Lf = bt + TT;
    const P = [Lf * s + bt * s, Lf * c + bt * (1 - c)];
    pivot.position.set(P[0], P[1], 0); pivot.rotation.z = al;
    // השדרה: מנקודת הכריכה האחורית אל הקצה החיצוני של הקדמית
    const Q = [P[0] + Math.sin(al) * bt, P[1] - Math.cos(al) * bt], Aa = [0, 0];
    const dx = Q[0] - Aa[0], dy = Q[1] - Aa[1], len = Math.hypot(dx, dy) || 1, nx = dy / len, ny = -dx / len, bul = .26 * Sw * (1 - s * s);
    const cxp = (Aa[0] + Q[0]) / 2 + nx * 2 * bul, cyp = (Aa[1] + Q[1]) / 2 + ny * 2 * bul;
    for (let i = 0; i <= SN; i++) {
      const t = i / SN, u = 1 - t, x = u * u * Aa[0] + 2 * u * t * cxp + t * t * Q[0], y = u * u * Aa[1] + 2 * u * t * cyp + t * t * Q[1] + .001;
      const tx = 2 * u * (cxp - Aa[0]) + 2 * t * (Q[0] - cxp), ty = 2 * u * (cyp - Aa[1]) + 2 * t * (Q[1] - cyp), tl = Math.hypot(tx, ty) || 1;
      for (let s2 = 0; s2 < 2; s2++) { const k = 3 * (2 * i + s2); spPos[k] = x; spPos[k + 1] = y; spPos[k + 2] = s2 ? Hb / 2 : -Hb / 2; spN[k] = ty / tl; spN[k + 1] = -tx / tl; spN[k + 2] = 0; }
    }
    spGeo.attributes.position.needsUpdate = true; spGeo.attributes.normal.needsUpdate = true; spGeo.boundingSphere = null;
    // הקפיטל לאורך קו השורשים של העלים
    const sb = Math.sin(be), r1 = [Lj(1) * sb, Lj(1) * Math.cos(be) + y0 * sb * sb], rJ = [Lj(J) * sb, Lj(J) * Math.cos(be) + y0 * sb * sb];
    const mx = (r1[0] + rJ[0]) / 2, my = (r1[1] + rJ[1]) / 2, ln = Math.hypot(r1[0] - rJ[0], r1[1] - rJ[1]) + pt, an = Math.atan2(r1[1] - rJ[1], r1[0] - rJ[0]);
    bands.forEach(q => { q.position.set(mx + Math.sin(an) * .0045, my - Math.cos(an) * .0045, q.userData.sg * (H / 2 + .0035)); q.rotation.z = an; q.scale.set(ln, 1, 1); });
  }

  /* ---------- טקסטורות הדפים: רק לעלים הקרובים לעמוד הנוכחי ---------- */
  const near = new Set();
  function texFor(L) {
    if (L.tx) return;
    const f = paint(L.sp.f, m), b = paint(L.sp.b, m);
    L.tx = { f: tex(f.c), b: L.sp.b.k === 'blank' ? null : tex(b.c) }; L.R = { f: f.R, b: b.R };
    L.mf.map = L.tx.f; L.mb.map = L.tx.b || blankT.R;
    try { ren.initTexture(L.tx.f); if (L.tx.b) ren.initTexture(L.tx.b); } catch (_) { }  // ההעלאה לכרטיס עכשיו, לא באמצע היפוך
  }
  function dropTex(L) { if (!L.tx) return; L.tx.f.dispose(); if (L.tx.b) L.tx.b.dispose(); L.tx = null; L.R = { f: [], b: [] }; L.mf.map = blankT.L; L.mb.map = blankT.R; }
  // ברגע הלחיצה מציירים רק את מה שנחשף בהיפוך. השאר מוכן מראש בזמן פנוי, עלה אחד בכל פעם
  function textures(from, to) {
    const lo = Math.min(from, to) - 1, hi = Math.max(from, to);
    leaves.forEach(L => { if (L.j >= lo && L.j <= hi) texFor(L); });
    prefetch();
  }
  let pf = 0;
  const idle = f => window.requestIdleCallback ? requestIdleCallback(f, { timeout: 400 }) : setTimeout(f, 80);
  function prefetch() {
    if (pf || dead) return; pf = 1;
    idle(function step() {
      pf = 0; if (dead) return;
      if (items.some(it => it.tw || it.drag)) { pf = 1; setTimeout(() => idle(step), 250); return; }   // לא באמצע תנועה
      const c = S.cur;
      // הקרובים קודם, ואחר כך כל השאר (כדי שגם קפיצה מתוכן העניינים תהיה חלקה)
      const order = leaves.map(L => L.j).sort((a, b) => Math.abs(a - c - .4) - Math.abs(b - c - .4));
      for (const j of order) {
        const L = leaves[j - 1];
        if (L && !L.tx) { texFor(L); wake(); pf = 1; idle(step); return; }
      }
    });
  }

  /* ---------- מצלמה ותנוחה ---------- */
  const ph = m.ph;
  const P0 = ph ? { el: 50, az: 14, yaw: -4 } : { el: 37, az: 22, yaw: -8 };
  const P1 = ph ? { el: 60, az: 0, yaw: 0 } : { el: 55, az: 0, yaw: 0 };
  const cxC = -Wb / 2, cxO = ph ? (-Wb + Sw / 2 + .06) / 2 : Sw / 2;
  let fitC = null, fitO = null, vw = 1, vh = 1, ext = { t: 0, b: 0 };
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  function poseBook(q) {
    const yaw = lerp(P0.yaw, P1.yaw, q) * Math.PI / 180, c = lerp(cxC, cxO, q);
    book.rotation.y = yaw; book.position.set(-c * Math.cos(yaw), 0, c * Math.sin(yaw));
    book.updateMatrixWorld(true);
  }
  function placeCam(d, el, az) {
    const e = el * Math.PI / 180, a = az * Math.PI / 180;
    cam.position.set(d * Math.cos(e) * Math.sin(a), d * Math.sin(e), d * Math.cos(e) * Math.cos(a));
    cam.lookAt(0, 0, 0); cam.updateMatrixWorld(); cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
  }
  function fit(q, box, P) {
    poseBook(q);
    const pts = []; for (let i = 0; i < 8; i++) pts.push(new T.Vector3(i & 1 ? box[1] : box[0], i & 2 ? box[3] : box[2], i & 4 ? box[5] : box[4]).applyMatrix4(book.matrixWorld));
    cam.clearViewOffset(); cam.aspect = vw / vh; cam.updateProjectionMatrix();
    const mg = ph ? { l: ext.l + .012, r: ext.r, t: ext.t + .03, b: ext.b + .03 } : { l: ext.l + .03, r: ext.r + .03, t: ext.t + .03, b: ext.b + .035 };
    const bnd = () => { let x0 = 9, x1 = -9, y1 = -9, y2 = 9; pts.forEach(p => { const v = p.clone().project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y2 = Math.min(y2, v.y); y1 = Math.max(y1, v.y); }); return [x0, x1, y2, y1]; };
    let lo = .5, hi = 60;
    for (let it = 0; it < 30; it++) { const d = (lo + hi) / 2; placeCam(d, P.el, P.az); const b = bnd(); if (b[1] - b[0] <= 2 - mg.l - mg.r && b[3] - b[2] <= 2 - mg.t - mg.b) hi = d; else lo = d; }
    placeCam(hi, P.el, P.az); const b = bnd();
    return { d: hi, sx: (mg.l - mg.r) / 2 - (b[0] + b[1]) / 2, sy: (mg.b - mg.t) / 2 - (b[2] + b[3]) / 2 };
  }
  function size() {
    // הקנבס: כל רוחב החלק ועוד שוליים, וגבוה מהבמה (מקום לדף שעומד באמצע ההיפוך ולצל שלו)
    const ar = A.getBoundingClientRect(), r = S.stage.getBoundingClientRect(), px = ph ? (innerWidth - ar.width) / 2 : Math.min(44, (innerWidth - ar.width) / 2);
    // לא עולה מעל תחילת החלק (כדי לא לכסות לחיצות בחלק הקודם)
    const top = r.top - ar.top - (ph ? .3 : .4) * r.height, bot = r.bottom - ar.top + (ph ? .05 : .14) * r.height;
    Object.assign(cv.style, { left: -px + 'px', width: (ar.width + 2 * px) + 'px', top: top + 'px', height: (bot - top) + 'px' });
    const cr = cv.getBoundingClientRect();
    vw = Math.max(50, Math.round(cr.width)); vh = Math.max(50, Math.round(cr.height));
    ren.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); ren.setSize(vw, vh, false);
    // הקנבס גבוה מהבמה (מקום לדף שעומד באמצע ההיפוך): השוליים בתוך הבמה בלבד
    ext = { t: 2 * Math.max(0, r.top - cr.top) / vh, b: 2 * Math.max(0, cr.bottom - r.bottom) / vh, l: 2 * Math.max(0, r.left - cr.left) / vw, r: 2 * Math.max(0, cr.right - r.right) / vw };
    const zz = Hb / 2 + .01;
    fitC = fit(0, [-Wb - .01, .05 + .1 * Sw, 0, Sw + .01, -zz, zz], P0);
    fitO = fit(1, ph ? [-Wb + .012, Sw / 2 + .055, 0, .1, -zz, zz] : [-Wb - .01, Sw + Wb + .01, 0, .1, -zz, zz], P1);
    camPose(); wake();
  }
  function camPose() {
    const q = sm(items[0].e);
    poseBook(q);
    const el = lerp(P0.el, P1.el, q) + tilt.y, az = lerp(P0.az, P1.az, q) + tilt.x;
    placeCam(lerp(fitC.d, fitO.d, q), el, az);
    const sx = lerp(fitC.sx, fitO.sx, q), sy = lerp(fitC.sy, fitO.sy, q);
    cam.aspect = vw / vh; cam.setViewOffset(vw, vh, -sx * vw / 2, sy * vh / 2, vw, vh); cam.updateProjectionMatrix();
    // הצל והאור מתחת לספר עוקבים אחרי הגודל שלו
    const wbk = lerp(Wb, 2 * Wb + Sw, q), cxx = lerp(-Wb / 2, Sw / 2, q);
    blob.scale.set(wbk * 1.18, Hb * 1.22, 1); blob.position.x = cxx; blob.position.z = .03;
    pool.scale.set(wbk * 1.55, Hb * 1.9, 1); pool.position.x = 0;
  }

  /* ---------- תנועה ---------- */
  let clock = 0, dead = false, vis = S.vis, raf = 0, lastT = 0;
  const easeIO = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  function schedule(to, from) {
    const fwd = to > from, multi = Math.abs(to - from) > 1, list = [];
    for (let i = 0; i <= J; i++) { const t = i < to ? 1 : 0; if (items[i].target !== t || (items[i].tw && items[i].tw.to !== t) || (!items[i].tw && Math.abs(items[i].e - t) > 1e-3)) list.push(i); }
    if (!fwd) list.reverse();
    list.forEach((i, k) => {
      const it = items[i], t = i < to ? 1 : 0; it.target = t;
      if (Math.abs(it.e - t) < 1e-4 && !it.tw) return;
      let dur = (i === 0 ? (multi ? 1 : 1.45) : (multi ? .62 : 1)) * Math.max(.4, Math.abs(t - it.e));
      let st = clock + k * (multi ? .12 : 0);
      const nb = items[fwd ? i - 1 : i + 1];
      if (nb && nb.tw && nb.tw.to === (fwd ? 1 : 0) && i) { st = Math.max(st, nb.tw.st + .1); dur = Math.max(dur, nb.tw.st + nb.tw.dur + .08 - st); }
      it.tw = { from: it.e, to: t, st, dur }; it.dir = t > it.e ? 1 : -1; it.p = it.pt = 0;
    });
    textures(from, to); wake();
  }
  function stepItems(dt) {
    let busy = false, coverMoved = false;
    items.forEach((it, i) => {
      const e0 = it.e, k0 = it.k, tz0 = it.tz, p0 = it.p;
      let kt = 0, tzt = 0;
      if (it.tw) {
        busy = true;
        if (clock >= it.tw.st) {
          const p = clamp((clock - it.tw.st) / it.tw.dur, 0, 1); it.e = it.tw.from + (it.tw.to - it.tw.from) * easeIO(p);
          if (p >= 1) { it.e = it.tw.to; it.tw = null; }
        }
        if (it.tw && clock >= it.tw.st) { const u = it.dir > 0 ? it.e : 1 - it.e; kt = -it.dir * .95 * lead(u) + it.dir * .5 * lag(u); tzt = -it.dir * .26 * lead(u); }
      } else if (it.scr && i) { const u = it.scr > 0 ? it.e : 1 - it.e, w = Math.pow(Math.sin(Math.PI * u), .8); kt = -it.scr * .62 * w; tzt = -it.scr * .18 * w; }
      else if (it.drag) { const u = it.dir > 0 ? it.e : 1 - it.e, w = Math.pow(Math.sin(Math.PI * u), .8); kt = -it.dir * .72 * w; tzt = -it.dir * .2 * w; busy = true; }
      if (!i) { kt = 0; tzt = 0; }
      // הצצה: הפינה מתרוממת כשהעכבר מעל הקצה
      it.p += (it.pt - it.p) * (1 - Math.exp(-dt * 10)); if (Math.abs(it.pt - it.p) < .002) it.p = it.pt;
      const pd = it.target ? 1 : -1;                                // דף משמאל: הקצה עולה כשהזווית קטנה. דף מימין: כשהיא גדלה
      kt += pd * .55 * it.p; tzt += pd * .3 * it.p;
      it.k += (kt - it.k) * (1 - Math.exp(-dt * 16)); it.tz += (tzt - it.tz) * (1 - Math.exp(-dt * 16));
      if (Math.abs(kt - it.k) < 5e-4) it.k = kt; if (Math.abs(tzt - it.tz) < 5e-4) it.tz = tzt;
      if (it.e !== e0 || it.k !== k0 || it.tz !== tz0 || it.p !== p0) { it.dirty = true; busy = true; if (!i) coverMoved = true; }
    });
    return { busy, coverMoved };
  }
  function update(dt) {
    clock += dt;
    // הכריכה בשליטת הגלילה: מתקרבים ליעד בהחלקה (גלגלת עם קפיצות לא נראית מקוטעת)
    let sbusy = false;
    if (S.scrub && S.scrub.on) {
      const d = scrubT - sT;
      if (d) { sT = Math.abs(d) < .0008 ? scrubT : sT + d * (1 - Math.exp(-dt * 9)); sdir = d > 0 ? 1 : -1; sbusy = true; }
      for (let i = 0; i <= Math.min(2, J); i++) {
        const it = items[i], e = clamp(sT - i, 0, 1); it.tw = null;
        if (it.e !== e) { it.e = e; it.dirty = true; }
        it.target = e > .5 ? 1 : 0; it.scr = e > 0 && e < 1 ? sdir : 0;
      }
      const c = (sT > .5) + (sT > 1.5) + (sT > 2.5);
      if (S.cur !== c) { S.cur = c; ui(); }
    } else items.forEach(it => { it.scr = 0; });
    const r = stepItems(dt);
    let busy = r.busy || sbusy;
    const tq = Math.abs(tilt.tx - tilt.x) + Math.abs(tilt.ty - tilt.y);
    if (tq > .002) { const q = 1 - Math.exp(-dt * 4.5); tilt.x += (tilt.tx - tilt.x) * q; tilt.y += (tilt.ty - tilt.y) * q; busy = true; } else { tilt.x = tilt.tx; tilt.y = tilt.ty; }
    if (r.coverMoved || items[0].dirty) { coverPose(); leaves.forEach(L => items[L.j].dirty = true); items[0].dirty = false; }
    leaves.forEach(L => { const it = items[L.j]; if (it.dirty) { leafShape(L); leafGeo(L); it.dirty = false; } });
    camPose();
    // סיום תנועה: מנקים טקסטורות רחוקות
    if (!busy && S.cur !== lastCur) { lastCur = S.cur; textures(S.cur, S.cur); }
    return busy;
  }
  let lastCur = S.cur;
  function loop(t) {
    raf = 0; if (dead) return;
    const dt = lastT ? Math.min(.05, (t - lastT) / 1000) : 1 / 60; lastT = t;
    const q0 = performance.now(), busy = update(dt), q1 = performance.now();
    ren.render(scene, cam);
    if (TEST) { const q2 = performance.now(); if (q2 - q0 > 25) console.log('book3d long frame at ' + Math.round(q0) + ': update ' + (q1 - q0).toFixed(1) + 'ms, render ' + (q2 - q1).toFixed(1) + 'ms'); }
    if (TEST) { const f = (window.__b3f = window.__b3f || []); f.push(t); if (f.length > 400) f.shift(); }
    if (busy && vis) raf = requestAnimationFrame(loop); else lastT = 0;
  }
  let ready = false;
  function wake(force) { if (!raf && (vis || force) && !dead && ready) raf = requestAnimationFrame(loop); }

  /* ---------- מצב התחלתי ---------- */
  let scrubT = 0, sT = 0, sdir = 1;
  items.forEach((it, i) => { const t = i < S.cur ? 1 : 0; it.e = it.target = t; });
  if (S.scrub && S.scrub.on) { scrubT = sT = S.scrub.p; for (let i = 0; i <= Math.min(2, J); i++) { items[i].e = clamp(sT - i, 0, 1); items[i].target = items[i].e > .5 ? 1 : 0; } S.cur = (sT > .5) + (sT > 1.5) + (sT > 2.5); }
  coverPose(); leaves.forEach(L => { leafShape(L); leafGeo(L); items[L.j].dirty = false; });
  textures(S.cur, Math.max(S.cur, 3));                              // גם השער, כי הגלילה יכולה לפתוח את הכריכה בכל רגע
  // השיידרים מהודרים ברקע, כדי שהטעינה לא תעצור את הגלילה
  requestAnimationFrame(() => { if (dead) return; size(); (ren.compileAsync ? ren.compileAsync(scene, cam) : Promise.resolve()).catch(() => { }).then(() => { if (!dead) { ready = true; wake(true); } }); });   // רינדור ראשון מיד (גם לפני שרואים), כדי שההעלאות יקרו מוקדם

  /* ---------- עכבר, מגע, גרירה ---------- */
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  const pickables = () => leaves.map(L => L.mesh).concat([frontBoard, backBoard]);
  function hit(cx, cy) {
    const r = cv.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const h = ray.intersectObjects(pickables(), false)[0]; if (!h) return null;
    const o2 = h.object, mi = h.face ? h.face.materialIndex : -1, uv = h.uv;
    if (o2 === frontBoard) return { kind: 'fb', face: mi === 2 ? 'out' : mi === 3 ? 'in' : 'e', u: uv && uv.x, v: uv && uv.y };
    if (o2 === backBoard) return { kind: 'bb', face: mi === 2 ? 'in' : 'e', u: uv && uv.x };
    const L = leaves[o2.userData.j - 1];
    return { kind: 'leaf', L, j: L.j, face: mi === 0 ? 'f' : mi === 1 ? 'b' : 'e', u: uv.x, v: uv.y };
  }
  function zone(h) {
    if (!h) return null;
    const cur = S.cur, idle = !items.some(it => it.tw || it.drag);
    if (h.kind === 'fb' && h.face === 'out' && !cur) return { z: 'open' };
    if (h.kind === 'leaf' && h.face === 'f' && h.j === cur) {
      const R = h.L.R.f, px = h.u, py = 1 - h.v, rg = R.find(z => px >= z.x0 && px <= z.x1 && py >= z.y0 && py <= z.y1);
      if (px < (ph ? .16 : .17)) return { z: 'next', j: h.j, idle };
      if (rg) return { z: 'reg', a: rg.a };
      return { z: 'page', side: 1 };
    }
    if (h.kind === 'leaf' && h.face === 'b' && h.j === cur - 1) {
      const R = h.L.R.b, px = h.u, py = 1 - h.v, rg = R.find(z => px >= z.x0 && px <= z.x1 && py >= z.y0 && py <= z.y1);
      if (px > .83) return { z: 'prev', j: h.j, idle };
      if (rg) return { z: 'reg', a: rg.a };
      return { z: 'page', side: -1 };
    }
    if (h.kind === 'fb' && h.face === 'in' && cur === 1) { if (h.u > .83) return { z: 'prev', j: 0, idle }; return { z: 'page', side: -1 }; }
    if (h.kind === 'bb' && h.face === 'in' && cur === MAXC) return { z: 'page', side: 1 };
    return null;
  }
  let hov = null, dg = null, moved = false;
  function peekTo(j, on) { items.forEach((it, i) => { it.pt = i === j && on && i ? 1 : 0; }); wake(); }
  function onMove(e) {
    if (dg) return drag(e);
    if (e.pointerType !== 'mouse') return;
    const zn = zone(hit(e.clientX, e.clientY));
    hitEl.style.cursor = !zn ? '' : zn.z === 'reg' ? (zn.a.t === 'ph' ? 'zoom-in' : 'pointer') : (zn.z === 'next' || zn.z === 'prev' || zn.z === 'open') ? 'pointer' : 'grab';
    const pk = zn && (zn.z === 'next' || zn.z === 'prev') && zn.idle ? zn.j : -1;
    if (pk !== hov) { hov = pk; peekTo(pk, pk >= 0); }
  }
  function spineScreen() {
    const v = new T.Vector3(Sw / 2, bt, 0).applyMatrix4(book.matrixWorld).project(cam), w = new T.Vector3(Sw / 2 + 1, bt, 0).applyMatrix4(book.matrixWorld).project(cam), r = cv.getBoundingClientRect();
    return { x: r.left + (v.x + 1) / 2 * r.width, pw: Math.abs(w.x - v.x) / 2 * r.width };
  }
  const hitEl = S.stage;
  const onDown = e => {
    if (e.button) return; moved = false;
    const zn = zone(hit(e.clientX, e.clientY)), busy = items.some(it => it.tw);
    dg = { x: e.clientX, y: e.clientY, id: e.pointerId, zn, busy, it: null, hist: [] };
  };
  function drag(e) {
    if (!dg || e.pointerId !== dg.id) return;
    const dx = e.clientX - dg.x, dy = e.clientY - dg.y;
    if (!dg.it) {
      if (Math.abs(dx) < 8) { if (Math.abs(dy) > 12) dg = null; return; }
      if (Math.abs(dx) < Math.abs(dy) * 1.15 || dg.busy) { dg = null; return; }
      let dir = dx > 0 ? 1 : -1;
      // במחשב: רק הדף שמתחת לעכבר, ורק לכיוון הטבעי שלו. בטלפון: החלקה בכל מקום
      if (!ph && dg.zn && dg.zn.side && dg.zn.side !== dir && dg.zn.z === 'page') { dg = null; return; }
      if (!ph && dg.zn && (dg.zn.z === 'next' && dir < 0 || dg.zn.z === 'prev' && dir > 0)) { dg = null; return; }
      if (!ph && !dg.zn) { dg = null; return; }
      const i = dir > 0 ? S.cur : S.cur - 1;
      if (dir > 0 && S.cur >= MAXC || dir < 0 && S.cur < 1) { dg = null; return; }
      moved = true;
      if (i === 0 || i > J) { dg = null; go(S.cur + dir); return; }   // הכריכה נפתחת ונסגרת בתנועה אחת
      peekTo(-1, false); hov = -1;
      manual(); const it = items[i]; it.drag = true; it.dir = dir; it.tw = null; it.scr = 0; dg.it = it; dg.i = i; dg.dir = dir;
      const sp = spineScreen(); dg.sx = sp.x; dg.r = Math.max(Math.abs(dg.x - sp.x), sp.pw * .35); dg.pw = sp.pw;
      try { hitEl.setPointerCapture(e.pointerId); } catch (_) { }
      textures(S.cur, S.cur + dir);
    }
    const it = dg.it;
    let e2;
    if (ph) e2 = dg.dir > 0 ? clamp(dx / (dg.pw * 1.1), 0, 1) : 1 - clamp(-dx / (dg.pw * 1.1), 0, 1);
    else e2 = Math.acos(clamp((dg.sx - e.clientX) / dg.r, -1, 1)) / Math.PI;
    it.e = clamp(e2, 0, 1); it.dirty = true;
    dg.hist.push([e.timeStamp, it.e]); while (dg.hist.length > 2 && e.timeStamp - dg.hist[0][0] > 90) dg.hist.shift();
    wake();
  }
  function up(e) {
    const d = dg; dg = null; if (!d) return;
    if (!d.it) {
      if (!moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) {
        const zn = zone(hit(e.clientX, e.clientY)); if (!zn) return;
        if (zn.z === 'open') go(1); else if (zn.z === 'next') go(S.cur + 1); else if (zn.z === 'prev') go(S.cur - 1); else if (zn.z === 'reg') act(zn.a);
      }
      return;
    }
    const it = d.it, h = d.hist; let v = 0;
    if (h.length > 1) { const a = h[0], b = h[h.length - 1]; v = (b[1] - a[1]) / Math.max(8, b[0] - a[0]) * 1000; }
    const ok = d.dir > 0 ? (v > .9 || (it.e > .42 && v > -.6)) : (v < -.9 || (it.e < .58 && v < .6));
    it.drag = false;
    const to = ok ? (d.dir > 0 ? 1 : 0) : (d.dir > 0 ? 0 : 1), rem = Math.abs(to - it.e);
    const dur = clamp(Math.abs(v) > .3 ? rem / Math.abs(v) * 1.7 : rem * .9, .22, .85);
    it.tw = { from: it.e, to, st: clock, dur }; it.dir = to > it.e ? 1 : -1; it.target = to;
    if (ok) { S.cur += d.dir; manual(S.cur); ui(); }
    wake();
  }
  const onUp = e => up(e);
  const onLeave = () => { if (!dg && hov !== -1) { hov = -1; peekTo(-1, false); } hitEl.style.cursor = ''; }, noDrag = e => e.preventDefault();
  const EV = [['pointerdown', onDown], ['pointermove', onMove], ['pointerup', onUp], ['pointercancel', onUp], ['pointerleave', onLeave], ['dragstart', noDrag]];
  EV.forEach(([k, f2]) => hitEl.addEventListener(k, f2));
  const onTilt = e => { if (e.pointerType !== 'mouse' || dg) return; const r = cv.getBoundingClientRect(); tilt.tx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1) * 3.2; tilt.ty = -clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1) * 2.2; wake(); };
  const offTilt = () => { tilt.tx = tilt.ty = 0; wake(); };
  if (!ph) { G.addEventListener('pointermove', onTilt); G.addEventListener('pointerleave', offTilt); }

  const api = {
    go: to => { const from = items.reduce((n, it) => n + (it.target ? 1 : 0), 0); if (TEST) console.log('book3d go ' + from + '>' + to + ' at ' + Math.round(performance.now())); schedule(to, from); },
    size,
    vis: v => { vis = v; if (v) wake(); },
    scrub: p => { if (p !== scrubT) { scrubT = p; wake(); } },
    // מתחברים מחדש מהמקום שבו הספר נמצא עכשיו (בלי קפיצה)
    resync: () => { sT = items[0].e + (items[1] ? items[1].e : 0) + (items[2] ? items[2].e : 0); },
    // מתיישרים מיד למיקום הגלילה (רק כשהחלק מחוץ למסך)
    snap: p => {
      scrubT = sT = p;
      items.forEach((it, i) => { it.tw = null; it.drag = false; it.p = it.pt = 0; it.k = it.tz = 0; it.scr = 0; it.e = i <= 2 ? clamp(p - i, 0, 1) : 0; it.target = it.e > .5 ? 1 : 0; it.dirty = true; });
      S.cur = (p > .5) + (p > 1.5) + (p > 2.5); textures(S.cur, Math.max(S.cur, 3)); wake(true);
    },
    busy: () => items.some(it => it.tw || it.drag),
    dispose: () => {
      dead = true; cancelAnimationFrame(raf);
      G.removeEventListener('pointermove', onTilt); G.removeEventListener('pointerleave', offTilt);
      EV.forEach(([k, f2]) => hitEl.removeEventListener(k, f2)); hitEl.style.cursor = '';
      leaves.forEach(L => { dropTex(L); L.geo.dispose(); L.mf.dispose(); L.mb.dispose(); });
      disp.forEach(x => { try { x.dispose(); } catch (_) { } });
      ren.dispose(); try { ren.forceContextLoss(); } catch (_) { }
      const c2 = cv.cloneNode(false); cv.parentNode.replaceChild(c2, cv); S.cv = c2;
    }
  };
  if (TEST) api.dbg = { items, leaves, cam, ren, scene, book, spineScreen, hit, zone, Wb, Hb, Sw,
    // רוחב העמוד על המסך בפיקסלים (לבדיקת גודל הטקסט)
    pageW: () => { const r = cv.getBoundingClientRect(), p = (x2) => new T.Vector3(x2, bt + .05, 0).applyMatrix4(book.matrixWorld).project(cam); const a = p(Sw / 2), b = p(Sw / 2 - W); return Math.round(Math.abs(a.x - b.x) / 2 * r.width); } };
  return api;
}

if (G && A) init();

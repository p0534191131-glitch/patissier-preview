/* bot.js: הבוט שבונה בר לכל לקוחה. שני חלקים: (1) מנוע הכללים שבונה את הבר ומחשב מחיר, (2) צ'אט חופשי כמו וואטסאפ.
   ההבנה של טקסט חופשי כאן היא לפי מילות מפתח. בשלב החיבורים מחליפים אותה ב-AI אמיתי, והכללים נשארים אותם כללים. */
window.Bot = (function () {
  const S = () => Store.S;
  const rules = () => S().bot.rules;
  const card = ev => S().bot.emotions.find(e => e.event === ev) || S().bot.emotions.find(e => e.event === 'other');
  const hasNuts = a => /אגוז|בוטן|שקד|פיסטוק/.test(a || '');

  // ---------- (1) בניית הבר ----------
  function build(a) {
    const R = rules(), s = S();
    const guests = Math.max(10, +a.guests || 0);
    const target = guests * (R.perGuest || 3);
    const level = +a.level || 1;
    const delivery = a.type === 'delivery' && a.area ? (s.areas.find(x => x.id === a.area) || { price: 0 }).price : 0;
    const design = level >= 2 ? R.designFee : 0;
    const cakeP = level >= 3 ? s.products.find(p => p.id === R.cakeId) : null;
    const cake = cakeP ? cakeP.price : 0;
    const budget = +a.budget || 0;
    const forDesserts = budget ? Math.max(0, budget - delivery - design - cake) : 0;
    const perUnit = forDesserts ? forDesserts / target : 0;
    let band;
    if (perUnit) band = R.budgetBands.find(b => perUnit <= b.max) || R.budgetBands[R.budgetBands.length - 1];
    else band = R.budgetBands[Math.min(level, R.budgetBands.length) - 1];
    const allowed = band.tiers.split(',');
    const fl = (card(a.event).flavors || '').split(',').filter(Boolean);
    const noNuts = hasNuts(a.allergy);
    let cands = s.products.filter(p => p.page === 'kinuchim' && p.visible && !p.service && allowed.includes(p.tier) && !(noNuts && p.nuts));
    if (cands.length < 4) cands = s.products.filter(p => p.page === 'kinuchim' && p.visible && !p.service && ['basic', 'mid', 'premium'].includes(p.tier) && !(noNuts && p.nuts));
    const score = p => (fl.includes(p.flavor) ? 2 : 0) + (p.tier === 'premium' ? 1.2 : p.tier === 'mid' ? .8 : .4) + (/שייק/.test(p.name) ? -1.5 : 0);
    const picked = {}; let units = 0, cost = 0, guard = 0;
    while (units < target && guard++ < 60) {
      const kinds = Object.keys(picked).length;
      let best = null, bestV = -1e9;
      cands.forEach(p => {
        const t = picked[p.id] || 0;
        if (t >= (R.maxTraysPerKind || 2)) return;
        let v = score(p) + (t === 0 && kinds < (R.minKinds || 5) ? 1.5 : 0) - t * .6;
        if (perUnit) { const avg = (cost + p.price) / (units + p.qty); v -= Math.abs(avg - perUnit) / Math.max(1, perUnit) * 3; if (avg > perUnit * 1.12) v -= 3; }
        v += (Math.sin(p.id.length * 7 + t) * .05);
        if (v > bestV) { bestV = v; best = p; }
      });
      if (!best) break;
      picked[best.id] = (picked[best.id] || 0) + 1; units += best.qty; cost += best.price;
    }
    const items = Object.entries(picked).map(([id, trays]) => { const p = s.products.find(x => x.id === id); return { id, name: p.name, trays, units: p.qty * trays, price: p.price * trays, flavor: p.flavor }; }).sort((x, y) => y.price - x.price);
    const sub = items.reduce((n, i) => n + i.price, 0);
    const c = card(a.event);
    const colors = a.colors || c.colors;
    const total = sub + design + cake + delivery;
    const note = budget && total > budget * 1.05 ? `יצא ${Store.fmt(total)}, קצת מעל ${Store.fmt(budget)} שאמרת${design ? ', כי עיצוב הבר לבד הוא ' + Store.fmt(design) : ''}. אפשר לרדת ברמה, או להוריד כמה מגשים.`
      : perUnit && perUnit < 9 ? `בתקציב הזה בניתי מהקלאסיקות שלנו. עם עוד כ-${Store.fmt((12 - perUnit) * target)} אפשר להוסיף כיפות מוס בציפוי מראה.` : (!budget && level >= 2 ? 'אפשר להוריד את המחיר עם קינוחים קלאסיים יותר, או להעלות עם יותר כיפות מוס.' : '');
    return { items, units, target, guests, sub, design, cake, cakeName: cakeP ? cakeP.name : '', delivery, total, level, tier: R.tierOf[level], colors, band: band.label, event: a.event, perUnitBudget: perUnit, note };
  }

  // ---------- (2) הבנת טקסט חופשי ----------
  const num = t => { const m = String(t).replace(/,/g, '').match(/\d+(\.\d+)?/g); return m ? m.map(Number) : []; };
  function detectEvent(t) {
    if (/בר\s*מצו/.test(t)) return 'bar'; if (/בת\s*מצו/.test(t)) return 'bat'; if (/חתונ|חופה/.test(t)) return 'wedding'; if (/ברית|בריתה|ברית מילה/.test(t)) return 'brit';
    if (/אירוס|ארוס|וורט|תנאים/.test(t)) return 'engagement'; if (/שבת\s*חתן|שבע ברכות|שבת/.test(t)) return 'shabbat'; if (/עסק|חברה|צוות|משרד|כנס|לקוחות/.test(t)) return 'business';
    if (/יום\s*הולדת|סיום|מסיב|גיוס|קידוש|בר\b/.test(t)) return 'other'; return null;
  }
  const MONTHS = { 'ינואר': 1, 'פברואר': 2, 'מרץ': 3, 'מרס': 3, 'אפריל': 4, 'מאי': 5, 'יוני': 6, 'יולי': 7, 'אוגוסט': 8, 'ספטמבר': 9, 'אוקטובר': 10, 'נובמבר': 11, 'דצמבר': 12 };
  const WDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const nextWd = (from, wd) => { let d = Store.addDays(from, 1); for (let i = 0; i < 7; i++) { if (new Date(d + 'T12:00:00').getDay() === wd) return d; d = Store.addDays(d, 1); } return d; };
  // מבין: 5.11 · 5/11 · ה-5 בנובמבר · בעוד שלושה שבועות · מחר · מוצאי שבת · יום חמישי (ובשלב התאריך גם "חמישי" לבד)
  function detectDate(t, loose) {
    const today = Store.today(), yr = new Date().getFullYear();
    const dmy = (d, mo, y, noYear) => { if (d < 1 || d > 31 || mo < 1 || mo > 12) return null; const iso = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`; return iso < today && noYear ? `${y + 1}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` : iso; };
    let m = t.match(/(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?/);
    if (m) { const y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : yr; return dmy(+m[1], +m[2], y, !m[3]); }
    m = t.match(/(\d{1,2})\s*ב?(ינואר|פברואר|מרץ|מרס|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר)(?:\s*(\d{4}))?/);
    if (m) return dmy(+m[1], MONTHS[m[2]], m[3] ? +m[3] : yr, !m[3]);
    const words = { 'שבוע': 7, 'שבועיים': 14, 'חודש': 30, 'חודשיים': 60, 'שלושה שבועות': 21, 'שלוש שבועות': 21, 'ארבעה שבועות': 28, 'עשרה ימים': 10 };
    for (const w in words) if (t.includes('בעוד ' + w) || t.includes('עוד ' + w)) return Store.addDays(today, words[w]);
    m = t.match(/בעוד\s*(\d+)\s*(יום|ימים|שבוע|שבועות|חודש|חודשים)/);
    if (m) { const n = +m[1]; const mult = /שבוע/.test(m[2]) ? 7 : /חודש/.test(m[2]) ? 30 : 1; return Store.addDays(today, n * mult); }
    if (/מחרתיים/.test(t)) return Store.addDays(today, 2);
    if (/מחר/.test(t)) return Store.addDays(today, 1);
    if (/מוצאי\s*שבת|מוצ["״']?ש/.test(t)) return nextWd(today, 6);
    m = t.match(/(?:ב?יום\s*)(ראשון|שני|שלישי|רביעי|חמישי|שישי)(?:\s*(הבא|הקרוב))?/) || (loose ? t.match(/^(?:ב)?(ראשון|שני|שלישי|רביעי|חמישי|שישי)(?=\s|$|[,.!?])/) : null);
    if (m) { const d = nextWd(today, WDAYS.indexOf(m[1])); return m[2] === 'הבא' && Store.addDays(today, 7) > d ? Store.addDays(d, 7) : d; }
    return null;
  }
  const isMotzash = t => /מוצאי\s*שבת|מוצ["״']?ש/.test(t);
  const shortD = iso => { const d = new Date(iso + 'T12:00:00'); return d.getDate() + '.' + (d.getMonth() + 1); };
  const dayD = iso => 'יום ' + WDAYS[new Date(iso + 'T12:00:00').getDay()] + ' ' + shortD(iso);
  // האם אפשר לקבל אירוע בתאריך: {ok} או {ok:false, msg, offer:[תאריכים פנויים]}
  function checkDate(d, t, level) {
    const av = Store.availability(d, level);
    if (av.free) return { ok: true, partly: av.why === 'partly', desserts: av.why === 'desserts' };
    if (av.why === 'design') { const offer = Store.nextFree(d, 2, level); return { ok: false, design: true, offer, msg: 'ב' + dayD(d) + ' כבר יש לנו עיצוב בר אצל משפחה אחרת, ואנחנו מעצבות בר אחד ביום. אפשר באותו יום את הקינוחים בלי עיצוב (את מסדרת), או עיצוב בר ב' + offer.map(dayD).join(' או ב') + '. מה מתאים?' }; }
    if (av.why === 'shabbat' && isMotzash(t || '')) { const b = Store.isBlocked(d); return b ? { ok: false, msg: 'במוצאי שבת הזה אנחנו לא מקבלים, סליחה.', offer: Store.nextFree(d, 2) } : { ok: true, motzash: true }; }
    if (av.why === 'shabbat') return { ok: false, msg: 'בשבת אנחנו לא מספקים. מוצאי שבת או יום חמישי?' };
    if (av.why === 'past') return { ok: false, msg: 'התאריך הזה כבר עבר. לאיזה תאריך?' };
    const offer = Store.nextFree(d, 2);
    return { ok: false, offer, msg: 'ביום הזה אנחנו לא מקבלים, סליחה.' + (offer.length ? ' (ב' + offer.map(dayD).join(' או ב') + ' פנוי, מתאים?)' : ' לאיזה תאריך אחר?') };
  }
  function detectArea(t) { const a = S().areas.find(x => t.includes(x.name) || (x.name === 'בני ברק' && /ב"ב|בני ברק/.test(t)) || (x.name === 'ירושלים' && /ירושלים|י-ם/.test(t))); return a ? a.id : null; }
  function detectLevel(t) {
    if (/קונספט|מיתוג|הפקה|ממותג|3\b|שלוש/.test(t)) return 3;
    if (/עיצוב|תעצב|שתעצב|ראש שקט|הכל|הכול|שתגיע|תגיעו|2\b|שתיים|שניים/.test(t)) return 2;
    if (/רק|לבד|בעצמי|קינוחים בלבד|1\b|אחת|אחד|מסדרת/.test(t)) return 1;
    return null;
  }
  function faqHit(t) {
    if (/כשר|השגח|פרווה|חלבי/.test(t)) return 'kosher'; if (/הפשר|מקפיא|להוציא/.test(t)) return 'thaw'; if (/כמה זמן מראש|מראש|מתי להזמין/.test(t)) return 'ahead';
    if (/בן אדם|נציג|מישהו|לדבר עם|טלפון של/.test(t)) return 'human'; return null;
  }
  const noAns = t => /^(לא|אין|לא יודעת|לא יודע|עוד לא|תציע|תציעי|מה שתגיד|לא משנה|שאת תציעי|בלי)/.test(t.trim());

  // ---------- (3) הצ'אט ----------
  const EVN = Store.EVENTS;
  function mountChat(root, opts) {
    opts = opts || {};
    const b = S().bot;
    const a = {}; let step = 0; const log = []; let busy = false; let offer = []; /* תאריכים פנויים שיפי הציעה במקום תאריך תפוס */ let pendingLevel = 0; /* רמה עם עיצוב שביקשו ליום שהעיצוב בו תפוס */
    const levelText = l => l === 1 ? 'נבחרת הקינוחים. הקינוחים הכי טובים שלנו, ואת מסדרת על הכלים שלך.' : l === 2 ? 'בר של השמחות. אנחנו מגיעים עם הכלים והמפות, מעצבים, ואוספים בסוף. ראש שקט.' : 'בר קונספט. הפקה שלמה בצבעים שלך, עם עוגת ויטרינה ממותגת. ידברו על זה שנים.';
    root.innerHTML = '';
    root.classList.add('chat');
    const head = el('div', 'chat-head', `<span class="chat-av">י</span><span><b>${b.name}</b><small>הבוט של הלקוחות · הצעת מחיר בשיחה</small></span><span class="chat-tag">${S().settings.connections.ai ? 'AI מחובר' : 'מצב ניסיון, בלי AI'}</span>`);
    const body = el('div', 'chat-body'); body.setAttribute('role', 'log'); body.setAttribute('aria-live', 'polite');
    const foot = el('form', 'chat-foot', `<input class="chat-in" placeholder="כתבי כאן כמו בוואטסאפ…" autocomplete="off"><button class="chat-send" type="submit" aria-label="שליחה">➤</button>`);
    root.append(head, body, foot);
    const input = foot.querySelector('input');
    const scroll = () => { body.scrollTop = body.scrollHeight; };
    const say = (text, who) => { const m = el('div', 'msg ' + who); m.innerHTML = text; body.appendChild(m); log.push([who === 'me' ? 'user' : 'bot', m.textContent]); scroll(); return m; };
    async function botSay(text, delay) {
      busy = true; const t = el('div', 'msg bot typing', '<i></i><i></i><i></i>'); body.appendChild(t); scroll();
      await sleep(opts.fast ? 60 : Math.min(1400, 350 + text.length * 9)); t.remove(); say(text, 'bot'); busy = false;
    }
    const step$ = i => b.steps[i];
    function question(i) { const st = step$(i); if (!st) return ''; if (st.key === 'style') { const c = card(a.event); return `${st.q} אני חושבת על <b>${c.colors}</b>, או ${c.alt}.`; } return st.q; }
    async function start() { await botSay(b.opening); input.focus(); }
    async function handle(text) {
      say(esc(text), 'me');
      const t = text.trim();
      const st = step$(step); if (!st) return;
      // שאלה באמצע (כשרות, הפשרה...): עונים וחוזרים לשאלה
      const fh = faqHit(t);
      if (fh && st.key !== 'contact' && !(st.key === 'delivery' && /משלוח|איסוף/.test(t))) { const ans = b.answers.find(x => x.k === fh); if (ans) { await botSay(ans.a); if (fh !== 'human') await botSay('ועכשיו, ' + question(step)); else await botSay(question(step)); return; } }
      let reply = '';
      switch (st.key) {
        case 'event': {
          const ev = detectEvent(t); if (!ev) { await botSay('ספרי לי קצת יותר: בר מצווה, בת מצווה, חתונה, ברית, אירוסין, או משהו אחר?'); return; }
          a.event = ev; const c = card(ev); const g = num(t).find(n => n >= 10 && n <= 2000); if (g) a.guests = g; const d = detectDate(t); if (d && checkDate(d, t).ok) a.date = d; /* תאריך תפוס: הבוט ישאל שוב בשלב התאריך */
          reply = `${ev === 'other' ? 'שמחה!' : 'מזל טוב! ' + c.name + '.'} ${c.calm}`; break;
        }
        case 'style': { if (noAns(t)) { a.colors = card(a.event).colors; reply = `אז ${a.colors}. יפה ומכובד.`; } else { a.colors = t.replace(/^(אולי|חשבתי על|רוצה|אני רוצה|בכיוון של)\s*/, ''); reply = `${a.colors}. יפה, זה ישתלב מצוין.`; } break; }
        case 'guests': { const g = num(t).find(n => n >= 5 && n <= 5000); if (!g) { await botSay('בערך כמה אנשים? מספר בערך מספיק לי.'); return; } a.guests = g; reply = `${g} אורחים. זה בערך ${g * rules().perGuest} קינוחים, ${rules().perGuest} לכל אחד, כדי שלא יחסר ולא יישאר המון.`; break; }
        case 'budget': { const n = num(t).find(x => x >= 300); if (noAns(t) || !n) { a.budget = 0; reply = 'בסדר גמור, אני אבנה לפי הרמה ואת תראי את המחיר לפני שמחליטים.'; } else { a.budget = n; reply = `סבבה, אני בונה סביב ${Store.fmt(n)}, כולל הכול.`; } break; }
        case 'date': {
          // אחרי הצעה של תאריכים פנויים: "כן" / "מתאים" / "הראשון" = הראשון, "השני" = השני. אחרת מחפשים תאריך בטקסט
          let d = null;
          if (offer.length && /^(כן|מתאים|סבבה|אוקי|אוקיי|בסדר|יאללה|מעולה|הראשון|הראשונה|השני|השנייה|השניה)/.test(t)) d = /^(השני|השנייה|השניה)/.test(t) && offer[1] ? offer[1] : offer[0];
          else d = detectDate(t, true);
          if (!d) { await botSay(offer.length ? `לאיזה תאריך? (ב${offer.map(dayD).join(' או ב')} פנוי)` : 'באיזה תאריך בערך? אפשר לכתוב למשל 14/12 או "בעוד שלושה שבועות".'); return; }
          const ck = checkDate(d, t);
          if (!ck.ok) { offer = ck.offer || []; await botSay(ck.msg); return; } /* לא ממשיכים: הלקוחה תכתוב תאריך אחר */
          a.date = d; offer = [];
          const days = Math.round((new Date(d) - new Date(Store.today())) / 864e5), when = (ck.motzash ? 'מוצאי שבת ' : '') + fmtDate(d);
          reply = ck.desserts ? `${when}. לקינוחים התאריך פנוי. עיצוב בר כבר יש לנו באותו יום אצל משפחה אחרת, אז אם חשוב לך עיצוב, תגידי ואציע תאריך קרוב.` : ck.partly ? `${when}. התאריך פנוי. יש לנו עוד אירוע באותו יום, אבל יש מקום.` : days < 5 ? `${when}. קרוב, אבל אנחנו רגילים. נדאג שיהיה מוכן.` : `${when}. יש זמן, הכול יהיה מוכן לפני שהאורחים נכנסים.`;
          break;
        }
        case 'delivery': {
          if (/איסוף|אאסוף|נאסוף|לאסוף|לוקחת|לוקחים/.test(t)) { a.type = 'pickup'; a.area = ''; reply = 'איסוף עצמי, מצוין. הקינוחים יחכו ארוזים ומוכנים.'; }
          else { const ar = detectArea(t); if (!ar) { if (/משלוח/.test(t) || !a.type) { await botSay('לאיזו עיר? אנחנו מגיעים לבני ברק, בית שמש וירושלים. או איסוף עצמי.'); return; } } a.type = 'delivery'; a.area = ar; reply = `משלוח ל${Store.areaName(ar)}. אנחנו מגיעים מראש ומסדרים הכול לפני שהאורחים נכנסים.`; }
          break;
        }
        case 'level': {
          if (pendingLevel) { // הצענו: קינוחים בלי עיצוב באותו יום, או עיצוב בתאריך אחר
            let d2 = null;
            if (offer.length && /^(כן|מתאים|סבבה|אוקי|אוקיי|בסדר|יאללה|מעולה|הראשון|הראשונה|השני|השנייה|השניה)/.test(t)) d2 = /^(השני|השנייה|השניה)/.test(t) && offer[1] ? offer[1] : offer[0]; else d2 = detectDate(t, true);
            if (d2 && Store.availability(d2, pendingLevel).free) { a.date = d2; a.level = pendingLevel; pendingLevel = 0; offer = []; reply = 'מעולה, עברנו ל' + dayD(d2) + ' עם עיצוב. ' + levelText(a.level); break; }
            if (/קינוח|לבד|בעצמי|רק|בלי עיצוב|בלי/.test(t)) { a.level = 1; pendingLevel = 0; offer = []; reply = 'אז באותו יום, בלי עיצוב. ' + levelText(1); break; }
            await botSay('מה מתאים: רק הקינוחים באותו יום, או עיצוב בר ב' + offer.map(dayD).join(' או ב') + '?'); return;
          }
          const l = detectLevel(t); if (!l) { await botSay('שלוש אפשרויות: רק הקינוחים ואת מסדרת, או שנגיע ונעצב לך את הבר, או בר קונספט בעיצוב אישי לפי הצבעים שלך. מה מתאים?'); return; }
          if (l >= 2 && a.date && !Store.availability(a.date, l).free) { const ck2 = checkDate(a.date, t, l); offer = ck2.offer || []; pendingLevel = l; await botSay(ck2.msg); return; }
          a.level = l; reply = levelText(l); break;
        }
        case 'allergy': { a.allergy = hasNuts(t) ? t : (noAns(t) ? '' : t); reply = a.allergy ? (hasNuts(a.allergy) ? 'רשמתי: בלי אגוזים. אני מוציאה מהבר כל מה שיש בו אגוזים.' : 'רשמתי. אני אתחשב בזה.') : 'מעולה.'; break; }
        case 'contact': {
          const ph = (t.match(/0\d[\d\s-]{7,}/) || [''])[0].replace(/\s/g, ''); const name = t.replace(/0\d[\d\s-]{7,}/, '').replace(/[,.]/g, '').replace(/^(אני|קוראים לי|שמי|זה)\s*/, '').trim();
          if (!ph) { await botSay('ולאיזה מספר לשלוח? (למשל 050-1234567)'); if (name) a.name = name; return; }
          a.phone = ph; a.name = a.name || name || 'לקוחה'; reply = `תודה ${a.name}. יש לי הכול. בונה לך את הבר…`; break;
        }
      }
      await botSay(reply);
      step++;
      while (step$(step) && ((step$(step).key === 'guests' && a.guests) || (step$(step).key === 'date' && a.date))) step++;
      if (step$(step)) { await botSay(question(step)); input.focus(); }
      else finish();
    }
    function finish() {
      const bar = build(a);
      const c = card(a.event);
      const html = `<div class="bar-card"><div class="bar-head"><span class="label">${bar.tier}</span><b>${EVN[a.event] || 'השמחה'} · ${bar.guests} אורחים</b></div>
        <ul class="bar-items">${bar.items.map(i => `<li><span>${i.name}</span><small>${i.trays} ${i.trays === 1 ? 'מגש' : 'מגשים'} · ${i.units} יח׳</small><b>${Store.fmt(i.price)}</b></li>`).join('')}</ul>
        <div class="bar-sum"><span>${bar.units} קינוחים</span><b>${Store.fmt(bar.sub)}</b></div>
        ${bar.design ? `<div class="bar-sum"><span>עיצוב הבר: כלים, מפות, העמדה והחזרה</span><b>${Store.fmt(bar.design)}</b></div>` : ''}
        ${bar.cake ? `<div class="bar-sum"><span>${bar.cakeName}</span><b>${Store.fmt(bar.cake)}</b></div>` : ''}
        ${bar.delivery ? `<div class="bar-sum"><span>משלוח ל${Store.areaName(a.area)}</span><b>${Store.fmt(bar.delivery)}</b></div>` : ''}
        <div class="bar-total"><span>סך הכול</span><b>${Store.fmt(bar.total)}</b></div>
        <div class="bar-colors">🎨 ${bar.colors}</div>${bar.note ? `<div class="bar-colors" style="opacity:.8">💡 ${bar.note}</div>` : ''}</div>`;
      botSay(html).then(() => botSay(`${b.closing} ${c.calm}`)).then(() => {
        const act = el('div', 'msg bot acts', `<button class="btn btn-sm" data-act="lead">לשלוח לי את ההצעה</button><button class="btn btn-sm btn-line" data-act="again">להתחיל מחדש</button>`);
        body.appendChild(act); scroll();
        act.querySelector('[data-act=lead]').onclick = () => { const lead = toLead(a, bar, log); act.remove(); say('נשלח. המזכירה שלנו תאשר ותחזור אלייך עם ההצעה הסופית. תודה שבחרת בנו.', 'bot'); if (opts.onLead) opts.onLead(lead); };
        act.querySelector('[data-act=again]').onclick = () => { for (const k in a) delete a[k]; step = 0; body.innerHTML = ''; log.length = 0; start(); };
      });
    }
    function toLead(a, bar, log) {
      const l = { id: Store.uid('l'), name: a.name, phone: a.phone, source: opts.source || 'bot', status: 'new', created: Store.today(), event: a.event, guests: a.guests, budget: a.budget || 0, date: a.date || '', time: '', level: a.level || 1, type: a.type || 'pickup', area: a.area || '', colors: a.colors || '', allergy: a.allergy || '', bar, transcript: log.map(x => x.slice()) };
      S().leads.unshift(l); Store.save(); return l;
    }
    foot.addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (!v || busy) return; input.value = ''; handle(v); });
    start();
    return { restart: () => { for (const k in a) delete a[k]; step = 0; body.innerHTML = ''; start(); } };
  }

  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fmtDate = iso => { const d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' }); };

  return { build, card, mountChat, detectEvent, detectDate, checkDate, hasNuts };
})();

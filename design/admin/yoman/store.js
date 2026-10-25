/* store.js (הועתק מ-design/admin/app ב-19.10.2026, עם נתוני ההדגמה של היומן): שכבת הנתונים. כרגע הכול נשמר בדפדפן (localStorage). בשלב החיבורים הפונקציות האלה יפנו לבסיס נתונים אמיתי. */
window.Store = (function () {
  const KEY = 'patissier-yoman-v1'; /* מפתח נפרד מהמערכת ב-app, כדי ששתי הגרסאות לא ידרסו זו את זו */
  // שלבי הזמנה (מילון אחד לכל המסכים, 20.10.2026). הצעה היא פנייה (LEAD_STATUS), לא הזמנה
  const STATUS = [
    { k: 'approved', n: 'אושרה', c: 'st-approved' },
    { k: 'prep', n: 'בהכנה', c: 'st-prep' },
    { k: 'ready', n: 'מוכנה', c: 'st-ready' },
    { k: 'done', n: 'נמסרה', c: 'st-done' },
    { k: 'cancelled', n: 'בוטלה', c: 'st-cancelled' },
    // שלבים ישנים: נשארים רק כדי לקרוא נתונים שנשמרו לפני השינוי. לא מציגים אותם לבחירה
    { k: 'new', n: 'חדשה', c: 'st-new', legacy: true },
    { k: 'quoted', n: 'הצעה נשלחה', c: 'st-quoted', legacy: true }
  ];
  const LEAD_STATUS = [{ k: 'new', n: 'חדשה', c: 'st-new' }, { k: 'quoted', n: 'הצעה נשלחה', c: 'st-quoted' }, { k: 'approved', n: 'הפכה להזמנה', c: 'st-approved' }, { k: 'lost', n: 'לא רלוונטי', c: 'st-cancelled' }];
  const FLAVORS = { choc: 'שוקולד', straw: 'תות', mango: 'מנגו', pista: 'פיסטוק', lemon: 'לימון', coco: 'קוקוס', berry: 'פירות יער', fruit: 'פירות', '': 'מעורב' };
  const TIERS = { basic: 'בסיסי', mid: 'בינוני', premium: 'פרימיום', cake: 'עוגה', box: 'מארז', service: 'שירות' };
  const EVENTS = { bar: 'בר מצווה', bat: 'בת מצווה', wedding: 'חתונה', brit: 'ברית', engagement: 'אירוסין', shabbat: 'שבת חתן', business: 'אירוע עסקי', other: 'אירוע' };

  let S = null;
  const uid = p => (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const clone = o => JSON.parse(JSON.stringify(o));
  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  function fresh() {
    const s = clone(window.SEED);
    const out = {
      v: 1, role: 'manager', user: 'u1', demo: false,
      products: s.products, raws: s.raws, suppliers: s.suppliers, inters: s.inters, recipes: s.recipes,
      faqs: s.faqs, testimonials: s.testimonials, areas: s.areas, site: s.site, gallery: s.gallery, bot: s.bot, users: s.users, settings: s.settings,
      customers: [], leads: [], orders: [], expenses: [], tasks: [], log: [], payments: [], receipts: [], messages: [], blocked: [], assistantLog: []
    };
    ensureNew(out); return out;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); if (S.v === 1) { const had = !!S.receipts, hadPay = !!(S.settings && S.settings.payments); ensureNew(S); syncFromSeed(S); if (!S.payments) { S.payments = []; if (S.demo) demoPayments(S); syncPayments(); } else syncPayments(); if (!had && S.demo) { demoSiteStats(S); demoBlocked(S); demoReceipts(S); } if (!hadPay) applyDepositSetting(); if (S.demo && !S.statuses.some(x => x.demo)) { demoStatuses(S); S.leads.forEach(l => { if (!l.bar && l.guests) l.bar = null; }); } reconcileUnits(); queueMessages(); save(); return S; } } } catch (e) { }
    S = fresh(); S.demo = true; S.seedSyncedAt = window.SEED.syncedAt; addDemo(S); syncPayments(); ensureNew(S); demoSiteStats(S); demoBlocked(S); demoReceipts(S); demoStatuses(S); reconcileUnits(); queueMessages(); save(); return S;
  }
  let t = 0;
  function save() { clearTimeout(t); t = setTimeout(() => { try { if (S) reconcileUnits(); } catch (e) { } try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } document.dispatchEvent(new CustomEvent('store:saved')); }, 120); }
  function reset(withDemo) { S = fresh(); S.demo = !!withDemo; S.seedSyncedAt = window.SEED.syncedAt; if (withDemo) addDemo(S); syncPayments(); ensureNew(S); if (withDemo) { demoSiteStats(S); demoBlocked(S); demoReceipts(S); demoStatuses(S); } reconcileUnits(); queueMessages(); save(); return S; }

  function addDemo(s) {
    // נתוני הדגמה של "היומן" (מסומנים demo:true, נמחקים בלחיצה בהגדרות). התאריכים יחסיים להיום.
    const d = today();
    const noSat = (iso, dir) => new Date(iso + 'T12:00:00').getDay() === 6 ? addDays(iso, dir) : iso; // הדגמה: שום תאריך לא נופל בשבת
    const cust = (name, phone, prefs, notes) => { const c = { id: uid('c'), name, phone, email: '', prefs: prefs || {}, notes: notes || '', demo: true, created: addDays(d, -30) }; s.customers.push(c); return c; };
    const order = (c, ev, off, time, status, level, items, type, area, colors, notes, paid, extra) => {
      const date = noSat(addDays(d, off), off > 0 ? 1 : -2);
      const created = noSat(addDays(date, off > 0 ? -12 : -20), -1);
      const o = Object.assign({ id: uid('o'), num: s.orders.length + 1001, customer: c.id, event: ev, date, time, status, level, items, type, area: area || '', address: type === 'delivery' ? ('אולם ב' + (area ? areaName(s, area) : '')) : '', colors: colors || '', allergy: c.prefs.allergy || '', notes: notes || '', guests: 0, paid: !!paid, created, demo: true, log: [] }, extra || {});
      if (!o.guests && o.guests !== 0) o.guests = Math.round(units(o.items, s) / 3);
      o.log = [[created, 'נוצרה מפנייה'], [created, 'סטטוס: ' + statusOf(status).n]];
      s.orders.push(o); return o;
    };
    // הלקוחות של האירועים
    const cohen = cust('רחל כהן', '050-612-0101', { colors: 'שחור וזהב', flavors: 'שוקולד', allergy: '' }, 'הבר מצווה של הבן הבכור. רוצה הרבה שוקולד.');
    const levi = cust('מיכל לוי', '052-764-0202', { colors: 'ורוד וזהב', flavors: 'תות ומנגו', allergy: 'אגוזים' }, 'רגישות לאגוזים אצל הבת. לבדוק כל קינוח.');
    const fried = cust('אסתר פרידמן', '054-318-0303', { colors: 'לבן ושמנת', flavors: '', allergy: '' });
    const avraham = cust('נועה אברהם', '053-410-0404', { colors: 'שמנת וזהב', flavors: 'שוקולד ופירות', allergy: '' });
    const stern = cust('יעל שטרן', '058-322-0505', { colors: 'ורוד', flavors: 'תות', allergy: '' });
    const gold = cust('שרה גולד', '050-877-0606', { colors: 'ירוק וזהב', flavors: '', allergy: '' });
    const berger = cust('חוה ברגר', '052-590-0707', { colors: 'כחול וזהב', flavors: 'שוקולד', allergy: '' });
    const klein = cust('דינה קליין', '054-223-0808', { colors: 'ורוד', flavors: 'תות ומנגו', allergy: '' }, 'נשארה יתרה לתשלום.');
    const rosen = cust('ברכה רוזן', '053-118-0909', { colors: 'לבן', flavors: '', allergy: '' });
    const weiss = cust('פנינה וייס', '052-441-1010', { colors: 'תכלת', flavors: '', allergy: '' });
    // לקוחות של מארזים ומגשים
    const hana = cust('חנה מ.', '050-301-1111', {}), sara = cust('שרה ל.', '052-302-1212', {}), tova = cust('טובה ק.', '054-303-1313', {}), dvora = cust('דבורה ר.', '053-304-1414', {}), miriam = cust('מרים ש.', '050-930-1515', {});

    // אירועים קרובים
    order(cohen, 'bar', 1, '16:00', 'prep', 2, [['dome-choc', 3], ['crunch', 2], ['mag-choc', 3], ['mag-mango', 2], ['cup-tri', 2], ['kokolida', 2], ['tart-nougat', 2], ['pf-flame', 2]], 'delivery', 'bb', 'שחור וזהב', 'הקמה עד 15:30. כניסה מהחניה האחורית.', false, { guests: 150 });
    order(levi, 'bat', 3, '17:30', 'approved', 3, [['dome-straw', 2], ['mag-straw', 2], ['mag-mango', 2], ['cup-straw', 2], ['cup-mango', 1], ['tart-straw', 2], ['tart-mango', 1], ['mac-straw', 1], ['cake-brand3', 1]], 'delivery', 'jm', 'ורוד וזהב', 'בלי אגוזים! עוגת ויטרינה עם השם "שירה".', false, { guests: 90 });
    order(fried, 'other', 3, '19:00', 'approved', 1, [['kokolida', 1], ['tart-lemon', 1], ['mag-choc', 1]], 'delivery', 'bs', 'לבן ושמנת', 'שבע ברכות בבית המשפחה.', false, { guests: 60, address: 'בית המשפחה, בית שמש' });
    // הצעות שנשלחו: פניות (עם הבר שהבוט בנה), לא הזמנות. הופכות להזמנה רק כשהלקוחה מאשרת
    const quote = (c, ev, off, level, items, type, area, guests, budget, time, transcript) => {
      const l = { id: uid('l'), name: c.name, phone: c.phone, source: 'bot', status: 'quoted', created: addDays(d, -3), event: ev, guests, budget: budget || 0, date: noSat(addDays(d, off), 1), time: time || '', level, type, area: area || '', colors: c.prefs.colors || '', allergy: c.prefs.allergy || '', demo: true, bar: null, notes: '', transcript };
      l.bar = barFromItems(s, l, items); s.leads.push(l); return l;
    };
    quote(avraham, 'wedding', 6, 2, [['dome-choc', 3], ['dome-straw', 3], ['crunch', 3], ['cup-pista', 2], ['mag-choc', 3], ['mag-straw', 3], ['tart-lemon', 3], ['pf-double', 2], ['mac-choc', 2]], 'delivery', 'bb', 250, 7000, '18:30',
      [['user', 'שלום, אנחנו מחתנים בעוד שבוע וחצי. צריכה בר לקבלת פנים ל-250 איש'], ['bot', 'מזל טוב! חתונה. הבר יהיה הדבר שידברו עליו. איזה צבעים?'], ['user', 'שמנת וזהב'], ['bot', 'יש לי הכול. בונה לך את הבר...']]);
    quote(stern, 'engagement', 9, 1, [['kokolida', 1], ['dome-straw', 1], ['tart-straw', 1], ['mag-straw', 1]], 'delivery', 'jm', 70, 1500, '',
      [['user', 'היי, אירוסין בעוד שבוע וחצי, בערך 70 איש, רק קינוחים'], ['bot', 'מזל טוב! נבחרת הקינוחים, את מסדרת על הכלים שלך. איזה צבעים?'], ['user', 'ורוד'], ['bot', 'יש לי הכול. בונה לך את הבר...']]);
    // אירועים שנמסרו החודש
    order(gold, 'engagement', -7, '20:00', 'done', 2, [['dome-choc', 2], ['mag-mango', 2], ['cup-pista', 1], ['tart-lemon', 2], ['kokolida', 2]], 'delivery', 'bb', 'ירוק וזהב', '', true, { guests: 90 });
    order(berger, 'bar', -6, '17:00', 'done', 2, [['dome-choc', 2], ['crunch', 1], ['mag-choc', 2], ['cup-tri', 2], ['tart-nougat', 2], ['kokolida', 2]], 'delivery', 'jm', 'כחול וזהב', '', true, { guests: 120 });
    order(klein, 'bat', -4, '18:00', 'done', 2, [['dome-straw', 1], ['mag-straw', 1], ['mag-mango', 1], ['tart-straw', 1]], 'delivery', 'bs', 'ורוד', 'שולמו ₪3,000. נשארה יתרה.', false, { guests: 70 });
    order(rosen, 'other', -10, '12:00', 'done', 1, [['kokolida', 1], ['tart-lemon', 1], ['mag-choc', 1]], 'delivery', 'bb', 'לבן', 'שבע ברכות.', true, { guests: 40, address: 'בית המשפחה, בני ברק' });
    order(weiss, 'brit', -12, '10:00', 'done', 1, [['kokolida', 1], ['mag-choc', 1], ['tart-lemon', 1], ['mac-coco', 1]], 'delivery', 'jm', 'תכלת', '', true, { guests: 50, address: 'בית הכנסת, ירושלים' });
    // מארזים ומגשים מהאתר
    order(hana, 'other', -14, '12:00', 'done', 1, [['dome-choc', 2]], 'delivery', 'bb', '', '', true, { guests: 0, address: 'בני ברק' });
    order(sara, 'other', -13, '12:00', 'done', 1, [['caramelida', 2]], 'delivery', 'jm', '', '', true, { guests: 0, address: 'ירושלים' });
    order(tova, 'other', -5, '12:00', 'done', 1, [['box-mix', 4]], 'pickup', '', '', '', true, { guests: 0 });
    order(dvora, 'other', -3, '12:00', 'done', 1, [['box-mix', 3]], 'pickup', '', '', '', true, { guests: 0 });
    order(miriam, 'other', 0, '18:00', 'approved', 1, [['box-mix', 1]], 'pickup', '', '', 'מארז מתנה. הזמינה דרך יפי.', true, { guests: 0 });

    // פניות
    s.leads.push({ id: uid('l'), name: 'רבקה ג.', phone: '052-580-1616', source: 'whatsapp', status: 'new', created: d, event: 'bat', guests: 80, budget: 5000, date: noSat(addDays(d, 24), 1), time: '18:00', level: 2, type: 'delivery', area: 'jm', colors: 'ורוד וזהב', allergy: '', demo: true, bar: null,
      transcript: [['user', 'היי, אפשר מחיר לבר לבת מצווה ל-80 איש? בצבעים ורוד וזהב'], ['bot', 'מזל טוב! בשמחה. לאיזה תאריך האירוע, ואיפה?'], ['user', 'יום חמישי 12.11, באולם בירושלים'], ['bot', 'התאריך פנוי. מעוצב בצבעים שלכם, או חלומי עם עוגה מרכזית?'], ['user', 'מעוצב בצבעים שלנו'], ['bot', 'יש לי הכול. בונה לך את הבר...']] });
    s.leads.push({ id: uid('l'), name: '', phone: '052-710-1717', source: 'whatsapp', status: 'new', created: d, event: 'other', guests: 0, budget: 0, date: noSat(addDays(d, 17), 1), time: '', level: 1, type: 'pickup', area: '', colors: '', allergy: '', demo: true, bar: null,
      transcript: [['user', 'יש לכם פנוי ל-5.11?'], ['bot', 'כן, התאריך פנוי. לאיזה אירוע, ולכמה אורחים בערך?']] });
    s.leads.push({ id: uid('l'), name: 'מרים ש.', phone: '050-930-1515', source: 'bot', status: 'approved', created: d, event: 'other', guests: 0, budget: 290, date: d, level: 1, type: 'pickup', area: '', colors: '', allergy: '', demo: true, bar: null,
      transcript: [['user', 'כמה עולה מארז מתנה?'], ['bot', '₪290, עם משלוח. רוצה להזמין?'], ['user', 'כן, אחד בבקשה']] });

    // הוצאות החודש
    const x = (off, amount, cat, supplier, note) => s.expenses.push({ id: uid('x'), date: addDays(d, off), amount, cat, supplier: supplier || '', note, demo: true });
    x(-17, 1180, 'חומרי גלם', 'sup-choc', 'שוקולד וקקאו');
    x(-15, 240, 'משלוחים', '', 'שליח, שבוע 1');
    x(-12, 820, 'חומרי גלם', 'sup-grocery', 'שמנת, קצפת וחלב צמחי');
    x(-10, 480, 'אריזות', 'sup-pack', 'כוסות, מגשים ומפיות');
    x(-8, 240, 'משלוחים', '', 'שליח, שבוע 2');
    x(-7, 540, 'חומרי גלם', 'sup-grocery', 'פירות ופירה');
    x(-5, 640, 'חומרי גלם', 'sup-deco', 'אגוזים, פרלין וקישוטים');
    x(-4, 310, 'אריזות', 'sup-pack', 'קופסאות מארז וסרטים');
    x(-4, 1200, 'שכר', '', 'עובדת במטבח, 12 שעות');
    x(-3, 420, 'חומרי גלם', 'sup-grocery', 'קמח, סוכר וביצים');
    x(-1, 360, 'משלוחים', '', 'שליח, שבוע 3');
    x(-1, 300, 'שיווק', '', 'פרסום באינסטגרם ובפייסבוק');


    // החודש הקודם (בשביל ההשוואה והגרף)
    const yael = cust('יהודית שפירא', '052-660-1818', {}), malka = cust('מלכה ברק', '054-661-1919', {}), tzipi = cust('ציפי הורוביץ', '050-662-2020', {});
    order(yael, 'bar', -26, '17:00', 'done', 2, [['dome-choc', 2], ['crunch', 2], ['mag-choc', 2], ['cup-tri', 1], ['kokolida', 2], ['tart-nougat', 1]], 'delivery', 'bb', 'שחור וזהב', '', true, { guests: 110 });
    order(malka, 'bat', -33, '18:00', 'done', 3, [['dome-straw', 2], ['mag-straw', 2], ['cup-straw', 2], ['tart-straw', 1], ['cake-brand3', 1]], 'delivery', 'jm', 'ורוד', '', true, { guests: 80 });
    order(tzipi, 'wedding', -40, '19:30', 'done', 2, [['dome-choc', 2], ['dome-straw', 2], ['mag-mango', 2], ['cup-pista', 2], ['tart-lemon', 2], ['mac-choc', 2]], 'delivery', 'bs', 'לבן וזהב', '', true, { guests: 180 });
    x(-28, 1650, 'חומרי גלם', 'sup-choc', 'שוקולד ושמנת');
    x(-35, 1100, 'שכר', '', 'עובדת במטבח');
    x(-38, 620, 'אריזות', 'sup-pack', 'אריזות לחגים');
    x(-41, 900, 'חומרי גלם', 'sup-grocery', 'פירות ושמנת');

    // מלאי הדגמה: מגשים במקפיא וחומרים
    const st = { 'dome-choc': 3, 'mag-mango': 3, 'mag-choc': 2, 'dome-straw': 2, 'kokolida': 2, 'tart-lemon': 1 };
    s.products.forEach(p => { if (st[p.id]) p.stock = st[p.id]; });
    const rs = { 'rm_ms64jrw37zvl6': 4, 'rm_ms64oukzpkf0m': 6, 'rm_ms64nmzfbsx05': 2, 'rm_ms643udow78r1': 3, 'rm_ms64tncvnccmf': 1, 'rm_ms63zh94ll4fs': 300, 'rm_ms63zr0vpnodv': 150 };
    s.raws.forEach(r => { if (rs[r.id] != null) r.stock = rs[r.id]; if (r.id === 'rm_ms63zh94ll4fs' || r.id === 'rm_ms63zr0vpnodv') r.min = 200; });
    // משימות קטנות
    s.tasks.push({ id: uid('t'), text: 'להתקשר לנועה אברהם לגבי ההצעה', done: false, date: d, demo: true });
    s.tasks.push({ id: uid('t'), text: 'לבקש מדינה קליין את היתרה', done: false, date: d, demo: true });
    // העברות כסף
    s.payments = s.payments || []; demoPayments(s);
  }
  function demoBlocked(s) {
    const d = today();
    const noSat = iso => new Date(iso + 'T12:00:00').getDay() === 6 ? addDays(iso, 1) : iso;
    [[noSat(addDays(d, 11)), 'חופשה משפחתית'], [noSat(addDays(d, 12)), 'חופשה משפחתית'], [noSat(addDays(d, 26)), 'בר מצווה במשפחה']].forEach(([date, reason]) => { if (!s.blocked.some(b => b.date === date)) s.blocked.push({ id: uid('b'), date, reason, demo: true, created: d }); });
  }
  function demoReceipts(s) { // קבלות על ההעברות שכבר עברו בהדגמה (כאילו נשלחו ביום שהכסף עבר)
    s.payments.filter(p => p.demo && p.received).forEach(p => { if (s.receipts.some(r => r.payment === p.id)) return; const o = s.orders.find(x => x.id === p.order), c = s.customers.find(x => x.id === p.customer) || {};
      s.receipts.push({ id: uid('r'), num: s.settings.receipts.series++, payment: p.id, order: p.order, customer: p.customer, name: c.name || '', phone: c.phone || '', amount: p.amount, method: p.method, date: p.receivedAt, kind: p.kind,
        desc: (KINDS[p.kind] || 'תשלום') + (o ? ' על ' + (EVENTS[o.event] || 'אירוע') + ' ' + o.date.slice(8, 10) + '.' + o.date.slice(5, 7) + ' (הזמנה ' + o.num + ')' : ''), status: 'sent', sentAt: p.receivedAt, demoSent: true, provider: 'sumit', demo: true, created: p.receivedAt }); });
    s.receipts.sort((a, b) => a.date.localeCompare(b.date)); s.receipts.forEach((r, i) => { r.num = 1001 + i; }); s.settings.receipts.series = 1001 + s.receipts.length;
  }
  function clearDemo() {
    ['customers', 'leads', 'orders', 'expenses', 'tasks', 'payments', 'receipts', 'messages', 'blocked', 'statuses'].forEach(k => { S[k] = (S[k] || []).filter(x => !x.demo); });
    if (S.siteStats && S.siteStats.demo) S.siteStats = { days: [], demo: false }; S.assistantLog = []; S.seenAlerts = {};
    S.raws.forEach(r => { if (r.priceLog && r.priceLog.some(x => x.demo)) { r.pkgPrice = r.basePrice; r.priceLog = []; } });
    S.products.forEach(p => p.stock = 0); S.raws.forEach(r => { r.stock = 0; });
    S.demo = false; save();
  }

  // ---------- עזרים ----------
  const areaName = (s, id) => ((s || S).areas.find(a => a.id === id) || {}).name || '';
  const product = id => S.products.find(p => p.id === id);
  const customer = id => S.customers.find(c => c.id === id);
  const units = (items, s) => items.reduce((n, [id, q]) => { const p = (s || S).products.find(x => x.id === id); return n + (p && !p.service && p.tier !== 'cake' && p.tier !== 'box' ? p.qty * q : 0); }, 0);
  function orderTotal(o) {
    let sum = o.items.reduce((n, [id, q]) => { const p = product(id); return n + (p ? (p.discount || p.price) * q : 0); }, 0);
    if (o.level >= 2) sum += S.bot.rules.designFee;
    if (o.type === 'delivery' && o.area) sum += (S.areas.find(a => a.id === o.area) || { price: 0 }).price;
    return sum;
  }
  const fmt = n => '₪' + Math.round(n).toLocaleString('he-IL');
  const statusOf = k => STATUS.find(s => s.k === k) || STATUS[0];
  const leadStatusOf = k => LEAD_STATUS.find(s => s.k === k) || LEAD_STATUS[0];

  // ---------- עלויות מהמתכונים ----------
  const rawCost = r => r.pkgQty ? r.pkgPrice / r.pkgQty : 0;
  function interCostPerUnit(im) {
    let cost = 0, qty = 0;
    im.ing.forEach(([rid, q]) => { const r = S.raws.find(x => x.id === rid); if (!r) return; cost += rawCost(r) * q; if (!r.labor) qty += q; });
    cost += (im.hours || 0) * 100;
    return qty ? cost / qty : 0;
  }
  function recipeCost(rc) {
    let cost = 0;
    rc.ing.forEach(i => {
      if (i.t === 'r') { const r = S.raws.find(x => x.id === i.id); if (r) cost += rawCost(r) * i.q; }
      else { const im = S.inters.find(x => x.id === i.id); if (im) cost += interCostPerUnit(im) * i.q; }
    });
    cost += (rc.hours || 0) * (rc.rate || 100);
    cost *= 1 + (rc.waste || 0) / 100;
    return { batch: cost, unit: rc.yieldQty ? cost / rc.yieldQty : 0 };
  }
  function unitCost(pid) { const rc = S.recipes.find(r => r.product === pid); return rc ? recipeCost(rc).unit : null; }
  function trayCost(p) { const u = unitCost(p.id); return u == null ? null : u * p.qty; }
  function orderCost(o) { return o.items.reduce((n, [id, q]) => { const p = product(id); const c = p ? trayCost(p) : null; return n + (c == null ? 0 : c * q); }, 0); }

  // ---------- מלאי: מה חסר לאירועים הקרובים, רשימת קניות, תוכנית הכנה ----------
  const openOrders = () => S.orders.filter(o => ['approved', 'prep', 'ready'].includes(o.status) && o.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
  function needTrays() { // לכל מוצר: כמה מגשים צריך לאירועים הפתוחים
    const need = {};
    openOrders().forEach(o => o.items.forEach(([id, q]) => { need[id] = (need[id] || 0) + q; }));
    return need;
  }
  // יחידות תמיד (אפרים, 20.10.2026): בתוך המערכת הקינוחים נספרים ביחידות. "מגש" קיים רק מול הלקוחה (ההצעה וההזמנה)
  const perTray = p => (p && isTray(p)) ? (p.qty || 1) : 1;
  function needUnits() { // לכל מוצר: כמה יחידות צריך לאירועים הפתוחים
    const n = needTrays(), out = {}; Object.keys(n).forEach(id => { out[id] = n[id] * perTray(product(id)); }); return out;
  }
  function missingTrays() { // מוצר -> כמה יחידות חסרות אחרי מה שבמקפיא (miss = במגשים שלמים, לתאימות)
    const need = needTrays(), out = [];
    Object.entries(need).forEach(([id, q]) => { const p = product(id); if (!p || p.service || p.tier === 'cake' || p.tier === 'box') return;
      const needU = q * perTray(p), haveU = unitsOf(p), units = Math.max(0, needU - haveU);
      if (units > 0) out.push({ p, need: q, stock: p.stock || 0, miss: Math.ceil(units / perTray(p)), units, needUnits: needU, haveUnits: haveU }); });
    return out.sort((a, b) => b.units - a.units);
  }
  function rawNeeds() { // חומר -> כמות שצריך כדי להכין את מה שחסר
    const need = {};
    missingTrays().forEach(({ p, units }) => {
      const rc = S.recipes.find(r => r.product === p.id); if (!rc || !rc.yieldQty) return;
      const batches = units / rc.yieldQty;
      rc.ing.forEach(i => {
        if (i.t === 'r') need[i.id] = (need[i.id] || 0) + i.q * batches;
        else { const im = S.inters.find(x => x.id === i.id); if (!im) return; const tot = im.ing.reduce((n, [rid, q]) => { const r = S.raws.find(x => x.id === rid); return n + (r && !r.labor ? q : 0); }, 0) || 1; im.ing.forEach(([rid, q]) => { need[rid] = (need[rid] || 0) + (q / tot) * i.q * batches; }); }
      });
    });
    return need;
  }
  function shoppingList() { // לפי ספק: מה מתחת למינימום + מה האירועים צריכים
    const need = rawNeeds(), rows = [];
    S.raws.forEach(r => {
      if (r.labor) return;
      const have = (r.stock || 0) * (r.pkgQty || 1);
      const forEvents = need[r.id] || 0;
      const belowMin = (r.stock || 0) < (r.min || 0);
      const short = Math.max(0, forEvents - have);
      if (!belowMin && short <= 0) return;
      const pkgs = Math.max(belowMin ? (r.min - (r.stock || 0)) : 0, short > 0 ? (r.pkgQty ? Math.ceil(short / r.pkgQty) : 1) : 0);
      if (pkgs <= 0) return;
      rows.push({ r, pkgs, forEvents, belowMin, cost: pkgs * (r.pkgPrice || 0) });
    });
    const bySup = {};
    rows.forEach(x => { const k = x.r.supplier || 'sup-grocery'; (bySup[k] = bySup[k] || []).push(x); });
    return bySup;
  }
  function missing() { // מספר אחד לכל מושג, לכל המסכים: קינוחים חסרים (סוגים), מגשים חסרים (סך הכול), חומרים לקנות
    const mt = missingTrays(), sl = shoppingList(); let raws = 0, cost = 0; Object.keys(sl).forEach(k => sl[k].forEach(x => { raws++; cost += x.cost; }));
    return { kinds: mt.length, units: mt.reduce((n, m) => n + m.units, 0), trays: mt.reduce((n, m) => n + m.miss, 0), raws, cost, list: mt };
  }
  function madeUnits(p, n, o) { // המטבח סימנה "מוכן": N יחידות נכנסות למקפיא (n שלילי מוציא, כשמבטלים את הסימון)
    if (!p || !n) return; if (isTray(p)) setUnits(p, unitsOf(p) + n); else { p.stock = Math.max(0, (p.stock || 0) + n); save(); }
    if (o) (o.log = o.log || []).push([today(), (n > 0 ? 'המטבח הכינה ' : 'בוטל סימון "מוכן": ') + Math.abs(n) + ' יח׳ ' + p.name]);
  }
  function madeTrays(p, n, o) { // המטבח סימנה "מוכן": המגשים נכנסים למקפיא (n שלילי מוציא, כשמבטלים את הסימון)
    if (!p || !n) return; if (isTray(p)) addTrays(p, n); else { p.stock = Math.max(0, (p.stock || 0) + n); save(); }
    if (o) (o.log = o.log || []).push([today(), (n > 0 ? 'המטבח הכינה ' : 'בוטל סימון "מוכן": ') + Math.abs(n) + ' ' + (Math.abs(n) === 1 ? 'מגש' : 'מגשים') + ' ' + p.name]);
  }
  function prepPlan(days) { // לכל יום בשבוע הקרוב: מה להכין, ביחידות (אירוע בעוד יומיים => מכינים יום לפני)
    const plan = {}, stock = {}; S.products.forEach(p => stock[p.id] = unitsOf(p));
    const d0 = today();
    openOrders().forEach(o => {
      const prepDay = addDays(o.date, -1) < d0 ? d0 : addDays(o.date, -1);
      o.items.forEach(([id, q]) => { const p = product(id); if (!p || p.service || p.tier === 'box') return; const needU = q * perTray(p), use = Math.min(stock[id] || 0, needU); stock[id] = (stock[id] || 0) - use; const make = needU - use; if (make > 0) { (plan[prepDay] = plan[prepDay] || []).push({ p, units: make, trays: Math.ceil(make / perTray(p)), order: o }); } });
    });
    return Object.keys(plan).sort().slice(0, days || 7).map(d => ({ date: d, items: plan[d] }));
  }

  // ---------- כסף ----------
  function monthKey(iso) { return (iso || '').slice(0, 7); }
  function finance(month) { // הכנסה = ההעברות שעברו בחודש (גם חלקיות). עלות = מה שנמסר בחודש. רווח = הכנסות פחות הוצאות
    const m = month || monthKey(today());
    const live = p => { const o = S.orders.find(x => x.id === p.order); return o && o.status !== 'cancelled'; };
    const payments = (S.payments || []).filter(p => p.received && monthKey(p.receivedAt || p.due) === m && live(p));
    const income = sumOf(payments);
    const expenses = S.expenses.filter(x => monthKey(x.date) === m).reduce((n, x) => n + x.amount, 0);
    const delivered = S.orders.filter(o => o.status === 'done' && monthKey(o.date) === m);
    const cogs = delivered.reduce((n, o) => n + orderCost(o), 0);
    return { month: m, income, expenses, cogs, profit: income - expenses, payments, delivered };
  }
  function months(n) { const out = []; const d = new Date(); for (let i = 0; i < n; i++) { out.unshift(d.toISOString().slice(0, 7)); d.setMonth(d.getMonth() - 1); } return out; }


  // ---------- העברות כסף: לכל הזמנה מקדמה ויתרה (או תשלום אחד), וסימון וי כשרואים שהכסף עבר ----------
  // p = { id, order, customer, amount, kind, method, due, received, receivedAt, ref, note, demo, created }
  const METHODS = { bank: 'העברה בנקאית', bit: 'ביט', paybox: 'פייבוקס', cash: 'מזומן', check: 'צ׳ק', card: 'אשראי' };
  const KINDS = { deposit: 'מקדמה', balance: 'יתרה', full: 'תשלום מלא', part: 'תשלום חלקי', extra: 'תשלום נוסף' };
  const COMMIT = ['approved', 'prep', 'ready', 'done'];
  const sumOf = ps => ps.reduce((n, p) => n + (+p.amount || 0), 0);
  const paymentsOf = o => (S.payments || []).filter(p => p.order === o.id).sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  const paidAmount = o => sumOf(paymentsOf(o).filter(p => p.received));
  const balanceOf = o => (!o || o.paid || o.status === 'cancelled') ? 0 : Math.max(0, orderTotal(o) - paidAmount(o));
  const depositOf = total => { const ps = (S && S.settings && S.settings.payments) || {}; const mx = +ps.depositMax || 2000, pct = (+ps.depositPct || 30) / 100; return Math.min(mx, Math.max(Math.min(500, mx), Math.round(total * pct / 100) * 100)); };
  function newPay(o, amount, kind, due, extra) {
    return Object.assign({ id: uid('p'), order: o.id, customer: o.customer, amount: Math.round(amount), kind, method: amount >= 1500 ? 'bank' : 'bit', due: due || o.date, received: false, receivedAt: '', ref: '', note: '', demo: !!o.demo, created: today() }, extra || {});
  }
  function planPayments(o) { // הזמנה שאושרה ועוד אין לה תשלומים
    const total = orderTotal(o); if (total <= 0) return;
    if (o.paid) { S.payments.push(newPay(o, total, 'full', o.date, { received: true, receivedAt: o.date < today() ? o.date : today() })); return; }
    if (total >= 1500 && S.settings.payments && S.settings.payments.deposit) {
      const dep = depositOf(total), depDue = addDays(o.created || today(), 3);
      S.payments.push(newPay(o, dep, 'deposit', depDue < o.date ? depDue : o.date));
      S.payments.push(newPay(o, total - dep, 'balance', o.date));
    } else S.payments.push(newPay(o, total, 'full', o.date));
  }
  function syncPayments() { // שומר שהתשלומים תמיד מסתכמים במחיר ההזמנה
    if (!S.payments) S.payments = [];
    S.orders.forEach(o => {
      if (o.status === 'cancelled') { S.payments = S.payments.filter(p => p.order !== o.id || p.received); return; }
      if (COMMIT.indexOf(o.status) < 0) return;
      const ps = paymentsOf(o);
      if (!ps.length) { planPayments(o); return; }
      if (o.paid) { ps.forEach(p => { if (!p.received) { p.received = true; p.receivedAt = today(); } }); return; }
      const rest = orderTotal(o) - sumOf(ps.filter(p => p.received)), pend = ps.filter(p => !p.received);
      if (pend.length) {
        const last = pend[pend.length - 1], amt = rest - sumOf(pend.slice(0, -1));
        if (amt > 0) last.amount = Math.round(amt); else S.payments = S.payments.filter(p => p !== last);
      } else if (rest > 0) S.payments.push(newPay(o, rest, 'balance', o.date > today() ? o.date : today()));
    });
  }
  function setPayment(p, received) { // וי: "ראיתי שהכסף עבר"
    const o = S.orders.find(x => x.id === p.order), was = !!(o && o.paid);
    p.received = !!received; p.receivedAt = received ? today() : '';
    if (o) {
      o.log = o.log || [];
      if (received) o.log.push([today(), 'עברה העברה: ' + fmt(p.amount) + ' (' + (KINDS[p.kind] || 'תשלום') + ')']);
      if (received && !o.paid && paidAmount(o) >= orderTotal(o)) { o.paid = true; o.log.push([today(), 'כל הכסף התקבל']); }
      if (!received && o.paid) { o.paid = false; o.log.push([today(), 'העברה סומנה שלא עברה']); }
    }
    if (received && S.settings.receipts && S.settings.receipts.auto) makeReceipt(p);
    if (!received) S.receipts.forEach(r => { if (r.payment === p.id && !r.cancelled) cancelReceipt(r, 'ההעברה סומנה שלא עברה'); });
    queueMessages(); save(); return { order: o, completed: !!(o && o.paid && !was) };
  }
  function addPayment(o, amount, opts) { const p = newPay(o, amount, (opts && opts.kind) || 'extra', (opts && opts.due) || today(), opts); S.payments.push(p); if (p.received) setPayment(p, true); else save(); return p; }
  function removePayment(p) { S.payments = S.payments.filter(x => x !== p); save(); }
  function markOrderPaid(o, v) { // "שולם" ממסך ההזמנות או הרווח: אותו מסלול כמו הווי בהעברות (יומן ההזמנה, קבלה, וביטול שמבטל גם את הקבלה)
    if (v) { if (!paymentsOf(o).length) planPayments(o); paymentsOf(o).filter(p => !p.received).forEach(p => setPayment(p, true)); if (!o.paid) { o.paid = true; (o.log = o.log || []).push([today(), 'כל הכסף התקבל']); } }
    else { const last = paymentsOf(o).filter(p => p.received).sort((a, b) => (b.receivedAt || '').localeCompare(a.receivedAt || ''))[0]; if (last) setPayment(last, false); o.paid = false; }
    save();
  }
  function payState(o) { // מצב התשלום של הזמנה, באותן מילים בכל מסך: שולם · שולם חלקית, נשאר X · לא שולם
    if (!o || o.status === 'cancelled' || COMMIT.indexOf(o.status) < 0) return { k: 'na', label: '', short: '', paid: 0, rest: 0 };
    const total = orderTotal(o), paid = o.paid ? total : paidAmount(o), rest = Math.max(0, total - paid);
    if (o.paid || (total > 0 && rest <= 0)) return { k: 'paid', label: 'שולם', short: 'שולם', paid: total, rest: 0 };
    if (paid > 0) return { k: 'part', label: 'שולם חלקית · נשאר ' + fmt(rest), short: 'שולם חלקית', paid, rest };
    return { k: 'none', label: 'לא שולם', short: 'לא שולם', paid: 0, rest };
  }
  function remindPayment(p) { // 10: תזכורת תשלום אחת לכל חוב: ההודעה שבתור (נוצרת עכשיו אם עוד לא הגיע זמנה). המסכים פותחים אותה בהודעות ללקוחות
    const base = 'pay:' + p.id, ex = S.messages.filter(m => m.key === base || m.key.indexOf(base + ':') === 0);
    const q = ex.find(m => m.status === 'queued'); if (q) return q;
    const o = S.orders.find(x => x.id === p.order), c = S.customers.find(x => x.id === p.customer), r = S.settings.reminders;
    const m = { id: uid('m'), key: ex.length ? base + ':' + today() : base, kind: 'pay', customer: p.customer, order: o ? o.id : '', payment: p.id, due: today(), text: fill(r.payText, vars(o, c, p)), status: 'queued', created: today(), demo: !!p.demo, manual: true };
    S.messages.push(m); save(); return m;
  }
  function demoPayments(s) { // נתוני הדגמה: מקדמות שעברו, יתרות שמחכות, ויתרה אחת שעבר הזמן שלה
    s.orders.filter(o => o.demo && COMMIT.indexOf(o.status) > -1).forEach(o => {
      if (s.payments.some(p => p.order === o.id)) return;
      const total = orderTotal(o), name = (s.customers.find(c => c.id === o.customer) || {}).name || '', small = total < 1500;
      const m = small ? (o.num % 2 ? 'bit' : 'paybox') : 'bank';
      const on = d => { d = d < today() ? d : today(); return new Date(d + 'T12:00:00').getDay() === 6 ? addDays(d, -1) : d; }; // הדגמה: כסף לא עובר בשבת
      if (o.paid) {
        if (small) s.payments.push(newPay(o, total, 'full', o.date, { method: m, received: true, receivedAt: on(o.date) }));
        else { const dep = depositOf(total); s.payments.push(newPay(o, dep, 'deposit', addDays(o.created, 2), { method: m, received: true, receivedAt: on(addDays(o.created, 1)) })); s.payments.push(newPay(o, total - dep, 'balance', o.date, { method: m, received: true, receivedAt: on(o.date) })); }
      } else if (name === 'דינה קליין') {
        s.payments.push(newPay(o, 3000, 'part', addDays(o.date, -2), { method: 'bank', received: true, receivedAt: on(addDays(o.date, -1)) }));
        s.payments.push(newPay(o, total - 3000, 'balance', o.date, { method: 'bit' }));
      } else if (!small && s.settings.payments && s.settings.payments.deposit) {
        const dep = Math.min(2000, depositOf(total));
        s.payments.push(newPay(o, dep, 'deposit', addDays(o.created, 2), { method: 'bank', received: true, receivedAt: on(addDays(o.created, 1)), ref: '4471' }));
        s.payments.push(newPay(o, total - dep, 'balance', o.date, { method: 'bank' }));
      } else s.payments.push(newPay(o, total, 'full', o.date, { method: m }));
    });
  }


  // ---------- הגדרות חדשות (20.10.2026): קבלות, תזכורות, ימים חסומים ותפוסה. נוספות גם לנתונים שכבר נשמרו ----------
  function ensureNew(s) {
    s.settings = s.settings || {};
    s.settings.receipts = Object.assign({ provider: 'sumit', connected: false, auto: true, series: 1001, sendBy: 'whatsapp', business: 'פטיסייר', id: '' }, s.settings.receipts || {});
    s.settings.reminders = Object.assign({
      eventOn: true, eventDays: 2, eventText: 'היי {שם}, זוכרים אותך! ביום {יום} {תאריך} הבר שלכם מגיע ל{מקום}. הכול מוכן אצלנו, נשאר רק לארח. פטיסייר',
      payOn: true, payDays: 1, payText: 'היי {שם}, תזכורת קטנה: נשארה יתרה של {סכום} על ההזמנה ל{תאריך}. אפשר בהעברה או בביט. תודה! פטיסייר',
      receiptText: 'היי {שם}, תודה! קיבלנו {סכום}. הקבלה מצורפת. פטיסייר',
      weeklyOn: true, weeklyDay: 6, weeklyTime: '21:00'
    }, s.settings.reminders || {});
    s.settings.capacity = Object.assign({ maxEvents: 2, maxGuests: 400 }, s.settings.capacity || {});
    s.settings.connections = Object.assign({ whatsapp: false, ai: false, payments: false, gcal: false, receipts: false, bank: false }, s.settings.connections || {});
    if (!s.receipts) s.receipts = [];
    if (!s.messages) s.messages = [];
    if (!s.blocked) s.blocked = [];
    if (!s.siteStats) s.siteStats = { days: [], demo: false };
    if (!s.assistantLog) s.assistantLog = [];
    ensureNew2(s); ensureStatuses(s);
  }

  // ---------- קבלות: יוצאות לבד כשמסמנים שהכסף עבר ----------
  const receiptFor = p => S.receipts.find(r => r.payment === p.id && !r.cancelled);
  function makeReceipt(p) {
    if (!p.received) return null;
    const ex = receiptFor(p); if (ex) return ex;
    const o = S.orders.find(x => x.id === p.order), c = S.customers.find(x => x.id === p.customer) || {};
    const rs = S.settings.receipts;
    const r = { id: uid('r'), num: rs.series++, payment: p.id, order: p.order, customer: p.customer, name: c.name || 'לקוחה', phone: c.phone || '',
      amount: p.amount, method: p.method, date: p.receivedAt || today(), kind: p.kind,
      desc: (KINDS[p.kind] || 'תשלום') + (o ? ' על ' + (EVENTS[o.event] || 'אירוע') + ' ' + o.date.slice(8, 10) + '.' + o.date.slice(5, 7) + ' (הזמנה ' + o.num + ')' : ''),
      status: rs.connected ? 'sent' : 'ready', sentAt: rs.connected ? today() : '', provider: rs.provider, demo: !!p.demo, created: today() };
    S.receipts.push(r);
    if (o) (o.log = o.log || []).push([today(), 'קבלה ' + r.num + ' על ' + fmt(r.amount)]);
    return r;
  }
  function cancelReceipt(r, why) { r.cancelled = true; r.cancelledAt = today(); r.cancelWhy = why || ''; save(); }
  function sendReceipt(r) { r.status = 'sent'; r.sentAt = today(); r.demoSent = !S.settings.connections.receipts; save(); return r; }

  // ---------- ימים חסומים ותפוסה: הבוט והיומן יודעים מתי אפשר לקבל אירוע ----------
  const isBlocked = d => S.blocked.find(b => b.date === d);
  function blockDay(d, reason) { const ex = isBlocked(d); if (ex) { ex.reason = reason || ex.reason; save(); return ex; } const b = { id: uid('b'), date: d, reason: reason || 'לא מקבלים', created: today() }; S.blocked.push(b); save(); return b; }
  function unblockDay(d) { S.blocked = S.blocked.filter(b => b.date !== d); save(); }
  function dayLoad(d) { const os = S.orders.filter(o => o.date === d && ['approved', 'prep', 'ready', 'done'].includes(o.status) && o.guests > 0); return { events: os.length, guests: os.reduce((n, o) => n + (o.guests || 0), 0), orders: os }; }
  function designLoad(d) { // עיצוב בר (רמה 2 ו-3): אחד ביום. קינוחים בלבד (רמה 1): בלי הגבלה. לפי אפרים, 20.10.2026
    const orders = S.orders.filter(o => o.date === d && ['approved', 'prep', 'ready', 'done'].includes(o.status) && (o.level || 1) >= 2);
    const held = S.leads.filter(l => l.date === d && l.held && (l.level || 1) >= 2 && (l.status === 'new' || l.status === 'quoted'));
    return { orders, held, taken: orders.length + held.length > 0, order: orders[0] || null, lead: held[0] || null };
  }
  function availability(d, level) { // { free, why: blocked|shabbat|past|design|desserts|partly|empty, load, design }. level 2-3 = צריך עיצוב בר
    const b = isBlocked(d); if (b) return { free: false, why: 'blocked', reason: b.reason };
    const dt = new Date(d + 'T12:00:00'); if (dt.getDay() === 6) return { free: false, why: 'shabbat' };
    if (d < today()) return { free: false, why: 'past' };
    const l = dayLoad(d), dz = designLoad(d);
    if ((level || 1) >= 2 && dz.taken) return { free: false, why: 'design', load: l, design: dz };
    return { free: true, why: dz.taken ? 'desserts' : (l.events ? 'partly' : 'empty'), load: l, design: dz };
  }
  function nextFree(d, n, level) { let x = d, out = []; for (let i = 0; i < 60 && out.length < (n || 2); i++) { x = addDays(x, 1); if (availability(x, level).free) out.push(x); } return out; }

  // ---------- הודעות אוטומטיות: תזכורת לפני האירוע, תזכורת תשלום, קבלה, סיכום שבועי ----------
  // m = { id, key, kind:'event'|'pay'|'receipt'|'weekly', customer, order, payment, due, text, status:'queued'|'sent'|'skipped', sentAt, demo }
  function fill(tpl, v) { return (tpl || '').replace(/\{(\S+?)\}/g, (m, k) => (v[k] != null ? v[k] : m)); }
  const WDN = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  function vars(o, c, p) {
    const d = o ? new Date(o.date + 'T12:00:00') : null;
    return { 'שם': (c && c.name ? c.name.split(' ')[0] : 'לקוחה'), 'יום': d ? WDN[d.getDay()] : '', 'תאריך': o ? o.date.slice(8, 10) + '.' + o.date.slice(5, 7) : '', 'שעה': o ? o.time : '',
      'מקום': o ? (o.type === 'delivery' ? (o.address || areaName(S, o.area)) : 'איסוף עצמי') : '', 'סכום': p ? fmt(p.amount) : (o ? fmt(balanceOf(o)) : ''), 'אירוע': o ? (EVENTS[o.event] || 'אירוע') : '' };
  }
  const isShabbat = d => new Date(d + 'T12:00:00').getDay() === 6;
  const notShabbat = (d, back) => isShabbat(d) ? addDays(d, back ? -1 : 1) : d; // תזכורת לפני אירוע: ליום שישי. אחרי: ליום ראשון
  function nextWeekly() { const r = S.settings.reminders; let d = today(); for (let i = 0; i < 8; i++) { if (new Date(d + 'T12:00:00').getDay() === r.weeklyDay && !(i === 0)) return d; d = addDays(d, 1); } return d; }
  function queueMessages() { // בונה את התור לפי ההגדרות. לא משכפל (key), לא נוגע במה שכבר נשלח
    const r = S.settings.reminders, have = {}; S.messages.forEach(m => { have[m.key] = m; });
    const add = (key, m) => { if (have[key]) return; m.key = key; m.id = uid('m'); m.status = 'queued'; m.created = today(); S.messages.push(m); have[key] = m; };
    S.orders.forEach(o => {
      if (!['approved', 'prep', 'ready'].includes(o.status) || !o.guests) return;
      const c = S.customers.find(x => x.id === o.customer);
      if (r.eventOn) { const due = notShabbat(addDays(o.date, -r.eventDays), true); if (due >= today()) add('event:' + o.id, { kind: 'event', customer: o.customer, order: o.id, due, text: fill(r.eventText, vars(o, c)), demo: !!o.demo }); }
    });
    if (r.payOn) S.payments.forEach(p => {
      if (p.received) return; const o = S.orders.find(x => x.id === p.order); if (!o || o.status === 'cancelled') return;
      const c = S.customers.find(x => x.id === p.customer), due = addDays(p.due, r.payDays);
      if (due <= today()) add('pay:' + p.id, { kind: 'pay', customer: p.customer, order: o.id, payment: p.id, due: notShabbat(today(), false), text: fill(r.payText, vars(o, c, p)), demo: !!p.demo });
    });
    S.receipts.forEach(rc => { if (rc.cancelled || rc.status !== 'sent') return; add('receipt:' + rc.id, { kind: 'receipt', customer: rc.customer, order: rc.order, receipt: rc.id, due: rc.sentAt || rc.date, text: fill(r.receiptText, { 'שם': (rc.name || '').split(' ')[0], 'סכום': fmt(rc.amount) }), status: 'sent', sentAt: rc.sentAt, demo: rc.demo }); const m = have['receipt:' + rc.id]; if (m && m.status === 'queued') { m.status = 'sent'; m.sentAt = rc.sentAt || rc.date; } });
    if (r.weeklyOn) { const d = nextWeekly(); add('weekly:' + d, { kind: 'weekly', due: d, text: 'סיכום השבוע: מה לעשות, מה להכין ומה חסר. בלי סכומים.', demo: false }); }
    // הודעות שכבר לא רלוונטיות (ההזמנה בוטלה, ההעברה עברה) יורדות מהתור
    S.messages = S.messages.filter(m => {
      if (m.status !== 'queued') return true;
      if (m.kind === 'pay') { const p = S.payments.find(x => x.id === m.payment); return p && !p.received; }
      if (m.kind === 'event') { const o = S.orders.find(x => x.id === m.order); return o && ['approved', 'prep', 'ready'].includes(o.status); }
      if (m.kind === 'weekly') return m.due >= today() && r.weeklyOn;
      return true;
    });
  }
  function sendMsg(m) { m.status = 'sent'; m.sentAt = today(); m.demoSent = !S.settings.connections.whatsapp; save(); return m; }
  function skipMsg(m) { m.status = 'skipped'; save(); }
  function dueMessages() { return isShabbat(today()) ? [] : S.messages.filter(m => m.status === 'queued' && m.due <= today()); } // בשבת לא שולחים כלום

  // ---------- נתוני הביקורים באתר (הדגמה עד שהאתר מחובר) ----------
  function demoSiteStats(s) {
    const days = []; let d = addDays(today(), -29);
    for (let i = 0; i < 30; i++) { const w = new Date(d + 'T12:00:00').getDay(); const base = w === 6 ? 2 : w === 5 ? 18 : 34 + (i % 7) * 3 + ((i * 7) % 11); days.push({ date: d, visits: base, signups: w === 6 ? 0 : (i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0), logins: w === 6 ? 0 : Math.max(0, Math.round(base / 9) - 1), chats: w === 6 ? 0 : (i % 5 === 0 ? 2 : i % 2 === 0 ? 1 : 0), bot: w === 6 ? 0 : Math.round(base / 11) }); d = addDays(d, 1); }
    s.siteStats = { days, demo: true, sources: [{ n: 'גוגל', v: 46 }, { n: 'אינסטגרם', v: 28 }, { n: 'וואטסאפ (סטטוס)', v: 17 }, { n: 'ישיר', v: 9 }], pages: [{ n: 'דף הבית', v: 100 }, { n: 'קינוחים', v: 58 }, { n: 'שלוש הרמות', v: 44 }, { n: 'מארזי מתנה', v: 31 }, { n: 'נעים להכיר', v: 19 }, { n: 'שאלות', v: 12 }] };
  }


  // ---------- 20.10.2026, אחרי ההשוואה לתוכנית: תשלום מראש (מקדמה כהגדרה), שריון מלאי, התייקרות, התראות ----------
  function ensureNew2(s) {
    s.settings.payments = Object.assign({ deposit: false, depositMax: 2000, depositPct: 30, note: 'משלמים הכול מראש, לפני האירוע' }, s.settings.payments || {});
    s.raws.forEach(r => { if (r.basePrice == null) r.basePrice = r.pkgPrice; if (!r.priceLog) r.priceLog = []; });
    if (!s.seenAlerts) s.seenAlerts = {};
    s.leads.forEach(l => { if (l.notes == null) l.notes = ''; if (l.time == null) l.time = ''; });
    s.products.forEach(p => { if (isTray(p) && p.units == null) p.units = (p.stock || 0) * (p.qty || 1); });
    // 20.10.2026, אחרי 25 הממצאים
    if (!s.fix25) {
      s.raws.forEach(r => { if (r.min === 1) r.min = 0; }); // מינימום ברירת מחדל 0: קונים רק מה שחסר לאירועים
      s.raws.forEach(r => { if (r.priceLog && r.priceLog.some(x => x.demo)) { r.pkgPrice = r.basePrice; r.priceLog = []; } }); // בלי התייקרות הדגמה
      s.orders.filter(o => o.status === 'quoted' || o.status === 'new').forEach(o => { // הצעה היא פנייה, לא הזמנה
        const c = s.customers.find(x => x.id === o.customer) || {};
        const l = { id: uid('l'), name: c.name || '', phone: c.phone || '', source: 'bot', status: 'quoted', created: o.created || today(), event: o.event, guests: o.guests || 0, budget: 0, date: o.date, time: o.time || '', level: o.level || 1, type: o.type, area: o.area || '', colors: o.colors || '', allergy: o.allergy || '', demo: !!o.demo, bar: null, notes: o.notes || '', transcript: [] };
        l.bar = barFromItems(s, l, o.items || []); s.leads.push(l);
        s.orders = s.orders.filter(x => x !== o); s.payments = (s.payments || []).filter(p => p.order !== o.id);
      });
      s.fix25 = true;
    }
    if (!s.fix25b && s.bot && window.SEED && window.SEED.bot) { // השמות: יפי (הבוט של הלקוחות) ואפרים (העוזר). גם בנתונים שכבר נשמרו
      const SB = window.SEED.bot; if (s.bot.name === 'פטיסייר' || !s.bot.name) s.bot.name = SB.name; if (/🌸/.test(s.bot.opening || '') || /אני מפטיסייר/.test(s.bot.opening || '')) s.bot.opening = SB.opening;
      (s.bot.steps || []).forEach(st => { const x = SB.steps.find(y => y.key === st.key); if (x && /הבוט/.test(st.hint || '')) st.hint = x.hint; });
      if (s.settings.statusReply && /אני הבוט של פטיסייר/.test(s.settings.statusReply.fallback || '')) s.settings.statusReply.fallback = s.settings.statusReply.fallback.replace('אני הבוט של פטיסייר', 'אני יפי מפטיסייר');
      s.fix25b = true;
    }
    if (!s.fix25c) { // 25: שם האירוע "אחר" -> "אירוע", ובלי משתמש "אפרים" (זה השם של העוזר)
      (s.bot && s.bot.emotions || []).forEach(e => { if (e.event === 'other' && e.name === 'אחר') e.name = 'אירוע'; });
      s.users = (s.users || []).filter(u => !(u.id === 'u2' && u.name === 'אפרים')); if (!s.users.some(u => u.id === s.user)) s.user = (s.users[0] || {}).id || 'u1';
      s.fix25c = true;
    }
  }
  // ---------- מחיר ליחידה: במתכון. המוצר (המגש) מתחשבן לבד לפי הכמות במגש ----------
  const recipeOf = p => p ? S.recipes.find(r => r.product === p.id) : null;
  const unitPrice = p => { const rc = recipeOf(p); if (rc && rc.unitPrice != null) return rc.unitPrice; return p && p.qty ? Math.round(p.price / p.qty * 100) / 100 : (p ? p.price : 0); };
  const supplierPrice = p => { const rc = recipeOf(p); return rc && rc.supplierPrice != null ? rc.supplierPrice : null; };
  function setUnitPrice(rc, v) { v = Math.round((+v || 0) * 100) / 100; rc.unitPrice = v; const p = S.products.find(x => x.id === rc.product); if (p) p.price = Math.round(v * (p.qty || 1)); save(); return p; }
  function setSupplierPrice(rc, v) { rc.supplierPrice = Math.round((+v || 0) * 100) / 100; save(); }
  function setTrayPrice(p, v) { v = Math.round(+v || 0); p.price = v; const rc = recipeOf(p); if (rc) rc.unitPrice = Math.round(v / (p.qty || 1) * 100) / 100; save(); }
  // סנכרון מנתוני ההתחלה כשהם חדשים יותר (הפאנל החי הוא מקור האמת עד החיבור)
  function syncFromSeed(s) {
    const SD = window.SEED; if (!SD || !SD.syncedAt || (s.seedSyncedAt && s.seedSyncedAt >= SD.syncedAt)) return false;
    const by = (arr, id) => arr.find(x => x.id === id);
    SD.raws.forEach(r => { const x = by(s.raws, r.id); if (x) { x.pkgPrice = r.pkgPrice; x.pkgQty = r.pkgQty; if (x.basePrice != null) x.basePrice = r.pkgPrice; } else s.raws.push(JSON.parse(JSON.stringify(r))); });
    SD.inters.forEach(i => { const x = by(s.inters, i.id); if (x) { x.ing = JSON.parse(JSON.stringify(i.ing)); x.hours = i.hours; } else s.inters.push(JSON.parse(JSON.stringify(i))); });
    SD.recipes.forEach(r => { const x = by(s.recipes, r.id); if (x) { x.ing = JSON.parse(JSON.stringify(r.ing)); x.yieldQty = r.yieldQty; x.hours = r.hours; x.rate = r.rate; x.waste = r.waste; x.unitPrice = r.unitPrice; x.supplierPrice = r.supplierPrice; } else s.recipes.push(JSON.parse(JSON.stringify(r))); });
    SD.products.forEach(p => { const x = by(s.products, p.id); if (x) { x.price = p.price; x.qty = p.qty; if (p.discount != null) x.discount = p.discount; } });
    s.seedSyncedAt = SD.syncedAt; (s.log = s.log || []).push([today(), 'הנתונים עודכנו מהפאנל החי של פטיסייר (' + SD.syncedAt + ')']);
    return true;
  }
  const isTray = p => p && !p.service && p.tier !== 'cake' && p.tier !== 'box' && (p.qty || 1) > 1;
  function reconcileUnits() { // מי שמשנה p.stock ישירות (ביטול פעולה וכדומה): היחידות מתעדכנות לפי ההפרש, והיחידות הבודדות נשמרות
    S.products.forEach(p => { if (!isTray(p) || p.units == null) return; const q = p.qty || 1, exp = Math.floor(p.units / q), diff = (p.stock || 0) - exp; if (diff) p.units = Math.max(0, p.units + diff * q); });
  }
  const unitsOf = p => (p && p.units != null) ? p.units : ((p && p.stock) || 0) * ((p && p.qty) || 1);
  const looseOf = p => isTray(p) ? unitsOf(p) % (p.qty || 1) : 0;
  function setUnits(p, n) { n = Math.max(0, Math.round(n || 0)); p.units = n; p.stock = Math.floor(n / (p.qty || 1)); save(); return n; }
  function addTrays(p, t) { return setUnits(p, unitsOf(p) + t * (p.qty || 1)); }
  // מקדמה או הכול מראש: מסדר מחדש את ההעברות שעוד לא עברו לפי ההגדרה
  function applyDepositSetting() {
    const dep = S.settings.payments.deposit;
    S.orders.forEach(o => {
      if (COMMIT.indexOf(o.status) < 0 || o.paid || o.status === 'cancelled') return;
      const ps = paymentsOf(o), got = ps.filter(p => p.received), pend = ps.filter(p => !p.received);
      const rest = orderTotal(o) - sumOf(got); if (rest <= 0) return;
      if (!dep) {
        if (pend.length !== 1 || pend[0].amount !== rest) { S.payments = S.payments.filter(p => !pend.includes(p)); S.payments.push(newPay(o, rest, got.length ? 'balance' : 'full', o.date, { method: pend[0] ? pend[0].method : undefined })); }
        else if (pend[0].kind === 'deposit') pend[0].kind = got.length ? 'balance' : 'full';
      } else if (!got.length && pend.length === 1 && rest >= 1500) {
        const d = depositOf(rest), depDue = addDays(today(), 3);
        S.payments = S.payments.filter(p => p !== pend[0]);
        S.payments.push(newPay(o, d, 'deposit', depDue < o.date ? depDue : o.date), newPay(o, rest - d, 'balance', o.date));
      }
    });
    queueMessages(); save();
  }

  // שריון: הזמנה שאושרה תופסת את המגשים שלה מיד. במקפיא רואים "פנוי" אחרי השריון, והם יוצאים פיזית במסירה
  const reservedOf = pid => (needTrays()[pid] || 0);
  const freeOf = pid => { const p = product(pid); return (p ? (p.stock || 0) : 0) - reservedOf(pid); };
  const reservedUnitsOf = pid => (needUnits()[pid] || 0); // ביחידות: מה שההזמנות המאושרות תופסות
  const freeUnitsOf = pid => unitsOf(product(pid)) - reservedUnitsOf(pid);

  // התייקרות: מחיר חומר גלם מול המחיר שאושר (basePrice). מוצרים שהעלות שלהם עלתה והרווח ירד
  function setRawPrice(r, price) { const old = r.pkgPrice; r.pkgPrice = price; (r.priceLog = r.priceLog || []).push({ date: today(), from: old, to: price }); save(); }
  function ackRawPrice(r) { r.basePrice = r.pkgPrice; save(); }
  function costWithBase(p) { // עלות למגש עם המחירים שאושרו
    const swap = S.raws.filter(r => r.basePrice != null && r.basePrice !== r.pkgPrice).map(r => [r, r.pkgPrice]);
    swap.forEach(([r]) => { r.pkgPrice = r.basePrice; });
    const c = trayCost(p);
    swap.forEach(([r, v]) => { r.pkgPrice = v; });
    return c;
  }
  function priceAlerts() { // [{ r, from, to, pct, products: [{ p, costOld, costNow, price, marginOld, marginNow }] }]
    const out = [];
    S.raws.forEach(r => {
      if (r.labor || r.basePrice == null || r.pkgPrice <= r.basePrice * 1.02) return;
      const uses = S.recipes.filter(rc => rc.ing.some(i => (i.t === 'r' && i.id === r.id) || (i.t !== 'r' && (S.inters.find(x => x.id === i.id) || { ing: [] }).ing.some(([rid]) => rid === r.id))));
      const products = uses.map(rc => product(rc.product)).filter(Boolean).map(p => {
        const costNow = trayCost(p), costOld = costWithBase(p), price = p.discount || p.price;
        return { p, costOld, costNow, price, marginOld: price ? Math.round((price - costOld) / price * 100) : 0, marginNow: price ? Math.round((price - costNow) / price * 100) : 0 };
      }).filter(x => x.costNow > x.costOld + 0.5).sort((a, b) => (b.costNow - b.costOld) - (a.costNow - a.costOld));
      out.push({ r, from: r.basePrice, to: r.pkgPrice, pct: Math.round((r.pkgPrice / r.basePrice - 1) * 100), products });
    });
    return out.sort((a, b) => b.pct - a.pct);
  }
  function demoPriceRise(s) { // הדגמה: שני חומרים התייקרו
    [['rm_ms64oukzpkf0m', 1.18], ['rm_ms64nmzfbsx05', 1.09]].forEach(([id, k]) => { const r = s.raws.find(x => x.id === id); if (!r || r.priceLog && r.priceLog.length) return; r.basePrice = r.pkgPrice; const to = Math.round(r.pkgPrice * k * 100) / 100; r.priceLog = [{ date: addDays(today(), -2), from: r.pkgPrice, to, demo: true }]; r.pkgPrice = to; });
  }

  // התראות: מה חייבים לדעת עכשיו. לפי אפרים: פנייה שנעצרה כן, אירוע שבוע מראש לא
  function alerts() {
    const out = [], T = today(), tomorrow = addDays(T, 1);
    S.leads.filter(l => l.status === 'new').forEach(l => {
      const last = (l.transcript || [])[(l.transcript || []).length - 1], stuck = last && last[0] === 'bot';
      out.push({ kind: 'lead', key: 'lead:' + l.id + ':' + (stuck ? 's' : 'n'), level: stuck ? 'hot' : 'new', title: stuck ? 'השיחה עם ' + (l.name || l.phone || 'לקוחה') + ' נעצרה' : 'פנייה חדשה מ' + (l.name || l.phone || 'לקוחה'), sub: stuck ? 'יפי שאלה ולא קיבלה תשובה. כדאי לכתוב לה' : ((l.transcript || [[0, '']])[0][1] || '').slice(0, 60), href: 'inquiries.html?id=' + l.id, date: l.created });
    });
    const byOrder = {}; prepPlan(2).forEach(day => day.items.forEach(it => { if (it.order.date > tomorrow) return; const g = byOrder[it.order.id] = byOrder[it.order.id] || { o: it.order, day: day.date, items: [] }; g.items.push(it); }));
    Object.values(byOrder).forEach(g => { const n = g.items.reduce((x, it) => x + it.units, 0); out.push({ kind: 'stock', key: 'stock:' + g.o.id + ':' + n, level: 'hot', title: 'חסר למחר ל' + ((S.customers.find(c => c.id === g.o.customer) || {}).name || 'הזמנה') + ': ' + n + ' יח׳', sub: g.items.map(it => it.p.name + ' ' + it.units + ' יח׳').slice(0, 4).join(' · ') + (g.items.length > 4 ? ' ועוד' : ''), href: 'kitchen.html?date=' + g.day, date: T }); });
    (S.payments || []).filter(p => !p.received && p.due < T).forEach(p => { const o = S.orders.find(x => x.id === p.order); if (!o || o.status === 'cancelled') return; out.push({ kind: 'pay', key: 'pay:' + p.id + ':' + p.due, level: 'warn', title: 'ההעברה של ' + ((S.customers.find(c => c.id === p.customer) || {}).name || 'לקוחה') + ' עברה את הזמן', sub: fmt(p.amount) + ' · הייתה צריכה להגיע ' + p.due.slice(8, 10) + '.' + p.due.slice(5, 7), href: 'transfers.html?id=' + p.id, date: p.due, money: true }); });
    // התראות התייקרות בוטלו לבקשת אפרים (20.10.2026). מחירי החומרים עדיין נרשמים (priceLog), בלי התראה
    const rr = S.receipts.filter(r => !r.cancelled && r.status === 'ready'); if (rr.length) out.push({ kind: 'receipt', key: 'receipts:' + rr.map(r => r.num).join(','), level: 'info', title: (rr.length === 1 ? 'קבלה ' + rr[0].num + ' מוכנה לשליחה' : rr.length + ' קבלות מוכנות לשליחה'), sub: rr.map(r => r.name).slice(0, 3).join(', '), href: 'transfers.html?view=receipts', date: T, money: true });
    const order = { hot: 0, new: 1, warn: 2, info: 3 };
    return out.sort((a, b) => order[a.level] - order[b.level] || (b.date || '').localeCompare(a.date || ''));
  }
  function unseenAlerts(list) { return (list || alerts()).filter(a => !S.seenAlerts[a.key]); }
  function markAlertsSeen(keys) { keys.forEach(k => { S.seenAlerts[k] = today(); }); save(); }


  // ---------- סטטוסים בוואטסאפ: מה הבוט עונה למי שענתה על סטטוס (20.10.2026) ----------
  // st = { id, title, kind: product|bar|tip|sale|other, text (מה היה כתוב בסטטוס), product (id, אם יש), published, active, reply (מה הבוט עונה), next: bar|price|order|human|none, demo }
  const NEXTS = { bar: 'ממשיך לבניית בר (למה את צריכה את זה?)', price: 'שולח מחיר וכפתור להזמנה', order: 'פותח הזמנה של המוצר', human: 'מעביר למזכירה', none: 'רק עונה' };
  function ensureStatuses(s) {
    if (!s.statuses) s.statuses = [];
    s.settings.statusReply = Object.assign({ on: true, fallback: 'היי {שם}, תודה שענית לסטטוס! אני יפי מפטיסייר. רוצה לשמוע עוד על זה, או שנבנה לך בר לשמחה הקרובה?' }, s.settings.statusReply || {});
  }
  const waStatus = id => S.statuses.find(x => x.id === id);
  function addStatus(o) { const st = Object.assign({ id: uid('st'), title: '', kind: 'other', text: '', product: '', published: today(), active: true, reply: '', next: 'bar', demo: false, created: today() }, o || {}); S.statuses.unshift(st); save(); return st; }
  function removeStatus(st) { S.statuses = S.statuses.filter(x => x !== st); save(); }
  function statusReply(st, lead) { // הטקסט שהבוט עונה, עם המשתנים
    const p = st && st.product ? product(st.product) : null, c = lead ? S.customers.find(x => x.id === lead.customer) : null;
    const name = (lead && lead.name) || (c && c.name) || '';
    return fill((st && st.reply) || S.settings.statusReply.fallback, { 'שם': name ? name.split(' ')[0] : 'היי', 'מחיר': p ? fmt(p.discount || p.price) : '', 'מוצר': p ? p.name : (st ? st.title : ''), 'יחידות': p ? p.qty : '', 'סטטוס': st ? st.title : '' });
  }
  function statusStats(st) { const ls = S.leads.filter(l => l.source === 'status' && l.statusId === st.id); return { replies: ls.length, leads: ls.filter(l => l.status !== 'lost').length, orders: ls.filter(l => l.status === 'approved').length, last: ls.map(l => l.created).sort().pop() || '' }; }
  function demoStatuses(s) {
    if (s.statuses.some(x => x.demo)) return;
    const d = today();
    const a = { id: uid('st'), title: 'קרמלידה: קינוח חדש', kind: 'product', product: 'caramelida', text: 'הכירו את הקרמלידה: עוגייה, גלידה וקרמל בציפוי שוקולד פריך. חדש בתפריט.', published: addDays(d, -2), active: true, reply: 'היי {שם}, הקרמלידה באמת מטורפת. {מחיר} למגש של {יחידות} יח׳, כולל משלוח לבני ברק. רוצה להזמין מגש, או שזה לשמחה גדולה ונבנה לך בר?', next: 'order', demo: true, created: addDays(d, -2) };
    const b = { id: uid('st'), title: 'בר של השמחות לבת מצווה', kind: 'bar', product: '', text: 'ורוד וזהב, כיפות מוס תות, והאמא ישבה בשמחה. נשאר רק לארח.', published: addDays(d, -5), active: true, reply: 'היי {שם}, איזה כיף שענית! זה הבר של השמחות: אנחנו מגיעים, מעצבים, ואוספים בסוף. ספרי לי, איזו שמחה מתקרבת אצלכם?', next: 'bar', demo: true, created: addDays(d, -5) };
    const c = { id: uid('st'), title: 'טיפ: איך שומרים קינוחים', kind: 'tip', product: '', text: 'כיפות מוס מפשירים 3 שעות במקרר, לא על השיש. פטיפורים 20 דקות לפני.', published: addDays(d, -9), active: false, reply: 'היי {שם}, שמחה שהטיפ עזר! אם יש שמחה בדרך, אני בונה לך בר ברגע. רוצה?', next: 'bar', demo: true, created: addDays(d, -9) };
    s.statuses.push(a, b, c);
    // שתי פניות שהגיעו מהסטטוסים
    s.leads.push({ id: uid('l'), name: 'שירה ו.', phone: '054-880-2121', source: 'status', statusId: a.id, status: 'new', created: addDays(d, -1), event: 'other', guests: 0, budget: 0, date: '', time: '', level: 1, type: 'delivery', area: 'bb', colors: '', allergy: '', demo: true, bar: null, notes: '',
      transcript: [['user', 'וואו, כמה עולה מגש?'], ['bot', statusReplyText(a, 'שירה')], ['user', 'מגש אחד לשבת'], ['bot', 'מעולה. לאיזה יום, ולאן המשלוח? בני ברק ₪60.']] });
    s.leads.push({ id: uid('l'), name: 'אביגיל פ.', phone: '052-330-4545', source: 'status', statusId: b.id, status: 'quoted', created: addDays(d, -4), event: 'bat', guests: 70, budget: 4000, date: addDays(d, 33), time: '', level: 2, type: 'delivery', area: 'jm', colors: 'ורוד וזהב', allergy: '', demo: true, bar: null, notes: '',
      transcript: [['user', 'גם אני רוצה כזה לבת מצווה של הבת'], ['bot', statusReplyText(b, 'אביגיל')], ['user', 'בת מצווה בעוד חודש, בערך 70 איש'], ['bot', 'מזל טוב! פעם בחיים. ורוד וזהב כמו בסטטוס, או צבעים אחרים?'], ['user', 'ורוד וזהב'], ['bot', 'יש לי הכול. בונה לך את הבר...']] });
    function statusReplyText(st, nm) { const p = st.product ? s.products.find(x => x.id === st.product) : null; return fill(st.reply, { 'שם': nm, 'מחיר': p ? fmt(p.discount || p.price) : '', 'מוצר': p ? p.name : st.title, 'יחידות': p ? p.qty : '', 'סטטוס': st.title }); }
  }

  // ---------- לקוחות, פניות והזמנות ----------
  function findOrCreateCustomer(name, phone) {
    const ph = (phone || '').replace(/\D/g, '');
    let c = S.customers.find(x => x.phone.replace(/\D/g, '') === ph && ph);
    if (!c) { c = { id: uid('c'), name: name || 'לקוחה', phone: phone || '', email: '', prefs: {}, notes: '', created: today() }; S.customers.push(c); }
    else if (name && !c.name) c.name = name;
    return c;
  }
  function barFromItems(s, a, items) { // הבר של פנייה מתוך רשימת מגשים (אותו מבנה כמו Bot.build). העוגה של רמה 3 נספרת בנפרד, כמו בבוט
    const R = s.bot.rules, level = +a.level || 1;
    const rows = items.map(([id, trays]) => { const p = s.products.find(x => x.id === id); return p && p.tier !== 'cake' ? { id, name: p.name, trays, units: (p.qty || 1) * trays, price: (p.discount || p.price) * trays, flavor: p.flavor || '' } : null; }).filter(Boolean);
    const cakeP = level >= 3 ? s.products.find(p => p.id === R.cakeId) : null;
    const sub = rows.reduce((n, i) => n + i.price, 0), design = level >= 2 ? R.designFee : 0, cake = cakeP ? cakeP.price : 0;
    const delivery = a.type === 'delivery' && a.area ? ((s.areas.find(x => x.id === a.area) || {}).price || 0) : 0, units = rows.reduce((n, i) => n + i.units, 0);
    return { items: rows, units, target: units, guests: a.guests || 0, sub, design, cake, cakeName: cakeP ? cakeP.name : '', delivery, total: sub + design + cake + delivery, level, tier: R.tierOf[level], colors: a.colors || '', band: '', event: a.event, perUnitBudget: 0, note: '' };
  }
  function canConvert(l) { // הופכים פנייה להזמנה רק עם שם, תאריך וקינוחים (אחרת יוצאת הזמנה ריקה של ₪0)
    if (!l) return { ok: false, why: 'אין פנייה' };
    if (l.order && S.orders.some(o => o.id === l.order && o.status !== 'cancelled')) return { ok: false, why: 'הפנייה הזאת כבר הפכה להזמנה' };
    const miss = []; if (!String(l.name || '').trim()) miss.push('שם'); if (!l.date) miss.push('תאריך'); if (!(l.bar && l.bar.items && l.bar.items.length)) miss.push('קינוחים');
    return miss.length ? { ok: false, why: 'חסר ' + miss.join(', ') + '. משלימים בפנייה, ואז הופכים להזמנה', missing: miss } : { ok: true };
  }
  function leadToOrder(l) { // מחזיר את ההזמנה, או null אם אי אפשר (ראו canConvert)
    if (!canConvert(l).ok) return null;
    const c = findOrCreateCustomer(l.name, l.phone);
    if (l.colors) c.prefs.colors = l.colors; if (l.allergy) c.prefs.allergy = l.allergy;
    const items = l.bar.items.map(x => [x.id, x.trays]), R = S.bot.rules;
    if ((l.level || 1) >= 3 && R.cakeId && product(R.cakeId) && !items.some(([id]) => id === R.cakeId)) items.push([R.cakeId, 1]); // העוגה של רמה 3 עוברת להזמנה
    const o = { id: uid('o'), num: 1000 + S.orders.length + 1, customer: c.id, event: l.event || 'other', date: l.date, time: l.time || '', status: 'approved', level: l.level || 1,
      items, type: l.type || 'pickup', area: l.area || '', address: '', colors: l.colors || '', allergy: l.allergy || '', notes: l.notes || '', guests: l.guests || 0, paid: false, created: today(), lead: l.id, log: [[today(), 'נוצרה מפנייה' + (l.bar.total ? ' (הצעה: ' + fmt(l.bar.total) + ')' : '')]] };
    S.orders.push(o); l.status = 'approved'; l.order = o.id; delete l.held; save(); return o;
  }
  function setStatus(o, k) { o.status = k; (o.log = o.log || []).push([today(), 'סטטוס: ' + statusOf(k).n]);
    // מהתוכנית המאושרת: אחרי כל אירוע שנמסר, משימה לבקש המלצה (פעם אחת לכל הזמנה)
    if (k === 'done' && o.guests > 0 && !S.tasks.some(t => t.order === o.id && t.kind === 'review')) { const c = S.customers.find(x => x.id === o.customer); S.tasks.push({ id: uid('t'), kind: 'review', order: o.id, text: 'לבקש המלצה מ' + ((c && c.name) || 'הלקוחה') + ' על ' + (EVENTS[o.event] || 'האירוע'), done: false, date: today(), demo: !!o.demo }); }
    if (k === 'done') { o.items.forEach(([id, q]) => { const p = product(id); if (p && isTray(p)) { p.units = Math.max(0, unitsOf(p) - q * (p.qty || 1)); p.stock = Math.floor(p.units / (p.qty || 1)); } else if (p && !p.service && p.tier !== 'cake' && p.tier !== 'box') p.stock = Math.max(0, (p.stock || 0) - q); }); } save(); }

  return { STATUS, LEAD_STATUS, FLAVORS, TIERS, EVENTS, uid, today, addDays, load, save, reset, clearDemo, get S() { return S; }, areaName: id => areaName(S, id), product, customer, units: items => units(items, S), orderTotal, fmt, statusOf, leadStatusOf, rawCost, interCostPerUnit, recipeCost, unitCost, trayCost, orderCost, openOrders, needTrays, needUnits, perTray, missingTrays, rawNeeds, shoppingList, missing, madeTrays, madeUnits, reservedUnitsOf, freeUnitsOf, prepPlan, finance, months, monthKey, findOrCreateCustomer, canConvert, leadToOrder, barFromItems: (l, items) => barFromItems(S, l, items), setStatus, METHODS, KINDS, paymentsOf, paidAmount, balanceOf, payState, syncPayments, setPayment, addPayment, removePayment, markOrderPaid, remindPayment, isShabbat,
    ensureNew, receiptFor, makeReceipt, cancelReceipt, sendReceipt, isBlocked, blockDay, unblockDay, dayLoad, designLoad, availability, nextFree, fill, vars, queueMessages, sendMsg, skipMsg, dueMessages, nextWeekly,
    applyDepositSetting, reservedOf, freeOf, setRawPrice, ackRawPrice, costWithBase, priceAlerts, alerts, unseenAlerts, markAlertsSeen,
    NEXTS, waStatus, addStatus, removeStatus, statusReply, statusStats,
    isTray, unitsOf, looseOf, setUnits, addTrays, reconcileUnits, recipeOf, unitPrice, supplierPrice, setUnitPrice, setSupplierPrice, setTrayPrice, syncFromSeed };
})();

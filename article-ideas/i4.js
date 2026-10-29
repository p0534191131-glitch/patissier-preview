/* i4.js: רעיון 4, מחברת המטבח. נטען אחרי blog.js ו-article.js, ורק מוסיף אלמנטים דקורטיביים.
   הרגע החתום: עט נובע בזהב שמשרטט בעצמו. כשהצילום הראשי נכנס למסך, העט מותח סביבו קווי מידה של שרטוט טכני
   (קווי עזר, חצים, קווי מרכז ומספרים). אחר כך הוא כותב קו זהב מתחת לכל כותרת שנכנסת למסך, ומשרטט את הצילום השני.
   ועוד: סלוטייפ על הצילומים, כותרת קטנה בראש הדף, ווי בכתב יד ברשימה. בלי תנועה: הכול מוצג מלא, בלי העט. */
(function () {
  'use strict';
  var B = window.PatBlog, root = document.documentElement;
  if (!B || !root.classList.contains('idea-4')) return;
  var $ = B.$, $$ = B.$$, NS = 'http://www.w3.org/2000/svg';
  var art = $('#ar-art'); if (!art) return;
  var mob = function () { return innerWidth <= 820; };
  var uid = 0, T0 = performance.now();

  function svgEl(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function easeIO(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function easeW(k) { return -(Math.cos(Math.PI * k) - 1) / 2; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function tween(dur, fn, ez) {
    return new Promise(function (res) {
      var t0 = 0;
      function f(now) { if (!t0) t0 = now; var k = Math.min(1, (now - t0) / dur); fn(ez ? ez(k) : k); if (k < 1) requestAnimationFrame(f); else res(); }
      requestAnimationFrame(f);
    });
  }
  function deco(tag, cls, parent, before) { var e = document.createElement(tag); e.className = cls; e.setAttribute('aria-hidden', 'true'); parent.insertBefore(e, before || null); return e; }

  /* ---------- העט: גוף שוקולד מבריק, טבעות וציפורן זהב. הגרדיאנטים פעם אחת לכל העמוד ---------- */
  var defs = svgEl('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' });
  defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  defs.innerHTML = '<defs><linearGradient id="i4pg" gradientUnits="userSpaceOnUse" x1="0" y1="-8" x2="0" y2="8"><stop offset="0" stop-color="#FFF3C8"/><stop offset=".38" stop-color="#E8C77C"/><stop offset=".72" stop-color="#B0843A"/><stop offset="1" stop-color="#7A5418"/></linearGradient>' +
    '<linearGradient id="i4pb" gradientUnits="userSpaceOnUse" x1="0" y1="-8" x2="0" y2="8"><stop offset="0" stop-color="#9A6040"/><stop offset=".3" stop-color="#5E2F18"/><stop offset=".72" stop-color="#2E140A"/><stop offset="1" stop-color="#4A2414"/></linearGradient></defs>';
  document.body.appendChild(defs);
  var PEN = '<svg viewBox="-2 -11 164 22" aria-hidden="true">' +
    '<path d="M0 0L19 -5.4Q23.5 -6.4 26 -6.3V6.3Q23.5 6.4 19 5.4Z" fill="url(#i4pg)"/>' +
    '<path d="M1.6 0H14.6" stroke="#5A3A10" stroke-width=".7"/><circle cx="16" cy="0" r="1.25" fill="#5A3A10"/>' +
    '<path d="M3 -.9L18 -4.6" stroke="rgba(255,250,230,.75)" stroke-width=".8" stroke-linecap="round"/>' +
    '<path d="M25.5 -6.4H44L47 -7.2V7.2L44 6.4H25.5Z" fill="url(#i4pb)"/>' +
    '<rect x="47" y="-7.7" width="4.2" height="15.4" rx="1" fill="url(#i4pg)"/>' +
    '<path d="M51 -7.9H150Q158.5 -7.9 158.5 0Q158.5 7.9 150 7.9H51Z" fill="url(#i4pb)"/>' +
    '<rect x="108" y="-8" width="3.2" height="16" fill="url(#i4pg)"/><rect x="113.4" y="-8" width="1.4" height="16" fill="url(#i4pg)"/>' +
    '<path d="M53 -4.9H149" stroke="rgba(255,232,205,.38)" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M28 -4H43" stroke="rgba(255,232,205,.3)" stroke-width="1.2" stroke-linecap="round"/></svg>';

  function Pen(host, s) {
    var p = deco('span', 'i4-pen', host), x = 0, y = 0;
    p.innerHTML = PEN; p.style.setProperty('--s', s);
    function at(nx, ny) { x = nx; y = ny; p.style.transform = 'translate(' + nx.toFixed(1) + 'px,' + ny.toFixed(1) + 'px)'; }
    return {
      at: at,
      show: function () { void p.offsetWidth; p.classList.add('on'); return wait(240); },
      bye: function () { p.classList.remove('on'); setTimeout(function () { p.remove(); }, 400); },
      /* מעבר באוויר: העט מורם (צל גדול יותר) */
      go: function (nx, ny, dur) {
        var x0 = x, y0 = y; p.classList.add('up');
        return tween(dur || Math.min(480, 180 + Math.hypot(nx - x0, ny - y0) * .7), function (k) { at(x0 + (nx - x0) * k, y0 + (ny - y0) * k); }, easeIO)
          .then(function () { p.classList.remove('up'); });
      },
      /* משרטט: הקו נמשך בדיוק עד הציפורן */
      draw: function (path, dur) {
        var L = path.getTotalLength();
        path.style.strokeDasharray = L + ' ' + (L + 4);
        return tween(dur, function (k) { var l = L * k, pt = path.getPointAtLength(l); path.style.strokeDashoffset = (L - l).toFixed(2); at(pt.x, pt.y); }, easeW);
      }
    };
  }

  /* ---------- שרטוט טכני סביב צילום: קווי עזר, קו מידה עם חצים ומספר, קווי מרכז ----------
     box = ההדפסה (מסתובבת יחד איתה). המספרים הם הפרופורציה של ההדפסה עצמה במ"מ, לא מידות של בר. */
  function Draft(box, cfg) {
    var wrap = deco('span', 'i4-draft i4-' + cfg.tone, box);
    var me = { played: false, busy: false, dirty: false, seq: [], el: wrap };
    me.build = function () {
      var m = mob(), O = m ? cfg.Om : cfg.O, g = m ? cfg.gm : cfg.g, W = box.offsetWidth, H = box.offsetHeight;
      if (!W || !H) return;
      var VW = W + 2 * O, VH = H + 2 * O;
      wrap.style.cssText = 'left:' + -O + 'px;top:' + -O + 'px;width:' + VW + 'px;height:' + VH + 'px';
      wrap.innerHTML = '';
      var svg = svgEl('svg', { width: VW, height: VH, viewBox: '0 0 ' + VW + ' ' + VH }, wrap);
      var x0 = O, y0 = O, x1 = O + W, y1 = O + H, cx = O + W / 2, cy = O + H / 2, e = 7, ex = g + 11;
      var lab = cfg.labels(m), S = me.seq = [];
      function st(d, t, more) { var o = { d: d, t: t }; for (var k in more) o[k] = more[k]; S.push(o); }
      /* למטה: קו עזר ימני, קו המידה מימין לשמאל, קו עזר שמאלי, והמספר */
      st('M' + x1 + ' ' + (y1 + e) + 'V' + (y1 + ex), 190);
      st('M' + (x1 - .5) + ' ' + (y1 + g) + 'H' + (x0 + .5), m ? 720 : 920, { heads: [[x1, y1 + g, 0], [x0, y1 + g, 180]], label: { x: cx, y: y1 + g - 8, t: lab[0] } });
      st('M' + x0 + ' ' + (y1 + e) + 'V' + (y1 + ex), 190);
      /* קווי מרכז (נקודה-קו) מחוץ לצילום: העט מסתובב סביב ההדפסה, למטה, שמאל, למעלה, ימין */
      (cfg.ctr ? cfg.ctr(m) : []).forEach(function (c) {
        if (c === 'left') st('M' + (x0 - 48) + ' ' + cy + 'H' + (x0 - 6), 360, { ctr: 1 });
        if (c === 'top') st('M' + cx + ' ' + (y0 - 44) + 'V' + (y0 - 6), 360, { ctr: 1 });
      });
      /* בצד (רק כשיש מקום): קו מידה אנכי מלמעלה למטה */
      var side = cfg.side && cfg.side(m, g);
      if (side) {
        var sg = side === 'right' ? 1 : -1, xe = side === 'right' ? x1 : x0, xl = xe + sg * g;
        st('M' + (xe + sg * e) + ' ' + y0 + 'H' + (xe + sg * ex), 190);
        st('M' + xl + ' ' + (y0 + .5) + 'V' + (y1 - .5), 760, { heads: [[xl, y0, -90], [xl, y1, 90]], label: { x: side === 'right' ? xl - 7 : xl + 19, y: cy, t: lab[1], rot: -90 } });
        st('M' + (xe + sg * e) + ' ' + y1 + 'H' + (xe + sg * ex), 190);
      }
      S.forEach(function (s) {
        if (s.ctr) {
          var id = 'i4m' + (++uid), mk = svgEl('mask', { id: id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: VW, height: VH }, svg);
          s.p = svgEl('path', { d: s.d, fill: 'none', stroke: '#fff', 'stroke-width': 6 }, mk);
          svgEl('path', { d: s.d, 'class': 'st ctr', mask: 'url(#' + id + ')' }, svg);
        } else s.p = svgEl('path', { d: s.d, 'class': 'st' }, svg);
        s.L = s.p.getTotalLength();
        s.p.style.strokeDasharray = s.L + ' ' + (s.L + 4);
        s.p.style.strokeDashoffset = me.played ? 0 : s.L;
        if (s.heads) s.h = s.heads.map(function (h) { return svgEl('path', { d: 'M0 0L-9 -2.7L-9 2.7Z', 'class': 'ah' + (me.played ? ' on' : ''), transform: 'translate(' + h[0] + ' ' + h[1] + ') rotate(' + h[2] + ')' }, svg); });
        if (s.label) {
          var t = svgEl('text', { x: s.label.x, y: s.label.y, 'text-anchor': 'middle', 'class': me.played ? 'on' : '' }, svg);
          if (s.label.rot) t.setAttribute('transform', 'rotate(' + s.label.rot + ' ' + s.label.x + ' ' + s.label.y + ')');
          t.textContent = s.label.t; s.tx = t;
        }
      });
    };
    me.play = function () {
      if (me.played || me.busy || !me.seq.length) return;
      if (B.calm()) { me.played = true; me.build(); return; }
      turn(me, function () {
        var S = me.seq, pen = Pen(wrap, mob() ? cfg.sm : cfg.s), a = S[0].p.getPointAtLength(0);
        pen.at(a.x + 150, a.y + 70);
        var chain = wait(Math.max(0, (cfg.after || 0) - (performance.now() - T0)))
          .then(function () { return pen.show(); }).then(function () { return pen.go(a.x, a.y, 560); });
        S.forEach(function (s, i) {
          chain = chain.then(function () { if (gone(wrap)) { pen.bye(); throw 0; } var p0 = s.p.getPointAtLength(0); return i ? pen.go(p0.x, p0.y) : 0; })
            .then(function () { if (s.h) s.h[0].classList.add('on'); return pen.draw(s.p, s.t); })
            .then(function () { if (s.h) s.h[1].classList.add('on'); if (s.tx) s.tx.classList.add('on'); });
        });
        return chain.then(function () { var z = S[S.length - 1], q = z.p.getPointAtLength(z.L); return pen.go(q.x + 110, q.y - 50, 520); })
          .then(function () { pen.bye(); });
      });
    };
    return me;
  }

  /* ---------- עט אחד בלבד: כל שרטוט מחכה לתורו. מה שכבר יצא מהמסך עד שהגיע תורו, מוצג מלא בלי עט ---------- */
  var Q = Promise.resolve();
  function gone(el) { var r = el.getBoundingClientRect(); return r.bottom < 0 || r.top > innerHeight; }
  function turn(me, run) {
    me.busy = true;
    Q = Q.then(function () {
      return !gone(me.el) && !B.calm() ? run().then(function () { return true; }) : false;
    }).catch(function () { return false; }).then(function (ran) {
      me.played = true; me.busy = false;
      if (!ran || me.dirty) { me.dirty = false; me.build(); }
    });
  }

  /* ---------- קו זהב בכתב יד מתחת לכותרת: צורה קליגרפית (דקה בקצוות, עבה באמצע) שנחשפת מימין לשמאל ---------- */
  function Under(h) {
    var w = deco('span', 'i4-ulw', h.parentNode, h.nextSibling);
    var me = { played: false, busy: false, dirty: false, el: w };
    function f(q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
    me.build = function () {
      var r = document.createRange(); r.selectNodeContents(h);
      var rs = Array.prototype.filter.call(r.getClientRects(), function (q) { return q.width > 1; });
      if (!rs.length || !w.clientWidth) return;
      var bot = Math.max.apply(null, rs.map(function (q) { return q.bottom; }));
      var line = rs.filter(function (q) { return q.bottom > bot - 6; });
      var lw = Math.max.apply(null, line.map(function (q) { return q.right; })) - Math.min.apply(null, line.map(function (q) { return q.left; }));
      var W = Math.round(Math.max(90, Math.min(w.clientWidth + 8, lw * 1.03 + 12))), H = 20, n = 46, id = 'i4u' + (++uid);
      var pts = [], up = [], dn = [], i;
      for (i = 0; i <= n; i++) {
        var t = i / n;
        pts.push([W - 4 - (W - 10) * t, 10 + 1.4 * Math.sin(t * Math.PI * 1.3 + .5) - 4.6 * Math.pow(t, 3.4)]);
      }
      for (i = 0; i <= n; i++) {
        var A = pts[Math.max(0, i - 1)], Z = pts[Math.min(n, i + 1)], dx = Z[0] - A[0], dy = Z[1] - A[1], ln = Math.hypot(dx, dy) || 1;
        var hw = .4 + 1.8 * Math.pow(Math.sin(Math.PI * Math.min(1, i / n * 1.03 + .015)), .55);
        up.push([pts[i][0] - dy / ln * hw, pts[i][1] + dx / ln * hw]); dn.push([pts[i][0] + dy / ln * hw, pts[i][1] - dx / ln * hw]);
      }
      var poly = 'M' + up.map(f).join('L') + 'L' + dn.reverse().map(f).join('L') + 'Z', cl = 'M' + pts.map(f).join('L');
      w.innerHTML = '<span class="i4-ulb" style="width:' + W + 'px;height:' + H + 'px"><svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
        '<defs><linearGradient id="' + id + 'g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + W + '" y2="0"><stop offset="0" stop-color="#8A6220"/><stop offset=".22" stop-color="#C9A04A"/><stop offset=".42" stop-color="#E4C47C"/><stop offset=".6" stop-color="#B58836"/><stop offset=".8" stop-color="#D8B566"/><stop offset="1" stop-color="#9C7128"/></linearGradient>' +
        '<mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="-10" y="-10" width="' + (W + 20) + '" height="' + (H + 20) + '"><path d="' + cl + '" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/></mask></defs>' +
        '<path d="' + poly + '" fill="url(#' + id + 'g)" mask="url(#' + id + 'm)"/></svg></span>';
      me.host = w.firstChild; me.p = w.querySelector('mask path'); me.L = me.p.getTotalLength();
      me.p.style.strokeDasharray = me.L + ' ' + (me.L + 12);
      me.p.style.strokeDashoffset = me.played ? 0 : me.L;
    };
    me.play = function () {
      if (me.played || me.busy || !me.p) return;
      if (B.calm()) { me.played = true; me.p.style.strokeDashoffset = 0; return; }
      turn(me, function () {
        var p = me.p, L = me.L, pen = Pen(me.host, mob() ? .58 : .8), s0 = p.getPointAtLength(0);
        pen.at(s0.x + 30, s0.y - 34);
        return pen.show().then(function () { return pen.go(s0.x, s0.y, 240); })
          .then(function () { return pen.draw(p, Math.max(540, Math.min(1050, L * 2.1))); })
          .then(function () { var q = p.getPointAtLength(L); return pen.go(q.x - 26, q.y - 40, 320); })
          .then(function () { pen.bye(); });
      });
    };
    return me;
  }

  /* ---------- מה שמתווסף לעמוד ---------- */
  /* כותרת קטנה בראש הדף של המחברת */
  deco('p', 'i4-head', art, art.firstChild).innerHTML = '<span>פטיסייר · מהמחברת</span><i></i>';

  /* סלוטייפ קראפט על שני הצילומים */
  var hp = $('.ar-print'), pp = $('.ar-pic .print');
  [hp, pp].forEach(function (b) { if (!b) return; deco('span', 'i4-tape i4-tr', b); deco('span', 'i4-tape i4-tl', b); });

  /* הווי ברשימה: קו אחד בכתב יד שיוצא מעבר לריבוע (pathLength=1 כדי שה-CSS יצייר אותו מההתחלה לסוף) */
  $$('.ar-box path', art).forEach(function (p) { p.setAttribute('d', 'M5.6 12.9c1.5.8 2.8 2.3 3.8 4.4c2.2-5.4 5.7-9.9 11.4-14.2'); p.setAttribute('pathLength', '1'); });

  var all = [];
  /* הרגע החתום: הצילום הראשי, בזהב על השולחן */
  if (hp) all.push(Draft(hp, {
    tone: 'gold', O: 96, Om: 44, g: 40, gm: 30, s: 1.3, sm: .66, after: 1700,
    labels: function (m) { return m ? ['160', '120'] : ['160', '90']; },
    side: function (m, g) { return !m && innerWidth - hp.getBoundingClientRect().right > g + 28 ? 'right' : null; },
    ctr: function (m) { return m ? ['top'] : (hp.getBoundingClientRect().left > 58 ? ['left', 'top'] : ['top']); }
  }));
  /* הצילום השני, בדיו על הנייר */
  if (pp) all.push(Draft(pp, {
    tone: 'ink', O: 64, Om: 40, g: 34, gm: 28, s: 1, sm: .58,
    labels: function () { return ['150', '100']; },
    side: function (m, g) { return !m && pp.getBoundingClientRect().left - art.getBoundingClientRect().left > g + 14 ? 'left' : null; }
  }));
  var drafts = all.slice();
  $$('.ar-sec h2', art).forEach(function (h) { all.push(Under(h)); });

  function init() {
    all.forEach(function (o) { o.build(); });
    /* שרטוט מתחיל כשרוב השרטוט על המסך. כותרת: כשהיא עוברת את הרבע התחתון של המסך. מה שכבר מעל המסך מוצג מלא */
    all.forEach(function (o) {
      var isD = drafts.indexOf(o) > -1;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          var r = en.boundingClientRect;
          var go = isD ? en.intersectionRatio >= .8 || (en.intersectionRatio > .2 && r.bottom <= innerHeight) : en.isIntersecting;
          if (go) { o.play(); io.disconnect(); }
          else if (r.bottom < 0 && !o.played) { o.played = true; o.build(); io.disconnect(); }
        });
      }, isD ? { threshold: [0, .2, .4, .6, .8, 1] } : { rootMargin: '0px 0px -22% 0px' });
      io.observe(o.el);
    });
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { requestAnimationFrame(init); });

  /* שינוי רוחב: בונים מחדש לפי המידות החדשות (מה שכבר שורטט נשאר מלא) */
  var rt = 0, lastW = innerWidth;
  addEventListener('resize', function () {
    if (innerWidth === lastW) return; lastW = innerWidth;
    clearTimeout(rt); rt = setTimeout(function () { all.forEach(function (o) { if (o.busy) o.dirty = true; else o.build(); }); }, 160);
  });
})();

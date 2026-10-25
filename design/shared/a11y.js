/* a11y.js: תפריט נגישות צף (הגדלת טקסט, ניגודיות גבוהה, הדגשת קישורים, עצירת אנימציות, איפוס). עובד אמיתי.
   PatA11y.init({position:'start'|'end'})  (ברירת מחדל: בפינה התחתונה בצד ימין פיזי. כפתור הצעת המחיר הצף יושב בשמאל)
   מחלקות על <html>: a11y-contrast, a11y-links, a11y-still. משתנה --fs-scale על <html> (1 / 1.15 / 1.3).
   כל טקסט בעיצוב חייב להכפיל בו: font-size: calc(18px * var(--fs-scale)).
   משתני CSS לצבע: --a11y-bg --a11y-fg --a11y-accent --a11y-accent-fg.  PatA11y.isStill() לבדיקה בלולאות JS. */
(function () {
  var KEY = 'patA11y', root = document.documentElement;
  var state = { size: 0, contrast: 0, links: 0, still: 0 };
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) state = Object.assign(state, s); } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function apply() {
    root.style.setProperty('--fs-scale', [1, 1.15, 1.3][state.size]);
    root.classList.toggle('a11y-contrast', !!state.contrast);
    root.classList.toggle('a11y-links', !!state.links);
    root.classList.toggle('a11y-still', !!state.still);
    if (state.still) Array.prototype.forEach.call(document.querySelectorAll('video'), function (v) { try { v.pause(); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('a11ychange', { detail: state }));
    var ui = document.getElementById('a11y-panel'); if (!ui) return;
    ui.querySelector('[data-a="size"] b').textContent = ['רגיל', 'גדול', 'גדול מאוד'][state.size];
    ['contrast', 'links', 'still'].forEach(function (k) { var b = ui.querySelector('[data-a="' + k + '"]'); b.setAttribute('aria-pressed', state[k] ? 'true' : 'false'); });
  }
  function init(opts) {
    opts = opts || {}; load();
    var css = '#a11y-btn{position:fixed;inset-block-end:18px;' + (opts.position === 'end' ? 'left' : 'right') + ':18px;z-index:8000;width:52px;height:52px;border-radius:50%;border:0;display:grid;place-items:center;background:var(--a11y-accent,#C9A04A);color:var(--a11y-accent-fg,#3F1E0E);box-shadow:0 10px 26px -8px rgba(0,0,0,.55);transition:transform .25s cubic-bezier(.2,.8,.2,1)}#a11y-btn:hover{transform:scale(1.08)}' +
      '#a11y-panel{position:fixed;inset-block-end:82px;' + (opts.position === 'end' ? 'left' : 'right') + ':18px;z-index:8000;width:min(300px,calc(100vw - 36px));padding:16px;border-radius:20px;background:var(--a11y-bg,#3F1E0E);color:var(--a11y-fg,#F2E3C6);box-shadow:0 24px 60px -16px rgba(0,0,0,.65);display:none;font:600 15px/1.3 inherit;font-family:inherit;direction:rtl;filter:none}' +
      '#a11y-panel.on{display:block}#a11y-panel h2{font-size:16px;margin:0 0 12px;font-weight:800}#a11y-panel button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 8px;padding:11px 14px;border:0;border-radius:12px;background:rgba(255,255,255,.1);color:inherit;font:inherit;text-align:start}' +
      '#a11y-panel button[aria-pressed="true"]{background:var(--a11y-accent,#C9A04A);color:var(--a11y-accent-fg,#3F1E0E)}#a11y-panel .reset{background:transparent;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3);justify-content:center}#a11y-panel a{display:block;text-align:center;font-size:13px;opacity:.8;text-decoration:underline;margin-top:4px}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var btn = document.createElement('button'); btn.id = 'a11y-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'תפריט נגישות'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'a11y-panel');
    btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v5M12 15l-3.5 5M12 15l3.5 5"/></svg>';
    var p = document.createElement('div'); p.id = 'a11y-panel'; p.setAttribute('role', 'group'); p.setAttribute('aria-label', 'הגדרות נגישות');
    p.innerHTML = '<h2>נגישות</h2><button type="button" data-a="size">גודל טקסט <b>רגיל</b></button><button type="button" data-a="contrast" aria-pressed="false">ניגודיות גבוהה</button><button type="button" data-a="links" aria-pressed="false">הדגשת קישורים</button><button type="button" data-a="still" aria-pressed="false">עצירת אנימציות</button><button type="button" class="reset" data-a="reset">איפוס</button><a href="#accessibility">הצהרת נגישות</a>';
    document.body.appendChild(btn); document.body.appendChild(p);
    btn.addEventListener('click', function () { var on = p.classList.toggle('on'); btn.setAttribute('aria-expanded', on); });
    p.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
      if (a === 'size') state.size = (state.size + 1) % 3; else if (a === 'reset') state = { size: 0, contrast: 0, links: 0, still: 0 }; else state[a] = state[a] ? 0 : 1;
      save(); apply();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && p.classList.contains('on')) { p.classList.remove('on'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
    apply();
  }
  window.PatA11y = { init: init, isStill: function () { return root.classList.contains('a11y-still') || window.matchMedia('(prefers-reduced-motion: reduce)').matches; } };
})();

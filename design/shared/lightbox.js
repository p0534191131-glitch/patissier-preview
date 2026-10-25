/* lightbox.js: הגדלת תמונות. כל אלמנט עם data-lb="media/gal/IMG_9027.webp" (ואופציונלי data-cap="תיאור") נפתח בהגדלה.
   אפשר על <img>, <button>, <a>. הכרטיס צריך להיות נגיש בפוקוס (button או tabindex=0 + role=button).
   Esc סוגר, חצים מחליפים, הפוקוס חוזר לאלמנט שפתח. משתני CSS: --lb-bg --lb-fg --lb-accent --lb-radius. PatLightbox.init() */
(function () {
  var CSS = '.lb{position:fixed;inset:0;z-index:9000;display:grid;place-items:center;background:var(--lb-bg,rgba(24,10,4,.92));color:var(--lb-fg,#F2E3C6);opacity:0;pointer-events:none;transition:opacity .3s}' +
    '.lb.on{opacity:1;pointer-events:auto}.lb figure{margin:0;max-width:min(92vw,1400px);max-height:88vh;display:grid;gap:12px;justify-items:center}' +
    '.lb img{max-width:100%;max-height:78vh;object-fit:contain;border-radius:var(--lb-radius,14px);box-shadow:0 30px 80px -20px rgba(0,0,0,.7);transform:scale(.96);transition:transform .4s cubic-bezier(.2,.8,.2,1)}.lb.on img{transform:none}' +
    '.lb figcaption{font-size:calc(16px * var(--fs-scale,1));opacity:.85;text-align:center}' +
    '.lb button{position:absolute;border:0;background:var(--lb-fg,#F2E3C6);color:var(--lb-bg-solid,#3F1E0E);width:48px;height:48px;border-radius:50%;font-size:22px;line-height:1;display:grid;place-items:center;transition:transform .2s}.lb button:hover{transform:scale(1.08)}' +
    '.lb .lb-x{inset-block-start:20px;inset-inline-end:20px}.lb .lb-p{inset-inline-start:20px;inset-block-start:50%;margin-top:-24px}.lb .lb-n{inset-inline-end:20px;inset-block-start:50%;margin-top:-24px}';
  function init() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lb]'));
    if (!items.length) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var box = document.createElement('div'); box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'הגדלת תמונה');
    box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button class="lb-x" aria-label="סגירה">×</button><button class="lb-p" aria-label="הקודמת">›</button><button class="lb-n" aria-label="הבאה">‹</button>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), cap = box.querySelector('figcaption'), cur = 0, from = null;
    function show(i) { cur = (i + items.length) % items.length; var it = items[cur]; img.src = it.getAttribute('data-lb'); img.alt = it.getAttribute('data-cap') || it.getAttribute('alt') || ''; cap.textContent = it.getAttribute('data-cap') || ''; }
    function open(i, trigger) { from = trigger; show(i); box.classList.add('on'); document.documentElement.style.overflow = 'hidden'; box.querySelector('.lb-x').focus(); }
    function close() { box.classList.remove('on'); document.documentElement.style.overflow = ''; if (from) from.focus({ preventScroll: true }); }
    items.forEach(function (it, i) {
      if (!/^(BUTTON|A)$/.test(it.tagName) && !it.hasAttribute('tabindex')) { it.setAttribute('tabindex', '0'); it.setAttribute('role', 'button'); }
      if (!it.getAttribute('aria-label') && !it.getAttribute('alt')) it.setAttribute('aria-label', 'הגדלת תמונה');
      it.style.cursor = 'zoom-in';
      it.addEventListener('click', function (e) { e.preventDefault(); open(i, it); });
      it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, it); } });
    });
    box.querySelector('.lb-x').addEventListener('click', close);
    box.querySelector('.lb-p').addEventListener('click', function () { show(cur + 1); });
    box.querySelector('.lb-n').addEventListener('click', function () { show(cur - 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(cur + 1);
      else if (e.key === 'ArrowRight') show(cur - 1);
      else if (e.key === 'Tab') { var b = box.querySelectorAll('button'); var f = b[0], l = b[b.length - 1]; if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); } else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); } }
    });
  }
  window.PatLightbox = { init: init };
})();

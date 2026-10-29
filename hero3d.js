/* hero3d.js: "בלתי נשכחת" במסך הפתיחה באותיות זהב צהוב תלת ממדיות אמיתיות (29.10.2026).
   מנוע: three.js 0.160.0 (רישיון MIT) מ-jsDelivr, אותה כתובת ש-book3d.js טוען, כך שהדפדפן טוען אותו פעם אחת.
   הזהב: אותו חומר, אותה תאורה ואותו "סטודיו" להשתקפויות של פלטה 41 (סיומת-פלטות/palettes.html), כולל הניצוצות.
   האותיות: קווי המתאר של Google Sans Bold (הגופן שהאתר מציג בפועל, רישיון OFL) מתוך hero3d-glyphs.json,
   מוחצנות עם שוליים מלוטשים. כל אות יושבת בדיוק במקום של האות שבטקסט האמיתי (נמדד מהדף), ולכן הכול מתאים
   בכל רוחב מסך, וגם טקסט חדש מה-CMS נבנה מחדש לבד.
   הטקסט האמיתי נשאר ב-h1 (שקוף, קורא מסך קורא אותו). אם WebGL לא זמין או שמשהו נכשל, נשאר הזהב של ה-CSS. */
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
const GOLD = document.querySelector('#top .h-gold');
const HERO = document.querySelector('#top');
const ROOT = document.documentElement;
const calm = () => /(^|[?&])still(=|&|$)/.test(location.search) || ROOT.classList.contains('a11y-still') || matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- מחכים: קודם הצילום והגופן, ואז רגע פנוי, כדי לא להאט את טעינת הדף ---------- */
function afterPhoto() {
  const img = document.querySelector('#top .h-ph img');
  const loaded = !img || img.complete ? Promise.resolve() : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  return Promise.all([loaded, fonts]).then(() => new Promise(r => (window.requestIdleCallback || setTimeout)(r, { timeout: 900 })));
}

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

if (GOLD && HERO && webgl()) afterPhoto().then(start).catch(fail);

function fail(e) {
  if (e) console.warn('hero3d: נשאר הזהב של ה-CSS', e && e.message);
  if (GOLD) { GOLD.classList.remove('g3d'); GOLD.querySelectorAll('.h-g3d').forEach(c => c.remove()); }
}

async function start() {
  const [THREE, F] = await Promise.all([import(CDN), fetch(new URL('hero3d-glyphs.json', import.meta.url)).then(r => { if (!r.ok) throw new Error('glyphs ' + r.status); return r.json(); })]);

  /* ---------- הרינדור: שקוף מסביב, מיפוי גוונים "ניטרלי" כמו בפלטה 41 ---------- */
  // three 0.160 עוד לא כולל NeutralToneMapping, אז מוסיפים אותו כ-CustomToneMapping (אותה נוסחה בדיוק)
  THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
    'vec3 CustomToneMapping( vec3 color ) { return color; }',
    'vec3 CustomToneMapping( vec3 color ) { const float S = 0.76; const float D = 0.15; color *= toneMappingExposure; float x = min( color.r, min( color.g, color.b ) ); float o = x < 0.08 ? x - 6.25 * x * x : 0.04; color -= o; float p = max( color.r, max( color.g, color.b ) ); if ( p < S ) return color; float d = 1. - S; float np = 1. - d * d / ( p + d - S ); color *= np / p; float g = 1. - 1. / ( D * ( p - np ) + 1. ); return mix( color, vec3( np ), g ); }');

  const cv = document.createElement('canvas'); cv.className = 'h-g3d h-g3d-gl'; cv.setAttribute('aria-hidden', 'true');
  const sp = document.createElement('canvas'); sp.className = 'h-g3d h-g3d-sp'; sp.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.CustomToneMapping;
  renderer.toneMappingExposure = 1.18;

  /* ---------- הסטודיו להשתקפויות (העתק של פלטה 41): חדר חם כהה, סופטבוקס מלמעלה, כרטיס מקדימה ופסי אור ---------- */
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(60, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'varying vec3 vP;void main(){float y=vP.y;vec3 top=vec3(.42,.32,.22),hor=vec3(.2,.14,.09),bot=vec3(.05,.035,.025);vec3 c=y>0.?mix(hor,top,smoothstep(0.,.8,y)):mix(hor,bot,smoothstep(0.,.5,-y));gl_FragColor=vec4(c,1.);}' })));
  const panel = (w, h, dir, col, k, grad) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({ side: THREE.DoubleSide,
      uniforms: { uC: { value: new THREE.Color(col).multiplyScalar(k) }, uG: { value: new THREE.Vector4(...grad) } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform vec3 uC;uniform vec4 uG;varying vec2 vUv;void main(){vec2 d=abs(vUv-.5)*2.;float e=(1.-smoothstep(uG.x,1.,d.x))*(1.-smoothstep(uG.y,1.,d.y));gl_FragColor=vec4(uC*e*mix(uG.z,uG.w,vUv.y),1.);}' }));
    m.position.copy(new THREE.Vector3(...dir).normalize().multiplyScalar(30)); m.lookAt(0, 0, 0); envScene.add(m);
  };
  panel(40, 16, [0, 1, .5], '#fff4e2', 5.5, [.55, .4, .6, 1]);
  panel(62, 32, [0, .2, 1], '#ffe7c2', 3.4, [.7, .45, .3, 1]);
  panel(4, 36, [-1, .15, .45], '#fff7ea', 9.0, [.3, .8, 1, 1]);
  panel(3.5, 32, [1, .1, .35], '#ffefd6', 7.0, [.3, .8, 1, 1]);
  panel(12, 4, [.4, -.6, .8], '#ffd9a8', 1.2, [.5, .5, 1, 1]);
  const pm = new THREE.PMREMGenerator(renderer);
  const envTex = pm.fromScene(envScene, 0.02).texture; pm.dispose();

  const scene = new THREE.Scene(); scene.environment = envTex;
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4); key.position.set(-1, 1.5, 1.7); scene.add(key);
  scene.add(new THREE.AmbientLight(0xfff4e6, .15));

  /* ---------- החומר: הזהב הצהוב של פלטה 41, ועוד סיבוב של הסטודיו כדי שהברק ירוץ על האותיות בלי להזיז אותן ---------- */
  const envRot = { value: new THREE.Matrix3() };
  const gold = new THREE.MeshPhysicalMaterial({ color: '#F2C879', metalness: 1, roughness: .1, clearcoat: .7, clearcoatRoughness: .02, envMapIntensity: 1.9 });
  gold.onBeforeCompile = sh => {
    sh.uniforms.uEnvRot = envRot;
    const chunk = THREE.ShaderChunk.envmap_physical_pars_fragment
      .replace('textureCubeUV( envMap, worldNormal, 1.0 )', 'textureCubeUV( envMap, uEnvRot * worldNormal, 1.0 )')
      .replace('textureCubeUV( envMap, reflectVec, roughness )', 'textureCubeUV( envMap, uEnvRot * reflectVec, roughness )');
    sh.fragmentShader = sh.fragmentShader.replace('#include <envmap_physical_pars_fragment>', 'uniform mat3 uEnvRot;\n' + chunk);
  };

  const pivot = new THREE.Group(); scene.add(pivot);
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), gold); pivot.add(mesh);
  const cam = new THREE.PerspectiveCamera(22, 1, 1, 10000);

  /* ---------- קווי המתאר של אות אחת → צורות (חיצוני + חורים) ---------- */
  const cache = {};
  function contours(ch) {
    if (cache[ch]) return cache[ch];
    const g = F.glyphs[ch]; if (!g || !g.d) return (cache[ch] = []);
    const t = g.d.split(' '), out = []; let cur = null, i = 0;
    const n = () => +t[i++];
    while (i < t.length) {
      const c = t[i++];
      if (c === 'M') { cur = [['M', n(), n()]]; out.push(cur); }
      else if (c === 'L') cur.push(['L', n(), n()]);
      else if (c === 'Q') cur.push(['Q', n(), n(), n(), n()]);
      else if (c === 'C') cur.push(['C', n(), n(), n(), n(), n(), n()]);
      else if (c === 'Z') cur = null;
    }
    return (cache[ch] = out);
  }
  // מצייר קו מתאר ל-THREE.Path בקואורדינטות של הסצנה
  function toPath(cmds, P, ox, oy, s) {
    const X = x => ox + x * s, Y = y => oy - y * s;
    for (const c of cmds) {
      if (c[0] === 'M') P.moveTo(X(c[1]), Y(c[2]));
      else if (c[0] === 'L') P.lineTo(X(c[1]), Y(c[2]));
      else if (c[0] === 'Q') P.quadraticCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4]));
      else P.bezierCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4]), X(c[5]), Y(c[6]));
    }
    return P;
  }
  const area = pts => { let a = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j].x - pts[i].x) * (pts[j].y + pts[i].y); return a / 2; };
  const inside = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };
  function glyphShapes(ch, ox, oy, s) {
    const C = contours(ch).map(cmds => { const P = toPath(cmds, new THREE.Path(), ox, oy, s); const pts = P.getPoints(6); return { cmds, pts, a: Math.abs(area(pts)) }; }).filter(c => c.a > 1e-3).sort((a, b) => b.a - a.a);
    // עומק של כל קו מתאר = בתוך כמה קווים גדולים יותר הוא נמצא. זוגי = צורה, אי זוגי = חור בתוך מי שמכיל אותו
    const shapes = [];
    C.forEach((c, k) => {
      let parent = -1, depth = 0;
      for (let j = 0; j < k; j++) if (inside(c.pts[0], C[j].pts) && inside(c.pts[Math.floor(c.pts.length / 2)], C[j].pts)) { depth++; parent = j; }
      c.depth = depth;
      if (depth % 2 === 0) { c.shape = toPath(c.cmds, new THREE.Shape(), ox, oy, s); shapes.push(c.shape); }
      else if (C[parent] && C[parent].shape) C[parent].shape.holes.push(toPath(c.cmds, new THREE.Path(), ox, oy, s));
    });
    return shapes;
  }

  /* ---------- מדידה מהדף: איפה כל אות, איפה קו הבסיס, איזה גודל ---------- */
  let L = null;
  function measure() {
    const span = GOLD.querySelector('span'); if (!span) return null;
    const text = span.textContent; if (!text.trim()) return null;
    const hr = GOLD.getBoundingClientRect(), k = (GOLD.offsetWidth ? hr.width / GOLD.offsetWidth : 1) || 1;
    const rel = r => ({ l: (r.left - hr.left) / k, r: (r.right - hr.left) / k, t: (r.top - hr.top) / k, b: (r.bottom - hr.top) / k });
    const mk = document.createElement('i'); mk.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;margin:0;padding:0';
    span.insertBefore(mk, span.firstChild); const base = rel(mk.getBoundingClientRect()).b; mk.remove();
    const glyphs = [], rg = document.createRange();
    const tw = document.createTreeWalker(span, NodeFilter.SHOW_TEXT); let node;
    while ((node = tw.nextNode())) for (let i = 0; i < node.length; i++) {
      const ch = node.data[i]; if (/\s/.test(ch)) continue;
      rg.setStart(node, i); rg.setEnd(node, i + 1); const r = rg.getBoundingClientRect(); if (!r.width) continue;
      glyphs.push({ ch, ...rel(r) });
    }
    rg.selectNodeContents(span); const box = rel(rg.getBoundingClientRect());
    const fs = parseFloat(getComputedStyle(span).fontSize) || 100;
    return { text, base, glyphs, box, fs, key: text + '|' + fs.toFixed(2) + '|' + box.l.toFixed(1) + '|' + box.r.toFixed(1) + '|' + base.toFixed(1) };
  }

  /* ---------- בנייה: גיאומטריה בפיקסלים של CSS, מצלמה שבה המישור הקדמי = הפיקסלים של הדף ---------- */
  let W = 0, H = 0, dpr = 1, built = '';
  const missing = ch => !F.glyphs[ch];
  function build() {
    const m = measure(); if (!m || !m.glyphs.length) throw new Error('measure');
    if (m.glyphs.some(g => missing(g.ch))) throw new Error('glyph');
    if (m.key === built) return;
    L = m; const fs = m.fs, s = fs / F.upm;
    const pad = Math.round(fs * .34);
    const left = m.box.l - pad, top = Math.min(m.box.t, m.base - fs * .82) - pad;
    W = Math.ceil(m.box.r - m.box.l + pad * 2); H = Math.ceil(Math.max(m.box.b, m.base + fs * .3) - top + pad);
    for (const c of [cv, sp]) { c.style.left = left + 'px'; c.style.top = top + 'px'; c.style.width = W + 'px'; c.style.height = H + 'px'; }
    dpr = Math.min(2, devicePixelRatio || 1);
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    sp.width = Math.round(W * dpr); sp.height = Math.round(H * dpr);
    const cx = left + W / 2, cy = top + H / 2;
    // כל אות במרכז התיבה שלה בטקסט האמיתי, על קו הבסיס האמיתי
    const shapes = [];
    for (const g of m.glyphs) {
      const adv = F.glyphs[g.ch].a * s, ox = (g.l + g.r) / 2 - adv / 2 - cx, oy = -(m.base - cy);
      shapes.push(...glyphShapes(g.ch, ox, oy, s));
    }
    const depth = fs * .15, bt = fs * .05, bs = fs * .03;
    const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelOffset: -bs, bevelSegments: 5, curveSegments: 7 });
    const tcx = (m.box.l + m.box.r) / 2 - cx, tcy = -((m.base - fs * .36) - cy);
    geo.translate(-tcx, -tcy, -(depth + bt));
    mesh.geometry.dispose(); mesh.geometry = geo;
    pivot.position.set(tcx, tcy, 0);
    cam.aspect = W / H; cam.position.set(0, 0, (H / 2) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))); cam.near = 1; cam.far = cam.position.z * 4; cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    built = m.key;
  }

  /* ---------- ניצוצות: כמו בפלטה 41, כוכבים קטנים על הנקודות הכי בהירות ---------- */
  const probe = document.createElement('canvas'), pctx = probe.getContext('2d', { willReadFrequently: true }), sctx = sp.getContext('2d');
  function glints(n) {
    const PW = 160, PH = Math.max(8, Math.round(PW * H / W)); probe.width = PW; probe.height = PH; pctx.clearRect(0, 0, PW, PH); pctx.drawImage(cv, 0, 0, PW, PH);
    const d = pctx.getImageData(0, 0, PW, PH).data, c = [];
    for (let y = 1; y < PH - 1; y++) for (let x = 1; x < PW - 1; x++) { const i = (y * PW + x) * 4; if (d[i + 3] < 200) continue; const l = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; if (l > 222) c.push([l, x, y]); }
    c.sort((a, b) => b[0] - a[0]); const out = [];
    for (const p of c) { if (out.length >= n) break; if (out.every(q => Math.hypot(q[1] - p[1], q[2] - p[2]) > PW * .14)) out.push(p); }
    return out.map(p => [(p[1] + .5) / PW, (p[2] + .5) / PH, (p[0] - 222) / 33]);
  }
  function star(x, y, r, a) {
    const ctx = sctx; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, Math.min(1, a));
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * .5); g.addColorStop(0, 'rgba(255,250,235,.95)'); g.addColorStop(1, 'rgba(255,230,180,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * .5, 0, 7); ctx.fill();
    for (const [dx, dy, k] of [[1, 0, 1], [0, 1, .8], [.7, .7, .35], [.7, -.7, .35]]) {
      const Lh = r * k, lg = ctx.createLinearGradient(x - dx * Lh, y - dy * Lh, x + dx * Lh, y + dy * Lh);
      lg.addColorStop(0, 'rgba(255,240,210,0)'); lg.addColorStop(.5, 'rgba(255,252,240,1)'); lg.addColorStop(1, 'rgba(255,240,210,0)');
      ctx.strokeStyle = lg; ctx.lineWidth = Math.max(1, r * .045); ctx.beginPath(); ctx.moveTo(x - dx * Lh, y - dy * Lh); ctx.lineTo(x + dx * Lh, y + dy * Lh); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- תנועה: עדינה מאוד. העכבר מטה מעט, הגלילה מטה מעט, והסטודיו מסתובב לאט כדי שהברק ירוץ ---------- */
  const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; tgt.x = (e.clientY / innerHeight - .5); tgt.y = (e.clientX / innerWidth - .5); }, { passive: true });
  const e4 = new THREE.Matrix4(), eu = new THREE.Euler();
  let spots = [], tick = 0, raf = 0, on = false, t0 = performance.now();
  function frame(now) {
    raf = 0;
    const still = calm(), s = (now - t0) / 1000;
    const sc = Math.min(1, Math.max(0, scrollY / Math.max(1, innerHeight)));
    if (!still) { cur.x += (tgt.x - cur.x) * .06; cur.y += (tgt.y - cur.y) * .06; }
    pivot.rotation.x = -.07 + (still ? 0 : cur.x * .07 + sc * .12);
    pivot.rotation.y = still ? 0 : cur.y * .1;
    // הברק: הסטודיו מסתובב הלוך וחזור, ועוד קצת לפי הגלילה
    eu.set(still ? .05 : .08 * Math.sin(s * .23), still ? -.35 : .62 * Math.sin(s * .32) + sc * 1.4, 0);
    envRot.value.setFromMatrix4(e4.makeRotationFromEuler(eu));
    key.position.set(-1 + (still ? 0 : .8 * Math.sin(s * .32)), 1.5, 1.7);
    renderer.render(scene, cam);
    if (tick++ % 6 === 0) spots = glints(4);
    sctx.clearRect(0, 0, sp.width, sp.height);
    const R = (L ? L.fs : 100) * dpr * .42;
    spots.forEach(([x, y, k], i) => star(x * sp.width, y * sp.height, R * (still ? .9 : .7 + .3 * Math.sin(s * 3 + i * 2)), .45 + .5 * Math.min(1, k)));
    if (on && !still && !paused) raf = requestAnimationFrame(frame);
  }
  let paused = false;   // hero-open.js עוצר את הרינדור כשהכותרת כבר עפה מהמסך
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };

  /* ---------- מתחילים: בונים, מוסיפים את הקנבסים, ומחליפים מה-CSS לתלת ממד בהדרגה ---------- */
  GOLD.appendChild(cv); GOLD.appendChild(sp);
  build();
  renderer.compile(scene, cam);
  frame(performance.now());
  setTimeout(() => GOLD.classList.add('g3d'), 30);

  // רק כשמסך הפתיחה נראה, ורק כשהלשונית פתוחה
  new IntersectionObserver(es => { on = es[0].isIntersecting && !document.hidden; if (on) go(); }, { rootMargin: '80px 0px' }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (document.hidden) on = false; else { on = cv.getBoundingClientRect().bottom > 0 && cv.getBoundingClientRect().top < innerHeight; if (on) go(); } });
  addEventListener('scroll', () => { if (on) go(); }, { passive: true });

  // שינוי גודל / טקסט חדש מה-CMS: בונים מחדש
  let rt = 0;
  // טקסט שיש בו תו בלי צורה (למשל אימוג'י): הזהב של ה-CSS חוזר, ובטקסט התקין הבא התלת ממד חוזר
  const rebuild = () => { clearTimeout(rt); rt = setTimeout(() => { try { build(); GOLD.classList.add('g3d'); go(); frame(performance.now()); } catch (e) { built = ''; GOLD.classList.remove('g3d'); } }, 120); };
  addEventListener('resize', rebuild);
  new ResizeObserver(rebuild).observe(GOLD.closest('.h-txt') || GOLD);
  const mo = new MutationObserver(muts => { if (muts.some(m => !(m.target.classList && m.target.classList.contains('h-g3d')))) rebuild(); });
  mo.observe(GOLD, { attributes: true, attributeFilter: ['data-t'], characterData: true, subtree: true, childList: true });
  // המדידה מוסיפה ומסירה סימן קטן בתוך הטקסט: לא בונים מחדש בגלל זה
  const _b = build; build = function () { mo.disconnect(); try { _b(); } finally { mo.takeRecords(); mo.observe(GOLD, { attributes: true, attributeFilter: ['data-t'], characterData: true, subtree: true, childList: true }); } };
  window.PatHero3D = { rebuild, render: () => frame(performance.now()), pause(v) { v = !!v; if (paused === v) return; paused = v; if (!v && on) go(); } };
}

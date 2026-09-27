/* Scene registry, global FX timeline, frame renderer and live preview. */

const cvs = document.getElementById('scene');
const ctx = cvs.getContext('2d', { willReadFrequently: false });
const out = document.getElementById('out');
const CUES = window.CUES;
const CUT_TIMES = CUES.cuts.map(bt);

/* [start, end, draw] — windows may overlap; later entries draw on top */
const SCENES = [
  [0, T.imagine, sIntro],
  [T.imagine, T.design, sImagine],
  [T.design, T.build, sDesign],
  [T.build, T.automate, sBuild],
  [T.automate, T.matrix, sAutomate],
  [T.matrix, T.unravel, sMatrix],
  ...(typeof WORK_SCENES !== 'undefined' ? WORK_SCENES : []),
  ...(typeof CLOSE_SCENES !== 'undefined' ? CLOSE_SCENES : []),
];

const LIGHT = [[T.build, T.automate], [T.pagevelle + 0.15, T.xenon], [T.uiqraft + 0.2, T.staysecure], [T.finale, DUR + 1]];

function fxAt(t) {
  const fx = { aberr: 0.0024, glitch: 0, flash: 0, flashCol: [1, 1, 1], sx: 0, sy: 0, zoom: 1, bloom: 0.32, bloomThr: 0.72, vig: 0.42, grain: 0.024 };
  for (const [beat, amp] of CUES.hits) {
    const ht = bt(beat);
    if (t < ht) continue;
    const e = Math.exp(-(t - ht) * 13) * amp;
    fx.aberr += e * 0.02;
    fx.sx += e * 10 * vnoise(t * 38, beat);
    fx.sy += e * 10 * vnoise(t * 38, beat + 17);
    fx.zoom += e * 0.014;
  }
  for (const [b0, b1, amp] of CUES.glitches) {
    const t0 = bt(b0), t1 = bt(b1);
    if (t >= t0 && t < t1) {
      const k = Math.sin(Math.PI * inv(t0, t1, t));
      const flick = hash(Math.floor(t * 30) + b0 * 13) > 0.3 ? 1 : 0.25;
      fx.glitch = Math.max(fx.glitch, amp * k * flick);
    }
  }
  for (const [beat, dur, amp] of CUES.flashes) {
    const ft = bt(beat);
    if (t >= ft && t < ft + dur) fx.flash = Math.max(fx.flash, amp * Math.pow(1 - (t - ft) / dur, 2));
  }
  for (const [b0, bPeak, b1, amp] of CUES.flutes) {
    const t0 = bt(b0), tp = bt(bPeak), t1 = bt(b1);
    if (t >= t0 && t < t1) {
      fx.flute = amp * (t < tp ? Ez.inCubic(inv(t0, tp, t)) : 1 - Ez.outCubic(inv(tp, t1, t)));
      fx.flutePh = (t - t0) * 3.5;
    }
  }
  if (t >= T.staysecure && t < T.wall) { fx.bloom = 0.16; fx.bloomThr = 0.8; }
  for (const [a, b] of LIGHT) {
    if (t >= a && t < b) { fx.bloom = 0.18; fx.bloomThr = 0.95; fx.vig = 0.16; }
  }
  return fx;
}

function renderScene(t) {
  const fx = fxAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(fx.sx, fx.sy);
  about(ctx, W / 2, H / 2, fx.zoom);
  for (const [a, b, fn] of SCENES) {
    if (t >= a && t < b) {
      ctx.save();
      fn(ctx, t);
      ctx.restore();
    }
  }
  ctx.restore();
  if (typeof drawHUD === 'function') { ctx.save(); drawHUD(ctx, t); ctx.restore(); }
  return fx;
}

/** clamp a sub-frame time so the shutter never straddles a hard cut */
function shutterTime(t0, ts) {
  for (const c of CUT_TIMES) {
    if (t0 < c && ts >= c) return c - 1e-4;
    if (ts < c && t0 >= c) return c;
  }
  return Math.max(0, Math.min(DUR - 1e-4, ts));
}

Post.init(out);

function renderFrame(frame, samples = 6, shutter = 0.6) {
  const t0 = frame / FPS;
  Post.begin(samples);
  for (let s = 0; s < samples; s++) {
    const off = samples === 1 ? 0 : ((s + 0.5) / samples - 0.5) * (shutter / FPS);
    const ts = shutterTime(t0, t0 + off);
    const fx = renderScene(ts);
    Post.add(cvs, fx, ts);
  }
  Post.finish(fxAt(t0), t0);
}

const FONT_FILES = [
  ['Outfit', 300], ['Outfit', 400], ['Outfit', 500], ['Outfit', 600], ['Outfit', 700], ['Outfit', 800], ['Outfit', 900],
  ['Plus Jakarta Sans', 400], ['Plus Jakarta Sans', 500], ['Plus Jakarta Sans', 600], ['Plus Jakarta Sans', 700], ['Plus Jakarta Sans', 800],
  ['JetBrains Mono', 400], ['JetBrains Mono', 500], ['JetBrains Mono', 700], ['JetBrains Mono', 800],
];
async function loadFonts() {
  const slug = f => f.toLowerCase().replace(/ /g, '-');
  const faces = FONT_FILES.map(([fam, w]) => new FontFace(fam, `url(fonts/${slug(fam)}-latin-${w}-normal.woff2)`, { weight: String(w) }));
  faces.push(new FontFace('Instrument Serif', 'url(fonts/instrument-serif-latin-400-normal.woff2)', { weight: '400' }));
  faces.push(new FontFace('Instrument Serif', 'url(fonts/instrument-serif-latin-400-italic.woff2)', { weight: '400', style: 'italic' }));
  await Promise.all(faces.map(f => f.load().then(() => document.fonts.add(f))));
}

window.REEL = {
  W, H, FPS, DUR,
  frames: Math.round(DUR * FPS),
  ready: Promise.all([loadFonts(), IMG.ready]).then(() => { initParticles(); endNameShape(); }),
  renderFrame,
};

/* ---------- live preview (no motion blur) unless driven by tools/render.mjs via ?render ---------- */
if (!/[?&]render/.test(location.search)) {
  document.body.classList.add('preview');
  const audio = new Audio('showreel.mp4'); // plays the rendered soundtrack alongside the live preview
  let start = null, paused = false, pausedAt = 0;
  const bar = document.getElementById('bar');
  window.REEL.ready.then(() => {
    const tick = now => {
      if (start === null) start = now;
      const t = paused ? pausedAt : ((now - start) / 1000) % DUR;
      renderFrame(Math.floor(t * FPS), 1);
      bar.style.width = `${(t / DUR) * 100}%`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    document.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        paused = !paused;
        if (paused) { pausedAt = ((performance.now() - start) / 1000) % DUR; audio.pause(); }
        else { start = performance.now() - pausedAt * 1000; audio.currentTime = pausedAt; audio.play().catch(() => {}); }
      }
    });
    document.addEventListener('click', () => { start = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); });
  });
}

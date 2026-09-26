/* Showreel toolkit: timing, easing, springs, deterministic noise, text + path helpers.
   Everything is a pure function of time so any frame can be rendered in isolation. */

const W = 1920, H = 1080, FPS = 60, DUR = 15;
const BPM = 128, BEAT = 60 / BPM, BAR = BEAT * 4;
const bt = n => n * BEAT;
const TAU = Math.PI * 2, D2R = Math.PI / 180;

const PAL = {
  ink: '#05070F', navy: '#0B1224', navy2: '#111A33', slate900: '#0F172A',
  blue: '#2563EB', indigo: '#4F46E5', violet: '#7C3AED', sky: '#38BDF8', cyan: '#22D3EE',
  emerald: '#10B981', teal: '#2DD4BF', amber: '#F59E0B', rose: '#F43F5E', pink: '#E879F9',
  paper: '#F3F6FC', white: '#FFFFFF', slate: '#94A3B8', slate300: '#CBD5E1', mute: '#64748B',
};

/* ---------- math ---------- */
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const fract = x => x - Math.floor(x);

const Ez = {
  lin: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inCubic: t => t * t * t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: t => 1 - Math.pow(1 - t, 4),
  outQuint: t => 1 - Math.pow(1 - t, 5),
  inOutQuint: t => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outBack: t => { const s = 1.70158; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
  inBack: t => { const s = 1.70158; return (s + 1) * t * t * t - s * t * t; },
  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  smooth: t => t * t * (3 - 2 * t),
};

/** eased progress of t through [t0, t1] */
const A = (t, t0, t1, e = Ez.outExpo) => e(inv(t0, t1, t));

/** damped spring step response; tt in seconds, settles to 1 */
function spring(tt, freq = 2.6, damp = 6.5) {
  if (tt <= 0) return 0;
  return 1 - Math.exp(-damp * tt) * Math.cos(freq * TAU * tt);
}

/** decaying impulse, used for punches / pulses */
const pulse = (t, t0, k = 12) => (t < t0 ? 0 : Math.exp(-(t - t0) * k));

const hash = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);
const hash2 = (a, b) => fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453123);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** smooth 1D value noise in [-1, 1] */
function vnoise(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57.31), hash(i + 1 + seed * 57.31), u) * 2 - 1;
}

/* ---------- colour ---------- */
function hexRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mixHex(a, b, t) {
  const A_ = hexRgb(a), B_ = hexRgb(b);
  return `rgb(${Math.round(lerp(A_[0], B_[0], t))},${Math.round(lerp(A_[1], B_[1], t))},${Math.round(lerp(A_[2], B_[2], t))})`;
}
function rgba(h, a) {
  const c = hexRgb(h);
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

/* ---------- text ---------- */
function setFont(ctx, weight, size, fam = 'Outfit', style = 'normal') {
  ctx.font = `${style} ${weight} ${size}px "${fam}"`;
  ctx.letterSpacing = '0px';
}
const MONO = 'JetBrains Mono', SANS = 'Plus Jakarta Sans', DISP = 'Outfit', SERIF = 'Instrument Serif';

/** per-character x offsets (kerning-aware via prefix measurement) */
function charLayout(ctx, str, track = 0) {
  const xs = [];
  for (let i = 0; i < str.length; i++) xs.push(ctx.measureText(str.slice(0, i)).width + i * track);
  const w = ctx.measureText(str).width + Math.max(0, str.length - 1) * track;
  return { xs, w };
}

/**
 * Masked, staggered per-character rise. Returns the text width.
 * o: { t, stagger, dur, from (fraction of size), align, track, ease, fill, mask, out: {t0,t1} }
 */
function riseText(ctx, str, x, y, size, o = {}) {
  const t = o.t ?? 1, st = o.stagger ?? 0.03, dur = o.dur ?? 0.4, from = o.from ?? 1.05;
  const ease = o.ease || Ez.outExpo;
  const { xs, w } = charLayout(ctx, str, o.track || 0);
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  ctx.save();
  if (o.mask !== false) {
    ctx.beginPath();
    ctx.rect(x0 - size, y - size * 1.02, w + size * 2, size * 1.3);
    ctx.clip();
  }
  if (o.fill) ctx.fillStyle = o.fill;
  const n = str.length;
  for (let i = 0; i < n; i++) {
    const ch = str[i];
    if (ch === ' ') continue;
    const k = o.order === 'center' ? Math.abs(i - (n - 1) / 2) : o.order === 'reverse' ? n - 1 - i : i;
    const p = ease(clamp((t - k * st) / dur));
    let dy = (1 - p) * size * from;
    if (o.out) {
      const q = Ez.inExpo(clamp((t - o.out[0] - k * st * 0.6) / (o.out[1] - o.out[0])));
      dy -= q * size * 1.1;
    }
    if (p <= 0) continue;
    if (o.stroke) ctx.strokeText(ch, x0 + xs[i], y + dy);
    else ctx.fillText(ch, x0 + xs[i], y + dy);
  }
  ctx.restore();
  return w;
}

/** typewriter reveal with smooth leading edge; returns x of caret */
function typeText(ctx, str, x, y, t, t0, cps, o = {}) {
  const n = clamp((t - t0) * cps, 0, str.length);
  const shown = str.slice(0, Math.floor(n));
  if (o.colorFn) {
    // per-character colouring
    const { xs } = charLayout(ctx, str, 0);
    for (let i = 0; i < shown.length; i++) {
      ctx.fillStyle = o.colorFn(i);
      ctx.fillText(shown[i], x + xs[i], y);
    }
  } else ctx.fillText(shown, x, y);
  const cx = x + ctx.measureText(shown).width;
  if (o.caret) {
    const blink = n >= str.length ? (Math.floor(t * 3.2) % 2 === 0 ? 1 : 0) : 1;
    if (blink) {
      const s = o.caretSize || 28;
      ctx.fillRect(cx + 4, y - s * 0.8, s * 0.5, s);
    }
  }
  return cx;
}

const SCRAMBLE = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789<>/{}[]#$%&*+=?';
function scrambleChar(seed) {
  return SCRAMBLE[Math.floor(hash(seed) * SCRAMBLE.length)];
}

/* ---------- paths ---------- */
function polyLength(pts) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
    acc.push(acc[i - 1] + Math.hypot(dx, dy));
  }
  return acc;
}

/** stroke a polyline from fraction a to fraction b of its arc length */
function strokePartial(ctx, pts, a, b, acc) {
  if (b <= a || pts.length < 2) return;
  acc = acc || polyLength(pts);
  const L = acc[acc.length - 1], la = a * L, lb = b * L;
  ctx.beginPath();
  let started = false;
  for (let i = 1; i < pts.length; i++) {
    const s0 = acc[i - 1], s1 = acc[i];
    if (s1 < la || s0 > lb) continue;
    const u0 = s1 === s0 ? 0 : clamp((la - s0) / (s1 - s0));
    const u1 = s1 === s0 ? 1 : clamp((lb - s0) / (s1 - s0));
    const p0 = [lerp(pts[i - 1][0], pts[i][0], u0), lerp(pts[i - 1][1], pts[i][1], u0)];
    const p1 = [lerp(pts[i - 1][0], pts[i][0], u1), lerp(pts[i - 1][1], pts[i][1], u1)];
    if (!started) { ctx.moveTo(p0[0], p0[1]); started = true; }
    ctx.lineTo(p1[0], p1[1]);
  }
  ctx.stroke();
}

function pointAt(pts, f, acc) {
  acc = acc || polyLength(pts);
  const L = acc[acc.length - 1] * clamp(f);
  for (let i = 1; i < pts.length; i++) {
    if (acc[i] >= L) {
      const u = (L - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]);
      return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)];
    }
  }
  return pts[pts.length - 1];
}

function bezier(p0, p1, p2, p3, n = 40) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

/* ---------- drawing helpers ---------- */
function fillBg(ctx, c) { ctx.fillStyle = c; ctx.fillRect(-W, -H, W * 3, H * 3); }

function glow(ctx, x, y, r, color, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function dotGrid(ctx, gap, alpha, color = '#FFFFFF', ox = 0, oy = 0, r = 1.6) {
  ctx.fillStyle = rgba(color, alpha);
  const sx = ((ox % gap) + gap) % gap, sy = ((oy % gap) + gap) % gap;
  for (let y = sy - gap; y < H + gap; y += gap) for (let x = sx - gap; x < W + gap; x += gap) ctx.fillRect(x - r / 2, y - r / 2, r, r);
}

function lineGrid(ctx, gap, alpha, color = '#FFFFFF', ox = 0, oy = 0) {
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = (((ox % gap) + gap) % gap); x < W; x += gap) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
  for (let y = (((oy % gap) + gap) % gap); y < H; y += gap) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
  ctx.stroke();
}

function ring(ctx, x, y, r, w, color, a = 1) {
  if (r <= 0 || w <= 0 || a <= 0) return;
  ctx.strokeStyle = rgba(color, a);
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
}

function circle(ctx, x, y, r, fill) {
  if (r <= 0) return;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

/** vector check mark, p = draw progress */
function checkMark(ctx, x, y, s, p, color, w = 4) {
  const pts = [[x - s * 0.5, y], [x - s * 0.12, y + s * 0.38], [x + s * 0.55, y - s * 0.4]];
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  strokePartial(ctx, pts, 0, p);
}

/** arrow-cursor glyph (tip at x, y) */
function cursorGlyph(ctx, x, y, s = 1, fill = '#0F172A', stroke = '#FFFFFF') {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(8, 23); ctx.lineTo(13.5, 35); ctx.lineTo(18.5, 32.8);
  ctx.lineTo(13, 21); ctx.lineTo(23, 21); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

function pill(ctx, x, y, w, h, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

/** apply a transform that scales/rotates about a pivot */
function about(ctx, px, py, s = 1, rot = 0, sy = s) {
  ctx.translate(px, py);
  if (rot) ctx.rotate(rot);
  ctx.scale(s, sy);
  ctx.translate(-px, -py);
}

/* ---------- odometer digits ---------- */
/**
 * Draw a rolling number. value may be fractional; each digit column rolls
 * continuously so the motion-blur pass turns fast columns into streaks.
 */
function odometer(ctx, value, x, y, size, o = {}) {
  const digits = o.digits || Math.max(1, Math.floor(Math.abs(value)).toString().length);
  const dw = o.digitW || size * 0.6;
  const pre = o.prefix || '', suf = o.suffix || '';
  ctx.textBaseline = 'alphabetic';
  let cx = x;
  const totalW = ctx.measureText(pre).width + digits * dw + ctx.measureText(suf).width;
  if (o.align === 'center') cx -= totalW / 2;
  if (o.align === 'right') cx -= totalW;
  ctx.fillText(pre, cx, y);
  cx += ctx.measureText(pre).width;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - 4, y - size * 0.86, digits * dw + 8, size * 0.98);
  ctx.clip();
  const v = Math.max(0, value);
  for (let k = digits - 1; k >= 0; k--) {
    const place = Math.pow(10, k);
    const raw = v / place;
    // lower columns roll continuously; higher columns snap on carry like a mechanical counter
    let d = Math.floor(raw) % 10, f = raw - Math.floor(raw);
    if (k > 0) {
      const lower = (v % place) / place;
      f = lower > 0.9 ? (lower - 0.9) / 0.1 : 0;
    }
    f = Ez.smooth(f);
    const col = cx + (digits - 1 - k) * dw;
    const lead = o.noLeadingZero && k > 0 && Math.floor(raw) === 0; // this column is a leading zero
    const lh = size * 1.0;
    const nd = (d + 1) % 10;
    if (!lead) ctx.fillText(String(d), col + (dw - ctx.measureText(String(d)).width) / 2, y - f * lh);
    if (f > 0) ctx.fillText(String(nd), col + (dw - ctx.measureText(String(nd)).width) / 2, y + lh - f * lh);
  }
  ctx.restore();
  ctx.fillText(suf, cx + digits * dw, y);
  return totalW;
}

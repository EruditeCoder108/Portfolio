/* One shared particle set (a 120×68 dot matrix = 8160 points) that plays several roles:
   Act I½  — a dot-matrix sign that lifts into a 3D landscape and swirls into the Unravel knot;
   Finale — 3D dot sculptures of the project marks on reeded glass, which then resolve into the name. */

const PG = { cols: 120, rows: 68, gap: 16 };
const PN = PG.cols * PG.rows;

const PSYS = {
  seed: new Float32Array(PN),
  seed2: new Float32Array(PN),
  gx: new Float32Array(PN),
  gy: new Float32Array(PN),
  lit: new Uint8Array(PN),
  shapes: {},
  // per-frame scratch (screen space)
  x: new Float32Array(PN), y: new Float32Array(PN), s: new Float32Array(PN), a: new Float32Array(PN),
  b: new Float32Array(PN), // defocus radius (px): 0 = sharp square, >0 = soft bokeh disc
  ready: false,
};

(() => {
  const r = rng(2026);
  for (let i = 0; i < PN; i++) {
    PSYS.seed[i] = r();
    PSYS.seed2[i] = r();
    const c = i % PG.cols, rr = Math.floor(i / PG.cols);
    PSYS.gx[i] = (c - (PG.cols - 1) / 2) * PG.gap;
    PSYS.gy[i] = (rr - (PG.rows - 1) / 2) * PG.gap;
  }
})();

/** draw into an offscreen canvas and pick PN evenly-shuffled points from pixels passing `keep` */
function sampleShape(w, h, draw, keep, depth = 60) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  draw(g, w, h);
  const d = g.getImageData(0, 0, w, h).data;
  const cand = [];
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2) {
      const k = (y * w + x) * 4;
      if (keep(d[k], d[k + 1], d[k + 2], d[k + 3])) cand.push(k);
    }
  const r = rng(w * 31 + cand.length);
  for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
  const pos = new Float32Array(PN * 3), col = new Array(PN);
  for (let i = 0; i < PN; i++) {
    const k = cand[i % cand.length], px = (k / 4) % w, py = Math.floor(k / 4 / w);
    pos[i * 3] = px - w / 2 + (r() - 0.5) * 2;
    pos[i * 3 + 1] = py - h / 2 + (r() - 0.5) * 2;
    pos[i * 3 + 2] = (r() - 0.5) * depth;
    col[i] = [d[k], d[k + 1], d[k + 2]];
  }
  return { pos, col };
}

function initParticles() {
  // dot-matrix sign: which grid cells are lit
  const sign = document.createElement('canvas');
  sign.width = PG.cols; sign.height = PG.rows;
  const g = sign.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.font = '800 22px "JetBrains Mono"';
  g.fillText('SELECTED', PG.cols / 2, 30);
  g.fillText('WORK', PG.cols / 2, 56);
  const sd = g.getImageData(0, 0, PG.cols, PG.rows).data;
  for (let i = 0; i < PN; i++) PSYS.lit[i] = sd[i * 4 + 3] > 110 ? 1 : 0;

  const S = 560;
  PSYS.shapes.staysecure = sampleShape(S, S, (c, w) => {
    for (const geo of ssIconGeom(w / 2, w / 2, w * 1.55)) ssPiece(c, geo, '#000');
  }, (r, g_, b, a) => a > 128, 70);
  PSYS.shapes.staysecure.col.fill([47, 91, 255]);
  PSYS.shapes.hypha = sampleShape(S, S, (c, w) => markHypha(c, w / 2, w / 2, w * 1.5, '#000'), (r, g_, b, a) => a > 128, 50);
  PSYS.shapes.hypha.col.fill([17, 24, 39]);
  PSYS.shapes.erudite = sampleShape(S, S, (c, w) => markErudite(c, w / 2, w / 2, w * 0.92), (r, g_, b, a) => a > 160, 80);
  PSYS.shapes.pagevelle = sampleShape(S, S, (c, w) => c.drawImage(IMG.pagevelleLogo, 0, 0, w, w),
    (r, g_, b) => r + g_ + b < 560 || (r - b > 90 && r > 140), 70);
  PSYS.ready = true;
}

/* ---------- rendering ---------- */
function drawDots(ctx, n, colorOf) {
  const { x, y, s, a, b } = PSYS;
  for (let i = 0; i < n; i++) {
    if (a[i] <= 0.01 || s[i] <= 0.05) continue;
    const d = s[i], blur = b[i];
    ctx.fillStyle = colorOf(i);
    if (blur > 0.7) {
      // defocused: spread the dot's energy over a disc (dimmer as it grows)
      const r = d / 2 + blur;
      ctx.globalAlpha = a[i] * Math.min(1, 1.9 * (d * d) / (4 * r * r) + 0.06);
      ctx.beginPath(); ctx.arc(x[i], y[i], r, 0, TAU); ctx.fill();
    } else {
      ctx.globalAlpha = a[i];
      ctx.fillRect(x[i] - d / 2, y[i] - d / 2, d, d);
    }
  }
  ctx.globalAlpha = 1;
}

/** perspective camera: pitch (x), yaw (y); returns [sx, sy, f] */
function cam3(px, py, pz, pitch, yaw, dist = 1500, dz = 0) {
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  let y1 = py * cp + pz * sp, z1 = -py * sp + pz * cp;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x2 = px * cy + z1 * sy, z2 = -px * sy + z1 * cy;
  const f = dist / Math.max(80, dist + z2 + dz);
  return [W / 2 + x2 * f, H / 2 + y1 * f, f];
}

/* the Unravel knot exactly as sUnravel draws it at its first frame, rotated to time t */
const KNOT_SCALE = 1.35;
function knotPoint(i, t) {
  const st = UNR.strands[i % 8];
  const u = Math.floor(i / 8) / (PN / 8 - 1);
  const jf = u * (UNR.M - 1), j0 = Math.floor(jf), j1 = Math.min(UNR.M - 1, j0 + 1), fr = jf - j0;
  const p0 = st.knot[j0], p1 = st.knot[j1];
  const x = lerp(p0[0], p1[0], fr), y = lerp(p0[1], p1[1], fr), z = lerp(p0[2], p1[2], fr);
  const ry = 0.5 + (t - T.unravel) * 1.7, rx = 0.45;
  const cy_ = Math.cos(ry), sy_ = Math.sin(ry), cx_ = Math.cos(rx), sx_ = Math.sin(rx);
  const X = x * cy_ + z * sy_; let Z = -x * sy_ + z * cy_;
  const Y = y * cx_ - Z * sx_; Z = y * sx_ + Z * cx_;
  const f = 9 / (9 + Z);
  return [W / 2 + X * f * UNR.KS * KNOT_SCALE, H / 2 + Y * f * UNR.KS * KNOT_SCALE, Z];
}

/* =====================================================================================
   beats 6–10: dot matrix → 3D landscape → the Unravel knot
   ===================================================================================== */
function sMatrix(ctx, t) {
  const lt = t - T.matrix;
  fillBg(ctx, PAL.ink);
  const knotIn = A(lt, 1.1, BEAT * 4, Ez.inCubic);
  glow(ctx, W / 2, H / 2, 1100, '#1D4ED8', 0.3 + 0.1 * knotIn);
  const sw = A(lt, 0, 0.5);
  if (sw < 1) ring(ctx, W / 2, H / 2, 1300 * sw, 3, '#93C5FD', 0.6 * (1 - sw));

  const tilt = Ez.inOutCubic(inv(0.62, 1.25, lt));
  const pitch = 1.08 * tilt, yaw = 0.42 * Ez.inOutCubic(inv(0.72, 1.6, lt)) - 0.1 * tilt;
  const lift = Ez.inOutCubic(inv(0.66, 1.15, lt));
  const dz = -380 * tilt;
  const beatPulse = pulse(lt, BEAT, 10);
  const { x, y, s, a, gx, gy, lit, seed, seed2 } = PSYS;
  const scanX = lerp(-1100, 1100, A(lt, 0.14, 0.55, Ez.inOutCubic));
  for (let i = 0; i < PN; i++) {
    const L = lit[i];
    const dist = Math.hypot(gx[i], gy[i] * 1.2);
    const appear = Ez.outBack(clamp((lt - dist / 2600) / 0.18));
    // landscape
    const wave = 110 * Math.sin(gx[i] * 0.0105 + lt * 3.1) + 80 * Math.sin(gy[i] * 0.016 - lt * 2.3) + 40 * Math.sin((gx[i] + gy[i]) * 0.02 + lt * 4);
    const pz = lift * (wave - (L ? 95 : 0));
    const [sx, sy, f] = cam3(gx[i], gy[i], pz, pitch, yaw, 1500, dz);
    const on = L ? clamp((scanX - gx[i]) / 160 + 0.2) : 0;
    let size = (L ? lerp(3, 6.2, on) * (1 + 0.35 * beatPulse) : 3) * f * appear;
    let alpha = L ? lerp(0.22, 1, on) : 0.2 + 0.1 * Math.sin(lt * 9 + seed[i] * 40) * (1 - lift);
    alpha *= clamp(appear * 1.2);
    // swirl into the knot along curved paths
    const d0 = 1.12 + 0.28 * seed[i];
    const u = Ez.inOutCubic(clamp((lt - d0) / 0.46));
    let depthBlur = 0;
    if (u > 0) {
      const [kx, ky, kz] = knotPoint(i, t);
      depthBlur = Math.abs(kz) * 0.9;
      const cx = W / 2, cy = H / 2;
      const ang = (1 - u) * u * (2.6 + seed2[i] * 1.4);
      let mx = lerp(sx, kx, u) - cx, my = lerp(sy, ky, u) - cy;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      x[i] = cx + mx * ca - my * sa;
      y[i] = cy + mx * sa + my * ca;
      const kd = (1 - kz / 3.5);
      size = lerp(size, 3.2 * kd, u);
      alpha = lerp(alpha, 0.95, u);
    } else {
      x[i] = sx; y[i] = sy;
    }
    PSYS.b[i] = lift * Math.abs(f - 1.05) * 15 * (1 - u) + depthBlur * u * (1 - u) * 4;
    s[i] = size; a[i] = alpha;
  }
  const strandCol = UNR.strands.map(st => st.col.match(/\d+/g).map(Number));
  drawDots(ctx, PN, i => {
    const u = Ez.inOutCubic(clamp((lt - (1.12 + 0.28 * seed[i])) / 0.46));
    const base = lit[i] ? [224, 242, 254] : [96, 165, 250];
    const c = strandCol[i % 8];
    return `rgb(${Math.round(lerp(base[0], c[0], u))},${Math.round(lerp(base[1], c[1], u))},${Math.round(lerp(base[2], c[2], u))})`;
  });
}

/* =====================================================================================
   beats 32–36: project marks sculpted from dots on reeded glass
   ===================================================================================== */
const FINALE = [
  { key: 'staysecure', name: 'STAYSECURE' },
  { key: 'hypha', name: 'HYPHA' },
  { key: 'erudite', name: 'ERUDITE FLASHCARDS' },
  { key: 'pagevelle', name: 'PAGEVELLE' },
];

function glassBg(ctx, t, lt) {
  fillBg(ctx, '#EEF2FA');
  drawCover(ctx, IMG.glass, 0, 0, W, H, 1.03 + 0.03 * Ez.inOutSine(clamp(lt / 6)), -18 + lt * 6, 0);
  // light travelling through the ribs
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let k = 0; k < 3; k++) {
    const bx = ((lt * (90 + k * 40) + k * 700) % (W + 800)) - 400;
    const g = ctx.createLinearGradient(bx - 220, 0, bx + 220, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.28)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx - 220, 0, 440, H);
  }
  ctx.restore();
  const wash = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100);
  wash.addColorStop(0, 'rgba(255,255,255,0.62)'); wash.addColorStop(1, 'rgba(255,255,255,0.08)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
}

/** screen position of dot i when it forms mark k at local time lt */
function markDot(i, k, lt) {
  const sh = PSYS.shapes[FINALE[k].key].pos;
  const sway = Math.sin(lt * 2.1 + k) * 0.42 + (k % 2 ? 0.18 : -0.18);
  const [sx, sy, f] = cam3(sh[i * 3], sh[i * 3 + 1], sh[i * 3 + 2], 0.08, sway, 1500);
  return [sx, sy - 30, f];
}

function finaleDots(lt, i) {
  // phase: which mark we are heading to, and progress towards it
  const seg = BEAT;
  const k1 = clamp(Math.floor((lt + 0.12) / seg), 0, FINALE.length - 1);
  const k0 = k1 - 1;
  const start = k1 * seg - 0.12;
  const u = Ez.inOutCubic(clamp((lt - start - 0.1 * PSYS.seed[i]) / 0.24));
  const [bx, by, bf] = markDot(i, k1, lt);
  let ax, ay, af;
  if (k0 < 0) {
    // burst in from a loose sphere around the camera
    const th = PSYS.seed[i] * TAU, ph = Math.acos(2 * PSYS.seed2[i] - 1), R = 1300;
    [ax, ay, af] = cam3(Math.cos(th) * Math.sin(ph) * R, Math.cos(ph) * R * 0.6, Math.sin(th) * Math.sin(ph) * R * 0.5, 0, lt * 0.4, 1500);
  } else[ax, ay, af] = markDot(i, k0, lt);
  // curved flight: bow each path sideways
  const bow = Math.sin(Math.PI * u) * (40 + 90 * PSYS.seed2[i]) * (PSYS.seed[i] > 0.5 ? 1 : -1);
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  return {
    x: lerp(ax, bx, u) - (dy / len) * bow, y: lerp(ay, by, u) + (dx / len) * bow,
    f: lerp(af, bf, u), k0, k1, u,
  };
}

function sFinale(ctx, t) {
  const lt = t - T.finale;
  glassBg(ctx, t, lt);
  const { x, y, s, a } = PSYS;
  const cols = new Array(PN);
  for (let i = 0; i < PN; i++) {
    const d = finaleDots(lt, i);
    x[i] = d.x; y[i] = d.y;
    s[i] = 3.4 * d.f;
    a[i] = 0.92;
    PSYS.b[i] = Math.min(18, Math.abs(d.f - 1) * 26);
    const cb = PSYS.shapes[FINALE[d.k1].key].col[i];
    const ca = d.k0 < 0 ? [37, 99, 235] : PSYS.shapes[FINALE[d.k0].key].col[i];
    cols[i] = `rgb(${Math.round(lerp(ca[0], cb[0], d.u))},${Math.round(lerp(ca[1], cb[1], d.u))},${Math.round(lerp(ca[2], cb[2], d.u))})`;
  }
  drawDots(ctx, PN, i => cols[i]);
  // caption for each mark
  FINALE.forEach((m, k) => {
    const c0 = k * BEAT + 0.12, c1 = (k + 1) * BEAT - 0.02;
    const p = A(lt, c0, c0 + 0.2) * (1 - A(lt, c1 - 0.08, c1));
    if (p <= 0 || (k === FINALE.length - 1 && lt > BEAT * 4)) return;
    setFont(ctx, 600, 20, MONO);
    ctx.letterSpacing = '6px';
    ctx.fillStyle = rgba('#0F172A', 0.75 * p);
    ctx.textAlign = 'center';
    ctx.fillText(m.name, W / 2 + 3, H / 2 + 330 + (1 - p) * 12);
    ctx.textAlign = 'left';
    ctx.letterSpacing = '0px';
  });
}

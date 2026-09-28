/* Project marks. StaySecure and Hypha are rebuilt as vectors from the supplied logos so they can be
   animated (door frames interlock into the S, hyphae grow between nodes). Erudite and Pagevelle use
   the supplied bitmaps; Unravel, Lumium, Xenon and UIQraft get small glyphs in their scene language. */

/* ---------- StaySecure: two door frames that interlock into an S ----------
   Geometry measured from the app icon, in icon units (icon = 1×1, origin at centre).
   Each piece is a rounded-rect ring opened at one point; the lower piece is the upper rotated 180°. */
const SS = {
  blue: '#2F5BFF',
  w: 0.317, h: 0.353, r: 0.09, th: 0.111, cx: -0.0291, cy: -0.1002,
  cutFrac: 0.379,   // where the ring is cut on its right side (fraction from top)
  endFrac: 0.656,   // where the ring ends along its bottom side (fraction from left)
  radius: 0.23,     // icon corner radius
};

/** rounded-rect loop starting on the right side at fraction `cut`, running up and anticlockwise */
function ringLoop(w, h, r, cut, n = 10) {
  const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2;
  r = Math.min(r, w / 2 - 0.01, h / 2 - 0.01);
  const sy = lerp(y0 + r, y1 - r, cut);
  const pts = [[x1, sy]];
  const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x1 - r, y0 + r, 0, -Math.PI / 2);
  arc(x0 + r, y0 + r, -Math.PI / 2, -Math.PI);
  arc(x0 + r, y1 - r, Math.PI, Math.PI / 2);
  const iBottom = pts.length - 1;
  arc(x1 - r, y1 - r, Math.PI / 2, 0);
  pts.push([x1, sy]);
  const acc = polyLength(pts);
  return { pts, acc, iBottom, x0, x1, r };
}

/**
 * one StaySecure piece. g = {cx, cy, w, h, r, th, cut, trim (0 closed → 1 icon cut), rot}
 * all in the current canvas units.
 */
function ssPiece(ctx, g, color) {
  const L = ringLoop(g.w, g.h, g.r, g.cut);
  const total = L.acc[L.acc.length - 1];
  const endX = L.x0 + g.w * SS.endFrac;
  const eIcon = (L.acc[L.iBottom] + Math.max(0, endX - (L.x0 + L.r))) / total;
  const e = lerp(1, eIcon, clamp(g.trim));
  ctx.save();
  ctx.translate(g.cx, g.cy);
  ctx.rotate(g.rot || 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = g.th;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  strokePartial(ctx, L.pts, 0, e, L.acc);
  if (e < 0.999) {
    const [ex, ey] = pointAt(L.pts, e, L.acc);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(ex, ey, g.th / 2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/** geometry of the two pieces for an icon of `size` centred at (x, y) */
function ssIconGeom(x, y, size) {
  const base = { w: SS.w * size, h: SS.h * size, r: SS.r * size, th: SS.th * size, cut: SS.cutFrac, trim: 1 };
  return [
    { ...base, cx: x + SS.cx * size, cy: y + SS.cy * size, rot: 0 },
    { ...base, cx: x - SS.cx * size, cy: y - SS.cy * size, rot: Math.PI },
  ];
}

function markStaySecure(ctx, cx, cy, size, o = {}) {
  if (o.bg !== false) {
    ctx.fillStyle = o.bgColor || SS.blue;
    ctx.beginPath(); ctx.roundRect(cx - size / 2, cy - size / 2, size, size, size * SS.radius); ctx.fill();
  }
  for (const g of ssIconGeom(cx, cy, size)) ssPiece(ctx, g, o.color || '#FFFFFF');
}

/* ---------- Hypha: nodes joined by tapered, slightly curved hyphae ---------- */
const HYPHA_MARK = {
  nodes: [[302, 310], [358, 465], [313, 663], [518, 467], [640, 327], [618, 612], [720, 605], [600, 713]].map(([x, y]) => [(x - 511) / 1024, (y - 511) / 1024]),
  links: [[1, 0, 0.6], [1, 2, -0.5], [1, 3, 0.15], [3, 4, -0.4], [3, 5, 0.35], [5, 6, -0.3], [5, 7, 0.4]],
  r: 0.026,
};

/** tapered organic link between two points; grow = 0..1 draws it out from a */
function hypha(ctx, a, b, wEnd, wMid, bend, grow = 1) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const c = [mx + nx * bend * len * 0.12, my + ny * bend * len * 0.12];
  const n = 18, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * grow;
    const u = 1 - t;
    const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
    const tx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), ty = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
    const tl = Math.hypot(tx, ty) || 1;
    const w = wMid + (wEnd - wMid) * Math.pow(1 - Math.sin(Math.PI * t), 2.2);
    L.push([x - (ty / tl) * w / 2, y + (tx / tl) * w / 2]);
    R.push([x + (ty / tl) * w / 2, y - (tx / tl) * w / 2]);
  }
  ctx.beginPath();
  L.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  ctx.fill();
}

/** p: 0..1 growth (nodes pop, hyphae grow outward from the hub) */
function markHypha(ctx, cx, cy, size, color = '#111111', p = 1) {
  const M = HYPHA_MARK;
  const P = M.nodes.map(([x, y]) => [cx + x * size, cy + y * size]);
  const r = M.r * size;
  ctx.fillStyle = color;
  M.links.forEach(([a, b, bend], i) => {
    const g = Ez.outCubic(clamp(p * 1.6 - i * 0.08));
    if (g > 0) hypha(ctx, P[a], P[b], r * 1.15, r * 0.34, bend, g);
  });
  const order = [1, 3, 0, 2, 4, 5, 6, 7];
  order.forEach((k, i) => {
    const s = Ez.outBack(clamp(p * 1.8 - i * 0.07));
    if (s > 0) { ctx.beginPath(); ctx.arc(P[k][0], P[k][1], r * s, 0, TAU); ctx.fill(); }
  });
}

/* ---------- bitmap marks ---------- */
function markErudite(ctx, cx, cy, size) {
  // the supplied icon has transparent padding; its visible tile spans ~76% of the canvas
  const s = size / 0.78;
  ctx.drawImage(IMG.eruditeIcon, cx - s / 2 - s * 0.02, cy - s / 2 + s * 0.005, s, s);
}

function markPagevelle(ctx, cx, cy, size) {
  ctx.save();
  ctx.beginPath(); ctx.roundRect(cx - size / 2, cy - size / 2, size, size, size * 0.22); ctx.clip();
  ctx.drawImage(IMG.pagevelleLogo, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

/* ---------- glyphs for projects without a supplied logo ---------- */
function markUnravel(ctx, cx, cy, size, t = 0) {
  const s = size / 100;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const g = ctx.createLinearGradient(-40 * s, 0, 40 * s, 0);
  g.addColorStop(0, '#6366F1'); g.addColorStop(1, '#22D3EE');
  ctx.strokeStyle = g;
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  for (let i = 0; i <= 90; i++) {
    const a = (i / 90) * TAU;
    const x = -18 * s + Math.sin(2 * a + t) * 16 * s, y = Math.sin(3 * a) * 16 * s;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-2 * s, 0); ctx.bezierCurveTo(12 * s, 0, 14 * s, -18 * s, 30 * s, -18 * s);
  ctx.moveTo(-2 * s, 0); ctx.bezierCurveTo(12 * s, 0, 14 * s, 18 * s, 30 * s, 18 * s);
  ctx.stroke();
  for (const [x, y] of [[30, -18], [30, 18]]) circle(ctx, x * s, y * s, 6.5 * s, '#22D3EE');
  ctx.restore();
}

function markLumium(ctx, cx, cy, size, p = 0.72) {
  const s = size / 100;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = 7 * s;
  ctx.strokeStyle = 'rgba(16,185,129,0.18)';
  ctx.beginPath(); ctx.arc(cx, cy, 34 * s, 0, TAU); ctx.stroke();
  const cg = ctx.createConicGradient(-Math.PI / 2, cx, cy);
  cg.addColorStop(0, '#10B981'); cg.addColorStop(1, '#FBBF24');
  ctx.strokeStyle = cg;
  ctx.beginPath(); ctx.arc(cx, cy, 34 * s, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke();
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 4 * s;
  ctx.beginPath(); ctx.moveTo(cx, cy + 16 * s); ctx.lineTo(cx, cy - 6 * s); ctx.stroke();
  for (const d of [-1, 1]) {
    ctx.save();
    ctx.translate(cx, cy - 6 * s); ctx.rotate(d * 0.75);
    ctx.fillStyle = d < 0 ? '#10B981' : '#34D399';
    ctx.beginPath(); ctx.ellipse(0, -9 * s, 6 * s, 11 * s, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function markXenon(ctx, cx, cy, size, t = 0) {
  const s = size / 100, n = 90, ga = Math.PI * (3 - Math.sqrt(5));
  const ry = 0.6 + t * 0.8, cr = Math.cos(ry), sr = Math.sin(ry);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * ga;
    const x0 = Math.cos(a) * r, z0 = Math.sin(a) * r;
    const x = x0 * cr + z0 * sr, z = -x0 * sr + z0 * cr;
    const d = (z + 1) / 2, rr = (1.2 + d * 2.2) * s;
    ctx.fillStyle = mixHex('#7C3AED', '#E879F9', d);
    ctx.globalAlpha = 0.35 + 0.65 * d;
    ctx.beginPath(); ctx.arc(cx + x * 36 * s, cy + y * 36 * s, rr, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function markUIQraft(ctx, cx, cy, size) {
  const s = size / 100;
  [['rgba(37,99,235,0.28)', 14], ['rgba(37,99,235,0.55)', 0], ['#2563EB', -14]].forEach(([c, o]) => {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.roundRect(cx - 24 * s + o * s, cy - 24 * s - o * s, 48 * s, 48 * s, 12 * s); ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.roundRect(cx - 28 * s, cy - 2 * s, 22 * s, 7 * s, 3.5 * s); ctx.fill();
}

/** draw a project's mark by key (used by the end card) */
const MARKS = {
  staysecure: (ctx, x, y, s) => markStaySecure(ctx, x, y, s * 0.82),
  hypha: (ctx, x, y, s) => markHypha(ctx, x, y, s * 2.1, '#111827'),
  erudite: (ctx, x, y, s) => markErudite(ctx, x, y, s * 0.8),
  pagevelle: (ctx, x, y, s) => markPagevelle(ctx, x, y, s * 0.8),
  unravel: (ctx, x, y, s, t) => markUnravel(ctx, x, y, s * 1.3, t),
  lumium: (ctx, x, y, s) => {
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x - s * 0.42, y - s * 0.42, s * 0.84, s * 0.84, s * 0.2); ctx.clip();
    ctx.drawImage(IMG.lumiumIcon, x - s * 0.42, y - s * 0.42, s * 0.84, s * 0.84);
    ctx.restore();
  },
  xenon: (ctx, x, y, s, t) => markXenon(ctx, x, y, s, t),
  uiqraft: (ctx, x, y, s) => markUIQraft(ctx, x, y, s),
};

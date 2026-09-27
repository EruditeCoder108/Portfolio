/* Act II — selected work. Seven procedural vignettes, two beats each, each with its own transition:
   zoom-through → Unravel ─match-cut→ Hypha ─whip→ Erudite ─iris→ Lumium ─page-curl→ Pagevelle
   ─glitch→ Xenon ─slices→ UIQraft. Every vignette is a pure function of local time `lt`
   so the wall of work (Act III) can re-render them as live tiles. */

const TH = {
  unravel: { bg: '#050A1A', glow: '#1E3A8A', accent: '#38BDF8', fg: '#FFFFFF', mute: '#7C8DB5' },
  hypha: { bg: '#03110F', glow: '#0F766E', accent: '#2DD4BF', fg: '#FFFFFF', mute: '#6B9E97' },
  erudite: { bg: '#0B0820', glow: '#5B21B6', accent: '#A78BFA', fg: '#FFFFFF', mute: '#8B84B8' },
  lumium: { bg: '#04120D', glow: '#065F46', accent: '#34D399', fg: '#FFFFFF', mute: '#6EA38E' },
  pagevelle: { bg: '#F4EFE6', accent: '#E11D48', fg: '#1C1917', mute: '#8A8178' },
  xenon: { bg: '#07030F', glow: '#6D28D9', accent: '#C084FC', fg: '#FFFFFF', mute: '#8E7FB0' },
  uiqraft: { bg: '#EEF3FC', accent: '#2563EB', fg: '#0F172A', mute: '#64748B' },
};

function darkBg(ctx, th, lt, gx = W * 0.62, gy = H * 0.45) {
  fillBg(ctx, th.bg);
  glow(ctx, gx, gy, 1150, th.glow, 0.38);
  dotGrid(ctx, 48, 0.045, '#FFFFFF', 0, -lt * 24);
}

/** project title lockup; `icon(ctx, x, y, size, k)` optionally draws the project's own mark before the name */
function titleBlock(ctx, lt, idx, name, sub, th, t0 = 0.1, icon = null) {
  const x = 120, p = A(lt, t0, t0 + 0.35);
  setFont(ctx, 600, 20, MONO);
  ctx.fillStyle = th.mute;
  ctx.globalAlpha = p;
  ctx.fillText(`${idx} / 08`, x, 842);
  ctx.globalAlpha = 1;
  ctx.fillStyle = th.accent;
  ctx.fillRect(x + 100, 835, 60 * p, 3);
  setFont(ctx, 500, 20, MONO);
  ctx.fillStyle = th.mute;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 180, 810, 1100 * A(lt, t0 + 0.08, t0 + 0.55), 44);
  ctx.clip();
  ctx.fillText(sub, x + 180, 842);
  ctx.restore();
  let nx = x - 6;
  if (icon) {
    const k = spring(lt - t0, 1.9, 6.5);
    if (k > 0) {
      ctx.save();
      about(ctx, x + 50, 925, k, (1 - k) * -0.5);
      icon(ctx, x, 875, 100, k);
      ctx.restore();
    }
    nx = x + 128;
  }
  setFont(ctx, 800, 124, DISP);
  ctx.fillStyle = th.fg;
  riseText(ctx, name, nx, 972, 124, { t: lt - t0, stagger: 0.022, dur: 0.42, track: -1 });
}

/** rounded app-icon tile from a bitmap */
function iconTile(im, radius = 0.22, pad = 0) {
  return (ctx, x, y, s) => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, s * radius);
    ctx.clip();
    ctx.drawImage(im, x - pad * s, y - pad * s, s * (1 + 2 * pad), s * (1 + 2 * pad));
    ctx.restore();
  };
}

function tagPills(ctx, lt, list, th, t0 = 0.16) {
  setFont(ctx, 600, 18, SANS);
  let x = W - 120;
  for (let i = list.length - 1; i >= 0; i--) {
    const s = list[i], w = ctx.measureText(s).width + 34;
    const k = list.length - 1 - i;
    const p = A(lt, t0 + k * 0.045, t0 + 0.35 + k * 0.045);
    x -= w;
    if (p > 0) {
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate((1 - p) * 50, 0);
      pill(ctx, x, 70, w, 40, rgba(th.accent, 0.1), rgba(th.accent, 0.5));
      ctx.fillStyle = th.fg;
      ctx.fillText(s, x + 17, 96);
      ctx.restore();
    }
    x -= 10;
  }
}

/* =====================================================================================
   01 UNRAVEL — a tangled knot of code pulled straight into a verified AST
   ===================================================================================== */
const UNR = (() => {
  const KC = [600, 455], KS = 70, M = 72;
  const leaves = Array.from({ length: 8 }, (_, i) => [1150, 245 + i * 74]);
  const l2 = [0, 1, 2, 3].map(j => [1350, (leaves[2 * j][1] + leaves[2 * j + 1][1]) / 2]);
  const l1 = [0, 1].map(j => [1540, (l2[2 * j][1] + l2[2 * j + 1][1]) / 2]);
  const root = [1720, (l1[0][1] + l1[1][1]) / 2];
  const nodes = [...leaves, ...l2, ...l1, root];
  const strands = [];
  for (let i = 0; i < 8; i++) {
    const p0 = [330, 470 + (i - 3.5) * 11], p3 = leaves[i];
    const fin = bezier(p0, [720, p0[1]], [880, p3[1]], p3, M - 1);
    const knot = [];
    const ph = i * 0.78, rot = i * 0.93, tilt = i * 0.5;
    for (let j = 0; j < M; j++) {
      const phi = ph + (j / (M - 1)) * TAU * 0.95;
      const r = Math.cos(3 * phi) + 2.3;
      let x = r * Math.cos(2 * phi), y = r * Math.sin(2 * phi), z = -Math.sin(3 * phi) * 1.3;
      [x, y] = [x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot)];
      [y, z] = [y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
      knot.push([x, y, z]);
    }
    strands.push({ fin, knot, acc: polyLength(fin), col: mixHex('#6366F1', '#38BDF8', i / 7) });
  }
  // smooth S-curve branches (no hard elbows)
  const edge = (c, p) => { const mx = (c[0] + p[0]) / 2; return bezier(c, [mx + 18, c[1]], [mx - 18, p[1]], p, 28); };
  const edges = [
    ...leaves.map((c, i) => [edge(c, l2[i >> 1]), 0]),
    ...l2.map((c, i) => [edge(c, l1[i >> 1]), 1]),
    ...l1.map(c => [edge(c, root), 2]),
  ];
  return { KC, KS, M, nodes, leaves, l2, l1, root, strands, edges };
})();

function codeSkeleton(ctx, lt, x, y, th, hi = -1, hiT = 9) {
  for (let k = 0; k < 9; k++) {
    const p = A(lt, 0.05 + k * 0.025, 0.3 + k * 0.025);
    if (p <= 0) continue;
    ctx.globalAlpha = p;
    setFont(ctx, 500, 14, MONO);
    ctx.fillStyle = rgba(th.mute, 0.6);
    ctx.fillText(String(k + 1).padStart(2, '0'), x, y + k * 30 + 5);
    const indent = [0, 1, 1, 2, 2, 2, 1, 1, 0][k] * 26;
    const w1 = 60 + hash(k * 3.1) * 140, w2 = 40 + hash(k * 7.7) * 160;
    const on = k === hi && lt > hiT;
    ctx.fillStyle = on ? th.accent : rgba('#3B82F6', 0.4);
    ctx.fillRect(x + 40 + indent, y + k * 30 - 5, w1 * p, 10);
    ctx.fillStyle = rgba('#94A3B8', 0.22);
    ctx.fillRect(x + 52 + indent + w1, y + k * 30 - 5, w2 * p, 10);
  }
  ctx.globalAlpha = 1;
}

function sUnravel(ctx, lt) {
  const th = TH.unravel;
  darkBg(ctx, th, lt, 820, 460);
  codeSkeleton(ctx, lt, 130, 150, th, 4, 0.62);
  const zp = A(lt, 0, 0.45);
  ctx.save();
  const s = lerp(3.4, 1, zp);
  ctx.translate(W / 2, H / 2);
  ctx.scale(s, s);
  ctx.translate(-lerp(UNR.KC[0], W / 2, zp), -lerp(UNR.KC[1], H / 2, zp));
  const ry = 0.5 + lt * 1.7, rx = 0.45;
  const cy_ = Math.cos(ry), sy_ = Math.sin(ry), cx_ = Math.cos(rx), sx_ = Math.sin(rx);
  const order = [];
  const pts = UNR.strands.map((st, i) => {
    let zsum = 0, usum = 0;
    const out = st.knot.map(([x, y, z], j) => {
      let X = x * cy_ + z * sy_, Z = -x * sy_ + z * cy_;
      let Y = y * cx_ - Z * sx_;
      Z = y * sx_ + Z * cx_;
      const f = 9 / (9 + Z);
      zsum += Z;
      const kp = [UNR.KC[0] + X * f * UNR.KS, UNR.KC[1] + Y * f * UNR.KS];
      const sj = j / (UNR.M - 1);
      const d = 0.14 + (1 - sj) * 0.24 + i * 0.012;
      const u = Ez.inOutCubic(clamp((lt - d) / 0.3));
      usum += u;
      return [lerp(kp[0], st.fin[j][0], u), lerp(kp[1], st.fin[j][1], u)];
    });
    order.push([zsum, i]);
    return { out, u: usum / UNR.M };
  });
  order.sort((a, b) => b[0] - a[0]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [, i] of order) {
    const { out, u } = pts[i];
    const ow = lerp(15, 0, clamp(u * 1.4));
    if (ow > 0.5) {
      ctx.strokeStyle = th.bg;
      ctx.lineWidth = ow;
      strokePartial(ctx, out, 0, 1);
    }
    ctx.strokeStyle = UNR.strands[i].col;
    ctx.lineWidth = 6;
    strokePartial(ctx, out, 0, 1);
  }
  // data pulses once straight
  for (let i = 0; i < 8; i++) {
    const p = A(lt, 0.54 + i * 0.022, 0.84 + i * 0.022, Ez.inOutCubic);
    if (p <= 0 || p >= 1) continue;
    const [x, y] = pointAt(UNR.strands[i].fin, p, UNR.strands[i].acc);
    glow(ctx, x, y, 26, '#E0F2FE', 0.8);
    circle(ctx, x, y, 5, '#FFFFFF');
  }
  // tree
  ctx.strokeStyle = '#22D3EE';
  ctx.lineWidth = 3;
  for (const [pts_, lvl] of UNR.edges) {
    const t0 = [0.4, 0.52, 0.62][lvl];
    strokePartial(ctx, pts_, 0, A(lt, t0, t0 + 0.17, Ez.inOutCubic));
  }
  const node = (p, r, t0) => {
    const k = spring(lt - t0, 2.2, 7);
    if (k <= 0) return;
    circle(ctx, p[0], p[1], r * k, '#22D3EE');
    circle(ctx, p[0], p[1], r * 0.42 * k, '#FFFFFF');
  };
  UNR.leaves.forEach((p, i) => node(p, 10, 0.37 + i * 0.012));
  UNR.l2.forEach((p, i) => node(p, 12, 0.55 + i * 0.02));
  UNR.l1.forEach((p, i) => node(p, 14, 0.66 + i * 0.02));
  node(UNR.root, 20, 0.77);
  const rp = A(lt, 0.78, 1.25);
  if (lt > 0.78 && rp < 1) ring(ctx, UNR.root[0], UNR.root[1], 22 + 70 * rp, 3, '#22D3EE', 1 - rp);
  const vp = A(lt, 0.8, 1.0);
  if (vp > 0) {
    ctx.globalAlpha = vp;
    setFont(ctx, 700, 16, MONO);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('AST', UNR.root[0], UNR.root[1] - 36);
    pill(ctx, UNR.root[0] - 58, UNR.root[1] + 34, 116, 32, rgba('#10B981', 0.18), rgba('#10B981', 0.7));
    ctx.fillStyle = '#6EE7B7';
    ctx.fillText('verified', UNR.root[0] + 8, UNR.root[1] + 56);
    ctx.textAlign = 'left';
    checkMark(ctx, UNR.root[0] - 38, UNR.root[1] + 50, 12, vp, '#6EE7B7', 2.5);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  titleBlock(ctx, lt, '01', 'UNRAVEL', 'tangled code -> verified AST evidence', th);
  tagPills(ctx, lt, ['TypeScript', 'Tree-sitter', 'MCP'], th);
}

/* =====================================================================================
   02 HYPHA — delay-tolerant mesh; the AST nodes re-form as phones in a mesh
   ===================================================================================== */
const HY = (() => {
  const r = rng(7);
  const pos = [];
  for (let row = 0; row < 3; row++)
    for (let c = 0; c < 5; c++) pos.push([290 + c * 335 + (r() - 0.5) * 150, 200 + row * 245 + (r() - 0.5) * 100]);
  const edges = [], seen = new Set(), adj = pos.map(() => []);
  pos.forEach((p, i) => {
    pos.map((q, j) => [Math.hypot(q[0] - p[0], q[1] - p[1]), j]).filter(([, j]) => j !== i)
      .sort((a, b) => a[0] - b[0]).slice(0, 3).forEach(([, j]) => {
        const k = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (seen.has(k)) return;
        seen.add(k);
        edges.push([i, j]);
        adj[i].push(j);
        adj[j].push(i);
      });
  });
  const byX = pos.map((p, i) => [p[0], i]).sort((a, b) => a[0] - b[0]);
  const alice = byX[0][1], charlie = byX[byX.length - 1][1];
  const prev = new Map([[alice, -1]]), q = [alice];
  while (q.length) { const u = q.shift(); for (const v of adj[u]) if (!prev.has(v)) { prev.set(v, u); q.push(v); } }
  const route = [];
  for (let v = charlie; v !== -1; v = prev.get(v)) route.unshift(v);
  const bob = route[Math.floor(route.length / 2)];
  const perm = [3, 11, 7, 0, 14, 5, 9, 1, 12, 6, 2, 13, 8, 4, 10]; // mesh node k starts at tree node perm[k]
  const routePts = route.map(i => pos[i]);
  const acc = polyLength(routePts);
  const frac = acc.map(a => a / acc[acc.length - 1]);
  const routeEdges = new Set(route.slice(1).map((v, i) => `${Math.min(v, route[i])}-${Math.max(v, route[i])}`));
  return { pos, edges, route, routePts, acc, frac, alice, bob, charlie, perm, routeEdges };
})();

function sHypha(ctx, lt) {
  const th = TH.hypha;
  darkBg(ctx, th, lt, 1000, 470);
  const P = HY.pos.map((p, k) => {
    const u = Ez.inOutExpo(inv(0.0 + k * 0.01, 0.34 + k * 0.01, lt));
    const s = UNR.nodes[HY.perm[k]];
    return [lerp(s[0], p[0], u), lerp(s[1], p[1], u)];
  });
  const prog = A(lt, 0.3, 0.84, Ez.inOutCubic);
  // ripples from Alice
  for (const t0 of [0.2, 0.42, 0.64]) {
    const rp = A(lt, t0, t0 + 0.55, Ez.outCubic);
    if (lt > t0 && rp < 1) ring(ctx, P[HY.alice][0], P[HY.alice][1], 30 + 260 * rp, 2, th.accent, 0.55 * (1 - rp));
  }
  // links
  ctx.lineWidth = 2;
  HY.edges.forEach(([a, b], e) => {
    const p = A(lt, 0.18 + e * 0.008, 0.42 + e * 0.008, Ez.outCubic);
    if (p <= 0) return;
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    const hot = HY.routeEdges.has(key);
    let lit = 0;
    if (hot) {
      const ia = HY.route.indexOf(a), ib = HY.route.indexOf(b);
      lit = prog >= Math.max(HY.frac[ia], HY.frac[ib]) ? 1 : 0;
    }
    ctx.strokeStyle = lit ? rgba('#6EE7B7', 0.95) : rgba(th.accent, 0.38);
    ctx.lineWidth = lit ? 3 : 2;
    ctx.setLineDash(lit ? [] : [7, 9]);
    ctx.lineDashOffset = -lt * 90;
    ctx.beginPath();
    ctx.moveTo(P[a][0], P[a][1]);
    ctx.lineTo(lerp(P[a][0], P[b][0], p), lerp(P[a][1], P[b][1], p));
    ctx.stroke();
  });
  ctx.setLineDash([]);
  // nodes
  P.forEach(([x, y], k) => {
    const special = k === HY.alice || k === HY.bob || k === HY.charlie;
    const ri = HY.route.indexOf(k);
    const heat = ri >= 0 ? Math.max(0, 1 - Math.abs(prog - HY.frac[ri]) * 10) : 0;
    const r = special ? 13 : 8;
    circle(ctx, x, y, r + 3, '#0B2F2A');
    ctx.strokeStyle = heat > 0 ? '#FFFFFF' : th.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, r + 3, 0, TAU); ctx.stroke();
    circle(ctx, x, y, r * 0.45, special ? '#FFFFFF' : th.accent);
    if (heat > 0) { ring(ctx, x, y, r + 8 + 16 * heat, 2, '#6EE7B7', heat); glow(ctx, x, y, 60, '#34D399', 0.5 * heat); }
  });
  // labels
  const la = A(lt, 0.3, 0.5);
  if (la > 0) {
    ctx.globalAlpha = la;
    setFont(ctx, 600, 16, MONO);
    ctx.fillStyle = '#D1FAE5';
    const lab = (k, s) => ctx.fillText(s, P[k][0] + 24, P[k][1] - 20);
    lab(HY.alice, 'ALICE');
    lab(HY.bob, 'BOB · carrier');
    lab(HY.charlie, 'CHARLIE');
    ctx.globalAlpha = 1;
  }
  // hop chips
  const chip = (i, s, a) => {
    if (a <= 0) return;
    const p0 = P[HY.route[i]], p1 = P[HY.route[i + 1]];
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
    setFont(ctx, 700, 14, MONO);
    const w = ctx.measureText(s).width + 20;
    ctx.globalAlpha = a;
    pill(ctx, mx - w / 2, my + 14, w, 28, '#052E2B', rgba('#6EE7B7', 0.8));
    ctx.fillStyle = '#6EE7B7';
    ctx.fillText(s, mx - w / 2 + 10, my + 33);
    ctx.globalAlpha = 1;
  };
  chip(0, 'BLE', A(lt, 0.34, 0.44));
  chip(HY.route.length - 2, 'WI-FI DIRECT', A(lt, 0.66, 0.76));
  // packet
  if (lt > 0.3) {
    ctx.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      ctx.strokeStyle = rgba('#A7F3D0', (k + 1) / 7);
      ctx.lineWidth = 2 + k;
      strokePartial(ctx, HY.routePts, Math.max(0, prog - 0.1 + k * 0.016), Math.max(0, prog - 0.1 + (k + 1) * 0.016), HY.acc);
    }
    const [hx, hy] = pointAt(HY.routePts, prog, HY.acc);
    glow(ctx, hx, hy, 70, '#34D399', 0.7);
    circle(ctx, hx, hy, 8, '#FFFFFF');
    if (prog < 1) {
      setFont(ctx, 500, 14, MONO);
      ctx.fillStyle = rgba('#A7F3D0', 0.85);
      ctx.fillText(`0x${Math.floor(hash(Math.floor(lt * 20)) * 0xffffff).toString(16).padStart(6, '0')}·enc`, hx + 16, hy - 16);
    }
  }
  const ap = A(lt, 0.84, 1.0);
  if (ap > 0) {
    const [cx, cy] = P[HY.charlie];
    ring(ctx, cx, cy, 24 + 8 * ap, 3, '#6EE7B7', ap);
    checkMark(ctx, cx + 44, cy + 30, 16, ap, '#6EE7B7', 3);
  }
  titleBlock(ctx, lt, '02', 'HYPHA', 'offline mesh · no towers · 0 bytes cellular', th);
  tagPills(ctx, lt, ['Rust', 'Noise XX', 'ChaCha20'], th);
}

/* =====================================================================================
   03 ERUDITE — 3D flashcards + an FSRS retention curve
   ===================================================================================== */
function roundRectPts(w, h, r, n = 5) {
  const pts = [];
  const corners = [[w / 2 - r, -h / 2 + r, -90], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180]];
  for (const [cx, cy, a0] of corners)
    for (let i = 0; i <= n; i++) {
      const a = (a0 + (90 * i) / n) * D2R;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  return pts;
}
const CARD_PTS = roundRectPts(360, 470, 28);

function card3D(ctx, cx, cy, w, h, ry, rz, s, face, alpha = 1) {
  const P = 1700, c = Math.cos(ry), sn = Math.sin(ry);
  const proj = (x, y) => { const Z = x * sn, f = P / (P + Z); return [x * c * f * s, y * f * s]; };
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(rz);
  glow(ctx, 18 * s, 40 * s, 330 * s, '#000000', 0.45);
  ctx.beginPath();
  CARD_PTS.forEach((p, i) => { const q = proj(p[0], p[1]); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
  ctx.closePath();
  const front = c >= 0;
  ctx.fillStyle = front ? '#E8EAF3' : '#E9E5F7';
  ctx.fill();
  ctx.save();
  ctx.clip();
  const tl = proj(-w / 2, -h / 2), tr = proj(w / 2, -h / 2), bl = proj(-w / 2, h / 2), br = proj(w / 2, h / 2);
  if (front) ctx.transform((tr[0] - tl[0]) / w, (tr[1] - tl[1]) / w, (bl[0] - tl[0]) / h, (bl[1] - tl[1]) / h, tl[0], tl[1]);
  else ctx.transform((tl[0] - tr[0]) / w, (tl[1] - tr[1]) / w, (br[0] - tr[0]) / h, (br[1] - tr[1]) / h, tr[0], tr[1]);
  face(ctx, front);
  ctx.restore();
  const shade = (1 - Math.abs(c)) * 0.35;
  if (shade > 0.01) { ctx.fillStyle = `rgba(30,27,75,${shade})`; ctx.fill(); }
  ctx.restore();
}

const CARD_FACES = [
  (ctx, front) => {
    setFont(ctx, 700, 15, MONO);
    ctx.fillStyle = '#7C3AED';
    ctx.fillText(front ? 'QUESTION' : 'ANSWER', 30, 52);
    ctx.textAlign = 'center';
    if (front) { setFont(ctx, 400, 70, SERIF, 'italic'); ctx.fillStyle = '#1E1B4B'; ctx.fillText('d/dx sin x', 180, 262); }
    else { setFont(ctx, 400, 104, SERIF, 'italic'); ctx.fillStyle = '#6D28D9'; ctx.fillText('cos x', 180, 272); }
    ctx.textAlign = 'left';
    setFont(ctx, 500, 13, MONO);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(front ? 'CALCULUS · 01/24' : 'S 14.0d -> 34.8d', 30, 438);
  },
  ctx => {
    setFont(ctx, 700, 15, MONO); ctx.fillStyle = '#7C3AED'; ctx.fillText('QUESTION', 30, 52);
    ctx.textAlign = 'center';
    setFont(ctx, 400, 64, SERIF, 'italic'); ctx.fillStyle = '#1E1B4B'; ctx.fillText("Ohm's law", 180, 258);
    ctx.textAlign = 'left';
    setFont(ctx, 500, 13, MONO); ctx.fillStyle = '#94A3B8'; ctx.fillText('PHYSICS · 02/24', 30, 438);
  },
  ctx => { setFont(ctx, 700, 15, MONO); ctx.fillStyle = '#7C3AED'; ctx.fillText('QUESTION', 30, 52); },
  ctx => { setFont(ctx, 700, 15, MONO); ctx.fillStyle = '#7C3AED'; ctx.fillText('QUESTION', 30, 52); },
];

const FSRS = (() => {
  const rev = [0, 2, 8, 22, 56.8], S = [2, 6, 14, 34.8, 80];
  const X0 = 1060, X1 = 1780, Y0 = 250, Y1 = 640;
  const x = d => X0 + (d / 60) * (X1 - X0), y = r => Y1 - ((r - 0.55) / 0.45) * (Y1 - Y0);
  const pts = [];
  for (let k = 0; k < rev.length; k++) {
    const d0 = rev[k], d1 = k + 1 < rev.length ? rev[k + 1] : 60;
    for (let i = 0; i <= 40; i++) {
      const d = lerp(d0, d1, i / 40);
      pts.push([x(d), y(1 / (1 + (d - d0) / (9 * S[k])))]);
    }
  }
  return { rev, S, X0, X1, Y0, Y1, x, y, pts, acc: polyLength(pts) };
})();

function sErudite(ctx, lt) {
  const th = TH.erudite;
  darkBg(ctx, th, lt, 700, 420);
  // --- chart
  const F = FSRS, cp = A(lt, 0.1, 0.88, Ez.inOutCubic);
  const ca = A(lt, 0.02, 0.2);
  ctx.globalAlpha = ca;
  setFont(ctx, 600, 17, MONO);
  ctx.fillStyle = th.accent;
  ctx.fillText('FSRS · memory retention', F.X0, F.Y0 - 74);
  ctx.strokeStyle = rgba('#FFFFFF', 0.14);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const r of [0.6, 0.7, 0.8, 1.0]) { ctx.moveTo(F.X0, F.y(r)); ctx.lineTo(F.X1, F.y(r)); }
  ctx.stroke();
  ctx.strokeStyle = rgba('#F59E0B', 0.85);
  ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.moveTo(F.X0, F.y(0.9)); ctx.lineTo(F.X0 + (F.X1 - F.X0) * A(lt, 0.05, 0.4), F.y(0.9)); ctx.stroke();
  ctx.setLineDash([]);
  setFont(ctx, 600, 14, MONO);
  ctx.fillStyle = '#FCD34D';
  ctx.fillText('R 90%', F.X1 + 14, F.y(0.9) + 5);
  ctx.fillStyle = rgba('#FFFFFF', 0.4);
  ctx.fillText('days ->', F.X1 - 60, F.Y1 + 34);
  ctx.globalAlpha = 1;
  const headX = F.X0 + (F.X1 - F.X0) * cp;
  ctx.save();
  ctx.beginPath(); ctx.rect(F.X0, 0, headX - F.X0, H); ctx.clip();
  const ag = ctx.createLinearGradient(0, F.Y0, 0, F.Y1);
  ag.addColorStop(0, rgba('#8B5CF6', 0.32)); ag.addColorStop(1, rgba('#8B5CF6', 0));
  ctx.fillStyle = ag;
  ctx.beginPath(); ctx.moveTo(F.X0, F.Y1);
  for (const p of F.pts) ctx.lineTo(p[0], p[1]);
  ctx.lineTo(F.X1, F.Y1); ctx.closePath(); ctx.fill();
  const lg = ctx.createLinearGradient(F.X0, 0, F.X1, 0);
  lg.addColorStop(0, '#A78BFA'); lg.addColorStop(1, '#38BDF8');
  ctx.strokeStyle = lg; ctx.lineWidth = 4; ctx.lineJoin = 'round';
  strokePartial(ctx, F.pts, 0, 1, F.acc);
  ctx.restore();
  F.rev.slice(1).forEach((d, k) => {
    const x = F.x(d);
    if (headX < x) return;
    const pp = spring(lt - (0.1 + (0.78 * (x - F.X0)) / (F.X1 - F.X0) * 0.9), 2.4, 7);
    circle(ctx, x, F.y(1), 8 * pp, '#FFFFFF');
    ring(ctx, x, F.y(1), 13 * pp, 2, '#A78BFA', 1);
    setFont(ctx, 600, 14, MONO);
    ctx.fillStyle = rgba('#E9D5FF', pp);
    ctx.fillText(`S ${F.S[k + 1].toFixed(1)}d`, x - 30, F.y(1) - 24);
  });
  // --- cards
  const base = [600, 390];
  const fly = A(lt, 0.64, 0.88, Ez.inCubic);
  const shift = spring(lt - 0.7, 1.8, 7);
  for (let k = 3; k >= 0; k--) {
    const ent = spring(lt - 0.02 - k * 0.035, 1.5, 6.5);
    let slot = k;
    if (k > 0) slot = k - shift;
    const cx = base[0] + slot * 16 + 280 * (1 - ent), cy = base[1] + slot * 14;
    let rz = (-2.5 + slot * 2.4) * D2R + (1 - ent) * 12 * D2R;
    let ry = 0, s = 1, a = 1, dx = 0;
    if (k === 0) {
      const fp = A(lt, 0.12, 0.4, Ez.inOutCubic);
      ry = Math.PI * fp;
      s = 1 + 0.08 * Math.sin(Math.PI * fp);
      dx = 1150 * fly;
      rz += 26 * D2R * fly;
      a = 1 - A(lt, 0.78, 0.9);
    }
    if (a > 0) card3D(ctx, cx + dx, cy - 60 * fly * (k === 0), 360, 470, ry, rz, s, CARD_FACES[k], a);
  }
  // --- rating buttons
  const labels = [['Again', '10m', '#F43F5E'], ['Hard', '4d', '#F59E0B'], ['Good', '31d', '#10B981'], ['Easy', '58d', '#38BDF8']];
  const bw = 150, gap = 12, bx0 = base[0] - (bw * 4 + gap * 3) / 2 + 24, by = 700;
  labels.forEach(([l, d, c], i) => {
    const p = A(lt, 0.36 + i * 0.035, 0.56 + i * 0.035);
    if (p <= 0) return;
    const pressed = i === 2 && lt > 0.6;
    const ps = pressed ? 1 - 0.1 * pulse(lt, 0.6, 14) : 1;
    const x = bx0 + i * (bw + gap);
    ctx.save();
    ctx.globalAlpha = p;
    about(ctx, x + bw / 2, by + 28, ps);
    ctx.translate(0, (1 - p) * 30);
    pill(ctx, x, by, bw, 56, pressed ? c : rgba(c, 0.12), rgba(c, 0.6));
    setFont(ctx, 700, 20, SANS);
    ctx.fillStyle = pressed ? '#FFFFFF' : c;
    ctx.fillText(l, x + 22, by + 36);
    setFont(ctx, 500, 15, MONO);
    ctx.fillStyle = pressed ? '#FFFFFF' : rgba(c, 0.8);
    ctx.textAlign = 'right';
    ctx.fillText(d, x + bw - 22, by + 35);
    ctx.textAlign = 'left';
    ctx.restore();
    if (pressed) { const rp = A(lt, 0.6, 0.9); ring(ctx, x + bw / 2, by + 28, 40 + 90 * rp, 2, c, 1 - rp); }
  });
  titleBlock(ctx, lt, '03', 'ERUDITE', 'local-first spaced repetition · FSRS', th);
  tagPills(ctx, lt, ['Electron', 'SQLite', 'Shadow DOM'], th);
}

/* =====================================================================================
   04 LUMIUM — focus timer ring, odometer digits, a growing sprout, a device lease
   ===================================================================================== */
function rollDigit(ctx, cont, base, x, y, size, cw, snapW = 0) {
  let d = Math.floor(cont), f = cont - d;
  d = ((d % base) + base) % base;
  if (snapW > 0) f = Ez.smooth(clamp((f - (1 - snapW)) / snapW));
  const nd = (d + 1) % base;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 6, y - size * 0.88, cw + 12, size * 1.0);
  ctx.clip();
  const lh = size * 1.02;
  ctx.fillText(String(d), x + (cw - ctx.measureText(String(d)).width) / 2, y - f * lh);
  if (f > 0.001) ctx.fillText(String(nd), x + (cw - ctx.measureText(String(nd)).width) / 2, y + lh - f * lh);
  ctx.restore();
}

function deviceIcon(ctx, kind, x, y, c, a) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (kind === 'phone') { ctx.roundRect(x - 22, y - 38, 44, 76, 9); ctx.moveTo(x - 7, y - 30); ctx.lineTo(x + 7, y - 30); }
  else if (kind === 'web') { ctx.roundRect(x - 44, y - 30, 88, 56, 6); ctx.moveTo(x - 56, y + 34); ctx.lineTo(x + 56, y + 34); }
  else { ctx.roundRect(x - 42, y - 28, 84, 56, 6); for (let i = 0; i < 6; i++) ctx.rect(x - 30 + i * 11, y - 20, 4, 4); ctx.rect(x - 8, y - 2, 26, 20); }
  ctx.stroke();
  ctx.restore();
}

function sLumium(ctx, lt) {
  const th = TH.lumium;
  darkBg(ctx, th, lt, 960, 450);
  const cx = 960, cy = 450, R = 236;
  // orbiting devices + lease links
  const devs = [['phone', 160, 'PHONE'], ['web', 18, 'WEB · owner'], ['kiosk', 296, 'KIOSK · RPi']];
  devs.forEach(([kind, ang, label], i) => {
    const a = (ang + lt * 9) * D2R;
    const x = cx + Math.cos(a) * 520, y = cy + Math.sin(a) * 330;
    const p = A(lt, 0.18 + i * 0.05, 0.45 + i * 0.05);
    if (p <= 0) return;
    const owner = kind === 'web';
    const lease = owner ? A(lt, 0.5, 0.62) : 0;
    ctx.strokeStyle = rgba(owner && lease > 0 ? '#6EE7B7' : th.accent, owner ? 0.35 + 0.5 * lease : 0.22);
    ctx.lineWidth = owner ? 2 + lease : 1.5;
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = -lt * 60;
    const ex = cx + Math.cos(a) * (R + 50), ey = cy + Math.sin(a) * (R + 50);
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(lerp(ex, x, p), lerp(ey, y, p)); ctx.stroke();
    ctx.setLineDash([]);
    if (owner && lease > 0) glow(ctx, x, y, 110, '#10B981', 0.35 * lease);
    deviceIcon(ctx, kind, x, y, owner && lease > 0 ? '#A7F3D0' : th.accent, p * (owner ? 1 : 0.6));
    setFont(ctx, 600, 14, MONO);
    ctx.fillStyle = rgba(owner ? '#D1FAE5' : '#6EA38E', p);
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 66);
    ctx.textAlign = 'left';
  });
  // ring + ticks
  const prog = 0.06 + 0.66 * A(lt, 0.08, 0.92, Ez.outCubic);
  const rin = spring(lt - 0.02, 1.4, 6);
  ctx.save();
  about(ctx, cx, cy, 0.7 + 0.3 * rin);
  ctx.lineCap = 'round';
  ctx.strokeStyle = rgba('#FFFFFF', 0.08);
  ctx.lineWidth = 18;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  const cg = ctx.createConicGradient(-Math.PI / 2, cx, cy);
  cg.addColorStop(0, '#10B981'); cg.addColorStop(0.5, '#2DD4BF'); cg.addColorStop(1, '#FBBF24');
  ctx.strokeStyle = cg;
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * prog); ctx.stroke();
  const ha = -Math.PI / 2 + TAU * prog;
  circle(ctx, cx + Math.cos(ha) * R, cy + Math.sin(ha) * R, 14, '#FFFFFF');
  for (let i = 0; i < 60; i++) {
    const a = -Math.PI / 2 + (i / 60) * TAU, on = i / 60 < prog;
    const r0 = R + 30, r1 = R + (i % 5 === 0 ? 50 : 40);
    ctx.strokeStyle = on ? rgba('#6EE7B7', 0.9) : rgba('#FFFFFF', 0.12);
    ctx.lineWidth = i % 5 === 0 ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
  }
  // sprout
  const g1 = A(lt, 0.15, 0.55, Ez.outCubic);
  ctx.strokeStyle = '#34D399'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx, cy - 96); ctx.lineTo(cx, cy - 96 - 58 * g1); ctx.stroke();
  const lf = Ez.outBack(inv(0.38, 0.72, lt));
  if (lf > 0) {
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(cx, cy - 96 - 52 * g1);
      ctx.rotate(s * (0.9 - 0.25 * lf));
      ctx.scale(lf, lf);
      ctx.fillStyle = s < 0 ? '#34D399' : '#6EE7B7';
      ctx.beginPath(); ctx.ellipse(0, -22, 12, 24, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }
  // countdown digits
  const tk = Math.max(0, lt - 0.1) * 13, Tm = 1500 - (Math.floor(tk) + Ez.inOutCubic(clamp((tk % 1 - 0.35) / 0.65)));
  setFont(ctx, 700, 136, DISP);
  ctx.fillStyle = '#FFFFFF';
  const cw = 80, y = cy + 58, x0 = cx - (cw * 4 + 40) / 2;
  const sec = ((Tm % 60) + 60) % 60, ones = sec % 10;
  rollDigit(ctx, Math.floor(Tm / 600), 10, x0, y, 136, cw);
  rollDigit(ctx, Math.floor(Tm / 60) + Ez.smooth(clamp(sec - 59)), 10, x0 + cw, y, 136, cw);
  ctx.fillText(':', x0 + cw * 2 + 10, y - 8);
  rollDigit(ctx, Math.floor(sec / 10) + Ez.smooth(clamp(ones - 9)), 6, x0 + cw * 2 + 40, y, 136, cw);
  rollDigit(ctx, ones, 10, x0 + cw * 3 + 40, y, 136, cw);
  setFont(ctx, 600, 18, MONO);
  ctx.fillStyle = th.accent;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('DEEP FOCUS', cx + 3, cy + 120);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';
  ctx.restore();
  // lease chip
  const lp = A(lt, 0.52, 0.66);
  if (lp > 0) {
    ctx.globalAlpha = lp;
    setFont(ctx, 600, 15, MONO);
    const s = 'ActiveTimerLease · ttl 15s';
    const w = ctx.measureText(s).width + 44;
    pill(ctx, 1320, 820, w, 36, rgba('#10B981', 0.14), rgba('#34D399', 0.6));
    circle(ctx, 1340, 838, 5 * (0.7 + 0.3 * Math.sin(lt * 20)), '#6EE7B7');
    ctx.fillStyle = '#D1FAE5';
    ctx.fillText(s, 1354, 843);
    ctx.globalAlpha = 1;
  }
  titleBlock(ctx, lt, '04', 'LUMIUM', 'focus ecosystem · software × AI × hardware', th);
  tagPills(ctx, lt, ['Capacitor', 'Firestore', 'Raspberry Pi'], th);
}

/* =====================================================================================
   05 PAGEVELLE — paper page + RSVP speed reading with ORP highlight
   ===================================================================================== */
const RSVP = ['Reading', 'itself', 'is', 'the', 'product.'];
function sPagevelle(ctx, lt) {
  const th = TH.pagevelle;
  fillBg(ctx, th.bg);
  dotGrid(ctx, 48, 0.07, '#78716C');
  // page
  const px = 150, py = 110, pw = 640, ph = 650;
  ctx.fillStyle = 'rgba(28,25,23,0.06)';
  ctx.fillRect(px + 10, py + 14, pw, ph);
  ctx.fillStyle = '#FFFDF8';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(28,25,23,0.08)';
  ctx.strokeRect(px + 0.5, py + 0.5, pw, ph);
  ctx.fillStyle = '#1C1917';
  ctx.fillRect(px + 56, py + 60, 330, 22);
  let ly = py + 130, line = 0;
  const cur = Math.floor(clamp((lt - 0.3) / 0.117, 0, 4.99));
  for (let para = 0; para < 3; para++) {
    const n = [6, 5, 4][para];
    for (let i = 0; i < n; i++) {
      const w = (i === n - 1 ? 0.45 + hash(line) * 0.3 : 0.92 + hash(line) * 0.08) * (pw - 112);
      ctx.fillStyle = '#D6D3D1';
      ctx.fillRect(px + 56, ly, w, 10);
      if (line === 4 && lt > 0.28) {
        const wx = px + 56 + (cur / 5) * (pw - 112);
        ctx.fillStyle = rgba('#E11D48', 0.2);
        ctx.fillRect(wx - 6, ly - 8, (pw - 112) / 5, 26);
        ctx.fillStyle = '#E11D48';
        ctx.fillRect(wx - 6, ly + 18, (pw - 112) / 5, 3);
      }
      ly += 28; line++;
    }
    ly += 22;
  }
  setFont(ctx, 500, 14, MONO);
  ctx.fillStyle = '#A8A29E';
  ctx.fillText('p. 42 / 318', px + pw - 120, py + ph - 30);
  // RSVP reticle
  const ox = 1300, top = 350, bot = 530;
  const rp = A(lt, 0.12, 0.4);
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox - 290 * rp, top); ctx.lineTo(ox + 390 * rp, top);
  ctx.moveTo(ox - 290 * rp, bot); ctx.lineTo(ox + 390 * rp, bot);
  ctx.stroke();
  ctx.strokeStyle = '#E11D48';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ox, top); ctx.lineTo(ox, top + 24 * rp);
  ctx.moveTo(ox, bot); ctx.lineTo(ox, bot - 24 * rp);
  ctx.stroke();
  setFont(ctx, 500, 17, MONO);
  ctx.fillStyle = rgba('#57534E', rp);
  ctx.fillText('RSVP · 620 wpm', ox - 290, top - 22);
  if (lt > 0.3) {
    const i = Math.min(RSVP.length - 1, Math.floor((lt - 0.3) / 0.117));
    const wd = RSVP[i], orp = wd.length <= 1 ? 0 : wd.length <= 5 ? 1 : wd.length <= 9 ? 2 : 3;
    setFont(ctx, 700, 104, SANS);
    const pre = ctx.measureText(wd.slice(0, orp)).width, ow = ctx.measureText(wd[orp]).width;
    const x = ox - pre - ow / 2, y = (top + bot) / 2 + 38;
    const pop = 1 + 0.05 * pulse(lt, 0.3 + i * 0.117, 30);
    ctx.save();
    about(ctx, ox, y - 36, pop);
    ctx.fillStyle = '#1C1917';
    ctx.fillText(wd.slice(0, orp), x, y);
    ctx.fillStyle = '#E11D48';
    ctx.fillText(wd[orp], x + pre, y);
    ctx.fillStyle = '#1C1917';
    ctx.fillText(wd.slice(orp + 1), x + pre + ow, y);
    ctx.restore();
    for (let k = 0; k < RSVP.length; k++) circle(ctx, ox - 290 + k * 22, bot + 34, 5, k <= i ? '#E11D48' : '#D6D3D1');
  }
  titleBlock(ctx, lt, '05', 'PAGEVELLE', 'a reader where reading is the product', th);
  tagPills(ctx, lt, ['Flutter', 'PDFium', 'RSVP'], th);
}

/* =====================================================================================
   06 XENON — on-device model: terminal + rotating neural point-sphere
   ===================================================================================== */
const XS = (() => {
  const n = 420, pts = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * ga;
    pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  const edges = [];
  pts.forEach((p, i) => {
    pts.map((q, j) => [(q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2, j])
      .filter(([, j]) => j > i).sort((a, b) => a[0] - b[0]).slice(0, 2).forEach(([, j]) => edges.push([i, j]));
  });
  return { pts, edges };
})();

const XLINES = [
  { t: 0.04, s: '$ xenon --model gemma --local', type: 130, col: '#FFFFFF', pre: '$' },
  { t: 0.3, s: '  weights loaded · 100% on-device', col: '#A7F3D0', check: true },
  { t: 0.36, s: '  memory · context · all local', col: '#A7F3D0', check: true },
  { t: 0.44, s: '> what can we build today?', type: 110, col: '#FFFFFF', pre: '>' },
  { t: 0.66, s: 'anything you can imagine.', type: 60, col: '#F0ABFC', stream: true },
];

function sXenon(ctx, lt) {
  const th = TH.xenon;
  darkBg(ctx, th, lt, 1400, 440);
  // sphere
  const sx = 1400, sy = 430, ent = spring(lt, 1.3, 6);
  const R = 270 * (0.55 + 0.45 * ent);
  const ry = 0.6 + lt * 1.4, rx = 0.35;
  const cy_ = Math.cos(ry), sy_ = Math.sin(ry), cx_ = Math.cos(rx), sx_ = Math.sin(rx);
  const proj = XS.pts.map(([x, y, z]) => {
    const X = x * cy_ + z * sy_; let Z = -x * sy_ + z * cy_;
    const Y = y * cx_ - Z * sx_; Z = y * sx_ + Z * cx_;
    const f = 3 / (3 + Z);
    return [sx + X * R * f, sy + Y * R * f, Z];
  });
  const buckets = [[], [], []];
  for (const [a, b] of XS.edges) {
    const z = (proj[a][2] + proj[b][2]) / 2;
    buckets[z < -0.3 ? 0 : z < 0.3 ? 1 : 2].push([a, b]);
  }
  [0.06, 0.16, 0.34].forEach((al, bi) => {
    ctx.strokeStyle = rgba(bi === 2 ? '#E9D5FF' : '#A78BFA', al);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const [a, b] of buckets[bi]) { ctx.moveTo(proj[a][0], proj[a][1]); ctx.lineTo(proj[b][0], proj[b][1]); }
    ctx.stroke();
  });
  const think = lt > 0.66 && lt < 0.95;
  proj.forEach(([x, y, z], i) => {
    const d = (z + 1) / 2;
    ctx.fillStyle = mixHex('#7C3AED', '#F0ABFC', d);
    const r = 1.2 + d * 2.4;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    if (think && z > -0.2 && hash2(i, Math.floor(lt * 28)) > 0.93) { glow(ctx, x, y, 22, '#F5D0FE', 0.9); circle(ctx, x, y, 4, '#FFFFFF'); }
  });
  // orbit
  ctx.save();
  ctx.translate(sx, sy); ctx.rotate(-14 * D2R);
  ctx.strokeStyle = rgba(th.accent, 0.3); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 370, 92, 0, 0, TAU); ctx.stroke();
  const oa = lt * 5;
  circle(ctx, Math.cos(oa) * 370, Math.sin(oa) * 92, 6, '#F0ABFC');
  ctx.restore();
  setFont(ctx, 600, 16, MONO);
  const chip = '0 bytes -> cloud';
  const cw = ctx.measureText(chip).width + 30;
  ctx.globalAlpha = A(lt, 0.4, 0.55);
  pill(ctx, sx - cw / 2, sy + 330, cw, 36, rgba('#7C3AED', 0.2), rgba('#C084FC', 0.6));
  ctx.fillStyle = '#F5D0FE';
  ctx.fillText(chip, sx - cw / 2 + 15, sy + 354);
  ctx.globalAlpha = 1;
  // terminal
  const tx = 120, ty = 150, tw = 820, thh = 520;
  const tp = spring(lt, 1.6, 7);
  ctx.save();
  ctx.translate(0, (1 - tp) * 80);
  ctx.globalAlpha = clamp(tp * 1.5);
  ctx.beginPath(); ctx.roundRect(tx, ty, tw, thh, 22);
  ctx.fillStyle = 'rgba(20,10,40,0.86)'; ctx.fill();
  ctx.strokeStyle = rgba('#C084FC', 0.28); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = rgba('#FFFFFF', 0.04);
  ctx.fillRect(tx + 1, ty + 56, tw - 2, 1);
  [['#F43F5E', 0], ['#F59E0B', 1], ['#10B981', 2]].forEach(([c, i]) => circle(ctx, tx + 32 + i * 26, ty + 29, 7, c));
  setFont(ctx, 500, 16, MONO);
  ctx.fillStyle = th.mute;
  ctx.textAlign = 'center';
  ctx.fillText('sambhav@xenon: ~', tx + tw / 2, ty + 35);
  ctx.textAlign = 'left';
  setFont(ctx, 500, 25, MONO);
  XLINES.forEach((ln, k) => {
    const y = ty + 112 + k * 60;
    if (lt < ln.t) return;
    if (ln.check) {
      checkMark(ctx, tx + 44, y - 8, 16, A(lt, ln.t, ln.t + 0.06), '#6EE7B7', 3);
      ctx.fillStyle = ln.col;
      ctx.globalAlpha = A(lt, ln.t, ln.t + 0.05);
      ctx.fillText(ln.s, tx + 40, y);
      ctx.globalAlpha = 1;
      return;
    }
    if (ln.pre) { ctx.fillStyle = th.accent; ctx.fillText(ln.pre, tx + 40, y); }
    ctx.fillStyle = ln.col;
    const body = ln.pre ? ln.s.slice(1) : ln.s;
    const bx = ln.pre ? tx + 40 + ctx.measureText(ln.pre).width : tx + 40;
    if (ln.stream) {
      const g = ctx.createLinearGradient(bx, 0, bx + 420, 0);
      g.addColorStop(0, '#E879F9'); g.addColorStop(1, '#A78BFA');
      ctx.fillStyle = g;
    }
    const last = k === XLINES.length - 1;
    typeText(ctx, body, bx, y, lt, ln.t, ln.type || 200, { caret: last, caretSize: 26 });
  });
  ctx.restore();
  titleBlock(ctx, lt, '06', 'XENON', 'local-first AI workspace · on-device', th);
  tagPills(ctx, lt, ['Python', 'Ollama', 'Gemma'], th);
}

/* =====================================================================================
   07 UIQRAFT — glass component library assembling, then coming alive
   ===================================================================================== */
const UQ_CARDS = [
  [560, 130, 440, 200], [1024, 130, 376, 200], [1424, 130, 376, 200],
  [560, 354, 620, 200], [1204, 354, 596, 200],
  [560, 578, 440, 200], [1024, 578, 776, 200],
];

function glassCard(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(30,58,138,0.14)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 14;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.74)'; ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.stroke();
}

function toggle(ctx, x, y, on) {
  pill(ctx, x, y, 64, 34, mixHex('#CBD5E1', '#2563EB', on));
  circle(ctx, x + 17 + 30 * on, y + 17, 13, '#FFFFFF');
}

function sUiqraft(ctx, lt) {
  const th = TH.uiqraft;
  fillBg(ctx, th.bg);
  glow(ctx, 1500 + Math.sin(lt * 2) * 40, 220, 700, '#A5B4FC', 0.55);
  glow(ctx, 700, 950, 760, '#7DD3FC', 0.5);
  glow(ctx, 1850, 900, 520, '#C4B5FD', 0.5);
  // headline
  setFont(ctx, 800, 70, DISP);
  ctx.fillStyle = '#0F172A';
  riseText(ctx, 'Design once.', 120, 280, 70, { t: lt - 0.05, stagger: 0.015, dur: 0.4 });
  ctx.fillStyle = '#2563EB';
  riseText(ctx, 'Ship', 120, 364, 70, { t: lt - 0.1, stagger: 0.015, dur: 0.4 });
  riseText(ctx, 'everywhere.', 120, 448, 70, { t: lt - 0.14, stagger: 0.015, dur: 0.4 });
  setFont(ctx, 500, 20, MONO);
  ctx.fillStyle = rgba('#64748B', A(lt, 0.3, 0.5));
  ctx.fillText('90+ components · 1 system', 124, 510);

  const cards = UQ_CARDS.map((r, k) => {
    const d = 0.02 + k * 0.035;
    const p = spring(lt - d, 1.4, 6.5);
    const dx = (hash(k * 5.3) - 0.5) * 520, dy = 180 + hash(k * 2.1) * 200, rot = (hash(k * 9.2) - 0.5) * 22 * D2R;
    return { r, p, a: A(lt, d, d + 0.12), dx: dx * (1 - p), dy: dy * (1 - p), rot: rot * (1 - p) };
  });
  const place = (k, fn) => {
    const c = cards[k];
    if (c.a <= 0) return;
    const [x, y, w, h] = c.r;
    ctx.save();
    ctx.globalAlpha = c.a;
    ctx.translate(c.dx, c.dy);
    about(ctx, x + w / 2, y + h / 2, 0.9 + 0.1 * c.p, c.rot);
    glassCard(ctx, x, y, w, h);
    fn(x, y, w, h);
    ctx.restore();
  };
  const label = (s, x, y) => { setFont(ctx, 700, 18, SANS); ctx.fillStyle = '#0F172A'; ctx.fillText(s, x, y); };
  // A: toggles
  place(0, (x, y) => {
    label('Notifications', x + 28, y + 42);
    ['Email', 'Push', 'Weekly digest'].forEach((s, i) => {
      setFont(ctx, 500, 17, SANS); ctx.fillStyle = '#475569'; ctx.fillText(s, x + 28, y + 90 + i * 40);
      const on = i === 1 ? 0 : Ez.outBack(inv(0.34 + i * 0.07, 0.46 + i * 0.07, lt));
      toggle(ctx, x + 346, y + 66 + i * 40, clamp(on, 0, 1.08));
    });
  });
  // B: buttons
  place(1, (x, y, w) => {
    label('Actions', x + 28, y + 42);
    const pr = 1 - 0.08 * pulse(lt, 0.52, 12) * (lt > 0.52);
    ctx.save(); about(ctx, x + 28 + 110, y + 118, pr);
    pill(ctx, x + 28, y + 90, 220, 56, '#2563EB');
    setFont(ctx, 700, 19, SANS); ctx.fillStyle = '#FFFFFF'; ctx.fillText('Get started', x + 78, y + 125);
    if (lt > 0.52) {
      ctx.save(); ctx.beginPath(); ctx.roundRect(x + 28, y + 90, 220, 56, 28); ctx.clip();
      const rp = A(lt, 0.52, 0.8); circle(ctx, x + 138, y + 118, 160 * rp, rgba('#FFFFFF', 0.35 * (1 - rp))); ctx.restore();
    }
    ctx.restore();
    pill(ctx, x + 262, y + 90, 86, 56, null, '#CBD5E1');
    setFont(ctx, 600, 18, SANS); ctx.fillStyle = '#0F172A'; ctx.fillText('Docs', x + 284, y + 124);
  });
  // C: avatars
  place(2, (x, y) => {
    label('Team', x + 28, y + 42);
    [['SJ', '#2563EB'], ['AK', '#7C3AED'], ['RM', '#10B981'], ['+5', '#0F172A']].forEach(([s, c], i) => {
      const p = spring(lt - 0.3 - i * 0.05, 2, 7);
      circle(ctx, x + 60 + i * 50, y + 120, 32 * p, '#FFFFFF');
      circle(ctx, x + 60 + i * 50, y + 120, 28 * p, c);
      if (p > 0.5) { setFont(ctx, 700, 17, SANS); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.fillText(s, x + 60 + i * 50, y + 126); ctx.textAlign = 'left'; }
    });
    circle(ctx, x + 330, y + 38, 6 + Math.sin(lt * 14), '#10B981');
  });
  // D: slider + progress
  place(3, (x, y) => {
    label('Volume', x + 28, y + 42);
    const v = lerp(0.22, 0.8, A(lt, 0.62, 0.86, Ez.inOutCubic));
    pill(ctx, x + 28, y + 74, 560, 10, '#E2E8F0');
    pill(ctx, x + 28, y + 74, 560 * v, 10, '#2563EB');
    circle(ctx, x + 28 + 560 * v, y + 79, 17, '#FFFFFF');
    ring(ctx, x + 28 + 560 * v, y + 79, 17, 3, '#2563EB');
    const up = 0.72 * A(lt, 0.3, 0.8, Ez.outCubic);
    setFont(ctx, 600, 16, SANS); ctx.fillStyle = '#475569'; ctx.fillText(`Uploading · ${Math.round(up * 100)}%`, x + 28, y + 138);
    pill(ctx, x + 28, y + 154, 560, 12, '#E2E8F0');
    const pg = ctx.createLinearGradient(x + 28, 0, x + 588, 0); pg.addColorStop(0, '#38BDF8'); pg.addColorStop(1, '#6366F1');
    pill(ctx, x + 28, y + 154, Math.max(12, 560 * up), 12, pg);
  });
  // E: bar chart
  place(4, (x, y) => {
    label('Weekly focus', x + 28, y + 42);
    pill(ctx, x + 470, y + 22, 96, 30, rgba('#10B981', 0.14));
    setFont(ctx, 700, 15, SANS); ctx.fillStyle = '#059669'; ctx.fillText('+18%', x + 496, y + 43);
    for (let i = 0; i < 10; i++) {
      const hgt = (0.3 + hash(i * 4.7) * 0.7) * 100 * spring(lt - 0.28 - i * 0.025, 1.8, 6);
      ctx.fillStyle = i === 7 ? '#2563EB' : '#BFDBFE';
      ctx.beginPath(); ctx.roundRect(x + 36 + i * 54, y + 176 - hgt, 34, hgt, 8); ctx.fill();
    }
  });
  // F: checklist
  place(5, (x, y) => {
    label('Release', x + 28, y + 42);
    ['Tokens', 'Components', 'Docs'].forEach((s, i) => {
      const cp = A(lt, 0.44 + i * 0.09, 0.52 + i * 0.09);
      ctx.beginPath(); ctx.roundRect(x + 28, y + 66 + i * 40, 26, 26, 7);
      ctx.fillStyle = cp > 0 ? '#2563EB' : '#FFFFFF'; ctx.fill();
      ctx.strokeStyle = cp > 0 ? '#2563EB' : '#CBD5E1'; ctx.lineWidth = 2; ctx.stroke();
      if (cp > 0) checkMark(ctx, x + 41, y + 79 + i * 40, 12, cp, '#FFFFFF', 3);
      setFont(ctx, 500, 17, SANS); ctx.fillStyle = cp >= 1 ? '#94A3B8' : '#334155'; ctx.fillText(s, x + 70, y + 86 + i * 40);
    });
  });
  // G: search + framework tabs
  place(6, (x, y) => {
    ctx.beginPath(); ctx.roundRect(x + 28, y + 28, 720, 56, 16);
    ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = '#BFDBFE'; ctx.lineWidth = 2; ctx.stroke();
    ring(ctx, x + 60, y + 54, 9, 2.5, '#64748B');
    ctx.strokeStyle = '#64748B'; ctx.beginPath(); ctx.moveTo(x + 67, y + 61); ctx.lineTo(x + 74, y + 68); ctx.stroke();
    setFont(ctx, 500, 20, MONO); ctx.fillStyle = '#0F172A';
    typeText(ctx, 'uiqraft/button', x + 88, y + 63, lt, 0.3, 50, { caret: true, caretSize: 22 });
    const tabs = ['React', 'Vue', 'Svelte', 'HTML'];
    const tw = 170, tx = x + 28, ty = y + 110;
    pill(ctx, tx, ty, tw * 4 + 12, 60, '#E2E8F0');
    const ip = lerp(0, 2, A(lt, 0.6, 0.8, Ez.inOutExpo));
    pill(ctx, tx + 6 + ip * tw, ty + 6, tw, 48, '#FFFFFF');
    setFont(ctx, 700, 18, SANS);
    tabs.forEach((s, i) => {
      ctx.fillStyle = Math.abs(ip - i) < 0.5 ? '#2563EB' : '#64748B';
      ctx.textAlign = 'center'; ctx.fillText(s, tx + 6 + i * tw + tw / 2, ty + 37); ctx.textAlign = 'left';
    });
  });
  // multiplayer cursor: presses the button, then drags the slider
  const bxy = [1024 + 28 + 150, 130 + 124], sxy = [560 + 28 + 560 * lerp(0.22, 0.8, A(lt, 0.62, 0.86, Ez.inOutCubic)), 354 + 82];
  const c1 = A(lt, 0.26, 0.5, Ez.inOutCubic), c2 = A(lt, 0.54, 0.62, Ez.inOutCubic);
  let cx = lerp(1500, bxy[0], c1), cy = lerp(1120, bxy[1], c1);
  if (lt > 0.54) { cx = lerp(bxy[0], sxy[0], c2); cy = lerp(bxy[1], sxy[1], c2); }
  cursorGlyph(ctx, cx, cy, 1.3, '#F43F5E', '#FFFFFF');
  setFont(ctx, 700, 18, SANS);
  pill(ctx, cx + 28, cy + 40, ctx.measureText('Sambhav').width + 22, 32, '#F43F5E');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Sambhav', cx + 39, cy + 62);
  titleBlock(ctx, lt, '07', 'UIQRAFT', 'one design system · every framework', th);
  tagPills(ctx, lt, ['React', 'Vite', 'Tailwind'], th);
}

/* ---------- the eighth tile on the wall ---------- */
function sYourIdea(ctx, lt) {
  fillBg(ctx, '#0B1224');
  glow(ctx, W / 2, H / 2, 900, '#1D4ED8', 0.35);
  dotGrid(ctx, 48, 0.06);
  ctx.strokeStyle = rgba('#38BDF8', 0.6);
  ctx.lineWidth = 4;
  ctx.setLineDash([24, 18]);
  ctx.lineDashOffset = -lt * 120;
  ctx.beginPath(); ctx.roundRect(120, 110, W - 240, H - 220, 48); ctx.stroke();
  ctx.setLineDash([]);
  const s = 1 + 0.06 * Math.sin(lt * 8);
  ctx.save();
  about(ctx, W / 2, 440, s, lt * 0.6);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(W / 2 - 90, 440 - 14, 180, 28);
  ctx.fillRect(W / 2 - 14, 440 - 90, 28, 180);
  ctx.restore();
  setFont(ctx, 800, 130, DISP);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR IDEA', W / 2, 740);
  setFont(ctx, 500, 34, MONO);
  ctx.fillStyle = '#7DD3FC';
  ctx.fillText('if you can imagine it —', W / 2, 820);
  ctx.textAlign = 'left';
}

/* ---------- transitions ---------- */
const WHIP = [T.erudite - 0.13, T.erudite + 0.13];
const IRIS = [T.lumium, T.lumium + 0.3];
const CURL = [T.pagevelle, T.pagevelle + 0.36];
const SLICE = [T.uiqraft, T.uiqraft + 0.3];

function withWhip(ctx, t) {
  const w = Ez.inOutExpo(inv(WHIP[0], WHIP[1], t));
  const panel = (dx, fn) => {
    ctx.save();
    ctx.translate(dx, 0);
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    fn();
    ctx.restore();
  };
  if (t < WHIP[1]) panel(-W * 1.05 * w, () => sHypha(ctx, t - T.hypha));
  panel(W * 1.05 * (1 - w), () => sErudite(ctx, t - T.erudite));
}

function withIris(ctx, t) {
  if (t >= IRIS[1]) return sLumium(ctx, t - T.lumium);
  sErudite(ctx, t - T.erudite);
  const r = 1200 * Ez.inOutExpo(inv(IRIS[0], IRIS[1], t));
  ctx.save();
  ctx.beginPath(); ctx.arc(960, 450, r, 0, TAU); ctx.clip();
  sLumium(ctx, t - T.lumium);
  ctx.restore();
  ring(ctx, 960, 450, r, 10, '#34D399', 1);
}

function withCurl(ctx, t) {
  sPagevelle(ctx, t - T.pagevelle);
  if (t >= CURL[1]) return;
  const p = Ez.inOutCubic(inv(CURL[0], CURL[1], t));
  const n = [-0.944, -0.33], BR = [W, H];
  const d = 2250 * p;
  const L0 = [BR[0] + n[0] * d, BR[1] + n[1] * d];
  const tx = -n[1], ty = n[0];
  const big = 4000;
  // remaining page: the half-plane beyond the fold line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(L0[0] + tx * big, L0[1] + ty * big);
  ctx.lineTo(L0[0] - tx * big, L0[1] - ty * big);
  ctx.lineTo(L0[0] - tx * big + n[0] * big, L0[1] - ty * big + n[1] * big);
  ctx.lineTo(L0[0] + tx * big + n[0] * big, L0[1] + ty * big + n[1] * big);
  ctx.closePath();
  ctx.clip();
  sLumium(ctx, t - T.lumium);
  ctx.restore();
  // shadow cast onto the revealed page
  const sg = ctx.createLinearGradient(L0[0], L0[1], L0[0] - n[0] * 140, L0[1] - n[1] * 140);
  sg.addColorStop(0, 'rgba(0,0,0,0.35)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(L0[0] + tx * big, L0[1] + ty * big); ctx.lineTo(L0[0] - tx * big, L0[1] - ty * big);
  ctx.lineTo(L0[0] - tx * big - n[0] * 200, L0[1] - ty * big - n[1] * 200); ctx.lineTo(L0[0] + tx * big - n[0] * 200, L0[1] + ty * big - n[1] * 200);
  ctx.closePath(); ctx.fillStyle = sg; ctx.fill();
  ctx.restore();
  // the folded flap = peeled region reflected across the fold line
  const k = 2 * (L0[0] * n[0] + L0[1] * n[1]);
  ctx.save();
  ctx.transform(1 - 2 * n[0] * n[0], -2 * n[0] * n[1], -2 * n[0] * n[1], 1 - 2 * n[1] * n[1], k * n[0], k * n[1]);
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  ctx.beginPath();
  ctx.moveTo(L0[0] + tx * big, L0[1] + ty * big); ctx.lineTo(L0[0] - tx * big, L0[1] - ty * big);
  ctx.lineTo(L0[0] - tx * big - n[0] * big, L0[1] - ty * big - n[1] * big); ctx.lineTo(L0[0] + tx * big - n[0] * big, L0[1] + ty * big - n[1] * big);
  ctx.closePath(); ctx.clip();
  const fg = ctx.createLinearGradient(L0[0], L0[1], L0[0] - n[0] * 900, L0[1] - n[1] * 900);
  fg.addColorStop(0, '#9CA3AF'); fg.addColorStop(0.18, '#F1F5F9'); fg.addColorStop(0.5, '#E2E8F0'); fg.addColorStop(1, '#CBD5E1');
  ctx.fillStyle = fg;
  ctx.fillRect(-W, -H, W * 3, H * 3);
  ctx.restore();
}

function withSlices(ctx, t) {
  if (t >= SLICE[1]) return sUiqraft(ctx, t - T.uiqraft);
  sXenon(ctx, t - T.xenon);
  const n = 12, sw = W / n;
  for (let i = 0; i < n; i++) {
    const p = Ez.outExpo(inv(SLICE[0] + i * 0.012, SLICE[0] + 0.16 + i * 0.012, t));
    if (p <= 0) continue;
    ctx.save();
    ctx.beginPath();
    const dir = i % 2 ? 1 : -1;
    ctx.rect(i * sw - 0.5, dir > 0 ? -H + H * p : H - H * p, sw + 1, H);
    ctx.clip();
    sUiqraft(ctx, t - T.uiqraft);
    ctx.restore();
  }
}

const PROJECTS = [
  { name: 'UIQRAFT', fn: sUiqraft, t0: T.uiqraft },
  { name: 'UNRAVEL', fn: sUnravel },
  { name: 'HYPHA', fn: sHypha },
  { name: 'ERUDITE', fn: sErudite },
  { name: 'LUMIUM', fn: sLumium },
  { name: 'PAGEVELLE', fn: sPagevelle },
  { name: 'XENON', fn: sXenon },
  { name: 'YOUR IDEA', fn: sYourIdea },
];

const WORK_SCENES = [
  [T.unravel, T.hypha, (ctx, t) => sUnravel(ctx, t - T.unravel)],
  [T.hypha, WHIP[0], (ctx, t) => sHypha(ctx, t - T.hypha)],
  [WHIP[0], T.lumium, withWhip],
  [T.lumium, T.pagevelle, withIris],
  [T.pagevelle, T.xenon, withCurl],
  [T.xenon, T.uiqraft, (ctx, t) => sXenon(ctx, t - T.xenon)],
  [T.uiqraft, T.wall, withSlices],
];

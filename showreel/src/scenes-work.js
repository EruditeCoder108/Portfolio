/* Act II — selected work. Seven procedural vignettes, two beats each, each with its own transition:
   zoom-through → Unravel ─match-cut→ Hypha ─whip→ Erudite ─iris→ Lumium ─page-curl→ Pagevelle
   ─glitch→ Xenon ─slices→ UIQraft. Every vignette is a pure function of local time `lt`
   so the wall of work (Act III) can re-render them as live tiles. */

const TH = {
  unravel: { bg: '#050A1A', glow: '#1E3A8A', accent: '#38BDF8', fg: '#FFFFFF', mute: '#7C8DB5' },
  hypha: { bg: '#03110F', glow: '#0F766E', accent: '#2DD4BF', fg: '#FFFFFF', mute: '#6B9E97' },
  erudite: { bg: '#0D0E12', glow: '#1E3A8A', accent: '#818CF8', fg: '#FFFFFF', mute: '#8B8FA3' },
  lumium: { bg: '#04120D', glow: '#065F46', accent: '#34D399', fg: '#FFFFFF', mute: '#6EA38E' },
  pagevelle: { bg: '#F7EFE3', accent: '#C8702E', fg: '#2A1D17', mute: '#8A7A6E' },
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

function codeSkeleton(ctx, lt, x, y, th, hi = -1, hiT = 9, fade = 1) {
  for (let k = 0; k < 9; k++) {
    const p = A(lt, 0.05 + k * 0.025, 0.3 + k * 0.025) * fade;
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
  camDrift(ctx, lt, 1);
  const th = TH.unravel;
  darkBg(ctx, th, lt, 820, 460);
  codeSkeleton(ctx, lt, 130, 150, th, 4, 0.62, 1 - A(lt, 0.9, 1.1));
  const zp = A(lt, 0, 0.45);
  ctx.save();
  const s = lerp(KNOT_SCALE, 1, zp); // picks up exactly where the particle knot left off
  ctx.translate(W / 2, H / 2);
  ctx.scale(s, s);
  ctx.translate(-lerp(UNR.KC[0], W / 2, zp), -lerp(UNR.KC[1], H / 2, zp));
  // second half: the whole code → AST picture shrinks into the "codebase" end of the MCP diagram
  const gB = Ez.inOutCubic(inv(0.92, 1.28, lt));
  if (gB > 0) {
    ctx.translate(lerp(UNR_G.cx, UNR_G.tx, gB), lerp(UNR_G.cy, UNR_G.ty, gB));
    ctx.scale(lerp(1, UNR_G.s, gB), lerp(1, UNR_G.s, gB));
    ctx.translate(-UNR_G.cx, -UNR_G.cy);
  }
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
  if (lt > 0.95) unravelMCP(ctx, lt, th);
  titleBlock(ctx, lt, '01', 'UNRAVEL', 'tangled code -> verified AST evidence', th);
  tagPills(ctx, lt, ['TypeScript', 'Tree-sitter', 'MCP server'], th);
}

/* Unravel, part two: served over MCP to AI agents, and what it measurably changes */
const UNR_G = { cx: 1030, cy: 500, tx: 470, ty: 450, s: 0.52 };
function unravelMCP(ctx, lt, th) {
  const rootX = UNR_G.tx + (UNR.root[0] - UNR_G.cx) * UNR_G.s, rootY = UNR_G.ty + (UNR.root[1] - UNR_G.cy) * UNR_G.s;
  const hub = [1170, 450], agent = [1600, 450];
  const ga = A(lt, 1.0, 1.2);
  setFont(ctx, 600, 15, MONO);
  ctx.fillStyle = rgba(th.mute, ga);
  ctx.textAlign = 'center';
  ctx.fillText('CODEBASE -> AST', UNR_G.tx + 40, 640);
  ctx.textAlign = 'left';
  // links: root → hub, then two arcs hub ⇄ agent (evidence out, claims back)
  const l1 = bezier([rootX + 22, rootY], [rootX + 140, rootY], [hub[0] - 200, hub[1]], [hub[0] - 80, hub[1]], 40);
  const up = bezier([hub[0] + 80, hub[1] - 26], [hub[0] + 200, hub[1] - 150], [agent[0] - 200, agent[1] - 150], [agent[0] - 62, agent[1] - 26], 50);
  const dn = bezier([agent[0] - 62, agent[1] + 26], [agent[0] - 200, agent[1] + 150], [hub[0] + 200, hub[1] + 150], [hub[0] + 80, hub[1] + 26], 50);
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgba('#22D3EE', 0.75);
  strokePartial(ctx, l1, 0, A(lt, 1.02, 1.2, Ez.inOutCubic));
  ctx.strokeStyle = rgba('#7DD3FC', 0.6);
  strokePartial(ctx, up, 0, A(lt, 1.1, 1.3, Ez.inOutCubic));
  ctx.strokeStyle = rgba('#FBBF24', 0.55);
  strokePartial(ctx, dn, 0, A(lt, 1.16, 1.36, Ez.inOutCubic));
  // packets
  const pk = (path, t0, rate, col, n) => {
    if (lt < t0) return;
    for (let k = 0; k < n; k++) {
      const u = ((lt - t0) * rate + k / n) % 1;
      const [x, y] = pointAt(path, Ez.inOutSine(u));
      glow(ctx, x, y, 22, col, 0.8);
      circle(ctx, x, y, 4.5, '#FFFFFF');
    }
  };
  pk(l1, 1.2, 1.8, '#22D3EE', 2);
  pk(up, 1.3, 1.6, '#7DD3FC', 2);
  pk(dn, 1.36, 1.6, '#FBBF24', 2);
  setFont(ctx, 500, 15, MONO);
  ctx.textAlign = 'center';
  ctx.fillStyle = rgba('#BAE6FD', A(lt, 1.25, 1.4));
  ctx.fillText('structural evidence ->', (hub[0] + agent[0]) / 2, hub[1] - 128);
  ctx.fillStyle = rgba('#FDE68A', A(lt, 1.3, 1.45));
  ctx.fillText('<- claims, checked against source', (hub[0] + agent[0]) / 2, hub[1] + 150);
  ctx.textAlign = 'left';
  // the MCP hub
  const hs = spring(lt - 1.0, 1.8, 6.5);
  if (hs > 0) {
    ctx.save();
    about(ctx, hub[0], hub[1], hs);
    glow(ctx, hub[0], hub[1], 190, '#0EA5E9', 0.35 + 0.15 * Math.sin(lt * 7));
    ctx.fillStyle = '#081A33';
    ctx.beginPath(); ctx.roundRect(hub[0] - 80, hub[1] - 80, 160, 160, 34); ctx.fill();
    ctx.strokeStyle = '#22D3EE'; ctx.lineWidth = 3; ctx.stroke();
    setFont(ctx, 600, 15, MONO); ctx.fillStyle = '#7DD3FC'; ctx.textAlign = 'center';
    ctx.fillText('unravel', hub[0], hub[1] - 22);
    setFont(ctx, 800, 50, DISP); ctx.fillStyle = '#FFFFFF';
    ctx.fillText('MCP', hub[0], hub[1] + 30);
    ctx.textAlign = 'left';
    ctx.restore();
    const rp = A(lt, 1.02, 1.5);
    if (rp < 1) ring(ctx, hub[0], hub[1], 90 + 120 * rp, 2, '#22D3EE', 0.7 * (1 - rp));
  }
  setFont(ctx, 500, 14, MONO);
  ctx.textAlign = 'center';
  ctx.fillStyle = rgba(th.mute, A(lt, 1.2, 1.4));
  ctx.fillText('symbols · call graph · mutation chains · claim checks', hub[0], hub[1] + 116);
  ctx.textAlign = 'left';
  // the agent
  const as = spring(lt - 1.08, 1.8, 6.5);
  if (as > 0) {
    ctx.save();
    about(ctx, agent[0], agent[1], as);
    circle(ctx, agent[0], agent[1], 62, '#1E1B4B');
    ring(ctx, agent[0], agent[1], 62, 3, '#A5B4FC', 1);
    ctx.fillStyle = '#E0E7FF';
    ctx.beginPath();
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4 - Math.PI / 2, r = k % 2 ? 9 : 28; ctx.lineTo(agent[0] + Math.cos(a) * r, agent[1] + Math.sin(a) * r); }
    ctx.fill();
    setFont(ctx, 600, 15, MONO); ctx.fillStyle = '#C7D2FE'; ctx.textAlign = 'center';
    ctx.fillText('AI agent', agent[0], agent[1] + 96);
    ctx.textAlign = 'left';
    ctx.restore();
  }
  // measured, not claimed: internal benchmark card
  const bp = spring(lt - 1.22, 1.5, 6.5);
  if (bp <= 0) return;
  const cx = 1080, cy = 660 + (1 - bp) * 60, cw = 720, ch = 250;
  ctx.save();
  ctx.globalAlpha = clamp(bp * 1.3);
  ctx.fillStyle = 'rgba(8,20,44,0.88)';
  ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 22); ctx.fill();
  ctx.strokeStyle = 'rgba(56,189,248,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  setFont(ctx, 700, 14, MONO); ctx.fillStyle = '#7DD3FC';
  ctx.letterSpacing = '3px';
  ctx.fillText('INTERNAL BENCHMARK · MEASURED', cx + 30, cy + 40);
  ctx.letterSpacing = '0px';
  const rows = [
    { label: 'context sent to the model', raw: 1.0, unr: 0.2, cr: '#64748B', cu: '#22D3EE', note: 'a fraction of raw' },
    { label: 'hallucinated references', raw: 0.66, unr: 0.018, cr: '#FB7185', cu: '#34D399', note: 'near zero' },
  ];
  rows.forEach((r, k) => {
    const y = cy + 84 + k * 88, bx = cx + 30, bw = 440;
    setFont(ctx, 500, 16, SANS); ctx.fillStyle = '#CBD5E1';
    ctx.fillText(r.label, bx, y);
    const g1 = spring(lt - 1.32 - k * 0.08, 1.7, 6), g2 = spring(lt - 1.42 - k * 0.08, 1.7, 6);
    setFont(ctx, 500, 13, MONO);
    ctx.fillStyle = '#94A3B8'; ctx.fillText('raw files', bx, y + 28);
    ctx.fillText('unravel', bx, y + 52);
    pill(ctx, bx + 96, y + 16, Math.max(12, bw * r.raw * g1), 14, r.cr);
    pill(ctx, bx + 96, y + 40, Math.max(12, bw * r.unr * g2), 14, r.cu);
    const na = A(lt, 1.52 + k * 0.08, 1.7 + k * 0.08);
    setFont(ctx, 700, 15, MONO); ctx.fillStyle = rgba(r.cu, na);
    ctx.fillText(r.note, bx + 96 + Math.max(12, bw * r.unr * g2) + 14, y + 53);
  });
  ctx.restore();
}

/* =====================================================================================
   02 HYPHA — delay-tolerant mesh; the AST nodes re-form as phones in a mesh
   ===================================================================================== */
const HY = (() => {
  const r = rng(7);
  const pos = [];
  for (let row = 0; row < 3; row++)
    for (let c = 0; c < 5; c++) pos.push([290 + c * 335 + (r() - 0.5) * 150, 200 + row * 245 + (r() - 0.5) * 100]);
  // anchor the story to the photo: Alice is the hiker on the trail, Charlie the node strapped to the tree
  const byX = pos.map((p, i) => [p[0], i]).sort((a, b) => a[0] - b[0]);
  const alice = byX[1][1], charlie = byX[byX.length - 3][1];
  pos[alice] = [576, 612];
  pos[charlie] = [1250, 560];
  const edges = [], seen = new Set(), adj = pos.map(() => []);
  pos.forEach((p, i) => {
    pos.map((q, j) => [Math.hypot(q[0] - p[0], q[1] - p[1]), j]).filter(([, j]) => j !== i)
      .sort((a, b) => a[0] - b[0]).slice(0, 3).forEach(([, j]) => {
        const k = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (seen.has(k)) return;
        seen.add(k);
        edges.push([Math.min(i, j), Math.max(i, j)]);
        adj[i].push(j);
        adj[j].push(i);
      });
  });
  const prev = new Map([[alice, -1]]), q = [alice];
  while (q.length) { const u = q.shift(); for (const v of adj[u]) if (!prev.has(v)) { prev.set(v, u); q.push(v); } }
  const route = [];
  for (let v = charlie; v !== -1; v = prev.get(v)) route.unshift(v);
  const bob = route[Math.floor(route.length / 2)];
  const perm = [3, 11, 7, 0, 14, 5, 9, 1, 12, 6, 2, 13, 8, 4, 10]; // mesh node k starts at tree node perm[k]
  const routePts = [];
  route.slice(1).forEach((v, i) => {
    const seg = hyEdge(pos, route[i], v);
    routePts.push(...(i ? seg.slice(1) : seg));
  });
  const acc = polyLength(routePts);
  const frac = route.map(k => {
    let best = 0, bd = 1e9;
    routePts.forEach((p, j) => { const d = Math.hypot(p[0] - pos[k][0], p[1] - pos[k][1]); if (d < bd) { bd = d; best = j; } });
    return acc[best] / acc[acc.length - 1];
  });
  const routeEdges = new Set(route.slice(1).map((v, i) => `${Math.min(v, route[i])}-${Math.max(v, route[i])}`));
  return { pos, edges, route, routePts, acc, frac, alice, bob, charlie, perm, routeEdges };
})();

/** gently bowed link between mesh nodes a → b (hyphae, not rulers) */
function hyEdge(P, a, b, n = 20) {
  const [x0, y0] = P[a], [x1, y1] = P[b];
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const bend = (hash2(Math.min(a, b), Math.max(a, b)) - 0.5) * 0.36 * len;
  const sgn = a < b ? 1 : -1;
  const c = [(x0 + x1) / 2 - (dy / len) * bend * sgn, (y0 + y1) / 2 + (dx / len) * bend * sgn];
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * x0 + 2 * u * t * c[0] + t * t * x1, u * u * y0 + 2 * u * t * c[1] + t * t * y1]);
  }
  return out;
}

const hyphaIcon = (ctx, x, y, s) => {
  ctx.fillStyle = '#F7F7F4';
  ctx.beginPath(); ctx.roundRect(x, y, s, s, s * 0.24); ctx.fill();
  markHypha(ctx, x + s / 2, y + s / 2, s * 1.35, '#111111');
};

function sHypha(ctx, lt) {
  camDrift(ctx, lt, 2);
  const th = TH.hypha;
  fillBg(ctx, th.bg);
  // the trail photo fades up behind the mesh, graded into the scene's teal night
  const z = 1.0 + 0.055 * lt;
  const pa = A(lt, 0.04, 0.4, Ez.outCubic);
  ctx.save();
  about(ctx, W / 2, H / 2, z);
  if (pa > 0) {
    ctx.globalAlpha = pa;
    drawCover(ctx, IMG.hyphaTrail, 0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(2,16,14,${lerp(1, 0.5, pa)})`;
    ctx.fillRect(-W, -H, W * 3, H * 3);
    const vg = ctx.createRadialGradient(W * 0.55, H * 0.45, 200, W * 0.55, H * 0.45, 1200);
    vg.addColorStop(0, 'rgba(3,17,15,0)'); vg.addColorStop(1, 'rgba(3,17,15,0.85)');
    ctx.fillStyle = vg;
    ctx.fillRect(-W, -H, W * 3, H * 3);
  } else darkBg(ctx, th, lt, 1000, 470);
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
  ctx.lineCap = 'round';
  HY.edges.forEach(([a, b], e) => {
    const p = A(lt, 0.18 + e * 0.008, 0.42 + e * 0.008, Ez.outCubic);
    if (p <= 0) return;
    const hot = HY.routeEdges.has(`${a}-${b}`);
    let lit = 0;
    if (hot) {
      const ia = HY.route.indexOf(a), ib = HY.route.indexOf(b);
      lit = prog >= Math.max(HY.frac[ia], HY.frac[ib]) ? 1 : 0;
    }
    ctx.strokeStyle = lit ? rgba('#6EE7B7', 0.95) : rgba(th.accent, 0.42);
    ctx.lineWidth = lit ? 3 : 2;
    ctx.setLineDash(lit ? [] : [7, 9]);
    ctx.lineDashOffset = -lt * 90;
    strokePartial(ctx, hyEdge(P, a, b), 0, p);
  });
  ctx.setLineDash([]);
  // nodes
  P.forEach(([x, y], k) => {
    const special = k === HY.alice || k === HY.bob || k === HY.charlie;
    const ri = HY.route.indexOf(k);
    const heat = ri >= 0 ? Math.max(0, 1 - Math.abs(prog - HY.frac[ri]) * 10) : 0;
    const r = special ? 13 : 8;
    circle(ctx, x, y, r + 3, 'rgba(6,40,36,0.9)');
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
    lab(HY.alice, 'ALICE · hiker');
    lab(HY.bob, 'BOB · carrier');
    lab(HY.charlie, 'HYPHA NODE');
    ctx.globalAlpha = 1;
  }
  // hop chips
  const chip = (i, s, a) => {
    if (a <= 0) return;
    const [mx, my] = pointAt(hyEdge(P, HY.route[i], HY.route[i + 1]), 0.5);
    setFont(ctx, 700, 14, MONO);
    const w = ctx.measureText(s).width + 20;
    ctx.globalAlpha = a;
    pill(ctx, mx - w / 2, my + 14, w, 28, 'rgba(5,46,43,0.9)', rgba('#6EE7B7', 0.8));
    ctx.fillStyle = '#6EE7B7';
    ctx.fillText(s, mx - w / 2 + 10, my + 33);
    ctx.globalAlpha = 1;
  };
  chip(0, 'BLE', A(lt, 0.34, 0.44));
  chip(HY.route.length - 2, 'WI-FI DIRECT', A(lt, 0.66, 0.76));
  // packet with a comet tail along the curved route
  if (lt > 0.3) {
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
    ring(ctx, cx, cy, 24 + 10 * ap, 3, '#6EE7B7', ap);
    glow(ctx, cx, cy, 120, '#34D399', 0.45 * ap);
    checkMark(ctx, cx + 44, cy + 30, 16, ap, '#6EE7B7', 3);
  }
  ctx.restore();
  titleBlock(ctx, lt, '02', 'HYPHA', 'offline mesh · no towers · 0 bytes cellular', th, 0.1, hyphaIcon);
  tagPills(ctx, lt, ['Rust', 'Noise XX', 'ChaCha20'], th);
}

/* =====================================================================================
   03 ERUDITE — the real app, on two store screens swung into 3D
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

/**
 * Draw a bitmap as a card rotated about its vertical axis with true perspective: the image is cut into
 * vertical strips, each scaled by its own depth. Returns a projector for points in image pixels.
 */
function screen3D(ctx, im, cx, cy, w, h, ry, o = {}) {
  const P = 1700, c = Math.cos(ry), sn = Math.sin(ry);
  const proj = (x, y) => { const f = P / (P + x * sn); return [cx + x * c * f, cy + y * f, f]; };
  const outline = roundRectPts(w, h, o.radius || 38, 6).map(([x, y]) => proj(x, y));
  const path = () => { ctx.beginPath(); outline.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  glow(ctx, cx + 24, cy + h * 0.18, w * 0.95, '#000000', 0.55);
  glow(ctx, cx, cy + h * 0.5, w * 0.8, o.glow || '#3B82F6', 0.16);
  path();
  ctx.save();
  ctx.clip();
  const N = 64, iw = im.naturalWidth, ih = im.naturalHeight;
  for (let i = 0; i < N; i++) {
    const [x0, , f0] = proj((i / N - 0.5) * w, 0), [x1, , f1] = proj(((i + 1) / N - 0.5) * w, 0);
    const fm = (f0 + f1) / 2;
    ctx.drawImage(im, (i / N) * iw, 0, iw / N, ih, Math.min(x0, x1), cy - (h / 2) * fm, Math.abs(x1 - x0) + 0.7, h * fm);
  }
  // glass sheen sliding across the screen
  const sx = lerp(-w, w * 1.5, o.sheen ?? 0.5);
  const g = ctx.createLinearGradient(cx + sx - 160, cy - h / 2, cx + sx + 160, cy + h / 2);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.09)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - w, cy - h, w * 2, h * 2);
  ctx.restore();
  path();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  return (px, py) => proj((px / iw - 0.5) * w, (py / ih - 0.5) * h);
}

const eruditeIcon = (ctx, x, y, s) => markErudite(ctx, x + s / 2, y + s / 2, s);

function sErudite(ctx, lt) {
  camDrift(ctx, lt, 3);
  const th = TH.erudite;
  fillBg(ctx, th.bg);
  glow(ctx, 260, 1080, 1100, '#1E3A8A', 0.45);
  glow(ctx, 1500, 200, 900, '#312E81', 0.25);
  dotGrid(ctx, 48, 0.035, '#FFFFFF', 0, -lt * 20);
  // headline, in the app's own words
  setFont(ctx, 600, 18, MONO);
  ctx.letterSpacing = '5px';
  ctx.fillStyle = rgba('#818CF8', A(lt, 0.08, 0.3));
  ctx.fillText('ERUDITE FLASHCARDS', 124, 262);
  ctx.letterSpacing = '0px';
  setFont(ctx, 800, 92, SANS);
  ctx.fillStyle = '#F4F4F5';
  riseText(ctx, 'Remember what', 118, 372, 92, { t: lt - 0.1, stagger: 0.012, dur: 0.42, track: -3 });
  riseText(ctx, 'you study.', 118, 470, 92, { t: lt - 0.16, stagger: 0.014, dur: 0.42, track: -3 });
  setFont(ctx, 500, 25, SANS);
  ctx.fillStyle = rgba('#A1A1AA', A(lt, 0.3, 0.55));
  ctx.fillText('Spaced repetition, image occlusion, and', 122, 546);
  ctx.fillText('decks built from your notes.', 122, 582);
  // the two store screens swing in on springs
  const screens = [
    { im: IMG.eruditeLibrary, x: 1165, y: 468, ry: 0.3, d: 0.0, glow: '#3B82F6' },
    { im: IMG.eruditeOcclusion, x: 1595, y: 512, ry: 0.4, d: 0.08, glow: '#F59E0B' },
  ];
  const proj = screens.map((sc, k) => {
    const sp = spring(lt - 0.02 - sc.d, 1.25, 5.2);
    const ry = lerp(1.25, sc.ry, sp) + Math.sin(lt * 1.6 + k) * 0.025;
    const y = sc.y + (1 - sp) * 140 + Math.sin(lt * 2.2 + k * 1.7) * 7;
    return screen3D(ctx, sc.im, sc.x, y, 430, 764, ry, { sheen: A(lt, 0.25 + k * 0.1, 0.95 + k * 0.1, Ez.inOutCubic), glow: sc.glow, alpha: clamp(sp * 1.4) });
  });
  // a tap on the first deck's play button
  const tp = A(lt, 0.52, 0.85, Ez.outCubic);
  if (lt > 0.5) {
    const [bx, by, f] = proj[0](828, 1356);
    circle(ctx, bx, by, 16 * f * (1 - 0.3 * pulse(lt, 0.52, 14)), rgba('#FFFFFF', 0.5 * (1 - tp)));
    ring(ctx, bx, by, (20 + 70 * tp) * f, 3, '#FFFFFF', 0.7 * (1 - tp));
  }
  // the hidden label on the occlusion card breathes
  if (lt > 0.4) {
    const [qx, qy, f] = proj[1](808, 1391);
    const pp = 0.5 + 0.5 * Math.sin((lt - 0.4) * 11);
    glow(ctx, qx, qy, 90 * f, '#F59E0B', 0.35 + 0.25 * pp);
    ring(ctx, qx, qy, (40 + 26 * A(lt, 0.4, 0.9)) * f, 2, '#FBBF24', 0.7 * (1 - A(lt, 0.4, 0.9)));
  }
  titleBlock(ctx, lt, '03', 'ERUDITE', 'local-first spaced repetition · FSRS', th, 0.1, eruditeIcon);
  tagPills(ctx, lt, ['Electron', 'SQLite', 'Shadow DOM'], th);
}

/* =====================================================================================
   05 PAGEVELLE — paper page + RSVP speed reading with ORP highlight
   ===================================================================================== */
const RSVP = ['Reading', 'itself', 'is', 'the', 'product.'];
function sPagevelle(ctx, lt) {
  camDrift(ctx, lt, 5);
  const th = TH.pagevelle;
  fillBg(ctx, th.bg);
  dotGrid(ctx, 48, 0.07, '#8A6F58');
  // page
  const px = 150, py = 110, pw = 640, ph = 650;
  ctx.fillStyle = 'rgba(42,29,23,0.07)';
  ctx.fillRect(px + 10, py + 14, pw, ph);
  ctx.fillStyle = '#FFFBF4';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(42,29,23,0.1)';
  ctx.strokeRect(px + 0.5, py + 0.5, pw, ph);
  ctx.fillStyle = th.fg;
  ctx.fillRect(px + 56, py + 60, 330, 22);
  let ly = py + 130, line = 0;
  const cur = Math.floor(clamp((lt - 0.3) / 0.117, 0, 4.99));
  for (let para = 0; para < 3; para++) {
    const n = [6, 5, 4][para];
    for (let i = 0; i < n; i++) {
      const w = (i === n - 1 ? 0.45 + hash(line) * 0.3 : 0.92 + hash(line) * 0.08) * (pw - 112);
      ctx.fillStyle = '#E3D6C4';
      ctx.fillRect(px + 56, ly, w, 10);
      if (line === 4 && lt > 0.28) {
        const wx = px + 56 + (cur / 5) * (pw - 112);
        ctx.fillStyle = rgba(th.accent, 0.2);
        ctx.fillRect(wx - 6, ly - 8, (pw - 112) / 5, 26);
        ctx.fillStyle = th.accent;
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
  ctx.strokeStyle = th.fg;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox - 290 * rp, top); ctx.lineTo(ox + 390 * rp, top);
  ctx.moveTo(ox - 290 * rp, bot); ctx.lineTo(ox + 390 * rp, bot);
  ctx.stroke();
  ctx.strokeStyle = th.accent;
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
    ctx.fillStyle = th.fg;
    ctx.fillText(wd.slice(0, orp), x, y);
    ctx.fillStyle = th.accent;
    ctx.fillText(wd[orp], x + pre, y);
    ctx.fillStyle = th.fg;
    ctx.fillText(wd.slice(orp + 1), x + pre + ow, y);
    ctx.restore();
    for (let k = 0; k < RSVP.length; k++) circle(ctx, ox - 290 + k * 22, bot + 34, 5, k <= i ? th.accent : '#E3D6C4');
  }
  titleBlock(ctx, lt, '05', 'PAGEVELLE', 'a reader where reading is the product', th, 0.1, iconTile(IMG.pagevelleLogo));
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
  camDrift(ctx, lt, 6);
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
  camDrift(ctx, lt, 7);
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
    // smooth area chart: each point springs up with a little overshoot, the curve is a Catmull-Rom spline
    const vals = [0.32, 0.44, 0.38, 0.58, 0.52, 0.71, 0.63, 0.86, 0.78, 0.94];
    const pts = vals.map((v, i) => [x + 34 + i * 58, y + 178 - v * 112 * spring(lt - 0.26 - i * 0.03, 1.6, 5.2)]);
    const curve = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 12; k++) {
        const t = k / 12, t2 = t * t, t3 = t2 * t;
        curve.push([0, 1].map(d => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
      }
    }
    curve.push(pts[pts.length - 1]);
    const ag = ctx.createLinearGradient(0, y + 60, 0, y + 180);
    ag.addColorStop(0, 'rgba(37,99,235,0.28)'); ag.addColorStop(1, 'rgba(37,99,235,0)');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.moveTo(curve[0][0], y + 180);
    for (const [cx_, cy_] of curve) ctx.lineTo(cx_, cy_);
    ctx.lineTo(curve[curve.length - 1][0], y + 180); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    strokePartial(ctx, curve, 0, A(lt, 0.24, 0.7, Ez.inOutCubic));
    const hp = A(lt, 0.24, 0.7, Ez.inOutCubic);
    if (hp > 0) { const [hx, hy] = pointAt(curve, hp); circle(ctx, hx, hy, 7, '#FFFFFF'); ring(ctx, hx, hy, 7, 3, '#2563EB'); }
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

/* ---------- transitions ---------- */
const WHIP = [T.erudite - 0.13, T.erudite + 0.13];
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
  fg.addColorStop(0, '#B8A48A'); fg.addColorStop(0.18, '#FBF4E8'); fg.addColorStop(0.5, '#F1E6D4'); fg.addColorStop(1, '#E2D2BA');
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
  { key: 'staysecure', name: 'STAYSECURE', fn: sStaySecure, idx: 8 },
  { key: 'unravel', name: 'UNRAVEL', fn: sUnravel, idx: 1, tile: 1.55 },
  { key: 'hypha', name: 'HYPHA', fn: sHypha, idx: 2 },
  { key: 'erudite', name: 'ERUDITE', fn: sErudite, idx: 3 },
  { key: 'lumium', name: 'LUMIUM', fn: sLumium, idx: 4, tile: 1.62 },
  { key: 'pagevelle', name: 'PAGEVELLE', fn: sPagevelle, idx: 5 },
  { key: 'xenon', name: 'XENON', fn: sXenon, idx: 6 },
  { key: 'uiqraft', name: 'UIQRAFT', fn: sUiqraft, idx: 7 },
];

const WORK_SCENES = [
  [T.unravel, T.hypha, (ctx, t) => sUnravel(ctx, t - T.unravel)],
  [T.hypha, WHIP[0], (ctx, t) => sHypha(ctx, t - T.hypha)],
  [WHIP[0], T.lumium, withWhip],
  [T.lumium, T.pagevelle, (ctx, t) => sLumium(ctx, t - T.lumium)],
  [T.pagevelle, T.xenon, withCurl],
  [T.xenon, T.uiqraft, (ctx, t) => sXenon(ctx, t - T.xenon)],
  [T.uiqraft, T.staysecure, withSlices],
  [T.staysecure, T.wall, (ctx, t) => sStaySecure(ctx, t - T.staysecure)],
];

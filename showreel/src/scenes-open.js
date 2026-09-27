/* Act I — "If you can imagine it, we can design it, build it and automate it."
   Beats 0–6: laser line → IMAGINE → DESIGN → BUILD → AUTOMATE (drop), which collapses into the dot matrix. */

const T = {};
for (const [k, v] of Object.entries(window.CUES.sections)) T[k] = bt(v);

/** deterministic burst of streak particles */
function sparks(ctx, cx, cy, lt, n, seed, o = {}) {
  if (lt < 0) return;
  const life = o.life || 0.55, k = o.drag || 5.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = hash2(i, seed) * TAU, v = (o.vmin || 500) + hash2(i, seed + 1) * (o.vrange || 1300);
    const L = life * (0.6 + 0.4 * hash2(i, seed + 2));
    if (lt > L) continue;
    const d = (v / k) * (1 - Math.exp(-k * lt));
    const d2 = (v / k) * (1 - Math.exp(-k * Math.max(0, lt - 0.03)));
    const fade = 1 - lt / L;
    ctx.strokeStyle = i % 3 === 0 ? rgba(o.c2 || '#38BDF8', fade) : rgba('#FFFFFF', fade);
    ctx.lineWidth = (o.w || 3) * fade + 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * d2, cy + Math.sin(a) * d2);
    ctx.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
    ctx.stroke();
  }
}

/* ---------- beat 0: dot → laser line ---------- */
function sIntro(ctx, t) {
  const cx = W / 2, cy = H / 2;
  fillBg(ctx, PAL.ink);
  glow(ctx, cx, cy, 900, '#1E3A8A', 0.3 * A(t, 0, 0.4));
  dotGrid(ctx, 48, 0.06 * A(t, 0.05, 0.4));
  const L = A(t, 0.1, 0.45, Ez.inOutExpo) * 1150;
  if (L > 2) {
    const g = ctx.createLinearGradient(cx - L, 0, cx + L, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.25, '#FFFFFF');
    g.addColorStop(0.75, '#FFFFFF');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - L, cy - 1.5, L * 2, 3);
  }
  const r = 8 * spring(t, 2.2, 7) * (1 - 0.55 * A(t, 0.1, 0.3));
  circle(ctx, cx, cy, r, '#FFFFFF');
  glow(ctx, cx, cy, 90, '#93C5FD', 0.55 * spring(t, 2.2, 7));
  setFont(ctx, 500, 30, MONO);
  ctx.fillStyle = PAL.slate300;
  typeText(ctx, 'if you can', cx - 520, cy - 36, t, 0.13, 34, { caret: true, caretSize: 30 });
}

/* ---------- beat 1: IMAGINE ---------- */
function sImagine(ctx, t) {
  const lt = t - T.imagine;
  fillBg(ctx, PAL.ink);
  glow(ctx, W / 2, H * 0.56, 1000, '#1D4ED8', 0.3);
  dotGrid(ctx, 48, 0.05, '#FFFFFF', 0, -lt * 40);
  ctx.save();
  about(ctx, W / 2, H / 2, 1.16 - 0.16 * A(lt, 0, 0.32) + 0.04 * lt);
  const size = 300, base = H / 2 + 104, word = 'IMAGINE';
  setFont(ctx, 900, size, DISP);
  const track = lerp(70, -4, A(lt, 0, 0.5));
  // echo outlines trailing the slam
  for (let k = 3; k >= 1; k--) {
    const e = A(lt, 0, 0.4 + k * 0.05);
    ctx.save();
    about(ctx, W / 2, base - size * 0.36, 1 + k * 0.1 * (1 - e) + k * 0.02);
    ctx.strokeStyle = rgba('#60A5FA', 0.22 / k * (1 - 0.6 * e));
    ctx.lineWidth = 2;
    riseText(ctx, word, W / 2, base, size, { t: lt - k * 0.03, stagger: 0.022, dur: 0.32, align: 'center', track, order: 'center', stroke: true, mask: false });
    ctx.restore();
  }
  const g = ctx.createLinearGradient(0, base - size * 0.75, 0, base);
  g.addColorStop(0, '#FFFFFF');
  g.addColorStop(1, '#BFD3FF');
  ctx.fillStyle = g;
  const w = riseText(ctx, word, W / 2, base, size, { t: lt, stagger: 0.022, dur: 0.32, align: 'center', track, order: 'center' });
  // label and underline carried over from the intro line
  setFont(ctx, 500, 30, MONO);
  ctx.fillStyle = PAL.sky;
  riseText(ctx, 'if you can', W / 2 - w / 2 + 8, base - size * 0.73 - 36, 30, { t: lt - 0.04, stagger: 0.01, dur: 0.3 });
  const uw = lerp(2300, w, A(lt, 0, 0.22, Ez.outExpo));
  const cut = A(lt, 0.26, 0.46, Ez.inExpo);
  ctx.fillStyle = PAL.sky;
  ctx.fillRect(W / 2 - uw / 2 + uw * cut, base + 42, uw * (1 - cut), 5);
  ctx.restore();
}

/* ---------- beat 2: DESIGN (Figma-style construction) ---------- */
function sDesign(ctx, t) {
  const lt = t - T.design;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#1D4ED8');
  g.addColorStop(1, '#4338CA');
  ctx.fillStyle = g;
  ctx.fillRect(-W, -H, W * 3, H * 3);
  lineGrid(ctx, 60, 0.08, '#FFFFFF', lt * -30, 0);
  ctx.save();
  about(ctx, W / 2, H / 2, 1.1 - 0.1 * A(lt, 0, 0.32), -2.5 * D2R * (1 - A(lt, 0, 0.4)));

  const size = 270, word = 'DESIGN';
  setFont(ctx, 800, size, DISP);
  const w = ctx.measureText(word).width;
  const capH = size * 0.72;
  const base = H / 2 + capH / 2 - 10, x0 = W / 2 - w / 2;
  const pad = 26;
  const bx = x0 - pad, by = base - capH - pad, bw0 = w + pad * 2, bh0 = capH + pad * 2;
  const drag = A(lt, 0.25, 0.42, Ez.inOutCubic) * 40;
  const bw = bw0 + drag, bh = bh0 + drag * (bh0 / bw0);
  const sc = bw / bw0;

  // glyphs: outline draw-on, then fill
  ctx.save();
  about(ctx, bx, by, sc);
  const pDraw = A(lt, 0, 0.27, Ez.outCubic);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#FFFFFF';
  ctx.setLineDash([2400, 2400]);
  ctx.lineDashOffset = 2400 * (1 - pDraw);
  ctx.strokeText(word, x0, base);
  ctx.setLineDash([]);
  ctx.globalAlpha = A(lt, 0.13, 0.3, Ez.outCubic);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(word, x0, base);
  ctx.globalAlpha = 1;
  ctx.restore();

  // snapping guides
  const gA = A(lt, 0.26, 0.3) * (1 - A(lt, 0.4, 0.46));
  if (gA > 0) {
    ctx.strokeStyle = rgba('#FB7185', gA);
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(bx + bw / 2, 0); ctx.lineTo(bx + bw / 2, H);
    ctx.moveTo(0, by + bh); ctx.lineTo(W, by + bh);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // selection box + handles
  const bp = A(lt, 0.03, 0.22, Ez.outExpo);
  if (bp > 0) {
    ctx.save();
    about(ctx, bx + bw / 2, by + bh / 2, lerp(0.85, 1, bp));
    ctx.globalAlpha = bp;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    for (const [hx, hy] of [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]]) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(bx + bw * hx - 8, by + bh * hy - 8, 16, 16);
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + bw * hx - 8, by + bh * hy - 8, 16, 16);
    }
    // dimensions pill
    setFont(ctx, 700, 22, SANS);
    const label = `${Math.round(bw)} × ${Math.round(bh)}`;
    const lw = ctx.measureText(label).width + 28;
    pill(ctx, bx + bw / 2 - lw / 2, by + bh + 22, lw, 38, '#FFFFFF');
    ctx.fillStyle = '#2563EB';
    ctx.fillText(label, bx + bw / 2 - lw / 2 + 14, by + bh + 48);
    ctx.restore();
  }

  // multiplayer cursor
  const cp = A(lt, 0.06, 0.25, Ez.inOutCubic);
  const hx = bx + bw, hy = by + bh;
  const cxp = lerp(W * 0.86, hx + 4, cp), cyp = lerp(H * 1.02, hy + 4, cp) - Math.sin(cp * Math.PI) * 60;
  cursorGlyph(ctx, cxp, cyp, 1.35, '#F43F5E', '#FFFFFF');
  setFont(ctx, 700, 20, SANS);
  const nw = ctx.measureText('Sambhav').width + 24;
  pill(ctx, cxp + 30, cyp + 44, nw, 34, '#F43F5E');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Sambhav', cxp + 42, cyp + 68);
  ctx.restore();
}

/* ---------- beat 3: BUILD (scramble-compile, then collapse to a line) ---------- */
function sBuild(ctx, t) {
  const lt = t - T.build;
  fillBg(ctx, PAL.ink);
  const col = A(lt, 0.3, BEAT, Ez.inExpo);
  ctx.save();
  about(ctx, W / 2, H / 2, 1 + col * 0.15, 0, lerp(1, 0.003, col));
  ctx.fillStyle = '#F3F6FC';
  ctx.fillRect(-W, -H, W * 3, H * 3);
  lineGrid(ctx, 40, 0.35, '#DCE5F5');
  lineGrid(ctx, 200, 0.9, '#C9D6EE');
  ctx.save();
  about(ctx, W / 2, H / 2, 1.08 - 0.08 * A(lt, 0, 0.3));
  const size = 210;
  setFont(ctx, 800, size, MONO);
  const cw = ctx.measureText('B').width;
  const word = 'BUILD';
  const ww = cw * word.length;
  const base = H / 2 + size * 0.36 - 20;
  const open = A(lt, 0, 0.24);
  ctx.fillStyle = '#2563EB';
  ctx.fillText('<', W / 2 - ww / 2 - cw * 1.25 * open - cw * 0.1, base);
  const cx_ = W / 2 + ww / 2 + cw * 0.25 * open + cw * 0.1 - cw * 0.35 * (1 - open);
  ctx.fillText('/', cx_, base);
  ctx.fillText('>', cx_ + cw * 0.85, base);
  ctx.save();
  ctx.beginPath();
  ctx.rect(W / 2 - (ww / 2 + 20) * open, 0, (ww + 40) * open, H);
  ctx.clip();
  for (let i = 0; i < word.length; i++) {
    const lock = 0.05 + i * 0.045;
    const x = W / 2 - ww / 2 + i * cw;
    if (lt < lock) {
      ctx.fillStyle = rgba('#2563EB', 0.45);
      ctx.fillText(scrambleChar(i * 31 + Math.floor(lt * 45)), x, base);
    } else {
      const pop = 1 + 0.18 * pulse(lt, lock, 22);
      ctx.save();
      about(ctx, x + cw / 2, base - size * 0.36, pop);
      ctx.fillStyle = PAL.slate900;
      ctx.fillText(word[i], x, base);
      ctx.restore();
    }
  }
  ctx.restore();

  // build progress bar
  const by = H / 2 + 170, bw = 760, bx = W / 2 - bw / 2;
  const prog = A(lt, 0.02, 0.29, Ez.outCubic);
  ctx.fillStyle = '#DCE5F5';
  ctx.fillRect(bx, by, bw, 8);
  ctx.fillStyle = '#2563EB';
  ctx.fillRect(bx, by, bw * prog, 8);
  setFont(ctx, 500, 22, MONO);
  ctx.fillStyle = '#64748B';
  ctx.fillText(prog < 1 ? '$ build --release' : 'built · 0 runtime deps', bx, by - 22);
  if (prog >= 1) checkMark(ctx, bx + bw - 14, by - 30, 22, A(lt, 0.29, 0.36), '#10B981', 4);
  else {
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(prog * 100)}%`, bx + bw, by - 22);
    ctx.textAlign = 'left';
  }
  ctx.restore();
  ctx.restore();
  if (col > 0) {
    ctx.fillStyle = rgba('#FFFFFF', col);
    ctx.fillRect(0, H / 2 - 2, W, 4);
    glow(ctx, W / 2, H / 2, 500, '#93C5FD', 0.4 * col);
  }
}

/* ---------- beats 4–5: AUTOMATE (the drop) ---------- */
function sAutomate(ctx, t) {
  const lt = t - T.automate;
  fillBg(ctx, PAL.ink);
  glow(ctx, W / 2, H / 2, 1200, '#1D4ED8', 0.38);
  const suck = A(lt, 0.66, BEAT * 2, Ez.inExpo);
  ctx.save();
  about(ctx, W / 2, H / 2, lerp(1, 0.015, suck) * (1.06 - 0.06 * A(lt, 0, 0.4)), -7 * D2R + suck * 50 * D2R);
  const size = 150, gap = 170;
  const open = A(lt, 0, 0.3);
  setFont(ctx, 900, size, DISP);
  const unit = 'AUTOMATE';
  const uw = ctx.measureText(unit).width;
  const period = uw + 130;
  for (let k = -4; k <= 4; k++) {
    const y = H / 2 + k * gap * open + size * 0.36;
    const dir = k % 2 === 0 ? 1 : -1;
    const off = dir * (1500 * A(lt, 0, 0.62) + 140 * lt * (1 + Math.abs(k) * 0.3) + 2600 * A(lt, 0.5, BEAT * 2, Ez.inCubic)) + k * 211;
    let x = (((off % period) + period) % period) - period * 3;
    const ak = Math.abs(k);
    const style = ak === 0 ? 'solid' : ak === 1 ? 'line' : ak === 2 ? 'blue' : 'faint';
    for (; x < W + period * 2; x += period) {
      if (style === 'solid') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(unit, x, y);
        const nx = x + uw + 65, ny = y - size * 0.36;
        circle(ctx, nx, ny, 16 + 6 * pulse(lt, BEAT, 8), '#38BDF8');
        circle(ctx, nx, ny, 6, '#FFFFFF');
      } else if (style === 'blue') {
        ctx.fillStyle = '#2563EB';
        ctx.fillText(unit, x, y);
      } else {
        ctx.strokeStyle = rgba('#FFFFFF', style === 'line' ? 0.55 : ak === 3 ? 0.28 : 0.14);
        ctx.lineWidth = 2;
        ctx.strokeText(unit, x, y);
      }
    }
  }
  ctx.restore();
  // shockwave
  const sp = A(lt, 0, 0.55);
  if (sp < 1) ring(ctx, W / 2, H / 2, 1600 * sp, 40 * (1 - sp) + 1, '#BFDBFE', 0.8 * (1 - sp));
  if (suck > 0) {
    glow(ctx, W / 2, H / 2, 260, '#93C5FD', 0.9 * suck);
    circle(ctx, W / 2, H / 2, 10 * suck, '#FFFFFF');
  }
}

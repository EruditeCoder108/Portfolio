/* Act III — pull back to a wall of live tiles, engineering telemetry, end card. */

/* ---------- beats 22–23: the wall ---------- */
const WALL = { s0: 0.3, gap: 34 };

function sWall(ctx, t) {
  const lt = t - T.wall;
  fillBg(ctx, PAL.ink);
  const TW = W * WALL.s0, TH_ = H * WALL.s0, G = WALL.gap;
  const zp = Ez.inOutExpo(inv(0.02, 0.46, lt));
  const Z = Math.exp(lerp(Math.log(1 / WALL.s0), Math.log(0.92), zp)) * (1 - 0.08 * A(lt, 0.46, BEAT * 2, Ez.inCubic));
  const th = -8 * D2R * zp;
  const run = A(lt, 0.52, BEAT * 2, Ez.inExpo);
  const fx = 90 * Math.max(0, lt - 0.3) + 3200 * run, fy = 30 * Math.max(0, lt - 0.3) + 900 * run;
  glow(ctx, W / 2, H / 2, 1200, '#1D4ED8', 0.25 * zp);
  const rad = 22 * A(lt, 0.02, 0.3);
  const labA = A(lt, 0.3, 0.46);
  for (let r = -4; r <= 4; r++) {
    for (let c = -6; c <= 8; c++) {
      const wx = c * (TW + G), wy = r * (TH_ + G);
      // world -> screen of tile centre, for culling
      const dx = (wx - fx) * Z, dy = (wy - fy) * Z;
      const sx = W / 2 + dx * Math.cos(th) - dy * Math.sin(th), sy = H / 2 + dx * Math.sin(th) + dy * Math.cos(th);
      const reach = (Math.hypot(TW, TH_) / 2) * Z;
      if (sx < -reach || sx > W + reach || sy < -reach || sy > H + reach) continue;
      const idx = (((c + r * 3) % 8) + 8) % 8;
      const pr = PROJECTS[idx];
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(th);
      ctx.scale(Z, Z);
      ctx.translate(-fx, -fy);
      ctx.translate(wx - TW / 2, wy - TH_ / 2);
      ctx.beginPath();
      ctx.roundRect(0, 0, TW, TH_, rad);
      ctx.clip();
      ctx.scale(WALL.s0, WALL.s0);
      const tl = idx === 0 ? BEAT * 2 + lt : 0.62 + lt * 0.55 + hash(c * 3 + r) * 0.1;
      pr.fn(ctx, tl);
      ctx.restore();
      if (labA > 0 && !(c === 0 && r === 0 && lt < 0.3)) {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(th);
        ctx.scale(Z, Z);
        ctx.translate(-fx, -fy);
        ctx.globalAlpha = labA;
        setFont(ctx, 700, 13, MONO);
        const s = `${String(idx === 0 ? 7 : idx === 7 ? 8 : idx).padStart(2, '0')}  ${pr.name}`;
        const w = ctx.measureText(s).width + 20;
        pill(ctx, wx - TW / 2 + 14, wy + TH_ / 2 - 40, w, 26, 'rgba(5,7,15,0.72)', 'rgba(255,255,255,0.25)');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(s, wx - TW / 2 + 24, wy + TH_ / 2 - 22);
        ctx.restore();
      }
    }
  }
  const ov = A(lt, 0.36, 0.5) * (1 - A(lt, 0.78, 0.9));
  if (ov > 0) {
    ctx.save();
    ctx.globalAlpha = ov;
    const g = ctx.createLinearGradient(0, H / 2 - 120, 0, H / 2 + 120);
    g.addColorStop(0, 'rgba(5,7,15,0)'); g.addColorStop(0.5, 'rgba(5,7,15,0.78)'); g.addColorStop(1, 'rgba(5,7,15,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, H / 2 - 120, W, 240);
    setFont(ctx, 800, 96, DISP);
    ctx.fillStyle = '#FFFFFF';
    riseText(ctx, 'SEVEN SYSTEMS. ONE ENGINEER.', W / 2, H / 2 + 34, 96, { t: lt - 0.36, stagger: 0.008, dur: 0.3, align: 'center', track: -1 });
    ctx.restore();
  }
}

/* ---------- beats 24–27: SYS_CORE telemetry ---------- */
const STATS = [
  { v: 340, pre: '+', suf: '%', digits: 3, label: 'THROUGHPUT · BLE -> WI-FI DIRECT', tag: 'HYPHA', c: '#2DD4BF' },
  { v: 90, pre: '', suf: '+', digits: 2, label: 'UI COMPONENTS · ONE SYSTEM', tag: 'UIQRAFT', c: '#38BDF8' },
  { v: 0, from: 99, pre: '', suf: '', digits: 2, label: 'RACE CONDITIONS · 15s LEASE', tag: 'LUMIUM', c: '#34D399' },
  { v: 100, pre: '', suf: '%', digits: 3, label: 'ON-DEVICE INFERENCE', tag: 'XENON', c: '#C084FC' },
];

function statViz(ctx, k, x, y, w, h, lt, c) {
  const vx = x + w - 262, vy = y + 60, vw = 214, vh = h - 120;
  if (k === 0) {
    const g = A(lt, 0.08, 0.5, Ez.outCubic);
    setFont(ctx, 600, 13, MONO);
    ctx.fillStyle = rgba('#FFFFFF', 0.5);
    ctx.fillText('BEFORE', vx, vy + 40); ctx.fillText('AFTER', vx, vy + 120);
    pill(ctx, vx, vy + 54, vw * 0.22 * g, 18, rgba('#FFFFFF', 0.3));
    pill(ctx, vx, vy + 134, Math.max(18, vw * g), 18, c);
  } else if (k === 1) {
    for (let i = 0; i < 90; i++) {
      const on = A(lt, 0.05 + i * 0.004, 0.12 + i * 0.004);
      if (on <= 0) continue;
      const gx = vx + (i % 10) * 21, gy = vy + Math.floor(i / 10) * 21;
      ctx.fillStyle = rgba(i % 7 === 0 ? '#FFFFFF' : c, 0.3 + 0.7 * on);
      ctx.fillRect(gx, gy, 15 * on, 15 * on);
    }
  } else if (k === 2) {
    ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const u = i / 120, xx = vx + u * vw;
      const ph = (u * 3 + lt * 2.2) % 1;
      const beat = ph < 0.08 ? Math.sin((ph / 0.08) * Math.PI) * -1 : ph < 0.14 ? Math.sin(((ph - 0.08) / 0.06) * Math.PI) * 0.35 : 0;
      const yy = vy + vh / 2 + beat * vh * 0.42;
      if (u > A(lt, 0.02, 0.4)) break;
      if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
    }
    ctx.stroke();
    setFont(ctx, 600, 13, MONO); ctx.fillStyle = rgba('#FFFFFF', 0.5);
    ctx.fillText('heartbeat · lease renewed', vx, vy + vh + 10);
  } else {
    const p = A(lt, 0.05, 0.45, Ez.outCubic);
    const cx = vx + vw / 2, cy = vy + vh / 2, R = Math.min(vw, vh) / 2 - 12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = rgba('#FFFFFF', 0.1); ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = c;
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke();
    setFont(ctx, 700, 14, MONO); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center';
    ctx.fillText('LOCAL', cx, cy + 5); ctx.textAlign = 'left';
  }
}

function sStats(ctx, t) {
  const lt = t - T.stats;
  fillBg(ctx, PAL.ink);
  glow(ctx, W / 2, H / 2, 1200, '#1E3A8A', 0.25);
  dotGrid(ctx, 48, 0.04, '#FFFFFF', 0, -lt * 30);
  const col = A(lt, BEAT * 3.45, BEAT * 4, Ez.inExpo);
  ctx.save();
  about(ctx, W / 2, H / 2, lerp(1, 0.02, col), col * 0.6);
  // header
  setFont(ctx, 700, 20, MONO);
  ctx.fillStyle = PAL.sky;
  typeText(ctx, 'SYS_CORE // SAMBHAV_JAIN', 120, 124, lt, 0.0, 90);
  setFont(ctx, 500, 16, MONO);
  ctx.fillStyle = rgba('#94A3B8', A(lt, 0.2, 0.4));
  ctx.fillText('ENGINEERING CONSOLE v2026', 470, 123);
  const op = A(lt, 0.1, 0.3);
  pill(ctx, W - 120 - 130, 96, 130, 38, rgba('#10B981', 0.14 * op), rgba('#34D399', 0.6 * op));
  circle(ctx, W - 120 - 106, 115, 6 * op * (0.7 + 0.3 * Math.sin(lt * 18)), '#34D399');
  setFont(ctx, 700, 16, MONO);
  ctx.fillStyle = rgba('#A7F3D0', op);
  ctx.fillText('ONLINE', W - 120 - 90, 121);
  ctx.fillStyle = rgba('#FFFFFF', 0.14);
  ctx.fillRect(120, 150, (W - 240) * A(lt, 0, 0.4, Ez.inOutExpo), 1);
  // panels
  const pw = (W - 240 - 24) / 2, ph = 330;
  STATS.forEach((s, k) => {
    const lk = lt - k * BEAT;
    if (lk < 0) return;
    const x = 120 + (k % 2) * (pw + 24), y = 180 + Math.floor(k / 2) * (ph + 24 + 40);
    const e = A(lk, 0, 0.3);
    ctx.save();
    about(ctx, x + pw / 2, y + ph / 2, lerp(0.94, 1, e));
    ctx.fillStyle = rgba(s.c, 0.06 * e);
    ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 20); ctx.fill();
    const per = 2 * (pw + ph);
    ctx.strokeStyle = rgba(s.c, 0.55);
    ctx.lineWidth = 2;
    ctx.setLineDash([per * A(lk, 0, 0.35, Ez.outCubic), per]);
    ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 20); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = e;
    setFont(ctx, 700, 15, MONO);
    ctx.fillStyle = s.c;
    ctx.fillText(`0${k + 1} · ${s.tag}`, x + 44, y + 54);
    const vv = s.from !== undefined ? lerp(s.from, s.v, A(lk, 0.02, 0.4, Ez.outCubic)) : s.v * A(lk, 0.02, 0.4, Ez.outCubic);
    setFont(ctx, 800, 150, DISP);
    ctx.fillStyle = '#FFFFFF';
    odometer(ctx, vv, x + 36, y + 222, 150, { digits: s.digits, prefix: s.pre, suffix: s.suf, digitW: 88, noLeadingZero: true });
    setFont(ctx, 500, 19, MONO);
    ctx.fillStyle = PAL.slate;
    ctx.fillText(s.label, x + 44, y + 288);
    statViz(ctx, k, x, y, pw, ph, lk, s.c);
    ctx.restore();
  });
  // oscilloscope between rows
  const oy = 180 + ph + 32;
  ctx.strokeStyle = rgba('#7DD3FC', 0.85);
  ctx.lineWidth = 2;
  ctx.beginPath();
  const op2 = A(lt, 0.05, 0.5, Ez.inOutCubic);
  let amp = 6;
  for (let b = 0; b < 4; b++) amp += 22 * pulse(lt, b * BEAT, 7);
  for (let i = 0; i <= 400; i++) {
    const u = i / 400;
    if (u > op2) break;
    const x = 120 + u * (W - 240);
    const y = oy + amp * Math.sin(u * 60 + lt * 22) * Math.sin(u * 7 + lt * 3) + 3 * Math.sin(u * 190 - lt * 40);
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.stroke();
  // footer telemetry
  setFont(ctx, 500, 18, MONO);
  ctx.fillStyle = PAL.slate;
  typeText(ctx, '59.8 FPS  •  842 NODES  •  7.4ms FRAME  •  0 RUNTIME JS DEPS  •  AUDIO: ARMED', 120, 1000, lt, 0.25, 110);
  ctx.restore();
  if (col > 0) glow(ctx, W / 2, H / 2, 500, '#BFDBFE', col);
}

/* ---------- beats 28–32: end card ---------- */
function sEnd(ctx, t) {
  const lt = t - T.end;
  fillBg(ctx, '#060A16');
  glow(ctx, W / 2, H / 2, 1200, '#1D4ED8', 0.3);
  glow(ctx, W * 0.78, H * 0.3, 700, '#6D28D9', 0.14);
  dotGrid(ctx, 48, 0.05, '#FFFFFF', 0, -lt * 12);
  // dust
  for (let i = 0; i < 90; i++) {
    const x = hash(i * 1.7) * W + vnoise(lt * 0.6 + i, i) * 30;
    const y = ((hash(i * 2.9) * H - lt * (18 + hash(i) * 40)) % H + H) % H;
    const a = (0.12 + 0.4 * hash(i * 5.1)) * (0.6 + 0.4 * Math.sin(lt * 3 + i)) * A(lt, 0.1, 0.6);
    ctx.fillStyle = rgba('#BFDBFE', a);
    const r = 1 + hash(i * 3.3) * 1.8;
    ctx.fillRect(x, y, r, r);
  }
  const sw = A(lt, 0, 0.7);
  if (sw < 1) ring(ctx, W / 2, H / 2, 1500 * sw, 30 * (1 - sw) + 1, '#BFDBFE', 0.7 * (1 - sw));
  ctx.save();
  about(ctx, W / 2, H / 2, 1 + 0.035 * Ez.inOutSine(inv(0, BAR, lt)));
  const name = 'SAMBHAV JAIN', size = 148;
  setFont(ctx, 800, size, DISP);
  const track = lerp(26, -2, A(lt, 0.08, 1.0));
  const nw = charLayout(ctx, name, -2).w;
  const R = 84, markW = R * 2.9, gap = 72;
  const total = markW + gap + nw;
  const x0 = W / 2 - total / 2;
  const mx = x0 + markW / 2, my = H / 2 - 36;
  const nx = x0 + markW + gap, base = H / 2 + 16;
  // mark
  const mp = spring(lt - 0.02, 1.6, 6);
  ctx.save();
  about(ctx, mx, my, 0.5 + 0.5 * mp, -Math.PI * (1 - A(lt, 0, 0.7)));
  Mark.draw(ctx, mx, my, R, A(lt, 0.02, 0.5), '#F8FAFC', markGradient(ctx, mx, my, R));
  ctx.restore();
  // name
  const ng = ctx.createLinearGradient(0, base - size * 0.72, 0, base);
  ng.addColorStop(0, '#FFFFFF'); ng.addColorStop(1, '#C7D7FE');
  ctx.fillStyle = ng;
  riseText(ctx, name, nx, base, size, { t: lt - 0.08, stagger: 0.028, dur: 0.55, track });
  // light sweep across the name
  const sp = inv(0.95, 1.45, lt);
  if (sp > 0 && sp < 1) {
    const sx = lerp(nx - 300, nx + nw + 300, Ez.inOutCubic(sp));
    const sg = ctx.createLinearGradient(sx - 160, 0, sx + 160, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.95)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.globalCompositeOperation = 'lighter';
    riseText(ctx, name, nx, base, size, { t: 9, track });
    ctx.globalCompositeOperation = 'source-over';
  }
  // role
  setFont(ctx, 500, 32, SANS);
  ctx.fillStyle = PAL.slate300;
  ctx.save();
  ctx.beginPath(); ctx.rect(nx, base + 20, nw * A(lt, 0.35, 0.85), 60); ctx.clip();
  ctx.fillText('Systems · Distributed Software · AI Engineer', nx + 4, base + 62);
  ctx.restore();
  // divider
  const dp = A(lt, 0.4, 0.95, Ez.inOutExpo);
  ctx.fillStyle = rgba('#38BDF8', 0.9);
  ctx.fillRect(nx + 4, base + 96, nw * dp, 3);
  // url + handle
  setFont(ctx, 600, 28, MONO);
  ctx.fillStyle = '#FFFFFF';
  const ux = typeText(ctx, 'sambhavjain.tech', nx + 4, base + 150, lt, 0.62, 38);
  setFont(ctx, 500, 24, MONO);
  ctx.fillStyle = PAL.slate;
  typeText(ctx, '·  @EruditeCoder108', ux + 22, base + 150, lt, 1.08, 40, { caret: true, caretSize: 26 });
  ctx.restore();
  // mark pulse ring on the last downbeat
  const lp = A(lt, BEAT * 2, BEAT * 2 + 0.7);
  if (lt > BEAT * 2 && lp < 1) ring(ctx, mx, my, 120 + 260 * lp, 2, '#93C5FD', 0.5 * (1 - lp));
}

/* ---------- global HUD: crop marks + timecode (difference-blended so it reads on any scene) ---------- */
function drawHUD(ctx, t) {
  if (t < T.imagine || t >= T.end) return;
  const a = 0.55;
  ctx.globalCompositeOperation = 'difference';
  ctx.strokeStyle = `rgba(255,255,255,${a})`;
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.lineWidth = 2;
  const m = 36, L = 26;
  ctx.beginPath();
  ctx.moveTo(m, m + L); ctx.lineTo(m, m); ctx.lineTo(m + L, m);
  ctx.moveTo(W - m - L, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + L);
  ctx.moveTo(m, H - m - L); ctx.lineTo(m, H - m); ctx.lineTo(m + L, H - m);
  ctx.moveTo(W - m - L, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - L);
  ctx.stroke();
  setFont(ctx, 500, 14, MONO);
  ctx.fillText('SJ / REEL 2026', m + 40, m + 18);
  const f = Math.floor(t * FPS);
  const tc = `00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`;
  ctx.textAlign = 'right';
  ctx.fillText(`${tc}  ·  ${BPM} BPM`, W - m - 40, H - m - 6);
  ctx.textAlign = 'left';
  ctx.globalCompositeOperation = 'source-over';
}

const CLOSE_SCENES = [
  [T.wall, T.stats, sWall],
  [T.stats, T.end, sStats],
  [T.end, DUR + 1, sEnd],
];

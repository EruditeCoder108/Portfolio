/* Act III — the wall of work (2D → 3D fly-over), particle marks (particles.js), end card. */

/* ---------- beats 28–32: the wall ---------- */
const WALL = { s0: 0.3, gap: 34, tw: 576, th: 324 };
const TILE_CANVAS = PROJECTS.map(() => {
  const c = document.createElement('canvas');
  c.width = WALL.tw; c.height = WALL.th;
  return c;
});

function tileTime(k, lt) { return k === 0 ? BEAT * 4 + lt : (PROJECTS[k].tile ?? 0.62) + lt * 0.4; }

function tileLabel(ctx, pr, x, y) {
  setFont(ctx, 700, 13, MONO);
  const s = `${String(pr.idx).padStart(2, '0')}  ${pr.name}`;
  const w = ctx.measureText(s).width + 20;
  pill(ctx, x + 14, y + WALL.th - 40, w, 26, 'rgba(5,7,15,0.72)', 'rgba(255,255,255,0.25)');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(s, x + 24, y + WALL.th - 22);
}

/** render every project once into its tile canvas (used once the wall tilts into 3D) */
function renderTiles(lt, labelA) {
  PROJECTS.forEach((pr, k) => {
    const g = TILE_CANVAS[k].getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, WALL.tw, WALL.th);
    g.save();
    g.beginPath(); g.roundRect(0, 0, WALL.tw, WALL.th, 22); g.clip();
    g.save();
    g.scale(WALL.s0, WALL.s0);
    pr.fn(g, tileTime(k, lt));
    g.restore();
    g.globalAlpha = labelA;
    tileLabel(g, pr, 0, 0);
    g.restore();
  });
}

function sWall(ctx, t) {
  const lt = t - T.wall;
  fillBg(ctx, PAL.ink);
  const TW = WALL.tw, TH_ = WALL.th, G = WALL.gap;
  const zp = Ez.inOutExpo(inv(0.02, 0.44, lt));
  const Z = Math.exp(lerp(Math.log(1 / WALL.s0), Math.log(0.92), zp)) * lerp(1, 1.18, Ez.inOutCubic(inv(0.44, 1.3, lt)));
  const tilt = Ez.inOutCubic(inv(0.44, 1.15, lt));
  const pitch = 1.02 * tilt;
  const roll = -7 * D2R * zp + 3 * D2R * tilt;
  const fly = Ez.inCubic(inv(0.6, BEAT * 4, lt));
  const fx = 60 * Math.max(0, lt - 0.3) + 500 * fly, fy = -40 * Math.max(0, lt - 0.3) - 5200 * fly;
  const labA = A(lt, 0.26, 0.44);
  glow(ctx, W / 2, H * 0.35, 1400, '#1D4ED8', 0.28 * zp);
  const D = 1500;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(roll);
  ctx.translate(-W / 2, -H / 2);
  if (tilt <= 0) {
    // flat: draw every tile as live vectors (crisp while the camera is still close)
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(Z, Z);
    ctx.translate(-fx, -fy);
    for (let r = -4; r <= 4; r++)
      for (let c = -6; c <= 7; c++) {
        const wx = c * (TW + G) - TW / 2, wy = r * (TH_ + G) - TH_ / 2;
        const sx = W / 2 + (wx + TW / 2 - fx) * Z, sy = H / 2 + (wy + TH_ / 2 - fy) * Z;
        const reach = (Math.hypot(TW, TH_) / 2) * Z;
        if (sx < -reach || sx > W + reach || sy < -reach || sy > H + reach) continue;
        const k = (((c + r * 3) % 8) + 8) % 8;
        ctx.save();
        ctx.translate(wx, wy);
        ctx.beginPath(); ctx.roundRect(0, 0, TW, TH_, 22 * A(lt, 0.02, 0.3)); ctx.clip();
        ctx.save();
        ctx.scale(WALL.s0, WALL.s0);
        PROJECTS[k].fn(ctx, tileTime(k, lt));
        ctx.restore();
        if (labA > 0 && !(c === 0 && r === 0 && lt < 0.3)) { ctx.globalAlpha = labA; tileLabel(ctx, PROJECTS[k], 0, 0); ctx.globalAlpha = 1; }
        ctx.restore();
      }
    ctx.restore();
  } else {
    // 3D: tiles become textured quads on a receding floor, drawn in horizontal perspective strips
    renderTiles(lt, labA);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const proj = v => {
      const dv = (v - fy) * Z, zd = -dv * sp;
      const f = D / (D + zd);
      return { y: H / 2 + dv * cp * f, f, zd };
    };
    const rows = [];
    for (let r = -26; r <= 5; r++) rows.push(r);
    rows.sort((a, b) => a - b); // far rows (smaller r) first
    for (const r of rows) {
      const v0 = r * (TH_ + G) - TH_ / 2, v1 = v0 + TH_;
      const top = proj(v0), bot = proj(v1);
      if (D + top.zd < 60 || bot.y < -40 || top.y > H + 40) continue;
      const fog = clamp(1 - (top.zd - 400) / 3400);
      if (fog <= 0.02) continue;
      for (let c = -10; c <= 11; c++) {
        const u0 = c * (TW + G) - TW / 2;
        const k = (((c + r * 3) % 8) + 8) % 8;
        const K = 12;
        const xl = W / 2 + (u0 - fx) * Z * bot.f, xr = W / 2 + (u0 + TW - fx) * Z * bot.f;
        if (xr < -200 || xl > W + 200) continue;
        ctx.globalAlpha = fog;
        for (let j = 0; j < K; j++) {
          const a = proj(v0 + (TH_ * j) / K), b = proj(v0 + (TH_ * (j + 1)) / K);
          const fm = (a.f + b.f) / 2;
          const x0 = W / 2 + (u0 - fx) * Z * fm, x1 = W / 2 + (u0 + TW - fx) * Z * fm;
          ctx.drawImage(TILE_CANVAS[k], 0, (TH_ * j) / K, TW, TH_ / K, x0, a.y, x1 - x0, b.y - a.y + 0.6);
        }
      }
    }
    ctx.globalAlpha = 1;
    // horizon haze
    const hz = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    hz.addColorStop(0, rgba('#05070F', 0.95 * tilt)); hz.addColorStop(1, 'rgba(5,7,15,0)');
    ctx.fillStyle = hz;
    ctx.fillRect(-W, -H, W * 3, H * 0.55 + H);
  }
  ctx.restore();
  // title across the fly-over
  const ov = A(lt, 0.5, 0.72) * (1 - A(lt, 1.35, 1.55));
  if (ov > 0) {
    ctx.save();
    ctx.globalAlpha = ov;
    const g = ctx.createLinearGradient(0, H / 2 - 130, 0, H / 2 + 130);
    g.addColorStop(0, 'rgba(5,7,15,0)'); g.addColorStop(0.5, 'rgba(5,7,15,0.7)'); g.addColorStop(1, 'rgba(5,7,15,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, H / 2 - 130, W, 260);
    setFont(ctx, 800, 100, DISP);
    ctx.fillStyle = '#FFFFFF';
    riseText(ctx, 'EIGHT SYSTEMS. ONE ENGINEER.', W / 2, H / 2 + 36, 100, { t: lt - 0.5, stagger: 0.008, dur: 0.32, align: 'center', track: -1 });
    ctx.restore();
  }
}

/* ---------- beats 36–44: the end card on reeded glass ---------- */
const END = { y: 560, size: 150, name: 'SAMBHAV JAIN' };
const END_MARKS = ['staysecure', 'unravel', 'hypha', 'erudite', 'lumium', 'pagevelle', 'xenon', 'uiqraft'];

function endNameShape() {
  // the name's glyphs as dot targets, laid out exactly where the crisp type will sit
  PSYS.shapes.name = sampleShape(W, H, (g) => {
    setFont(g, 800, END.size, DISP);
    g.textAlign = 'center';
    g.letterSpacing = '-2px';
    g.fillStyle = '#000';
    g.fillText(END.name, W / 2, END.y);
  }, (r, g_, b, a) => a > 128, 0);
}

function orbitTile(k, lt) {
  const th = (k / END_MARKS.length) * TAU + 0.35 + lt * 0.2;
  const s = Math.sin(th);
  return {
    x: W / 2 + 860 * Math.cos(th),
    y: END.y - 60 - (s > 0 ? 300 : 400) * s + Math.sin(lt * 1.7 + k * 1.3) * 9,
    scale: 1 - 0.24 * s,
    depth: s,
    rot: Math.sin(lt * 1.2 + k) * 0.05,
  };
}

function glassTile(ctx, x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(30,58,138,0.22)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  ctx.beginPath(); ctx.roundRect(x - size / 2, y - size / 2, size, size, size * 0.26);
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x - size / 2, y - size / 2, size, size, size * 0.26); ctx.stroke();
  ctx.restore();
}

function drawOrbit(ctx, lt, front, appear) {
  END_MARKS.forEach((key, k) => {
    const o = orbitTile(k, lt);
    if ((o.depth <= 0) !== front) return;
    const a = appear * clamp(1.15 - 0.45 * o.depth);
    if (a <= 0) return;
    const size = 128 * o.scale * (0.85 + 0.15 * appear);
    ctx.save();
    about(ctx, o.x, o.y, 1, o.rot);
    glassTile(ctx, o.x, o.y, size, a);
    ctx.globalAlpha = a;
    MARKS[key](ctx, o.x, o.y, size * 0.7, lt);
    ctx.restore();
  });
}

function sEnd(ctx, t) {
  const lt = t - T.end;
  glassBg(ctx, t, lt + BEAT * 4);
  ctx.save();
  about(ctx, W / 2, H / 2, 1 + 0.03 * Ez.inOutSine(inv(0, DUR - T.end, lt)));
  const tileA = A(lt, 0.3, 0.62);
  drawOrbit(ctx, lt, false, tileA);

  // dots hand over from the last particle mark to the name and the orbiting tiles
  if (lt < 0.9 && PSYS.shapes.name) {
    const { x, y, s, a } = PSYS;
    const nm = PSYS.shapes.name.pos;
    const cols = new Array(PN);
    for (let i = 0; i < PN; i++) {
      const [ax, ay, af] = markDot(i, FINALE.length - 1, BEAT * 4 + lt);
      const u = Ez.inOutCubic(clamp((lt - 0.08 * PSYS.seed[i]) / 0.42));
      let bx, by, fade;
      if (i % 3) {
        bx = nm[i * 3] + W / 2; by = nm[i * 3 + 1] + H / 2;
        fade = 1 - A(lt, 0.42, 0.7);
      } else {
        const o = orbitTile(Math.floor(i / 3) % END_MARKS.length, lt);
        bx = o.x + (PSYS.seed2[i] - 0.5) * 70; by = o.y + (PSYS.seed[i] - 0.5) * 70;
        fade = 1 - A(lt, 0.3, 0.55);
      }
      const bow = Math.sin(Math.PI * u) * 80 * (PSYS.seed2[i] > 0.5 ? 1 : -1);
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
      x[i] = lerp(ax, bx, u) - (dy / len) * bow;
      y[i] = lerp(ay, by, u) + (dx / len) * bow;
      s[i] = lerp(3.4 * af, 3.2, u);
      a[i] = 0.92 * fade;
      PSYS.b[i] = Math.min(18, Math.abs(af - 1) * 26) * (1 - u);
      const ca = PSYS.shapes.pagevelle.col[i];
      cols[i] = `rgb(${Math.round(lerp(ca[0], 15, u))},${Math.round(lerp(ca[1], 23, u))},${Math.round(lerp(ca[2], 42, u))})`;
    }
    drawDots(ctx, PN, i => cols[i]);
  }

  // name, role, contact
  const na = A(lt, 0.38, 0.7);
  setFont(ctx, 800, END.size, DISP);
  const ng = ctx.createLinearGradient(0, END.y - END.size * 0.72, 0, END.y);
  ng.addColorStop(0, '#0B1220'); ng.addColorStop(1, '#1E2B4D');
  ctx.save();
  ctx.globalAlpha = na;
  ctx.fillStyle = ng;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '-2px';
  ctx.fillText(END.name, W / 2, END.y);
  // a cool sheen passing over the letters
  const sp = inv(1.4, 2.1, lt);
  if (sp > 0 && sp < 1) {
    const nw = ctx.measureText(END.name).width;
    const sx = lerp(W / 2 - nw / 2 - 300, W / 2 + nw / 2 + 300, Ez.inOutCubic(sp));
    const sg = ctx.createLinearGradient(sx - 150, 0, sx + 150, 0);
    sg.addColorStop(0, 'rgba(59,130,246,0)'); sg.addColorStop(0.5, 'rgba(96,165,250,0.95)'); sg.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = sg;
    ctx.fillText(END.name, W / 2, END.y);
  }
  ctx.restore();
  ctx.letterSpacing = '0px';

  setFont(ctx, 500, 32, SANS);
  const role = 'Systems · Distributed Software · AI Engineer';
  const rw = ctx.measureText(role).width;
  ctx.save();
  ctx.beginPath(); ctx.rect(W / 2 - rw / 2 - 10, END.y + 20, (rw + 20) * A(lt, 0.62, 1.05), 60); ctx.clip();
  ctx.fillStyle = '#334155';
  ctx.fillText(role, W / 2 - rw / 2, END.y + 66);
  ctx.restore();
  const dp = A(lt, 0.7, 1.2, Ez.inOutExpo);
  ctx.fillStyle = rgba('#2563EB', 0.85);
  ctx.fillRect(W / 2 - 330 * dp, END.y + 100, 660 * dp, 3);
  setFont(ctx, 600, 28, MONO);
  const url = 'sambhavjain.tech', handle = '·  @EruditeCoder108';
  const uw = ctx.measureText(url).width;
  setFont(ctx, 500, 24, MONO);
  const hw = ctx.measureText(handle).width;
  const ux = W / 2 - (uw + 22 + hw) / 2;
  setFont(ctx, 600, 28, MONO);
  ctx.fillStyle = '#0B1220';
  typeText(ctx, url, ux, END.y + 156, lt, 0.85, 36);
  setFont(ctx, 500, 24, MONO);
  ctx.fillStyle = '#475569';
  typeText(ctx, handle, ux + uw + 22, END.y + 156, lt, 1.3, 40, { caret: true, caretSize: 26 });

  drawOrbit(ctx, lt, true, tileA);
  ctx.restore();
}

/* ---------- global HUD: crop marks + timecode (difference-blended so it reads on any scene) ---------- */
function drawHUD(ctx, t) {
  if (t < T.imagine || t >= T.finale) return;
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
  [T.wall, T.finale, sWall],
  [T.finale, T.end, sFinale],
  [T.end, DUR + 1, sEnd],
];

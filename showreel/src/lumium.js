/* 04 LUMIUM — "the element of focus". Four beats:
   A  lights out; the desk lamp clicks on and its beam finds the wordmark
   B  the beam widens into the app itself: Focus Guardian catches a dip, Quick Answer answers in one tap
   C  pull back to everything around it: arena ranks + XP, study rooms, the Lumio AI coach, progress,
      ambient sound + live wallpapers, and the mobile app with the desk-clock hardware */

const LUM = {
  logo: { x: 315, y: 200, s: 1.5 },          // where the 860×360 logo crop sits on screen
  bulb: [567, 401], ring: [550.5, 428, 124.5],
  beamDir: 52 * D2R,
  cardBg: 'rgba(18,13,10,0.66)', cardLine: 'rgba(255,226,196,0.16)',
  amber: '#F59E0B', cyan: '#22D3EE',
};

function lumCard(ctx, x, y, w, h, p, rot = 0) {
  ctx.save();
  about(ctx, x + w / 2, y + h / 2, 0.86 + 0.14 * p, rot * (1 - p));
  ctx.translate(0, (1 - p) * 60);
  ctx.globalAlpha = clamp(p * 1.4);
  ctx.fillStyle = LUM.cardBg;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.fill();
  ctx.strokeStyle = LUM.cardLine; ctx.lineWidth = 1.5; ctx.stroke();
  return () => ctx.restore();
}

function lumLabel(ctx, s, x, y, c = '#FCD9B6') {
  setFont(ctx, 700, 13, MONO);
  ctx.letterSpacing = '3px';
  ctx.fillStyle = c;
  ctx.fillText(s, x, y);
  ctx.letterSpacing = '0px';
}

/** smooth Catmull-Rom polyline through points */
function spline(pts, seg = 12) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/* ---------- arena rank emblems ---------- */
const RANKS = [
  { name: 'PANDA', c: ['#CBD5E1', '#475569'] },
  { name: 'FINCH', c: ['#FCD34D', '#D97706'] },
  { name: 'PHOENIX', c: ['#FDA4AF', '#EA580C'] },
  { name: 'OWL', c: ['#C4B5FD', '#4338CA'] },
];

function rankGlyph(ctx, kind, x, y, s) {
  ctx.fillStyle = '#FFFFFF';
  const dark = 'rgba(15,23,42,0.85)';
  const C = (cx, cy, r, f = '#FFFFFF') => { ctx.fillStyle = f; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); };
  const E = (cx, cy, rx, ry, rot, f) => { ctx.fillStyle = f; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, 0, TAU); ctx.fill(); };
  if (kind === 0) { // panda
    C(x - s * 0.3, y - s * 0.3, s * 0.15, dark); C(x + s * 0.3, y - s * 0.3, s * 0.15, dark);
    C(x, y, s * 0.37);
    E(x - s * 0.14, y - s * 0.02, s * 0.08, s * 0.11, -0.5, dark); E(x + s * 0.14, y - s * 0.02, s * 0.08, s * 0.11, 0.5, dark);
    C(x - s * 0.13, y - s * 0.03, s * 0.03); C(x + s * 0.13, y - s * 0.03, s * 0.03);
    E(x, y + s * 0.14, s * 0.06, s * 0.04, 0, dark);
  } else if (kind === 1) { // finch
    E(x - s * 0.05, y + s * 0.08, s * 0.3, s * 0.2, -0.25, '#FFFFFF');
    C(x + s * 0.19, y - s * 0.12, s * 0.15);
    ctx.beginPath(); ctx.moveTo(x + s * 0.31, y - s * 0.16); ctx.lineTo(x + s * 0.46, y - s * 0.1); ctx.lineTo(x + s * 0.31, y - s * 0.05); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - s * 0.3, y + s * 0.1); ctx.lineTo(x - s * 0.5, y + s * 0.02); ctx.lineTo(x - s * 0.44, y + s * 0.2); ctx.fill();
    C(x + s * 0.22, y - s * 0.14, s * 0.035, dark);
  } else if (kind === 2) { // phoenix: rising flame-wings
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.42);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.1, x - s * 0.42, y - s * 0.3, x - s * 0.12, y - s * 0.44);
    ctx.bezierCurveTo(x - s * 0.18, y - s * 0.18, x - s * 0.04, y - s * 0.06, x, y - s * 0.02);
    ctx.bezierCurveTo(x + s * 0.04, y - s * 0.06, x + s * 0.18, y - s * 0.18, x + s * 0.12, y - s * 0.44);
    ctx.bezierCurveTo(x + s * 0.42, y - s * 0.3, x + s * 0.5, y + s * 0.1, x, y + s * 0.42);
    ctx.fill();
    C(x, y + s * 0.12, s * 0.07, dark);
  } else { // owl
    ctx.beginPath(); ctx.moveTo(x - s * 0.32, y - s * 0.34); ctx.lineTo(x - s * 0.18, y - s * 0.2); ctx.lineTo(x - s * 0.34, y - s * 0.12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + s * 0.32, y - s * 0.34); ctx.lineTo(x + s * 0.18, y - s * 0.2); ctx.lineTo(x + s * 0.34, y - s * 0.12); ctx.fill();
    E(x, y + s * 0.04, s * 0.34, s * 0.38, 0, '#FFFFFF');
    C(x - s * 0.14, y - s * 0.06, s * 0.12, dark); C(x + s * 0.14, y - s * 0.06, s * 0.12, dark);
    C(x - s * 0.14, y - s * 0.06, s * 0.05); C(x + s * 0.14, y - s * 0.06, s * 0.05);
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath(); ctx.moveTo(x - s * 0.05, y + s * 0.06); ctx.lineTo(x + s * 0.05, y + s * 0.06); ctx.lineTo(x, y + s * 0.16); ctx.fill();
  }
}

function hexBadge(ctx, x, y, r, cols, lit) {
  const g = ctx.createLinearGradient(x, y - r, x, y + r);
  g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]);
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 3; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.closePath();
  ctx.globalAlpha *= lit ? 1 : 0.38;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.stroke();
}

/* ---------- small device drawings ---------- */
function deskClock(ctx, x, y, w, h, lt) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#2A2420'); g.addColorStop(1, '#141110');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(255,230,200,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#05070A';
  ctx.beginPath(); ctx.roundRect(x + 10, y + 10, w - 20, h - 26, 10); ctx.fill();
  // dot-matrix digits on the clock face
  setFont(ctx, 800, 30, MONO);
  ctx.fillStyle = '#67E8F9';
  ctx.textAlign = 'center';
  const sec = 59 - (Math.floor(lt * 4) % 60);
  ctx.fillText(`24:${String(sec).padStart(2, '0')}`, x + w / 2, y + h / 2 + 4);
  ctx.textAlign = 'left';
  glow(ctx, x + w / 2, y + h / 2 - 6, w * 0.45, '#22D3EE', 0.18);
  ctx.fillStyle = 'rgba(255,230,200,0.35)';
  ctx.fillRect(x + w / 2 - 14, y + h - 10, 28, 3);
}

function phone(ctx, x, y, w, h) {
  ctx.fillStyle = '#0E0C0B';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(255,230,200,0.3)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 12); ctx.clip();
  ctx.drawImage(IMG.lumiumApp, 1445, 10, 210, 360, x + 5, y + 5, w - 10, h - 10);   // clear of the big timer digits
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, y, w, h);
  setFont(ctx, 700, 20, SANS);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.textAlign = 'center';
  ctx.fillText('24:58', x + w / 2, y + h / 2 + 6);
  ctx.textAlign = 'left';
  ctx.restore();
}

/* ---------- the scene ---------- */
function sLumium(ctx, lt) {
  camDrift(ctx, lt, 4);
  fillBg(ctx, '#000000');
  const L = LUM.logo;
  const [bx, by] = LUM.bulb;
  const on = lt < 0.2 ? 0 : lt < 0.23 ? 1 : lt < 0.26 ? 0.18 : 1;       // the switch-on flicker
  const open = Ez.inOutCubic(inv(0.5, 0.84, lt));                          // beam widening into the app
  const pull = Ez.inOutCubic(inv(0.95, 1.3, lt));                          // app shrinking into its card

  // ---------- A: the lamp ----------
  if (pull < 1) {
    const fadeLogo = 1 - A(lt, 0.78, 0.9);
    // the ring draws itself in the dark
    const rp = A(lt, 0.02, 0.22, Ez.outCubic);
    ctx.strokeStyle = '#0E8FB0';
    ctx.lineWidth = 4.5;
    ctx.globalAlpha = fadeLogo;
    ctx.beginPath(); ctx.arc(LUM.ring[0], LUM.ring[1], LUM.ring[2], -Math.PI / 2, -Math.PI / 2 + TAU * rp); ctx.stroke();
    ctx.globalAlpha = 1;
    if (on > 0 && fadeLogo > 0) {
      // icon (lamp + baked beam) lights up inside the ring
      ctx.save();
      ctx.globalAlpha = on * fadeLogo;
      ctx.beginPath(); ctx.arc(LUM.ring[0], LUM.ring[1], LUM.ring[2] + 4, 0, TAU); ctx.clip();
      ctx.drawImage(IMG.lumiumLogo, L.x, L.y, 860 * L.s, 360 * L.s);
      ctx.restore();
      // the wordmark is found by the light, left to right
      const wp = A(lt, 0.26, 0.55, Ez.inOutCubic);
      if (wp > 0) {
        const x0 = L.x + 300 * L.s, x1 = L.x + 800 * L.s, xe = lerp(x0, x1, wp);
        ctx.save();
        ctx.globalAlpha = fadeLogo;
        ctx.beginPath(); ctx.rect(x0, L.y, xe - x0, 360 * L.s); ctx.clip();
        ctx.drawImage(IMG.lumiumLogo, L.x, L.y, 860 * L.s, 360 * L.s);
        ctx.restore();
        if (wp < 1) {
          // feather the leading edge of the light instead of a hard cut
          const fg = ctx.createLinearGradient(xe - 120, 0, xe, 0);
          fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
          ctx.fillStyle = fg;
          ctx.fillRect(xe - 120, L.y, 121, 360 * L.s);
        }
      }
    }
  }

  // the volumetric beam (and later the wipe into the app)
  if (on > 0) {
    const half = lerp(22 * D2R, 190 * D2R, open);
    const len = lerp(900 * A(lt, 0.22, 0.5, Ez.outCubic), 3200, open);
    const beam = () => {
      ctx.beginPath();
      ctx.moveTo(bx, by);
      for (let k = 0; k <= 24; k++) { const a = LUM.beamDir - half + (2 * half * k) / 24; ctx.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len); }
      ctx.closePath();
    };
    if (open > 0 && pull < 1) {
      // inside the beam: the app, warm and alive
      ctx.save();
      beam(); ctx.clip();
      drawCover(ctx, IMG.lumiumApp, 0, 0, W, H, lerp(1.14, 1.0, Ez.outCubic(inv(0.5, 1.0, lt))));
      ctx.restore();
    }
    if (open < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const bg = ctx.createRadialGradient(bx, by, 4, bx, by, Math.max(10, len));
      bg.addColorStop(0, `rgba(165,243,252,${0.55 * on})`); bg.addColorStop(0.35, `rgba(34,211,238,${0.22 * on})`); bg.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = bg;
      beam(); ctx.fill();
      // dust drifting in the light
      for (let k = 0; k < 46; k++) {
        const a = LUM.beamDir + (hash(k * 3.7) - 0.5) * 2 * half * 0.8;
        const d = (hash(k * 1.3) * 0.9 + 0.08) * Math.min(len, 900);
        const px = bx + Math.cos(a) * d + vnoise(lt * 0.8 + k, k) * 12, py = by + Math.sin(a) * d + vnoise(lt * 0.7 + k, k + 9) * 12 - lt * 10;
        ctx.fillStyle = `rgba(207,250,254,${(0.25 + 0.5 * hash(k)) * on * (1 - open)})`;
        ctx.fillRect(px, py, 2.2, 2.2);
      }
      ctx.restore();
    }
  }

  // ---------- B: overlays on the live app ----------
  if (open > 0.6 && pull < 0.6) {
    const oa = A(lt, 0.62, 0.72) * (1 - A(lt, 0.95, 1.05));
    ctx.save();
    ctx.globalAlpha = oa;
    // Focus Guardian: a focus signal that dips, is caught, and recovers
    ctx.fillStyle = 'rgba(20,12,6,0.6)';
    ctx.beginPath(); ctx.roundRect(90, 716, 540, 178, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,180,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
    lumLabel(ctx, 'FOCUS GUARDIAN', 118, 752, '#FCD34D');
    const fp = A(lt, 0.64, 0.98, Ez.inOutSine);
    const vals = [0.7, 0.74, 0.72, 0.78, 0.76, 0.3, 0.42, 0.75, 0.8, 0.83];
    const curve = spline(vals.map((v, i) => [120 + i * 52, 862 - v * 88]));
    ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokePartial(ctx, curve, 0, fp);
    const dipX = 120 + 5 * 52, dipY = 862 - 0.3 * 88;
    if (fp > 0.52) {
      const dp = A(lt, 0.8, 1.0);
      ring(ctx, dipX, dipY, 10 + 26 * dp, 2.5, '#F59E0B', 1 - dp);
      circle(ctx, dipX, dipY, 6, '#F59E0B');
      setFont(ctx, 600, 14, MONO);
      ctx.fillStyle = fp > 0.8 ? '#86EFAC' : '#FCD34D';
      ctx.fillText(fp > 0.8 ? 'nudge sent · back in focus' : 'focus dip detected', 380, 752);
    }
    // Quick Answer: one tap, one answer, no rabbit hole
    ctx.fillStyle = 'rgba(20,12,6,0.6)';
    ctx.beginPath(); ctx.roundRect(1290, 716, 540, 178, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,180,0.3)'; ctx.stroke();
    lumLabel(ctx, 'QUICK ANSWER', 1318, 752, '#FCD34D');
    setFont(ctx, 600, 13, MONO); ctx.fillStyle = 'rgba(255,237,213,0.6)';
    ctx.fillText('one tap · no rabbit holes', 1570, 752);
    pill(ctx, 1318, 772, 484, 42, 'rgba(255,255,255,0.1)', 'rgba(255,220,180,0.35)');
    setFont(ctx, 500, 18, SANS); ctx.fillStyle = '#FFF7ED';
    typeText(ctx, 'Why does ice float on water?', 1338, 800, lt, 0.66, 70, { caret: lt < 0.8, caretSize: 18 });
    if (lt > 0.8) {
      setFont(ctx, 500, 17, SANS); ctx.fillStyle = '#FDE68A';
      typeText(ctx, 'Frozen water is less dense than liquid water.', 1320, 856, lt, 0.8, 90);
    }
    ctx.restore();
  }

  // ---------- C: the whole world ----------
  if (pull > 0) {
    // backdrop: the wallpaper, blurred and dimmed
    ctx.save();
    ctx.globalAlpha = clamp(pull * 1.6);
    ctx.drawImage(IMG.lumiumBlur, -40, -24, W + 80, H + 48);
    ctx.fillStyle = 'rgba(8,5,3,0.58)';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // the app shrinks from full frame into the "desktop" card
    const cover = { x: -237, y: 0, w: 2394, h: 1080 }, card = { x: 560, y: 132, w: 700, h: 316 };
    const r = { x: lerp(cover.x, card.x, pull), y: lerp(cover.y, card.y, pull), w: lerp(cover.w, card.w, pull), h: lerp(cover.h, card.h, pull) };
    const clipR = { x: lerp(0, card.x, pull), y: lerp(0, card.y, pull), w: lerp(W, card.w, pull), h: lerp(H, card.h, pull) };
    ctx.save();
    ctx.beginPath(); ctx.roundRect(clipR.x, clipR.y, clipR.w, clipR.h, 22 * pull); ctx.clip();
    ctx.drawImage(IMG.lumiumApp, r.x, r.y, r.w, r.h);
    ctx.restore();
    if (pull > 0.9) {
      ctx.strokeStyle = LUM.cardLine; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(card.x, card.y, card.w, card.h, 22); ctx.stroke();
      lumLabel(ctx, 'DESKTOP', card.x + 22, card.y + card.h + 26, 'rgba(252,217,182,0.7)');
    }
    const cp = k => spring(lt - 1.02 - k * 0.045, 1.5, 6.2);

    // arena ranks + XP
    let done = lumCard(ctx, 1290, 132, 510, 316, cp(0), 0.08);
    lumLabel(ctx, 'ARENA · RANK UP WITH XP', 1316, 170);
    const climb = A(lt, 1.25, 1.75, Ez.inOutCubic) * 2;   // Panda → Finch → Phoenix
    RANKS.forEach((rk, k) => {
      const x = 1360 + k * 118, y = 262;
      const lit = k <= Math.round(climb);
      const pop = k === Math.round(climb) ? 1 + 0.12 * pulse(lt, 1.25 + k * 0.25, 9) : 1;
      ctx.save();
      about(ctx, x, y, pop);
      hexBadge(ctx, x, y, 46, rk.c, lit);
      ctx.globalAlpha = lit ? 1 : 0.5;
      rankGlyph(ctx, k, x, y, 58);
      ctx.restore();
      setFont(ctx, 700, 12, MONO); ctx.fillStyle = lit ? '#FFF7ED' : 'rgba(255,247,237,0.4)';
      ctx.textAlign = 'center'; ctx.fillText(rk.name, x, y + 72); ctx.textAlign = 'left';
    });
    const xp = A(lt, 1.18, 1.8, Ez.outCubic);
    pill(ctx, 1316, 380, 458, 14, 'rgba(255,255,255,0.1)');
    const xg = ctx.createLinearGradient(1316, 0, 1774, 0); xg.addColorStop(0, '#FCD34D'); xg.addColorStop(1, '#F97316');
    pill(ctx, 1316, 380, Math.max(14, 458 * (0.18 + 0.7 * xp)), 14, xg);
    setFont(ctx, 700, 14, MONO); ctx.fillStyle = '#FDE68A';
    ctx.fillText(`${Math.round(1240 + 860 * xp)} XP`, 1316, 425);
    const xa = A(lt, 1.3, 1.4) * (1 - A(lt, 1.6, 1.75));
    if (xa > 0) { ctx.globalAlpha *= xa; setFont(ctx, 800, 22, DISP); ctx.fillStyle = '#FCD34D'; ctx.fillText('+240 XP', 1660, 425 - 20 * A(lt, 1.3, 1.75)); }
    done();

    // study together
    done = lumCard(ctx, 560, 474, 400, 230, cp(1), -0.06);
    lumLabel(ctx, 'STUDY TOGETHER', 584, 512);
    [['AK', '#F97316'], ['RM', '#22D3EE'], ['SJ', '#A78BFA'], ['NP', '#34D399']].forEach(([s, c], k) => {
      const a = spring(lt - 1.12 - k * 0.05, 2, 7), x = 610 + k * 84, y = 590;
      circle(ctx, x, y, 30 * a, c);
      if (a > 0.6) {
        setFont(ctx, 700, 16, SANS); ctx.fillStyle = '#0B0B0B'; ctx.textAlign = 'center'; ctx.fillText(s, x, y + 6);
        setFont(ctx, 500, 12, MONO); ctx.fillStyle = 'rgba(255,247,237,0.7)'; ctx.fillText(`${48 - k * 7}:${String(12 + k * 9).padStart(2, '0')}`, x, y + 52); ctx.textAlign = 'left';
      }
      circle(ctx, x + 21, y - 21, 6 * a, '#22C55E');
    });
    setFont(ctx, 500, 15, SANS); ctx.fillStyle = '#FFEDD5';
    ctx.fillText('Room "Finals week" · 4 focusing', 584, 684);
    done();

    // Lumio AI coach
    done = lumCard(ctx, 985, 474, 455, 230, cp(2), 0.05);
    lumLabel(ctx, 'LUMIO · AI COACH', 1009, 512);
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4 - Math.PI / 2, rr = k % 2 ? 4 : 13; ctx.lineTo(1400 + Math.cos(a) * rr, 507 + Math.sin(a) * rr); }
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.roundRect(1009, 534, 407, 138, 16); ctx.fill();
    setFont(ctx, 500, 18, SANS); ctx.fillStyle = '#FFF7ED';
    typeText(ctx, 'You focus best between 9 and 11 pm.', 1027, 574, lt, 1.16, 80);
    typeText(ctx, 'Two more sessions and you beat', 1027, 606, lt, 1.46, 80);
    typeText(ctx, 'last week. Start one now?', 1027, 638, lt, 1.66, 80, { caret: true, caretSize: 18 });
    done();

    // weekly progress: a smooth, springy curve
    done = lumCard(ctx, 1465, 474, 335, 230, cp(3), -0.05);
    lumLabel(ctx, 'THIS WEEK', 1489, 512);
    setFont(ctx, 700, 14, MONO); ctx.fillStyle = '#86EFAC'; ctx.fillText('+18%', 1730, 512);
    const days = [0.35, 0.5, 0.42, 0.66, 0.58, 0.8, 0.9].map((v, i) => [1492 + i * 46, 680 - v * 128 * spring(lt - 1.2 - i * 0.035, 1.6, 5.2)]);
    const wc = spline(days);
    const ag = ctx.createLinearGradient(0, 540, 0, 690); ag.addColorStop(0, 'rgba(245,158,11,0.35)'); ag.addColorStop(1, 'rgba(245,158,11,0)');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.moveTo(wc[0][0], 690); wc.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(wc[wc.length - 1][0], 690); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#FBBF24'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    strokePartial(ctx, wc, 0, 1);
    done();

    // ambient sound + live wallpapers
    done = lumCard(ctx, 560, 728, 550, 206, cp(4), 0.04);
    lumLabel(ctx, 'AMBIENT · LIVE WALLPAPERS', 584, 766);
    ['Rain', 'Café', 'Lo-fi', 'Forest'].forEach((s, k) => {
      setFont(ctx, 600, 15, SANS);
      const w = ctx.measureText(s).width + 28, x = 584 + [0, 78, 156, 238][k];
      pill(ctx, x, 786, w, 32, k === 2 ? '#F59E0B' : 'rgba(255,255,255,0.08)', 'rgba(255,220,180,0.3)');
      ctx.fillStyle = k === 2 ? '#1C1208' : '#FFEDD5'; ctx.fillText(s, x + 14, 808);
    });
    ctx.strokeStyle = '#FDBA74'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const u = i / 120, x = 584 + u * 300;
      const y = 874 + Math.sin(u * 20 + lt * 9) * 16 * Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(lt * 3 + u * 5));
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.roundRect(912, 786, 172, 124, 12); ctx.clip();
    ctx.drawImage(IMG.lumiumApp, 1180 + lt * 30, 30, 420, 300, 912, 786, 172, 124);   // the sunset, no timer
    ctx.restore();
    setFont(ctx, 700, 11, MONO); ctx.fillStyle = '#FFFFFF'; ctx.fillText('● LIVE', 922, 902);
    done();

    // mobile + the desk-clock hardware
    done = lumCard(ctx, 1135, 728, 665, 206, cp(5), -0.04);
    lumLabel(ctx, 'MOBILE · DESK CLOCK (IN THE WORKS)', 1159, 766);
    phone(ctx, 1170, 784, 84, 140);
    deskClock(ctx, 1290, 800, 250, 110, lt);
    setFont(ctx, 500, 15, SANS); ctx.fillStyle = 'rgba(255,237,213,0.8)';
    ctx.fillText('one session,', 1570, 842);
    ctx.fillText('every surface', 1570, 866);
    done();

    // left column: the logo and everything it does
    const la = A(lt, 1.05, 1.3);
    ctx.save();
    ctx.globalAlpha = la;
    ctx.globalCompositeOperation = 'screen';   // the logo sits on black: screen drops the black out
    ctx.drawImage(IMG.lumiumLogo, 96, 110, 860 * 0.5, 360 * 0.5);
    ctx.restore();
    const feats = ['Focus Guardian', 'Quick Answer', 'Study together', 'Arena ranks & XP', 'Lumio AI coach', 'Ambient + live wallpapers', 'Mobile + desk clock'];
    feats.forEach((f, k) => {
      const a = A(lt, 1.12 + k * 0.045, 1.3 + k * 0.045);
      if (a <= 0) return;
      ctx.globalAlpha = a;
      circle(ctx, 128, 347 + k * 40, 5, k % 2 ? '#22D3EE' : '#F59E0B');
      setFont(ctx, 600, 19, SANS); ctx.fillStyle = '#FFF7ED';
      ctx.fillText(f, 146 + (1 - a) * 20, 353 + k * 40);
      ctx.globalAlpha = 1;
    });
    setFont(ctx, 600, 20, MONO);
    ctx.fillStyle = rgba('#C8A98C', la);
    ctx.fillText('04 / 08', 124, 96);
    ctx.fillStyle = rgba('#F59E0B', la);
    ctx.fillRect(224, 89, 60 * la, 3);
    tagPills(ctx, lt - 1.0, ['Capacitor', 'Firebase', 'Gemini', 'Raspberry Pi'], { accent: '#F59E0B', fg: '#FFF7ED' });
  }
}

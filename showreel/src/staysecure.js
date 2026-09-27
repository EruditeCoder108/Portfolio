/* 08 STAYSECURE — hotel.staysecure.in and police.staysecure.in.
   Two doors (hotel, police) slide in; a guest check-in flows from one to the other; then their white
   frames reshape, open at the cut and interlock into the StaySecure S on the downbeat. */

const TH_SS = { bg: '#050A1C', glow: '#1D3FD6', accent: '#6D8CFF', fg: '#FFFFFF', mute: '#8391B8' };
const SS_DOOR = { w: 300, h: 520, r: 64, th: 34 };
const SS_SNAP = BEAT * 2; // local time of the interlock (beat 26)

function brass(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#E2C387'); g.addColorStop(0.5, '#B8914F'); g.addColorStop(1, '#8A6A38');
  return g;
}
function steel(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#F1F5F9'); g.addColorStop(0.45, '#B6BEC9'); g.addColorStop(1, '#7B8594');
  return g;
}

function hotelDoor(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#393530'); g.addColorStop(1, '#1C1B19');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const lg = ctx.createRadialGradient(w * 0.32, 0, 10, w * 0.32, 0, h * 0.65);
  lg.addColorStop(0, 'rgba(255,214,160,0.16)'); lg.addColorStop(1, 'rgba(255,214,160,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, 0, w * 0.1, h); ctx.fillRect(w * 0.9, 0, w * 0.1, h);
  ctx.fillStyle = brass(ctx, 0, h);
  ctx.fillRect(w * 0.15, 0, 3, h); ctx.fillRect(w * 0.85 - 3, 0, 3, h);
  setFont(ctx, 500, w * 0.085, SANS);
  ctx.letterSpacing = `${w * 0.035}px`;
  ctx.textAlign = 'center';
  ctx.fillStyle = brass(ctx, h * 0.24, h * 0.29);
  ctx.fillText('HOTEL', w / 2 + w * 0.017, h * 0.285);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';
  ctx.fillRect(w * 0.42, h * 0.315, w * 0.16, 2);
  circle(ctx, w / 2, h * 0.38, w * 0.024, '#B8914F');
  circle(ctx, w / 2, h * 0.38, w * 0.012, '#15130F');
  // card lock + lever
  const px = w * 0.76, py = h * 0.5;
  ctx.fillStyle = brass(ctx, py, py + h * 0.23);
  ctx.beginPath(); ctx.roundRect(px, py, w * 0.075, h * 0.23, 4); ctx.fill();
  ctx.fillStyle = '#0E0E10';
  ctx.beginPath(); ctx.roundRect(px + w * 0.008, py + h * 0.018, w * 0.059, h * 0.075, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.4;
  for (const r of [4, 7.5, 11]) { ctx.beginPath(); ctx.arc(px + w * 0.0375, py + h * 0.07, r, -2.4, -0.75); ctx.stroke(); }
  ctx.fillStyle = brass(ctx, h * 0.64, h * 0.67);
  ctx.beginPath(); ctx.roundRect(w * 0.55, h * 0.64, w * 0.27, h * 0.028, h * 0.014); ctx.fill();
}

function policeDoor(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#2E4570'); g.addColorStop(1, '#1B2A47');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.05, h * 0.03, w * 0.9, h * 0.95);
  // frosted, wired window with corridor light behind it
  const wx = w * 0.16, wy = h * 0.08, ww = w * 0.68, wh = h * 0.36;
  ctx.save();
  ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  const wg = ctx.createRadialGradient(w / 2, wy + wh * 0.12, 10, w / 2, wy + wh * 0.4, wh * 1.1);
  wg.addColorStop(0, '#EADBB8'); wg.addColorStop(0.45, '#8C8672'); wg.addColorStop(1, '#2E3C58');
  ctx.fillStyle = wg; ctx.fillRect(wx, wy, ww, wh);
  ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = -12; k < 24; k++) { const o = k * 14; ctx.moveTo(wx + o, wy); ctx.lineTo(wx + o + wh, wy + wh); ctx.moveTo(wx + o + wh, wy); ctx.lineTo(wx + o, wy + wh); }
  ctx.stroke();
  const lgt = ctx.createLinearGradient(0, wy + wh * 0.1, 0, wy + wh * 0.2);
  lgt.addColorStop(0, 'rgba(255,248,225,0)'); lgt.addColorStop(0.5, 'rgba(255,248,225,0.9)'); lgt.addColorStop(1, 'rgba(255,248,225,0)');
  ctx.fillStyle = lgt; ctx.fillRect(wx + ww * 0.25, wy + wh * 0.1, ww * 0.5, wh * 0.1);
  ctx.restore();
  ctx.strokeStyle = '#1A2A46'; ctx.lineWidth = 5; ctx.strokeRect(wx, wy, ww, wh);
  // shield with star
  const sx = w / 2, sy = wy + wh * 0.42, s = w * 0.1;
  ctx.fillStyle = '#E5E7EB';
  ctx.beginPath();
  ctx.moveTo(sx, sy - s); ctx.quadraticCurveTo(sx + s * 0.55, sy - s * 0.72, sx + s * 0.95, sy - s * 0.8);
  ctx.quadraticCurveTo(sx + s, sy + s * 0.2, sx, sy + s); ctx.quadraticCurveTo(sx - s, sy + s * 0.2, sx - s * 0.95, sy - s * 0.8);
  ctx.quadraticCurveTo(sx - s * 0.55, sy - s * 0.72, sx, sy - s); ctx.fill();
  ctx.fillStyle = '#2E4570';
  ctx.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? s * 0.22 : s * 0.5; ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); }
  ctx.fill();
  setFont(ctx, 800, w * 0.12, SANS);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#EEF0F3';
  ctx.fillText('POLICE', w / 2, wy + wh * 0.9);
  // rail, lower panel, plate
  ctx.fillStyle = '#34507F'; ctx.fillRect(w * 0.08, h * 0.475, w * 0.84, h * 0.035);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; ctx.strokeRect(w * 0.18, h * 0.56, w * 0.64, h * 0.37);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.strokeRect(w * 0.18 + 3, h * 0.56 + 3, w * 0.64, h * 0.37);
  ctx.fillStyle = steel(ctx, w * 0.33, h * 0.64, w * 0.67, h * 0.73);
  ctx.beginPath(); ctx.roundRect(w * 0.33, h * 0.64, w * 0.34, h * 0.09, 3); ctx.fill();
  setFont(ctx, 700, w * 0.033, MONO);
  ctx.fillStyle = '#374151';
  ['SERVE', 'PROTECT', 'UPHOLD'].forEach((t, i) => ctx.fillText(t, w / 2, h * 0.662 + i * h * 0.025));
  ctx.textAlign = 'left';
  // pull handle
  ctx.fillStyle = steel(ctx, w * 0.06, 0, w * 0.13, 0);
  ctx.beginPath(); ctx.roundRect(w * 0.06, h * 0.45, w * 0.07, h * 0.22, 3); ctx.fill();
  ctx.beginPath(); ctx.roundRect(w * 0.075, h * 0.48, w * 0.04, h * 0.14, w * 0.02); ctx.fill();
  circle(ctx, w * 0.095, h * 0.645, w * 0.012, '#2B2F36');
  ctx.fillStyle = steel(ctx, w * 0.93, 0, w * 0.97, 0);
  for (const y of [0.07, 0.5, 0.88]) ctx.fillRect(w * 0.935, h * y, w * 0.03, h * 0.06);
}

/** white door frame / S piece with a soft plastic gradient */
function frameStyle(ctx, g, flat) {
  if (flat >= 1) return '#FFFFFF';
  const gr = ctx.createLinearGradient(g.cx - g.w / 2, g.cy - g.h / 2, g.cx + g.w / 2, g.cy + g.h / 2);
  gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, mixHex('#D5DCE8', '#FFFFFF', flat));
  return gr;
}

function lerpGeom(a, b, m, tr) {
  const o = {};
  for (const k of ['cx', 'cy', 'w', 'h', 'r', 'th', 'cut']) o[k] = lerp(a[k], b[k], m);
  o.rot = a.rot;
  o.trim = tr;
  return o;
}

function sStaySecure(ctx, lt) {
  const th = TH_SS;
  fillBg(ctx, th.bg);
  glow(ctx, W / 2, H / 2, 1200, th.glow, 0.32 + 0.12 * A(lt, 0.7, 1.0));
  dotGrid(ctx, 48, 0.04, '#FFFFFF', 0, -lt * 18);

  // --- layout over time
  const inH = spring(lt, 1.25, 5.8), inP = spring(lt - 0.05, 1.25, 5.8);
  const hotel0 = { cx: lerp(-420, 700, inH), cy: 470, ...SS_DOOR, cut: SS.cutFrac, rot: 0 };
  const police0 = { cx: lerp(W + 420, 1220, inP), cy: 470, ...SS_DOOR, cut: SS.cutFrac, rot: Math.PI };
  const lock = A(lt, 1.0, 1.42, Ez.inOutCubic);
  const iconX = lerp(W / 2, 640, lock), iconY = lerp(480, 470, lock), iconS = lerp(620, 410, lock);
  const [up, lo] = ssIconGeom(iconX, iconY, iconS);
  let m = Ez.inOutCubic(inv(0.56, SS_SNAP, lt));
  if (lt > SS_SNAP) m = 1 + 0.045 * Math.sin((lt - SS_SNAP) * 42) * Math.exp(-(lt - SS_SNAP) * 11);
  const tr = Ez.inOutCubic(inv(0.66, SS_SNAP - 0.03, lt));
  const gH = lerpGeom(hotel0, up, m, tr), gP = lerpGeom(police0, lo, m, tr);
  const content = 1 - A(lt, 0.56, 0.76);
  const flat = A(lt, 0.7, SS_SNAP);

  // --- icon tile grows behind the interlocking frames
  const bgS = iconS * spring(lt - 0.72, 1.3, 6);
  if (bgS > 1) {
    ctx.save();
    glow(ctx, iconX, iconY + 30, bgS * 0.9, '#2F5BFF', 0.45);
    ctx.fillStyle = SS.blue;
    ctx.beginPath(); ctx.roundRect(iconX - bgS / 2, iconY - bgS / 2, bgS, bgS, bgS * SS.radius); ctx.fill();
    ctx.restore();
  }

  // --- doors: content inside each frame
  for (const [g, draw, rot] of [[gH, hotelDoor, 0], [gP, policeDoor, 1]]) {
    if (content <= 0) continue;
    glow(ctx, g.cx + 20, g.cy + 60, g.w * 1.1, '#000000', 0.5 * content);
    ctx.save();
    ctx.globalAlpha = content;
    const iw = g.w - g.th, ih = g.h - g.th;
    ctx.beginPath(); ctx.roundRect(g.cx - iw / 2, g.cy - ih / 2, iw, ih, Math.max(2, g.r - g.th / 2)); ctx.clip();
    ctx.translate(g.cx - iw / 2, g.cy - ih / 2);
    draw(ctx, iw, ih);
    // police window lights up when the guest record lands
    if (rot && lt > 0.55) glow(ctx, iw / 2, ih * 0.25, iw * 0.6, '#FFFFFF', 0.5 * pulse(lt, 0.58, 6));
    ctx.restore();
  }
  ssPiece(ctx, gH, frameStyle(ctx, gH, flat));
  ssPiece(ctx, gP, frameStyle(ctx, gP, flat));

  // --- domains under the doors
  const la = A(lt, 0.14, 0.34) * (1 - A(lt, 0.52, 0.62));
  if (la > 0) {
    setFont(ctx, 500, 20, MONO);
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba('#C7D2FE', la);
    ctx.fillText('hotel.staysecure.in', gH.cx, 790);
    ctx.fillText('police.staysecure.in', gP.cx, 790);
    ctx.textAlign = 'left';
  }

  // --- a guest check-in travels from the hotel's card lock to the police window
  if (lt > 0.2 && lt < 0.72) {
    const p0 = [gH.cx + 110, 520], p3 = [gP.cx - 60, 300];
    const arc = bezier(p0, [gH.cx + 170, 150], [gP.cx - 190, 110], p3, 60);
    const dp = A(lt, 0.22, 0.58, Ez.inOutCubic), fade = 1 - A(lt, 0.62, 0.72);
    ctx.strokeStyle = rgba('#93A7FF', 0.55 * fade); ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -lt * 60;
    strokePartial(ctx, arc, 0, Math.max(0.001, dp));
    ctx.setLineDash([]);
    const [hx, hy] = pointAt(arc, dp);
    glow(ctx, hx, hy, 60, '#93C5FD', 0.7 * fade);
    circle(ctx, hx, hy, 6, rgba('#FFFFFF', fade));
    setFont(ctx, 600, 15, MONO);
    const label = dp < 0.98 ? 'guest check-in · ID verified' : 'visible to police';
    const lw = ctx.measureText(label).width + 44;
    ctx.globalAlpha = fade * A(lt, 0.24, 0.32);
    pill(ctx, hx - lw / 2, hy - 58, lw, 34, 'rgba(15,23,52,0.92)', 'rgba(147,167,255,0.6)');
    circle(ctx, hx - lw / 2 + 18, hy - 41, 5, '#34D399');
    ctx.fillStyle = '#E0E7FF';
    ctx.fillText(label, hx - lw / 2 + 30, hy - 36);
    ctx.globalAlpha = 1;
  }

  // --- the snap
  const sp = A(lt, SS_SNAP, SS_SNAP + 0.55);
  if (lt > SS_SNAP && sp < 1) {
    ring(ctx, iconX, iconY, iconS * 0.55 + 520 * sp, 3, '#C7D2FE', 0.8 * (1 - sp));
    sparks(ctx, iconX, iconY, lt - SS_SNAP, 40, 26, { c2: '#93A7FF', vmin: 700, vrange: 900 });
  }

  // --- lockup
  const wp = lt - 1.12;
  if (wp > -0.1) {
    const x = 900;
    setFont(ctx, 600, 20, MONO);
    ctx.fillStyle = rgba(th.mute, A(lt, 1.12, 1.35));
    ctx.fillText('08 / 08', x + 4, 368);
    ctx.fillStyle = th.accent;
    ctx.fillRect(x + 104, 361, 60 * A(lt, 1.15, 1.4), 3);
    setFont(ctx, 800, 132, DISP);
    ctx.fillStyle = '#FFFFFF';
    riseText(ctx, 'StaySecure', x, 505, 132, { t: wp, stagger: 0.02, dur: 0.42, track: -2 });
    setFont(ctx, 500, 24, MONO);
    ctx.fillStyle = rgba('#AFC0F5', A(lt, 1.25, 1.5));
    ctx.fillText('hotel <-> police guest registry · city-scale', x + 6, 566);
    // the two portals, joined by a live curve
    const pa = A(lt, 1.3, 1.6);
    if (pa > 0) {
      setFont(ctx, 600, 19, MONO);
      const a1 = 'hotel.staysecure.in', a2 = 'police.staysecure.in';
      const w1 = ctx.measureText(a1).width + 40, w2 = ctx.measureText(a2).width + 40;
      const y = 612, x2 = x + w1 + 150;
      ctx.globalAlpha = pa;
      pill(ctx, x, y, w1, 44, 'rgba(47,91,255,0.16)', 'rgba(109,140,255,0.7)');
      pill(ctx, x2, y, w2, 44, 'rgba(47,91,255,0.16)', 'rgba(109,140,255,0.7)');
      ctx.fillStyle = '#E0E7FF';
      ctx.fillText(a1, x + 20, y + 29);
      ctx.fillText(a2, x2 + 20, y + 29);
      const link = bezier([x + w1, y + 22], [x + w1 + 60, y - 30], [x2 - 60, y + 74], [x2, y + 22], 40);
      ctx.strokeStyle = 'rgba(147,167,255,0.7)'; ctx.lineWidth = 2;
      strokePartial(ctx, link, 0, A(lt, 1.35, 1.6, Ez.inOutCubic));
      const k = ((lt - 1.4) * 1.6) % 1;
      if (lt > 1.4) { const [px, py] = pointAt(link, k); circle(ctx, px, py, 5, '#FFFFFF'); glow(ctx, px, py, 30, '#93C5FD', 0.8); }
      ctx.globalAlpha = 1;
    }
  }
  tagPills(ctx, lt - 0.9, ['Hotel portal', 'Police portal', 'Production-ready'], th);
}

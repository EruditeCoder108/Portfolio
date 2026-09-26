#!/usr/bin/env python3
"""Procedural soundtrack for the showreel: 128 BPM, A minor, 15 s.

Everything is synthesised (additive plucks, detuned-saw pad, sidechained bass, drums, risers,
whooshes, booms, UI blips, typing). Sound-design cues are read from src/cues.js, the same timeline
that drives the visuals, so every hit, whoosh and blip lands on the frame it belongs to.

    python3 tools/audio.py out.wav
"""
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
CUES = json.loads(re.search(r"=\s*(\{.*\})\s*;", (ROOT / "src/cues.js").read_text(), re.S).group(1))
BPM = CUES["bpm"]
BEAT = 60.0 / BPM
DUR = CUES["duration"]
N = int(SR * DUR) + SR  # one second of tail room, trimmed at the end
rs = np.random.default_rng(108)

dry = np.zeros((2, N))
send = np.zeros((2, N))   # reverb send
duck = np.ones(N)          # sidechain gain, driven by kicks


def bt(b):
    return b * BEAT


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def put(buf, sig, t, pan=0.0, gain=1.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    s = sig[max(0, -i): N - i] * gain
    i = max(0, i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(s)] += s * l * 1.4142
    buf[1, i:i + len(s)] += s * r * 1.4142


def env(n, a, d, curve=1.0):
    t = np.arange(n) / SR
    e = np.exp(-t / d) ** curve
    if a > 0:
        e *= np.clip(t / a, 0, 1)
    return e


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def noise(n):
    return rs.standard_normal(n)


# ---------------------------------------------------------------- instruments
def kick(t, g=1.0):
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 46 + 110 * np.exp(-tt / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env(n, 0.001, 0.32)
    click = filt(noise(n), "highpass", 2500) * env(n, 0, 0.004) * 0.35
    put(dry, np.tanh(1.6 * (body + click)) * 0.95, t, 0, g)
    i = int(t * SR)
    k = np.arange(int(0.3 * SR)) / SR
    shape = 1 - 0.8 * np.exp(-k / 0.09)
    seg = duck[i:i + len(shape)]
    duck[i:i + len(shape)] = np.minimum(seg, shape[: len(seg)])


def clap(t, g=1.0):
    n = int(0.35 * SR)
    x = filt(noise(n), "bandpass", [900, 5200])
    e = np.zeros(n)
    for k, off in enumerate([0, 0.009, 0.018]):
        j = int(off * SR)
        e[j:] += env(n - j, 0, 0.012 if k < 2 else 0.14)
    tone = np.sin(2 * np.pi * 185 * np.arange(n) / SR) * env(n, 0, 0.05) * 0.4
    s = x * e * 0.5 + tone
    put(dry, s, t, 0, 0.55 * g)
    put(send, s, t, 0, 0.25 * g)


def hat(t, g=1.0, open_=False, pan=0.0):
    n = int((0.25 if open_ else 0.06) * SR)
    s = filt(noise(n), "highpass", 7500) * env(n, 0, 0.09 if open_ else 0.018)
    put(dry, s, t, pan, 0.22 * g)


def saw_add(freq, n, decay_base=None, harm=24, bright=1.0):
    """additive sawtooth; optional per-harmonic decay emulates a closing low-pass"""
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, harm + 1):
        fk = freq * k
        if fk > SR * 0.45:
            break
        a = 1.0 / k
        if decay_base is not None:
            a = a * np.exp(-tt * (1 + (k - 1) * 0.55 / bright) / decay_base)
        out += a * np.sin(2 * np.pi * fk * tt + k * 0.7)
    return out


def pluck(t, m, g=1.0, pan=0.0, dec=0.22):
    n = int(0.5 * SR)
    s = saw_add(midi(m), n, decay_base=dec, harm=18) * env(n, 0.002, 0.35)
    put(dry, s, t, pan, 0.16 * g)
    put(send, s, t, -pan, 0.12 * g)


def pad(t0, t1, notes, g=1.0, cutoff=2400, attack=0.25):
    n = int((t1 - t0 + 0.9) * SR)
    tt = np.arange(n) / SR
    s = np.zeros((2, n))
    for m in notes:
        for v, det in enumerate([-0.14, -0.06, 0.0, 0.07, 0.15]):
            f = midi(m) * 2 ** (det / 12)
            w = saw_add(f, n, harm=14)
            p = (v - 2) / 2.2
            s[0] += w * np.cos((p + 1) * np.pi / 4)
            s[1] += w * np.sin((p + 1) * np.pi / 4)
    e = np.clip(tt / attack, 0, 1) * np.clip((t1 - t0 + 0.8 - tt) / 0.8, 0, 1)
    for c in range(2):
        s[c] = filt(s[c], "lowpass", cutoff) * e
    s *= 0.016 * g / len(notes)
    i = int(t0 * SR)
    m_ = min(n, N - i)
    dry[:, i:i + m_] += s[:, :m_] * 0.8
    send[:, i:i + m_] += s[:, :m_] * 0.6


def bass(t, m, dur, g=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * saw_add(f * 2, n, harm=8)
    s = filt(s, "lowpass", 900) * env(n, 0.004, dur * 0.9) * np.clip((dur - tt) / 0.01, 0, 1)
    put(dry, np.tanh(1.3 * s), t, 0, 0.34 * g)


def stab(t, notes, g=1.0):
    n = int(0.6 * SR)
    s = sum(saw_add(midi(m), n, decay_base=0.12, harm=20) for m in notes) / len(notes)
    s *= env(n, 0.001, 0.3)
    put(dry, s, t, 0, 0.2 * g)
    put(send, s, t, 0, 0.3 * g)


def boom(t, g=1.0):
    n = int(2.2 * SR)
    tt = np.arange(n) / SR
    f = 34 + 60 * np.exp(-tt / 0.08)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.9)
    crash = filt(noise(n), "highpass", 3000) * env(n, 0.001, 0.5) * 0.25
    thud = filt(noise(n), "lowpass", 400) * env(n, 0.001, 0.15) * 0.8
    s = np.tanh(1.4 * (sub + thud)) + crash
    put(dry, s, t, 0, 0.75 * g)
    put(send, s, t, 0, 0.5 * g)


def svf_sweep(x, f0, f1, q=0.5):
    """time-varying band-pass (Chamberlin SVF), exponential cutoff sweep"""
    n = len(x)
    fc = f0 * (f1 / f0) ** (np.arange(n) / max(1, n - 1))
    F = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    lo = bp = 0.0
    out = np.empty(n)
    for i in range(n):
        hp = x[i] - lo - q * bp
        bp += F[i] * hp
        lo += F[i] * bp
        out[i] = bp
    return out


def whoosh(t, dur, g=1.0):
    n = int(dur * SR)
    x = noise(n)
    up = svf_sweep(x[: n // 2], 300, 6000, 0.6)
    dn = svf_sweep(x[n // 2:], 6000, 500, 0.6)
    s = np.concatenate([up, dn])
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    s *= e
    pans = np.linspace(-0.8, 0.8, n)
    i = int(t * SR)
    m = min(n, N - i)
    l, r = np.cos((pans + 1) * np.pi / 4), np.sin((pans + 1) * np.pi / 4)
    dry[0, i:i + m] += (s * l)[:m] * 0.28 * g
    dry[1, i:i + m] += (s * r)[:m] * 0.28 * g
    send[:, i:i + m] += (s[:m] * 0.15 * g)


def riser(t0, t1, g=1.0):
    n = int((t1 - t0) * SR)
    tt = np.arange(n) / SR
    x = svf_sweep(noise(n), 400, 9000, 0.35)
    ramp = (tt / tt[-1]) ** 2.2
    f = 180 * 2 ** (3 * tt / tt[-1])
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    s = (x * 0.5 + tone) * ramp
    put(dry, s, t0, 0, 0.22 * g)
    put(send, s, t0, 0, 0.3 * g)


def blip(t, p=1.0, g=1.0):
    n = int(0.07 * SR)
    tt = np.arange(n) / SR
    f = 1250 * p
    s = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(n, 0.001, 0.018)
    put(dry, s, t, (p - 1.4) * 0.8, 0.12 * g)
    put(send, s, t, 0, 0.08 * g)


def typing(t0, t1, rate=26, g=1.0):
    t = t0
    while t < t1:
        n = int(0.012 * SR)
        s = filt(noise(n), "bandpass", [2500, 7000]) * env(n, 0, 0.0025)
        put(dry, s, t, rs.uniform(-0.3, 0.3), 0.18 * g * rs.uniform(0.6, 1.0))
        t += (1 / rate) * rs.uniform(0.6, 1.4)


def glitch(t0, t1, g=1.0):
    step = BEAT / 8
    t = t0
    while t < t1:
        n = int(step * SR * 0.9)
        tt = np.arange(n) / SR
        f = rs.choice([220, 330, 440, 880, 1760, 3520])
        sq = np.sign(np.sin(2 * np.pi * f * tt)) * 0.3
        crunch = np.round(noise(n) * 3) / 3 * 0.25
        put(dry, (sq + crunch) * env(n, 0, 0.03), t, rs.uniform(-0.6, 0.6), 0.14 * g)
        t += step


# ---------------------------------------------------------------- arrangement
CH = {
    "Am": dict(root=33, pad=[57, 60, 64, 71], arp=[57, 60, 64, 69, 72, 76]),
    "F": dict(root=29, pad=[57, 60, 65, 69], arp=[53, 57, 60, 65, 69, 72]),
    "C": dict(root=36, pad=[55, 60, 64, 67], arp=[55, 60, 64, 67, 72, 76]),
    "G": dict(root=31, pad=[55, 59, 62, 67], arp=[55, 59, 62, 67, 71, 74]),
}
BARS = ["Am", "Am", "F", "C", "G", "Am", "F", "Am"]
ARP = [0, 2, 4, 5, 3, 1, 4, 2, 0, 3, 5, 4, 2, 1, 3, 5]

# bar 0 — intro: ticking hats build, three hits (IMAGINE / DESIGN / BUILD), gap before the drop
pad(0, bt(3.75), CH["Am"]["pad"], g=0.6, cutoff=900, attack=0.6)
for s16 in range(2, 15):
    hat(bt(s16 / 4), g=0.25 + 0.5 * s16 / 15, pan=0.3 if s16 % 2 else -0.3)
for b in (1, 2, 3):
    kick(bt(b), 0.9)
    stab(bt(b), [c + 12 for c in CH["Am"]["pad"][:3]], g=0.8)
    clap(bt(b), 0.5)

# bars 1–5 — groove
for bar in range(1, 6):
    c = CH[BARS[bar]]
    t0 = bt(bar * 4)
    pad(t0, t0 + bt(4), c["pad"], g=1.0, cutoff=2000 + bar * 250)
    for b in range(4):
        tb = t0 + bt(b)
        kick(tb)
        if b in (1, 3):
            clap(tb)
        hat(tb + bt(0.5), 1.0, open_=(b == 3), pan=0.25)
        hat(tb + bt(0.25), 0.45, pan=-0.35)
        hat(tb + bt(0.75), 0.45, pan=-0.35)
        bass(tb + bt(0.5), c["root"], bt(0.45))
        bass(tb + bt(0.75), c["root"] + (12 if b == 3 else 0), bt(0.22), 0.8)
    for s16 in range(16):
        pluck(t0 + bt(s16 / 4), c["arp"][ARP[s16]], g=0.9 if s16 % 4 == 0 else 0.65, pan=0.45 if s16 % 2 else -0.45)

# bar 6 — telemetry build: 16th hats, snare roll, filter opens
c = CH["F"]
t0 = bt(24)
pad(t0, t0 + bt(4), c["pad"], g=1.1, cutoff=3800)
for b in range(4):
    tb = t0 + bt(b)
    kick(tb)
    bass(tb + bt(0.5), c["root"], bt(0.45))
    for k in range(4):
        hat(tb + bt(k / 4), 0.5 + 0.12 * b, pan=0.3 if k % 2 else -0.3)
for s16 in range(16):
    pluck(t0 + bt(s16 / 4), c["arp"][ARP[s16]] + (12 if s16 >= 8 else 0), g=0.75, pan=0.45 if s16 % 2 else -0.45)
for k in range(12):
    clap(t0 + bt(2 + k / 6), 0.25 + 0.06 * k)

# bar 7 — resolve on the end card
c = CH["Am"]
t0 = bt(28)
kick(t0, 1.1)
bass(t0, c["root"], bt(2.5), 1.1)
pad(t0, DUR - 0.35, c["pad"] + [76], g=1.3, cutoff=2600, attack=0.05)
for k, m in enumerate([69, 72, 76, 79, 81, 76, 72, 84]):
    pluck(t0 + bt(0.5 + k * 0.5), m, g=0.7 - k * 0.05, pan=0.5 if k % 2 else -0.5, dec=0.35)

# ---------------------------------------------------------------- sound design from the shared cue sheet
for b, a in CUES["booms"]:
    boom(bt(b), a)
for b, d, a in CUES["whooshes"]:
    whoosh(bt(b), bt(d), a)
for b0, b1, a in CUES["risers"]:
    riser(bt(b0), bt(b1), a)
for b, p in CUES["blips"]:
    blip(bt(b), p)
for b0, b1 in CUES["typing"]:
    typing(bt(b0), bt(b1))
for b0, b1, a in CUES["glitches"]:
    glitch(bt(b0), bt(b1), a)

# ---------------------------------------------------------------- mix
ir_n = int(1.8 * SR)
tt = np.arange(ir_n) / SR
ir = np.stack([rs.standard_normal(ir_n), rs.standard_normal(ir_n)]) * np.exp(-tt / 0.45)
ir = np.stack([filt(ch, "lowpass", 6000) for ch in ir])
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([fftconvolve(send[c], ir[c])[:N] for c in range(2)])
wet = np.stack([filt(ch, "highpass", 250) for ch in wet])

mix = dry * duck + wet * 0.35 * (0.4 + 0.6 * duck)
mix = np.stack([filt(ch, "highpass", 28) for ch in mix])
mix = mix[:, : int(DUR * SR)]
mix /= np.abs(mix).max()                      # gain-stage into a gentle soft clip
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / np.abs(mix).max()
fade = int(0.35 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
mix[:, :240] *= np.linspace(0, 1, 240)

out = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "showreel-audio.wav")
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {out} ({DUR}s, peak normalised)")

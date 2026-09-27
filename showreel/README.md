# Showreel: 20 s motion graphics

`showreel.mp4` · 1920×1080 · 60 fps · H.264 + AAC · 128 BPM · 44 beats (20.6 s, 11 bars)

The reel is written in plain Canvas 2D and WebGL2, rendered frame-by-frame in headless Chromium and scored with a
soundtrack synthesised in NumPy. A single cue sheet (`src/cues.js`) drives both picture and sound, so every hit,
whoosh, lock and chime lands on its frame. The only bitmaps are the project artwork in `assets/`. Everything else,
including the StaySecure and Hypha marks, is drawn as vectors so it can animate.

## Storyboard

| Beats | Time | Shot | Technique |
| --- | --- | --- | --- |
| 0 | 0.00 | dot → laser line, `if you can` typed | spring pop, expo line draw |
| 1–3 | 0.47 | **IMAGINE · DESIGN · &lt;BUILD/&gt;** | masked glyph rise, Figma-style construction, scramble-decode |
| 4–5 | 1.88 | **AUTOMATE** (drop) | kinetic rows, shockwave, black-hole collapse |
| 6–9 | 2.81 | dot matrix → 3D | 8,160-point LED sign lifts into a 3D wave field, swirls into the Unravel knot |
| 10 | 4.69 | 01 Unravel | 3D torus-knot strands unravel into an AST joined by smooth S-curve branches |
| 12 | 5.63 | 02 Hypha | match-cut: tree nodes re-form as a mesh over the trail photo; the packet hops hiker → node |
| 14 | 6.56 | 03 Erudite | whip pan; the real store screens swing into 3D (strip-sliced perspective) |
| 16 | 7.50 | 04 Lumium | iris wipe, focus ring, rolling odometer, device lease |
| 18 | 8.44 | 05 Pagevelle | page-curl transition, RSVP reader in the logo's ink and orange |
| 20 | 9.38 | 06 Xenon | glitch cut, terminal, rotating neural point-sphere |
| 22 | 10.31 | 07 UIQraft | slice wipe, glass components spring into place; springy spline chart |
| 24–27 | 11.25 | 08 StaySecure | hotel and police doors; their frames open and interlock into the S on beat 26 |
| 28–31 | 13.13 | wall of work | pull-back to live tiles, then the wall tilts into a 3D floor for a fly-over |
| 31–32 | 14.53 | fluted glass | reeded-glass refraction pass (per-rib magnification + specular) |
| 32–35 | 15.00 | particle marks | StaySecure, Hypha, Erudite and Pagevelle sculpted from 3D dots, one per beat |
| 36–44 | 16.88 | end card | dots resolve into the name; project marks orbit on glass tiles |

## Rendering pipeline

- **Scenes** (`src/scenes-*.js`, `staysecure.js`, `particles.js`) are pure functions of time. Any frame can be
  rendered in isolation, and the wall can re-render every vignette as a live tile.
- **Motion blur**: each output frame averages 6 sub-frame renders across a 216° shutter. The sub-frames are
  accumulated in linear light in a float framebuffer. Sub-samples never straddle a hard cut.
- **Post** (`src/post.js`, WebGL2): per-sample chromatic aberration, glitch displacement, flashes and fluted-glass
  refraction, so they blur too. Per frame: a 4-level bloom chain, a highlight shoulder, vignette and film grain.
- **Audio** (`tools/audio.py`): additive plucks, a detuned-saw pad, sidechained bass, synthesised drums, SVF-swept
  risers and whooshes, booms, a mechanical lock, glass chimes, UI blips and typing, and a convolution reverb.

## Preview & re-render

```bash
cd showreel
npm install                      # playwright (uses the system Chromium)
python3 -m http.server 8080      # open http://localhost:8080/  live preview (click for sound, space to pause)

# full render: frames -> audio -> showreel.mp4 (needs ffmpeg with libx264 on PATH or $FFMPEG)
node tools/render.mjs --workers 4

# quick look at specific moments (seconds), with a contact sheet
node tools/render.mjs --stills 3.4,6.6,12.2,14.1,20.6 --sheet
```

Fonts (Outfit, Plus Jakarta Sans, JetBrains Mono, Instrument Serif) are bundled under the SIL Open Font License. See `fonts/`.

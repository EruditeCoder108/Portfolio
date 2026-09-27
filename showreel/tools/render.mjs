#!/usr/bin/env node
/* Deterministic frame renderer.
   Serves the composition, drives headless Chromium frame-by-frame (each frame = N motion-blur
   sub-samples composited in WebGL), writes PNGs, synthesises the soundtrack and muxes the MP4.

   node tools/render.mjs                      full render -> showreel.mp4
   node tools/render.mjs --stills 0.6,2.1     single frames at given seconds -> frames/still-*.png
   node tools/render.mjs --from 4 --to 6      partial range (seconds) -> frames/, no encode
   options: --workers 3 --samples 6 --shutter 0.6 --out showreel.mp4 --sheet (contact sheet of stills) */

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return def;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};

const CUES = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/cues.js'), 'utf8').match(/=\s*(\{[\s\S]*\})\s*;/)[1]);
const FPS = 60, DUR = (CUES.beats * 60) / CUES.bpm, TOTAL = Math.round(FPS * DUR);
const workers = Number(opt('workers', 3));
const samples = Number(opt('samples', 6));
const shutter = Number(opt('shutter', 0.6));
const framesDir = path.resolve(ROOT, opt('frames', 'frames'));
const outFile = path.resolve(ROOT, opt('out', 'showreel.mp4'));
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
fs.mkdirSync(framesDir, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.wav': 'audio/wav' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html?render`;

// one browser per worker: pages in a shared browser serialise on its single GPU (SwiftShader) process
const browsers = [];
async function openPage() {
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--force-color-profile=srgb'],
  });
  browsers.push(browser);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(url);
  await page.evaluate(() => window.REEL.ready);
  return page;
}

async function renderList(frames, name = f => `${String(f).padStart(5, '0')}.png`) {
  const queue = [...frames];
  let done = 0;
  const t0 = Date.now();
  await Promise.all(Array.from({ length: Math.min(workers, frames.length) }, async () => {
    const page = await openPage();
    while (queue.length) {
      const f = queue.shift();
      await page.evaluate(([f, s, sh]) => window.REEL.renderFrame(f, s, sh), [f, samples, shutter]);
      await page.screenshot({ path: path.join(framesDir, name(f)), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
      done++;
      if (done % 30 === 0 || done === frames.length) {
        const el = (Date.now() - t0) / 1000;
        process.stdout.write(`\r  ${done}/${frames.length} frames  ${el.toFixed(0)}s  eta ${((el / done) * (frames.length - done)).toFixed(0)}s   `);
      }
    }
    await page.close();
  }));
  process.stdout.write('\n');
}

const stills = opt('stills', null);
if (stills) {
  const times = String(stills).split(',').map(Number);
  const frames = times.map(t => Math.min(TOTAL - 1, Math.round(t * FPS)));
  await renderList(frames, f => `still-${(f / FPS).toFixed(3)}.png`);
  console.log(times.map(t => path.join(framesDir, `still-${(Math.min(TOTAL - 1, Math.round(t * FPS)) / FPS).toFixed(3)}.png`)).join('\n'));
  if (opt('sheet', false)) {
    const list = frames.map(f => path.join(framesDir, `still-${(f / FPS).toFixed(3)}.png`));
    const cols = Math.min(3, list.length), rows = Math.ceil(list.length / cols);
    const inputs = list.flatMap(p => ['-i', p]);
    const layout = list.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|');
    const scaled = list.map((_, i) => `[${i}:v]scale=640:360[s${i}]`).join(';');
    const pads = list.map((_, i) => `[s${i}]`).join('');
    spawnSync(ffmpeg, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', `${scaled};${pads}xstack=inputs=${list.length}:layout=${layout}:fill=black[o]`, '-map', '[o]', path.join(framesDir, 'sheet.png')], { stdio: 'inherit' });
    console.log(path.join(framesDir, 'sheet.png'), `${cols}x${rows}`);
  }
} else {
  const from = Math.round(Number(opt('from', 0)) * FPS), to = Math.min(TOTAL, Math.round(Number(opt('to', DUR)) * FPS));
  const frames = [];
  for (let f = from; f < to; f++) frames.push(f);
  console.log(`rendering frames ${from}–${to - 1} with ${workers} workers, ${samples} samples/frame`);
  await renderList(frames);
  if (from === 0 && to === TOTAL && !opt('no-encode', false)) {
    const wav = path.join(ROOT, 'showreel-audio.wav');
    const py = spawnSync(process.env.PYTHON || 'python3', [path.join(ROOT, 'tools/audio.py'), wav], { stdio: 'inherit' });
    if (py.status !== 0) throw new Error('audio synthesis failed');
    const enc = spawnSync(ffmpeg, [
      '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(framesDir, '%05d.png'), '-i', wav,
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
      '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', outFile,
    ], { stdio: 'inherit' });
    if (enc.status !== 0) throw new Error('ffmpeg encode failed');
    console.log(`wrote ${outFile}`);
  }
}

await Promise.all(browsers.map(b => b.close()));
server.close();

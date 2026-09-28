/* WebGL2 compositor.
   Each output frame = average of N sub-frame renders (true shutter motion blur, accumulated in
   linear light), followed by a bloom chain, vignette, and film grain. Per-sample passes add
   chromatic aberration, glitch displacement and flashes so those effects are motion-blurred too. */

const Post = (() => {
  let gl, src, acc = [], ping = 0, levels = {}, progs = {}, vao, N = 1, sampleIdx = 0;

  const VS = `#version 300 es
  in vec2 p; out vec2 uv;
  void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

  const HEAD = `#version 300 es
  precision highp float;
  in vec2 uv; out vec4 o;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  `;

  const FS_ACC = HEAD + `
  uniform sampler2D src, prev;
  uniform float w, ab, gAmt, tm, flash, first, flute, fluteN, flutePh;
  uniform vec3 flashCol;
  vec3 lin(vec3 c){ return pow(max(c, 0.0), vec3(2.2)); }
  void main(){
    vec2 q = uv;
    if (gAmt > 0.001) {
      float tt = floor(tm * 30.0);
      float b1 = floor(q.y * 14.0), b2 = floor(q.y * 70.0);
      if (h(vec2(b1, tt)) < gAmt * 0.6) q.x += (h(vec2(b1, tt + 1.7)) - 0.5) * 0.18 * gAmt;
      if (h(vec2(b2, tt + 4.1)) < gAmt * 0.4) q.x += (h(vec2(b2, tt + 2.3)) - 0.5) * 0.06 * gAmt;
    }
    // fluted (reeded) glass: every rib shows a magnified, slightly swept slice of what is behind it
    float rib = 0.0;
    if (flute > 0.001) {
      float x = q.x * fluteN + flutePh;
      float f = fract(x) - 0.5;
      rib = f;
      q.x -= f * (flute * 1.35) / fluteN;
      q.y += (f * f - 0.083) * flute * 0.035;
    }
    vec2 d = (q - 0.5) * vec2(1.0, 0.5625);
    float a = ab + gAmt * 0.02 + flute * 0.006;
    vec2 off = d * a + vec2(gAmt * 0.004, 0.0);
    vec3 c = vec3(texture(src, q + off).r, texture(src, q).g, texture(src, q - off).b);
    c = lin(mix(c, flashCol, clamp(flash, 0.0, 1.0)));
    if (flute > 0.001) {
      float spec = exp(-pow((rib + 0.28) * 9.0, 2.0)) * 0.55 + exp(-pow((rib - 0.47) * 22.0, 2.0)) * 0.35;
      c = c * (1.0 - flute * 0.18 * (rib * rib * 4.0)) + vec3(spec) * flute * 0.22;
    }
    vec3 pr = first > 0.5 ? vec3(0.0) : texture(prev, uv).rgb;
    o = vec4(pr + c * w, 1.0);
  }`;

  const FS_BRIGHT = HEAD + `
  uniform sampler2D src; uniform vec2 texel; uniform float thr;
  void main(){
    vec3 c = texture(src, uv + texel * vec2(-0.5,-0.5)).rgb + texture(src, uv + texel * vec2(0.5,-0.5)).rgb
           + texture(src, uv + texel * vec2(-0.5, 0.5)).rgb + texture(src, uv + texel * vec2(0.5, 0.5)).rgb;
    c *= 0.25;
    float l = max(max(c.r, max(c.g, c.b)) * 0.7, dot(c, vec3(0.2126, 0.7152, 0.0722)));
    float k = smoothstep(thr, thr + 0.3, l);
    o = vec4(c * k, 1.0);
  }`;

  const FS_DOWN = HEAD + `
  uniform sampler2D src; uniform vec2 texel;
  void main(){
    vec3 c = texture(src, uv + texel * vec2(-1.0,-1.0)).rgb + texture(src, uv + texel * vec2(1.0,-1.0)).rgb
           + texture(src, uv + texel * vec2(-1.0, 1.0)).rgb + texture(src, uv + texel * vec2(1.0, 1.0)).rgb;
    o = vec4(c * 0.25, 1.0);
  }`;

  const FS_BLUR = HEAD + `
  uniform sampler2D src; uniform vec2 dir;
  void main(){
    vec3 c = texture(src, uv).rgb * 0.227027;
    c += (texture(src, uv + dir * 1.3846).rgb + texture(src, uv - dir * 1.3846).rgb) * 0.316216;
    c += (texture(src, uv + dir * 3.2307).rgb + texture(src, uv - dir * 3.2307).rgb) * 0.070270;
    o = vec4(c, 1.0);
  }`;

  // anamorphic streak source: only the hottest highlights, squeezed vertically
  const FS_STREAK = HEAD + `
  uniform sampler2D src; uniform vec2 texel;
  void main(){
    vec3 c = texture(src, uv).rgb + texture(src, uv + vec2(0.0, texel.y)).rgb + texture(src, uv - vec2(0.0, texel.y)).rgb;
    c /= 3.0;
    float l = max(c.r, max(c.g, c.b));
    o = vec4(c * smoothstep(0.35, 0.9, l), 1.0);
  }`;

  const FS_FINAL = HEAD + `
  uniform sampler2D acc, b1, b2, b3, stk;
  uniform float bloom, vig, grain, tm, lift, flare, halo;
  uniform vec2 res;
  void main(){
    vec3 c = texture(acc, uv).rgb;
    vec3 bl = texture(b1, uv).rgb * 0.55 + texture(b2, uv).rgb * 0.8 + texture(b3, uv).rgb * 1.1;
    c += bl * bloom;
    c += texture(stk, uv).rgb * vec3(0.32, 0.58, 1.0) * flare;        // anamorphic lens streaks
    c += texture(b1, uv).rgb * vec3(1.0, 0.32, 0.1) * halo;            // film halation around hot edges
    vec2 d = uv - 0.5; d.x *= 1.7778;
    c *= 1.0 - vig * smoothstep(0.35, 1.2, length(d));
    c = c / (1.0 + max(c - 0.85, 0.0) * 0.9);   // gentle highlight shoulder
    c = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
    c += lift;
    float n = h(floor(uv * res) + fract(tm * 7.13) * 91.7) + h(floor(uv * res) * 1.37 + fract(tm * 3.1) * 57.3) - 1.0;
    c += n * grain;
    o = vec4(c, 1.0);
  }`;

  function compile(fs) {
    const p = gl.createProgram();
    for (const [type, s] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]]) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    }
    gl.bindAttribLocation(p, 0, 'p');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p, u };
  }

  function tex(w, h, internal, format, type) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  function target(w, h, hi = false) {
    const t = hi ? tex(w, h, gl.RGBA32F, gl.RGBA, gl.FLOAT) : tex(w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, f, w, h };
  }

  function init(canvas) {
    gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL2 unavailable');
    gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    progs.acc = compile(FS_ACC);
    progs.bright = compile(FS_BRIGHT);
    progs.down = compile(FS_DOWN);
    progs.blur = compile(FS_BLUR);
    progs.fin = compile(FS_FINAL);
    progs.streak = compile(FS_STREAK);
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    src = tex(W, H, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    acc = [target(W, H, true), target(W, H, true)];
    const sizes = [[W / 2, H / 2], [W / 4, H / 4], [W / 8, H / 8], [W / 16, H / 16]].map(([w, h]) => [Math.round(w), Math.round(h)]);
    levels.l0 = target(...sizes[0]);
    levels.l1 = target(...sizes[1]); levels.l1b = target(...sizes[1]);
    levels.l2 = target(...sizes[2]); levels.l2b = target(...sizes[2]);
    levels.l3 = target(...sizes[3]); levels.l3b = target(...sizes[3]);
    levels.s1 = target(...sizes[1]); levels.s2 = target(...sizes[1]);
  }

  function draw(prog, dst, texs, uniforms) {
    gl.useProgram(prog.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.f : null);
    gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
    let unit = 0;
    for (const [name, t] of Object.entries(texs)) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1i(prog.u[name], unit++);
    }
    for (const [name, v] of Object.entries(uniforms)) {
      const loc = prog.u[name];
      if (loc == null) continue;
      if (Array.isArray(v)) (v.length === 2 ? gl.uniform2fv : gl.uniform3fv).call(gl, loc, v);
      else gl.uniform1f(loc, v);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function begin(samples) { N = samples; sampleIdx = 0; }

  /** add one sub-frame rendered into the 2D canvas */
  function add(sceneCanvas, fx, t) {
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, sceneCanvas);
    const out = acc[ping ^ 1], prev = acc[ping];
    draw(progs.acc, out, { src, prev: prev.t }, {
      w: 1 / N, ab: fx.aberr, gAmt: fx.glitch, tm: t, flash: fx.flash, flashCol: fx.flashCol, first: sampleIdx === 0 ? 1 : 0,
      flute: fx.flute || 0, fluteN: 46, flutePh: fx.flutePh || 0,
    });
    ping ^= 1;
    sampleIdx++;
  }

  function finish(fx, t) {
    const a = acc[ping];
    const L = levels;
    draw(progs.bright, L.l0, { src: a.t }, { texel: [1 / W, 1 / H], thr: fx.bloomThr });
    draw(progs.down, L.l1, { src: L.l0.t }, { texel: [1 / L.l0.w, 1 / L.l0.h] });
    draw(progs.blur, L.l1b, { src: L.l1.t }, { dir: [1 / L.l1.w, 0] });
    draw(progs.blur, L.l1, { src: L.l1b.t }, { dir: [0, 1 / L.l1.h] });
    draw(progs.down, L.l2, { src: L.l1.t }, { texel: [1 / L.l1.w, 1 / L.l1.h] });
    draw(progs.blur, L.l2b, { src: L.l2.t }, { dir: [1 / L.l2.w, 0] });
    draw(progs.blur, L.l2, { src: L.l2b.t }, { dir: [0, 1 / L.l2.h] });
    draw(progs.down, L.l3, { src: L.l2.t }, { texel: [1 / L.l2.w, 1 / L.l2.h] });
    draw(progs.blur, L.l3b, { src: L.l3.t }, { dir: [1 / L.l3.w, 0] });
    draw(progs.blur, L.l3, { src: L.l3b.t }, { dir: [0, 1 / L.l3.h] });
    const sw = L.s1.w;
    draw(progs.streak, L.s1, { src: L.l0.t }, { texel: [1 / L.l0.w, 1 / L.l0.h] });
    let from = L.s1, to = L.s2;
    for (const k of [1.5, 4, 10, 24]) {
      draw(progs.blur, to, { src: from.t }, { dir: [k / sw, 0] });
      [from, to] = [to, from];
    }
    draw(progs.fin, null, { acc: a.t, b1: L.l1.t, b2: L.l2.t, b3: L.l3.t, stk: from.t }, {
      bloom: fx.bloom, vig: fx.vig, grain: fx.grain, tm: t, lift: fx.lift || 0, res: [W, H],
      flare: fx.flare ?? 0.55, halo: fx.halo ?? 0.07,
    });
    gl.finish();
  }

  return { init, begin, add, finish };
})();

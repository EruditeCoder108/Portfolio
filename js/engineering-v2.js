/* Engineering Core v2 — progressive, performance-aware enhancement layer. */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const $ = (s, r=document) => r.querySelector(s);
    const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
    const card = $('#heroCard');
    const back = $('#cardFaceBack');

    // Conservative hardware adaptation. Never removes core interactions/3D flip.
    const coarse = matchMedia('(pointer: coarse)').matches;
    const lowThreads = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    if (coarse || lowThreads || lowMemory) document.documentElement.classList.add('perf-constrained');

    // Naming + metadata consistency for the live DOM.
    const avatar = $('#avatarMascot');
    if (avatar) avatar.removeAttribute('title');
    const technicalBtn = $('#modeBtnEngineer');
    if (technicalBtn) {
      technicalBtn.title = 'Switch to Technical / Architecture View';
      technicalBtn.setAttribute('aria-label', 'Technical view');
    }
    document.title = 'Sambhav Jain — Systems, Distributed Software & AI Engineer';
    const description = 'Sambhav Jain — Systems, Distributed Software & AI Engineer. Deterministic AST infrastructure, offline mesh protocols, local-first systems and hardware-backed products.';
    const descEl = $('meta[name="description"]'); if (descEl) descEl.content = description;
    const ogTitle = $('meta[property="og:title"]'); if (ogTitle) ogTitle.content = document.title;
    const ogDesc = $('meta[property="og:description"]'); if (ogDesc) ogDesc.content = description;
    const twTitle = $('meta[name="twitter:title"]'); if (twTitle) twTitle.content = document.title;
    const twDesc = $('meta[name="twitter:description"]'); if (twDesc) twDesc.content = description;

    // Truth-first simulator labels, inserted only once.
    const hyphaCard = $('#btnHyphaSimStep')?.closest('.interactive-simulator-card');
    if (hyphaCard && !hyphaCard.dataset.v2Labeled) {
      hyphaCard.dataset.v2Labeled = 'true';
      const title = $('.sim-title, .sim-title-group strong, .sim-title-group', hyphaCard);
      if (title && !/protocol simulator/i.test(title.textContent)) title.insertAdjacentHTML('beforeend', ' <span class="sim-badge">PROTOCOL SIMULATOR</span>');
      hyphaCard.insertAdjacentHTML('beforeend', '<p class="v2-sim-note">Deterministic browser visualization of Hypha custody/routing states. Cryptographic labels mirror the production architecture; this panel does <strong>not</strong> pretend to execute the Rust core.</p>');
    }
    const fsrsCard = $('#fsrsSliderStability')?.closest('.interactive-simulator-card');
    if (fsrsCard && !fsrsCard.dataset.v2Labeled) {
      fsrsCard.dataset.v2Labeled = 'true';
      $$('.sim-badge', fsrsCard).forEach(el => { if (/FSRS-4\.5/i.test(el.textContent)) el.textContent = 'FSRS-INSPIRED MODEL'; });
      fsrsCard.insertAdjacentHTML('beforeend', '<p class="v2-sim-note">This compact portfolio visualizer is intentionally labeled <strong>FSRS-inspired</strong>. The production Erudite scheduler remains the source of truth for the full parameterized FSRS implementation.</p>');
    }

    // Engineering diagnostics are completely dormant until the hidden core is opened.
    if (back) {
      const dock = $('.eng-action-dock', back);
      const panel = document.createElement('section');
      panel.className = 'eng-v2-panel';
      panel.setAttribute('aria-label', 'Live browser performance diagnostics');
      panel.innerHTML = `
        <div class="eng-v2-head"><span class="eng-v2-title">FIELD PERFORMANCE // LIVE</span><span class="eng-v2-source">SLEEPING</span></div>
        <div class="eng-v2-grid">
          <div class="eng-v2-metric"><span class="eng-v2-k">FPS</span><span class="eng-v2-v pending" id="v2Fps">—</span></div>
          <div class="eng-v2-metric"><span class="eng-v2-k">FRAME</span><span class="eng-v2-v pending" id="v2Frame">—</span></div>
          <div class="eng-v2-metric"><span class="eng-v2-k">LCP</span><span class="eng-v2-v pending" id="v2Lcp">pending</span></div>
          <div class="eng-v2-metric"><span class="eng-v2-k">CLS</span><span class="eng-v2-v pending" id="v2Cls">pending</span></div>
          <div class="eng-v2-metric"><span class="eng-v2-k">INP</span><span class="eng-v2-v pending" id="v2Inp">pending</span></div>
          <div class="eng-v2-metric"><span class="eng-v2-k">DOM</span><span class="eng-v2-v" id="v2Dom">—</span></div>
          <div class="eng-v2-metric"><span class="eng-v2-k">HEAP</span><span class="eng-v2-v" id="v2Heap">N/A</span></div>
          <div class="eng-v2-metric"><span class="eng-v2-k">REFRESH</span><span class="eng-v2-v" id="v2Refresh">adaptive</span></div>
        </div>
        <div class="eng-v2-actions"><button class="eng-v2-btn" id="v2RunDiag">RUN DIAGNOSTIC</button><button class="eng-v2-btn" id="v2ToggleProfiler">RAW PROFILER</button></div>`;
      if (dock) back.insertBefore(panel, dock); else back.appendChild(panel);

      const setMetric = (id, text, grade) => { const el = $('#'+id); if (!el) return; el.textContent = text; el.className = 'eng-v2-v' + (grade ? ' '+grade : ''); };
      const source = $('.eng-v2-source', panel);
      const good = (name, value) => name==='LCP' ? value<=2500 : name==='CLS' ? value<=.1 : value<=200;
      const formatVital = (name, value) => name==='CLS' ? value.toFixed(3) : name==='LCP' ? (value/1000).toFixed(2)+'s' : Math.round(value)+'ms';
      let vitalsLoaded = false;
      let samplerRunning = false;
      let frames = 0;
      let sampleStart = 0;
      let lastStaticUpdate = 0;

      const updateStatic = () => {
        setMetric('v2Dom', String(document.getElementsByTagName('*').length));
        if (performance.memory?.usedJSHeapSize) setMetric('v2Heap',(performance.memory.usedJSHeapSize/1048576).toFixed(1)+' MB');
      };

      const loadVitalsOnce = () => {
        if (vitalsLoaded) return;
        vitalsLoaded = true;
        import('https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module').then(({onLCP,onCLS,onINP}) => {
          const report = m => setMetric('v2'+m.name[0]+m.name.slice(1).toLowerCase(), formatVital(m.name,m.value), good(m.name,m.value)?'good':'warn');
          onLCP(report, {reportAllChanges:true});
          onCLS(report, {reportAllChanges:true});
          onINP(report, {reportAllChanges:true});
        }).catch(() => ['v2Lcp','v2Cls','v2Inp'].forEach(id => setMetric(id,'unavailable','pending')));
      };

      function sample(now) {
        if (!samplerRunning) return;
        const visible = card?.classList.contains('is-engineering-flipped') && !document.hidden;
        if (!visible) {
          samplerRunning = false;
          if (source) source.textContent = 'SLEEPING';
          return;
        }
        frames++;
        const span = now - sampleStart;
        if (span >= 900) {
          const fps = frames * 1000 / span;
          const frame = span / frames;
          setMetric('v2Fps', fps.toFixed(1), fps>=50?'good':'warn');
          setMetric('v2Frame', frame.toFixed(2)+'ms', frame<=20?'good':'warn');
          setMetric('v2Refresh', Math.round(fps)+'Hz observed');
          frames = 0;
          sampleStart = now;
        }
        if (now - lastStaticUpdate >= 3000) {
          updateStatic();
          lastStaticUpdate = now;
        }
        requestAnimationFrame(sample);
      }

      const wakeDiagnostics = () => {
        if (samplerRunning || !card?.classList.contains('is-engineering-flipped')) return;
        samplerRunning = true;
        frames = 0;
        sampleStart = performance.now();
        lastStaticUpdate = 0;
        if (source) source.textContent = 'MEASURED';
        updateStatic();
        loadVitalsOnce();
        requestAnimationFrame(sample);
      };

      // Watch only the hero's class changes; no polling loop on the landing page.
      if (card) {
        new MutationObserver(() => {
          if (card.classList.contains('is-engineering-flipped')) wakeDiagnostics();
          else { samplerRunning = false; if (source) source.textContent = 'SLEEPING'; }
        }).observe(card, {attributes:true, attributeFilter:['class']});
      }

      $('#v2RunDiag')?.addEventListener('click', () => {
        const t0=performance.now();
        const nodes=document.getElementsByTagName('*').length;
        const elapsed=performance.now()-t0;
        updateStatic();
        const result=$('#benchmarkResultText');
        if (result) result.textContent=`${elapsed.toFixed(2)}ms DOM census • ${nodes} nodes • measured locally`;
        const bar=$('#benchmarkResultBar'); if (bar) bar.style.display='flex';
      });

      $('#btnRunBenchmark')?.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        $('#v2RunDiag')?.click();
      }, true);

      $('#v2ToggleProfiler')?.addEventListener('click', () => {
        panel.classList.toggle('is-profiler-open');
        if (source) source.textContent=panel.classList.contains('is-profiler-open') ? 'RAW / LOCAL' : (samplerRunning ? 'MEASURED' : 'SLEEPING');
      });
    }

    // Drag-to-carry Hypha demo.
    const bob = $('#nodeBob');
    const alice = $('#nodeAlice');
    const charlie = $('#nodeCharlie');
    const meshContainer = bob?.parentElement;
    if (bob && alice && charlie && meshContainer) {
      bob.classList.add('v2-draggable');
      let dragging=false, startX=0, baseX=0, x=0;
      const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
      const log=$('#hyphaTelemetryLog');
      const addLog=(txt)=>{ if(!log)return; const row=document.createElement('div'); row.className='log-row'; row.innerHTML=`<span class="log-time">LIVE</span><span class="log-msg">${txt}</span>`; log.appendChild(row); log.scrollTop=log.scrollHeight; };
      bob.addEventListener('pointerdown',e=>{ dragging=true; startX=e.clientX; baseX=x; bob.setPointerCapture(e.pointerId); });
      bob.addEventListener('pointermove',e=>{ if(!dragging)return; const max=Math.max(60,meshContainer.clientWidth*.28); x=clamp(baseX+(e.clientX-startX),-max,max); bob.style.transform=`translateX(${x}px)`; const ratio=x/max; bob.dataset.zone=ratio<-.55?'alice':ratio>.55?'charlie':'carrier'; });
      bob.addEventListener('pointerup',e=>{ if(!dragging)return; dragging=false; bob.releasePointerCapture(e.pointerId); const zone=bob.dataset.zone||'carrier'; if(zone==='alice') addLog('Carrier entered Alice proximity zone — BLE discovery/handshake path available.'); else if(zone==='charlie') addLog('Carrier entered Charlie proximity zone — bulk delivery path available.'); else addLog('Carrier is between peers — bundle remains in store-and-forward custody.'); });
    }

    // Replace theatrical terminal wording with measurable claims.
    const cmdInput=$('#cmdSearchInput');
    cmdInput?.addEventListener('keydown',e=>{
      if(e.key==='Enter' && /^benchmark\b/i.test(cmdInput.value.trim())) {
        setTimeout(()=>{
          const out=$('#cmdConsoleOutput');
          if(out && /ZERO REFLOWS CONFIRMED|120 FPS Hardware Accelerated|100% HEALTHY/i.test(out.textContent)) {
            const nodes=document.getElementsByTagName('*').length;
            out.textContent=`$ benchmark --system\n=============================================\nPORTFOLIO RUNTIME DIAGNOSTIC\n=============================================\nDOM Node Count      : ${nodes}\nFramework Runtime   : Vanilla JS\nAnimation Cadence   : refresh-synchronized requestAnimationFrame\nAudio Subsystem     : Web Audio API procedural synthesis\nWeb Vitals          : see FIELD PERFORMANCE panel\n=============================================\nSTATUS: measured locally; no synthetic grade assigned`;
          }
        },0);
      }
    },true);

    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotionState=()=>document.documentElement.dataset.motion = mq.matches ? 'reduced' : 'full';
    applyMotionState(); mq.addEventListener?.('change',applyMotionState);
  });
})();

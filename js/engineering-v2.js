/* Engineering Core v2 — progressive, deterministic enhancement layer. */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const $ = (s, r=document) => r.querySelector(s);
    const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
    const card = $('#heroCard');
    const back = $('#cardFaceBack');

    // 1) Naming + metadata consistency for the live DOM.
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

    // 2) Truth-first simulator labels. The current browser demos visualize architecture; they do not claim to execute the Rust/crypto cores.
    const hyphaCard = $('#btnHyphaSimStep')?.closest('.interactive-simulator-card');
    if (hyphaCard) {
      const title = $('.sim-title, .sim-title-group strong, .sim-title-group', hyphaCard);
      if (title && !/protocol simulator/i.test(title.textContent)) title.insertAdjacentHTML('beforeend', ' <span class="sim-badge">PROTOCOL SIMULATOR</span>');
      hyphaCard.insertAdjacentHTML('beforeend', '<p class="v2-sim-note">Deterministic browser visualization of Hypha custody/routing states. Cryptographic labels mirror the production architecture; this panel does <strong>not</strong> pretend to execute the Rust core.</p>');
    }
    const fsrsCard = $('#fsrsSliderStability')?.closest('.interactive-simulator-card');
    if (fsrsCard) {
      const labels = $$('.sim-badge', fsrsCard);
      labels.forEach(el => { if (/FSRS-4\.5/i.test(el.textContent)) el.textContent = 'FSRS-INSPIRED MODEL'; });
      fsrsCard.insertAdjacentHTML('beforeend', '<p class="v2-sim-note">This compact portfolio visualizer is intentionally labeled <strong>FSRS-inspired</strong>. The production Erudite scheduler remains the source of truth for the full parameterized FSRS implementation.</p>');
    }

    // 3) Real diagnostics / Web Vitals panel.
    if (back) {
      const dock = $('.eng-action-dock', back);
      const panel = document.createElement('section');
      panel.className = 'eng-v2-panel';
      panel.setAttribute('aria-label', 'Live browser performance diagnostics');
      panel.innerHTML = `
        <div class="eng-v2-head"><span class="eng-v2-title">FIELD PERFORMANCE // LIVE</span><span class="eng-v2-source">MEASURED</span></div>
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
      const good = (name, value) => name==='LCP' ? value<=2500 : name==='CLS' ? value<=.1 : value<=200;
      const formatVital = (name, value) => name==='CLS' ? value.toFixed(3) : name==='LCP' ? (value/1000).toFixed(2)+'s' : Math.round(value)+'ms';

      // Standards-based Web Vitals; dynamically loaded so normal landing cost remains unchanged.
      import('https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module').then(({onLCP,onCLS,onINP}) => {
        const report = m => setMetric('v2'+m.name[0]+m.name.slice(1).toLowerCase(), formatVital(m.name,m.value), good(m.name,m.value)?'good':'warn');
        onLCP(report, {reportAllChanges:true});
        onCLS(report, {reportAllChanges:true});
        onINP(report, {reportAllChanges:true});
      }).catch(() => {
        // Leave standards metrics explicitly unavailable instead of fabricating values.
        ['v2Lcp','v2Cls','v2Inp'].forEach(id => setMetric(id,'unavailable','pending'));
      });

      // One lightweight refresh-synchronized sampler. It sleeps when the page is hidden.
      let frames=0, sampleStart=performance.now(), last=sampleStart, rafId=0;
      function sample(now) {
        if (document.hidden) { rafId=requestAnimationFrame(sample); return; }
        frames++;
        const span=now-sampleStart;
        if (span>=700) {
          const fps=frames*1000/span;
          const frame=span/frames;
          setMetric('v2Fps', fps.toFixed(1), fps>=55?'good':'warn');
          setMetric('v2Frame', frame.toFixed(2)+'ms', frame<=18?'good':'warn');
          setMetric('v2Refresh', Math.round(fps)+'Hz observed');
          frames=0; sampleStart=now;
        }
        last=now; rafId=requestAnimationFrame(sample);
      }
      rafId=requestAnimationFrame(sample);

      const updateStatic = () => {
        setMetric('v2Dom', String(document.querySelectorAll('*').length));
        if (performance.memory?.usedJSHeapSize) setMetric('v2Heap',(performance.memory.usedJSHeapSize/1048576).toFixed(1)+' MB');
      };
      updateStatic();

      $('#v2RunDiag')?.addEventListener('click', () => {
        const t0=performance.now();
        const nodes=document.querySelectorAll('*').length;
        let checksum=0; for (const n of document.querySelectorAll('body *')) checksum += n.nodeType;
        const elapsed=performance.now()-t0;
        updateStatic();
        const result=$('#benchmarkResultText');
        if (result) result.textContent=`${elapsed.toFixed(2)}ms DOM traversal • ${nodes} nodes • checksum ${checksum} • measured locally`;
        const bar=$('#benchmarkResultBar'); if (bar) bar.style.display='flex';
      });

      // Prevent the legacy benchmark from always claiming A+ / zero reflows.
      $('#btnRunBenchmark')?.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        $('#v2RunDiag')?.click();
      }, true);

      $('#v2ToggleProfiler')?.addEventListener('click', () => {
        panel.classList.toggle('is-profiler-open');
        const source=$('.eng-v2-source',panel);
        if (source) source.textContent=panel.classList.contains('is-profiler-open') ? 'RAW / LOCAL' : 'MEASURED';
      });
    }

    // 4) Drag-to-carry Hypha demo: Bob can be physically moved horizontally.
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
      bob.addEventListener('pointermove',e=>{ if(!dragging)return; const max=Math.max(60,meshContainer.clientWidth*.28); x=clamp(baseX+(e.clientX-startX),-max,max); bob.style.transform=`translateX(${x}px)`; const ratio=x/max; if(ratio<-.55) bob.dataset.zone='alice'; else if(ratio>.55) bob.dataset.zone='charlie'; else bob.dataset.zone='carrier'; });
      bob.addEventListener('pointerup',e=>{ if(!dragging)return; dragging=false; bob.releasePointerCapture(e.pointerId); const zone=bob.dataset.zone||'carrier'; if(zone==='alice') addLog('Carrier entered Alice proximity zone — BLE discovery/handshake path available.'); else if(zone==='charlie') addLog('Carrier entered Charlie proximity zone — bulk delivery path available.'); else addLog('Carrier is between peers — bundle remains in store-and-forward custody.'); });
    }

    // 5) Replace theatrical terminal wording with measurable claims.
    const cmdInput=$('#cmdSearchInput');
    cmdInput?.addEventListener('keydown',e=>{
      if(e.key==='Enter' && /^benchmark\b/i.test(cmdInput.value.trim())) {
        setTimeout(()=>{
          const out=$('#cmdConsoleOutput');
          if(out && /ZERO REFLOWS CONFIRMED|120 FPS Hardware Accelerated|100% HEALTHY/i.test(out.textContent)) {
            const nodes=document.querySelectorAll('*').length;
            out.textContent=`$ benchmark --system\n=============================================\nPORTFOLIO RUNTIME DIAGNOSTIC\n=============================================\nDOM Node Count      : ${nodes}\nFramework Runtime   : Vanilla JS\nAnimation Cadence   : refresh-synchronized requestAnimationFrame\nAudio Subsystem     : Web Audio API procedural synthesis\nWeb Vitals          : see FIELD PERFORMANCE panel\n=============================================\nSTATUS: measured locally; no synthetic grade assigned`;
          }
        },0);
      }
    },true);

    // 6) Reduced-motion state is explicit to assistive tech/debuggers.
    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotionState=()=>document.documentElement.dataset.motion = mq.matches ? 'reduced' : 'full';
    applyMotionState(); mq.addEventListener?.('change',applyMotionState);
  });
})();

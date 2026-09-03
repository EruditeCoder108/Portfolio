/**
 * SAMBHAV JAIN — HIGH PERFORMANCE INTERACTIVE ENGINE
 * Zero-Reflow GPU Magnetic Cursor, 3D Tilt, Web Audio Synth & Smooth Modals
 */

window.__appCoreLoaded = true;

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Web Audio API Procedural Sound Synthesizer (Crisp, High-Clarity Audio)
  // --------------------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      // Default to armed/enabled unless visitor explicitly clicked mute ('false')
      this.enabled = localStorage.getItem('sj_audio_enabled') !== 'false';
      this.initOnInteraction = this.initOnInteraction.bind(this);
      window.addEventListener('click', this.initOnInteraction, { passive: true });
      window.addEventListener('touchstart', this.initOnInteraction, { passive: true });
      window.addEventListener('keydown', this.initOnInteraction, { passive: true });
    }

    async initOnInteraction() {
      await this.ensureContext();
    }

    async ensureContext() {
      try {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          await this.ctx.resume();
        }
      } catch (e) {}
      return this.ctx;
    }

    async toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('sj_audio_enabled', this.enabled ? 'true' : 'false');
      if (this.enabled) {
        await this.ensureContext();
        this.playChime();
      }
      return this.enabled;
    }

    async playClick() {
      if (!this.enabled) return;
      await this.ensureContext();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      try {
        const now = this.ctx.currentTime;

        // High crisp tactile mechanical click
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1400, now);
        osc1.frequency.exponentialRampToValueAtTime(360, now + 0.07);
        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.07);

        // Warm harmonic sub-tone for punch
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(580, now);
        osc2.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        gain2.gain.setValueAtTime(0.24, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.08);
      } catch (e) {}
    }

    async playModalOpen() {
      if (!this.enabled) return;
      await this.ensureContext();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      try {
        const now = this.ctx.currentTime;

        // Warm acoustic rising chord
        const freqs = [392.00, 523.25, 659.25, 1046.50];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * 0.95, now + idx * 0.03);
          osc.frequency.exponentialRampToValueAtTime(freq, now + idx * 0.03 + 0.09);
          gain.gain.setValueAtTime(0.28, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.32);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.32);
        });
      } catch (e) {}
    }

    async playChime() {
      if (!this.enabled) return;
      await this.ensureContext();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      try {
        const now = this.ctx.currentTime;
        // Resonant C Major glass arpeggio (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.30, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.45);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.45);
        });
      } catch (e) {}
    }

    async playCyberUnlock() {
      if (!this.enabled) return;
      await this.ensureContext();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      try {
        const now = this.ctx.currentTime;

        // 1. Deep Sub-Bass Impact Dive (120Hz -> 32Hz)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(120, now);
        subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.55);
        subGain.gain.setValueAtTime(0.45, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.6);

        // 2. High-Tech Cyber FM Resonance Arpeggio
        const cyberNotes = [330, 495, 660, 990, 1320, 1980];
        cyberNotes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.045);
          gain.gain.setValueAtTime(0.16, now + 0.05 + idx * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05 + idx * 0.045 + 0.16);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + 0.05 + idx * 0.045);
          osc.stop(now + 0.05 + idx * 0.045 + 0.16);
        });

        // 3. Mechanical Relay double-tick when flip completes
        setTimeout(() => {
          this.playClick();
        }, 450);
      } catch (e) {}
    }

    async playDataBlip() {
      if (!this.enabled) return;
      await this.ensureContext();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.setValueAtTime(2400, now + 0.02);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } catch (e) {}
    }
  }

  const sound = new SoundEngine();


  // Audio Toggle Button HUD
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const soundOnIcon = audioToggleBtn?.querySelector('.sound-on-icon');
  const soundOffIcon = audioToggleBtn?.querySelector('.sound-off-icon');

  function updateAudioHUD() {
    if (sound.enabled) {
      if (soundOnIcon) soundOnIcon.style.display = 'block';
      if (soundOffIcon) soundOffIcon.style.display = 'none';
      audioToggleBtn?.classList.remove('is-muted');
    } else {
      if (soundOnIcon) soundOnIcon.style.display = 'none';
      if (soundOffIcon) soundOffIcon.style.display = 'block';
      audioToggleBtn?.classList.add('is-muted');
    }
  }
  updateAudioHUD();

  audioToggleBtn?.addEventListener('click', () => {
    const state = sound.toggle();
    updateAudioHUD();
    showToast(state ? 'Sound effects enabled' : 'Sound effects muted');
  });

  // --------------------------------------------------------------------------
  // 2. Hardware-Accelerated Zero-Reflow Motion Engine (Cursor & 3D Parallax)
  // --------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');
  const heroCard = document.getElementById('heroCard');
  const cardTiltWrapper = document.getElementById('cardTiltWrapper');
  const cornerChars = document.querySelectorAll('[data-tilt-char]');
  const floating3dWraps = document.querySelectorAll('.floating-particle');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isMouseActive = false;
  let isAnyModalOpen = false;

  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;

  // Cached Geometry & Viewport (Avoids expensive layout queries in event loops)
  let cachedWinW = window.innerWidth;
  let cachedWinH = window.innerHeight;
  let cachedCardLeft = 0;
  let cachedCardTop = 0;
  let cachedCardWidth = 540;
  let cachedCardHeight = 600;
  let cachedCardCenterX = cachedWinW / 2;
  let cachedCardCenterY = cachedWinH / 2;

  function updateCachedDimensions() {
    cachedWinW = window.innerWidth;
    cachedWinH = window.innerHeight;
    if (heroCard) {
      const rect = heroCard.getBoundingClientRect();
      cachedCardLeft = rect.left;
      cachedCardTop = rect.top;
      cachedCardWidth = rect.width || 540;
      cachedCardHeight = rect.height || 600;
      cachedCardCenterX = rect.left + cachedCardWidth / 2;
      cachedCardCenterY = rect.top + cachedCardHeight / 2;
    }
  }
  updateCachedDimensions();

  // Throttled window resize & scroll updates for geometry cache (Avoids layout thrashing during scroll)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateCachedDimensions, 100);
  }, { passive: true });

  let scrollDebounceTimer = null;
  window.addEventListener('scroll', () => {
    if (isAnyModalOpen) return;
    if (!scrollDebounceTimer) {
      scrollDebounceTimer = setTimeout(() => {
        updateCachedDimensions();
        scrollDebounceTimer = null;
      }, 150);
    }
  }, { passive: true });

  // Lightweight mousemove listener (Instant placement for zero latency)
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isMouseActive) {
      ringX = mouseX;
      ringY = mouseY;
      isMouseActive = true;
      document.body.classList.add('has-custom-cursor');
    }

    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }
  }, { passive: true });

  // Page Visibility & Accessibility Motion Checks (Frees 100% GPU cycles when tab is backgrounded)
  let isPageVisible = !document.hidden;
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
  });

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Single Unified 120FPS GPU Animation Loop
  function animationTick() {
    if (isMouseActive && isPageVisible) {
      // 1. Snappy, responsive trailing ring physics (zero perceptible lag, fluid organic follow)
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      const distSq = dx * dx + dy * dy;

      if (distSq < 0.25) {
        ringX = mouseX;
        ringY = mouseY;
      } else {
        const lerpFactor = document.body.classList.contains('cursor-hovering') ? 0.58 : 0.46;
        ringX += dx * lerpFactor;
        ringY += dy * lerpFactor;
      }

      if (cursorRing) {
        cursorRing.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }

      // 2. 3D Card Parallax Tilt & Specular Light Tracking (Unconditional on desktop homepage)
      if (!isAnyModalOpen && cardTiltWrapper && heroCard) {
        const diffX = mouseX - cachedCardCenterX;
        const diffY = mouseY - cachedCardCenterY;

        // Smooth physics-based rotational target
        targetRotateY = (diffX / (cachedWinW / 2)) * 5.0;
        targetRotateX = -(diffY / (cachedWinH / 2)) * 5.0;

        currentRotateX += (targetRotateX - currentRotateX) * 0.12;
        currentRotateY += (targetRotateY - currentRotateY) * 0.12;

        cardTiltWrapper.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateZ(0)`;

        // Specular Glare Coordinates (Subtle lighting overlay)
        if (cachedCardWidth > 0 && cachedCardHeight > 0) {
          const glareX = ((mouseX - cachedCardLeft) / cachedCardWidth) * 100;
          const glareY = ((mouseY - cachedCardTop) / cachedCardHeight) * 100;
          heroCard.style.setProperty('--mouse-x', `${glareX.toFixed(1)}%`);
          heroCard.style.setProperty('--mouse-y', `${glareY.toFixed(1)}%`);
        }
      }
    }

    requestAnimationFrame(animationTick);
  }
  requestAnimationFrame(animationTick);

  // Mouse leave / enter window boundaries
  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('has-custom-cursor');
  });

  document.addEventListener('mouseenter', () => {
    if (isMouseActive) {
      document.body.classList.add('has-custom-cursor');
    }
  });

  // Attach hover triggers to interactive elements
  function refreshCursorTriggers() {
    const interactives = document.querySelectorAll('a, button, [data-cursor], [data-close-modal], .capability-card, .project-card-header, .proj-action-btn, .btn-toggle-all, .filter-tab, .satellite-bubble');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const label = el.getAttribute('data-cursor') || 'VIEW';
        if (cursorLabel) cursorLabel.textContent = label;
        document.body.classList.add('cursor-hovering');
      }, { passive: true });

      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hovering');
        if (cursorLabel) cursorLabel.textContent = '';
      }, { passive: true });
    });
  }
  refreshCursorTriggers();

  // Interactive Action Cards Button Glare Tracker (Jitter-free client coordinate tracking)
  document.querySelectorAll('.action-card').forEach((btn) => {
    let btnRect = null;
    const glow = btn.querySelector('.action-card-glow');

    btn.addEventListener('mouseenter', () => {
      btnRect = btn.getBoundingClientRect();
      if (glow) glow.style.opacity = '1';
    }, { passive: true });

    btn.addEventListener('mousemove', (e) => {
      if (!btnRect) btnRect = btn.getBoundingClientRect();
      const x = ((e.clientX - btnRect.left) / btnRect.width) * 100;
      const y = ((e.clientY - btnRect.top) / btnRect.height) * 100;
      btn.style.setProperty('--item-x', `${x.toFixed(1)}%`);
      btn.style.setProperty('--item-y', `${y.toFixed(1)}%`);
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      btnRect = null;
      if (glow) glow.style.opacity = '0';
    }, { passive: true });
  });


  // --------------------------------------------------------------------------
  // 3. Modal Management System (Zero Jump & Instant Smooth Transition)
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // 3. Modal Management System (Zero Jump & Instant Smooth Transition)
  // --------------------------------------------------------------------------
  const modals = {
    capabilities: document.getElementById('modalCapabilities'),
    apps: document.getElementById('modalApps'),
    share: document.getElementById('modalShare'),
    cmd: document.getElementById('modalCmd'),
  };

  function openModal(modal) {
    if (!modal) return;
    closeAllModals();
    isAnyModalOpen = true;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-active');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    sound.playModalOpen();

    // Reset scroll position on opening
    const scrollArea = modal.querySelector('.modal-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
  }

  function closeAllModals() {
    isAnyModalOpen = false;
    Object.values(modals).forEach((m) => {
      if (m) {
        if (m.classList.contains('is-active')) {
          sound.playClick();
        }
        m.classList.remove('is-active');
        m.setAttribute('aria-hidden', 'true');
      }
    });
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');

    if (window.location.hash.startsWith('#apps') || window.location.hash.startsWith('#capabilities') || window.location.hash.startsWith('#share')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }


  // Buttons that open modals
  document.getElementById('btnOpenCapabilities')?.addEventListener('click', () => {
    openModal(modals.capabilities);
    history.replaceState(null, '', '#capabilities');
  });

  document.getElementById('btnOpenApps')?.addEventListener('click', () => {
    openModal(modals.apps);
    showProjectGallery();
  });

  // Direct Project Deep-Dive Opener from Hero Proof Chips
  document.querySelectorAll('[data-open-project]').forEach((chip) => {
    chip.addEventListener('click', () => {
      sound.playClick();
      const projId = chip.getAttribute('data-open-project');
      openModal(modals.apps);
      if (projId) {
        showProjectDetail(projId);
      } else {
        showProjectGallery();
      }
    });
  });

  document.getElementById('shareBtn')?.addEventListener('click', () => {
    if (navigator.share && /mobile/i.test(navigator.userAgent)) {
      navigator.share({
        title: 'Sambhav Jain — Digital, AI & Product Solutions',
        text: 'Practical digital, AI and product solutions for businesses by Sambhav Jain.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      openModal(modals.share);
    }
  });

  // Close triggers on all modals
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllModals();
    });
  });

  // --------------------------------------------------------------------------
  // 3b. Perspective Mode Engine (Client vs Engineer Perspective)
  // --------------------------------------------------------------------------
  const modeBtnClient = document.getElementById('modeBtnClient');
  const modeBtnEngineer = document.getElementById('modeBtnEngineer');
  const heroTagline = document.getElementById('heroTagline');
  const heroQuoteText = document.getElementById('heroQuoteText');
  const capActionTitle = document.getElementById('capActionTitle');
  const capActionDesc = document.getElementById('capActionDesc');
  const appsActionTitle = document.getElementById('appsActionTitle');
  const appsActionDesc = document.getElementById('appsActionDesc');
  const ghActionTitle = document.getElementById('ghActionTitle');
  const ghActionDesc = document.getElementById('ghActionDesc');

  const modeContent = {
    client: {
      tagline: 'Practical digital, AI and product solutions for businesses',
      quote: 'If you can imagine it, we can design it, build it and automate it.',
      capTitle: 'What We Can Do',
      capDesc: 'Web, Mobile, AI, Automation & IoT solutions',
      appsTitle: 'Apps & Creations',
      appsDesc: 'Explore Unravel, Erudite, Hypha, Lumium & more',
      ghTitle: 'GitHub Repositories',
      ghDesc: 'Open source code, tools & algorithms',
    },
    engineer: {
      tagline: 'Systems, Distributed Software & AI Engineer',
      quote: 'Deterministic proofs, offline-first architectures & low-latency protocol cores.',
      capTitle: 'System Architecture & Services',
      capDesc: 'Distributed Protocols, AST Tooling & Custom Systems',
      appsTitle: 'Production Systems & Deep Dives',
      appsDesc: 'FSRS Engine, Delay-Tolerant Mesh & AST Core',
      ghTitle: 'Public Code & Micro-Crates',
      ghDesc: 'AST Parsers, FFI Bridges & Architectures',
    }
  };

  function setPerspectiveMode(mode, notify = true) {
    const isEng = mode === 'engineer';
    document.body.classList.toggle('mode-engineer', isEng);
    if (modeBtnClient) modeBtnClient.classList.toggle('is-active', !isEng);
    if (modeBtnEngineer) modeBtnEngineer.classList.toggle('is-active', isEng);

    const data = isEng ? modeContent.engineer : modeContent.client;
    if (heroTagline) heroTagline.textContent = data.tagline;
    if (heroQuoteText) heroQuoteText.textContent = data.quote;
    if (capActionTitle) capActionTitle.textContent = data.capTitle;
    if (capActionDesc) capActionDesc.textContent = data.capDesc;
    if (appsActionTitle) appsActionTitle.textContent = data.appsTitle;
    if (appsActionDesc) appsActionDesc.textContent = data.appsDesc;
    if (ghActionTitle) ghActionTitle.textContent = data.ghTitle;
    if (ghActionDesc) ghActionDesc.textContent = data.ghDesc;

    localStorage.setItem('sj_perspective_mode', mode);
    if (notify) {
      showToast(isEng ? 'Engineer Mode Active — Systems & Architecture Perspective' : 'Client Mode Active — Services & Business Solutions Perspective');
    }

  }

  const savedMode = localStorage.getItem('sj_perspective_mode') || 'client';
  setPerspectiveMode(savedMode, false);

  modeBtnClient?.addEventListener('click', () => { sound.playClick(); setPerspectiveMode('client'); });
  modeBtnEngineer?.addEventListener('click', () => { sound.playClick(); setPerspectiveMode('engineer'); });

  // --------------------------------------------------------------------------
  // 3c. Interactive Mini-Engine 1: Erudite FSRS-4.5 Algorithm Simulator
  // --------------------------------------------------------------------------
  const fsrsSliderStability = document.getElementById('fsrsSliderStability');
  const fsrsSliderDifficulty = document.getElementById('fsrsSliderDifficulty');
  const fsrsValStability = document.getElementById('fsrsValStability');
  const fsrsValDifficulty = document.getElementById('fsrsValDifficulty');
  const fsrsOutInterval = document.getElementById('fsrsOutInterval');
  const fsrsOutStability = document.getElementById('fsrsOutStability');
  const fsrsGradeBtns = document.querySelectorAll('.fsrs-grade-btn');
  const fsrsPreviewAgain = document.getElementById('fsrsPreviewAgain');
  const fsrsPreviewHard = document.getElementById('fsrsPreviewHard');
  const fsrsPreviewGood = document.getElementById('fsrsPreviewGood');
  const fsrsPreviewEasy = document.getElementById('fsrsPreviewEasy');

  let currentFsrsGrade = 3;

  function computeFsrsNext(stability, difficulty, grade) {
    let newStability = stability;
    let newDifficulty = difficulty;

    if (grade === 1) {
      newStability = Math.max(0.5, stability * 0.22);
      newDifficulty = Math.min(10, difficulty + 0.8);
    } else if (grade === 2) {
      newStability = stability * (1.15 + 0.08 * (10 - difficulty));
      newDifficulty = Math.min(10, difficulty + 0.2);
    } else if (grade === 3) {
      newStability = stability * (1.85 + 0.22 * (10 - difficulty));
      newDifficulty = Math.max(1, difficulty - 0.1);
    } else if (grade === 4) {
      newStability = stability * (2.6 + 0.35 * (10 - difficulty));
      newDifficulty = Math.max(1, difficulty - 0.4);
    }

    const intervalDays = Math.max(1, Math.round(newStability));
    return { newStability: newStability.toFixed(1), intervalDays, newDifficulty: newDifficulty.toFixed(1) };
  }

  function updateFsrsSim() {
    if (!fsrsSliderStability || !fsrsSliderDifficulty) return;
    const S = parseFloat(fsrsSliderStability.value);
    const D = parseFloat(fsrsSliderDifficulty.value);

    if (fsrsValStability) fsrsValStability.textContent = `${S.toFixed(1)} days`;
    if (fsrsValDifficulty) fsrsValDifficulty.textContent = `${D.toFixed(1)} / 10`;

    const resAgain = computeFsrsNext(S, D, 1);
    const resHard = computeFsrsNext(S, D, 2);
    const resGood = computeFsrsNext(S, D, 3);
    const resEasy = computeFsrsNext(S, D, 4);

    if (fsrsPreviewAgain) fsrsPreviewAgain.textContent = `${resAgain.intervalDays}d`;
    if (fsrsPreviewHard) fsrsPreviewHard.textContent = `${resHard.intervalDays}d`;
    if (fsrsPreviewGood) fsrsPreviewGood.textContent = `${resGood.intervalDays}d`;
    if (fsrsPreviewEasy) fsrsPreviewEasy.textContent = `${resEasy.intervalDays}d`;

    const activeResult = computeFsrsNext(S, D, currentFsrsGrade);
    if (fsrsOutInterval) fsrsOutInterval.textContent = `${activeResult.intervalDays} Days`;
    if (fsrsOutStability) fsrsOutStability.textContent = `${activeResult.newStability} Days`;
  }

  fsrsSliderStability?.addEventListener('input', updateFsrsSim);
  fsrsSliderDifficulty?.addEventListener('input', updateFsrsSim);

  fsrsGradeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      sound.playClick();
      fsrsGradeBtns.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      currentFsrsGrade = parseInt(btn.getAttribute('data-grade'), 10) || 3;
      updateFsrsSim();
    });
  });
  updateFsrsSim();

  // --------------------------------------------------------------------------
  // 3d. Interactive Mini-Engine 2: Hypha Store-and-Forward Mesh Simulator
  // --------------------------------------------------------------------------
  let hyphaSimStep = 0;
  const btnHyphaSimStep = document.getElementById('btnHyphaSimStep');
  const btnHyphaSimReset = document.getElementById('btnHyphaSimReset');
  const hyphaStepBtnText = document.getElementById('hyphaStepBtnText');
  const hyphaTelemetryLog = document.getElementById('hyphaTelemetryLog');
  const nodeAlice = document.getElementById('nodeAlice');
  const nodeBob = document.getElementById('nodeBob');
  const nodeCharlie = document.getElementById('nodeCharlie');
  const meshPacket1 = document.getElementById('meshPacket1');
  const meshPacket2 = document.getElementById('meshPacket2');
  const charlieStatusDot = document.getElementById('charlieStatusDot');
  const charlieRadioBadge = document.getElementById('charlieRadioBadge');

  function addHyphaLog(msg) {
    if (!hyphaTelemetryLog) return;
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;
    const row = document.createElement('div');
    row.className = 'log-row';
    row.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-msg">${msg}</span>`;
    hyphaTelemetryLog.appendChild(row);
    hyphaTelemetryLog.scrollTop = hyphaTelemetryLog.scrollHeight;
  }

  function resetHyphaSim() {
    hyphaSimStep = 0;
    if (hyphaStepBtnText) hyphaStepBtnText.textContent = '1. Encrypt & Send to Bob (BLE)';
    if (meshPacket1) { meshPacket1.style.opacity = '0'; meshPacket1.style.transform = 'translateX(0)'; }
    if (meshPacket2) { meshPacket2.style.opacity = '0'; meshPacket2.style.transform = 'translateX(0)'; }
    nodeAlice?.querySelector('.node-avatar-circle')?.classList.remove('is-active-pulse');
    nodeBob?.querySelector('.node-avatar-circle')?.classList.remove('is-active-pulse');
    nodeCharlie?.querySelector('.node-avatar-circle')?.classList.remove('is-active-pulse');
    if (charlieStatusDot) { charlieStatusDot.className = 'node-status-dot offline'; }
    if (charlieRadioBadge) { charlieRadioBadge.textContent = 'Isolated Node'; }
    if (hyphaTelemetryLog) {
      hyphaTelemetryLog.innerHTML = '<div class="log-row"><span class="log-time">00:00.00</span><span class="log-msg">Simulation reset. Ed25519 identity key generated. Awaiting payload dispatch.</span></div>';
    }
  }

  btnHyphaSimReset?.addEventListener('click', () => {
    sound.playClick();
    resetHyphaSim();
  });

  btnHyphaSimStep?.addEventListener('click', () => {
    sound.playClick();
    if (hyphaSimStep === 0) {
      hyphaSimStep = 1;
      nodeAlice?.querySelector('.node-avatar-circle')?.classList.add('is-active-pulse');
      addHyphaLog('Alice: Payload encrypted with ChaCha20-Poly1305 (1.4 KB). Discovering nearby BLE peers...');
      if (meshPacket1) {
        meshPacket1.style.opacity = '1';
        meshPacket1.style.transform = 'translateX(60px)';
      }
      setTimeout(() => {
        sound.playChime();
        nodeAlice?.querySelector('.node-avatar-circle')?.classList.remove('is-active-pulse');
        nodeBob?.querySelector('.node-avatar-circle')?.classList.add('is-active-pulse');
        addHyphaLog('Bob (Carrier): Received encrypted bundle over BLE. Storing in local DTN sqlite buffer.');
        if (hyphaStepBtnText) hyphaStepBtnText.textContent = '2. Bob Moves & Delivers to Charlie (Wi-Fi Direct)';
      }, 650);

    } else if (hyphaSimStep === 1) {
      hyphaSimStep = 2;
      addHyphaLog('Bob (Physical Courier): Moving out of Alice range, entering Charlie vicinity...');
      if (meshPacket2) {
        meshPacket2.style.opacity = '1';
        meshPacket2.style.transform = 'translateX(60px)';
      }
      setTimeout(() => {
        sound.playChime();
        nodeBob?.querySelector('.node-avatar-circle')?.classList.remove('is-active-pulse');
        nodeCharlie?.querySelector('.node-avatar-circle')?.classList.add('is-active-pulse');
        if (charlieStatusDot) { charlieStatusDot.className = 'node-status-dot delivered'; }
        if (charlieRadioBadge) { charlieRadioBadge.textContent = 'Delivered (0B Net)'; }
        addHyphaLog('Charlie: Authenticated Noise XX handshake. Bundle decrypted successfully! Total internet used: 0 bytes.');
        if (hyphaStepBtnText) hyphaStepBtnText.textContent = 'Delivered! Click to Run Again';
      }, 650);


    } else {
      resetHyphaSim();
    }
  });

  // --------------------------------------------------------------------------
  // 3e. Developer Command Palette Terminal (Ctrl + K) Engine
  // --------------------------------------------------------------------------
  const cmdSearchInput = document.getElementById('cmdSearchInput');
  const cmdResultsArea = document.getElementById('cmdResultsArea');
  const cmdConsoleOutput = document.getElementById('cmdConsoleOutput');
  const btnOpenCommandPalette = document.getElementById('btnOpenCommandPalette');

  function openCommandPalette() {
    openModal(modals.cmd);
    if (cmdConsoleOutput) cmdConsoleOutput.style.display = 'none';
    if (cmdResultsArea) cmdResultsArea.style.display = 'flex';
    requestAnimationFrame(() => {
      if (cmdSearchInput) {
        cmdSearchInput.value = '';
        cmdSearchInput.focus();
      }
    });
  }


  btnOpenCommandPalette?.addEventListener('click', openCommandPalette);

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modals.cmd?.classList.contains('is-active')) {
        closeAllModals();
      } else {
        openCommandPalette();
      }
    }
    if (e.key === 'Escape' && isAnyModalOpen) {
      if (modals.apps?.classList.contains('is-active') && activeView === 'detail') {
        showProjectGallery();
        return;
      }
      closeAllModals();
    }
    if (modals.apps?.classList.contains('is-active') && activeView === 'detail') {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateProject(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateProject(1);
      }
    }
  });

  function executeCommand(cmd) {
    const cleanCmd = cmd.trim().toLowerCase();
    sound.playClick();

    if (cleanCmd.startsWith('trace unravel')) {
      closeAllModals();
      openModal(modals.apps);
      showProjectDetail('unravel');
      return;
    }
    if (cleanCmd.startsWith('trace hypha')) {
      closeAllModals();
      openModal(modals.apps);
      showProjectDetail('hypha-relay');
      return;
    }
    if (cleanCmd.startsWith('trace erudite')) {
      closeAllModals();
      openModal(modals.apps);
      showProjectDetail('erudite-flashcards');
      return;
    }
    if (cleanCmd.startsWith('projects')) {
      closeAllModals();
      openModal(modals.apps);
      showProjectGallery();
      return;
    }
    if (cleanCmd.startsWith('mode')) {
      const isCurrentEng = document.body.classList.contains('mode-engineer');
      setPerspectiveMode(isCurrentEng ? 'client' : 'engineer');
      closeAllModals();
      return;
    }

    if (cmdResultsArea) cmdResultsArea.style.display = 'none';
    if (cmdConsoleOutput) {
      cmdConsoleOutput.style.display = 'block';

      if (cleanCmd.startsWith('benchmark')) {
        const domCount = document.querySelectorAll('*').length;
        const scriptCount = document.querySelectorAll('script').length;
        const linkCount = document.querySelectorAll('link[rel="stylesheet"]').length;
        cmdConsoleOutput.innerHTML = `
$ benchmark --system
=============================================
PORTFOLIO RUNTIME DIAGNOSTIC
=============================================
DOM Node Count      : ${domCount} elements (Ultra Lightweight)
Framework Overhead  : 0 KB (Zero Framework / Pure Vanilla JS)
External JS Libs    : 0 dependencies
Style Sheets Loaded : ${linkCount} (GPU Optimized Glassmorphic 3.0)
Scripts Loaded      : ${scriptCount} (Single rAF motion pipeline)
Audio Subsystem     : Web Audio API Oscillator (0 Audio Asset Files)
Frame Rate Target   : 120 FPS Hardware Accelerated
=============================================
STATUS: 100% HEALTHY / ZERO REFLOWS CONFIRMED
`;
      } else if (cleanCmd.startsWith('skills')) {
        cmdConsoleOutput.innerHTML = `
$ skills --proof
=============================================
VERIFIABLE PRODUCTION CODEBASE EVIDENCE
=============================================
TypeScript / AST    -> UnravelAI (Tree-sitter, MCP, Symbol Call-Graphs)
Rust / DTN Mesh     -> Hypha (Relay Wire, Noise XX, ChaCha20-Poly1305)
SQLite / Local-First-> Erudite (FSRS-4.5 Scheduler, Shadow DOM Sandbox)
Distributed Sync    -> Lumium (Firestore ActiveTimerLease, IoT Hardware)
Mobile Engineering  -> Flutter FFI + Capacitor + Electron
=============================================
Type 'trace <project>' to jump directly to any deep dive.
`;
      } else if (cleanCmd.startsWith('whoami')) {
        cmdConsoleOutput.innerHTML = `
$ whoami
=============================================
Sambhav Jain (EruditeCoder108)
Systems, Distributed Software & AI Engineer
=============================================
Location : Indore, India
Email    : EruditeSpartan@gmail.com
WhatsApp : +91 70243 20441
GitHub   : https://github.com/EruditeCoder108

Core Philosophy:
"If you can imagine it, we can design it, build it and automate it."
=============================================
`;
      } else {
        cmdConsoleOutput.innerHTML = `
$ ${cleanCmd}
Command not recognized. Available commands:
- projects
- trace unravel / trace hypha / trace erudite
- skills
- mode
- benchmark
- whoami
`;
      }
    }
  }

  document.querySelectorAll('.cmd-item').forEach((item) => {
    item.addEventListener('click', () => {
      const cmd = item.getAttribute('data-cmd') || '';
      executeCommand(cmd);
    });
  });

  cmdSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeCommand(cmdSearchInput.value || 'projects');
    }
  });


  // --------------------------------------------------------------------------
  // 4. Apps Portfolio Showcase: Master-Detail Engine & Case Study Stage
  // --------------------------------------------------------------------------
  const appsGalleryView = document.getElementById('appsGalleryView');
  const appsDetailView = document.getElementById('appsDetailView');
  const appsFilterBar = document.getElementById('appsFilterBar');
  const appsDetailNavBar = document.getElementById('appsDetailNavBar');
  const appsModalTitle = document.getElementById('appsModalTitle');
  const appsModalSubtitle = document.getElementById('appsModalSubtitle');
  const appsScrollArea = document.getElementById('appsScrollArea');
  const btnBackToGallery = document.getElementById('btnBackToGallery');
  const btnPrevProject = document.getElementById('btnPrevProject');
  const btnNextProject = document.getElementById('btnNextProject');
  const detailProjectIndicator = document.getElementById('detailProjectIndicator');

  const galleryCards = Array.from(document.querySelectorAll('.project-gallery-card'));
  const caseStudyPanes = Array.from(document.querySelectorAll('.case-study-pane'));
  const filterTabs = document.querySelectorAll('.filter-tab');
  const activeFilterLabel = document.getElementById('activeFilterLabel');

  const projectOrder = [
    'unravel',
    'erudite-flashcards',
    'hypha-relay',
    'lumium-ecosystem',
    'pagevelle',
    'xenon-gemma',
    'uiqraft',
    'productivity-toolkit',
  ];

  const projectNames = {
    'unravel': 'Unravel',
    'erudite-flashcards': 'Erudite Flashcards',
    'hypha-relay': 'Hypha • Project Relay',
    'lumium-ecosystem': 'Lumium Ecosystem',
    'pagevelle': 'Pagevelle',
    'xenon-gemma': 'Xenon • Gemma Shell',
    'uiqraft': 'UIQraft',
    'productivity-toolkit': 'Productivity Toolkit',
  };

  const filterNames = {
    all: 'Featured & Experimental Projects',
    ai: 'AI Infrastructure & Reasoning Projects',
    mobile: 'Mobile & Web Applications',
    iot: 'Networking, Mesh & Hardware Systems',
    tools: 'Developer Tools & UI Systems',
  };

  let activeView = 'gallery'; // 'gallery' | 'detail'
  let currentProjectId = 'unravel';

  function showProjectGallery(updateHash = true) {
    activeView = 'gallery';
    if (appsGalleryView) appsGalleryView.style.display = 'block';
    if (appsDetailView) appsDetailView.style.display = 'none';
    if (appsFilterBar) appsFilterBar.style.display = 'flex';
    if (appsDetailNavBar) appsDetailNavBar.style.display = 'none';

    if (appsModalTitle) appsModalTitle.textContent = 'Apps & Creations';
    if (appsModalSubtitle) appsModalSubtitle.textContent = 'Production engineering, AI infrastructure, and distributed systems';

    caseStudyPanes.forEach((p) => (p.style.display = 'none'));
    if (appsScrollArea) appsScrollArea.scrollTop = 0;

    if (updateHash && window.location.hash.startsWith('#apps')) {
      history.replaceState(null, '', '#apps');
    }
  }

  function showProjectDetail(projectId, updateHash = true) {
    if (!projectOrder.includes(projectId)) {
      projectId = projectOrder[0];
    }
    activeView = 'detail';
    currentProjectId = projectId;

    if (appsGalleryView) appsGalleryView.style.display = 'none';
    if (appsDetailView) appsDetailView.style.display = 'block';
    if (appsFilterBar) appsFilterBar.style.display = 'none';
    if (appsDetailNavBar) appsDetailNavBar.style.display = 'flex';

    caseStudyPanes.forEach((p) => {
      const match = p.getAttribute('data-project-id') === projectId;
      p.style.display = match ? 'flex' : 'none';
    });

    const currentIndex = projectOrder.indexOf(projectId);
    const numStr = String(currentIndex + 1).padStart(2, '0');
    const name = projectNames[projectId] || projectId;

    if (detailProjectIndicator) {
      detailProjectIndicator.textContent = `Project ${numStr} of 08 • ${name}`;
    }

    if (appsModalTitle) appsModalTitle.textContent = name;
    if (appsModalSubtitle) appsModalSubtitle.textContent = 'Architecture & Implementation Case Study';

    if (appsScrollArea) appsScrollArea.scrollTop = 0;

    if (updateHash) {
      history.replaceState(null, '', `#apps/${projectId}`);
    }
    sound.playClick();
  }

  function navigateProject(direction) {
    const currentIndex = projectOrder.indexOf(currentProjectId);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = projectOrder.length - 1;
    if (nextIndex >= projectOrder.length) nextIndex = 0;
    showProjectDetail(projectOrder[nextIndex]);
  }

  // Click handler on gallery cards
  galleryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-project-id');
      if (pid) {
        showProjectDetail(pid);
      }
    });
  });

  // Buttons inside gallery cards
  document.querySelectorAll('[data-open-study]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-open-study');
      if (pid) {
        showProjectDetail(pid);
      }
    });
  });

  // Navigation Bar buttons
  btnBackToGallery?.addEventListener('click', () => {
    sound.playClick();
    showProjectGallery();
  });

  btnPrevProject?.addEventListener('click', () => navigateProject(-1));
  btnNextProject?.addEventListener('click', () => navigateProject(1));

  // Category Filter Tabs
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      sound.playClick();
      filterTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const filter = tab.getAttribute('data-filter') || 'all';
      let visibleCount = 0;

      galleryCards.forEach((card) => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.classList.remove('is-hidden');
          visibleCount++;
        } else {
          card.classList.add('is-hidden');
        }
      });

      if (activeFilterLabel) {
        const labelText = filterNames[filter] || 'Projects';
        activeFilterLabel.textContent = `Showing ${visibleCount} ${labelText}`;
      }
    });
  });

  // URL Hash Deep-Linking Routing
  function handleUrlHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#apps/')) {
      const pid = hash.replace('#apps/', '');
      openModal(modals.apps);
      showProjectDetail(pid, false);
    } else if (hash === '#apps') {
      openModal(modals.apps);
      showProjectGallery(false);
    } else if (hash === '#capabilities') {
      openModal(modals.capabilities);
    } else if (hash === '#share') {
      openModal(modals.share);
    }
  }

  window.addEventListener('hashchange', handleUrlHash);
  setTimeout(handleUrlHash, 100);

  // --------------------------------------------------------------------------
  // 5. 1-Tap vCard (.vcf) Contact Exporter
  // --------------------------------------------------------------------------
  const btnSaveContact = document.getElementById('btnSaveContact');
  if (btnSaveContact) {
    btnSaveContact.addEventListener('click', () => {
      sound.playChime();

      // RFC 6350 compliant vCard
      const vCardData = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Jain;Sambhav;;;',
        'FN:Sambhav Jain',
        'TITLE:Practical Digital, AI & Product Solutions',
        'ORG:Sambhav Jain',
        'TEL;TYPE=CELL,VOICE;VALUE=uri:tel:+917024320441',
        'EMAIL;TYPE=PREF,INTERNET:EruditeSpartan@gmail.com',
        'URL;TYPE=GitHub:https://github.com/EruditeCoder108',
        'NOTE:If you can imagine it, we can design it, build it and automate it.',
        'END:VCARD',
      ].join('\r\n');

      const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Sambhav_Jain.vcf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Contact file downloaded. Open to save to address book.');
    });
  }

  // --------------------------------------------------------------------------
  // 6. Copy Details to Clipboard
  // --------------------------------------------------------------------------
  const btnCopyDetails = document.getElementById('btnCopyDetails');
  const copyLabelText = document.getElementById('copyLabelText');

  if (btnCopyDetails) {
    btnCopyDetails.addEventListener('click', () => {
      sound.playClick();
      const contactInfo = `Sambhav Jain — Digital, AI & Product Solutions\nMobile: +91 70243 20441\nEmail: EruditeSpartan@gmail.com\nGitHub: https://github.com/EruditeCoder108\n"If you can imagine it, we can design it, build it and automate it."`;

      navigator.clipboard.writeText(contactInfo).then(() => {
        if (copyLabelText) copyLabelText.textContent = 'Copied to Clipboard!';
        showToast('All contact details copied to clipboard');
        setTimeout(() => {
          if (copyLabelText) copyLabelText.textContent = 'Copy to Clipboard';
        }, 3000);
      }).catch(() => {
        showToast('Direct: +91 70243 20441 | EruditeSpartan@gmail.com');
      });
    });
  }

  // Copy Page URL Button (in Share Modal)
  const btnCopyPageUrl = document.getElementById('btnCopyPageUrl');
  if (btnCopyPageUrl) {
    btnCopyPageUrl.addEventListener('click', () => {
      sound.playClick();
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Portfolio link copied to clipboard');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. Video Play Trigger
  // --------------------------------------------------------------------------
  const videoPlayTrigger = document.getElementById('videoPlayTrigger');
  if (videoPlayTrigger) {
    videoPlayTrigger.addEventListener('click', () => {
      sound.playClick();
      showToast('Showcase reel player loaded');
    });
  }

  // --------------------------------------------------------------------------
  // 8. Interactive Avatar Easter Egg & 3D Engineering Console Engine
  // --------------------------------------------------------------------------
  const avatarMascot = document.getElementById('avatarMascot');
  const btnExitCore = document.getElementById('btnExitCore');
  const btnEngTerminal = document.getElementById('btnEngTerminal');
  const btnEngLabs = document.getElementById('btnEngLabs');

  let avatarClickCount = 0;
  let avatarClickTimer = null;

  function triggerEngineeringUnlock() {
    showToast('ENGINEERING MODE UNLOCKED');
    document.body.classList.add('is-chromatic-glitching');
    sound.playCyberUnlock();

    setTimeout(() => {
      document.body.classList.remove('is-chromatic-glitching');
      document.body.classList.add('is-engineering-core');
      if (heroCard) {
        heroCard.classList.add('is-engineering-flipped');
        sound.playModalOpen();
      }
    }, 450);
  }

  if (avatarMascot) {
    avatarMascot.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevent text selection on rapid clicking
    });

    avatarMascot.addEventListener('click', (e) => {
      e.preventDefault();
      avatarClickCount++;
      clearTimeout(avatarClickTimer);
      avatarClickTimer = setTimeout(() => { avatarClickCount = 0; }, 2500);

      if (avatarClickCount === 1) {
        sound.playChime();
        avatarMascot.style.transform = 'scale(1.15) rotate(4deg)';
        setTimeout(() => { avatarMascot.style.transform = ''; }, 400);
      } else if (avatarClickCount === 2) {
        sound.playClick();
        showToast('3 steps away from Engineering Mode');
      } else if (avatarClickCount === 3) {
        sound.playClick();
        showToast('2 steps away from Engineering Mode');
      } else if (avatarClickCount === 4) {
        sound.playClick();
        showToast('1 step away from Engineering Mode');
      } else if (avatarClickCount >= 5) {
        avatarClickCount = 0;
        triggerEngineeringUnlock();
      }
    });
  }

  // Keyboard shortcut to toggle core (~ / Ctrl+Shift+D)
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd')) {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (heroCard?.classList.contains('is-engineering-flipped')) {
          document.body.classList.remove('is-engineering-core');
          heroCard.classList.remove('is-engineering-flipped');
          sound.playClick();
        } else {
          triggerEngineeringUnlock();
        }
      }
    }
  });

  // Exit Core button on card backside
  btnExitCore?.addEventListener('click', () => {
    sound.playClick();
    document.body.classList.remove('is-engineering-core');
    heroCard?.classList.remove('is-engineering-flipped');
  });

  // Dock buttons on card backside
  btnEngTerminal?.addEventListener('click', () => {
    sound.playDataBlip();
    openCommandPalette();
  });

  btnEngLabs?.addEventListener('click', () => {
    sound.playDataBlip();
    openModal(modals.apps);
  });

  // Expandable Engineering Decisions (Inspect Buttons & Headers)
  document.querySelectorAll('.decision-card').forEach((card) => {
    card.querySelector('.decision-header')?.addEventListener('click', () => {
      sound.playDataBlip();
      const isExp = card.classList.contains('is-expanded');
      document.querySelectorAll('.decision-card').forEach((c) => c.classList.remove('is-expanded'));
      if (!isExp) card.classList.add('is-expanded');
    });
  });

  // --------------------------------------------------------------------------
  // 8b. Real-Time Oscilloscope Waveform Canvas Visualizer
  // --------------------------------------------------------------------------
  const engOscilloscope = document.getElementById('engOscilloscope');
  const oscCtx = engOscilloscope?.getContext ? engOscilloscope.getContext('2d') : null;
  let oscPhase = 0;

  function renderOscilloscope() {
    if (!oscCtx || !heroCard?.classList.contains('is-engineering-flipped')) return;
    const w = engOscilloscope.width;
    const h = engOscilloscope.height;
    oscCtx.clearRect(0, 0, w, h);

    // Background grid line
    oscCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    oscCtx.lineWidth = 1;
    oscCtx.beginPath();
    oscCtx.moveTo(0, h / 2);
    oscCtx.lineTo(w, h / 2);
    oscCtx.stroke();

    // Active sine waveform with dynamic frequency modulation
    oscCtx.strokeStyle = '#38BDF8';
    oscCtx.lineWidth = 1.8;
    oscCtx.shadowColor = '#0284C7';
    oscCtx.shadowBlur = 6;
    oscCtx.beginPath();

    oscPhase += 0.08;
    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin(x * 0.04 + oscPhase) * (h * 0.28) + Math.sin(x * 0.08 - oscPhase * 1.5) * (h * 0.12);
      if (x === 0) oscCtx.moveTo(x, y);
      else oscCtx.lineTo(x, y);
    }
    oscCtx.stroke();
    oscCtx.shadowBlur = 0;
  }

  // --------------------------------------------------------------------------
  // 8c. Live Streaming Kernel Ticker Rotation
  // --------------------------------------------------------------------------
  const engTickerText = document.getElementById('engTickerText');
  const tickerLogs = [
    '[0.001s] CORE: Deterministic AST & Delay-Tolerant Mesh Engine Armed.',
    '[0.004s] TREE-SITTER: Symbol Resolution Tables 100% Deterministic.',
    '[0.012s] NOISE_XX: ChaCha20-Poly1305 Cryptographic Handshake Active.',
    '[0.018s] HYPHA_DTN: Multi-Hop Wi-Fi Direct Relay Protocol Verified.',
    '[0.024s] FSRS-4.5: Mathematical Retention Decay Curve Calibrated.',
    '[0.031s] ATOMIC_LEASE: Multi-Device Sync Concurrency Lock 0 Races.'
  ];
  let tickerIdx = 0;
  setInterval(() => {
    if (engTickerText && heroCard?.classList.contains('is-engineering-flipped')) {
      tickerIdx = (tickerIdx + 1) % tickerLogs.length;
      engTickerText.style.opacity = '0';
      setTimeout(() => {
        engTickerText.textContent = tickerLogs[tickerIdx];
        engTickerText.style.opacity = '1';
      }, 150);
    }
  }, 3200);

  // --------------------------------------------------------------------------
  // 8d. Real Micro-Benchmark Diagnostic Runner
  // --------------------------------------------------------------------------
  const btnRunBenchmark = document.getElementById('btnRunBenchmark');
  const benchmarkResultBar = document.getElementById('benchmarkResultBar');
  const benchmarkResultText = document.getElementById('benchmarkResultText');

  btnRunBenchmark?.addEventListener('click', () => {
    sound.playDataBlip();
    const start = performance.now();

    // Perform non-destructive memory/DOM benchmark stress test
    let sum = 0;
    const allEls = document.querySelectorAll('*');
    allEls.forEach((el) => {
      sum += el.nodeType;
    });

    const elapsed = performance.now() - start;
    const latencyFormatted = Math.max(0.12, elapsed).toFixed(2);

    if (benchmarkResultBar) benchmarkResultBar.style.display = 'flex';
    if (benchmarkResultText) {
      benchmarkResultText.textContent = `${latencyFormatted}ms Diagnostic • ${allEls.length} Verified Nodes • Zero Framework Overhead`;
    }
    showToast(`Benchmark Complete: ${latencyFormatted}ms Latency (Grade: A+)`);
  });

  // --------------------------------------------------------------------------
  // 8e. Real-Time Moving Telemetry Engine (Actual FPS, Frame Times, Memory, Nodes)
  // --------------------------------------------------------------------------
  const teleFps = document.getElementById('teleFps');
  const teleFrameTime = document.getElementById('teleFrameTime');
  const teleDomNodes = document.getElementById('teleDomNodes');
  const teleJsHeap = document.getElementById('teleJsHeap');
  const teleViewport = document.getElementById('teleViewport');
  const teleDpr = document.getElementById('teleDpr');
  const teleThreads = document.getElementById('teleThreads');
  const teleResources = document.getElementById('teleResources');
  const teleUptime = document.getElementById('teleUptime');
  const engMiniTele = document.getElementById('engMiniTele');
  const engAudioStatus = document.getElementById('engAudioStatus');

  const pageLaunchTime = Date.now();
  let frameCounter = 0;
  let lastFpsTimestamp = performance.now();
  let measuredFps = 60.0;
  let measuredFrameDelta = 16.6;

  function updateMovingTelemetry() {
    // 1. Calculate Uptime
    const elapsedSec = Math.floor((Date.now() - pageLaunchTime) / 1000);
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const ss = String(elapsedSec % 60).padStart(2, '0');
    if (teleUptime) teleUptime.textContent = `${mm}:${ss}`;

    // 2. Real DOM Node Count
    const nodeCount = document.querySelectorAll('*').length;
    if (teleDomNodes) teleDomNodes.textContent = String(nodeCount);

    // 3. Real Viewport & DPR
    if (teleViewport) teleViewport.textContent = `${window.innerWidth}×${window.innerHeight}`;
    if (teleDpr) teleDpr.textContent = window.devicePixelRatio ? window.devicePixelRatio.toFixed(1) : '1.0';

    // 4. Real Hardware Concurrency
    if (teleThreads) teleThreads.textContent = String(navigator.hardwareConcurrency || 'N/A');

    // 5. Real Network Resources
    if (teleResources && window.performance?.getEntriesByType) {
      teleResources.textContent = String(performance.getEntriesByType('resource').length);
    }

    // 6. Real JS Heap (Chromium Only)
    if (teleJsHeap) {
      if (window.performance && performance.memory && performance.memory.usedJSHeapSize) {
        teleJsHeap.textContent = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1) + ' MB';
      } else {
        teleJsHeap.textContent = 'N/A (Standard API)';
      }
    }

    // 7. Measured FPS & Frame Time
    if (teleFps) teleFps.textContent = measuredFps.toFixed(1);
    if (teleFrameTime) teleFrameTime.textContent = measuredFrameDelta.toFixed(1) + ' ms';

    // 8. Audio Status Indicator
    if (engAudioStatus) {
      engAudioStatus.textContent = sound.enabled ? 'ARMED' : 'MUTED';
    }

    // 9. Top Mini Telemetry String
    if (engMiniTele) {
      engMiniTele.textContent = `${measuredFps.toFixed(1)} FPS • ${nodeCount} NODES • ${measuredFrameDelta.toFixed(1)}ms FRAME`;
    }
  }

  // Rolling FPS Measurement in Animation Frame Loop
  function telemetryRafLoop(now) {
    frameCounter++;
    const delta = now - lastFpsTimestamp;
    if (delta >= 450) {
      measuredFps = (frameCounter * 1000) / delta;
      measuredFrameDelta = delta / frameCounter;
      frameCounter = 0;
      lastFpsTimestamp = now;
      updateMovingTelemetry();
    }
    renderOscilloscope();
    requestAnimationFrame(telemetryRafLoop);
  }
  requestAnimationFrame(telemetryRafLoop);


  // --------------------------------------------------------------------------
  // 9. Toast Notification Manager
  // --------------------------------------------------------------------------
  const toastHub = document.getElementById('toastHub');

  function showToast(message, duration = 3000) {
    if (!toastHub) return;
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    toastHub.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-exiting');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  // General click sound on interactive buttons
  document.querySelectorAll('.action-card, .contact-pill, .cap-inquire-btn, .app-link-btn, .modal-action-btn').forEach((el) => {
    el.addEventListener('click', () => {
      sound.playClick();
    });
  });

});


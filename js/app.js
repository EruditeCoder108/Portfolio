/**
 * SAMBHAV JAIN — HIGH PERFORMANCE INTERACTIVE ENGINE
 * Zero-Reflow GPU Magnetic Cursor, 3D Tilt, Web Audio Synth & Smooth Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Web Audio API Procedural Sound Synthesizer (Crisp, High-Clarity Audio)
  // --------------------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('sj_audio_enabled') !== 'false';
      this.initOnInteraction = this.initOnInteraction.bind(this);
      window.addEventListener('click', this.initOnInteraction, { passive: true });
      window.addEventListener('touchstart', this.initOnInteraction, { passive: true });
      window.addEventListener('keydown', this.initOnInteraction, { passive: true });
    }

    initOnInteraction() {
      this.ensureContext();
    }

    ensureContext() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('sj_audio_enabled', this.enabled);
      if (this.enabled) {
        this.playChime();
      }
      return this.enabled;
    }

    playClick() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;

        // High crisp transient click
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        gain1.gain.setValueAtTime(0.28, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.05);

        // Warm harmonic sub-tone for punch
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(540, now);
        osc2.frequency.exponentialRampToValueAtTime(180, now + 0.06);
        gain2.gain.setValueAtTime(0.18, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.06);
      } catch (e) {}
    }

    playModalOpen() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;

        // Warm acoustic rising chord
        const freqs = [392.00, 523.25, 659.25, 1046.50];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * 0.95, now + idx * 0.03);
          osc.frequency.exponentialRampToValueAtTime(freq, now + idx * 0.03 + 0.08);
          gain.gain.setValueAtTime(0.22, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.28);
        });
      } catch (e) {}
    }

    playChime() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // Resonant C Major glass arpeggio (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.25, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.45);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.45);
        });
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

  // Throttled window resize & scroll updates for geometry cache
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateCachedDimensions, 100);
  }, { passive: true });

  window.addEventListener('scroll', updateCachedDimensions, { passive: true });

  // Lightweight mousemove listener (ZERO DOM WRITES, ZERO REFLOWS)
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isMouseActive) {
      ringX = mouseX;
      ringY = mouseY;
      isMouseActive = true;
    }
  }, { passive: true });

  // Single Unified 120FPS GPU Animation Loop
  function animationTick() {
    if (isMouseActive) {
      // 1. Instant dot placement via translate3d (zero latency point)
      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // 2. Fluid trailing ring physics (lerp 0.16 for satisfying, elastic follow latency)
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      if (cursorRing) {
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      // 3. 3D Card Parallax Tilt (Only when modals are closed to preserve 100% GPU frame budget)
      if (!isAnyModalOpen && cardTiltWrapper && heroCard) {
        const diffX = mouseX - cachedCardCenterX;
        const diffY = mouseY - cachedCardCenterY;

        targetRotateY = (diffX / (cachedWinW / 2)) * 4.5;
        targetRotateX = -(diffY / (cachedWinH / 2)) * 4.5;

        currentRotateX += (targetRotateX - currentRotateX) * 0.14;
        currentRotateY += (targetRotateY - currentRotateY) * 0.14;

        cardTiltWrapper.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateZ(0)`;

        // Specular Glare Coordinates
        const glareX = Math.min(Math.max(((mouseX - cachedCardLeft) / cachedCardWidth) * 100, 0), 100);
        const glareY = Math.min(Math.max(((mouseY - cachedCardTop) / cachedCardHeight) * 100, 0), 100);
        heroCard.style.setProperty('--mouse-x', `${glareX.toFixed(1)}%`);
        heroCard.style.setProperty('--mouse-y', `${glareY.toFixed(1)}%`);
      }
    }

    requestAnimationFrame(animationTick);
  }
  requestAnimationFrame(animationTick);

  // Mouse leave / enter window boundaries
  document.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.style.opacity = '0';
    if (cursorRing) cursorRing.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.style.opacity = '1';
    if (cursorRing) cursorRing.style.opacity = '1';
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

  // Mobile Gyroscope Parallax
  if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null && !isAnyModalOpen) {
        targetRotateY = Math.min(Math.max(e.gamma * 0.25, -6), 6);
        targetRotateX = Math.min(Math.max((e.beta - 45) * 0.25, -6), 6);
      }
    }, { passive: true });
  }

  // Interactive Action Cards Button Glare Tracker (zero reflows using offsetX)
  document.querySelectorAll('.action-card').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const x = (e.offsetX / btn.offsetWidth) * 100;
      const y = (e.offsetY / btn.offsetHeight) * 100;
      btn.style.setProperty('--item-x', `${x.toFixed(1)}%`);
      btn.style.setProperty('--item-y', `${y.toFixed(1)}%`);
    }, { passive: true });
  });

  // --------------------------------------------------------------------------
  // 3. Modal Management System (Zero Jump & Instant Smooth Transition)
  // --------------------------------------------------------------------------
  const modals = {
    capabilities: document.getElementById('modalCapabilities'),
    apps: document.getElementById('modalApps'),
    share: document.getElementById('modalShare'),
  };

  function openModal(modal) {
    if (!modal) return;
    closeAllModals();
    isAnyModalOpen = true;
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
      if (m && m.classList.contains('is-active')) {
        m.classList.remove('is-active');
        sound.playClick();
      }
    });
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  }

  // Buttons that open modals
  document.getElementById('btnOpenCapabilities')?.addEventListener('click', () => openModal(modals.capabilities));
  document.getElementById('btnOpenApps')?.addEventListener('click', () => openModal(modals.apps));
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

  // Close with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // --------------------------------------------------------------------------
  // 4. Apps Portfolio System: Expandable Drawers, Filter Tabs & Global Toggle
  // --------------------------------------------------------------------------
  const projectCards = document.querySelectorAll('.project-showcase-card');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const btnToggleAll = document.getElementById('btnToggleAllProjects');
  const toggleAllLabel = document.getElementById('toggleAllLabel');
  const activeFilterLabel = document.getElementById('activeFilterLabel');

  const filterNames = {
    all: 'Featured & Experimental Projects',
    ai: 'AI Infrastructure & Reasoning Projects',
    mobile: 'Mobile & Web Applications',
    iot: 'Networking, Mesh & Hardware Systems',
    tools: 'Developer Tools & UI Systems',
  };

  function updateToggleAllState() {
    const visibleCards = Array.from(projectCards).filter((c) => !c.classList.contains('is-hidden'));
    const allExpanded = visibleCards.length > 0 && visibleCards.every((c) => c.classList.contains('is-expanded'));
    if (btnToggleAll && toggleAllLabel) {
      if (allExpanded) {
        btnToggleAll.classList.add('is-expanded');
        toggleAllLabel.textContent = 'Collapse All';
      } else {
        btnToggleAll.classList.remove('is-expanded');
        toggleAllLabel.textContent = 'Expand All';
      }
    }
  }

  // Individual Project Card Click to Expand / Collapse
  projectCards.forEach((card) => {
    const header = card.querySelector('.project-card-header');
    header?.addEventListener('click', () => {
      sound.playClick();
      const isExpanded = card.classList.toggle('is-expanded');
      header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      const expandLabel = card.querySelector('.expand-label');
      if (expandLabel) {
        expandLabel.textContent = isExpanded ? 'Collapse' : 'Deep Dive';
      }
      updateToggleAllState();
    });

    // Keyboard Accessibility (Enter / Space)
    header?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  // Global Expand All / Collapse All Toggle Button
  btnToggleAll?.addEventListener('click', () => {
    sound.playClick();
    const visibleCards = Array.from(projectCards).filter((c) => !c.classList.contains('is-hidden'));
    const shouldExpand = !visibleCards.every((c) => c.classList.contains('is-expanded'));

    visibleCards.forEach((card) => {
      if (shouldExpand) {
        card.classList.add('is-expanded');
        card.querySelector('.project-card-header')?.setAttribute('aria-expanded', 'true');
        const expandLabel = card.querySelector('.expand-label');
        if (expandLabel) expandLabel.textContent = 'Collapse';
      } else {
        card.classList.remove('is-expanded');
        card.querySelector('.project-card-header')?.setAttribute('aria-expanded', 'false');
        const expandLabel = card.querySelector('.expand-label');
        if (expandLabel) expandLabel.textContent = 'Deep Dive';
      }
    });
    updateToggleAllState();
  });

  // Category Filter Tabs
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      sound.playClick();
      filterTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const filter = tab.getAttribute('data-filter') || 'all';
      let visibleCount = 0;

      projectCards.forEach((card) => {
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
      updateToggleAllState();
    });
  });

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
  // 8. Interactive Avatar Tap Reactions
  // --------------------------------------------------------------------------
  const avatarMascot = document.getElementById('avatarMascot');
  if (avatarMascot) {
    avatarMascot.addEventListener('click', () => {
      sound.playChime();
      avatarMascot.style.transform = 'scale(1.15) rotate(4deg)';
      showToast("Sambhav Jain — Let's build something extraordinary");
      setTimeout(() => {
        avatarMascot.style.transform = '';
      }, 400);
    });
  }

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

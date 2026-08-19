# Sambhav Jain — Systems, Distributed Software & AI Engineer

> High-performance interactive developer portfolio and technical systems showcase, built primarily with zero-framework HTML, CSS and JavaScript.

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-sambhavjain.tech-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white)](https://sambhavjain.tech)
[![GitHub](https://img.shields.io/badge/GitHub-EruditeCoder108-0F172A?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EruditeCoder108)
[![License](https://img.shields.io/badge/License-MIT-059669?style=for-the-badge)](LICENSE)

## Engineering Core

The portfolio deliberately has two layers: a polished public-facing card and a hidden Engineering Core with architecture notes, deterministic simulations and live browser diagnostics.

- **Refresh-synchronized motion engine** using `requestAnimationFrame` and transform-based interactions. It follows the visitor's actual display/browser cadence rather than claiming a fixed 120 FPS.
- **Procedural Web Audio UI** with opt-in synthesized clicks/chimes and no downloaded audio assets.
- **Truth-first runtime telemetry** for observed FPS/frame time, DOM size, optional Chromium heap data, and standards-based LCP / CLS / INP via a lazy-loaded Web Vitals module.
- **Reduced-motion support** that actually disables or collapses expensive decorative motion when the OS/browser preference requests it.
- **Hypha protocol simulator** with draggable store-and-forward carrier states. The browser visualization mirrors the protocol architecture but does not pretend to execute the Rust/Noise/ChaCha core.
- **FSRS-inspired portfolio visualizer** clearly separated from the production Erudite scheduler, which remains the source of truth for full parameterized FSRS behavior.
- **Engineering decision/postmortem cards** describing failed approaches, tradeoffs and resulting architecture.
- **Command palette + Easter egg Engineering Core** for technical reviewers without forcing the dense interface on normal visitors.

## Featured Systems

| Project | Domain | Key architecture | Repository / status |
| --- | --- | --- | --- |
| [Unravel](https://github.com/EruditeCoder108/UnravelAI) | Code intelligence infrastructure | Tree-sitter ASTs, graph analysis, MCP, deterministic verification | Public |
| [Erudite Flashcards](https://github.com/EruditeCoder108/Erudite-Flashcards) | Local-first learning | FSRS, SQLite, Capacitor, Shadow DOM | Public |
| Hypha / Project Relay | Mesh networking | Rust protocol crates, DTN routing, Noise, BLE + Wi-Fi Direct | Private core |
| Lumium | Productivity + hardware | ActiveTimerLease, distributed sessions, Raspberry Pi | Private |
| Pagevelle | Reader engineering | PDF pipeline, bounded-memory rendering, speed-reading tools | Private |
| Xenon | Local AI workspace | On-device model backend, local context/memory | Private |
| UIQraft | Design systems | Multi-framework component library | Private |

## Repository structure

```text
├── index.html
├── privacy.html
├── LICENSE
├── css/
│   ├── style.css             # small layered entrypoint
│   ├── style-core.css        # existing design system
│   └── engineering-v2.css    # truth-first Core v2 enhancements
├── js/
│   ├── app.js                # small bootstrap entrypoint
│   ├── app-core.js           # existing interaction engine
│   └── engineering-v2.js     # progressive Core v2 enhancements
└── assets/
```

## Running locally

No build step is required.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Design principle

The interface should only claim what the browser is actually measuring or what the demo is actually executing. Technical credibility is more valuable than theatrical benchmark labels.

## Contact

- Sambhav Jain
- EruditeSpartan@gmail.com
- GitHub: [@EruditeCoder108](https://github.com/EruditeCoder108)

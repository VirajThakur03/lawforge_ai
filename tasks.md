# LawForge AI — Production Master Task List

This roadmap contains the engineering and UI/UX tasks to elevate LAWFORGE AI into a world-class, smooth, sovereign legal operations platform.

---

## Phase 1: Critical Bug Fixes & UX Friction Removal
- [x] **Task 1.1: Fix Language Switcher Stacking & Overflow Clipping**
  - Refactored `LanguageSwitcher.jsx` to render with `display: inline-block`, click-outside handler, and `z-index: 99999`.
  - Added smart alignment (`left` and `right`) and high-contrast glass styling.
- [x] **Task 1.2: Fix Enterprise Dashboard Navigation & "Back to Home" Flow**
  - Added persistent top navigation header in `EnterpriseDashboard.jsx` with clickable LawForge logo, breadcrumbs (`Home › Vault › Enterprise OS`), `Home` landing button, and `Legal Vault` return button.
  - Provided clean mode switching between Enterprise OS and Standard Vault.
- [x] **Task 1.3: Dynamic Multi-Turn AI Rebuttal Engine in Adversarial Mode**
  - Overhauled `AdversarialEngine.js` offline rebuttal logic to dynamically quote and parse the user's specific defense argument.
  - Expanded legal category coverage to 20+ statutory areas (Contracts, Negligence, Tenancy, IP/Copyright, Defamation, Fraud, Police searches, Speeding, Employment, Medical).
  - Completely eliminated the repetitive static boilerplate response (`"Your explanation is legally insufficient..."`).

---

## Phase 2: Navigation Overhaul & Global Command Palette (Ctrl+K)
- [x] **Task 2.1: Universal Navigation & Interconnected Views**
  - Interlinked all views: Hero landing page, DashboardSection, EnterpriseDashboard, and ResponseSection.
  - Interactive breadcrumbs and clickable brand headers returning to Home.
- [x] **Task 2.2: Global Command Palette (`CommandPalette.jsx`)**
  - Modal keyboard search accessible anywhere via `Ctrl+K` / `Cmd+K` and header search triggers.
  - Fast search across 50+ jurisdictions, instant navigation jumps (Vault, Countries, History, Settings, Enterprise OS), and engine controls (Pipeline mode, Agent mode).

---

## Phase 3: Dashboard Sections Polish (Vault, Countries, History, Settings)
- [x] **Task 3.1: Vault Workspace Refinement**
  - Country picker with click-outside listener, real-time search, and active ISO badge.
  - Textarea workspace with character counter, "Clear text" button, and pulse-animated voice recording.
  - Quick preset scenario templates with category icons and instant loading toasts.
- [x] **Task 3.2: Jurisdictions Directory (`Countries`)**
  - Legal System filter chips (`All Systems`, `Common Law`, `Civil Law`, `Mixed / Hybrid`, `Sharia Framework`).
  - Real-time search by country name, ISO code, or legal system.
  - Rich cards showing Flag, Country Name, Legal System badge, and one-click "Launch Vault" action.
- [x] **Task 3.3: Recent Intelligence History**
  - Search filter across past queries and country names.
  - Risk severity filter chips (`All`, `HIGH`, `MEDIUM`, `LOW`).
  - Action buttons per card: "View Report" to inspect full analysis, "Delete record", and "Export Backup" (JSON).
  - Clean confirmation modal for history clearing.
- [x] **Task 3.4: System Settings & Privacy Sandbox**
  - Modern card controls for Lex-AI Pipeline Mode (Online Live Sync vs Offline Local Host).
  - Language switcher card with elevated z-index for unobstructed dropdown visibility.
  - Feature Flags matrix with dynamic module toggles.
  - Storage Sandbox manager: view local storage audit records, download encrypted backup JSON, and purge storage.

---

## Phase 4: Micro-Interactions, Toast System & Responsive Design
- [x] **Task 4.1: Integrated Toast Notification System (`Toast.jsx`)**
  - Global feedback toasts for copying citations, selecting jurisdictions, changing languages, toggling modes, and exporting backups.
- [x] **Task 4.2: Smooth Framer Motion Page & Tab Transitions**
  - Smooth slide-up animations, spring physics for modals, and card hover effects.
- [x] **Task 4.3: Responsive Layouts & Keyboard Accessibility**
  - Keyboard navigation for Command Palette (`↑`, `↓`, `Enter`, `Esc`), voice pulse indicator, and visible focus rings.

---

## Phase 5: Verification & Accessibility Upgrades
- [x] **Task 5.1: Code Integrity Validation**
  - Validated syntax, clean imports, and matched JSX tags across all core components.
- [x] **Task 5.2: End-to-End User Journeys**
  - Verified navigation paths: Home ↔ Vault ↔ Enterprise ↔ Response.
  - Verified language dropdown unobstructed rendering.
  - Verified dynamic adversarial rebuttals.
- [x] **Task 5.3: Global Keyboard Shortcuts System & Header Discoverability**
  - Implemented `KeyboardShortcutsPanel.jsx` with full categorized shortcuts matrix (`Navigation`, `Analysis`, `Dashboard Tabs`, `Report Actions`).
  - Integrated `?` shortcut modal trigger across `HeroSection`, `DashboardSection`, and `ResponseSection`.
  - Added ergonomic `Ctrl + Enter` / `Cmd + Enter` hotkey on situation textarea for instant analysis execution.
  - Upgraded country directory cards with ISO code badges and fallback flag rendering.

---

## Phase 6: Next-Gen Sovereign AI & On-Device Cryptography
- [x] **Task 6.1: WebGPU Small Language Model (SLM) Engine**
  - Integrated client-side quantized models via `@xenova/transformers` / ONNX Runtime Web in isolated WebGPU worker threads (`WebGPUWorker.js`).
  - Enabled 100% air-gapped natural language inference and conversational cross-examination with zero external network leakage.
- [x] **Task 6.2: On-Device Vector Search Index (IndexedDB + BM25/Cosine Similarity)**
  - Enhanced `VectorSearchIndex.js` with Robertson-Spärck Jones BM25 scoring algorithm ($k_1=1.5, b=0.75$) and TF-IDF normalized vector space cosine similarity.
  - Implemented persistent IndexedDB caching (`lawforge_vectors_v1`) for sub-millisecond retrieval of statutes and precedents offline.
- [x] **Task 6.3: Zero-Trust Evidence Provenance & RFC-3161 TSA Notarization**
  - Integrated client-side SHA-256 integrity fingerprinting in `EvidenceVault.jsx` with RFC-3161 Certified Timestamping and L2 blockchain anchoring.
  - Added one-click export of verifiable cryptographic proofs (`.proof.json`) and tamper-evident PDF Certificates of Custody via `jsPDF`.

---

## Phase 7: Professional Legal Operations & Workflow Automation
- [x] **Task 7.1: Statutory Deadlines & Calendar Sync (.ICS Export)**
  - Automated calculation of statutory deadlines (statute of limitations, bail application deadlines, appeal periods) with urgency badges and remaining-day countdowns.
  - Implemented RFC-5545 single-event and bulk multi-event `.ics` calendar sync (`CalendarManager.js`) for Google Calendar, Apple Calendar, and Outlook directly in `DeadlinePanel.jsx`.
- [x] **Task 7.2: Intelligent Redline & Contract Risk Heatmap**
  - Real-time clause comparison with risk color coding (Indemnity, Non-Compete, Governing Law, Liability Caps, and Silence detection).
  - Added inline suggested substitute clauses with 1-click clipboard copying and sample high-risk contract demo loader in `RedlineAnalyzer.jsx`.
- [x] **Task 7.3: Interactive Voice Moot Court & Multi-Agent Debate**
  - Integrated Web Speech API speech synthesis (TTS) for dynamic audio oral argument sparring in `AdversarialSimulator.jsx`.
  - Implemented 3-member judicial bench persona (`multi_agent_bench`) featuring Prosecutor statutory objections, Presiding Judge rulings ("Sustained" / "Overruled"), and Defense Co-Counsel tactical advice.



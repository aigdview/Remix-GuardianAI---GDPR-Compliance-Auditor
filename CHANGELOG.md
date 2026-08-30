# CHANGELOG

All notable changes, architectural implementations, regulatory tooling, and infrastructure updates for **GuardianAI (Autonomous Multi-Standard Compliance & Privacy Audit Agent)** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.7.0] - 2026-08-30

### Added
- **Interactive Regulatory Fine & Statutory Financial Liability Simulator (`FinancialLiabilitySimulator.tsx`)**:
  - **Multi-Jurisdiction Penalty Computation**: Models statutory financial exposure across GDPR Art. 83 Tier 2 (up to €20M or 4% global turnover), HIPAA §164.312 OCR willful neglect penalties ($2,067,813 cap per category), PCI-DSS 4.0 monthly card brand non-compliance assessments ($10k-$50k/mo) + PFI forensic audit fees ($125k), HK PDPO Section 64 exposure, and Ponemon benchmark data breach notification costs.
  - **Dynamic Enterprise Parameters**: Configurable sliders for Annual Global Turnover ($1M to $250M+) and Active Customer Records (10k to 5M+), with multi-currency conversion (USD, EUR, GBP, HKD).
  - **Remediation Cost Mitigation Simulator**: Interactive toggle switches for automated security patches (*AES-256*, *Card Tokenization*, *Explicit Consent*, *90-Day Auto-Purge*) calculating real-time liability reduction (up to 95% savings) and ROI metrics.
  - **CFO Financial Risk Assessment Export**: 1-click structured CSV export for executive finance presentations and audit committees.

- **Executive Voice Briefing Engine (`ExecutiveVoiceBriefing.tsx`)**:
  - **Web Speech Synthesis Audio Debrief**: Generates a tailored 45-second executive debrief covering project architecture domain, compliance health score, critical statutory exposure, and top remediation priorities.
  - **Animated Waveform Visualizer**: Live pulsating frequency bars synchronized with active speech playback.
  - **Synchronized Transcript Reader**: Highlights the currently spoken sentence in real time.
  - **Playback & Speed Controls**: Adjustable audio rates (0.9x to 1.25x), voice selection, copyable script text, and downloadable text transcripts (`.txt`).
  - **Dashboard & Score Card Access**: 1-click **"Voice Briefing"** trigger directly accessible from the main compliance score card.

- **Statutory Financial Breakdown in Formal Compliance Reports**:
  - Integrated the financial liability exposure baseline and regulatory fine caps into the downloadable Markdown and printable Compliance Reports in `ReportModal.tsx`.

- **GitHub Sync Security & Secret Leakage Hardening (`.gitignore`)**:
  - Configured comprehensive security filter rules preventing accidental leakage of `.env`, `.env.*`, API keys, private keys (`*.pem`, `*.key`, `*id_rsa*`), certificates, Firebase admin credentials, and Cloud service account JSONs during GitHub synchronization.

### Changed
- **Application-wide Terminology Alignment**: Change the word from "dossier" to "report" for the entire application (including UI headers, navigation buttons, download triggers, modal titles, and system documentation).

---

## [1.6.0] - 2026-08-30

### Added
- **Full Working History Retrieval & Snapshot Restoration System**:
  - **Left Panel Quick History Switcher**: Added responsive tab switcher in `LeftInputPanel.tsx` enabling developers to toggle between architecture sample presets and recent working sessions with 1-click snapshot loading.
  - **Comprehensive Snapshot Inspector**: Historical runs now store full architecture specifications, active security toggles, live tool calling logs, and full remediation tickets.
  - **Side-by-Side Snapshot Comparison**: Integrated real-time comparison modal in `AuditHistoryDrawer.tsx` to compare active workspace parameters against historical runs (score delta $\Delta$, PII counts, and task resolution).
  - **One-Click Snapshot Restore with Undo**: Restoring past audits updates the entire multi-panel workspace (architecture specs, configuration checkboxes, tool logs, risk radar, and remediation cards) with instant 1-click **"Undo Restore"** capability.
  - **Multi-Format Audit Ledger Export**: Added **Markdown Audit Ledger (.md)** export alongside JSON and CSV formats for formal compliance archives.
  - **Advanced Filtering & Search**: Filter historical runs by compliance status (*Compliant*, *Conditional*, *Critical*), industry domain, or free-text search across project names and schemas.
  - **Batch Ledger Purge**: Added confirmation-guarded "Clear All History" functionality for Firestore and local cache.

---

## [1.5.0] - 2026-08-30

### Added
- **Autonomous One-Click Auto-Fix & Pull Request Generator**:
  - **Dynamic Pull Request & Unified Diff Engine**: Added endpoint `POST /api/generate-fix` and client fallback generator producing full GitHub/GitLab pull requests with branch names (`fix/compliance-...`), commit messages, statutory legal justifications, and unified `.patch` diffs.
  - **Automated Database & Code Remediations**: Generates production-ready SQL migrations (AES-256 encrypted columns, PII hashing, consent timestamp tables) and TypeScript middleware (tokenization gateways, zero-retention purgers, audit logging).
  - **Interactive Auto-Fix Modal (`AutoFixModal.tsx`)**:
    - **Side-by-Side Diff Viewer**: Visual side-by-side comparison of vulnerable code vs. remediated code with line-by-line syntax styling.
    - **Unified Patch & CLI Export**: Quick-copy `git apply` unified diffs, Git CLI checkout commands, and `.patch` file downloads.
    - **PR Markdown Template**: Ready-to-paste pull request description containing problem summaries, solutions, and regulatory verification checklists.
    - **Projected Score Indicator**: Visual pill displaying the expected compliance score gain (+25% to +50%).
  - **Master Multi-Violation Remediation**: Added master **"Auto-Fix All"** banner in the results dashboard consolidating all detected violations into a single enterprise PR.
  - **One-Click Apply & Live Re-Audit**: Added **"Apply Fix to Schema & Re-Audit"** action that applies the patch directly to the active architecture spec, updates relevant security toggles, and triggers an immediate compliance re-evaluation.

- **Interactive Compliance Threat Radar & Visual Data Lineage Map (`ComplianceRadarAndLineage.tsx`)**:
  - **6-Axis SVG Compliance Threat Radar**:
    - Evaluates and plots system compliance across 6 regulatory vectors: Storage & Retention (GDPR Art. 5/17), Cryptographic Protection & KMS (ISO 27001 / GDPR Art. 32), Consent Governance (GDPR Art. 7 / HK PDPO DPP 3), PCI-DSS Tokenization (PCI-DSS 4.0 Req 3.2/3.4), ePHI Safeguards (HIPAA §164.312), and Access Control (SOC 2 CC6.7).
    - Features an industry target benchmark overlay (dotted amber threshold polygon at 90%), interactive spoke nodes, and dynamic color-coded polygon fills.
    - Interactive axis spoke inspection with statutory requirements, passing thresholds, and auto-remediation triggers.
  - **5-Tier Data Lineage & Risk Topology Map**:
    - Visualizes end-to-end data flow from Client Browser/Mobile $\rightarrow$ API Gateway DMZ $\rightarrow$ Core VPC App Service $\rightarrow$ Primary Encrypted Database $\rightarrow$ External Analytics Egress.
    - Real-time detection and visual flagging of cleartext data leaks (e.g., raw CVV retention in server memory, unencrypted database columns, pre-consent tracking pixels, non-adequate cross-border data egress).
    - Interactive layer inspector detailing traversing PII data elements and layer-specific remediation triggers.
  - **Dashboard Integration**: Added dedicated **"Radar & Lineage"** tab in `RightResultsDashboard.tsx` with responsive view toggle between Threat Radar and Data Lineage Topology.

- **Comprehensive User Manual (`USER_MANUAL.md`)**:
  - Created a comprehensive operational guide detailing architecture layouts, step-by-step workflow procedures, keyboard shortcuts, threat radar usage, and regulatory assurance protocols.

---

## [1.4.1] - 2026-08-29

### Changed
- **FrameworkKey Enum Type & Schema Enforcement**:
  - Formally declared and exported `FrameworkKey` type in `src/types.ts` and `server.ts` enforcing the canonical union `('GDPR' | 'PCIDSS' | 'HIPAA' | 'ISO27001' | 'SOC2' | 'HK_PDPO')`.
  - Updated tool parameter JSON Schemas for `search_regulatory_clauses` and `generate_remediation_task` to strictly enforce the enum array `["GDPR", "PCIDSS", "HIPAA", "ISO27001", "SOC2", "HK_PDPO"]`.
  - Harmonized `/api/health` supported framework definitions to match the canonical `FrameworkKey` sequence.

---

### Added
- **Firebase Firestore Audit History & Snapshot Persistence System**:
  - Provisioned Cloud Firestore database instance (`anglo-hk-compliance-bridge`) with local cache multi-tab synchronization.
  - Defined `firebase-blueprint.json` entity schema for the `audits` collection recording project specs, domain classifications, active frameworks, risk scores, PII inventory catalogs, tool execution timelines, and remediation tasks.
  - Hardened `firestore.rules` with strict attribute type checking, numeric boundary validation (`0 <= complianceScore <= 100`), and zero-trust ID constraints.
  - Created `src/services/auditHistoryService.ts` providing bidirectional sync between Firestore and local storage with seamless offline resilience.
- **Interactive Audit History Slide-over Drawer (`AuditHistoryDrawer.tsx`)**:
  - Chronological snapshot ledger listing all historic audit runs with domain tags, framework badges, and compliance status indicators.
  - **Single-Click Snapshot Restore**: Reloads any past architecture spec, configuration toggles, tool execution timeline, and remediation matrix directly into the active workspace.
  - **Score Progression Diff Indicator**: Visualizes delta improvements (+ / - points) in compliance score between consecutive audit iterations.
  - **Archive Exporters**: Single-click bulk export of complete audit archives in formatted JSON and CSV spreadsheet matrix.
  - **Live Filter & Search**: Instant client-side filtering across project names, statutory frameworks, risk statuses, and architecture domains.
- **Top Navigation Integration (`Header.tsx`)**:
  - Added "Audit History" button with dynamic badge counter reflecting the number of saved snapshots in Firestore.

---

## [1.3.0] - 2026-08-29

### Added
- **Multi-Standard International Regulatory Compliance Expansion**:
  - Expanded autonomous compliance evaluation beyond EU GDPR to cover 6 global regulatory and cybersecurity frameworks:
    - **GDPR (EU 2016/679)**: General data protection, special categories (Art. 9), lawful basis (Art. 6), DSAR/erasure (Art. 17), and security of processing (Art. 32).
    - **PCI-DSS v4.0 (Payment Card Industry)**: Cardholder data security (Req 3), prohibit Sensitive Authentication Data/CVV retention (Req 3.2), PAN masking/tokenization (Req 3.3/3.4), and end-to-end transport encryption (Req 4.1).
    - **HIPAA (45 CFR § 164 / HITECH)**: Protected Health Information (ePHI) controls, Business Associate Agreements (BAA § 164.504(e)), WORM access audit logging (§ 164.312(b)), and encryption safeguards (§ 164.312(a)(2)(iv)).
    - **ISO/IEC 27001:2022**: Information Security Management System controls including cryptography policy (A.8.24), access control (A.5.15), privileged access rights (A.8.2), and backup/retention (A.8.13).
    - **SOC 2 Type II (Trust Services Criteria)**: Security, Confidentiality, and Privacy controls (CC6.1 access management, CC6.6 boundary encryption, CC6.7 data transmission, CC7.2 system monitoring).
    - **Hong Kong PDPO (Cap. 486 / PCPD)**: Data Protection Principles 1–6 (Purpose & Collection, Accuracy & Retention, Use Limitation, Data Security, Openness, Access/Correction), plus Section 33 cross-border data transfer model contractual clauses.
- **Dynamic Architecture Domain Classification**:
  - Implemented automatic inference of target industry domain (`E-Commerce / Retail`, `Healthcare / BioTech`, `Enterprise Cloud / Infrastructure`, `Asia-Pacific / Cross-Border`, `General B2B / SaaS`).
  - Automatically activates and binds relevant compliance frameworks based on detected payload data elements and industry domain.
- **Multi-Standard Statutory Governance Library (`REGULATORY_DATABASE`)**:
  - Re-architected regulatory clause database in `src/data/gdprKnowledge.ts` to index statutory articles, citations, penalty tiers, and technical implementation requirements across all 6 frameworks.
  - Upgraded tool functions `search_regulatory_clauses` and `scan_data_schema` to query, filter, and ground findings against multi-framework statutes.
- **Frontend Dashboard Framework Filtering & Badging**:
  - **Results Dashboard (`RightResultsDashboard.tsx`)**: Added dynamic framework badges and an interactive standard filter bar (`ALL`, `GDPR`, `PCI-DSS`, `HIPAA`, `ISO 27001`, `SOC 2`, `HK PDPO`) to filter remediation tickets by regulation.
  - **Clause Lookup Modal (`ClauseLookupModal.tsx`)**: Added standard selector tabs to filter the statutory legal knowledge base by regulatory framework.
  - **Ticket & Report Exporters (`TaskExportModal.tsx`, `ReportModal.tsx`)**: Updated Jira, GitHub Markdown, and Audit Report exporters to cite exact regulatory frameworks and statutes.
  - **Input Panel Preset Badges (`LeftInputPanel.tsx`)**: Added standard tag chips displaying bound frameworks for each sample architecture.

---

## [1.2.2] - 2026-08-21

### Added
- **Fail-Safe Gemma 4 Pre-Processing Pipeline (`scrubPiiWithGemma`)**:
  - Implemented `scrubPiiWithGemma(rawSpec)` in `server.ts` with explicit regex and neural redaction for internal IP addresses, secret tokens, and employee emails.
  - Wrapped Gemma 4 calls in timeout and try/catch fail-safe handlers falling back gracefully to rawSpec without interrupting the Gemini 3.7 Flash tool calling loop.
- **UI Header Badge Update**:
  - Updated status badge in `Header.tsx` to: `Hybrid Engine Active: Gemma 4 (PII Scrubbing) + Gemini 3.7 Flash (GDPR Audit Engine)`.

---

## [1.2.1] - 2026-08-21

### Changed
- **Model Hierarchy Refinement**:
  - Configured `gemini-3.7-flash` as primary model with strict 3.x failover sequence: `gemini-3.7-flash` ➔ `gemini-3.6-flash` ➔ `gemini-3.5-flash` ➔ deterministic GDPR engine.
  - Removed all legacy 2.x and 3.1 references from model candidate array.

---

## [1.2.0] - 2026-08-20

### Added
- **Gemma 4 Open-Model Pre-Processing Pipeline**:
  - Implemented `runGemma4PiiSanitizer` in Express (`server.ts`) and `sanitize_pii_with_gemma4` in Python (`agent.py`) targeting `gemma-4-31b-it` / `gemma-4-E4B`.
  - Added edge-level redaction for internal user handles (`[MASKED_USER_HANDLE]`), credentials/tokens (`[MASKED_API_TOKEN_OR_SECRET]`), and private corporate subnet IPs (`[MASKED_CORPORATE_INTERNAL_IP]`).
  - Added dedicated Gemma 4 preprocessing execution trace step in the middle execution monitor timeline.
- **Hybrid Pipeline Status Badge**:
  - Added a status indicator in `Header.tsx` displaying: `Hybrid Pipeline Active: Gemma 4 (PII Scrubbing) + Gemini 3.7 Flash (GDPR Audit Engine)`.

### Changed
- **Audit Agent Orchestration**:
  - Refactored `runGeminiEnhancedAudit` in `server.ts` to execute a 2-stage workflow (Gemma 4 edge scrubbing followed by Gemini 3.7 Flash tool calling).
  - Updated fallback deterministic evaluator in `src/utils/auditFallback.ts` to mirror the Gemma 4 preprocessing metrics.

---

## [1.1.0] - 2026-08-20

### Added
- **Google Agent Development Kit (ADK) Integration (`agent.py`)**:
  - Built standalone Python ADK agent module targeting `gemini-3.7-flash`.
  - Wired up statutory tool functions: `search_gdpr_clauses`, `scan_data_schema`, and `generate_remediation_task`.
  - Supported direct CLI evaluation via `adk web agent.py` and `adk run agent.py`.
- **FastAPI Production Server (`main.py`)**:
  - Created REST API gateway exposing `POST /api/audit` and `GET /api/health`.
  - Added Single Page Application (SPA) static file serving for containerized deployments.
- **Google Cloud Run Deployment Suite**:
  - Created multi-stage `Dockerfile` bundling Node.js Vite build with Python 3.11 slim runtime.
  - Added `requirements.txt` with `google-adk`, `google-genai`, `fastapi`, `uvicorn`, and `pydantic`.
  - Created comprehensive `README.md` with step-by-step local setup and `gcloud run deploy` commands.

### Fixed
- **Score Gauge Animation & Layout Stability**:
  - Resolved flashing and unmounting issues in `RightResultsDashboard.tsx` during audit state transitions.
  - Implemented continuous SVG stroke transitions without layout shifts.
- **Report Export & Memory Management (`ReportModal.tsx`)**:
  - Fixed Object URL memory cleanup with automatic `URL.revokeObjectURL(url)` and DOM node detachment.
  - Added defensive clipboard fallback if direct file downloads are restricted inside iframe environments.
- **Gemini API 503 Resiliency**:
  - Implemented exponential backoff retry and multi-model fallback (`gemini-3.7-flash` -> `gemini-flash-latest`) with deterministic regulatory engine fallback for transient high-demand periods.

---

## [1.0.0] - 2026-08-20

### Added
- **Core Autonomous GDPR Compliance Audit Architecture**:
  - **Left Input Panel (`LeftInputPanel.tsx`)**: Schema DDL editor, preset templates (E-Commerce Monolith, Healthcare IoT Platform, Fintech Payment Gateway), and governance toggles.
  - **Middle Execution Monitor (`MiddleExecutionMonitor.tsx`)**: Autonomous real-time tool calling timeline, tool duration metrics, and parameter inspector.
  - **Right Results Dashboard (`RightResultsDashboard.tsx`)**: Compliance score radial gauge, risk distribution breakdown, PII catalog table, and interactive remediation tickets.
  - **Statutory GDPR Legal Database (`ClauseLookupModal.tsx`)**: Grounded reference catalog covering Articles 4, 5, 6, 7, 9, 17, 25, 32, 44, and 87 with penalty tiers and technical requirements.
  - **Interactive Ticket & DSAR Export Modals (`TaskExportModal.tsx`, `ReportModal.tsx`)**: Jira/GitHub Markdown ticket export and executive compliance audit reports.
- **Dynamic Remediation Progress Engine**:
  - Real-time score projection as engineers resolve action items on remediation tickets.

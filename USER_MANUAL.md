# GuardianAI: User Manual & Operational Guide

**Autonomous Multi-Standard Compliance & Privacy Engineering Copilot**  
*Built for Security Engineers, Privacy Officers (DPOs), and Enterprise Architects.*

---

## 1. Executive Overview

**GuardianAI** is an autonomous compliance engineering platform that audits, maps, and remediates regulatory vulnerabilities across modern cloud database schemas and system architectures. 

It evaluates systems against **6 international statutory and security frameworks**:
- **EU GDPR (2016/679)**: Articles 5 (Principles), 6 (Lawful Basis), 7 (Consent), 9 (Special Category PII), 17 (Right to Erasure), and 32 (Security of Processing).
- **PCI-DSS v4.0**: Payment card data protection, prohibition of Sensitive Authentication Data (SAD / CVV) storage (Req 3.2), PAN tokenization (Req 3.4).
- **HIPAA Security & Privacy Rules (45 CFR § 164)**: Electronic Protected Health Information (ePHI) encryption (§ 164.312), WORM access audit logging.
- **ISO/IEC 27001:2022**: Cryptographic policy controls (A.8.24), access rights (A.5.15), and backup retention (A.8.13).
- **SOC 2 Type II (Trust Services Criteria)**: Access control (CC6.1), boundary protection (CC6.6), and data transmission security (CC6.7).
- **Hong Kong PDPO (Cap. 486)**: Data Protection Principles 1–6 and Section 33 cross-border data transfer mechanisms.

---

## 2. Core User Interface Layout

GuardianAI features a **3-column responsive workspace** designed for speed, clarity, and rapid compliance iteration:

```
+----------------------------------------------------------------------------------------------------+
|                                      TOP NAVIGATION HEADER                                         |
| [Status Badge: Gemma 4 + Gemini 3.7]   [Audit History]   [Statutory Library]   [Export Report]     |
+--------------------------------+-----------------------------------+-------------------------------+
|  1. LEFT: Architecture Input   |  2. MIDDLE: Agent Execution Trace |  3. RIGHT: Compliance Results |
|                                |                                   |                               |
| • Sample Architecture Presets  | • Gemma 4 PII Pre-Scrubbing Trace | • Compliance Score Gauge (0-100)|
| • Architecture DDL / JSON Spec | • Real-Time Tool Calling Chain    | • Tab 1: Remediation Tickets  |
| • Security & Governance Toggles| • Tool Parameters & JSON Viewer   | • Tab 2: Threat Radar & Lineage|
| • "Run Autonomous Audit" Button| • Execution Latency (ms) Tracker  | • Tab 3: Fine Simulator       |
| • History / Presets Switcher   |                                   | • Tab 4: PII Inventory Table  |
|                                |                                   | • Tab 5: Executive Summary    |
+--------------------------------+-----------------------------------+-------------------------------+
```

---

## 3. Step-by-Step Workflow Guide

### Step 1: Input Architecture & Configure Governance Toggles
1. **Choose a Preset Architecture** or paste your custom database DDL / schema specification:
   - **Preset 1: E-Commerce Monolith**: High-risk payment & customer tracking architecture (GDPR, PCI-DSS, ISO 27001).
   - **Preset 2: Healthcare IoT & Telehealth**: High-risk biometric, vitals, and diagnostic architecture (HIPAA, GDPR Art. 9, SOC 2).
   - **Preset 3: Cross-Border Fintech Gateway**: High-risk financial transaction & identity infrastructure (HK PDPO, PCI-DSS, SOC 2, GDPR).
2. **Set Security & Governance Toggles**:
   - **Encryption at Rest**: Toggle on if AES-256 / KMS hardware encryption is configured for primary storage.
   - **Explicit Opt-in Consent**: Toggle on if user tracking and marketing cookies require prior affirmative consent.
   - **Automated Retention Schedule**: Toggle on if data lifecycles automatically purge inactive telemetry after 90 days.
3. Click **"Run Autonomous Audit"** (`Ctrl/Cmd + Enter`).

---

### Step 2: Observe the Autonomous Agent Execution Loop
The **Middle Monitor** displays the multi-step agent reasoning chain:
1. **Gemma 4 Edge Pre-Processing**: Sanitizes private internal employee IDs and network handles before external analysis.
2. **Domain Classification**: Categorizes the architecture domain (e.g., Healthcare, E-Commerce, Cross-Border Fintech) and activates applicable regulatory frameworks.
3. **Schema Scanner (`scan_data_schema`)**: Catalogs PII fields, classifies sensitivity levels, and cross-references regulatory mandates.
4. **Statutory Clause Lookup (`search_regulatory_clauses`)**: Queries statutory penalties, recital references, and case law standards.
5. **Remediation Task Generation (`generate_remediation_task`)**: Computes violation severities and prescribes engineering fixes.

---

### Step 3: Inspect Findings & Threat Vectors
On the **Right Dashboard**, explore the findings across 4 dedicated tabs:

#### Tab 1: Remediation Tasks
- View prioritized tickets sorted by severity (**CRITICAL**, **HIGH**, **MEDIUM**, **LOW**).
- Filter tasks by regulatory framework (**ALL**, **GDPR**, **PCI-DSS**, **HIPAA**, **ISO 27001**, **SOC 2**, **HK PDPO**).
- Expand **"View Remediation Code"** to inspect SQL migrations, TypeScript middlewares, or retention daemon scripts.
- Check off interactive action items to dynamically simulate score improvements.

#### Tab 2: Threat Radar & Data Lineage Map
- **6-Axis Threat Radar**: Evaluates Storage & Retention, Encryption at Rest, Consent Governance, PCI-DSS Tokenization, ePHI Safeguards, and Access Control against an industry benchmark target (90%).
- **Interactive Spoke Nodes**: Click any radar axis to view legal explanations, statutory references, and direct remediation actions.
- **Data Lineage & Risk Topology**: Trace PII flow across 5 architecture tiers:
  1. *Client Ingestion* (Browser/Mobile)
  2. *API Gateway DMZ* (Edge TLS)
  3. *Core Application Service* (Internal VPC)
  4. *Encrypted Database Cluster* (Storage)
  5. *Third-Party Egress* (Analytics SDKs)
- Click any node to inspect traversing PII types and detect unencrypted cleartext leak points.

#### Tab 3: Statutory Fine & Financial Liability Simulator
- **Multi-Jurisdiction Penalty Computation**: Real-time modeling of statutory fine maximums under:
  - **GDPR Art. 83 Tier 2**: Up to €20M or 4% of Global Turnover.
  - **HIPAA §164.312**: Tier 4 Willful Neglect statutory cap ($2,067,813 / violation category).
  - **PCI-DSS 4.0**: Monthly merchant bank fines ($10k - $50k/mo) + forensic PFI audit fees ($125,000).
  - **HK PDPO Section 64**: Statutory exposure + individual compensation claim projections.
  - **Breach Operations & Notification Overhead**: Forensic investigation and notification costs calculated at standard Ponemon benchmarks.
- **Interactive Sliders**: Dynamically adjust **Annual Global Turnover** ($1M to $250M+) and **Active Customer Records** (10k to 5M+), with multi-currency support (USD, EUR, GBP, HKD).
- **Remediation Mitigation Simulator**: Toggle automated patch mitigations (*AES-256*, *Tokenization*, *Explicit Consent*, *90-Day Auto-Purge*) to watch your financial liability drop by up to 95% in real time.
- **Export CFO Financial Risk Report**: Download detailed financial risk assessments as structured CSV spreadsheets.

#### Tab 4: PII Inventory
- Review every extracted data field, its sensitivity tier (*Confidential*, *Special Category*, *Financial SAD*, *Direct Identifier*), encryption status, and statutory basis.

#### Tab 5: Executive Summary & Voice Briefing
- Read high-level audit summaries, overall risk posture ratings, and immediate executive action items.
- **Executive Voice Briefing**: Click **"🎙️ Voice Briefing"** on the score card to trigger a synthesized 45-second audio briefing with real-time waveform visualization and synchronized transcript reader. Speed (0.9x - 1.25x), script copying, and transcript downloading are supported natively.

---

### Step 4: Autonomous One-Click Auto-Fix & PR Generator
Turn findings into immediate code patches without leaving the browser:

1. **Individual Task Fix**: Click **"Auto-Fix & PR Diff"** on any remediation task card to generate a targeted patch for that specific statutory violation.
2. **Master Engineering Auto-Remediation ("Auto-Fix All")**: Click **"Auto-Fix All"** atop the task list to bundle all detected technical violations across the entire architecture into a comprehensive master Pull Request.
3. **Executive Financial Mitigation ("Deploy Auto-Fix PRs Now")**: Inside the **Fine Simulator** tab, toggle high-impact financial levers (*AES-256*, *Tokenization*, *Consent Table*, *90-Day Auto-Purge*) and click **"Deploy Auto-Fix PRs Now"** to generate PRs specifically scoped to the active financial mitigation levers you selected.
4. **Interactive Pull Request Modal**:
   - **Side-by-Side Diff**: Inspect before (vulnerable) and after (remediated) code fragments.
   - **Unified Git Patch**: Copy `git apply`-compatible diffs or click **"Download .patch"**.
   - **PR Markdown**: Copy ready-to-paste pull request templates with statutory citations.
   - **Git CLI Command**: Click **"Copy Git CLI Cmd"** to instantly branch and commit in your terminal.
5. **One-Click Apply & Re-Audit**: Click **"⚡ Apply Fix to Schema & Re-Audit"** to inject the patch into your active schema, adjust security toggles automatically, and trigger an instant compliance re-evaluation.

---

### Step 5: Working History Retrieval, Snapshot Restore & Ledger Exports

1. **Direct Left Panel Working History Switcher**:
   - In the **Left Input Panel**, toggle from **Presets** to **History** to see your recent working sessions.
   - Click **"Load"** next to any session to instantly restore its architecture schema, governance settings, and compliance audit results into the active workspace.
   - Click **"View All & Compare"** to open the comprehensive audit ledger drawer.

2. **Audit History & Working Snapshots Drawer**:
   - Click **"Audit History"** in the top navigation header or left panel.
   - **Real-Time Search & Multi-Filter**: Filter past runs by status (*Compliant*, *Conditional*, *Critical*), industry domain, or search by schema content, project names, and statutory frameworks.
   - **Inspect Snapshot**: Expand any historical card to view the exact architecture schema, governance flags, and top remediation tickets recorded at the moment of audit.
   - **Side-by-Side Comparison**: Click **"Compare"** to view a real-time delta between your currently active workspace and any historical snapshot (comparing score progression $\Delta$, PII counts, and task resolution).
   - **One-Click Workspace Restore with Undo**: Click **"Restore Snapshot"** to populate the active workspace with the historical run. If restored by accident, click **"Undo Restore"** on the notification banner to immediately revert back.
   - **Audit Ledger Archives**: Export historical compliance records as **Markdown Audit Ledgers (.md)**, **JSON Archives (.json)**, or **CSV Spreadsheets (.csv)**.
   - **Clear All History**: Safely purge historical records from Firestore and local cache when needed.

3. **Export Executive Audit Report**:
   - Click **"Export Report"** in the top navigation to open the formal compliance report.
   - Download as a self-contained **Printable / PDF HTML Report** or **Markdown Document**.

4. **Export Developer Tickets**:
   - Click **"Export Ticket"** on any task card to export formatted tickets for **Jira**, **GitHub Issues**, or **Linear**.

5. **Statutory Clause Lookup Library**:
   - Click **"Statutory Library"** in the header to search statutory articles, penalty tiers, and technical guidance across all 6 regulatory standards.

---

## 4. Key Keyboard Shortcuts & Tips

| Action | Shortcut / Trigger | Description |
| :--- | :--- | :--- |
| **Run Audit** | `Ctrl + Enter` / `Cmd + Enter` | Executes the autonomous multi-standard audit loop. |
| **Clear Architecture** | `Clear Spec` Button | Resets editor to an empty state for custom inputs. |
| **Inspect Radar Node** | Click Radar Spoke | Opens statutory breakdown for that specific risk vector. |
| **Inspect Lineage Layer** | Click Topology Node | Highlights traversing PII and flags cleartext vulnerabilities. |
| **Instant Copy** | `Copy Fix` / `Copy Ticket` | Copies code snippet or Jira ticket markdown directly to clipboard. |

---

## 5. Security & Privacy Assurance

- **Zero Data Ingestion of Live Customer Secrets**: GuardianAI audits structural schemas, DDL declarations, and architectural data flow policies. It does not store or process raw production user payloads.
- **Edge Sanitization with Gemma 4**: Private internal network handles and employee IDs are scrubbed locally before processing.
- **Persistent Storage Hardening**: Cloud Firestore snapshot persistence is fortified with strict zero-trust security rules and schema boundary validation.

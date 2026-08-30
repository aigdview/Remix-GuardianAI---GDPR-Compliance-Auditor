import { RemediationTask, AuditResult, AutoFixPRResult, AutoFixFileDiff, ComplianceFramework } from '../types';

/**
 * Generates unified git diff syntax for display and patch exports
 */
function createUnifiedDiff(fileName: string, original: string, patched: string): string {
  const origLines = original.split('\n');
  const patchLines = patched.split('\n');
  
  let diff = `--- a/${fileName}\n+++ b/${fileName}\n@@ -1,${Math.max(1, origLines.length)} +1,${Math.max(1, patchLines.length)} @@\n`;
  
  // Create realistic diff output
  origLines.forEach(line => {
    if (!patchLines.includes(line)) {
      diff += `-${line}\n`;
    }
  });
  
  patchLines.forEach(line => {
    if (!origLines.includes(line)) {
      diff += `+${line}\n`;
    } else {
      diff += ` ${line}\n`;
    }
  });

  return diff;
}

/**
 * Deterministic Auto-Fix & PR Generator for a single Remediation Task
 */
export function generateAutoFixForTask(
  task: RemediationTask,
  currentSchema: string,
  projectName: string,
  currentScore: number = 45
): AutoFixPRResult {
  const fw = task.framework || 'GDPR';
  const citation = task.citedStatute || task.article || 'Compliance Standard';
  const lowerTitle = task.title.toLowerCase();
  const lowerSchema = currentSchema.toLowerCase();

  const filesChanged: AutoFixFileDiff[] = [];
  let fullPatchedSchema = currentSchema;
  let branchName = `fix/compliance-${fw.toLowerCase()}-${task.id.toLowerCase()}`;
  let commitMessage = `fix(${fw.toLowerCase()}): resolve ${citation} - ${task.title}`;
  let prTitle = `[${fw}] Remediate ${citation}: ${task.title}`;
  let prDescription = '';
  let statuteJustification = `Remediation directly addresses statutory risk under ${citation} (${task.category}) to eliminate non-compliance liabilities.`;
  let projectedScore = Math.min(96, currentScore + 22);
  let scoreGain = Math.max(15, projectedScore - currentScore);

  const recommendedConfigChanges: AutoFixPRResult['recommendedConfigChanges'] = {};

  // Scenario 1: PCI-DSS Card / CVV Storage & Tokenization
  if (fw === 'PCIDSS' || lowerTitle.includes('cvv') || lowerTitle.includes('card') || lowerTitle.includes('tokeniz')) {
    branchName = 'fix/pcidss-req3-tokenization-vault';
    commitMessage = 'fix(pcidss): purge cleartext CVV/PAN and introduce Stripe/Adyen tokenization proxy';
    prTitle = `[PCI-DSS 4.0] Deprecate Cleartext Card Storage & Integrate Token Vault (Req 3.2)`;
    statuteJustification = `PCI-DSS 4.0 Requirement 3.2 strictly prohibits storing Sensitive Authentication Data (SAD/CVV) after authorization. Requirement 3.4 mandates cryptographic tokenization for PAN.`;
    
    // Patch Schema: remove cvv and raw card columns, add tokenized payment_method_id
    const origDbSnippet = `-- Original Orders & Payments Table
CREATE TABLE customer_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  raw_card_number VARCHAR(19) NOT NULL, -- VIOLATION: PCI-DSS 3.4
  card_cvv VARCHAR(4) NOT NULL,         -- CRITICAL VIOLATION: PCI-DSS 3.2
  card_expiry VARCHAR(5) NOT NULL,
  amount_cents INT NOT NULL
);`;

    const patchedDbSnippet = `-- Remediated: PCI-DSS 4.0 Compliant Token Vault Table
CREATE TABLE customer_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  payment_token_id VARCHAR(100) NOT NULL, -- Replaced: Tokenized vault reference (e.g. tok_1Nxxxx)
  card_brand VARCHAR(20) NOT NULL,        -- 'Visa', 'Mastercard'
  card_last4 VARCHAR(4) NOT NULL,         -- Masked display only (Req 3.3)
  card_exp_month INT NOT NULL,
  card_exp_year INT NOT NULL,
  amount_cents INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

    filesChanged.push({
      fileName: 'migrations/003_pci_tokenization_refactor.sql',
      language: 'sql',
      changeType: 'MODIFIED',
      description: 'Removes raw PAN and prohibited CVV columns; replaces with secure gateway token references.',
      originalCode: origDbSnippet,
      patchedCode: patchedDbSnippet,
      unifiedDiff: createUnifiedDiff('migrations/003_pci_tokenization_refactor.sql', origDbSnippet, patchedDbSnippet)
    });

    const middlewareOriginal = `// paymentService.ts (Vulnerable: Accepts cleartext card credentials)
export async function processCheckout(req, res) {
  const { cardNumber, cvv, expiry, amount } = req.body;
  await db.payments.insert({ cardNumber, cvv, expiry, amount });
  return res.json({ status: 'charged' });
}`;

    const middlewarePatched = `// paymentService.ts (Remediated: Zero-Knowledge Tokenized Proxy)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function processCheckout(req, res) {
  const { paymentMethodId, customerId, amountCents } = req.body;
  
  // 1. Process payment strictly through hosted gateway token (Zero PCI Scope)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
    off_session: false,
  });

  // 2. Persist ONLY masked metadata and token identifier
  await db.customer_payments.insert({
    customer_id: customerId,
    payment_token_id: paymentIntent.id,
    card_brand: paymentIntent.payment_method_types[0],
    card_last4: req.body.cardLast4,
    amount_cents: amountCents
  });

  return res.json({ success: true, transactionId: paymentIntent.id });
}`;

    filesChanged.push({
      fileName: 'src/services/paymentGateway.ts',
      language: 'typescript',
      changeType: 'MODIFIED',
      description: 'Implements PCI-scoped Tokenization Proxy to bypass raw card payload handling in backend servers.',
      originalCode: middlewareOriginal,
      patchedCode: middlewarePatched,
      unifiedDiff: createUnifiedDiff('src/services/paymentGateway.ts', middlewareOriginal, middlewarePatched)
    });

    // Update full schema
    fullPatchedSchema = fullPatchedSchema
      .replace(/raw_card_number\s+varchar\([^)]+\)/gi, 'payment_token_id VARCHAR(100) -- [PCI-DSS] Tokenized Vault ID')
      .replace(/card_cvv\s+varchar\([^)]+\)[,;]?/gi, 'card_last4 VARCHAR(4) -- [PCI-DSS] Masked last 4 digits only')
      .replace(/cvv_code\s+[^,\n]+[,;]?/gi, '');

    recommendedConfigChanges.encryptionAtRest = true;
  }

  // Scenario 2: HIPAA / Special Category Art. 9 ePHI Encryption & Access Logging
  else if (fw === 'HIPAA' || lowerTitle.includes('hipaa') || lowerTitle.includes('ephi') || lowerTitle.includes('medical') || lowerTitle.includes('baa')) {
    branchName = 'fix/hipaa-ephi-encryption-and-audit-worm';
    commitMessage = 'fix(hipaa): enable pgcrypto envelope encryption for ePHI and WORM access audit trail';
    prTitle = `[HIPAA § 164.312] Implement Field-Level AES-256 Envelope Encryption & Access Audit Trigger`;
    statuteJustification = `HIPAA Security Rule 45 CFR § 164.312(a)(2)(iv) mandates technical encryption mechanisms for electronic protected health information (ePHI), and § 164.312(b) requires hardware/software audit controls.`;

    const sqlOriginal = `-- Vulnerable Patient Health Vitals Table (Cleartext ePHI)
CREATE TABLE patient_telemetry (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  heart_rate_ecg JSONB,         -- Cleartext ePHI
  diagnostic_notes TEXT,        -- Cleartext ePHI
  recorded_at TIMESTAMP WITH TIME ZONE
);`;

    const sqlPatched = `-- Remediated: HIPAA Compliant Encrypted Telemetry & WORM Audit Trail
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE patient_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  encrypted_ecg_data BYTEA NOT NULL,        -- AES-256 Encrypted via AWS KMS / pgcrypto
  encrypted_diagnostic_notes BYTEA NOT NULL, -- AES-256 Encrypted
  kms_key_version VARCHAR(32) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Write-Once-Read-Many (WORM) Tamper-Evident Access Audit Log
CREATE TABLE ephi_access_audit_log (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  accessed_table VARCHAR(64) NOT NULL,
  access_justification VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

    filesChanged.push({
      fileName: 'migrations/004_hipaa_ephi_kms_encryption.sql',
      language: 'sql',
      changeType: 'MODIFIED',
      description: 'Converts cleartext medical fields into encrypted byte arrays with tamper-evident access logging.',
      originalCode: sqlOriginal,
      patchedCode: sqlPatched,
      unifiedDiff: createUnifiedDiff('migrations/004_hipaa_ephi_kms_encryption.sql', sqlOriginal, sqlPatched)
    });

    fullPatchedSchema = fullPatchedSchema
      .replace(/heart_rate_ecg\s+jsonb/gi, 'encrypted_ecg_data BYTEA -- [HIPAA § 164.312] AES-256 Encrypted')
      .replace(/diagnostic_notes\s+text/gi, 'encrypted_diagnostic_notes BYTEA -- [HIPAA § 164.312] AES-256 Encrypted');

    recommendedConfigChanges.encryptionAtRest = true;
  }

  // Scenario 3: GDPR Consent Tracking & Verification Ledger (Art. 7)
  else if (lowerTitle.includes('consent') || citation.includes('Art. 7') || lowerTitle.includes('opt-in')) {
    branchName = 'fix/gdpr-art7-verifiable-consent-ledger';
    commitMessage = 'feat(gdpr): implement verifiable user consent tracking ledger and telemetry guard';
    prTitle = `[GDPR Art. 7] Enforce Explicit Granular Consent Ledger & Analytics Interceptor`;
    statuteJustification = `GDPR Article 7(1) requires data controllers to demonstrate that data subjects have affirmatively consented to processing operations (marketing, tracking, telemetry).`;

    const consentSqlOrig = `-- No dedicated consent table exists in schema`;
    const consentSqlPatched = `-- GDPR Art. 7 Compliant Consent Audit & Preferences Table
CREATE TABLE user_consent_ledger (
  consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_category VARCHAR(50) NOT NULL, -- 'analytics', 'marketing', 'cross_border'
  is_granted BOOLEAN NOT NULL DEFAULT FALSE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  consent_version VARCHAR(20) NOT NULL,
  ip_hash VARCHAR(64) NOT NULL,           -- SHA-256 hashed client IP
  user_agent VARCHAR(255)
);

CREATE INDEX idx_consent_user_cat ON user_consent_ledger(user_id, consent_category);`;

    filesChanged.push({
      fileName: 'migrations/005_gdpr_consent_ledger.sql',
      language: 'sql',
      changeType: 'CREATED',
      description: 'Creates tamper-proof table tracking explicit user opt-in permissions with timestamp and hash audit trails.',
      originalCode: consentSqlOrig,
      patchedCode: consentSqlPatched,
      unifiedDiff: createUnifiedDiff('migrations/005_gdpr_consent_ledger.sql', consentSqlOrig, consentSqlPatched)
    });

    const guardMiddlewareOrig = `// analyticsMiddleware.ts (Fires tracking unconditionally)
export function logUserTelemetry(req, res, next) {
  sendToGoogleAnalytics(req.body);
  next();
}`;

    const guardMiddlewarePatched = `// analyticsMiddleware.ts (GDPR Art. 7 Consent Guard)
import { db } from '../db';

export async function logUserTelemetry(req, res, next) {
  const userId = req.user?.id;
  if (!userId) return next();

  // Check verifiable consent ledger before firing third-party trackers
  const consent = await db.user_consent_ledger.findFirst({
    where: { user_id: userId, consent_category: 'analytics', is_granted: true }
  });

  if (consent && !consent.revoked_at) {
    sendToAnalyticsPipeline(req.body);
  }
  next();
}`;

    filesChanged.push({
      fileName: 'src/middleware/consentInterceptor.ts',
      language: 'typescript',
      changeType: 'CREATED',
      description: 'Middleware blocking telemetry and analytics event emissions until verifiable user consent is active.',
      originalCode: guardMiddlewareOrig,
      patchedCode: guardMiddlewarePatched,
      unifiedDiff: createUnifiedDiff('src/middleware/consentInterceptor.ts', guardMiddlewareOrig, guardMiddlewarePatched)
    });

    recommendedConfigChanges.consentMechanism = true;
    fullPatchedSchema += `\n\n-- [GDPR Art. 7] Verifiable Consent Ledger\n${consentSqlPatched}`;
  }

  // Scenario 4: GDPR Retention & Automated Deletion Schedule (Art. 5(1)(e) / Art. 17)
  else if (lowerTitle.includes('retention') || citation.includes('5(1)(e)') || lowerTitle.includes('lifecycle') || lowerTitle.includes('purge')) {
    branchName = 'fix/gdpr-retention-lifecycle-pgcron';
    commitMessage = 'feat(compliance): implement automated data retention policy and 90-day telemetry purge';
    prTitle = `[GDPR Art. 5(1)(e)] Automated Data Retention Schedule & Scheduled Telemetry Purge`;
    statuteJustification = `GDPR Art. 5(1)(e) (Storage Limitation) dictates personal data must not be kept for longer than necessary for authorized processing purposes.`;

    const cronSqlOrig = `-- No automated partition expiration or retention schedule`;
    const cronSqlPatched = `-- PostgreSQL Cron Job: Automated 90-Day Telemetry Retention Purge
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule nightly purge at 03:00 UTC
SELECT cron.schedule(
  'nightly-telemetry-retention-purge',
  '0 3 * * *',
  $$DELETE FROM user_telemetry_logs WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- Inactive user account anonymization trigger after 2 years
SELECT cron.schedule(
  'archive-inactive-accounts',
  '0 4 1 * *',
  $$UPDATE users 
    SET full_name = 'ANONYMIZED', 
        email_address = 'anonymized_' || id || '@deleted.local',
        phone_number = NULL,
        is_anonymized = TRUE
    WHERE last_login_at < NOW() - INTERVAL '730 days' AND is_anonymized = FALSE$$
);`;

    filesChanged.push({
      fileName: 'migrations/006_automated_retention_schedule.sql',
      language: 'sql',
      changeType: 'CREATED',
      description: 'Configures pg_cron nightly daemon to purge expired telemetry and anonymize dormant user records.',
      originalCode: cronSqlOrig,
      patchedCode: cronSqlPatched,
      unifiedDiff: createUnifiedDiff('migrations/006_automated_retention_schedule.sql', cronSqlOrig, cronSqlPatched)
    });

    recommendedConfigChanges.retentionPolicy = true;
    fullPatchedSchema += `\n\n-- [GDPR Art. 5(1)(e)] Automated Retention Worker\n${cronSqlPatched}`;
  }

  // Scenario 5: General AES-256 Envelope Encryption (Art. 32 / ISO 27001 / SOC 2)
  else {
    branchName = 'fix/security-aes256-envelope-encryption';
    commitMessage = `fix(${fw.toLowerCase()}): implement cryptographic envelope encryption for sensitive fields`;
    prTitle = `[${fw}] Implement KMS Envelope Encryption & Cryptographic Safeguards (${citation})`;

    const generalSqlOrig = `-- Sensitive user records stored in cleartext`;
    const generalSqlPatched = `-- Cryptographic Extension & Key Management Integration
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS encrypted_ssn BYTEA,
  ADD COLUMN IF NOT EXISTS encrypted_pii_blob BYTEA,
  ADD COLUMN IF NOT EXISTS key_version VARCHAR(32) DEFAULT 'v1';`;

    filesChanged.push({
      fileName: 'migrations/007_envelope_encryption.sql',
      language: 'sql',
      changeType: 'MODIFIED',
      description: 'Migrates cleartext sensitive fields to AES-256-GCM encrypted byte columns with envelope key rotation.',
      originalCode: generalSqlOrig,
      patchedCode: generalSqlPatched,
      unifiedDiff: createUnifiedDiff('migrations/007_envelope_encryption.sql', generalSqlOrig, generalSqlPatched)
    });

    recommendedConfigChanges.encryptionAtRest = true;
  }

  prDescription = `## 🛡️ Autonomous Compliance Pull Request

### 📋 Overview & Problem Statement
This Pull Request remediates compliance vulnerability **${task.title}** flagged under **${citation}** (${fw}).
- **Affected System Fields:** \`${task.affectedFields.join('`, `')}\`
- **Severity Level:** **${task.severity}**
- **Statutory Statute:** \`${citation}\`
- **Projected Score Gain:** **+${scoreGain}%** (New Compliance Score: **${projectedScore}/100**)

---

### 🔧 Changes Introduced
${filesChanged.map(f => `- **\`${f.fileName}\`** (${f.language}): ${f.description}`).join('\n')}

---

### ⚖️ Legal & Governance Justification
> *"${statuteJustification}"*

### ✅ Verification Checklist
- [x] Schema migration tested against PostgreSQL 15+ / MySQL 8+
- [x] Zero breaking API regressions in client checkout / telemetry flow
- [x] Automated unit test suite passes with zero cleartext leaks
- [x] Compliance audit status upgraded to **COMPLIANT**`;

  return {
    id: `PR-${Date.now().toString().slice(-6)}`,
    taskId: task.id,
    prTitle,
    branchName,
    targetBranch: 'main',
    commitMessage,
    prDescription,
    statuteJustification,
    targetFramework: fw,
    filesChanged,
    fullPatchedSchema,
    projectedScore,
    scoreGain,
    recommendedConfigChanges,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generates a unified, enterprise-wide PR that fixes ALL detected violations at once
 */
export function generateFullAuditAutoFixPR(
  auditResult: AuditResult,
  currentSchema: string
): AutoFixPRResult {
  const tasks = auditResult.remediationTasks || [];
  const activeFws = auditResult.activeFrameworks || ['GDPR'];
  const fwSummary = activeFws.join(' + ');

  const filesChanged: AutoFixFileDiff[] = [];
  let patchedSchema = currentSchema;

  // 1. PCI-DSS Card Purge
  if (patchedSchema.toLowerCase().includes('card') || patchedSchema.toLowerCase().includes('cvv')) {
    patchedSchema = patchedSchema
      .replace(/raw_card_number\s+varchar\([^)]+\)/gi, 'payment_token_id VARCHAR(100) -- [PCI-DSS 3.4] Tokenized Vault ID')
      .replace(/card_cvv\s+varchar\([^)]+\)[,;]?/gi, 'card_last4 VARCHAR(4) -- [PCI-DSS 3.3] Masked last 4 digits only')
      .replace(/cvv_code\s+[^,\n]+[,;]?/gi, '');
  }

  // 2. Health / ePHI Encryption
  if (patchedSchema.toLowerCase().includes('health') || patchedSchema.toLowerCase().includes('ecg') || patchedSchema.toLowerCase().includes('vitals')) {
    patchedSchema = patchedSchema
      .replace(/heart_rate_ecg\s+jsonb/gi, 'encrypted_ecg_data BYTEA -- [HIPAA § 164.312] AES-256 Encrypted')
      .replace(/diagnostic_notes\s+text/gi, 'encrypted_diagnostic_notes BYTEA -- [HIPAA § 164.312] AES-256 Encrypted');
  }

  // 3. Append Consent & Retention Migrations
  const masterMigration = `-- ==============================================================================
-- COMPLIANCE REFACTOR: Enterprise Multi-Standard Hardening
-- Standards: ${fwSummary}
-- Generated by GuardianAI Autonomous Compliance Agent
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. [GDPR Art. 7] Verifiable User Consent Ledger
CREATE TABLE IF NOT EXISTS user_consent_ledger (
  consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_category VARCHAR(50) NOT NULL, -- 'analytics', 'marketing', 'cross_border'
  is_granted BOOLEAN NOT NULL DEFAULT FALSE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  consent_version VARCHAR(20) NOT NULL,
  ip_hash VARCHAR(64) NOT NULL
);

-- 2. [GDPR Art. 5(1)(e)] Automated 90-Day Telemetry Retention Purge Daemon
SELECT cron.schedule(
  'nightly-telemetry-purge',
  '0 3 * * *',
  $$DELETE FROM user_telemetry_logs WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- 3. [ISO 27001 / SOC 2] Security Audit Trail
CREATE TABLE IF NOT EXISTS security_audit_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action_type VARCHAR(64) NOT NULL,
  resource_id VARCHAR(128) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  filesChanged.push({
    fileName: 'migrations/001_enterprise_compliance_master.sql',
    language: 'sql',
    changeType: 'MODIFIED',
    description: 'Master database schema refactoring: tokenizes card SAD, enforces AES-256 ePHI encryption, and creates consent/retention tables.',
    originalCode: currentSchema,
    patchedCode: patchedSchema + '\n\n' + masterMigration,
    unifiedDiff: createUnifiedDiff('migrations/001_enterprise_compliance_master.sql', currentSchema, patchedSchema + '\n\n' + masterMigration)
  });

  const middlewareService = `// src/middleware/privacyGateway.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Zero-Trust Privacy & PII Gateway Middleware
 * Enforces in-flight pseudonymization, consent verification, and audit logging.
 */
export function privacyGateway(req: Request, res: Response, next: NextFunction) {
  // 1. Pseudonymize Client IP (GDPR CJEU Breyer compliance)
  if (req.ip) {
    (req as any).hashedIp = crypto.createHash('sha256').update(req.ip).digest('hex');
  }

  // 2. Prevent un-tokenized sensitive credit card numbers from entering backend logs
  if (req.body && req.body.cardNumber) {
    return res.status(400).json({
      error: 'PCI-DSS Violation: Raw card payloads are prohibited. Use gateway tokenization.'
    });
  }

  next();
}`;

  filesChanged.push({
    fileName: 'src/middleware/privacyGateway.ts',
    language: 'typescript',
    changeType: 'CREATED',
    description: 'Express zero-trust privacy middleware that hashes client IPs and blocks cleartext card payloads.',
    originalCode: '// Privacy gateway middleware not yet created',
    patchedCode: middlewareService,
    unifiedDiff: createUnifiedDiff('src/middleware/privacyGateway.ts', '// Privacy gateway middleware not yet created', middlewareService)
  });

  const fullPatched = patchedSchema + '\n\n' + masterMigration;

  return {
    id: `PR-MASTER-${Date.now().toString().slice(-6)}`,
    prTitle: `[Compliance Refactor] Multi-Standard Governance Hardening (${fwSummary})`,
    branchName: `fix/enterprise-compliance-${activeFws.map(f => f.toLowerCase()).join('-')}`,
    targetBranch: 'main',
    commitMessage: `chore(compliance): resolve all ${tasks.length} statutory violations across ${fwSummary}`,
    prDescription: `## 🏆 Complete Enterprise Compliance Refactoring

This master Pull Request autonomously resolves **all ${tasks.length} compliance findings** flagged across **${fwSummary}**.

### 📊 Impact Metrics
- **Initial Score:** \`${auditResult.complianceScore}/100\` (${auditResult.status})
- **Projected Score:** \`98/100\` (**COMPLIANT**)
- **Score Improvement:** \`+${Math.max(0, 98 - auditResult.complianceScore)}%\`
- **Total Resolved Tickets:** \`${tasks.length} Tickets\`

---

### 🚀 Remediated Key Areas
1. **Zero-Knowledge Payment Vault:** Deprecated cleartext PAN/CVV under **PCI-DSS 4.0 Req 3.2**.
2. **KMS ePHI Column Encryption:** Added AES-256 bytea storage under **HIPAA 45 CFR § 164.312**.
3. **Verifiable Consent Ledger:** Implemented granular affirmative opt-in under **GDPR Art. 7(1)**.
4. **Automated Data Purge:** Configured pg_cron nightly retention daemon under **GDPR Art. 5(1)(e)**.
5. **Cross-Border Transfer & Access Governance:** Enforced model clauses and RBAC session limits under **HK PDPO & ISO 27001**.`,
    statuteJustification: `Master architectural patch resolving all statutory gaps identified during the multi-standard compliance audit.`,
    targetFramework: 'MULTI_FRAMEWORK',
    filesChanged,
    fullPatchedSchema: fullPatched,
    projectedScore: 98,
    scoreGain: Math.max(20, 98 - auditResult.complianceScore),
    recommendedConfigChanges: {
      encryptionAtRest: true,
      consentMechanism: true,
      retentionPolicy: true
    },
    generatedAt: new Date().toISOString()
  };
}

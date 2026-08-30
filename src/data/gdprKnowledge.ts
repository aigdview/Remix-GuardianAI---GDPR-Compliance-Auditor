import { GDPRArticleRef, RegulatoryClauseRef, ComplianceFramework } from '../types';

export const REGULATORY_DATABASE: Record<string, RegulatoryClauseRef> = {
  // ==========================================
  // GDPR (General Data Protection Regulation)
  // ==========================================
  'GDPR-Art5': {
    framework: 'GDPR',
    clauseId: 'GDPR-Art5',
    article: 'GDPR Art. 5',
    title: 'Principles relating to processing of personal data',
    category: 'Core Principles',
    penaltyTier: 'Tier 2 (€20M / 4% turnover)',
    summary: 'Requires personal data to be processed lawfully, fairly and transparently; collected for specified purposes; limited to necessity (minimisation); accurate; kept for no longer than necessary (storage limitation); and processed securely.',
    fullTextExcerpt: 'Personal data shall be processed lawfully, fairly, and transparently; collected for specified explicit purposes; adequate, relevant and limited to what is necessary; kept for no longer than necessary; and processed with appropriate security.',
    keyObligations: [
      'Data Minimisation (Art. 5(1)(c)): Do not collect excessive telemetry or unneeded user attributes.',
      'Storage Limitation (Art. 5(1)(e)): Define strict automated retention expiration schedules.',
      'Integrity & Confidentiality (Art. 5(1)(f)): Enforce robust encryption at rest and in transit.'
    ]
  },
  'GDPR-Art6': {
    framework: 'GDPR',
    clauseId: 'GDPR-Art6',
    article: 'GDPR Art. 6',
    title: 'Lawfulness of processing',
    category: 'Legal Basis',
    penaltyTier: 'Tier 2 (€20M / 4% turnover)',
    summary: 'Processing is only lawful if at least one legal ground applies: Consent (6(1)(a)), Contract performance (6(1)(b)), Legal obligation (6(1)(c)), Vital interests (6(1)(d)), Public task (6(1)(e)), or Legitimate interests (6(1)(f)).',
    fullTextExcerpt: 'Processing shall be lawful only if and to the extent that at least one of the legal grounds applies.',
    keyObligations: [
      'Every PII collection point must be mapped to an unambiguous legal basis under Article 6.',
      'Marketing trackers, ad cookies, and non-essential telemetry strictly require affirmative consent.'
    ]
  },
  'GDPR-Art7': {
    framework: 'GDPR',
    clauseId: 'GDPR-Art7',
    article: 'GDPR Art. 7',
    title: 'Conditions for consent',
    category: 'Consent Requirements',
    penaltyTier: 'Tier 2 (€20M / 4% turnover)',
    summary: 'Consent must be freely given, specific, informed, and unambiguous. Controller must be able to demonstrate consent, and data subjects have the right to withdraw consent at any time.',
    fullTextExcerpt: 'The controller shall be able to demonstrate that the data subject has consented. Withdrawal must be as easy as giving consent.',
    keyObligations: [
      'Store timestamped audit logs of user consent grant and withdrawal events.',
      'Pre-ticked checkboxes or forced bundling with Terms of Service are unlawful.'
    ]
  },
  'GDPR-Art9': {
    framework: 'GDPR',
    clauseId: 'GDPR-Art9',
    article: 'GDPR Art. 9',
    title: 'Processing of special categories of personal data',
    category: 'Special Categories (Health & Biometrics)',
    penaltyTier: 'Tier 2 (€20M / 4% turnover)',
    summary: 'Prohibits processing of sensitive data (health, genetics, biometric data for identification, racial/ethnic origin, political/religious beliefs) unless explicit consent applies.',
    fullTextExcerpt: 'Processing of personal data revealing health, biometric or genetic data shall be prohibited without explicit consent.',
    keyObligations: [
      'Explicit granular opt-in consent (Art. 9(2)(a)) required before ingesting biometric or medical data.',
      'Enforce dedicated column-level encryption (AES-256-GCM) with isolated key management.'
    ]
  },
  'GDPR-Art17': {
    framework: 'GDPR',
    clauseId: 'GDPR-Art17',
    article: 'GDPR Art. 17',
    title: 'Right to erasure ("Right to be Forgotten")',
    category: 'Data Subject Rights',
    penaltyTier: 'Tier 2 (€20M / 4% turnover)',
    summary: 'Data subjects have the right to obtain from the controller the erasure of personal data without undue delay when data is no longer necessary or consent is withdrawn.',
    fullTextExcerpt: 'The data subject shall have the right to obtain the erasure of personal data concerning him or her without undue delay.',
    keyObligations: [
      'Implement cascade erasure or irreversible pseudonymisation across DB tables, caches, and backups.',
      'Propagate erasure webhooks to third-party sub-processors.'
    ]
  },
  'GDPR-Art25': {
    framework: 'GDPR',
    clauseId: 'GDPR-Art25',
    article: 'GDPR Art. 25',
    title: 'Data protection by design and by default',
    category: 'Engineering Architecture',
    penaltyTier: 'Tier 1 (€10M / 2% turnover)',
    summary: 'Controllers must implement appropriate technical and organisational measures (e.g. pseudonymisation, default privacy settings) into data processing pipelines.',
    fullTextExcerpt: 'The controller shall implement appropriate technical and organisational measures designed to implement data protection principles effectively.',
    keyObligations: [
      'Default privacy toggles to opt-out for any non-essential telemetry or profiling.',
      'Mask PII in logging frameworks (Winston/Pino filters replacing emails/IPs).'
    ]
  },
  'GDPR-Art32': {
    framework: 'GDPR',
    clauseId: 'GDPR-Art32',
    article: 'GDPR Art. 32',
    title: 'Security of processing (Encryption & Resilience)',
    category: 'Information Security & Encryption',
    penaltyTier: 'Tier 1 (€10M / 2% turnover)',
    summary: 'Controllers and processors must implement encryption of personal data, ensure ongoing confidentiality and integrity, and conduct regular security testing.',
    fullTextExcerpt: 'Implement appropriate technical measures to ensure security, including pseudonymisation and encryption of personal data.',
    keyObligations: [
      'Enforce TLS 1.3 encryption in transit for all network traffic.',
      'Enforce AES-256 or KMS envelope encryption at rest across databases, volumes, and backups.'
    ]
  },
  'GDPR-Art44': {
    framework: 'GDPR',
    clauseId: 'GDPR-Art44',
    article: 'GDPR Art. 44',
    title: 'General principle for cross-border data transfers',
    category: 'International Transfers',
    penaltyTier: 'Tier 2 (€20M / 4% turnover)',
    summary: 'Transfer of personal data to a third country shall take place only if conditions in Chapter V (Adequacy Decision, Standard Contractual Clauses SCCs) are met.',
    fullTextExcerpt: 'Any transfer of personal data to a third country shall take place only in compliance with Chapter V.',
    keyObligations: [
      'Execute Standard Contractual Clauses (SCCs) and Transfer Impact Assessments (TIA) for third-country data routing.'
    ]
  },

  // ==========================================
  // PCIDSS (PCI Data Security Standard v4.0)
  // ==========================================
  'PCIDSS-Req3.2': {
    framework: 'PCIDSS',
    clauseId: 'PCIDSS-Req3.2',
    article: 'PCI DSS 4.0 § 3.2',
    title: 'Prohibition of Sensitive Authentication Data (SAD) Storage',
    category: 'Payment Card Security',
    penaltyTier: 'Card Brand Fines ($5K - $100K/mo) & Merchant Account Revocation',
    summary: 'Do not store sensitive authentication data after authorization (even if encrypted). This includes full track data, CAV2/CVC2/CVV2/CID, and PIN/PIN block.',
    fullTextExcerpt: 'Sensitive authentication data (SAD) must not be retained after authorization under any circumstance.',
    keyObligations: [
      'Never persist CVV/CVC2 security codes in application databases or logs.',
      'Use hosted tokenization fields (e.g. Stripe Elements, Adyen Drop-in) to bypass server card handling.'
    ]
  },
  'PCIDSS-Req3.4': {
    framework: 'PCIDSS',
    clauseId: 'PCIDSS-Req3.4',
    article: 'PCI DSS 4.0 § 3.4',
    title: 'Render Primary Account Number (PAN) Unreadable Anywhere Stored',
    category: 'Cardholder Data Encryption',
    penaltyTier: 'PCI Non-Compliance Level 1 Audit Mandate',
    summary: 'PAN must be rendered unreadable anywhere it is stored using strong one-way hashing, truncation (BIN + last 4 digits), index tokens, or strong cryptography (AES-256).',
    fullTextExcerpt: 'Render PAN unreadable anywhere it is stored with strong cryptography with associated key-management processes.',
    keyObligations: [
      'Never store raw 16-digit credit card numbers in cleartext database tables.',
      'Implement AES-256-GCM column encryption or payment tokenization.'
    ]
  },
  'PCIDSS-Req3.5': {
    framework: 'PCIDSS',
    clauseId: 'PCIDSS-Req3.5',
    article: 'PCI DSS 4.0 § 3.5',
    title: 'Cryptographic Key Management & Access Isolation',
    category: 'Key Management',
    penaltyTier: 'PCI Security Sanction',
    summary: 'Document and implement procedures to protect cryptographic keys used for cardholder data encryption against disclosure and misuse.',
    fullTextExcerpt: 'Protect cryptographic keys used for encryption of cardholder data against disclosure and unauthorized modification.',
    keyObligations: [
      'Store encryption keys in hardware security modules (HSM) or dedicated cloud KMS, separate from application servers.',
      'Enforce automated annual key rotation cycles.'
    ]
  },
  'PCIDSS-Req4.1': {
    framework: 'PCIDSS',
    clauseId: 'PCIDSS-Req4.1',
    article: 'PCI DSS 4.0 § 4.1',
    title: 'Protect Cardholder Data in Transit Over Public Networks',
    category: 'Network Transmission Security',
    penaltyTier: 'PCI Non-Compliance Violation',
    summary: 'Strong cryptography and security protocols (TLS 1.2/1.3) must be used to safeguard sensitive cardholder data during transmission over open networks.',
    fullTextExcerpt: 'Use strong cryptography and security protocols to safeguard sensitive cardholder data during transmission.',
    keyObligations: [
      'Disable TLS 1.0/1.1 and insecure ciphers on all payment gateway ingress endpoints.'
    ]
  },

  // ==========================================
  // HIPAA (Health Insurance Portability and Accountability Act)
  // ==========================================
  'HIPAA-164.312-Rest': {
    framework: 'HIPAA',
    clauseId: 'HIPAA-164.312-Rest',
    article: 'HIPAA § 164.312(a)(2)(iv)',
    title: 'Encryption and Decryption of ePHI at Rest',
    category: 'Technical Safeguards',
    penaltyTier: 'Tier 4 Willful Neglect ($50,000 per violation up to $1.9M/yr)',
    summary: 'Implement a mechanism to encrypt and decrypt electronic protected health information (ePHI) residing on databases, storage volumes, and backups.',
    fullTextExcerpt: 'Implement a mechanism to encrypt and decrypt electronic protected health information.',
    keyObligations: [
      'Enforce mandatory AES-256 database column encryption on patient medical notes, chronic conditions, and lab results.',
      'Ensure cloud storage buckets hosting patient scans are encrypted with customer-managed keys (CMEK).'
    ]
  },
  'HIPAA-164.312-Transit': {
    framework: 'HIPAA',
    clauseId: 'HIPAA-164.312-Transit',
    article: 'HIPAA § 164.312(e)(2)(ii)',
    title: 'Transmission Security & ePHI Network Encryption',
    category: 'Technical Safeguards',
    penaltyTier: 'Civil Monetary Penalties (HHS OCR Enforcement)',
    summary: 'Implement a mechanism to encrypt electronic protected health information whenever deemed appropriate during transit over communication networks.',
    fullTextExcerpt: 'Implement a mechanism to encrypt electronic protected health information in transit.',
    keyObligations: [
      'Enforce TLS 1.3 for all clinical IoT wearable streaming and telehealth video connections.'
    ]
  },
  'HIPAA-164.312-Audit': {
    framework: 'HIPAA',
    clauseId: 'HIPAA-164.312-Audit',
    article: 'HIPAA § 164.312(b)',
    title: 'Audit Controls & ePHI Access Logging',
    category: 'Audit & Accountability',
    penaltyTier: 'HHS OCR Corrective Action Plan',
    summary: 'Implement hardware, software, and procedural mechanisms that record and examine activity in information systems containing or using ePHI.',
    fullTextExcerpt: 'Implement hardware, software, and procedural mechanisms that record and examine activity in information systems.',
    keyObligations: [
      'Log every read, write, and export event for patient medical records with immutable tamper-evident logs.',
      'Mask ePHI in administrative dashboard telemetry.'
    ]
  },
  'HIPAA-164.504-BAA': {
    framework: 'HIPAA',
    clauseId: 'HIPAA-164.504-BAA',
    article: 'HIPAA § 164.504(e)',
    title: 'Business Associate Agreements (BAA) with Sub-Processors',
    category: 'Sub-Processor Governance',
    penaltyTier: 'Direct Statutory Liability for Covered Entities',
    summary: 'Covered entities must obtain satisfactory assurances via a formal Business Associate Agreement (BAA) before sharing ePHI with third-party cloud vendors or AI providers.',
    fullTextExcerpt: 'A covered entity may disclose protected health information to a business associate only pursuant to a satisfactory written contract.',
    keyObligations: [
      'Execute formal BAA with cloud providers, transcription services, and LLM vendors before routing patient audio or medical notes.'
    ]
  },

  // ==========================================
  // ISO27001 (ISO/IEC 27001:2022)
  // ==========================================
  'ISO27001-A.8.24': {
    framework: 'ISO27001',
    clauseId: 'ISO27001-A.8.24',
    article: 'ISO 27001 A.8.24',
    title: 'Use of Cryptography & Cryptographic Key Management',
    category: 'Technological Controls',
    penaltyTier: 'Major Non-Conformity & ISO Certification Revocation',
    summary: 'Rules for the effective use of cryptography, including cryptographic key management lifecycle, must be defined and implemented.',
    fullTextExcerpt: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.',
    keyObligations: [
      'Establish cryptographic standards for data at rest and data in transit across all architectural tiers.',
      'Implement automated key generation, distribution, storage, and retirement in a secure KMS.'
    ]
  },
  'ISO27001-A.8.10': {
    framework: 'ISO27001',
    clauseId: 'ISO27001-A.8.10',
    article: 'ISO 27001 A.8.10',
    title: 'Information Deletion & Media Sanitization',
    category: 'Information Security Controls',
    penaltyTier: 'Non-Conformity Audit Finding',
    summary: 'Information stored in information systems, devices or in any other storage media shall be deleted when no longer required.',
    fullTextExcerpt: 'Information stored in information systems shall be securely deleted when no longer required.',
    keyObligations: [
      'Implement scheduled data purge worker jobs and verified media sanitization policies.'
    ]
  },
  'ISO27001-A.8.11': {
    framework: 'ISO27001',
    clauseId: 'ISO27001-A.8.11',
    article: 'ISO 27001 A.8.11',
    title: 'Data Masking & Pseudonymization',
    category: 'Data Protection & Masking',
    penaltyTier: 'Audit Non-Conformity',
    summary: 'Data masking shall be used in accordance with the organisation’s topic-specific policy on access control and other related topic-specific policies.',
    fullTextExcerpt: 'Data masking shall be used in accordance with access control policies and legal requirements.',
    keyObligations: [
      'Apply dynamic data masking on sensitive identifiers in non-production environments and user activity logs.'
    ]
  },
  'ISO27001-A.5.23': {
    framework: 'ISO27001',
    clauseId: 'ISO27001-A.5.23',
    article: 'ISO 27001 A.5.23',
    title: 'Information Security for Use of Cloud Services',
    category: 'Cloud Governance',
    penaltyTier: 'Supply Chain Audit Finding',
    summary: 'Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organisation’s information security requirements.',
    fullTextExcerpt: 'Processes for acquisition and use of cloud services shall be established in accordance with security requirements.',
    keyObligations: [
      'Verify cloud provider SOC2 Type II / ISO27001 certifications and configure secure network isolation.'
    ]
  },

  // ==========================================
  // SOC2 (AICPA Trust Services Criteria)
  // ==========================================
  'SOC2-CC6.1': {
    framework: 'SOC2',
    clauseId: 'SOC2-CC6.1',
    article: 'SOC 2 CC6.1',
    title: 'Logical Access Controls & Role-Based Permissions',
    category: 'Security Criteria',
    penaltyTier: 'Qualified / Adverse SOC 2 Audit Opinion',
    summary: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.',
    fullTextExcerpt: 'The entity implements logical access security software and infrastructure to protect information assets from unauthorized access.',
    keyObligations: [
      'Implement Role-Based Access Control (RBAC) and Multi-Factor Authentication (MFA) across all database administrative interfaces.'
    ]
  },
  'SOC2-CC6.6': {
    framework: 'SOC2',
    clauseId: 'SOC2-CC6.6',
    article: 'SOC 2 CC6.6',
    title: 'Boundary Protection & Network Segmentation',
    category: 'Network Security',
    penaltyTier: 'SOC 2 Control Exception',
    summary: 'The entity implements boundary protection systems (e.g. firewalls, private VPC subnets) to protect against unauthorized access.',
    fullTextExcerpt: 'Implement logical boundaries to separate production environments and restrict inbound traffic.',
    keyObligations: [
      'Isolate internal database subnets from public ingress using private endpoints and API gateways.'
    ]
  },
  'SOC2-CC6.7': {
    framework: 'SOC2',
    clauseId: 'SOC2-CC6.7',
    article: 'SOC 2 CC6.7',
    title: 'Transmission Encryption & Data Confidentiality',
    category: 'Confidentiality Criteria',
    penaltyTier: 'Control Deficiency in SOC 2 Report',
    summary: 'The entity restricts the transmission, movement, and removal of information to authorized internal and external users through encryption.',
    fullTextExcerpt: 'Encrypt data in transit across public and untrusted networks.',
    keyObligations: [
      'Enforce TLS on all external API communication and mutual TLS (mTLS) between internal microservices.'
    ]
  },
  'SOC2-P1.1': {
    framework: 'SOC2',
    clauseId: 'SOC2-P1.1',
    article: 'SOC 2 P1.1',
    title: 'Privacy Notice, Choice & Consent',
    category: 'Privacy Criteria',
    penaltyTier: 'Privacy Principle Exception',
    summary: 'The entity provides notice of its privacy practices and obtains consent where required for the collection and processing of personal information.',
    fullTextExcerpt: 'Provide notice and obtain explicit consent regarding the collection, use, retention, and disclosure of personal information.',
    keyObligations: [
      'Document clear privacy notices and capture consent records prior to third-party data distribution.'
    ]
  },

  // ==========================================
  // HK_PDPO (Hong Kong Personal Data (Privacy) Ordinance - Cap. 486)
  // ==========================================
  'HK_PDPO-DPP1': {
    framework: 'HK_PDPO',
    clauseId: 'HK_PDPO-DPP1',
    article: 'HK PDPO DPP 1',
    title: 'Purpose and Manner of Collection of Personal Data',
    category: 'Data Protection Principle 1',
    penaltyTier: 'PCPD Enforcement Notice & Statutory Offence (Level 5 Fine HK$50K / 2 yrs imprisonment)',
    summary: 'Personal data shall only be collected for a lawful purpose directly related to a function or activity of the data user; data collected must be adequate but not excessive.',
    fullTextExcerpt: 'Personal data shall not be collected unless it is collected for a lawful purpose and the data is necessary for that purpose and not excessive.',
    keyObligations: [
      'Collect only necessary customer identifiers required for transaction fulfillment.',
      'Explicitly inform data subjects in Hong Kong of the purpose and classes of transferees upon collection.'
    ]
  },
  'HK_PDPO-DPP2': {
    framework: 'HK_PDPO',
    clauseId: 'HK_PDPO-DPP2',
    article: 'HK PDPO DPP 2',
    title: 'Accuracy and Duration of Retention of Personal Data',
    category: 'Data Protection Principle 2',
    penaltyTier: 'PCPD Regulatory Sanction',
    summary: 'Personal data shall not be kept longer than is necessary for the fulfillment of the purpose for which the data is or is to be used.',
    fullTextExcerpt: 'Personal data shall not be kept longer than is necessary for the fulfillment of the purpose for which the data is or is to be used.',
    keyObligations: [
      'Enforce automated retention policies to delete Hong Kong resident telemetry and customer records once purpose is fulfilled.'
    ]
  },
  'HK_PDPO-DPP3': {
    framework: 'HK_PDPO',
    clauseId: 'HK_PDPO-DPP3',
    article: 'HK PDPO DPP 3',
    title: 'Use of Personal Data & Direct Marketing Consent',
    category: 'Data Protection Principle 3 & Part 6A',
    penaltyTier: 'Criminal Offence for Direct Marketing (Fine up to HK$1,000,000 & 5 yrs imprisonment)',
    summary: 'Personal data shall not, without the prescribed consent of the data subject, be used for a new purpose. Direct marketing strictly requires prior notification and opt-in consent.',
    fullTextExcerpt: 'Personal data shall not be used for a new purpose unless the data subject has given prescribed consent. Strict direct marketing provisions apply under Part 6A.',
    keyObligations: [
      'Obtain explicit opt-in before using customer contact data or telemetry for marketing purposes.',
      'Provide an easy, free-of-charge opt-out channel for all marketing communications.'
    ]
  },
  'HK_PDPO-DPP4': {
    framework: 'HK_PDPO',
    clauseId: 'HK_PDPO-DPP4',
    article: 'HK PDPO DPP 4',
    title: 'Security of Personal Data & Breach Safeguards',
    category: 'Data Protection Principle 4',
    penaltyTier: 'PCPD Enforcement Notice & Statutory Breach Notice',
    summary: 'All practicable steps shall be taken to ensure that personal data is protected against unauthorised or accidental access, processing, erasure, loss or use.',
    fullTextExcerpt: 'All practicable steps shall be taken to ensure that personal data held by a data user is protected against unauthorised or accidental access, processing, erasure, loss or use.',
    keyObligations: [
      'Implement robust AES-256 encryption at rest and TLS 1.3 in transit.',
      'Restrict access to personal records on a strict need-to-know basis with audit logging.'
    ]
  },
  'HK_PDPO-DPP6': {
    framework: 'HK_PDPO',
    clauseId: 'HK_PDPO-DPP6',
    article: 'HK PDPO DPP 6',
    title: 'Access to and Correction of Personal Data',
    category: 'Data Protection Principle 6',
    penaltyTier: 'Offence under Section 19 (Level 3 Fine HK$10K)',
    summary: 'A data subject shall be entitled to ascertain whether a data user holds personal data of which he is the data subject, and request access and correction within 40 statutory days.',
    fullTextExcerpt: 'A data subject shall be entitled to request access to and correction of his personal data within 40 days of request.',
    keyObligations: [
      'Provide automated customer access/export mechanisms complying with the 40-day statutory response limit.'
    ]
  },
  'HK_PDPO-Sec33': {
    framework: 'HK_PDPO',
    clauseId: 'HK_PDPO-Sec33',
    article: 'HK PDPO Section 33',
    title: 'Transfer of Personal Data Outside Hong Kong',
    category: 'Cross-Border Data Transfer',
    penaltyTier: 'PCPD Regulatory Sanction',
    summary: 'Data users must ensure cross-border transfers of Hong Kong personal data are made to jurisdictions with comparable data protection laws or governed by enforceable contractual clauses.',
    fullTextExcerpt: 'Transfer of personal data to a place outside Hong Kong is restricted unless specific conditions or recommended model contract clauses are satisfied.',
    keyObligations: [
      'Adopt PCPD Recommended Model Contractual Clauses for Cross-Border Data Transfers before syncing data to overseas clouds.'
    ]
  }
};

export const GDPR_DATABASE: Record<string, GDPRArticleRef> = Object.fromEntries(
  Object.entries(REGULATORY_DATABASE).filter(([_, val]) => val.framework === 'GDPR')
);

export function searchRegulatoryClauses(
  topic: string,
  frameworks?: ComplianceFramework[]
): RegulatoryClauseRef[] {
  const q = topic.toLowerCase().trim();
  const allClauses = Object.values(REGULATORY_DATABASE);

  return allClauses.filter(clause => {
    // Check framework match if specified
    if (frameworks && frameworks.length > 0) {
      if (!frameworks.includes(clause.framework)) return false;
    }

    if (!q) return true;

    return (
      clause.article.toLowerCase().includes(q) ||
      clause.title.toLowerCase().includes(q) ||
      clause.category.toLowerCase().includes(q) ||
      clause.summary.toLowerCase().includes(q) ||
      clause.framework.toLowerCase().includes(q) ||
      clause.keyObligations.some(obl => obl.toLowerCase().includes(q))
    );
  });
}

export function searchGDPRArticles(query: string, specificArticle?: string): GDPRArticleRef[] {
  const q = query.toLowerCase().trim();
  const allArticles = Object.values(REGULATORY_DATABASE).filter(c => c.framework === 'GDPR');

  if (specificArticle) {
    const matched = allArticles.find(a => 
      a.article.toLowerCase().includes(specificArticle.toLowerCase()) || 
      specificArticle.toLowerCase().includes(a.article.toLowerCase())
    );
    if (matched) return [matched];
  }

  if (!q) return allArticles.slice(0, 5);

  return allArticles.filter(art => {
    return (
      art.article.toLowerCase().includes(q) ||
      art.title.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q) ||
      art.keyObligations.some(obl => obl.toLowerCase().includes(q))
    );
  });
}

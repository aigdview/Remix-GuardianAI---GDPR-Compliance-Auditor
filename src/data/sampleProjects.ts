import { SampleProject } from '../types';

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'ecommerce-platform',
    name: 'ApexCart - Global E-Commerce & Checkout Engine',
    tagline: 'Multi-region retail platform with user accounts, cart telemetry, and payment processing.',
    industry: 'Retail / E-Commerce',
    frameworks: ['GDPR', 'PCIDSS'],
    defaultConfig: {
      encryptionAtRest: false,
      consentMechanism: false,
      retentionPolicy: false
    },
    content: `Architecture Overview:
ApexCart is an online shopping platform built with Next.js, Express microservices, and PostgreSQL database hosted on AWS us-east-1.

Database Tables & Schema:
1. "users" table:
   - id: UUID (Primary Key)
   - email: VARCHAR(255) (cleartext email)
   - full_name: VARCHAR(255)
   - phone_number: VARCHAR(50)
   - shipping_address: TEXT (street, city, postal_code, country)
   - date_of_birth: DATE
   - password_hash: VARCHAR(255)
   - created_at: TIMESTAMP (never deleted)

2. "orders" & "payments" table:
   - order_id: UUID
   - user_id: UUID
   - raw_card_number: VARCHAR(20) (cleartext string for recurring rebilling)
   - card_cvv: VARCHAR(4)
   - card_expiration: VARCHAR(7)
   - billing_address: TEXT
   - total_amount: NUMERIC(10, 2)
   - payment_gateway_response: JSON (contains customer IP and billing details)

3. "user_telemetry_logs" table:
   - log_id: BIGINT
   - user_id: UUID
   - ip_address: VARCHAR(45) (unmasked IPv4/IPv6)
   - device_fingerprint: TEXT
   - gps_latitude: FLOAT
   - gps_longitude: FLOAT
   - browser_user_agent: TEXT
   - clicked_elements: JSON
   - third_party_ad_sync: BOOLEAN (auto-forwarded to Google Analytics & Facebook Pixel without prior cookie consent banner)

APIs & Data Pipeline:
- POST /api/checkout -> Writes raw card and user address to DB, sends unencrypted telemetry event to US data lake.
- GET /api/admin/customers -> Returns full customer list with unmasked email and phone numbers without role-based audit trail.
- No automated user deletion or DSAR export endpoint exists.`
  },
  {
    id: 'healthtech-telehealth',
    name: 'PulseCare - AI Telehealth & Biometric Remote Monitoring',
    tagline: 'Remote patient consultation system with wearable vitals ingestion and AI triage.',
    industry: 'Healthcare / Special Category (Art. 9)',
    frameworks: ['GDPR', 'HIPAA'],
    defaultConfig: {
      encryptionAtRest: true,
      consentMechanism: false,
      retentionPolicy: false
    },
    content: `Architecture Overview:
PulseCare connects patients with clinical specialists and syncs daily biometric telemetry from IoT pulse oximeters, blood pressure cuffs, and Apple HealthKit.

Database Schema (MongoDB / TimescaleDB):
1. "patients" collection:
   - patient_id: ObjectId
   - ssn_national_id: String (Plaintext national health identifier)
   - legal_name: String
   - biological_sex: String
   - blood_type: String
   - chronic_conditions: Array<String> (e.g. ['Type 2 Diabetes', 'Hypertension', 'HIV+'])
   - mental_health_notes: String (Doctor freeform psychiatric notes)
   - emergency_contact_phone: String

2. "biometric_vitals_stream":
   - timestamp: ISODate
   - patient_id: ObjectId
   - heart_rate_bpm: Int
   - ecg_waveform_data: Binary (raw biometric time series)
   - blood_glucose_mg_dl: Float
   - user_location_lat_long: [Float, Float]

3. "ai_transcription_logs":
   - session_id: String
   - audio_recording_url: String (Public S3 bucket without signed URL expiration)
   - speech_to_text_transcript: String (Includes patient family medical history and medication names)
   - third_party_llm_vendor: String (Forwarded to external US AI endpoint without Business Associate Agreement or EU Standard Contractual Clauses)

Observations:
- Encryption at rest is enabled on AWS RDS storage volume, but sensitive medical fields in MongoDB lack application-level column encryption.
- No explicit GDPR Article 9 consent prompt is shown during registration.
- No automated retention schedule: Patient vitals from 2018 remain indefinitely in hot storage.`
  },
  {
    id: 'b2b-saas-analytics',
    name: 'Metriqly - B2B Product Analytics & User Recording',
    tagline: 'Event tracking SDK and session replay service for web & mobile apps.',
    industry: 'SaaS / Cloud Infrastructure',
    frameworks: ['GDPR', 'ISO27001', 'SOC2'],
    defaultConfig: {
      encryptionAtRest: true,
      consentMechanism: true,
      retentionPolicy: false
    },
    content: `Architecture Overview:
Metriqly provides an embeddable JavaScript snippet that records DOM mutations, mouse heatmaps, network payloads, and user identification events for enterprise SaaS customers.

Data Pipeline & Schema (ClickHouse + Kafka):
1. "event_stream":
   - event_id: UUID
   - customer_tenant_id: UUID
   - user_distinct_id: String (Email address or employee username)
   - client_ip: FixedString(16) (Logged directly without zeroing out last octet)
   - geolocation_city: String
   - dom_input_values: Map(String, String) (Captures form inputs; occasionally ingests unmasked passwords and credit cards if customer forgets CSS mask class)

2. "session_recordings":
   - session_id: UUID
   - video_chunks: Array<String> (Stored on Cloudflare R2 bucket in US-East)
   - cookies_header: String (Raw session cookies and auth tokens captured in HTTP header inspector)

3. Data Deletion & Privacy Policy:
   - Consent banner SDK is bundled, but tracking script initializes before user consent callback fires.
   - Deletion requests (Right to Erasure) require manual SQL query execution by DevOps team on Slack request with 45-day turnaround time.
   - Storage retention policy has not been configured in ClickHouse partition TTLs.`
  },
  {
    id: 'fintech-neobank',
    name: 'VoltPay - Cross-Border APAC Payments & Crypto Wallet',
    tagline: 'Peer-to-peer money transfers with KYC verification and Hong Kong cross-border gateway.',
    industry: 'FinTech / Cross-Border',
    frameworks: ['GDPR', 'HK_PDPO'],
    defaultConfig: {
      encryptionAtRest: true,
      consentMechanism: true,
      retentionPolicy: true
    },
    content: `Architecture Overview:
VoltPay is an international money services operator facilitating SEPA transfers, Hong Kong FPS payments, and cryptocurrency custody across Asia-Pacific and the EU.

Schema & Architecture:
1. "kyc_verifications" table:
   - kyc_id: UUID
   - user_id: UUID
   - hk_id_card_number: VARCHAR(20) (Hong Kong Identity Card without masking)
   - passport_scan_url: VARCHAR(500) (Encrypted at rest with KMS key)
   - selfie_biometric_face_vector: VECTOR(512) (Used for automated liveness check)
   - proof_of_address_document: BLOB (Encrypted)
   - aml_screening_status: ENUM('CLEARED', 'FLAGGED', 'PEP')

2. "transactions" ledger:
   - tx_id: UUID
   - sender_iban_or_fps: VARCHAR(34)
   - recipient_account: VARCHAR(34)
   - amount: DECIMAL(18,2)
   - direct_marketing_opt_in: BOOLEAN (Defaulted to true without explicit opt-in under HK PDPO Part 6A)
   - sanction_screening_notes: TEXT
   - timestamp: TIMESTAMP (Retained indefinitely)

3. Sub-Processors & Data Flow:
   - Cross-border data sync to US data lake operates without PCPD Recommended Model Contractual Clauses or EU Standard Contractual Clauses (SCCs).
   - Automated DSAR export API endpoint (/api/v1/user/export) provides AES-encrypted ZIP containing personal financial ledgers within 40 days.`
  }
];

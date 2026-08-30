export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ComplianceStatus = 'COMPLIANT' | 'HIGH RISK' | 'CRITICAL';

export type FrameworkKey = 
  | 'GDPR' 
  | 'PCIDSS' 
  | 'HIPAA' 
  | 'ISO27001' 
  | 'SOC2' 
  | 'HK_PDPO';

export type ComplianceFramework = FrameworkKey;

export interface PIIElement {
  id: string;
  field: string;
  category: 'Direct Identifier' | 'Indirect Identifier' | 'Special Category (Art. 9 / PHI)' | 'Financial / Payment' | 'Behavioral / Telemetry' | 'Location / IP' | 'Authentication / Credential';
  riskLevel: SeverityLevel;
  tableOrContext: string;
  gdprArticles: string[];
  frameworks?: ComplianceFramework[];
  findings: string;
}

export interface RegulatoryClauseRef {
  framework: ComplianceFramework;
  clauseId: string;
  article: string;
  title: string;
  category: string;
  summary: string;
  fullTextExcerpt: string;
  penaltyTier?: string;
  keyObligations: string[];
}

export type GDPRArticleRef = RegulatoryClauseRef;

export interface ToolCallExecution {
  id: string;
  toolName: 'search_gdpr_clauses' | 'search_regulatory_clauses' | 'scan_data_schema' | 'generate_remediation_task';
  timestamp: string;
  durationMs: number;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'violation_detected';
  inputArguments: Record<string, any>;
  outputResult: Record<string, any>;
  summary: string;
}

export interface RemediationTask {
  id: string;
  title: string;
  severity: SeverityLevel;
  framework: ComplianceFramework;
  citedStatute: string;
  article: string;
  category: string;
  affectedFields: string[];
  description: string;
  actionItems: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  codeExample?: string;
  suggestedEffort: 'Low (<1 day)' | 'Medium (2-4 days)' | 'High (1-2 weeks)' | 'Architectural (>2 weeks)';
}

export interface AutoFixFileDiff {
  fileName: string;
  language: 'sql' | 'typescript' | 'prisma' | 'json' | 'yaml' | 'markdown';
  changeType: 'MODIFIED' | 'CREATED' | 'DELETED';
  description: string;
  originalCode: string;
  patchedCode: string;
  unifiedDiff: string;
}

export interface AutoFixPRResult {
  id: string;
  taskId?: string;
  prTitle: string;
  branchName: string;
  targetBranch: string;
  commitMessage: string;
  prDescription: string;
  statuteJustification: string;
  targetFramework: ComplianceFramework | 'MULTI_FRAMEWORK';
  filesChanged: AutoFixFileDiff[];
  fullPatchedSchema: string;
  projectedScore: number;
  scoreGain: number;
  recommendedConfigChanges?: {
    encryptionAtRest?: boolean;
    consentMechanism?: boolean;
    retentionPolicy?: boolean;
  };
  generatedAt: string;
}

export interface AuditResult {
  id?: string;
  projectName: string;
  timestamp: string;
  schemaText?: string;
  complianceScore: number;
  status: ComplianceStatus;
  detectedDomain: 'E-Commerce / Retail' | 'Healthcare / BioTech' | 'Enterprise Cloud / Infrastructure' | 'Asia-Pacific / Cross-Border' | 'General B2B / SaaS';
  activeFrameworks: ComplianceFramework[];
  executiveSummary: string;
  riskBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  piiInventory: PIIElement[];
  remediationTasks: RemediationTask[];
  checkedClauses: string[];
  toolExecutions: ToolCallExecution[];
  configurationContext: {
    encryptionAtRest: boolean;
    consentMechanism: boolean;
    retentionPolicy: boolean;
  };
}

export interface AuditRequestPayload {
  projectName: string;
  schemaText: string;
  encryptionAtRest: boolean;
  consentMechanism: boolean;
  retentionPolicy: boolean;
  targetFrameworks?: ComplianceFramework[];
}

export interface SampleProject {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  frameworks: ComplianceFramework[];
  content: string;
  defaultConfig: {
    encryptionAtRest: boolean;
    consentMechanism: boolean;
    retentionPolicy: boolean;
  };
}


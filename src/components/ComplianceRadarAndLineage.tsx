import React, { useState } from 'react';
import { 
  Radar, 
  ShieldAlert, 
  ShieldCheck, 
  Database, 
  ArrowRight, 
  Layers, 
  Server, 
  UserCheck, 
  Lock, 
  Globe, 
  Clock, 
  AlertTriangle,
  FileCode,
  Zap,
  Info
} from 'lucide-react';
import { AuditResult, PIIElement, RemediationTask, ComplianceFramework } from '../types';

interface ComplianceRadarAndLineageProps {
  auditResult: AuditResult;
  onSelectTask?: (task: RemediationTask) => void;
  onOpenAutoFixModal?: (task?: RemediationTask) => void;
}

interface RadarMetric {
  axis: string;
  label: string;
  score: number; // 0 to 100
  benchmark: number; // 90 (industry target)
  statute: string;
  description: string;
  framework: ComplianceFramework;
}

interface DataNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'client' | 'gateway' | 'app_service' | 'database' | 'third_party';
  zone: 'Untrusted Public' | 'DMZ / Edge' | 'Internal VPC' | 'Encrypted Storage' | 'External Egress';
  icon: any;
  riskStatus: 'SECURE' | 'AT_RISK' | 'CRITICAL_LEAK';
  piiItems: string[];
  vulnerabilities: string[];
}

interface DataFlowEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  isEncrypted: boolean;
  hasConsentGuard: boolean;
  status: 'COMPLIANT' | 'EXPOSED' | 'PROHIBITED';
  statuteViolation?: string;
}

export const ComplianceRadarAndLineage: React.FC<ComplianceRadarAndLineageProps> = ({
  auditResult,
  onOpenAutoFixModal
}) => {
  const [activeSubView, setActiveSubView] = useState<'radar' | 'lineage'>('radar');
  const [selectedRadarAxis, setSelectedRadarAxis] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Compute 6-Axis Compliance Vector from Audit Result
  const enc = auditResult.configurationContext?.encryptionAtRest ?? false;
  const consent = auditResult.configurationContext?.consentMechanism ?? false;
  const ret = auditResult.configurationContext?.retentionPolicy ?? false;
  const tasks = auditResult.remediationTasks || [];
  const baseScore = auditResult.complianceScore || 40;

  const hasPciViolation = tasks.some(t => t.framework === 'PCIDSS' || t.title.toLowerCase().includes('card') || t.title.toLowerCase().includes('cvv'));
  const hasHipaaViolation = tasks.some(t => t.framework === 'HIPAA' || t.title.toLowerCase().includes('health') || t.title.toLowerCase().includes('ephi'));
  const hasConsentViolation = !consent || tasks.some(t => t.citedStatute.includes('Art. 7') || t.title.toLowerCase().includes('consent'));
  const hasRetentionViolation = !ret || tasks.some(t => t.citedStatute.includes('5(1)(e)') || t.title.toLowerCase().includes('retention'));
  const hasEncryptionViolation = !enc || tasks.some(t => t.title.toLowerCase().includes('encryption') || t.citedStatute.includes('Art. 32'));
  const hasCrossBorderViolation = tasks.some(t => t.framework === 'HK_PDPO' || t.title.toLowerCase().includes('transfer') || t.title.toLowerCase().includes('hkid'));

  const radarMetrics: RadarMetric[] = [
    {
      axis: 'Data Minimization & Storage Limitation',
      label: 'Storage & Retention',
      score: hasRetentionViolation ? Math.max(25, baseScore - 15) : 95,
      benchmark: 90,
      statute: 'GDPR Art. 5(1)(e) / Art. 17',
      description: hasRetentionViolation 
        ? 'Indefinite raw telemetry retention detected. Automated partition TTL daemon required.' 
        : 'Automated 90-day retention schedule & dormant account purge active.',
      framework: 'GDPR'
    },
    {
      axis: 'Cryptographic Protection & KMS',
      label: 'Encryption at Rest',
      score: hasEncryptionViolation ? (enc ? 55 : 20) : 98,
      benchmark: 95,
      statute: 'GDPR Art. 32 / ISO 27001 A.8.24',
      description: hasEncryptionViolation 
        ? 'Cleartext database columns detected without AES-256 envelope encryption.' 
        : 'AES-256-GCM / AWS KMS hardware encryption active across all tables.',
      framework: 'ISO27001'
    },
    {
      axis: 'Consent & Telemetry Governance',
      label: 'Opt-In & Consent Ledger',
      score: hasConsentViolation ? (consent ? 60 : 30) : 92,
      benchmark: 88,
      statute: 'GDPR Art. 7(1) / HK PDPO DPP 3',
      description: hasConsentViolation 
        ? 'Analytics trackers fired prior to affirmative verifiable opt-in.' 
        : 'Granular consent audit ledger active with IP hashing verification.',
      framework: 'GDPR'
    },
    {
      axis: 'Payment Security & SAD Protection',
      label: 'PCI-DSS Tokenization',
      score: hasPciViolation ? 15 : 100,
      benchmark: 100,
      statute: 'PCI-DSS 4.0 Req 3.2 / 3.4',
      description: hasPciViolation 
        ? 'CRITICAL: Cleartext CVV / PAN stored in database. Prohibited under Req 3.2.' 
        : 'Zero-knowledge tokenized vault proxy active. Zero PCI SAD in database.',
      framework: 'PCIDSS'
    },
    {
      axis: 'Special Category & ePHI Safeguards',
      label: 'ePHI & Medical Privacy',
      score: hasHipaaViolation ? 30 : 96,
      benchmark: 92,
      statute: 'HIPAA § 164.312 / GDPR Art. 9',
      description: hasHipaaViolation 
        ? 'Diagnostic notes & biometric telemetry unencrypted in transit/rest.' 
        : 'KMS column-level encryption & WORM access audit trail active.',
      framework: 'HIPAA'
    },
    {
      axis: 'Access Control & Data Lineage',
      label: 'RBAC & Audit Trails',
      score: hasCrossBorderViolation ? 45 : 90,
      benchmark: 90,
      statute: 'SOC 2 CC6.7 / HK PDPO DPP 4',
      description: hasCrossBorderViolation 
        ? 'Cross-border data transfers lack Standard Contractual Clauses (SCCs).' 
        : 'Strict RBAC session enforcement and tamper-evident audit logging.',
      framework: 'SOC2'
    }
  ];

  // SVG Radar Polygon Math (6 Axes, Center = 150, 150, Radius = 100)
  const center = 150;
  const radius = 100;
  const numAxes = radarMetrics.length;

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = radarMetrics
    .map((m, i) => {
      const { x, y } = getCoordinates(i, m.score / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const benchmarkPoints = radarMetrics
    .map((m, i) => {
      const { x, y } = getCoordinates(i, m.benchmark / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Data Lineage Topology Nodes
  const nodes: DataNode[] = [
    {
      id: 'node-client',
      label: 'Client Browser / Mobile App',
      sublabel: 'User Ingestion Point',
      type: 'client',
      zone: 'Untrusted Public',
      icon: Globe,
      riskStatus: hasConsentViolation ? 'AT_RISK' : 'SECURE',
      piiItems: ['User Email', 'Cleartext Inputs', 'Browser Cookies'],
      vulnerabilities: hasConsentViolation ? ['Pre-consent tracking pixels active'] : []
    },
    {
      id: 'node-gateway',
      label: 'API Gateway / Reverse Proxy',
      sublabel: 'TLS 1.3 Ingress',
      type: 'gateway',
      zone: 'DMZ / Edge',
      icon: Server,
      riskStatus: 'SECURE',
      piiItems: ['Client IP Address', 'User-Agent Header', 'Session Tokens'],
      vulnerabilities: []
    },
    {
      id: 'node-service',
      label: 'Core Application Service',
      sublabel: 'Node.js / Express Backend',
      type: 'app_service',
      zone: 'Internal VPC',
      icon: Layers,
      riskStatus: hasPciViolation ? 'CRITICAL_LEAK' : 'SECURE',
      piiItems: hasPciViolation ? ['Raw Card Number', 'CVV Code', 'Full Name'] : ['User Profile ID', 'Tokenized Payment ID'],
      vulnerabilities: hasPciViolation ? ['PCI-DSS Req 3.2: Raw CVV in server memory'] : []
    },
    {
      id: 'node-db',
      label: 'Primary Database Cluster',
      sublabel: 'PostgreSQL 16 / MySQL',
      type: 'database',
      zone: 'Encrypted Storage',
      icon: Database,
      riskStatus: (hasEncryptionViolation || hasPciViolation) ? 'CRITICAL_LEAK' : 'SECURE',
      piiItems: ['Billing Records', 'Health/Vitals (JSONB)', 'Dormant Accounts'],
      vulnerabilities: [
        ...(hasPciViolation ? ['PCI-DSS 3.2: Storing CVV in database tables'] : []),
        ...(hasEncryptionViolation ? ['GDPR Art. 32: Unencrypted cleartext PII columns'] : []),
        ...(hasRetentionViolation ? ['GDPR Art. 5(1)(e): Indefinite telemetry retention without TTL'] : [])
      ]
    },
    {
      id: 'node-thirdparty',
      label: 'Third-Party Analytics & SDKs',
      sublabel: 'External SaaS Egress',
      type: 'third_party',
      zone: 'External Egress',
      icon: Zap,
      riskStatus: hasCrossBorderViolation ? 'AT_RISK' : 'SECURE',
      piiItems: ['IP Address', 'Telemetry Events', 'Geo Coordinates'],
      vulnerabilities: hasCrossBorderViolation ? ['Cross-border transfer to non-adequate jurisdiction without SCCs'] : []
    }
  ];

  const flows: DataFlowEdge[] = [
    {
      id: 'flow-1',
      from: 'node-client',
      to: 'node-gateway',
      label: 'HTTPS / TLS 1.3 Request',
      isEncrypted: true,
      hasConsentGuard: !hasConsentViolation,
      status: hasConsentViolation ? 'EXPOSED' : 'COMPLIANT',
      statuteViolation: hasConsentViolation ? 'GDPR Art. 7' : undefined
    },
    {
      id: 'flow-2',
      from: 'node-gateway',
      to: 'node-service',
      label: 'Internal VPC Traffic',
      isEncrypted: true,
      hasConsentGuard: true,
      status: 'COMPLIANT'
    },
    {
      id: 'flow-3',
      from: 'node-service',
      to: 'node-db',
      label: 'SQL Queries & Writes',
      isEncrypted: enc,
      hasConsentGuard: true,
      status: hasPciViolation ? 'PROHIBITED' : (hasEncryptionViolation ? 'EXPOSED' : 'COMPLIANT'),
      statuteViolation: hasPciViolation ? 'PCI-DSS Req 3.2' : (hasEncryptionViolation ? 'GDPR Art. 32' : undefined)
    },
    {
      id: 'flow-4',
      from: 'node-service',
      to: 'node-thirdparty',
      label: 'Analytics Webhooks',
      isEncrypted: true,
      hasConsentGuard: !hasConsentViolation,
      status: hasCrossBorderViolation ? 'EXPOSED' : 'COMPLIANT',
      statuteViolation: hasCrossBorderViolation ? 'HK PDPO DPP 3' : undefined
    }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[3];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      
      {/* Visual Sub-View Selector */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubView('radar')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'radar' 
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Compliance Threat Radar</span>
          </button>

          <button
            onClick={() => setActiveSubView('lineage')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'lineage' 
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Data Lineage & Risk Topology</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Critical Leak</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Remediated</span>
          </span>
        </div>
      </div>

      {/* VIEW 1: Interactive SVG 6-Axis Compliance Radar */}
      {activeSubView === 'radar' && (
        <div className="p-4 flex flex-col lg:flex-row items-center gap-6 bg-slate-950 text-white">
          
          {/* SVG Radar Chart Canvas */}
          <div className="relative w-72 h-72 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              
              {/* Concentric Reference Grid Rings (20%, 40%, 60%, 80%, 100%) */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((ring, idx) => (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius * ring}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray={idx === 4 ? 'none' : '3 3'}
                  opacity={0.6}
                />
              ))}

              {/* Axis Spokes */}
              {radarMetrics.map((_, idx) => {
                const { x, y } = getCoordinates(idx, 1);
                return (
                  <line
                    key={idx}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#475569"
                    strokeWidth="1"
                    opacity={0.7}
                  />
                );
              })}

              {/* Target Benchmark Threshold Polygon (Dotted Amber) */}
              <polygon
                points={benchmarkPoints}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={0.7}
              />

              {/* System Compliance Score Polygon (Glowing Cyan/Emerald/Rose) */}
              <polygon
                points={polygonPoints}
                fill={baseScore >= 80 ? 'rgba(16, 185, 129, 0.35)' : (baseScore >= 50 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(244, 63, 94, 0.35)')}
                stroke={baseScore >= 80 ? '#10b981' : (baseScore >= 50 ? '#f59e0b' : '#f43f5e')}
                strokeWidth="2.5"
              />

              {/* Interactive Radar Axis Nodes */}
              {radarMetrics.map((metric, idx) => {
                const { x, y } = getCoordinates(idx, metric.score / 100);
                const labelPos = getCoordinates(idx, 1.22);
                const isSelected = selectedRadarAxis === idx;
                const nodeColor = metric.score >= 80 ? '#10b981' : (metric.score >= 50 ? '#f59e0b' : '#f43f5e');

                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedRadarAxis(idx)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4.5}
                      fill={nodeColor}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    
                    {/* Axis Labels */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-[9px] font-mono font-bold transition-colors ${
                        isSelected ? 'fill-cyan-400 font-extrabold' : 'fill-slate-400 hover:fill-slate-200'
                      }`}
                    >
                      {metric.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center Benchmark Tag */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800 backdrop-blur-xs">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Overall</span>
                <span className={`text-xs font-black ${
                  baseScore >= 80 ? 'text-emerald-400' : (baseScore >= 50 ? 'text-amber-400' : 'text-rose-400')
                }`}>
                  {baseScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Axis Deep-Dive & Statutory Mapping */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Threat Vector Analysis
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Click any axis node to inspect
              </span>
            </div>

            {/* List of 6 Metric Vectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {radarMetrics.map((m, idx) => {
                const isSelected = selectedRadarAxis === idx || (selectedRadarAxis === null && idx === 0);
                const isPassing = m.score >= 80;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedRadarAxis(idx)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/70 shadow-xs'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200 truncate">{m.label}</span>
                      <span className={`text-[11px] font-mono font-bold ${
                        isPassing ? 'text-emerald-400' : (m.score >= 50 ? 'text-amber-400' : 'text-rose-400')
                      }`}>
                        {m.score}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1">
                      <span>{m.statute}</span>
                      <span className="text-slate-500">Target: {m.benchmark}%</span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isPassing ? 'bg-emerald-500' : (m.score >= 50 ? 'bg-amber-500' : 'bg-rose-500')
                        }`}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Axis Detail Box */}
            {(() => {
              const active = radarMetrics[selectedRadarAxis !== null ? selectedRadarAxis : 0];
              return (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold border border-cyan-800/60 uppercase">
                        {active.framework}
                      </span>
                      <span className="font-bold text-slate-200">{active.axis}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {active.description}
                    </p>
                  </div>

                  {active.score < 80 && onOpenAutoFixModal && (
                    <button
                      onClick={() => onOpenAutoFixModal()}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                    >
                      <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span>Auto-Remediate</span>
                    </button>
                  )}
                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* VIEW 2: Interactive Visual Data Lineage & Topology */}
      {activeSubView === 'lineage' && (
        <div className="p-4 bg-slate-950 text-white space-y-4">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Enterprise Data Lineage & Egress Flow</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Track how PII, payment SAD, and health vitals traverse system perimeters and identify unencrypted leak points.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Interactive Topology
            </span>
          </div>

          {/* Node Flow Chain */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            {nodes.map((node, idx) => {
              const IconComp = node.icon;
              const isSelected = selectedNodeId === node.id;
              const isCritical = node.riskStatus === 'CRITICAL_LEAK';
              const isAtRisk = node.riskStatus === 'AT_RISK';

              return (
                <div key={node.id} className="flex flex-col items-center">
                  
                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500'
                        : isCritical
                        ? 'bg-rose-950/40 border-rose-800/80 hover:border-rose-600'
                        : isAtRisk
                        ? 'bg-amber-950/40 border-amber-800/80 hover:border-amber-600'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Zone Badge */}
                    <span className="text-[8px] font-mono uppercase text-slate-400 block truncate">
                      {node.zone}
                    </span>

                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : isAtRisk
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h5 className="text-[11px] font-bold text-slate-200 truncate">{node.label}</h5>
                        <p className="text-[9px] text-slate-400 truncate">{node.sublabel}</p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between">
                      <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                        isCritical
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : isAtRisk
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {node.riskStatus.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {node.piiItems.length} PII
                      </span>
                    </div>

                  </div>

                  {/* Flow Arrow (Connector between steps on desktop) */}
                  {idx < nodes.length - 1 && (
                    <div className="hidden md:flex items-center justify-center my-1 text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5 transform rotate-0" />
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Node Inspector Detail Panel */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start justify-between gap-4">
            
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedNode.label}</span>
                <span className="text-[10px] font-mono text-slate-400">({selectedNode.zone})</span>
              </div>

              {/* Detected PII payload in this node */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Traversing PII:</span>
                {selectedNode.piiItems.map((pii, pIdx) => (
                  <span key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                    {pii}
                  </span>
                ))}
              </div>

              {/* Vulnerabilities flagged */}
              {selectedNode.vulnerabilities.length > 0 ? (
                <div className="space-y-1 pt-1.5">
                  {selectedNode.vulnerabilities.map((vuln, vIdx) => (
                    <div key={vIdx} className="text-[10px] text-rose-400 flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{vuln}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-medium pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>No cleartext data leaks or prohibited storage detected at this layer.</span>
                </div>
              )}
            </div>

            {selectedNode.vulnerabilities.length > 0 && onOpenAutoFixModal && (
              <button
                onClick={() => onOpenAutoFixModal()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Auto-Fix This Layer</span>
              </button>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { X, Download, Copy, Check, Printer, FileText, ShieldCheck } from 'lucide-react';
import { AuditResult } from '../types';

interface ReportModalProps {
  auditResult: AuditResult;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ auditResult, onClose }) => {
  const [copied, setCopied] = useState(false);

  const domain = auditResult.detectedDomain || 'General Enterprise';
  const frameworksStr = (auditResult.activeFrameworks || ['GDPR']).join(', ');

  const generateMarkdownReport = () => {
    const criticalCount = auditResult.riskBreakdown.critical || 0;
    const highCount = auditResult.riskBreakdown.high || 0;
    const isGDPR = (auditResult.activeFrameworks || []).includes('GDPR');
    const isHIPAA = (auditResult.activeFrameworks || []).includes('HIPAA');
    const isPCI = (auditResult.activeFrameworks || []).includes('PCIDSS');

    return `# REGULATORY & PRIVACY COMPLIANCE AUDIT REPORT
**Project Name:** ${auditResult.projectName}
**Detected Architecture Domain:** ${domain}
**Active Statutory Frameworks:** ${frameworksStr}
**Audit Timestamp:** ${new Date(auditResult.timestamp).toUTCString()}
**Autonomous Agent:** GuardianAI Multi-Standard Compliance Agent

---

## 1. Executive Summary & Compliance Score
- **Overall Compliance Score:** ${auditResult.complianceScore} / 100
- **Regulatory Risk Status:** ${auditResult.status}
- **Domain:** ${domain}
- **Executive Summary:** ${auditResult.executiveSummary}

### Risk Matrix Breakdown
- **Critical Non-Compliances:** ${auditResult.riskBreakdown.critical}
- **High Risk Deficiencies:** ${auditResult.riskBreakdown.high}
- **Medium Risk Items:** ${auditResult.riskBreakdown.medium}
- **Low Risk Observations:** ${auditResult.riskBreakdown.low}

---

## 2. Statutory Financial Liability Exposure (Simulation Baseline)
- **GDPR Art. 83 Tier 2 Statutory Ceiling:** Up to €20,000,000 or 4% of Global Annual Turnover
- **HIPAA §164.312 OCR Penalty Ceiling:** Up to $2,067,813 per violation standard
- **PCI-DSS 4.0 Assessment:** Monthly card brand fines ($10k - $50k/mo) + forensic PFI audit overhead
- **Simulated Exposure Range:** ${criticalCount > 0 ? '$2.5M - $12.8M (High Exposure)' : '$150k - $850k (Managed Exposure)'}

---

## 3. Identified Personal Identifiable Information (PII) Inventory
${auditResult.piiInventory.map((pii, idx) => `### ${idx + 1}. \`${pii.field}\` (${pii.category})
- **Context/Table:** ${pii.tableOrContext}
- **Risk Severity:** ${pii.riskLevel}
- **Relevant Frameworks:** ${(pii.frameworks || ['GDPR']).join(', ')}
- **Applicable Statutes:** ${(pii.applicableStatutes || pii.gdprArticles).join(', ')}
- **Finding:** ${pii.findings}
`).join('\n')}

---

## 4. Engineering Remediation Action Tickets
${auditResult.remediationTasks.map((task) => `### [${task.severity}] [${task.framework || 'GDPR'}] ${task.title} (${task.id})
- **Framework:** ${task.framework || 'GDPR'}
- **Regulatory Grounding:** ${task.citedStatute || task.article}
- **Category:** ${task.category}
- **Suggested Effort:** ${task.suggestedEffort}
- **Affected Fields:** ${task.affectedFields.join(', ')}

#### Description
${task.description}

#### Action Items Checklist
${task.actionItems.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n')}

${task.codeExample ? `#### Technical Fix / Schema Solution\n\`\`\`typescript\n${task.codeExample}\n\`\`\`\n` : ''}
`).join('\n')}

---

## 5. Checked Regulatory Articles & Standard Clauses
${auditResult.checkedClauses.map(c => `- ${c}`).join('\n')}

---
*Report autonomously compiled by GuardianAI Multi-Standard Compliance Agent.*
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const blob = new Blob([JSON.stringify(auditResult, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GDPR_Audit_${auditResult.projectName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 150);
    } catch (err) {
      console.warn('Direct file download fallback to clipboard:', err);
      navigator.clipboard.writeText(JSON.stringify(auditResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const markdown = generateMarkdownReport();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GDPR_Audit_Report_${auditResult.projectName.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 150);
    } catch (err) {
      console.warn('Direct markdown download fallback to clipboard:', err);
      navigator.clipboard.writeText(generateMarkdownReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Full Compliance Audit Report</h3>
              <p className="text-[11px] text-slate-500">{auditResult.projectName} — Score: {auditResult.complianceScore}/100</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all active:scale-95 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all active:scale-95 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all active:scale-95 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.json)</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        {/* Report Content Preview */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50 text-slate-700 space-y-6 text-xs leading-relaxed font-sans">
          
          {/* Header Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-slate-900">{auditResult.projectName}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Audited: {new Date(auditResult.timestamp).toLocaleString()}</div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-blue-600">{auditResult.complianceScore} / 100</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{auditResult.status}</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1">1. Executive Summary</h4>
            <p className="text-slate-600">{auditResult.executiveSummary}</p>
          </div>

          {/* Financial Risk Exposure Overview */}
          <div className="space-y-2 p-3 bg-rose-50/50 border border-rose-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                2. Statutory Financial Exposure & Regulatory Fine Benchmark
              </h4>
              <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                Simulated Exposure
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded border border-rose-100">
                <div className="text-slate-500 text-[10px]">GDPR Art. 83 Cap</div>
                <div className="font-bold text-slate-800">Max €20M / 4% Turnover</div>
              </div>
              <div className="p-2 bg-white rounded border border-rose-100">
                <div className="text-slate-500 text-[10px]">HIPAA Enforcement</div>
                <div className="font-bold text-slate-800">Up to $2.06M / Category</div>
              </div>
              <div className="p-2 bg-white rounded border border-rose-100">
                <div className="text-slate-500 text-[10px]">PCI-DSS Monthly Assessments</div>
                <div className="font-bold text-slate-800">$10,000 - $50,000 / mo</div>
              </div>
            </div>
          </div>

          {/* PII Inventory */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1">
              3. Identified Personal Data Elements ({auditResult.piiInventory.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {auditResult.piiInventory.map((pii) => (
                <div key={pii.id} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <div className="font-mono font-bold text-slate-900 text-xs">{pii.field}</div>
                  <div className="text-[11px] text-slate-500">{pii.category} • {pii.tableOrContext}</div>
                  <div className="text-[11px] text-slate-700 mt-1">{pii.findings}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Tasks */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1">
              4. Remediation Tickets ({auditResult.remediationTasks.length})
            </h4>
            <div className="space-y-2.5">
              {auditResult.remediationTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{task.title}</span>
                    <span className="font-mono text-[10px] text-amber-600 font-bold">{task.severity}</span>
                  </div>
                  <div className="text-[11px] text-blue-700 font-medium">
                    [{task.framework || 'GDPR'}] {task.citedStatute || task.article} • {task.category}
                  </div>
                  <p className="text-[11px] text-slate-600">{task.description}</p>
                  <ul className="text-[11px] space-y-0.5 pt-1">
                    {task.actionItems.map((a) => (
                      <li key={a.id} className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-blue-500">•</span>
                        <span>{a.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

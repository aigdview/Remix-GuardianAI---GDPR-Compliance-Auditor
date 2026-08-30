import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Code, 
  FileText, 
  Layers, 
  ChevronDown,
  ChevronRight,
  Sparkles,
  Award,
  ListTodo,
  Globe2,
  Filter,
  Zap,
  GitPullRequest,
  Radar
} from 'lucide-react';
import { AuditResult, RemediationTask, PIIElement, SeverityLevel, ComplianceStatus, ComplianceFramework } from '../types';
import { ComplianceRadarAndLineage } from './ComplianceRadarAndLineage';
import { FinancialLiabilitySimulator } from './FinancialLiabilitySimulator';
import { ExecutiveVoiceBriefing } from './ExecutiveVoiceBriefing';
import { DollarSign, Headphones, Volume2 } from 'lucide-react';

interface RightResultsDashboardProps {
  auditResult: AuditResult | null;
  isLoading: boolean;
  onOpenTicketModal: (task: RemediationTask) => void;
  onOpenAutoFixModal: (task?: RemediationTask) => void;
  onToggleActionItem: (taskId: string, actionId: string) => void;
}

export const RightResultsDashboard: React.FC<RightResultsDashboardProps> = ({
  auditResult,
  isLoading,
  onOpenTicketModal,
  onOpenAutoFixModal,
  onToggleActionItem
}) => {
  const [expandedTaskCode, setExpandedTaskCode] = useState<Record<string, boolean>>({});
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'radar' | 'simulator' | 'pii' | 'summary'>('tasks');
  const [selectedFrameworkFilter, setSelectedFrameworkFilter] = useState<string>('ALL');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const toggleCodeSnippet = (taskId: string) => {
    setExpandedTaskCode(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleQuickCopyTicket = (task: RemediationTask) => {
    const citation = task.citedStatute || task.article;
    const markdown = `### [${task.severity}] ${task.title}
**Framework:** ${task.framework || 'GDPR'}
**Regulatory Citation:** ${citation}
**Category:** ${task.category}
**Affected Fields:** ${task.affectedFields.join(', ')}

#### Description
${task.description}

#### Action Items
${task.actionItems.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n')}

${task.codeExample ? `\n#### Suggested Technical Implementation\n\`\`\`\n${task.codeExample}\n\`\`\`` : ''}
`;
    navigator.clipboard.writeText(markdown);
    setCopiedTaskId(task.id);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  const getFrameworkBadgeStyle = (fw?: ComplianceFramework | string) => {
    switch (fw) {
      case 'PCIDSS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HIPAA':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'ISO27001':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'SOC2':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'HK_PDPO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'GDPR':
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  if (!auditResult && !isLoading) {
    return (
      <div id="panel-results-dashboard" className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-full overflow-hidden p-5">
        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Awaiting Audit Execution</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Configure your project architecture specification on the left and run the audit to generate formal compliance metrics and tickets.
          </p>
        </div>
      </div>
    );
  }

  const score = auditResult?.complianceScore || 0;
  const status = auditResult?.status || 'CRITICAL';
  const detectedDomain = auditResult?.detectedDomain || 'General B2B / SaaS';
  const activeFrameworks = auditResult?.activeFrameworks || ['GDPR'];

  // Calculate task action completion metrics
  const allActionItems = auditResult?.remediationTasks.flatMap(t => t.actionItems) || [];
  const completedActionItems = allActionItems.filter(i => i.completed).length;
  const totalActionItems = allActionItems.length;

  // Determine Badge Styling
  const getStatusBadge = (st: ComplianceStatus) => {
    switch (st) {
      case 'COMPLIANT':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          label: 'LOW RISK'
        };
      case 'HIGH RISK':
        return {
          bg: 'bg-amber-100 text-amber-800 border border-amber-200',
          label: 'HIGH RISK'
        };
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-rose-100 text-rose-800 border border-rose-200',
          label: 'CRITICAL RISK'
        };
    }
  };

  const statusBadge = getStatusBadge(status);

  // Gauge Circumference Calculation (Radius: 30)
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColorClass = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  // Filter tasks by selected framework
  const filteredTasks = (auditResult?.remediationTasks || []).filter(task => {
    if (selectedFrameworkFilter === 'ALL') return true;
    return task.framework === selectedFrameworkFilter;
  });

  return (
    <div id="panel-results-dashboard" className="flex flex-col gap-3.5 h-full overflow-hidden">
      
      {/* 1. Score Summary & Multi-Standard Metric Card */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          
          {/* Radial Circular Metric */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke="#f1f5f9"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-out ${getScoreColorClass(score)}`}
              />
            </svg>
            <span className="absolute text-lg font-bold text-slate-800">{score}</span>
          </div>

          {/* Score Details */}
          <div className="flex-1 ml-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Compliance Score</p>
              <div className="flex items-center gap-2">
                {auditResult && (
                  <button
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors active:scale-95"
                    title="Listen to synthesized 45-second Executive Voice Briefing"
                  >
                    <Headphones className="w-3 h-3 text-indigo-600" />
                    <span>Voice Briefing</span>
                  </button>
                )}
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-tight line-clamp-1 font-medium">
              Domain: <span className="text-slate-900 font-bold">{detectedDomain}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              {auditResult?.riskBreakdown.critical
                ? `Critical gaps flagged across active security and data protection standards.`
                : `System specifications align closely with statutory regulatory mandates.`}
            </p>
          </div>

        </div>

        {/* Active Frameworks Badges Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-slate-400" />
            <span>Active Frameworks:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeFrameworks.map(fw => (
              <span 
                key={fw} 
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getFrameworkBadgeStyle(fw)}`}
              >
                {fw === 'HK_PDPO' ? 'HK PDPO' : fw === 'PCIDSS' ? 'PCI-DSS' : fw}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* 2. Remediation Tasks and Tabs Container */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm min-h-0">
        
        {/* Header & Tabs */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`text-xs font-bold transition-colors pb-0.5 ${
                activeTab === 'tasks' ? 'text-slate-800 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Remediation Tasks
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`text-xs font-bold transition-colors pb-0.5 flex items-center gap-1 ${
                activeTab === 'radar' ? 'text-blue-700 border-b-2 border-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Radar className="w-3.5 h-3.5 text-blue-600" />
              <span>Radar & Lineage</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`text-xs font-bold transition-colors pb-0.5 flex items-center gap-1 ${
                activeTab === 'simulator' ? 'text-emerald-700 border-b-2 border-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fine Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('pii')}
              className={`text-xs font-bold transition-colors pb-0.5 ${
                activeTab === 'pii' ? 'text-slate-800 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              PII Inventory ({auditResult?.piiInventory.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`text-xs font-bold transition-colors pb-0.5 ${
                activeTab === 'summary' ? 'text-slate-800 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Summary
            </button>
          </div>

          <div className="flex items-center gap-2">
            {totalActionItems > 0 && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                completedActionItems === totalActionItems && totalActionItems > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : completedActionItems > 0
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {completedActionItems}/{totalActionItems} Resolved
              </span>
            )}
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {auditResult?.remediationTasks.length || 0} Tickets
            </span>
          </div>
        </div>

        {/* Framework Filter Bar (When in Tasks tab and multi-frameworks present) */}
        {activeTab === 'tasks' && activeFrameworks.length > 1 && (
          <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
              <Filter className="w-2.5 h-2.5" />
              <span>Standard:</span>
            </span>
            <button
              onClick={() => setSelectedFrameworkFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all whitespace-nowrap ${
                selectedFrameworkFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ALL ({auditResult?.remediationTasks.length || 0})
            </button>
            {activeFrameworks.map(fw => {
              const count = (auditResult?.remediationTasks || []).filter(t => t.framework === fw).length;
              return (
                <button
                  key={fw}
                  onClick={() => setSelectedFrameworkFilter(fw)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all whitespace-nowrap ${
                    selectedFrameworkFilter === fw
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fw === 'HK_PDPO' ? 'HK PDPO' : fw === 'PCIDSS' ? 'PCI-DSS' : fw} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">

          {/* TAB 1: Remediation Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              
              {/* Master Auto-Remediation Banner */}
              {auditResult && auditResult.remediationTasks.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl shadow-xs flex items-center justify-between gap-3 border border-blue-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Autonomous Multi-Standard Auto-Remediator</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-mono border border-amber-400/30">
                          PR Engine
                        </span>
                      </h4>
                      <p className="text-[10px] text-blue-200 mt-0.5">
                        Generate complete Git pull request diffs with database migrations & zero-trust middlewares.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAutoFixModal()}
                    className="px-3 py-1.5 rounded-lg bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Auto-Fix All</span>
                  </button>
                </div>
              )}

              {filteredTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No remediation tickets for the selected standard filter.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isCodeOpen = expandedTaskCode[task.id];
                  const isCritical = task.severity === 'CRITICAL';
                  const isHigh = task.severity === 'HIGH';
                  const citation = task.citedStatute || task.article;

                  return (
                    <div
                      key={task.id}
                      id={`remediation-card-${task.id}`}
                      className={`p-3 border border-slate-200 rounded-lg bg-slate-50 ${
                        isCritical
                          ? 'border-l-4 border-l-red-500'
                          : isHigh
                          ? 'border-l-4 border-l-amber-500'
                          : 'border-l-4 border-l-blue-500'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getFrameworkBadgeStyle(task.framework)}`}>
                              {task.framework === 'HK_PDPO' ? 'HK PDPO' : task.framework === 'PCIDSS' ? 'PCI-DSS' : task.framework || 'GDPR'}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800">{task.title}</h4>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                            {citation} • {task.category}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${
                          isCritical ? 'text-red-600' : isHigh ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {task.severity}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Action Items Checklist */}
                      <div className="space-y-1 mb-2 pt-1 border-t border-slate-200/80">
                        {task.actionItems.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-2 cursor-pointer text-slate-700 hover:text-slate-900"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => onToggleActionItem(task.id, item.id)}
                              className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <span className={`text-[11px] ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Code Snippet Toggle */}
                      {task.codeExample && (
                        <div className="mb-2">
                          <button
                            onClick={() => toggleCodeSnippet(task.id)}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Code className="w-3 h-3" />
                            <span>{isCodeOpen ? 'Hide Suggested Code Fix' : 'View Suggested Code Fix'}</span>
                          </button>
                          {isCodeOpen && (
                            <pre className="mt-1.5 p-2 rounded bg-slate-900 text-[10px] font-mono text-emerald-300 overflow-x-auto custom-scrollbar">
                              {task.codeExample}
                            </pre>
                          )}
                        </div>
                      )}

                      {/* Task Actions */}
                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => onOpenAutoFixModal(task)}
                          className="flex-1.5 text-[10px] bg-blue-600 text-white hover:bg-blue-700 py-1 px-2 rounded font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                          title="Generate unified Git PR diff and automated schema migration"
                        >
                          <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                          <span>Auto-Fix & PR Diff</span>
                        </button>
                        <button
                          onClick={() => onOpenTicketModal(task)}
                          className="flex-1 text-[10px] bg-white border border-slate-200 py-1 px-1.5 rounded font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Export Ticket
                        </button>
                        <button
                          onClick={() => handleQuickCopyTicket(task)}
                          className="flex-1 text-[10px] bg-slate-800 text-white py-1 px-1.5 rounded font-semibold hover:bg-slate-900 transition-colors"
                        >
                          {copiedTaskId === task.id ? 'Copied!' : 'Copy Fix'}
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Interactive Compliance Radar & Data Lineage Map */}
          {activeTab === 'radar' && auditResult && (
            <div className="space-y-3">
              <ComplianceRadarAndLineage
                auditResult={auditResult}
                onOpenAutoFixModal={onOpenAutoFixModal}
                onSelectTask={(task) => onOpenTicketModal(task)}
              />
            </div>
          )}

          {/* TAB 3: Statutory Financial Risk & Fine Simulator */}
          {activeTab === 'simulator' && auditResult && (
            <div className="space-y-3">
              <FinancialLiabilitySimulator
                auditResult={auditResult}
                onOpenAutoFixModal={onOpenAutoFixModal}
              />
            </div>
          )}

          {/* TAB 4: PII Inventory */}
          {activeTab === 'pii' && (
            <div className="space-y-2">
              {auditResult?.piiInventory.map((pii) => (
                <div
                  key={pii.id}
                  className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800">{pii.field}</span>
                      {pii.frameworks && pii.frameworks.map(fw => (
                        <span key={fw} className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getFrameworkBadgeStyle(fw)}`}>
                          {fw === 'HK_PDPO' ? 'HK PDPO' : fw === 'PCIDSS' ? 'PCI-DSS' : fw}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                      {pii.riskLevel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {pii.tableOrContext} • {pii.category}
                  </div>
                  <div className="text-[11px] text-slate-700">
                    {pii.findings}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Executive Summary</h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    {detectedDomain}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{auditResult?.executiveSummary}</p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                <h4 className="font-bold text-slate-800">Checked Statutory Articles & Clauses</h4>
                <div className="flex flex-wrap gap-1">
                  {auditResult?.checkedClauses.map((clause, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-mono font-medium">
                      {clause}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Executive Voice Briefing Audio Modal */}
      {isVoiceModalOpen && auditResult && (
        <ExecutiveVoiceBriefing
          auditResult={auditResult}
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
        />
      )}

    </div>
  );
};



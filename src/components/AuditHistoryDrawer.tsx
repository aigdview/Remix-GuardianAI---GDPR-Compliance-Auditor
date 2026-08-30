import React, { useState } from 'react';
import { 
  X, 
  History, 
  Trash2, 
  Download, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCode,
  FileText,
  ChevronDown,
  ChevronUp,
  Columns,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { StoredAuditRecord, deleteAuditRecord, exportAuditHistoryArchive, clearAllAuditHistory } from '../services/auditHistoryService';
import { AuditResult, ComplianceFramework } from '../types';

interface AuditHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyRecords: StoredAuditRecord[];
  currentAuditResult?: AuditResult | null;
  onRestoreSnapshot: (record: StoredAuditRecord) => void;
  onRefreshHistory: () => void;
}

export const AuditHistoryDrawer: React.FC<AuditHistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyRecords,
  currentAuditResult,
  onRestoreSnapshot,
  onRefreshHistory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'CONDITIONAL' | 'CRITICAL'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [comparingRecord, setComparingRecord] = useState<StoredAuditRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const domains = Array.from(new Set(historyRecords.map(r => r.detectedDomain).filter(Boolean)));

  const filteredRecords = historyRecords.filter(record => {
    const matchesDomain = selectedDomainFilter === 'ALL' || record.detectedDomain === selectedDomainFilter;
    const matchesStatus = 
      selectedStatusFilter === 'ALL' || 
      (selectedStatusFilter === 'COMPLIANT' && (record.status === 'COMPLIANT' || record.complianceScore >= 80)) ||
      (selectedStatusFilter === 'CONDITIONAL' && (record.status === 'CONDITIONAL' || (record.complianceScore >= 50 && record.complianceScore < 80))) ||
      (selectedStatusFilter === 'CRITICAL' && (record.status === 'CRITICAL' || record.complianceScore < 50));

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesDomain && matchesStatus;
    return (
      matchesDomain &&
      matchesStatus &&
      (record.projectName.toLowerCase().includes(q) ||
        (record.detectedDomain && record.detectedDomain.toLowerCase().includes(q)) ||
        (record.activeFrameworks && record.activeFrameworks.some(f => f.toLowerCase().includes(q))) ||
        record.status.toLowerCase().includes(q) ||
        (record.schemaText && record.schemaText.toLowerCase().includes(q)))
    );
  });

  const handleDelete = async (e: React.MouseEvent, record: StoredAuditRecord) => {
    e.stopPropagation();
    const idToDelete = record.docId || record.id;
    setDeletingId(idToDelete);
    await deleteAuditRecord(idToDelete);
    onRefreshHistory();
    setDeletingId(null);
  };

  const handleClearAll = async () => {
    await clearAllAuditHistory(historyRecords);
    onRefreshHistory();
    setShowClearConfirm(false);
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Audit History & Working Snapshots
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {historyRecords.length} Saved
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Persistent Firestore audit ledger, diff comparisons, and instant workspace restores</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {historyRecords.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => exportAuditHistoryArchive(historyRecords, 'markdown')}
                  title="Export Markdown Audit Ledger"
                  className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-100 flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ledger (MD)</span>
                </button>
                <button
                  onClick={() => exportAuditHistoryArchive(historyRecords, 'json')}
                  title="Export JSON Archive"
                  className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-100 flex items-center gap-1 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => exportAuditHistoryArchive(historyRecords, 'csv')}
                  title="Export CSV Matrix"
                  className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-100 flex items-center gap-1 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV</span>
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3.5 bg-white border-b border-slate-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history by project name, schema text, framework (GDPR, PCI, HIPAA), or status..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
            {historyRecords.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                title="Clear all saved history records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 mr-1">STATUS:</span>
              {(['ALL', 'COMPLIANT', 'CONDITIONAL', 'CRITICAL'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    selectedStatusFilter === st
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Domains Chips */}
            {domains.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 mr-1">DOMAIN:</span>
                <button
                  onClick={() => setSelectedDomainFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all whitespace-nowrap ${
                    selectedDomainFilter === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {domains.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomainFilter(dom!)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all whitespace-nowrap ${
                      selectedDomainFilter === dom
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clear All Confirmation Alert */}
        {showClearConfirm && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs flex items-center justify-between gap-3 text-rose-800 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Are you sure you want to permanently clear all <strong>{historyRecords.length}</strong> historical audit records from Firestore and local cache?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 bg-white border border-rose-200 rounded text-rose-700 hover:bg-rose-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 bg-rose-600 text-white rounded hover:bg-rose-700 text-xs font-semibold shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        )}

        {/* Snapshot Comparison Modal/Panel Overlay */}
        {comparingRecord && (
          <div className="p-4 bg-slate-900 text-white border-b border-slate-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Side-by-Side Comparison: Current Workspace vs. Historical Snapshot
                </h4>
              </div>
              <button
                onClick={() => setComparingRecord(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
              >
                Close Comparison
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Current Session */}
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1.5">
                <div className="text-[10px] font-bold text-blue-400 uppercase">Active Workspace (Current)</div>
                <div className="font-bold text-sm text-white">{currentAuditResult?.projectName || 'Active Schema'}</div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-blue-400">{currentAuditResult?.complianceScore || 0}/100</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                    {currentAuditResult?.status || 'UNAUDITED'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  PII Fields: {currentAuditResult?.piiInventory?.length || 0} • Tasks: {currentAuditResult?.remediationTasks?.length || 0}
                </div>
              </div>

              {/* Historical Record */}
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1.5">
                <div className="text-[10px] font-bold text-amber-400 uppercase">Historical Snapshot ({new Date(comparingRecord.timestamp).toLocaleDateString()})</div>
                <div className="font-bold text-sm text-white">{comparingRecord.projectName}</div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-amber-400">{comparingRecord.complianceScore}/100</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                    {comparingRecord.status}
                  </span>
                  {currentAuditResult && (
                    <span className={`text-[10px] font-bold ${
                      currentAuditResult.complianceScore >= comparingRecord.complianceScore ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {currentAuditResult.complianceScore >= comparingRecord.complianceScore ? '+' : ''}
                      {currentAuditResult.complianceScore - comparingRecord.complianceScore} pts difference
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  PII Fields: {comparingRecord.piiInventory?.length || 0} • Tasks: {comparingRecord.remediationTasks?.length || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  onRestoreSnapshot(comparingRecord);
                  setComparingRecord(null);
                  onClose();
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore This Historical Snapshot into Active Workspace</span>
              </button>
            </div>
          </div>
        )}

        {/* Chronological List of Snapshots */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
              <p className="font-semibold text-slate-600">No Historical Audits Found</p>
              <p className="text-[11px]">Run a compliance audit to automatically record durable snapshots to Firestore.</p>
            </div>
          ) : (
            filteredRecords.map((record, index) => {
              // Calculate score diff with next chronological item (older item)
              const previousRecord = filteredRecords[index + 1];
              const scoreDiff = previousRecord ? record.complianceScore - previousRecord.complianceScore : null;

              const isCompliant = record.status === 'COMPLIANT' || record.complianceScore >= 80;
              const isCritical = record.status === 'CRITICAL' || record.complianceScore < 50;
              const isExpanded = expandedRecordId === (record.docId || record.id);

              return (
                <div
                  key={record.docId || record.id}
                  className={`p-3.5 bg-white border rounded-xl shadow-xs transition-all space-y-2.5 ${
                    isExpanded ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">{record.projectName}</h4>
                        {record.detectedDomain && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {record.detectedDomain}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(record.timestamp).toLocaleString()}</span>
                        {record.docId && (
                          <span className="font-mono text-[9px] text-slate-300">ID: {record.docId.slice(0, 8)}...</span>
                        )}
                      </div>
                    </div>

                    {/* Score & Progression */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-sm font-black ${
                            isCompliant ? 'text-emerald-600' : isCritical ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {record.complianceScore}/100
                          </span>

                          {scoreDiff !== null && (
                            <span className={`flex items-center text-[10px] font-bold ${
                              scoreDiff > 0 ? 'text-emerald-600' : scoreDiff < 0 ? 'text-rose-600' : 'text-slate-400'
                            }`}>
                              {scoreDiff > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : scoreDiff < 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
                              {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold uppercase ${
                          isCompliant ? 'text-emerald-700' : isCritical ? 'text-rose-700' : 'text-amber-700'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Framework Tags & Metrics */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 flex-wrap">
                      {(record.activeFrameworks || ['GDPR']).map(fw => (
                        <span key={fw} className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getFrameworkBadgeStyle(fw)}`}>
                          {fw === 'HK_PDPO' ? 'HK PDPO' : fw === 'PCIDSS' ? 'PCI-DSS' : fw}
                        </span>
                      ))}
                    </div>
                    <div className="text-slate-500 font-medium">
                      <span>{record.piiInventory?.length || 0} PII fields</span> • <span>{record.remediationTasks?.length || 0} action tickets</span>
                    </div>
                  </div>

                  {/* Summary Excerpt */}
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {record.executiveSummary}
                  </p>

                  {/* Expanded Inspection Section */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200 space-y-2.5 animate-fade-in">
                      {/* Configuration flags at time of audit */}
                      {record.configurationContext && (
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700">Governance Settings:</span>
                          <span className={record.configurationContext.encryptionAtRest ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                            • Encryption: {record.configurationContext.encryptionAtRest ? 'ON' : 'OFF'}
                          </span>
                          <span className={record.configurationContext.consentMechanism ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                            • Explicit Consent: {record.configurationContext.consentMechanism ? 'ON' : 'OFF'}
                          </span>
                          <span className={record.configurationContext.retentionPolicy ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                            • 90d Retention: {record.configurationContext.retentionPolicy ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      )}

                      {/* Schema snippet preview */}
                      {record.schemaText && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Architecture Specification Preview:</div>
                          <pre className="p-2 bg-slate-900 text-slate-200 rounded-lg text-[10px] font-mono max-h-32 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                            {record.schemaText}
                          </pre>
                        </div>
                      )}

                      {/* Key Violations preview */}
                      {record.remediationTasks && record.remediationTasks.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Top Remediation Actions:</div>
                          <div className="space-y-1">
                            {record.remediationTasks.slice(0, 3).map((task) => (
                              <div key={task.id} className="p-1.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`px-1 rounded text-[9px] font-bold ${
                                    task.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                                    task.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {task.severity}
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate">{task.title}</span>
                                </div>
                                <span className="font-mono text-[9px] text-slate-500 shrink-0 ml-2">{task.citedStatute}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => setExpandedRecordId(isExpanded ? null : (record.docId || record.id))}
                      className="text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Inspect Snapshot</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {currentAuditResult && (
                        <button
                          onClick={() => setComparingRecord(record)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Compare this snapshot with your currently active workspace"
                        >
                          <Columns className="w-3.5 h-3.5 text-slate-600" />
                          <span>Compare</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDelete(e, record)}
                        disabled={deletingId === (record.docId || record.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onRestoreSnapshot(record);
                          onClose();
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Snapshot</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};


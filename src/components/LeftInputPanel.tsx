import React, { useState } from 'react';
import { Play, Sparkles, Database, Lock, CheckSquare, Clock, RefreshCw, FileText, History, RotateCcw, ChevronRight } from 'lucide-react';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';
import { StoredAuditRecord } from '../services/auditHistoryService';

interface LeftInputPanelProps {
  projectName: string;
  setProjectName: (val: string) => void;
  schemaText: string;
  setSchemaText: (val: string) => void;
  encryptionAtRest: boolean;
  setEncryptionAtRest: (val: boolean) => void;
  consentMechanism: boolean;
  setConsentMechanism: (val: boolean) => void;
  retentionPolicy: boolean;
  setRetentionPolicy: (val: boolean) => void;
  isLoading: boolean;
  onRunAudit: () => void;
  onSelectSample: (sampleId: string) => void;
  activeSampleId: string | null;
  historyRecords?: StoredAuditRecord[];
  onRestoreSnapshot?: (record: StoredAuditRecord) => void;
  onOpenHistoryDrawer?: () => void;
}

export const LeftInputPanel: React.FC<LeftInputPanelProps> = ({
  projectName,
  setProjectName,
  schemaText,
  setSchemaText,
  encryptionAtRest,
  setEncryptionAtRest,
  consentMechanism,
  setConsentMechanism,
  retentionPolicy,
  setRetentionPolicy,
  isLoading,
  onRunAudit,
  onSelectSample,
  activeSampleId,
  historyRecords = [],
  onRestoreSnapshot,
  onOpenHistoryDrawer
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'history'>('presets');
  const lineCount = schemaText ? schemaText.split('\n').length : 1;

  return (
    <div id="panel-audit-input" className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* Panel Header */}
      <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" />
          <span>Project Audit Input</span>
        </h2>

        <button
          id="btn-clear-input"
          onClick={() => {
            setProjectName('');
            setSchemaText('');
            setEncryptionAtRest(false);
            setConsentMechanism(false);
            setRetentionPolicy(false);
          }}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 hover:bg-slate-50 px-2 py-1 rounded"
          title="Clear inputs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Form Body */}
      <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
        
        {/* Quick Sample Presets / Saved Working History Tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'presets'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Presets</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'history'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <History className="w-3 h-3 text-indigo-600" />
                <span>History ({historyRecords.length})</span>
              </button>
            </div>

            {activeTab === 'history' && onOpenHistoryDrawer && historyRecords.length > 0 && (
              <button
                type="button"
                onClick={onOpenHistoryDrawer}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
              >
                <span>View All & Compare</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {activeTab === 'presets' ? (
            <div className="grid grid-cols-2 gap-1.5 animate-fade-in">
              {SAMPLE_PROJECTS.map((sample) => (
                <button
                  key={sample.id}
                  id={`btn-sample-${sample.id}`}
                  onClick={() => onSelectSample(sample.id)}
                  type="button"
                  className={`text-left px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    activeSampleId === sample.id
                      ? 'bg-blue-50 border-blue-200 text-blue-800 ring-1 ring-blue-400 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="truncate text-[11px] font-semibold">{sample.name.split('-')[0].trim()}</div>
                  <div className="text-[10px] text-slate-400 truncate flex items-center justify-between mt-0.5">
                    <span>{sample.industry}</span>
                    <span className="font-mono text-[9px] text-blue-600 font-semibold">
                      {sample.frameworks.map(f => f === 'HK_PDPO' ? 'PDPO' : f === 'PCIDSS' ? 'PCI' : f).join('+')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5 animate-fade-in">
              {historyRecords.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center text-[11px] text-slate-500">
                  No saved history yet. Run an audit to record snapshots.
                </div>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                  {historyRecords.slice(0, 4).map((rec) => (
                    <div
                      key={rec.docId || rec.id}
                      className="p-2 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-lg flex items-center justify-between gap-2 transition-all text-xs"
                    >
                      <div className="truncate flex-1">
                        <div className="font-semibold text-slate-800 truncate text-[11px]">{rec.projectName}</div>
                        <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`font-bold ${
                            rec.complianceScore >= 80 ? 'text-emerald-600' : rec.complianceScore < 50 ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {rec.complianceScore}/100
                          </span>
                        </div>
                      </div>
                      {onRestoreSnapshot && (
                        <button
                          type="button"
                          onClick={() => onRestoreSnapshot(rec)}
                          className="px-2 py-1 bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                          title="Restore this working history snapshot"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Load</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Project Name Field */}
        <div>
          <label htmlFor="input-project-name" className="block text-xs font-semibold text-slate-500 mb-1">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-project-name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Aura-Cloud-Infrastructure-v2"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white placeholder-slate-400 transition-all"
          />
        </div>

        {/* Architecture & Database Schema Large Text Area */}
        <div className="flex-1 flex flex-col min-h-[200px]">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="textarea-schema" className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span>Architecture Specs & API Endpoints</span> <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {lineCount} lines ({schemaText.length} chars)
            </span>
          </div>
          
          <textarea
            id="textarea-schema"
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            placeholder={`POST /v1/auth/signup - Requires Consent Table
GET /v3/user/profile - Contains sensitive PII
AWS S3 Bucket: eu-central-1 (Germany)
Encryption: AES-256`}
            rows={8}
            className="w-full flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-y custom-scrollbar leading-relaxed"
          />
        </div>

        {/* Compliance Configuration Checkboxes */}
        <div className="space-y-2 pt-1">
          {/* 1. Encryption at Rest */}
          <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
            <input
              id="checkbox-encryption-at-rest"
              type="checkbox"
              checked={encryptionAtRest}
              onChange={(e) => setEncryptionAtRest(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div className="flex-1 text-xs">
              <span className="text-slate-700 font-medium">Encryption at Rest Configured</span>
              <p className="text-[10px] text-slate-400">Databases & S3 buckets enforce AES-256/KMS (Art. 32)</p>
            </div>
          </label>

          {/* 2. Consent Mechanism */}
          <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
            <input
              id="checkbox-consent-mechanism"
              type="checkbox"
              checked={consentMechanism}
              onChange={(e) => setConsentMechanism(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div className="flex-1 text-xs">
              <span className="text-slate-700 font-medium">Consent Mechanism Present</span>
              <p className="text-[10px] text-slate-400">Granular opt-in logs prior to processing (Art. 7)</p>
            </div>
          </label>

          {/* 3. Data Retention Policy */}
          <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer transition-colors">
            <input
              id="checkbox-retention-policy"
              type="checkbox"
              checked={retentionPolicy}
              onChange={(e) => setRetentionPolicy(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div className="flex-1 text-xs">
              <span className="text-slate-700 font-medium">Data Retention Policy Exists</span>
              <p className="text-[10px] text-slate-400">Scheduled TTL deletion workflows active (Art. 5(1)(e))</p>
            </div>
          </label>
        </div>

      </div>

      {/* Panel Footer / Execution CTA */}
      <div className="pt-3 mt-2 border-t border-slate-100">
        <button
          id="btn-run-gdpr-audit"
          type="button"
          onClick={onRunAudit}
          disabled={isLoading || !schemaText.trim()}
          className={`w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2 ${
            isLoading || !schemaText.trim()
              ? 'opacity-60 cursor-not-allowed'
              : 'active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Auditing Multi-Standard Compliance...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Multi-Standard Audit</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};


import React from 'react';
import { ShieldCheck, BookOpen, Scale, FileText, Sparkles, Cpu, History } from 'lucide-react';

interface HeaderProps {
  onOpenClauseLookup: () => void;
  onOpenReportModal?: () => void;
  onOpenHistoryDrawer: () => void;
  historyCount: number;
  hasAuditResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenClauseLookup,
  onOpenReportModal,
  onOpenHistoryDrawer,
  historyCount,
  hasAuditResult
}) => {
  return (
    <header id="guardianai-header" className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                GuardianAI
                <span className="text-blue-600 font-medium text-xs ml-2 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full inline-block">
                  Compliance Agent
                </span>
              </h1>

              {/* Hybrid Engine Badge */}
              <div 
                id="badge-hybrid-pipeline"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 text-indigo-900 border border-indigo-200 shadow-xs"
                title="Input payload is pre-processed by Gemma 4 for PII scrubbing before multi-framework audit execution by Gemini 3.7 Flash"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">Hybrid Engine Active:</span>
                <span className="text-slate-700">Gemma 4 (PII Scrubbing) + Gemini 3.7 Flash (Compliance Audit Engine)</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Multi-Standard Statutory Compliance Engine (GDPR • PCI-DSS • HIPAA • ISO 27001 • SOC 2 • HK PDPO)</span>
            </p>
          </div>
        </div>

        {/* Status and Action Bar */}
        <div className="flex items-center gap-2.5">
          
          <button
            id="btn-audit-history"
            onClick={onOpenHistoryDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all shadow-sm active:scale-95 relative"
            title="View persistent Firestore audit history and load past snapshots"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audit History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            id="btn-clause-database"
            onClick={onOpenClauseLookup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all shadow-sm active:scale-95"
            title="Browse multi-standard statutory articles and legal citations"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Statutory Library</span>
          </button>

          {hasAuditResult && onOpenReportModal && (
            <button
              id="btn-export-full-report"
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          )}

          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-300 ml-1">
            GA
          </div>

        </div>

      </div>
    </header>
  );
};


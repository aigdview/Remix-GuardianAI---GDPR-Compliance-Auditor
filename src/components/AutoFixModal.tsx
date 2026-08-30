import React, { useState } from 'react';
import { 
  X, 
  GitPullRequest, 
  GitBranch, 
  GitCommit, 
  Check, 
  Copy, 
  Download, 
  Zap, 
  FileCode, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Columns,
  FileText,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { AutoFixPRResult, AutoFixFileDiff } from '../types';

interface AutoFixModalProps {
  prResult: AutoFixPRResult | null;
  currentScore?: number;
  onClose: () => void;
  onApplyFixToSchema: (patchedSchema: string, configChanges?: AutoFixPRResult['recommendedConfigChanges'], taskId?: string) => void;
}

export const AutoFixModal: React.FC<AutoFixModalProps> = ({
  prResult,
  currentScore = 45,
  onClose,
  onApplyFixToSchema
}) => {
  const [activeTab, setActiveTab] = useState<'diff' | 'unified' | 'pr_body'>('diff');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!prResult) return null;

  const currentFile: AutoFixFileDiff | undefined = prResult.filesChanged[selectedFileIndex] || prResult.filesChanged[0];

  const handleCopy = (text: string, typeKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(typeKey);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadPatch = () => {
    let patchContent = `# Pull Request: ${prResult.prTitle}\n`;
    patchContent += `# Branch: ${prResult.branchName} -> ${prResult.targetBranch}\n`;
    patchContent += `# Commit: ${prResult.commitMessage}\n\n`;
    
    prResult.filesChanged.forEach(f => {
      patchContent += `${f.unifiedDiff}\n\n`;
    });

    const blob = new Blob([patchContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prResult.branchName.replace(/\//g, '-')}.patch`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to split lines for side-by-side view
  const origLines = (currentFile?.originalCode || '').split('\n');
  const patchLines = (currentFile?.patchedCode || '').split('\n');
  const maxLines = Math.max(origLines.length, patchLines.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Auto-Fix PR Generator</span>
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-500 flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-slate-400" />
                  <code className="text-slate-700 font-semibold">{prResult.branchName}</code>
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-slate-900 mt-1 leading-snug">
                {prResult.prTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Projected Score Improvement Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Projected Score</span>
                <span className="text-xs font-extrabold text-emerald-700">
                  {currentScore} → {prResult.projectedScore}/100 (+{prResult.scoreGain}%)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action / View Mode Selector Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          {/* File Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              <span>Files:</span>
            </span>
            {prResult.filesChanged.map((file, idx) => (
              <button
                key={file.fileName}
                onClick={() => setSelectedFileIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedFileIndex === idx
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  file.changeType === 'CREATED' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <span>{file.fileName.split('/').pop()}</span>
              </button>
            ))}
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'diff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side Diff</span>
            </button>
            <button
              onClick={() => setActiveTab('unified')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'unified' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Unified Patch</span>
            </button>
            <button
              onClick={() => setActiveTab('pr_body')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeTab === 'pr_body' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PR Markdown</span>
            </button>
          </div>

        </div>

        {/* Content Viewer */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
          
          {/* TAB 1: Side-by-Side Code Diff */}
          {activeTab === 'diff' && currentFile && (
            <div className="flex flex-col gap-2">
              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">{currentFile.fileName}</span>
                <span>{currentFile.description}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                
                {/* Left: Original Vulnerable Code */}
                <div className="bg-slate-900/90 border border-red-900/40 rounded-xl overflow-hidden">
                  <div className="px-3 py-1.5 bg-red-950/40 border-b border-red-900/40 text-red-300 font-semibold text-[10px] flex items-center justify-between">
                    <span>BEFORE (Vulnerable / Non-Compliant)</span>
                    <span className="text-red-400 uppercase">{currentFile.changeType}</span>
                  </div>
                  <pre className="p-3 text-red-200/90 overflow-x-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
                    {currentFile.originalCode || '// No prior file content (New File Created)'}
                  </pre>
                </div>

                {/* Right: Remediated Compliant Code */}
                <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl overflow-hidden">
                  <div className="px-3 py-1.5 bg-emerald-950/40 border-b border-emerald-900/40 text-emerald-300 font-semibold text-[10px] flex items-center justify-between">
                    <span>AFTER (Remediated & Compliant)</span>
                    <span className="text-emerald-400 uppercase">PATCH APPLIED</span>
                  </div>
                  <pre className="p-3 text-emerald-300 overflow-x-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
                    {currentFile.patchedCode}
                  </pre>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Unified Git Diff (.patch format) */}
          {activeTab === 'unified' && currentFile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-1 border-b border-slate-800">
                <span>Git Unified Diff Format (<code className="text-blue-400">git apply</code> compatible)</span>
                <button
                  onClick={() => handleCopy(currentFile.unifiedDiff, 'unified')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'unified' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'unified' ? 'Copied Diff!' : 'Copy Diff'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono leading-relaxed overflow-x-auto custom-scrollbar">
                {currentFile.unifiedDiff.split('\n').map((line, idx) => {
                  let lineClass = 'text-slate-300';
                  if (line.startsWith('+')) lineClass = 'text-emerald-400 bg-emerald-950/30';
                  else if (line.startsWith('-')) lineClass = 'text-rose-400 bg-rose-950/30';
                  else if (line.startsWith('@')) lineClass = 'text-cyan-400 font-bold';
                  return (
                    <div key={idx} className={`${lineClass} px-1 rounded-xs`}>
                      {line || ' '}
                    </div>
                  );
                })}
              </pre>
            </div>
          )}

          {/* TAB 3: Pull Request Description */}
          {activeTab === 'pr_body' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                <span>GitHub / GitLab Pull Request Template Markdown</span>
                <button
                  onClick={() => handleCopy(prResult.prDescription, 'pr_desc')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'pr_desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'pr_desc' ? 'Copied PR Markdown!' : 'Copy Markdown'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto custom-scrollbar select-all whitespace-pre-wrap">
                {prResult.prDescription}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Quick Copy Git CLI Command */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleCopy(`git checkout -b ${prResult.branchName} && git commit -am "${prResult.commitMessage}"`, 'git_cli')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
              title="Copy Git checkout and commit command"
            >
              {copiedType === 'git_cli' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Terminal className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedType === 'git_cli' ? 'Copied CLI Command!' : 'Copy Git CLI Cmd'}</span>
            </button>

            <button
              onClick={handleDownloadPatch}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download .patch</span>
            </button>
          </div>

          {/* Primary Action Button: Apply Fix to Schema */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onApplyFixToSchema(prResult.fullPatchedSchema, prResult.recommendedConfigChanges, prResult.taskId);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Apply Fix to Schema & Re-Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

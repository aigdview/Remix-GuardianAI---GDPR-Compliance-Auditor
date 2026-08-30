import React, { useState } from 'react';
import { X, Copy, Check, FileCode, CheckSquare, Sparkles } from 'lucide-react';
import { RemediationTask } from '../types';

interface TaskExportModalProps {
  task: RemediationTask | null;
  onClose: () => void;
}

export const TaskExportModal: React.FC<TaskExportModalProps> = ({ task, onClose }) => {
  const [format, setFormat] = useState<'jira' | 'markdown' | 'github' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!task) return null;

  const citation = task.citedStatute || task.article;
  const fwName = task.framework === 'HK_PDPO' ? 'HK PDPO' : task.framework === 'PCIDSS' ? 'PCI-DSS' : task.framework || 'GDPR';

  const getFormattedContent = () => {
    switch (format) {
      case 'jira':
        return `h2. [${task.severity}] [${fwName}] ${task.title}
*Framework:* ${fwName}
*Regulatory Citation:* ${citation}
*Category:* ${task.category}
*Suggested Effort:* ${task.suggestedEffort}
*Affected Schema Fields:* ${task.affectedFields.join(', ')}

h3. Regulatory Risk & Problem Description
${task.description}

h3. Engineering Action Items
${task.actionItems.map(item => `* [${item.completed ? 'X' : ' '}] ${item.text}`).join('\n')}

${task.codeExample ? `h3. Suggested Technical Implementation
{code:javascript}
${task.codeExample}
{code}` : ''}
`;

      case 'github':
        return `## [${task.severity}] [${fwName}] ${task.title}

> **Compliance Framework:** \`${fwName}\`  
> **Regulatory Citation:** \`${citation}\`  
> **Category:** ${task.category}  
> **Suggested Effort:** ${task.suggestedEffort}  
> **Affected Fields:** ${task.affectedFields.map(f => `\`${f}\``).join(', ')}

### Description
${task.description}

### Action Items Checklist
${task.actionItems.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n')}

${task.codeExample ? `### Suggested Code / Schema Fix
\`\`\`typescript
${task.codeExample}
\`\`\`` : ''}
`;

      case 'json':
        return JSON.stringify(task, null, 2);

      case 'markdown':
      default:
        return `# [${task.severity}] [${fwName}] ${task.title}

**Framework:** ${fwName}  
**Regulatory Statute:** ${citation}  
**Category:** ${task.category}  
**Affected Fields:** ${task.affectedFields.join(', ')}  
**Effort:** ${task.suggestedEffort}

## Overview
${task.description}

## Remediation Steps
${task.actionItems.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n')}

${task.codeExample ? `## Code Example
\`\`\`typescript
${task.codeExample}
\`\`\`` : ''}
`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Export Remediation Ticket ({task.id})</h3>
              <p className="text-[11px] text-slate-500">Copy formatted task for Jira, Linear, or GitHub Issues</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Format:</span>
            {(['markdown', 'jira', 'github', 'json'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] uppercase font-semibold transition-all ${
                  format === fmt
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Ticket</span>
              </>
            )}
          </button>
        </div>

        {/* Code/Text Preview */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <pre className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 leading-relaxed overflow-x-auto custom-scrollbar select-all">
            {getFormattedContent()}
          </pre>
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

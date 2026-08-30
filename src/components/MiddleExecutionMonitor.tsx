import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Cpu, 
  FileCode, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Check, 
  Copy,
  Code2,
  Filter
} from 'lucide-react';
import { ToolCallExecution } from '../types';

interface MiddleExecutionMonitorProps {
  toolExecutions: ToolCallExecution[];
  isLoading: boolean;
  activeStep?: string;
}

export const MiddleExecutionMonitor: React.FC<MiddleExecutionMonitorProps> = ({
  toolExecutions,
  isLoading,
  activeStep
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    toolExecutions.forEach(t => { all[t.id] = true; });
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const handleCopyJson = (id: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredExecutions = toolExecutions.filter(t => {
    if (filterType === 'all') return true;
    return t.toolName === filterType;
  });

  return (
    <div id="panel-execution-monitor" className="bg-slate-900 rounded-xl overflow-hidden shadow-inner flex flex-col h-full border border-slate-800">
      
      {/* Dark Terminal Header */}
      <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center select-none">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 animate-pulse rounded-full"></span>
          Execution Monitor
        </h2>
        <span className="text-[10px] font-mono text-slate-400 uppercase">
          System Loop ID: #AUD-0422
        </span>
      </div>

      {/* Filter / Control Bar */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-[10px] uppercase font-bold text-slate-500">Filter:</span>
          
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            ALL ({toolExecutions.length})
          </button>
          
          <button
            onClick={() => setFilterType('scan_data_schema')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              filterType === 'scan_data_schema'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800'
            }`}
          >
            scan_schema ({toolExecutions.filter(t => t.toolName === 'scan_data_schema').length})
          </button>

          <button
            onClick={() => setFilterType('search_gdpr_clauses')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              filterType === 'search_gdpr_clauses'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800'
            }`}
          >
            search_clauses ({toolExecutions.filter(t => t.toolName === 'search_gdpr_clauses').length})
          </button>

          <button
            onClick={() => setFilterType('generate_remediation_task')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              filterType === 'generate_remediation_task'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800'
            }`}
          >
            remediation ({toolExecutions.filter(t => t.toolName === 'generate_remediation_task').length})
          </button>
        </div>

        {toolExecutions.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <button onClick={expandAll} className="hover:text-slate-200">Expand</button>
            <span>/</span>
            <button onClick={collapseAll} className="hover:text-slate-200">Collapse</button>
          </div>
        )}
      </div>

      {/* Tool Execution Logs Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono custom-scrollbar">
        
        {toolExecutions.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg">
            <Terminal className="w-8 h-8 text-slate-600 mb-2" />
            <h3 className="text-xs font-semibold text-slate-400">Execution Monitor Idle</h3>
            <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
              Click "Run GDPR Audit" to stream autonomous tool executions.
            </p>
          </div>
        )}

        {isLoading && toolExecutions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin"></div>
            <div className="text-xs font-semibold text-slate-300">Invoking Autonomous Agent Loop...</div>
            <p className="text-[11px] text-slate-500">Connecting to GDPR Article Database & Schema Auditor</p>
          </div>
        )}

        {filteredExecutions.map((tool, index) => {
          const isExpanded = expandedIds[tool.id] ?? (index === 0 || tool.status === 'violation_detected');
          const isViolation = tool.status === 'violation_detected';
          const isTaskGen = tool.toolName === 'generate_remediation_task';

          return (
            <div
              key={tool.id}
              id={`tool-card-${tool.id}`}
              className={`bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-xs transition-all ${
                isViolation
                  ? 'border-l-4 border-l-red-500'
                  : isTaskGen
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-blue-500'
              }`}
            >
              {/* Card Header */}
              <div 
                onClick={() => toggleExpand(tool.id)}
                className="flex items-center justify-between cursor-pointer select-none mb-1.5"
              >
                <div className="flex items-center gap-2">
                  <button type="button" className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-blue-400 font-bold tracking-tight">
                    INVOKING: {tool.toolName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {tool.status === 'violation_detected' ? (
                    <span className="text-red-400 font-bold">[RISK FLAGGED]</span>
                  ) : tool.status === 'completed' ? (
                    <span className="text-emerald-400 font-bold">[SUCCESS]</span>
                  ) : (
                    <span className="text-amber-400 font-bold">[PROCESSING]</span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyJson(tool.id, { input: tool.inputArguments, output: tool.outputResult });
                    }}
                    className="text-slate-500 hover:text-slate-300 p-0.5"
                    title="Copy payload"
                  >
                    {copiedId === tool.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Arguments Snippet */}
              <div className="text-slate-400 text-[11px] leading-relaxed break-all">
                <span className="text-slate-500 font-semibold">args: </span>
                {JSON.stringify(tool.inputArguments)}
              </div>

              {/* Summary / Result Text */}
              <div className="text-slate-300 text-[11px] mt-1.5">
                <span className="text-slate-500">Output: </span>
                {tool.summary}
              </div>

              {/* Expanded JSON Inspector */}
              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/80 space-y-2 text-[10px]">
                  <div>
                    <div className="text-slate-500 font-bold uppercase mb-0.5">Parameters:</div>
                    <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-blue-300 overflow-x-auto custom-scrollbar">
                      {JSON.stringify(tool.inputArguments, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="text-slate-500 font-bold uppercase mb-0.5">Return Data:</div>
                    <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-300 overflow-x-auto custom-scrollbar">
                      {JSON.stringify(tool.outputResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* Monitor Footer */}
      {toolExecutions.length > 0 && (
        <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>Total Invocations: {toolExecutions.length}</span>
          <span className="text-emerald-400">Agent Verified</span>
        </div>
      )}

    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { LeftInputPanel } from './components/LeftInputPanel';
import { MiddleExecutionMonitor } from './components/MiddleExecutionMonitor';
import { RightResultsDashboard } from './components/RightResultsDashboard';
import { TaskExportModal } from './components/TaskExportModal';
import { ClauseLookupModal } from './components/ClauseLookupModal';
import { ReportModal } from './components/ReportModal';
import { AuditHistoryDrawer } from './components/AuditHistoryDrawer';
import { AutoFixModal } from './components/AutoFixModal';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { AuditResult, RemediationTask, ToolCallExecution, AutoFixPRResult } from './types';
import { evaluateClientFallbackAudit } from './utils/auditFallback';
import { generateAutoFixForTask, generateFullAuditAutoFixPR } from './utils/autoFixGenerator';
import { 
  saveAuditSnapshot, 
  fetchAuditHistory, 
  StoredAuditRecord 
} from './services/auditHistoryService';

export default function App() {
  // Input states
  const [projectName, setProjectName] = useState<string>('ApexCart - Global E-Commerce & Checkout Engine');
  const [schemaText, setSchemaText] = useState<string>(SAMPLE_PROJECTS[0].content);
  const [encryptionAtRest, setEncryptionAtRest] = useState<boolean>(false);
  const [consentMechanism, setConsentMechanism] = useState<boolean>(false);
  const [retentionPolicy, setRetentionPolicy] = useState<boolean>(false);
  const [activeSampleId, setActiveSampleId] = useState<string | null>('ecommerce-platform');

  // Execution & Audit Results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toolExecutions, setToolExecutions] = useState<ToolCallExecution[]>([]);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Audit History State
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [historyRecords, setHistoryRecords] = useState<StoredAuditRecord[]>([]);

  // Active run tracking ID to prevent race conditions during async animations (Issue 2)
  const currentRunIdRef = useRef<number>(0);

  // Modal States
  const [selectedTaskForExport, setSelectedTaskForExport] = useState<RemediationTask | null>(null);
  const [isClauseLookupOpen, setIsClauseLookupOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [activeAutoFixPR, setActiveAutoFixPR] = useState<AutoFixPRResult | null>(null);

  // Load persistent history records from Firestore
  const loadHistory = async () => {
    try {
      const records = await fetchAuditHistory();
      setHistoryRecords(records);
    } catch (err) {
      console.warn('Could not load audit history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle Preset Selection
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_PROJECTS.find(s => s.id === sampleId);
    if (!sample) return;

    setActiveSampleId(sample.id);
    setProjectName(sample.name);
    setSchemaText(sample.content);
    setEncryptionAtRest(sample.defaultConfig.encryptionAtRest);
    setConsentMechanism(sample.defaultConfig.consentMechanism);
    setRetentionPolicy(sample.defaultConfig.retentionPolicy);
  };

  // State for restoring / undoing history snapshots
  const previousStateRef = React.useRef<{
    projectName: string;
    schemaText: string;
    encryptionAtRest: boolean;
    consentMechanism: boolean;
    retentionPolicy: boolean;
    auditResult: AuditResult | null;
    toolExecutions: any[];
  } | null>(null);

  // Restore snapshot from historical run
  const handleRestoreSnapshot = (record: StoredAuditRecord) => {
    // Save current working workspace for 1-click Undo
    previousStateRef.current = {
      projectName,
      schemaText,
      encryptionAtRest,
      consentMechanism,
      retentionPolicy,
      auditResult,
      toolExecutions
    };

    setProjectName(record.projectName);
    if (record.schemaText) {
      setSchemaText(record.schemaText);
    }
    if (record.configurationContext) {
      setEncryptionAtRest(record.configurationContext.encryptionAtRest ?? false);
      setConsentMechanism(record.configurationContext.consentMechanism ?? false);
      setRetentionPolicy(record.configurationContext.retentionPolicy ?? false);
    }
    setToolExecutions(record.toolExecutions || []);
    setAuditResult(record);
    setActiveSampleId(null);
    setNotification(`Restored audit snapshot: "${record.projectName}" (${new Date(record.timestamp).toLocaleDateString()}) - Score: ${record.complianceScore}/100`);
    setTimeout(() => setNotification(null), 6000);
  };

  const handleUndoRestore = () => {
    if (previousStateRef.current) {
      const prev = previousStateRef.current;
      setProjectName(prev.projectName);
      setSchemaText(prev.schemaText);
      setEncryptionAtRest(prev.encryptionAtRest);
      setConsentMechanism(prev.consentMechanism);
      setRetentionPolicy(prev.retentionPolicy);
      setAuditResult(prev.auditResult);
      setToolExecutions(prev.toolExecutions);
      previousStateRef.current = null;
      setNotification('Restoration undone. Reverted to previous workspace.');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Run GDPR Audit Agent Loop
  const handleRunAudit = async (
    customSchema?: string,
    customEnc?: boolean,
    customConsent?: boolean,
    customRet?: boolean
  ) => {
    const textToScan = customSchema !== undefined ? customSchema : schemaText;
    const encToUse = customEnc !== undefined ? customEnc : encryptionAtRest;
    const consentToUse = customConsent !== undefined ? customConsent : consentMechanism;
    const retToUse = customRet !== undefined ? customRet : retentionPolicy;

    if (!textToScan.trim()) return;

    // Increment run ID so previous async reveal animations are safely cancelled (Issue 2)
    const runId = ++currentRunIdRef.current;

    setIsLoading(true);
    setToolExecutions([]);
    setAuditResult(null);
    setNotification(null);

    let result: AuditResult;

    try {
      // Attempt backend agent endpoint
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectName || 'Untitled Architecture',
          schemaText: textToScan,
          encryptionAtRest: encToUse,
          consentMechanism: consentToUse,
          retentionPolicy: retToUse
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      result = await response.json();
    } catch (err: any) {
      console.warn('Backend unavailable or initializing; using deterministic client-side evaluation engine:', err);
      result = evaluateClientFallbackAudit(
        projectName || 'Untitled Architecture',
        textToScan,
        encToUse,
        consentToUse,
        retToUse
      );
    }

    // Check if this run is still the active one before streaming animation
    if (runId !== currentRunIdRef.current) return;

    // Progressive reveal animation for tool calls guarded by run ID
    if (result.toolExecutions && result.toolExecutions.length > 0) {
      for (let i = 0; i < result.toolExecutions.length; i++) {
        if (runId !== currentRunIdRef.current) return;
        await new Promise(r => setTimeout(r, 90));
        if (runId !== currentRunIdRef.current) return;
        setToolExecutions(prev => [...prev, result.toolExecutions[i]]);
      }
    }

    if (runId === currentRunIdRef.current) {
      setAuditResult(result);
      setIsLoading(false);

      // Persist snapshot to Firestore asynchronously
      saveAuditSnapshot(result, textToScan)
        .then(() => loadHistory())
        .catch(e => console.warn('Snapshot auto-save error:', e));
    }
  };

  // Trigger One-Click Auto-Fix & PR Generator
  const handleOpenAutoFix = async (task?: RemediationTask) => {
    if (!auditResult) return;

    // If a specific task is clicked
    if (task) {
      try {
        const res = await fetch('/api/generate-fix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task,
            schemaText,
            projectName,
            currentScore: auditResult.complianceScore
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && !data.fallback && data.filesChanged) {
            setActiveAutoFixPR(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend PR generator unavailable, using client engine:', err);
      }

      // Fast deterministic generator fallback
      const generatedPR = generateAutoFixForTask(
        task,
        schemaText,
        projectName,
        auditResult.complianceScore
      );
      setActiveAutoFixPR(generatedPR);
    } else {
      // Master auto-remediate all violations into a single enterprise PR
      const masterPR = generateFullAuditAutoFixPR(auditResult, schemaText);
      setActiveAutoFixPR(masterPR);
    }
  };

  // Apply Auto-Fix directly to the live schema and trigger an immediate re-audit
  const handleApplyAutoFix = (
    patchedSchema: string,
    configChanges?: AutoFixPRResult['recommendedConfigChanges'],
    fixedTaskId?: string
  ) => {
    setSchemaText(patchedSchema);

    let newEnc = encryptionAtRest;
    let newConsent = consentMechanism;
    let newRet = retentionPolicy;

    if (configChanges) {
      if (configChanges.encryptionAtRest !== undefined) {
        newEnc = configChanges.encryptionAtRest;
        setEncryptionAtRest(configChanges.encryptionAtRest);
      }
      if (configChanges.consentMechanism !== undefined) {
        newConsent = configChanges.consentMechanism;
        setConsentMechanism(configChanges.consentMechanism);
      }
      if (configChanges.retentionPolicy !== undefined) {
        newRet = configChanges.retentionPolicy;
        setRetentionPolicy(configChanges.retentionPolicy);
      }
    }

    setNotification(`⚡ Applied Compliance Auto-Fix PR! Re-evaluating architecture...`);
    setTimeout(() => setNotification(null), 5000);

    // Trigger immediate audit with patched parameters
    handleRunAudit(patchedSchema, newEnc, newConsent, newRet);
  };

  // Automatically execute the initial preset audit on first load
  useEffect(() => {
    handleRunAudit();
  }, []);

  // Toggle remediation action item completion and dynamically recalculate resolved compliance progress
  const handleToggleActionItem = (taskId: string, actionId: string) => {
    if (!auditResult) return;

    setAuditResult(prev => {
      if (!prev) return null;

      const updatedTasks = prev.remediationTasks.map(task => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          actionItems: task.actionItems.map(item => {
            if (item.id !== actionId) return item;
            return { ...item, completed: !item.completed };
          })
        };
      });

      // Calculate total action items and completed count
      let totalItems = 0;
      let completedItems = 0;
      updatedTasks.forEach(t => {
        t.actionItems.forEach(item => {
          totalItems++;
          if (item.completed) completedItems++;
        });
      });

      // Dynamic score projection: as items are completed, score improves toward 100
      const baseScore = prev.complianceScore;
      const progressFraction = totalItems > 0 ? completedItems / totalItems : 0;
      const potentialGain = 100 - baseScore;
      const dynamicScore = Math.min(100, Math.round(baseScore + potentialGain * progressFraction));

      let dynamicStatus = prev.status;
      if (dynamicScore >= 80) {
        dynamicStatus = 'COMPLIANT';
      } else if (dynamicScore >= 50) {
        dynamicStatus = 'HIGH RISK';
      } else {
        dynamicStatus = 'CRITICAL';
      }

      return {
        ...prev,
        complianceScore: dynamicScore,
        status: dynamicStatus,
        remediationTasks: updatedTasks
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Application Header */}
      <Header
        onOpenClauseLookup={() => setIsClauseLookupOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenHistoryDrawer={() => setIsHistoryDrawerOpen(true)}
        historyCount={historyRecords.length}
        hasAuditResult={!!auditResult}
      />

      {/* Optional Notification Banner with Undo Option */}
      {notification && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-900 flex items-center justify-between animate-fade-in font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>{notification}</span>
          </div>
          <div className="flex items-center gap-3">
            {previousStateRef.current && (
              <button
                onClick={handleUndoRestore}
                className="underline text-blue-700 hover:text-blue-900 font-bold hover:no-underline"
              >
                Undo Restore
              </button>
            )}
            <button onClick={() => setNotification(null)} className="text-blue-600 hover:text-blue-900 font-bold">×</button>
          </div>
        </div>
      )}

      {/* Main 3-Panel Grid Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 overflow-hidden">
        
        {/* 1. Left Panel (Project Audit Input) - Span 4 on Large */}
        <div className="lg:col-span-4 h-[650px] lg:h-[calc(100vh-100px)] min-h-[580px]">
          <LeftInputPanel
            projectName={projectName}
            setProjectName={setProjectName}
            schemaText={schemaText}
            setSchemaText={setSchemaText}
            encryptionAtRest={encryptionAtRest}
            setEncryptionAtRest={setEncryptionAtRest}
            consentMechanism={consentMechanism}
            setConsentMechanism={setConsentMechanism}
            retentionPolicy={retentionPolicy}
            setRetentionPolicy={setRetentionPolicy}
            isLoading={isLoading}
            onRunAudit={() => handleRunAudit()}
            onSelectSample={handleSelectSample}
            activeSampleId={activeSampleId}
            historyRecords={historyRecords}
            onRestoreSnapshot={handleRestoreSnapshot}
            onOpenHistoryDrawer={() => setIsHistoryDrawerOpen(true)}
          />
        </div>

        {/* 2. Middle Panel (Live Tool Calling Execution Monitor) - Span 4 on Large */}
        <div className="lg:col-span-4 h-[650px] lg:h-[calc(100vh-100px)] min-h-[580px]">
          <MiddleExecutionMonitor
            toolExecutions={toolExecutions}
            isLoading={isLoading}
          />
        </div>

        {/* 3. Right Panel (Audit Results Dashboard) - Span 4 on Large */}
        <div className="lg:col-span-4 h-[650px] lg:h-[calc(100vh-100px)] min-h-[580px]">
          <RightResultsDashboard
            auditResult={auditResult}
            isLoading={isLoading}
            onOpenTicketModal={(task) => setSelectedTaskForExport(task)}
            onOpenAutoFixModal={handleOpenAutoFix}
            onToggleActionItem={handleToggleActionItem}
          />
        </div>

      </main>

      {/* Modal Dialogs */}
      {selectedTaskForExport && (
        <TaskExportModal
          task={selectedTaskForExport}
          onClose={() => setSelectedTaskForExport(null)}
        />
      )}

      {/* Auto-Fix Pull Request & Unified Diff Modal */}
      {activeAutoFixPR && (
        <AutoFixModal
          prResult={activeAutoFixPR}
          currentScore={auditResult?.complianceScore || 40}
          onClose={() => setActiveAutoFixPR(null)}
          onApplyFixToSchema={handleApplyAutoFix}
        />
      )}

      {isClauseLookupOpen && (
        <ClauseLookupModal
          onClose={() => setIsClauseLookupOpen(false)}
        />
      )}

      {isReportModalOpen && auditResult && (
        <ReportModal
          auditResult={auditResult}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Persistent Audit History Slide-over Drawer */}
      <AuditHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        historyRecords={historyRecords}
        currentAuditResult={auditResult}
        onRestoreSnapshot={handleRestoreSnapshot}
        onRefreshHistory={loadHistory}
      />

    </div>
  );
}



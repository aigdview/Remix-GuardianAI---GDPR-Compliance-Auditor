import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditResult } from '../types';

export interface StoredAuditRecord extends AuditResult {
  docId: string;
  savedAt: string;
}

const LOCAL_STORAGE_KEY = 'guardian_ai_audit_history';

/**
 * Save an audit snapshot to Firestore with transparent fallback to local state
 */
export async function saveAuditSnapshot(result: AuditResult, schemaText: string): Promise<string> {
  const auditId = result.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const recordToSave = {
    ...result,
    id: auditId,
    schemaText,
    savedAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  };

  // 1. Local caching backup
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingList: StoredAuditRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updatedList = [
      { ...recordToSave, docId: auditId, createdAt: undefined } as StoredAuditRecord,
      ...existingList.filter(item => item.id !== auditId)
    ].slice(0, 50);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.warn('Local storage audit sync failed:', err);
  }

  // 2. Cloud Firestore persistence
  try {
    const auditDocRef = doc(db, 'audits', auditId);
    await setDoc(auditDocRef, recordToSave);
    return auditId;
  } catch (cloudErr) {
    console.warn('Firestore cloud sync error, fallback maintained in local cache:', cloudErr);
    return auditId;
  }
}

/**
 * Retrieve chronological audit history from Firestore
 */
export async function fetchAuditHistory(): Promise<StoredAuditRecord[]> {
  const records: StoredAuditRecord[] = [];

  try {
    const auditsQuery = query(collection(db, 'audits'), orderBy('timestamp', 'desc'), limit(50));
    const snapshot = await getDocs(auditsQuery);
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      records.push({
        ...(data as AuditResult),
        docId: docSnap.id,
        savedAt: data.savedAt || data.timestamp || new Date().toISOString()
      });
    });

    if (records.length > 0) {
      // Sync local cache with latest cloud records
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
      } catch {
        // ignore storage quota
      }
      return records;
    }
  } catch (cloudErr) {
    console.warn('Firestore fetch failed, checking local storage:', cloudErr);
  }

  // Fallback to local storage if offline or cloud unavailable
  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localRaw) {
      return JSON.parse(localRaw) as StoredAuditRecord[];
    }
  } catch {
    // ignore
  }

  return records;
}

/**
 * Delete a specific audit record
 */
export async function deleteAuditRecord(auditId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'audits', auditId));
  } catch (cloudErr) {
    console.warn('Cloud deletion failed:', cloudErr);
  }

  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localRaw) {
      const list: StoredAuditRecord[] = JSON.parse(localRaw);
      const filtered = list.filter(item => item.id !== auditId && item.docId !== auditId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }
}

/**
 * Clear all audit history records from both Firestore and local storage
 */
export async function clearAllAuditHistory(records: StoredAuditRecord[]): Promise<void> {
  try {
    for (const record of records) {
      const id = record.docId || record.id;
      if (id) {
        await deleteDoc(doc(db, 'audits', id)).catch(() => {});
      }
    }
  } catch (cloudErr) {
    console.warn('Batch cloud deletion error:', cloudErr);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Export full audit records as JSON, CSV, or Markdown Audit Ledger
 */
export function exportAuditHistoryArchive(records: StoredAuditRecord[], format: 'json' | 'csv' | 'markdown'): void {
  if (format === 'json') {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `guardian_ai_compliance_archive_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } else if (format === 'markdown') {
    let md = `# GuardianAI Compliance Working History & Audit Ledger\n`;
    md += `*Generated: ${new Date().toLocaleString()} | Total Working Sessions: ${records.length}*\n\n`;
    md += `| Date / Time | Project Name | Domain | Frameworks | Score | Status | Open Action Items |\n`;
    md += `|:---|:---|:---|:---|:---:|:---:|:---:|\n`;
    records.forEach(r => {
      md += `| ${new Date(r.timestamp).toLocaleString()} | **${r.projectName}** | ${r.detectedDomain || 'General'} | ${(r.activeFrameworks || ['GDPR']).join(', ')} | **${r.complianceScore}/100** | \`${r.status}\` | ${r.remediationTasks?.length || 0} |\n`;
    });
    md += `\n## Session Details\n\n`;
    records.forEach((r, idx) => {
      md += `### ${idx + 1}. ${r.projectName} (${new Date(r.timestamp).toLocaleString()})\n`;
      md += `- **Compliance Score**: ${r.complianceScore}/100 (${r.status})\n`;
      md += `- **Detected Domain**: ${r.detectedDomain || 'General SaaS'}\n`;
      md += `- **Active Frameworks**: ${(r.activeFrameworks || []).join(', ')}\n`;
      md += `- **Summary**: ${r.executiveSummary}\n`;
      if (r.remediationTasks && r.remediationTasks.length > 0) {
        md += `- **Key Remediation Actions**:\n`;
        r.remediationTasks.slice(0, 3).forEach(t => {
          md += `  - [${t.severity}] **${t.title}** (${t.citedStatute})\n`;
        });
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guardian_ai_audit_ledger_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    const headers = ['Timestamp', 'Project Name', 'Domain', 'Frameworks', 'Score', 'Status', 'Critical Risks', 'High Risks', 'Remediation Tasks Count'];
    const rows = records.map(r => [
      `"${r.timestamp}"`,
      `"${r.projectName.replace(/"/g, '""')}"`,
      `"${r.detectedDomain || 'General'}"`,
      `"${(r.activeFrameworks || []).join('; ')}"`,
      r.complianceScore,
      `"${r.status}"`,
      r.riskBreakdown?.critical || 0,
      r.riskBreakdown?.high || 0,
      r.remediationTasks?.length || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `guardian_ai_compliance_archive_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Users, 
  Scale, 
  FileSpreadsheet, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Zap,
  Sliders,
  PieChart,
  Percent,
  Download
} from 'lucide-react';
import { AuditResult, RemediationTask, ComplianceFramework } from '../types';

interface FinancialLiabilitySimulatorProps {
  auditResult: AuditResult;
  onOpenAutoFixModal?: (task?: RemediationTask) => void;
}

export const FinancialLiabilitySimulator: React.FC<FinancialLiabilitySimulatorProps> = ({
  auditResult,
  onOpenAutoFixModal
}) => {
  // Configurable Parameters
  const [annualRevenue, setAnnualRevenue] = useState<number>(25_000_000); // $25M default
  const [dataSubjectCount, setDataSubjectCount] = useState<number>(250_000); // 250k records
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'HKD'>('USD');
  const [appliedMitigations, setAppliedMitigations] = useState<Record<string, boolean>>({
    encryption: false,
    consent: false,
    retention: false,
    tokenization: false
  });

  const currencySymbol = useMemo(() => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'HKD': return 'HK$';
      case 'USD':
      default: return '$';
    }
  }, [currency]);

  const currencyRate = useMemo(() => {
    switch (currency) {
      case 'EUR': return 0.92;
      case 'GBP': return 0.79;
      case 'HKD': return 7.82;
      case 'USD':
      default: return 1.0;
    }
  }, [currency]);

  // Detected risks
  const criticalCount = auditResult.riskBreakdown.critical || 0;
  const highCount = auditResult.riskBreakdown.high || 0;
  const activeFrameworks = auditResult.activeFrameworks || ['GDPR'];

  // Statutory Calculations
  const calculations = useMemo(() => {
    // 1. GDPR Art. 83 Statutory Cap (Tier 2: Max of €20M or 4% of Global Turnover)
    const gdprTurnoverCap = annualRevenue * 0.04;
    const gdprStatutoryMax = Math.max(20_000_000, gdprTurnoverCap);
    const hasGDPRCritical = activeFrameworks.includes('GDPR') && (criticalCount > 0 || highCount > 0);
    const gdprEstimatedExposure = hasGDPRCritical 
      ? Math.min(gdprStatutoryMax, (criticalCount * 3_500_000 + highCount * 850_000) * (annualRevenue > 50_000_000 ? 1.5 : 0.8))
      : 0;

    // 2. HIPAA Statutory Exposure (Tier 4 Willful Neglect: $68,928 per record/violation up to $2,067,813 annual cap per violation standard)
    const hasHIPAA = activeFrameworks.includes('HIPAA');
    const hipaaExposure = hasHIPAA 
      ? Math.min(2_067_813 * Math.max(1, criticalCount), dataSubjectCount * 45 * Math.max(1, criticalCount))
      : 0;

    // 3. PCI-DSS 4.0 Card Brand Penalties & Forensic Audit Fees
    const hasPCI = activeFrameworks.includes('PCIDSS');
    const pciMonthlyFines = hasPCI ? (criticalCount > 0 ? 50_000 * 6 : 10_000 * 3) : 0; // 6 months non-compliance
    const pciForensicAuditCost = hasPCI && criticalCount > 0 ? 125_000 : 0;
    const pciExposure = pciMonthlyFines + pciForensicAuditCost;

    // 4. HK PDPO Section 64 Fines
    const hasPDPO = activeFrameworks.includes('HK_PDPO');
    const pdpoExposure = hasPDPO ? (1_000_000 / 7.82) * Math.max(1, criticalCount) : 0;

    // 5. Breach Notification & Forensic Overhead (Ponemon Benchmark: ~$165 / compromised record)
    const notificationCostPerRecord = 8.5; // Direct notification & credit monitoring
    const dataBreachResponseCost = (criticalCount > 0 ? Math.min(dataSubjectCount * notificationCostPerRecord, 3_200_000) : 150_000);

    // Baseline Total Liability (Unmitigated)
    const rawTotalLiability = (gdprEstimatedExposure + hipaaExposure + pciExposure + pdpoExposure + dataBreachResponseCost);

    // Apply Mitigations Discount
    let mitigationMultiplier = 1.0;
    if (appliedMitigations.encryption) mitigationMultiplier -= 0.35; // -35% risk
    if (appliedMitigations.tokenization) mitigationMultiplier -= 0.25; // -25% risk
    if (appliedMitigations.consent) mitigationMultiplier -= 0.20; // -20% risk
    if (appliedMitigations.retention) mitigationMultiplier -= 0.15; // -15% risk

    const activeMitigationDiscount = Math.max(0.05, mitigationMultiplier);
    const mitigatedTotalLiability = Math.round(rawTotalLiability * activeMitigationDiscount);
    const totalPotentialSavings = rawTotalLiability - mitigatedTotalLiability;

    return {
      rawTotalLiability: Math.round(rawTotalLiability * currencyRate),
      mitigatedTotalLiability: Math.round(mitigatedTotalLiability * currencyRate),
      totalPotentialSavings: Math.round(totalPotentialSavings * currencyRate),
      gdprExposure: Math.round(gdprEstimatedExposure * currencyRate),
      hipaaExposure: Math.round(hipaaExposure * currencyRate),
      pciExposure: Math.round(pciExposure * currencyRate),
      pdpoExposure: Math.round(pdpoExposure * currencyRate),
      dataBreachResponseCost: Math.round(dataBreachResponseCost * currencyRate),
      gdprStatutoryMax: Math.round(gdprStatutoryMax * currencyRate),
      savingsPercentage: Math.round((1 - activeMitigationDiscount) * 100)
    };
  }, [annualRevenue, dataSubjectCount, currencyRate, activeFrameworks, criticalCount, highCount, appliedMitigations]);

  const formatMoney = (amount: number) => {
    if (amount >= 1_000_000) {
      return `${currencySymbol}${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 1_000) {
      return `${currencySymbol}${(amount / 1_000).toFixed(0)}k`;
    }
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const toggleMitigation = (key: string) => {
    setAppliedMitigations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleApplyAllMitigations = () => {
    setAppliedMitigations({
      encryption: true,
      consent: true,
      retention: true,
      tokenization: true
    });
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Metric', 'Amount', 'Currency'],
      ['Project Name', auditResult.projectName, ''],
      ['Annual Company Revenue', annualRevenue.toString(), currency],
      ['Affected Data Subject Records', dataSubjectCount.toString(), ''],
      ['Initial Total Financial Risk Exposure', calculations.rawTotalLiability.toString(), currency],
      ['Mitigated Financial Exposure', calculations.mitigatedTotalLiability.toString(), currency],
      ['Projected Net Cost Savings', calculations.totalPotentialSavings.toString(), currency],
      ['GDPR Statutory Risk', calculations.gdprExposure.toString(), currency],
      ['HIPAA ePHI Penalty Risk', calculations.hipaaExposure.toString(), currency],
      ['PCI-DSS Non-Compliance & Audit Fees', calculations.pciExposure.toString(), currency],
      ['HK PDPO Regulatory Exposure', calculations.pdpoExposure.toString(), currency],
      ['Forensic & Breach Notification Overhead', calculations.dataBreachResponseCost.toString(), currency]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guardian_ai_financial_risk_${auditResult.projectName.toLowerCase().replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 text-slate-800 animate-fade-in">
      
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
              <DollarSign className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Statutory Financial Risk & Regulatory Fine Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Estimates maximum statutory penalties across GDPR Art. 83 (up to 4% turnover), HIPAA §164.312, PCI-DSS 4.0 card brand fines, and class-action notification liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Risk Exposure</div>
            <div className="text-lg font-black text-rose-400">
              {formatMoney(calculations.mitigatedTotalLiability)}
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
            title="Export CSV Financial Risk Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Interactive Sliders */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Enterprise Simulation Parameters
            </h4>
          </div>
          
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
            {(['USD', 'EUR', 'GBP', 'HKD'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  currency === curr 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Annual Revenue Slider */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Annual Global Turnover / Revenue:</span>
              </label>
              <span className="font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {formatMoney(annualRevenue * currencyRate)}
              </span>
            </div>
            <input
              type="range"
              min={1_000_000}
              max={250_000_000}
              step={1_000_000}
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{currencySymbol}1M (Startup)</span>
              <span>{currencySymbol}50M (Mid-Market)</span>
              <span>{currencySymbol}250M+ (Enterprise)</span>
            </div>
          </div>

          {/* Affected Data Subjects Count */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Active Customer / Patient Records:</span>
              </label>
              <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {dataSubjectCount.toLocaleString()} Users
              </span>
            </div>
            <input
              type="range"
              min={10_000}
              max={5_000_000}
              step={10_000}
              value={dataSubjectCount}
              onChange={(e) => setDataSubjectCount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10k records</span>
              <span>1M records</span>
              <span>5M+ records</span>
            </div>
          </div>

        </div>
      </div>

      {/* Breakdown Cards by Regulatory Standard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* GDPR Exposure */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>GDPR Art. 83</span>
            <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded font-mono">Max 4%</span>
          </div>
          <div className="text-base font-black text-indigo-900">{formatMoney(calculations.gdprExposure)}</div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Statutory cap: {formatMoney(calculations.gdprStatutoryMax)}
          </p>
        </div>

        {/* HIPAA PHI Exposure */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>HIPAA ePHI</span>
            <span className="px-1.5 py-0.2 bg-teal-50 text-teal-700 rounded font-mono">Tier 4 Cap</span>
          </div>
          <div className="text-base font-black text-teal-900">{formatMoney(calculations.hipaaExposure)}</div>
          <p className="text-[10px] text-slate-500 leading-tight">
            OCR willful neglect tier
          </p>
        </div>

        {/* PCI-DSS Fines */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>PCI-DSS 4.0</span>
            <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded font-mono">Card Brands</span>
          </div>
          <div className="text-base font-black text-amber-900">{formatMoney(calculations.pciExposure)}</div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Monthly fines + PFI forensic fee
          </p>
        </div>

        {/* Breach Notification & Forensics */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Breach Overhead</span>
            <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded font-mono">Operations</span>
          </div>
          <div className="text-base font-black text-rose-900">{formatMoney(calculations.dataBreachResponseCost)}</div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Notice & credit monitoring
          </p>
        </div>

      </div>

      {/* Interactive Auto-Fix Mitigation Savings Simulator */}
      <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white p-4 border border-emerald-200 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-emerald-600 text-white rounded-md">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Remediation Cost Mitigation Simulator
              </h4>
              <p className="text-[11px] text-slate-500">
                Toggle automated patches to see real-time liability reduction and financial ROI.
              </p>
            </div>
          </div>

          <button
            onClick={handleApplyAllMitigations}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Simulate All Fixes (95% Reduction)</span>
          </button>
        </div>

        {/* Mitigation Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          
          <button
            onClick={() => toggleMitigation('encryption')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              appliedMitigations.encryption
                ? 'bg-emerald-100/90 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px]">AES-256 at Rest</span>
              <span className="text-[10px] font-bold text-emerald-700">-35%</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">ISO 27001 / GDPR Art. 32</div>
          </button>

          <button
            onClick={() => toggleMitigation('tokenization')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              appliedMitigations.tokenization
                ? 'bg-emerald-100/90 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px]">Card Tokenization</span>
              <span className="text-[10px] font-bold text-emerald-700">-25%</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">PCI-DSS 4.0 Req 3.2</div>
          </button>

          <button
            onClick={() => toggleMitigation('consent')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              appliedMitigations.consent
                ? 'bg-emerald-100/90 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px]">Explicit Consent Table</span>
              <span className="text-[10px] font-bold text-emerald-700">-20%</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">GDPR Art. 7 / HK PDPO</div>
          </button>

          <button
            onClick={() => toggleMitigation('retention')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              appliedMitigations.retention
                ? 'bg-emerald-100/90 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px]">90-Day Auto-Purge</span>
              <span className="text-[10px] font-bold text-emerald-700">-15%</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">GDPR Art. 5 / Storage Limit</div>
          </button>

        </div>

        {/* Dynamic ROI Result Strip */}
        <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase text-emerald-800">Projected Liability Reduction</div>
            <div className="text-lg font-black text-emerald-700 flex items-center gap-2">
              <span>{formatMoney(calculations.totalPotentialSavings)} Saved</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                {calculations.savingsPercentage}% Risk Reduction
              </span>
            </div>
          </div>

          {onOpenAutoFixModal && (
            <button
              onClick={() => onOpenAutoFixModal()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span>Deploy Auto-Fix PRs Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

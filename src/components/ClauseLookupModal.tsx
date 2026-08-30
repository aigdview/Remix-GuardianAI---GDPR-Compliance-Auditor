import React, { useState } from 'react';
import { X, Search, BookOpen, Scale, AlertTriangle, ShieldCheck, ExternalLink, Globe2 } from 'lucide-react';
import { REGULATORY_DATABASE } from '../data/gdprKnowledge';
import { RegulatoryClauseRef, ComplianceFramework } from '../types';

interface ClauseLookupModalProps {
  onClose: () => void;
}

export const ClauseLookupModal: React.FC<ClauseLookupModalProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allClauses = Object.values(REGULATORY_DATABASE);
  const frameworks: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: 'All Frameworks' },
    { id: 'GDPR', label: 'GDPR (EU)' },
    { id: 'PCIDSS', label: 'PCI-DSS (FinTech)' },
    { id: 'HIPAA', label: 'HIPAA (Healthcare)' },
    { id: 'ISO27001', label: 'ISO 27001 (ISMS)' },
    { id: 'SOC2', label: 'SOC 2 (Trust)' },
    { id: 'HK_PDPO', label: 'HK PDPO (APAC)' },
  ];

  const filteredClauses = allClauses.filter(clause => {
    const matchesFw = selectedFramework === 'ALL' || clause.framework === selectedFramework;
    const matchesCat = selectedCategory === 'all' || clause.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesFw && matchesCat;
    return (
      matchesFw &&
      matchesCat &&
      (clause.article.toLowerCase().includes(q) ||
        clause.title.toLowerCase().includes(q) ||
        clause.summary.toLowerCase().includes(q) ||
        clause.keyObligations.some(o => o.toLowerCase().includes(q)))
    );
  });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                Multi-Standard Statutory Governance Library
              </h3>
              <p className="text-[11px] text-slate-500">Official statutory articles, penalties, and architecture obligations (GDPR, PCI-DSS, HIPAA, ISO 27001, SOC 2, HK PDPO)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Framework & Search Filter */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                onClick={() => setSelectedFramework(fw.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  selectedFramework === fw.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {fw.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by article, clause, standard, or keyword (e.g. 'Article 17', 'PCI DSS 3.4', 'HIPAA 164.312', 'ISO A.8.24', 'DPP 4')..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Clause Cards List */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
          {filteredClauses.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching regulatory articles found for "{searchQuery}".
            </div>
          ) : (
            filteredClauses.map((clause) => (
              <div
                key={clause.article}
                className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-slate-300 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getFrameworkBadgeStyle(clause.framework)}`}>
                        {clause.framework === 'HK_PDPO' ? 'HK PDPO' : clause.framework === 'PCIDSS' ? 'PCI-DSS' : clause.framework}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {clause.article}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">{clause.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 inline-block">{clause.category}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                    {clause.penaltyTier}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {clause.summary}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 italic">
                  "{clause.fullTextExcerpt}"
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Key Engineering & Governance Mandates:</div>
                  <ul className="space-y-1">
                    {clause.keyObligations.map((obl, i) => (
                      <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{obl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Close Library
          </button>
        </div>

      </div>
    </div>
  );
};

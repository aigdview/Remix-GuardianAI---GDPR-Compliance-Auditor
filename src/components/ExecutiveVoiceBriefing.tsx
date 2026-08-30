import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Mic, 
  Radio, 
  Settings2,
  X,
  ShieldAlert,
  Headphones
} from 'lucide-react';
import { AuditResult } from '../types';

interface ExecutiveVoiceBriefingProps {
  auditResult: AuditResult;
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export const ExecutiveVoiceBriefing: React.FC<ExecutiveVoiceBriefingProps> = ({
  auditResult,
  isOpen = true,
  onClose,
  inline = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [copied, setCopied] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(-1);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate tailored executive script
  const scriptSentences = React.useMemo(() => {
    const score = auditResult.complianceScore;
    const domain = auditResult.detectedDomain || 'Cloud Architecture';
    const criticalCount = auditResult.riskBreakdown.critical || 0;
    const highCount = auditResult.riskBreakdown.high || 0;
    const frameworks = (auditResult.activeFrameworks || ['GDPR']).join(', ');
    const topTask = auditResult.remediationTasks[0];

    const sentences: string[] = [
      `Guardian AI executive compliance briefing for ${auditResult.projectName}.`,
      `The automated multi-standard engine evaluated your ${domain} architecture against ${frameworks}.`,
      `Overall compliance health is rated at ${score} out of 100, placing the system in ${auditResult.status} status.`,
      criticalCount > 0 
        ? `We flagged ${criticalCount} critical vulnerabilities and ${highCount} high-risk exposures with immediate regulatory sanction risk.`
        : `No critical structural violations were identified, with ${highCount} moderate areas for optimization.`,
    ];

    if (topTask) {
      sentences.push(
        `Highest priority item is: ${topTask.title}, citing statute ${topTask.citedStatute || topTask.article}.`
      );
    }

    sentences.push(
      `Recommended immediate action: Deploy the automated one-click pull request patches to ensure zero-knowledge data isolation and avoid statutory penalties. End of briefing.`
    );

    return sentences;
  }, [auditResult]);

  const fullScript = scriptSentences.join(' ');

  // Load available browser voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
        setAvailableVoices(voices.length > 0 ? voices : window.speechSynthesis.getVoices());
        
        // Try to pick a natural sounding US English voice
        const preferredIdx = voices.findIndex(v => 
          v.name.includes('Google') || 
          v.name.includes('Samantha') || 
          v.name.includes('Natural') || 
          v.name.includes('David') ||
          v.name.includes('Zira')
        );
        if (preferredIdx !== -1) {
          setSelectedVoiceIdx(preferredIdx);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayBriefing = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser environment.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fullScript);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    if (availableVoices[selectedVoiceIdx]) {
      utterance.voice = availableVoices[selectedVoiceIdx];
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentSentenceIdx(0);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'sentence' || event.charIndex !== undefined) {
        // Approximate current sentence by character index
        let accumulatedChars = 0;
        for (let i = 0; i < scriptSentences.length; i++) {
          accumulatedChars += scriptSentences[i].length + 1;
          if (event.charIndex <= accumulatedChars) {
            setCurrentSentenceIdx(i);
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIdx(-1);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIdx(-1);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseBriefing = () => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStopBriefing = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIdx(-1);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const blob = new Blob([
      `GUARDIAN AI - EXECUTIVE VOICE BRIEFING TRANSCRIPT\n` +
      `Project: ${auditResult.projectName}\n` +
      `Date: ${new Date().toLocaleString()}\n` +
      `Compliance Score: ${auditResult.complianceScore}/100 (${auditResult.status})\n\n` +
      `TRANSCRIPT:\n` + fullScript
    ], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guardian_ai_voice_briefing_${auditResult.projectName.toLowerCase().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!isOpen) return null;

  const content = (
    <div className="space-y-3.5 animate-fade-in">
      
      {/* Visual Audio Waveform & Player Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Executive Voice Briefing (Audio Synthesizer)
                </h4>
                <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded text-[9px] font-mono">
                  CTO / DPO Debrief
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Synthesized 45-second audio risk overview tailored for executive stakeholders
              </p>
            </div>
          </div>

          {!inline && onClose && (
            <button
              onClick={() => {
                handleStopBriefing();
                onClose();
              }}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Animated Waveform Visualization */}
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
          
          {/* Waveform Frequency Bars */}
          <div className="flex items-center gap-1 h-8 flex-1">
            {[40, 75, 55, 90, 30, 85, 60, 100, 45, 70, 35, 95, 50, 80, 65, 40, 85, 60, 90, 45, 70, 30].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying
                    ? 'bg-gradient-to-t from-indigo-500 to-blue-400 animate-pulse'
                    : 'bg-slate-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (height * (1 + (i % 3) * 0.2)) % 100)}%` : '20%',
                  animationDelay: `${i * 60}ms`
                }}
              />
            ))}
          </div>

          {/* Primary Audio Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {!isPlaying && !isPaused ? (
              <button
                onClick={handlePlayBriefing}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Briefing</span>
              </button>
            ) : isPlaying ? (
              <button
                onClick={handlePauseBriefing}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handlePlayBriefing}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            )}

            {(isPlaying || isPaused) && (
              <button
                onClick={handleStopBriefing}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                title="Stop Audio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Speed & Voice Controls Strip */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Speed:</span>
            {[0.9, 1.0, 1.15, 1.25].map(rate => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-1.5 py-0.2 rounded font-mono transition-colors ${
                  speechRate === rate ? 'bg-indigo-600 text-white font-bold' : 'hover:text-slate-200 bg-slate-800'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="hover:text-white flex items-center gap-1 transition-colors"
              title="Copy Script Text"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
            <span>•</span>
            <button
              onClick={handleDownloadTranscript}
              className="hover:text-white flex items-center gap-1 transition-colors"
              title="Download Text Transcript"
            >
              <Download className="w-3 h-3" />
              <span>Transcript</span>
            </button>
          </div>
        </div>

      </div>

      {/* Live Synchronized Transcript Reader */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Synchronized Executive Transcript</span>
          </span>
          {isPlaying && (
            <span className="flex items-center gap-1 text-blue-600 font-semibold animate-pulse">
              <Radio className="w-3 h-3" />
              <span>Speaking...</span>
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans max-h-40 overflow-y-auto custom-scrollbar pr-1">
          {scriptSentences.map((sentence, idx) => (
            <span
              key={idx}
              className={`transition-colors duration-200 rounded px-1 py-0.5 inline ${
                currentSentenceIdx === idx
                  ? 'bg-blue-100 text-blue-900 font-bold border-l-2 border-blue-600'
                  : 'text-slate-600'
              }`}
            >
              {sentence}{' '}
            </span>
          ))}
        </div>
      </div>

    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-4">
        {content}
      </div>
    </div>
  );
};

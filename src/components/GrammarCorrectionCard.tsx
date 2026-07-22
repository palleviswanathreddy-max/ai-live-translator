import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Volume2, HelpCircle, ArrowRight, RefreshCw, Copy, Check } from 'lucide-react';
import { GrammarCorrection, LearningLevel, VoiceSettings } from '../types';
import { analyzeGrammar } from '../services/learningService';
import { speechSpeaker } from '../services/speechSynthesis';

interface GrammarCorrectionCardProps {
  initialText?: string;
  level?: LearningLevel;
  settings?: VoiceSettings;
  onSaveToHistory?: (correction: GrammarCorrection) => void;
}

export const GrammarCorrectionCard: React.FC<GrammarCorrectionCardProps> = ({
  initialText = '',
  level = 'beginner',
  settings,
  onSaveToHistory
}) => {
  const [inputText, setInputText] = useState(initialText || 'He go to market yesterday and buyed milk.');
  const [correction, setCorrection] = useState<GrammarCorrection>(() => analyzeGrammar(inputText, level));
  const [copied, setCopied] = useState(false);

  const handleCheckGrammar = (textToCheck: string = inputText) => {
    const result = analyzeGrammar(textToCheck, level);
    setCorrection(result);
    if (onSaveToHistory) {
      onSaveToHistory(result);
    }
  };

  const handleSpeakCorrected = () => {
    if (!correction.correctedText) return;
    speechSpeaker.speak(correction.correctedText, 'en-US', settings || {
      voiceGender: 'female',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      autoPlay: true,
      noiseReduction: true,
      autoLanguageDetect: true,
      continuousMode: false
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(correction.correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SAMPLE_ERRORS = [
    'He go to office every day.',
    'I am agree with your opinion.',
    'She didn\'t went to college.',
    'Where you are going right now?',
    'Me and my brother visited Hyderabad.'
  ];

  const hasMistakes = correction.highlights.some((h) => h.type === 'error');

  return (
    <div className="p-6 rounded-3xl glass-card border border-brand-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white shadow-md shadow-brand-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-heading font-bold text-white">AI Grammar Doctor</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Level: {level.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400">Instantly fix grammar mistakes with simple beginner explanations.</p>
          </div>
        </div>

        <button
          onClick={() => handleCheckGrammar()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-Check Grammar
        </button>
      </div>

      {/* Input Box & Quick Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Type or Paste English Sentence:</span>
          <span className="text-[11px] text-slate-400">Auto-detects subject-verb, tenses & word order</span>
        </label>
        
        <div className="relative">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              handleCheckGrammar(e.target.value);
            }}
            placeholder="e.g., He go to market yesterday..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-medium transition-all"
          />
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">Try samples:</span>
          {SAMPLE_ERRORS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample);
                handleCheckGrammar(sample);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-cyan-300 font-medium whitespace-nowrap transition-all border border-white/5"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>

      {/* Grammar Analysis Result Card */}
      {inputText.trim() && (
        <div className="space-y-4 pt-2">
          
          {/* Status Indicator Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            hasMistakes 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}>
            {hasMistakes ? <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                {hasMistakes ? 'Grammar Mistakes Detected' : 'Perfect Sentence Structure'}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{correction.explanation}</p>
            </div>
          </div>

          {/* Color-Highlighted Sentence Comparison Box */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-4">
            
            {/* Original Sentence with Red Strike Highlight */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Original Sentence (Mistakes Highlighted in Red):
              </span>
              <p className="text-base text-slate-300 font-medium pl-3 border-l-2 border-rose-500/40">
                {correction.highlights.map((h, i) => {
                  if (h.type === 'error') {
                    return (
                      <span key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-rose-500/20 text-rose-300 font-bold line-through border border-rose-500/40" title={h.explanation}>
                        {h.text}
                      </span>
                    );
                  }
                  return <span key={i}>{h.text} </span>;
                })}
              </p>
            </div>

            {/* Arrow Divider */}
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <ArrowRight className="w-4 h-4" /> Corrected & Improved Version
            </div>

            {/* Corrected Sentence with Green Pill Highlight */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Corrected English:
                </span>
                <p className="text-lg font-heading font-bold text-white tracking-wide">
                  {correction.highlights.map((h, i) => {
                    if (h.type === 'correction') {
                      return (
                        <span key={i} className="px-2 py-0.5 mx-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 animate-pulse">
                          {h.text}
                        </span>
                      );
                    }
                    if (h.type === 'error') return null;
                    return <span key={i}>{correction.correctedText}</span>;
                  })}
                </p>
              </div>

              {/* Speak & Copy Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSpeakCorrected}
                  title="Listen Native Pronunciation"
                  className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  title="Copy Corrected Text"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Detailed Cards: Why it is wrong & Better Alternative */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Why It Is Wrong:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{correction.whyWrong}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Better Alternative:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{correction.betterAlternative}</p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

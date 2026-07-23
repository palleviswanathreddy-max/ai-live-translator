import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, Copy, Check, Volume2, Star, Sparkles, 
  Trash2, RefreshCw, Send, BookOpen
} from 'lucide-react';
import { TranslationItem, LanguageCode, VoiceSettings, ContextMode } from '../types';
import { translateText } from '../services/translationService';
import { speechSpeaker } from '../services/speechSynthesis';
import { StudentLearnerCard } from './StudentLearnerCard';

interface TextModeProps {
  settings: VoiceSettings;
  onAddHistory: (item: TranslationItem) => void;
  onToggleFavorite: (id: string) => void;
}

export const TextMode: React.FC<TextModeProps> = ({
  settings,
  onAddHistory,
  onToggleFavorite,
}) => {
  const [sourceLang, setSourceLang] = useState<LanguageCode>('te-IN');
  const [targetLang, setTargetLang] = useState<LanguageCode>('en-US');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [contextMode, setContextMode] = useState<ContextMode>('learning');
  const [copied, setCopied] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number>(98);
  const [isStarred, setIsStarred] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Auto-translate with debounce as user types
  useEffect(() => {
    if (!inputText.trim()) {
      setTranslatedText('');
      setCurrentAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const res = await translateText(inputText, sourceLang, targetLang, contextMode);
        setTranslatedText(res.translatedText);
        setConfidenceScore(res.confidence);
        setCurrentAnalysis(res.studentAnalysis);
      } catch (err) {
        console.error("Text translation error:", err);
      } finally {
        setIsTranslating(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputText, sourceLang, targetLang, contextMode]);

  // Swap Languages
  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  // Speak Output
  const handleSpeakOutput = () => {
    if (translatedText) {
      speechSpeaker.speak(translatedText, targetLang, settings);
    }
  };

  // Save translation to history
  const handleSaveToHistory = () => {
    if (!inputText.trim() || !translatedText.trim()) return;

    const newItem: TranslationItem = {
      id: 'text-' + Date.now(),
      sourceText: inputText,
      translatedText: translatedText,
      sourceLang: sourceLang,
      targetLang: targetLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: confidenceScore,
      isFavorite: !isStarred,
      contextMode: contextMode,
      studentAnalysis: currentAnalysis
    };

    onAddHistory(newItem);
    setIsStarred(!isStarred);
    setSaveToast(!isStarred ? "Saved to Favorites & History!" : "Removed from Favorites!");
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Toast Banner */}
      {saveToast && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
          <Star className="w-4 h-4 fill-current text-amber-400" /> {saveToast}
        </div>
      )}

      {/* Top Selector Card */}
      <div className="p-4 sm:p-6 rounded-3xl glass-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <button 
              onClick={() => { setSourceLang('te-IN'); setTargetLang('en-US'); }}
              className={`px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${
                sourceLang === 'te-IN'
                  ? 'bg-brand-600/30 border-brand-500 text-white shadow-lg'
                  : 'bg-slate-900/50 border-white/10 text-slate-300'
              }`}
            >
              🇮🇳 Telugu (తెలుగు)
            </button>

            <button
              onClick={handleSwap}
              title="Swap Telugu ↔ English Translation Direction"
              className="p-3 rounded-2xl bg-slate-800 border border-white/10 text-cyan-400 hover:text-white hover:rotate-180 transition-all duration-300"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <button 
              onClick={() => { setSourceLang('en-US'); setTargetLang('te-IN'); }}
              className={`px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${
                sourceLang === 'en-US'
                  ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-lg'
                  : 'bg-slate-900/50 border-white/10 text-slate-300'
              }`}
            >
              🇺🇸 English (Spoken)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="text-mode-context" className="text-xs text-slate-400 font-medium">Context:</label>
            <select
              id="text-mode-context"
              name="contextMode"
              autoComplete="off"
              value={contextMode}
              onChange={(e) => setContextMode(e.target.value as ContextMode)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-cyan-300 focus:outline-none"
            >
              <option value="learning">🎓 Student Spoken Guide</option>
              <option value="casual">💬 Casual Conversation</option>
              <option value="formal">👔 Formal Business</option>
            </select>
          </div>

        </div>
      </div>

      {/* Dual Text Translation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Source Text Box */}
        <div className="p-5 rounded-3xl glass-card border border-white/10 flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
              <label htmlFor="translation-input">Original ({sourceLang === 'te-IN' ? 'Telugu' : 'English'})</label>
              {inputText.length > 0 && (
                <button
                  onClick={() => setInputText('')}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <textarea
              id="translation-input"
              name="translationInput"
              autoComplete="off"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={sourceLang === 'te-IN' ? 'టైప్ చేయండి లేదా ఉదాహరణ: నమస్కారం! నేను ఇంగ్లీష్ నేర్చుకోవాలనుకుంటున్నాను.' : 'Type or paste English sentence here...'}
              className="w-full h-40 mt-3 bg-transparent text-slate-100 placeholder-slate-500 text-sm font-medium resize-none focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/10">
            <span>{inputText.length} characters</span>
            <span className="text-[11px] text-cyan-400">Instant AI Auto-Translate</span>
          </div>
        </div>

        {/* Target Translation Box */}
        <div className="p-5 rounded-3xl glass-card border border-cyan-500/30 bg-slate-900/80 flex flex-col justify-between min-h-[260px] relative">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <span>Translation ({targetLang === 'te-IN' ? 'Telugu' : 'English'})</span>
              {isTranslating ? (
                <span className="flex items-center gap-1 text-xs text-cyan-300 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Translating...
                </span>
              ) : translatedText && (
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {confidenceScore}% Accuracy
                </span>
              )}
            </div>

            <div className="mt-3 h-40 overflow-y-auto">
              {translatedText ? (
                <p className="text-base font-bold text-white leading-relaxed">{translatedText}</p>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Translation will instantly appear here as you type...
                </p>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              onClick={handleSpeakOutput}
              disabled={!translatedText}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Volume2 className="w-4 h-4" /> Listen Audio
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors disabled:opacity-40"
                title="Copy Translation"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleSaveToHistory}
                disabled={!translatedText}
                className={`p-2 rounded-xl text-xs transition-colors disabled:opacity-40 ${
                  isStarred ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Save to Favorites History"
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Student Learner Card if available */}
      {currentAnalysis && (
        <StudentLearnerCard
          analysis={currentAnalysis}
          englishText={targetLang === 'en-US' ? translatedText : inputText}
          settings={settings}
        />
      )}

    </div>
  );
};

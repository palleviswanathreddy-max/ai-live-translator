import React, { useState } from 'react';
import { 
  Mic, MicOff, Volume2, ArrowLeftRight, Copy, Star, Check, 
  Sparkles, Play, Pause, RefreshCw, Radio, Trash2
} from 'lucide-react';
import { TranslationItem, LanguageCode, VoiceSettings, ContextMode } from '../types';
import { AudioWaveform } from './AudioWaveform';
import { StudentLearnerCard } from './StudentLearnerCard';
import { speechRecognizer } from '../services/speechRecognition';
import { speechSpeaker } from '../services/speechSynthesis';
import { translateText } from '../services/translationService';

interface VoiceModeProps {
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
  onAddHistory: (item: TranslationItem) => void;
  history: TranslationItem[];
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({
  settings,
  onUpdateSettings,
  onAddHistory,
  history,
  onToggleFavorite,
  onClearHistory,
}) => {
  const [sourceLang, setSourceLang] = useState<LanguageCode>('te-IN');
  const [targetLang, setTargetLang] = useState<LanguageCode>('en-US');
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [contextMode, setContextMode] = useState<ContextMode>('learning');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Start speech recognition for specified language
  const startListeningForLang = (srcL: LanguageCode) => {
    setLiveTranscript('');
    const success = speechRecognizer.start(srcL, settings.continuousMode, {
      onStart: () => {
        setIsListening(true);
      },
      onResult: (text, isFinal) => {
        setLiveTranscript(text);
        if (isFinal) {
          handleProcessTranslation(text, srcL);
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
    if (!success) setIsListening(false);
  };

  // Change or Swap Languages Dynamically
  const handleSelectLanguages = (newSrc: LanguageCode, newTgt: LanguageCode) => {
    setSourceLang(newSrc);
    setTargetLang(newTgt);
    speechRecognizer.setLanguage(newSrc);

    if (isListening) {
      speechRecognizer.stop();
      setTimeout(() => startListeningForLang(newSrc), 250);
    }
  };

  const handleSwapLanguages = () => {
    handleSelectLanguages(targetLang, sourceLang);
  };

  // Toggle Microphone Listening
  const handleToggleMic = () => {
    if (isListening) {
      speechRecognizer.stop();
      setIsListening(false);
    } else {
      startListeningForLang(sourceLang);
    }
  };

  // Process Translation in either direction (Telugu → English OR English → Telugu)
  const handleProcessTranslation = async (text: string, currentSrcLang: LanguageCode) => {
    if (!text.trim()) return;

    const currentTgtLang = currentSrcLang === 'te-IN' ? 'en-US' : 'te-IN';
    setIsTranslating(true);
    try {
      const result = await translateText(text, currentSrcLang, currentTgtLang, contextMode);
      
      const newItem: TranslationItem = {
        id: 'trans-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        sourceText: text,
        translatedText: result.translatedText,
        sourceLang: currentSrcLang,
        targetLang: currentTgtLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: result.confidence,
        isFavorite: false,
        speaker: currentSrcLang === 'te-IN' ? 'user' : 'partner',
        contextMode: contextMode,
        studentAnalysis: result.studentAnalysis
      };

      onAddHistory(newItem);

      // Auto play voice if enabled
      if (settings.autoPlay) {
        setPlayingId(newItem.id);
        speechSpeaker.speak(result.translatedText, currentTgtLang, settings, () => {
          setPlayingId(null);
          // Resume continuous listening if continuous mode is active
          if (settings.continuousMode) {
            startListeningForLang(currentSrcLang);
          }
        });
      } else if (settings.continuousMode) {
        startListeningForLang(currentSrcLang);
      }
    } catch (e) {
      console.error("Translation processing error:", e);
    } fontally: {
      setIsTranslating(false);
      setLiveTranscript('');
    }
  };

  // Manual Play Audio
  const handlePlayAudio = (item: TranslationItem) => {
    if (playingId === item.id) {
      speechSpeaker.stop();
      setPlayingId(null);
    } else {
      setPlayingId(item.id);
      speechSpeaker.speak(item.translatedText, item.targetLang, settings, () => {
        setPlayingId(null);
      });
    }
  };

  // Copy text to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Top Controls Card: Languages, Swap & Context Mode */}
      <div className="p-4 sm:p-6 rounded-3xl glass-card relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Language Pair Selectors */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            
            {/* Telugu Source Button */}
            <button 
              onClick={() => handleSelectLanguages('te-IN', 'en-US')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                sourceLang === 'te-IN'
                  ? 'bg-brand-600/30 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <span className="text-base">🇮🇳</span> Telugu (తెలుగు)
            </button>

            {/* Swap Button */}
            <button
              onClick={handleSwapLanguages}
              title="Swap Telugu ↔ English Translation Direction"
              className="p-3 rounded-2xl bg-slate-800/80 border border-white/10 text-cyan-400 hover:text-white hover:bg-slate-700 hover:rotate-180 transition-all duration-300 shrink-0 shadow-md"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* English Source Button */}
            <button 
              onClick={() => handleSelectLanguages('en-US', 'te-IN')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                sourceLang === 'en-US'
                  ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <span className="text-base">🇺🇸</span> English (Spoken)
            </button>

          </div>

          {/* Context Mode Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Tone:</span>
            <select
              value={contextMode}
              onChange={(e) => setContextMode(e.target.value as ContextMode)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="learning">🎓 Student Spoken English</option>
              <option value="casual">💬 Casual Conversation</option>
              <option value="formal">👔 Formal & Polite</option>
              <option value="travel">✈️ Travel & Shopping</option>
            </select>
          </div>

        </div>

        {/* Mode Indicators & Toggles */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-4 text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={settings.continuousMode}
                onChange={(e) => onUpdateSettings({ ...settings, continuousMode: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-900 border-white/20 text-brand-500 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <Radio className="w-3.5 h-3.5 text-cyan-400" /> Continuous Voice Dialogue
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => onUpdateSettings({ ...settings, autoPlay: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-900 border-white/20 text-brand-500 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Auto-play Speech
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[11px]">
              Active Mic Lang: <strong className="text-cyan-300">{sourceLang === 'te-IN' ? 'Telugu (te-IN)' : 'English (en-US)'}</strong>
            </span>
          </div>

        </div>

      </div>

      {/* Main Mic Recording Hub */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card flex flex-col items-center justify-center text-center relative overflow-hidden">
        
        {/* Visualizer Waveform Canvas */}
        <AudioWaveform isActive={isListening} color={sourceLang === 'te-IN' ? '#06b6d4' : '#8b5cf6'} />

        {/* Live Streaming Speech Transcript Preview */}
        <div className="min-h-[50px] my-3 flex items-center justify-center">
          {isListening ? (
            <p className="text-lg sm:text-xl font-heading font-medium text-cyan-300 animate-pulse px-4">
              {liveTranscript || "Listening... Speak now in " + (sourceLang === 'te-IN' ? 'Telugu (తెలుగు)' : 'English')}
            </p>
          ) : isTranslating ? (
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Translating & Analyzing Sentence...
            </div>
          ) : (
            <p className="text-sm text-slate-400 max-w-md">
              Tap microphone to translate <strong className="text-cyan-300">{sourceLang === 'te-IN' ? 'Telugu' : 'English'}</strong> → <strong className="text-emerald-300">{targetLang === 'te-IN' ? 'Telugu' : 'English'}</strong>.
            </p>
          )}
        </div>

        {/* Large Glowing Microphone Button */}
        <div className="relative my-4">
          
          {/* Animated Glow Ring */}
          {isListening && (
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500 via-brand-500 to-emerald-500 opacity-75 blur-xl animate-pulse" />
          )}

          <button
            onClick={handleToggleMic}
            aria-label={isListening ? "Stop speech recognition microphone" : "Start speech recognition microphone"}
            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-brand-600 via-cyan-500 to-emerald-400 text-white glow-mic-active scale-105'
                : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-2 border-cyan-500/40 text-cyan-400 hover:border-cyan-400 hover:scale-105 glow-mic'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
            )}
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-2">
          {isListening ? `Listening in ${sourceLang === 'te-IN' ? 'Telugu' : 'English'} (Tap to Stop)` : `Tap Mic to Speak in ${sourceLang === 'te-IN' ? 'Telugu' : 'English'}`}
        </p>

      </div>

      {/* Live Conversation Stream History */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Live Conversation Feed
          </h3>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear Feed
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-2xl glass-card text-center text-slate-400 space-y-2">
            <Radio className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <p className="text-sm font-medium">No spoken translations yet.</p>
            <p className="text-xs text-slate-500">Your live voice conversation will appear here with audio replay & student learning guides.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-500/30 transition-all duration-300 space-y-3"
              >
                
                {/* Header Tag & Time */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                      item.sourceLang === 'te-IN'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    }`}>
                      {item.sourceLang === 'te-IN' ? '🇮🇳 Telugu → 🇺🇸 English' : '🇺🇸 English → 🇮🇳 Telugu'}
                    </span>
                    <span className="text-slate-400 font-medium">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {item.confidence}% Accuracy
                    </span>

                    {/* Star Favorite */}
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Speech Original & Translated Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Original Speech */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Original ({item.sourceLang === 'te-IN' ? 'Telugu' : 'English'})
                    </span>
                    <p className="text-sm font-medium text-slate-200">{item.sourceText}</p>
                  </div>

                  {/* Translated Speech */}
                  <div className="p-3.5 rounded-xl bg-brand-950/30 border border-cyan-500/20 space-y-1 relative">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                      Translation ({item.targetLang === 'te-IN' ? 'Telugu' : 'English'})
                    </span>
                    <p className="text-sm font-bold text-white leading-relaxed">{item.translatedText}</p>

                    {/* Action Bar: Play & Copy */}
                    <div className="flex items-center justify-end gap-1 pt-2">
                      <button
                        onClick={() => handlePlayAudio(item)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          playingId === item.id 
                            ? 'bg-cyan-500 text-white animate-pulse' 
                            : 'bg-slate-800 text-cyan-300 hover:bg-cyan-600 hover:text-white'
                        }`}
                      >
                        {playingId === item.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {playingId === item.id ? 'Playing...' : 'Listen Audio'}
                      </button>

                      <button
                        onClick={() => handleCopy(item.translatedText, item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
                        title="Copy Translation"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Spoken English Student Learning Breakdown Card */}
                {item.studentAnalysis && (
                  <StudentLearnerCard
                    analysis={item.studentAnalysis}
                    englishText={item.targetLang === 'en-US' ? item.translatedText : item.sourceText}
                    settings={settings}
                  />
                )}

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

import React from 'react';
import { GraduationCap, Volume2, Lightbulb, BookOpen, Repeat, CheckCircle2 } from 'lucide-react';
import { StudentBreakdown, VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';

interface StudentLearnerCardProps {
  analysis: StudentBreakdown;
  englishText: string;
  settings: VoiceSettings;
}

export const StudentLearnerCard: React.FC<StudentLearnerCardProps> = ({
  analysis,
  englishText,
  settings
}) => {
  const handleSlowPlay = (rateMultiplier: number) => {
    const customSettings: VoiceSettings = {
      ...settings,
      rate: rateMultiplier
    };
    speechSpeaker.speak(englishText, 'en-US', customSettings);
  };

  return (
    <div className="mt-4 p-4 lg:p-5 rounded-2xl glass-card border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-brand-950/40 relative overflow-hidden">
      
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Spoken English Student Guide
          </h4>
        </div>

        {/* Slow Play Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Practice Audio:</span>
          <button
            onClick={() => handleSlowPlay(0.75)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all flex items-center gap-1"
          >
            <Volume2 className="w-3 h-3" /> 0.75x Slow
          </button>
          <button
            onClick={() => handleSlowPlay(0.5)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-[11px] font-semibold transition-all flex items-center gap-1"
          >
            <Repeat className="w-3 h-3" /> 0.5x Ultra-Slow
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="mt-3.5 space-y-3">
        
        {/* Phonetic Pronunciation Guide */}
        {analysis.phonetic && (
          <div className="flex items-start gap-2 text-xs">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Phonetic Guide: </span>
              <span className="text-emerald-300 font-mono font-medium">{analysis.phonetic}</span>
            </div>
          </div>
        )}

        {/* Grammar & Spoken Tip */}
        {analysis.grammarTip && (
          <div className="flex items-start gap-2 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Grammar & Sentence Tip: </span>
              <span className="text-slate-300">{analysis.grammarTip}</span>
            </div>
          </div>
        )}

        {/* Simple Alternative Phrase */}
        {analysis.simpleAlternative && (
          <div className="flex items-start gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Easier Spoken Alternative: </span>
              <span className="text-indigo-300 font-medium">"{analysis.simpleAlternative}"</span>
            </div>
          </div>
        )}

        {/* Key Vocabulary Chips */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Key Vocabulary & Meanings:
            </span>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((kw, i) => (
                <div 
                  key={i} 
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-white/10 flex items-center gap-1.5 text-[11px]"
                >
                  <span className="font-bold text-cyan-300">{kw.word}</span>
                  <span className="text-slate-400">({kw.type})</span>
                  <span className="text-slate-200">→ {kw.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

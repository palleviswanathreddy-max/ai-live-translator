import React from 'react';
import { Trophy, Sparkles, Coins, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { SmartFeedbackScores } from '../types';

interface LessonCelebrationModalProps {
  xpEarned: number;
  coinsEarned: number;
  scores: SmartFeedbackScores;
  unlockedBadge?: string;
  onContinue: () => void;
}

export const LessonCelebrationModal: React.FC<LessonCelebrationModalProps> = ({
  xpEarned,
  coinsEarned,
  scores,
  unlockedBadge,
  onContinue
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-center space-y-6 animate-scaleUp shadow-2xl">
        
        {/* Celebration Trophy & Badge */}
        <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 p-[2px] shadow-xl shadow-amber-500/30 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-heading font-extrabold text-white">Lesson Completed! 🎉</h2>
          <p className="text-xs text-amber-300 font-semibold">Grade: {scores.overallGrade}</p>
        </div>

        {/* Rewards Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 space-y-1">
            <Sparkles className="w-5 h-5 text-cyan-400 mx-auto" />
            <span className="text-xl font-extrabold block">+{xpEarned} XP</span>
            <span className="text-[10px] font-semibold text-slate-400">Experience Points</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
            <Coins className="w-5 h-5 text-emerald-400 mx-auto" />
            <span className="text-xl font-extrabold block">+{coinsEarned} Coins</span>
            <span className="text-[10px] font-semibold text-slate-400">Learner Currency</span>
          </div>
        </div>

        {/* Smart 5-Score Feedback Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-left space-y-2.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Smart 5-Score Fluency Evaluation:
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Grammar:</span>
              <span className="font-bold text-emerald-400">{scores.grammarScore}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Pronunciation:</span>
              <span className="font-bold text-amber-400">{scores.pronunciationScore}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Fluency:</span>
              <span className="font-bold text-cyan-400">{scores.fluencyScore}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Vocabulary:</span>
              <span className="font-bold text-indigo-400">{scores.vocabScore}%</span>
            </div>
          </div>
        </div>

        {unlockedBadge && (
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> New Badge Unlocked: {unlockedBadge}!
          </div>
        )}

        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-cyan-500 to-emerald-500 text-white font-bold text-sm shadow-xl shadow-brand-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          Continue to Learning Path <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

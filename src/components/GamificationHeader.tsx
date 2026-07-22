import React from 'react';
import { Flame, Sparkles, Coins, Trophy, Target, ShieldCheck, HelpCircle } from 'lucide-react';
import { GamificationState } from '../types';

interface GamificationHeaderProps {
  state: GamificationState;
  onOpenWeakAreas?: () => void;
}

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({ state, onOpenWeakAreas }) => {
  return (
    <div className="p-4 rounded-2xl glass-card border border-brand-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      
      {/* XP & Level Status */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white shadow-md">
          <Trophy className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Level {state.unlockedLevelId} Student</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {state.unlockedBadges[state.unlockedBadges.length - 1] || 'Scholar'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Daily Goal: {state.currentWeeklyMinutes}/{state.weeklyGoalMinutes} mins</p>
        </div>
      </div>

      {/* Stats Counter Pills */}
      <div className="flex items-center gap-3">
        
        {/* Streak Flame Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold" title="Daily Practice Streak">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{state.streakDays} Days</span>
        </div>

        {/* XP Points Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold" title="Total XP Earned">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{state.xp} XP</span>
        </div>

        {/* Coins Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold" title="Learner Coins Balance">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>{state.coins} Coins</span>
        </div>

        {/* Revision Drawer Button */}
        {onOpenWeakAreas && (
          <button
            onClick={onOpenWeakAreas}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Review Weak Areas & Spaced Vocabulary"
          >
            <Target className="w-3.5 h-3.5" /> Weak Areas
          </button>
        )}

      </div>

    </div>
  );
};

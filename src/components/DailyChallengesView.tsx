import React, { useState } from 'react';
import { Target, CheckCircle2, Flame, Award, ArrowRight, Mic, BookOpen, Volume2, MessageSquare, Check } from 'lucide-react';
import { DailyChallengeItem } from '../types';
import { INITIAL_DAILY_CHALLENGES } from '../services/learningService';

interface DailyChallengesViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const DailyChallengesView: React.FC<DailyChallengesViewProps> = ({ onNavigateToTab }) => {
  const [challenges, setChallenges] = useState<DailyChallengeItem[]>(INITIAL_DAILY_CHALLENGES);

  const completedCount = challenges.filter((c) => c.completed).length;
  const progressPercent = Math.round((completedCount / challenges.length) * 100);

  const handleToggleComplete = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed, score: c.completed ? undefined : 95 } : c))
    );
  };

  const getCategoryIcon = (cat: DailyChallengeItem['category']) => {
    switch (cat) {
      case 'Speaking': return <Mic className="w-4 h-4 text-cyan-400" />;
      case 'Grammar': return <CheckCircle2 className="w-4 h-4 text-brand-400" />;
      case 'Vocabulary': return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'Listening': return <Volume2 className="w-4 h-4 text-amber-400" />;
      case 'Conversation': return <MessageSquare className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl glass-card border border-brand-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 space-y-6">
      
      {/* Header & Progress Meter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-heading font-bold text-white">Daily Fluency Challenges</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> 5-Day Streak
              </span>
            </div>
            <p className="text-xs text-slate-400">Complete 5 daily tasks across Speaking, Grammar, Vocab, Listening & Conversation.</p>
          </div>
        </div>

        {/* Completion Progress Gauge */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-white/10">
          <div className="text-right">
            <span className="text-xs font-bold text-white block">{completedCount} of 5 Completed</span>
            <span className="text-[10px] text-cyan-400 font-semibold">{progressPercent}% Completed</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-brand-500 flex items-center justify-center font-bold text-xs text-white">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/10">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-gradient-to-r from-brand-600 via-cyan-500 to-emerald-400 transition-all duration-500"
        />
      </div>

      {/* Challenge Cards List */}
      <div className="space-y-3">
        {challenges.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              item.completed
                ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                : 'bg-slate-950/80 border-white/10 hover:border-brand-500/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleComplete(item.id)}
                className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                  item.completed
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Check className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    {getCategoryIcon(item.category)} {item.category} Challenge
                  </span>
                  {item.completed && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Completed {item.score ? `(${item.score}% Score)` : ''}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            </div>

            <button
              onClick={() => handleToggleComplete(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                item.completed
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white hover:scale-105 shadow-md'
              }`}
            >
              {item.completed ? 'Mark Incomplete' : 'Start Challenge'}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

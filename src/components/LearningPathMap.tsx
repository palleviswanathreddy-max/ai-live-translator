import React, { useState } from 'react';
import {
  Lock, CheckCircle2, Play, Star, Trophy, Sparkles,
  Volume2, BookOpen, Layers, AlignLeft, MessageSquare, Mic, Headphones, GraduationCap, ChevronRight, Layers3
} from 'lucide-react';
import { LevelNode, Lesson } from '../types';
import { LEVEL_NODES } from '../services/learningPathData';
import { MASTER_100_MODULES } from '../services/contentEngine';

interface LearningPathMapProps {
  unlockedLevelId: number;
  onSelectLevel: (levelNode: LevelNode) => void;
  onSelectModule?: (lesson: Lesson) => void;
}

export const LearningPathMap: React.FC<LearningPathMapProps> = ({
  unlockedLevelId,
  onSelectLevel,
  onSelectModule
}) => {
  const [selectedTier, setSelectedTier] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [expandedLevelId, setExpandedLevelId] = useState<number | null>(unlockedLevelId);

  const getNodeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Volume2': return <Volume2 className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'AlignLeft': return <AlignLeft className="w-5 h-5" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5" />;
      case 'Mic': return <Mic className="w-5 h-5" />;
      case 'Headphones': return <Headphones className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      default: return <GraduationCap className="w-5 h-5" />;
    }
  };

  const filteredLevels = LEVEL_NODES.filter((n) => {
    if (selectedTier === 'beginner') return n.id <= 3;
    if (selectedTier === 'intermediate') return n.id >= 4 && n.id <= 7;
    if (selectedTier === 'advanced') return n.id >= 8;
    return true;
  });

  return (
    <div className="p-6 rounded-3xl glass-card border border-brand-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-500/30">
              100+ Original Learning Modules
            </span>
          </div>
          <h3 className="text-lg font-heading font-bold text-white mt-1">
            Curriculum & <span className="gradient-text">10-Level Learning Path Map</span>
          </h3>
          <p className="text-xs text-slate-400">Master 100+ structured modules from beginner phonics to real-life mastery.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-semibold">Unlocked: Level {unlockedLevelId} / 10</span>
        </div>
      </div>

      {/* Level Tier Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
              selectedTier === tier
                ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white border-cyan-400 shadow-md'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border-white/10'
            }`}
          >
            {tier === 'all' ? 'All 10 Levels (100 Modules)' : `${tier} Tier`}
          </button>
        ))}
      </div>

      {/* Level Nodes & Sub-Modules List */}
      <div className="relative space-y-4 max-w-3xl mx-auto py-2">
        {filteredLevels.map((node) => {
          const isUnlocked = node.id <= unlockedLevelId;
          const isCurrentActive = node.id === unlockedLevelId;
          const isCompleted = node.id < unlockedLevelId;
          const isExpanded = expandedLevelId === node.id;

          const levelModules = MASTER_100_MODULES.filter((m) => m.levelId === node.id);

          return (
            <div key={node.id} className="space-y-2">
              
              {/* Level Node Header Card */}
              <div
                onClick={() => {
                  if (isUnlocked) {
                    setExpandedLevelId(isExpanded ? null : node.id);
                    onSelectLevel(node);
                  }
                }}
                className={`relative z-10 p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer ${
                  isCurrentActive
                    ? 'bg-gradient-to-r from-brand-950/90 via-slate-900 to-cyan-950/60 border-brand-500/60 shadow-xl ring-1 ring-brand-500/40'
                    : isCompleted
                    ? 'bg-slate-950/80 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-950/40 border-white/5 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-md ${
                      isCurrentActive
                        ? 'bg-gradient-to-tr from-brand-600 to-cyan-500 text-white animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900 text-slate-600 border border-white/10'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : getNodeIcon(node.icon)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-heading font-bold text-white">{node.title}</h4>
                      {isCurrentActive && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Current Goal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-300 font-semibold">{node.teluguTitle}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">{node.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/5">
                    10 Modules
                  </span>

                  <button
                    disabled={!isUnlocked}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isCurrentActive
                        ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white hover:scale-105'
                        : isCompleted
                        ? 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                        : 'bg-slate-900 text-slate-600 border border-white/5'
                    }`}
                  >
                    {!isUnlocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> {isExpanded ? 'Hide Modules' : 'View Modules'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-Modules Accordion List */}
              {isExpanded && isUnlocked && (
                <div className="pl-4 sm:pl-8 space-y-2 pt-1 pb-2">
                  {levelModules.map((mod, idx) => (
                    <div
                      key={mod.id}
                      onClick={() => onSelectModule && onSelectModule(mod)}
                      className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10 hover:border-cyan-400 cursor-pointer flex items-center justify-between text-xs transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-300 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white block group-hover:text-cyan-300 transition-colors">
                            {mod.title}
                          </span>
                          <span className="text-[11px] text-emerald-400">{mod.teluguTitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-900 text-slate-300 border border-white/5">
                          {mod.type}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

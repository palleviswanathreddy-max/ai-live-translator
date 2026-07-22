import React, { useState } from 'react';
import {
  GraduationCap, CheckCircle2, BookOpen, Mic, MessageSquare, Target, Lightbulb, MapPin, Sparkles
} from 'lucide-react';
import {
  LearningLevel, VoiceSettings, VocabWord, GrammarCorrection, LevelNode, Lesson,
  GamificationState, SmartFeedbackScores
} from '../types';
import { GamificationHeader } from './GamificationHeader';
import { AITeacherWidget } from './AITeacherWidget';
import { LearningPathMap } from './LearningPathMap';
import { InteractiveLessonPlayer } from './InteractiveLessonPlayer';
import { LessonCelebrationModal } from './LessonCelebrationModal';
import { WeakAreasReviewModal } from './WeakAreasReviewModal';
import { GrammarCorrectionCard } from './GrammarCorrectionCard';
import { VocabularyBuilderView } from './VocabularyBuilderView';
import { PronunciationCoachView } from './PronunciationCoachView';
import { SpeakingPartnerView } from './SpeakingPartnerView';
import { WordOfTheDayView } from './WordOfTheDayView';
import { DailyChallengesView } from './DailyChallengesView';
import { SmartSuggestionsView } from './SmartSuggestionsView';
import { MASTER_LESSONS } from '../services/learningPathData';
import { loadGamificationState, awardLessonRewards, calculateSmart5Scores } from '../services/gamificationService';

interface LearningHubProps {
  level: LearningLevel;
  onUpdateLevel: (lvl: LearningLevel) => void;
  savedWords: VocabWord[];
  onToggleSaveWord: (word: VocabWord) => void;
  settings: VoiceSettings;
  onSaveGrammarCorrection?: (corr: GrammarCorrection) => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  level,
  onUpdateLevel,
  savedWords,
  onToggleSaveWord,
  settings,
  onSaveGrammarCorrection
}) => {
  const [subTab, setSubTab] = useState<'path' | 'grammar' | 'vocab' | 'pronunciation' | 'speaking' | 'daily' | 'suggestions'>('path');
  const [gamificationState, setGamificationState] = useState<GamificationState>(() => loadGamificationState());
  
  // Active Interactive Lesson Runner Modal State
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Celebration Modal State
  const [celebrationData, setCelebrationData] = useState<{
    xpEarned: number;
    coinsEarned: number;
    scores: SmartFeedbackScores;
    unlockedBadge?: string;
  } | null>(null);

  // Weak Areas Drawer State
  const [isWeakAreasOpen, setIsWeakAreasOpen] = useState(false);

  const handleSelectLevelNode = (node: LevelNode) => {
    const lessonForNode = MASTER_LESSONS.find((l) => l.levelId === node.id) || MASTER_LESSONS[0];
    setActiveLesson(lessonForNode);
  };

  const handleCompleteLesson = (xpEarned: number, coinsEarned: number, accuracyPercent: number) => {
    const activeLessonLevelId = activeLesson?.levelId || 1;
    const newState = awardLessonRewards(gamificationState, xpEarned, coinsEarned, activeLessonLevelId);
    setGamificationState(newState);

    const scores = calculateSmart5Scores(accuracyPercent, 92);
    setCelebrationData({
      xpEarned,
      coinsEarned,
      scores,
      unlockedBadge: `Level ${activeLessonLevelId} Badge`
    });

    setActiveLesson(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Gamification Header */}
      <GamificationHeader
        state={gamificationState}
        onOpenWeakAreas={() => setIsWeakAreasOpen(true)}
      />

      {/* AI Teacher Assistant Coach Bar */}
      <AITeacherWidget settings={settings} />

      {/* Learning Hub Header & Level Selector Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card bg-gradient-to-r from-brand-950/90 via-slate-900 to-slate-900 border border-brand-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Free-First AI Language Academy
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              AI English <span className="gradient-text">Fluency Experience</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Progressive 10-level learning path, 9 interactive lesson types, gamified rewards, and smart 5-score feedback.
            </p>
          </div>

          {/* Learning Level Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <span className="text-[11px] text-slate-400 font-semibold px-2">Level:</span>
            {(['beginner', 'intermediate', 'advanced'] as LearningLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onUpdateLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  level === lvl
                    ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Module Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 scrollbar-none">
        <button
          onClick={() => setSubTab('path')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'path'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4 text-amber-300" /> 10-Level Path Map
        </button>

        <button
          onClick={() => setSubTab('grammar')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'grammar'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Grammar Doctor
        </button>

        <button
          onClick={() => setSubTab('vocab')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'vocab'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Vocab Builder ({savedWords.length})
        </button>

        <button
          onClick={() => setSubTab('pronunciation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'pronunciation'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" /> Pronunciation Coach
        </button>

        <button
          onClick={() => setSubTab('speaking')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'speaking'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Speaking Partner
        </button>

        <button
          onClick={() => setSubTab('daily')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'daily'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" /> Daily Drills & Word
        </button>

        <button
          onClick={() => setSubTab('suggestions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'suggestions'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" /> Smart Suggestions
        </button>
      </div>

      {/* Sub-Tab View Rendering */}
      {subTab === 'path' && (
        <LearningPathMap
          unlockedLevelId={gamificationState.unlockedLevelId}
          onSelectLevel={handleSelectLevelNode}
        />
      )}

      {subTab === 'grammar' && (
        <GrammarCorrectionCard
          level={level}
          settings={settings}
          onSaveToHistory={onSaveGrammarCorrection}
        />
      )}

      {subTab === 'vocab' && (
        <VocabularyBuilderView
          savedWords={savedWords}
          onToggleSaveWord={onToggleSaveWord}
          settings={settings}
        />
      )}

      {subTab === 'pronunciation' && (
        <PronunciationCoachView
          settings={settings}
        />
      )}

      {subTab === 'speaking' && (
        <SpeakingPartnerView
          level={level}
          settings={settings}
        />
      )}

      {subTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WordOfTheDayView settings={settings} />
          <DailyChallengesView />
        </div>
      )}

      {subTab === 'suggestions' && (
        <SmartSuggestionsView settings={settings} />
      )}

      {/* Active Interactive Lesson Runner Modal */}
      {activeLesson && (
        <InteractiveLessonPlayer
          lesson={activeLesson}
          settings={settings}
          onClose={() => setActiveLesson(null)}
          onCompleteLesson={handleCompleteLesson}
        />
      )}

      {/* Celebration Modal */}
      {celebrationData && (
        <LessonCelebrationModal
          xpEarned={celebrationData.xpEarned}
          coinsEarned={celebrationData.coinsEarned}
          scores={celebrationData.scores}
          unlockedBadge={celebrationData.unlockedBadge}
          onContinue={() => setCelebrationData(null)}
        />
      )}

      {/* Weak Areas Revision Drawer */}
      {isWeakAreasOpen && (
        <WeakAreasReviewModal onClose={() => setIsWeakAreasOpen(false)} />
      )}

    </div>
  );
};

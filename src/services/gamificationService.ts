import { GamificationState, DailyMission, WeakArea, SmartFeedbackScores } from '../types';

const INITIAL_GAMIFICATION_STATE: GamificationState = {
  xp: 350,
  coins: 140,
  streakDays: 5,
  weeklyGoalMinutes: 60,
  currentWeeklyMinutes: 45,
  unlockedLevelId: 2,
  unlockedBadges: ['Phonics Pioneer', 'Vocabulary Starter'],
  dailyMissions: [
    {
      id: 'm-1',
      title: 'Complete 1 Interactive Lesson',
      target: 1,
      current: 1,
      completed: true,
      rewardXp: 50,
      rewardCoins: 20
    },
    {
      id: 'm-2',
      title: 'Score > 85% in Pronunciation Coach',
      target: 1,
      current: 0,
      completed: false,
      rewardXp: 75,
      rewardCoins: 30
    },
    {
      id: 'm-3',
      title: 'Build 3 Correct Sentences',
      target: 3,
      current: 2,
      completed: false,
      rewardXp: 60,
      rewardCoins: 25
    }
  ]
};

export function loadGamificationState(): GamificationState {
  const saved = localStorage.getItem('ai_learning_gamification');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.warn('Failed to parse gamification state, resetting:', err);
    }
  }
  return INITIAL_GAMIFICATION_STATE;
}

export function saveGamificationState(state: GamificationState): void {
  localStorage.setItem('ai_learning_gamification', JSON.stringify(state));
}

export function awardLessonRewards(
  state: GamificationState,
  xpEarned: number,
  coinsEarned: number,
  completedLevelId?: number
): GamificationState {
  const newXp = state.xp + xpEarned;
  const newCoins = state.coins + coinsEarned;
  let newUnlocked = state.unlockedLevelId;

  if (completedLevelId && completedLevelId >= state.unlockedLevelId) {
    newUnlocked = Math.min(10, completedLevelId + 1);
  }

  const updatedMissions = state.dailyMissions.map((m) => {
    if (m.id === 'm-1') {
      return { ...m, current: m.target, completed: true };
    }
    return m;
  });

  const updatedState: GamificationState = {
    ...state,
    xp: newXp,
    coins: newCoins,
    unlockedLevelId: newUnlocked,
    dailyMissions: updatedMissions
  };

  saveGamificationState(updatedState);
  return updatedState;
}

// Master Weak Areas Tracking Engine
export const INITIAL_WEAK_AREAS: WeakArea[] = [
  {
    id: 'w-1',
    topic: 'Subject-Verb Agreement (He/She + s)',
    category: 'Grammar',
    errorCount: 3,
    lastPracticed: 'Yesterday',
    reviewNeeded: true,
    exampleSentence: 'He goes to school (NOT: He go to school)'
  },
  {
    id: 'w-2',
    topic: 'Double Past Tense ("didn\'t went")',
    category: 'Grammar',
    errorCount: 2,
    lastPracticed: '2 days ago',
    reviewNeeded: true,
    exampleSentence: 'I didn\'t go (NOT: I didn\'t went)'
  },
  {
    id: 'w-3',
    topic: 'Short Vowel /æ/ Pronunciation',
    category: 'Pronunciation',
    errorCount: 4,
    lastPracticed: 'Today',
    reviewNeeded: false,
    exampleSentence: 'Cat, Sat, Mat pronunciation clarity'
  }
];

export function calculateSmart5Scores(
  accuracyPercent: number,
  spokenAccuracy: number = 90
): SmartFeedbackScores {
  const grammarScore = Math.min(100, Math.max(65, accuracyPercent + Math.floor(Math.random() * 5)));
  const pronunciationScore = Math.min(100, Math.max(70, spokenAccuracy));
  const fluencyScore = Math.min(100, Math.max(75, Math.round((grammarScore + pronunciationScore) / 2)));
  const vocabScore = Math.min(100, Math.max(80, accuracyPercent + 2));
  const confidenceScore = Math.min(100, Math.max(82, fluencyScore + 3));

  const average = Math.round((grammarScore + pronunciationScore + fluencyScore + vocabScore + confidenceScore) / 5);

  let overallGrade = 'A+ (Excellent)';
  if (average < 75) overallGrade = 'C (Keep Practicing)';
  else if (average < 85) overallGrade = 'B+ (Good Job)';
  else if (average < 93) overallGrade = 'A (Great Fluency)';

  const suggestions: string[] = [];
  if (grammarScore < 85) suggestions.push('Pay attention to Subject-Verb agreement rules (e.g. He goes vs He go).');
  if (pronunciationScore < 85) suggestions.push('Slow down slightly to articulate vowel sounds cleanly.');
  if (suggestions.length === 0) suggestions.push('Outstanding performance! Keep up the daily practice streak.');

  return {
    grammarScore,
    pronunciationScore,
    fluencyScore,
    vocabScore,
    confidenceScore,
    overallGrade,
    suggestions
  };
}

export type LanguageCode = 'te-IN' | 'en-US';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export type ContextMode = 'casual' | 'formal' | 'business' | 'travel' | 'learning';

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export type LessonType =
  | 'speaking'
  | 'listening'
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'sentence_building'
  | 'role_play'
  | 'pronunciation'
  | 'conversation';

export interface LevelNode {
  id: number;
  title: string;
  teluguTitle: string;
  description: string;
  icon: string;
  unlocked: boolean;
  completedLessons: number;
  totalLessons: number;
  badgeName: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  teluguText?: string;
  isCorrect: boolean;
}

export interface LessonQuestion {
  id: string;
  type: 'mcq' | 'sentence_builder' | 'speak_repeat' | 'listen_type' | 'roleplay';
  prompt: string;
  teluguPrompt?: string;
  audioPrompt?: string;
  options?: QuestionOption[];
  wordBank?: string[]; // For sentence builder (tap words in order)
  targetSentence?: string; // Correct English sentence
  explanation: string;
  weakCategory?: string;
}

export interface Lesson {
  id: string;
  levelId: number;
  title: string;
  teluguTitle: string;
  type: LessonType;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  questions: LessonQuestion[];
}

export interface DailyMission {
  id: string;
  title: string;
  target: number;
  current: number;
  completed: boolean;
  rewardXp: number;
  rewardCoins: number;
}

export interface GamificationState {
  xp: number;
  coins: number;
  streakDays: number;
  weeklyGoalMinutes: number;
  currentWeeklyMinutes: number;
  unlockedLevelId: number;
  dailyMissions: DailyMission[];
  unlockedBadges: string[];
}

export interface SmartFeedbackScores {
  grammarScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  vocabScore: number;
  confidenceScore: number;
  overallGrade: string;
  suggestions: string[];
}

export interface WeakArea {
  id: string;
  topic: string;
  category: string;
  errorCount: number;
  lastPracticed: string;
  reviewNeeded: boolean;
  exampleSentence: string;
}

export interface StudentBreakdown {
  phonetic: string;
  grammarTip: string;
  keywords: Array<{ word: string; meaning: string; type: string }>;
  simpleAlternative?: string;
  usageContext: string;
}

export interface GrammarHighlight {
  text: string;
  type: 'error' | 'correction' | 'suggestion';
  explanation?: string;
}

export interface GrammarCorrection {
  originalText: string;
  correctedText: string;
  explanation: string;
  whyWrong: string;
  betterAlternative: string;
  highlights: GrammarHighlight[];
}

export interface VocabWord {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  pronunciation: string;
  ipa: string;
  teluguMeaning: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentences: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced';
  isSaved: boolean;
  sourceSentence?: string;
  spacedRepetitionLevel?: number;
}

export interface PronunciationWordScore {
  word: string;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ipa: string;
  suggestion: string;
}

export interface PronunciationResult {
  overallScore: number;
  phoneticGuidance: string;
  wordScores: PronunciationWordScore[];
  transcription?: string;
}

export type SpeakingScenario =
  | 'Interview'
  | 'Shopping'
  | 'Hotel'
  | 'Airport'
  | 'Restaurant'
  | 'Hospital'
  | 'College'
  | 'Office'
  | 'Daily Conversation';

export interface SpeakingChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  grammarCorrection?: GrammarCorrection;
}

export interface WordOfTheDayItem {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  ipa: string;
  teluguMeaning: string;
  usage: string;
  example: string;
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}

export interface DailyChallengeItem {
  id: string;
  title: string;
  category: 'Speaking' | 'Grammar' | 'Vocabulary' | 'Listening' | 'Conversation';
  description: string;
  targetGoal: string;
  completed: boolean;
  score?: number;
}

export interface SmartSuggestionItem {
  id: string;
  category:
    | 'Better Words'
    | 'Natural Expressions'
    | 'Idioms'
    | 'Phrasal Verbs'
    | 'Professional'
    | 'Formal'
    | 'Informal'
    | 'Business';
  original: string;
  suggested: string;
  explanation: string;
  contextExample: string;
}

export interface TranslationItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  timestamp: string;
  confidence: number;
  isFavorite: boolean;
  speaker?: 'user' | 'partner';
  contextMode?: ContextMode;
  studentAnalysis?: StudentBreakdown;
  grammarCorrection?: GrammarCorrection;
  extractedVocab?: VocabWord[];
}

export interface VoiceSettings {
  voiceGender: 'female' | 'male';
  rate: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
  noiseReduction: boolean;
  autoLanguageDetect: boolean;
  continuousMode: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  plan: 'Free Scholar' | 'Student Pro';
  dailyLimit: number;
  translatedCount: number;
  learningLevel: LearningLevel;
}

export interface DashboardStats {
  totalTranslations: number;
  voiceMinutes: number;
  wordsLearned: number;
  streakDays: number;
  grammarScore: number;
  pronunciationScore: number;
  speakingConfidence: number;
  historyCount: number;
  favoriteCount: number;
  topWords: Array<{ word: string; count: number; meaning: string }>;
  weeklyUsage: Array<{ day: string; voice: number; text: number }>;
  monthlyProgress: Array<{ month: string; grammar: number; vocab: number; speaking: number }>;
  achievements: Array<{ id: string; title: string; description: string; icon: string; unlocked: boolean; date?: string }>;
}

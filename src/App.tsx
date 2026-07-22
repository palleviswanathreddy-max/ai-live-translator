import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { TranslationItem, VoiceSettings, UserProfile, DashboardStats, VocabWord, LearningLevel, GrammarCorrection } from './types';
import { MASTER_VOCAB_DB } from './services/learningService';

// Lazy Loaded Route & Tab Components for Bundle Optimization
const LearningHub = lazy(() => import('./components/LearningHub').then(m => ({ default: m.LearningHub })));
const VoiceMode = lazy(() => import('./components/VoiceMode').then(m => ({ default: m.VoiceMode })));
const TextMode = lazy(() => import('./components/TextMode').then(m => ({ default: m.TextMode })));
const HistoryPanel = lazy(() => import('./components/HistoryPanel').then(m => ({ default: m.HistoryPanel })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Phrasebook = lazy(() => import('./components/Phrasebook').then(m => ({ default: m.Phrasebook })));
const VoiceSettingsModal = lazy(() => import('./components/VoiceSettingsModal').then(m => ({ default: m.VoiceSettingsModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));

// Loading Fallback Spinner Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh] p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase animate-pulse">Loading View...</span>
    </div>
  </div>
);

export function App() {
  const [activeTab, setActiveTab] = useState<string>('learning');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Saved Vocabulary Words State
  const [savedWords, setSavedWords] = useState<VocabWord[]>(() => {
    const saved = localStorage.getItem('ai_translator_saved_words');
    return saved ? JSON.parse(saved) : MASTER_VOCAB_DB.slice(0, 3);
  });

  // Initial Voice Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('ai_translator_settings');
    return saved ? JSON.parse(saved) : {
      voiceGender: 'female',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      autoPlay: true,
      noiseReduction: true,
      autoLanguageDetect: true,
      continuousMode: true
    };
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ai_translator_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-1',
      name: 'Student Scholar',
      email: 'student@mvlive.org',
      avatar: '',
      isLoggedIn: true,
      plan: 'Student Pro',
      dailyLimit: 500,
      translatedCount: 42,
      learningLevel: 'beginner'
    };
  });

  // Conversation History State
  const [history, setHistory] = useState<TranslationItem[]>(() => {
    const saved = localStorage.getItem('ai_translator_history');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'sample-1',
        sourceText: "నమస్కారం! నేను ఇంగ్లీష్ నేర్చుకోవాలనుకుంటున్నాను.",
        translatedText: "Hello! I want to learn English.",
        sourceLang: 'te-IN',
        targetLang: 'en-US',
        timestamp: '10:15 AM',
        confidence: 99,
        isFavorite: true,
        speaker: 'user',
        contextMode: 'learning',
        studentAnalysis: {
          phonetic: "Namaskāram! Nēnu iṅglīṣ nērčukōvālanukuṇṭunnānu.",
          grammarTip: "Use 'want to + learn' to express goals. Practice saying this phrase 3 times.",
          keywords: [
            { word: "Namaskaram", meaning: "Hello", type: "Greeting" },
            { word: "Nerchukovalani", meaning: "Want to learn", type: "Verb" }
          ],
          simpleAlternative: "Hi! I wish to speak English.",
          usageContext: "Education & Learning"
        }
      },
      {
        id: 'sample-2',
        sourceText: "Could you please speak a bit slower?",
        translatedText: "దయచేసి కొంచెం నెమ్మదిగా మాట్లాడగలరా?",
        sourceLang: 'en-US',
        targetLang: 'te-IN',
        timestamp: '10:16 AM',
        confidence: 98,
        isFavorite: false,
        speaker: 'partner',
        contextMode: 'learning',
        studentAnalysis: {
          phonetic: "Dayacēsi koñcaṁ nemmadigā māṭlāḍagalarā?",
          grammarTip: "'Could you please...' is a polite request modal phrase.",
          keywords: [
            { word: "Speak", meaning: "Matladu", type: "Verb" },
            { word: "Slower", meaning: "Nemmadiga", type: "Adverb" }
          ],
          simpleAlternative: "Please speak slowly.",
          usageContext: "Spoken Practice"
        }
      }
    ];
  });

  // Save Settings, History & Saved Words to LocalStorage
  useEffect(() => {
    localStorage.setItem('ai_translator_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  useEffect(() => {
    localStorage.setItem('ai_translator_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ai_translator_user', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('ai_translator_saved_words', JSON.stringify(savedWords));
  }, [savedWords]);

  // Handlers
  const handleAddHistory = (item: TranslationItem) => {
    setHistory(prev => [item, ...prev]);
    setUserProfile(prev => ({
      ...prev,
      translatedCount: prev.translatedCount + 1
    }));
  };

  const handleSaveGrammarCorrection = (correction: GrammarCorrection) => {
    const newItem: TranslationItem = {
      id: `grammar-hist-${Date.now()}`,
      sourceText: correction.originalText,
      translatedText: correction.correctedText,
      sourceLang: 'en-US',
      targetLang: 'en-US',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 99,
      isFavorite: false,
      grammarCorrection: correction
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleToggleSaveWord = (word: VocabWord) => {
    setSavedWords(prev => {
      const exists = prev.some(w => w.word.toLowerCase() === word.word.toLowerCase());
      if (exists) {
        return prev.filter(w => w.word.toLowerCase() !== word.word.toLowerCase());
      } else {
        return [{ ...word, isSaved: true }, ...prev];
      }
    });
  };

  const handleUpdateLevel = (lvl: LearningLevel) => {
    setUserProfile(prev => ({ ...prev, learningLevel: lvl }));
  };

  const handleToggleFavorite = (id: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  const handleDeleteEntry = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Dashboard Stats
  const dashboardStats: DashboardStats = {
    totalTranslations: history.length + 42,
    voiceMinutes: Math.round(history.length * 2.5) + 18,
    wordsLearned: savedWords.length + 15,
    streakDays: 5,
    grammarScore: 94,
    pronunciationScore: 92,
    speakingConfidence: 88,
    historyCount: history.length,
    favoriteCount: history.filter(h => h.isFavorite).length,
    topWords: [
      { word: "Fluency", count: 18, meaning: "ధారాళంగా మాట్లాడటం" },
      { word: "Enthusiastic", count: 14, meaning: "ఉత్సాహపూరితమైన" },
      { word: "Articulate", count: 12, meaning: "విస్పష్టంగా చెప్పడం" },
      { word: "Perseverance", count: 9, meaning: "పట్టుదల" }
    ],
    weeklyUsage: [
      { day: "Mon", voice: 6, text: 4 },
      { day: "Tue", voice: 9, text: 5 },
      { day: "Wed", voice: 14, text: 7 },
      { day: "Thu", voice: 8, text: 6 },
      { day: "Fri", voice: 11, text: 9 },
      { day: "Sat", voice: 16, text: 10 },
      { day: "Sun", voice: 10, text: 5 }
    ],
    monthlyProgress: [
      { month: 'May', grammar: 78, vocab: 65, speaking: 70 },
      { month: 'Jun', grammar: 86, vocab: 80, speaking: 82 },
      { month: 'Jul', grammar: 94, vocab: 92, speaking: 88 }
    ],
    achievements: [
      { id: 'a1', title: 'Grammar Guardian', description: 'Fixed 25 subject-verb agreement errors cleanly.', icon: 'Check', unlocked: true },
      { id: 'a2', title: 'Vocab Master', description: 'Saved 20+ words with IPA & Telugu meanings.', icon: 'Book', unlocked: true },
      { id: 'a3', title: 'Native Pronunciation Star', description: 'Scored >90% on Pronunciation Coach 5 times.', icon: 'Star', unlocked: true },
      { id: 'a4', title: 'Fluency Marathoner', description: 'Maintained a 5-day continuous learning streak.', icon: 'Flame', unlocked: true }
    ]
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-darkBg text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      
      {/* Top Header */}
      <Header
        user={userProfile}
        settings={voiceSettings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area with Suspense boundary */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'learning' && (
            <LearningHub
              level={userProfile.learningLevel || 'beginner'}
              onUpdateLevel={handleUpdateLevel}
              savedWords={savedWords}
              onToggleSaveWord={handleToggleSaveWord}
              settings={voiceSettings}
              onSaveGrammarCorrection={handleSaveGrammarCorrection}
            />
          )}

          {activeTab === 'voice' && (
            <VoiceMode
              settings={voiceSettings}
              onUpdateSettings={setVoiceSettings}
              onAddHistory={handleAddHistory}
              history={history}
              onToggleFavorite={handleToggleFavorite}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'text' && (
            <TextMode
              settings={voiceSettings}
              onAddHistory={handleAddHistory}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPanel
              history={history}
              settings={voiceSettings}
              onToggleFavorite={handleToggleFavorite}
              onDeleteEntry={handleDeleteEntry}
              onClearAll={handleClearHistory}
            />
          )}

          {activeTab === 'phrasebook' && (
            <Phrasebook
              settings={voiceSettings}
              onTranslatePhrase={(phrase) => {
                setActiveTab('voice');
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              stats={dashboardStats}
              onNavigateToVoice={() => setActiveTab('voice')}
              onNavigateToLearning={() => setActiveTab('learning')}
            />
          )}
        </Suspense>
      </main>

      {/* Mobile Navigation Tab Bar */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals with Suspense fallback */}
      <Suspense fallback={null}>
        {isSettingsOpen && (
          <VoiceSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={voiceSettings}
            onSave={(newSet) => setVoiceSettings(newSet)}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            user={userProfile}
            onUpdateUser={setUserProfile}
          />
        )}
      </Suspense>

    </div>
  );
}
export default App;

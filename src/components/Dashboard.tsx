import React, { useState } from 'react';
import { 
  BarChart3, Mic, BookOpen, Flame, Award, 
  TrendingUp, Sparkles, CheckCircle2, Clock, Volume2, MicOff, RefreshCw, GraduationCap, ShieldCheck, Check
} from 'lucide-react';
import { DashboardStats, VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';
import { speechRecognizer } from '../services/speechRecognition';

interface DashboardProps {
  stats: DashboardStats;
  onNavigateToVoice: () => void;
  onNavigateToLearning?: () => void;
}

const PRACTICE_PROMPTS = [
  { english: "Hello! How are you doing today?", telugu: "నమస్కారం! ఈరోజు మీరు ఎలా ఉన్నారు?", difficulty: "Beginner" },
  { english: "Could you please help me find the library?", telugu: "లైబ్రరీ ఎక్కడ ఉందో దయచేసి చెప్పగలరా?", difficulty: "Intermediate" },
  { english: "I am learning spoken English to improve my career.", telugu: "నా కెరీర్‌ను మెరుగుపరచడానికి నేను ఇంగ్లీష్ నేర్చుకుంటున్నాను.", difficulty: "Intermediate" },
  { english: "Thank you for your valuable time and advice.", telugu: "మీ అమూల్యమైన సమయానికి మరియు సలహాకు ధన్యవాదాలు.", difficulty: "Advanced" }
];

export const Dashboard: React.FC<DashboardProps> = ({ stats, onNavigateToVoice, onNavigateToLearning }) => {
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [isRecordingQuiz, setIsRecordingQuiz] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const activePrompt = PRACTICE_PROMPTS[currentPromptIdx];

  const handleListenSample = () => {
    speechSpeaker.speak(activePrompt.english, 'en-US', {
      voiceGender: 'female',
      rate: 0.85,
      pitch: 1.0,
      volume: 1.0,
      autoPlay: true,
      noiseReduction: true,
      autoLanguageDetect: true,
      continuousMode: false
    });
  };

  const handleStartQuizMic = () => {
    if (isRecordingQuiz) {
      speechRecognizer.stop();
      setIsRecordingQuiz(false);
    } else {
      setUserSpokenText('');
      setMatchScore(null);
      speechRecognizer.start('en-US', false, {
        onStart: () => setIsRecordingQuiz(true),
        onResult: (text, isFinal) => {
          setUserSpokenText(text);
          if (isFinal) {
            evaluateSpeechScore(text, activePrompt.english);
          }
        },
        onError: () => setIsRecordingQuiz(false),
        onEnd: () => setIsRecordingQuiz(false)
      });
    }
  };

  const evaluateSpeechScore = (spoken: string, target: string) => {
    const cleanSpoken = spoken.toLowerCase().replace(/[^a-z ]/g, '');
    const cleanTarget = target.toLowerCase().replace(/[^a-z ]/g, '');
    
    if (cleanSpoken === cleanTarget) {
      setMatchScore(100);
      return;
    }

    const spokenWords = cleanSpoken.split(' ');
    const targetWords = cleanTarget.split(' ');
    let matches = 0;
    
    spokenWords.forEach(w => {
      if (targetWords.includes(w)) matches++;
    });

    const calculated = Math.min(98, Math.max(60, Math.round((matches / targetWords.length) * 100)));
    setMatchScore(calculated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card bg-gradient-to-r from-brand-950/90 via-slate-900 to-slate-900 border border-brand-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Spoken English & Fluency Dashboard
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Progress & <span className="gradient-text">Learning Analytics</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Track your grammar improvement, vocabulary growth, speaking confidence, pronunciation scores, and daily streaks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToLearning && (
              <button
                onClick={onNavigateToLearning}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs tracking-wide shadow-lg flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" /> Go to Learning Academy
              </button>
            )}
            <button
              onClick={onNavigateToVoice}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-brand-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4" /> Live Voice Mode
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards - 8 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Grammar Score</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-emerald-300">{stats.grammarScore || 94}%</p>
          <span className="text-[10px] text-emerald-400 font-medium">↑ +6% this month</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vocab Growth</span>
            <BookOpen className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-white">{stats.wordsLearned} Words</p>
          <span className="text-[10px] text-cyan-400 font-medium">+18 new saved</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Speaking Confidence</span>
            <Mic className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-cyan-300">{stats.speakingConfidence || 88}%</p>
          <span className="text-[10px] text-cyan-400 font-medium">Fluent in scenarios</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pronunciation</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-amber-300">{stats.pronunciationScore || 92}%</p>
          <span className="text-[10px] text-amber-400 font-medium">Native rhythm match</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Learning Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-orange-300">{stats.streakDays} Days</p>
          <span className="text-[10px] text-orange-400 font-medium">Daily practice active</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Translations</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-white">{stats.totalTranslations}</p>
          <span className="text-[10px] text-indigo-300 font-medium">Real-time bilingual</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Voice Minutes</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-white">{stats.voiceMinutes} m</p>
          <span className="text-[10px] text-teal-300 font-medium">Total spoken time</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Favorites Saved</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-heading font-bold text-white">{stats.favoriteCount}</p>
          <span className="text-[10px] text-purple-300 font-medium">Quick reference</span>
        </div>

      </div>

      {/* Interactive Spoken Pronunciation Practice Quiz Widget */}
      <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/30 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Interactive Spoken Pronunciation Trainer
            </h3>
          </div>
          
          <button
            onClick={() => setCurrentPromptIdx((prev) => (prev + 1) % PRACTICE_PROMPTS.length)}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Next Sentence ({currentPromptIdx + 1}/{PRACTICE_PROMPTS.length})
          </button>
        </div>

        {/* Practice Card */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
          
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
              Level: {activePrompt.difficulty}
            </span>
            <span className="text-slate-400">{activePrompt.telugu}</span>
          </div>

          <div className="py-2">
            <p className="text-lg sm:text-xl font-heading font-bold text-white tracking-wide">
              "{activePrompt.english}"
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            
            <button
              onClick={handleListenSample}
              className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Volume2 className="w-4 h-4" /> Listen Native Accent
            </button>

            <button
              onClick={handleStartQuizMic}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isRecordingQuiz
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white hover:scale-105'
              }`}
            >
              {isRecordingQuiz ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecordingQuiz ? 'Listening... Speak Now' : 'Record Your Speech'}
            </button>

          </div>

          {/* User Spoken Result Feedback */}
          {userSpokenText && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1 text-xs">
              <span className="text-slate-400 font-semibold block">You Spoke:</span>
              <p className="text-cyan-300 font-medium">{userSpokenText}</p>

              {matchScore !== null && (
                <div className="pt-2 flex items-center justify-between border-t border-white/10">
                  <span className="text-slate-300">Pronunciation Accuracy:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                    matchScore > 85 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {matchScore}% Accuracy {matchScore > 85 ? '🎉 Great Job!' : '👍 Keep Practicing!'}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Monthly Progress Chart & Unlockable Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monthly Progress Trends */}
        <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Monthly Growth & Fluency Progress
          </h3>

          <div className="space-y-3 pt-2">
            {(stats.monthlyProgress || [
              { month: 'May', grammar: 78, vocab: 65, speaking: 70 },
              { month: 'Jun', grammar: 86, vocab: 80, speaking: 82 },
              { month: 'Jul', grammar: 94, vocab: 92, speaking: 88 }
            ]).map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Month of {m.month}</span>
                  <span className="text-emerald-400 font-mono">Overall: {Math.round((m.grammar + m.vocab + m.speaking) / 3)}%</span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Grammar Accuracy:</span>
                    <span className="text-emerald-300 font-semibold">{m.grammar}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${m.grammar}%` }} className="h-full bg-emerald-500" />
                  </div>

                  <div className="flex items-center justify-between text-slate-300 pt-1">
                    <span>Vocabulary Growth:</span>
                    <span className="text-cyan-300 font-semibold">{m.vocab}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${m.vocab}%` }} className="h-full bg-cyan-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements & Unlockables */}
        <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> English Fluency Achievements
          </h3>

          <div className="space-y-2.5 pt-1">
            {(stats.achievements || [
              { id: 'a1', title: 'Grammar Guardian', description: 'Fixed 25 subject-verb agreement errors cleanly.', icon: 'Check', unlocked: true },
              { id: 'a2', title: 'Vocab Master', description: 'Saved 20+ words with IPA & Telugu meanings.', icon: 'Book', unlocked: true },
              { id: 'a3', title: 'Native Pronunciation Star', description: 'Scored >90% on Pronunciation Coach 5 times.', icon: 'Star', unlocked: true },
              { id: 'a4', title: 'Fluency Marathoner', description: 'Maintained a 5-day continuous learning streak.', icon: 'Flame', unlocked: true }
            ]).map((ach) => (
              <div key={ach.id} className="p-3 rounded-xl bg-slate-950/80 border border-white/5 flex items-start gap-3 text-xs">
                <div className={`p-2 rounded-xl shrink-0 ${
                  ach.unlocked ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Award className="w-4 h-4" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ach.title}</span>
                    {ach.unlocked && (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

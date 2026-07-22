import React, { useState } from 'react';
import {
  X, Check, ArrowRight, Volume2, Mic, MicOff, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { Lesson, LessonQuestion, VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';
import { speechRecognizer } from '../services/speechRecognition';
import { analyzePronunciation } from '../services/learningService';

interface InteractiveLessonPlayerProps {
  lesson: Lesson;
  settings?: VoiceSettings;
  onClose: () => void;
  onCompleteLesson: (xpEarned: number, coinsEarned: number, accuracyPercent: number) => void;
}

export const InteractiveLessonPlayer: React.FC<InteractiveLessonPlayerProps> = ({
  lesson,
  settings,
  onClose,
  onCompleteLesson
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  
  // Sentence Builder State (Words tapped in order)
  const [tappedWords, setTappedWords] = useState<string[]>([]);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  
  // Feedback State
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const currentQ: LessonQuestion = lesson.questions[currentIdx % lesson.questions.length];
  const progressPercent = Math.round(((currentIdx + 1) / lesson.questions.length) * 100);

  const handleListenAudio = (text: string) => {
    speechSpeaker.speak(text, 'en-US', settings || {
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

  const handleTapWordBank = (word: string) => {
    if (isAnswerChecked) return;
    setTappedWords((prev) => [...prev, word]);
  };

  const handleRemoveTappedWord = (index: number) => {
    if (isAnswerChecked) return;
    setTappedWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      speechRecognizer.stop();
      setIsRecording(false);
    } else {
      setSpokenText('');
      speechRecognizer.start('en-US', false, {
        onStart: () => setIsRecording(true),
        onResult: (text, isFinal) => {
          setSpokenText(text);
        },
        onError: () => setIsRecording(false),
        onEnd: () => setIsRecording(false)
      });
    }
  };

  const handleCheckAnswer = () => {
    let correct = false;

    if (currentQ.type === 'mcq') {
      const selectedOpt = currentQ.options?.find((o) => o.id === selectedOptionId);
      correct = !!selectedOpt?.isCorrect;
    } else if (currentQ.type === 'sentence_builder') {
      const builtSentence = tappedWords.join(' ').toLowerCase().trim();
      const targetSentence = (currentQ.targetSentence || '').toLowerCase().trim();
      correct = builtSentence === targetSentence;
    } else if (currentQ.type === 'speak_repeat' || currentQ.type === 'roleplay') {
      const target = (currentQ.targetSentence || currentQ.prompt).toLowerCase();
      const spoken = spokenText.toLowerCase();
      const pResult = analyzePronunciation(target, spoken);
      correct = pResult.overallScore >= 65 || spoken.length > 5;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);
    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 >= lesson.questions.length) {
      // Complete lesson
      const accuracy = Math.round((correctAnswersCount / lesson.questions.length) * 100);
      onCompleteLesson(lesson.xpReward, lesson.coinReward, Math.max(75, accuracy));
    } else {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setTappedWords([]);
      setSpokenText('');
      setIsAnswerChecked(false);
      setIsCorrect(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      
      {/* Top Header & Progress Bar */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-4">
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden border border-white/10">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-brand-600 via-cyan-500 to-emerald-400 transition-all duration-300"
          />
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/30">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>+{lesson.xpReward} XP</span>
        </div>
      </div>

      {/* Main Question Container */}
      <div className="max-w-2xl mx-auto w-full my-auto py-6 space-y-6">
        
        {/* Question Prompt */}
        <div className="space-y-2 text-center sm:text-left">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-500/30">
            Question {currentIdx + 1} of {lesson.questions.length} • {currentQ.type.toUpperCase().replace('_', ' ')}
          </span>

          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white leading-snug">{currentQ.prompt}</h2>
          {currentQ.teluguPrompt && (
            <p className="text-xs font-semibold text-emerald-300">{currentQ.teluguPrompt}</p>
          )}
        </div>

        {/* Question Render Types */}

        {/* 1. Multiple Choice Questions */}
        {currentQ.type === 'mcq' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options?.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let btnStyle = 'bg-slate-900/80 border-white/10 text-slate-200 hover:border-cyan-400';
              if (isAnswerChecked) {
                if (opt.isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                else if (isSelected) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold';
              } else if (isSelected) {
                btnStyle = 'bg-brand-600/30 border-brand-500 text-white font-bold ring-2 ring-brand-500/40';
              }

              return (
                <button
                  key={opt.id}
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`p-4 rounded-2xl border text-xs text-left transition-all space-y-1 ${btnStyle}`}
                >
                  <span className="font-bold block text-sm">{opt.text}</span>
                  {opt.teluguText && <span className="text-[11px] text-slate-400">{opt.teluguText}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Interactive Sentence Builder (Word Bank Tapping) */}
        {currentQ.type === 'sentence_builder' && (
          <div className="space-y-5">
            
            {/* Tapped Words Display Box */}
            <div className="min-h-[70px] p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-cyan-500/30 flex flex-wrap items-center gap-2">
              {tappedWords.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Tap words below in correct order...</span>
              ) : (
                tappedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveTappedWord(idx)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 text-white text-xs font-bold shadow-md hover:brightness-125 transition-all"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Word Bank Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {currentQ.wordBank?.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTapWordBank(word)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-cyan-300 text-xs font-semibold shadow-sm transition-all"
                >
                  {word}
                </button>
              ))}
            </div>

          </div>
        )}

        {/* 3. Speaking / Voice Repeat / Roleplay */}
        {(currentQ.type === 'speak_repeat' || currentQ.type === 'roleplay') && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-4">
            <button
              onClick={() => handleListenAudio(currentQ.targetSentence || currentQ.prompt)}
              className="px-4 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 mx-auto"
            >
              <Volume2 className="w-4 h-4" /> Listen Audio Reference
            </button>

            <div className="py-2">
              <button
                onClick={handleToggleRecord}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white transition-all shadow-xl ${
                  isRecording ? 'bg-rose-500 animate-pulse ring-4 ring-rose-500/40' : 'bg-gradient-to-tr from-cyan-600 to-brand-600'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
              <span className="text-xs text-slate-400 block mt-2">
                {isRecording ? 'Listening... Speak now!' : 'Tap mic to record your voice'}
              </span>
            </div>

            {spokenText && (
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs">
                <span className="text-slate-400 block">Recognized Speech:</span>
                <span className="text-cyan-300 font-bold italic">"{spokenText}"</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Instant AI Teacher Feedback & Action Bar */}
      <div className="max-w-3xl mx-auto w-full pt-4 border-t border-white/10">
        
        {isAnswerChecked ? (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" /> : <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />}
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-sm block">{isCorrect ? '🎉 Great Job! Correct Answer!' : '💡 Learning Opportunity:'}</span>
                <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 shrink-0"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Answer to complete question & earn XP!</span>
            <button
              onClick={handleCheckAnswer}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-1.5 transition-all"
            >
              Check Answer
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Sun, Volume2, Sparkles, CheckCircle2, HelpCircle, Check, X } from 'lucide-react';
import { WordOfTheDayItem, VoiceSettings } from '../types';
import { WORD_OF_THE_DAY } from '../services/learningService';
import { speechSpeaker } from '../services/speechSynthesis';

interface WordOfTheDayViewProps {
  settings?: VoiceSettings;
}

export const WordOfTheDayView: React.FC<WordOfTheDayViewProps> = ({ settings }) => {
  const [wordData] = useState<WordOfTheDayItem>(WORD_OF_THE_DAY);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleSpeak = () => {
    speechSpeaker.speak(wordData.word, 'en-US', settings || {
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

  const handleAnswerQuiz = (idx: number) => {
    setSelectedOption(idx);
    setQuizSubmitted(true);
  };

  const isCorrect = selectedOption === wordData.quiz.answerIndex;

  return (
    <div className="p-6 rounded-3xl glass-card border border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 space-y-6">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Daily Vocabulary Highlight</span>
            <h3 className="text-lg font-heading font-bold text-white">Word of the Day</h3>
          </div>
        </div>

        <button
          onClick={handleSpeak}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Volume2 className="w-4 h-4" /> Pronounce
        </button>
      </div>

      {/* Main Featured Word Card */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-4">
        
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-heading font-extrabold text-white tracking-wide">{wordData.word}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {wordData.partOfSpeech}
            </span>
          </div>

          <div className="text-xs text-cyan-300 font-mono">
            <span>IPA: {wordData.ipa}</span>
          </div>
        </div>

        {/* Telugu Meaning */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-semibold text-amber-200 flex items-center justify-between">
          <span>తెలుగు అర్థం (Telugu Meaning):</span>
          <span className="text-white font-bold">{wordData.teluguMeaning}</span>
        </div>

        {/* Definition & Usage */}
        <div className="space-y-2 text-xs">
          <p className="text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-400">Meaning:</span> {wordData.meaning}
          </p>
          <p className="text-slate-300 leading-relaxed">
            <span className="font-bold text-cyan-400">Usage Tip:</span> {wordData.usage}
          </p>
        </div>

        {/* Example Sentence Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1 text-xs">
          <span className="text-amber-400 font-bold block">Example Sentence:</span>
          <p className="text-white italic">"{wordData.example}"</p>
        </div>

      </div>

      {/* Daily Instant Quiz Widget */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Daily Mini-Quiz</h4>
        </div>

        <p className="text-xs font-semibold text-slate-200">{wordData.quiz.question}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {wordData.quiz.options.map((option, idx) => {
            let btnStyle = 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800';
            if (quizSubmitted) {
              if (idx === wordData.quiz.answerIndex) {
                btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
              } else if (idx === selectedOption) {
                btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold';
              }
            }

            return (
              <button
                key={idx}
                disabled={quizSubmitted}
                onClick={() => handleAnswerQuiz(idx)}
                className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{option}</span>
                {quizSubmitted && idx === wordData.quiz.answerIndex && <Check className="w-4 h-4 text-emerald-400" />}
                {quizSubmitted && idx === selectedOption && idx !== wordData.quiz.answerIndex && <X className="w-4 h-4 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {quizSubmitted && (
          <div className={`p-3 rounded-xl border text-xs space-y-1 ${
            isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}>
            <span className="font-bold block">{isCorrect ? '🎉 Correct Answer!' : '💡 Learning Note:'}</span>
            <p>{wordData.quiz.explanation}</p>
          </div>
        )}
      </div>

    </div>
  );
};

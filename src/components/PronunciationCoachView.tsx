import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, Award, Play, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { PronunciationResult, VoiceSettings } from '../types';
import { analyzePronunciation } from '../services/learningService';
import { speechRecognizer } from '../services/speechRecognition';
import { speechSpeaker } from '../services/speechSynthesis';

interface PronunciationCoachViewProps {
  targetSentence?: string;
  settings?: VoiceSettings;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceGender: 'female',
  rate: 0.85,
  pitch: 1.0,
  volume: 1.0,
  autoPlay: true,
  noiseReduction: true,
  autoLanguageDetect: true,
  continuousMode: false
};

export const PronunciationCoachView: React.FC<PronunciationCoachViewProps> = ({
  targetSentence = 'I am enthusiastic about improving my spoken English pronunciation.',
  settings
}) => {
  const [practiceSentence, setPracticeSentence] = useState(targetSentence);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [analysis, setAnalysis] = useState<PronunciationResult | null>(null);

  useEffect(() => {
    const unsubscribe = speechRecognizer.onStateChange((state) => {
      setIsRecording(state === 'LISTENING' || state === 'STARTING');
    });
    return unsubscribe;
  }, []);

  const SAMPLE_PRACTICE_PHRASES = [
    'I am enthusiastic about improving my spoken English pronunciation.',
    'Could you please guide me to the nearest metro station?',
    'Perseverance and daily practice will build natural fluency.',
    'I would appreciate your valuable feedback on my presentation.'
  ];

  const handleListenReference = () => {
    speechSpeaker.speak(practiceSentence, 'en-US', settings || DEFAULT_VOICE_SETTINGS);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      speechRecognizer.stop();
    } else {
      setSpokenText('');
      setAnalysis(null);
      speechRecognizer.start('en-US', false, {
        onStart: () => setIsRecording(true),
        onResult: (text, isFinal) => {
          setSpokenText(text);
          if (isFinal) {
            const res = analyzePronunciation(practiceSentence, text);
            setAnalysis(res);
          }
        },
        onError: () => setIsRecording(false),
        onEnd: () => setIsRecording(false)
      });
    }
  };

  return (
    <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-white">AI Pronunciation Coach</h3>
            <p className="text-xs text-slate-400">Speech score meter, difficult word tags, phonetic IPA guidance & replay practice.</p>
          </div>
        </div>

        <button
          onClick={handleListenReference}
          className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Volume2 className="w-4 h-4" /> Listen Native Accent
        </button>
      </div>

      {/* Target Sentence Selector / Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Sentence to Practice Speaking:
        </label>
        <textarea
          rows={2}
          value={practiceSentence}
          onChange={(e) => {
            setPracticeSentence(e.target.value);
            setAnalysis(null);
          }}
          className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-medium"
        />

        {/* Quick Sample Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">Sample sentences:</span>
          {SAMPLE_PRACTICE_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPracticeSentence(phrase);
                setAnalysis(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 font-medium whitespace-nowrap border border-white/5 transition-all"
            >
              "{phrase.slice(0, 28)}..."
            </button>
          ))}
        </div>
      </div>

      {/* Record Mic & Action Bar */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleRecord}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all shadow-xl ${
              isRecording
                ? 'bg-rose-500 animate-pulse ring-4 ring-rose-500/30'
                : 'bg-gradient-to-tr from-cyan-600 to-blue-500 hover:scale-105 shadow-cyan-500/30'
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <div>
            <span className="text-xs font-bold text-white block">
              {isRecording ? 'Listening... Speak Now!' : 'Press Microphone to Start Speaking'}
            </span>
            <p className="text-[11px] text-slate-400">Speak clearly at a natural pace into your mic.</p>
          </div>
        </div>

        {spokenText && (
          <div className="text-right text-xs">
            <span className="text-slate-400 block">Recognized Speech:</span>
            <span className="text-cyan-300 font-semibold italic">"{spokenText}"</span>
          </div>
        )}

      </div>

      {/* Analysis Score Dashboard */}
      {analysis && (
        <div className="space-y-5 pt-2">
          
          {/* Main Score Ring & Status Header */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-6">
            
            {/* Score Ring Gauge */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-500 to-emerald-400 p-[3px] flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold font-heading text-white">{analysis.overallScore}%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Score</span>
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">Pronunciation Analysis Result</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{analysis.phoneticGuidance}</p>
            </div>

          </div>

          {/* Word Difficulty & Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Word-by-Word Accuracy & Phonetic Breakdown:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {analysis.wordScores.map((wScore, idx) => {
                const diffColor =
                  wScore.difficulty === 'easy'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : wScore.difficulty === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{wScore.word}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${diffColor}`}>
                        {wScore.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-300 font-mono">IPA: {wScore.ipa}</span>
                      <span className="font-bold text-white">{wScore.score}%</span>
                    </div>

                    <p className="text-[11px] text-slate-400">{wScore.suggestion}</p>

                    <button
                      onClick={() => speechSpeaker.speak(wScore.word, 'en-US', settings || DEFAULT_VOICE_SETTINGS)}
                      className="w-full py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-semibold text-cyan-300 flex items-center justify-center gap-1 transition-all"
                    >
                      <Volume2 className="w-3 h-3" /> Replay Word Audio
                    </button>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

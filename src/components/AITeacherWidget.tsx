import React, { useState } from 'react';
import { Sparkles, GraduationCap, Volume2, Lightbulb, CheckCircle2, MessageCircle } from 'lucide-react';
import { VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';

interface AITeacherWidgetProps {
  message?: string;
  tip?: string;
  settings?: VoiceSettings;
}

export const AITeacherWidget: React.FC<AITeacherWidgetProps> = ({
  message = 'Hi! I am Coach Maya, your friendly AI English Teacher. Practice a little every day to build confidence!',
  tip = 'Tip: Remember that in English, verbs change form with third-person subjects (e.g. He speaks, She works).',
  settings
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSpeakCoach = () => {
    speechSpeaker.speak(message, 'en-US', settings || {
      voiceGender: 'female',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      autoPlay: true,
      noiseReduction: true,
      autoLanguageDetect: true,
      continuousMode: false
    });
  };

  return (
    <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 relative space-y-2">
      
      <div className="flex items-center justify-between">
        {/* Coach Character Avatar */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 via-brand-500 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-white text-sm">
              <GraduationCap className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Coach Maya</span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI English Teacher
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Always here to correct mistakes & encourage you!</p>
          </div>
        </div>

        {/* Listen Audio */}
        <button
          onClick={handleSpeakCoach}
          className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs transition-all"
          title="Listen Coach Speech"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Bubble */}
      {isExpanded && (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-1.5 animate-fadeIn">
          <p className="text-slate-200 font-medium leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>"{message}"</span>
          </p>

          {tip && (
            <div className="pt-1.5 border-t border-white/5 text-[11px] text-cyan-300 flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { X, Target, Sparkles, RefreshCw, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { WeakArea } from '../types';
import { INITIAL_WEAK_AREAS } from '../services/gamificationService';

interface WeakAreasReviewModalProps {
  onClose: () => void;
}

export const WeakAreasReviewModal: React.FC<WeakAreasReviewModalProps> = ({ onClose }) => {
  const weakAreas: WeakArea[] = INITIAL_WEAK_AREAS;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-xl w-full p-6 rounded-3xl glass-card border border-indigo-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-left space-y-5 animate-scaleUp shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-brand-500 text-white shadow-md">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white">Personalized Weak Area Review</h3>
              <p className="text-xs text-slate-400">Spaced repetition vocabulary & targeted grammar revision.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Tracked Weak Areas */}
        <div className="space-y-3">
          {weakAreas.map((area) => (
            <div key={area.id} className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase border border-indigo-500/30">
                    {area.category}
                  </span>
                  <h4 className="text-sm font-bold text-white">{area.topic}</h4>
                </div>

                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  {area.errorCount} Mistakes Tracked
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-cyan-400 block">Correct Spoken Form:</span>
                <p className="italic text-white">"{area.exampleSentence}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Practice Weak Areas Now
        </button>

      </div>
    </div>
  );
};

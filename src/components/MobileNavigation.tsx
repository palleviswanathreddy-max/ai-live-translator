import React from 'react';
import { Mic, Languages, History, BarChart3, Settings, BookMarked, GraduationCap } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav px-2 py-2 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="flex items-center justify-around">
        
        {/* Learning Academy Tab */}
        <button
          onClick={() => setActiveTab('learning')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'learning'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="English Learning Academy Tab"
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'learning' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>
            <GraduationCap className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px]">Academy</span>
        </button>

        {/* Real-Time Voice Tab */}
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'voice'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Real-Time Voice Translation Tab"
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'voice' ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Voice</span>
        </button>

        {/* Text Mode Tab */}
        <button
          onClick={() => setActiveTab('text')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'text'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Text Translation Tab"
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'text' ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>
            <Languages className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Text</span>
        </button>

        {/* Phrasebook Tab */}
        <button
          onClick={() => setActiveTab('phrasebook')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'phrasebook'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Spoken Phrasebook Tab"
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'phrasebook' ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>
            <BookMarked className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Phrases</span>
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Analytics</span>
        </button>

        {/* History Tab */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Conversation History Tab"
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'history' ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>
            <History className="w-5 h-5" />
          </div>
          <span className="text-[10px]">History</span>
        </button>

      </div>
    </div>
  );
};

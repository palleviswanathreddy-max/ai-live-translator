import React, { useState } from 'react';
import { 
  BookMarked, Volume2, Search, Sparkles, Play, Star, 
  Check, ArrowRight, GraduationCap, Compass, Briefcase, MessageSquare
} from 'lucide-react';
import { VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';
import { TELUGU_ENGLISH_DICTIONARY, DictionaryEntry } from '../utils/dictionary';

interface PhrasebookProps {
  settings: VoiceSettings;
  onTranslatePhrase: (phrase: string, fromLang: 'te-IN' | 'en-US') => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Phrases', icon: BookMarked },
  { id: 'Daily Greetings', name: 'Greetings', icon: MessageSquare },
  { id: 'Spoken English Practice', name: 'Spoken Practice', icon: GraduationCap },
  { id: 'Introductions', name: 'Introductions', icon: Compass },
  { id: 'Shopping & Travel', name: 'Travel & Shopping', icon: Briefcase },
];

export const Phrasebook: React.FC<PhrasebookProps> = ({ settings, onTranslatePhrase }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const filteredPhrases = TELUGU_ENGLISH_DICTIONARY.filter(entry => {
    const matchesCategory = selectedCategory === 'all' || entry.usageContext.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = 
      entry.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.telugu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.phonetic.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handlePlayAudio = (englishText: string, idx: number) => {
    setPlayingIndex(idx);
    speechSpeaker.speak(englishText, 'en-US', settings, () => {
      setPlayingIndex(null);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card bg-gradient-to-r from-brand-950/80 via-slate-900 to-slate-900 border border-brand-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 flex items-center gap-1">
                <BookMarked className="w-3.5 h-3.5" /> Curated Spoken Phrasebook
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Essential Telugu ↔ English <span className="gradient-text">Phrasebook</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Master daily conversation phrases, phonetic pronunciations, and spoken English sentence patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-4">
        
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrasebook by Telugu or English words..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {cat.name}
              </button>
            );
          })}
        </div>

      </div>

      {/* Phrase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPhrases.length === 0 ? (
          <div className="col-span-full p-12 rounded-3xl glass-card text-center text-slate-400">
            <p className="text-sm font-medium">No matching phrases found.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query.</p>
          </div>
        ) : (
          filteredPhrases.map((entry, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold text-[10px] uppercase border border-cyan-500/20">
                    {entry.usageContext}
                  </span>

                  <button
                    onClick={() => handlePlayAudio(entry.english, idx)}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      playingIndex === idx
                        ? 'bg-cyan-500 text-white animate-pulse'
                        : 'bg-slate-800 text-cyan-300 hover:bg-cyan-600 hover:text-white'
                    }`}
                    aria-label={`Listen audio for ${entry.english}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Listen
                  </button>
                </div>

                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Telugu:
                  </span>
                  <p className="text-sm font-bold text-white">{entry.telugu}</p>

                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block pt-1">
                    English Translation:
                  </span>
                  <p className="text-sm font-bold text-cyan-200">{entry.english}</p>
                </div>

                {entry.phonetic && (
                  <p className="text-[11px] text-emerald-300 font-mono mt-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    Phonetic: {entry.phonetic}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 italic">{entry.grammarTip.slice(0, 45)}...</span>
                <button
                  onClick={() => onTranslatePhrase(entry.telugu, 'te-IN')}
                  className="text-brand-300 hover:text-white font-semibold flex items-center gap-1 text-[11px] transition-colors"
                >
                  Practice <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

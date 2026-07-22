import React, { useState } from 'react';
import { Sparkles, Copy, Check, Search, ArrowRight, Volume2, Lightbulb } from 'lucide-react';
import { SmartSuggestionItem, VoiceSettings } from '../types';
import { MASTER_SMART_SUGGESTIONS } from '../services/learningService';
import { speechSpeaker } from '../services/speechSynthesis';

interface SmartSuggestionsViewProps {
  settings?: VoiceSettings;
}

export const SmartSuggestionsView: React.FC<SmartSuggestionsViewProps> = ({ settings }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const CATEGORIES = [
    'All',
    'Better Words',
    'Natural Expressions',
    'Idioms',
    'Phrasal Verbs',
    'Professional',
    'Formal',
    'Informal',
    'Business'
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    speechSpeaker.speak(text, 'en-US', settings || {
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

  const filteredItems = MASTER_SMART_SUGGESTIONS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.suggested.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-500 text-white shadow-md shadow-cyan-500/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-white">Smart English Expression Suggestions</h3>
            <p className="text-xs text-slate-400">Upgrade plain sentences to natural expressions, idioms, phrasal verbs & professional tone.</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-400 shadow-md'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search expressions, idioms, or formal words..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Suggestions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3">
            
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                {item.category}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSpeak(item.suggested)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs transition-all"
                  title="Listen Pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopy(item.id, item.suggested)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all"
                  title="Copy Expression"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Comparison */}
            <div className="space-y-1 text-xs">
              <span className="text-slate-400 line-through block">Plain: "{item.original}"</span>
              <p className="text-sm font-heading font-bold text-emerald-300 flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" /> "{item.suggested}"
              </p>
            </div>

            {/* Explanation */}
            <p className="text-xs text-slate-300 leading-relaxed">{item.explanation}</p>

            {/* Context Example */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-300">
              <span className="font-semibold text-cyan-400 block">Context Example:</span>
              <span className="italic">"{item.contextExample}"</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

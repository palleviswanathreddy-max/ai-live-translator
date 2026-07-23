import React, { useState } from 'react';
import { 
  Search, Star, Trash2, Download, FileText, FileSpreadsheet, 
  Play, Pause, Volume2, Sparkles, Filter, CheckCircle, Code
} from 'lucide-react';
import { TranslationItem, VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';
import { exportToTXT, exportToPDF, exportToDOCX, exportToJSON } from '../services/exportService';

interface HistoryPanelProps {
  history: TranslationItem[];
  settings: VoiceSettings;
  onToggleFavorite: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = React.memo(({
  history,
  settings,
  onToggleFavorite,
  onDeleteEntry,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'te-en' | 'en-te'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Filter history entries
  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'favorites') return item.isFavorite;
    if (filterMode === 'te-en') return item.sourceLang === 'te-IN';
    if (filterMode === 'en-te') return item.sourceLang === 'en-US';

    return true;
  });

  const handlePlayAudio = (item: TranslationItem) => {
    if (playingId === item.id) {
      speechSpeaker.stop();
      setPlayingId(null);
    } else {
      setPlayingId(item.id);
      speechSpeaker.speak(item.translatedText, item.targetLang, settings, () => {
        setPlayingId(null);
      });
    }
  };

  const triggerExport = async (type: 'pdf' | 'txt' | 'docx' | 'json') => {
    if (history.length === 0) return;
    
    if (type === 'txt') {
      exportToTXT(filteredHistory);
      setExportMessage("Exported transcript to TXT!");
    } else if (type === 'pdf') {
      exportToPDF(filteredHistory);
      setExportMessage("Exported transcript to PDF!");
    } else if (type === 'docx') {
      await exportToDOCX(filteredHistory);
      setExportMessage("Exported transcript to Word (DOCX)!");
    } else if (type === 'json') {
      exportToJSON(filteredHistory);
      setExportMessage("Exported transcript to JSON format!");
    }

    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleConfirmClearAll = () => {
    if (window.confirm("Are you sure you want to clear all learning history entries?")) {
      onClearAll();
      setExportMessage("All learning history cleared.");
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Export Toast Notification */}
      {exportMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" /> {exportMessage}
        </div>
      )}

      {/* Header & Export Toolbar */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Learning History & Multi-Format Exports
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Review saved spoken dialogues, grammar mistakes, and export in PDF, TXT, Word DOCX, or JSON formats.
            </p>
          </div>

          {/* Export & Clear Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => triggerExport('pdf')}
              disabled={history.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-900/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>

            <button
              onClick={() => triggerExport('docx')}
              disabled={history.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-brand-900/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> DOCX
            </button>

            <button
              onClick={() => triggerExport('json')}
              disabled={history.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Code className="w-3.5 h-3.5" /> JSON
            </button>

            <button
              onClick={() => triggerExport('txt')}
              disabled={history.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> TXT
            </button>

            <button
              onClick={handleConfirmClearAll}
              disabled={history.length === 0}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
              title="Clear all history entries"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative w-full sm:flex-1">
            <label htmlFor="history-search-input" className="sr-only">Search Conversation</label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="history-search-input"
              name="historySearch"
              autoComplete="off"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversation keywords..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterMode === 'all' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilterMode('favorites')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                filterMode === 'favorites' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> Favorites
            </button>
            <button
              onClick={() => setFilterMode('te-en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterMode === 'te-en' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Telugu → English
            </button>
          </div>

        </div>

      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="p-12 rounded-3xl glass-card text-center text-slate-400 space-y-2">
            <p className="text-sm font-medium">No matching history entries found.</p>
            <p className="text-xs text-slate-500">Translations from voice or typing mode will be preserved here.</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-500/30 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-300 uppercase text-[10px] tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {item.sourceLang === 'te-IN' ? 'Telugu ➔ English' : 'English ➔ Telugu'}
                  </span>
                  <span className="text-slate-400">{item.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className={`p-1 rounded transition-colors ${
                      item.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => onDeleteEntry(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-900/60 text-xs space-y-1">
                  <span className="text-slate-400 font-semibold block">Original Text:</span>
                  <p className="text-slate-200">{item.sourceText}</p>
                </div>

                <div className="p-3 rounded-xl bg-brand-950/40 border border-cyan-500/20 text-xs space-y-1">
                  <span className="text-cyan-400 font-semibold block">Translation:</span>
                  <p className="text-white font-bold">{item.translatedText}</p>
                  
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handlePlayAudio(item)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-semibold flex items-center gap-1"
                    >
                      {playingId === item.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      Listen Audio
                    </button>
                  </div>
                </div>
              </div>

              {item.grammarCorrection && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <span className="text-amber-400 font-bold block">Grammar Doctor Correction:</span>
                  <p className="text-white font-semibold">"{item.grammarCorrection.correctedText}"</p>
                  <p className="text-slate-300 text-[11px]">{item.grammarCorrection.explanation}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
});

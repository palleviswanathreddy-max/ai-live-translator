import React, { useState } from 'react';
import { BookOpen, Bookmark, BookmarkCheck, Volume2, Sparkles, Search, ArrowRight } from 'lucide-react';
import { VocabWord, VoiceSettings } from '../types';
import { extractVocabulary } from '../services/learningService';
import { MASTER_1000_VOCAB_DB } from '../services/contentEngine';
import { speechSpeaker } from '../services/speechSynthesis';

interface VocabularyBuilderViewProps {
  sentenceInput?: string;
  savedWords: VocabWord[];
  onToggleSaveWord: (word: VocabWord) => void;
  settings?: VoiceSettings;
}

export const VocabularyBuilderView: React.FC<VocabularyBuilderViewProps> = ({
  sentenceInput = '',
  savedWords,
  onToggleSaveWord,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'all_1000' | 'extracted' | 'saved' | 'practice'>('all_1000');
  const [customInput, setCustomInput] = useState(sentenceInput || 'Practice daily to build fluency and express ideas clearly.');
  const [extractedWords, setExtractedWords] = useState<VocabWord[]>(() => extractVocabulary(customInput));
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  
  // Practice Flashcard State
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleExtract = (text: string) => {
    setCustomInput(text);
    if (text.trim()) {
      setExtractedWords(extractVocabulary(text));
    }
  };

  const handleSpeak = (text: string) => {
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

  const isWordSaved = (w: VocabWord) => {
    return savedWords.some((sw) => sw.word.toLowerCase() === w.word.toLowerCase());
  };

  const currentBank =
    activeTab === 'all_1000'
      ? MASTER_1000_VOCAB_DB
      : activeTab === 'saved'
      ? savedWords
      : extractedWords;

  const filteredWords = currentBank.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.teluguMeaning.includes(searchQuery) ||
      w.meaning.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiff = difficultyFilter === 'all' || w.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const activePracticeWord = savedWords.length > 0 ? savedWords[flashcardIdx % savedWords.length] : MASTER_1000_VOCAB_DB[0];

  return (
    <div className="p-6 rounded-3xl glass-card border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 space-y-6">
      
      {/* Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-white">Smart 1000+ Vocabulary Bank</h3>
            <p className="text-xs text-slate-400">Original vocabulary database with IPA, Telugu meanings (తెలుగు అర్థాలు) & flashcards.</p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('all_1000')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'all_1000' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            1000+ Bank ({MASTER_1000_VOCAB_DB.length})
          </button>
          <button
            onClick={() => setActiveTab('extracted')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'extracted' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Extractor
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'saved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Saved ({savedWords.length})
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'practice' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" /> Flashcards
          </button>
        </div>
      </div>

      {/* Main Extractor View */}
      {activeTab === 'extracted' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="vocab-custom-sentence" className="text-xs font-semibold text-slate-300">
              Type sentence to extract vocabulary terms:
            </label>
            <input
              id="vocab-custom-sentence"
              name="customSentence"
              autoComplete="off"
              type="text"
              value={customInput}
              onChange={(e) => handleExtract(e.target.value)}
              placeholder="Type or paste any English sentence..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm font-medium"
            />
          </div>
        </div>
      )}

      {/* Search Bar & Difficulty Filters */}
      {activeTab !== 'practice' && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <label htmlFor="vocab-search-input" className="sr-only">Search Vocabulary</label>
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              id="vocab-search-input"
              name="vocabSearch"
              autoComplete="off"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 1000+ words or Telugu meanings..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all border ${
                  difficultyFilter === diff
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-slate-900 text-slate-400 border-white/5'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Word Cards Grid View */}
      {activeTab !== 'practice' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.length === 0 ? (
            <div className="col-span-2 p-8 text-center bg-slate-950/50 rounded-2xl border border-white/5 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">
                No matching vocabulary words found in current view.
              </p>
            </div>
          ) : (
            filteredWords.slice(0, 40).map((item) => {
              const saved = isWordSaved(item);
              return (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 transition-all space-y-3 relative group">
                  
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-heading font-bold text-white">{item.word}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.partOfSpeech}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 capitalize">
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-cyan-300 font-mono">
                        <span>IPA: {item.ipa}</span>
                        <span>•</span>
                        <span>Pron: [{item.pronunciation}]</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSpeak(item.word)}
                        title="Listen Pronunciation"
                        className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleSaveWord(item)}
                        title={saved ? 'Remove from saved' : 'Save to my vocabulary'}
                        className={`p-2 rounded-xl border transition-all ${
                          saved
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center justify-between">
                    <span>తెలుగు అర్థం (Telugu):</span>
                    <span className="text-white font-bold">{item.teluguMeaning}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-400">Meaning:</span> {item.meaning}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5">
                    <div>
                      <span className="text-slate-400 font-semibold block">Synonyms:</span>
                      <span className="text-cyan-300">{item.synonyms.join(', ') || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Antonyms:</span>
                      <span className="text-rose-300">{item.antonyms.join(', ') || 'N/A'}</span>
                    </div>
                  </div>

                  {item.exampleSentences.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-[11px]">
                      <span className="text-amber-400 font-bold block">Example Sentence:</span>
                      <p className="text-slate-300 italic">"{item.exampleSentences[0]}"</p>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Daily Flashcards & Quiz Mode */}
      {activeTab === 'practice' && (
        <div className="max-w-xl mx-auto space-y-6 pt-2">
          <div className="text-center space-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              Interactive Flashcard Practice
            </span>
            <h4 className="text-lg font-heading font-bold text-white">Test Your Memory</h4>
            <p className="text-xs text-slate-400">Click card to flip and reveal Telugu meaning & example sentences.</p>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[220px] p-6 rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl cursor-pointer hover:border-emerald-400 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Card {flashcardIdx + 1} of {savedWords.length || MASTER_1000_VOCAB_DB.length}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                {isFlipped ? 'Answer Revealed' : 'Click to Flip'}
              </span>
            </div>

            <div className="text-center py-6 space-y-2">
              {!isFlipped ? (
                <>
                  <h3 className="text-3xl font-heading font-extrabold text-white tracking-wide">{activePracticeWord.word}</h3>
                  <p className="text-xs text-cyan-300 font-mono">IPA: {activePracticeWord.ipa} • [{activePracticeWord.pronunciation}]</p>
                  <p className="text-xs text-slate-400 pt-2 font-medium">Part of Speech: {activePracticeWord.partOfSpeech}</p>
                </>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <h4 className="text-2xl font-bold text-emerald-300">{activePracticeWord.teluguMeaning}</h4>
                  <p className="text-xs text-slate-200">{activePracticeWord.meaning}</p>
                  <p className="text-xs text-amber-300 italic font-medium">"{activePracticeWord.exampleSentences[0]}"</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
              <span className="capitalize">Difficulty: {activePracticeWord.difficulty}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(activePracticeWord.word);
                }}
                className="flex items-center gap-1 text-cyan-400 hover:text-white font-semibold"
              >
                <Volume2 className="w-4 h-4" /> Listen Audio
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : (savedWords.length || MASTER_1000_VOCAB_DB.length) - 1));
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Previous Card
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIdx((prev) => (prev + 1) % (savedWords.length || MASTER_1000_VOCAB_DB.length));
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
            >
              Next Flashcard <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

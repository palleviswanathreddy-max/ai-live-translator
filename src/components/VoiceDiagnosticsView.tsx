import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, Play, AlertTriangle, RefreshCw, Check, Sparkles } from 'lucide-react';
import { VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';

interface VoiceDiagnosticsViewProps {
  settings: VoiceSettings;
}

export const VoiceDiagnosticsView: React.FC<VoiceDiagnosticsViewProps> = ({ settings }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedURI, setSelectedURI] = useState<string | null>(() => speechSpeaker.getSelectedVoiceURI());
  const [playingURI, setPlayingURI] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    speechSpeaker.ensureVoicesLoaded().then((vList) => {
      setVoices(vList);
      setIsLoading(false);
    });
  }, []);

  const handleRefreshVoices = () => {
    setIsLoading(true);
    const list = speechSpeaker.getVoices();
    setVoices(list);
    setIsLoading(false);
  };

  const handleSelectVoice = (uri: string | null) => {
    speechSpeaker.setSelectedVoiceURI(uri);
    setSelectedURI(uri);
  };

  const handleTestVoice = (voice: SpeechSynthesisVoice) => {
    setPlayingURI(voice.voiceURI);
    const testText = voice.lang.startsWith('te') ? "నమస్కారం! ఇది వాయిస్ టెస్ట్." : "Hello! This is a voice test.";
    
    speechSpeaker.speak(testText, voice.lang as any, settings, () => {
      setPlayingURI(null);
    });
  };

  const teVoiceCount = voices.filter(v => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')).length;

  return (
    <div className="space-y-4 text-xs">
      
      {/* Header Notification Banner */}
      <div className={`p-4 rounded-2xl border space-y-1 ${
        teVoiceCount > 0
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {teVoiceCount > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span className="font-bold">
              {teVoiceCount > 0
                ? `Detected ${teVoiceCount} Native Telugu TTS Voice(s) on your system!`
                : "No Native Telugu Voice Pack detected on this browser/OS."}
            </span>
          </div>

          <button
            onClick={handleRefreshVoices}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Refresh Voice List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {teVoiceCount === 0 && (
          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
            The application automatically uses Indian Voice Fallbacks (`hi-IN`/`en-IN`) for Telugu translation speech. You may also manually select any voice below.
          </p>
        )}
      </div>

      {/* Manual Selection Reset */}
      <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-white/10">
        <span className="text-slate-400">Current Manual Overridden Voice:</span>
        {selectedURI ? (
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 font-bold truncate max-w-[200px]">
              {voices.find(v => v.voiceURI === selectedURI)?.name || selectedURI}
            </span>
            <button
              onClick={() => handleSelectVoice(null)}
              className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-bold"
            >
              Reset to Auto
            </button>
          </div>
        ) : (
          <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Auto Engine Selection Active
          </span>
        )}
      </div>

      {/* Voice Table */}
      <div className="max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/90 divide-y divide-white/5 scrollbar-thin">
        {voices.length === 0 ? (
          <div className="p-6 text-center text-slate-400 space-y-1">
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
            <p>Loading available browser speech synthesis voices...</p>
          </div>
        ) : (
          voices.map((voice) => {
            const isTe = voice.lang.startsWith('te') || voice.name.toLowerCase().includes('telugu');
            const isSel = selectedURI === voice.voiceURI;
            const isPlaying = playingURI === voice.voiceURI;

            return (
              <div
                key={voice.voiceURI}
                className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                  isTe
                    ? 'bg-emerald-950/30'
                    : isSel
                    ? 'bg-cyan-950/30'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{voice.name}</span>
                    {isTe && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                        Telugu Native
                      </span>
                    )}
                    {voice.default && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-semibold">
                        System Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="font-mono text-cyan-300">Lang: {voice.lang}</span>
                    <span>•</span>
                    <span>URI: {voice.voiceURI.slice(0, 25)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleTestVoice(voice)}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isPlaying
                        ? 'bg-cyan-500 text-white animate-pulse'
                        : 'bg-slate-800 text-cyan-300 hover:bg-cyan-600 hover:text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" /> Test
                  </button>

                  <button
                    onClick={() => handleSelectVoice(isSel ? null : voice.voiceURI)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                      isSel
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {isSel ? <Check className="w-3.5 h-3.5" /> : 'Select'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

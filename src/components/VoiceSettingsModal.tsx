import React, { useState } from 'react';
import { X, Volume2, Mic, Play, RefreshCw, Sliders, Check, Activity } from 'lucide-react';
import { VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';
import { VoiceDiagnosticsView } from './VoiceDiagnosticsView';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSave: (newSettings: VoiceSettings) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'diagnostics'>('controls');

  if (!isOpen) return null;

  const handleTestVoice = () => {
    speechSpeaker.speak("Hello! I am your MV Live Translator and Spoken English guide.", 'en-US', settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg p-6 rounded-3xl glass-card border border-white/20 bg-slate-900/95 space-y-5 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-heading font-bold text-white">Voice & Audio Settings</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('controls')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'controls' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Audio Controls
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'diagnostics' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Voice Diagnostics
          </button>
        </div>

        {/* Tab 1: Controls */}
        {activeTab === 'controls' && (
          <div className="space-y-4 text-xs">
            
            {/* Gender Selector */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">Voice Gender Preference:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSave({ ...settings, voiceGender: 'female' })}
                  className={`py-2.5 rounded-xl border font-semibold transition-all ${
                    settings.voiceGender === 'female'
                      ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  👩 Female Voice
                </button>

                <button
                  type="button"
                  onClick={() => onSave({ ...settings, voiceGender: 'male' })}
                  className={`py-2.5 rounded-xl border font-semibold transition-all ${
                    settings.voiceGender === 'male'
                      ? 'bg-brand-600/30 border-brand-500 text-white shadow-md'
                      : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  👨 Male Voice
                </button>
              </div>
            </div>

            {/* Speech Rate Slider */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-300">
                <label htmlFor="voice-settings-playback-speed">Playback Speed:</label>
                <span className="text-cyan-400 font-bold">{settings.rate}x</span>
              </div>
              <input
                id="voice-settings-playback-speed"
                name="playbackSpeed"
                autoComplete="off"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.rate}
                onChange={(e) => onSave({ ...settings, rate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            {/* Pitch Slider */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-300">
                <label htmlFor="voice-settings-pitch">Voice Pitch:</label>
                <span className="text-indigo-400 font-bold">{settings.pitch}</span>
              </div>
              <input
                id="voice-settings-pitch"
                name="voicePitch"
                autoComplete="off"
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => onSave({ ...settings, pitch: parseFloat(e.target.value) })}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            {/* Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-300">
                <label htmlFor="voice-settings-volume">Volume:</label>
                <span className="text-emerald-400 font-bold">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                id="voice-settings-volume"
                name="voiceVolume"
                autoComplete="off"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => onSave({ ...settings, volume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between py-1">
                <label htmlFor="voice-settings-autoplay" className="text-slate-300 font-medium cursor-pointer">Auto-play Translated Audio</label>
                <input
                  id="voice-settings-autoplay"
                  name="autoPlay"
                  autoComplete="off"
                  type="checkbox"
                  checked={settings.autoPlay}
                  onChange={(e) => onSave({ ...settings, autoPlay: e.target.checked })}
                  className="w-4 h-4 rounded accent-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <label htmlFor="voice-settings-continuous" className="text-slate-300 font-medium cursor-pointer">Continuous Mic Conversation</label>
                <input
                  id="voice-settings-continuous"
                  name="continuousMode"
                  autoComplete="off"
                  type="checkbox"
                  checked={settings.continuousMode}
                  onChange={(e) => onSave({ ...settings, continuousMode: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-500"
                />
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Voice Diagnostics */}
        {activeTab === 'diagnostics' && (
          <VoiceDiagnosticsView settings={settings} />
        )}

        {/* Action Toolbar */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleTestVoice}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4" /> Test Voice Sample
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Check className="w-4 h-4" /> Apply Settings
          </button>
        </div>

      </div>
    </div>
  );
};

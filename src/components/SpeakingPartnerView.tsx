import React, { useState } from 'react';
import {
  MessageSquare, Mic, MicOff, Send, Volume2, Sparkles, AlertCircle, CheckCircle2,
  Briefcase, ShoppingBag, Building, Plane, Utensils, HeartPulse, GraduationCap, Laptop, MessageCircle
} from 'lucide-react';
import { SpeakingScenario, SpeakingChatMessage, LearningLevel, VoiceSettings } from '../types';
import { SCENARIO_DETAILS, generatePartnerReply } from '../services/learningService';
import { speechRecognizer } from '../services/speechRecognition';
import { speechSpeaker } from '../services/speechSynthesis';

interface SpeakingPartnerViewProps {
  level?: LearningLevel;
  settings?: VoiceSettings;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceGender: 'female',
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
  autoPlay: true,
  noiseReduction: true,
  autoLanguageDetect: true,
  continuousMode: false
};

export const SpeakingPartnerView: React.FC<SpeakingPartnerViewProps> = ({
  level = 'beginner',
  settings
}) => {
  const [selectedScenario, setSelectedScenario] = useState<SpeakingScenario>('Interview');
  const [messages, setMessages] = useState<SpeakingChatMessage[]>(() => {
    const detail = SCENARIO_DETAILS.find((s) => s.id === 'Interview') || SCENARIO_DETAILS[0];
    return [
      {
        id: 'msg-init',
        sender: 'ai',
        text: detail.initialPrompt,
        timestamp: 'Just now'
      }
    ];
  });
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const activeScenarioDetail = SCENARIO_DETAILS.find((s) => s.id === selectedScenario) || SCENARIO_DETAILS[0];

  const handleSelectScenario = (sc: SpeakingScenario) => {
    setSelectedScenario(sc);
    const detail = SCENARIO_DETAILS.find((s) => s.id === sc) || SCENARIO_DETAILS[0];
    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        sender: 'ai',
        text: detail.initialPrompt,
        timestamp: 'Just now'
      }
    ]);
  };

  const handleSendMessage = (textToSend: string = userInput) => {
    const clean = textToSend.trim();
    if (!clean) return;

    const userMsg: SpeakingChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Generate AI Partner Response with natural inline grammar check
    const partnerReply = generatePartnerReply(selectedScenario, clean, level);

    const aiMsg: SpeakingChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: partnerReply.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      grammarCorrection: partnerReply.grammarCorrection
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setUserInput('');

    // Speak AI Response
    speechSpeaker.speak(partnerReply.text, 'en-US', settings || DEFAULT_VOICE_SETTINGS);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      speechRecognizer.stop();
      setIsRecording(false);
    } else {
      setUserInput('');
      speechRecognizer.start('en-US', false, {
        onStart: () => setIsRecording(true),
        onResult: (text, isFinal) => {
          setUserInput(text);
          if (isFinal) {
            handleSendMessage(text);
          }
        },
        onError: () => setIsRecording(false),
        onEnd: () => setIsRecording(false)
      });
    }
  };

  const getScenarioIcon = (id: SpeakingScenario) => {
    switch (id) {
      case 'Interview': return <Briefcase className="w-4 h-4" />;
      case 'Shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'Hotel': return <Building className="w-4 h-4" />;
      case 'Airport': return <Plane className="w-4 h-4" />;
      case 'Restaurant': return <Utensils className="w-4 h-4" />;
      case 'Hospital': return <HeartPulse className="w-4 h-4" />;
      case 'College': return <GraduationCap className="w-4 h-4" />;
      case 'Office': return <Laptop className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl glass-card border border-brand-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-white">AI Speaking Partner</h3>
            <p className="text-xs text-slate-400">9 Real-world conversation scenarios with real-time natural grammar corrections.</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Partner Level: {level.toUpperCase()}
        </span>
      </div>

      {/* Scenarios Grid Carousel */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300">Select Conversation Scenario:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SCENARIO_DETAILS.map((scenario) => {
            const isSelected = scenario.id === selectedScenario;
            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-brand-400 shadow-md shadow-brand-500/25'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border-white/10 hover:bg-slate-800'
                }`}
              >
                {getScenarioIcon(scenario.id)}
                <span>{scenario.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Role Description Banner */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex items-center justify-between text-xs">
        <div>
          <span className="text-brand-400 font-bold">Scenario: {activeScenarioDetail.title}</span>
          <p className="text-slate-300 mt-0.5">{activeScenarioDetail.description}</p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium shrink-0">
          Role: {activeScenarioDetail.partnerRole}
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="h-80 overflow-y-auto p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} space-y-1`}>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
                <span>{isAI ? activeScenarioDetail.partnerRole : 'You (Learner)'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isAI
                    ? 'bg-slate-900 text-slate-100 border border-brand-500/20 rounded-tl-none'
                    : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                }`}
              >
                <p className="font-medium">{msg.text}</p>

                {isAI && (
                  <button
                    onClick={() => speechSpeaker.speak(msg.text, 'en-US', settings || DEFAULT_VOICE_SETTINGS)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Volume2 className="w-3 h-3" /> Replay Audio
                  </button>
                )}

                {/* Natural Grammar Correction Popup */}
                {msg.grammarCorrection && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] space-y-1">
                    <span className="font-bold flex items-center gap-1 text-amber-400">
                      <Sparkles className="w-3 h-3" /> Natural Grammar Feedback:
                    </span>
                    <p className="text-slate-300">{msg.grammarCorrection.explanation}</p>
                    <span className="text-emerald-300 font-semibold block">
                      Better way to say it: "{msg.grammarCorrection.correctedText}"
                    </span>
                  </div>
                )}

              </div>

            </div>
          );
        })}
      </div>

      {/* Suggested Phrases Chips */}
      <div className="space-y-1">
        <span className="text-[11px] text-slate-400 font-semibold">Suggested responses to try:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {activeScenarioDetail.suggestedUserPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(phrase)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 whitespace-nowrap transition-all border border-white/5"
            >
              "{phrase}"
            </button>
          ))}
        </div>
      </div>

      {/* Input Action Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleRecord}
          className={`p-3 rounded-xl text-white transition-all shadow-md ${
            isRecording ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:scale-105'
          }`}
          title="Voice input"
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type or speak your reply to the partner..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-400"
        />

        <button
          onClick={() => handleSendMessage()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </div>

    </div>
  );
};

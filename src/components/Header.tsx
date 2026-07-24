import React from 'react';
import { Languages, Settings, User, Sparkles, Volume2, ShieldCheck, Sun, Moon, GraduationCap, BookMarked, BarChart3 } from 'lucide-react';
import { UserProfile, VoiceSettings } from '../types';

interface HeaderProps {
  user: UserProfile;
  settings: VoiceSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  user,
  settings,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenAuth,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-nav px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveTab('voice')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-cyanGlow to-emeraldGlow p-[2px] shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-darkBg rounded-[10px] flex items-center justify-center font-extrabold text-cyanGlow text-sm tracking-tighter">
              MV
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg lg:text-xl tracking-tight text-white">
                MV Live <span className="gradient-text">Translator & Academy</span>
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Free & Open Source
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-cyan-400" /> Telugu ↔ English Learning Suite
            </p>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'learning'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/40'
              : 'text-emerald-400 hover:text-white hover:bg-emerald-500/10'
              }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-300" /> Learning Academy
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'voice'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Real-Time Voice
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'text'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Languages className="w-3.5 h-3.5" /> Text Translate
          </button>

          <button
            onClick={() => setActiveTab('phrasebook')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'phrasebook'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <BookMarked className="w-3.5 h-3.5" /> Phrasebook
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'history'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            History & Exports
          </button>
        </nav>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Quick Voice Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Voice & Audio Settings"
            aria-label="Voice & Audio Settings"
            className="p-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all duration-200 relative"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-darkBg" />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Light / Dark Mode"
            aria-label="Toggle Light or Dark Mode"
            className="p-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all duration-200"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User Profile / Auth Button */}
          <button
            onClick={onOpenAuth}
            aria-label="User Account Profile"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-brand-600/20 to-cyan-500/20 border border-brand-500/30 hover:border-brand-500/60 transition-all duration-200 text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shadow-inner">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Profile Avatar"
                  className="w-full h-full rounded-lg object-cover" />) : ((user?.name?.charAt(0) || "G").toUpperCase())}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-white leading-tight">{user?.name ?? "Guest"}</p>
              <p className="text-[10px] text-emerald-400 font-medium">{(user.learningLevel ?? "Beginner").toUpperCase()} LEVEL </p>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
});

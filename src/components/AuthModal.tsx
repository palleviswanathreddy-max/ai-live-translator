import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name || 'Student Scholar',
      email: email || 'student@mvlive.org',
      isLoggedIn: true,
      plan: 'Student Pro'
    };
    onUpdateUser(updated);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  const handleGoogleLogin = () => {
    const updated: UserProfile = {
      ...user,
      name: 'Santosh Kumar',
      email: 'santosh.scholar@gmail.com',
      isLoggedIn: true,
      plan: 'Student Pro'
    };
    onUpdateUser(updated);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-card border border-white/20 bg-slate-900/95 space-y-6 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-heading font-bold text-white">Student Account & Sync</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Successfully Logged In!</h4>
            <p className="text-xs text-slate-400">Welcome to MV Live Translator Student Pro account.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            
            {/* Google OAuth Simulation Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-2xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google Account
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[11px] text-slate-500 font-medium">OR EMAIL LOGIN</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Your Full Name:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Santosh Reddy"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Address:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 hover:scale-[1.02] transition-all mt-2"
              >
                Sign In to Free Account
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import { User } from '../types/auth.js';
import { sounds } from '../services/sounds.js';
import { AVATAR_LIST, AvatarBadge } from './AvatarBadge.js';
import { ForgotPasswordView } from './auth/ForgotPasswordView.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('trophy');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isRegister = authMode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!username || !email || !password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }
        const data = await api.register(username, email, password, selectedAvatar);
        sounds.playFanfare();
        onSuccess(data.user);
        onClose();
      } else {
        if (!username || !password) {
          setError('Please provide username/email and password');
          setLoading(false);
          return;
        }
        const data = await api.login(username, password);
        sounds.playFanfare();
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    sounds.playClick();
    const guestUser: User = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: 'Rookie Fan',
      email: 'guest@sportiq.local',
      avatar: selectedAvatar,
      createdAt: new Date().toISOString()
    };
    onSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full ${
        authMode === 'forgot' ? 'max-w-lg sm:max-w-xl' : 'max-w-md'
      } bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-800 my-auto max-h-[90vh] flex flex-col overflow-hidden transition-all duration-200`}>
        {/* Decorative Light Blue Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto pr-0.5 flex-1">
          {authMode === 'forgot' ? (
            <ForgotPasswordView
              onSuccess={(u) => {
                onSuccess(u);
                onClose();
              }}
              onBackToLogin={() => {
                setAuthMode('login');
                setError(null);
              }}
              isStandalonePage={false}
            />
          ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-500 mb-3 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 font-sports uppercase">
                {isRegister ? 'Join the SportIQ Arena' : 'Welcome Back, Champion'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegister
                  ? 'Create your sports profile to save high scores and favorite teams'
                  : 'Sign in to access your stats, streaks, and ESPN hub'}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Choose Avatar
                  </label>
                  <div className="grid grid-cols-5 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                    {AVATAR_LIST.map(item => {
                      const isSelected = selectedAvatar === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedAvatar(item.id)}
                          title={item.name}
                          className={`p-1.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-sky-50 ring-2 ring-sky-400 scale-105 shadow-2xs'
                              : 'hover:bg-slate-200/60 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <AvatarBadge avatar={item.id} size="sm" />
                          <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  {isRegister ? 'Username' : 'Username or Email'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={isRegister ? "e.g. TouchdownKing" : "Enter username or email"}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setError(null); sounds.playClick(); }}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account & Play' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-3">
                Or Play Instantly
              </div>
            </div>

            {/* Guest Button */}
            <button
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Continue as Guest (No signup required)</span>
            </button>

            {/* Switch Mode Footer */}
            <div className="mt-5 text-center text-xs text-slate-500">
              {isRegister ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(null); }}
                    className="text-sky-600 font-bold hover:underline ml-1"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setError(null); }}
                    className="text-sky-600 font-bold hover:underline ml-1"
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

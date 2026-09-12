import React, { useState } from 'react';
import { KeyRound, User as UserIcon, Lock, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { User } from '../../types/auth.js';
import { sounds } from '../../services/sounds.js';
import { AvatarBadge } from '../AvatarBadge.js';

interface ForgotPasswordViewProps {
  onSuccess: (user: User) => void;
  onBackToLogin: () => void;
  isStandalonePage?: boolean;
}

interface QuestionOption {
  id: string;
  name: string;
  logo?: string;
  league?: string;
  avatarId?: string;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onSuccess,
  onBackToLogin,
  isStandalonePage = false
}) => {
  // Step: 'input' | 'question' | 'password' | 'success'
  const [step, setStep] = useState<'input' | 'question' | 'password' | 'success'>('input');
  
  // Step 1 State
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  
  // Step 2 State
  const [resetToken, setResetToken] = useState('');
  const [username, setUsername] = useState('');
  const [questionType, setQuestionType] = useState<'favorite_team' | 'avatar'>('favorite_team');
  const [question, setQuestion] = useState('');
  const [instruction, setInstruction] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState<string>('');

  // Step 3 State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [restoredUser, setRestoredUser] = useState<User | null>(null);

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Submit Username / Email
  const handleInitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setError('Please enter your username or email address.');
      return;
    }

    setError(null);
    setLoading(true);
    sounds.playClick();

    try {
      const data = await api.initForgotPassword(usernameOrEmail.trim());
      setResetToken(data.resetToken);
      setUsername(data.username);
      setQuestionType(data.questionType);
      setQuestion(data.question);
      setInstruction(data.instruction);
      setOptions(data.options);
      setSelectedOptionId('');
      setTypedAnswer('');
      setStep('question');
    } catch (err: any) {
      setError(err.message || 'Account verification failed. Please try again.');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Security Challenge Answer
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId && !typedAnswer.trim()) {
      setError('Please select an option or type your answer.');
      return;
    }

    setError(null);
    setLoading(true);
    sounds.playClick();

    try {
      await api.verifyForgotPassword({
        resetToken,
        selectedOptionId: selectedOptionId || undefined,
        typedAnswer: typedAnswer.trim() || undefined
      });
      sounds.playCorrect();
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Incorrect answer. Please check and try again.');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);
    sounds.playClick();

    try {
      const data = await api.resetPassword(resetToken, newPassword);
      sounds.playFanfare();
      setRestoredUser(data.user);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
      sounds.playWrong();
    } finally {
      setLoading(false);
    }
  };

  // Finish and redirect user
  const handleFinish = () => {
    sounds.playClick();
    if (restoredUser) {
      onSuccess(restoredUser);
    } else {
      onBackToLogin();
    }
  };

  const formContent = (
    <>
      {/* Header Icon & Title */}
      <div className="text-center mb-4 sm:mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-500 mb-2.5 shadow-2xs">
          {step === 'success' ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          ) : step === 'password' ? (
            <Lock className="w-6 h-6 text-sky-500" />
          ) : (
            <KeyRound className="w-6 h-6 text-sky-500" />
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sports uppercase">
          {step === 'input' && 'Forgot Password'}
          {step === 'question' && 'Security Check'}
          {step === 'password' && 'Create New Password'}
          {step === 'success' && 'Password Updated!'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {step === 'input' && 'No email required. Enter your username or email and answer a quick question about your saved teams.'}
          {step === 'question' && `Identity verification for @${username}. Answer the sports question below to continue.`}
          {step === 'password' && `Identity verified! Set a fresh new password for @${username}.`}
          {step === 'success' && `Your password has been reset and you are now signed in as @${restoredUser?.username || username}.`}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
          <span className="text-sm">⚠️</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* STEP 1: Enter Username or Email */}
      {step === 'input' && (
        <form onSubmit={handleInitSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Username or Email Address
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                autoFocus
                value={usernameOrEmail}
                onChange={e => { setUsernameOrEmail(e.target.value); setError(null); }}
                placeholder="e.g. linawina2000 or calinafield@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Locating Account...</span>
            ) : (
              <>
                <span>Continue to Security Question</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Answer Security Question (Team or Avatar) */}
      {step === 'question' && (
        <form onSubmit={handleVerifySubmit} className="space-y-3.5">
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl">
            <div className="flex items-center gap-2 text-sky-800 text-xs font-black uppercase tracking-wider mb-0.5">
              <HelpCircle className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <span>{question}</span>
            </div>
            <p className="text-[11px] text-sky-700 font-medium">
              {instruction}
            </p>
          </div>

          {/* Options Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map(opt => {
              const isSelected = selectedOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedOptionId(opt.id);
                    setTypedAnswer('');
                    setError(null);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 relative ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-400/40 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  {/* Logo / Avatar */}
                  <div className="w-9 h-9 p-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {opt.logo ? (
                      <img
                        src={opt.logo}
                        alt={opt.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    ) : opt.avatarId ? (
                      <AvatarBadge avatar={opt.avatarId} size="sm" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-sky-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {opt.name}
                    </div>
                    {opt.league && (
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">
                        {opt.league}
                      </span>
                    )}
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Alternative: Type team name directly */}
          {questionType === 'favorite_team' && (
            <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
                — OR TYPE ANY SAVED TEAM NAME —
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={typedAnswer}
                  onChange={e => {
                    setTypedAnswer(e.target.value);
                    if (e.target.value) setSelectedOptionId('');
                    setError(null);
                  }}
                  placeholder="e.g. Alabama, Falcons, Hawks, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => { setStep('input'); setError(null); }}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading || (!selectedOptionId && !typedAnswer.trim())}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Answer...</span>
              ) : (
                <>
                  <span>Verify Security Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Enter New Password */}
      {step === 'password' && (
        <form onSubmit={handleResetSubmit} className="space-y-3.5">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Identity Verified! Enter your new password below.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              New Password (minimum 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                autoFocus
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Updating Password...</span>
            ) : (
              <>
                <span>Save Password & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 4: Success Confirmation */}
      {step === 'success' && (
        <div className="text-center space-y-4 py-2">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold max-w-sm mx-auto">
            🎉 Your password has been successfully reset! You are now logged in as <span className="font-bold text-slate-900">@{restoredUser?.username || username}</span>.
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enter SportIQ Arena</span>
          </button>
        </div>
      )}
    </>
  );

  if (isStandalonePage) {
    return (
      <div className="w-full max-w-lg sm:max-w-xl mx-auto my-auto animate-fade-in">
        <div className="relative bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xl text-slate-800 overflow-hidden max-h-[88vh] flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300" />
          <div className="overflow-y-auto pr-0.5 flex-1">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      {formContent}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Video,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { GoogleAccountChooserModal } from '../components/modals/GoogleAccountChooserModal';

/**
 * Official Google G icon SVG
 */
function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AuthPage({
  initialMode = 'login',
  setActivePage,
  onAuthSuccess,
  openAuthModal
}) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs (strictly student public registration)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Google OAuth 2.0 Integration State
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const googleBtnContainerRef = useRef(null);

  // Guard: if user is already authenticated, redirect them away immediately
  useEffect(() => {
    const existing = api.auth.getCurrentUser();
    if (existing) {
      if (existing.role === 'Instructor') {
        setActivePage('instructor-dashboard');
      } else if (existing.role === 'Admin') {
        setActivePage('admin-dashboard');
      } else {
        setActivePage('dashboard');
      }
    }
  }, [setActivePage]);

  // Fetch Google Auth Config on Mount
  useEffect(() => {
    let mounted = true;
    async function fetchConfig() {
      try {
        const config = await api.auth.getAuthConfig();
        if (!mounted) return;
        const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const localId = localStorage.getItem('totc_google_client_id');
        const activeId = (localId || config.googleClientId || envId || '').trim();
        if (activeId) {
          setGoogleClientId(activeId);
          setIsGoogleConfigured(true);
        }
      } catch (err) {
        console.warn('Failed to load auth config:', err);
      }
    }
    fetchConfig();
    return () => { mounted = false; };
  }, []);

  // Sync mode whenever initialMode changes
  useEffect(() => {
    setMode(initialMode || 'login');
    setError('');
    setSuccessMsg('');
    setForgotSuccess(false);
  }, [initialMode]);

  /**
   * Handle real cryptographically verified Google JWT ID Token from Google GIS
   */
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setError('');
    setSuccessMsg('');
    setGoogleLoading(true);

    try {
      // Public registration / login is strictly for students
      const res = await api.auth.googleLogin({
        idToken: response.credential,
        role: 'Student'
      });

      setSuccessMsg(`🎉 Google-ით ავტორიზაცია წარმატებით დასრულდა (${res.user?.fullName || ''})! გადამისამართება...`);
      if (onAuthSuccess) {
        setTimeout(() => onAuthSuccess(res.user), 600);
      }
    } catch (err) {
      setError(err.message || 'Google-ით ავტორიზაცია ვერ განხორციელდა. დარწმუნდით რომ ტოკენი ვალიდურია.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (account) => {
    setShowGoogleChooser(false);
    const devToken = `dev-google-token:${account.email}:${account.name}:${account.avatar || ''}`;
    await handleGoogleCredentialResponse({ credential: devToken });
  };

  // Initialize and Render Official Google Identity Services Button
  useEffect(() => {
    if (!googleClientId) return;

    const setupGis = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'outline',
              size: 'large',
              width: 360,
              text: mode === 'login' ? 'signin_with' : 'signup_with',
              shape: 'pill'
            });
          }
        } catch (e) {
          console.warn('Google Identity initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGis();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          setupGis();
        }
      }, 250);
      return () => clearInterval(timer);
    }
  }, [googleClientId, mode]);

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        await api.auth.forgotPassword(email.trim());
        setForgotSuccess(true);
        setSuccessMsg('თუ ელ-ფოსტა რეგისტრირებულია, აღდგენის ბმული გაგზავნილია.');
        return;
      }

      if (mode === 'login') {
        const res = await api.auth.login(email.trim(), password);
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        // Public registration is strictly for students
        const res = await api.auth.register(fullName.trim(), email.trim(), password, 'Student');
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'ავტორიზაცია ვერ მოხერხდა. გთხოვთ გადაამოწმოთ მონაცემები.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-50 via-teal-50/15 to-slate-100 flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#49BBBD]/15 via-[#23BDEE]/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-64 h-64 bg-[#49BBBD]/8 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-6 right-6 w-64 h-64 bg-[#2F327D]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main Centered Proportional Card */}
      <div className="relative z-10 w-full max-w-[460px] sm:max-w-[480px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(47,50,125,0.08)] p-6 sm:p-9 space-y-5 transition-all">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[#49BBBD] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {mode === 'login'
                ? 'სტუდენტური ავტორიზაცია'
                : mode === 'forgot-password'
                ? 'უსაფრთხო აღდგენა'
                : 'სტუდენტის რეგისტრაცია'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#2F327D] tracking-tight font-poppins">
            {mode === 'login'
              ? 'ანგარიშში შესვლა'
              : mode === 'forgot-password'
              ? 'პაროლის აღდგენა'
              : 'შექმენით ანგარიში'}
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            {mode === 'login'
              ? 'შეიყვანეთ მონაცემები ან გამოიყენეთ სწრაფი Google შესვლა.'
              : mode === 'forgot-password'
              ? 'შეიყვანეთ თქვენი ელ-ფოსტის მისამართი აღდგენის ბმულის მისაღებად.'
              : 'დაიწყეთ ონლაინ სწავლა TOTC-ის სტუდენტურ საზოგადოებაში.'}
          </p>
        </div>

        {/* Full-Width Mode Switcher (Aligned 100% with inputs) */}
        {mode !== 'forgot-password' && (
          <div className="flex p-1 bg-slate-100 rounded-2xl w-full shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#2F327D] shadow-sm'
                  : 'text-slate-500 hover:text-[#2F327D]'
              }`}
            >
              შესვლა
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#49BBBD] text-white shadow-sm'
                  : 'text-slate-500 hover:text-[#2F327D]'
              }`}
            >
              რეგისტრაცია
            </button>
          </div>
        )}

        {/* Error / Success Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Forgot Password Mode */}
        {mode === 'forgot-password' ? (
          <div className="space-y-4 pt-1">
            {forgotSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-emerald-950">აღდგენის ბმული გაგზავნილია</h4>
                <p className="text-xs leading-relaxed text-emerald-800">
                  თუ მითითებული ელ-ფოსტა რეგისტრირებულია, აღდგენის ინსტრუქცია გაგზავნილია.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotSuccess(false);
                    setError('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#49BBBD] hover:bg-[#3DA5A7] text-white font-bold text-xs transition-colors shadow-sm mt-2 cursor-pointer"
                >
                  ავტორიზაციაზე დაბრუნება
                </button>
              </div>
            ) : (
              <form onSubmit={handleStandardSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                    ელ-ფოსტის მისამართი *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#49BBBD] hover:bg-[#3DA5A7] text-white font-bold text-sm transition-all shadow-[0_4px_15px_rgba(73,187,189,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'იგზავნება...' : 'აღდგენის ბმულის გაგზავნა'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setForgotSuccess(false);
                    }}
                    className="text-xs font-semibold text-[#49BBBD] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>შესვლაზე დაბრუნება</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Google 1-Click Button (Full Width, Proportional) */}
            <div className="space-y-3">
              {isGoogleConfigured ? (
                <div className="flex justify-center w-full">
                  <div ref={googleBtnContainerRef} className="min-h-[44px] flex justify-center w-full" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(true)}
                  disabled={loading || googleLoading}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-[#49BBBD] text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>{mode === 'login' ? 'Google-ით შესვლა' : 'Google-ით სწრაფი რეგისტრაცია'}</span>
                </button>
              )}

              {googleLoading && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center justify-center gap-2 animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>მიმდინარეობს Google ავტორიზაცია...</span>
                </div>
              )}

              {/* Divider */}
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  ან გააგრძელეთ ელ-ფოსტით
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleStandardSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                    სახელი და გვარი *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="მაგ. დავით ბერიძე"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                  ელ-ფოსტა *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                    პაროლი *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-xs font-semibold text-[#49BBBD] hover:underline cursor-pointer"
                    >
                      დაგავიწყდათ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (მინიმუმ 6 სიმბოლო)"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-[#49BBBD] shrink-0" />
                  <span>რეგისტრაცია უფასოა და იცავს თქვენს მონაცემებს.</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-11 rounded-xl font-bold text-sm text-white bg-[#49BBBD] hover:bg-[#3DA5A7] transition-all duration-200 shadow-[0_4px_15px_rgba(73,187,189,0.3)] hover:shadow-[0_6px_20px_rgba(73,187,189,0.4)] flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer pt-0.5"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>მუშავდება...</span>
                  </div>
                ) : mode === 'login' ? (
                  <>
                    <span>სისტემაში შესვლა</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>სტუდენტის რეგისტრაცია</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Switch Link */}
            <div className="text-center pt-1">
              {mode === 'login' ? (
                <p className="text-xs sm:text-sm text-slate-500">
                  ჯერ არ გაქვთ ანგარიში?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="font-bold text-[#49BBBD] hover:underline cursor-pointer"
                  >
                    რეგისტრაცია
                  </button>
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-slate-500">
                  უკვე გაქვთ ანგარიში?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="font-bold text-[#49BBBD] hover:underline cursor-pointer"
                  >
                    შესვლა
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Feature Highlights Pills Under Card */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-500 font-medium px-4 max-w-lg mx-auto text-center">
        <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
          <Video className="w-3.5 h-3.5 text-[#49BBBD]" />
          <span>Bunny CDN 1080p Ultra HD</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
          <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
          <span>ინტერაქტიული ტესტები</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>ვერიფიცირებული სერტიფიკატები</span>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER MODAL */}
      <GoogleAccountChooserModal
        isOpen={showGoogleChooser}
        onClose={() => setShowGoogleChooser(false)}
        role="Student"
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Mail,
  Lock,
  User,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { api } from '../../services/api';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';

export function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [submitted, setSubmitted] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs (strictly student registration)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Google OAuth Integration State
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    setMode(initialMode || 'login');
    setError('');
    setSubmitted(false);
    setForgotSuccess(false);
    setShowPassword(false);
  }, [initialMode, isOpen]);

  // Load Google Auth Config when modal opens
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
        console.warn('Failed to load auth config in modal:', err);
      }
    }
    if (isOpen) {
      fetchConfig();
    }
    return () => { mounted = false; };
  }, [isOpen]);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setError('');
    setGoogleLoading(true);

    try {
      // Public registration / login is strictly for students
      const res = await api.auth.googleLogin({
        idToken: response.credential,
        role: 'Student'
      });

      setSubmitted(true);
      if (onAuthSuccess) {
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
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

  // Render Google GIS Button inside modal
  useEffect(() => {
    if (!googleClientId || !isOpen) return;

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
              size: 'medium',
              width: 280,
              text: mode === 'login' ? 'signin_with' : 'signup_with',
              shape: 'pill'
            });
          }
        } catch (e) {
          console.warn('Google Identity modal notice:', e);
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
  }, [googleClientId, isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        await api.auth.forgotPassword(form.email.trim());
        setForgotSuccess(true);
        return;
      }

      if (mode === 'login') {
        const res = await api.auth.login(form.email.trim(), form.password);
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        // Public registration is strictly for students
        const res = await api.auth.register(form.name.trim(), form.email.trim(), form.password, 'Student');
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'ავტორიზაცია ვერ მოხერხდა. გთხოვთ შეამოწმოთ მონაცემები.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#2F327D] flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side Graphic */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#2F327D] via-[#242766] to-[#14163c] p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="space-y-4 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#49BBBD] to-[#23BDEE] flex items-center justify-center transform rotate-45 shadow-md shadow-[#49BBBD]/30">
                <span className="font-poppins font-black text-white text-xs -rotate-45">T</span>
              </div>
              <div className="flex flex-col">
                <span className="font-poppins font-extrabold text-lg tracking-wider">TOTC</span>
                <span className="text-[9px] uppercase font-bold text-[#49BBBD] tracking-wider">E-Learning</span>
              </div>
            </div>
            
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold backdrop-blur-md border border-white/15 mb-3">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>სტუდენტური სივრცე</span>
              </span>
              <h3 className="font-poppins font-bold text-2xl leading-snug text-white">
                {mode === 'login' ? 'მოგესალმებით უკან!' : mode === 'forgot-password' ? 'პაროლის აღდგენა' : 'დაიწყეთ სწავლა დღესვე'}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mt-2">
                {mode === 'forgot-password'
                  ? 'შეიყვანეთ ელ-ფოსტა და მიიღეთ უსაფრთხო ბმული პაროლის განსაახლებლად.'
                  : 'შეუერთდით ათასობით სტუდენტს და გაიარეთ პრაქტიკული კურსები ნებისმიერი მოწყობილობიდან.'}
              </p>
            </div>
          </div>

          <div className="z-10 mt-6 rounded-2xl overflow-hidden shadow-lg border border-white/15 bg-white/5 backdrop-blur-sm p-3.5 space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
              <GraduationCap className="w-4 h-4 text-[#49BBBD]" />
              <span>100+ ინტერაქტიული კურსი</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#49BBBD]" />
              <span>ვერიფიცირებული სერტიფიკატები</span>
            </div>
          </div>

          {/* Ambient background blur */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[#49BBBD]/25 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-36 h-36 bg-[#23BDEE]/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-center max-h-[85vh] overflow-y-auto">
          {mode === 'forgot-password' ? (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#49BBBD] mx-auto flex items-center justify-center font-bold mb-2 shadow-sm">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="font-poppins font-bold text-xl text-[#2F327D]">პაროლის აღდგენა</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  შეიყვანეთ თქვენი ელ-ფოსტის მისამართი და გამოგიგზავნით აღდგენის ბმულს.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50/90 border border-red-200/90 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-900 space-y-3 text-center animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h5 className="font-bold text-sm text-emerald-950">აღდგენის ბმული გაგზავნილია</h5>
                  <p className="text-xs leading-relaxed text-emerald-800">
                    თუ მითითებული ელ-ფოსტა რეგისტრირებულია სისტემაში, პაროლის აღდგენის ინსტრუქცია გაგზავნილია.
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    გთხოვთ შეამოწმოთ თქვენი საფოსტო ყუთი (მათ შორის Spam საქაღალდე).
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setForgotSuccess(false); setError(''); }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#49BBBD] hover:bg-[#3DA5A7] text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    შესვლაზე დაბრუნება
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                      ელ-ფოსტა
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="student@example.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl text-white font-bold text-sm bg-[#49BBBD] hover:bg-[#3DA5A7] transition-all shadow-[0_6px_20px_rgba(73,187,189,0.3)] active:scale-[0.99] mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'იგზავნება...' : 'აღდგენის ბმულის გაგზავნა'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setForgotSuccess(false); }}
                      className="text-xs font-semibold text-[#49BBBD] hover:text-[#3DA5A7] transition-colors inline-flex items-center gap-1"
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
              {/* Mode Switch Tabs */}
              <div className="flex items-center justify-center p-1 bg-slate-100 rounded-2xl mb-4 w-full shadow-inner">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setSubmitted(false); setError(''); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-[#2F327D] shadow-sm'
                      : 'text-slate-500 hover:text-[#2F327D]'
                  }`}
                >
                  შესვლა
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setSubmitted(false); setError(''); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === 'register'
                      ? 'bg-[#49BBBD] text-white shadow-sm'
                      : 'text-slate-500 hover:text-[#2F327D]'
                  }`}
                >
                  რეგისტრაცია
                </button>
              </div>

              {/* GOOGLE SIGN-IN SECTION */}
              <div className="mb-3.5">
                {isGoogleConfigured ? (
                  <div className="flex justify-center w-full py-1">
                    <div ref={googleBtnContainerRef} className="min-h-[40px] flex justify-center w-full" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowGoogleChooser(true)}
                    disabled={loading || googleLoading}
                    className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 hover:border-[#49BBBD] hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm"
                  >
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>{mode === 'login' ? 'Google-ით შესვლა' : 'Google-ით სწრაფი რეგისტრაცია'}</span>
                  </button>
                )}

                {googleLoading && (
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center justify-center gap-2 animate-pulse mt-2">
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>მიმდინარეობს Google ავტორიზაცია...</span>
                  </div>
                )}

                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ან გააგრძელეთ ელ-ფოსტით</span>
                </div>
              </div>

              {error && (
                <div className="mb-3.5 p-3 rounded-2xl bg-red-50/90 border border-red-200/90 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-poppins font-bold text-xl text-[#2F327D]">
                    {mode === 'login' ? 'ავტორიზაცია წარმატებულია!' : 'ანგარიში შეიქმნა!'}
                  </h4>
                  <p className="text-slate-500 text-xs">
                    გადამისამართება სასწავლო სივრცეში...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === 'register' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                        სახელი და გვარი
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="გიორგი ბერიძე"
                          className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                      ელ-ფოსტა
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="student@example.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                      პაროლი
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="•••••••• (მინიმუმ 6 სიმბოლო)"
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15 transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'login' && (
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input type="checkbox" className="rounded text-[#49BBBD] focus:ring-[#49BBBD]" />
                        <span>დამახსოვრება</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setMode('forgot-password'); setError(''); setForgotSuccess(false); }}
                        className="hover:text-[#49BBBD] transition-colors font-medium text-xs text-slate-500"
                      >
                        პაროლი დაგავიწყდა?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-3 rounded-2xl text-white font-bold text-sm bg-[#49BBBD] hover:bg-[#3DA5A7] transition-all shadow-[0_6px_20px_rgba(73,187,189,0.3)] hover:shadow-[0_8px_25px_rgba(73,187,189,0.4)] active:scale-[0.99] mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>დაკავშირება...</span>
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
              )}
            </>
          )}
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

export default AuthModal;
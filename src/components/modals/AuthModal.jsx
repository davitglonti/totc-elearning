import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Mail, Lock, User, AlertCircle, GraduationCap, Briefcase, Key } from 'lucide-react';
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
  const [role, setRole] = useState('Student');
  const [submitted, setSubmitted] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    headline: '',
    education: '',
    experience: '',
    bio: ''
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
      const extra = role === 'Instructor' ? {
        headline: form.headline?.trim() || undefined,
        education: form.education?.trim() || undefined,
        experience: form.experience?.trim() || undefined
      } : {};

      const res = await api.auth.googleLogin({
        idToken: response.credential,
        role: role,
        ...extra
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
  }, [googleClientId, isOpen, mode, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        await api.auth.forgotPassword(form.email);
        setForgotSuccess(true);
        return;
      }

      if (mode === 'login') {
        const res = await api.auth.login(form.email, form.password);
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        const extra = role === 'Instructor' ? {
          headline: form.headline || 'ინსტრუქტორი და საგნის სპეციალისტი',
          education: form.education,
          experience: form.experience,
          bio: form.bio,
        } : {};
        const res = await api.auth.register(form.name, form.email, form.password, role, extra);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-totc-navy transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side Graphic */}
        <div className="hidden md:flex md:w-5/12 bg-totc-teal p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="space-y-4 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 transform rotate-45 flex items-center justify-center">
                <span className="font-poppins font-black text-white text-xs -rotate-45">T</span>
              </div>
              <span className="font-bold text-xl tracking-wider">TOTC</span>
            </div>
            <h3 className="font-poppins font-bold text-2xl leading-snug">
              {mode === 'login' ? 'მოგესალმებით უკან!' : mode === 'forgot-password' ? 'პაროლის აღდგენა' : 'დაიწყეთ სწავლა დღესვე'}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {mode === 'forgot-password'
                ? 'გაიარეთ მარტივი ვერიფიკაცია და უსაფრთხოდ განაახლეთ თქვენი ანგარიშის პაროლი.'
                : 'შემოუერთდით ათასობით სტუდენტსა და ინსტრუქტორს ინტერაქტიულ ვირტუალურ საკლასო ოთახში.'}
            </p>
          </div>

          <div className="z-10 mt-6 rounded-2xl overflow-hidden shadow-lg border border-white/20">
            <img
              src="/assets/news_thumb_1.png"
              alt="სტუდენტი"
              className="w-full h-32 object-cover"
            />
          </div>

          {/* Ambient background blur */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-center max-h-[85vh] overflow-y-auto">
          {mode === 'forgot-password' ? (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-totc-teal mx-auto flex items-center justify-center font-bold mb-2">
                  <Key className="w-6 h-6" />
                </div>
                <h4 className="font-poppins font-bold text-xl text-totc-navy">პაროლის აღდგენა</h4>
                <p className="text-xs text-totc-gray max-w-xs mx-auto">
                  შეიყვანეთ თქვენი ელ-ფოსტის მისამართი და გამოგიგზავნით აღდგენის ბმულს.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3 text-center animate-in fade-in">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h5 className="font-bold text-sm text-emerald-900">აღდგენის ბმული გაგზავნილია</h5>
                  <p className="text-xs leading-relaxed text-emerald-800">
                    თუ მითითებული ელ-ფოსტა რეგისტრირებულია სისტემაში, პაროლის აღდგენის ინსტრუქცია გაგზავნილია.
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    გთხოვთ შეამოწმოთ თქვენი საფოსტო ყუთი (და Spam საქაღალდე).
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setForgotSuccess(false); setError(''); }}
                    className="w-full py-2.5 px-4 rounded-xl bg-totc-teal text-white font-bold text-xs hover:bg-totc-teal-dark transition-colors shadow-sm"
                  >
                    შესვლაზე დაბრუნება
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-totc-navy uppercase tracking-wider mb-1">
                      ელ-ფოსტა
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="student@example.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-full text-white font-semibold text-sm bg-totc-teal hover:bg-totc-teal-dark transition-colors shadow-md active:scale-98 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'იგზავნება...' : 'აღდგენის ბმულის გაგზავნა'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setForgotSuccess(false); }}
                      className="text-xs font-semibold text-totc-teal hover:underline inline-flex items-center gap-1"
                    >
                      ← შესვლაზე დაბრუნება
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Mode Switch Tabs */}
          <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-full mb-5 max-w-xs mx-auto shrink-0">
            <button
              onClick={() => { setMode('login'); setSubmitted(false); }}
              className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                mode === 'login'
                  ? 'bg-totc-teal text-white shadow-sm'
                  : 'text-totc-gray hover:text-totc-navy'
              }`}
            >
              შესვლა
            </button>
            <button
              onClick={() => { setMode('register'); setSubmitted(false); }}
              className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                mode === 'register'
                  ? 'bg-totc-teal text-white shadow-sm'
                  : 'text-totc-gray hover:text-totc-navy'
              }`}
            >
              რეგისტრაცია
            </button>
          </div>

          {/* GOOGLE SIGN-IN SECTION */}
          <div className="mb-4">
            {isGoogleConfigured ? (
              <div className="flex justify-center w-full py-1">
                <div ref={googleBtnContainerRef} className="min-h-[40px] flex justify-center w-full" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowGoogleChooser(true)}
                disabled={loading || googleLoading}
                className="w-full py-2.5 px-3 rounded-xl border border-gray-200 hover:border-totc-teal hover:bg-slate-50 text-totc-navy text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>{mode === 'login' ? 'Google-ით შესვლა' : `Google-ით რეგისტრაცია (${role === 'Instructor' ? 'ინსტრუქტორი' : 'სტუდენტი'})`}</span>
              </button>
            )}

            {googleLoading && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center justify-center gap-2 animate-pulse mt-2">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>მიმდინარეობს Google ავტორიზაცია...</span>
              </div>
            )}

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <span className="relative px-3 bg-white text-[10px] font-semibold text-gray-400 uppercase">ან გაიარეთ ავტორიზაცია ელ-ფოსტით</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-totc-mint mx-auto animate-bounce" />
              <h4 className="font-poppins font-bold text-2xl text-totc-navy">
                {mode === 'login' ? 'ავტორიზაცია წარმატებულია!' : 'ანგარიში შეიქმნა!'}
              </h4>
              <p className="text-totc-gray text-sm">
                გადამისამართება სასწავლო სივრცეში...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <>
                  {/* Role Switcher */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setRole('Student')}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold flex items-center gap-2 ${
                        role === 'Student'
                          ? 'border-totc-teal bg-totc-teal/10 text-totc-teal'
                          : 'border-gray-200 text-totc-gray hover:border-gray-300'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>🎓 სტუდენტი</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('Instructor')}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold flex items-center gap-2 ${
                        role === 'Instructor'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-totc-gray hover:border-gray-300'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>👨‍🏫 ინსტრუქტორი</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-totc-navy uppercase tracking-wider mb-1">
                      სახელი და გვარი
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="გიორგი ბერიძე"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-totc-navy uppercase tracking-wider mb-1">
                  ელ-ფოსტა
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-totc-navy uppercase tracking-wider mb-1">
                  პაროლი
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
                  />
                </div>
              </div>

              {/* Extra Instructor Fields in Modal */}
              {mode === 'register' && role === 'Instructor' && (
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2.5 text-xs">
                  <div>
                    <label className="block font-semibold text-purple-900 mb-0.5">სპეციალობა / წოდება *</label>
                    <input
                      type="text"
                      required
                      value={form.headline}
                      onChange={(e) => setForm({ ...form, headline: e.target.value })}
                      placeholder="მაგ. უფროსი პროგრამული არქიტექტორი"
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs focus:outline-none focus:border-purple-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-900 mb-0.5">განათლება და ხარისხი</label>
                    <input
                      type="text"
                      value={form.education}
                      onChange={(e) => setForm({ ...form, education: e.target.value })}
                      placeholder="მაგ. კომპიუტერული მეცნიერების მაგისტრი"
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs focus:outline-none focus:border-purple-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-900 mb-0.5">გამოცდილება</label>
                    <input
                      type="text"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      placeholder="მაგ. 10+ წლიანი გამოცდილება IT სფეროში"
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs focus:outline-none focus:border-purple-600 bg-white"
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs text-totc-gray pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-totc-teal focus:ring-totc-teal" />
                    <span>დამახსოვრება</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot-password'); setError(''); setForgotSuccess(false); }}
                    className="hover:text-totc-teal transition-colors font-medium text-xs text-totc-gray"
                  >
                    პაროლი დაგავიწყდა?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className={`w-full py-3 rounded-full text-white font-semibold text-sm transition-colors shadow-md active:scale-98 mt-2 flex items-center justify-center gap-2 ${
                  role === 'Instructor' && mode === 'register'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-totc-teal hover:bg-totc-teal-dark'
                }`}
              >
                {loading ? 'მიმდინარეობს დაკავშირება...' : mode === 'login' ? 'შესვლა' : role === 'Instructor' ? 'ინსტრუქტორად რეგისტრაცია' : 'უფასო ანგარიშის შექმნა'}
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
        role={role}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
}

export default AuthModal;

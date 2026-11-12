import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Star, CheckCircle, Mail, Lock, User, AlertCircle, GraduationCap, Briefcase, Sparkles, Settings, Key, ShieldCheck, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

function GoogleIcon({ className = "w-4 h-4" }) {
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

  // Real Google OAuth 2.0 Integration State
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState('');
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    setMode(initialMode || 'login');
    setError('');
    setSubmitted(false);
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
          setCustomClientIdInput(activeId);
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

  const handleSaveGoogleClientId = (e) => {
    e.preventDefault();
    if (!customClientIdInput.trim()) return;
    const cleanId = customClientIdInput.trim();
    api.auth.setLocalGoogleClientId(cleanId);
    setGoogleClientId(cleanId);
    setIsGoogleConfigured(true);
    setShowGoogleSetup(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
              {mode === 'login' ? 'მოგესალმებით უკან!' : 'დაიწყეთ სწავლა დღესვე'}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              შემოუერთდით ათასობით სტუდენტსა და ინსტრუქტორს ინტერაქტიულ ვირტუალურ საკლასო ოთახში.
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

          {/* REAL CRYPTOGRAPHIC GOOGLE OAUTH 2.0 SECTION */}
          <div className="mb-4">
            {isGoogleConfigured ? (
              <div className="space-y-1.5">
                <div className="flex justify-center w-full py-1">
                  <div ref={googleBtnContainerRef} className="min-h-[40px] flex justify-center w-full" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-totc-gray px-1">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Google ტოკენი ვერიფიცირებულია
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleSetup(true)}
                    className="text-totc-teal hover:underline flex items-center gap-1 font-medium"
                  >
                    <Settings className="w-3 h-3" /> Client ID
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowGoogleSetup(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 hover:border-totc-teal hover:bg-slate-50 text-totc-navy text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm group"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Google-ით შესვლა' : `Google-ით რეგისტრაცია (${role === 'Instructor' ? 'ინსტრუქტორი' : 'სტუდენტი'})`}</span>
                  <span className="text-[10px] bg-totc-teal/10 text-totc-teal font-bold px-2 py-0.5 rounded-full border border-totc-teal/30 group-hover:bg-totc-teal group-hover:text-white transition-colors flex items-center gap-1">
                    <Settings className="w-3 h-3" /> ჩართვა
                  </span>
                </button>
                <p className="text-[10px] text-totc-gray text-center mt-1">
                  Google-ით ავტორიზაციისთვის მიუთითეთ Google Client ID
                </p>
              </div>
            )}

            {googleLoading && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center justify-center gap-2 animate-pulse mt-2">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>მიმდინარეობს Google ვერიფიკაცია...</span>
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
                  <a href="#" className="hover:text-totc-teal transition-colors">
                    დაგავიწყდათ პაროლი?
                  </a>
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
        </div>

      </div>

      {/* GOOGLE SETUP POPUP IN MODAL */}
      {showGoogleSetup && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowGoogleSetup(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-totc-teal/20 flex items-center justify-center text-totc-teal">
                <GoogleIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-totc-navy">Google OAuth 2.0 Client ID</h4>
                <p className="text-xs text-totc-gray">ნამდვილი კრიპტოგრაფიული ID Token ვერიფიკაცია</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Google Cloud Console-ის პარამეტრები
              </div>
              <p className="leading-relaxed">
                Google Cloud-ში OAuth Client ID-ის შექმნისას დაამატეთ Authorized JavaScript origins-ში:{' '}
                <code className="bg-amber-100 font-bold px-1 rounded font-mono">http://localhost:5173</code>
              </p>
            </div>

            <form onSubmit={handleSaveGoogleClientId} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-totc-navy mb-1">
                  ჩასვით თქვენი Google Client ID:
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customClientIdInput}
                    onChange={(e) => setCustomClientIdInput(e.target.value)}
                    placeholder="მაგ: 1234567890-abc123xyz.apps.googleusercontent.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:border-totc-teal focus:ring-1 focus:ring-totc-teal"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGoogleSetup(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-totc-teal hover:bg-teal-600 text-white text-xs font-bold transition-all flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function VideoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Player */}
        <div className="aspect-video w-full relative bg-slate-900 flex flex-col justify-between p-6">
          <div className="z-10 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-lg">TOTC ვირტუალური საკლასო ოთახის დემო</span>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">ინტერაქტიული ტური</span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-20 h-20 rounded-full bg-totc-cyan flex items-center justify-center text-white shadow-2xl">
              <Play className="w-8 h-8 fill-white ml-1" />
            </div>
            <p className="text-white font-medium text-lg max-w-md text-center">
              გაეცანით რევოლუციურ Zoom-ინტეგრირებულ ინტერაქტიულ სასწავლო ინსტრუმენტებს.
            </p>
          </div>

          <div className="z-10 flex items-center justify-between text-xs text-white/60 border-t border-white/10 pt-4">
            <span>HD 1080p • 60 FPS</span>
            <span>ხანგრძლივობა: 2:45</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export function AssessmentModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-totc-navy transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-totc-mint mx-auto" />
            <h4 className="font-poppins font-bold text-2xl text-totc-navy">
              გმადლობთ შეფასებისთვის!
            </h4>
            <p className="text-totc-gray text-sm">
              თქვენი შეფასება ეხმარება სტუდენტებსა და მასწავლებლებს აღმოაჩინონ TOTC-ის შესაძლებლობები.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-totc-teal uppercase tracking-wider">
                საზოგადოების უკუკავშირი
              </span>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy mt-1">
                დაწერეთ თქვენი შეფასება
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                თქვენი რეიტინგი
              </label>
              <div className="flex items-center gap-2 text-totc-orange">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-totc-orange text-totc-orange' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                თქვენი სახელი, გვარი და სტატუსი
              </label>
              <input
                type="text"
                required
                placeholder="მაგ. მარიამ ჯავახიშვილი (სკოლის მასწავლებელი)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                თქვენი გამოცდილება TOTC-თან
              </label>
              <textarea
                required
                rows="4"
                placeholder="როგორ დაგეხმარათ TOTC სწავლისა თუ სწავლების პროცესში?..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-semibold text-base transition-colors shadow-md"
            >
              შეფასების გაგზავნა
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

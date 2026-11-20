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
    <div className="min-h-screen bg-slate-50 flex items-stretch">
      {/* Left Column: TOTC Visual Brand & Showcase (hidden on small devices) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#2F327D] via-[#242766] to-[#14163c] p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#49BBBD]/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#23BDEE]/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3.5 cursor-pointer group w-fit"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#49BBBD] to-[#23BDEE] flex items-center justify-center transform rotate-45 group-hover:rotate-90 transition-transform duration-300 shadow-lg shadow-[#49BBBD]/30">
              <span className="font-poppins font-black text-white text-base -rotate-45">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-extrabold text-2xl tracking-wider text-white">TOTC</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#49BBBD]">E-Learning</span>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md inline-flex items-center gap-2 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>ახალი თაობის ინტერაქტიული სწავლება</span>
            </span>
            <h1 className="font-poppins font-bold text-3xl xl:text-4xl leading-tight text-white drop-shadow-sm">
              {mode === 'login'
                ? 'მოგესალმებით თქვენს სასწავლო სივრცეში.'
                : mode === 'forgot-password'
                ? 'პაროლის სწრაფი და უსაფრთხო აღდგენა.'
                : 'დაიწყეთ სწავლა TOTC-ის სტუდენტურ საზოგადოებაში.'}
            </h1>
            <p className="text-white/80 text-sm xl:text-base leading-relaxed max-w-md">
              განავითარეთ თქვენი უნარები მაღალი ხარისხის ვიდეო გაკვეთილებით, ინტერაქტიული ტესტებითა და ვერიფიცირებული სერტიფიკატებით.
            </p>
          </div>
        </div>

        {/* Feature Highlights Pills (Strictly student benefits) */}
        <div className="relative z-10 space-y-3.5 my-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.12] transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#49BBBD]/25 text-[#49BBBD] flex items-center justify-center shrink-0 border border-[#49BBBD]/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Bunny CDN Ultra HD ფლეიერი</p>
              <p className="text-xs text-white/70">შეუფერხებელი 1080p ხარისხი და რეგულირებადი სიჩქარე.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.12] transition-colors">
            <div className="w-11 h-11 rounded-xl bg-cyan-400/25 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">ინტერაქტიული ტესტები და პრაქტიკა</p>
              <p className="text-xs text-white/70">შეამოწმეთ ცოდნა თითოეული მოდულის ბოლოს რეალური უკუკავშირით.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 hover:bg-white/[0.12] transition-colors">
            <div className="w-11 h-11 rounded-xl bg-amber-400/25 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">ვერიფიცირებული სერტიფიკატები</p>
              <p className="text-xs text-white/70">ოფიციალური დიპლომი და QR-ვერიფიკაცია წარმატებული დასრულებისთვის.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/60 pt-6 border-t border-white/15">
          <span>© 2026 TOTC E-Learning. ყველა უფლება დაცულია.</span>
          <div className="flex items-center gap-3">
            <span onClick={() => setActivePage('home')} className="hover:text-white cursor-pointer transition-colors">მთავარი</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">კონფიდენციალურობა</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">წესები</span>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-7">
          
          {/* Mobile Top Brand (visible on mobile only) */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-slate-200">
            <button
              onClick={() => setActivePage('home')}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[#49BBBD] flex items-center justify-center transform rotate-45 shadow-md shadow-[#49BBBD]/30">
                <span className="font-bold text-white text-xs -rotate-45">T</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-poppins font-black text-xl text-[#2F327D] leading-none">TOTC</span>
                <span className="text-[9px] uppercase font-bold text-[#49BBBD] tracking-wider">E-Learning</span>
              </div>
            </button>
            <button
              onClick={() => setActivePage('home')}
              className="text-xs font-semibold text-[#49BBBD] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>მთავარ გვერდზე</span>
            </button>
          </div>

          {/* Heading and Mode Switcher */}
          <div>
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F327D] tracking-tight font-poppins">
                {mode === 'login' ? 'ანგარიშში შესვლა' : mode === 'forgot-password' ? 'პაროლის აღდგენა' : 'სტუდენტის რეგისტრაცია'}
              </h2>
              <p className="text-slate-500 text-sm">
                {mode === 'login'
                  ? 'შეიყვანეთ მონაცემები ან გამოიყენეთ სწრაფი Google ავტორიზაცია.'
                  : mode === 'forgot-password'
                  ? 'შეიყვანეთ რეგისტრირებული ელ-ფოსტის მისამართი აღდგენის ბმულის მისაღებად.'
                  : 'შექმენით სტუდენტის უფასო ანგარიში და დაიწყეთ სწავლა დღესვე.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {mode !== 'forgot-password' && (
              <div className="mt-6 flex p-1.5 bg-slate-100 rounded-2xl max-w-xs shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                    mode === 'login'
                      ? 'bg-[#49BBBD] text-white shadow-[0_4px_12px_rgba(73,187,189,0.3)]'
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
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                    mode === 'register'
                      ? 'bg-[#49BBBD] text-white shadow-[0_4px_12px_rgba(73,187,189,0.3)]'
                      : 'text-slate-500 hover:text-[#2F327D]'
                  }`}
                >
                  რეგისტრაცია
                </button>
              </div>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200/90 text-red-700 text-sm flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span className="font-medium text-xs sm:text-sm">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-medium text-xs sm:text-sm">{successMsg}</span>
            </div>
          )}

          {mode === 'forgot-password' ? (
            <div className="space-y-6">
              {forgotSuccess ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-poppins font-bold text-xl text-emerald-950">აღდგენის ბმული გაგზავნილია</h4>
                  <p className="text-sm leading-relaxed text-emerald-800">
                    თუ მითითებული ელ-ფოსტა რეგისტრირებულია სისტემაში, პაროლის აღდგენის ინსტრუქცია და უსაფრთხო ბმული გაგზავნილია.
                  </p>
                  <p className="text-xs text-emerald-600 bg-emerald-100/50 py-2 px-3 rounded-xl">
                    გთხოვთ შეამოწმოთ თქვენი საფოსტო ყუთი (მათ შორის Spam საქაღალდე).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotSuccess(false);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#49BBBD] hover:bg-[#3DA5A7] text-white font-bold text-sm transition-all shadow-[0_6px_20px_rgba(73,187,189,0.3)] mt-2"
                  >
                    ავტორიზაციის გვერდზე დაბრუნება
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStandardSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                      ელ-ფოსტის მისამართი *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-[#49BBBD] hover:bg-[#3DA5A7] text-white font-bold text-base transition-all shadow-[0_8px_25px_rgba(73,187,189,0.35)] hover:shadow-[0_12px_28px_rgba(73,187,189,0.45)] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? 'იგზავნება...' : 'აღდგენის ბმულის გაგზავნა'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setSuccessMsg('');
                        setForgotSuccess(false);
                      }}
                      className="text-sm font-semibold text-[#49BBBD] hover:text-[#3DA5A7] transition-colors inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>შესვლაზე დაბრუნება</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* GOOGLE 1-CLICK SIGN-IN SECTION */}
              <div className="space-y-3">
                {isGoogleConfigured ? (
                  <div className="flex justify-center w-full py-1">
                    <div ref={googleBtnContainerRef} className="min-h-[44px] flex justify-center w-full" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowGoogleChooser(true)}
                    disabled={loading || googleLoading}
                    className="w-full py-3.5 px-4 rounded-2xl border border-slate-200/90 bg-white hover:border-[#49BBBD] hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    <span>
                      {mode === 'login' ? 'Google-ით შესვლა' : 'Google-ით სწრაფი რეგისტრაცია'}
                    </span>
                  </button>
                )}

                {googleLoading && (
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center justify-center gap-2 animate-pulse">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>მიმდინარეობს Google ავტორიზაცია...</span>
                  </div>
                )}

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative px-4 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    ან გააგრძელეთ ელ-ფოსტით
                  </span>
                </div>
              </div>

              {/* Main Credentials Form (Strictly Student Registration) */}
              <form onSubmit={handleStandardSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                      სახელი და გვარი *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="მაგ. დავით ბერიძე"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2F327D] uppercase tracking-wider">
                    ელ-ფოსტა *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
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
                          setForgotSuccess(false);
                        }}
                        className="text-xs font-semibold text-[#49BBBD] hover:text-[#3DA5A7] transition-colors"
                      >
                        დაგავიწყდათ პაროლი?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (მინიმუმ 6 სიმბოლო)"
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-[#49BBBD] shrink-0" />
                    <span>რეგისტრაცია უფასოა და გაძლევთ წვდომას სასწავლო მასალებზე.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-4 rounded-2xl font-bold text-base text-white bg-[#49BBBD] hover:bg-[#3DA5A7] transition-all duration-200 shadow-[0_8px_25px_rgba(73,187,189,0.35)] hover:shadow-[0_12px_28px_rgba(73,187,189,0.45)] flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
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
              <div className="text-center pt-2">
                {mode === 'login' ? (
                  <p className="text-sm text-slate-500">
                    ჯერ არ გაქვთ ანგარიში?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="font-bold text-[#49BBBD] hover:text-[#3DA5A7] transition-colors hover:underline"
                    >
                      რეგისტრაცია
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    უკვე გაქვთ ანგარიში?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="font-bold text-[#49BBBD] hover:text-[#3DA5A7] transition-colors hover:underline"
                    >
                      შესვლა
                    </button>
                  </p>
                )}
              </div>
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
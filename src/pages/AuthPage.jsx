import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
  Briefcase,
  Award,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
  Video
} from 'lucide-react';
import { api } from '../services/api';

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
  const [role, setRole] = useState('Student'); // 'Student' or 'Instructor'
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Instructor-specific inputs
  const [headline, setHeadline] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');

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

  // Sync mode whenever initialMode changes
  useEffect(() => {
    setMode(initialMode || 'login');
    setError('');
    setSuccessMsg('');
  }, [initialMode]);

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.auth.login(email, password);
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        // Registering either as Student or Instructor
        const extra = role === 'Instructor' ? {
          headline: headline.trim() || 'Instructor & Subject Specialist',
          education: education.trim(),
          experience: experience.trim(),
          bio: bio.trim(),
        } : {};

        const res = await api.auth.register(fullName, email, password, role, extra);
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * One-click Google Sign-in / Registration
   */
  const handleGoogleAuth = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      // Simulate real Google account profile or connect with Google OAuth
      const googleMockUser = {
        email: email && email.includes('@') ? email : (role === 'Instructor' ? 'dr.instructor.google@gmail.com' : 'student.google@gmail.com'),
        fullName: fullName || (role === 'Instructor' ? 'Dr. Alex Vance' : 'Alex Vance'),
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        role: role,
        headline: role === 'Instructor' ? (headline || 'Google Certified Educator & AI Researcher') : null,
        education: role === 'Instructor' ? (education || 'M.S. in Computer Science • Stanford University') : null,
        experience: role === 'Instructor' ? (experience || 'Senior Researcher at Google Cloud • 10+ Years Mentoring') : null,
      };

      const res = await api.auth.googleLogin(googleMockUser);
      if (onAuthSuccess) onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch">
      {/* Left Column: TOTC Visual Brand & Showcase (hidden on small devices) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-totc-teal via-[#1da599] to-totc-navy p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-totc-cyan/20 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 cursor-pointer group w-fit"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center transform rotate-45 group-hover:rotate-90 transition-transform duration-300">
              <span className="font-poppins font-black text-white text-sm -rotate-45">T</span>
            </div>
            <span className="font-poppins font-bold text-2xl tracking-wider text-white">TOTC</span>
          </div>

          <div className="mt-12 space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-sm inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Next-Gen Interactive E-Learning</span>
            </span>
            <h1 className="font-poppins font-bold text-3xl xl:text-4xl leading-tight">
              {mode === 'login'
                ? 'Welcome Back to Your Interactive Virtual Classroom.'
                : 'Start Teaching or Learning with World-Class Tools.'}
            </h1>
            <p className="text-white/80 text-sm xl:text-base leading-relaxed">
              Empower your career with ultra-fast Bunny CDN video streaming, interactive multi-question quizzes, downloadable lecture resources, and verified certificates.
            </p>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="relative z-10 space-y-3.5 my-8">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Bunny CDN Ultra HD Video Player</p>
              <p className="text-xs text-white/70">Seamless 1080p, 720p, 480p manual resolution control.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Sequential Lesson & Quiz Unlocking</p>
              <p className="text-xs text-white/70">Gamified learning paths preventing premature skipping.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Full Instructor Studio & Public Bios</p>
              <p className="text-xs text-white/70">Showcase your qualifications, experience, and authored courses.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/60 pt-6 border-t border-white/15">
          <span>© 2026 TOTC E-Learning System</span>
          <div className="flex items-center gap-3">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 overflow-y-auto">
        <div className="max-w-xl w-full mx-auto space-y-8">
          
          {/* Mobile Top Brand (visible on mobile only) */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-gray-100">
            <button
              onClick={() => setActivePage('home')}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-totc-teal flex items-center justify-center transform rotate-45">
                <span className="font-bold text-white text-xs -rotate-45">T</span>
              </div>
              <span className="font-poppins font-black text-xl text-totc-navy">TOTC</span>
            </button>
            <button
              onClick={() => setActivePage('home')}
              className="text-xs font-semibold text-totc-teal hover:underline"
            >
              ← Back to Site
            </button>
          </div>

          {/* Heading and Mode Switcher */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-totc-navy tracking-tight">
                  {mode === 'login' ? 'Sign In to Your Account' : 'Create Your TOTC Account'}
                </h2>
                <p className="text-totc-gray text-sm mt-1">
                  {mode === 'login'
                    ? 'Enter your credentials or use Google for one-click access.'
                    : 'Choose whether you are enrolling as a student or teaching as an instructor.'}
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mt-6 flex p-1.5 bg-gray-100 rounded-full max-w-sm">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-full transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'text-totc-gray hover:text-totc-navy'
                }`}
              >
                Sign In (ავტორიზაცია)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-full transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'text-totc-gray hover:text-totc-navy'
                }`}
              >
                Sign Up (რეგისტრაცია)
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* GOOGLE CONTINUATION BUTTON */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading || loading}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 text-totc-navy font-semibold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-sm active:scale-98"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>
                {googleLoading
                  ? 'Connecting to Google...'
                  : mode === 'login'
                  ? 'Sign in with Google (Google-ით შესვლა)'
                  : `Continue with Google as ${role} (Google-ით რეგისტრაცია)`}
              </span>
            </button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative px-4 bg-slate-50 text-xs font-semibold text-totc-gray uppercase tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>

          {/* ROLE SELECTOR: Student vs Instructor (on Register mode) */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-totc-navy uppercase tracking-wider">
                Select Your Role (აირჩიეთ სტატუსი):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student Option */}
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                    role === 'Student'
                      ? 'border-totc-teal bg-totc-teal/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-totc-teal flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    {role === 'Student' && (
                      <span className="w-5 h-5 rounded-full bg-totc-teal text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-totc-navy text-sm">🎓 Student (სტუდენტი)</h4>
                    <p className="text-xs text-totc-gray mt-0.5">
                      I want to learn, watch courses & pass quizzes.
                    </p>
                  </div>
                </button>

                {/* Instructor Option */}
                <button
                  type="button"
                  onClick={() => setRole('Instructor')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                    role === 'Instructor'
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    {role === 'Instructor' && (
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-totc-navy text-sm">👨‍🏫 Instructor (ლექტორი)</h4>
                    <p className="text-xs text-totc-gray mt-0.5">
                      I want to author courses & teach students.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleStandardSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-totc-navy uppercase tracking-wider mb-1.5">
                  Full Name (სახელი და გვარი) *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. David Beridze"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-totc-navy uppercase tracking-wider mb-1.5">
                Email Address (ელ.ფოსტა) *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-totc-navy uppercase tracking-wider">
                  Password (პაროლი) *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email.')}
                    className="text-xs font-semibold text-totc-teal hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 characters)"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20"
                />
              </div>
            </div>

            {/* INSTRUCTOR-SPECIFIC SPECIALTY / BIO FIELDS */}
            {mode === 'register' && role === 'Instructor' && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Instructor Qualifications & Public Profile (ლექტორის მონაცემები)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-900 mb-1">
                    Specialty / Headline (წოდება / სპეციალობა) *
                  </label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Cloud Architect & AI Researcher"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-purple-900 mb-1">
                      Education (განათლება)
                    </label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. M.S. in Computer Science, TSU / MIT"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-purple-900 mb-1">
                      Experience (გამოცდილება)
                    </label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 10+ years at Big Tech, 15k+ students"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-900 mb-1">
                    Short Bio (მოკლე ბიოგრაფია)
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students about your industry background, teaching philosophy, and achievements..."
                    className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-purple-600 resize-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full py-4 rounded-full font-bold text-base text-white transition-all duration-200 shadow-md flex items-center justify-center gap-2 active:scale-98 ${
                role === 'Instructor' && mode === 'register'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-totc-teal hover:bg-totc-teal-dark'
              }`}
            >
              {loading ? (
                <span>Processing Account...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In to TOTC</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : role === 'Instructor' ? (
                <>
                  <span>Register as Instructor & Open Studio</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Free Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="text-center pt-2">
            {mode === 'login' ? (
              <p className="text-sm text-totc-gray">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-totc-teal hover:underline"
                >
                  Create Account (რეგისტრაცია)
                </button>
              </p>
            ) : (
              <p className="text-sm text-totc-gray">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-totc-teal hover:underline"
                >
                  Sign In (ავტორიზაცია)
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

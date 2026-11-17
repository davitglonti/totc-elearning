import React, { useState, useEffect } from 'react';
import { 
  Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Key, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';

export default function ResetPasswordPage({
  token: initialToken,
  setActivePage,
  openAuthModal,
}) {
  const [token, setToken] = useState(initialToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Extract token from URL query string if not passed as prop
  useEffect(() => {
    if (!token) {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token') || params.get('resetToken');
      if (urlToken) {
        setToken(urlToken.trim());
      }
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('პაროლის აღდგენის ტოკენი ვერ მოიძებნა. გთხოვთ გამოიყენოთ ელ-ფოსტით მიღებული ბმული.');
      return;
    }

    if (newPassword.length < 6) {
      setError('ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('შეყვანილი პაროლები ერთმანეთს არ ემთხვევა.');
      return;
    }

    setLoading(true);

    try {
      await api.auth.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err.message || 'პაროლის შეცვლა ვერ მოხერხდა. ტოკენი შეიძლება იყოს ვადაგასული ან არასწორი.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (setActivePage) {
      setActivePage('login');
    } else if (openAuthModal) {
      openAuthModal('login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-poppins">
      <div className="max-w-md w-full bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-totc-teal/20 text-totc-teal mx-auto flex items-center justify-center shadow-xs">
            <Key className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-totc-navy tracking-tight">
            ახალი პაროლის დაყენება
          </h2>
          <p className="text-xs text-totc-gray max-w-xs mx-auto leading-relaxed">
            შეიყვანეთ თქვენი ახალი პაროლი. განახლების შემდეგ შეძლებთ ახალი პაროლით ავტორიზაციას.
          </p>
        </div>

        {/* Missing Token Warning */}
        {!token && !success && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ტოკენი არ არის მითითებული</span>
            </div>
            <p className="leading-relaxed text-amber-800">
              პაროლის აღსადგენად საჭიროა ვალიდური უსაფრთხოების ტოკენი. გთხოვთ გადახვიდეთ ელ-ფოსტით მიღებულ ბმულზე.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setActivePage ? setActivePage('login') : null}
                className="font-bold text-totc-teal hover:underline inline-flex items-center gap-1"
              >
                ← ავტორიზაციის გვერდზე გადასვლა
              </button>
            </div>
          </div>
        )}

        {/* Error Feedback Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Feedback View */}
        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-emerald-950">
                პაროლი წარმატებით შეიცვალა!
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                თქვენი ანგარიშის პაროლი განახლებულია. ახლა შეგიძლიათ შეხვიდეთ სისტემაში ახალი პაროლით.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGoToLogin}
              className="w-full py-3 rounded-xl bg-totc-teal text-white font-bold text-xs hover:bg-totc-teal-dark transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <span>სისტემაში შესვლა</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Password Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-totc-navy uppercase tracking-wider mb-1.5">
                ახალი პაროლი *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (მინიმუმ 6 სიმბოლო)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-totc-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-totc-navy uppercase tracking-wider mb-1.5">
                გაიმეორეთ ახალი პაროლი *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="•••••••• (მინიმუმ 6 სიმბოლო)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-totc-navy transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Token Input (Read-only if present, editable if user needs to paste manually) */}
            <div>
              <label className="block text-[11px] font-semibold text-totc-gray uppercase tracking-wider mb-1">
                უსაფრთხოების ტოკენი
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ჩასვით აღდგენის ტოკენი..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-[11px] font-mono text-totc-navy focus:outline-none focus:border-totc-teal"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 rounded-xl bg-totc-teal text-white font-bold text-xs sm:text-sm hover:bg-totc-teal-dark transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>მიმდინარეობს განახლება...</span>
                </>
              ) : (
                <>
                  <span>პაროლის შეცვლა</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleGoToLogin}
                className="text-xs font-semibold text-totc-teal hover:underline inline-flex items-center gap-1"
              >
                ← ავტორიზაციაზე დაბრუნება
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

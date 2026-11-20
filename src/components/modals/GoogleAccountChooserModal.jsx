import React, { useState } from 'react';
import { X, User, Plus, ArrowRight, ShieldCheck, Settings, Key, CheckCircle, ExternalLink } from 'lucide-react';

export function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

const PRESET_GOOGLE_ACCOUNTS = [
  {
    email: 'dglonti3@gmail.com',
    name: 'Davit Glonti',
    color: 'bg-blue-600',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    email: 'datiglonti@gmail.com',
    name: 'Davit Glonti',
    color: 'bg-emerald-600',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    email: 'student.totc@gmail.com',
    name: 'Student User',
    color: 'bg-amber-600',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
  }
];

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
  role = 'Student',
  onSaveClientId,
  currentClientId = ''
}) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(currentClientId || '');

  if (!isOpen) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const cleanEmail = customEmail.trim().toLowerCase();
    const cleanName = customName.trim() || cleanEmail.split('@')[0];
    onSelectAccount({
      email: cleanEmail,
      name: cleanName,
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
    });
  };

  const handleClientIdSubmit = (e) => {
    e.preventDefault();
    if (onSaveClientId) {
      onSaveClientId(clientIdInput.trim());
      setShowClientIdConfig(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-100 mb-3">
            <GoogleIcon className="w-7 h-7" />
          </div>
          <h3 className="font-poppins font-bold text-xl text-totc-navy">
            შედით Google-ით
          </h3>
          <p className="text-xs text-totc-gray mt-1">
            აირჩიეთ ანგარიში <strong className="text-totc-navy">TOTC E-Learning</strong>-ზე ავტორიზაციისთვის
          </p>
          <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-totc-teal/10 text-totc-teal text-[11px] font-bold">
            როლი: {role === 'Instructor' ? 'ინსტრუქტორი' : 'სტუდენტი'}
          </div>
        </div>

        {/* Account List */}
        {!showClientIdConfig ? (
          <div className="space-y-2">
            <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
              {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => onSelectAccount(acc)}
                  className="w-full p-3.5 flex items-center gap-3.5 hover:bg-slate-50 transition-colors text-left group"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-totc-navy group-hover:text-totc-teal transition-colors truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-totc-gray truncate">
                      {acc.email}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-totc-teal transition-colors shrink-0" />
                </button>
              ))}

              {/* Use Another Account Toggle */}
              {!showCustomForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="w-full p-3.5 flex items-center gap-3.5 hover:bg-slate-50 transition-colors text-left text-totc-teal font-semibold text-xs group"
                >
                  <div className="w-10 h-10 rounded-full bg-totc-teal/10 border border-totc-teal/20 flex items-center justify-center text-totc-teal">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span>სხვა Google ანგარიშის გამოყენება...</span>
                    <p className="text-[10px] text-totc-gray font-normal">შეიყვანეთ ნებისმიერი @gmail.com</p>
                  </div>
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-totc-navy">სხვა Google ანგარიში</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="text-[11px] text-totc-gray hover:underline"
                    >
                      გაუქმება
                    </button>
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="მაგ: myaccount@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-totc-teal bg-white"
                      autoFocus
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="თქვენი სახელი და გვარი (სურვილისამებრ)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-totc-teal bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-totc-teal hover:bg-teal-600 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    ავტორიზაცია ამ ანგარიშით →
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Config Link */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-totc-gray">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 1-კლიკიანი Google ინტეგრაცია
              </span>
              <button
                type="button"
                onClick={() => setShowClientIdConfig(true)}
                className="text-totc-teal hover:underline flex items-center gap-1 font-medium"
              >
                <Settings className="w-3 h-3" /> Client ID პარამეტრები
              </button>
            </div>
          </div>
        ) : (
          /* Google Cloud Console Setup Form */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-totc-navy">
                <Key className="w-4 h-4 text-totc-teal" />
                Google Cloud OAuth 2.0 პარამეტრები
              </div>
              <button
                type="button"
                onClick={() => setShowClientIdConfig(false)}
                className="text-xs text-totc-gray hover:underline font-medium"
              >
                უკან დაბრუნება
              </button>
            </div>

            <p className="text-xs text-totc-gray leading-relaxed">
              თუ გსურთ Google-ის ოფიციალური One-Tap / Popup ფანჯრის გამოყენება Google Cloud Console-დან, შეიყვანეთ თქვენი Client ID:
            </p>

            <form onSubmit={handleClientIdSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-totc-navy mb-1">
                  Google Client ID:
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="მაგ: 1234567890-abc.apps.googleusercontent.com"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-gray-200 focus:outline-none focus:border-totc-teal bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientIdConfig(false)}
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
        )}
      </div>
    </div>
  );
}
export default GoogleAccountChooserModal;

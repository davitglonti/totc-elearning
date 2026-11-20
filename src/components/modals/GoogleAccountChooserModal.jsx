import React, { useState } from 'react';
import { X, Plus, ArrowRight, Check } from 'lucide-react';

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

const PRESET_ACCOUNTS = [
  {
    email: 'dglonti3@gmail.com',
    name: 'Davit Glonti',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    email: 'datiglonti@gmail.com',
    name: 'Davit Glonti',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  }
];

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
  role = 'Student'
}) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-100 mb-3">
            <GoogleIcon className="w-7 h-7" />
          </div>
          <h3 className="font-poppins font-bold text-xl text-totc-navy">
            შედით Google-ით
          </h3>
          <p className="text-xs text-totc-gray mt-1">
            აირჩიეთ ანგარიში <strong className="text-totc-navy">TOTC E-Learning</strong>-ზე გადასასვლელად
          </p>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-totc-teal/10 text-totc-teal text-xs font-bold">
            როლი: {role === 'Instructor' ? 'ინსტრუქტორი' : 'სტუდენტი'}
          </div>
        </div>

        {/* Account Selector List */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
          {PRESET_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelectAccount(acc)}
              className="w-full p-4 flex items-center gap-3.5 hover:bg-slate-50 transition-colors text-left group"
            >
              <img
                src={acc.avatar}
                alt={acc.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
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

          {/* Use Another Account */}
          {!showCustomForm ? (
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="w-full p-4 flex items-center gap-3.5 hover:bg-slate-50 transition-colors text-left text-totc-teal font-semibold text-xs group"
            >
              <div className="w-10 h-10 rounded-full bg-totc-teal/10 border border-totc-teal/20 flex items-center justify-center text-totc-teal shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold">სხვა Google ანგარიშის გამოყენება...</span>
                <p className="text-[11px] text-totc-gray font-normal">შეიყვანეთ ნებისმიერი @gmail.com</p>
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
                  placeholder="მაგ: myemail@gmail.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-totc-teal bg-white"
                  autoFocus
                />
              </div>
              <div>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="თქვენი სახელი და გვარი (სურვილისამებრ)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-totc-teal bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-totc-teal hover:bg-teal-600 text-white text-xs font-bold transition-colors shadow-sm"
              >
                ავტორიზაცია ამ ანგარიშით →
              </button>
            </form>
          )}
        </div>

        {/* Google Terms / Disclaimer Footer */}
        <p className="text-[11px] text-totc-gray text-center leading-relaxed mt-5 px-2">
          TOTC-ზე გასაგრძელებლად Google გაუზიარებს თქვენს სახელს, ელფოსტას და პროფილის სურათს.
        </p>
      </div>
    </div>
  );
}

export default GoogleAccountChooserModal;

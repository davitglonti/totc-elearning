import React, { useState } from 'react';
import { 
  X, UserPlus, Mail, Lock, User, Briefcase, Image, 
  FileText, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle 
} from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';

export function CreateInstructorModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    headline: '',
    avatarUrl: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedNotice, setGeneratedNotice] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Totc!';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pwd }));
    setShowPassword(true);
    setGeneratedNotice(true);
    setTimeout(() => setGeneratedNotice(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName.trim()) {
      setError('გთხოვთ მიუთითოთ ინსტრუქტორის სრული სახელი.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('გთხოვთ მიუთითოთ სწორი ელფოსტის მისამართი.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('დროებითი პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        headline: formData.headline.trim() || null,
        avatarUrl: formData.avatarUrl.trim() || null,
        bio: formData.bio.trim() || null,
      };

      const result = await adminApi.createInstructor(payload);
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        headline: '',
        avatarUrl: '',
        bio: '',
      });
      setShowPassword(false);

      if (onSuccess) {
        onSuccess(result || payload);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create instructor:', err);
      setError(err.message || 'ინსტრუქტორის ანგარიშის შექმნა ვერ მოხერხდა. გადაამოწმეთ შეყვანილი მონაცემები.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto space-y-6 relative my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-totc-teal shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                ინსტრუქტორის რეგისტრაცია
              </div>
              <h3 className="font-poppins font-black text-xl text-totc-navy">
                ახალი ინსტრუქტორის დამატება
              </h3>
              <p className="text-xs text-totc-gray">
                შექმენით ინსტრუქტორის ანგარიში პირდაპირი უფლებამოსილებით
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-totc-navy mb-1.5">
              სრული სახელი და გვარი <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="მაგ: გიორგი ბერიძე"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-totc-navy mb-1.5">
              ელფოსტის მისამართი <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="მაგ: g.beridze@totc.edu.ge"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Temporary Password & Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-totc-navy">
                დროებითი პაროლი <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-bold text-totc-teal hover:text-[#389496] flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>ავტომატური გენერირება</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="მინიმუმ 6 სიმბოლო"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/10 transition-all font-medium font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-totc-gray hover:text-totc-navy"
                title={showPassword ? 'დამალვა' : 'ჩვენება'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {generatedNotice && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                დროებითი პაროლი წარმატებით დაგენერირდა
              </p>
            )}
          </div>

          {/* Headline / Specialty */}
          <div>
            <label className="block text-xs font-bold text-totc-navy mb-1.5">
              სპეციალობა / Headline <span className="text-totc-gray font-normal">(არასავალდებულო)</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="მაგ: Senior Fullstack Engineer & AI Researcher"
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Avatar URL with live preview */}
          <div>
            <label className="block text-xs font-bold text-totc-navy mb-1.5">
              ავატარის URL <span className="text-totc-gray font-normal">(არასავალდებულო)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Image className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.avatarUrl}
                  onChange={(e) => handleChange('avatarUrl', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/10 transition-all font-medium"
                />
              </div>
              <img
                src={formData.avatarUrl || '/assets/testimonial_avatar.png'}
                alt="Avatar Preview"
                onError={(e) => { e.target.src = '/assets/testimonial_avatar.png'; }}
                className="w-10 h-10 rounded-full object-cover border-2 border-totc-teal/40 shrink-0 bg-gray-50"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-totc-navy mb-1.5">
              ბიოგრაფია & გამოცდილება <span className="text-totc-gray font-normal">(არასავალდებულო)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-totc-gray absolute left-3.5 top-3" />
              <textarea
                rows={3}
                placeholder="მოკლე ინფორმაცია ინსტრუქტორის შესახებ..."
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/10 transition-all font-medium resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-totc-gray hover:text-totc-navy hover:bg-gray-100 transition-colors"
            >
              გაუქმება
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-totc-teal hover:bg-[#3da8aa] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>იქმნება...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>ინსტრუქტორის შექმნა</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateInstructorModal;

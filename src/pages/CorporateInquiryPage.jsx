import React, { useState } from 'react';
import { 
  Building2, Users, Mail, Phone, CheckCircle2, ArrowRight, 
  Send, Sparkles, ArrowLeft, ShieldCheck, Laptop, Award, Cpu, Check
} from 'lucide-react';
import { api } from '../services/api';

export default function CorporateInquiryPage({ setActivePage, currentUser }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: '',
    teamSize: '20-50',
    interests: ['IT და პროგრამირება'],
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const teamSizes = [
    { id: '5-20', label: '5 – 20 თანამშრომელი' },
    { id: '20-50', label: '20 – 50 თანამშრომელი' },
    { id: '50-100', label: '50 – 100 თანამშრომელი' },
    { id: '100+', label: '100+ (კამპუსი / დიდი გუნდი)' },
  ];

  const interestOptions = [
    'IT და პროგრამირება',
    'ბიზნესი და მენეჯმენტი',
    'UI/UX და გრაფიკული დიზაინი',
    'LMS & Zoom API ინტეგრაცია',
    'კვალიფიკაციის ამაღლება & სერტიფიცირება',
  ];

  const toggleInterest = (topic) => {
    setFormData(prev => {
      const exists = prev.interests.includes(topic);
      if (exists) {
        return { ...prev, interests: prev.interests.filter(i => i !== topic) };
      } else {
        return { ...prev, interests: [...prev.interests, topic] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName.trim()) {
      setError('გთხოვთ მიუთითოთ კომპანიის ან ორგანიზაციის დასახელება.');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setError('გთხოვთ მიუთითოთ საკონტაქტო პირის სახელი და გვარი.');
      return;
    }
    if (!formData.email.trim()) {
      setError('გთხოვთ მიუთითოთ სამუშაო ელ-ფოსტა.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('გთხოვთ მიუთითოთ ტელეფონის ნომერი.');
      return;
    }

    setLoading(true);
    try {
      await api.corporateInquiries.submit({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        teamSize: formData.teamSize,
        interests: formData.interests.join(', '),
        message: formData.message,
      });

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to submit corporate inquiry:', err);
      setError(err.message || 'მოთხოვნის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => setActivePage('membership')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-totc-teal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>გამოწერების პაკეტებზე დაბრუნება</span>
          </button>
        </div>

        {/* Success View */}
        {success ? (
          <div className="max-w-2xl mx-auto bg-white rounded-[32px] p-8 sm:p-12 border border-gray-100 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                ✓ მოთხოვნა მიღებულია
              </div>
              <h2 className="font-poppins font-black text-2xl sm:text-3xl text-totc-navy">
                გმადლობთ დაინტერესებისთვის!
              </h2>
              <p className="text-sm text-totc-gray max-w-lg mx-auto leading-relaxed">
                კომპანია <strong>„{formData.companyName}“</strong>-სთვის კორპორატიული პაკეტის მოთხოვნა წარმატებით დარეგისტრირდა. ჩვენი B2B დანერგვის მენეჯერი დაგიკავშირდებათ <strong>24 საათში</strong> პერსონალური შეთავაზებითა და ტარიფით.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 max-w-md mx-auto space-y-1">
              <p>საკონტაქტო ელ-ფოსტა: <strong>{formData.email}</strong></p>
              <p>ტელეფონი: <strong>{formData.phone}</strong></p>
              <p>გუნდის ზომა: <strong>{formData.teamSize} მომხმარებელი</strong></p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setActivePage('home')}
                className="px-8 py-3.5 rounded-full bg-totc-navy text-white hover:bg-slate-800 font-bold text-xs transition-all shadow-md"
              >
                მთავარ გვერდზე დაბრუნება
              </button>
              <button
                onClick={() => setActivePage('courses')}
                className="px-8 py-3.5 rounded-full bg-totc-teal text-white hover:bg-[#3da8aa] font-bold text-xs transition-all shadow-md"
              >
                კურსების კატალოგი
              </button>
            </div>
          </div>
        ) : (
          /* Main 2-Column Split: Info & Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Hero & Enterprise Benefits (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-totc-teal/10 border border-totc-teal/20 text-totc-teal text-xs font-bold uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>ორგანიზაცია & კამპუსი</span>
                </div>
                
                <h1 className="font-poppins font-black text-3xl sm:text-4xl text-totc-navy tracking-tight leading-tight">
                  გააძლიერეთ თქვენი გუნდი TOTC-ის კორპორატიული აკადემიით
                </h1>
                
                <p className="text-sm text-totc-gray leading-relaxed">
                  ჩვენ ვქმნით პერსონალურ საგანმანათლებლო ეკოსისტემას კომპანიებისთვის, სკოლებისა და უნივერსიტეტებისთვის — შეუზღუდავი წვდომით, LMS ინტეგრაციითა და ინდივიდუალური ტარიფით.
                </p>
              </div>

              {/* Benefit Cards */}
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-totc-teal flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-totc-navy">მორგებული სასწავლო ტრეკები</h4>
                    <p className="text-[11px] text-totc-gray mt-0.5">
                      თქვენი თანამშრომლების კვალიფიკაციასა და ბიზნეს-ამოცანებზე მორგებული სპეციალური პროგრამები.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-totc-navy">სრული Zoom API & LMS ინტეგრაცია</h4>
                    <p className="text-[11px] text-totc-gray mt-0.5">
                      მარტივი სინქრონიზაცია Canvas, Blackboard და კორპორატიულ SSO სისტემებთან.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-totc-navy">ვერიფიცირებული სერტიფიკატები</h4>
                    <p className="text-[11px] text-totc-gray mt-0.5">
                      ოფიციალური დიპლომები QR კოდითა და ავთენტურობის შემოწმებით ყოველი კურსის დასრულებისას.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-totc-navy">პერსონალური მენეჯერი & 24/7 SLA</h4>
                    <p className="text-[11px] text-totc-gray mt-0.5">
                      გამოყოფილი დანერგვის მენეჯერი, ინვოისირება და პრიორიტეტული ტექნიკური მხარდაჭერა.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Form Card (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[32px] p-6 sm:p-9 border border-gray-150 shadow-md space-y-6">
                
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="font-poppins font-black text-2xl text-totc-navy">
                    მოითხოვეთ კორპორატიული შეთავაზება
                  </h2>
                  <p className="text-xs text-totc-gray mt-1">
                    შეავსეთ მოკლე ინფორმაცია და ჩვენი გუნდი მოგიმზადებთ თქვენს ორგანიზაციაზე მორგებულ საუკეთესო პირობებს.
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Row 1: Company & Team Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-totc-navy block mb-1.5">
                        კომპანიის / ორგანიზაციის დასახელება *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="მაგ: TBC, საქართველოს ბანკი, BTU..."
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-totc-teal focus:ring-1 focus:ring-totc-teal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-totc-navy block mb-1.5">
                        საკონტაქტო პირის სახელი და გვარი *
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="მაგ: ნინო კალანდაძე"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-totc-teal focus:ring-1 focus:ring-totc-teal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-totc-navy block mb-1.5">
                        სამუშაო ელ-ფოსტა *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="name@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-totc-teal focus:ring-1 focus:ring-totc-teal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-totc-navy block mb-1.5">
                        ტელეფონის ნომერი *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          placeholder="+995 599 00 00 00"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-totc-teal focus:ring-1 focus:ring-totc-teal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team Size Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-totc-navy block">
                      თანამშრომელთა / სტუდენტთა სავარაუდო რაოდენობა *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {teamSizes.map(size => {
                        const isSelected = formData.teamSize === size.id;
                        return (
                          <button
                            type="button"
                            key={size.id}
                            onClick={() => setFormData({ ...formData, teamSize: size.id })}
                            className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-totc-navy text-white border-totc-navy shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100'
                            }`}
                          >
                            {size.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Areas of Interest Tags */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-totc-navy block">
                      დაინტერესების სფეროები (აირჩიეთ ერთი ან რამდენიმე):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((topic, tIdx) => {
                        const selected = formData.interests.includes(topic);
                        return (
                          <button
                            type="button"
                            key={tIdx}
                            onClick={() => toggleInterest(topic)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                              selected
                                ? 'bg-totc-teal text-white border-totc-teal shadow-xs'
                                : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5" />}
                            <span>{topic}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-totc-navy block">
                      დამატებითი მოთხოვნები ან კომენტარი (სურვილისამებრ)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="მაგ: გვსურს თანამშრომლებისთვის Python-ის და React-ის ინტენსიური კურსი პრაქტიკული გამოცდით..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-totc-teal focus:ring-1 focus:ring-totc-teal"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-full bg-totc-teal hover:bg-[#3da8aa] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>მოთხოვნა იგზავნება...</span>
                        </span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>კორპორატიული შეთავაზების მოთხოვნა</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-slate-400">
                    🔒 თქვენი მონაცემები დაცულია და გამოყენებული იქნება მხოლოდ შეთავაზების მოსამზადებლად.
                  </p>

                </form>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

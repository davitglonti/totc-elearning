import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, RotateCcw, Plus, Trash2, Check, ExternalLink, 
  CreditCard, Star, ShieldCheck, HelpCircle, Eye, EyeOff, Tag, DollarSign
} from 'lucide-react';
import { useSettings, defaultMembershipContent } from '../../context/SettingsContext';

export function AdminMembershipCmsTab({ setActivePage }) {
  const { settings, updateMembershipContent, loading: settingsLoading } = useSettings();
  const [form, setForm] = useState(settings?.membershipContent || defaultMembershipContent);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync when settings change from backend
  useEffect(() => {
    if (settings?.membershipContent) {
      setForm(settings.membershipContent);
    }
  }, [settings?.membershipContent]);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Update Header field
  const handleHeaderChange = (field, val) => {
    setForm(prev => ({
      ...prev,
      header: {
        ...(prev.header || {}),
        [field]: val
      }
    }));
  };

  // Update Plan field
  const handlePlanChange = (planIndex, field, val) => {
    setForm(prev => {
      const updatedPlans = [...(prev.plans || [])];
      updatedPlans[planIndex] = {
        ...updatedPlans[planIndex],
        [field]: val
      };
      return { ...prev, plans: updatedPlans };
    });
  };

  // Add Feature to Plan
  const handleAddFeature = (planIndex) => {
    setForm(prev => {
      const updatedPlans = [...(prev.plans || [])];
      const currentFeatures = updatedPlans[planIndex].features || [];
      updatedPlans[planIndex] = {
        ...updatedPlans[planIndex],
        features: [...currentFeatures, 'ახალი უპირატესობა ან შესაძლებლობა']
      };
      return { ...prev, plans: updatedPlans };
    });
  };

  // Update Feature in Plan
  const handleFeatureChange = (planIndex, featureIndex, val) => {
    setForm(prev => {
      const updatedPlans = [...(prev.plans || [])];
      const currentFeatures = [...(updatedPlans[planIndex].features || [])];
      currentFeatures[featureIndex] = val;
      updatedPlans[planIndex] = {
        ...updatedPlans[planIndex],
        features: currentFeatures
      };
      return { ...prev, plans: updatedPlans };
    });
  };

  // Remove Feature from Plan
  const handleRemoveFeature = (planIndex, featureIndex) => {
    setForm(prev => {
      const updatedPlans = [...(prev.plans || [])];
      const currentFeatures = (updatedPlans[planIndex].features || []).filter((_, idx) => idx !== featureIndex);
      updatedPlans[planIndex] = {
        ...updatedPlans[planIndex],
        features: currentFeatures
      };
      return { ...prev, plans: updatedPlans };
    });
  };

  // Add a new Plan
  const handleAddPlan = () => {
    const newId = `plan-${Date.now()}`;
    const newPlan = {
      id: newId,
      planId: `Custom-${(form.plans?.length || 0) + 1}`,
      name: `ახალი სატარიფო პაკეტი ${(form.plans?.length || 0) + 1}`,
      monthlyPrice: 99,
      annualMonthlyPrice: 79,
      annualFullPrice: 948,
      currency: '₾',
      periodText: '/ თვეში',
      desc: 'პაკეტის მოკლე აღწერა და სამიზნე აუდიტორია.',
      features: [
        'სრული წვდომა სასწავლო მასალებზე',
        'ონლაინ ტესტები და შეფასებები',
        'სერტიფიკატის მიღების შესაძლებლობა'
      ],
      buttonText: 'პაკეტის გააქტიურება',
      buttonStyle: 'secondary',
      isPopular: false,
      isEnabled: true
    };

    setForm(prev => ({
      ...prev,
      plans: [...(prev.plans || []), newPlan]
    }));
  };

  // Remove Plan
  const handleRemovePlan = (planIndex) => {
    if ((form.plans || []).length <= 1) {
      alert('მინიმუმ ერთი სატარიფო პაკეტი უნდა დარჩეს სისტემაში.');
      return;
    }
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ პაკეტის „${form.plans[planIndex].name}“ წაშლა?`)) return;

    setForm(prev => ({
      ...prev,
      plans: prev.plans.filter((_, idx) => idx !== planIndex)
    }));
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMembershipContent(form);
      showToast('success', '✓ გამოწერის და ფასების CMS პარამეტრები წარმატებით შეინახა!');
    } catch (err) {
      console.error('Failed to save membership CMS:', err);
      showToast('error', 'შენახვა ვერ მოხერხდა: ' + (err.message || 'შეცდომა სერვერზე'));
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('დარწმუნებული ხართ, რომ გსურთ ყველა ტარიფისა და სათაურის ნაგულისხმევ მონაცემებზე დაბრუნება?')) {
      setForm(defaultMembershipContent);
      showToast('success', 'მონაცემები დაბრუნდა საწყის სტანდარტზე. დასამახსოვრებლად დააჭირეთ „შენახვას“.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg transition-all ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <span>{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Header Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-totc-teal/10 text-totc-teal text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pricing & Membership Content Management</span>
          </div>
          <h2 className="font-poppins font-black text-2xl sm:text-3xl text-totc-navy tracking-tight">
            გამოწერისა და ტარიფების მართვა
          </h2>
          <p className="font-poppins text-totc-gray text-xs sm:text-sm mt-1">
            მართეთ ფასების გვერდის სათაურები, ტარიფები (Free, Pro, Enterprise), ფასდაკლების ბეიჯები და ფუნქციების ჩამონათვალი.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ნაგულისხმევზე დაბრუნება</span>
          </button>

          {setActivePage && (
            <button
              type="button"
              onClick={() => {
                setActivePage('membership');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-full border border-totc-teal text-totc-teal hover:bg-totc-teal/10 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>გვერდის ნახვა</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || settingsLoading}
            className="px-6 py-2.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'ინახება...' : 'ცვლილებების შენახვა'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Page Header & Switcher Settings */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-lg text-totc-navy">
              გვერდის სათაური და გადამრთველები
            </h3>
            <p className="text-xs text-totc-gray">
              მთავარი ბანერის ტექსტები და ყოველთვიური/წლიური გადახდის გადამრთველის პარამეტრები.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              ზედა ბეიჯის ტექსტი
            </label>
            <input
              type="text"
              value={form.header?.badgeText || ''}
              onChange={(e) => handleHeaderChange('badgeText', e.target.value)}
              placeholder="მაგ: შეუზღუდავი სწავლების პაკეტი"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              ფასდაკლების ბეიჯი (წლიურ გადახდაზე)
            </label>
            <input
              type="text"
              value={form.header?.discountBadge || ''}
              onChange={(e) => handleHeaderChange('discountBadge', e.target.value)}
              placeholder="მაგ: დაზოგე 25%"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              მთავარი სათაური (H1)
            </label>
            <input
              type="text"
              value={form.header?.title || ''}
              onChange={(e) => handleHeaderChange('title', e.target.value)}
              placeholder="მაგ: მარტივი, სრული წვდომის წევრობა"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold focus:outline-none focus:border-totc-teal"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              ქვესათაური / აღწერა
            </label>
            <textarea
              rows={2}
              value={form.header?.subtitle || ''}
              onChange={(e) => handleHeaderChange('subtitle', e.target.value)}
              placeholder="გამოიწერეთ ერთხელ და გახსენით ყველა კურსი..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              ყოველთვიური გადახდის წარწერა
            </label>
            <input
              type="text"
              value={form.header?.monthlyBillingText || ''}
              onChange={(e) => handleHeaderChange('monthlyBillingText', e.target.value)}
              placeholder="ყოველთვიური გადახდა"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              წლიური გადახდის წარწერა
            </label>
            <input
              type="text"
              value={form.header?.annualBillingText || ''}
              onChange={(e) => handleHeaderChange('annualBillingText', e.target.value)}
              placeholder="წლიური გადახდა"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              გარანტიის / ქვედა შეტყობინების ტექსტი
            </label>
            <input
              type="text"
              value={form.header?.guaranteeText || ''}
              onChange={(e) => handleHeaderChange('guaranteeText', e.target.value)}
              placeholder="მაგ: 14-დღიანი თანხის დაბრუნების გარანტია. გაუქმება ნებისმიერ დროს."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Membership Plans Management */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-totc-teal flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-lg text-totc-navy">
                სატარიფო პაკეტების ბარათები
              </h3>
              <p className="text-xs text-totc-gray">
                დაარედაქტირეთ ფასები, ვალუტა, პოპულარობის სტატუსი და უპირატესობების ჩამონათვალი.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddPlan}
            className="px-4 py-2 rounded-full bg-teal-50 hover:bg-teal-100 text-totc-teal text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ პაკეტის დამატება</span>
          </button>
        </div>

        {/* Plans Grid / List */}
        <div className="space-y-6">
          {(form.plans || []).map((plan, pIdx) => (
            <div 
              key={plan.id || pIdx} 
              className={`p-6 rounded-2xl border transition-all ${
                plan.isPopular 
                  ? 'border-totc-teal bg-teal-50/20 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-xs flex items-center justify-center text-totc-navy">
                    #{pIdx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-base text-totc-navy flex items-center gap-2">
                      <span>{plan.name || 'უსახელო პაკეტი'}</span>
                      {plan.isPopular && (
                        <span className="px-2 py-0.5 rounded-full bg-totc-orange text-white text-[10px] font-bold uppercase flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>პოპულარული</span>
                        </span>
                      )}
                      {!plan.isEnabled && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-semibold">
                          გათიშული
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-totc-gray font-mono">
                      Plan ID: {plan.planId || 'Standard'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-totc-navy px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={plan.isEnabled !== false}
                      onChange={(e) => handlePlanChange(pIdx, 'isEnabled', e.target.checked)}
                      className="rounded text-totc-teal focus:ring-totc-teal"
                    />
                    <span>აქტიურია</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50">
                    <input
                      type="checkbox"
                      checked={Boolean(plan.isPopular)}
                      onChange={(e) => handlePlanChange(pIdx, 'isPopular', e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>⭐ პოპულარული</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemovePlan(pIdx)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1"
                    title="პაკეტის წაშლა"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Plan Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    პაკეტის სახელი *
                  </label>
                  <input
                    type="text"
                    value={plan.name || ''}
                    onChange={(e) => handlePlanChange(pIdx, 'name', e.target.value)}
                    placeholder="მაგ: სტუდენტური Pro"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    სისტემური Plan ID (API)
                  </label>
                  <input
                    type="text"
                    value={plan.planId || ''}
                    onChange={(e) => handlePlanChange(pIdx, 'planId', e.target.value)}
                    placeholder="Free / Pro / Enterprise"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    თვიური ფასი (₾)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={plan.monthlyPrice !== undefined ? plan.monthlyPrice : 0}
                    onChange={(e) => handlePlanChange(pIdx, 'monthlyPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-totc-navy focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    წლიურში თვის ფასი (₾)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={plan.annualMonthlyPrice !== undefined ? plan.annualMonthlyPrice : 0}
                    onChange={(e) => handlePlanChange(pIdx, 'annualMonthlyPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-emerald-600 focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    წლიური სრული თანხა (₾)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={plan.annualFullPrice !== undefined ? plan.annualFullPrice : 0}
                    onChange={(e) => handlePlanChange(pIdx, 'annualFullPrice', parseFloat(e.target.value) || 0)}
                    placeholder="მაგ: 588"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    პერიოდის წარწერა
                  </label>
                  <input
                    type="text"
                    value={plan.periodText || ''}
                    onChange={(e) => handlePlanChange(pIdx, 'periodText', e.target.value)}
                    placeholder="/ თვეში ან უფასო სამუდამოდ"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    ღილაკის წარწერა
                  </label>
                  <input
                    type="text"
                    value={plan.buttonText || ''}
                    onChange={(e) => handlePlanChange(pIdx, 'buttonText', e.target.value)}
                    placeholder="პაკეტის გააქტიურება"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    ღილაკის სტილი
                  </label>
                  <select
                    value={plan.buttonStyle || 'secondary'}
                    onChange={(e) => handlePlanChange(pIdx, 'buttonStyle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-totc-teal"
                  >
                    <option value="primary">მწვანე/ფირუზისფერი (Primary)</option>
                    <option value="dark">მუქი ლურჯი (Dark Navy)</option>
                    <option value="secondary">ნაცრისფერი (Secondary)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-totc-navy uppercase tracking-wider">
                    პაკეტის მოკლე აღწერა
                  </label>
                  <input
                    type="text"
                    value={plan.desc || ''}
                    onChange={(e) => handlePlanChange(pIdx, 'desc', e.target.value)}
                    placeholder="გახსენით შეუზღუდავი წვდომა ყველა კურსზე..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-totc-teal"
                  />
                </div>
              </div>

              {/* Features List for Plan */}
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                    პაკეტის უპირატესობები და შესაძლებლობები ({plan.features?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddFeature(pIdx)}
                    className="text-xs font-bold text-totc-teal hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>უპირატესობის დამატება</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(plan.features || []).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-totc-teal flex items-center justify-center text-[10px] font-bold shrink-0">
                        ✓
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(pIdx, fIdx, e.target.value)}
                        placeholder="უპირატესობის აღწერა..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(pIdx, fIdx)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="წაშლა"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

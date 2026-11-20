import React from 'react';
import { 
  Layers, Plus, Search, Edit3, Trash2, Layout, ExternalLink, RotateCcw, 
  Save, Home, Activity, Cloud, HelpCircle, School, Award, MessageSquare, 
  Newspaper, Sparkles, Image, Globe, Tag, Mail, Phone, X,
  Percent, DollarSign, Calendar, Clock, ShieldCheck, Users, Crown, ShoppingCart
} from 'lucide-react';
import { defaultHomeContent } from '../../context/SettingsContext';

export function AdminCategoriesTab({
  categoriesList,
  categorySearch,
  setCategorySearch,
  handleOpenCategoryModal,
  handleDeleteCategory,
  categoryModal,
  setCategoryModal,
  categoryForm,
  setCategoryForm,
  handleSaveCategory,
  savingCategory,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-totc-teal" />
              <span>კურსების კატეგორიების მართვა</span>
            </h3>
            <p className="text-xs text-totc-gray mt-1">
              დაამატეთ ახალი მიმართულებები, დაარედაქტირეთ ან წაშალეთ არსებული კატეგორიები. ცვლილებები მყისიერად აისახება კურსების კატალოგში.
            </p>
          </div>

          <button
            onClick={() => handleOpenCategoryModal()}
            className="px-5 py-2.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი კატეგორიის დამატება</span>
          </button>
        </div>

        {/* Search filter for categories */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="მოძებნეთ კატეგორია სახელით ან სლაგით..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal"
          />
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-totc-gray font-bold border-b border-gray-200">
                <th className="py-3 px-4">ხატულა / ლოგო</th>
                <th className="py-3 px-4">დასახელება</th>
                <th className="py-3 px-4">Slug (იდენტიფიკატორი)</th>
                <th className="py-3 px-4">აქტიური კურსები</th>
                <th className="py-3 px-4 text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoriesList
                .filter(cat => 
                  cat.name.toLowerCase().includes(categorySearch.toLowerCase()) || 
                  cat.slug.toLowerCase().includes(categorySearch.toLowerCase())
                )
                .map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      {cat.iconUrl ? (
                        <img src={cat.iconUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-contain bg-gray-50 border border-gray-200 p-1" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-totc-teal font-bold text-xs">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-totc-navy">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-totc-gray">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-totc-teal font-bold text-[11px]">
                        {cat.coursesCount || 0} კურსი
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                          title="რედაქტირება"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>რედაქტირება</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="წაშლა"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {categoriesList.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-totc-gray">
                    კატეგორიები არ მოიძებნა. დააჭირეთ „ახალი კატეგორიის დამატება“-ს დასაწყებად.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Create/Edit Modal */}
      {categoryModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
                <Layers className="w-5 h-5 text-totc-teal" />
                <span>{categoryModal.mode === 'create' ? 'ახალი კატეგორიის დამატება' : 'კატეგორიის რედაქტირება'}</span>
              </h3>
              <button
                onClick={() => setCategoryModal({ isOpen: false, mode: 'create', category: null })}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-totc-navy">კატეგორიის დასახელება *</label>
                <input
                  type="text"
                  required
                  placeholder="მაგ: ხელოვნური ინტელექტი, მარკეტინგი..."
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-totc-navy">Slug (იდენტიფიკატორი URL-ისთვის)</label>
                <input
                  type="text"
                  placeholder="მაგ: artificial-intelligence (დატოვეთ ცარიელი ავტოგენერაციისთვის)"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-totc-navy">ხატულის / სურათის ბმული (Icon URL)</label>
                <input
                  type="url"
                  placeholder="https://example.com/icon.svg"
                  value={categoryForm.iconUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, iconUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: false, mode: 'create', category: null })}
                  className="px-4 py-2 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-5 py-2 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md disabled:opacity-50"
                >
                  {savingCategory ? 'ინახება...' : categoryModal.mode === 'create' ? 'დამატება' : 'განახლება'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminHomeCmsTab({
  homeCmsForm,
  savingHomeCms,
  cmsSection,
  setCmsSection,
  handleSaveHomeCms,
  handleResetHomeCms,
  updateNestedCms,
  updateDeepCms,
  updateArrayCms,
  updateBulletCms,
  setActivePage,
}) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        
        {/* Top Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h3 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
              <Layout className="w-5 h-5 text-totc-teal" />
              <span>მთავარი გვერდის მართვა (Landing Page CMS)</span>
            </h3>
            <p className="text-xs text-totc-gray mt-1">
              მართეთ Landing Page-ის ყველა სექცია, სათაური, ტექსტი, ღილაკი, სტატისტიკა და ილუსტრაცია ერთ სივრცეში. ცვლილებები მომენტალურად აისახება საიტზე.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePage && setActivePage('home')}
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-totc-navy font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-totc-teal" />
              <span>მთავარი გვერდის ნახვა</span>
            </button>

            <button
              type="button"
              onClick={handleResetHomeCms}
              className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-600 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>სტანდარტულზე დაბრუნება</span>
            </button>

            <button
              type="button"
              onClick={handleSaveHomeCms}
              disabled={savingHomeCms}
              className="px-6 py-2.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingHomeCms ? 'ინახება...' : 'შენახვა და გააქტიურება'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Pills for CMS Sections */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'hero', label: '1. Hero ბანერი', icon: Home },
            { id: 'stats', label: '2. წარმატების სტატისტიკა', icon: Activity },
            { id: 'cloudSoftware', label: '3. ღრუბლოვანი პროგრამა', icon: Cloud },
            { id: 'whatIsTotc', label: '4. რა არის TOTC?', icon: HelpCircle },
            { id: 'classroom', label: '5. ფიზიკური აუდიტორია', icon: School },
            { id: 'features', label: '6. შესაძლებლობები', icon: Award },
            { id: 'testimonials', label: '7. შეფასებები', icon: MessageSquare },
            { id: 'news', label: '8. სიახლეების ბლოკი', icon: Newspaper },
          ].map(sec => {
            const SecIcon = sec.icon;
            const isCurrent = cmsSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setCmsSection(sec.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'bg-slate-50 text-totc-gray hover:text-totc-navy hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <SecIcon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content per Sub-section */}
        <form onSubmit={handleSaveHomeCms} className="space-y-6 pt-2">
          
          {/* 1. HERO SECTION */}
          {cmsSection === 'hero' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <Home className="w-4 h-4 text-totc-teal" />
                  <span>Hero ბანერის პარამეტრები (მთავარი ეკრანი)</span>
                </h4>
                <span className="text-[11px] font-semibold text-totc-gray">სექცია 1</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">სათაურის 1-ლი ნაწილი (მუქი ლურჯი)</label>
                  <input
                    type="text"
                    value={homeCmsForm.hero?.titlePart1 || ''}
                    onChange={(e) => updateNestedCms('hero', 'titlePart1', e.target.value)}
                    placeholder="ონლაინ სწავლა"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                  <p className="text-[10px] text-totc-gray">გამოჩნდება მუქი ლურჯი შრიფტით.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">სათაურის მე-2 ნაწილი (ნარინჯისფერი / ხაზგასმული)</label>
                  <input
                    type="text"
                    value={homeCmsForm.hero?.titlePart2 || ''}
                    onChange={(e) => updateNestedCms('hero', 'titlePart2', e.target.value)}
                    placeholder="ახლა ბევრად მარტივია"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                  <p className="text-[10px] text-totc-gray">გამოჩნდება ნარინჯისფერი აქცენტით.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">Hero ქვესათაური / სრული აღწერა</label>
                <textarea
                  rows={3}
                  value={homeCmsForm.hero?.description || ''}
                  onChange={(e) => updateNestedCms('hero', 'description', e.target.value)}
                  placeholder="TOTC არის თანამედროვე საგანმანათლებლო პლატფორმა..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">მთავარი ღილაკის ტექსტი (CTA 1)</label>
                  <input
                    type="text"
                    value={homeCmsForm.hero?.button1Text || ''}
                    onChange={(e) => updateNestedCms('hero', 'button1Text', e.target.value)}
                    placeholder="შეუერთდი უფასოდ"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">მეორე ღილაკის ტექსტი (ვიდეო/ინსტრუქცია CTA 2)</label>
                  <input
                    type="text"
                    value={homeCmsForm.hero?.button2Text || ''}
                    onChange={(e) => updateNestedCms('hero', 'button2Text', e.target.value)}
                    placeholder="ნახე როგორ მუშაობს"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">Hero სურათის ბმული (URL)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="text"
                    value={homeCmsForm.hero?.imageUrl || ''}
                    onChange={(e) => updateNestedCms('hero', 'imageUrl', e.target.value)}
                    placeholder="/assets/hero_student_cards.png"
                    className="flex-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                  />
                  <div className="w-16 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={homeCmsForm.hero?.imageUrl || '/assets/hero_student_cards.png'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/assets/hero_student_cards.png'; }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-totc-gray">სწრაფი არჩევანი:</span>
                  <button
                    type="button"
                    onClick={() => updateNestedCms('hero', 'imageUrl', '/assets/hero_student_cards.png')}
                    className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-totc-navy hover:bg-gray-100"
                  >
                    სტანდარტული TOTC გრაფიკა
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. SUCCESS STATS SECTION */}
          {cmsSection === 'stats' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <Activity className="w-4 h-4 text-totc-teal" />
                  <span>წარმატების სტატისტიკა (Success Stats)</span>
                </h4>
                <span className="text-[11px] font-semibold text-totc-gray">სექცია 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">სექციის სათაური</label>
                  <input
                    type="text"
                    value={homeCmsForm.stats?.title || ''}
                    onChange={(e) => updateNestedCms('stats', 'title', e.target.value)}
                    placeholder="ჩვენი წარმატება"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">სექციის აღწერა</label>
                  <textarea
                    rows={2}
                    value={homeCmsForm.stats?.description || ''}
                    onChange={(e) => updateNestedCms('stats', 'description', e.target.value)}
                    placeholder="ათასობით სტუდენტმა უკვე გაიუმჯობესა კარიერა..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-200/60">
                <h5 className="font-poppins font-bold text-xs uppercase tracking-wider text-totc-navy">
                  5 სტატისტიკური ბლოკი (რიცხვი და წარწერა)
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {(homeCmsForm.stats?.items || defaultHomeContent.stats.items).map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-xs">
                      <span className="text-[10px] font-bold text-totc-teal uppercase">ბლოკი #{idx + 1}</span>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-totc-navy">რიცხვი</label>
                        <input
                          type="text"
                          value={item.number || ''}
                          onChange={(e) => updateArrayCms('stats', 'items', idx, 'number', e.target.value)}
                          placeholder="15K+"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-black text-totc-navy focus:border-totc-teal outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-totc-navy">წარწერა</label>
                        <input
                          type="text"
                          value={item.label || ''}
                          onChange={(e) => updateArrayCms('stats', 'items', idx, 'label', e.target.value)}
                          placeholder="აქტიური სტუდენტი"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium text-totc-gray focus:border-totc-teal outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. CLOUD SOFTWARE SECTION */}
          {cmsSection === 'cloudSoftware' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-totc-teal" />
                  <span>ღრუბლოვანი სასწავლო პროგრამა (All-in-One Cloud Software)</span>
                </h4>
                <span className="text-[11px] font-semibold text-totc-gray">სექცია 3</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">სათაურის 1-ლი ნაწილი (მუქი ლურჯი)</label>
                  <input
                    type="text"
                    value={homeCmsForm.cloudSoftware?.titlePart1 || ''}
                    onChange={(e) => updateNestedCms('cloudSoftware', 'titlePart1', e.target.value)}
                    placeholder="ყველაფერი ერთ"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">სათაურის მე-2 ნაწილი (ფირუზისფერი)</label>
                  <input
                    type="text"
                    value={homeCmsForm.cloudSoftware?.titlePart2 || ''}
                    onChange={(e) => updateNestedCms('cloudSoftware', 'titlePart2', e.target.value)}
                    placeholder="ღრუბლოვან პროგრამაში"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">სექციის აღწერა</label>
                <textarea
                  rows={2}
                  value={homeCmsForm.cloudSoftware?.description || ''}
                  onChange={(e) => updateNestedCms('cloudSoftware', 'description', e.target.value)}
                  placeholder="TOTC არის ერთიანი პლატფორმა..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-200/60">
                <h5 className="font-poppins font-bold text-xs uppercase tracking-wider text-totc-navy">
                  3 ფუნქციური ბარათი (Features Grid)
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(homeCmsForm.cloudSoftware?.features || defaultHomeContent.cloudSoftware.features).map((feat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-xs">
                      <span className="text-[10px] font-bold text-totc-teal uppercase">ბარათი #{idx + 1}</span>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-totc-navy">სათაური</label>
                        <input
                          type="text"
                          value={feat.title || ''}
                          onChange={(e) => updateArrayCms('cloudSoftware', 'features', idx, 'title', e.target.value)}
                          placeholder="ბარათის სათაური"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-totc-navy focus:border-totc-teal outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-totc-navy">აღწერა</label>
                        <textarea
                          rows={3}
                          value={feat.desc || ''}
                          onChange={(e) => updateArrayCms('cloudSoftware', 'features', idx, 'desc', e.target.value)}
                          placeholder="დეტალური აღწერა..."
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-totc-gray focus:border-totc-teal outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-totc-navy">ხატულის / სურათის URL</label>
                        <input
                          type="text"
                          value={feat.icon || ''}
                          onChange={(e) => updateArrayCms('cloudSoftware', 'features', idx, 'icon', e.target.value)}
                          placeholder="/assets/all_in_one_billing.png"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-totc-navy focus:border-totc-teal outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. WHAT IS TOTC SECTION */}
          {cmsSection === 'whatIsTotc' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-totc-teal" />
                  <span>რა არის TOTC? (What is TOTC Section)</span>
                </h4>
                <span className="text-[11px] font-semibold text-totc-gray">სექცია 4</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">სექციის სათაური</label>
                <input
                  type="text"
                  value={homeCmsForm.whatIsTotc?.title || ''}
                  onChange={(e) => updateNestedCms('whatIsTotc', 'title', e.target.value)}
                  placeholder="რა არის TOTC?"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">სექციის სრული აღწერა</label>
                <textarea
                  rows={3}
                  value={homeCmsForm.whatIsTotc?.description || ''}
                  onChange={(e) => updateNestedCms('whatIsTotc', 'description', e.target.value)}
                  placeholder="TOTC არის ინოვაციური საგანმანათლებლო პლატფორმა..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-200/60">
                {/* Instructor Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-totc-navy uppercase">1. ინსტრუქტორების ბარათი</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">ლექტორები</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-totc-navy">ბარათის სათაური</label>
                    <input
                      type="text"
                      value={homeCmsForm.whatIsTotc?.instructorCard?.title || ''}
                      onChange={(e) => updateDeepCms('whatIsTotc', 'instructorCard', 'title', e.target.value)}
                      placeholder="ინსტრუქტორებისთვის"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-totc-navy focus:border-totc-teal outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-totc-navy">ღილაკის ტექსტი</label>
                    <input
                      type="text"
                      value={homeCmsForm.whatIsTotc?.instructorCard?.buttonText || ''}
                      onChange={(e) => updateDeepCms('whatIsTotc', 'instructorCard', 'buttonText', e.target.value)}
                      placeholder="დაიწყე სწავლება დღესვე"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-totc-navy focus:border-totc-teal outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-totc-navy">სურათის URL</label>
                    <input
                      type="text"
                      value={homeCmsForm.whatIsTotc?.instructorCard?.image || ''}
                      onChange={(e) => updateDeepCms('whatIsTotc', 'instructorCard', 'image', e.target.value)}
                      placeholder="/assets/instructor_card.png"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-totc-navy focus:border-totc-teal outline-none"
                    />
                  </div>
                </div>

                {/* Student Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-totc-navy uppercase">2. სტუდენტების ბარათი</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 text-[10px] font-bold">სტუდენტები</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-totc-navy">ბარათის სათაური</label>
                    <input
                      type="text"
                      value={homeCmsForm.whatIsTotc?.studentCard?.title || ''}
                      onChange={(e) => updateDeepCms('whatIsTotc', 'studentCard', 'title', e.target.value)}
                      placeholder="სტუდენტებისთვის"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-totc-navy focus:border-totc-teal outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-totc-navy">ღილაკის ტექსტი</label>
                    <input
                      type="text"
                      value={homeCmsForm.whatIsTotc?.studentCard?.buttonText || ''}
                      onChange={(e) => updateDeepCms('whatIsTotc', 'studentCard', 'buttonText', e.target.value)}
                      placeholder="დაიწყე სწავლა ახლავე"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-totc-navy focus:border-totc-teal outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-totc-navy">სურათის URL</label>
                    <input
                      type="text"
                      value={homeCmsForm.whatIsTotc?.studentCard?.image || ''}
                      onChange={(e) => updateDeepCms('whatIsTotc', 'studentCard', 'image', e.target.value)}
                      placeholder="/assets/student_card.png"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-totc-navy focus:border-totc-teal outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. PHYSICAL CLASSROOM SECTION */}
          {cmsSection === 'classroom' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <School className="w-4 h-4 text-totc-teal" />
                  <span>ფიზიკური აუდიტორიის ფუნქციონალი (Classroom Feature)</span>
                </h4>
                <span className="text-[11px] font-semibold text-totc-gray">სექცია 5</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">სექციის მთავარი სათაური</label>
                <input
                  type="text"
                  value={homeCmsForm.classroom?.title || ''}
                  onChange={(e) => updateNestedCms('classroom', 'title', e.target.value)}
                  placeholder="ყველაფერი, რაც ფიზიკურ აუდიტორიაშია შესაძლებელი, ხელმისაწვდომია TOTC-ში"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">სრული აღწერა</label>
                <textarea
                  rows={3}
                  value={homeCmsForm.classroom?.description || ''}
                  onChange={(e) => updateNestedCms('classroom', 'description', e.target.value)}
                  placeholder="TOTC-ის სასწავლო მართვის სისტემა ეხმარება ტრადიციულ და ონლაინ სკოლებს..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">ღილაკის წარწერა (CTA)</label>
                  <input
                    type="text"
                    value={homeCmsForm.classroom?.buttonText || ''}
                    onChange={(e) => updateNestedCms('classroom', 'buttonText', e.target.value)}
                    placeholder="გაიგეთ მეტი"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">ილუსტრაციის / სურათის ბმული</label>
                  <input
                    type="text"
                    value={homeCmsForm.classroom?.image || ''}
                    onChange={(e) => updateNestedCms('classroom', 'image', e.target.value)}
                    placeholder="/assets/classroom_feature.png"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. FEATURES SECTION */}
          {cmsSection === 'features' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <Award className="w-4 h-4 text-totc-teal" />
                  <span>შესაძლებლობები და უპირატესობები (Features Showcase)</span>
                </h4>
                <span className="text-[11px] font-semibold text-totc-gray">სექცია 6</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">სექციის სათაური</label>
                  <input
                    type="text"
                    value={homeCmsForm.features?.title || ''}
                    onChange={(e) => updateNestedCms('features', 'title', e.target.value)}
                    placeholder="ჩვენი შესაძლებლობები"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">სექციის ქვესათაური / აღწერა</label>
                  <input
                    type="text"
                    value={homeCmsForm.features?.description || ''}
                    onChange={(e) => updateNestedCms('features', 'description', e.target.value)}
                    placeholder="უნიკალური ფუნქციონალი, რომელიც სასწავლო პროცესს..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                  />
                </div>
              </div>

              {/* Feature 1 Details & Bullets */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
                <span className="text-xs font-bold text-totc-teal uppercase">1. ინტერფეისის ფუნქციონალი & Bullet პუნქტები</span>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-totc-navy">პირველი ფუნქციის სათაური</label>
                  <input
                    type="text"
                    value={homeCmsForm.features?.feature1Title || ''}
                    onChange={(e) => updateNestedCms('features', 'feature1Title', e.target.value)}
                    placeholder="საკლასო ოთახზე მორგებული ინტერფეისი"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-totc-navy focus:border-totc-teal outline-none"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold text-totc-navy">3 პუნქტი (Bullet Points):</label>
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-totc-gray shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={homeCmsForm.features?.feature1Bullets?.[idx] || ''}
                        onChange={(e) => updateBulletCms('features', 'feature1Bullets', idx, e.target.value)}
                        placeholder={`პუნქტი ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-totc-navy focus:border-totc-teal outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature 2 Details */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-xs">
                <span className="text-xs font-bold text-totc-teal uppercase">2. სასწავლო ინსტრუმენტების ფუნქციონალი</span>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-totc-navy">მეორე ფუნქციის სათაური</label>
                  <input
                    type="text"
                    value={homeCmsForm.features?.feature2Title || ''}
                    onChange={(e) => updateNestedCms('features', 'feature2Title', e.target.value)}
                    placeholder="ინსტრუმენტები ლექტორებისა და სტუდენტებისთვის"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-totc-navy focus:border-totc-teal outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-totc-navy">დეტალური აღწერა</label>
                  <textarea
                    rows={3}
                    value={homeCmsForm.features?.feature2Description || ''}
                    onChange={(e) => updateNestedCms('features', 'feature2Description', e.target.value)}
                    placeholder="სისტემა გთავაზობთ სასწავლო ინსტრუმენტების დინამიურ ნაკრებს..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-totc-navy focus:border-totc-teal outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. TESTIMONIALS SECTION */}
          {cmsSection === 'testimonials' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-totc-teal" />
                  <span>შეფასებების სექცია (Testimonials)</span>
                </h4>
                <span className="text-[11px] font-semibold text-totc-gray">სექცია 7</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">ბეიჯის წარწერა (მცირე სათაური)</label>
                  <input
                    type="text"
                    value={homeCmsForm.testimonials?.badge || ''}
                    onChange={(e) => updateNestedCms('testimonials', 'badge', e.target.value)}
                    placeholder="შეფასებები"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold uppercase tracking-wider"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-totc-navy">მთავარი სათაური</label>
                  <input
                    type="text"
                    value={homeCmsForm.testimonials?.title || ''}
                    onChange={(e) => updateNestedCms('testimonials', 'title', e.target.value)}
                    placeholder="რას ამბობენ ჩვენზე?"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">ტექსტი / აღწერა</label>
                <textarea
                  rows={3}
                  value={homeCmsForm.testimonials?.description || ''}
                  onChange={(e) => updateNestedCms('testimonials', 'description', e.target.value)}
                  placeholder="TOTC-ს უკვე 100,000-ზე მეტი დადებითი შეფასება აქვს მთელი მსოფლიოდან..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy leading-relaxed"
                />
              </div>

              <div className="space-y-2 max-w-sm">
                <label className="text-xs font-bold text-totc-navy">ღილაკის წარწერა (CTA)</label>
                <input
                  type="text"
                  value={homeCmsForm.testimonials?.buttonText || ''}
                  onChange={(e) => updateNestedCms('testimonials', 'buttonText', e.target.value)}
                  placeholder="დაწერეთ შეფასება"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                />
              </div>
            </div>
          )}

          {/* 8. LATEST NEWS SECTION */}
          {cmsSection === 'news' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-totc-teal" />
                  <span>სიახლეების ბლოკი (Latest News & Resources)</span>
                </h4>
                <span className="text-[11px] font-semibold text-totc-gray">სექცია 8</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">სექციის სათაური</label>
                <input
                  type="text"
                  value={homeCmsForm.news?.title || ''}
                  onChange={(e) => updateNestedCms('news', 'title', e.target.value)}
                  placeholder="ბოლო სიახლეები და რესურსები"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">ქვესათაური / აღწერა</label>
                <textarea
                  rows={2}
                  value={homeCmsForm.news?.description || ''}
                  onChange={(e) => updateNestedCms('news', 'description', e.target.value)}
                  placeholder="გაეცანით TOTC-ის განვითარებას და სიახლეებს საგანმანათლებლო ტექნოლოგიებში"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                />
              </div>
            </div>
          )}

          {/* Bottom Global Save Action */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <div className="text-xs text-totc-gray font-medium">
              ცვლილებების შენახვის შემდეგ ახალი კონტენტი მყისიერად გააქტიურდება Landing Page-ზე.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetHomeCms}
                className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>საწყისზე დაბრუნება</span>
              </button>

              <button
                type="submit"
                disabled={savingHomeCms}
                className="px-8 py-3 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingHomeCms ? 'ინახება...' : 'მთავარი გვერდის შენახვა და გააქტიურება'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export function AdminSettingsTab({
  settingsForm,
  setSettingsForm,
  handleSaveSettings,
  savingSettings,
}) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div>
          <h3 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>საიტის პარამეტრები, ლოგო და ბრენდინგი</span>
          </h3>
          <p className="text-xs text-totc-gray mt-1">
            მართეთ პლატფორმის ლოგო, საიტის დასახელება, მთავარი გვერდის სათაურები და საკონტაქტო მონაცემები. ცვლილებები მომენტალურად აისახება ნავბარში, ფუტერსა და მთელ საიტზე.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* 1. Logo Branding Section */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-4">
            <h4 className="font-poppins font-bold text-sm text-totc-navy flex items-center gap-2">
              <Image className="w-4 h-4 text-totc-teal" />
              <span>პლატფორმის ლოგო (Logo Management)</span>
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Live Preview */}
              <div className="w-48 h-20 rounded-2xl bg-white border-2 border-dashed border-gray-200 p-2 flex items-center justify-center shadow-inner shrink-0">
                {settingsForm.logoUrl ? (
                  <img
                    src={settingsForm.logoUrl}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-totc-gray text-xs">
                    <div className="w-8 h-8 rounded-lg bg-totc-teal flex items-center justify-center text-white font-black text-xs">
                      {(settingsForm.siteName || 'T').charAt(0)}
                    </div>
                    <span className="font-bold text-totc-navy">{settingsForm.siteName || 'TOTC'}</span>
                  </div>
                )}
              </div>

              {/* Logo URL Input */}
              <div className="flex-1 space-y-2 w-full">
                <label className="text-xs font-bold text-totc-navy">ლოგოს სურათის ბმული (Image URL)</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png ან SVG ბმული"
                  value={settingsForm.logoUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                />
                <p className="text-[11px] text-totc-gray">
                  მიუთითეთ პირდაპირი ბმული გამჭვირვალე PNG ან SVG ლოგოზე. თუ ველი ცარიელია, გამოიყენება სტანდარტული TOTC ემბლემა.
                </p>
                
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-semibold text-totc-gray">სწრაფი ნიმუშები:</span>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-bold text-totc-navy hover:bg-gray-100"
                  >
                    სტანდარტული ემბლემა
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' })}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50"
                  >
                    Modern Geometric
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Brand & Platform Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-totc-navy flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-totc-teal" />
                <span>საიტის დასახელება (Brand / Site Name)</span>
              </label>
              <input
                type="text"
                required
                value={settingsForm.siteName}
                onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                placeholder="მაგ: TOTC E-Learning"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy font-semibold"
              />
              <p className="text-[10px] text-totc-gray">ჩნდება ნავბარში, ფუტერში და ბრაუზერის სათაურში.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-totc-navy flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-totc-teal" />
                <span>ფუტერის ქვესათაური / აღწერა</span>
              </label>
              <input
                type="text"
                value={settingsForm.footerText}
                onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                placeholder="მაგ: ვირტუალური საკლასო ოთახი და ონლაინ განათლების სისტემა"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
              />
            </div>
          </div>

          {/* 3. Hero Headlines */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h4 className="font-poppins font-bold text-sm text-totc-navy">მთავარი გვერდის სათაურები</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">მთავარი სარეკლამო სათაური (Hero Title)</label>
                <input
                  type="text"
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  placeholder="მაგ: ისწავლეთ ონლაინ შეუზღუდავად"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy">ქვესათაური / აღწერა (Hero Subtitle)</label>
                <input
                  type="text"
                  value={settingsForm.heroSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  placeholder="მაგ: თანამედროვე საგანმანათლებლო პლატფორმა..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                />
              </div>
            </div>
          </div>

          {/* 4. Support Contacts */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h4 className="font-poppins font-bold text-sm text-totc-navy">საკონტაქტო ინფორმაცია</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-totc-teal" />
                  <span>მხარდაჭერის ელ-ფოსტა</span>
                </label>
                <input
                  type="email"
                  value={settingsForm.contactEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  placeholder="support@totc.edu.ge"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-totc-navy flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-totc-teal" />
                  <span>მხარდაჭერის ტელეფონი</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.contactPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                  placeholder="+995 32 200 00 00"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy"
                />
              </div>
            </div>
          </div>

          {/* 5. Revenue Sharing & Financial Policy Controls */}
          <div className="space-y-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-poppins font-bold text-base text-totc-navy flex items-center gap-2">
                  <Percent className="w-4 h-4 text-totc-teal" />
                  <span>ფინანსური წესები და შემოსავლის გაყოფა (Revenue Share)</span>
                </h4>
                <p className="text-xs text-totc-gray mt-0.5">
                  მართეთ ინსტრუქტორთა ანაზღაურების პროცენტები, გაყოფის წესები და გატანის პირობები.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                ადმინისტრაციული კონტროლი
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option A: Instructor Referral (ლექტორის მოყვანილი) */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>როცა ლექტორმა მოიყვანა სტუდენტი (რეფერალი)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                    {settingsForm.instructorReferralShare || 80} / {100 - (settingsForm.instructorReferralShare || 80)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">ინსტრუქტორის წილი (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={settingsForm.instructorReferralShare ?? 80}
                      onChange={(e) => {
                        const val = Math.min(99, Math.max(1, parseInt(e.target.value) || 0));
                        setSettingsForm({
                          ...settingsForm,
                          instructorReferralShare: val,
                          platformReferralShare: 100 - val
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-black text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">პლატფორმის წილი (%)</label>
                    <input
                      type="number"
                      disabled
                      value={100 - (settingsForm.instructorReferralShare ?? 80)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-xs font-bold text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  მოქმედებს, როცა სტუდენტი ყიდულობს კურსს ინსტრუქტორის პირადი რეფერალური ბმულით.
                </p>
              </div>

              {/* Option B: Organic Platform Discovery (პლატფორმაზე ნაპოვნი) */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>როცა სტუდენტმა პლატფორმაზე ნახა (ორგანული)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-900">
                    {settingsForm.instructorOrganicShare || 60} / {100 - (settingsForm.instructorOrganicShare || 60)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">ინსტრუქტორის წილი (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={settingsForm.instructorOrganicShare ?? 60}
                      onChange={(e) => {
                        const val = Math.min(99, Math.max(1, parseInt(e.target.value) || 0));
                        setSettingsForm({
                          ...settingsForm,
                          instructorOrganicShare: val,
                          platformOrganicShare: 100 - val
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-xs font-black text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">პლატფორმის წილი (%)</label>
                    <input
                      type="number"
                      disabled
                      value={100 - (settingsForm.instructorOrganicShare ?? 60)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-xs font-bold text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  მოქმედებს, როცა სტუდენტი პოულობს კურსს TOTC-ის კატალოგიდან, რეკლამიდან ან ძიებიდან (ნაგულისხმევი 60/40).
                </p>
              </div>

              {/* Option C: Subscription Pool Share */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-indigo-600" />
                    <span>საერთო გამოწერის ფონდის წილი (Subscription Pool)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/70 text-indigo-900">
                    {settingsForm.subscriptionPoolShare || 80}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">საინსტრუქტორო ფონდი (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={settingsForm.subscriptionPoolShare ?? 80}
                      onChange={(e) => {
                        const val = Math.min(99, Math.max(1, parseInt(e.target.value) || 0));
                        setSettingsForm({
                          ...settingsForm,
                          subscriptionPoolShare: val,
                          platformSubscriptionShare: 100 - val
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-black text-indigo-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">პლატფორმის საკომისიო (%)</label>
                    <input
                      type="number"
                      disabled
                      value={100 - (settingsForm.subscriptionPoolShare ?? 80)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-xs font-bold text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  მთლიანი გამოწერებიდან რა წილი განაწილდება ინსტრუქტორებზე Watch-Time პროპორციით.
                </p>
              </div>

              {/* Option D: Payout Parameters */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-150 space-y-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span>გატანის ზღვარი და განრიგი</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">მინ. ზღვარი (₾)</label>
                    <input
                      type="number"
                      min="1"
                      value={settingsForm.minimumPayoutThreshold ?? 50}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minimumPayoutThreshold: Number(e.target.value) || 50 })}
                      className="w-full px-2.5 py-2 rounded-xl border border-amber-200 bg-white text-xs font-bold text-amber-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">ჩარიცხვის დღეები</label>
                    <input
                      type="text"
                      value={settingsForm.payoutScheduleDays || '5-10'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, payoutScheduleDays: e.target.value })}
                      placeholder="5-10"
                      className="w-full px-2.5 py-2 rounded-xl border border-amber-200 bg-white text-xs font-bold text-amber-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Refund ბუფერი (დღე)</label>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm.refundBufferDays ?? 14}
                      onChange={(e) => setSettingsForm({ ...settingsForm, refundBufferDays: Number(e.target.value) || 14 })}
                      className="w-full px-2.5 py-2 rounded-xl border border-amber-200 bg-white text-xs font-bold text-amber-800 text-center"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  მინიმალური თანხა გატანისთვის, ყოველთვიური ჩარიცხვის ფანჯარა და თანხის დაბრუნების ბუფერი.
                </p>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-8 py-3 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'ინახება...' : 'პარამეტრების შენახვა და გააქტიურება'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminCmsSettingsTab({
  activeTab,
  categoriesProps,
  homeCmsProps,
  settingsProps,
}) {
  if (activeTab === 'categories') {
    return <AdminCategoriesTab {...categoriesProps} />;
  }
  if (activeTab === 'home_cms') {
    return <AdminHomeCmsTab {...homeCmsProps} />;
  }
  if (activeTab === 'settings') {
    return <AdminSettingsTab {...settingsProps} />;
  }
  return null;
}

export default AdminCmsSettingsTab;

import React from 'react';
import { 
  FileText, Unlock, Lock, Image as ImageIcon, Loader2, UploadCloud 
} from 'lucide-react';

export const PRESET_THUMBNAILS = [
  { label: 'ქლაუდი და DevOps', url: '/assets/explore_row_1.png' },
  { label: 'UI/UX დიზაინი', url: '/assets/explore_row_2.png' },
  { label: 'ფოტოგრაფია და მედია', url: '/assets/explore_row_3.png' },
  { label: 'პროგრამირება', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80' },
  { label: 'ბიზნესი და ტექნოლოგიები', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80' },
];

export function CourseMetadataForm({
  title,
  setTitle,
  description,
  setDescription,
  categoryId,
  setCategoryId,
  categories,
  level,
  setLevel,
  price,
  setPrice,
  isOpenAccess,
  setIsOpenAccess,
  thumbnailUrl,
  setThumbnailUrl,
  uploadingArtwork,
  handleArtworkUpload,
}) {
  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
          <FileText className="w-4 h-4 text-totc-teal" />
          <span>კურსის ძირითადი მონაცემები</span>
        </h3>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
            კურსის სათაური <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="მაგ: AWS Cloud არქიტექტურა და DevOps"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20 outline-none text-sm font-medium transition-all"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
            მიმოხილვა / აღწერა
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="მოკლედ აღწერეთ რას ისწავლიან სტუდენტები ამ კურსში..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20 outline-none text-sm transition-all"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
            მიმართულება / კატეგორია
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20 outline-none text-sm font-medium transition-all bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            {categories.length === 0 && (
              <option value="">ზოგადი განვითარება</option>
            )}
          </select>
        </div>

        {/* Level & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              სირთულის დონე
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-medium transition-all bg-white"
            >
              <option value="Beginner">დამწყები</option>
              <option value="Intermediate">საშუალო</option>
              <option value="Advanced">პროფესიონალი</option>
              <option value="AllLevels">ყველა დონე</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
              ფასი (₾ GEL)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₾</span>
              <input
                type="number"
                min="0"
                step="5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-8 pr-3 py-3 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-bold text-totc-navy transition-all"
              />
            </div>
          </div>
        </div>

        {/* Course Access Mode */}
        <div className="pt-3 border-t border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-totc-navy uppercase tracking-wider flex items-center gap-1.5">
              {isOpenAccess ? (
                <Unlock className="w-3.5 h-3.5 text-totc-teal" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>მასალებზე წვდომის რეჟიმი</span>
            </label>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
              isOpenAccess 
                ? 'bg-teal-50 text-totc-teal border border-teal-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isOpenAccess ? 'სრულად ღია' : 'თანმიმდევრული'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Sequential / Gated option */}
            <div
              onClick={() => setIsOpenAccess(false)}
              className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start gap-3 text-left ${
                !isOpenAccess 
                  ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-xs' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="courseAccessMode"
                checked={!isOpenAccess}
                onChange={() => setIsOpenAccess(false)}
                className="mt-0.5 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-totc-navy">
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>🔒 ეტაპობრივი გავლა (გავლის მიხედვით)</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  ლექციები და ტესტები იხსნება თანმიმდევრულად — წინა მასალის ნახვისა და გამოცდის ჩაბარების შემდეგ.
                </p>
              </div>
            </div>

            {/* Open Access non-linear option */}
            <div
              onClick={() => setIsOpenAccess(true)}
              className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start gap-3 text-left ${
                isOpenAccess 
                  ? 'bg-teal-50/60 border-teal-400 ring-2 ring-teal-500/20 shadow-xs' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="courseAccessMode"
                checked={isOpenAccess}
                onChange={() => setIsOpenAccess(true)}
                className="mt-0.5 text-totc-teal focus:ring-totc-teal cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-totc-navy">
                  <Unlock className="w-3.5 h-3.5 text-totc-teal shrink-0" />
                  <span>🔓 სრულად ღია კურსი (თავისუფალი წვდომა)</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  შეძენისთანავე სტუდენტს შეუძლია ნებისმიერი ლექციის (მაგ. მე-6 ლექციის) პირდაპირ ნახვა წინების გავლის გარეშე.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Selection */}
      <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-totc-teal" />
          <span>კურსის გარეკანი</span>
        </h3>

        {/* Current Preview */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200 shadow-inner">
          <img
            src={thumbnailUrl || '/assets/explore_row_1.png'}
            alt="გარეკანის გადახედვა"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Custom Image File Upload Dropzone */}
        <div>
          <label className={`cursor-pointer w-full p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1.5 text-center ${
            uploadingArtwork
              ? 'bg-amber-50 border-amber-300 pointer-events-none'
              : 'bg-teal-50/40 hover:bg-teal-50 border-teal-200 hover:border-totc-teal'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-totc-teal flex items-center justify-center shrink-0">
              {uploadingArtwork ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              ) : (
                <UploadCloud className="w-5 h-5 text-totc-teal" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-totc-navy">
                {uploadingArtwork ? 'იტვირთება გარეკანის ფოტო...' : 'ატვირთე საჩვენებელი ფოტო'}
              </p>
              <p className="text-[10px] text-gray-500">
                აირჩიეთ PNG, JPG ან WebP ფაილი (მაქს. 10MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingArtwork}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleArtworkUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">
            აირჩიეთ მზა სურათი
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_THUMBNAILS.map((p, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setThumbnailUrl(p.url)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate border transition-all ${
                  thumbnailUrl === p.url
                    ? 'border-totc-teal bg-totc-teal-light text-totc-teal font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-totc-navy'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom URL */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">
            ან ჩასვით სურათის ბმული (URL)
          </label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy transition-all"
          />
        </div>
      </div>
    </div>
  );
}
export default CourseMetadataForm;

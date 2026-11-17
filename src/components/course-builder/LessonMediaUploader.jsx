import React from 'react';
import { 
  UploadCloud, Loader2, Video, Sparkles, Trash2, 
  Paperclip, FileText 
} from 'lucide-react';

export function LessonMediaUploader({
  sIdx,
  lIdx,
  lesson,
  handleLessonChange,
  uploadingKey,
  uploadProgress,
  uploadNotice,
  setUploadNotice,
  handleVideoUpload,
  uploadingResourceKey,
  handleResourceUpload,
  handleRemoveResource,
}) {
  const itemKey = `${sIdx}-${lIdx}`;
  const isVideoUploading = uploadingKey === itemKey;
  const isResourceUploading = uploadingResourceKey === itemKey;

  return (
    <div className="space-y-3 pt-1">
      {/* 1. Video Upload / Bunny Stream CDN Management */}
      <div className="space-y-2">
        {!lesson.videoUrl ? (
          <label className={`cursor-pointer w-full p-4 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isVideoUploading
              ? 'bg-amber-50 border-amber-300 pointer-events-none'
              : 'bg-indigo-50/40 hover:bg-indigo-50/80 border-indigo-200 hover:border-indigo-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                {isVideoUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-950">
                  {isVideoUploading ? `იტვირთება ვიდეო (${uploadProgress}%)...` : 'ატვირთეთ ლექციის ვიდეო ფაილი'}
                </p>
                <p className="text-[11px] text-indigo-600/80">
                  აირჩიეთ MP4, MOV ან WebM ფაილი (მაქს. 2GB). იტვირთება პირდაპირ Bunny CDN-ზე.
                </p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-colors shrink-0">
              ვიდეოს არჩევა
            </span>

            <input
              type="file"
              accept="video/*"
              disabled={isVideoUploading}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleVideoUpload(sIdx, lIdx, e.target.files[0], lesson.title);
                }
              }}
              className="hidden"
            />
          </label>
        ) : (
          <div className="p-3 bg-gradient-to-r from-teal-50/80 to-emerald-50/60 rounded-xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-teal-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    {lesson.videoUrl.includes('mediadelivery.net') || lesson.videoUrl.includes('b-cdn.net')
                      ? '⚡ Bunny Stream CDN ვიდეო მზადაა'
                      : '📁 ვიდეო ფაილი მიმაგრებულია'}
                  </span>
                  <a
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline"
                  >
                    გადახედვა
                  </a>
                </div>
                <p className="text-[10px] text-gray-500 font-mono truncate max-w-xs sm:max-w-md">
                  {lesson.videoUrl.split('/').pop()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <label className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors border shadow-xs ${
                isVideoUploading
                  ? 'bg-amber-50 text-amber-700 border-amber-300 pointer-events-none'
                  : 'bg-white hover:bg-gray-50 text-totc-navy border-gray-200'
              }`}>
                {isVideoUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>იტვირთება ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5 text-totc-teal" />
                    <span>ვიდეოს შეცვლა</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  disabled={isVideoUploading}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleVideoUpload(sIdx, lIdx, e.target.files[0], lesson.title);
                    }
                  }}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => handleLessonChange(sIdx, lIdx, 'videoUrl', '')}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="მიმაგრებული ვიდეოს წაშლა"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Video Upload Progress Bar */}
        {isVideoUploading && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 animate-bounce text-amber-600" />
                მიმდინარეობს ვიდეო ნაკადის ატვირთვა Bunny CDN-ზე...
              </span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Video Upload Notice Toast */}
        {uploadNotice?.key === itemKey && (
          <div className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-between gap-2 ${
            uploadNotice.isSuccess 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <span>{uploadNotice.message}</span>
            <button 
              type="button" 
              onClick={() => setUploadNotice(null)} 
              className="text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. Downloadable Resources & Attachments */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-totc-navy flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-totc-teal" />
            <span>ჩამოსატვირთი მასალები ({lesson.resources?.length || 0})</span>
          </span>

          <label className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border shadow-2xs ${
            isResourceUploading
              ? 'bg-amber-50 text-amber-700 border-amber-300 pointer-events-none'
              : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
          }`}>
            {isResourceUploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                <span>იტვირთება...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3 h-3" />
                <span>+ ფაილის მიმაგრება (PDF, ZIP, კოდი)</span>
              </>
            )}
            <input
              type="file"
              disabled={isResourceUploading}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleResourceUpload(sIdx, lIdx, e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        {lesson.resources && lesson.resources.length > 0 && (
          <div className="space-y-1.5">
            {lesson.resources.map((res, rIdx) => (
              <div
                key={res.id || rIdx}
                className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-totc-teal shrink-0" />
                  <span className="font-semibold text-totc-navy truncate max-w-[200px] sm:max-w-xs">
                    {res.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">
                    ({res.size || res.fileSize})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveResource(sIdx, lIdx, rIdx)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors shrink-0"
                  title="Remove attachment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default LessonMediaUploader;

import React from 'react';
import { 
  Layers, Plus, Trash2, Clock, HelpCircle, Save, Sparkles 
} from 'lucide-react';
import { LessonMediaUploader } from './LessonMediaUploader';
import { QuizBuilderModal } from './QuizBuilderModal';

export function CurriculumBuilder({
  sections,
  setSections,
  handleAddSection,
  handleRemoveSection,
  handleSectionTitleChange,
  handleAddLesson,
  handleAddFinalExam,
  handleRemoveLesson,
  handleLessonChange,
  // LessonMediaUploader props
  uploadingKey,
  uploadProgress,
  uploadNotice,
  setUploadNotice,
  handleVideoUpload,
  uploadingResourceKey,
  handleResourceUpload,
  handleRemoveResource,
  // QuizBuilderModal props
  expandedQuizKey,
  setExpandedQuizKey,
  handleToggleQuiz,
  handleAddQuizQuestion,
  handleRemoveQuizQuestion,
  handleQuizQuestionChange,
  handleAddQuizOption,
  handleRemoveQuizOption,
  handleQuizOptionChange,
  handleSetCorrectOption,
  // Submit actions
  handleSubmitCourse,
  submitting,
  loadingCourse,
  isEditing,
  currentUser,
}) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-gray-100 shadow-sm space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>სასწავლო გეგმა და ვიდეო ლექციები</span>
          </h3>
          <p className="text-xs text-totc-gray mt-0.5">
            ააწყვეთ მრავალმოდულიანი სტრუქტურა, ატვირთეთ ვიდეოები და მონიშნეთ უფასო საჩვენებელი ლექციები.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSection}
          className="px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>მოდულის დამატება</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map((section, sIdx) => (
          <div
            key={section.id || sIdx}
            className="p-5 sm:p-6 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-4 shadow-2xs"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                  {sIdx + 1}
                </span>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                  placeholder={`მოდული ${sIdx + 1}-ის სათაური`}
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 focus:border-indigo-600 outline-none text-sm font-bold text-totc-navy transition-all"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveSection(sIdx)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="მოდულის წაშლა"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Lessons inside Section */}
            <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-indigo-200/60">
              {section.lessons.map((lesson, lIdx) => (
                <div
                  key={lesson.id || lIdx}
                  className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[11px] font-bold text-totc-gray">
                        {sIdx + 1}.{lIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(sIdx, lIdx, 'title', e.target.value)}
                        placeholder="ლექციის სათაური"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-totc-teal outline-none text-xs font-semibold text-totc-navy"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(sIdx, lIdx)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                      title="ლექციის წაშლა"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Video Upload & Stream Settings and Attachments */}
                  <LessonMediaUploader
                    sIdx={sIdx}
                    lIdx={lIdx}
                    lesson={lesson}
                    handleLessonChange={handleLessonChange}
                    uploadingKey={uploadingKey}
                    uploadProgress={uploadProgress}
                    uploadNotice={uploadNotice}
                    setUploadNotice={setUploadNotice}
                    handleVideoUpload={handleVideoUpload}
                    uploadingResourceKey={uploadingResourceKey}
                    handleResourceUpload={handleResourceUpload}
                    handleRemoveResource={handleRemoveResource}
                  />

                  {/* Lecture Metadata Row: Duration & Free Preview */}
                  <div className="flex items-center justify-between gap-4 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-totc-gray flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        ხანგრძლივობა:
                      </span>
                      <div className="relative w-24">
                        <input
                          type="number"
                          min="1"
                          value={lesson.durationMinutes}
                          onChange={(e) => handleLessonChange(sIdx, lIdx, 'durationMinutes', e.target.value)}
                          placeholder="წთ"
                          className="w-full px-2.5 py-1 rounded-lg border border-gray-200 focus:border-totc-teal outline-none text-xs font-bold text-totc-navy"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-semibold">წთ</span>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-totc-navy font-semibold shrink-0">
                      <input
                        type="checkbox"
                        checked={lesson.isFreePreview}
                        onChange={(e) => handleLessonChange(sIdx, lIdx, 'isFreePreview', e.target.checked)}
                        className="rounded text-totc-teal focus:ring-totc-teal"
                      />
                      <span>უფასო ნახვა</span>
                    </label>
                  </div>

                  {/* Lesson Summary / Content */}
                  <div>
                    <input
                      type="text"
                      value={lesson.contentText || ''}
                      onChange={(e) => handleLessonChange(sIdx, lIdx, 'contentText', e.target.value)}
                      placeholder="ლექციის მოკლე აღწერა ან ძირითადი თეზისები..."
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50/70 focus:bg-white focus:border-totc-teal outline-none text-[11px] text-totc-gray transition-colors"
                    />
                  </div>

                  {/* Knowledge Check Quiz Section */}
                  <QuizBuilderModal
                    sIdx={sIdx}
                    lIdx={lIdx}
                    lesson={lesson}
                    sections={sections}
                    setSections={setSections}
                    expandedQuizKey={expandedQuizKey}
                    setExpandedQuizKey={setExpandedQuizKey}
                    handleToggleQuiz={handleToggleQuiz}
                    handleAddQuizQuestion={handleAddQuizQuestion}
                    handleRemoveQuizQuestion={handleRemoveQuizQuestion}
                    handleQuizQuestionChange={handleQuizQuestionChange}
                    handleAddQuizOption={handleAddQuizOption}
                    handleRemoveQuizOption={handleRemoveQuizOption}
                    handleQuizOptionChange={handleQuizOptionChange}
                    handleSetCorrectOption={handleSetCorrectOption}
                  />

                </div>
              ))}

              {/* Add Lesson & Add Final Exam Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddLesson(sIdx)}
                  className="py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ლექციის დამატება</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddFinalExam(sIdx)}
                  className="py-2.5 px-4 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-100/50 text-purple-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>+ მოდულის ფინალური გამოცდა</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleAddSection}
          className="px-5 py-2.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი მოდულის დამატება</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmitCourse(false)}
            disabled={submitting || loadingCourse}
            className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>მონახაზად შენახვა</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmitCourse(true)}
            disabled={submitting || loadingCourse}
            className="px-6 py-2.5 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {submitting 
                ? 'ინახება...' 
                : isEditing 
                  ? (currentUser?.role === 'Admin' ? 'შენახვა და განახლება' : 'შენახვა და განხილვაზე გაგზავნა') 
                  : (currentUser?.role === 'Admin' ? 'შენახვა და გამოქვეყნება' : 'განხილვაზე გაგზავნა')}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}
export default CurriculumBuilder;

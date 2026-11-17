import React from 'react';
import { HelpCircle, ChevronUp, ChevronDown, Trash2, Plus, X } from 'lucide-react';

export function QuizBuilderModal({
  sIdx,
  lIdx,
  lesson,
  sections,
  setSections,
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
}) {
  const itemKey = `${sIdx}-${lIdx}`;
  const isExpanded = expandedQuizKey === itemKey;

  return (
    <div className="pt-2 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (!lesson.quiz) {
              handleToggleQuiz(sIdx, lIdx);
            } else {
              setExpandedQuizKey(isExpanded ? null : itemKey);
            }
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
          <span>
            {lesson.quiz 
              ? `ცოდნის შემოწმების ტესტი (${lesson.quiz.questions?.length || 0} კითხვა)`
              : '+ ცოდნის შემოწმების ტესტის დამატება'}
          </span>
          {lesson.quiz && (
            isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {lesson.quiz && (
          <button
            type="button"
            onClick={() => handleToggleQuiz(sIdx, lIdx)}
            className="text-[10px] text-red-500 hover:underline font-semibold"
          >
            ტესტის წაშლა
          </button>
        )}
      </div>

      {/* Expanded Quiz Editor */}
      {lesson.quiz && isExpanded && (
        <div className="mt-3 p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-purple-900 uppercase">ტესტის სათაური</label>
              <input
                type="text"
                value={lesson.quiz.title}
                onChange={(e) => {
                  const updated = [...sections];
                  updated[sIdx].lessons[lIdx].quiz.title = e.target.value;
                  setSections(updated);
                }}
                placeholder="მაგ: ცოდნის შემოწმება: ქლაუდ არქიტექტურა"
                className="w-full px-3 py-1.5 bg-white rounded-lg border border-purple-200 text-xs font-semibold text-totc-navy"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-purple-900 uppercase">გამსვლელი ქულა %</label>
              <input
                type="number"
                min="1"
                max="100"
                value={lesson.quiz.passingScorePercentage || 70}
                onChange={(e) => {
                  const updated = [...sections];
                  updated[sIdx].lessons[lIdx].quiz.passingScorePercentage = parseInt(e.target.value, 10) || 70;
                  setSections(updated);
                }}
                className="w-full px-3 py-1.5 bg-white rounded-lg border border-purple-200 text-xs font-bold text-totc-navy"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {lesson.quiz.questions?.map((q, qIdx) => (
              <div key={q.id || qIdx} className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => handleQuizQuestionChange(sIdx, lIdx, qIdx, 'questionText', e.target.value)}
                      placeholder="ჩაწერეთ კითხვის ტექსტი აქ..."
                      className="flex-1 px-2.5 py-1 rounded-lg border border-gray-200 focus:border-purple-600 outline-none text-xs font-semibold text-totc-navy"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuizQuestion(sIdx, lIdx, qIdx)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="კითხვის წაშლა"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Options */}
                <div className="space-y-1.5 pl-7">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    ვარიანტები (მონიშნეთ სწორი პასუხი მწვანე ღილაკით):
                  </span>
                  {q.options?.map((opt, oIdx) => (
                    <div key={opt.id || oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-q-${sIdx}-${lIdx}-${qIdx}`}
                        checked={Boolean(opt.isCorrect)}
                        onChange={() => handleSetCorrectOption(sIdx, lIdx, qIdx, oIdx)}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="მონიშნეთ სწორ პასუხად"
                      />
                      <input
                        type="text"
                        value={opt.optionText}
                        onChange={(e) => handleQuizOptionChange(sIdx, lIdx, qIdx, oIdx, e.target.value)}
                        placeholder={`ვარიანტი ${oIdx + 1}`}
                        className={`flex-1 px-2.5 py-1 rounded-lg border text-xs ${
                          opt.isCorrect 
                            ? 'border-emerald-400 bg-emerald-50/50 text-emerald-950 font-bold'
                            : 'border-gray-200 text-totc-navy'
                        }`}
                      />
                      {opt.isCorrect && (
                        <span className="text-[10px] text-emerald-600 font-bold shrink-0">✓ სწორია</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveQuizOption(sIdx, lIdx, qIdx, oIdx)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="ვარიანტის წაშლა"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddQuizOption(sIdx, lIdx, qIdx)}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 mt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ვარიანტის დამატება</span>
                  </button>
                </div>

                {/* Explanation */}
                <div className="pl-7 pt-1">
                  <input
                    type="text"
                    value={q.explanation || ''}
                    onChange={(e) => handleQuizQuestionChange(sIdx, lIdx, qIdx, 'explanation', e.target.value)}
                    placeholder="განმარტება სტუდენტებისთვის პასუხის გაცემის შემდეგ (არასავალდებულო)..."
                    className="w-full px-2.5 py-1 rounded-lg border border-purple-100 bg-purple-50/30 text-[11px] text-totc-gray"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => handleAddQuizQuestion(sIdx, lIdx)}
              className="w-full py-2 rounded-xl bg-purple-100/70 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>კითხვის დამატება ტესტში</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default QuizBuilderModal;

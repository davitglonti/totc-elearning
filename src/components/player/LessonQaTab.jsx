import React from 'react';
import { Send, Play } from 'lucide-react';

export function LessonQaTab({
  questionsList,
  newQuestionText,
  setNewQuestionText,
  includeTimestampInQuestion,
  setIncludeTimestampInQuestion,
  currentVideoTime,
  handleAddQuestion,
  handleSeekToTime,
  formatSeconds,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Ask a Question Box */}
      <form onSubmit={handleAddQuestion} className="bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-white uppercase tracking-wider">დასვით კითხვა</span>
          <label className="flex items-center gap-2 text-xs text-totc-cyan cursor-pointer">
            <input
              type="checkbox"
              checked={includeTimestampInQuestion}
              onChange={(e) => setIncludeTimestampInQuestion(e.target.checked)}
              className="rounded border-slate-700 text-totc-teal focus:ring-0"
            />
            <span>მიმდინარე დროის მონიშვნა ({formatSeconds(currentVideoTime)})</span>
          </label>
        </div>

        <textarea
          rows="2"
          required
          placeholder="დაუსვით კითხვა ინსტრუქტორს ამ ლექციასთან დაკავშირებით..."
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-totc-teal"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark shadow-sm flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>კითხვის გაგზავნა</span>
          </button>
        </div>
      </form>

      {/* Questions Thread */}
      <div className="space-y-4">
        {questionsList.map((q) => (
          <div key={q.id} className="p-4 sm:p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={q.avatar}
                  alt={q.author}
                  className="w-8 h-8 rounded-full object-cover border border-totc-teal"
                />
                <div>
                  <span className="font-bold text-xs text-white">{q.author}</span>
                  <span className="text-[10px] text-slate-400 ml-2">{q.date}</span>
                </div>
              </div>

              {q.timestamp !== 'General' && (
                <button
                  onClick={() => handleSeekToTime(q.timeSeconds)}
                  className="px-2.5 py-1 rounded-full bg-totc-cyan/15 text-totc-cyan font-mono text-[11px] font-bold hover:bg-totc-cyan hover:text-slate-950 transition-colors flex items-center gap-1"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{q.timestamp}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-200 leading-relaxed pl-11">
              {q.question}
            </p>

            {/* Replies */}
            {q.replies && q.replies.length > 0 && (
              <div className="ml-11 mt-3 space-y-2 border-l-2 border-slate-700 pl-4">
                {q.replies.map((reply, rIdx) => (
                  <div key={rIdx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={reply.avatar}
                        alt={reply.author}
                        className="w-6 h-6 rounded-full object-cover border border-purple-400"
                      />
                      <span className="font-bold text-xs text-totc-cyan">{reply.author}</span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold uppercase">
                        Instructor
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {reply.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
export default LessonQaTab;

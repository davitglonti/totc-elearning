import React from 'react';
import { Plus, Play, Trash2 } from 'lucide-react';

export function LessonNotesTab({
  notesList,
  setNotesList,
  newNoteText,
  setNewNoteText,
  currentVideoTime,
  handleAddNote,
  handleSeekToTime,
  formatSeconds,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="pb-2 border-b border-slate-700">
        <h4 className="font-bold text-base text-white">ჩემი ჩანაწერები დროის ნიშნულებით</h4>
        <p className="text-xs text-slate-400">
          ჩაინიშნეთ მნიშვნელოვანი მომენტები ყურებისას. დროზე დაჭერით ვიდეო ზუსტად იმ მომენტზე გადავა.
        </p>
      </div>

      {/* Add Note Input */}
      <form onSubmit={handleAddNote} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-white">
          <span>ჩანაწერის შექმნა დროზე:</span>
          <span className="font-mono text-totc-cyan bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
            ⏱️ {formatSeconds(currentVideoTime)}
          </span>
        </div>

        <textarea
          rows="2"
          required
          placeholder="თქვენი პირადი ჩანაწერები..."
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-totc-teal"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ჩანაწერის შენახვა</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        {notesList.map((note) => (
          <div
            key={note.id}
            className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-start justify-between gap-4 group"
          >
            <div className="space-y-1.5">
              <button
                onClick={() => handleSeekToTime(note.seconds)}
                className="px-2.5 py-0.5 rounded-full bg-totc-cyan/20 hover:bg-totc-cyan hover:text-slate-950 text-totc-cyan font-mono text-[11px] font-bold transition-colors inline-flex items-center gap-1"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>{note.timestamp}</span>
              </button>
              <p className="text-xs text-slate-200 leading-relaxed">
                {note.text}
              </p>
            </div>

            <button
              onClick={() => setNotesList(notesList.filter(n => n.id !== note.id))}
              className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default LessonNotesTab;

import React from 'react';
import { Clock, Award, CheckCircle } from 'lucide-react';

export function LessonOverviewTab({ activeLesson }) {
  return (
    <div className="space-y-6 text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
      <div className="space-y-2">
        <h4 className="font-bold text-base text-white">ლექციის შესახებ</h4>
        <p className="text-slate-300 text-sm">
          {activeLesson?.contentText || 'შეისწავლეთ თანამედროვე არქიტექტურა, პრაქტიკული ინსტრუმენტები და სასერთიფიკატო საკითხები.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">ხანგრძლივობა</p>
            <p className="font-bold text-white">{activeLesson?.durationMinutes || 15} წუთი</p>
          </div>
        </div>

        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
          <Award className="w-5 h-5 text-totc-teal shrink-0" />
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">სირთულის დონე</p>
            <p className="font-bold text-white">საშუალო / მაღალი</p>
          </div>
        </div>

        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">წინაპირობა</p>
            <p className="font-bold text-white">საბაზისო ცოდნა</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-2">
        <h5 className="font-bold text-xs uppercase tracking-wider text-totc-cyan">მთავარი საკითხები:</h5>
        <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5">
          <li>მაღალი ხელმისაწვდომობის არქიტექტურის დაპროექტება და დაგეგმვა.</li>
          <li>პრაქტიკული კონფიგურაციები და ქსელური უსაფრთხოების მართვა.</li>
          <li>საუკეთესო პრაქტიკების გამოყენება რეალურ სისტემებში.</li>
        </ul>
      </div>
    </div>
  );
}
export default LessonOverviewTab;

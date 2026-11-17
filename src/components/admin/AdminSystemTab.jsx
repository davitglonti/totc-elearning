import React from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';

export function AdminSystemTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-poppins font-bold text-xl text-totc-navy">სისტემის არქიტექტურის ტელემეტრია</h3>
        <p className="text-xs text-totc-gray">აქტიური სერვისები, ORM ძრავა და ტოკენების უსაფრთხოების პოლიტიკა:</p>

        <div className="space-y-3">
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-emerald-900">მონაცემთა ბაზა: SQLite (EF Core 9.0)</p>
              <p className="text-emerald-700">Clean Architecture რეპოზიტორიის შრე ავტომატური მიგრაციებით.</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-emerald-900">მოდერაციის პროცესი აქტიურია</p>
              <p className="text-emerald-700">ინსტრუქტორების მიერ გამოგზავნილი კურსები გადის ადმინის შემოწმებას.</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-emerald-900">JWT Bearer ავტორიზაცია (HS256)</p>
              <p className="text-emerald-700">კრიპტოგრაფიულად ხელმოწერილი ტოკენები როლების დაცვით.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-poppins font-bold text-xl text-totc-navy">API ენდპოინტების დოკუმენტაცია</h3>
        <p className="text-xs text-totc-gray">ინტერაქტიული OpenAPI / Swagger დოკუმენტაცია:</p>

        <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-totc-teal">http://localhost:5000/swagger</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">200 OK</span>
          </div>
          <p className="text-xs text-slate-300">
            მოიცავს სრულ დოკუმენტაციას ავტორიზაციის, მოდერაციის, კურსების, გამოწერების, გადახდებისა და ტესტების შესახებ.
          </p>
          <a
            href="http://localhost:5000/swagger"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-totc-teal text-white font-bold text-xs hover:bg-totc-teal-dark transition-colors"
          >
            <span>Swagger UI-ს გახსნა</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
export default AdminSystemTab;

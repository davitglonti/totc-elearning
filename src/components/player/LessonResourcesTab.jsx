import React from 'react';
import { Code, FolderArchive, FileText, Download, ExternalLink } from 'lucide-react';

export function LessonResourcesTab({ activeLesson, resolveVideoUrl }) {
  const resourcesList = (activeLesson?.resources && activeLesson.resources.length > 0)
    ? activeLesson.resources
    : (activeLesson?.id === 'les-1' ? [
        {
          name: 'aws_vpc_multi_az_starter_template.zip',
          desc: 'Terraform and CloudFormation starter templates with public/private subnet declarations.',
          size: '4.8 MB',
          type: 'Source Code',
          fileUrl: '#'
        },
        {
          name: 'cloud_architect_lecture_slides_module1.pdf',
          desc: 'Full high-res presentation slides and architectural decision rubrics.',
          size: '12.4 MB',
          type: 'Slides',
          fileUrl: '#'
        }
      ] : []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="pb-2 border-b border-slate-700">
        <h4 className="font-bold text-base text-white">ჩამოსატვირთი მასალები და კოდი</h4>
        <p className="text-xs text-slate-400">
          ლექციაზე ატვირთული ყველა სასწავლო ფაილი, გზამკვლევი და პრეზენტაცია.
        </p>
      </div>

      <div className="space-y-3">
        {resourcesList.map((res, i) => {
          const isCode = res.type?.toLowerCase().includes('code') || res.name?.match(/\.(js|jsx|ts|tsx|py|cs|html|css|json)$/i);
          const isZip = res.type?.toLowerCase().includes('zip') || res.type?.toLowerCase().includes('archive') || res.name?.match(/\.(zip|rar|tar|gz|7z)$/i);

          return (
            <div
              key={res.id || i}
              className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-totc-teal/50 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-totc-teal/15 text-totc-teal flex items-center justify-center shrink-0 mt-0.5">
                  {isCode ? (
                    <Code className="w-5 h-5" />
                  ) : isZip ? (
                    <FolderArchive className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{res.name}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{res.desc || res.description || 'ლექციის დამატებითი მასალა'}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-totc-cyan">
                    {res.type || 'ფაილი'} • {res.size || res.fileSize || 'დანართი'}
                  </span>
                </div>
              </div>

              {res.fileUrl && res.fileUrl !== '#' ? (
                <a
                  href={resolveVideoUrl ? resolveVideoUrl(res.fileUrl) : res.fileUrl}
                  download={res.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-slate-700 hover:bg-totc-teal hover:text-white text-xs font-bold text-slate-200 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>ფაილის ჩამოტვირთვა</span>
                </a>
              ) : (
                <button
                  onClick={() => alert(`მიმდინარეობს ჩამოტვირთვა: ${res.name}`)}
                  className="px-5 py-2.5 rounded-full bg-slate-700 hover:bg-totc-teal hover:text-white text-xs font-bold text-slate-200 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>ჩამოტვირთვა</span>
                </button>
              )}
            </div>
          );
        })}

        {resourcesList.length === 0 && (
          <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2">
            <Download className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="font-bold text-sm text-white">მიმაგრებული ფაილები არ არის</h4>
            <p className="text-xs text-slate-400">
              ამ ლექციისთვის გადმოსაწერი ფაილები ან კოდი ჯერ არ არის ატვირთული.
            </p>
          </div>
        )}
      </div>

      {/* External GitHub Repo Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-indigo-950/60 border border-slate-700 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-xs text-white">Course GitHub Repository</p>
          <p className="text-[11px] text-slate-400">Clone the complete repo: git clone https://github.com/davitglonti/totc-elearning.git</p>
        </div>
        <a
          href="https://github.com/davitglonti/totc-elearning"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-totc-teal hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View Repository</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
export default LessonResourcesTab;

import React from 'react';
import { Video, ExternalLink, RefreshCw, CheckCircle, AlertCircle, EyeOff, Eye, Save, Sparkles } from 'lucide-react';

export function AdminBunnyTab({
  bunnyConfig,
  setBunnyConfig,
  testingBunny,
  handleTestBunnyConnection,
  bunnyTestResult,
  setBunnyTestResult,
  savingBunny,
  handleSaveBunnyConfig,
  showApiKey,
  setShowApiKey,
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 rounded-[28px] p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5 text-white" />
            <span>ვიდეო ტრანსკოდირება და მიწოდების სისტემა</span>
          </div>
          <h3 className="font-poppins font-black text-2xl sm:text-3xl text-white">
            Bunny.net Stream ვიდეო CDN
          </h3>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl">
            ავტომატური ვიდეო დამუშავება: როდესაც ინსტრუქტორი ტვირთავს ვიდეოს სტუდიაში, ფაილი იგზავნება Bunny Stream-ზე, კოდირდება HLS ფორმატში და მიეწოდება გლობალური CDN-ით.
          </p>
        </div>

        <a
          href="https://dash.bunny.net/stream/805955/api"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-full bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-2 self-start md:self-center"
        >
          <span>Bunny პანელი</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Quick Specs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">ვიდეო ბიბლიოთეკის ID</span>
          <p className="font-poppins font-black text-xl text-totc-navy mt-1 font-mono">
            {bunnyConfig.libraryId || '805955'}
          </p>
          <p className="text-[10px] text-totc-gray mt-0.5">მიმაგრებული Bunny Stream ბიბლიოთეკა</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">Edge Pull ზონა</span>
          <p className="font-poppins font-black text-xl text-totc-teal mt-1 font-mono">
            {bunnyConfig.pullZone || 'vz-f0959c15-d92'}
          </p>
          <p className="text-[10px] text-totc-gray mt-0.5">გლობალური Anycast CDN დისტრიბუცია</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">CDN ჰოსტნეიმი</span>
          <p className="font-bold text-sm text-indigo-700 mt-1 font-mono truncate">
            {bunnyConfig.cdnHostname || 'vz-f0959c15-d92.b-cdn.net'}
          </p>
          <p className="text-[10px] text-totc-gray mt-0.5">HLS პლეილისტის და სეგმენტების მისამართი</p>
        </div>
      </div>

      {/* Credentials & Test Form */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h4 className="font-poppins font-bold text-lg text-totc-navy">Bunny Stream API პარამეტრები</h4>
            <p className="text-xs text-totc-gray">მართეთ და შეამოწმეთ კავშირი TOTC LMS-სა და Bunny.net-ს შორის.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestBunnyConnection}
              disabled={testingBunny}
              className="px-5 py-2.5 rounded-full border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingBunny ? 'animate-spin' : ''}`} />
              <span>{testingBunny ? 'მოწმდება...' : 'კავშირის შემოწმება'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message Box */}
        {bunnyTestResult && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-4 ${
            bunnyTestResult.success 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              {bunnyTestResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-bold">{bunnyTestResult.success ? 'Bunny API დაკავშირებულია' : 'Bunny კავშირის შეტყობინება'}</p>
                <p className="font-normal">{bunnyTestResult.message}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setBunnyTestResult(null)} 
              className="text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSaveBunnyConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-totc-navy mb-1">
                ვიდეო ბიბლიოთეკის ID
              </label>
              <input
                type="text"
                value={bunnyConfig.libraryId}
                onChange={(e) => setBunnyConfig({ ...bunnyConfig, libraryId: e.target.value })}
                placeholder="805955"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-mono text-totc-navy font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-totc-navy mb-1">
                CDN ჰოსტნეიმი
              </label>
              <input
                type="text"
                value={bunnyConfig.cdnHostname}
                onChange={(e) => setBunnyConfig({ ...bunnyConfig, cdnHostname: e.target.value })}
                placeholder="vz-f0959c15-d92.b-cdn.net"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-mono text-totc-navy font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-totc-navy mb-1">
                Pull ზონის სახელი
              </label>
              <input
                type="text"
                value={bunnyConfig.pullZone}
                onChange={(e) => setBunnyConfig({ ...bunnyConfig, pullZone: e.target.value })}
                placeholder="vz-f0959c15-d92"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-mono text-totc-navy font-semibold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-totc-navy">
                  API წვდომის გასაღები
                </label>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-[11px] text-totc-teal hover:underline flex items-center gap-1 font-semibold"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showApiKey ? 'დამალვა' : 'ჩვენება'}</span>
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={bunnyConfig.apiKey || ''}
                onChange={(e) => setBunnyConfig({ ...bunnyConfig, apiKey: e.target.value })}
                placeholder="ჩასვით API გასაღები dash.bunny.net-დან"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-mono text-totc-navy font-semibold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={savingBunny}
              className="px-6 py-2.5 rounded-full bg-totc-navy hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingBunny ? 'ინახება...' : 'კონფიგურაციის შენახვა'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Architecture Explainer Card */}
      <div className="bg-slate-900 rounded-[28px] p-6 sm:p-8 text-white space-y-4">
        <h4 className="font-poppins font-bold text-lg text-totc-teal flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-totc-teal" />
          <span>როგორ მუშაობს ლექციის ვიდეოს ატვირთვა</span>
        </h4>
        <p className="text-xs text-slate-300">
          ლექტორები ტვირთავენ ლექციებს პირდაპირ ინსტრუქტორის სტუდიიდან. აი, რა ხდება ფონურ რეჟიმში:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center">
              1
            </div>
            <h5 className="font-bold text-xs text-white">ბრაუზერიდან სტრიმინგი</h5>
            <p className="text-[11px] text-slate-400">
              ლექტორი ირჩევს MP4/MOV ფაილს. TOTC აჩვენებს ატვირთვის პროგრესს (0-100%).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-totc-teal/20 text-totc-teal font-black text-xs flex items-center justify-center">
              2
            </div>
            <h5 className="font-bold text-xs text-white">Bunny Stream ტრანსკოდირება</h5>
            <p className="text-[11px] text-slate-400">
              API ქმნის ვიდეოს ჩანაწერს ბიბლიოთეკაში 805955 და აგზავნის ნაკადს Bunny-ს კლასტერში.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h5 className="font-bold text-xs text-white">ადაპტური დაკვრა კლასში</h5>
            <p className="text-[11px] text-slate-400">
              საკლასო პლეერი ავტომატურად ცვლის ხარისხს (1080p-დან 360p-მდე) სტუდენტის ინტერნეტის მიხედვით.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminBunnyTab;

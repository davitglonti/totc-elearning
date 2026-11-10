import React from 'react';
import { 
  Shield, Users, Server, Database, Activity, ExternalLink, 
  CheckCircle, Lock, Award, BookOpen, Sparkles 
} from 'lucide-react';

export default function AdminDashboardPage({ currentUser, setActivePage }) {
  return (
    <div className="pt-28 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Super Admin Console
            </div>
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-navy">
              System Administration
            </h1>
            <p className="font-poppins text-totc-gray text-base">
              Monitor server telemetry, manage platform users, and review Swagger API endpoints.
            </p>
          </div>

          <a
            href="http://localhost:5000/swagger"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full font-bold text-sm bg-totc-navy text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0"
          >
            <span>Open Swagger API Docs</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* 4 Admin Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Total Users</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">15,420</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-totc-teal shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Published Courses</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">42</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">API Health</p>
              <h3 className="font-poppins font-bold text-2xl text-emerald-600">Healthy (200)</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">DB Engine</p>
              <h3 className="font-poppins font-bold text-xl text-totc-navy">SQLite / SQL Server</h3>
            </div>
          </div>
        </div>

        {/* System Diagnostics & Seed Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Seed Roles */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-xl text-totc-navy">System Seed Accounts</h3>
            <p className="text-xs text-totc-gray">Built-in accounts for verification and automated testing:</p>

            <div className="space-y-3">
              {[
                { role: 'Admin', email: 'admin@totc.com', status: 'Full System Control' },
                { role: 'Instructor', email: 'lina@totc.com', status: 'Cloud Architecture & DevOps' },
                { role: 'Instructor', email: 'marcus@totc.com', status: 'UI/UX Design Systems' },
                { role: 'Student', email: 'student@totc.com', status: 'Enrolled in 3 Courses' },
              ].map((acc, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-totc-navy">{acc.email}</span>
                    <p className="text-[11px] text-totc-gray">{acc.status}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-totc-teal-light text-totc-teal text-[10px] font-bold uppercase">
                    {acc.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Middleware Telemetry */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-xl text-totc-navy">Security Configuration</h3>
            <p className="text-xs text-totc-gray">Clean Architecture security policies:</p>

            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-900">JWT Bearer Authentication</p>
                  <p className="text-emerald-700">HMAC-SHA256 Token issuance enabled with zero clock skew.</p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-900">BCrypt Password Hashing</p>
                  <p className="text-emerald-700">Salted password hashing protects all user records.</p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-900">CORS Policy Active</p>
                  <p className="text-emerald-700">Origin http://localhost:5173 allowed for credentials.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
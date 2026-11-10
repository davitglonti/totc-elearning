import React, { useState } from 'react';
import { X, Play, Star, CheckCircle, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.auth.login(form.email, form.password);
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        const res = await api.auth.register(form.name, form.email, form.password);
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-totc-navy transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side Graphic */}
        <div className="hidden md:flex md:w-5/12 bg-totc-teal p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="space-y-4 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 transform rotate-45 flex items-center justify-center">
                <span className="font-poppins font-black text-white text-xs -rotate-45">T</span>
              </div>
              <span className="font-bold text-xl tracking-wider">TOTC</span>
            </div>
            <h3 className="font-poppins font-bold text-2xl leading-snug">
              {mode === 'login' ? 'Welcome Back!' : 'Start Your Learning Journey'}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Join thousands of students and teachers learning in an interactive virtual classroom.
            </p>
          </div>

          <div className="z-10 mt-6 rounded-2xl overflow-hidden shadow-lg border border-white/20">
            <img
              src="/assets/news_thumb_1.png"
              alt="Student"
              className="w-full h-32 object-cover"
            />
          </div>

          {/* Ambient background blur */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-center">
          {/* Mode Switch Tabs */}
          <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-full mb-8 max-w-xs mx-auto">
            <button
              onClick={() => { setMode('login'); setSubmitted(false); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                mode === 'login'
                  ? 'bg-totc-teal text-white shadow-sm'
                  : 'text-totc-gray hover:text-totc-navy'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setSubmitted(false); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
                mode === 'register'
                  ? 'bg-totc-teal text-white shadow-sm'
                  : 'text-totc-gray hover:text-totc-navy'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-totc-mint mx-auto animate-bounce" />
              <h4 className="font-poppins font-bold text-2xl text-totc-navy">
                {mode === 'login' ? 'Successfully Logged In!' : 'Account Created!'}
              </h4>
              <p className="text-totc-gray text-sm">
                Redirecting you to your interactive classroom dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-totc-navy uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-totc-navy uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-totc-navy uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                  />
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs text-totc-gray pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-totc-teal focus:ring-totc-teal" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="hover:text-totc-teal transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-semibold text-base transition-colors shadow-md active:scale-98 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? 'Connecting to Server...' : mode === 'login' ? 'Login to Classroom' : 'Create Free Account'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export function VideoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Player */}
        <div className="aspect-video w-full relative bg-slate-900 flex flex-col justify-between p-6">
          <div className="z-10 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-lg">TOTC Virtual Classroom Demo</span>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Interactive Tour</span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-20 h-20 rounded-full bg-totc-cyan flex items-center justify-center text-white shadow-2xl">
              <Play className="w-8 h-8 fill-white ml-1" />
            </div>
            <p className="text-white font-medium text-lg max-w-md text-center">
              Experience the revolutionary Zoom-native interactive class management tools.
            </p>
          </div>

          <div className="z-10 flex items-center justify-between text-xs text-white/60 border-t border-white/10 pt-4">
            <span>HD 1080p • 60 FPS</span>
            <span>Duration: 2:45</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export function AssessmentModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-totc-navy transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-totc-mint mx-auto" />
            <h4 className="font-poppins font-bold text-2xl text-totc-navy">
              Thank You for Your Assessment!
            </h4>
            <p className="text-totc-gray text-sm">
              Your review helps students and educators worldwide discover the power of TOTC.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-totc-teal uppercase tracking-wider">
                Community Feedback
              </span>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy mt-1">
                Write Your Assessment
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-2 text-totc-orange">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-totc-orange text-totc-orange' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                Your Full Name & Role
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Johnson (High School Teacher)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                Your Experience with TOTC
              </label>
              <textarea
                required
                rows="4"
                placeholder="How has TOTC helped your classrooms or studies?..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-semibold text-base transition-colors shadow-md"
            >
              Submit Assessment
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

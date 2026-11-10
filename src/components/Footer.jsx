import React, { useState } from 'react';

export default function Footer({ setActivePage }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-totc-navy text-white pt-20 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Brand & Subtitle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pb-16 border-b border-white/10 text-center sm:text-left">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-totc-teal transform rotate-45 flex items-center justify-center shadow-lg">
              <span className="font-poppins font-black text-white text-xs -rotate-45">T</span>
            </div>
            <span className="font-poppins font-bold text-3xl tracking-wider text-white">
              TOTC
            </span>
          </div>

          <div className="hidden sm:block w-px h-10 bg-white/20" />

          <p className="font-poppins font-semibold text-lg text-white/90 tracking-wide">
            Virtual Class for Zoom
          </p>
        </div>

        {/* Newsletter Subscription */}
        <div className="py-16 text-center max-w-xl mx-auto space-y-6">
          <h3 className="font-poppins font-medium text-2xl sm:text-3xl text-white/90">
            Subscribe to get our Newsletter
          </h3>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              required
              className="w-full sm:w-80 px-6 py-3.5 rounded-full bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-totc-teal transition-colors text-base"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-medium text-base transition-colors shadow-lg active:scale-95"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <p className="text-sm font-medium text-totc-mint animate-pulse">
              Thank you! You have been successfully subscribed to our newsletter.
            </p>
          )}
        </div>

        {/* Bottom Links & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm sm:text-base text-white/70">
            <button
              onClick={() => {
                setActivePage('membership');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors"
            >
              Careers
            </button>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <a href="#" className="hover:text-white transition-colors">
              Terms & Conditions
            </a>
          </div>

          <p className="text-sm sm:text-base text-white/60 font-normal">
            © 2021 Class Technologies Inc.
          </p>
        </div>

      </div>
    </footer>
  );
}

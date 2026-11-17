import React from 'react';
import { X, Play } from 'lucide-react';

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
              <span className="font-semibold text-lg">TOTC ვირტუალური საკლასო ოთახის დემო</span>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">ინტერაქტიული ტური</span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-20 h-20 rounded-full bg-totc-cyan flex items-center justify-center text-white shadow-2xl">
              <Play className="w-8 h-8 fill-white ml-1" />
            </div>
            <p className="text-white font-medium text-lg max-w-md text-center">
              გაეცანით რევოლუციურ Zoom-ინტეგრირებულ ინტერაქტიულ სასწავლო ინსტრუმენტებს.
            </p>
          </div>

          <div className="z-10 flex items-center justify-between text-xs text-white/60 border-t border-white/10 pt-4">
            <span>HD 1080p • 60 FPS</span>
            <span>ხანგრძლივობა: 2:45</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default VideoModal;

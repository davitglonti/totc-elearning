import React from 'react';
import { Play } from 'lucide-react';

export default function PhysicalClassroom({ openVideoModal }) {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="relative inline-block">
              {/* Decorative accent blob */}
              <div className="absolute -top-4 -left-6 w-16 h-16 rounded-full bg-totc-mint/20 -z-10 blur-md" />
              
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-purple leading-[1.25] tracking-tight">
                Everything you can do in a{' '}
                <span className="text-totc-mint">physical classroom,</span>{' '}
                <span className="text-totc-mint">you can do with TOTC</span>
              </h2>
            </div>

            <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed">
              TOTC’s school management software helps traditional and online schools manage scheduling, attendance, payments and virtual classrooms all in one secure cloud-based system.
            </p>

            <div className="pt-2">
              <button
                onClick={openVideoModal}
                className="inline-flex items-center text-totc-gray font-normal text-lg sm:text-xl underline underline-offset-8 decoration-totc-mint hover:text-totc-purple transition-colors"
              >
                Learn more
              </button>
            </div>
          </div>

          {/* Right Image Feature Column */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end">
            {/* Decorative background framed accents matching Figma */}
            <div className="absolute -top-5 -left-5 w-44 h-44 rounded-3xl bg-totc-cyan/20 -z-10" />
            <div className="absolute -bottom-5 -right-5 w-52 h-52 rounded-3xl bg-totc-mint/20 -z-10" />

            {/* Video Preview Card */}
            <div className="relative rounded-[24px] overflow-hidden shadow-2xl border-4 border-white bg-white group cursor-pointer max-w-2xl w-full"
                 onClick={openVideoModal}>
              <img
                src="/assets/classroom_feature.png"
                alt="Physical classroom features in TOTC"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Pulsing play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-totc-cyan fill-totc-cyan ml-1" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Play } from 'lucide-react';

export default function Hero({ openAuthModal, openVideoModal }) {
  return (
    <section className="relative w-full overflow-hidden bg-totc-teal rounded-b-[40px] md:rounded-b-[80px] lg:rounded-b-[120px] pt-32 md:pt-40 pb-16 md:pb-28">
      {/* Decorative background blurs and ambient glow */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-totc-cyan/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-6 z-10 text-center lg:text-left space-y-6 md:space-y-8">
            <h1 className="font-poppins font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.15] tracking-tight">
              <span className="text-totc-orange">ონლაინ სწავლა</span>{' '}
              <span className="text-totc-purple">ახლა ბევრად მარტივია</span>
            </h1>

            <p className="font-poppins font-normal text-white text-lg sm:text-xl md:text-2xl leading-relaxed max-w-xl mx-auto lg:mx-0">
              TOTC არის თანამედროვე საგანმანათლებლო პლატფორმა, რომელიც გასწავლით ინტერაქტიული და პრაქტიკული მეთოდებით
            </p>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-2">
              <button
                onClick={() => openAuthModal('register')}
                className="px-8 py-4 rounded-full font-semibold text-lg text-white bg-white/30 hover:bg-white/40 active:scale-95 backdrop-blur-md transition-all duration-200 shadow-md hover:shadow-lg"
              >
                შეუერთდი უფასოდ
              </button>

              <button
                onClick={openVideoModal}
                className="group flex items-center gap-3.5 px-4 py-2 rounded-full focus:outline-none"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-200">
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-totc-cyan fill-totc-cyan ml-0.5" />
                </div>
                <span className="font-poppins font-normal text-totc-navy text-base md:text-xl group-hover:text-totc-purple transition-colors">
                  ნახე როგორ მუშაობს
                </span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic Column */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Ambient halo behind student */}
            <div className="absolute w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-full bg-white/20 blur-2xl" />

            {/* The high-res composite student with floating cards */}
            <div className="relative w-full max-w-[560px] lg:max-w-[620px] transition-transform duration-500 hover:scale-[1.02]">
              <img
                src="/assets/hero_student_cards.png"
                alt="Student learning with TOTC interactive online platform"
                className="w-full h-auto drop-shadow-2xl select-none pointer-events-none"
                loading="eager"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

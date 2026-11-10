import React from 'react';

export default function WhatIsTotc({ openAuthModal }) {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        
        {/* Section Heading */}
        <div className="max-w-4xl mx-auto space-y-5 mb-16 md:mb-20">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-purple tracking-tight">
            What is <span className="text-totc-mint">TOTC?</span>
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed max-w-3xl mx-auto">
            TOTC is a platform that allows educators to create online classes whereby they can store the course materials online; manage assignments, quizzes and exams; monitor due dates; grade results and provide students with feedback all in one place.
          </p>
        </div>

        {/* 2 Big Image Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Card 1: For Instructors */}
          <div className="relative rounded-[24px] overflow-hidden group shadow-totc-card hover:shadow-2xl transition-all duration-300 h-[360px] sm:h-[420px] md:h-[460px]">
            <img
              src="/assets/instructor_card.png"
              alt="For Instructors"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.85]"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <h3 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-wider uppercase drop-shadow-md">
                FOR INSTRUCTORS
              </h3>
              <button
                onClick={() => openAuthModal('register')}
                className="px-8 py-3.5 rounded-full font-medium text-base sm:text-lg text-white border-2 border-white hover:bg-white hover:text-totc-navy transition-all duration-300 backdrop-blur-sm active:scale-95 shadow-lg"
              >
                Start a class today
              </button>
            </div>
          </div>

          {/* Card 2: For Students */}
          <div className="relative rounded-[24px] overflow-hidden group shadow-totc-card hover:shadow-2xl transition-all duration-300 h-[360px] sm:h-[420px] md:h-[460px]">
            <img
              src="/assets/student_card.png"
              alt="For Students"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.85]"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <h3 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-wider uppercase drop-shadow-md">
                FOR STUDENTS
              </h3>
              <button
                onClick={() => openAuthModal('login')}
                className="px-8 py-3.5 rounded-full font-medium text-base sm:text-lg text-white bg-totc-cyan hover:bg-cyan-500 transition-all duration-300 active:scale-95 shadow-lg shadow-totc-cyan/30"
              >
                Enter access code
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

import React from 'react';

export default function SuccessStats() {
  const stats = [
    { number: '15K+', label: 'აქტიური სტუდენტი' },
    { number: '75%', label: 'წარმატების მაჩვენებელი' },
    { number: '35+', label: 'პრაქტიკული კურსი' },
    { number: '26', label: 'წამყვანი ექსპერტი' },
    { number: '16', label: 'წლიანი გამოცდილება' },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto space-y-4 mb-16 md:mb-20">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-dark tracking-tight">
            ჩვენი წარმატება
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            ათასობით სტუდენტმა უკვე გაიუმჯობესა კარიერა TOTC-ის პრაქტიკული კურსებითა და ოფიციალური სერტიფიკატებით.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-4 transition-all duration-300 hover:-translate-y-1 group"
            >
              <span className="font-poppins font-light text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-[#136CB5] via-[#49BBBD] to-[#00CBB8] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                {stat.number}
              </span>
              <span className="font-poppins font-normal text-totc-navy/80 text-lg sm:text-xl md:text-2xl mt-2 tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

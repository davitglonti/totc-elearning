import React from 'react';
import { useSettings, defaultHomeContent } from '../context/SettingsContext';

export default function CloudSoftware() {
  const { settings } = useSettings();
  const cloud = settings?.homeContent?.cloudSoftware || defaultHomeContent.cloudSoftware;
  const cards = cloud.cards && cloud.cards.length > 0 ? cloud.cards : defaultHomeContent.cloudSoftware.cards;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto space-y-4 mb-20 md:mb-28">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-purple tracking-tight">
            {cloud.titlePart1 || 'ყველაფერი ერთ'}{' '}
            <span className="text-totc-mint">{cloud.titlePart2 || 'ღრუბლოვან სისტემაში'}</span>
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed max-w-2xl mx-auto">
            {cloud.description || 'TOTC არის მძლავრი ონლაინ პლატფორმა, რომელიც აერთიანებს ყველა ინსტრუმენტს წარმატებული სწავლებისა და ადმინისტრირებისთვის.'}
          </p>
        </div>

        {/* 3 Elevated Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 pt-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-[20px] px-8 pt-16 pb-12 shadow-totc-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col items-center group"
            >
              {/* Floating circular icon badge elevated at top */}
              <div className="absolute -top-12 w-24 h-24 rounded-full flex items-center justify-center bg-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                <img
                  src={card.icon || '/assets/all_in_one_billing.png'}
                  alt={card.title}
                  className="w-16 h-16 object-contain"
                />
              </div>

              <h3 className="font-poppins font-semibold text-2xl text-totc-purple mt-4 mb-6 leading-snug max-w-xs">
                {card.title}
              </h3>

              <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

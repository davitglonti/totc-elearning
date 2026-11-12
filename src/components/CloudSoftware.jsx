import React from 'react';

export default function CloudSoftware() {
  const cards = [
    {
      icon: '/assets/all_in_one_billing.png',
      title: 'ონლაინ გადახდები, ინვოისები და კონტრაქტები',
      desc: 'თქვენი ორგანიზაციის ფინანსური და იურიდიული ოპერაციების მარტივი და უსაფრთხო კონტროლი. გააგზავნეთ ინვოისები მომენტალურად',
      accent: '#5B72EE',
    },
    {
      icon: '/assets/all_in_one_schedule.png',
      title: 'მარტივი განრიგი და დასწრების აღრიცხვა',
      desc: 'დაგეგმეთ გაკვეთილები და დაჯავშნეთ ვირტუალური აუდიტორიები. აწარმოეთ სტუდენტების დასწრების დეტალური სტატისტიკა',
      accent: '#00CBB8',
    },
    {
      icon: '/assets/all_in_one_tracking.png',
      title: 'სტუდენტებთან კომუნიკაცია',
      desc: 'ავტომატიზებული შეტყობინებები და ელ-ფოსტის მართვა ჯგუფებისა და ინდივიდუალური მსმენელებისთვის ერთ სივრცეში',
      accent: '#29B9E7',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto space-y-4 mb-20 md:mb-28">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-purple tracking-tight">
            ყველაფერი ერთ <span className="text-totc-mint">ღრუბლოვან სისტემაში</span>
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed max-w-2xl mx-auto">
            TOTC არის მძლავრი ონლაინ პლატფორმა, რომელიც აერთიანებს ყველა ინსტრუმენტს წარმატებული სწავლებისა და ადმინისტრირებისთვის.
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
                  src={card.icon}
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

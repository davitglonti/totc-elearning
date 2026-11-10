import React from 'react';

export default function CloudSoftware() {
  const cards = [
    {
      icon: '/assets/all_in_one_billing.png',
      title: 'Online Billing, Invoicing, & Contracts',
      desc: 'Simple and secure control of your organization’s financial and legal transactions. Send customized invoices and contracts',
      accent: '#5B72EE',
    },
    {
      icon: '/assets/all_in_one_schedule.png',
      title: 'Easy Scheduling & Attendance Tracking',
      desc: 'Schedule and reserve classrooms at one campus or multiple campuses. Keep detailed records of student attendance',
      accent: '#00CBB8',
    },
    {
      icon: '/assets/all_in_one_tracking.png',
      title: 'Customer Tracking',
      desc: 'Automate and track emails to individuals or groups. Skilline’s built-in system helps organize your organization',
      accent: '#29B9E7',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto space-y-4 mb-20 md:mb-28">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-purple tracking-tight">
            All-In-One <span className="text-totc-mint">Cloud Software.</span>
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed max-w-2xl mx-auto">
            TOTC is one powerful online software suite that combines all the tools needed to run a successful school or office.
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

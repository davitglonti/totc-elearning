import React, { useState } from 'react';
import { LayoutGrid, Users, Eye, CheckCircle2 } from 'lucide-react';

export default function Features({ openAuthModal }) {
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showQuizSuccess, setShowQuizSuccess] = useState(false);

  const handleQuizAnswer = (ans) => {
    setQuizAnswer(ans);
    setShowQuizSuccess(true);
    setTimeout(() => {
      // keep answer selected
    }, 2000);
  };

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden space-y-28 md:space-y-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20 md:mb-32">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-purple tracking-tight">
            ჩვენი <span className="text-totc-mint">შესაძლებლობები</span>
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
            უნიკალური ფუნქციონალი, რომელიც სასწავლო პროცესს ბევრად უფრო ეფექტურს ხდის
          </p>
        </div>

        {/* Feature 1: Classroom User Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Card Left */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-2xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_classroom_ui.png"
                alt="საკლასო ინტერფეისი"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              საკლასო ოთახზე მორგებული <span className="text-totc-mint">ინტერფეისი</span>
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 text-totc-purple group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5 text-totc-purple" />
                </div>
                <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed pt-2">
                  ლექტორებს აქვთ გამოყოფილი პოდიუმის სივრცე და მარტივი ნავიგაცია.
                </p>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 text-totc-orange group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-totc-orange" />
                </div>
                <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed pt-2">
                  ასისტენტებსა და პრეზენტატორებს მარტივად შეუძლიათ აუდიტორიის წინ გამოსვლა.
                </p>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 text-totc-cyan group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5 text-totc-cyan" />
                </div>
                <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed pt-2">
                  ინსტრუქტორებს შეუძლიათ ერთდროულად აკონტროლონ ყველა სტუდენტი და პროგრესი.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Tools For Teachers And Learners */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Left */}
          <div className="lg:col-span-6 lg:order-1 order-2 space-y-6">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              <span className="text-totc-mint">ინსტრუმენტები</span> ლექტორებისა და სტუდენტებისთვის
            </h3>
            <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
              სისტემა გთავაზობთ სასწავლო ინსტრუმენტების დინამიურ ნაკრებს. ინსტრუქტორებს შეუძლიათ რეალურ დროში გასცენ დავალებები სტუდენტებისთვის შესასრულებლად.
            </p>
          </div>

          {/* Graphic Right */}
          <div className="lg:col-span-6 lg:order-2 order-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_tools_girl.png"
                alt="სასწავლო ინსტრუმენტები"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>
        </div>

        {/* Feature 3: Assessments, Quizzes, Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Card Left */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_quiz.png"
                alt="შეფასება და ტესტები"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              შეფასებები, <span className="text-totc-mint">ქვიზები</span> და გამოცდები
            </h3>
            <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
              მარტივად გაუშვით დავალებები, ქვიზები და ტესტები. სტუდენტების შედეგები ავტომატურად აისახება ონლაინ ჟურნალში.
            </p>
          </div>
        </div>

        {/* Feature 4: Class Management Tools for Educators */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Left */}
          <div className="lg:col-span-5 lg:order-1 order-2 space-y-6">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              <span className="text-totc-mint">კურსის მართვის</span> ინსტრუმენტები
            </h3>
            <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
              პლატფორმა უზრუნველყოფს სტუდენტების სიის, დასწრების და ჟურნალის მართვას. ინსტრუქტორებს შეუძლიათ შედეგების შეფასება რეალურ დროში.
            </p>
          </div>

          {/* Graphic Right */}
          <div className="lg:col-span-7 lg:order-2 order-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_gradebook.png"
                alt="შეფასების ჟურნალი"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>
        </div>

        {/* Feature 5: One-on-One Discussions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Card Left */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_private_discussion.png"
                alt="ინდივიდუალური კონსულტაციები"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              <span className="text-totc-mint">პირადი</span> დისკუსიები
            </h3>
            <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
              ლექტორებსა და ასისტენტებს შეუძლიათ სტუდენტებთან ინდივიდუალურად გასაუბრება საკლასო სივრციდან გაუსვლელად.
            </p>
          </div>
        </div>

        {/* See More Features Button */}
        <div className="text-center pt-8">
          <button
            onClick={() => openAuthModal('register')}
            className="px-10 py-4 rounded-full font-medium text-lg text-totc-teal border-2 border-totc-teal hover:bg-totc-teal hover:text-white transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
          >
            მეტი შესაძლებლობის ნახვა
          </button>
        </div>

      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { ArrowRight, ChevronRight, ChevronLeft, Star } from 'lucide-react';

export default function Testimonials({ openAssessmentModal }) {
  const testimonials = [
    {
      quote: "Thank you so much for your help. It's exactly what I've been looking for. You won't regret it. It really saves me time and effort. TOTC is exactly what our business has been lacking.",
      author: "Gloria Rose",
      reviews: "12 reviews at Yelp",
      rating: 5,
      image: "/assets/testimonial_avatar.png"
    },
    {
      quote: "TOTC completely transformed how our university manages live digital seminars. The interaction between professors and students feels natural, responsive, and seamless.",
      author: "David Vance",
      reviews: "28 reviews at Trustpilot",
      rating: 5,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
    },
    {
      quote: "The gradebook and interactive quiz integration are unmatched. My students look forward to live assessments, and grading takes half the time it used to.",
      author: "Elena Rostova",
      reviews: "19 reviews at EdTech Digest",
      rating: 5,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-7 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <span className="w-16 h-0.5 bg-totc-purple inline-block" />
              <span className="font-poppins font-medium text-totc-purple text-base sm:text-lg tracking-widest uppercase">
                TESTIMONIAL
              </span>
            </div>

            <h2 className="font-poppins font-bold text-4xl sm:text-5xl text-totc-purple leading-tight tracking-tight">
              What They Say?
            </h2>

            <div className="space-y-4 text-totc-gray text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
              <p>
                TOTC has got more than 100k positive ratings from our users around the world.
              </p>
              <p>
                Some of the students and teachers were greatly helped by the Skilline.
              </p>
              <p>
                Are you too? Please give your assessment
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={openAssessmentModal}
                className="group inline-flex items-center gap-4 px-8 py-4 rounded-full border border-totc-teal text-totc-teal hover:bg-totc-teal hover:text-white transition-all duration-300 font-medium text-base sm:text-lg shadow-sm hover:shadow-md"
              >
                <span>Write your assessment</span>
                <div className="w-8 h-8 rounded-full border border-totc-teal flex items-center justify-center group-hover:border-white transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Right Visual & Testimonial Card Column */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px]">
              
              {/* Photo */}
              <div className="relative rounded-[30px] overflow-hidden shadow-2xl bg-[#49BBBD]/20">
                <img
                  src={current.image}
                  alt={current.author}
                  className="w-full h-[520px] sm:h-[580px] object-cover transition-opacity duration-300"
                />
              </div>

              {/* Floating Quote Card */}
              <div className="absolute -bottom-8 -left-4 sm:-bottom-10 sm:-left-12 sm:w-[480px] bg-white rounded-[24px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4 z-20">
                
                {/* Border left accent line matching Figma Line 3 */}
                <div className="border-l-4 border-[#F67766] pl-4 space-y-3">
                  <p className="font-nunito font-normal text-totc-gray-sub text-sm sm:text-base leading-relaxed italic">
                    "{current.quote}"
                  </p>
                </div>

                {/* Author & Rating Row */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="font-poppins font-semibold text-lg sm:text-xl text-totc-navy">
                      {current.author}
                    </h4>
                    <span className="font-poppins font-normal text-xs sm:text-sm text-totc-gray">
                      {current.reviews}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[#F48C06]">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F48C06]" />
                    ))}
                  </div>
                </div>

                {/* Carousel arrow button */}
                <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <button
                    onClick={nextTestimonial}
                    className="w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-totc-teal hover:bg-totc-teal hover:text-white transition-all duration-200 active:scale-95"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

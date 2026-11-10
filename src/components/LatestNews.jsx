import React from 'react';

export default function LatestNews({ setActivePage }) {
  const handleArticleClick = () => {
    setActivePage('blog-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sideNews = [
    {
      thumb: '/assets/news_thumb_1.png',
      tag: 'PRESS RELEASE',
      tagColor: 'bg-totc-teal',
      title: 'Class Technologies Inc. Closes $30 Million Series A Financing to Meet High Demand',
      desc: 'Class Technologies Inc., the company that created Class, announced today that it has raised $30 million in Series A funding...',
    },
    {
      thumb: '/assets/news_thumb_2.png',
      tag: 'NEWS',
      tagColor: 'bg-totc-cyan',
      title: "Zoom's earliest investors are betting millions on a better Zoom for schools",
      desc: 'Zoom was created to be a consumer product. Nonetheless, its adoption across schools and academic campuses exploded...',
    },
    {
      thumb: '/assets/news_thumb_3.png',
      tag: 'NEWS',
      tagColor: 'bg-totc-teal',
      title: 'Former Blackboard CEO Raises $16M to Bring LMS Features to Zoom Classrooms',
      desc: 'This year, investors have made big financial returns from betting on virtual classroom technologies and distance education...',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 md:mb-20">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-purple tracking-tight">
            Lastest News and Resources
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
            See the developments that have occurred to TOTC in the world
          </p>
        </div>

        {/* News Grid: Main Left, 3 Stacked Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Featured Article (Left 6-7 cols) */}
          <div
            onClick={handleArticleClick}
            className="lg:col-span-6 bg-white rounded-[24px] p-6 shadow-totc-card hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 flex flex-col justify-between"
          >
            <div>
              <div className="rounded-[20px] overflow-hidden mb-6">
                <img
                  src="/assets/news_laptop.png"
                  alt="Class edtech solution on laptop"
                  className="w-full h-[280px] sm:h-[340px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <span className="inline-block px-5 py-1.5 rounded-full bg-totc-teal text-white font-medium text-xs tracking-wider uppercase mb-4">
                NEWS
              </span>

              <h3 className="font-poppins font-semibold text-2xl sm:text-3xl text-totc-navy group-hover:text-totc-teal transition-colors leading-snug mb-4">
                Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution
              </h3>

              <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed mb-6">
                Class, launched less than a year ago by Blackboard co-founder Michael Chasen, integrates exclusively into Zoom to transform remote education with attendance, rosters, and live quizzes.
              </p>
            </div>

            <div>
              <span className="font-poppins font-medium text-totc-gray underline underline-offset-4 group-hover:text-totc-teal transition-colors">
                Read more
              </span>
            </div>
          </div>

          {/* 3 Side Articles (Right 6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            {sideNews.map((item, idx) => (
              <div
                key={idx}
                onClick={handleArticleClick}
                className="bg-white rounded-[20px] p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 flex flex-col sm:flex-row items-center gap-5"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-48 h-40 sm:h-32 rounded-[16px] overflow-hidden shrink-0">
                  <img
                    src={item.thumb}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h4 className="font-poppins font-semibold text-lg sm:text-xl text-totc-navy group-hover:text-totc-teal transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="font-poppins font-normal text-totc-gray text-sm sm:text-base leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

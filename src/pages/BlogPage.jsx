import React from 'react';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';

export default function BlogPage({ setActivePage }) {
  const posts = [
    {
      id: 1,
      title: 'Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution',
      category: 'Funding & Growth',
      date: 'November 8, 2026',
      readTime: '5 min read',
      author: 'Michael Chasen',
      image: '/assets/news_laptop.png',
      desc: 'Class Technologies Inc., the company creating specialized classroom tools on top of Zoom, closed a major growth round to accelerate institutional school deployments.'
    },
    {
      id: 2,
      title: 'Class Technologies Inc. Closes $30 Million Series A Financing to Meet High Demand',
      category: 'Press Release',
      date: 'November 4, 2026',
      readTime: '4 min read',
      author: 'Sarah Jenkins',
      image: '/assets/news_thumb_1.png',
      desc: 'High demand from K-12 school districts and higher education institutions drives rapid scaling of virtual classroom management tools.'
    },
    {
      id: 3,
      title: "Zoom's earliest investors are betting millions on a better Zoom for schools",
      category: 'Venture Capital',
      date: 'October 28, 2026',
      readTime: '6 min read',
      author: 'David Vance',
      image: '/assets/news_thumb_2.png',
      desc: 'Early backers of remote communication platforms predict interactive learning features like gradebooks and proctored quizzes will define the next decade of edtech.'
    },
    {
      id: 4,
      title: 'Former Blackboard CEO Raises $16M to Bring LMS Features to Zoom Classrooms',
      category: 'EdTech Leadership',
      date: 'October 20, 2026',
      readTime: '7 min read',
      author: 'Elena Rostova',
      image: '/assets/news_thumb_3.png',
      desc: 'Integrating live quizzes, podium views, and attendance tracking directly into digital meeting interfaces solves the engagement crisis in virtual learning.'
    },
    {
      id: 5,
      title: 'The Future of Hybrid Classrooms: Lessons from 100,000 Active Students',
      category: 'Research',
      date: 'October 15, 2026',
      readTime: '8 min read',
      author: 'Gloria Rose',
      image: '/assets/classroom_feature.png',
      desc: 'Comprehensive pedagogical data reveals how private one-on-one breakout discussions double student retention and comprehension rates.'
    },
    {
      id: 6,
      title: 'How Teachers Are Saving 10+ Hours Every Week with Automated Grading',
      category: 'Educator Tips',
      date: 'October 10, 2026',
      readTime: '4 min read',
      author: 'Marcus Chen',
      image: '/assets/instructor_card.png',
      desc: 'Explore practical workflows for structuring instant multiple-choice assessments and synchronizing scorecards straight into your institution SIS.'
    }
  ];

  const handlePostClick = () => {
    setActivePage('blog-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-4 py-1.5 rounded-full bg-totc-teal-light text-totc-teal font-semibold text-xs tracking-wider uppercase">
            TOTC Blog & Resources
          </span>
          <h1 className="font-poppins font-bold text-3xl sm:text-5xl text-totc-navy leading-tight">
            Latest Insights on Modern Education
          </h1>
          <p className="text-totc-gray text-base sm:text-lg">
            Stay up to date with trends, product updates, pedagogy research, and tips for educators worldwide.
          </p>
        </div>

        {/* Featured Top Post */}
        <div
          onClick={handlePostClick}
          className="bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer mb-16 grid grid-cols-1 lg:grid-cols-12 items-center"
        >
          <div className="lg:col-span-7 h-[340px] sm:h-[440px] overflow-hidden">
            <img
              src={posts[0].image}
              alt={posts[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="lg:col-span-5 p-8 sm:p-12 space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-totc-teal text-white font-medium text-xs uppercase tracking-wider">
              {posts[0].category}
            </span>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-totc-navy group-hover:text-totc-teal transition-colors leading-snug">
              {posts[0].title}
            </h2>
            <p className="text-totc-gray text-base leading-relaxed">
              {posts[0].desc}
            </p>
            <div className="flex items-center gap-4 text-xs text-totc-gray pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {posts[0].date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {posts[0].readTime}
              </span>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-totc-teal font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Read full article <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((p) => (
            <div
              key={p.id}
              onClick={handlePostClick}
              className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="h-56 overflow-hidden bg-gray-100">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-xs font-semibold text-totc-teal uppercase tracking-wider">
                    {p.category}
                  </span>
                  <h3 className="font-poppins font-semibold text-xl text-totc-navy group-hover:text-totc-teal transition-colors leading-snug line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-totc-gray text-sm line-clamp-2 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-totc-gray">
                <span>{p.date}</span>
                <span className="font-semibold text-totc-teal flex items-center gap-1">
                  Read More <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

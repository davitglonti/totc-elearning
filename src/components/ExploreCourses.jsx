import React, { useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';

export default function ExploreCourses({ setActivePage }) {
  const [activeTab, setActiveTab] = useState(0);

  const categories = [
    {
      name: 'Lorem Ipsum',
      image: '/assets/explore_row_1.png',
      featured: {
        title: 'Integer id Orc Sed Ante Tincidunt',
        desc: 'Cras convallis lacus orci, tristique tincidunt magna fringilla at faucibus vel.',
        price: '$ 450',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        tag: 'Culinary & Nutrition'
      }
    },
    {
      name: 'Quisque a Consequat',
      image: '/assets/explore_row_2.png',
      featured: {
        title: 'Integer id Orc Sed Ante Tincidunt',
        desc: 'Cras convallis lacus orci, tristique tincidunt magna fringilla at faucibus vel.',
        price: '$ 450',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        tag: 'Astronomy & Physics'
      }
    },
    {
      name: 'Aenean Facilisis',
      image: '/assets/explore_row_3.png',
      featured: {
        title: 'Integer id Orc Sed Ante Tincidunt',
        desc: 'Cras convallis lacus orci, tristique tincidunt magna fringilla at faucibus vel.',
        price: '$ 450',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
        tag: 'Visual Arts & Photography'
      }
    },
  ];

  const handleExplore = () => {
    setActivePage('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeeAll = () => {
    setActivePage('courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="space-y-3 mb-14 md:mb-16">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-dark tracking-tight">
            Explore Course
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg">
            Ut sed eros finibus, placerat orci id, dapibus.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-wrap gap-4 mb-10 pb-2 border-b border-gray-200">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`pb-4 px-2 font-poppins text-lg sm:text-xl transition-all duration-200 border-b-2 font-medium relative focus:outline-none ${
                activeTab === idx
                  ? 'border-totc-teal text-totc-teal font-semibold'
                  : 'border-transparent text-totc-gray hover:text-totc-navy'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active Category Display */}
        <div className="space-y-12">
          {/* Header row with See All link */}
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-semibold text-2xl text-totc-navy flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-totc-teal inline-block" />
              {categories[activeTab].name}
            </h3>
            <button
              onClick={handleSeeAll}
              className="group flex items-center gap-2 text-totc-cyan hover:text-totc-teal font-semibold text-base sm:text-lg tracking-wider uppercase transition-colors"
            >
              <span>SEE ALL</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* High resolution shelf render */}
          <div
            onClick={handleExplore}
            className="cursor-pointer group relative rounded-[28px] overflow-hidden bg-white p-4 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            <img
              src={categories[activeTab].image}
              alt={categories[activeTab].name}
              className="w-full h-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.008]"
            />
            {/* Click to explore pill badge */}
            <div className="absolute bottom-6 right-8 hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full bg-totc-cyan text-white font-medium text-sm shadow-md group-hover:bg-totc-teal transition-colors">
              <span>View Course Details</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* All Rows Mini Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {categories.map((c, i) => (
            <div
              key={i}
              onClick={() => {
                setActiveTab(i);
                window.scrollTo({ top: 5000, behavior: 'smooth' });
              }}
              className={`p-6 rounded-2xl bg-white border cursor-pointer transition-all duration-300 hover:shadow-lg ${
                activeTab === i ? 'border-totc-teal shadow-md' : 'border-gray-200'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-totc-teal">
                Collection {i + 1}
              </span>
              <h4 className="font-poppins font-semibold text-xl text-totc-navy mt-1 mb-2">
                {c.name}
              </h4>
              <p className="text-sm text-totc-gray line-clamp-2">
                {c.featured.desc}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="font-bold text-totc-purple">{c.featured.price}</span>
                <span className="text-xs text-totc-cyan font-medium flex items-center gap-1">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

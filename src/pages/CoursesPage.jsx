import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Users, ArrowRight, Filter } from 'lucide-react';
import { api } from '../services/api';

export default function CoursesPage({ setActivePage, setSelectedCourse }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All', 'Design', 'Development', 'Business', 'Marketing', 'Photography']);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initial fallback list matching TOTC platform
  const initialCourses = [
    {
      id: '1',
      title: 'AWS Certified Solutions Architect & Cloud Operations',
      category: 'Development',
      instructor: 'Lina Wilson',
      instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews: 1420,
      hours: '32 hrs',
      students: '12.5k',
      price: '$450',
      oldPrice: '$600',
      image: '/assets/explore_row_1.png',
      badge: 'Bestseller'
    },
    {
      id: '2',
      title: 'Full-Stack Modern Web Design & Interactive UI/UX Systems',
      category: 'Design',
      instructor: 'Marcus Chen',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviews: 980,
      hours: '28 hrs',
      students: '8.3k',
      price: '$380',
      oldPrice: '$520',
      image: '/assets/explore_row_2.png',
      badge: 'Popular'
    },
    {
      id: '3',
      title: 'Mastering Digital Photography, Lighting & Visual Storytelling',
      category: 'Photography',
      instructor: 'Sophia Perez',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews: 750,
      hours: '20 hrs',
      students: '6.1k',
      price: '$290',
      oldPrice: '$400',
      image: '/assets/explore_row_3.png',
      badge: 'Top Rated'
    }
  ];

  // Fetch live categories from backend API
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.courses.getCategories();
        if (cats && cats.length > 0) {
          setCategories(['All', ...cats.map(c => c.name)]);
        }
      } catch (e) {
        console.warn('Using local categories:', e.message);
      }
    }
    loadCategories();
  }, []);

  // Fetch live courses from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      setLoading(true);
      try {
        const res = await api.courses.getAll({
          search: searchTerm,
          category: activeCategory
        });

        if (isMounted && res && res.items && res.items.length > 0) {
          const mapped = res.items.map(c => ({
            id: c.id,
            title: c.title,
            category: c.categoryName || 'General',
            instructor: c.instructorName || 'Instructor',
            instructorAvatar: c.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            rating: c.averageRating || 5.0,
            reviews: c.reviewsCount || 0,
            hours: `${Math.round(c.totalDurationMinutes / 60) || 15} სთ`,
            students: `${c.studentsCount || 0}`,
            price: `₾${c.price}`,
            oldPrice: `₾${Math.round(c.price * 1.3)}`,
            image: c.thumbnailUrl || '/assets/explore_row_1.png',
            badge: c.price > 400 ? 'ბესტსელერი' : 'რჩეული'
          }));
          setCoursesList(mapped);
        } else if (isMounted) {
          setCoursesList(initialCourses);
        }
      } catch (err) {
        console.warn('Falling back to local course list:', err.message);
        if (isMounted) setCoursesList(initialCourses);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadCourses();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, activeCategory]);

  const filteredCourses = coursesList.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCourseClick = (course) => {
    if (setSelectedCourse) setSelectedCourse(course);
    setActivePage('course-detail', course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Banner */}
        <div className="bg-totc-teal rounded-[32px] p-8 sm:p-14 text-white relative overflow-hidden mb-16 shadow-xl">
          <div className="max-w-2xl space-y-4 z-10 relative">
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
              კურსების კატალოგი
            </span>
            <h1 className="font-poppins font-bold text-3xl sm:text-5xl leading-tight">
              აღმოაჩინეთ ჩვენი ონლაინ კურსები
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              ისწავლეთ ინტერაქტიულ გარემოში სერტიფიცირებულ ინსტრუქტორებთან ერთად, რეალური პროექტებითა და ტესტებით.
            </p>
          </div>

          {/* Search Box inside banner */}
          <div className="mt-8 relative max-w-xl z-10">
            <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="მოძებნეთ სასურველი კურსი, თემა ან ინსტრუქტორი..."
              className="w-full pl-14 pr-6 py-4 rounded-full bg-white text-totc-navy placeholder-gray-400 focus:outline-none shadow-lg text-base"
            />
          </div>

          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-totc-teal text-white shadow-md'
                  : 'bg-white text-totc-gray hover:text-totc-navy hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat === 'All' ? 'ყველა' : cat}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCourseClick(c)}
              className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-totc-purple shadow-sm">
                      {c.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-totc-orange text-white text-xs font-semibold shadow-sm">
                      {c.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2 text-xs text-totc-gray">
                    <div className="flex items-center text-[#F48C06]">
                      <Star className="w-4 h-4 fill-[#F48C06]" />
                    </div>
                    <span className="font-bold text-totc-navy">{c.rating}</span>
                    <span>({c.reviews} შეფასება)</span>
                  </div>

                  <h3 className="font-poppins font-semibold text-xl text-totc-navy group-hover:text-totc-teal transition-colors leading-snug line-clamp-2">
                    {c.title}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={c.instructorAvatar}
                      alt={c.instructor}
                      className="w-9 h-9 rounded-full object-cover border border-totc-teal"
                    />
                    <span className="text-sm font-medium text-totc-gray">
                      {c.instructor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-poppins font-bold text-2xl text-totc-purple">
                    {c.price}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {c.oldPrice}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-totc-teal group-hover:translate-x-1 transition-transform">
                  კურსის ნახვა <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

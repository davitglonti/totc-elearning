import React from 'react';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';

export default function BlogPage({ setActivePage }) {
  const posts = [
    {
      id: 1,
      title: 'Class-მა Zoom-ზე დაფუძნებული EdTech პლატფორმის განსავითარებლად $30 მილიონი მოიზიდა',
      category: 'ინვესტიციები და ზრდა',
      date: '8 ნოემბერი, 2026',
      readTime: '5 წთ საკითხავი',
      author: 'მაიკლ ჩეისენი',
      image: '/assets/news_laptop.png',
      desc: 'კომპანია Class Technologies Inc.-მა, რომელიც ქმნის სპეციალიზებულ საკლასო ინსტრუმენტებს Zoom-ის ბაზაზე, დახურა მსხვილი საინვესტიციო რაუნდი სასწავლო დაწესებულებებში დანერგვის დასაჩქარებლად.'
    },
    {
      id: 2,
      title: 'Class Technologies Inc.-მა მაღალი მოთხოვნის დასაკმაყოფილებლად $30M Series A დაფინანსება დახურა',
      category: 'პრეს-რელიზი',
      date: '4 ნოემბერი, 2026',
      readTime: '4 წთ საკითხავი',
      author: 'სარა ჯენკინსი',
      image: '/assets/news_thumb_1.png',
      desc: 'სკოლებისა და უმაღლესი სასწავლებლების მხრიდან გაზრდილი მოთხოვნა აჩქარებს ვირტუალური საკლასო ოთახების მართვის სისტემების განვითარებას.'
    },
    {
      id: 3,
      title: 'Zoom-ის პირველი ინვესტორები მილიონებს დებენ სკოლებისთვის უკეთესი პლატფორმის შექმნაში',
      category: 'ვენჩურული კაპიტალი',
      date: '28 ოქტომბერი, 2026',
      readTime: '6 წთ საკითხავი',
      author: 'დეივიდ ვენსი',
      image: '/assets/news_thumb_2.png',
      desc: 'დისტანციური კომუნიკაციის პლატფორმების ადრეული ინვესტორები პროგნოზირებენ, რომ ინტერაქტიული შეფასების ჟურნალები და ტესტები განსაზღვრავს EdTech-ის მომავალს.'
    },
    {
      id: 4,
      title: 'Blackboard-ის ყოფილმა CEO-მ $16M მოიზიდა Zoom-ში LMS ფუნქციების ინტეგრაციისთვის',
      category: 'EdTech ლიდერობა',
      date: '20 ოქტომბერი, 2026',
      readTime: '7 წთ საკითხავი',
      author: 'ელენა როსტოვა',
      image: '/assets/news_thumb_3.png',
      desc: 'ცოცხალი ტესტების, ტრიბუნისა და დასწრების აღრიცხვის ინტეგრაცია ციფრულ შეხვედრებში წყვეტს ჩართულობის პრობლემას ონლაინ სწავლებაში.'
    },
    {
      id: 5,
      title: 'ჰიბრიდული საკლასო ოთახების მომავალი: 100,000 აქტიური სტუდენტის გამოცდილება',
      category: 'კვლევა',
      date: '15 ოქტომბერი, 2026',
      readTime: '8 წთ საკითხავი',
      author: 'გლორია როუზი',
      image: '/assets/classroom_feature.png',
      desc: 'პედაგოგიური მონაცემები აჩვენებს, რომ პრივატული ინდივიდუალური დისკუსიები აორმაგებს სტუდენტების ჩართულობასა და მასალის ათვისებას.'
    },
    {
      id: 6,
      title: 'როგორ ზოგავენ მასწავლებლები კვირაში 10+ საათს ავტომატური შეფასებით',
      category: 'რჩევები ლექტორებს',
      date: '10 ოქტომბერი, 2026',
      readTime: '4 წთ საკითხავი',
      author: 'მარკუს ჩენი',
      image: '/assets/instructor_card.png',
      desc: 'გაეცანით პრაქტიკულ მეთოდებს მყისიერი ტესტირებების შესადგენად და შედეგების ავტომატურ სინქრონიზაციას სასწავლო ჟურნალში.'
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
            TOTC ბლოგი და რესურსები
          </span>
          <h1 className="font-poppins font-bold text-3xl sm:text-5xl text-totc-navy leading-tight">
            უახლესი ამბები თანამედროვე განათლებაზე
          </h1>
          <p className="text-totc-gray text-base sm:text-lg">
            გაეცანით ტენდენციებს, პლატფორმის განახლებებს, პედაგოგიურ კვლევებსა და პრაქტიკულ რჩევებს.
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
                სრული სტატიის წაკითხვა <ArrowRight className="w-4 h-4" />
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
                  ვრცლად <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

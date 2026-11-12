import React from 'react';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Heart, ThumbsUp } from 'lucide-react';

export default function BlogDetailPage({ setActivePage }) {
  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[960px] mx-auto px-6 md:px-12">
        
        {/* Back Button */}
        <button
          onClick={() => {
            setActivePage('blog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-totc-teal hover:text-totc-navy transition-colors font-medium text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ყველა სტატიაზე დაბრუნება</span>
        </button>

        {/* Article Header */}
        <div className="space-y-4 mb-8">
          <span className="px-3.5 py-1 rounded-full bg-totc-teal-light text-totc-teal font-semibold text-xs uppercase tracking-wider">
            სიახლეები და ინვესტიციები
          </span>

          <h1 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-navy leading-tight">
            Class-მა Zoom-ზე დაფუძნებული EdTech პლატფორმის განსავითარებლად $30 მილიონი მოიზიდა
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-gray-200 pb-6 text-sm text-totc-gray">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="ავტორი"
                className="w-10 h-10 rounded-full object-cover border border-totc-teal"
              />
              <div>
                <span className="font-semibold text-totc-navy block">მაიკლ ჩეისენი</span>
                <span className="text-xs text-totc-gray">თანადამფუძნებელი და CEO</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> 8 ნოემბერი, 2026</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 5 წთ საკითხავი</span>
            </div>
          </div>
        </div>

        {/* Hero Photo */}
        <div className="rounded-[28px] overflow-hidden shadow-2xl mb-12">
          <img
            src="/assets/news_laptop.png"
            alt="Class-ის ინტერფეისი ლეპტოპზე"
            className="w-full h-[360px] sm:h-[480px] object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none text-totc-gray space-y-6 leading-relaxed font-nunito text-base sm:text-lg">
          <p className="font-semibold text-totc-navy text-xl leading-relaxed">
            პლატფორმა Class, რომელიც Zoom-ის შეხვედრებში სკოლის მართვისა და აქტიური ჩართულობის ინსტრუმენტებს აერთიანებს, დღეს $30 მილიონიანი Series A დაფინანსების მოზიდვას იუწყება.
          </p>

          <p>
            ტრადიციული ვიდეოკონფერენციის პლატფორმები ბიზნეს შეხვედრებისთვის შეიქმნა და არა პედაგოგიური პროცესებისთვის. სასწავლო გარემოში ინსტრუქტორებს სჭირდებათ გამოყოფილი ტრიბუნა, ავტომატური დასწრების აღრიცხვა, რეალურ დროში ტესტირება და პრივატული კონსულტაციის ოთახები.
          </p>

          {/* Key Quote / Callout */}
          <div className="my-8 p-8 rounded-2xl bg-totc-teal-light border-l-4 border-totc-teal text-totc-navy font-poppins font-medium text-lg sm:text-xl italic">
            „ჩვენ არ ვცდილობთ Zoom-ის ჩანაცვლებას; ჩვენ მას ვაქცევთ ინტუიციურ, მაღალტექნოლოგიურ ციფრულ კამპუსად, სადაც სწავლა ისეთივე ცოცხალია, როგორც რეალურ აუდიტორიაში.“
          </div>

          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-totc-navy pt-4">
            ჩართულობის გაზრდა თანამედროვე EdTech ინსტრუმენტებით
          </h2>

          <p>
            მოზიდული კაპიტალი მოხმარდება საინჟინრო გუნდის გაორმაგებას და საერთაშორისო მასშტაბირებას ევროპის, ჩრდილოეთ ამერიკისა და აზიის სასწავლო დაწესებულებებში. ძირითადი ფუნქციებია:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>ავტომატური დასწრება და სინქრონიზაცია:</strong> ინსტრუქტორებს აღარ უწევთ სიის ხელით ამოკითხვა — სტუდენტის შემოსვლის დრო ავტომატურად აისახება ჟურნალში.</li>
            <li><strong>ტრიბუნა და წინა რიგი:</strong> ასისტენტებისა და პრეზენტატორი სტუდენტების გამოყოფა ხდება კლასის საერთო ბადის დარღვევის გარეშე.</li>
            <li><strong>მყისიერი ფორმატიული შეფასება:</strong> ლექტორებს შეუძლიათ სწრაფი ტესტების გაშვება ლექციის მსვლელობისას და შედეგების მყისიერი ნახვა.</li>
            <li><strong>პრივატული კონსულტაციის არხები:</strong> ინსტრუქტორს შეუძლია სტუდენტთან ინდივიდუალური გასაუბრება კლასიდან გაუსვლელად.</li>
          </ul>

          <p>
            100,000-ზე მეტი აქტიური სტუდენტითა და 5,000-ზე მეტი კურსით, TOTC აგრძელებს ჰიბრიდული და დისტანციური სწავლების მომავლის ფორმირებას.
          </p>
        </div>

        {/* Share & Clap Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-totc-teal/10 text-totc-teal hover:bg-totc-teal/20 transition-colors text-sm font-semibold">
              <ThumbsUp className="w-4 h-4" /> <span>342 მოწონება</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-totc-gray font-medium">გაზიარება:</span>
            <button className="p-2 rounded-full hover:bg-gray-100 text-totc-teal transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

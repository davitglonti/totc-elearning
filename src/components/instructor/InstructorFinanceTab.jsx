import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CreditCard, Calendar, ShieldCheck, 
  FileText, HelpCircle, CheckCircle2, ArrowRight, 
  Building, Percent, AlertCircle, Info, Sparkles, 
  Lock, RefreshCw, Check, ShoppingCart, Crown, Clock,
  PlayCircle, TrendingUp, Layers, Zap, Users, Globe,
  Calculator, CheckCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export function InstructorFinanceTab({ summary, currentUser }) {
  const { settings } = useSettings();
  
  // Dynamic admin-controlled revenue sharing rates & payout parameters
  const referralShare = settings?.instructorReferralShare ?? 80;
  const referralPlatformShare = settings?.platformReferralShare ?? 20;
  const organicShare = settings?.instructorOrganicShare ?? 60;
  const organicPlatformShare = settings?.platformOrganicShare ?? 40;
  const subPoolShare = settings?.subscriptionPoolShare ?? 80;
  const subPlatformShare = settings?.platformSubscriptionShare ?? 20;
  const minPayoutThreshold = settings?.minimumPayoutThreshold ?? 50;
  const payoutScheduleDays = settings?.payoutScheduleDays || '5-10';
  const refundBufferDays = settings?.refundBufferDays ?? 14;

  const totalRevenue = Number(summary?.totalRevenue || 0);
  const instructorShare = totalRevenue * (referralShare / 100);
  const platformFee = totalRevenue * (referralPlatformShare / 100);

  // Local storage key for instructor payout details
  const storageKey = `totc_instructor_payout_${currentUser?.id || 'default'}`;

  const [bankDetails, setBankDetails] = useState({
    bankName: 'TBC Bank (თიბისი)',
    recipientName: currentUser?.fullName || '',
    personalId: '',
    iban: '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [payoutNotice, setPayoutNotice] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // Load saved payout details on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setBankDetails(JSON.parse(saved));
        setIsSaved(true);
      }
    } catch (e) {
      console.warn('Failed to load instructor payout details:', e);
    }
  }, [storageKey]);

  const handleSaveBankDetails = (e) => {
    e.preventDefault();
    if (!bankDetails.iban.trim() || !bankDetails.recipientName.trim()) {
      setPayoutNotice({ type: 'error', message: 'გთხოვთ შეავსოთ მიმღების სახელი და IBAN ანგარიშის ნომერი.' });
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(bankDetails));
      setIsSaved(true);
      setPayoutNotice({ type: 'success', message: 'თქვენი საბანკო რეკვიზიტები წარმატებით შეინახა!' });
      setTimeout(() => setPayoutNotice(null), 4000);
    } catch (e) {
      setPayoutNotice({ type: 'error', message: 'შენახვა ვერ მოხერხდა: ' + e.message });
    }
  };

  const handleRequestPayout = () => {
    if (!bankDetails.iban.trim()) {
      setPayoutNotice({ type: 'error', message: 'თანხის გასატანად ჯერ შეინახეთ თქვენი IBAN საბანკო ანგარიში.' });
      return;
    }

    if (instructorShare < minPayoutThreshold) {
      setPayoutNotice({ 
        type: 'warning', 
        message: `მინიმალური გასატანი ზღვარია ₾${minPayoutThreshold}. თქვენი მიმდინარე ბალანსია ₾${instructorShare.toFixed(2)}. თანხა გადავა მომდევნო თვის ანგარიშსწორებაში და დაჯამდება.` 
      });
      return;
    }

    setPayoutNotice({
      type: 'success',
      message: `განაღდების მოთხოვნა ₾${instructorShare.toFixed(2)} ოდენობით მიღებულია! თანხა ჩაირიცხება ${bankDetails.bankName}-ის ანგარიშზე მომდევნო ჩარიცხვის პერიოდში (${payoutScheduleDays} რიცხვში).`
    });
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'როგორ იანგარიშება ჩემი წილი კურსის გაყიდვიდან?',
      a: 'თითოეული გაყიდული კურსის ღირებულებიდან ინსტრუქტორი იღებს 80%-ს, ხოლო პლატფორმა იტოვებს 20%-ს. მაგალითად: თუ კურსის ფასია ₾100, თქვენი წმინდა შემოსავალია ₾80, ხოლო პლატფორმის მომსახურება — ₾20.'
    },
    {
      q: 'რა მომსახურებას ფარავს პლატფორმის 20%-იანი წილი?',
      a: 'პლატფორმის 20% ფარავს Bunny CDN Ultra HD 1080p სტრიმინგს, ვიდეოების ლიცენზირებულ DRM დაშიფვრას (ეკრანის გადაწერისგან დაცვას), საბანკო ბარათების ტრანზაქციულ საკომისიოებს, Cloud სერვერების ხარჯებს, ავტომატურ QR-სერტიფიკატებსა და ტექნიკურ მხარდაჭერას.'
    },
    {
      q: 'როდის და როგორ ირიცხება გამომუშავებული თანხა?',
      a: 'ანგარიშსწორება ხდება ყოველთვიურად. წინა თვის გამომუშავებული თანხა ინსტრუქტორებს ერიცხებათ მომდევნო თვის 5-დან 10 რიცხვამდე, პირდაპირ საქართველოს ნებისმიერი ბანკის IBAN ანგარიშზე (GEL).'
    },
    {
      q: 'რა არის მინიმალური თანხა, რომლის გატანაც შემიძლია?',
      a: 'მინიმალური განაღდების ზღვარი შეადგენს ₾50-ს (ორმოცდაათ ლარს). თუ თვის ბოლოს თქვენი დაგროვილი თანხა 50 ლარზე ნაკლებია, ის არ იკარგება — გადადის მომდევნო თვეზე და ჯამდება ახალ გაყიდვებთან.'
    },
    {
      q: 'რა ხდება, თუ სტუდენტი მოითხოვს თანხის დაბრუნებას (Refund)?',
      a: 'TOTC-ის პოლიტიკით, სტუდენტს აქვს უფლება მოითხოვოს თანხის დაბრუნება შეძენიდან 14 დღის განმავლობაში, თუ მას არ აქვს გავლილი კურსის 20%-ზე მეტი. ამიტომ ახალი გაყიდვების თანხა გადის 14-დღიან უსაფრთხოების ბუფერს, რის შემდეგაც გადადის განაღდებისთვის ხელმისაწვდომ ბალანსში.'
    },
    {
      q: 'როგორ იანგარიშება შემოსავალი, როცა სტუდენტი ჩემს კურსს საერთო გამოწერით (Membership) უყურებს?',
      a: 'TOTC-ზე მოქმედებს ნახვის დროის პროპორციული მოდელი (Watch-Time Pro-Rata Pool). ყველა აქტიური გამომწერის გადახდილი თანხის 80% შედის ინსტრუქტორთა საერთო ყოველთვიურ საპრიზო ფონდში. თვის ბოლოს სისტემა აჯამებს, რამდენი წუთი უყურეს თქვენს კურსებს გამომწერებმა. თქვენი წილი შეესაბამება თქვენს პროცენტულ წილს პლატფორმის მთლიან ნანახ წუთებში. მაგალითად: თუ პლატფორმის ყველა კურსი ჯამში ნანახი იყო 100,000 წუთი, ხოლო თქვენი კურსი 10,000 წუთი (10%), თქვენ მიიღებთ სააბონენტო ფონდის 10%-ს.'
    },
    {
      q: 'შეუძლია თუ არა სტუდენტს კურსის ცალკე ყიდვაც და გამოწერით სარგებლობაც?',
      a: 'დიახ, ორივე მოდელი სრულ ჰარმონიაშია. თუ სტუდენტს სურს მხოლოდ თქვენი კონკრეტული კურსი უვადო წვდომით, ის ყიდულობს მას ცალკე (თქვენ იღებთ 80%-ს). ხოლო თუ სტუდენტი არის TOTC-ის საერთო გამოწერის მფლობელი, თქვენ გამოიმუშავებთ თანხას მისი ყურების ყოველი წუთიდან. ორივე შემთხვევაში თქვენი შრომა დაცულია და მაქსიმალურად ანაზღაურებადი.'
    },
    {
      q: 'როგორ ხდება დაბეგვრა და საგადასახადო ანგარიშგება?',
      a: 'საქართველოს კანონმდებლობის შესაბამისად, ინსტრუქტორი თავად განსაზღვრავს თავის საგადასახადო სტატუსს: ფიზიკური პირი, მცირე ბიზნესის სტატუსის მქონე ინდ. მეწარმე (სადაც საშემოსავლო გადასახადი არის მხოლოდ 1%), ან იურიდიული პირი. TOTC მოთხოვნისთანავე გასცემს ოფიციალურ შედარების აქტს.'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Notice Banner */}
      {payoutNotice && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border ${
          payoutNotice.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : payoutNotice.type === 'warning'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
            {payoutNotice.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {payoutNotice.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
            {payoutNotice.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            <span>{payoutNotice.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setPayoutNotice(null)} 
            className="text-gray-400 hover:text-gray-600 text-xs font-bold shrink-0 ml-4"
          >
            დახურვა
          </button>
        </div>
      )}

      {/* 4 Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Gross Revenue */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">საერთო გაყიდვები (100%)</p>
          <h3 className="font-poppins font-black text-2xl text-totc-navy mt-1">
            ₾{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            კურსების გაყიდვების მთლიანი შემოსავალი
          </p>
        </div>

        {/* Instructor Share (80%) */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[24px] text-white shadow-md shadow-emerald-500/20 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center mb-4 border border-white/20">
            <Percent className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white/80 uppercase tracking-wider">თქვენი წილი ({referralShare}%)</p>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">წმინდა წილი</span>
          </div>
          <h3 className="font-poppins font-black text-2xl sm:text-3xl text-white mt-1">
            ₾{instructorShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-emerald-100 font-medium mt-1">
            ინსტრუქტორის კუთვნილი თანხა (რეფერალური წილი)
          </p>
        </div>

        {/* Platform Share */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Building className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">პლატფორმის საკომისიო ({referralPlatformShare}%)</p>
          <h3 className="font-poppins font-black text-2xl text-totc-navy mt-1">
            ₾{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            Bunny CDN, DRM დაცვა, სერვერები და ბანკი
          </p>
        </div>

        {/* Payout Schedule */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">ჩარიცხვის გრაფიკი</p>
          <h3 className="font-poppins font-black text-2xl text-amber-600 mt-1">
            {payoutScheduleDays} რიცხვი
          </h3>
          <p className="text-[11px] text-totc-gray font-medium mt-1">
            ყოველთვიურად • მინიმალური ზღვარი ₾{minPayoutThreshold}
          </p>
        </div>

      </div>

      {/* Revenue Models Comparison: Direct Purchase vs All-Access Subscription */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-totc-teal text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>როგორ გამოიმუშავებთ შემოსავალს TOTC-ზე</span>
            </div>
            <h3 className="font-poppins font-black text-xl sm:text-2xl text-totc-navy">
              ორი ძირითადი წყარო: პირდაპირი გაყიდვა vs საერთო გამოწერა
            </h3>
            <p className="text-xs sm:text-sm text-totc-gray max-w-2xl mt-1">
              TOTC-ის პლატფორმაზე თქვენი შემოსავალი გენერირდება ორი დამოუკიდებელი ნაკადით: როდესაც სტუდენტი ყიდულობს თქვენს კურსს ცალკე (რეფერალით ან ორგანულად), ან როდესაც უყურებს მას საერთო გამოწერის (Membership) ფარგლებში.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            ადმინ-კონტროლირებადი ტარიფები
          </span>
        </div>

        {/* 2 Comparative Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Card 1: Direct Purchase (Split into 2 Cases) */}
          <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-b from-emerald-50/40 to-white p-6 sm:p-7 space-y-5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      მოდელი 1: პირდაპირი გაყიდვა (2 ტიპი)
                    </span>
                    <h4 className="font-poppins font-black text-lg text-totc-navy mt-1">
                      რა ხდება, როცა კურსი გაიყიდა?
                    </h4>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                სტუდენტი ყიდულობს კონკრეტულად თქვენს კურსს და იხდის მის სრულ ფასს. შემოსავალი იყოფა 2 შემთხვევის მიხედვით იმის მიხედვით, თუ საიდან მოვიდა სტუდენტი:
              </p>

              {/* Case A: Instructor Referral Link */}
              <div className="p-4 rounded-xl bg-white border-2 border-emerald-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">A</span>
                    <span className="font-bold text-xs text-totc-navy">როცა ლექტორმა მოიყვანა სტუდენტი (რეფერალი)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                    {referralShare}% / {referralPlatformShare}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                  თუ სტუდენტმა კურსი შეიძინა თქვენი პირადი სარეფერალო ბმულით (სოციალური ქსელები, YouTube, პირადი აუდიტორია), <strong>ინსტრუქტორს ერიცხება {referralShare}%</strong>, ხოლო პლატფორმა იტოვებს მხოლოდ {referralPlatformShare}%-ს.
                </p>
                <div className="ml-7 text-[10px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  მაგ: ₾100-იანი კურსიდან → <strong>₾{referralShare} თქვენია</strong>, ₾{referralPlatformShare} პლატფორმის.
                </div>
              </div>

              {/* Case B: Organic Platform Discovery */}
              <div className="p-4 rounded-xl bg-white border-2 border-blue-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">B</span>
                    <span className="font-bold text-xs text-totc-navy">როცა სტუდენტმა პლატფორმაზე ნახა (ორგანული)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                    {organicShare}% / {organicPlatformShare}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                  თუ სტუდენტმა კურსი აღმოაჩინა TOTC-ის მთავარი გვერდიდან, ძიების კატალოგიდან ან რეკლამიდან, <strong>ინსტრუქტორს ერიცხება {organicShare}%</strong>, ხოლო {organicPlatformShare}% ხმარდება რეკლამირებას, SEO-ს და მარკეტინგს.
                </p>
                <div className="ml-7 text-[10px] font-semibold text-blue-800 bg-blue-50 p-2 rounded-lg border border-blue-100">
                  მაგ: ₾100-იანი კურსიდან → <strong>₾{organicShare} თქვენია</strong>, ₾{organicPlatformShare} პლატფორმის.
                </div>
              </div>

              {/* Shared Direct Sales Perks */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>უვადო (Lifetime) წვდომა</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50/50">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{refundBufferDays}-დღიანი ბუფერი</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
              ⚙️ ორივე პროცენტის ({referralShare}/{referralPlatformShare} და {organicShare}/{organicPlatformShare}) შეცვლა შეუძლია მთავარ ადმინისტრატორს ადმინ პანელიდან.
            </div>
          </div>

          {/* Card 2: Subscription All-Access (With Detailed Arithmetic Example) */}
          <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-6 sm:p-7 space-y-5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                      მოდელი 2: საერთო გამოწერა
                    </span>
                    <h4 className="font-poppins font-black text-lg text-totc-navy mt-1">
                      რა ხდება, როცა გამოწერით უყურეს?
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-2xs">
                  {subPoolShare}% საინსტრუქტორო ფონდი
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                სტუდენტი იხდის TOTC-ის ყოველთვიურ სააბონენტო გადასახადს. ყველა გამოწერიდან შემოსული თანხის <strong>{subPoolShare}% ერთიანდება საინსტრუქტორო ფონდში</strong> და ნაწილდება <strong>ნახვის წუთების პროპორციით (Watch-Time)</strong>.
              </p>

              {/* Concrete Arithmetic Example Box */}
              <div className="p-4 rounded-xl bg-white border-2 border-indigo-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-950 pb-1 border-b border-indigo-100">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>კონკრეტული გასაგები მაგალითი ციფრებით:</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-indigo-50/70">
                    <span className="text-totc-gray block text-[10px]">1. აქტიური გამომწერი:</span>
                    <strong className="text-totc-navy">1,000 სტუდენტი (₾29/თვე)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/70">
                    <span className="text-totc-gray block text-[10px]">2. თვის ბრუნვა:</span>
                    <strong className="text-indigo-700">₾29,000 ლარი</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/70">
                    <span className="text-totc-gray block text-[10px]">3. საინსტრუქტორო ფონდი ({subPoolShare}%):</span>
                    <strong className="text-emerald-700">₾{(29000 * subPoolShare / 100).toLocaleString()} ლარი</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/70">
                    <span className="text-totc-gray block text-[10px]">4. პლატფორმის ყურების დრო:</span>
                    <strong className="text-totc-navy">100,000 წუთი</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-600 text-white space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>თქვენს კურსებს უყურეს 15,000 წუთი:</span>
                    <span className="font-black bg-white/20 px-2 py-0.5 rounded text-[11px]">15% წილი</span>
                  </div>
                  <div className="flex items-center justify-between font-poppins pt-1 border-t border-white/20">
                    <span className="text-xs font-semibold">თქვენი წმინდა დარიცხვა ამ თვეში:</span>
                    <span className="text-sm font-black text-amber-300">
                      ₾{((29000 * subPoolShare / 100) * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  💡 ამ მაგალითში ყურების ყოველი წუთი ინსტრუქტორს მოუტანს ~{((29000 * subPoolShare / 100) / 100000).toFixed(3)}₾-ს. რაც უფრო საინტერესოა თქვენი კურსი, მით მეტ პასიურ შემოსავალს იღებთ!
                </p>
              </div>

              {/* Formula String */}
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] font-mono text-indigo-900 text-center">
                თქვენი წილი = (თქვენი კურსების წუთები ÷ 100,000 წთ) × ₾{(29000 * subPoolShare / 100).toLocaleString()}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
              ⚙️ საინსტრუქტორო ფონდის პროცენტის ({subPoolShare}%) რეგულირება ასევე შესაძლებელია ადმინ პანელიდან.
            </div>
          </div>

        </div>

        {/* Comparison Summary Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border border-gray-100 rounded-2xl overflow-hidden">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase text-totc-navy border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5">მახასიათებელი</th>
                <th className="px-5 py-3.5 text-emerald-700">🛒 ლექტორის რეფერალი</th>
                <th className="px-5 py-3.5 text-blue-700">🌐 პლატფორმის ორგანული</th>
                <th className="px-5 py-3.5 text-indigo-700">👑 საერთო გამოწერა (Membership)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3 font-semibold text-totc-navy">სტუდენტის გადახდა</td>
                <td className="px-5 py-3">კურსის ფასი (ერთჯერადი)</td>
                <td className="px-5 py-3">კურსის ფასი (ერთჯერადი)</td>
                <td className="px-5 py-3">თვიური / წლიური აბონემენტი</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3 font-semibold text-totc-navy">ინსტრუქტორის წილი</td>
                <td className="px-5 py-3 font-bold text-emerald-600">{referralShare}% (უმაღლესი წილი)</td>
                <td className="px-5 py-3 font-bold text-blue-600">{organicShare}% (პლატფორმის მარკეტინგი)</td>
                <td className="px-5 py-3 font-bold text-indigo-600">{subPoolShare}% ფონდიდან (Watch-Time-ით)</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3 font-semibold text-totc-navy">პლატფორმის საკომისიო</td>
                <td className="px-5 py-3 text-slate-600">{referralPlatformShare}%</td>
                <td className="px-5 py-3 text-slate-600">{organicPlatformShare}%</td>
                <td className="px-5 py-3 text-slate-600">{subPlatformShare}%</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3 font-semibold text-totc-navy">სტუდენტის წვდომა</td>
                <td className="px-5 py-3">უვადო (Lifetime) წვდომა</td>
                <td className="px-5 py-3">უვადო (Lifetime) წვდომა</td>
                <td className="px-5 py-3">აქტიური გამოწერის პერიოდში</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3 font-semibold text-totc-navy">დარიცხვის დრო</td>
                <td className="px-5 py-3">გაყიდვისთანავე ({refundBufferDays}-დღიანი ბუფერი)</td>
                <td className="px-5 py-3">გაყიდვისთანავე ({refundBufferDays}-დღიანი ბუფერი)</td>
                <td className="px-5 py-3">თვის ბოლოს საათების დაჯამებით</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3 font-semibold text-totc-navy">სერტიფიკატი</td>
                <td className="px-5 py-3">ოფიციალური QR სერტიფიკატი</td>
                <td className="px-5 py-3">ოფიციალური QR სერტიფიკატი</td>
                <td className="px-5 py-3">ოფიციალური QR სერტიფიკატი</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Grid: Terms & Conditions (Left 7 cols) + Bank Details & Payout (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: 4 Comprehensive Terms & Rules Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-totc-teal flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-xl text-totc-navy">
                  ანაზღაურებისა და თანხის გაყოფის წესები
                </h3>
                <p className="text-xs text-totc-gray">
                  გაეცანით დეტალურ წესებსა და პირობებს ინსტრუქტორების ფინანსურ ანგარიშსწორებასთან დაკავშირებით.
                </p>
              </div>
            </div>

            {/* Rule 1: Revenue Share */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-totc-navy font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-black">1</span>
                <span>თანხის გაყოფის მოდელი — {referralShare}% რეფერალი / {organicShare}% ორგანული გაყიდვა</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                TOTC-ის პლატფორმაზე მოქმედებს მოქნილი და სამართლიანი წილი: როდესაც ინსტრუქტორს მოჰყავს სტუდენტი პირადი რეფერალური ბმულით, ის იღებს <strong>{referralShare}%-ს</strong> (პლატფორმის საკომისიო {referralPlatformShare}%). ხოლო როდესაც სტუდენტი კურსს პლატფორმაზე პოულობს ორგანულად, ინსტრუქტორი იღებს <strong>{organicShare}%-ს</strong> (პლატფორმის წილი {organicPlatformShare}%, რაც ფარავს რეკლამას, SEO-სა და მარკეტინგს).
              </p>
            </div>

            {/* Rule 2: Schedule & Dates */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-totc-navy font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-black">2</span>
                <span>ჩარიცხვის გრაფიკი — ყოველი თვის {payoutScheduleDays} რიცხვამდე</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                გამომუშავებული თანხის ანგარიშსწორება ხდება ყოველთვიურ რეჟიმში. წინა თვეში დაგროვილი თანხა ავტომატურად იანგარიშება თვის ბოლო კალენდარულ დღეს და <strong>ირიცხება მომდევნო თვის {payoutScheduleDays} რიცხვამდე</strong> თქვენ მიერ მითითებულ საბანკო IBAN ანგარიშზე.
              </p>
            </div>

            {/* Rule 3: Minimum Payout & Threshold */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-totc-navy font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-black">3</span>
                <span>მინიმალური განაღდების ზღვარი — ₾{minPayoutThreshold}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                თანხის გადარიცხვისთვის მინიმალური ზღვარი შეადგენს <strong>₾{minPayoutThreshold} (ორმოცდაათ ლარს)</strong>. თუ მიმდინარე თვეში თქვენი წილი {minPayoutThreshold} ლარზე ნაკლებია, თანხა არ იკარგება — ის ავტომატურად გადადის შემდეგ თვეზე და დაემატება მომდევნო გაყიდვებს.
              </p>
            </div>

            {/* Rule 4: 14-Day Refund Buffer */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-totc-navy font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-black">4</span>
                <span>თანხის დაბრუნების (Refund) {refundBufferDays}-დღიანი უსაფრთხოების ბუფერი</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                მომხმარებელთა უფლებების დაცვის კანონმდებლობისა და პლატფორმის წესების თანახმად, სტუდენტს აქვს უფლება მოითხოვოს თანხის დაბრუნება შეძენიდან {refundBufferDays} დღის განმავლობაში, თუ მას გავლილი აქვს კურსის 20%-ზე ნაკლები. ამიტომ ახალი გაყიდვები გადის {refundBufferDays}-დღიან საგარანტიო პერიოდს.
              </p>
            </div>

            {/* Rule 5: Taxes & Compliance */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-totc-navy font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-black">5</span>
                <span>საგადასახადო ვალდებულებები და ინვოისირება</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                ინსტრუქტორთან ანგარიშსწორება ხდება საქართველოს საგადასახადო კოდექსის შესაბამისად. ინსტრუქტორს შეუძლია მიიღოს ანაზღაურება როგორც ფიზიკურმა პირმა, ინდივიდუალურმა მეწარმემ (1%-იანი მცირე ბიზნესის სტატუსით), ან იურიდიულმა პირმა (შპს). მოთხოვნის შემთხვევაში TOTC გასცემს ოფიციალურ შედარების აქტს.
              </p>
            </div>

          </div>

          {/* How It Works - 4 Step Visual Workflow */}
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm">
            <h4 className="font-poppins font-bold text-base text-totc-navy mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-totc-teal" />
              <span>როგორ მუშაობს პროცესი ნაბიჯ-ნაბიჯ:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-totc-teal font-black text-xs flex items-center justify-center mx-auto">1</div>
                <p className="text-xs font-bold text-totc-navy mt-1">კურსის გაყიდვა</p>
                <p className="text-[11px] text-totc-gray">სტუდენტი ყიდულობს თქვენს კურსს პლატფორმაზე.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-totc-teal font-black text-xs flex items-center justify-center mx-auto">2</div>
                <p className="text-xs font-bold text-totc-navy mt-1">80% დარიცხვა</p>
                <p className="text-[11px] text-totc-gray">თანხის 80% მომენტალურად აღირიცხება თქვენს ბალანსზე.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-totc-teal font-black text-xs flex items-center justify-center mx-auto">3</div>
                <p className="text-xs font-bold text-totc-navy mt-1">თვის ბოლო რეესტრი</p>
                <p className="text-[11px] text-totc-gray">თვის ბოლო დღეს ავტომატურად ჯამდება თვის ბალანსი.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center mx-auto">4</div>
                <p className="text-xs font-bold text-emerald-700 mt-1">IBAN ჩარიცხვა</p>
                <p className="text-[11px] text-totc-gray">5-10 რიცხვში თანხა ირიცხება თქვენს საბანკო ანგარიშზე.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bank Details Form & Payout Trigger (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Bank Account Form */}
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-base text-totc-navy">საბანკო რეკვიზიტები</h4>
                  <p className="text-xs text-totc-gray">თანხის ჩასარიცხი IBAN ანგარიში</p>
                </div>
              </div>
              {isSaved && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  შენახულია
                </span>
              )}
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-totc-navy mb-1.5 uppercase tracking-wider">
                  ბანკი *
                </label>
                <select
                  value={bankDetails.bankName}
                  onChange={(e) => { setBankDetails({ ...bankDetails, bankName: e.target.value }); setIsSaved(false); }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-totc-navy bg-white focus:outline-none focus:border-totc-teal cursor-pointer"
                >
                  <option value="TBC Bank (თიბისი ბანკი)">TBC Bank (თიბისი ბანკი)</option>
                  <option value="Bank of Georgia (საქართველოს ბანკი)">Bank of Georgia (საქართველოს ბანკი)</option>
                  <option value="Liberty Bank (ლიბერთი ბანკი)">Liberty Bank (ლიბერთი ბანკი)</option>
                  <option value="Basisbank (ბაზისბანკი)">Basisbank (ბაზისბანკი)</option>
                  <option value="TeraBank (ტერაბანკი)">TeraBank (ტერაბანკი)</option>
                  <option value="ProCredit Bank (პროკრედიტ ბანკი)">ProCredit Bank (პროკრედიტ ბანკი)</option>
                  <option value="სხვა კომერციული ბანკი">სხვა კომერციული ბანკი</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-totc-navy mb-1.5 uppercase tracking-wider">
                  მიმღების სრული სახელი და გვარი *
                </label>
                <input
                  type="text"
                  required
                  value={bankDetails.recipientName}
                  onChange={(e) => { setBankDetails({ ...bankDetails, recipientName: e.target.value }); setIsSaved(false); }}
                  placeholder="მაგ: დავით გლონტი"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-totc-navy mb-1.5 uppercase tracking-wider">
                  პირადი ნომერი / საიდენტ. კოდი
                </label>
                <input
                  type="text"
                  value={bankDetails.personalId}
                  onChange={(e) => { setBankDetails({ ...bankDetails, personalId: e.target.value }); setIsSaved(false); }}
                  placeholder="მაგ: 01024089765"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-totc-navy mb-1.5 uppercase tracking-wider">
                  IBAN საბანკო ანგარიშის ნომერი (GEL) *
                </label>
                <input
                  type="text"
                  required
                  value={bankDetails.iban}
                  onChange={(e) => { setBankDetails({ ...bankDetails, iban: e.target.value.toUpperCase() }); setIsSaved(false); }}
                  placeholder="მაგ: GE00TB0000000000000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal font-mono uppercase font-bold"
                />
                <p className="text-[10px] text-totc-gray mt-1">
                  გთხოვთ მიუთითოთ 22-ნიშნა ქართული IBAN ანგარიში ლარში (GEL).
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-totc-navy hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>რეკვიზიტების შენახვა</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Payout Action Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#2F327D] rounded-[28px] p-6 sm:p-7 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">ანგარიშსწორება</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                მინიმუმ ₾{minPayoutThreshold}
              </span>
            </div>

            <div>
              <p className="text-xs text-white/70">გასატანად ხელმისაწვდომი თანხა ({referralShare}%):</p>
              <h3 className="font-poppins font-black text-3xl text-white mt-1">
                ₾{instructorShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed">
              თანხა ავტომატურად ირიცხება თვის {payoutScheduleDays} რიცხვში. საჭიროების შემთხვევაში, შეგიძლიათ გაგზავნოთ ადრეული განაღდების მოთხოვნა.
            </p>

            <button
              type="button"
              onClick={handleRequestPayout}
              className="w-full py-3 px-4 rounded-xl bg-totc-teal hover:bg-[#3da5a7] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <DollarSign className="w-4 h-4" />
              <span>განაღდების მოთხოვნა</span>
            </button>
          </div>

          {/* Support / Help Card */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-150 flex items-start gap-3">
            <Info className="w-4 h-4 text-totc-teal shrink-0 mt-0.5" />
            <div className="text-xs text-totc-navy leading-relaxed">
              <span className="font-bold">ფინანსური მხარდაჭერა:</span> კითხვების ან ინვოისის მოთხოვნის შემთხვევაში დაუკავშირდით ფინანსურ განყოფილებას ელ-ფოსტაზე: <a href="mailto:finance@totc.ge" className="text-totc-teal font-bold underline">finance@totc.ge</a>
            </div>
          </div>

        </div>

      </div>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2">
          <HelpCircle className="w-5 h-5 text-totc-teal" />
          <h4 className="font-poppins font-bold text-lg text-totc-navy">
            ხშირად დასმული კითხვები ანაზღაურებაზე (FAQ)
          </h4>
        </div>

        <div className="divide-y divide-gray-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3.5">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-totc-navy hover:text-totc-teal transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-totc-gray text-base shrink-0 font-mono">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </button>
              {activeFaq === idx && (
                <p className="mt-2 text-xs text-totc-gray leading-relaxed pl-2 border-l-2 border-totc-teal animate-in fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default InstructorFinanceTab;

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const defaultHomeContent = {
  hero: {
    titlePart1: 'ონლაინ სწავლა',
    titlePart2: 'ახლა ბევრად მარტივია',
    description: 'TOTC არის თანამედროვე საგანმანათლებლო პლატფორმა, რომელიც გასწავლით ინტერაქტიული და პრაქტიკული მეთოდებით',
    button1Text: 'შეუერთდი უფასოდ',
    button2Text: 'ნახე როგორ მუშაობს',
    imageUrl: '/assets/hero_student_cards.png',
  },
  stats: {
    title: 'ჩვენი წარმატება',
    description: 'ათასობით სტუდენტმა უკვე გაიუმჯობესა კარიერა TOTC-ის პრაქტიკული კურსებითა და ოფიციალური სერტიფიკატებით.',
    items: [
      { number: '15K+', label: 'აქტიური სტუდენტი' },
      { number: '75%', label: 'წარმატების მაჩვენებელი' },
      { number: '35+', label: 'პრაქტიკული კურსი' },
      { number: '26', label: 'წამყვანი ექსპერტი' },
      { number: '16', label: 'წლიანი გამოცდილება' },
    ],
  },
  cloudSoftware: {
    titlePart1: 'ყველაფერი ერთ',
    titlePart2: 'ღრუბლოვან სისტემაში',
    description: 'TOTC არის მძლავრი ონლაინ პლატფორმა, რომელიც აერთიანებს ყველა ინსტრუმენტს წარმატებული სწავლებისა და ადმინისტრირებისთვის.',
    cards: [
      {
        icon: '/assets/all_in_one_billing.png',
        title: 'ონლაინ გადახდები, ინვოისები და კონტრაქტები',
        desc: 'თქვენი ორგანიზაციის ფინანსური და იურიდიული ოპერაციების მარტივი და უსაფრთხო კონტროლი. გააგზავნეთ ინვოისები მომენტალურად',
      },
      {
        icon: '/assets/all_in_one_schedule.png',
        title: 'მარტივი განრიგი და დასწრების აღრიცხვა',
        desc: 'დაგეგმეთ გაკვეთილები და დაჯავშნეთ ვირტუალური აუდიტორიები. აწარმოეთ სტუდენტების დასწრების დეტალური სტატისტიკა',
      },
      {
        icon: '/assets/all_in_one_tracking.png',
        title: 'სტუდენტებთან კომუნიკაცია',
        desc: 'ავტომატიზებული შეტყობინებები და ელ-ფოსტის მართვა ჯგუფებისა და ინდივიდუალური მსმენელებისთვის ერთ სივრცეში',
      },
    ],
  },
  whatIsTotc: {
    title: 'რა არის TOTC?',
    description: 'TOTC არის ინოვაციური საგანმანათლებლო პლატფორმა, რომელიც პედაგოგებსა და ექსპერტებს აძლევს საშუალებას შექმნან ონლაინ კურსები, მართონ დავალებები და გამოცდები, ხოლო სტუდენტებს სთავაზობს ინტერაქტიულ და პრაქტიკულ სწავლებას ერთ სივრცეში.',
    instructorCard: {
      title: 'ინსტრუქტორებისთვის',
      buttonText: 'დაიწყე სწავლება დღესვე',
      image: '/assets/instructor_card.png',
    },
    studentCard: {
      title: 'სტუდენტებისთვის',
      buttonText: 'დაიწყე სწავლა ახლავე',
      image: '/assets/student_card.png',
    },
  },
  classroom: {
    title: 'ყველაფერი, რაც ფიზიკურ აუდიტორიაშია შესაძლებელი, ხელმისაწვდომია TOTC-ში',
    description: 'TOTC-ის სასწავლო მართვის სისტემა ეხმარება ტრადიციულ და ონლაინ სკოლებს მართონ განრიგი, დასწრება, გადახდები და ვირტუალური გაკვეთილები ერთ დაცულ ღრუბლოვან სისტემაში.',
    buttonText: 'გაიგეთ მეტი',
    image: '/assets/classroom_feature.png',
  },
  features: {
    title: 'ჩვენი შესაძლებლობები',
    description: 'უნიკალური ფუნქციონალი, რომელიც სასწავლო პროცესს ბევრად უფრო ეფექტურს ხდის',
    feature1Title: 'საკლასო ოთახზე მორგებული ინტერფეისი',
    feature1Bullets: [
      'ლექტორებს აქვთ გამოყოფილი პოდიუმის სივრცე და მარტივი ნავიგაცია.',
      'ასისტენტებსა და პრეზენტატორებს მარტივად შეუძლიათ აუდიტორიის წინ გამოსვლა.',
      'ინსტრუქტორებს შეუძლიათ ერთდროულად აკონტროლონ ყველა სტუდენტი და პროგრესი.',
    ],
    feature2Title: 'ინსტრუმენტები ლექტორებისა და სტუდენტებისთვის',
    feature2Description: 'სისტემა გთავაზობთ სასწავლო ინსტრუმენტების დინამიურ ნაკრებს. ინსტრუქტორებს შეუძლიათ რეალურ დროში გასცენ დავალებები სტუდენტებისთვის შესასრულებლად.',
  },
  testimonials: {
    badge: 'შეფასებები',
    title: 'რას ამბობენ ჩვენზე?',
    description: 'TOTC-ს უკვე 100,000-ზე მეტი დადებითი შეფასება აქვს მთელი მსოფლიოდან. ათასობით სტუდენტმა და ლექტორმა გააუმჯობესა სასწავლო გამოცდილება ჩვენი პლატფორმით.',
    buttonText: 'დაწერეთ შეფასება',
  },
  news: {
    title: 'ბოლო სიახლეები და რესურსები',
    description: 'გაეცანით TOTC-ის განვითარებას და სიახლეებს საგანმანათლებლო ტექნოლოგიებში',
  },
};

export const defaultMembershipContent = {
  header: {
    badgeText: 'შეუზღუდავი სწავლების პაკეტი',
    title: 'მარტივი, სრული წვდომის წევრობა',
    subtitle: 'გამოიწერეთ ერთხელ და გახსენით ყველა კურსი, ვიდეო გაკვეთილი და სერტიფიკატი მთელ TOTC პლატფორმაზე.',
    monthlyBillingText: 'ყოველთვიური გადახდა',
    annualBillingText: 'წლიური გადახდა',
    discountBadge: 'დაზოგე 25%',
    guaranteeText: '14-დღიანი თანხის დაბრუნების გარანტია. გაუქმება ნებისმიერ დროს.',
  },
  plans: [
    {
      id: 'free',
      planId: 'Free',
      name: 'უფასო სტარტერი',
      monthlyPrice: 0,
      annualMonthlyPrice: 0,
      annualFullPrice: 0,
      currency: '₾',
      periodText: 'უფასო სამუდამოდ',
      desc: 'იდეალურია დამწყები მსმენელებისთვის შესავალი ონლაინ გაკვეთილების გასაცნობად.',
      features: [
        'წვდომა უფასო შესავალ საჩვენებელ ლექციებზე',
        'სტანდარტული სასწავლო ფორუმები და დისკუსიები',
        'წვდომა მობილურიდან და კომპიუტერიდან',
        'შეზღუდული ტესტირებები (თვეში 3 ტესტი)',
      ],
      buttonText: 'მიმდინარე უფასო პაკეტი',
      buttonStyle: 'secondary',
      isPopular: false,
      isEnabled: true,
    },
    {
      id: 'pro',
      planId: 'Pro',
      name: 'სტუდენტური Pro სრული წვდომა',
      monthlyPrice: 65,
      annualMonthlyPrice: 49,
      annualFullPrice: 588,
      currency: '₾',
      periodText: '/ თვეში',
      desc: 'გახსენით შეუზღუდავი წვდომა ყველა კურსზე, ვორქშოპზე და სერტიფიკატზე.',
      features: [
        '✨ შეუზღუდავი მყისიერი წვდომა კატალოგის ყველა კურსზე',
        'პირდაპირი ვიდეო ჩართვები ინსტრუქტორებთან',
        'ავტომატური შეფასების და პროგრესის კონტროლი',
        'ინდივიდუალური პრივატული კონსულტაციები',
        'ოფიციალური ვერიფიცირებული სერტიფიკატები',
        'ოფლაინ მასალებისა და კოდის ფაილების ჩამოტვირთვა',
      ],
      buttonText: 'Pro სრული წვდომის გააქტიურება',
      buttonStyle: 'primary',
      isPopular: true,
      isEnabled: true,
    },
    {
      id: 'enterprise',
      planId: 'Enterprise',
      name: 'ორგანიზაცია / კამპუსი',
      monthlyPrice: 279,
      annualMonthlyPrice: 229,
      annualFullPrice: 2748,
      currency: '₾',
      periodText: '/ მომხმარებელი / თვეში',
      desc: 'შექმნილია სკოლებისთვის, უნივერსიტეტებისა და კორპორატიული აკადემიებისთვის.',
      features: [
        'სრული Zoom API და LMS ინტეგრაცია (Canvas, Blackboard)',
        'შეუზღუდავი სტუდენტური სიები და დასწრების აღრიცხვა',
        'ადმინისტრაციული ანალიტიკის პანელი',
        'ორგანიზაციის ბრენდირება და ქვედომენი',
        '24/7 პრიორიტეტული მხარდაჭერა და დანერგვის მენეჯერი',
      ],
      buttonText: 'კორპორატიული პაკეტის გააქტიურება',
      buttonStyle: 'dark',
      isPopular: false,
      isEnabled: true,
    },
  ],
};

const defaultSettings = {
  logoUrl: '',
  siteName: 'TOTC',
  heroTitle: 'ისწავლეთ ონლაინ შეუზღუდავად',
  heroSubtitle: 'თანამედროვე საგანმანათლებლო პლატფორმა პროფესიონალური კურსებით, სერტიფიკატებითა და ინტერაქტიული ლექციებით.',
  contactEmail: 'support@totc.edu.ge',
  contactPhone: '+995 32 200 00 00',
  footerText: 'ვირტუალური საკლასო ოთახი და ონლაინ განათლების სისტემა',
  homeContent: defaultHomeContent,
  membershipContent: defaultMembershipContent,
};

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => {},
  updateHomeContent: async () => {},
  updateMembershipContent: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.settings.get();
      if (data) {
        let parsedHome = defaultHomeContent;
        if (data.homeContentJson) {
          try {
            const parsed = JSON.parse(data.homeContentJson);
            parsedHome = {
              hero: { ...defaultHomeContent.hero, ...(parsed.hero || {}) },
              stats: { ...defaultHomeContent.stats, ...(parsed.stats || {}) },
              cloudSoftware: { ...defaultHomeContent.cloudSoftware, ...(parsed.cloudSoftware || {}) },
              whatIsTotc: { ...defaultHomeContent.whatIsTotc, ...(parsed.whatIsTotc || {}) },
              classroom: { ...defaultHomeContent.classroom, ...(parsed.classroom || {}) },
              features: { ...defaultHomeContent.features, ...(parsed.features || {}) },
              testimonials: { ...defaultHomeContent.testimonials, ...(parsed.testimonials || {}) },
              news: { ...defaultHomeContent.news, ...(parsed.news || {}) },
            };
          } catch (e) {
            console.warn('Could not parse homeContentJson:', e.message);
          }
        }

        let parsedMembership = defaultMembershipContent;
        if (data.membershipContentJson) {
          try {
            const parsedMem = JSON.parse(data.membershipContentJson);
            parsedMembership = {
              header: { ...defaultMembershipContent.header, ...(parsedMem.header || {}) },
              plans: Array.isArray(parsedMem.plans) && parsedMem.plans.length > 0 
                ? parsedMem.plans 
                : defaultMembershipContent.plans,
            };
          } catch (e) {
            console.warn('Could not parse membershipContentJson:', e.message);
          }
        }

        setSettings({
          logoUrl: data.logoUrl || '',
          siteName: data.siteName || 'TOTC',
          heroTitle: data.heroTitle || defaultSettings.heroTitle,
          heroSubtitle: data.heroSubtitle || defaultSettings.heroSubtitle,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          contactPhone: data.contactPhone || defaultSettings.contactPhone,
          footerText: data.footerText || defaultSettings.footerText,
          homeContent: parsedHome,
          membershipContent: parsedMembership,
        });
      }
    } catch (err) {
      console.warn('Could not load site settings from API, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newData) => {
    const payload = { ...newData };
    if (payload.homeContent) {
      payload.homeContentJson = JSON.stringify(payload.homeContent);
      delete payload.homeContent;
    }
    if (payload.membershipContent) {
      payload.membershipContentJson = JSON.stringify(payload.membershipContent);
      delete payload.membershipContent;
    }
    const updated = await api.settings.update(payload);
    await fetchSettings();
    return updated;
  };

  const updateHomeContent = async (newHomeContent) => {
    const updated = await api.settings.update({
      homeContentJson: JSON.stringify(newHomeContent),
    });
    await fetchSettings();
    return updated;
  };

  const updateMembershipContent = async (newMembershipContent) => {
    const updated = await api.settings.update({
      membershipContentJson: JSON.stringify(newMembershipContent),
    });
    await fetchSettings();
    return updated;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
        updateHomeContent,
        updateMembershipContent,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

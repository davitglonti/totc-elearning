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

const defaultSettings = {
  logoUrl: '',
  siteName: 'TOTC',
  heroTitle: 'ისწავლეთ ონლაინ შეუზღუდავად',
  heroSubtitle: 'თანამედროვე საგანმანათლებლო პლატფორმა პროფესიონალური კურსებით, სერტიფიკატებითა და ინტერაქტიული ლექციებით.',
  contactEmail: 'support@totc.edu.ge',
  contactPhone: '+995 32 200 00 00',
  footerText: 'ვირტუალური საკლასო ოთახი და ონლაინ განათლების სისტემა',
  homeContent: defaultHomeContent,
};

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => {},
  updateHomeContent: async () => {},
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

        setSettings({
          logoUrl: data.logoUrl || '',
          siteName: data.siteName || 'TOTC',
          heroTitle: data.heroTitle || defaultSettings.heroTitle,
          heroSubtitle: data.heroSubtitle || defaultSettings.heroSubtitle,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          contactPhone: data.contactPhone || defaultSettings.contactPhone,
          footerText: data.footerText || defaultSettings.footerText,
          homeContent: parsedHome,
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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
        updateHomeContent,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

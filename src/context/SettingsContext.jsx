import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const defaultSettings = {
  logoUrl: '',
  siteName: 'TOTC',
  heroTitle: 'ისწავლეთ ონლაინ შეუზღუდავად',
  heroSubtitle: 'თანამედროვე საგანმანათლებლო პლატფორმა პროფესიონალური კურსებით, სერტიფიკატებითა და ინტერაქტიული ლექციებით.',
  contactEmail: 'support@totc.edu.ge',
  contactPhone: '+995 32 200 00 00',
  footerText: 'ვირტუალური საკლასო ოთახი და ონლაინ განათლების სისტემა',
};

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.settings.get();
      if (data) {
        setSettings({
          logoUrl: data.logoUrl || '',
          siteName: data.siteName || 'TOTC',
          heroTitle: data.heroTitle || defaultSettings.heroTitle,
          heroSubtitle: data.heroSubtitle || defaultSettings.heroSubtitle,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          contactPhone: data.contactPhone || defaultSettings.contactPhone,
          footerText: data.footerText || defaultSettings.footerText,
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
    const updated = await api.settings.update(newData);
    if (updated) {
      setSettings(prev => ({
        ...prev,
        ...updated,
      }));
    }
    return updated;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

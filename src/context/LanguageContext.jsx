import React, { createContext, useContext, useState, useEffect } from 'react';
import { UI_DICTIONARY, SUPPORTED_LANGUAGES, translateContent } from '../utils/translations.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('mka_preferred_language') || 'English';
  });

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('mka_preferred_language', langCode);
  };

  const t = (key) => {
    const dict = UI_DICTIONARY[currentLanguage] || UI_DICTIONARY['English'];
    return dict[key] || UI_DICTIONARY['English'][key] || key;
  };

  const translateText = (text) => {
    return translateContent(text, currentLanguage);
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      translateText,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

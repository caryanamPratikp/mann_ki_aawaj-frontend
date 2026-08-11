import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UI_DICTIONARY, SUPPORTED_LANGUAGES } from '../utils/translations.js';
import { apiTranslationService } from '../services/apiTranslationService.js';
import { apiProfileService } from '../services/apiProfileService.js';
import { apiUserService } from '../services/apiUserService.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const queryClient = useQueryClient();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('mka_preferred_language') || 'EN';
  });

  const [translationCache, setTranslationCache] = useState({});

  // Sync language with backend user profile on load if available
  useEffect(() => {
    const syncProfileLanguage = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token && !token.startsWith('mock')) {
          const profileRes = await apiProfileService.getMyProfile();
          if (profileRes?.data?.preferredLanguage) {
            const backendLang = profileRes.data.preferredLanguage;
            setCurrentLanguage(backendLang);
            localStorage.setItem('mka_preferred_language', backendLang);
          }
        }
      } catch (err) {
        console.warn('Could not sync user preferred language from DB profile:', err?.message || err);
      }
    };
    syncProfileLanguage();
  }, []);

  const changeLanguage = async (langCode) => {
    if (!langCode || langCode === currentLanguage) return;

    setCurrentLanguage(langCode);
    localStorage.setItem('mka_preferred_language', langCode);

    try {
      const token = localStorage.getItem('auth_token');
      if (token && !token.startsWith('mock')) {
        await apiUserService.updateLanguage(langCode);
      }
    } catch (err) {
      console.warn('[LanguageContext] Database preferred_language update warning:', err?.message || err);
    } finally {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return ['posts', 'comments', 'notifications', 'profile', 'savedPosts', 'chatMessages', 'myPosts'].includes(key);
        },
      });
    }
  };

  const t = (key) => {
    const dict = UI_DICTIONARY[currentLanguage] || UI_DICTIONARY['English'];
    return dict[key] || UI_DICTIONARY['English'][key] || key;
  };

  /**
   * Async translation method invoking Spring Boot / OpenAI Translation Service.
   */
  const translateTextAsync = async (text, targetLang = currentLanguage) => {
    if (!text || !text.trim() || targetLang === 'English') return text;
    const cacheKey = `${targetLang}_${text.trim()}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    const result = await apiTranslationService.translateText(text, targetLang);
    setTranslationCache(prev => ({ ...prev, [cacheKey]: result }));
    return result;
  };

  /**
   * Synchronous translation getter with fallback for instant UI render.
   */
  const translateText = (text, targetLang = currentLanguage) => {
    if (!text || !text.trim() || targetLang === 'English') return text;
    const cacheKey = `${targetLang}_${text.trim()}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    // Trigger async fetch in background to populate cache
    translateTextAsync(text, targetLang);
    return text;
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      translateText,
      translateTextAsync,
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

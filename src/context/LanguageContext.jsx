import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UI_DICTIONARY, SUPPORTED_LANGUAGES } from '../utils/translations.js';
import { apiTranslationService } from '../services/apiTranslationService.js';
import { apiProfileService } from '../services/apiProfileService.js';
import { apiUserService } from '../services/apiUserService.js';

const LanguageContext = createContext(null);

/**
 * Batch-translate all English UI dictionary keys into targetLang via OpenAI API.
 * Returns an object like { home: 'ઘર', explore: 'શોધખોળ', ... }
 */
async function batchTranslateUI(targetLang) {
  const englishDict = UI_DICTIONARY['English'];
  if (!englishDict) return {};

  const keys = Object.keys(englishDict);
  const values = Object.values(englishDict);

  // Build one big payload: key=value lines, translate as a single block
  const payload = values.join('\n|||MKA_SEP|||\n');

  try {
    const translated = await apiTranslationService.translateText(payload, targetLang, 'EN');
    if (!translated) return {};

    const parts = translated.split(/\|\|\|MKA_SEP\|\|\|/).map(s => s.trim());

    const result = {};
    keys.forEach((key, idx) => {
      result[key] = parts[idx] || englishDict[key];
    });
    return result;
  } catch (err) {
    console.warn('[LanguageContext] Batch UI translation failed, falling back to individual:', err?.message);
    // Fallback: translate each key individually (slower but more reliable)
    const result = {};
    const promises = keys.map(async (key) => {
      try {
        const val = await apiTranslationService.translateText(englishDict[key], targetLang, 'EN');
        result[key] = val || englishDict[key];
      } catch {
        result[key] = englishDict[key];
      }
    });
    await Promise.all(promises);
    return result;
  }
}

export function LanguageProvider({ children }) {
  const queryClient = useQueryClient();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('mka_preferred_language') || 'EN';
  });

  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Dynamic UI translations for languages without hardcoded dictionaries
  const [dynamicUI, setDynamicUI] = useState(() => {
    // Try to restore from sessionStorage for faster re-renders
    try {
      const cached = localStorage.getItem('mka_dynamic_ui');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  // Check if current language has a complete hardcoded dictionary
  const hasHardcodedDict = useCallback((langCode) => {
    const dict = UI_DICTIONARY[langCode];
    if (!dict) return false;
    // Check if it has at least the essential keys
    const essentialKeys = ['home', 'latest', 'topicsStream', 'noThoughtsFound', 'personalSpace'];
    return essentialKeys.every(k => !!dict[k]);
  }, []);

  // Translate UI for languages without hardcoded dictionaries
  const translateUIForLanguage = useCallback(async (langCode) => {
    if (langCode === 'EN' || langCode === 'English') return; // English is the source
    if (hasHardcodedDict(langCode)) return; // Already has hardcoded translations

    // Check if we already have a dynamic translation cached for this lang
    if (dynamicUI._lang === langCode && Object.keys(dynamicUI).length > 2) return;

    console.log(`[LanguageContext] Translating UI dynamically for: ${langCode}`);
    try {
      const translated = await batchTranslateUI(langCode);
      translated._lang = langCode; // Tag which lang this translation is for
      setDynamicUI(translated);
      // Persist in storage for faster subsequent loads
      try {
        localStorage.setItem('mka_dynamic_ui', JSON.stringify(translated));
      } catch {}
    } catch (err) {
      console.warn('[LanguageContext] Dynamic UI translation failed:', err?.message);
    }
  }, [hasHardcodedDict, dynamicUI]);

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

  // When language changes or on mount, translate UI if needed
  useEffect(() => {
    if (currentLanguage && currentLanguage !== 'EN' && currentLanguage !== 'English') {
      translateUIForLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  const changeLanguage = async (langCode) => {
    if (!langCode || langCode === currentLanguage) return;

    setIsTranslating(true);
    setCurrentLanguage(langCode);
    localStorage.setItem('mka_preferred_language', langCode);

    try {
      const token = localStorage.getItem('auth_token');
      if (token && !token.startsWith('mock')) {
        await apiUserService.updateLanguage(langCode);
      }
    } catch (err) {
      console.warn('[LanguageContext] Database preferred_language update warning:', err?.message || err);
    }

    // If language doesn't have hardcoded dict, do dynamic translation first
    if (!hasHardcodedDict(langCode) && langCode !== 'EN' && langCode !== 'English') {
      try {
        const translated = await batchTranslateUI(langCode);
        translated._lang = langCode;
        setDynamicUI(translated);
        try {
          localStorage.setItem('mka_dynamic_ui', JSON.stringify(translated));
        } catch {}
      } catch (err) {
        console.warn('[LanguageContext] Dynamic UI translation during change failed:', err?.message);
      }
    }

    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return ['posts', 'comments', 'notifications', 'profile', 'savedPosts', 'chatMessages', 'myPosts'].includes(key);
      },
    });
    // Delay disabling overlay slightly so translation queries have time to fire and paint
    setTimeout(() => {
      setIsTranslating(false);
    }, 900);
  };

  const t = (key, defaultText) => {
    // 1. Check hardcoded dictionary for the current language
    const dict = UI_DICTIONARY[currentLanguage];
    if (dict && dict[key]) return dict[key];

    // 2. Check dynamic AI-translated dictionary
    if (dynamicUI._lang === currentLanguage && dynamicUI[key]) {
      return dynamicUI[key];
    }

    // 3. Fallback to English dictionary or provided defaultText or key
    return UI_DICTIONARY['English']?.[key] || defaultText || key;
  };

  /**
   * Async translation method invoking Spring Boot / OpenAI Translation Service.
   */
  const translateTextAsync = async (text, targetLang = currentLanguage, sourceLang = null) => {
    if (!text || !text.trim()) return text;
    const cacheKey = `${sourceLang || 'AUTO'}_${targetLang}_${text.trim()}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    const result = await apiTranslationService.translateText(text, targetLang, sourceLang);
    setTranslationCache(prev => ({ ...prev, [cacheKey]: result }));
    return result;
  };

  /**
   * Synchronous translation getter with fallback for instant UI render.
   */
  const translateText = (text, targetLang = currentLanguage, sourceLang = null) => {
    if (!text || !text.trim()) return text;
    const cacheKey = `${sourceLang || 'AUTO'}_${targetLang}_${text.trim()}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    // Trigger async fetch in background to populate cache
    translateTextAsync(text, targetLang, sourceLang);
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
      isTranslating,
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

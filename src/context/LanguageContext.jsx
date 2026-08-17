import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UI_DICTIONARY, SUPPORTED_LANGUAGES } from '../utils/translations.js';
import { apiTranslationService } from '../services/apiTranslationService.js';
import { apiProfileService } from '../services/apiProfileService.js';
import { apiUserService } from '../services/apiUserService.js';

const LanguageContext = createContext(null);

// In-flight request deduplication map to prevent API call storms
const pendingTranslations = new Map();

export function normalizeLanguage(lang) {
  if (!lang) return 'English';
  const found = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === lang.toLowerCase() || l.label.toLowerCase() === lang.toLowerCase()
  );
  return found ? found.label : lang;
}

/**
 * Batch-translate all English UI dictionary keys into targetLang via OpenAI API.
 */
async function batchTranslateUI(targetLang) {
  const englishDict = UI_DICTIONARY['English'];
  if (!englishDict) return {};

  const normTarget = normalizeLanguage(targetLang);
  if (normTarget === 'English') return {};

  const keys = Object.keys(englishDict);
  const values = Object.values(englishDict);
  const payload = values.join('\n|||MKA_SEP|||\n');

  try {
    const translated = await apiTranslationService.translateText(payload, normTarget, 'EN');
    if (!translated) return {};

    const parts = translated.split(/\|\|\|MKA_SEP\|\|\|/).map(s => s.trim());

    const result = {};
    keys.forEach((key, idx) => {
      result[key] = parts[idx] || englishDict[key];
    });
    return result;
  } catch (err) {
    console.warn('[LanguageContext] Batch UI translation warning:', err?.message);
    return {};
  }
}

export function LanguageProvider({ children }) {
  const queryClient = useQueryClient();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('mka_preferred_language') || 'EN';
    return normalizeLanguage(saved);
  });

  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const [dynamicUI, setDynamicUI] = useState(() => {
    try {
      const cached = localStorage.getItem('mka_dynamic_ui');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const hasHardcodedDict = useCallback((langCode) => {
    const norm = normalizeLanguage(langCode);
    const dict = UI_DICTIONARY[norm] || UI_DICTIONARY[langCode];
    if (!dict) return false;
    const essentialKeys = ['home', 'latest', 'topicsStream', 'noThoughtsFound', 'personalSpace'];
    return essentialKeys.every(k => !!dict[k]);
  }, []);

  const translateUIForLanguage = useCallback(async (langCode) => {
    const norm = normalizeLanguage(langCode);
    if (norm === 'English' || langCode === 'EN') return;
    if (hasHardcodedDict(norm)) return;

    if (dynamicUI._lang === norm && Object.keys(dynamicUI).length > 2) return;

    try {
      const translated = await batchTranslateUI(norm);
      translated._lang = norm;
      setDynamicUI(translated);
      try {
        localStorage.setItem('mka_dynamic_ui', JSON.stringify(translated));
      } catch {}
    } catch (err) {
      console.warn('[LanguageContext] Dynamic UI translation warning:', err?.message);
    }
  }, [hasHardcodedDict, dynamicUI]);

  // Sync language with backend user profile on load & after login
  useEffect(() => {
    const syncProfileLanguage = async () => {
      try {
        if (window.location.pathname.startsWith('/admin')) {
          return;
        }
        const token = localStorage.getItem('auth_token');
        if (token && !token.startsWith('mock')) {
          const profileRes = await apiProfileService.getMyProfile();
          if (profileRes?.data?.preferredLanguage) {
            const rawLang = profileRes.data.preferredLanguage;
            const normalized = normalizeLanguage(rawLang);

            setCurrentLanguage(normalized);
            localStorage.setItem('mka_preferred_language', normalized);

            if (!hasHardcodedDict(normalized) && normalized !== 'English') {
              batchTranslateUI(normalized).then((translated) => {
                translated._lang = normalized;
                setDynamicUI(translated);
                try {
                  localStorage.setItem('mka_dynamic_ui', JSON.stringify(translated));
                } catch {}
              });
            }

            await queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0];
                return ['posts', 'comments', 'notifications', 'profile', 'savedPosts', 'chatMessages', 'myPosts'].includes(key);
              },
            });
          }
        }
      } catch (err) {
        // Silently swallow sync failures
      }
    };
    syncProfileLanguage();
  }, [queryClient, hasHardcodedDict]);

  useEffect(() => {
    const norm = normalizeLanguage(currentLanguage);
    if (norm && norm !== 'English') {
      translateUIForLanguage(norm);
    }
  }, [currentLanguage, translateUIForLanguage]);

  const changeLanguage = async (langCode) => {
    if (!langCode) return;
    const normalized = normalizeLanguage(langCode);

    setIsTranslating(true);
    setCurrentLanguage(normalized);
    localStorage.setItem('mka_preferred_language', normalized);

    try {
      const token = localStorage.getItem('auth_token');
      if (token && !token.startsWith('mock')) {
        await apiUserService.updateLanguage(normalized);
      }
    } catch (err) {
      console.warn('[LanguageContext] Preferred language update warning:', err?.message || err);
    }

    if (!hasHardcodedDict(normalized) && normalized !== 'English') {
      try {
        const translated = await batchTranslateUI(normalized);
        translated._lang = normalized;
        setDynamicUI(translated);
        try {
          localStorage.setItem('mka_dynamic_ui', JSON.stringify(translated));
        } catch {}
      } catch (err) {
        console.warn('[LanguageContext] Dynamic UI translation warning:', err?.message);
      }
    }

    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return ['posts', 'comments', 'notifications', 'profile', 'savedPosts', 'chatMessages', 'myPosts'].includes(key);
      },
    });

    setTimeout(() => {
      setIsTranslating(false);
    }, 800);
  };

  const t = useCallback((key, defaultText) => {
    const norm = normalizeLanguage(currentLanguage);

    const dict = UI_DICTIONARY[norm] || UI_DICTIONARY[currentLanguage];
    if (dict && dict[key]) return dict[key];

    if ((dynamicUI._lang === norm || dynamicUI._lang === currentLanguage) && dynamicUI[key]) {
      return dynamicUI[key];
    }

    return UI_DICTIONARY['English']?.[key] || defaultText || key;
  }, [currentLanguage, dynamicUI]);

  const translateTextAsync = async (text, targetLang = currentLanguage, sourceLang = null) => {
    if (!text || !text.trim()) return text;
    const normTarget = normalizeLanguage(targetLang);
    if (normTarget === 'English' || normTarget === 'EN') return text;

    const cacheKey = `${sourceLang || 'AUTO'}_${normTarget}_${text.trim()}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    if (pendingTranslations.has(cacheKey)) {
      return pendingTranslations.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const result = await apiTranslationService.translateText(text, normTarget, sourceLang);
        const finalVal = result || text;
        setTranslationCache(prev => ({ ...prev, [cacheKey]: finalVal }));
        return finalVal;
      } catch (err) {
        return text;
      } finally {
        pendingTranslations.delete(cacheKey);
      }
    })();

    pendingTranslations.set(cacheKey, promise);
    return promise;
  };

  const translateText = useCallback((text, targetLang = currentLanguage, sourceLang = null) => {
    if (!text || !text.trim()) return text;
    const normTarget = normalizeLanguage(targetLang);
    if (normTarget === 'English' || normTarget === 'EN') return text;

    const cacheKey = `${sourceLang || 'AUTO'}_${normTarget}_${text.trim()}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    return text;
  }, [currentLanguage, translationCache]);

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

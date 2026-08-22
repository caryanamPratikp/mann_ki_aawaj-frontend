import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UI_DICTIONARY, SUPPORTED_LANGUAGES } from '../utils/translations.js';
import { apiTranslationService, normalizeLanguageCode } from '../services/apiTranslationService.js';
import { apiProfileService } from '../services/apiProfileService.js';
import { apiUserService } from '../services/apiUserService.js';

const LanguageContext = createContext(null);

// In-flight request deduplication map to prevent API call storms
const pendingTranslations = new Map();

/**
 * Returns standard 2-letter uppercase ISO code (e.g. 'EN', 'HI', 'BN')
 */
export function getLanguageCode(lang) {
  if (!lang) return 'EN';
  const code = normalizeLanguageCode(lang);
  return code || 'EN';
}

/**
 * Returns full display label (e.g. 'English', 'Hindi', 'Bengali')
 */
export function normalizeLanguage(lang) {
  if (!lang) return 'English';
  const code = getLanguageCode(lang);
  const found = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toUpperCase() === code.toUpperCase()
  );
  return found ? found.label : lang;
}

export function resolveBrowserOrFallbackLanguage() {
  try {
    const saved = localStorage.getItem('mka_preferred_language');
    if (saved) {
      return normalizeLanguage(saved);
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      const navLang = navigator.language.split('-')[0].toLowerCase();
      const found = SUPPORTED_LANGUAGES.find(
        (l) => l.code.toLowerCase() === navLang || l.label.toLowerCase().startsWith(navLang)
      );
      if (found) {
        return found.label;
      }
    }
  } catch (e) {}
  return 'English';
}

/**
 * Batch-translate all English UI dictionary keys into targetLang via OpenAI API.
 * Chunks keys into batches of ~15 keys to prevent API timeouts.
 */
async function batchTranslateUI(targetLang) {
  const englishDict = UI_DICTIONARY['English'];
  if (!englishDict) return {};

  const normTarget = normalizeLanguage(targetLang);
  if (normTarget === 'English') return {};

  const entries = Object.entries(englishDict);
  const CHUNK_SIZE = 10;
  const result = {};
  const isoCode = getLanguageCode(normTarget);

  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    const chunkPromises = chunk.map(async ([key, englishVal]) => {
      try {
        const trans = await apiTranslationService.translateText(englishVal, isoCode, 'EN');
        return [key, trans || englishVal];
      } catch {
        return [key, englishVal];
      }
    });

    const resolved = await Promise.all(chunkPromises);
    resolved.forEach(([k, v]) => {
      result[k] = v;
    });
  }

  return result;
}

export function LanguageProvider({ children }) {
  const queryClient = useQueryClient();
  const [isResolvingLanguage, setIsResolvingLanguage] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return resolveBrowserOrFallbackLanguage();
  });

  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const [dynamicUI, setDynamicUI] = useState(() => {
    try {
      const cached = localStorage.getItem('mka_dynamic_ui');
      if (cached && cached.includes('MKA_SEP')) {
        localStorage.removeItem('mka_dynamic_ui');
        return {};
      }
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
    if (norm === 'English' || langCode === 'EN') {
      setDynamicUI({});
      try { localStorage.removeItem('mka_dynamic_ui'); } catch {}
      return;
    }
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

  // Sync language with backend user profile on load & when logging in as different user
  useEffect(() => {
    const syncProfileLanguage = async () => {
      try {
        if (window.location.pathname.startsWith('/admin')) {
          setIsResolvingLanguage(false);
          return;
        }
        const token = localStorage.getItem('auth_token');

        if (token && !token.startsWith('mock')) {
          // Fetch logged-in user profile from DB to get their specific preferredLanguage
          const profileRes = await apiProfileService.getMyProfile().catch(() => null);
          const rawLang = profileRes?.data?.preferredLanguage || localStorage.getItem('mka_preferred_language');

          if (rawLang) {
            const normalized = normalizeLanguage(rawLang);
            const isoCode = getLanguageCode(normalized);

            setCurrentLanguage(normalized);
            localStorage.setItem('mka_preferred_language', normalized);

            // Sync valid ISO code with backend (/api/users/language)
            await apiUserService.updateLanguage(isoCode).catch(() => {});

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
                return ['comments', 'notifications', 'profile', 'chatMessages'].includes(key);
              },
            });
          }
        }
      } catch (err) {
        // Silently handle sync failure
      } finally {
        setIsResolvingLanguage(false);
      }
    };
    syncProfileLanguage();
  }, [queryClient, hasHardcodedDict]);

  // Listen for login / account language change events
  useEffect(() => {
    const handleCustomLangChange = (e) => {
      if (e.detail) {
        const norm = normalizeLanguage(e.detail);
        setCurrentLanguage(norm);
        localStorage.setItem('mka_preferred_language', norm);
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    };
    window.addEventListener('mka_language_changed', handleCustomLangChange);
    return () => window.removeEventListener('mka_language_changed', handleCustomLangChange);
  }, [queryClient]);

  useEffect(() => {
    const norm = normalizeLanguage(currentLanguage);
    if (norm && norm !== 'English') {
      translateUIForLanguage(norm);
    }
  }, [currentLanguage, translateUIForLanguage]);

  const changeLanguage = async (langCode) => {
    if (!langCode) return;
    const normalized = normalizeLanguage(langCode);
    const isoCode = getLanguageCode(normalized);

    setIsTranslating(true);
    setCurrentLanguage(normalized);
    setTranslationCache({});
    localStorage.setItem('mka_preferred_language', normalized);

    try {
      const token = localStorage.getItem('auth_token');
      if (token && !token.startsWith('mock')) {
        // Send valid 2-letter uppercase ISO code (e.g. 'EN', 'HI') to backend /api/users/language
        await apiUserService.updateLanguage(isoCode);
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
    } else if (normalized === 'English') {
      setDynamicUI({});
      try { localStorage.removeItem('mka_dynamic_ui'); } catch {}
    }

    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return ['comments', 'notifications', 'profile', 'chatMessages'].includes(key);
      },
    });

    setTimeout(() => {
      setIsTranslating(false);
    }, 600);
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
    const isoTarget = getLanguageCode(normTarget);
    const isoSource = sourceLang ? getLanguageCode(sourceLang) : null;

    if (normTarget === 'English' && (!sourceLang || getLanguageCode(sourceLang) === 'EN')) {
      const hasNonEnglishScript = /[\u0900-\u0D7F\u0600-\u06FF]/.test(text);
      if (!hasNonEnglishScript) {
        return text;
      }
    }

    const cacheKey = `${isoSource || 'AUTO'}_${isoTarget}_${text.trim()}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    if (pendingTranslations.has(cacheKey)) {
      return pendingTranslations.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const result = await apiTranslationService.translateText(text, isoTarget, isoSource);
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
    const isoTarget = getLanguageCode(normTarget);
    const isoSource = sourceLang ? getLanguageCode(sourceLang) : null;

    const cacheKey = `${isoSource || 'AUTO'}_${isoTarget}_${text.trim()}`;
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
      isResolvingLanguage,
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

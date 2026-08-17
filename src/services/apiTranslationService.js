import { apiClient } from './apiClient.js';

// Mapping UI language names, 2-letter ISO codes, and FLORES-200 codes to standard ISO codes
export const LANGUAGE_MAP = {
  // 2-Letter ISO Codes
  EN: 'EN',
  HI: 'HI',
  MR: 'MR',
  PA: 'PA',
  TA: 'TA',
  TE: 'TE',
  GU: 'GU',
  BN: 'BN',
  KN: 'KN',
  ML: 'ML',
  OR: 'OR',
  AS: 'AS',
  UR: 'UR',

  // Full Display Names
  English: 'EN',
  Hindi: 'HI',
  Marathi: 'MR',
  Punjabi: 'PA',
  Tamil: 'TA',
  Telugu: 'TE',
  Gujarati: 'GU',
  Bengali: 'BN',
  Kannada: 'KN',
  Malayalam: 'ML',
  Odia: 'OR',
  Assamese: 'AS',
  Urdu: 'UR',

  // FLORES-200 Codes
  eng_Latn: 'EN',
  hin_Deva: 'HI',
  mar_Deva: 'MR',
  pan_Guru: 'PA',
  tam_Taml: 'TA',
  tel_Telu: 'TE',
  guj_Gujr: 'GU',
  ben_Beng: 'BN',
  kan_Knda: 'KN',
  mal_Mlym: 'ML',
  ory_Orya: 'OR',
  asm_Beng: 'AS',
  urd_Arab: 'UR',
};

export const normalizeLanguageCode = (lang) => {
  if (!lang || typeof lang !== 'string') return null;
  const trimmed = lang.trim();
  if (LANGUAGE_MAP[trimmed]) return LANGUAGE_MAP[trimmed];
  const upper = trimmed.toUpperCase();
  if (LANGUAGE_MAP[upper]) return LANGUAGE_MAP[upper];
  return upper;
};

export const detectTextLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'EN';

  // Devanagari script (Hindi / Marathi)
  if (/[\u0900-\u097F]/.test(text)) return 'HI';
  // Bengali / Assamese script
  if (/[\u0980-\u09FF]/.test(text)) return 'BN';
  // Gurmukhi script (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'PA';
  // Gujarati script
  if (/[\u0A80-\u0AFF]/.test(text)) return 'GU';
  // Odia script
  if (/[\u0B00-\u0B7F]/.test(text)) return 'OR';
  // Tamil script
  if (/[\u0B80-\u0BFF]/.test(text)) return 'TA';
  // Telugu script
  if (/[\u0C00-\u0C7F]/.test(text)) return 'TE';
  // Kannada script
  if (/[\u0C80-\u0CFF]/.test(text)) return 'KN';
  // Malayalam script
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ML';
  // Arabic / Urdu script
  if (/[\u0600-\u06FF]/.test(text)) return 'UR';

  return 'EN';
};

const translationCache = new Map();

export const apiTranslationService = {
  async translateText(text, targetLang, sourceLang = null) {
    if (!text || !text.trim()) {
      return text;
    }

    const tgtCode = normalizeLanguageCode(targetLang) || 'EN';
    let srcCode = normalizeLanguageCode(sourceLang);

    if (!srcCode && sourceLang !== 'auto') {
      srcCode = detectTextLanguage(text);
    }

    // If source and target language are identical and not English target, return original
    if (srcCode && srcCode === tgtCode && tgtCode !== 'EN') {
      return text;
    }

    const cacheKey = `${srcCode || 'auto'}_${tgtCode}_${text.trim()}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      const response = await apiClient.post('/api/v1/translation/translate', {
        text: text.trim(),
        sourceLanguage: 'auto',
        targetLanguage: tgtCode,
      });

      if (response.data && response.data.translatedText) {
        const result = response.data.translatedText;
        translationCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('Backend translation service warning:', err?.message || err);
    }

    return text;
  },
};

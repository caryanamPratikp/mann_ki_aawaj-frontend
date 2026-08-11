import { apiClient } from './apiClient.js';

// Mapping UI language names to FLORES-200 / standard language codes
export const LANGUAGE_MAP = {
  English: 'eng_Latn',
  Hindi: 'hin_Deva',
  Marathi: 'mar_Deva',
  Urdu: 'urd_Arab',
  Punjabi: 'pan_Guru',
  Tamil: 'tam_Taml',
  Telugu: 'tel_Telu',
  Gujarati: 'guj_Gujr',
  Bengali: 'ben_Beng',
  Kannada: 'kan_Knda',
  Malayalam: 'mal_Mlym',
  Odia: 'ory_Orya',
  Assamese: 'asm_Beng',
};

// In-memory cache for client-side translation results
const translationCache = new Map();

export const apiTranslationService = {
  /**
   * Translates content dynamically via Spring Boot Backend (OpenAI Engine).
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language (e.g. 'Hindi', 'hin_Deva', 'Marathi')
   * @param {string} sourceLang - Source language (default: 'eng_Latn')
   * @returns {Promise<string>} Translated text string
   */
  async translateText(text, targetLang, sourceLang = 'eng_Latn') {
    if (!text || !text.trim() || targetLang === 'English') {
      return text;
    }

    const tgtCode = LANGUAGE_MAP[targetLang] || targetLang;
    const srcCode = LANGUAGE_MAP[sourceLang] || sourceLang;
    const cacheKey = `${srcCode}_${tgtCode}_${text.trim()}`;

    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    // Call Spring Boot Backend Endpoint (/api/v1/translation/translate)
    try {
      const response = await apiClient.post('/api/v1/translation/translate', {
        text: text.trim(),
        sourceLanguage: srcCode,
        targetLanguage: tgtCode,
      });

      if (response.data && response.data.translatedText) {
        const result = response.data.translatedText;
        translationCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('Backend translation service unavailable:', err?.message || err);
    }

    // Fallback: Return original text if service is unreachable
    return text;
  }
};

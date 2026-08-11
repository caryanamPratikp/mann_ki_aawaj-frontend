import { apiClient } from './apiClient.js';

// Mapping UI language names to FLORES-200 / standard language codes
export const LANGUAGE_MAP = {
  English: 'English',
  EN: 'English',
  Hindi: 'Hindi',
  HI: 'Hindi',
  Marathi: 'Marathi',
  MR: 'Marathi',
  Urdu: 'Urdu',
  UR: 'Urdu',
  Punjabi: 'Punjabi',
  PA: 'Punjabi',
  Tamil: 'Tamil',
  TA: 'Tamil',
  Telugu: 'Telugu',
  TE: 'Telugu',
  Gujarati: 'Gujarati',
  GU: 'Gujarati',
  Bengali: 'Bengali',
  BN: 'Bengali',
  Kannada: 'Kannada',
  KN: 'Kannada',
  Malayalam: 'Malayalam',
  ML: 'Malayalam',
  Odia: 'Odia',
  OR: 'Odia',
  Assamese: 'Assamese',
  AS: 'Assamese',
};

// In-memory cache for client-side translation results
const translationCache = new Map();

export const apiTranslationService = {
  /**
   * Translates content dynamically via Spring Boot Backend (OpenAI Engine).
   * Backend performs automatic source-language detection via OpenAI.
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language (e.g. 'Hindi', 'HI', 'Marathi', 'KN')
   * @param {string} sourceLang - Source language hint (default: 'auto' for backend detection)
   * @returns {Promise<string>} Translated text string
   */
  async translateText(text, targetLang, sourceLang = 'auto') {
    // Only skip genuinely empty/null/blank text
    if (!text || !text.trim()) {
      return text;
    }

    const tgtCode = LANGUAGE_MAP[targetLang] || targetLang;

    // Cache key: target language + text only (source is auto-detected by backend)
    const cacheKey = `${tgtCode}_${text.trim()}`;

    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    const srcSent = sourceLang === 'auto' ? 'auto' : (LANGUAGE_MAP[sourceLang] || sourceLang);

    console.log('[MKA TRANSLATION DEBUG]', {
      'Input text': text.trim(),
      'Target language': tgtCode,
      'Source language sent': srcSent,
      'API endpoint': '/api/v1/translation/translate'
    });

    // Call Spring Boot Backend Endpoint (/api/v1/translation/translate)
    // Backend will auto-detect source language via OpenAI single-pass
    try {
      const response = await apiClient.post('/api/v1/translation/translate', {
        text: text.trim(),
        sourceLanguage: srcSent,
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
  },
};

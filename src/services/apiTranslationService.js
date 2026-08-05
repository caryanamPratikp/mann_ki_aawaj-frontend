import { apiClient } from './apiClient.js';
import axios from 'axios';

const PYTHON_SERVICE_URL = 'http://localhost:8001/api/v1/translate';

// Mapping UI language names to FLORES-200 language codes
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
   * Translates content dynamically via Spring Boot Backend (or fallback to Python microservice).
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

    // 1. Try Spring Boot Backend Endpoint first
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
      console.warn('Backend translation service unavailable, trying fallback:', err?.message || err);
    }

    // 2. Direct fallback to Python FastAPI Microservice on port 8001
    try {
      const pyResponse = await axios.post(PYTHON_SERVICE_URL, {
        text: text.trim(),
        sourceLanguage: srcCode,
        targetLanguage: tgtCode,
      }, { timeout: 5000 });

      if (pyResponse.data && pyResponse.data.translatedText) {
        const result = pyResponse.data.translatedText;
        translationCache.set(cacheKey, result);
        return result;
      }
    } catch (pyErr) {
      console.error('Direct Python translation call failed:', pyErr?.message || pyErr);
    }

    // 3. Fallback: Return original text if service is unreachable
    return text;
  }
};

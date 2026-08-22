import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';
import { apiClient } from './apiClient.js';

const translationClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  validateStatus: (status) => status >= 200 && status < 500,
  headers: {
    'Content-Type': 'application/json',
  },
});

translationClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
let rateLimitPauseUntil = 0;

const getCachedTranslation = (cacheKey) => {
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  try {
    const lsKey = `mka_tr_${cacheKey.substring(0, 100)}`;
    const saved = localStorage.getItem(lsKey);
    if (saved) {
      translationCache.set(cacheKey, saved);
      return saved;
    }
  } catch (e) {}
  return null;
};

const setCachedTranslation = (cacheKey, value) => {
  if (!cacheKey || !value) return;
  translationCache.set(cacheKey, value);
  try {
    const lsKey = `mka_tr_${cacheKey.substring(0, 100)}`;
    localStorage.setItem(lsKey, value);
  } catch (e) {}
};

export const apiTranslationService = {
  async translateText(text, targetLang, sourceLang = null) {
    if (!text || !text.trim()) {
      return text;
    }

    const tgtCode = normalizeLanguageCode(targetLang) || 'EN';
    let srcCode = normalizeLanguageCode(sourceLang);
    const detectedScriptCode = detectTextLanguage(text);

    // If sourceLang was defaulted to EN, but text contains non-English script, trust script detection
    if (srcCode === 'EN' && detectedScriptCode !== 'EN') {
      srcCode = detectedScriptCode;
    } else if (!srcCode && sourceLang !== 'auto') {
      srcCode = detectedScriptCode;
    }

    // Only skip if source and target language are confirmed identical
    if (srcCode && tgtCode && srcCode === tgtCode) {
      return text;
    }

    // 1. Separate leading @username handles from main text body
    let remainingText = text.trim();
    const leadingHandles = [];
    while (true) {
      const match = remainingText.match(/^(@[a-zA-Z0-9_-]+)\s*/);
      if (match) {
        const handle = match[1];
        if (!leadingHandles.includes(handle)) {
          leadingHandles.push(handle);
        }
        remainingText = remainingText.substring(match[0].length);
      } else {
        break;
      }
    }

    // If text consists ONLY of @username handles, return handles directly
    if (!remainingText.trim()) {
      return text;
    }

    const bodyToTranslate = remainingText.trim();

    // 2. Mask any inline handles (@username) using safe handle tokens like @MKAHDL0
    const inlineHandles = [];
    const maskedBody = bodyToTranslate.replace(/@([a-zA-Z0-9_-]+)/g, (match) => {
      const token = `@MKAHDL${inlineHandles.length}`;
      inlineHandles.push({ token, original: match });
      return token;
    });

    const reattachHandles = (translatedBody) => {
      if (!translatedBody) return text;
      let clean = translatedBody.trim();
      for (const h of inlineHandles) {
        const regex = new RegExp(h.token.replace('@', '@\\s*'), 'gi');
        clean = clean.replace(regex, h.original);
      }
      if (leadingHandles.length > 0) {
        return `${leadingHandles.join(' ')} ${clean}`;
      }
      return clean;
    };

    const cacheKey = `${srcCode || 'auto'}_${tgtCode}_${text.trim()}`;
    const cached = getCachedTranslation(cacheKey);
    if (cached) {
      return cached;
    }

    // 1. Attempt primary backend translation endpoint with rate-limit pause check
    if (Date.now() >= rateLimitPauseUntil) {
      try {
        const response = await translationClient.post('/api/v1/translation/translate', {
          text: maskedBody,
          sourceLanguage: 'auto',
          targetLanguage: tgtCode,
        }).catch(() => null);

        if (response?.status === 429) {
          // Pause primary translation API calls for 20s on HTTP 429
          rateLimitPauseUntil = Date.now() + 20000;
        } else if (
          response?.status === 200 &&
          response?.data &&
          response.data.translatedText &&
          response.data.translatedText !== maskedBody &&
          response.data.engine !== 'fallback'
        ) {
          const result = reattachHandles(response.data.translatedText);
          setCachedTranslation(cacheKey, result);
          return result;
        }
      } catch (err) {
        // Handle rate limits / offline status silently
      }
    }

    // 2. Secondary Fallback: Free Google Translate GTX service
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tgtCode.toLowerCase()}&dt=t&q=${encodeURIComponent(maskedBody)}`;
      const gtxResponse = await fetch(gtxUrl).catch(() => null);
      if (gtxResponse && gtxResponse.ok) {
        const gtxData = await gtxResponse.json().catch(() => null);
        if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
          const translatedParts = gtxData[0]
            .filter((item) => Array.isArray(item) && item[0])
            .map((item) => item[0])
            .join('');

          if (translatedParts && translatedParts.trim()) {
            const finalResult = reattachHandles(translatedParts.trim());
            setCachedTranslation(cacheKey, finalResult);
            return finalResult;
          }
        }
      }
    } catch (fallbackErr) {
      // Handle fallback error silently
    }

    return text;
  },

  async translateBatchText(texts, targetLang) {
    if (!Array.isArray(texts) || texts.length === 0) return {};
    const tgtCode = normalizeLanguageCode(targetLang) || 'EN';
    const resultMap = {};
    const unCachedTexts = [];

    texts.forEach((txt) => {
      if (!txt || !txt.trim()) return;
      const clean = txt.trim();
      const detectedScriptCode = detectTextLanguage(clean);
      if (detectedScriptCode === tgtCode) {
        resultMap[clean] = clean;
        return;
      }
      const cacheKey = `auto_${tgtCode}_${clean}`;
      const cached = getCachedTranslation(cacheKey);
      if (cached) {
        resultMap[clean] = cached;
      } else {
        unCachedTexts.push(clean);
      }
    });

    if (unCachedTexts.length === 0) return resultMap;

    if (Date.now() >= rateLimitPauseUntil) {
      try {
        const response = await translationClient.post('/api/v1/translation/batch', {
          texts: unCachedTexts,
          sourceLanguage: 'auto',
          targetLanguage: tgtCode,
        }).catch(() => null);

        if (response?.status === 429) {
          rateLimitPauseUntil = Date.now() + 20000;
        } else if (response?.status === 200 && response?.data && response.data.translations) {
          Object.entries(response.data.translations).forEach(([orig, trans]) => {
            const cacheKey = `auto_${tgtCode}_${orig}`;
            setCachedTranslation(cacheKey, trans);
            resultMap[orig] = trans;
          });
          return resultMap;
        }
      } catch (err) {
        // Silent catch
      }
    }

    // Fallback sequentially if batch endpoint rate-limited or offline
    for (const txt of unCachedTexts) {
      resultMap[txt] = await this.translateText(txt, tgtCode);
    }
    return resultMap;
  },
};


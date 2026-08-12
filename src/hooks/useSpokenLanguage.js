import { useState } from 'react';

const STORAGE_KEY = 'mka_spoken_language';

export function useSpokenLanguage() {
  const [spokenLanguage, setSpokenLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'AUTO';
    } catch (e) {
      return 'AUTO';
    }
  });

  const setSpokenLanguage = (code) => {
    setSpokenLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      /* ignore */
    }
  };

  return [spokenLanguage, setSpokenLanguage];
}

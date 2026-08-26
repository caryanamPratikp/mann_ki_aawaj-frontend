import { MUSIC_MOOD_VALUES } from '../config/musicMoods.js';

const PREFIX = 'mka.music.session.v1.';

export const getMusicSessionUserId = (user) => user?.id ?? user?.userId ?? user?.username ?? null;
export const getMusicSessionKey = (userId) => userId === null || userId === undefined ? null : `${PREFIX}${String(userId)}`;

export const emptyMusicSession = () => ({ selectedMood: null, mode: 'ALL', selectorCompleted: false });

export const readMusicSession = (userId, storage = globalThis.sessionStorage) => {
  const key = getMusicSessionKey(userId);
  if (!key || !storage) return emptyMusicSession();
  try {
    const value = JSON.parse(storage.getItem(key));
    if (!value?.selectorCompleted) return emptyMusicSession();
    if (value.mode === 'ALL' && value.selectedMood === null) return { selectedMood: null, mode: 'ALL', selectorCompleted: true };
    if (MUSIC_MOOD_VALUES.includes(value.selectedMood) && value.selectedMood !== 'ALL') {
      return { selectedMood: value.selectedMood, mode: 'MOOD', selectorCompleted: true };
    }
  } catch {
    // Invalid or unavailable session storage behaves like a first visit.
  }
  return emptyMusicSession();
};

export const saveMusicSession = (userId, selectedMood, storage = globalThis.sessionStorage) => {
  const key = getMusicSessionKey(userId);
  if (!key || !storage) return emptyMusicSession();
  const value = selectedMood === null
    ? { selectedMood: null, mode: 'ALL', selectorCompleted: true }
    : { selectedMood, mode: 'MOOD', selectorCompleted: true };
  if (selectedMood !== null && (!MUSIC_MOOD_VALUES.includes(selectedMood) || selectedMood === 'ALL')) return emptyMusicSession();
  try { storage.setItem(key, JSON.stringify(value)); } catch { /* State still works for this render. */ }
  return value;
};

export const clearMusicSession = (userId, storage = globalThis.sessionStorage) => {
  const key = getMusicSessionKey(userId);
  if (key && storage) {
    try { storage.removeItem(key); } catch { /* Storage may be blocked. */ }
  }
  if (storage) {
    try {
      Object.keys(storage).forEach((k) => {
        if (k.startsWith(PREFIX)) storage.removeItem(k);
      });
    } catch { /* Ignore storage errors */ }
  }
};

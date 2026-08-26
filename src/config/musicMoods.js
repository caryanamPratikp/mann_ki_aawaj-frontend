export const MUSIC_MOOD_OPTIONS = Object.freeze([
  { value: 'ROMANTIC', label: 'Romantic' },
  { value: 'SAD', label: 'Sad' },
  { value: 'CALM', label: 'Calm' },
  { value: 'ENERGETIC', label: 'Energetic' },
  { value: 'CONFUSED', label: 'Confused' },
  { value: 'MELANCHOLY', label: 'Melancholy' },
  { value: 'FOCUS', label: 'Focus' },
]);

export const MUSIC_MOOD_VALUES = Object.freeze(MUSIC_MOOD_OPTIONS.map(({ value }) => value));

export const normalizeMusicMoods = (moods) => (
  [...new Set(Array.isArray(moods) ? moods.filter((mood) => MUSIC_MOOD_VALUES.includes(mood)) : [])]
);

export const getMusicMoodLabel = (value) => (
  MUSIC_MOOD_OPTIONS.find((option) => option.value === value)?.label || value
);

export const toggleMusicMood = (moods, mood, maxSelections = Infinity) => {
  const selected = normalizeMusicMoods(moods);
  if (selected.includes(mood)) return selected.filter((value) => value !== mood);
  if (!MUSIC_MOOD_VALUES.includes(mood) || selected.length >= maxSelections) return selected;
  return [...selected, mood];
};

export const appendMusicMoods = (formData, moods) => {
  normalizeMusicMoods(moods).forEach((mood) => formData.append('moods', mood));
  return formData;
};

export const LISTENING_MOOD_OPTIONS = Object.freeze([
  { id: 'romantic', apiMood: 'ROMANTIC', theme: 'romantic', artworkKey: 'op1', title: 'Feeling Romantic', description: 'Soft, soulful and full of feeling.', icon: 'heart' },
  { id: 'sad', apiMood: 'SAD', theme: 'sad', artworkKey: 'op2', title: 'A Little Low', description: 'Gentle music for quieter moments.', icon: 'cloud-rain' },
  { id: 'energetic', apiMood: 'ENERGETIC', theme: 'energetic', artworkKey: 'op3', title: 'Need Some Energy', description: 'Turn it up and lift the mood.', icon: 'zap' },
  { id: 'all', apiMood: null, theme: 'all', artworkKey: 'op4', title: 'Play Anything', description: 'No choices. Just let the music flow.', icon: 'sparkles' },
]);

export const getListeningMoodOption = (apiMood) => (
  LISTENING_MOOD_OPTIONS.find((option) => option.apiMood === apiMood) || LISTENING_MOOD_OPTIONS.at(-1)
);

export const buildListeningCatalogParams = (baseParams, selectedMood) => (
  selectedMood && MUSIC_MOOD_VALUES.includes(selectedMood) ? { ...baseParams, mood: selectedMood } : { ...baseParams }
);

export const shouldFallbackToFullCatalog = ({ selectedMood, page, isSuccess, content }) => (
  Boolean(selectedMood) && page === 0 && isSuccess && Array.isArray(content) && content.length === 0
);

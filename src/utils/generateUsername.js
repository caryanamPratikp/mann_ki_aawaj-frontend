import { USERNAME_PREFIXES, USERNAME_NOUNS } from '../data/usernameWords.js';

/**
 * Generates array of 3 random anonymous usernames
 */
export function generateUsernameSuggestions(count = 3) {
  const suggestions = new Set();
  while (suggestions.size < count) {
    const p = USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];
    const n = USERNAME_NOUNS[Math.floor(Math.random() * USERNAME_NOUNS.length)];
    suggestions.add(`@${p}${n}`);
  }
  return Array.from(suggestions);
}

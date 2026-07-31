import { USERNAME_PREFIXES, USERNAME_NOUNS } from '../data/usernameWords.js';

const globallyUsedUsernames = new Set();

/**
 * Generates an array of count unique, non-repeating anonymous handles
 */
export function generateUsernameSuggestions(count = 4) {
  const suggestions = new Set();
  let attempts = 0;

  while (suggestions.size < count && attempts < 200) {
    attempts++;
    const p = USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];
    const n = USERNAME_NOUNS[Math.floor(Math.random() * USERNAME_NOUNS.length)];
    
    // Mix standard handle and handle with random 2-digit number for complete uniqueness
    const num = Math.floor(Math.random() * 90) + 10;
    const uname = attempts % 2 === 0 ? `@${p}${n}` : `@${p}${n}${num}`;

    if (!globallyUsedUsernames.has(uname.toLowerCase())) {
      suggestions.add(uname);
    }
  }

  const result = Array.from(suggestions);
  result.forEach((u) => globallyUsedUsernames.add(u.toLowerCase()));
  return result;
}

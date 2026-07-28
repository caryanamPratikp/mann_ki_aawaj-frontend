import { moderationCheck } from './moderationCheck.js';

export function validateUsername(username) {
  if (!username) return { isValid: false, message: 'Username is required.' };
  
  const clean = username.startsWith('@') ? username : `@${username}`;
  
  if (clean.length < 4 || clean.length > 20) {
    return { isValid: false, message: 'Username must be between 4 and 20 characters.' };
  }

  if (!/^@[a-zA-Z0-9_]+$/.test(clean)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores.' };
  }

  // Moderation check on username
  const modResult = moderationCheck(clean);
  if (modResult.status === 'BLOCKED' || modResult.status === 'NEEDS_EDITING') {
    return { isValid: false, message: 'Username contains inappropriate or restricted words.' };
  }

  return { isValid: true, message: 'Username is available.' };
}

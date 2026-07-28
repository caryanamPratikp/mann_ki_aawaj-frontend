/**
 * Generates 1-2 uppercase initials from a username or name.
 */
export function generateInitials(identifier) {
  if (!identifier) return 'MK';
  
  // Clean leading @
  const clean = identifier.replace(/^@/, '').trim();
  if (!clean) return 'MK';

  // If camelCase or has punctuation/spaces
  const parts = clean.split(/[\s._-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }

  return clean[0].toUpperCase();
}

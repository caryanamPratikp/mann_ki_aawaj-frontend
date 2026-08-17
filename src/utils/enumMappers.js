// Converts UI topic labels to Spring Boot PostTopic enum
export function toBackendTopic(topicLabel) {
  if (!topicLabel) return 'GENERAL';
  const norm = topicLabel.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');

  switch (norm) {
    case 'CULTURE': return 'CULTURE';
    case 'ENTERTAINMENT': return 'ENTERTAINMENT';
    case 'POLITICS': return 'POLITICS';
    case 'NEWS': return 'NEWS';
    case 'SPORTS': return 'SPORTS';
    case 'TECH':
    case 'TECHNOLOGY': return 'TECH';
    case 'THOUGHTS': return 'THOUGHTS';
    case 'LIFE': return 'LIFE';
    case 'CAREER': return 'CAREER';
    case 'RELATIONSHIPS': return 'RELATIONSHIPS';
    case 'EDUCATION':
    case 'STUDENT_LIFE': return 'EDUCATION';
    case 'WORKPLACE': return 'WORKPLACE';
    case 'PARENTING': return 'PARENTING';
    case 'BOOKS': return 'BOOKS';
    case 'CREATIVITY': return 'CREATIVITY';
    default: return 'GENERAL';
  }
}

// Converts UI post expression types to Spring Boot PostType enum
export function toBackendPostType(typeLabel, hasImage = false, isAudio = false) {
  if (isAudio) return 'AUDIO_TRANSCRIPT';
  if (hasImage) return 'IMAGE';
  if (!typeLabel) return 'TEXT';

  const norm = typeLabel.trim().toUpperCase();
  if (norm.includes('IMAGE') || norm.includes('PHOTO')) return 'IMAGE';
  if (norm.includes('AUDIO') || norm.includes('VOICE') || norm.includes('TRANSCRIPT')) return 'AUDIO_TRANSCRIPT';
  return 'TEXT';
}

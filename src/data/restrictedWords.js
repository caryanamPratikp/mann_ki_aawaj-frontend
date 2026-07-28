export const RESTRICTED_CATEGORIES = {
  ABUSIVE: 'Abusive language',
  HATE_SPEECH: 'Hate speech',
  HARASSMENT: 'Harassment',
  THREAT: 'Threats',
  POLITICAL: 'Political propaganda',
  RELIGIOUS: 'Religious offence',
  SEXUAL: 'Sexual content',
  SPAM: 'Spam',
  SCAM: 'Scam wording',
  PERSONAL_INFO: 'Personal information exposure',
  IMPERSONATION: 'Impersonation',
};

// Word & phrase patterns with risk levels and categories
export const RESTRICTED_TERMS = [
  // Abusive & Hate speech
  { pattern: 'hate', category: RESTRICTED_CATEGORIES.HATE_SPEECH, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'idiot', category: RESTRICTED_CATEGORIES.ABUSIVE, risk: 'LOW', status: 'NEEDS_EDITING' },
  { pattern: 'stupid', category: RESTRICTED_CATEGORIES.ABUSIVE, risk: 'LOW', status: 'NEEDS_EDITING' },
  { pattern: 'dumb', category: RESTRICTED_CATEGORIES.ABUSIVE, risk: 'LOW', status: 'NEEDS_EDITING' },
  { pattern: 'kill yourself', category: RESTRICTED_CATEGORIES.THREAT, risk: 'CRITICAL', status: 'BLOCKED' },
  { pattern: 'go die', category: RESTRICTED_CATEGORIES.THREAT, risk: 'CRITICAL', status: 'BLOCKED' },
  { pattern: 'die alone', category: RESTRICTED_CATEGORIES.HARASSMENT, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'trash', category: RESTRICTED_CATEGORIES.ABUSIVE, risk: 'LOW', status: 'NEEDS_EDITING' },
  { pattern: 'loser', category: RESTRICTED_CATEGORIES.ABUSIVE, risk: 'LOW', status: 'NEEDS_EDITING' },
  { pattern: 'bitch', category: RESTRICTED_CATEGORIES.ABUSIVE, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'bastard', category: RESTRICTED_CATEGORIES.ABUSIVE, risk: 'HIGH', status: 'BLOCKED' },

  // Political / Religious Offence
  { pattern: 'political party', category: RESTRICTED_CATEGORIES.POLITICAL, risk: 'MEDIUM', status: 'PENDING_REVIEW' },
  { pattern: 'vote for', category: RESTRICTED_CATEGORIES.POLITICAL, risk: 'MEDIUM', status: 'PENDING_REVIEW' },
  { pattern: 'election fraud', category: RESTRICTED_CATEGORIES.POLITICAL, risk: 'HIGH', status: 'PENDING_REVIEW' },
  { pattern: 'religious war', category: RESTRICTED_CATEGORIES.RELIGIOUS, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'blasphemy', category: RESTRICTED_CATEGORIES.RELIGIOUS, risk: 'HIGH', status: 'PENDING_REVIEW' },
  { pattern: 'convert to', category: RESTRICTED_CATEGORIES.RELIGIOUS, risk: 'MEDIUM', status: 'PENDING_REVIEW' },

  // Spam & Scam
  { pattern: 'buy crypto', category: RESTRICTED_CATEGORIES.SCAM, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'earn 1000$', category: RESTRICTED_CATEGORIES.SCAM, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'click link below', category: RESTRICTED_CATEGORIES.SPAM, risk: 'MEDIUM', status: 'NEEDS_EDITING' },
  { pattern: 'whatsapp me at', category: RESTRICTED_CATEGORIES.SPAM, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'call this number', category: RESTRICTED_CATEGORIES.PERSONAL_INFO, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'free money', category: RESTRICTED_CATEGORIES.SCAM, risk: 'HIGH', status: 'BLOCKED' },
  { pattern: 'telegram group', category: RESTRICTED_CATEGORIES.SPAM, risk: 'MEDIUM', status: 'NEEDS_EDITING' },

  // Personal Info / Phone Numbers / Emails regex patterns checked programmatically
];

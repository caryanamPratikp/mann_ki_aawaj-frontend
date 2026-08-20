// Comprehensive collection of Indian & Global real human first/last names (blocked to preserve anonymity)
export const REAL_HUMAN_NAMES = new Set([
  'pratik', 'prateek', 'raaju', 'raju', 'prajwal', 'rahul', 'priya', 'amit', 'suresh', 'anita', 'sunil', 'vikram',
  'ajay', 'sanjay', 'manish', 'pooja', 'neha', 'deepak', 'rohit', 'ankit', 'sumit', 'karan',
  'arjun', 'varun', 'aditya', 'abhishek', 'ravi', 'vijay', 'ashok', 'alok', 'divya', 'kavita',
  'sunita', 'rekha', 'rashi', 'neeraj', 'sachin', 'dhoni', 'virat', 'ramesh', 'dinesh', 'naresh',
  'mahesh', 'gautam', 'patel', 'kumar', 'singh', 'sharma', 'verma', 'gupta', 'yadav', 'chawla',
  'reddy', 'nair', 'deshmukh', 'prashant', 'pratham', 'praveen', 'pravin', 'pramod', 'prabhat', 'prakash',
  'pradeep', 'preeti', 'priyanka', 'prerna', 'pratibha', 'john', 'michael', 'david', 'james', 'robert', 'william', 'mary',
  'patricia', 'linda', 'barbara', 'elizabeth', 'jennifer', 'maria', 'susan', 'margaret', 'lisa',
  'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon', 'michelle',
  'laura', 'sarah', 'kimberly', 'deborah', 'jessica', 'shirley', 'cynthia', 'angela', 'melissa',
  'brenda', 'amy', 'anna', 'rebecca', 'virginia', 'kathleen', 'pamela', 'martha', 'debra', 'amanda',
  'stephanie', 'carolyn', 'christine', 'marie', 'janet', 'catherine', 'frances', 'ann', 'joyce',
  'diane', 'alice', 'julie', 'heather', 'teresa', 'doris', 'gloria', 'evelyn', 'jean', 'cheryl',
  'mildred', 'katherine', 'joan', 'ashley', 'judith', 'rose', 'janice', 'kelly', 'nicole', 'judy',
  'christina', 'kathy', 'theresa', 'beverly', 'denise', 'tammy', 'irene', 'jane', 'lori', 'rachel',
  'marilyn', 'andrea', 'kathryn', 'louise', 'sara', 'anne', 'jacqueline', 'wanda', 'bonnie', 'julia',
  'ruby', 'lois', 'tina', 'phyllis', 'norma', 'paula', 'diana', 'annie', 'lillian', 'emily', 'robin'
]);

// Abusive / Harmful / Profane words filter
export const ABUSIVE_WORDS = new Set([
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'chutiya', 'madarchod', 'bhenchod',
  'gand', 'gaand', 'lauda', 'lode', 'harami', 'kamina', 'terrorist', 'nazi', 'hitler',
  'murder', 'kill', 'rape', 'slut', 'whore', 'cunt', 'dick', 'pussy'
]);

/**
 * Validates username string on frontend
 * Checks against real human names, user's own full name, and abusive words.
 * Returns error string or null if valid.
 */
export function validateUsernameString(rawUsername, userFullName = null) {
  if (!rawUsername || !rawUsername.trim()) {
    return 'Username handle cannot be empty.';
  }

  const clean = rawUsername.trim().toLowerCase().replace(/^@/, '');

  if (clean.length < 3 || clean.length > 30) {
    return 'Username handle must be between 3 and 30 characters.';
  }

  if (!/^[a-zA-Z0-9._]+$/.test(clean)) {
    return 'Username can only contain letters, numbers, dots, and underscores.';
  }

  // 1. Check abusive words
  for (const abusive of ABUSIVE_WORDS) {
    if (clean.includes(abusive)) {
      return 'Username contains inappropriate or restricted words. Please choose a clean, respectful handle.';
    }
  }

  // 2. Check user's own full name tokens (e.g. if registered name is "Pratik Sharma", block "pratik" or "sharma" in handle)
  if (userFullName && typeof userFullName === 'string' && userFullName.trim()) {
    const tokens = userFullName.trim().toLowerCase().split(/\s+/);
    for (const token of tokens) {
      if (token.length >= 3 && clean.includes(token)) {
        return `Username cannot contain your real name ('${token}') to maintain absolute anonymity. Try fictional handles like 'captainamerica' or 'cyberninja'.`;
      }
    }
  }

  // 3. Check real human names (substring containment)
  for (const humanName of REAL_HUMAN_NAMES) {
    if (clean.includes(humanName)) {
      return `Real human names like '${humanName}' are not allowed to maintain anonymity. Try fictional or creative handles like 'captainamerica' or 'cyberninja'.`;
    }
  }

  return null;
}

/**
 * Generates available numbered suggestions for a base handle
 */
export function getSuggestedNumberVariants(baseUsername, count = 4) {
  let clean = (baseUsername || 'anonymous').trim().toLowerCase().replace(/^@/, '').replace(/\d+$/, '');
  if (clean.length < 3) clean = 'anonymous';

  const suggestions = [];
  const usedNums = new Set();

  while (suggestions.length < count) {
    const num = Math.floor(Math.random() * 90) + 10;
    if (!usedNums.has(num)) {
      usedNums.add(num);
      suggestions.push(`${clean}${num}`);
    }
  }

  return suggestions;
}

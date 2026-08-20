export const SYSTEM_TOPICS = [
  'GENERAL',
  'BOLLYWOOD',
  'CRICKET',
  'TECHNOLOGY',
  'POLITICS',
  'LIFESTYLE',
  'LIFE',
  'ENTERTAINMENT',
  'SPORTS',
  'NEWS',
];

export function getCustomTopics() {
  try {
    const stored = localStorage.getItem('mka_custom_topics');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomTopic(topicName) {
  if (!topicName || !topicName.trim()) return [];
  const clean = topicName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
  if (!clean || SYSTEM_TOPICS.includes(clean)) return getCustomTopics();

  const current = getCustomTopics();
  if (!current.includes(clean)) {
    const updated = [...current, clean];
    try {
      localStorage.setItem('mka_custom_topics', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return updated;
  }
  return current;
}

export function computeTopicStats(posts = []) {
  const nowMs = Date.now();
  const fiveMinsMs = 5 * 60 * 1000;
  const fifteenMinsMs = 15 * 60 * 1000;
  const customTopics = getCustomTopics();

  const statsMap = {};
  SYSTEM_TOPICS.forEach((t) => {
    statsMap[t] = {
      name: t,
      count: 0,
      recent5MinCount: 0,
      lastPostTime: null,
      lastPostMs: 0,
      isTrending: false,
      isNew: false,
      isUserAdded: false,
    };
  });

  // Register custom topics even if no posts yet
  customTopics.forEach((ct) => {
    if (!statsMap[ct]) {
      statsMap[ct] = {
        name: ct,
        count: 0,
        recent5MinCount: 0,
        lastPostTime: null,
        lastPostMs: 0,
        isTrending: false,
        isNew: false,
        isUserAdded: true,
      };
    }
  });

  posts.forEach((p) => {
    if (!p) return;
    const normTopic = (p.topic || 'GENERAL').toUpperCase().trim();
    if (!statsMap[normTopic]) {
      statsMap[normTopic] = {
        name: normTopic,
        count: 0,
        recent5MinCount: 0,
        lastPostTime: null,
        lastPostMs: 0,
        isTrending: false,
        isNew: false,
        isUserAdded: !SYSTEM_TOPICS.includes(normTopic),
      };
    }

    const stat = statsMap[normTopic];
    stat.count += 1;
    if (!SYSTEM_TOPICS.includes(normTopic)) {
      stat.isUserAdded = true;
    }

    const createdAt = p.createdAt ? new Date(p.createdAt).getTime() : 0;
    if (createdAt > stat.lastPostMs) {
      stat.lastPostMs = createdAt;
      stat.lastPostTime = p.createdAt;
    }

    if (createdAt > 0 && nowMs - createdAt <= fiveMinsMs) {
      stat.recent5MinCount += 1;
    }
  });

  // Calculate dynamic badges & sorting priority
  return Object.values(statsMap).map((stat) => {
    const timeDiffMs = stat.lastPostMs > 0 ? nowMs - stat.lastPostMs : Infinity;
    
    // Dynamic Trending: 2-3 posts in last 5 mins
    const isTrending = stat.recent5MinCount >= 2;
    
    // Dynamic New: last post created within last 15 mins
    const isNew = timeDiffMs <= fifteenMinsMs;
    const isUserAdded = stat.isUserAdded || !SYSTEM_TOPICS.includes(stat.name);

    return {
      ...stat,
      isTrending,
      isNew,
      isUserAdded,
      priority: isTrending ? 3 : isNew ? 2 : isUserAdded ? 1 : 0,
    };
  }).sort((a, b) => {
    // Trending, New, and User Added topics shown on top!
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.lastPostMs !== a.lastPostMs) return b.lastPostMs - a.lastPostMs;
    return b.count - a.count;
  });
}

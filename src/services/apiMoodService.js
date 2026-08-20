import { apiClient } from './apiClient.js';

const isMockMode = () => {
  const token = localStorage.getItem('auth_token');
  return Boolean(token && (token.startsWith('mock') || token === 'mock_token'));
};

const getMockData = () => {
  try {
    const userMood = localStorage.getItem('mka_mock_user_mood') || null;
    const moodCounts = JSON.parse(localStorage.getItem('mka_mock_mood_votes') || '{}');
    let totalVotes = 0;
    Object.values(moodCounts).forEach(cnt => { totalVotes += (Number(cnt) || 0); });
    return { success: true, data: { userMood, totalVotes, moodCounts } };
  } catch {
    return { success: true, data: { userMood: null, totalVotes: 0, moodCounts: {} } };
  }
};

const setMockVote = (mood) => {
  try {
    let userMood = localStorage.getItem('mka_mock_user_mood') || null;
    let moodCounts = JSON.parse(localStorage.getItem('mka_mock_mood_votes') || '{}');
    const cleanMood = mood ? mood.trim().toUpperCase() : '';

    if (userMood && moodCounts[userMood] > 0) {
      moodCounts[userMood] = Math.max(0, moodCounts[userMood] - 1);
    }

    if (userMood === cleanMood) {
      userMood = null;
      localStorage.removeItem('mka_mock_user_mood');
    } else {
      userMood = cleanMood;
      moodCounts[cleanMood] = (moodCounts[cleanMood] || 0) + 1;
      localStorage.setItem('mka_mock_user_mood', cleanMood);
    }

    localStorage.setItem('mka_mock_mood_votes', JSON.stringify(moodCounts));
    let totalVotes = 0;
    Object.values(moodCounts).forEach(cnt => { totalVotes += (Number(cnt) || 0); });

    return { success: true, data: { userMood, totalVotes, moodCounts } };
  } catch {
    return getMockData();
  }
};

export const apiMoodService = {
  // GET /api/mood/india
  async getMoodOfIndia() {
    if (isMockMode()) {
      return getMockData();
    }
    try {
      const response = await apiClient.get('/api/mood/india');
      if (response.data && response.data.data) {
        return response.data;
      }
      return getMockData();
    } catch (err) {
      return getMockData();
    }
  },

  // POST /api/mood/india?mood=LOVE
  async voteMood(mood) {
    if (isMockMode()) {
      return setMockVote(mood);
    }
    try {
      const response = await apiClient.post(`/api/mood/india?mood=${encodeURIComponent(mood)}`);
      if (response.data && response.data.data) {
        return response.data;
      }
      return setMockVote(mood);
    } catch (err) {
      return setMockVote(mood);
    }
  },
};

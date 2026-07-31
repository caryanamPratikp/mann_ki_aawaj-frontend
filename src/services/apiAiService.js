import { apiClient } from './apiClient.js';

export const apiAiService = {
  // POST /api/ai/voice-to-text (multipart/form-data, field: file)
  async voiceToText(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice_recording.webm');

      const response = await apiClient.post('/api/ai/voice-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || !err.response) {
        console.warn('Backend AI service offline. Returning simulated voice transcription.');
        return {
          success: true,
          data: {
            text: 'Simulated voice recording transcription: Sharing my thoughts freely and anonymously.',
            detectedLanguage: 'EN',
          },
        };
      }
      throw err;
    }
  },
};

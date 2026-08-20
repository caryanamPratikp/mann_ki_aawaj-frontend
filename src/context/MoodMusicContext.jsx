import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

// Indian Regional Languages List
export const INDIAN_LANGUAGES = [
  { id: 'HI', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { id: 'PA', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🌾' },
  { id: 'MR', name: 'Marathi', native: 'मराठी', flag: '🚩' },
  { id: 'BN', name: 'Bengali', native: 'বাংলা', flag: '🌺' },
  { id: 'TA', name: 'South', native: 'தமிழ்/తెలుగు', flag: '🌴' },
];

// Mood categories
export const MOOD_CATEGORIES = [
  { id: 'Romantic', label: 'Romantic Melodies 💖', emoji: '💖', color: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' },
  { id: 'Calm', label: 'Calm Bansuri Flute 🪈', emoji: '😌', color: 'linear-gradient(135deg, #42E695 0%, #3BB2B8 100%)' },
  { id: 'Energetic', label: 'Dhol & Bhangra Beats 🥁', emoji: '🔥', color: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' },
  { id: 'Confused', label: 'Classical Sitar Raga 🪕', emoji: '🤔', color: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)' },
  { id: 'Melancholy', label: 'Monsoon Rain & Sarangi 🌧️', emoji: '🌧️', color: 'linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)' },
  { id: 'Focus', label: 'Chai & Lo-Fi Study 🧘', emoji: '🧘', color: 'linear-gradient(135deg, #614385 0%, #516395 100%)' },
];

// High Quality Real Music Audio Streams (Pixabay Audio CDN - Guaranteed CORS & Direct Audio Playback)
export const REGIONAL_PLAYLISTS = {
  HI: {
    Romantic: [
      {
        id: 'hi_r1',
        title: 'Kesariya Acoustic Strings',
        artist: 'Soft Indian Love Melodies',
        language: 'Hindi',
        mood: 'Romantic',
        coverUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=sweet-love-10903.mp3',
      },
      {
        id: 'hi_r2',
        title: 'Tum Hi Ho Sunset Session',
        artist: 'Acoustic Guitar & Bansuri Mix',
        language: 'Hindi',
        mood: 'Romantic',
        coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-guitars-8854.mp3',
      },
    ],
    Calm: [
      {
        id: 'hi_cl1',
        title: 'Kashi Indian Bansuri Flute',
        artist: 'Peaceful Meditation Bansuri Flute',
        language: 'Hindi',
        mood: 'Calm',
        coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c2306f9d27.mp3?filename=meditation-flute-111874.mp3',
      },
      {
        id: 'hi_cl2',
        title: 'Traditional Sitar Raga Evening',
        artist: 'Classical Indian Sitar Ensemble',
        language: 'Hindi',
        mood: 'Calm',
        coverUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_51f67f2e1a.mp3?filename=relaxing-sitar-9543.mp3',
      },
    ],
    Energetic: [
      {
        id: 'hi_e1',
        title: 'Bhangra Dhol & Dholak Beats',
        artist: 'High Energy Indian Percussion',
        language: 'Hindi',
        mood: 'Energetic',
        coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c3a3ef8b.mp3?filename=energetic-hip-hop-10243.mp3',
      },
    ],
    Confused: [
      {
        id: 'hi_c1',
        title: 'Raga Bhairavi Classical Sitar',
        artist: 'Traditional Indian Classical Raga',
        language: 'Hindi',
        mood: 'Confused',
        coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_51f67f2e1a.mp3?filename=relaxing-sitar-9543.mp3',
      },
    ],
    Melancholy: [
      {
        id: 'hi_m1',
        title: 'Monsoon Rain & Quiet Sarangi',
        artist: 'Rain Ambience & Sad String Melodies',
        language: 'Hindi',
        mood: 'Melancholy',
        coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fa925c4.mp3?filename=sad-piano-lofi-117284.mp3',
      },
    ],
    Focus: [
      {
        id: 'hi_f1',
        title: 'Chai & Code Indian Lo-Fi',
        artist: 'Desi Chill Beats',
        language: 'Hindi',
        mood: 'Focus',
        coverUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      },
    ],
  },
  PA: {
    Romantic: [
      {
        id: 'pa_r1',
        title: 'Punjabi Folk Flute & Tumbi',
        artist: 'Traditional Punjabi Melodies',
        language: 'Punjabi',
        mood: 'Romantic',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=sweet-love-10903.mp3',
      },
    ],
  },
  MR: {
    Romantic: [
      {
        id: 'mr_r1',
        title: 'Marathi Lavani & Shehnai Harmony',
        artist: 'Traditional Maharashtrian Instrumentals',
        language: 'Marathi',
        mood: 'Romantic',
        coverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c2306f9d27.mp3?filename=meditation-flute-111874.mp3',
      },
    ],
  },
};

const MoodMusicContext = createContext(null);

export function MoodMusicProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState('HI');
  const [currentMood, setCurrentMood] = useState('Romantic');
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(180);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);

  const getActivePlaylist = () => {
    const langObj = REGIONAL_PLAYLISTS[selectedLanguage] || REGIONAL_PLAYLISTS.HI;
    return langObj[currentMood] || langObj.Romantic || REGIONAL_PLAYLISTS.HI.Romantic;
  };

  const playlist = getActivePlaylist();
  const currentTrack = playlist[trackIndex] || playlist[0];

  // Initialize HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.85;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Direct Audio Playback Execution
  const playAudioTrack = () => {
    if (audioRef.current && currentTrack?.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log('Autoplay restriction or network fallback:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudioTrack();
    }
  };

  const changeLanguage = (langCode) => {
    setSelectedLanguage(langCode);
    setTrackIndex(0);
    setTimeout(() => playAudioTrack(), 50);
  };

  const changeMood = (moodId) => {
    setCurrentMood(moodId);
    setTrackIndex(0);
    setTimeout(() => playAudioTrack(), 50);
  };

  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % playlist.length);
    setTimeout(() => playAudioTrack(), 50);
  };

  const prevTrack = () => {
    setTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setTimeout(() => playAudioTrack(), 50);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (newPercent) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (newPercent / 100) * duration;
    setProgress(newPercent);
  };

  return (
    <MoodMusicContext.Provider
      value={{
        selectedLanguage,
        currentMood,
        playlist,
        trackIndex,
        currentTrack,
        isPlaying,
        isWidgetOpen,
        progress,
        duration,
        isMuted,
        setIsWidgetOpen,
        togglePlay,
        changeLanguage,
        changeMood,
        nextTrack,
        prevTrack,
        toggleMute,
        handleSeek,
      }}
    >
      {children}
    </MoodMusicContext.Provider>
  );
}

export function useMoodMusic() {
  const context = useContext(MoodMusicContext);
  if (!context) {
    throw new Error('useMoodMusic must be used within MoodMusicProvider');
  }
  return context;
}

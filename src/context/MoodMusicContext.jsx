import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiMusicService } from '../services/apiMusicService.js';

const MoodMusicContext = createContext(null);

export function MoodMusicProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [trackIndex, setTrackIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState('');

  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const trackIndexRef = useRef(-1);
  const playAtRef = useRef(() => {});
  const nextRef = useRef(() => {});

  // Pre-load public catalog on startup if no active track is selected yet
  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        const response = await apiMusicService.getPublicTracks({ page: 0, size: 20 });
        const tracks = response?.content || response?.data?.content || [];
        if (active && Array.isArray(tracks) && tracks.length > 0 && !currentTrack) {
          const playable = tracks.filter((t) => t?.audioUrl);
          if (playable.length > 0) {
            queueRef.current = playable;
            trackIndexRef.current = 0;
            setQueue(playable);
            setTrackIndex(0);
            setCurrentTrack(playable[0]);
            if (audioRef.current && !audioRef.current.src) {
              audioRef.current.src = playable[0].audioUrl;
            }
          }
        }
      } catch (e) {
        // Silently ignore offline catalog load
      }
    };
    loadCatalog();
    return () => { active = false; };
  }, []);

  const playAt = useCallback(async (index, nextQueue = queueRef.current) => {
    const tracks = Array.isArray(nextQueue) ? nextQueue.filter((track) => track?.audioUrl) : [];
    if (!tracks.length) {
      setPlaybackError('This track has no playable audio source.');
      return;
    }

    const safeIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    const track = tracks[safeIndex];
    const audio = audioRef.current;
    if (!audio) return;

    queueRef.current = tracks;
    trackIndexRef.current = safeIndex;
    setQueue(tracks);
    setTrackIndex(safeIndex);
    setCurrentTrack(track);
    setPlaybackError('');
    setProgress(0);
    setDuration(track.durationSeconds || 0);
    setIsBuffering(true);
    setIsWidgetOpen(true);

    audio.src = track.audioUrl;
    audio.load();
    try {
      await audio.play();
    } catch (error) {
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError(error?.name === 'NotAllowedError'
        ? 'Playback was blocked by the browser. Press play to continue.'
        : 'Unable to play this track. Please try another track.');
    }
  }, []);

  playAtRef.current = playAt;

  const nextTrack = useCallback(() => {
    const tracks = queueRef.current;
    if (!tracks.length) return;
    playAtRef.current(trackIndexRef.current + 1, tracks);
  }, []);

  nextRef.current = nextTrack;

  const prevTrack = useCallback(() => {
    const tracks = queueRef.current;
    if (!tracks.length) return;
    playAtRef.current(trackIndexRef.current - 1, tracks);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 0.85;
    audioRef.current = audio;

    const updateTime = () => {
      const actualDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(actualDuration);
      setProgress(actualDuration ? (audio.currentTime / actualDuration) * 100 : 0);
    };
    const updateMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const markBuffering = () => setIsBuffering(true);
    const markPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError('');
    };
    const markPaused = () => setIsPlaying(false);
    const markReady = () => setIsBuffering(false);
    const markError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError('Unable to play this track. The audio may be unavailable.');
    };
    const handleEnded = () => nextRef.current();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateMetadata);
    audio.addEventListener('waiting', markBuffering);
    audio.addEventListener('stalled', markBuffering);
    audio.addEventListener('playing', markPlaying);
    audio.addEventListener('canplay', markReady);
    audio.addEventListener('pause', markPaused);
    audio.addEventListener('error', markError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, []);

  const playTrack = useCallback((track, visibleQueue = []) => {
    const tracks = visibleQueue.some((item) => item.id === track.id) ? visibleQueue : [track, ...visibleQueue];
    const index = tracks.findIndex((item) => item.id === track.id);
    return playAt(index < 0 ? 0 : index, tracks);
  }, [playAt]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setPlaybackError('');
    setIsBuffering(true);
    try {
      await audio.play();
    } catch {
      setIsBuffering(false);
      setPlaybackError('Unable to resume playback. Please try again.');
    }
  }, [currentTrack]);

  const handleSeek = useCallback((newPercent) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const percent = Math.min(100, Math.max(0, Number(newPercent)));
    audio.currentTime = (percent / 100) * audio.duration;
    setProgress(percent);
  }, []);

  const setVolume = useCallback((newVolume) => {
    const audio = audioRef.current;
    const safeVolume = Math.min(1, Math.max(0, Number(newVolume)));
    if (audio) {
      audio.volume = safeVolume;
      audio.muted = safeVolume === 0;
    }
    setVolumeState(safeVolume);
    setIsMuted(safeVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, []);

  return (
    <MoodMusicContext.Provider value={{
      queue,
      trackIndex,
      currentTrack,
      isPlaying,
      isWidgetOpen,
      progress,
      duration,
      volume,
      isMuted,
      isBuffering,
      playbackError,
      setIsWidgetOpen,
      playTrack,
      togglePlay,
      nextTrack,
      prevTrack,
      handleSeek,
      setVolume,
      toggleMute,
    }}>
      {children}
    </MoodMusicContext.Provider>
  );
}

export function useMoodMusic() {
  const context = useContext(MoodMusicContext);
  if (!context) throw new Error('useMoodMusic must be used within MoodMusicProvider');
  return context;
}

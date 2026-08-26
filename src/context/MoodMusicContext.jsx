import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { clearMusicSession, getMusicSessionUserId, readMusicSession, saveMusicSession } from '../utils/musicSession.js';
import { dedupeTracksById, locateCurrentTrack } from '../utils/musicQueue.js';
import { getMediaUrl } from '../config/env.js';
import defaultCoverAsset from '../assets/music-cover.jpg';
import {
  cycleRepeatMode,
  DEFAULT_PLAYBACK_MODES,
  derivePlaybackQueue,
  REPEAT_MODES,
  reshuffleForNextCycle,
  resolveNextAction,
  resolvePreviousAction,
} from '../utils/musicPlayback.js';

const MoodMusicContext = createContext(null);

export function MoodMusicProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const userId = getMusicSessionUserId(currentUser);
  const [sourceQueue, setSourceQueue] = useState([]);
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
  const [selectedMood, setSelectedMood] = useState(null);
  const [musicMode, setMusicMode] = useState('ALL');
  const [selectorCompleted, setSelectorCompleted] = useState(false);
  const [musicSessionReady, setMusicSessionReady] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(DEFAULT_PLAYBACK_MODES.shuffleEnabled);
  const [repeatMode, setRepeatMode] = useState(DEFAULT_PLAYBACK_MODES.repeatMode);

  const audioRef = useRef(null);
  const sourceQueueRef = useRef([]);
  const queueRef = useRef([]);
  const trackIndexRef = useRef(-1);
  const currentTrackRef = useRef(null);
  const playAtRef = useRef(() => {});
  const nextRef = useRef(() => {});
  const identityRef = useRef(null);
  const shuffleEnabledRef = useRef(false);
  const repeatModeRef = useRef(REPEAT_MODES.OFF);

  const resetPlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
    sourceQueueRef.current = [];
    queueRef.current = [];
    trackIndexRef.current = -1;
    currentTrackRef.current = null;
    setSourceQueue([]); setQueue([]); setTrackIndex(-1); setCurrentTrack(null); setIsPlaying(false); setIsWidgetOpen(false);
    setProgress(0); setDuration(0); setIsBuffering(false); setPlaybackError('');
    shuffleEnabledRef.current = false; repeatModeRef.current = REPEAT_MODES.OFF;
    setShuffleEnabled(DEFAULT_PLAYBACK_MODES.shuffleEnabled); setRepeatMode(DEFAULT_PLAYBACK_MODES.repeatMode);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const previousId = identityRef.current;
    if (previousId !== null && previousId !== userId) {
      clearMusicSession(previousId);
      resetPlayer();
    }
    identityRef.current = userId;
    const session = readMusicSession(userId);
    setSelectedMood(session.selectedMood);
    setMusicMode(session.mode);
    setSelectorCompleted(session.selectorCompleted);
    setMusicSessionReady(true);
    if (userId === null) resetPlayer();
  }, [authLoading, resetPlayer, userId]);

  const completeMoodSelection = useCallback((mood) => {
    const session = saveMusicSession(userId, mood);
    setSelectedMood(session.selectedMood);
    setMusicMode(session.mode);
    setSelectorCompleted(session.selectorCompleted);
  }, [userId]);

  const playAt = useCallback(async (index, nextQueue = queueRef.current) => {
    const tracks = Array.isArray(nextQueue) ? nextQueue.filter((track) => track?.audioUrl) : [];
    if (!tracks.length) {
      setPlaybackError('This track has no playable audio source.');
      return;
    }

    const safeIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    const targetTrack = tracks[safeIndex];
    const resolvedUrl = getMediaUrl(targetTrack.audioUrl || targetTrack.publicAudioUrl || targetTrack.privateAudioUrl);
    const resolvedCover = targetTrack.coverUrl ? getMediaUrl(targetTrack.coverUrl) : defaultCoverAsset;
    
    const track = {
      ...targetTrack,
      audioUrl: resolvedUrl,
      coverUrl: resolvedCover,
    };

    const audio = audioRef.current;
    if (!audio) return;

    queueRef.current = tracks;
    trackIndexRef.current = safeIndex;
    setQueue(tracks);
    setTrackIndex(safeIndex);
    currentTrackRef.current = track;
    setCurrentTrack(track);
    setPlaybackError('');
    setProgress(0);
    setDuration(track.durationSeconds || 0);
    setIsBuffering(true);
    setIsWidgetOpen(true);

    audio.src = resolvedUrl;
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

  const replayCurrent = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current) return;
    audio.currentTime = 0;
    setProgress(0);
    setPlaybackError('');
    setIsBuffering(true);
    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError('Unable to replay this track. Please try another track.');
    }
  }, []);

  const advanceTrack = useCallback((naturalEnd = false) => {
    const tracks = queueRef.current;
    if (!tracks.length) return;
    const action = resolveNextAction({
      index: trackIndexRef.current,
      queueLength: tracks.length,
      repeatMode: repeatModeRef.current,
      naturalEnd,
    });
    if (action.type === 'REPLAY') {
      replayCurrent();
      return;
    }
    if (action.type === 'WRAP' && shuffleEnabledRef.current) {
      const reshuffled = reshuffleForNextCycle(sourceQueueRef.current, currentTrackRef.current);
      queueRef.current = reshuffled;
      setQueue(reshuffled);
      trackIndexRef.current = 0;
      setTrackIndex(0);
      playAtRef.current(0, reshuffled);
      return;
    }
    if (action.type === 'PLAY' || action.type === 'WRAP') {
      playAtRef.current(action.index, tracks);
      return;
    }
    if (naturalEnd) {
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [replayCurrent]);

  const nextTrack = useCallback(() => advanceTrack(false), [advanceTrack]);

  nextRef.current = advanceTrack;

  const prevTrack = useCallback(() => {
    const tracks = queueRef.current;
    if (!tracks.length) return;
    const action = resolvePreviousAction({
      index: trackIndexRef.current,
      queueLength: tracks.length,
      repeatMode: repeatModeRef.current,
    });
    if (action.type === 'PLAY' || action.type === 'WRAP') playAtRef.current(action.index, tracks);
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
    const handleEnded = () => nextRef.current(true);

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
    const playbackIndex = queueRef.current.findIndex((item) => item.id === track.id);
    if (playbackIndex >= 0) return playAt(playbackIndex, queueRef.current);

    const browsingQueue = dedupeTracksById(
      visibleQueue.some((item) => item.id === track.id) ? visibleQueue : [track, ...visibleQueue],
    ).filter((item) => item?.audioUrl);
    sourceQueueRef.current = browsingQueue;
    setSourceQueue(browsingQueue);
    const tracks = derivePlaybackQueue({
      sourceQueue: browsingQueue,
      shuffleEnabled: shuffleEnabledRef.current,
      currentTrack: track,
    });
    const index = tracks.findIndex((item) => item.id === track.id);
    return playAt(index < 0 ? 0 : index, tracks);
  }, [playAt]);

  const replaceQueuePreservingCurrentTrack = useCallback((newQueue) => {
    const source = dedupeTracksById(newQueue).filter((track) => track?.audioUrl);
    const current = currentTrackRef.current;
    const tracks = derivePlaybackQueue({
      sourceQueue: source,
      shuffleEnabled: shuffleEnabledRef.current,
      currentTrack: current,
    });
    const nextIndex = locateCurrentTrack(tracks, current);
    sourceQueueRef.current = source;
    queueRef.current = tracks;
    trackIndexRef.current = nextIndex;
    setSourceQueue(source);
    setQueue(tracks);
    setTrackIndex(nextIndex);
    if (!tracks.length && !current) {
      currentTrackRef.current = null;
      setCurrentTrack(null);
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    const enabled = !shuffleEnabledRef.current;
    const tracks = derivePlaybackQueue({
      sourceQueue: sourceQueueRef.current,
      shuffleEnabled: enabled,
      currentTrack: currentTrackRef.current,
    });
    const nextIndex = locateCurrentTrack(tracks, currentTrackRef.current);
    shuffleEnabledRef.current = enabled;
    queueRef.current = tracks;
    trackIndexRef.current = nextIndex;
    setShuffleEnabled(enabled);
    setQueue(tracks);
    setTrackIndex(nextIndex);
  }, []);

  const changeRepeatMode = useCallback(() => {
    const nextMode = cycleRepeatMode(repeatModeRef.current);
    repeatModeRef.current = nextMode;
    setRepeatMode(nextMode);
  }, []);

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

  const accountStateReady = identityRef.current === userId;

  return (
    <MoodMusicContext.Provider value={{
      sourceQueue: accountStateReady ? sourceQueue : [],
      playbackQueue: accountStateReady ? queue : [],
      queue: accountStateReady ? queue : [],
      trackIndex: accountStateReady ? trackIndex : -1,
      currentTrack: accountStateReady ? currentTrack : null,
      isPlaying: accountStateReady ? isPlaying : false,
      isWidgetOpen: accountStateReady ? isWidgetOpen : false,
      progress,
      duration,
      volume,
      isMuted,
      isBuffering,
      playbackError,
      selectedMood: accountStateReady ? selectedMood : null,
      musicMode: accountStateReady ? musicMode : 'ALL',
      selectorCompleted: accountStateReady ? selectorCompleted : false,
      musicSessionReady: accountStateReady ? musicSessionReady : false,
      musicSessionUserId: accountStateReady ? userId : null,
      shuffleEnabled: accountStateReady ? shuffleEnabled : false,
      repeatMode: accountStateReady ? repeatMode : REPEAT_MODES.OFF,
      setIsWidgetOpen,
      playTrack,
      replaceQueuePreservingCurrentTrack,
      toggleShuffle,
      cycleRepeatMode: changeRepeatMode,
      togglePlay,
      nextTrack,
      prevTrack,
      playNext: nextTrack,
      playPrevious: prevTrack,
      handleSeek,
      currentTime: duration > 0 ? (progress / 100) * duration : 0,
      seekTo: (seconds) => handleSeek(duration > 0 ? (seconds / duration) * 100 : 0),
      setVolume,
      toggleMute,
      completeMoodSelection,
      resetPlayer,
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

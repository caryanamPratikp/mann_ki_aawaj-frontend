import React from 'react';
import { LoaderCircle, Music2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import defaultCover from '../../assets/default-music-cover.svg';
import '../../styles/music.css';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export function MoodMusicWidget() {
  const music = useMoodMusic();
  if (!music.currentTrack) return null;

  const currentSeconds = music.duration * (music.progress / 100);

  if (!music.isWidgetOpen) {
    return (
      <button className="music-player-bubble" type="button" onClick={() => music.setIsWidgetOpen(true)} aria-label="Open music player">
        <img src={music.currentTrack.coverUrl || defaultCover} alt="" />
        <span>{music.currentTrack.title}</span>
        {music.isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
    );
  }

  return (
    <section className="music-player" aria-label="Music player">
      <button className="music-icon-button music-player-close" type="button" onClick={() => music.setIsWidgetOpen(false)} aria-label="Minimize music player">
        <X size={18} />
      </button>
      <div className="music-player-track">
        <img src={music.currentTrack.coverUrl || defaultCover} alt={`${music.currentTrack.title} cover`} />
        <div>
          <strong>{music.currentTrack.title}</strong>
          <span>{music.currentTrack.artist || 'Unknown artist'}</span>
        </div>
      </div>

      {music.playbackError && <p className="music-player-error" role="alert">{music.playbackError}</p>}

      <label className="music-seek-label">
        <span>{formatTime(currentSeconds)}</span>
        <input aria-label="Seek track" type="range" min="0" max="100" step="0.1" value={music.progress || 0} onChange={(event) => music.handleSeek(event.target.value)} />
        <span>{formatTime(music.duration)}</span>
      </label>

      <div className="music-player-controls">
        <button className="music-icon-button" type="button" onClick={music.prevTrack} aria-label="Previous track"><SkipBack size={20} /></button>
        <button className="music-play-button" type="button" onClick={music.togglePlay} aria-label={music.isPlaying ? 'Pause' : 'Play'}>
          {music.isBuffering ? <LoaderCircle className="music-spin" size={22} /> : music.isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button className="music-icon-button" type="button" onClick={music.nextTrack} aria-label="Next track"><SkipForward size={20} /></button>
        <button className="music-icon-button" type="button" onClick={music.toggleMute} aria-label={music.isMuted ? 'Unmute' : 'Mute'}>
          {music.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input className="music-volume" aria-label="Volume" type="range" min="0" max="1" step="0.05" value={music.isMuted ? 0 : music.volume} onChange={(event) => music.setVolume(event.target.value)} />
      </div>
      <Music2 className="music-player-watermark" aria-hidden="true" />
    </section>
  );
}

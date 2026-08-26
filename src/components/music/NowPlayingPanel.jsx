import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Heart } from 'lucide-react';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import defaultCover from '../../assets/music-cover.jpg';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function NowPlayingPanel() {
  const music = useMoodMusic();
  const {
    currentTrack,
    isPlaying,
    progress = 0,
    duration = 0,
    togglePlay,
    nextTrack,
    prevTrack,
    handleSeek,
    shuffleEnabled,
    toggleShuffle,
    repeatMode = 'OFF',
    cycleRepeatMode,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = music;

  const currentTime = duration > 0 ? (progress / 100) * duration : 0;

  const handleProgressChange = (event) => {
    const newPercent = parseFloat(event.target.value);
    if (handleSeek) {
      handleSeek(newPercent);
    }
  };

  return (
    <aside className="now-playing-panel-card">
      <h3 className="panel-heading">Now Playing</h3>

      <div className="vinyl-cover-wrapper">
        <div className={`vinyl-record ${isPlaying ? 'spinning' : ''}`}>
          <div className="vinyl-grooves" />
        </div>
        <img
          className="vinyl-album-art"
          src={currentTrack?.coverUrl || defaultCover}
          alt={currentTrack?.title || 'Album cover'}
        />
      </div>

      <div className="track-details-row">
        <div>
          <h4 className="track-title-label" title={currentTrack?.title || 'No track playing'}>
            {currentTrack?.title || 'No track playing'}
          </h4>
          <p className="track-artist-label" title={currentTrack?.artist || 'Choose a track to play'}>
            {currentTrack?.artist || 'Choose a track to play'}
          </p>
        </div>
      </div>

      {/* Progress Slider */}
      <div className="now-playing-progress-group">
        <input
          type="range"
          className="progress-slider"
          min="0"
          max="100"
          step="0.1"
          value={isNaN(progress) ? 0 : progress}
          onChange={handleProgressChange}
          disabled={!currentTrack || !duration}
        />
        <div className="progress-time-labels">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Transport Controls */}
      <div className="transport-controls-row">
        <button
          className={`transport-btn ${shuffleEnabled ? 'active' : ''}`}
          type="button"
          onClick={toggleShuffle}
          title="Toggle Shuffle"
        >
          <Shuffle size={16} />
        </button>

        <button
          className="transport-btn"
          type="button"
          onClick={prevTrack}
          disabled={!currentTrack}
          title="Previous Track"
        >
          <SkipBack size={18} />
        </button>

        <button
          className="transport-play-btn"
          type="button"
          onClick={togglePlay}
          disabled={!currentTrack}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
        </button>

        <button
          className="transport-btn"
          type="button"
          onClick={nextTrack}
          disabled={!currentTrack}
          title="Next Track"
        >
          <SkipForward size={18} />
        </button>

        <button
          className={`transport-btn ${repeatMode !== 'OFF' ? 'active' : ''}`}
          type="button"
          onClick={cycleRepeatMode}
          title="Toggle Repeat"
        >
          <Repeat size={16} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="volume-control-row">
        <button className="volume-btn" type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
    </aside>
  );
}

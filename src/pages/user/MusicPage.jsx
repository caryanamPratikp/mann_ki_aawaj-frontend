import React, { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Music2, Pause, Play, RefreshCw, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { apiMusicService } from '../../services/apiMusicService.js';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import defaultCover from '../../assets/music-cover.jpg';
import '../../styles/music.css';
import { MyTracksPanel } from '../../components/music/MyTracksPanel.jsx';

const LANGUAGES = ['EN', 'HI', 'BN', 'MR', 'TE', 'TA', 'GU', 'UR', 'KN', 'OR', 'ML', 'PA', 'AS', 'SAT', 'KS', 'MNI', 'DOI', 'BHO'];
const MOODS = ['ROMANTIC', 'CALM', 'ENERGETIC', 'CONFUSED', 'MELANCHOLY', 'FOCUS'];

function TrackCard({ track, queue }) {
  const music = useMoodMusic();
  const active = music.currentTrack?.id === track.id;
  const playing = active && music.isPlaying;
  return (
    <article className="music-card">
      <div className="music-card-cover">
        <img src={track.coverUrl || defaultCover} alt={`${track.title} cover`} />
        <button className="music-card-play" type="button" onClick={() => active ? music.togglePlay() : music.playTrack(track, queue)} aria-label={`${playing ? 'Pause' : 'Play'} ${track.title}`}>
          {active && music.isBuffering ? <LoaderCircle className="music-spin" size={20} /> : playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
      <div className="music-card-body">
        <strong title={track.title}>{track.title}</strong>
        <span title={track.artist}>{track.artist || 'Unknown artist'}</span>
        <div className="music-tags">
          {track.language && <span className="music-tag">{track.language}</span>}
          {track.mood && <span className="music-tag">{track.mood}</span>}
          {track.genre && <span className="music-tag">{track.genre}</span>}
        </div>
      </div>
    </article>
  );
}

export function MusicPage({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(0);
  const [view, setView] = useState('browse');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => setPage(0), [debouncedQuery, language, mood, genre]);

  const filters = useMemo(() => ({ query: debouncedQuery, language, mood, genre: genre.trim(), page, size: 20 }), [debouncedQuery, language, mood, genre, page]);
  const tracksQuery = useQuery({
    queryKey: ['public-music', filters],
    queryFn: () => apiMusicService.getPublicTracks(filters),
  });
  const featuredQuery = useQuery({
    queryKey: ['featured-music'],
    queryFn: () => apiMusicService.getPublicTracks({ featured: true, page: 0, size: 8 }),
  });

  const tracks = tracksQuery.data?.content || [];
  const featured = featuredQuery.data?.content || [];
  const hasFilters = Boolean(debouncedQuery || language || mood || genre.trim());

  return (
    <UserLayout activeRoute="/music" onNavigate={onNavigate} wide>
      <div className="music-page">
        <header className="music-page-header">
          <div>
            <h1>Music</h1>
            <p>Discover and enjoy music published by Mann Ki Aavaj.</p>
          </div>
          <div className="music-page-tabs"><button className={view === 'browse' ? 'active' : ''} type="button" onClick={() => setView('browse')}>Browse Music</button><button className={view === 'mine' ? 'active' : ''} type="button" onClick={() => setView('mine')}>My Tracks</button><Music2 size={30} color="#6f405f" aria-hidden="true" /></div>
        </header>

        {view === 'mine' && <MyTracksPanel />}

        {view === 'browse' && !featuredQuery.isLoading && !featuredQuery.isError && featured.length > 0 && (
          <section className="music-section" aria-labelledby="featured-music-title">
            <div className="music-section-heading">
              <div><h2 id="featured-music-title">Featured</h2><p>Selected music from our catalog.</p></div>
            </div>
            <div className="music-grid">{featured.map((track) => <TrackCard key={track.id} track={track} queue={featured} />)}</div>
          </section>
        )}

        {view === 'browse' && <section className="music-section" aria-labelledby="all-music-title">
          <div className="music-section-heading"><div><h2 id="all-music-title">Browse all</h2><p>Search and filter the published catalog.</p></div></div>
          <div className="music-toolbar">
            <label className="music-field"><span>Search</span><div style={{ position: 'relative' }}><Search size={17} style={{ position: 'absolute', left: 12, top: 12, color: '#756966' }} /><input style={{ paddingLeft: 38 }} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or artist" /></div></label>
            <label className="music-field"><span>Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="">All languages</option>{LANGUAGES.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="music-field"><span>Mood</span><select value={mood} onChange={(event) => setMood(event.target.value)}><option value="">All moods</option>{MOODS.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="music-field"><span>Genre</span><input value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="Any genre" /></label>
          </div>

          {tracksQuery.isLoading ? (
            <div className="music-loading"><LoaderCircle className="music-spin" aria-label="Loading music" /></div>
          ) : tracksQuery.isError ? (
            <div className="music-error"><div><p>Unable to load music.</p><button className="music-secondary" type="button" onClick={() => tracksQuery.refetch()}><RefreshCw size={15} /> Retry</button></div></div>
          ) : tracks.length === 0 ? (
            <div className="music-empty"><p>{hasFilters ? 'No tracks match your search or filters.' : 'No music available yet.'}</p></div>
          ) : (
            <><div className="music-grid" style={{ marginTop: 20 }}>{tracks.map((track) => <TrackCard key={track.id} track={track} queue={tracks} />)}</div>
              <div className="music-pagination"><button className="music-secondary" type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page + 1} of {Math.max(1, tracksQuery.data?.totalPages || 1)}</span><button className="music-secondary" type="button" disabled={page + 1 >= (tracksQuery.data?.totalPages || 1)} onClick={() => setPage((value) => value + 1)}>Next</button></div></>
          )}
        </section>}
      </div>
    </UserLayout>
  );
}

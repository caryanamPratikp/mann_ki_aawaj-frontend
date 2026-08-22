import React, { useEffect, useState } from 'react';
import { LoaderCircle, Pause, Play, Plus, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMusicService } from '../../services/apiMusicService.js';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import defaultCover from '../../assets/default-music-cover.svg';

const LANGUAGES = ['EN', 'HI', 'BN', 'MR', 'TE', 'TA', 'GU', 'UR', 'KN', 'OR', 'ML', 'PA', 'AS', 'SAT', 'KS', 'MNI', 'DOI', 'BHO'];
const MOODS = ['ROMANTIC', 'CALM', 'ENERGETIC', 'CONFUSED', 'MELANCHOLY', 'FOCUS'];
const STATUS_LABELS = { PENDING_REVIEW: 'Pending Review', PUBLISHED: 'Published', REJECTED: 'Rejected', UNPUBLISHED: 'Unpublished' };
const EMPTY = { title: '', artistName: '', language: 'HI', mood: 'CALM', genre: '', description: '', originalWorkConfirmed: false, rightsConfirmed: false, audio: null, cover: null };

function MyCover({ track }) {
  const [url, setUrl] = useState(track.publicCoverUrl || '');
  useEffect(() => {
    let objectUrl = '';
    let active = true;
    if (track.publicCoverUrl || !track.privateCoverUrl) return undefined;
    apiMusicService.getMyCoverBlob(track.id).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => setUrl(''));
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [track.id, track.privateCoverUrl, track.publicCoverUrl]);
  return <img src={url || defaultCover} alt={`${track.title} cover`} />;
}

function UserTrackForm({ mode, track, busy, progress, onClose, onSave }) {
  const [form, setForm] = useState(() => track ? { title: track.title, artistName: track.artist, language: track.language, mood: track.mood, genre: track.genre || '', description: track.description || '' } : EMPTY);
  const [error, setError] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview); }, [coverPreview]);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const audio = (file) => {
    setError('');
    if (!file) return change('audio', null);
    if (!file.name.toLowerCase().endsWith('.mp3') && !['audio/mpeg', 'audio/mp3'].includes(file.type)) return setError('Please select an MP3 file.');
    if (file.size > 40 * 1024 * 1024) return setError('Audio must be 40 MB or smaller.');
    change('audio', file);
  };
  const cover = (file) => {
    setError('');
    if (!file) return change('cover', null);
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setError('Cover must be JPEG or PNG.');
    if (file.size > 5 * 1024 * 1024) return setError('Cover must be 5 MB or smaller.');
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file)); change('cover', file);
  };
  const submit = (event) => {
    event.preventDefault();
    if (mode === 'upload' && !form.audio) return setError('An MP3 audio file is required.');
    if (mode === 'upload' && (!form.originalWorkConfirmed || !form.rightsConfirmed)) return setError('Both rights declarations are required.');
    onSave(form);
  };
  return <div className="music-modal-backdrop" role="presentation"><form className="music-modal" onSubmit={submit} aria-labelledby="user-track-form-title">
    <div className="music-modal-header"><h2 id="user-track-form-title">{mode === 'upload' ? 'Upload Your Track' : 'Edit Track'}</h2><button className="music-icon-button" type="button" onClick={onClose} aria-label="Close"><X /></button></div>
    <p className="music-file-note">Only upload music you created or have permission to share. Every upload is reviewed before publication.</p>
    <div className="music-form-grid">
      <label className="music-field"><span>Title *</span><input required maxLength="150" value={form.title} onChange={(e) => change('title', e.target.value)} /></label>
      <label className="music-field"><span>Artist name *</span><input required maxLength="150" value={form.artistName} onChange={(e) => change('artistName', e.target.value)} /></label>
      <label className="music-field"><span>Language *</span><select value={form.language} onChange={(e) => change('language', e.target.value)}>{LANGUAGES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="music-field"><span>Mood *</span><select value={form.mood} onChange={(e) => change('mood', e.target.value)}>{MOODS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="music-field full"><span>Genre</span><input maxLength="80" value={form.genre} onChange={(e) => change('genre', e.target.value)} /></label>
      <label className="music-field full"><span>Description</span><textarea rows="3" maxLength="1000" value={form.description} onChange={(e) => change('description', e.target.value)} /></label>
      {mode === 'upload' && <><label className="music-field full"><span>MP3 * (max 40 MB)</span><input type="file" required accept="audio/mpeg,.mp3" onChange={(e) => audio(e.target.files?.[0])} />{form.audio && <small>{form.audio.name} — {(form.audio.size / 1024 / 1024).toFixed(1)} MB</small>}</label>
        <label className="music-field full"><span>Cover (optional, JPEG/PNG, max 5 MB)</span><input type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={(e) => cover(e.target.files?.[0])} />{coverPreview && <img className="music-cover-preview" src={coverPreview} alt="Selected cover preview" />}</label>
        <label className="music-checkbox full"><input type="checkbox" checked={form.originalWorkConfirmed} onChange={(e) => change('originalWorkConfirmed', e.target.checked)} /> I confirm I created this track or have permission to upload it.</label>
        <label className="music-checkbox full"><input type="checkbox" checked={form.rightsConfirmed} onChange={(e) => change('rightsConfirmed', e.target.checked)} /> I understand unauthorized copyrighted material may be removed.</label></>}
    </div>
    {error && <p className="music-player-error" role="alert">{error}</p>}{busy && mode === 'upload' && <p className="music-file-note">Uploading… {progress}%</p>}
    <div className="music-form-actions"><button className="music-secondary" type="button" onClick={onClose} disabled={busy}>Cancel</button><button className="music-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : mode === 'upload' ? 'Upload for review' : 'Save metadata'}</button></div>
  </form></div>;
}

function PrivatePreview({ track, onClose }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let objectUrl = ''; let active = true;
    apiMusicService.getMyAudioBlob(track.id).then((blob) => { if (active) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); } }).catch((err) => setError(err.message));
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [track.id]);
  return <div className="music-modal-backdrop"><section className="music-modal" role="dialog" aria-modal="true" aria-labelledby="my-preview-title"><div className="music-modal-header"><h2 id="my-preview-title">{track.title}</h2><button className="music-icon-button" onClick={onClose} aria-label="Close preview"><X /></button></div><p><span className={`music-status ${track.status?.toLowerCase()}`}>{STATUS_LABELS[track.status] || track.status}</span></p>{track.rejectionReason && <p className="music-rejection"><strong>Reason:</strong> {track.rejectionReason}</p>}{error ? <p className="music-player-error">{error}</p> : url ? <audio className="music-preview-audio" src={url} controls /> : <div className="music-loading"><LoaderCircle className="music-spin" /></div>}</section></div>;
}

export function MyTracksPanel() {
  const { addToast } = useToast();
  const music = useMoodMusic();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => setPage(0), [status]);
  const query = useQuery({ queryKey: ['my-music', status, page], queryFn: () => apiMusicService.getMyTracks({ status, page, size: 12 }) });
  const detail = useQuery({ queryKey: ['my-music-detail', modal?.track?.id], queryFn: () => apiMusicService.getMyTrack(modal.track.id), enabled: modal?.mode === 'edit' });
  const mutation = useMutation({
    mutationFn: async ({ action, form, track }) => {
      if (action === 'upload') { const data = new FormData(); ['title','artistName','language','mood','genre','description','originalWorkConfirmed','rightsConfirmed'].forEach((key) => data.append(key, form[key] ?? '')); data.append('audio', form.audio); if (form.cover) data.append('cover', form.cover); return apiMusicService.uploadMyTrack(data, (e) => setProgress(e.total ? Math.round(e.loaded / e.total * 100) : 0)); }
      if (action === 'edit') return apiMusicService.updateMyTrack(track.id, { title: form.title, artistName: form.artistName, language: form.language, mood: form.mood, genre: form.genre, description: form.description });
      return apiMusicService.deleteMyTrack(track.id);
    },
    onSuccess: async (_, variables) => { await Promise.all([queryClient.invalidateQueries({ queryKey: ['my-music'] }), queryClient.invalidateQueries({ queryKey: ['my-music-detail'] })]); addToast(variables.action === 'upload' ? 'Uploaded successfully. Your track is pending admin review.' : variables.action === 'edit' ? 'Track metadata updated.' : 'Track deleted.', 'success'); setModal(null); setProgress(0); },
    onError: (error) => addToast(error.message, 'error'),
  });
  const tracks = query.data?.content || [];
  return <section className="music-section" aria-labelledby="my-tracks-title">
    <div className="music-section-heading"><div><h2 id="my-tracks-title">My Tracks</h2><p>Your original uploads and review status.</p></div><button className="music-primary" type="button" onClick={() => setModal({ mode: 'upload' })}><Plus size={16} /> Upload Your Track</button></div>
    <label className="music-field music-status-filter"><span>Status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{Object.entries(STATUS_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {query.isLoading ? <div className="music-loading"><LoaderCircle className="music-spin" /></div> : query.isError ? <div className="music-error"><p>{query.error.message}</p></div> : tracks.length === 0 ? <div className="music-empty"><p>No tracks found. Upload your original music when you are ready.</p></div> : <div className="my-tracks-list">{tracks.map((track) => { const active = music.currentTrack?.id === track.id; return <article className="my-track-row" key={track.id}><div className="admin-track-cell"><MyCover track={track} /><div><strong>{track.title}</strong><span>{track.artist}</span></div></div><div><span className={`music-status ${track.status?.toLowerCase()}`}>{STATUS_LABELS[track.status] || track.status}</span>{track.rejectionReason && <p className="music-rejection">Reason: {track.rejectionReason}</p>}</div><div className="admin-music-actions"><button onClick={() => setPreview(track)}>Preview</button>{track.status === 'PUBLISHED' && <button onClick={() => active ? music.togglePlay() : music.playTrack({ ...track, audioUrl: track.publicAudioUrl, coverUrl: track.publicCoverUrl }, tracks.filter((item) => item.status === 'PUBLISHED').map((item) => ({ ...item, audioUrl: item.publicAudioUrl, coverUrl: item.publicCoverUrl })))}>{active && music.isPlaying ? <Pause size={13} /> : <Play size={13} />} Play</button>}{track.status === 'PENDING_REVIEW' && <button onClick={() => setModal({ mode: 'edit', track })}>Edit</button>}{['PENDING_REVIEW','REJECTED'].includes(track.status) && <button onClick={() => { if (window.confirm(`Delete “${track.title}”?`)) mutation.mutate({ action: 'delete', track }); }}>Delete</button>}</div></article>; })}</div>}
    <div className="music-pagination"><button className="music-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button><span>Page {page + 1} of {Math.max(1, query.data?.totalPages || 1)}</span><button className="music-secondary" disabled={page + 1 >= (query.data?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>Next</button></div>
    {modal?.mode === 'upload' && <UserTrackForm mode="upload" busy={mutation.isPending} progress={progress} onClose={() => setModal(null)} onSave={(form) => mutation.mutate({ action: 'upload', form })} />}
    {modal?.mode === 'edit' && detail.isLoading && <div className="music-modal-backdrop"><div className="music-modal music-loading"><LoaderCircle className="music-spin" /></div></div>}
    {modal?.mode === 'edit' && detail.data && <UserTrackForm mode="edit" track={detail.data} busy={mutation.isPending} onClose={() => setModal(null)} onSave={(form) => mutation.mutate({ action: 'edit', track: detail.data, form })} />}
    {modal?.mode === 'edit' && detail.isError && <div className="music-modal-backdrop"><div className="music-modal music-error"><p>{detail.error.message}</p><button onClick={() => setModal(null)}>Close</button></div></div>}
    {preview && <PrivatePreview track={preview} onClose={() => setPreview(null)} />}
  </section>;
}

import React, { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Plus, RefreshCw, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { apiMusicService } from '../../services/apiMusicService.js';
import { useToast } from '../../context/ToastContext.jsx';
import defaultCover from '../../assets/default-music-cover.svg';
import '../../styles/music.css';

const LANGUAGES = ['EN', 'HI', 'BN', 'MR', 'TE', 'TA', 'GU', 'UR', 'KN', 'OR', 'ML', 'PA', 'AS', 'SAT', 'KS', 'MNI', 'DOI', 'BHO'];
const MOODS = ['ROMANTIC', 'CALM', 'ENERGETIC', 'CONFUSED', 'MELANCHOLY', 'FOCUS'];
const STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNPUBLISHED', 'REJECTED'];
const EMPTY_FORM = { title: '', artistName: '', language: 'HI', mood: 'CALM', genre: '', description: '', featured: false, sortOrder: 0, audio: null, cover: null };

function PrivateCover({ track }) {
  const [url, setUrl] = useState(track.coverUrl || '');
  useEffect(() => {
    let objectUrl = '';
    let active = true;
    if (!track.id || track.coverUrl) return undefined;
    apiMusicService.getAdminCoverBlob(track.id).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => setUrl(''));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [track.id, track.coverUrl]);
  return <img src={url || defaultCover} alt={`${track.title} cover`} />;
}

function TrackFormModal({ mode, track, saving, progress, onClose, onSave }) {
  const [form, setForm] = useState(() => track ? {
    title: track.title || '', artistName: track.artist || '', language: track.language || 'HI', mood: track.mood || 'CALM',
    genre: track.genre || '', description: track.description || '', featured: Boolean(track.featured), sortOrder: track.sortOrder ?? 0,
    audio: null, cover: null,
  } : EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview); }, [coverPreview]);

  const change = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const chooseAudio = (file) => {
    setFormError('');
    if (!file) return change('audio', null);
    if (!['audio/mpeg', 'audio/mp3'].includes(file.type) && !file.name.toLowerCase().endsWith('.mp3')) return setFormError('Please select an MP3 audio file.');
    if (file.size > 40 * 1024 * 1024) return setFormError('Audio file must be 40 MB or smaller.');
    change('audio', file);
  };
  const chooseCover = (file) => {
    setFormError('');
    if (!file) return change('cover', null);
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setFormError('Cover must be a JPEG or PNG image.');
    if (file.size > 5 * 1024 * 1024) return setFormError('Cover image must be 5 MB or smaller.');
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
    change('cover', file);
  };
  const submit = (event) => {
    event.preventDefault();
    if (mode === 'upload' && !form.audio) return setFormError('An MP3 audio file is required.');
    onSave(form);
  };

  return (
    <div className="music-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="music-modal" onSubmit={submit} aria-labelledby="music-form-title">
        <div className="music-modal-header"><h2 id="music-form-title">{mode === 'upload' ? 'Upload track' : 'Edit metadata'}</h2><button className="music-icon-button" type="button" onClick={onClose} aria-label="Close"><X /></button></div>
        <div className="music-form-grid">
          <label className="music-field"><span>Title *</span><input required maxLength="150" value={form.title} onChange={(e) => change('title', e.target.value)} /></label>
          <label className="music-field"><span>Artist *</span><input required maxLength="150" value={form.artistName} onChange={(e) => change('artistName', e.target.value)} /></label>
          <label className="music-field"><span>Language *</span><select required value={form.language} onChange={(e) => change('language', e.target.value)}>{LANGUAGES.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="music-field"><span>Mood *</span><select required value={form.mood} onChange={(e) => change('mood', e.target.value)}>{MOODS.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="music-field"><span>Genre</span><input maxLength="80" value={form.genre} onChange={(e) => change('genre', e.target.value)} /></label>
          <label className="music-field"><span>Sort order</span><input type="number" min="0" value={form.sortOrder} onChange={(e) => change('sortOrder', Number(e.target.value))} /></label>
          <label className="music-field full"><span>Description</span><textarea rows="4" maxLength="1000" value={form.description} onChange={(e) => change('description', e.target.value)} /></label>
          <label className="music-checkbox"><input type="checkbox" checked={form.featured} onChange={(e) => change('featured', e.target.checked)} /> Featured track</label>
          {mode === 'upload' && <>
            <label className="music-field full"><span>Audio file * (MP3, max 40 MB)</span><input required accept="audio/mpeg,.mp3" type="file" onChange={(e) => chooseAudio(e.target.files?.[0])} />{form.audio && <small className="music-file-note">{form.audio.name} — {(form.audio.size / 1024 / 1024).toFixed(1)} MB</small>}</label>
            <label className="music-field full"><span>Cover (optional, JPEG/PNG, max 5 MB)</span><input accept="image/jpeg,image/png,.jpg,.jpeg,.png" type="file" onChange={(e) => chooseCover(e.target.files?.[0])} />{coverPreview && <img className="music-cover-preview" src={coverPreview} alt="Selected cover preview" />}</label>
          </>}
        </div>
        {formError && <p className="music-player-error" role="alert">{formError}</p>}
        {saving && mode === 'upload' && <p className="music-file-note">Uploading… {progress}%</p>}
        <div className="music-form-actions"><button className="music-secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="music-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : mode === 'upload' ? 'Upload and publish' : 'Save changes'}</button></div>
      </form>
    </div>
  );
}

function PreviewModal({ track, onClose }) {
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let url = '';
    let active = true;
    apiMusicService.getAdminAudioBlob(track.id).then((blob) => {
      if (!active) return;
      url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }).catch((requestError) => setError(requestError.message));
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [track.id]);
  return <div className="music-modal-backdrop" role="presentation"><section className="music-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title"><div className="music-modal-header"><h2 id="preview-title">Preview: {track.title}</h2><button className="music-icon-button" type="button" onClick={onClose} aria-label="Close preview"><X /></button></div>{error ? <p className="music-player-error" role="alert">{error}</p> : audioUrl ? <audio className="music-preview-audio" src={audioUrl} controls autoPlay={false}>Your browser does not support audio.</audio> : <div className="music-loading"><LoaderCircle className="music-spin" /></div>}</section></div>;
}

function RejectModal({ track, busy, onClose, onReject }) {
  const [reason, setReason] = useState('');
  return <div className="music-modal-backdrop"><form className="music-modal" onSubmit={(event) => { event.preventDefault(); onReject(reason.trim()); }} aria-labelledby="reject-track-title"><div className="music-modal-header"><h2 id="reject-track-title">Reject {track.title}</h2><button className="music-icon-button" type="button" onClick={onClose} aria-label="Close"><X /></button></div><label className="music-field"><span>Reason *</span><textarea required maxLength="500" rows="5" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this track was not approved" /></label><p className="music-file-note">This reason will be visible to the uploader. The private media will be retained until they delete it.</p><div className="music-form-actions"><button className="music-secondary" type="button" onClick={onClose}>Cancel</button><button className="music-danger" type="submit" disabled={busy || !reason.trim()}>{busy ? 'Rejecting…' : 'Reject track'}</button></div></form></div>;
}

export function AdminMusicPage({ onNavigate }) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', language: '', mood: '', genre: '', featured: '' });
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(null);
  const [previewTrack, setPreviewTrack] = useState(null);
  const [rejectTrack, setRejectTrack] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350); return () => clearTimeout(timer); }, [query]);
  useEffect(() => setPage(0), [debouncedQuery, filters]);
  const params = useMemo(() => ({ query: debouncedQuery, ...filters, featured: filters.featured === '' ? '' : filters.featured === 'true', page, size: 20 }), [debouncedQuery, filters, page]);
  const tracksQuery = useQuery({ queryKey: ['admin-music', params], queryFn: () => apiMusicService.getAdminTracks(params) });
  const detailQuery = useQuery({
    queryKey: ['admin-music-detail', modal?.track?.id],
    queryFn: () => apiMusicService.getAdminTrack(modal.track.id),
    enabled: modal?.mode === 'edit' && Boolean(modal?.track?.id),
  });

  const invalidateMusic = async () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin-music'] }),
    queryClient.invalidateQueries({ queryKey: ['admin-music-detail'] }),
    queryClient.invalidateQueries({ queryKey: ['public-music'] }),
    queryClient.invalidateQueries({ queryKey: ['featured-music'] }),
  ]);
  const mutation = useMutation({
    mutationFn: async ({ action, track, form }) => {
      if (action === 'upload') {
        const data = new FormData();
        ['title', 'artistName', 'language', 'mood', 'genre', 'description', 'featured', 'sortOrder'].forEach((key) => data.append(key, form[key] ?? ''));
        data.append('audio', form.audio);
        if (form.cover) data.append('cover', form.cover);
        const uploaded = await apiMusicService.uploadTrack(data, (event) => setUploadProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0));
        if (!uploaded?.id) throw new Error('The uploaded track response did not include an ID.');
        return apiMusicService.publishTrack(uploaded.id);
      }
      if (action === 'edit') return apiMusicService.updateTrack(track.id, { title: form.title, artistName: form.artistName, language: form.language, mood: form.mood, genre: form.genre, description: form.description, featured: form.featured, sortOrder: form.sortOrder });
      if (action === 'publish') return apiMusicService.publishTrack(track.id);
      if (action === 'unpublish') return apiMusicService.unpublishTrack(track.id);
      if (action === 'approve') return apiMusicService.approveTrack(track.id);
      if (action === 'reject') return apiMusicService.rejectTrack(track.id, form.reason);
      if (action === 'delete') return apiMusicService.deleteTrack(track.id);
      return null;
    },
    onSuccess: async (_, variables) => {
      await invalidateMusic();
      const messages = { upload: 'Track uploaded and published successfully', edit: 'Music metadata updated', publish: 'Track published', unpublish: 'Track unpublished', approve: 'Community track approved and published', reject: 'Community track rejected', delete: 'Track deleted' };
      addToast(messages[variables.action], 'success');
      setModal(null);
      setUploadProgress(0);
      setRejectTrack(null);
      if (variables.action === 'delete' && previewTrack?.id === variables.track.id) setPreviewTrack(null);
    },
    onError: (error) => addToast(error.message || 'Music action failed.', 'error'),
  });

  const confirmAction = (action, track) => {
    const labels = { publish: `Publish “${track.title}”?`, approve: `Approve and publish “${track.title}”?`, unpublish: `Unpublish “${track.title}”? It will disappear from the public catalog.`, delete: `Delete “${track.title}” permanently?` };
    if (window.confirm(labels[action])) mutation.mutate({ action, track });
  };
  const setFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }));
  const tracks = tracksQuery.data?.content || [];

  return <AdminLayout activeRoute="/admin/music" onNavigate={onNavigate} onRefresh={() => tracksQuery.refetch()} refreshing={tracksQuery.isFetching}>
    <div className="admin-music-page">
      <div className="admin-music-title"><div><h1>Music Management</h1><p>Upload, review and publish platform and community music.</p></div><div className="admin-music-title-actions"><button className="music-secondary" type="button" onClick={() => setFilter('status', 'PENDING_REVIEW')}>Pending Review</button><button className="music-primary" type="button" onClick={() => setModal({ mode: 'upload' })}><Plus size={16} /> Upload track</button></div></div>
      <section className="admin-music-panel">
        <div className="music-toolbar admin-music-filters">
          <label className="music-field"><span>Search</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title or artist" /></label>
          <label className="music-field"><span>Status</span><select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}><option value="">All</option>{STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="music-field"><span>Language</span><select value={filters.language} onChange={(e) => setFilter('language', e.target.value)}><option value="">All</option>{LANGUAGES.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="music-field"><span>Mood</span><select value={filters.mood} onChange={(e) => setFilter('mood', e.target.value)}><option value="">All</option>{MOODS.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="music-field"><span>Genre</span><input value={filters.genre} onChange={(e) => setFilter('genre', e.target.value)} placeholder="Any" /></label>
          <label className="music-field"><span>Featured</span><select value={filters.featured} onChange={(e) => setFilter('featured', e.target.value)}><option value="">All</option><option value="true">Featured</option><option value="false">Not featured</option></select></label>
        </div>
        {tracksQuery.isLoading ? <div className="music-loading"><LoaderCircle className="music-spin" /></div> : tracksQuery.isError ? <div className="music-error"><div><p>{tracksQuery.error.message || 'Unable to load music.'}</p><button className="music-secondary" onClick={() => tracksQuery.refetch()}><RefreshCw size={15} /> Retry</button></div></div> : tracks.length === 0 ? <div className="music-empty"><p>No tracks match the current filters.</p></div> : <div className="admin-music-table-wrap"><table className="admin-music-table"><thead><tr><th>Track</th><th>Uploader</th><th>Language</th><th>Mood / Genre</th><th>Status</th><th>Featured</th><th>Created</th><th>Actions</th></tr></thead><tbody>{tracks.map((track) => <tr key={track.id}><td><div className="admin-track-cell"><PrivateCover track={track} /><div><strong>{track.title}</strong><span>{track.artist}</span></div></div></td><td><strong>{track.uploader?.displayName || 'Platform'}</strong><br /><small>{track.source === 'COMMUNITY' ? 'Community' : 'Platform'}</small></td><td>{track.language}</td><td>{track.mood}<br /><small>{track.genre || '—'}</small></td><td><span className={`music-status ${track.status?.toLowerCase()}`}>{track.status === 'PENDING_REVIEW' ? 'Pending Review' : track.status}</span></td><td>{track.featured ? 'Yes' : 'No'}</td><td>{track.createdAt ? new Date(track.createdAt).toLocaleDateString() : '—'}</td><td><div className="admin-music-actions"><button onClick={() => setPreviewTrack(track)}>Preview</button><button onClick={() => setModal({ mode: 'edit', track })}>Edit</button>{track.source === 'COMMUNITY' && track.status === 'PENDING_REVIEW' && <><button onClick={() => confirmAction('approve', track)}>Approve</button><button onClick={() => setRejectTrack(track)}>Reject</button></>}{track.source !== 'COMMUNITY' && ['DRAFT','UNPUBLISHED'].includes(track.status) && <button onClick={() => confirmAction('publish', track)}>Publish</button>}{track.status === 'PUBLISHED' && <button onClick={() => confirmAction('unpublish', track)}>Unpublish</button>}<button onClick={() => confirmAction('delete', track)}>Delete</button></div></td></tr>)}</tbody></table></div>}
        <div className="music-pagination"><button className="music-secondary" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page + 1} of {Math.max(1, tracksQuery.data?.totalPages || 1)}</span><button className="music-secondary" disabled={page + 1 >= (tracksQuery.data?.totalPages || 1)} onClick={() => setPage((value) => value + 1)}>Next</button></div>
      </section>
    </div>
    {modal?.mode === 'upload' && <TrackFormModal mode="upload" saving={mutation.isPending} progress={uploadProgress} onClose={() => setModal(null)} onSave={(form) => mutation.mutate({ action: 'upload', form })} />}
    {modal?.mode === 'edit' && detailQuery.isLoading && <div className="music-modal-backdrop"><div className="music-modal music-loading"><LoaderCircle className="music-spin" aria-label="Loading track details" /></div></div>}
    {modal?.mode === 'edit' && detailQuery.isError && <div className="music-modal-backdrop"><div className="music-modal music-error"><div><p>{detailQuery.error.message}</p><button className="music-secondary" type="button" onClick={() => detailQuery.refetch()}>Retry</button> <button className="music-secondary" type="button" onClick={() => setModal(null)}>Close</button></div></div></div>}
    {modal?.mode === 'edit' && detailQuery.data && <TrackFormModal mode="edit" track={detailQuery.data} saving={mutation.isPending} progress={uploadProgress} onClose={() => setModal(null)} onSave={(form) => mutation.mutate({ action: 'edit', track: detailQuery.data, form })} />}
    {previewTrack && <PreviewModal track={previewTrack} onClose={() => setPreviewTrack(null)} />}
    {rejectTrack && <RejectModal track={rejectTrack} busy={mutation.isPending} onClose={() => setRejectTrack(null)} onReject={(reason) => mutation.mutate({ action: 'reject', track: rejectTrack, form: { reason } })} />}
  </AdminLayout>;
}

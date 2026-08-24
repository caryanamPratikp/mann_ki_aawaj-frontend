import React, { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { apiMusicService } from '../../services/apiMusicService.js';
import { useToast } from '../../context/ToastContext.jsx';
import defaultCover from '../../assets/music-cover.jpg';
import '../../styles/music.css';

const LANGUAGES = ['EN', 'HI', 'BN', 'MR', 'TE', 'TA', 'GU', 'UR', 'KN', 'OR', 'ML', 'PA', 'AS', 'SAT', 'KS', 'MNI', 'DOI', 'BHO'];
const MOODS = ['ROMANTIC', 'CALM', 'ENERGETIC', 'CONFUSED', 'MELANCHOLY', 'FOCUS'];
const STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNPUBLISHED', 'REJECTED'];

function PrivateCover({ track }) {
  const isPlatformTrack = track.source === 'PLATFORM' || !track.source;
  const [url, setUrl] = useState(isPlatformTrack ? defaultCover : (track.coverUrl || ''));
  useEffect(() => {
    if (isPlatformTrack) return undefined;
    let objectUrl = '';
    let active = true;
    if (!track.id || !track.coverUrl) return undefined;
    apiMusicService.getAdminCoverBlob(track.id).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => {
      if (active) setUrl('');
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [track.id, track.coverUrl, isPlatformTrack]);
  return <img src={isPlatformTrack ? defaultCover : (url || defaultCover)} alt={`${track.title} cover`} onError={(e) => { e.currentTarget.src = defaultCover; }} />;
}

function BulkTrackUploadModal({ saving, progressStatus, onClose, onSaveBulk }) {
  const [rows, setRows] = useState([
    { id: 1, title: '', audio: null },
  ]);
  const [formError, setFormError] = useState('');

  const addRow = () => {
    setRows((prev) => [...prev, { id: Date.now(), title: '', audio: null }]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleAudioSelect = (id, file) => {
    setFormError('');
    if (!file) {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
          return { ...r, audio: null, previewUrl: '' };
        })
      );
      return;
    }

    const validExts = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg', '.opus'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = validExts.some((ext) => lowerName.endsWith(ext));

    if (!isValidExt && !file.type.startsWith('audio/')) {
      return setFormError('Please select a valid audio file (MP3, M4A, AAC, WAV, FLAC, OGG, OPUS).');
    }
    if (file.size > 40 * 1024 * 1024) {
      return setFormError('Each audio file must be 40 MB or smaller.');
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
        const autoTitle = r.title.trim() ? r.title : file.name.replace(/\.[^/.]+$/, '');
        return { ...r, audio: file, title: autoTitle, previewUrl: newPreviewUrl };
      })
    );
  };

  const submit = (event) => {
    event.preventDefault();
    setFormError('');

    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].audio) {
        return setFormError(`Track #${i + 1} requires an audio file.`);
      }
    }

    onSaveBulk(rows);
  };

  return (
    <div className="music-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}>
      <form className="music-modal" onSubmit={submit} style={{ maxWidth: '640px', width: '100%' }}>
        <div className="music-modal-header">
          <h2>Upload Tracks (Bulk Supported)</h2>
          <button className="music-icon-button" type="button" onClick={onClose} disabled={saving}>
            <X />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#756966', margin: '0 0 16px 0' }}>
          Accepts Title & Music File (MP3, M4A, AAC, WAV, FLAC, OGG, OPUS). Cover image defaults to logo automatically.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
          {rows.map((row, index) => (
            <div
              key={row.id}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid #E5DFDD',
                backgroundColor: '#FAF8F8',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#6F405F' }}>
                  Track #{index + 1}
                </span>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={saving}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C62828',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <Trash2 size={15} />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label className="music-field">
                  <span>Track Title *</span>
                  <input
                    required
                    maxLength="150"
                    value={row.title}
                    onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                    placeholder="Enter track title"
                    disabled={saving}
                  />
                </label>

                <label className="music-field">
                  <span>Music File * (MP3, M4A, AAC, WAV, FLAC, OGG, OPUS)</span>
                  <input
                    required
                    accept="audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg,.opus"
                    type="file"
                    onChange={(e) => handleAudioSelect(row.id, e.target.files?.[0])}
                    disabled={saving}
                  />
                </label>
              </div>

              {row.audio && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <small className="music-file-note" style={{ color: '#2E7D32', fontWeight: 700 }}>
                      ✓ {row.audio.name} ({(row.audio.size / 1024 / 1024).toFixed(1)} MB)
                    </small>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#6F405F' }}>Audio Preview</span>
                  </div>
                  {row.previewUrl && (
                    <audio
                      controls
                      src={row.previewUrl}
                      style={{ width: '100%', height: '36px', borderRadius: '8px' }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={addRow}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(111,64,95,0.1)',
              color: '#6F405F',
              border: '1.5px dashed #6F405F',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Plus size={16} />
            <span>+ Add Another Track</span>
          </button>
        </div>

        {formError && <p className="music-player-error" role="alert" style={{ marginTop: '12px' }}>{formError}</p>}
        {saving && <p className="music-file-note" style={{ marginTop: '12px', fontWeight: 700, color: '#6F405F' }}>{progressStatus}</p>}

        <div className="music-form-actions" style={{ marginTop: '20px' }}>
          <button className="music-secondary" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="music-primary" type="submit" disabled={saving}>
            {saving ? 'Uploading...' : `Upload & Publish (${rows.length} ${rows.length === 1 ? 'Track' : 'Tracks'})`}
          </button>
        </div>
      </form>
    </div>
  );
}

function TrackEditModal({ track, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    title: track?.title || '',
    artistName: track?.artist || '',
    language: track?.language || 'HI',
    mood: track?.mood || 'CALM',
    genre: track?.genre || '',
    description: track?.description || '',
    featured: Boolean(track?.featured),
    sortOrder: track?.sortOrder ?? 0,
  });

  const change = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="music-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}>
      <form className="music-modal" onSubmit={submit}>
        <div className="music-modal-header">
          <h2>Edit Track Metadata</h2>
          <button className="music-icon-button" type="button" onClick={onClose} disabled={saving}><X /></button>
        </div>
        <div className="music-form-grid">
          <label className="music-field"><span>Title *</span><input required maxLength="150" value={form.title} onChange={(e) => change('title', e.target.value)} /></label>
          <label className="music-field"><span>Artist *</span><input required maxLength="150" value={form.artistName} onChange={(e) => change('artistName', e.target.value)} /></label>
          <label className="music-field"><span>Language *</span><select required value={form.language} onChange={(e) => change('language', e.target.value)}>{LANGUAGES.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="music-field"><span>Mood *</span><select required value={form.mood} onChange={(e) => change('mood', e.target.value)}>{MOODS.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="music-field"><span>Genre</span><input maxLength="80" value={form.genre} onChange={(e) => change('genre', e.target.value)} /></label>
          <label className="music-field"><span>Sort order</span><input type="number" min="0" value={form.sortOrder} onChange={(e) => change('sortOrder', Number(e.target.value))} /></label>
          <label className="music-field full"><span>Description</span><textarea rows="4" maxLength="1000" value={form.description} onChange={(e) => change('description', e.target.value)} /></label>
          <label className="music-checkbox"><input type="checkbox" checked={form.featured} onChange={(e) => change('featured', e.target.checked)} /> Featured track</label>
        </div>
        <div className="music-form-actions" style={{ marginTop: '20px' }}>
          <button className="music-secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="music-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
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
  const [uploadStatusText, setUploadStatusText] = useState('');

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
    mutationFn: async ({ action, track, form, bulkRows }) => {
      if (action === 'uploadBulk') {
        const total = bulkRows.length;
        for (let i = 0; i < total; i++) {
          const row = bulkRows[i];
          setUploadStatusText(`Uploading track ${i + 1} of ${total}: "${row.title}"...`);
          const data = new FormData();
          data.append('title', row.title.trim());
          data.append('artistName', 'Man Ki Aavaj');
          data.append('language', 'HI');
          data.append('mood', 'CALM');
          data.append('genre', 'BGM');
          data.append('description', '');
          data.append('featured', 'false');
          data.append('sortOrder', String(i));
          data.append('audio', row.audio);
          // Note: cover is omitted so platform logo is used by default

          const uploaded = await apiMusicService.uploadTrack(data);
          if (uploaded?.id) {
            await apiMusicService.publishTrack(uploaded.id);
          }
        }
        return { count: total };
      }
      if (action === 'edit') return apiMusicService.updateTrack(track.id, { title: form.title, artistName: form.artistName, language: form.language, mood: form.mood, genre: form.genre, description: form.description, featured: form.featured, sortOrder: form.sortOrder });
      if (action === 'publish') return apiMusicService.publishTrack(track.id);
      if (action === 'unpublish') return apiMusicService.unpublishTrack(track.id);
      if (action === 'approve') return apiMusicService.approveTrack(track.id);
      if (action === 'reject') return apiMusicService.rejectTrack(track.id, form.reason);
      if (action === 'delete') return apiMusicService.deleteTrack(track.id);
      return null;
    },
    onSuccess: async (data, variables) => {
      await invalidateMusic();
      if (variables.action === 'uploadBulk') {
        addToast(`${data?.count || 1} track(s) uploaded and published successfully!`, 'success');
      } else {
        const messages = { edit: 'Music metadata updated', publish: 'Track published', unpublish: 'Track unpublished', approve: 'Community track approved and published', reject: 'Community track rejected', delete: 'Track deleted' };
        addToast(messages[variables.action], 'success');
      }
      setModal(null);
      setUploadStatusText('');
      setRejectTrack(null);
      if (variables.action === 'delete' && previewTrack?.id === variables.track.id) setPreviewTrack(null);
    },
    onError: (error) => {
      addToast(error.message || 'Music action failed.', 'error');
      setUploadStatusText('');
    },
  });

  const confirmAction = (action, track) => {
    const labels = { publish: `Publish “${track.title}”?`, approve: `Approve and publish “${track.title}”?`, unpublish: `Unpublish “${track.title}”? It will disappear from the public catalog.`, delete: `Delete “${track.title}” permanently?` };
    if (window.confirm(labels[action])) mutation.mutate({ action, track });
  };
  const setFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }));
  const tracks = tracksQuery.data?.content || [];

  return <AdminLayout activeRoute="/admin/music" onNavigate={onNavigate} onRefresh={() => tracksQuery.refetch()} refreshing={tracksQuery.isFetching}>
    <div className="admin-music-page">
      <div className="admin-music-title"><div><h1>Music Management</h1><p>Upload, review and publish platform and community music.</p></div><div className="admin-music-title-actions"><button className="music-secondary" type="button" onClick={() => setFilter('status', 'PENDING_REVIEW')}>Pending Review</button><button className="music-primary" type="button" onClick={() => setModal({ mode: 'upload' })}><Plus size={16} /> Upload tracks</button></div></div>
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
    {modal?.mode === 'upload' && <BulkTrackUploadModal saving={mutation.isPending} progressStatus={uploadStatusText} onClose={() => setModal(null)} onSaveBulk={(rows) => mutation.mutate({ action: 'uploadBulk', bulkRows: rows })} />}
    {modal?.mode === 'edit' && detailQuery.isLoading && <div className="music-modal-backdrop"><div className="music-modal music-loading"><LoaderCircle className="music-spin" aria-label="Loading track details" /></div></div>}
    {modal?.mode === 'edit' && detailQuery.isError && <div className="music-modal-backdrop"><div className="music-modal music-error"><div><p>{detailQuery.error.message}</p><button className="music-secondary" type="button" onClick={() => detailQuery.refetch()}>Retry</button> <button className="music-secondary" type="button" onClick={() => setModal(null)}>Close</button></div></div></div>}
    {modal?.mode === 'edit' && detailQuery.data && <TrackEditModal track={detailQuery.data} saving={mutation.isPending} onClose={() => setModal(null)} onSave={(form) => mutation.mutate({ action: 'edit', track: detailQuery.data, form })} />}
    {previewTrack && <PreviewModal track={previewTrack} onClose={() => setPreviewTrack(null)} />}
    {rejectTrack && <RejectModal track={rejectTrack} busy={mutation.isPending} onClose={() => setRejectTrack(null)} onReject={(reason) => mutation.mutate({ action: 'reject', track: rejectTrack, form: { reason } })} />}
  </AdminLayout>;
}

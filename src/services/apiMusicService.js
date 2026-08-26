import { apiClient } from './apiClient.js';
import { getMediaUrl } from '../config/env.js';
import defaultCoverAsset from '../assets/music-cover.jpg';

const ERROR_MESSAGES = {
  UNSUPPORTED_AUDIO_FORMAT: 'Unsupported audio format. Please select an MP3 file.',
  AUDIO_FILE_TOO_LARGE: 'Audio file is too large. Maximum size is 40 MB.',
  INVALID_AUDIO_FILE: 'The selected file is not a valid MP3.',
  INVALID_COVER_FILE: 'Cover must be a valid JPEG or PNG image.',
  COVER_FILE_TOO_LARGE: 'Cover image is too large. Maximum size is 5 MB.',
  MUSIC_STORAGE_ERROR: 'Music storage is currently unavailable. Please try again.',
  MUSIC_TRACK_NOT_FOUND: 'Music track was not found.',
  MUSIC_NOT_PUBLISHED: 'This track is not currently published.',
  MUSIC_RIGHTS_CONFIRMATION_REQUIRED: 'Both ownership and rights declarations are required.',
  MUSIC_UPLOAD_LIMIT_REACHED: 'You already have the maximum of five tracks pending review.',
  MUSIC_TRACK_NOT_EDITABLE: 'This track can no longer be edited.',
  MUSIC_TRACK_NOT_DELETABLE: 'Only pending or rejected tracks can be deleted.',
  MUSIC_TRACK_NOT_PENDING_REVIEW: 'This track is no longer pending review.',
};

export const cleanMusicParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
);

const unwrap = (response) => response?.data?.data ?? response?.data;

export const mapMusicTrack = (track) => {
  if (!track) return track;
  const isPlatformTrack = track.source === 'PLATFORM' || !track.source;
  const coverUrl = isPlatformTrack
    ? defaultCoverAsset
    : (track.coverUrl ? getMediaUrl(track.coverUrl) : defaultCoverAsset);

  return {
    ...track,
    moods: Array.isArray(track.moods) ? [...new Set(track.moods)] : [],
    audioUrl: getMediaUrl(track.audioUrl),
    coverUrl,
  };
};

const mapMyTrack = (track) => track ? ({
  ...track,
  moods: Array.isArray(track.moods) ? [...new Set(track.moods)] : [],
  privateAudioUrl: getMediaUrl(track.privateAudioUrl),
  privateCoverUrl: track.privateCoverUrl ? getMediaUrl(track.privateCoverUrl) : null,
  publicAudioUrl: track.publicAudioUrl ? getMediaUrl(track.publicAudioUrl) : null,
  publicCoverUrl: track.publicCoverUrl ? getMediaUrl(track.publicCoverUrl) : null,
}) : track;

const mapPage = (page = {}) => ({
  ...page,
  content: (page.content || []).map(mapMusicTrack),
  number: page.number ?? page.page ?? 0,
  size: page.size ?? 20,
  totalElements: page.totalElements ?? 0,
  totalPages: page.totalPages ?? 0,
});

const mapMyPage = (page = {}) => ({
  ...page,
  content: (page.content || []).map(mapMyTrack),
  number: page.number ?? page.page ?? 0,
  size: page.size ?? 20,
  totalElements: page.totalElements ?? 0,
  totalPages: page.totalPages ?? 0,
});

const readableError = (error) => {
  const payload = error?.response?.data;
  const code = payload?.code || payload?.errorCode || payload?.error
    || (ERROR_MESSAGES[payload?.message] ? payload.message : null);
  const fieldErrors = payload?.validationErrors || payload?.errors;
  const validationMessage = fieldErrors
    ? Object.values(fieldErrors).filter(Boolean).join(' ')
    : null;
  const message = ERROR_MESSAGES[code] || validationMessage || payload?.message || error?.message || 'Music request failed.';
  const wrapped = new Error(typeof message === 'string' ? message : 'Music request failed.');
  wrapped.status = error?.response?.status;
  wrapped.code = code || error?.code;
  if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') wrapped.name = error.name;
  return wrapped;
};

const request = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    throw readableError(error);
  }
};

export const apiMusicService = {
  getPublicTracks: (params, options = {}) => request(async () => mapPage(unwrap(
    await apiClient.get('/api/music/tracks', { params: cleanMusicParams(params), signal: options.signal }),
  ))),

  getPublicTrack: (id) => request(async () => mapMusicTrack(unwrap(
    await apiClient.get(`/api/music/tracks/${id}`),
  ))),

  getAdminTracks: (params) => request(async () => mapPage(unwrap(
    await apiClient.get('/api/admin/music/tracks', { params: cleanMusicParams(params) }),
  ))),

  getAdminTrack: (id) => request(async () => mapMusicTrack(unwrap(
    await apiClient.get(`/api/admin/music/tracks/${id}`),
  ))),

  uploadTrack: (formData, onUploadProgress) => request(async () => unwrap(
    await apiClient.post('/api/admin/music/tracks', formData, {
      onUploadProgress,
      timeout: 120000,
    }),
  )),

  updateTrack: (id, metadata) => request(async () => unwrap(
    await apiClient.put(`/api/admin/music/tracks/${id}`, metadata),
  )),

  publishTrack: (id) => request(async () => unwrap(
    await apiClient.post(`/api/admin/music/tracks/${id}/publish`),
  )),

  unpublishTrack: (id) => request(async () => unwrap(
    await apiClient.post(`/api/admin/music/tracks/${id}/unpublish`),
  )),

  approveTrack: (id, moods) => request(async () => unwrap(
    await apiClient.post(`/api/admin/music/tracks/${id}/approve`, { moods }),
  )),

  rejectTrack: (id, reason) => request(async () => unwrap(
    await apiClient.post(`/api/admin/music/tracks/${id}/reject`, { reason }),
  )),

  deleteTrack: (id) => request(async () => {
    await apiClient.delete(`/api/admin/music/tracks/${id}`);
  }),

  getAdminAudioBlob: (id) => request(async () => (
    await apiClient.get(`/api/admin/music/tracks/${id}/audio`, { responseType: 'blob' })
  ).data),

  getAdminCoverBlob: (id) => request(async () => (
    await apiClient.get(`/api/admin/music/tracks/${id}/cover`, { responseType: 'blob' })
  ).data),

  getMyTracks: (params) => request(async () => mapMyPage(unwrap(
    await apiClient.get('/api/music/my-tracks', { params: cleanMusicParams(params) }),
  ))),

  getMyTrack: (id) => request(async () => mapMyTrack(unwrap(
    await apiClient.get(`/api/music/my-tracks/${id}`),
  ))),

  uploadMyTrack: (formData, onUploadProgress) => request(async () => mapMyTrack(unwrap(
    await apiClient.post('/api/music/my-tracks', formData, {
      onUploadProgress,
      timeout: 120000,
    }),
  ))),

  updateMyTrack: (id, metadata) => request(async () => mapMyTrack(unwrap(
    await apiClient.put(`/api/music/my-tracks/${id}`, metadata),
  ))),

  deleteMyTrack: (id) => request(async () => {
    await apiClient.delete(`/api/music/my-tracks/${id}`);
  }),

  getMyAudioBlob: (id) => request(async () => (
    await apiClient.get(`/api/music/my-tracks/${id}/audio`, { responseType: 'blob' })
  ).data),

  getMyCoverBlob: (id) => request(async () => (
    await apiClient.get(`/api/music/my-tracks/${id}/cover`, { responseType: 'blob' })
  ).data),
};

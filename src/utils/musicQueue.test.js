import assert from 'node:assert/strict';
import test from 'node:test';
import {
  aggregateMusicQueue,
  buildMusicQueueParams,
  dedupeTracksById,
  locateCurrentTrack,
} from './musicQueue.js';

const track = (id) => ({ id, audioUrl: `/audio/${id}` });

test('aggregates pages sequentially in backend order', async () => {
  const calls = [];
  const result = await aggregateMusicQueue({
    selectedMood: 'ROMANTIC',
    fetchPage: async (params) => {
      calls.push(params);
      return { content: [track(params.page + 1)], totalPages: 3 };
    },
  });
  assert.deepEqual(result.tracks.map(({ id }) => id), [1, 2, 3]);
  assert.deepEqual(calls.map(({ mood, page }) => [mood, page]), [['ROMANTIC', 0], ['ROMANTIC', 1], ['ROMANTIC', 2]]);
});

test('deduplicates by track id and preserves the first occurrence', () => {
  const first = { ...track(7), title: 'First' };
  assert.deepEqual(dedupeTracksById([first, { ...track(7), title: 'Second' }, track(8)]), [first, track(8)]);
});

test('applies the configured queue cap', async () => {
  const result = await aggregateMusicQueue({
    selectedMood: 'SAD', cap: 3, pageSize: 2,
    fetchPage: async ({ page }) => ({ content: page ? [track(3), track(4)] : [track(1), track(2)], totalPages: 5 }),
  });
  assert.deepEqual(result.tracks.map(({ id }) => id), [1, 2, 3]);
});

test('maps listener modes to mood or omitted mood requests', () => {
  assert.equal(buildMusicQueueParams('ROMANTIC', 0).mood, 'ROMANTIC');
  assert.equal(buildMusicQueueParams('SAD', 0).mood, 'SAD');
  assert.equal(buildMusicQueueParams('ENERGETIC', 0).mood, 'ENERGETIC');
  assert.equal('mood' in buildMusicQueueParams(null, 0), false);
});

test('falls back once from an empty mood to the full catalog', async () => {
  const calls = [];
  const result = await aggregateMusicQueue({
    selectedMood: 'SAD',
    fetchPage: async (params) => {
      calls.push(params);
      return { content: params.mood ? [] : [track(9)], totalPages: 1 };
    },
  });
  assert.equal(result.fallbackUsed, true);
  assert.deepEqual(result.tracks, [track(9)]);
  assert.equal('mood' in calls[1], false);
});

test('returns an empty queue safely when mood and catalog are empty', async () => {
  const result = await aggregateMusicQueue({ selectedMood: 'ENERGETIC', fetchPage: async () => ({ content: [], totalPages: 0 }) });
  assert.deepEqual(result.tracks, []);
  assert.equal(result.fallbackUsed, true);
});

test('retains successful pages when a later expansion page fails', async () => {
  const result = await aggregateMusicQueue({
    selectedMood: 'ROMANTIC',
    fetchPage: async ({ page }) => {
      if (page === 2) throw new Error('network');
      return { content: [track(page + 1)], totalPages: 3 };
    },
  });
  assert.deepEqual(result.tracks.map(({ id }) => id), [1, 2]);
  assert.equal(result.expansionFailed, true);
});

test('locates a preserved current track by stable id after queue replacement', () => {
  assert.equal(locateCurrentTrack([track(1), track(4), track(8)], { id: 4 }), 1);
  assert.equal(locateCurrentTrack([track(1)], { id: 99 }), -1);
});

test('propagates cancellation so a stale mood aggregation cannot complete', async () => {
  const controller = new AbortController();
  await assert.rejects(
    aggregateMusicQueue({
      selectedMood: 'ROMANTIC',
      signal: controller.signal,
      fetchPage: async ({ page }, signal) => {
        if (page === 0) {
          controller.abort();
          return { content: [track(1)], totalPages: 2 };
        }
        const error = new Error('canceled');
        error.name = signal.aborted ? 'AbortError' : 'Error';
        throw error;
      },
    }),
    { name: 'AbortError' },
  );
});

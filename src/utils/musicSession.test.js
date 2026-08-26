import test from 'node:test';
import assert from 'node:assert/strict';
import { buildListeningCatalogParams, getListeningMoodOption, shouldFallbackToFullCatalog } from '../config/musicMoods.js';
import { clearMusicSession, getMusicSessionKey, readMusicSession, saveMusicSession } from './musicSession.js';

const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
};

test('first visit is incomplete and a same-user selection survives another read', () => {
  const storage = memoryStorage();
  assert.equal(readMusicSession(7, storage).selectorCompleted, false);
  saveMusicSession(7, 'ROMANTIC', storage);
  assert.deepEqual(readMusicSession(7, storage), { selectedMood: 'ROMANTIC', mode: 'MOOD', selectorCompleted: true });
});

test('sessions are user scoped, malformed data is safe, and logout clearing removes only that user', () => {
  const storage = memoryStorage();
  saveMusicSession('A', 'SAD', storage);
  assert.equal(readMusicSession('B', storage).selectorCompleted, false);
  storage.setItem(getMusicSessionKey('B'), '{broken');
  assert.equal(readMusicSession('B', storage).selectorCompleted, false);
  clearMusicSession('A', storage);
  assert.equal(readMusicSession('A', storage).selectorCompleted, false);
});

test('listener options map to backend moods while Play Anything maps to no mood', () => {
  assert.equal(getListeningMoodOption('ROMANTIC').apiMood, 'ROMANTIC');
  assert.equal(getListeningMoodOption('SAD').apiMood, 'SAD');
  assert.equal(getListeningMoodOption('ENERGETIC').apiMood, 'ENERGETIC');
  assert.equal(getListeningMoodOption(null).apiMood, null);
});

test('catalog params omit Play Anything and ALL but include valid selected moods', () => {
  assert.deepEqual(buildListeningCatalogParams({ page: 0 }, 'ROMANTIC'), { page: 0, mood: 'ROMANTIC' });
  assert.deepEqual(buildListeningCatalogParams({ page: 0 }, null), { page: 0 });
  assert.deepEqual(buildListeningCatalogParams({ page: 0 }, 'ALL'), { page: 0 });
});

test('empty selected mood results fall back once only on the first page', () => {
  assert.equal(shouldFallbackToFullCatalog({ selectedMood: 'SAD', page: 0, isSuccess: true, content: [] }), true);
  assert.equal(shouldFallbackToFullCatalog({ selectedMood: 'SAD', page: 1, isSuccess: true, content: [] }), false);
  assert.equal(shouldFallbackToFullCatalog({ selectedMood: null, page: 0, isSuccess: true, content: [] }), false);
});

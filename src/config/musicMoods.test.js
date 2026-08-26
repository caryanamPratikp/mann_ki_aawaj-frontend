import test from 'node:test';
import assert from 'node:assert/strict';
import { MUSIC_MOOD_VALUES, appendMusicMoods, normalizeMusicMoods, toggleMusicMood } from './musicMoods.js';

test('canonical moods include SAD and never include ALL', () => {
  assert.ok(MUSIC_MOOD_VALUES.includes('SAD'));
  assert.ok(!MUSIC_MOOD_VALUES.includes('ALL'));
});

test('normalization removes duplicates and invalid values', () => {
  assert.deepEqual(normalizeMusicMoods(['CALM', 'CALM', 'ALL', null]), ['CALM']);
});

test('user selection cannot exceed three moods but selected moods remain removable', () => {
  const selected = ['CALM', 'SAD', 'FOCUS'];
  assert.deepEqual(toggleMusicMood(selected, 'ROMANTIC', 3), selected);
  assert.deepEqual(toggleMusicMood(selected, 'SAD', 3), ['CALM', 'FOCUS']);
});

test('multipart serialization repeats the canonical moods field', () => {
  const data = new FormData();
  appendMusicMoods(data, ['ROMANTIC', 'CALM']);
  assert.deepEqual(data.getAll('moods'), ['ROMANTIC', 'CALM']);
  assert.equal(data.get('mood'), null);
});

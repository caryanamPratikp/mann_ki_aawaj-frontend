import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cycleRepeatMode,
  DEFAULT_PLAYBACK_MODES,
  derivePlaybackQueue,
  REPEAT_MODES,
  reshuffleForNextCycle,
  resolveNextAction,
  resolvePreviousAction,
  shufflePreservingCurrent,
  shuffleQueue,
} from './musicPlayback.js';

const tracks = (...ids) => ids.map((id) => ({ id }));
const zeroRandom = () => 0;

test('shuffle does not mutate source and contains each track exactly once', () => {
  const source = tracks(1, 2, 3, 4);
  const snapshot = [...source];
  const shuffled = shuffleQueue(source, zeroRandom);
  assert.deepEqual(source, snapshot);
  assert.deepEqual([...shuffled].sort((a, b) => a.id - b.id), source);
});

test('enabling shuffle preserves current track as active first position', () => {
  assert.deepEqual(shufflePreservingCurrent(tracks(1, 2, 3), { id: 2 }, zeroRandom)[0], { id: 2 });
});

test('disabling shuffle restores source order and current index by id', () => {
  const source = tracks(1, 2, 3);
  const restored = derivePlaybackQueue({ sourceQueue: source, shuffleEnabled: false, currentTrack: { id: 2 } });
  assert.deepEqual(restored, source);
  assert.equal(restored.findIndex(({ id }) => id === 2), 1);
});

test('one-track and empty shuffle are safe', () => {
  assert.deepEqual(shuffleQueue(tracks(1), zeroRandom), tracks(1));
  assert.deepEqual(shuffleQueue([], zeroRandom), []);
});

test('repeat mode cycles OFF to ALL to ONE to OFF', () => {
  assert.equal(cycleRepeatMode(REPEAT_MODES.OFF), REPEAT_MODES.ALL);
  assert.equal(cycleRepeatMode(REPEAT_MODES.ALL), REPEAT_MODES.ONE);
  assert.equal(cycleRepeatMode(REPEAT_MODES.ONE), REPEAT_MODES.OFF);
});

test('repeat OFF advances in the middle and stops at final track without wrapping', () => {
  assert.deepEqual(resolveNextAction({ index: 0, queueLength: 2, repeatMode: 'OFF', naturalEnd: true }), { type: 'PLAY', index: 1 });
  assert.deepEqual(resolveNextAction({ index: 1, queueLength: 2, repeatMode: 'OFF', naturalEnd: true }), { type: 'STOP' });
});

test('repeat ALL advances in the middle and wraps at final track', () => {
  assert.deepEqual(resolveNextAction({ index: 0, queueLength: 2, repeatMode: 'ALL', naturalEnd: true }), { type: 'PLAY', index: 1 });
  assert.deepEqual(resolveNextAction({ index: 1, queueLength: 2, repeatMode: 'ALL', naturalEnd: true }), { type: 'WRAP', index: 0 });
});

test('repeat ONE natural completion replays current track', () => {
  assert.deepEqual(resolveNextAction({ index: 1, queueLength: 3, repeatMode: 'ONE', naturalEnd: true }), { type: 'REPLAY' });
});

test('repeat ONE manual Next advances but stops at final boundary', () => {
  assert.deepEqual(resolveNextAction({ index: 0, queueLength: 2, repeatMode: 'ONE' }), { type: 'PLAY', index: 1 });
  assert.deepEqual(resolveNextAction({ index: 1, queueLength: 2, repeatMode: 'ONE' }), { type: 'STOP' });
});

test('manual Previous navigates independently of repeat ONE', () => {
  assert.deepEqual(resolvePreviousAction({ index: 1, queueLength: 3, repeatMode: 'ONE' }), { type: 'PLAY', index: 0 });
  assert.deepEqual(resolvePreviousAction({ index: 0, queueLength: 3, repeatMode: 'ONE' }), { type: 'STOP' });
});

test('repeat ALL previous wraps from first to final track', () => {
  assert.deepEqual(resolvePreviousAction({ index: 0, queueLength: 3, repeatMode: 'ALL' }), { type: 'WRAP', index: 2 });
});

test('shuffle repeat ALL next cycle contains new source only and avoids immediate duplicate', () => {
  const source = tracks(7, 8, 9);
  const nextCycle = reshuffleForNextCycle(source, { id: 9 }, zeroRandom);
  assert.deepEqual([...nextCycle].sort((a, b) => a.id - b.id), source);
  assert.notEqual(nextCycle[0].id, 9);
});

test('shuffle repeat ONE resolves replay and manual Next exits repeated track', () => {
  assert.deepEqual(resolveNextAction({ index: 1, queueLength: 3, repeatMode: 'ONE', naturalEnd: true }), { type: 'REPLAY' });
  assert.deepEqual(resolveNextAction({ index: 1, queueLength: 3, repeatMode: 'ONE' }), { type: 'PLAY', index: 2 });
});

test('source replacement while shuffle is enabled contains no old tracks', () => {
  const replacement = derivePlaybackQueue({ sourceQueue: tracks(10, 11, 12), shuffleEnabled: true, currentTrack: { id: 2 }, random: zeroRandom });
  assert.deepEqual([...replacement].sort((a, b) => a.id - b.id), tracks(10, 11, 12));
});

test('same current track remains locatable after shuffled source replacement', () => {
  const replacement = derivePlaybackQueue({ sourceQueue: tracks(4, 5, 6), shuffleEnabled: true, currentTrack: { id: 5 }, random: zeroRandom });
  assert.equal(replacement.findIndex(({ id }) => id === 5), 0);
});

test('account reset defaults clear shuffle and return repeat to OFF', () => {
  assert.deepEqual(DEFAULT_PLAYBACK_MODES, { shuffleEnabled: false, repeatMode: 'OFF' });
});

test('empty queue navigation stops safely and one-track repeat behavior is correct', () => {
  assert.deepEqual(resolveNextAction({ index: -1, queueLength: 0, repeatMode: 'ALL', naturalEnd: true }), { type: 'STOP' });
  assert.deepEqual(resolvePreviousAction({ index: -1, queueLength: 0, repeatMode: 'ALL' }), { type: 'STOP' });
  assert.deepEqual(resolveNextAction({ index: 0, queueLength: 1, repeatMode: 'OFF', naturalEnd: true }), { type: 'STOP' });
  assert.deepEqual(resolveNextAction({ index: 0, queueLength: 1, repeatMode: 'ALL', naturalEnd: true }), { type: 'REPLAY' });
  assert.deepEqual(resolveNextAction({ index: 0, queueLength: 1, repeatMode: 'ONE', naturalEnd: true }), { type: 'REPLAY' });
});

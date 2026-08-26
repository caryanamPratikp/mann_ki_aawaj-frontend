import { dedupeTracksById, locateCurrentTrack } from './musicQueue.js';

export const REPEAT_MODES = Object.freeze({ OFF: 'OFF', ALL: 'ALL', ONE: 'ONE' });
export const DEFAULT_PLAYBACK_MODES = Object.freeze({ shuffleEnabled: false, repeatMode: REPEAT_MODES.OFF });

export const cycleRepeatMode = (mode) => {
  if (mode === REPEAT_MODES.OFF) return REPEAT_MODES.ALL;
  if (mode === REPEAT_MODES.ALL) return REPEAT_MODES.ONE;
  return REPEAT_MODES.OFF;
};

export const shuffleQueue = (queue, random = Math.random) => {
  const shuffled = [...dedupeTracksById(queue)];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

export const shufflePreservingCurrent = (sourceQueue, currentTrack, random = Math.random) => {
  const source = dedupeTracksById(sourceQueue);
  const currentIndex = locateCurrentTrack(source, currentTrack);
  if (currentIndex < 0) return shuffleQueue(source, random);
  const current = source[currentIndex];
  return [current, ...shuffleQueue(source.filter((track) => track.id !== current.id), random)];
};

export const reshuffleForNextCycle = (sourceQueue, previousTrack, random = Math.random) => {
  const shuffled = shuffleQueue(sourceQueue, random);
  if (shuffled.length > 1 && shuffled[0]?.id === previousTrack?.id) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
};

export const derivePlaybackQueue = ({ sourceQueue, shuffleEnabled, currentTrack, random }) => (
  shuffleEnabled
    ? shufflePreservingCurrent(sourceQueue, currentTrack, random)
    : dedupeTracksById(sourceQueue)
);

export const resolveNextAction = ({ index, queueLength, repeatMode, naturalEnd = false }) => {
  if (queueLength <= 0) return { type: 'STOP' };
  if (naturalEnd && repeatMode === REPEAT_MODES.ONE && index >= 0) return { type: 'REPLAY' };
  if (index < queueLength - 1) return { type: 'PLAY', index: Math.max(0, index + 1) };
  if (repeatMode === REPEAT_MODES.ALL) {
    return queueLength === 1 && naturalEnd ? { type: 'REPLAY' } : { type: 'WRAP', index: 0 };
  }
  return { type: 'STOP' };
};

export const resolvePreviousAction = ({ index, queueLength, repeatMode }) => {
  if (queueLength <= 0 || index < 0) return { type: 'STOP' };
  if (index > 0) return { type: 'PLAY', index: index - 1 };
  if (repeatMode === REPEAT_MODES.ALL && queueLength > 1) return { type: 'WRAP', index: queueLength - 1 };
  return { type: 'STOP' };
};

export const MUSIC_QUEUE_PAGE_SIZE = 50;
export const MUSIC_QUEUE_CAP = 200;

export const dedupeTracksById = (tracks, cap = MUSIC_QUEUE_CAP) => {
  const seen = new Set();
  const result = [];

  for (const track of Array.isArray(tracks) ? tracks : []) {
    if (track?.id === null || track?.id === undefined || seen.has(track.id)) continue;
    seen.add(track.id);
    result.push(track);
    if (result.length >= cap) break;
  }

  return result;
};

export const buildMusicQueueParams = (selectedMood, page, size = MUSIC_QUEUE_PAGE_SIZE) => ({
  ...(selectedMood ? { mood: selectedMood } : {}),
  page,
  size,
});

export async function aggregateMusicQueue({
  selectedMood,
  fetchPage,
  signal,
  pageSize = MUSIC_QUEUE_PAGE_SIZE,
  cap = MUSIC_QUEUE_CAP,
}) {
  const fetchMode = async (mood) => {
    const firstPage = await fetchPage(buildMusicQueueParams(mood, 0, pageSize), signal);
    let tracks = dedupeTracksById(firstPage?.content, cap);
    const totalPages = Math.min(
      Math.max(1, Number(firstPage?.totalPages) || 1),
      Math.ceil(cap / pageSize),
    );
    let expansionFailed = false;

    for (let page = 1; page < totalPages && tracks.length < cap; page += 1) {
      try {
        const response = await fetchPage(buildMusicQueueParams(mood, page, pageSize), signal);
        tracks = dedupeTracksById([...tracks, ...(response?.content || [])], cap);
      } catch (error) {
        if (signal?.aborted || error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') throw error;
        expansionFailed = true;
        break;
      }
    }

    return { tracks, expansionFailed };
  };

  const requested = await fetchMode(selectedMood);
  if (!selectedMood || requested.tracks.length > 0) {
    return { ...requested, fallbackUsed: false, effectiveMood: selectedMood || null };
  }

  const fallback = await fetchMode(null);
  return { ...fallback, fallbackUsed: true, effectiveMood: null };
}

export const locateCurrentTrack = (queue, currentTrack) => (
  currentTrack?.id === null || currentTrack?.id === undefined
    ? -1
    : queue.findIndex((track) => track.id === currentTrack.id)
);

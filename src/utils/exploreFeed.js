export const EXPLORE_PAGE_SIZE = 10;

const VISIBLE_POST_STATUSES = new Set(['ACTIVE', 'PUBLISHED']);

export function hasVisiblePostStatus(post) {
  return Boolean(post && VISIBLE_POST_STATUSES.has(String(post.status || '').toUpperCase()));
}

export function sortPostsNewestFirst(items) {
  return [...items].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;

    const numericId = (value) => {
      if (typeof value === 'number') return value;
      const parsed = Number(String(value ?? '').replace(/\D/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return numericId(b.id) - numericId(a.id);
  });
}

export function combineExplorePages(pageZeroPosts, loadedPages, isVisible = () => true) {
  const postsById = new Map();
  const orderedPages = [...loadedPages.entries()].sort(([pageA], [pageB]) => pageA - pageB);

  for (const post of pageZeroPosts || []) {
    if (isVisible(post)) postsById.set(String(post.id), post);
  }

  for (const [, posts] of orderedPages) {
    for (const post of posts || []) {
      if (isVisible(post) && !postsById.has(String(post.id))) {
        postsById.set(String(post.id), post);
      }
    }
  }

  return sortPostsNewestFirst([...postsById.values()]);
}

export function boundaryPageCount(previousTotal, nextTotal, previousPageZero, nextPageZero) {
  const previousIds = new Set((previousPageZero || []).map((post) => String(post.id)));
  const newHeadCount = (nextPageZero || []).filter((post) => !previousIds.has(String(post.id))).length;
  const totalGrowth = Math.max(0, Number(nextTotal || 0) - Number(previousTotal || 0));
  const shiftedItems = Math.max(newHeadCount, totalGrowth);
  return Math.max(1, Math.ceil(shiftedItems / EXPLORE_PAGE_SIZE));
}

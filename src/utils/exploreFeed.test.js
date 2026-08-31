import test from 'node:test';
import assert from 'node:assert/strict';
import {
  boundaryPageCount,
  combineExplorePages,
  hasVisiblePostStatus,
} from './exploreFeed.js';

const post = (id, createdAt, status = 'ACTIVE') => ({ id, createdAt, status });

test('combines page zero and local pages without duplicates in stable newest-first order', () => {
  const pageZero = [post(12, '2026-08-27T10:00:00Z'), post(11, '2026-08-27T09:00:00Z')];
  const pages = new Map([
    [2, [post(9, '2026-08-27T07:00:00Z')]],
    [1, [post(11, '2026-08-27T09:00:00Z'), post(10, '2026-08-27T08:00:00Z')]],
  ]);

  assert.deepEqual(
    combineExplorePages(pageZero, pages, hasVisiblePostStatus).map(({ id }) => id),
    [12, 11, 10, 9],
  );
});

test('excludes hidden, deleted, blocked, and unpublished statuses', () => {
  const statuses = ['ACTIVE', 'PUBLISHED', 'HIDDEN', 'DELETED', 'BLOCKED', 'UNPUBLISHED'];
  assert.deepEqual(statuses.filter((status) => hasVisiblePostStatus({ status })), ['ACTIVE', 'PUBLISHED']);
});

test('requests enough boundary pages when several new posts shift offsets', () => {
  const oldHead = Array.from({ length: 10 }, (_, index) => post(100 - index, `2026-08-27T09:${50 - index}:00Z`));
  const newHead = Array.from({ length: 10 }, (_, index) => post(120 - index, `2026-08-27T10:${50 - index}:00Z`));

  assert.equal(boundaryPageCount(100, 120, oldHead, newHead), 2);
  assert.equal(boundaryPageCount(100, 100, oldHead, [post(101, '2026-08-27T11:00:00Z'), ...oldHead.slice(0, 9)]), 1);
});

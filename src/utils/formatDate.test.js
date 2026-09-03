import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, formatDate, formatRelativeTime, getRelativeTime } from './formatDate.js';

test('parseDate handles various inputs robustly', () => {
  assert.equal(parseDate(null), null);
  assert.equal(parseDate(undefined), null);
  assert.equal(parseDate(''), null);
  assert.equal(parseDate('invalid-date'), null);

  // UTC string with 'Z'
  const dateZ = parseDate('2026-09-03T05:30:00Z');
  assert.ok(dateZ instanceof Date);
  assert.equal(dateZ.toISOString(), '2026-09-03T05:30:00.000Z');

  // Offset string (+05:30) represents 00:00:00 UTC
  const dateOffset = parseDate('2026-09-03T05:30:00+05:30');
  assert.ok(dateOffset instanceof Date);
  assert.equal(dateOffset.toISOString(), '2026-09-03T00:00:00.000Z');

  // Legacy unzoned string is treated as UTC (appending 'Z')
  const dateUnzoned = parseDate('2026-09-03T05:30:00');
  assert.ok(dateUnzoned instanceof Date);
  assert.equal(dateUnzoned.toISOString(), '2026-09-03T05:30:00.000Z');

  // Space-separated unzoned string
  const dateSpace = parseDate('2026-09-03 05:30:00');
  assert.ok(dateSpace instanceof Date);
  assert.equal(dateSpace.toISOString(), '2026-09-03T05:30:00.000Z');

  // Existing Date and numeric timestamp
  const now = new Date();
  assert.equal(parseDate(now).getTime(), now.getTime());
  assert.equal(parseDate(now.getTime()).getTime(), now.getTime());
});

test('formatDate displays "Just now" for newly created post/comment/reply', () => {
  const refNow = new Date('2026-09-03T10:00:00Z');

  // Exact same time
  assert.equal(formatDate('2026-09-03T10:00:00Z', refNow), 'Just now');

  // 10 seconds ago
  assert.equal(formatDate('2026-09-03T09:59:50Z', refNow), 'Just now');

  // 40 seconds ago
  assert.equal(formatDate('2026-09-03T09:59:20Z', refNow), 'Just now');
});

test('formatDate handles future clock drift gracefully (client clock slightly behind server)', () => {
  const refNow = new Date('2026-09-03T10:00:00Z');

  // 5 seconds in future
  assert.equal(formatDate('2026-09-03T10:00:05Z', refNow), 'Just now');

  // 2 minutes in future
  assert.equal(formatDate('2026-09-03T10:02:00Z', refNow), 'Just now');
});

test('formatDate accurately computes relative minutes, hours, and days', () => {
  const refNow = new Date('2026-09-03T12:00:00Z');

  // 5 minutes ago
  assert.equal(formatDate('2026-09-03T11:55:00Z', refNow), '5m ago');

  // 45 minutes ago
  assert.equal(formatDate('2026-09-03T11:15:00Z', refNow), '45m ago');

  // 1 hour ago
  assert.equal(formatDate('2026-09-03T11:00:00Z', refNow), '1h ago');

  // 5 hours ago
  assert.equal(formatDate('2026-09-03T07:00:00Z', refNow), '5h ago');

  // 1 day ago
  assert.equal(formatDate('2026-09-02T12:00:00Z', refNow), '1d ago');

  // 6 days ago
  assert.equal(formatDate('2026-08-28T12:00:00Z', refNow), '6d ago');
});

test('formatDate proves resolution of production 5h bug across timezones', () => {
  // Production scenario:
  // Server creates record at 05:00:00 UTC (which is 10:30:00 IST)
  // Client is currently at 05:00:02 UTC (10:30:02 IST)
  const clientNow = new Date('2026-09-03T05:00:02Z');

  // With new backend format (ISO with Z)
  const serverUtcString = '2026-09-03T05:00:00Z';
  assert.equal(formatDate(serverUtcString, clientNow), 'Just now');

  // With explicit IST offset string (+05:30)
  const explicitIstString = '2026-09-03T10:30:00+05:30';
  assert.equal(formatDate(explicitIstString, clientNow), 'Just now');

  // With legacy unzoned UTC string (fallback parsing)
  const legacyUnzonedString = '2026-09-03T05:00:00';
  assert.equal(formatDate(legacyUnzonedString, clientNow), 'Just now');
});

test('formatRelativeTime and getRelativeTime aliases work identically', () => {
  const refNow = new Date('2026-09-03T12:00:00Z');
  const target = '2026-09-03T11:50:00Z';
  assert.equal(formatRelativeTime(target, refNow), '10m ago');
  assert.equal(getRelativeTime(target, refNow), '10m ago');
});

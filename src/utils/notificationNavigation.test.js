import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveNotificationPath } from './notificationNavigation.js';

test('music notification resolves to My Tracks with the target track', () => {
  assert.equal(resolveNotificationPath({ targetType: 'MUSIC_TRACK', targetId: 123 }),
    '/music?view=mine&track=123');
});

test('music notification without a target safely falls back to Music', () => {
  assert.equal(resolveNotificationPath({ targetType: 'MUSIC_TRACK' }), '/music');
});

test('post and legacy notifications remain compatible', () => {
  assert.equal(resolveNotificationPath({ targetType: 'POST', targetId: 8 }), '/post/8');
  assert.equal(resolveNotificationPath({ targetId: 9 }), '/post/9');
});

import { formatDate, parseDate } from './formatDate.js';

/**
 * Reusable utility for formatting user online / last-seen status in the user's preferred language.
 */
export function formatLastSeen(userPresence, t) {
  if (!userPresence) {
    return t ? t('offline', 'Offline') : 'Offline';
  }

  if (userPresence.isOnline || userPresence.status === 'ONLINE') {
    return t ? t('online', 'Online') : 'Online';
  }

  const lastSeenDate = userPresence.lastSeen || userPresence.lastSeenTimestamp;
  if (!lastSeenDate) {
    return t ? t('offline', 'Offline') : 'Offline';
  }

  const date = parseDate(lastSeenDate);
  if (!date) {
    return t ? t('offline', 'Offline') : 'Offline';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 1) {
    return t ? t('lastSeenJustNow', 'Last seen just now') : 'Last seen just now';
  }

  if (diffMin === 1) {
    return t ? t('lastSeen1MinAgo', 'Last seen 1 min ago') : 'Last seen 1 min ago';
  }

  if (diffMin < 60) {
    const template = t ? t('lastSeenMinsAgo', 'Last seen {count} mins ago') : 'Last seen {count} mins ago';
    return template.replace('{count}', diffMin);
  }

  if (diffHour < 24) {
    const template = diffHour === 1
      ? (t ? t('lastSeen1HourAgo', 'Last seen 1 hour ago') : 'Last seen 1 hour ago')
      : (t ? t('lastSeenHoursAgo', 'Last seen {count} hours ago') : 'Last seen {count} hours ago');
    return template.replace('{count}', diffHour);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return t ? t('lastSeenYesterday', 'Last seen yesterday') : 'Last seen yesterday';
  }

  return `${t ? t('lastSeen', 'Last seen') : 'Last seen'} ${formatDate(lastSeenDate)}`;
}

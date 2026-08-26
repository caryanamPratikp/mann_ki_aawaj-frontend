export function resolveNotificationPath(notification) {
  if (!notification) return null;
  if (notification.targetType === 'MUSIC_TRACK') {
    return notification.targetId
      ? `/music?view=mine&track=${encodeURIComponent(notification.targetId)}`
      : '/music';
  }
  const postId = notification.targetPostId || notification.targetId;
  if (postId) return `/post/${encodeURIComponent(postId)}`;
  if (notification.type === 'CHAT_MESSAGE' || notification.type === 'CHAT_REQUEST') return '/chat';
  return null;
}

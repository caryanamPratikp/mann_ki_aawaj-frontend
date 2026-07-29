import React from 'react';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';

/**
 * InitialAvatar — Platform-wide avatar display component.
 *
 * Usage across the entire platform:
 *   <InitialAvatar username="@quietchapter" size={36} />
 *   <InitialAvatar avatarConfig={user.avatarConfig} size={48} />
 *
 * Priority:
 * Uses a CDN-backed avatar thumbnail when available. List surfaces deliberately
 * do not instantiate a 3D renderer.
 */
export function InitialAvatar({ username, initials, size = 36, avatarConfig, className = '' }) {
  return <AvatarThumbnail username={username} initials={initials} config={avatarConfig} size={size} className={className} />;
}

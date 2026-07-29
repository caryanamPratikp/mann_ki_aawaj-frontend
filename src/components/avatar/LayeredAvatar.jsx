import React from 'react';
import { AvatarThumbnail } from './AvatarThumbnail.jsx';

/** @deprecated Use AvatarThumbnail. Retained as a safe, non-WebGL compatibility export. */
export function LayeredAvatar({ config, size = 48, className = '' }) {
  return <AvatarThumbnail config={config} size={size} className={className} />;
}

import React, { useState } from 'react';
import { resolveAvatarAsset } from './avatarAssetManifest.js';

function initialsFor(username, initials) {
  if (initials) return initials.slice(0, 2).toUpperCase();
  return (username || 'AN').replace('@', '').split(/[\s._-]+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AN';
}

/** Image-first avatar renderer for lists. Never mounts WebGL in feeds or chat. */
export function AvatarThumbnail({ username, initials, config, size = 36, className = '' }) {
  const asset = resolveAvatarAsset(config);
  const src = config?.thumbnailUrl || asset?.thumbnailUrl;
  const label = initialsFor(username, initials);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(src) && !imageFailed;

  return (
    <div className={className} style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(145deg, #6F405F, #B67B9F)', display: 'grid', placeItems: 'center', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(45,29,21,.12)' }}>
      {showImage ? <img src={src} alt="Anonymous avatar" width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImageFailed(true)} /> : <span style={{ color: '#fff', fontWeight: 800, fontSize: Math.max(10, size * .32), letterSpacing: '.03em', lineHeight: 1 }}>{label}</span>}
    </div>
  );
}

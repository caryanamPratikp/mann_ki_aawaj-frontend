import React, { useState } from 'react';

const isImageSource = (value) => typeof value === 'string' && (
  value.startsWith('http://')
  || value.startsWith('https://')
  || value.startsWith('data:image/')
  || value.startsWith('blob:')
  || value.startsWith('/')
);

const getAvatarInitials = (name) => {
  const clean = String(name || 'User').replace(/^@/, '').trim();
  if (!clean) return 'US';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
  return clean.slice(0, 2).toUpperCase();
};

const avatarHue = (name) => [...String(name || 'user')]
  .reduce((total, character) => total + character.charCodeAt(0), 0) % 360;

export function InitialAvatar({ name, src, className = '', ariaLabel }) {
  const [imageFailed, setImageFailed] = useState(false);
  const canRenderImage = !imageFailed && isImageSource(src);

  if (canRenderImage) {
    return (
      <img
        className={className}
        src={src}
        alt={ariaLabel || `${name || 'User'} profile`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${className} avatar-initials`}
      style={{ '--avatar-hue': avatarHue(name) }}
      role="img"
      aria-label={ariaLabel || `${name || 'User'} profile`}
    >
      {getAvatarInitials(name)}
    </span>
  );
}

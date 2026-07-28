import React from 'react';
import { LayeredAvatar } from '../avatar/LayeredAvatar.jsx';
import { DEFAULT_AVATAR_CONFIG, SKIN_TONES, HAIR_STYLES, HAIR_COLORS, OUTFITS, OUTFIT_COLORS, GLASSES, ACCESSORIES } from '../avatar/avatarOptionsData.js';

export function InitialAvatar({ username, initials, size = 36, avatarConfig, className = '' }) {
  if (avatarConfig && (avatarConfig.skinTone || avatarConfig.hair)) {
    return <LayeredAvatar config={avatarConfig} size={size} className={className} />;
  }

  // Deterministically map username to a unique 3D Avatar config
  const cleanName = (username || 'user').replace('@', '').toLowerCase();
  const hash = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const skin = SKIN_TONES[hash % SKIN_TONES.length];
  const hair = HAIR_STYLES[hash % HAIR_STYLES.length];
  const hairColor = HAIR_COLORS[hash % HAIR_COLORS.length];
  const outfit = OUTFITS[hash % OUTFITS.length];
  const outfitColor = OUTFIT_COLORS[hash % OUTFIT_COLORS.length];
  const glasses = GLASSES[hash % GLASSES.length];
  const accessory = ACCESSORIES[hash % ACCESSORIES.length];

  const generatedConfig = {
    ...DEFAULT_AVATAR_CONFIG,
    skinTone: skin.id,
    hair: hair.id,
    hairColor: hairColor.id,
    outfit: outfit.id,
    outfitColor: outfitColor.id,
    glasses: glasses.id,
    accessories: accessory.id,
  };

  return <LayeredAvatar config={generatedConfig} size={size} className={className} />;
}

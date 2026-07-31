/**
 * The client-side projection of the published Avatar Asset Manifest.
 *
 * Production builds generate this module from the signed CDN manifest. Keep
 * asset ids in user data; never accept arbitrary remote GLB URLs from users.
 */
export const AVATAR_RIG_VERSION = 'mka-humanoid-v1';
export const AVATAR_MANIFEST_VERSION = '2026.09';

export const BASE_CHARACTER_ASSETS = {
  'base-neutral-01': {
    id: 'base-neutral-01',
    rigVersion: AVATAR_RIG_VERSION,
    url: '/avatar-assets/characters/base/v1/base-neutral-01.glb',
    // Published manifests fill this CDN URL. An empty value keeps list surfaces
    // on the inexpensive initials fallback during local asset development.
    thumbnailUrl: '',
  },
};

export function resolveAvatarAsset(config = {}) {
  const safeConfig = (config && typeof config === 'object') ? config : {};
  const asset = BASE_CHARACTER_ASSETS[safeConfig.baseCharacterId || 'base-neutral-01'];
  if (!asset || asset.rigVersion !== (safeConfig.rigVersion || AVATAR_RIG_VERSION)) return null;
  return asset;
}

/** Maps legacy studio fields to named facial morph targets in the v1 rig. */
export function recipeToMorphTargets(config = {}) {
  const safeConfig = (config && typeof config === 'object') ? config : {};
  const faceShape = safeConfig.faceShape || 'oval';
  const facePreset = {
    oval: { faceOval: 1 },
    round: { faceRound: 1 },
    heart: { faceHeart: 1 },
    diamond: { faceDiamond: 1 },
    square: { faceSquare: 1 },
  }[faceShape] || { faceOval: 1 };

  const mouthPreset = {
    soft_smile: 'mouthSmile', wide_grin: 'mouthSmile', subtle_smirk: 'mouthSmile',
    neutral_calm: 'mouthNeutral', playful_pout: 'mouthPucker', laughing_open: 'jawOpen',
  }[safeConfig.lipStyle] || 'mouthSmile';

  return {
    ...facePreset,
    faceWidth: Number(safeConfig.faceWidth ?? 1) - 1,
    jawWidth: Number(safeConfig.jawWidth ?? 1) - 1,
    cheekFullness: Number(safeConfig.cheekFullness ?? 1) - 1,
    [mouthPreset]: Number(safeConfig.smileIntensity ?? 0.6),
  };
}

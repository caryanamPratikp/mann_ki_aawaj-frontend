import React from 'react';
import {
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_COLORS,
  DEFAULT_AVATAR_CONFIG
} from './avatarOptionsData.js';

export function LayeredAvatar({ config = DEFAULT_AVATAR_CONFIG, size = 160, className = '' }) {
  const mergedConfig = { ...DEFAULT_AVATAR_CONFIG, ...config };

  const skin = SKIN_TONES.find(s => s.id === mergedConfig.skinTone) || SKIN_TONES[4];
  const hairColor = HAIR_COLORS.find(h => h.id === mergedConfig.hairColor) || HAIR_COLORS[0];
  const outfitColor = OUTFIT_COLORS.find(o => o.id === mergedConfig.outfitColor) || OUTFIT_COLORS[0];

  // Dynamic face shape radius / path adjustments
  const getFacePath = () => {
    switch (mergedConfig.face) {
      case 'square':
        return <rect x="25" y="22" width="50" height="48" rx="14" fill={skin.hex} />;
      case 'oval':
        return <ellipse cx="50" cy="45" rx="23" ry="28" fill={skin.hex} />;
      case 'heart':
        return <path d="M 26 32 C 26 20, 74 20, 74 32 C 74 54, 50 69, 50 69 C 50 69, 26 54, 26 32 Z" fill={skin.hex} />;
      case 'diamond':
        return <polygon points="50,18 75,44 50,69 25,44" fill={skin.hex} />;
      case 'round':
      default:
        return <circle cx="50" cy="45" r="26" fill={skin.hex} />;
    }
  };

  // Eyes scale/position
  const getEyeRadius = () => {
    switch (mergedConfig.eyes) {
      case 'small': return 3.0;
      case 'large': return 5.2;
      case 'almond': return 4.0;
      case 'normal':
      default: return 4.0;
    }
  };

  const eyeR = getEyeRadius();

  return (
    <div
      className={`layered-avatar-container ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #F5F2F1 0%, #E2DCDB 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(45,29,21,0.14), inset 0 2px 4px rgba(255,255,255,0.6)',
        border: '2.5px solid #ffffff',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) rotate(2deg)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.10))' }}
      >
        {/* Soft Background Radial Shadow */}
        <circle cx="50" cy="50" r="48" fill="rgba(111,64,95,0.04)" />

        {/* ── LAYER 1: NECK & SHOULDERS / OUTFITS ── */}
        <rect x="44" y="65" width="12" height="14" rx="4" fill={skin.shadow} />

        {mergedConfig.outfit === 'hoodie' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfitColor.hex} />
            <path d="M 40 73 Q 50 85 60 73" stroke="#ffffff" strokeWidth="2.2" fill="none" opacity="0.85" />
            <line x1="46" y1="73" x2="44" y2="86" stroke="#ffffff" strokeWidth="1.8" />
            <line x1="54" y1="73" x2="56" y2="86" stroke="#ffffff" strokeWidth="1.8" />
          </g>
        )}

        {mergedConfig.outfit === 'tshirt' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfitColor.hex} />
            <path d="M 37 71 C 43 80, 57 80, 63 71 Z" fill={skin.hex} />
          </g>
        )}

        {mergedConfig.outfit === 'blazer' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfitColor.hex} />
            <polygon points="50,71 39,96 61,96" fill="#ffffff" />
            <polygon points="50,77 46,86 54,86" fill="#D96C3D" />
          </g>
        )}

        {mergedConfig.outfit === 'kurta' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfitColor.hex} />
            <path d="M 44 71 L 56 71 L 50 88 Z" fill="#ffffff" opacity="0.9" />
          </g>
        )}

        {mergedConfig.outfit === 'jacket' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfitColor.hex} />
            <path d="M 40 71 L 50 96 L 60 71" stroke="#E5A93C" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {mergedConfig.outfit === 'sportswear' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfitColor.hex} />
            <line x1="28" y1="76" x2="28" y2="96" stroke="#ffffff" strokeWidth="3.5" />
            <line x1="72" y1="76" x2="72" y2="96" stroke="#ffffff" strokeWidth="3.5" />
          </g>
        )}

        {/* ── LAYER 2: EARS & FACE BASE ── */}
        <circle cx="23" cy="46" r="4.5" fill={skin.hex} />
        <circle cx="77" cy="46" r="4.5" fill={skin.hex} />

        {getFacePath()}

        {/* ── LAYER 3: EYES, EYEBROWS, NOSE, MOUTH ── */}
        {/* Eyes */}
        <ellipse cx="38" cy="44" rx={eyeR} ry={eyeR * 1.15} fill="#1C1917" />
        <ellipse cx="62" cy="44" rx={eyeR} ry={eyeR * 1.15} fill="#1C1917" />
        <circle cx="39.5" cy="42.5" r="1.3" fill="#ffffff" />
        <circle cx="63.5" cy="42.5" r="1.3" fill="#ffffff" />

        {/* Eyebrows */}
        {mergedConfig.eyebrows === 'arched' ? (
          <g stroke={hairColor.hex} strokeWidth="2.6" fill="none" strokeLinecap="round">
            <path d="M 32 37 Q 38 32 44 36" />
            <path d="M 56 36 Q 62 32 68 37" />
          </g>
        ) : mergedConfig.eyebrows === 'thick' ? (
          <g stroke={hairColor.hex} strokeWidth="3.4" fill="none" strokeLinecap="round">
            <path d="M 32 37 Q 38 35 44 37" />
            <path d="M 56 37 Q 62 35 68 37" />
          </g>
        ) : (
          <g stroke={hairColor.hex} strokeWidth="2.2" fill="none" strokeLinecap="round">
            <path d="M 33 37 Q 38 34 43 37" />
            <path d="M 57 37 Q 62 34 67 37" />
          </g>
        )}

        {/* Nose */}
        {mergedConfig.nose === 'button' ? (
          <circle cx="50" cy="48" r="2" fill={skin.shadow} />
        ) : mergedConfig.nose === 'wide' ? (
          <path d="M 46 50 Q 50 53 54 50" stroke={skin.shadow} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 50 44 Q 48 51 52 51" stroke={skin.shadow} strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Mouth */}
        {mergedConfig.mouth === 'wide_grin' ? (
          <path d="M 40 57 Q 50 67 60 57 Z" fill="#ffffff" stroke="#CE5A5A" strokeWidth="2" />
        ) : mergedConfig.mouth === 'neutral' ? (
          <line x1="43" y1="58" x2="57" y2="58" stroke="#CE5A5A" strokeWidth="2.2" strokeLinecap="round" />
        ) : (
          <path d="M 42 57 Q 50 64 58 57" stroke="#CE5A5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Blush */}
        <circle cx="32" cy="52" r="4" fill="#FFB0AB" opacity="0.4" />
        <circle cx="68" cy="52" r="4" fill="#FFB0AB" opacity="0.4" />

        {/* ── LAYER 4: FACIAL HAIR ── */}
        {mergedConfig.facialHair === 'mustache' && (
          <path d="M 42 54 Q 50 50 58 54 Q 50 57 42 54 Z" fill={hairColor.hex} />
        )}
        {mergedConfig.facialHair === 'stubble' && (
          <path d="M 36 54 Q 50 66 64 54 Q 50 69 36 54 Z" fill={hairColor.hex} opacity="0.25" />
        )}
        {(mergedConfig.facialHair === 'light_beard' || mergedConfig.facialHair === 'full_beard') && (
          <path d="M 27 48 C 27 68, 73 68, 73 48 C 73 65, 27 65, 27 48 Z" fill={hairColor.hex} opacity={mergedConfig.facialHair === 'full_beard' ? 0.9 : 0.6} />
        )}

        {/* ── LAYER 5: HAIRSTYLES ── */}
        {mergedConfig.hair !== 'bald' && (
          mergedConfig.hair === 'long_waves' || mergedConfig.hair === 'sleek_ponytail' ? (
            <path d="M 22 45 C 18 18, 82 18, 78 45 C 78 72, 74 88, 72 88 C 66 58, 34 58, 28 88 C 26 88, 22 72, 22 45 Z" fill={hairColor.hex} />
          ) : mergedConfig.hair === 'top_bun' ? (
            <g>
              <path d="M 22 45 C 22 22, 78 22, 78 45 Z" fill={hairColor.hex} />
              <circle cx="50" cy="15" r="13" fill={hairColor.hex} />
            </g>
          ) : mergedConfig.hair === 'classic_bob' ? (
            <path d="M 20 48 C 20 20, 80 20, 80 48 C 80 62, 74 66, 74 66 C 66 38, 34 38, 26 66 C 26 66, 20 62, 20 48 Z" fill={hairColor.hex} />
          ) : mergedConfig.hair === 'curly_top' || mergedConfig.hair === 'curly' ? (
            <g fill={hairColor.hex}>
              <circle cx="36" cy="24" r="9" />
              <circle cx="50" cy="20" r="10" />
              <circle cx="64" cy="24" r="9" />
              <path d="M 23 42 C 23 26, 77 26, 77 42 Z" />
            </g>
          ) : (
            <path d="M 22 44 C 22 18, 78 18, 78 44 C 78 37, 22 37, 22 44 Z" fill={hairColor.hex} />
          )
        )}

        {/* ── LAYER 6: GLASSES / EYEWEAR ── */}
        {mergedConfig.glasses === 'round' && (
          <g stroke="#1C1917" strokeWidth="2.6" fill="rgba(255,255,255,0.25)">
            <circle cx="38" cy="44" r="9" />
            <circle cx="62" cy="44" r="9" />
            <line x1="47" y1="44" x2="53" y2="44" />
          </g>
        )}

        {mergedConfig.glasses === 'square' && (
          <g stroke="#1C1917" strokeWidth="2.6" fill="rgba(255,255,255,0.25)">
            <rect x="29" y="36" width="18" height="15" rx="3" />
            <rect x="53" y="36" width="18" height="15" rx="3" />
            <line x1="47" y1="43" x2="53" y2="43" stroke="#1C1917" strokeWidth="2.6" />
          </g>
        )}

        {mergedConfig.glasses === 'aviator' && (
          <g fill="#1C1917" stroke="#E5A93C" strokeWidth="1.5">
            <path d="M 27 38 L 47 38 Q 47 52 37 52 Q 27 52 27 38 Z" opacity="0.95" />
            <path d="M 53 38 L 73 38 Q 73 52 63 52 Q 53 52 53 38 Z" opacity="0.95" />
            <line x1="47" y1="40" x2="53" y2="40" stroke="#E5A93C" strokeWidth="2" />
          </g>
        )}

        {/* ── LAYER 7: ACCESSORIES & HEADWEAR ── */}
        {mergedConfig.accessories === 'headphones' && (
          <g fill="#1C1917">
            <path d="M 18 45 C 18 15, 82 15, 82 45" stroke="#1C1917" strokeWidth="4" fill="none" />
            <rect x="14" y="38" width="10" height="18" rx="4" fill="#6F405F" />
            <rect x="76" y="38" width="10" height="18" rx="4" fill="#6F405F" />
          </g>
        )}

        {mergedConfig.accessories === 'crown' && (
          <path d="M 35 22 L 40 12 L 50 20 L 60 12 L 65 22 Z" fill="#E5A93C" stroke="#9E6B15" strokeWidth="1" />
        )}
      </svg>
    </div>
  );
}

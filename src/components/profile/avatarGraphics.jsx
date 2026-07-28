import React from 'react';

export const SKIN_TONES = [
  { id: 'fair', name: 'Fair Amber', hex: '#FAD6C0', shadow: '#EAB095' },
  { id: 'honey', name: 'Warm Honey', hex: '#F0C5B0', shadow: '#D89E84' },
  { id: 'golden', name: 'Golden Bronze', hex: '#D69E7B', shadow: '#B57A54' },
  { id: 'caramel', name: 'Deep Caramel', hex: '#A86C48', shadow: '#844D2D' },
  { id: 'espresso', name: 'Rich Espresso', hex: '#633B23', shadow: '#442411' },
];

export const AVATAR_BACKGROUNDS = [
  { id: 'plum', name: 'Plum Sunset', bg: 'linear-gradient(135deg, #6F405F 0%, #3B1B32 100%)' },
  { id: 'rose', name: 'Rose Quartz', bg: 'linear-gradient(135deg, #E8A598 0%, #B85B6C 100%)' },
  { id: 'emerald', name: 'Emerald Mist', bg: 'linear-gradient(135deg, #3F7772 0%, #153D39 100%)' },
  { id: 'amber', name: 'Golden Glow', bg: 'linear-gradient(135deg, #E5A93C 0%, #8C5908 100%)' },
  { id: 'indigo', name: 'Cosmic Indigo', bg: 'linear-gradient(135deg, #4A3B6F 0%, #1F153B 100%)' },
  { id: 'teal', name: 'Cyber Teal', bg: 'linear-gradient(135deg, #2E8B9A 0%, #0E414A 100%)' },
  { id: 'coral', name: 'Warm Coral', bg: 'linear-gradient(135deg, #D96B52 0%, #6E2213 100%)' },
  { id: 'midnight', name: 'Obsidian Night', bg: 'linear-gradient(135deg, #2D1D15 0%, #0D0604 100%)' },
];

export const AVATAR_PALETTES = AVATAR_BACKGROUNDS;

export const FEMALE_HAIRSTYLES = [
  { id: 'long_waves', name: 'Long Waves' },
  { id: 'bob_cut', name: 'Classic Bob' },
  { id: 'high_bun', name: 'High Bun' },
  { id: 'boho_braids', name: 'Boho Braids' },
  { id: 'curly_afro', name: 'Voluminous Curly' },
  { id: 'ponytail', name: 'Sleek Ponytail' },
];

export const MALE_HAIRSTYLES = [
  { id: 'short_crop', name: 'Short Crop' },
  { id: 'fade_cut', name: 'Sleek Fade' },
  { id: 'curly_top', name: 'Curly Top' },
  { id: 'quiff', name: 'Modern Quiff' },
  { id: 'buzz_cut', name: 'Buzz Cut' },
  { id: 'dreads', name: 'Short Locs' },
];

export const NEUTRAL_HAIRSTYLES = [
  { id: 'hoodie', name: 'Cozy Hood' },
  { id: 'beanie', name: 'Winter Beanie' },
  { id: 'cap', name: 'Snapback Cap' },
  { id: 'afro_puff', name: 'Afro Puff' },
];

export const OUTFITS = [
  { id: 'hoodie', name: 'Cozy Hoodie', color: '#6F405F', label: '🧥 Hoodie' },
  { id: 'casual_tee', name: 'Casual T-Shirt', color: '#3F7772', label: '👕 Casual Tee' },
  { id: 'blazer', name: 'Formal Blazer', color: '#2D1D15', label: '👔 Blazer' },
  { id: 'ethnic', name: 'Ethnic Kurta', color: '#E5A93C', label: '👘 Kurta' },
  { id: 'sportswear', name: 'Athletic Jersey', color: '#D96B52', label: '🎽 Sportswear' },
  { id: 'jacket', name: 'Leather Jacket', color: '#4A3B6F', label: '🧥 Leather Jacket' },
];

export const SPECS = [
  { id: 'none', name: 'None', icon: '' },
  { id: 'round_specs', name: 'Round Intellect Specs', icon: '👓' },
  { id: 'aviator_shades', name: 'Aviator Sunglasses', icon: '🕶️' },
  { id: 'square_specs', name: 'Square Frame Specs', icon: '🤓' },
  { id: 'cat_eye', name: 'Cat-Eye Specs', icon: '🕶️' },
  { id: 'cyber_visor', name: 'Cyber Visor', icon: '🥽' },
];

export const ACCESSORIES = [
  { id: 'none', name: 'None', symbol: '' },
  { id: 'headphones', name: 'Beats Headphones', symbol: '🎧' },
  { id: 'crown', name: 'Royal Crown', symbol: '👑' },
  { id: 'sparkles', name: 'Aura Sparkles', symbol: '✨' },
  { id: 'flower', name: 'Floral Wreath', symbol: '🌸' },
  { id: 'party_hat', name: 'Party Hat', symbol: '🥳' },
];

export function AvatarGraphic({
  gender = 'female',
  hairStyle = 'long_waves',
  skinToneId = 'honey',
  outfitId = 'hoodie',
  specsId = 'none',
  accessoryId = 'none',
  bgId = 'plum',
  size = 90
}) {
  const skin = SKIN_TONES.find(s => s.id === skinToneId) || SKIN_TONES[1];
  const bg = AVATAR_BACKGROUNDS.find(b => b.id === bgId) || AVATAR_BACKGROUNDS[0];
  const outfit = OUTFITS.find(o => o.id === outfitId) || OUTFITS[0];
  const acc = ACCESSORIES.find(a => a.id === accessoryId);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: bg.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(45,29,21,0.22)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Ambient Ring */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* Neck */}
        <rect x="44" y="66" width="12" height="14" rx="4" fill={skin.shadow} />

        {/* ── SNAPCHAT OUTFITS / DRESSES ── */}
        {outfitId === 'hoodie' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfit.color} />
            <path d="M 42 74 Q 50 84 58 74" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8" />
            <line x1="47" y1="74" x2="45" y2="86" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="53" y1="74" x2="55" y2="86" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        )}

        {outfitId === 'casual_tee' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfit.color} />
            <path d="M 38 72 C 44 80, 56 80, 62 72 Z" fill={skin.hex} />
          </g>
        )}

        {outfitId === 'blazer' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfit.color} />
            <polygon points="50,72 40,96 60,96" fill="#ffffff" />
            <polygon points="50,78 46,86 54,86" fill="#D96B52" />
          </g>
        )}

        {outfitId === 'ethnic' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfit.color} />
            <path d="M 44 72 L 56 72 L 50 88 Z" fill="#ffffff" opacity="0.85" />
          </g>
        )}

        {outfitId === 'sportswear' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfit.color} />
            <line x1="28" y1="78" x2="28" y2="96" stroke="#ffffff" strokeWidth="3" />
            <line x1="72" y1="78" x2="72" y2="96" stroke="#ffffff" strokeWidth="3" />
          </g>
        )}

        {outfitId === 'jacket' && (
          <g>
            <path d="M 16 96 C 16 75, 84 75, 84 96 Z" fill={outfit.color} />
            <path d="M 40 72 L 50 96 L 60 72" stroke="#E5A93C" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {/* Ears */}
        <circle cx="23" cy="46" r="4.5" fill={skin.hex} />
        <circle cx="77" cy="46" r="4.5" fill={skin.hex} />

        {/* Head Base */}
        <circle cx="50" cy="45" r="26" fill={skin.hex} />

        {/* Eyes */}
        <ellipse cx="38" cy="44" rx="3.5" ry="4.5" fill="#2D1D15" />
        <ellipse cx="62" cy="44" rx="3.5" ry="4.5" fill="#2D1D15" />
        <circle cx="39.5" cy="42.5" r="1.2" fill="#ffffff" />
        <circle cx="63.5" cy="42.5" r="1.2" fill="#ffffff" />

        {/* Eyebrows */}
        <path d="M 33 37 Q 38 34 43 37" stroke="#2D1D15" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 57 37 Q 62 34 67 37" stroke="#2D1D15" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Nose */}
        <path d="M 50 44 Q 48 51 52 51" stroke={skin.shadow} strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Smile */}
        <path d="M 42 57 Q 50 64 58 57" stroke="#CE5A5A" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* Blush */}
        <circle cx="32" cy="52" r="4" fill="#FFB0AB" opacity="0.4" />
        <circle cx="68" cy="52" r="4" fill="#FFB0AB" opacity="0.4" />

        {/* ── HAIRSTYLES ── */}
        {gender === 'female' && (
          hairStyle === 'long_waves' || hairStyle === 'ponytail' ? (
            <path d="M 22 45 C 18 18, 82 18, 78 45 C 78 72, 74 88, 72 88 C 66 58, 34 58, 28 88 C 26 88, 22 72, 22 45 Z" fill="#2D1D15" />
          ) : hairStyle === 'high_bun' ? (
            <g>
              <path d="M 22 45 C 22 22, 78 22, 78 45 Z" fill="#2D1D15" />
              <circle cx="50" cy="15" r="13" fill="#2D1D15" />
            </g>
          ) : hairStyle === 'bob_cut' ? (
            <path d="M 20 48 C 20 20, 80 20, 80 48 C 80 62, 74 66, 74 66 C 66 38, 34 38, 26 66 C 26 66, 20 62, 20 48 Z" fill="#2D1D15" />
          ) : (
            <path d="M 22 45 C 20 20, 80 20, 78 45 C 78 70, 72 82, 68 82 C 65 52, 35 52, 32 82 Z" fill="#2D1D15" />
          )
        )}

        {gender === 'male' && (
          hairStyle === 'short_crop' || hairStyle === 'modern_quiff' ? (
            <path d="M 22 44 C 22 18, 78 18, 78 44 C 78 37, 22 37, 22 44 Z" fill="#2D1D15" />
          ) : hairStyle === 'fade_cut' ? (
            <path d="M 24 40 C 24 18, 76 18, 76 40 L 76 34 L 24 34 Z" fill="#2D1D15" />
          ) : hairStyle === 'curly_top' ? (
            <g fill="#2D1D15">
              <circle cx="36" cy="24" r="9" />
              <circle cx="50" cy="20" r="10" />
              <circle cx="64" cy="24" r="9" />
              <path d="M 23 42 C 23 26, 77 26, 77 42 Z" />
            </g>
          ) : (
            <path d="M 23 42 C 23 20, 77 20, 77 42 Z" fill="#2D1D15" />
          )
        )}

        {gender === 'neutral' && (
          hairStyle === 'beanie' ? (
            <path d="M 20 44 C 20 16, 80 16, 80 44 Z" fill="#6F405F" />
          ) : hairStyle === 'hoodie' ? (
            <path d="M 16 92 C 14 50, 20 22, 50 22 C 80 22, 86 50, 84 92 Z" fill="#4A3B6F" opacity="0.9" />
          ) : (
            <path d="M 22 44 C 22 18, 78 18, 78 44 Z" fill="#2D1D15" />
          )
        )}

        {/* ── SPECS & EYEWEAR ── */}
        {specsId === 'round_specs' && (
          <g stroke="#2D1D15" strokeWidth="2.6" fill="none">
            <circle cx="38" cy="44" r="9" fill="rgba(255,255,255,0.25)" />
            <circle cx="62" cy="44" r="9" fill="rgba(255,255,255,0.25)" />
            <line x1="47" y1="44" x2="53" y2="44" />
          </g>
        )}

        {specsId === 'aviator_shades' && (
          <g fill="#2D1D15" stroke="#E5A93C" strokeWidth="1.5">
            <path d="M 27 38 L 47 38 Q 47 52 37 52 Q 27 52 27 38 Z" fill="#2D1D15" />
            <path d="M 53 38 L 73 38 Q 73 52 63 52 Q 53 52 53 38 Z" fill="#2D1D15" />
            <line x1="47" y1="40" x2="53" y2="40" stroke="#E5A93C" strokeWidth="2" />
          </g>
        )}

        {specsId === 'square_specs' && (
          <g stroke="#2D1D15" strokeWidth="2.6" fill="rgba(255,255,255,0.25)">
            <rect x="29" y="36" width="18" height="15" rx="3" />
            <rect x="53" y="36" width="18" height="15" rx="3" />
            <line x1="47" y1="43" x2="53" y2="43" stroke="#2D1D15" strokeWidth="2.6" />
          </g>
        )}

        {specsId === 'cyber_visor' && (
          <path d="M 24 37 L 76 37 L 72 50 L 28 50 Z" fill="#2E8B9A" opacity="0.9" stroke="#ffffff" strokeWidth="1.5" />
        )}

        {/* ── ACCESSORIES ── */}
        {accessoryId === 'headphones' && (
          <g fill="#2D1D15">
            <path d="M 18 45 C 18 15, 82 15, 82 45" stroke="#2D1D15" strokeWidth="4" fill="none" />
            <rect x="14" y="38" width="10" height="18" rx="4" fill="#6F405F" />
            <rect x="76" y="38" width="10" height="18" rx="4" fill="#6F405F" />
          </g>
        )}

        {accessoryId === 'crown' && (
          <path d="M 35 22 L 40 12 L 50 20 L 60 12 L 65 22 Z" fill="#E5A93C" stroke="#9E6B15" strokeWidth="1" />
        )}
      </svg>
    </div>
  );
}
